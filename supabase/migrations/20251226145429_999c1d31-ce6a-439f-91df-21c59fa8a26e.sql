-- Create forum topics table
CREATE TABLE public.forum_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum comments table
CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Topics: Everyone can read
CREATE POLICY "Forum topics are viewable by everyone"
ON public.forum_topics
FOR SELECT
USING (true);

-- Topics: Logged in users can create
CREATE POLICY "Logged in users can create topics"
ON public.forum_topics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Topics: Users can update their own topics
CREATE POLICY "Users can update their own topics"
ON public.forum_topics
FOR UPDATE
USING (auth.uid() = user_id);

-- Topics: Users can delete their own topics
CREATE POLICY "Users can delete their own topics"
ON public.forum_topics
FOR DELETE
USING (auth.uid() = user_id);

-- Comments: Everyone can read
CREATE POLICY "Forum comments are viewable by everyone"
ON public.forum_comments
FOR SELECT
USING (true);

-- Comments: Logged in users can create
CREATE POLICY "Logged in users can create comments"
ON public.forum_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Comments: Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.forum_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Comments: Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.forum_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_forum_topics_created_at ON public.forum_topics(created_at DESC);
CREATE INDEX idx_forum_comments_topic_id ON public.forum_comments(topic_id);
CREATE INDEX idx_forum_comments_created_at ON public.forum_comments(created_at);

-- Update trigger for topics
CREATE TRIGGER update_forum_topics_updated_at
BEFORE UPDATE ON public.forum_topics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for comments
CREATE TRIGGER update_forum_comments_updated_at
BEFORE UPDATE ON public.forum_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();