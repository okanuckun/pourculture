-- Create venue categories enum
CREATE TYPE public.venue_category AS ENUM ('restaurant', 'bar', 'wine_shop', 'accommodation', 'winemaker');

-- Create venues table for restaurants, bars, wine shops, accommodations
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category venue_category NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  website TEXT,
  email TEXT,
  image_url TEXT,
  opening_hours JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_open BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create winemakers table
CREATE TABLE public.winemakers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain_name TEXT,
  bio TEXT,
  region TEXT,
  country TEXT NOT NULL,
  image_url TEXT,
  website TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wine fairs/events table (extending events concept)
CREATE TABLE public.wine_fairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  poster_url TEXT,
  price TEXT,
  ticket_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  venue_name TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_pro_only BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news/blog table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create countries table for explore section
CREATE TABLE public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  flag_emoji TEXT,
  venue_count INTEGER DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winemakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_fairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Venues RLS policies
CREATE POLICY "Venues are viewable by everyone" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert venues" ON public.venues FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own venues" ON public.venues FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own venues" ON public.venues FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all venues" ON public.venues FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Winemakers RLS policies
CREATE POLICY "Winemakers are viewable by everyone" ON public.winemakers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert winemakers" ON public.winemakers FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own winemakers" ON public.winemakers FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own winemakers" ON public.winemakers FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all winemakers" ON public.winemakers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Wine fairs RLS policies
CREATE POLICY "Wine fairs are viewable by everyone" ON public.wine_fairs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert wine fairs" ON public.wine_fairs FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own wine fairs" ON public.wine_fairs FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own wine fairs" ON public.wine_fairs FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all wine fairs" ON public.wine_fairs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- News RLS policies
CREATE POLICY "Published news are viewable by everyone" ON public.news FOR SELECT USING (is_published = true OR auth.uid() = created_by);
CREATE POLICY "Authenticated users can insert news" ON public.news FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own news" ON public.news FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own news" ON public.news FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all news" ON public.news FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Countries RLS policies
CREATE POLICY "Countries are viewable by everyone" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Admins can manage countries" ON public.countries FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at triggers
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_winemakers_updated_at BEFORE UPDATE ON public.winemakers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wine_fairs_updated_at BEFORE UPDATE ON public.wine_fairs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_venues_category ON public.venues(category);
CREATE INDEX idx_venues_country ON public.venues(country);
CREATE INDEX idx_venues_city ON public.venues(city);
CREATE INDEX idx_venues_is_featured ON public.venues(is_featured);
CREATE INDEX idx_venues_location ON public.venues(latitude, longitude);

CREATE INDEX idx_winemakers_country ON public.winemakers(country);
CREATE INDEX idx_winemakers_is_featured ON public.winemakers(is_featured);

CREATE INDEX idx_wine_fairs_start_date ON public.wine_fairs(start_date);
CREATE INDEX idx_wine_fairs_country ON public.wine_fairs(country);

CREATE INDEX idx_news_published_at ON public.news(published_at);
CREATE INDEX idx_news_is_published ON public.news(is_published);

-- Insert initial countries
INSERT INTO public.countries (name, slug, flag_emoji, venue_count) VALUES
  ('France', 'france', '🇫🇷', 0),
  ('Italy', 'italy', '🇮🇹', 0),
  ('United States', 'united-states', '🇺🇸', 0),
  ('Spain', 'spain', '🇪🇸', 0),
  ('Belgium', 'belgium', '🇧🇪', 0),
  ('Japan', 'japan', '🇯🇵', 0),
  ('United Kingdom', 'united-kingdom', '🇬🇧', 0),
  ('Germany', 'germany', '🇩🇪', 0),
  ('Turkey', 'turkey', '🇹🇷', 0),
  ('Portugal', 'portugal', '🇵🇹', 0);