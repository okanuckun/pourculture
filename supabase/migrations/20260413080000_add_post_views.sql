-- Post views tracking (replaces likes as primary metric)
CREATE TABLE public.post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewer_ip TEXT, -- for anonymous tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view post views count" ON public.post_views FOR SELECT USING (true);
CREATE POLICY "Anyone can insert views" ON public.post_views FOR INSERT WITH CHECK (true);

CREATE INDEX idx_post_views_post ON public.post_views(post_id);
CREATE INDEX idx_post_views_viewer ON public.post_views(viewer_id);
-- Prevent duplicate views from same user within short time
CREATE UNIQUE INDEX idx_post_views_unique ON public.post_views(post_id, viewer_id) WHERE viewer_id IS NOT NULL;

-- Add view_count to posts for fast reads
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;

-- Function to increment view count (called from client after view insert)
CREATE OR REPLACE FUNCTION public.increment_view_count(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.posts SET view_count = view_count + 1 WHERE id = p_post_id;
END;
$$;
