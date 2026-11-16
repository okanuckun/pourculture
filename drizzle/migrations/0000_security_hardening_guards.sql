CREATE OR REPLACE FUNCTION public.guard_profile_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
     OR NEW.id IS DISTINCT FROM OLD.id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Not allowed to modify protected profile fields' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_profile_update BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_update();
DROP POLICY "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND COALESCE(is_verified, false) = false);

DROP POLICY "Authenticated users can insert news" ON public.news;
DROP POLICY "Users can update their own news" ON public.news;
DROP POLICY "Users can delete their own news" ON public.news;
DROP POLICY "Published news are viewable by everyone" ON public.news;
CREATE POLICY "Published news are viewable by everyone" ON public.news FOR SELECT
  USING (is_published = true);

ALTER TABLE public.venues ADD COLUMN status text NOT NULL DEFAULT 'published';
ALTER TABLE public.venues ADD CONSTRAINT venues_status_check
  CHECK (status IN ('pending','published','rejected'));
CREATE INDEX venues_status_idx ON public.venues(status);

DROP POLICY "Venues are viewable by everyone" ON public.venues;
CREATE POLICY "Published venues are viewable by everyone" ON public.venues FOR SELECT
  USING (status = 'published' OR auth.uid() = created_by OR auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.guard_venue_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
    NEW.is_featured := false;
    NEW.is_claimed := false;
    NEW.owner_id := NULL;
    NEW.source := 'community';
    NEW.created_by := auth.uid();
    RETURN NEW;
  END IF;
  IF NEW.is_featured IS DISTINCT FROM OLD.is_featured
     OR NEW.is_claimed IS DISTINCT FROM OLD.is_claimed
     OR NEW.owner_id IS DISTINCT FROM OLD.owner_id
     OR NEW.source IS DISTINCT FROM OLD.source
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.created_by IS DISTINCT FROM OLD.created_by
     OR NEW.google_place_id IS DISTINCT FROM OLD.google_place_id THEN
    RAISE EXCEPTION 'Not allowed to modify protected venue fields' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_venue_write BEFORE INSERT OR UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.guard_venue_write();

CREATE OR REPLACE FUNCTION public.guard_winemaker_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.is_featured := false; NEW.is_claimed := false; NEW.owner_id := NULL;
    NEW.created_by := auth.uid();
    RETURN NEW;
  END IF;
  IF NEW.is_featured IS DISTINCT FROM OLD.is_featured
     OR NEW.is_claimed IS DISTINCT FROM OLD.is_claimed
     OR NEW.is_new IS DISTINCT FROM OLD.is_new
     OR NEW.owner_id IS DISTINCT FROM OLD.owner_id
     OR NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'Not allowed to modify protected winemaker fields' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_winemaker_write BEFORE INSERT OR UPDATE ON public.winemakers
  FOR EACH ROW EXECUTE FUNCTION public.guard_winemaker_update();