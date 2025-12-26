-- Create storage bucket for knowledge hub PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge-hub', 'knowledge-hub', true);

-- Storage policies for knowledge-hub bucket
CREATE POLICY "Knowledge hub files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'knowledge-hub');

CREATE POLICY "Admins can upload knowledge hub files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'knowledge-hub' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update knowledge hub files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'knowledge-hub' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete knowledge hub files"
ON storage.objects FOR DELETE
USING (bucket_id = 'knowledge-hub' AND has_role(auth.uid(), 'admin'::app_role));

-- Glossary terms table
CREATE TABLE public.glossary_terms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Glossary terms are viewable by everyone"
ON public.glossary_terms FOR SELECT
USING (true);

CREATE POLICY "Admins can manage glossary terms"
ON public.glossary_terms FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Guides table
CREATE TABLE public.guides (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    read_time TEXT NOT NULL DEFAULT '5 min read',
    category TEXT NOT NULL DEFAULT 'Beginner',
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published guides are viewable by everyone"
ON public.guides FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage guides"
ON public.guides FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- PDF resources table
CREATE TABLE public.pdf_resources (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    file_url TEXT,
    pages INTEGER DEFAULT 0,
    file_size TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pdf_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published PDF resources are viewable by everyone"
ON public.pdf_resources FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage PDF resources"
ON public.pdf_resources FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Harvest reports table
CREATE TABLE public.harvest_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL,
    region TEXT NOT NULL,
    summary TEXT NOT NULL,
    highlights TEXT[] DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.harvest_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published harvest reports are viewable by everyone"
ON public.harvest_reports FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage harvest reports"
ON public.harvest_reports FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_glossary_terms_updated_at
    BEFORE UPDATE ON public.glossary_terms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guides_updated_at
    BEFORE UPDATE ON public.guides
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pdf_resources_updated_at
    BEFORE UPDATE ON public.pdf_resources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_harvest_reports_updated_at
    BEFORE UPDATE ON public.harvest_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();