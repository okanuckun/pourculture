-- Create featured_people table
CREATE TABLE public.featured_people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'winemaker',
  image_url TEXT,
  instagram TEXT,
  twitter TEXT,
  website TEXT,
  is_featured BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recommended_books table
CREATE TABLE public.recommended_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_url TEXT,
  amazon_link TEXT,
  year INTEGER,
  is_featured BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.featured_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommended_books ENABLE ROW LEVEL SECURITY;

-- RLS policies for featured_people
CREATE POLICY "Featured people are viewable by everyone"
ON public.featured_people FOR SELECT
USING (is_featured = true);

CREATE POLICY "Admins can manage featured people"
ON public.featured_people FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for recommended_books
CREATE POLICY "Recommended books are viewable by everyone"
ON public.recommended_books FOR SELECT
USING (is_featured = true);

CREATE POLICY "Admins can manage recommended books"
ON public.recommended_books FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_featured_people_updated_at
BEFORE UPDATE ON public.featured_people
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recommended_books_updated_at
BEFORE UPDATE ON public.recommended_books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data for featured_people
INSERT INTO public.featured_people (name, title, bio, category, twitter, website, display_order) VALUES
('Alice Feiring', 'Wine Writer & Author', 'Pioneering natural wine journalist and author of "Natural Wine for the People" and "The Dirty Guide to Wine".', 'writer', 'alicefeiring', 'https://www.alicefeiring.com', 1),
('Pascaline Lepeltier', 'Master Sommelier', 'One of the most influential voices in natural wine, Master Sommelier and co-founder of Racines NY.', 'sommelier', NULL, NULL, 2),
('Isabelle Legeron MW', 'Master of Wine', 'Founder of RAW Wine, the world''s leading natural wine fair, and author of "Natural Wine: An Introduction to Organic and Biodynamic Wines".', 'writer', NULL, 'https://www.rawwine.com', 3),
('Frank Cornelissen', 'Winemaker', 'Belgian-born winemaker on Mount Etna, producing some of the most sought-after natural wines in the world.', 'winemaker', NULL, 'https://www.frankcornelissen.it', 4),
('Elisabetta Foradori', 'Winemaker', 'Pioneer of natural winemaking in Trentino, known for her exceptional Teroldego and amphora-aged wines.', 'winemaker', NULL, NULL, 5),
('Eric Texier', 'Winemaker', 'Rhône Valley winemaker and former nuclear physicist, known for his experimental approach to natural winemaking.', 'winemaker', NULL, NULL, 6);

-- Insert initial data for recommended_books
INSERT INTO public.recommended_books (title, author, description, year, display_order) VALUES
('Natural Wine for the People', 'Alice Feiring', 'A comprehensive guide to natural wine, covering what it is, how it''s made, and how to find and enjoy it.', 2019, 1),
('The Dirty Guide to Wine', 'Alice Feiring', 'A sommelier-quality wine guide that focuses on terroir and natural winemaking.', 2017, 2),
('Natural Wine: An Introduction', 'Isabelle Legeron MW', 'The definitive introduction to natural wine by the founder of RAW Wine.', 2014, 3),
('Amber Revolution', 'Simon J. Woolf', 'The story of orange wine and its renaissance, from Georgia to the modern natural wine movement.', 2018, 4),
('Wine Science', 'Jamie Goode', 'A scientific approach to understanding wine, terroir, and the winemaking process.', 2014, 5),
('I Taste Red', 'Jamie Goode', 'Exploring the science of wine tasting and what we really experience when we taste wine.', 2016, 6);