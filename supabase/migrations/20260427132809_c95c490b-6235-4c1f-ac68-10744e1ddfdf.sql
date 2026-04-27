DROP POLICY IF EXISTS "Anyone can view scan history" ON public.wine_scan_history;

CREATE POLICY "Users see own scans + others' favorited"
  ON public.wine_scan_history
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_favorite = true
  );