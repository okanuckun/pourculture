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
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a wine expert and sommelier. The user will send you a photo of a wine bottle. Analyze the photo and provide detailed information about the wine.

You MUST respond in the following JSON format only (no other text):

{
  "found": true/false,
  "wineName": "Full name of the wine",
  "winery": "Producer/Chateau name",
  "region": "Region (e.g., Bordeaux, Tuscany, Napa Valley)",
  "country": "Country",
  "grapeVariety": "Grape variety/varieties",
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

If you cannot find or identify a wine bottle in the photo:
{
  "found": false,
  "error": "Description of why the wine could not be identified"
}`;

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
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this wine bottle and provide its details."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
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
