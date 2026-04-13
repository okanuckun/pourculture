-- Track where venues come from
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'admin';

-- Allow authenticated users to insert venues (community contributions)
CREATE POLICY "Authenticated users can create venues"
ON public.venues FOR INSERT TO authenticated
WITH CHECK (true);
