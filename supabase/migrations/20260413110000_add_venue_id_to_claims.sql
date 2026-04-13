-- Allow venue claims to reference DB venues (not just Google Places)
ALTER TABLE public.venue_claims ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL;

-- Make google_place_id optional (was required before)
ALTER TABLE public.venue_claims ALTER COLUMN google_place_id DROP NOT NULL;
