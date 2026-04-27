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

    // Foursquare Service API (post-2025): host = places-api.foursquare.com,
    // Bearer auth + X-Places-Api-Version are mandatory. We don't pass `types`
    // because Service API rejects places-only filtering on autocomplete, and
    // the predictions array is filtered client-side by what we map below.
    const url = new URL('https://places-api.foursquare.com/autocomplete');
    url.searchParams.set('query', input.trim());
    url.searchParams.set('limit', '10');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'X-Places-Api-Version': '2025-06-17',
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Foursquare autocomplete error:', response.status, text);
      return new Response(
        JSON.stringify({ predictions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const results: any[] = Array.isArray(data?.results) ? data.results : [];

    const predictions = results
      .map((r) => {
        // Service API returns autocomplete results with a `type` discriminator
        // ("place" / "address" / etc.) and the place fields nested under
        // `place`. We only emit place-typed results.
        if (r?.type && r.type !== 'place') return null;
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
      JSON.stringify({ predictions }),
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
