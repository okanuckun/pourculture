/**
 * Venue photo helpers.
 *
 * Strategy:
 * 1. If the venue uploaded its own photos (`photos` array) or has an `image_url`, use those.
 * 2. Otherwise fall back to Google Places photos via the `google-place-photo` edge proxy
 *    using the first stored `google_photo_references` entry.
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

interface VenueLike {
  image_url?: string | null;
  photos?: unknown;
  google_photo_references?: string[] | null;
}

/**
 * Resolve the best available image URL for a venue.
 * Returns undefined if no photo source exists.
 */
export function resolveVenueImage(
  venue: VenueLike,
  maxWidth = 800
): string | undefined {
  // 1. User-uploaded photos array (jsonb)
  if (Array.isArray(venue.photos) && venue.photos.length > 0) {
    const first = venue.photos[0];
    if (typeof first === 'string' && first.length > 0) return first;
    if (first && typeof first === 'object' && 'url' in first) {
      const url = (first as { url?: unknown }).url;
      if (typeof url === 'string' && url.length > 0) return url;
    }
  }

  // 2. Direct image_url
  if (venue.image_url && venue.image_url.length > 0) {
    return venue.image_url;
  }

  // 3. Google Places photo proxy fallback
  if (
    Array.isArray(venue.google_photo_references) &&
    venue.google_photo_references.length > 0
  ) {
    return googlePlacePhotoUrl(venue.google_photo_references[0], maxWidth);
  }

  return undefined;
}
