import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaceResult {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity?: string;
  formatted_address?: string;
  rating?: number;
  price_level?: number;
  opening_hours?: {
    open_now?: boolean;
  };
  website?: string;
  formatted_phone_number?: string;
  types?: string[];
}

// NYC boroughs and neighborhoods for comprehensive coverage
const NYC_LOCATIONS = [
  { name: 'Manhattan - Downtown', lat: 40.7128, lng: -74.0060 },
  { name: 'Manhattan - Midtown', lat: 40.7549, lng: -73.9840 },
  { name: 'Manhattan - Upper East', lat: 40.7736, lng: -73.9566 },
  { name: 'Manhattan - Upper West', lat: 40.7870, lng: -73.9754 },
  { name: 'Brooklyn - Williamsburg', lat: 40.7081, lng: -73.9571 },
  { name: 'Brooklyn - Park Slope', lat: 40.6710, lng: -73.9814 },
  { name: 'Brooklyn - DUMBO', lat: 40.7033, lng: -73.9881 },
  { name: 'Brooklyn - Greenpoint', lat: 40.7282, lng: -73.9496 },
  { name: 'Queens - Astoria', lat: 40.7644, lng: -73.9235 },
  { name: 'Queens - Long Island City', lat: 40.7447, lng: -73.9485 },
];

const SEARCH_QUERIES = [
  { query: 'natural wine bar', category: 'bar' },
  { query: 'natural wine shop', category: 'wine_shop' },
  { query: 'natural wine store', category: 'wine_shop' },
  { query: 'organic wine bar', category: 'bar' },
  { query: 'biodynamic wine', category: 'bar' },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

async function getPlaceDetails(placeId: string, apiKey: string): Promise<any> {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'website,formatted_phone_number,opening_hours,photos');
    url.searchParams.set('key', apiKey);
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.result;
    }
    return null;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GOOGLE_PLACES_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const allPlaces: Map<string, any> = new Map();
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    console.log('Starting NYC natural wine venue import...');

    // Search each location with each query
    for (const location of NYC_LOCATIONS) {
      for (const { query, category } of SEARCH_QUERIES) {
        try {
          const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
          url.searchParams.set('location', `${location.lat},${location.lng}`);
          url.searchParams.set('radius', '3000'); // 3km radius
          url.searchParams.set('keyword', query);
          url.searchParams.set('key', apiKey);

          console.log(`Searching "${query}" in ${location.name}...`);
          
          const response = await fetch(url.toString());
          const data = await response.json();

          if (data.status === 'OK' && data.results) {
            for (const place of data.results as PlaceResult[]) {
              if (!allPlaces.has(place.place_id)) {
                allPlaces.set(place.place_id, {
                  ...place,
                  category,
                  searchLocation: location.name,
                });
              }
            }
          }
          
          // Rate limiting - wait between requests
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error searching ${query} in ${location.name}:`, error);
        }
      }
    }

    console.log(`Found ${allPlaces.size} unique places. Starting import...`);

    // Import each unique place
    for (const [placeId, place] of allPlaces) {
      try {
        // Check if already exists
        const { data: existing } = await supabase
          .from('venues')
          .select('id')
          .eq('google_place_id', placeId)
          .maybeSingle();

        if (existing) {
          console.log(`Skipping ${place.name} - already exists`);
          skipped++;
          continue;
        }

        // Get additional details
        const details = await getPlaceDetails(placeId, apiKey);
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit

        // Parse address
        const address = place.formatted_address || place.vicinity || 'New York, NY';
        const addressParts = address.split(',').map((s: string) => s.trim());
        
        // Generate unique slug
        let baseSlug = generateSlug(place.name);
        let slug = baseSlug;
        let slugCounter = 1;
        
        while (true) {
          const { data: slugExists } = await supabase
            .from('venues')
            .select('id')
            .eq('slug', slug)
            .maybeSingle();
          
          if (!slugExists) break;
          slug = `${baseSlug}-${slugCounter}`;
          slugCounter++;
        }

        // Insert venue
        const venueData = {
          name: place.name,
          slug,
          category: place.category as 'bar' | 'wine_shop' | 'restaurant' | 'accommodation' | 'winemaker',
          address: addressParts[0] || address,
          city: 'New York',
          country: 'United States',
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          google_place_id: placeId,
          google_rating: place.rating || null,
          phone: details?.formatted_phone_number || null,
          website: details?.website || null,
          is_open: place.opening_hours?.open_now ?? null,
          is_claimed: false,
          description: `Natural wine ${place.category === 'bar' ? 'bar' : 'shop'} in New York City.`,
        };

        const { error: insertError } = await supabase
          .from('venues')
          .insert(venueData);

        if (insertError) {
          console.error(`Error inserting ${place.name}:`, insertError);
          errors++;
        } else {
          console.log(`Imported: ${place.name}`);
          imported++;
        }
      } catch (error) {
        console.error(`Error processing ${place.name}:`, error);
        errors++;
      }
    }

    const summary = {
      total_found: allPlaces.size,
      imported,
      skipped,
      errors,
      message: `Successfully imported ${imported} venues. Skipped ${skipped} (already exist). ${errors} errors.`,
    };

    console.log('Import complete:', summary);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-google-places:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
