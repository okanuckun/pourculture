import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaceResult {
  id: string;
  placeId: string;
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
  // For Foursquare results we return a fully-built CDN URL here, not a
  // photo_reference. venuePhoto.ts detects http(s) and renders directly;
  // Google-era references (no http prefix) still go through the legacy
  // google-place-photo proxy for venues already in the DB.
  photoReference?: string;
}

// Foursquare Places API v3 — wine-relevant categories (numeric IDs).
// 13057 Wine Bar, 13338 Winery, 17074 Wine Shop, 13003 Bar, 13145 Restaurant.
const WINE_CATEGORY_IDS = '13057,13338,17074';

function categoryFromFsq(categories: Array<{ id?: number | string; name?: string }> = [], fallback: PlaceResult['category'] = 'wine_bar'): PlaceResult['category'] {
  const ids = categories.map((c) => Number(c.id)).filter((n) => Number.isFinite(n));
  const names = categories.map((c) => String(c.name ?? '').toLowerCase());

  if (ids.includes(13338) || names.some((n) => n.includes('winery'))) return 'winery';
  if (ids.includes(17074) || names.some((n) => n.includes('wine shop') || n.includes('wine store') || n.includes('liquor'))) return 'wine_shop';
  if (ids.includes(13057) || names.some((n) => n.includes('wine bar'))) return 'wine_bar';
  if (names.some((n) => n.includes('restaurant'))) return 'restaurant';
  return fallback;
}

function buildPhotoUrl(photo: { prefix?: string; suffix?: string } | undefined, size = 'original'): string | undefined {
  if (!photo?.prefix || !photo?.suffix) return undefined;
  return `${photo.prefix}${size}${photo.suffix}`;
}

function buildAddress(location: any): string | undefined {
  if (!location) return undefined;
  if (location.formatted_address) return location.formatted_address;
  const parts = [
    location.address,
    location.locality,
    location.region,
    location.postcode,
    location.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : undefined;
}

function mapFoursquarePlace(place: any, fallbackCategory: PlaceResult['category'] = 'wine_bar'): PlaceResult {
  const fsqId = place.fsq_place_id ?? place.fsq_id ?? '';
  const lat = place.geocodes?.main?.latitude ?? place.latitude ?? 0;
  const lng = place.geocodes?.main?.longitude ?? place.longitude ?? 0;
  const photo = Array.isArray(place.photos) && place.photos.length > 0 ? place.photos[0] : undefined;

  return {
    id: `foursquare_${fsqId}`,
    placeId: fsqId,
    name: place.name,
    lat,
    lng,
    address: buildAddress(place.location),
    category: categoryFromFsq(place.categories, fallbackCategory),
    // Foursquare ratings are 0-10; normalize to 0-5 to match the Google shape consumers expect.
    rating: typeof place.rating === 'number' ? Number((place.rating / 2).toFixed(1)) : undefined,
    priceLevel: typeof place.price === 'number' && place.price >= 1 && place.price <= 4 ? place.price : undefined,
    isOpen: place.hours?.open_now,
    website: place.website ?? undefined,
    phone: place.tel ?? undefined,
    photoReference: buildPhotoUrl(photo, 'original'),
  };
}

const FSQ_FIELDS = [
  'fsq_place_id',
  'name',
  'geocodes',
  'location',
  'categories',
  'rating',
  'price',
  'hours',
  'website',
  'tel',
  'photos',
].join(',');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, radius = 5000, naturalWineOnly = false, query } = await req.json();
    const trimmedQuery = typeof query === 'string' ? query.trim() : '';

    if (!trimmedQuery && (typeof lat !== 'number' || typeof lng !== 'number')) {
      return new Response(
        JSON.stringify({ error: 'Either query or lat/lng are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (typeof lat === 'number' && (lat < -90 || lat > 90)) {
      return new Response(
        JSON.stringify({ error: 'lat must be between -90 and 90' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (typeof lng === 'number' && (lng < -180 || lng > 180)) {
      return new Response(
        JSON.stringify({ error: 'lng must be between -180 and 180' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Foursquare radius cap is 100km; clamp to a sensible window.
    const safeRadius = Math.max(100, Math.min(typeof radius === 'number' ? radius : 5000, 100000));

    const apiKey = Deno.env.get('FOURSQUARE_API_KEY');
    if (!apiKey) {
      console.error('FOURSQUARE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Foursquare Service API (post-2025 migration).
    // Auth is Bearer + a required version header. The legacy v3 endpoint
    // (api.foursquare.com/v3) rejects new-tier keys with 401 "Invalid
    // request token", so we always hit the new host.
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'X-Places-Api-Version': '2025-06-17',
    };

    if (trimmedQuery) {
      // Text search mode (admin Discovery + Feed venue picker).
      const url = new URL('https://places-api.foursquare.com/places/search');
      url.searchParams.set('query', naturalWineOnly ? `natural ${trimmedQuery}` : trimmedQuery);
      // Bias toward wine venues but don't lock the search out of restaurants
      // that may serve as wine bars in some cities.
      url.searchParams.set('categories', WINE_CATEGORY_IDS);
      url.searchParams.set('limit', '20');
      url.searchParams.set('fields', FSQ_FIELDS);

      const response = await fetch(url.toString(), { headers });
      const data = await response.json();

      if (!response.ok) {
        console.warn(`Foursquare text search error: ${response.status}`, data?.message);
        return new Response(
          JSON.stringify({ places: [], count: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const results: any[] = Array.isArray(data?.results) ? data.results : [];
      const places = results.slice(0, 20).map((r) => mapFoursquarePlace(r));

      return new Response(
        JSON.stringify({ places, count: places.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Nearby mode — used by HomeWineMap when a user pans the map.
    // We issue several focused queries so each result lands in the right
    // category (wine_bar / wine_shop / winery) without a separate filter pass.
    const prefix = naturalWineOnly ? 'natural ' : '';
    const searchQueries: Array<{ query: string; category: PlaceResult['category'] }> = [
      { query: `${prefix}wine bar`, category: 'wine_bar' },
      { query: `${prefix}wine shop`, category: 'wine_shop' },
      { query: naturalWineOnly ? 'organic winery' : 'winery', category: 'winery' },
    ];

    const allPlaces: PlaceResult[] = [];
    const seenIds = new Set<string>();

    for (const { query: q, category } of searchQueries) {
      try {
        const url = new URL('https://places-api.foursquare.com/places/search');
        url.searchParams.set('query', q);
        url.searchParams.set('ll', `${lat},${lng}`);
        url.searchParams.set('radius', String(safeRadius));
        url.searchParams.set('limit', '30');
        url.searchParams.set('fields', FSQ_FIELDS);

        const response = await fetch(url.toString(), { headers });
        const data = await response.json();

        if (!response.ok) {
          console.warn(`Foursquare nearby error for "${q}": ${response.status}`);
          continue;
        }

        const results: any[] = Array.isArray(data?.results) ? data.results : [];
        for (const place of results) {
          const fsqId = place.fsq_place_id ?? place.fsq_id;
          if (!fsqId || seenIds.has(fsqId)) continue;
          seenIds.add(fsqId);
          allPlaces.push(mapFoursquarePlace(place, category));
        }
      } catch (err) {
        console.error(`Error fetching "${q}":`, err);
      }
    }

    return new Response(
      JSON.stringify({ places: allPlaces, count: allPlaces.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-wine-places (Foursquare):', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
