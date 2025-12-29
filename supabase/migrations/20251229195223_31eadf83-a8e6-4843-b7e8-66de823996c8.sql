-- Add curator/verified status to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_verified boolean DEFAULT false,
ADD COLUMN bio text,
ADD COLUMN avatar_url text,
ADD COLUMN location text,
ADD COLUMN website text,
ADD COLUMN instagram text,
ADD COLUMN twitter text;

-- Create policy for admins to verify users
CREATE POLICY "Admins can update any profile verification" 
ON public.profiles FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update wine_routes to require verified user
DROP POLICY IF EXISTS "Authenticated users can create routes" ON public.wine_routes;

CREATE POLICY "Verified users can create routes" 
ON public.wine_routes FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_verified = true
  )
);

-- Add curator_user_id to link to profile
ALTER TABLE public.wine_routes
ADD COLUMN curator_user_id uuid REFERENCES public.profiles(user_id);