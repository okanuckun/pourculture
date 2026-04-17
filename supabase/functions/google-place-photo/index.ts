import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const photoReference = url.searchParams.get('photoReference');
    const maxWidthRaw = url.searchParams.get('maxWidth') ?? '800';
    const maxWidth = Math.min(Math.max(parseInt(maxWidthRaw, 10) || 800, 80), 1600);

    if (!photoReference) {
      return new Response(
        JSON.stringify({ error: 'photoReference is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_PLACES_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const googleUrl = new URL('https://maps.googleapis.com/maps/api/place/photo');
    googleUrl.searchParams.set('photo_reference', photoReference);
    googleUrl.searchParams.set('maxwidth', String(maxWidth));
    googleUrl.searchParams.set('key', apiKey);

    // Google returns a 302 redirect to the actual image. Follow it and proxy the binary.
    const response = await fetch(googleUrl.toString(), { redirect: 'follow' });

    if (!response.ok || !response.body) {
      console.error('Google photo fetch failed:', response.status);
      return new Response(
        JSON.stringify({ error: `Google photo fetch failed: ${response.status}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentType = response.headers.get('content-type') ?? 'image/jpeg';

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        // Cache aggressively at the edge — photo references are stable.
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
      },
    });
  } catch (error) {
    console.error('Error in google-place-photo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
