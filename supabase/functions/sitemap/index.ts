import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

const SITE_URL = 'https://pourculture.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating sitemap...');

    // Fetch global settings for sitemap rules
    const { data: globalSettings } = await supabase
      .from('seo_global_settings')
      .select('sitemap_include_rules')
      .single();

    const includeRules = globalSettings?.sitemap_include_rules || {
      home: true,
      news: true,
      events: true,
      guides: true,
      venues: true,
      winemakers: true
    };

    // Fetch page settings to check which pages should be in sitemap
    const { data: pageSettings } = await supabase
      .from('seo_page_settings')
      .select('page_path, include_in_sitemap, robots_meta, updated_at')
      .eq('include_in_sitemap', true);

    const pageSettingsMap = new Map(
      pageSettings?.map(p => [p.page_path, p]) || []
    );

    const urls: string[] = [];
    const now = new Date().toISOString().split('T')[0];

    // Static pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/discover', priority: '0.9', changefreq: 'daily' },
      { path: '/news', priority: '0.8', changefreq: 'daily' },
      { path: '/about/natural-wine', priority: '0.7', changefreq: 'monthly' },
      { path: '/wine-routes', priority: '0.8', changefreq: 'weekly' },
      { path: '/knowledge', priority: '0.7', changefreq: 'weekly' },
      { path: '/forum', priority: '0.6', changefreq: 'daily' },
    ];

    for (const page of staticPages) {
      const settings = pageSettingsMap.get(page.path);
      if (settings?.robots_meta?.includes('noindex')) continue;
      
      urls.push(`
  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${settings?.updated_at?.split('T')[0] || now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    }

    // Venues
    if (includeRules.venues) {
      const { data: venues } = await supabase
        .from('venues')
        .select('slug, updated_at')
        .limit(10000);

      for (const venue of venues || []) {
        const path = `/venue/${venue.slug}`;
        const settings = pageSettingsMap.get(path);
        if (settings?.robots_meta?.includes('noindex')) continue;

        urls.push(`
  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${venue.updated_at?.split('T')[0] || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    }

    // Winemakers
    if (includeRules.winemakers) {
      const { data: winemakers } = await supabase
        .from('winemakers')
        .select('slug, updated_at')
        .limit(10000);

      for (const winemaker of winemakers || []) {
        const path = `/winemaker/${winemaker.slug}`;
        const settings = pageSettingsMap.get(path);
        if (settings?.robots_meta?.includes('noindex')) continue;

        urls.push(`
  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${winemaker.updated_at?.split('T')[0] || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    }

    // Wine Fairs/Events
    if (includeRules.events) {
      const { data: wineFairs } = await supabase
        .from('wine_fairs')
        .select('slug, updated_at')
        .limit(10000);

      for (const fair of wineFairs || []) {
        const path = `/wine-fair/${fair.slug}`;
        const settings = pageSettingsMap.get(path);
        if (settings?.robots_meta?.includes('noindex')) continue;

        urls.push(`
  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${fair.updated_at?.split('T')[0] || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
      }
    }

    // News
    if (includeRules.news) {
      const { data: news } = await supabase
        .from('news')
        .select('slug, updated_at')
        .eq('is_published', true)
        .limit(10000);

      for (const article of news || []) {
        const path = `/news/${article.slug}`;
        const settings = pageSettingsMap.get(path);
        if (settings?.robots_meta?.includes('noindex')) continue;

        urls.push(`
  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${article.updated_at?.split('T')[0] || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
      }
    }

    // Guides
    if (includeRules.guides) {
      const { data: guides } = await supabase
        .from('guides')
        .select('id, updated_at')
        .eq('is_published', true)
        .limit(10000);

      for (const guide of guides || []) {
        const path = `/guide/${guide.id}`;
        const settings = pageSettingsMap.get(path);
        if (settings?.robots_meta?.includes('noindex')) continue;

        urls.push(`
  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${guide.updated_at?.split('T')[0] || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
      }
    }

    // Wine Routes
    const { data: wineRoutes } = await supabase
      .from('wine_routes')
      .select('slug, updated_at')
      .eq('is_published', true)
      .limit(10000);

    for (const route of wineRoutes || []) {
      const path = `/wine-routes/${route.slug}`;
      const settings = pageSettingsMap.get(path);
      if (settings?.robots_meta?.includes('noindex')) continue;

      urls.push(`
  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${route.updated_at?.split('T')[0] || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">${urls.join('')}
</urlset>`;

    console.log(`Sitemap generated with ${urls.length} URLs`);

    return new Response(sitemap, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
  </url>
</urlset>`, {
      headers: corsHeaders,
    });
  }
});
