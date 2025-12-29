-- Update Admin.tsx to use has_role function instead of direct query
-- The issue is RLS policy blocking direct table query
-- We'll use a more reliable approach by calling the has_role function via RPC

-- First, let's create an RPC function that can be called from the client
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
  )
$$;