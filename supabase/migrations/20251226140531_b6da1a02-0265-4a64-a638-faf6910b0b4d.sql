-- Create wine quiz results table
CREATE TABLE public.wine_quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  answers JSONB NOT NULL,
  recommendation_name TEXT NOT NULL,
  recommendation_grape TEXT,
  recommendation_region TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wine_quiz_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own quiz results
CREATE POLICY "Users can view their own quiz results"
ON public.wine_quiz_results
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own quiz results
CREATE POLICY "Users can insert their own quiz results"
ON public.wine_quiz_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own quiz results
CREATE POLICY "Users can delete their own quiz results"
ON public.wine_quiz_results
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster user queries
CREATE INDEX idx_wine_quiz_results_user_id ON public.wine_quiz_results(user_id);
CREATE INDEX idx_wine_quiz_results_created_at ON public.wine_quiz_results(created_at DESC);