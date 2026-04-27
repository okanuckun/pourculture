import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types?: string[];
  url?: string;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { placeId } = await req.json();
    
    if (!placeId) {
      return new Response(
        JSON.stringify({ error: 'placeId is required' }),
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


    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'place_id,name,formatted_address,address_components,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,price_level,opening_hours,photos,geometry,types,url,reviews');
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message);
      return new Response(
        JSON.stringify({ error: data.error_message || `API returned status: ${data.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const place = data.result as PlaceDetails;
    const city = place.address_components?.find(component =>
      ['locality', 'postal_town', 'administrative_area_level_2', 'sublocality', 'sublocality_level_1'].some(type =>
        component.types.includes(type)
      )
    )?.long_name;
    const country = place.address_components?.find(component => component.types.includes('country'))?.long_name;

    // Photos go through our own google-place-photo proxy so the API
    // key never leaves the server. The client receives plain proxy URLs
    // it can drop straight into <img src=...>; the proxy resolves the
    // photoReference + key on the edge.
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const photoUrls = place.photos?.slice(0, 5).map(photo =>
      `${supabaseUrl}/functions/v1/google-place-photo?photoReference=${encodeURIComponent(photo.photo_reference)}&maxWidth=800`
    ) || [];

    const result = {
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      city,
      country,
      phone: place.formatted_phone_number || place.international_phone_number,
      website: place.website,
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      priceLevel: place.price_level,
      isOpen: place.opening_hours?.open_now,
      openingHours: place.opening_hours?.weekday_text,
      photos: photoUrls,
      lat: place.geometry?.location.lat,
      lng: place.geometry?.location.lng,
      types: place.types,
      googleMapsUrl: place.url,
      reviews: place.reviews?.slice(0, 3).map(r => ({
        author: r.author_name,
        rating: r.rating,
        text: r.text,
        date: new Date(r.time * 1000).toLocaleDateString()
      }))
    };


    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-place-details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
