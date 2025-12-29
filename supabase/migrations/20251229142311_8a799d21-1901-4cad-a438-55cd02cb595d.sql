-- Venue Claims / Ownership Request Table
CREATE TABLE public.venue_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  google_place_id TEXT, -- For claiming venues from Google Places
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  business_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  business_phone TEXT,
  role_at_venue TEXT NOT NULL, -- 'owner', 'manager', 'staff'
  message TEXT, -- Why they should be approved
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.venue_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for venue_claims
CREATE POLICY "Users can view their own claims"
  ON public.venue_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all claims"
  ON public.venue_claims FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create claims"
  ON public.venue_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update claims"
  ON public.venue_claims FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their pending claims"
  ON public.venue_claims FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

-- Add owner_id column to venues table to track ownership
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Add venue profile fields
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS story TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS wine_list JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS menu_url TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS google_place_id TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS google_rating NUMERIC;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT false;

-- Update RLS for venues to allow owners to update their venues
CREATE POLICY "Owners can update their claimed venues"
  ON public.venues FOR UPDATE
  USING (auth.uid() = owner_id);

-- Similar structure for winemakers
ALTER TABLE public.winemakers ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE public.winemakers ADD COLUMN IF NOT EXISTS story TEXT;
ALTER TABLE public.winemakers ADD COLUMN IF NOT EXISTS wine_list JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.winemakers ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.winemakers ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.winemakers ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT false;

-- Update RLS for winemakers
CREATE POLICY "Owners can update their claimed winemakers"
  ON public.winemakers FOR UPDATE
  USING (auth.uid() = owner_id);

-- Winemaker claims table
CREATE TABLE public.winemaker_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winemaker_id UUID REFERENCES public.winemakers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  business_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  business_phone TEXT,
  role_at_winemaker TEXT NOT NULL,
  message TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.winemaker_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own winemaker claims"
  ON public.winemaker_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all winemaker claims"
  ON public.winemaker_claims FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create winemaker claims"
  ON public.winemaker_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update winemaker claims"
  ON public.winemaker_claims FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their pending winemaker claims"
  ON public.winemaker_claims FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

-- Trigger for updated_at
CREATE TRIGGER update_venue_claims_updated_at
  BEFORE UPDATE ON public.venue_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_winemaker_claims_updated_at
  BEFORE UPDATE ON public.winemaker_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();