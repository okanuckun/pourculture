-- Rewrite legacy direct Google Places photo URLs in venues to use our edge proxy.
-- This both fixes broken images (Google now blocks key-in-URL requests) and
-- removes the leaked GOOGLE_PLACES_API_KEY from stored rows.

DO $$
DECLARE
  v_supabase_url text := 'https://ikqspsdqdunbvwawsvwq.supabase.co';
  v RECORD;
  new_image_url text;
  new_photos jsonb;
  ref text;
  item jsonb;
  url_text text;
BEGIN
  FOR v IN
    SELECT id, image_url, photos
    FROM public.venues
    WHERE image_url LIKE '%maps.googleapis.com/maps/api/place/photo%'
       OR photos::text LIKE '%maps.googleapis.com/maps/api/place/photo%'
  LOOP
    new_image_url := v.image_url;
    new_photos := v.photos;

    -- Rewrite image_url
    IF v.image_url IS NOT NULL
       AND v.image_url LIKE '%maps.googleapis.com/maps/api/place/photo%' THEN
      ref := substring(v.image_url FROM 'photo_reference=([^&]+)');
      IF ref IS NOT NULL THEN
        new_image_url := v_supabase_url
          || '/functions/v1/google-place-photo?photoReference='
          || ref || '&maxWidth=800';
      END IF;
    END IF;

    -- Rewrite photos array (jsonb array of strings)
    IF jsonb_typeof(v.photos) = 'array' THEN
      new_photos := '[]'::jsonb;
      FOR item IN SELECT * FROM jsonb_array_elements(v.photos)
      LOOP
        IF jsonb_typeof(item) = 'string' THEN
          url_text := item #>> '{}';
          IF url_text LIKE '%maps.googleapis.com/maps/api/place/photo%' THEN
            ref := substring(url_text FROM 'photo_reference=([^&]+)');
            IF ref IS NOT NULL THEN
              url_text := v_supabase_url
                || '/functions/v1/google-place-photo?photoReference='
                || ref || '&maxWidth=800';
            END IF;
          END IF;
          new_photos := new_photos || to_jsonb(url_text);
        ELSE
          new_photos := new_photos || item;
        END IF;
      END LOOP;
    END IF;

    UPDATE public.venues
    SET image_url = new_image_url,
        photos = new_photos
    WHERE id = v.id;
  END LOOP;
END $$;