# Security hardening (no visual changes)

Nothing has been applied yet. Below are the database changes for your review. The function and page changes follow after you approve.

## Migration 1: profiles, news, venues and winemakers lock-down

```sql
-- (1) PROFILES: non-admins may change only display fields
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
-- Also block self-insert with is_verified = true
DROP POLICY "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND COALESCE(is_verified, false) = false);
-- Roles: user_roles already has only admin-managed policies (verified separately).

-- (2) NEWS: admin-only writes ("Admins can manage all news" stays)
DROP POLICY "Authenticated users can insert news" ON public.news;
DROP POLICY "Users can update their own news" ON public.news;
DROP POLICY "Users can delete their own news" ON public.news;
DROP POLICY "Published news are viewable by everyone" ON public.news;
CREATE POLICY "Published news are viewable by everyone" ON public.news FOR SELECT
  USING (is_published = true);

-- (4) VENUES: moderation status
ALTER TABLE public.venues ADD COLUMN status text NOT NULL DEFAULT 'published';
ALTER TABLE public.venues ADD CONSTRAINT venues_status_check
  CHECK (status IN ('pending','published','rejected'));
CREATE INDEX venues_status_idx ON public.venues(status);

DROP POLICY "Venues are viewable by everyone" ON public.venues;
CREATE POLICY "Published venues are viewable by everyone" ON public.venues FOR SELECT
  USING (status = 'published' OR auth.uid() = created_by OR auth.uid() = owner_id);
-- admins already see everything via "Admins can manage all venues"

-- (3)+(4) VENUES guard: inserts by non-admins forced to pending; protected fields admin-only
CREATE OR REPLACE FUNCTION public.guard_venue_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- service-role (edge functions) and admins bypass
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

-- (3) WINEMAKERS guard
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
```

## Migration 2: rate limit log (for analyze-wine and reset-password)

```sql
CREATE TABLE public.rate_limit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,      -- user id, or email/IP for reset-password
  action text NOT NULL,       -- 'analyze-wine' | 'reset-password'
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.rate_limit_events TO service_role;
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;
-- no policies: only edge functions (service role) read/write
CREATE INDEX rate_limit_events_lookup ON public.rate_limit_events(action, subject, created_at DESC);
```
Limits: analyze-wine 20 per user per hour; reset-password 5 per email per hour. Over the limit returns 429.

## Edge functions (after approval)
- Shared `_shared/auth.ts`: `requireUser(req)` (validates the JWT with getClaims) and `requireAdmin(req)` (has_role check).
- Signed-in user required: analyze-wine, auto-import-foursquare-venues, search-wine-places, autocomplete-places, get-place-details, google-place-photo. Admin only: geocode-venues, reset-password (already admin-facing).
- sitemap, robots-txt and get-mapbox-token stay public.
- Frontend calls already send the session token through `supabase.functions.invoke`. Images from google-place-photo used in `<img src>` tags can't send a token, so those will be fetched as blobs with the token instead. No visual change.

## Admin pages
- An `AdminGuard` wrapper checks `has_role` on the server for every `/admin/*` page and redirects non-admins. Each admin page component also checks this itself, as you asked.
- New "Pending venues" queue in the admin area with Approve / Reject (sets status). It reuses the existing admin table style.

## Things to know
- When a signed-in user tags a new venue in the Feed, the venue will now be **pending**. The post still links to it, but the map hides it until an admin approves it. Venues imported automatically by "Search this area" run on the server, so they stay published.
- The policy names you listed for news differ slightly from the real ones. The SQL above drops the real names.
