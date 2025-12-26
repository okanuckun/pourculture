-- Create forum_likes table
CREATE TABLE public.forum_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id uuid NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(topic_id, user_id)
);

-- Enable RLS
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Forum likes are viewable by everyone"
ON public.forum_likes
FOR SELECT
USING (true);

CREATE POLICY "Logged in users can add likes"
ON public.forum_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
ON public.forum_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_forum_likes_topic_id ON public.forum_likes(topic_id);