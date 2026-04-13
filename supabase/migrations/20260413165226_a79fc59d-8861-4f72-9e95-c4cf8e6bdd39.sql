-- Add posted_as_venue_id to posts table
ALTER TABLE public.posts ADD COLUMN posted_as_venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL;

-- Index for quick lookup
CREATE INDEX idx_posts_posted_as_venue_id ON public.posts(posted_as_venue_id) WHERE posted_as_venue_id IS NOT NULL;