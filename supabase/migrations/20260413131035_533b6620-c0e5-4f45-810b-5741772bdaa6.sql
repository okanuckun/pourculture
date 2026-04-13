
-- Add user_notes column to wine_scan_history
ALTER TABLE public.wine_scan_history ADD COLUMN user_notes text DEFAULT NULL;

-- Allow anyone to view scan history (for profile visitors)
CREATE POLICY "Anyone can view scan history"
ON public.wine_scan_history
FOR SELECT
USING (true);

-- Drop the old owner-only select policy
DROP POLICY IF EXISTS "Users can view their own scan history" ON public.wine_scan_history;
