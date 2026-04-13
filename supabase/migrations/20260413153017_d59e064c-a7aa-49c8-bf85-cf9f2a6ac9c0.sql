
-- Create post_views table
CREATE TABLE public.post_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid,
  viewed_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post views are insertable by anyone" ON public.post_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Post views are viewable by everyone" ON public.post_views FOR SELECT USING (true);

-- Add view_count column to posts
ALTER TABLE public.posts ADD COLUMN view_count integer NOT NULL DEFAULT 0;

-- Create increment_view_count function
CREATE OR REPLACE FUNCTION public.increment_view_count(p_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts SET view_count = view_count + 1 WHERE id = p_post_id;
END;
$$;
