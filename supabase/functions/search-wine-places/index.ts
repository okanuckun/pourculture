import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaceResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  category: 'wine_shop' | 'wine_bar' | 'winery' | 'restaurant';
  rating?: number;
  priceLevel?: number;
  isOpen?: boolean;
  website?: string;
  phone?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, radius = 5000, naturalWineOnly = false } = await req.json();
    
    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: 'lat and lng are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_PLACES_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const filterMode = naturalWineOnly ? 'natural wine' : 'wine';
    console.log(`Searching for ${filterMode} venues near ${lat}, ${lng} with radius ${radius}m`);

    // Search queries - if natural wine filter is on, prepend "natural" to queries
    const prefix = naturalWineOnly ? 'natural ' : '';
    const searchQueries = [
      { query: `${prefix}wine bar`, category: 'wine_bar' as const },
      { query: `${prefix}wine shop`, category: 'wine_shop' as const },
      { query: `${prefix}wine store`, category: 'wine_shop' as const },
      { query: `${prefix}winery`, category: 'winery' as const },
      { query: naturalWineOnly ? 'organic winery' : 'vineyard', category: 'winery' as const },
    ];

    const allPlaces: PlaceResult[] = [];
    const seenIds = new Set<string>();

    // Fetch places for each query
    for (const { query, category } of searchQueries) {
      try {
        const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
        url.searchParams.set('location', `${lat},${lng}`);
        url.searchParams.set('radius', radius.toString());
        url.searchParams.set('keyword', query);
        url.searchParams.set('key', apiKey);

        console.log(`Fetching: ${query}`);
        
        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.status === 'OK' && data.results) {
          console.log(`Found ${data.results.length} results for "${query}"`);
          
          for (const place of data.results) {
            // Skip duplicates
            if (seenIds.has(place.place_id)) continue;
            seenIds.add(place.place_id);

            allPlaces.push({
              id: `google_${place.place_id}`,
              name: place.name,
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
              address: place.vicinity,
              category,
              rating: place.rating,
              priceLevel: place.price_level,
              isOpen: place.opening_hours?.open_now,
            });
          }
        } else if (data.status !== 'ZERO_RESULTS') {
          console.warn(`API returned status: ${data.status} for query "${query}"`);
        }
      } catch (error) {
        console.error(`Error fetching "${query}":`, error);
      }
    }

    console.log(`Total unique places found: ${allPlaces.length}`);

    return new Response(
      JSON.stringify({ places: allPlaces, count: allPlaces.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-wine-places:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
