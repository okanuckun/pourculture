/**
 * Venue photo helpers.
 *
 * Strategy:
 * 1. If the venue uploaded its own photos (`photos` array) or has an `image_url`, use those.
 * 2. Otherwise fall back to Google Places photos via the `google-place-photo` edge proxy
 *    using the first stored `google_photo_references` entry.
 *
 * Legacy data: some old rows stored direct
 * `https://maps.googleapis.com/maps/api/place/photo?...&key=...` URLs.
 * Google now blocks these (referrer/key restrictions) and they leak the API key.
 * `normalizePhotoUrl` rewrites them on the fly to go through our edge proxy.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export function googlePlacePhotoUrl(
  photoReference: string,
  maxWidth = 800
): string {
  const params = new URLSearchParams({
    photoReference,
    maxWidth: String(maxWidth),
  });
  return `${SUPABASE_URL}/functions/v1/google-place-photo?${params.toString()}`;
}

/**
 * If a URL is a legacy direct Google Places photo URL (which now 403s and
 * leaks an API key), rewrite it to use our `google-place-photo` proxy.
 * Otherwise return the URL unchanged.
 */
export function normalizePhotoUrl(url: string, maxWidth = 800): string {
  if (!url) return url;
  if (!url.includes('maps.googleapis.com/maps/api/place/photo')) return url;
  try {
    const parsed = new URL(url);
    const ref =
      parsed.searchParams.get('photo_reference') ||
      parsed.searchParams.get('photoreference') ||
      parsed.searchParams.get('photoReference');
    if (!ref) return url;
    return googlePlacePhotoUrl(ref, maxWidth);
  } catch {
    return url;
  }
}

interface VenueLike {
  image_url?: string | null;
  photos?: unknown;
  google_photo_references?: string[] | null;
}

/**
 * Extract a flat list of usable photo URLs from a venue, normalizing any
 * legacy Google direct URLs through our proxy and falling back to
 * `google_photo_references` if no explicit photos exist.
 */
export function resolveVenuePhotos(
  venue: VenueLike,
  maxWidth = 800
): string[] {
  const out: string[] = [];

  if (Array.isArray(venue.photos)) {
    for (const item of venue.photos) {
      if (typeof item === 'string' && item.length > 0) {
        out.push(normalizePhotoUrl(item, maxWidth));
      } else if (item && typeof item === 'object' && 'url' in item) {
        const url = (item as { url?: unknown }).url;
        if (typeof url === 'string' && url.length > 0) {
          out.push(normalizePhotoUrl(url, maxWidth));
        }
      }
    }
  }

  if (out.length === 0 && venue.image_url && venue.image_url.length > 0) {
    out.push(normalizePhotoUrl(venue.image_url, maxWidth));
  }

  if (
    out.length === 0 &&
    Array.isArray(venue.google_photo_references) &&
    venue.google_photo_references.length > 0
  ) {
    for (const ref of venue.google_photo_references) {
      if (typeof ref === 'string' && ref.length > 0) {
        out.push(googlePlacePhotoUrl(ref, maxWidth));
      }
    }
  }

  return out;
}

/**
 * Resolve the best available image URL for a venue.
 * Returns undefined if no photo source exists.
 */
export function resolveVenueImage(
  venue: VenueLike,
  maxWidth = 800
): string | undefined {
  const photos = resolveVenuePhotos(venue, maxWidth);
  return photos[0];
}
