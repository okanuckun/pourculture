/**
 * Venue photo helpers.
 *
 * Strategy:
 * 1. If the venue uploaded its own photos (`photos` array) or has an `image_url`, use those.
 * 2. Otherwise fall back to a stored `google_photo_references` entry. The
 *    column name is historical — entries are now either:
 *      - A full https:// URL (Foursquare CDN, used for venues added after the
 *        Foursquare migration). Rendered directly.
 *      - A Google Places `photo_reference` opaque token (legacy venues added
 *        via the old Google Discovery flow). Rendered through the
 *        `google-place-photo` edge proxy.
 *
 * Legacy data: some old rows stored direct
 * `https://maps.googleapis.com/maps/api/place/photo?...&key=...` URLs.
 * Google now blocks these (referrer/key restrictions) and they leak the API
 * key. `normalizePhotoUrl` rewrites them on the fly to go through our edge
 * proxy.
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

/**
 * Resolve a stored photo reference to a URL the browser can load.
 * Handles both Foursquare CDN URLs and legacy Google photo_reference tokens
 * stored in the same `google_photo_references` column.
 */
export function resolvePhotoReference(
  reference: string | undefined | null,
  maxWidth = 800
): string | undefined {
  if (!reference) return undefined;
  // Foursquare-era references are stored as full URLs. Run through
  // normalizePhotoUrl so any leaked direct-Google URLs that ended up there
  // also get proxied.
  if (reference.startsWith('http://') || reference.startsWith('https://')) {
    return normalizePhotoUrl(reference, maxWidth);
  }
  // Legacy Google photo_reference token — proxy through our edge function.
  return googlePlacePhotoUrl(reference, maxWidth);
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
      const resolved = resolvePhotoReference(ref, maxWidth);
      if (resolved) out.push(resolved);
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
