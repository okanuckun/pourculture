-- Create wine scan history table for saving scanned wines
CREATE TABLE public.wine_scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT,
  wine_name TEXT NOT NULL,
  winery TEXT,
  region TEXT,
  country TEXT,
  grape_variety TEXT,
  vintage TEXT,
  wine_type TEXT,
  terroir JSONB DEFAULT '{}'::jsonb,
  tasting_notes JSONB DEFAULT '{}'::jsonb,
  food_pairing TEXT[],
  serving_temperature TEXT,
  aging_potential TEXT,
  quick_summary TEXT,
  detailed_description TEXT,
  price_range TEXT,
  rating INTEGER,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wine_scan_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own scan history" 
ON public.wine_scan_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scan history" 
ON public.wine_scan_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scan history" 
ON public.wine_scan_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scan history" 
ON public.wine_scan_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_wine_scan_history_updated_at
BEFORE UPDATE ON public.wine_scan_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();