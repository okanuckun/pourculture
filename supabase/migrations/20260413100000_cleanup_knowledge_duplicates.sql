-- Remove duplicate glossary terms (keep the one with longer definition)
DELETE FROM public.glossary_terms a
USING public.glossary_terms b
WHERE a.id > b.id
  AND a.term = b.term;

-- Remove duplicate guides (keep newest)
DELETE FROM public.guides a
USING public.guides b
WHERE a.id > b.id
  AND a.title = b.title;

-- Remove duplicate harvest reports (keep newest)
DELETE FROM public.harvest_reports a
USING public.harvest_reports b
WHERE a.id > b.id
  AND a.year = b.year
  AND a.region = b.region;

-- Remove duplicate PDF resources (keep newest)
DELETE FROM public.pdf_resources a
USING public.pdf_resources b
WHERE a.id > b.id
  AND a.title = b.title;

-- Add unique constraints to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_glossary_terms_unique ON public.glossary_terms(term);
CREATE UNIQUE INDEX IF NOT EXISTS idx_guides_unique ON public.guides(title);
CREATE UNIQUE INDEX IF NOT EXISTS idx_harvest_reports_unique ON public.harvest_reports(year, region);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pdf_resources_unique ON public.pdf_resources(title);
