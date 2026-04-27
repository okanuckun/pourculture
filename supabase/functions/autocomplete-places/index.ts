import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input } = await req.json();

    if (!input || typeof input !== 'string' || input.trim().length < 2) {
      return new Response(
        JSON.stringify({ predictions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FOURSQUARE_API_KEY');
    if (!apiKey) {
      console.error('FOURSQUARE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL('https://api.foursquare.com/v3/autocomplete');
    url.searchParams.set('query', input.trim());
    // We only care about places (not addresses, geographies, or queries).
    url.searchParams.set('types', 'place');
    url.searchParams.set('limit', '10');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey,
        Accept: 'application/json',
      },
    });

    const rawText = await response.text();
    let data: any = {};
    try { data = JSON.parse(rawText); } catch { /* keep raw */ }

    if (!response.ok) {
      console.error('Foursquare autocomplete error:', response.status, rawText);
      // TEMP debug: surface the upstream error to the caller so we can
      // diagnose auth/endpoint issues. Revert once verified.
      return new Response(
        JSON.stringify({
          predictions: [],
          _debug: {
            status: response.status,
            url: url.toString(),
            keyLen: apiKey.length,
            keyHead: apiKey.slice(0, 4),
            body: rawText.slice(0, 500),
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: any[] = Array.isArray(data?.results) ? data.results : [];

    const predictions = results
      .map((r) => {
        const fsqId = r?.place?.fsq_place_id ?? r?.place?.fsq_id;
        const mainText = r?.text?.primary ?? r?.place?.name ?? '';
        const secondaryText = r?.text?.secondary ?? '';
        const description = [mainText, secondaryText].filter(Boolean).join(' — ');
        if (!fsqId || !mainText) return null;
        return {
          placeId: fsqId,
          description,
          mainText,
          secondaryText,
        };
      })
      .filter((p): p is { placeId: string; description: string; mainText: string; secondaryText: string } => p !== null);

    return new Response(
      JSON.stringify({
        predictions,
        _debug: {
          v: 'fsq-debug-2',
          status: response.status,
          url: url.toString(),
          keyLen: apiKey.length,
          keyHead: apiKey.slice(0, 4),
          rawSample: rawText.slice(0, 400),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in autocomplete-places (Foursquare):', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
