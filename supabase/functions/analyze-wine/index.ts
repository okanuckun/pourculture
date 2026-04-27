import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    // Accept the new front/back shape and the legacy single-image shape so the
    // mobile cache + any older clients keep working without a forced update.
    const frontImageBase64: string | undefined =
      body.frontImageBase64 || body.imageBase64;
    const backImageBase64: string | undefined = body.backImageBase64;

    if (!frontImageBase64) {
      return new Response(
        JSON.stringify({ error: "Front-label image is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const hasBack = !!backImageBase64;

    const systemPrompt = `You are a wine expert and sommelier. The user will send you ${hasBack ? "two photos of the same wine bottle: the FRONT label and the BACK label." : "a photo of a wine bottle's front label."} Analyze the photo${hasBack ? "s" : ""} and provide detailed information about the wine.

${hasBack
  ? `How to use the two photos:
- The FRONT label is your primary identification source — use it for the wine name, producer/winery, region, and any prominent design cues.
- The BACK label is your authoritative source for the technical and regulatory details printed in small text — vintage, alcohol %, importer, official appellation/AOC text, bottling number, sulfite/allergen statements, certifications (organic, biodynamic), and any producer-supplied tasting/production notes.
- When the front and back disagree on a fact (e.g. region wording vs. AOC on the back), TRUST THE BACK LABEL for the technical fact and reflect it in the structured fields.
- If the back label includes producer-written notes, weave them into 'detailedDescription' rather than inventing.`
  : `You only have the front label, which limits accuracy. Be conservative — don't guess vintage, alcohol %, or importer details that you cannot read on the front. Set vintage to "" if the front does not show it.`}

You MUST respond in the following JSON format only (no other text):

{
  "found": true/false,
  "wineName": "Full name of the wine",
  "winery": "Producer/Chateau name",
  "region": "Region (e.g., Bordeaux, Tuscany, Napa Valley)",
  "country": "Country",
  "grapeVariety": "Grape variety/varieties. IMPORTANT: If the wine is a blend of multiple grapes, list ALL grape varieties separated by commas (e.g. 'Grenache, Syrah, Mourvèdre') and do NOT pick just one. If it is a single varietal, state that one grape.",
  "vintage": "Year (if visible)",
  "type": "Red/White/Rosé/Sparkling/Orange",
  "terroir": {
    "soil": "Soil type",
    "altitude": "Altitude (if known)",
    "climate": "Climate characteristics"
  },
  "tastingNotes": {
    "aroma": "Aroma profile",
    "taste": "Taste profile",
    "finish": "Finish"
  },
  "foodPairing": ["Food pairing suggestions"],
  "servingTemperature": "Serving temperature",
  "agingPotential": "Aging potential",
  "quickSummary": "2-3 sentence summary",
  "detailedDescription": "Detailed 3-4 paragraph description (production method, history, special characteristics)",
  "priceRange": "Estimated price range (€)",
  "rating": "Overall quality score 1-100"
}

If you cannot find or identify a wine bottle in the photo${hasBack ? "s" : ""}:
{
  "found": false,
  "error": "Description of why the wine could not be identified"
}`;

    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

    userContent.push({
      type: "text",
      text: hasBack
        ? "First image = FRONT label. Second image = BACK label. Use them together to identify the wine and fill in every field as accurately as possible."
        : "Front label only. Identify the wine and fill in every field as accurately as possible.",
    });
    userContent.push({
      type: "image_url",
      image_url: {
        url: frontImageBase64.startsWith("data:")
          ? frontImageBase64
          : `data:image/jpeg;base64,${frontImageBase64}`,
      },
    });
    if (hasBack) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: backImageBase64!.startsWith("data:")
            ? backImageBase64!
            : `data:image/jpeg;base64,${backImageBase64}`,
        },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    let wineInfo;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      const jsonStr = jsonMatch[1] || content;
      wineInfo = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      wineInfo = {
        found: true,
        wineName: "Unknown Wine",
        quickSummary: content,
        detailedDescription: content
      };
    }

    return new Response(
      JSON.stringify(wineInfo),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in analyze-wine function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
