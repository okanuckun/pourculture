-- Track if post was made as a venue (business post)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS posted_as_venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL;
