import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/plain',
};

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /auth

Sitemap: https://pourculture.com/sitemap.xml`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching robots.txt content...');

    const { data: globalSettings, error } = await supabase
      .from('seo_global_settings')
      .select('robots_txt_content')
      .single();

    if (error) {
      console.error('Error fetching robots.txt settings:', error);
      return new Response(DEFAULT_ROBOTS, { headers: corsHeaders });
    }

    const robotsContent = globalSettings?.robots_txt_content || DEFAULT_ROBOTS;

    console.log('Returning robots.txt content');

    return new Response(robotsContent, { headers: corsHeaders });
  } catch (error) {
    console.error('Error in robots-txt function:', error);
    return new Response(DEFAULT_ROBOTS, { headers: corsHeaders });
  }
});
