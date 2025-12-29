import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  schemaData?: object[];
  noindex?: boolean;
}

interface PageSEOSettings {
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_card_type: string | null;
  twitter_image: string | null;
  robots_meta: string;
  canonical_url: string | null;
  canonical_mode: string;
  schema_data: object[] | null;
  h1_text: string | null;
}

interface GlobalSEOSettings {
  title_template: string;
  description_template: string | null;
  default_og_image: string | null;
  default_robots_meta: string;
}

export const SEOHead = ({ 
  title, 
  description, 
  keywords = 'natural wine, wine bars, wine shops, winemakers, wine events',
  image = '/placeholder.svg',
  url,
  schemaData,
  noindex = false
}: SEOHeadProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  // Fetch page-specific SEO settings
  const { data: pageSettings } = useQuery({
    queryKey: ['seo-page-settings', currentPath],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_page_settings')
        .select('*')
        .eq('page_path', currentPath)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching page SEO settings:', error);
        return null;
      }
      return data as PageSEOSettings | null;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch global SEO settings
  const { data: globalSettings } = useQuery({
    queryKey: ['seo-global-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_global_settings')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching global SEO settings:', error);
        return null;
      }
      return data as GlobalSEOSettings | null;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Determine final values (page settings > props > global defaults)
  const titleTemplate = globalSettings?.title_template || '{PageTitle} | PourCulture';
  const finalTitle = pageSettings?.meta_title || title;
  const fullTitle = titleTemplate.replace('{PageTitle}', finalTitle);
  
  const finalDescription = pageSettings?.meta_description || description || globalSettings?.description_template || '';
  const finalKeywords = pageSettings?.meta_keywords || keywords;
  const finalImage = pageSettings?.og_image || image || globalSettings?.default_og_image || '/placeholder.svg';
  
  // Robots meta
  const robotsMeta = noindex ? 'noindex, nofollow' : (pageSettings?.robots_meta || globalSettings?.default_robots_meta || 'index, follow');
  
  // Canonical URL
  const finalCanonical = pageSettings?.canonical_mode === 'manual' && pageSettings?.canonical_url 
    ? pageSettings.canonical_url 
    : currentUrl;

  // OG tags
  const ogTitle = pageSettings?.og_title || fullTitle;
  const ogDescription = pageSettings?.og_description || finalDescription;
  const ogImage = pageSettings?.og_image || finalImage;

  // Twitter tags
  const twitterCardType = pageSettings?.twitter_card_type || 'summary_large_image';
  const twitterImage = pageSettings?.twitter_image || ogImage;

  // Schema data
  const finalSchemaData = pageSettings?.schema_data || schemaData || [];
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={finalDescription} />
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={robotsMeta} />
      <link rel="canonical" href={finalCanonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="PourCulture" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCardType} />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={twitterImage} />

      {/* hreflang for future multi-language support */}
      <link rel="alternate" hrefLang="en" href={currentUrl} />
      <link rel="alternate" hrefLang="x-default" href={currentUrl} />
      
      {/* Schema.org JSON-LD */}
      {finalSchemaData && finalSchemaData.length > 0 && finalSchemaData.map((schema, index) => (
        <script 
          key={index} 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Helmet>
  );
};
