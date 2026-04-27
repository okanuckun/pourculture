-- Round existing posts geo to ~1km precision (privacy fix)
UPDATE public.posts
SET 
  latitude = ROUND(latitude::numeric, 2),
  longitude = ROUND(longitude::numeric, 2)
WHERE latitude IS NOT NULL OR longitude IS NOT NULL;

-- Trigger function to auto-round future inserts/updates
CREATE OR REPLACE FUNCTION public.round_post_geo()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.latitude IS NOT NULL THEN
    NEW.latitude := ROUND(NEW.latitude::numeric, 2);
  END IF;
  IF NEW.longitude IS NOT NULL THEN
    NEW.longitude := ROUND(NEW.longitude::numeric, 2);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS round_posts_geo_trigger ON public.posts;

CREATE TRIGGER round_posts_geo_trigger
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.round_post_geo();