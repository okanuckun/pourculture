ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS google_photo_references TEXT[] NOT NULL DEFAULT '{}';