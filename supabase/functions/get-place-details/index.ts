import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FSQ_FIELDS = [
  'fsq_place_id',
  'name',
  'location',
  'geocodes',
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

function fsqTypesFromCategories(categories: Array<{ id?: number | string; name?: string }> = []): string[] {
  // Map a couple of common category ids/names back to the Google-style
  // type strings the frontend uses to label venues. Anything else falls
  // through unchanged.
  const out: string[] = [];
  for (const c of categories) {
    const name = String(c?.name ?? '').toLowerCase();
    const id = Number(c?.id);
    if (id === 13338 || name.includes('winery')) out.push('winery');
    else if (id === 17074 || name.includes('wine shop') || name.includes('wine store') || name.includes('liquor')) out.push('store');
    else if (id === 13057 || name.includes('wine bar')) out.push('bar');
    else if (id === 13003 || name.includes('bar')) out.push('bar');
    else if (name.includes('restaurant')) out.push('restaurant');
  }
  return out;
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

    const apiKey = Deno.env.get('FOURSQUARE_API_KEY');
    if (!apiKey) {
      console.error('FOURSQUARE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fsqHeaders = {
      Authorization: apiKey,
      Accept: 'application/json',
    };

    // Place details + photos endpoints. Photos and tips have separate routes
    // in Foursquare v3 — fetch them in parallel to keep latency reasonable.
    const detailUrl = new URL(`https://api.foursquare.com/v3/places/${encodeURIComponent(placeId)}`);
    detailUrl.searchParams.set('fields', FSQ_FIELDS);

    const photosUrl = new URL(`https://api.foursquare.com/v3/places/${encodeURIComponent(placeId)}/photos`);
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

    const lat = place.geocodes?.main?.latitude;
    const lng = place.geocodes?.main?.longitude;

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
