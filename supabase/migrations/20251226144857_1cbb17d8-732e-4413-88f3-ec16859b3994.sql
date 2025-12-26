-- Create favorites table for Knowledge Hub resources
CREATE TABLE public.knowledge_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('glossary', 'guide', 'pdf', 'harvest_report')),
  resource_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_type, resource_id)
);

-- Enable Row Level Security
ALTER TABLE public.knowledge_favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.knowledge_favorites
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add their own favorites
CREATE POLICY "Users can add their own favorites"
ON public.knowledge_favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
ON public.knowledge_favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_knowledge_favorites_user_id ON public.knowledge_favorites(user_id);
CREATE INDEX idx_knowledge_favorites_resource ON public.knowledge_favorites(resource_type, resource_id);