-- Create wines table for real wine recommendations
CREATE TABLE public.wines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  grape TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT NOT NULL,
  winemaker TEXT,
  description TEXT,
  image_url TEXT,
  price_range TEXT,
  
  -- Quiz matching criteria
  color TEXT NOT NULL CHECK (color IN ('red', 'white', 'orange', 'rose')),
  style TEXT NOT NULL CHECK (style IN ('funky', 'clean')),
  acidity TEXT NOT NULL CHECK (acidity IN ('acidic', 'soft')),
  occasion TEXT[] DEFAULT '{}',
  
  -- Additional info
  alcohol_percentage DECIMAL(4,2),
  year INTEGER,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wines ENABLE ROW LEVEL SECURITY;

-- Everyone can view wines (public catalog)
CREATE POLICY "Wines are viewable by everyone"
ON public.wines
FOR SELECT
USING (true);

-- Only admins can manage wines
CREATE POLICY "Admins can manage wines"
ON public.wines
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for quiz matching
CREATE INDEX idx_wines_color ON public.wines(color);
CREATE INDEX idx_wines_style ON public.wines(style);
CREATE INDEX idx_wines_acidity ON public.wines(acidity);
CREATE INDEX idx_wines_featured ON public.wines(is_featured);

-- Create trigger for updated_at
CREATE TRIGGER update_wines_updated_at
BEFORE UPDATE ON public.wines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();