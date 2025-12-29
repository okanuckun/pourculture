-- SEO Global Settings table
CREATE TABLE public.seo_global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_template text NOT NULL DEFAULT '{PageTitle} | PourCulture',
  description_template text,
  default_og_image text,
  default_robots_meta text NOT NULL DEFAULT 'index, follow',
  robots_txt_content text NOT NULL DEFAULT 'User-agent: *
Allow: /
Disallow: /admin/
Disallow: /auth

Sitemap: https://pourculture.com/sitemap.xml',
  sitemap_include_rules jsonb NOT NULL DEFAULT '{"home": true, "venues": true, "winemakers": true, "events": true, "news": true, "guides": true}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- SEO Page Settings table
CREATE TABLE public.seo_page_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL UNIQUE,
  page_type text NOT NULL DEFAULT 'page',
  meta_title text,
  meta_description text,
  meta_keywords text,
  focus_keyword text,
  secondary_keywords text[],
  robots_meta text NOT NULL DEFAULT 'index, follow',
  canonical_mode text NOT NULL DEFAULT 'auto',
  canonical_url text,
  include_in_sitemap boolean NOT NULL DEFAULT true,
  og_title text,
  og_description text,
  og_image text,
  twitter_card_type text DEFAULT 'summary_large_image',
  twitter_image text,
  schema_data jsonb DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  last_crawled_at timestamptz,
  status_code integer DEFAULT 200,
  h1_text text,
  word_count integer DEFAULT 0,
  seo_score integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- SEO Redirects table
CREATE TABLE public.seo_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path text NOT NULL UNIQUE,
  target_path text NOT NULL,
  redirect_type integer NOT NULL DEFAULT 301,
  is_active boolean NOT NULL DEFAULT true,
  hit_count integer NOT NULL DEFAULT 0,
  last_hit_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- SEO Change Log table
CREATE TABLE public.seo_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  change_type text NOT NULL,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  changed_by uuid NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  is_reverted boolean NOT NULL DEFAULT false,
  reverted_at timestamptz,
  reverted_by uuid
);

-- SEO Audit Issues table
CREATE TABLE public.seo_audit_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  issue_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  description text NOT NULL,
  suggestion text,
  is_resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_audit_issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seo_global_settings
CREATE POLICY "Admins can manage global SEO settings"
ON public.seo_global_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Global SEO settings readable by all"
ON public.seo_global_settings FOR SELECT
USING (true);

-- RLS Policies for seo_page_settings
CREATE POLICY "Admins can manage page SEO settings"
ON public.seo_page_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Page SEO settings readable by all"
ON public.seo_page_settings FOR SELECT
USING (true);

-- RLS Policies for seo_redirects
CREATE POLICY "Admins can manage redirects"
ON public.seo_redirects FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Redirects readable by all"
ON public.seo_redirects FOR SELECT
USING (true);

-- RLS Policies for seo_change_log
CREATE POLICY "Admins can manage change log"
ON public.seo_change_log FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view change log"
ON public.seo_change_log FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for seo_audit_issues
CREATE POLICY "Admins can manage audit issues"
ON public.seo_audit_issues FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view audit issues"
ON public.seo_audit_issues FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_seo_page_settings_path ON public.seo_page_settings(page_path);
CREATE INDEX idx_seo_page_settings_type ON public.seo_page_settings(page_type);
CREATE INDEX idx_seo_redirects_source ON public.seo_redirects(source_path);
CREATE INDEX idx_seo_change_log_path ON public.seo_change_log(page_path);
CREATE INDEX idx_seo_change_log_date ON public.seo_change_log(changed_at DESC);
CREATE INDEX idx_seo_audit_issues_path ON public.seo_audit_issues(page_path);
CREATE INDEX idx_seo_audit_issues_severity ON public.seo_audit_issues(severity);

-- Trigger for updated_at
CREATE TRIGGER update_seo_global_settings_updated_at
BEFORE UPDATE ON public.seo_global_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_page_settings_updated_at
BEFORE UPDATE ON public.seo_page_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_redirects_updated_at
BEFORE UPDATE ON public.seo_redirects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_audit_issues_updated_at
BEFORE UPDATE ON public.seo_audit_issues
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default global settings
INSERT INTO public.seo_global_settings (id) VALUES (gen_random_uuid());