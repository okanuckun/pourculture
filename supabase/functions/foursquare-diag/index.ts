import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Diagnostic-only edge function. Tries every plausible Foursquare endpoint
// + auth combination and reports which one accepts the configured key.
// Delete this file once we know which variant works.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Variant {
  label: string;
  url: string;
  headers: Record<string, string>;
}

async function tryVariant(v: Variant) {
  try {
    const res = await fetch(v.url, { headers: v.headers });
    const text = await res.text();
    return {
      label: v.label,
      url: v.url,
      authHeader: v.headers.Authorization,
      hasVersion: 'X-Places-Api-Version' in v.headers,
      status: res.status,
      ok: res.ok,
      body: text.slice(0, 300),
    };
  } catch (err) {
    return {
      label: v.label,
      url: v.url,
      authHeader: v.headers.Authorization,
      hasVersion: 'X-Places-Api-Version' in v.headers,
      status: 0,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('FOURSQUARE_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'FOURSQUARE_API_KEY missing' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const VERSION = '2025-06-17';
  const QUERY = 'Le Verre Vole';
  const ACCEPT = 'application/json';

  // Build a matrix of (host × auth-style × version-header).
  const variants: Variant[] = [
    // OLD HOST + variants
    {
      label: 'old-host raw-key no-version',
      url: `https://api.foursquare.com/v3/autocomplete?query=${encodeURIComponent(QUERY)}&types=place&limit=3`,
      headers: { Authorization: apiKey, Accept: ACCEPT },
    },
    {
      label: 'old-host bearer no-version',
      url: `https://api.foursquare.com/v3/autocomplete?query=${encodeURIComponent(QUERY)}&types=place&limit=3`,
      headers: { Authorization: `Bearer ${apiKey}`, Accept: ACCEPT },
    },
    {
      label: 'old-host raw-key with-version',
      url: `https://api.foursquare.com/v3/autocomplete?query=${encodeURIComponent(QUERY)}&types=place&limit=3`,
      headers: { Authorization: apiKey, Accept: ACCEPT, 'X-Places-Api-Version': VERSION },
    },
    {
      label: 'old-host bearer with-version',
      url: `https://api.foursquare.com/v3/autocomplete?query=${encodeURIComponent(QUERY)}&types=place&limit=3`,
      headers: { Authorization: `Bearer ${apiKey}`, Accept: ACCEPT, 'X-Places-Api-Version': VERSION },
    },
    // NEW HOST /autocomplete
    {
      label: 'new-host /autocomplete bearer with-version',
      url: `https://places-api.foursquare.com/autocomplete?query=${encodeURIComponent(QUERY)}&types=place&limit=3`,
      headers: { Authorization: `Bearer ${apiKey}`, Accept: ACCEPT, 'X-Places-Api-Version': VERSION },
    },
    {
      label: 'new-host /autocomplete raw-key with-version',
      url: `https://places-api.foursquare.com/autocomplete?query=${encodeURIComponent(QUERY)}&types=place&limit=3`,
      headers: { Authorization: apiKey, Accept: ACCEPT, 'X-Places-Api-Version': VERSION },
    },
    // NEW HOST /places/search (sanity check that the host accepts requests at all)
    {
      label: 'new-host /places/search bearer with-version',
      url: `https://places-api.foursquare.com/places/search?query=${encodeURIComponent(QUERY)}&limit=3`,
      headers: { Authorization: `Bearer ${apiKey}`, Accept: ACCEPT, 'X-Places-Api-Version': VERSION },
    },
    {
      label: 'new-host /places/search raw-key with-version',
      url: `https://places-api.foursquare.com/places/search?query=${encodeURIComponent(QUERY)}&limit=3`,
      headers: { Authorization: apiKey, Accept: ACCEPT, 'X-Places-Api-Version': VERSION },
    },
  ];

  const results = await Promise.all(variants.map(tryVariant));
  const winner = results.find((r) => r.ok);

  return new Response(
    JSON.stringify({
      keyLen: apiKey.length,
      keyHead: apiKey.slice(0, 4),
      winner: winner?.label ?? null,
      results,
    }, null, 2),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
