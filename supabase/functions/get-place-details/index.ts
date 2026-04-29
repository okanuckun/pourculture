import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Service API field set. Returned shape uses flat latitude/longitude (not
// nested geocodes), and categories come back with `fsq_category_id`.
const FSQ_FIELDS = [
  'fsq_place_id',
  'name',
  'location',
  'latitude',
  'longitude',
  'categories',
  'rating',
  'stats',
  'price',
  'hours',
  'tel',
  'website',
  'social_media',
  'tips',
].join(',');

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

// Foursquare returns regular hours as `{ day, open, close }` arrays. Render
// them as the same human-readable lines our UI already expects from Google
// (e.g. "Monday: 17:00 – 02:00"). Frontend treats it as a string[].
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime(hhmm: string | undefined): string {
  if (!hhmm || hhmm.length < 4) return '';
  const hh = hhmm.slice(0, 2);
  const mm = hhmm.slice(2, 4);
  return `${hh}:${mm}`;
}

function buildOpeningHours(hours: any): string[] | undefined {
  if (!hours) return undefined;

  // Some FSQ responses include human-readable display hours per weekday.
  if (Array.isArray(hours.display) && hours.display.every((d: unknown) => typeof d === 'string')) {
    return hours.display;
  }

  if (!Array.isArray(hours.regular)) return undefined;

  // Group time ranges per day, then format.
  const byDay = new Map<number, string[]>();
  for (const slot of hours.regular) {
    const day = Number(slot?.day);
    if (!Number.isFinite(day) || day < 1 || day > 7) continue;
    // FSQ uses 1=Monday..7=Sunday; convert to Sunday-first for display.
    const range = `${formatTime(slot.open)} – ${formatTime(slot.close)}`;
    const list = byDay.get(day) ?? [];
    list.push(range);
    byDay.set(day, list);
  }

  if (byDay.size === 0) return undefined;

  const lines: string[] = [];
  // Display order: Monday → Sunday (matches Google's weekday_text default).
  for (let d = 1; d <= 7; d += 1) {
    const dayName = DAY_NAMES[d % 7]; // 7 → Sunday → index 0
    const ranges = byDay.get(d);
    lines.push(`${dayName}: ${ranges && ranges.length > 0 ? ranges.join(', ') : 'Closed'}`);
  }
  return lines;
}

function pickCity(location: any): string | undefined {
  if (!location) return undefined;
  return location.locality ?? location.region ?? location.census_block ?? undefined;
}

function pickCountry(location: any): string | undefined {
  if (!location) return undefined;
  return location.country ?? undefined;
}

function fsqTypesFromCategories(categories: Array<{ fsq_category_id?: string; id?: number | string; name?: string; short_name?: string; plural_name?: string }> = []): string[] {
  // Map a couple of common category ids/names back to the Google-style
  // type strings the frontend uses to label venues. Anything else falls
  // through unchanged.
  const out: string[] = [];
  for (const c of categories) {
    const name = String(c?.name ?? c?.short_name ?? c?.plural_name ?? '').toLowerCase();
    if (!name) continue;
    if (name.includes('winery') || name.includes('vineyard')) out.push('winery');
    else if (name.includes('wine shop') || name.includes('wine store') || name.includes('liquor')) out.push('store');
    else if (name.includes('wine bar')) out.push('bar');
    else if (name.includes('bar')) out.push('bar');
    else if (name.includes('restaurant')) out.push('restaurant');
  }
  return out;
}

function pickGoogleAddressComponent(components: any[] = [], wantedTypes: string[]): string | undefined {
  const component = components.find((c) => wantedTypes.some((t) => Array.isArray(c?.types) && c.types.includes(t)));
  return component?.long_name ?? component?.short_name ?? undefined;
}

async function getGooglePlaceDetails(placeId: string, apiKey: string) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('fields', [
    'place_id',
    'name',
    'formatted_address',
    'geometry',
    'international_phone_number',
    'formatted_phone_number',
    'website',
    'rating',
    'user_ratings_total',
    'price_level',
    'opening_hours',
    'photos',
    'types',
    'reviews',
    'address_components',
  ].join(','));

  const response = await fetch(url.toString());
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status !== 'OK') {
    throw new Error(data.error_message || data.status || `Google returned ${response.status}`);
  }

  const place = data.result;
  const lat = place.geometry?.location?.lat;
  const lng = place.geometry?.location?.lng;
  const photoReferences = (Array.isArray(place.photos) ? place.photos : [])
    .slice(0, 6)
    .map((p) => p.photo_reference)
    .filter((ref): ref is string => typeof ref === 'string');

  return {
    id: place.place_id ?? placeId,
    name: place.name,
    address: place.formatted_address,
    city: pickGoogleAddressComponent(place.address_components, ['locality', 'sublocality', 'administrative_area_level_2']),
    country: pickGoogleAddressComponent(place.address_components, ['country']),
    phone: place.international_phone_number || place.formatted_phone_number || undefined,
    website: place.website || undefined,
    rating: typeof place.rating === 'number' ? place.rating : undefined,
    reviewCount: typeof place.user_ratings_total === 'number' ? place.user_ratings_total : undefined,
    priceLevel: typeof place.price_level === 'number' ? place.price_level : undefined,
    isOpen: place.opening_hours?.open_now,
    openingHours: place.opening_hours?.weekday_text,
    photos: photoReferences,
    photoReferences,
    lat,
    lng,
    types: place.types ?? [],
    googleMapsUrl: lat != null && lng != null ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : undefined,
    reviews: (Array.isArray(place.reviews) ? place.reviews : []).slice(0, 3).map((r) => ({
      author: r.author_name || 'Google user',
      rating: r.rating ?? 0,
      text: r.text || '',
      date: r.relative_time_description || '',
    })),
  };
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

    const isGooglePlaceId = !/^[a-f0-9]{24}$/i.test(String(placeId));

    if (isGooglePlaceId) {
      const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
      if (!googleApiKey) {
        throw new Error('Google Places API key not configured');
      }
      const result = await getGooglePlaceDetails(placeId, googleApiKey);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
      });
    }

    const apiKey = Deno.env.get('FOURSQUARE_API_KEY');
    if (!apiKey) {
      console.error('FOURSQUARE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Foursquare Service API (post-2025 migration). Bearer auth + version
    // header are mandatory; legacy /v3 host rejects new keys.
    const fsqHeaders = {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'X-Places-Api-Version': '2025-06-17',
    };

    // Place details + photos endpoints. Photos and tips have separate routes —
    // fetch them in parallel to keep latency reasonable.
    const detailUrl = new URL(`https://places-api.foursquare.com/places/${encodeURIComponent(placeId)}`);
    detailUrl.searchParams.set('fields', FSQ_FIELDS);

    const photosUrl = new URL(`https://places-api.foursquare.com/places/${encodeURIComponent(placeId)}/photos`);
    photosUrl.searchParams.set('limit', '10');

    const [detailRes, photosRes] = await Promise.all([
      fetch(detailUrl.toString(), { headers: fsqHeaders }),
      fetch(photosUrl.toString(), { headers: fsqHeaders }),
    ]);

    if (!detailRes.ok) {
      const errBody = await detailRes.json().catch(() => ({}));
      console.error('Foursquare details error:', detailRes.status, errBody?.message);
      return new Response(
        JSON.stringify({ error: errBody?.message || `Foursquare returned ${detailRes.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const place = await detailRes.json();
    const photoData: any[] = photosRes.ok ? await photosRes.json().catch(() => []) : [];

    const photoUrls = (Array.isArray(photoData) ? photoData : [])
      .slice(0, 5)
      .map((p) => buildPhotoUrl(p, 'original'))
      .filter((u): u is string => typeof u === 'string');

    // photoReferences kept for backwards compat with the admin Discovery
    // insert flow that stores them in venues.google_photo_references —
    // for Foursquare results these are full CDN URLs, not opaque refs.
    const photoReferences = photoUrls.slice(0, 6);

    // Service API returns flat latitude/longitude; v3 had geocodes.main.
    const lat = place.latitude ?? place.geocodes?.main?.latitude;
    const lng = place.longitude ?? place.geocodes?.main?.longitude;

    // Build a generic external maps URL so the UI's "Open in maps" button keeps
    // working without binding us to Google. Google Maps' search-by-coords URL
    // works fine on every platform.
    const googleMapsUrl = lat != null && lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : undefined;

    // Foursquare tips → reviews shape. Tips don't carry per-tip ratings, so we
    // fall back to the venue's overall rating to satisfy consumers that
    // unconditionally read review.rating.
    const overallRating = typeof place.rating === 'number' ? Number((place.rating / 2).toFixed(1)) : undefined;
    const tips: any[] = Array.isArray(place.tips) ? place.tips : [];
    const reviews = tips.slice(0, 3).map((t) => ({
      author: [t?.user?.first_name, t?.user?.last_name].filter(Boolean).join(' ') || 'Foursquare user',
      rating: overallRating ?? 0,
      text: typeof t?.text === 'string' ? t.text : '',
      date: t?.created_at ? new Date(t.created_at).toLocaleDateString() : '',
    })).filter((r) => r.text.length > 0);

    const result = {
      id: place.fsq_place_id ?? place.fsq_id ?? placeId,
      name: place.name,
      address: buildAddress(place.location),
      city: pickCity(place.location),
      country: pickCountry(place.location),
      phone: place.tel || undefined,
      website: place.website || undefined,
      rating: overallRating,
      reviewCount: typeof place.stats?.total_ratings === 'number' ? place.stats.total_ratings : undefined,
      priceLevel: typeof place.price === 'number' && place.price >= 1 && place.price <= 4 ? place.price : undefined,
      isOpen: place.hours?.open_now,
      openingHours: buildOpeningHours(place.hours),
      photos: photoUrls,
      photoReferences,
      lat,
      lng,
      types: fsqTypesFromCategories(place.categories),
      googleMapsUrl,
      reviews,
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          // Foursquare ToS allows venue caching. 24h edge cache cuts repeated
          // calls when an admin or user revisits the same venue.
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error in get-place-details (Foursquare):', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
