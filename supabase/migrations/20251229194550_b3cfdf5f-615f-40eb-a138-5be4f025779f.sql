-- Create wine_routes table for storing wine routes
CREATE TABLE public.wine_routes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  region text NOT NULL,
  country text NOT NULL,
  image_url text,
  venue_ids uuid[] DEFAULT '{}'::uuid[],
  venue_count integer DEFAULT 0,
  difficulty text DEFAULT 'moderate',
  estimated_days integer DEFAULT 1,
  is_curated boolean DEFAULT false,
  curator_id uuid,
  curator_name text,
  curator_title text,
  slug text NOT NULL UNIQUE,
  is_published boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_route_progress table for tracking user progress
CREATE TABLE public.user_route_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  route_id uuid NOT NULL REFERENCES public.wine_routes(id) ON DELETE CASCADE,
  visited_venue_ids uuid[] DEFAULT '{}'::uuid[],
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, route_id)
);

-- Create user_route_wishlist table for wishlisted routes
CREATE TABLE public.user_route_wishlist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  route_id uuid NOT NULL REFERENCES public.wine_routes(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, route_id)
);

-- Enable RLS
ALTER TABLE public.wine_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_route_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_route_wishlist ENABLE ROW LEVEL SECURITY;

-- Wine routes policies
CREATE POLICY "Wine routes are viewable by everyone" 
ON public.wine_routes FOR SELECT 
USING (is_published = true);

CREATE POLICY "Authenticated users can create routes" 
ON public.wine_routes FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own routes" 
ON public.wine_routes FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own routes" 
ON public.wine_routes FOR DELETE 
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all routes" 
ON public.wine_routes FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- User route progress policies
CREATE POLICY "Users can view their own progress" 
ON public.user_route_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" 
ON public.user_route_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_route_progress FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" 
ON public.user_route_progress FOR DELETE 
USING (auth.uid() = user_id);

-- User route wishlist policies
CREATE POLICY "Users can view their own wishlist" 
ON public.user_route_wishlist FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their wishlist" 
ON public.user_route_wishlist FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their wishlist" 
ON public.user_route_wishlist FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_wine_routes_updated_at
BEFORE UPDATE ON public.wine_routes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_route_progress_updated_at
BEFORE UPDATE ON public.user_route_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();