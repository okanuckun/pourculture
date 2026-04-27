// Auto-imports venues returned by `search-wine-places` into the public.venues
// table. Designed to be called silently after a user clicks "Search this area"
// on the map. Only inserts wine_bar / wine_shop / winery (no restaurants), and
// skips any place we already have via google_place_id (we re-use that column
// for Foursquare ids with a `fsq_` prefix).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AllowedCategory = 'wine_bar' | 'wine_shop' | 'winery';
const ALLOWED: AllowedCategory[] = ['wine_bar', 'wine_shop', 'winery'];

interface IncomingPlace {
  placeId: string;            // raw Foursquare fsq_place_id
  name: string;
  lat: number;
  lng: number;
  address?: string;
  category: string;
  website?: string;
  phone?: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'venue';
}

// Best-effort city/country extraction from "..., City, Country" strings.
// Foursquare's `formatted_address` reliably ends with country and usually has
// city as the second-to-last comma-separated segment.
function parseCityCountry(address?: string): { city: string; country: string } {
  if (!address) return { city: 'Unknown', country: 'Unknown' };
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return { city: 'Unknown', country: parts[0] || 'Unknown' };
  const country = parts[parts.length - 1];
  // City segment may include a postcode (e.g. "75002 Paris"); strip leading digits.
  const cityRaw = parts[parts.length - 2];
  const city = cityRaw.replace(/^\d+\s*/, '');
  return { city: city || 'Unknown', country };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { places } = (await req.json()) as { places?: IncomingPlace[] };
    if (!Array.isArray(places) || places.length === 0) {
      return new Response(
        JSON.stringify({ inserted: 0, skipped: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: 'Server not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    // Filter to allowed categories + valid coords + non-empty name.
    const candidates = places.filter((p) =>
      p && p.placeId && p.name && Number.isFinite(p.lat) && Number.isFinite(p.lng)
      && ALLOWED.includes(p.category as AllowedCategory)
    );

    if (candidates.length === 0) {
      return new Response(
        JSON.stringify({ inserted: 0, skipped: places.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ids = candidates.map((p) => `fsq_${p.placeId}`);
    const { data: existing, error: existingErr } = await supabase
      .from('venues')
      .select('google_place_id')
      .in('google_place_id', ids);

    if (existingErr) {
      console.error('Existing lookup error:', existingErr);
      return new Response(
        JSON.stringify({ error: existingErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const existingSet = new Set((existing ?? []).map((r: any) => r.google_place_id));
    const toInsert = candidates.filter((p) => !existingSet.has(`fsq_${p.placeId}`));

    if (toInsert.length === 0) {
      return new Response(
        JSON.stringify({ inserted: 0, skipped: candidates.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build insert rows. Slug must be unique per row in the batch — append a
    // short hash from the fsq id to avoid collisions ("Terra" exists in many
    // cities).
    const rows = toInsert.map((p) => {
      const { city, country } = parseCityCountry(p.address);
      const slugSuffix = p.placeId.slice(-6);
      return {
        name: p.name,
        slug: `${slugify(p.name)}-${slugSuffix}`,
        address: p.address ?? 'Address unavailable',
        city,
        country,
        latitude: p.lat,
        longitude: p.lng,
        category: p.category,
        source: 'foursquare',
        google_place_id: `fsq_${p.placeId}`,
        website: p.website ?? null,
        phone: p.phone ?? null,
      };
    });

    const { data: inserted, error: insertErr } = await supabase
      .from('venues')
      .insert(rows)
      .select('id');

    if (insertErr) {
      console.error('Insert error:', insertErr);
      return new Response(
        JSON.stringify({ error: insertErr.message, attempted: rows.length }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        inserted: inserted?.length ?? 0,
        skipped: candidates.length - (inserted?.length ?? 0),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('auto-import-foursquare-venues error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
