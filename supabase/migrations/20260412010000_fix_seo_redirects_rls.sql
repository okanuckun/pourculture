-- seo_redirects should not be publicly readable — admin only
DROP POLICY IF EXISTS "Redirects readable by all" ON public.seo_redirects;

CREATE POLICY "Redirects readable by admins"
ON public.seo_redirects FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
