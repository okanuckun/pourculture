import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeocodeResult {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

// Geocode an address using Mapbox API
async function geocodeAddress(
  address: string,
  mapboxToken: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&limit=1`
    );
    
    if (!response.ok) {
      console.error(`Geocoding failed for "${address}": ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    
    return null;
  } catch (error) {
    console.error(`Geocoding error for "${address}":`, error);
    return null;
  }
}

// Add delay to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mapboxToken = Deno.env.get("MAPBOX_PUBLIC_TOKEN");
    if (!mapboxToken) {
      throw new Error("MAPBOX_PUBLIC_TOKEN not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: {
      venues: GeocodeResult[];
      winemakers: GeocodeResult[];
      wineFairs: GeocodeResult[];
      errors: string[];
    } = {
      venues: [],
      winemakers: [],
      wineFairs: [],
      errors: [],
    };

    // 1. Geocode venues without coordinates
    const { data: venues, error: venuesError } = await supabase
      .from("venues")
      .select("id, name, address, city, country")
      .is("latitude", null);

    if (venuesError) {
      results.errors.push(`Venues fetch error: ${venuesError.message}`);
    } else if (venues && venues.length > 0) {
      console.log(`Found ${venues.length} venues to geocode`);
      
      for (const venue of venues) {
        const fullAddress = `${venue.address}, ${venue.city}, ${venue.country}`;
        const coords = await geocodeAddress(fullAddress, mapboxToken);
        
        if (coords) {
          const { error: updateError } = await supabase
            .from("venues")
            .update({ latitude: coords.lat, longitude: coords.lng })
            .eq("id", venue.id);
          
          if (updateError) {
            results.errors.push(`Venue update error (${venue.name}): ${updateError.message}`);
          } else {
            results.venues.push({
              id: venue.id,
              name: venue.name,
              latitude: coords.lat,
              longitude: coords.lng,
            });
            console.log(`Geocoded venue: ${venue.name} -> ${coords.lat}, ${coords.lng}`);
          }
        } else {
          results.errors.push(`Could not geocode venue: ${venue.name} (${fullAddress})`);
        }
        
        // Delay to avoid rate limiting (600 requests/minute for Mapbox)
        await delay(150);
      }
    }

    // 2. Geocode winemakers without coordinates
    const { data: winemakers, error: winemakersError } = await supabase
      .from("winemakers")
      .select("id, name, region, country")
      .is("latitude", null);

    if (winemakersError) {
      results.errors.push(`Winemakers fetch error: ${winemakersError.message}`);
    } else if (winemakers && winemakers.length > 0) {
      console.log(`Found ${winemakers.length} winemakers to geocode`);
      
      for (const winemaker of winemakers) {
        // For winemakers, use region + country as address
        const address = winemaker.region 
          ? `${winemaker.region}, ${winemaker.country}`
          : winemaker.country;
        const coords = await geocodeAddress(address, mapboxToken);
        
        if (coords) {
          const { error: updateError } = await supabase
            .from("winemakers")
            .update({ latitude: coords.lat, longitude: coords.lng })
            .eq("id", winemaker.id);
          
          if (updateError) {
            results.errors.push(`Winemaker update error (${winemaker.name}): ${updateError.message}`);
          } else {
            results.winemakers.push({
              id: winemaker.id,
              name: winemaker.name,
              latitude: coords.lat,
              longitude: coords.lng,
            });
            console.log(`Geocoded winemaker: ${winemaker.name} -> ${coords.lat}, ${coords.lng}`);
          }
        } else {
          results.errors.push(`Could not geocode winemaker: ${winemaker.name} (${address})`);
        }
        
        await delay(150);
      }
    }

    // 3. Geocode wine fairs without coordinates
    const { data: wineFairs, error: wineFairsError } = await supabase
      .from("wine_fairs")
      .select("id, title, venue_name, city, country")
      .is("latitude", null);

    if (wineFairsError) {
      results.errors.push(`Wine fairs fetch error: ${wineFairsError.message}`);
    } else if (wineFairs && wineFairs.length > 0) {
      console.log(`Found ${wineFairs.length} wine fairs to geocode`);
      
      for (const fair of wineFairs) {
        const address = fair.venue_name 
          ? `${fair.venue_name}, ${fair.city}, ${fair.country}`
          : `${fair.city}, ${fair.country}`;
        const coords = await geocodeAddress(address, mapboxToken);
        
        if (coords) {
          const { error: updateError } = await supabase
            .from("wine_fairs")
            .update({ latitude: coords.lat, longitude: coords.lng })
            .eq("id", fair.id);
          
          if (updateError) {
            results.errors.push(`Wine fair update error (${fair.title}): ${updateError.message}`);
          } else {
            results.wineFairs.push({
              id: fair.id,
              name: fair.title,
              latitude: coords.lat,
              longitude: coords.lng,
            });
            console.log(`Geocoded wine fair: ${fair.title} -> ${coords.lat}, ${coords.lng}`);
          }
        } else {
          results.errors.push(`Could not geocode wine fair: ${fair.title} (${address})`);
        }
        
        await delay(150);
      }
    }

    const summary = {
      success: true,
      geocoded: {
        venues: results.venues.length,
        winemakers: results.winemakers.length,
        wineFairs: results.wineFairs.length,
        total: results.venues.length + results.winemakers.length + results.wineFairs.length,
      },
      details: results,
    };

    console.log("Geocoding complete:", summary.geocoded);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Geocoding error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
