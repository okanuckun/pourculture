-- Create venue_reviews table for customer reviews
CREATE TABLE public.venue_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create winemaker_reviews table for winemaker reviews
CREATE TABLE public.winemaker_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  winemaker_id UUID NOT NULL REFERENCES public.winemakers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.venue_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winemaker_reviews ENABLE ROW LEVEL SECURITY;

-- Venue reviews policies
CREATE POLICY "Reviews are viewable by everyone" 
ON public.venue_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create reviews" 
ON public.venue_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.venue_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.venue_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Winemaker reviews policies
CREATE POLICY "Winemaker reviews are viewable by everyone" 
ON public.winemaker_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create winemaker reviews" 
ON public.winemaker_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own winemaker reviews" 
ON public.winemaker_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own winemaker reviews" 
ON public.winemaker_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_venue_reviews_updated_at
BEFORE UPDATE ON public.venue_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_winemaker_reviews_updated_at
BEFORE UPDATE ON public.winemaker_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint to prevent duplicate reviews
CREATE UNIQUE INDEX idx_venue_reviews_unique_user ON public.venue_reviews(venue_id, user_id);
CREATE UNIQUE INDEX idx_winemaker_reviews_unique_user ON public.winemaker_reviews(winemaker_id, user_id);