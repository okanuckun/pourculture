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

    const systemPrompt = `Sen bir şarap uzmanısın. Kullanıcı sana bir şarap şişesi fotoğrafı gönderecek. Fotoğrafı analiz et ve şarap hakkında bilgi ver.

Yanıtını MUTLAKA aşağıdaki JSON formatında ver (başka hiçbir metin ekleme):

{
  "found": true/false,
  "wineName": "Şarabın tam adı",
  "winery": "Üretici/Şato adı",
  "region": "Bölge (örn: Bordeaux, Toskana)",
  "country": "Ülke",
  "grapeVariety": "Üzüm çeşidi/çeşitleri",
  "vintage": "Yıl (eğer görünüyorsa)",
  "type": "Kırmızı/Beyaz/Rose/Köpüklü",
  "terroir": {
    "soil": "Toprak tipi",
    "altitude": "Yükseklik (varsa)",
    "climate": "İklim özellikleri"
  },
  "tastingNotes": {
    "aroma": "Aroma profili",
    "taste": "Tat profili",
    "finish": "Bitiş"
  },
  "foodPairing": ["Yemek eşleştirme önerileri"],
  "servingTemperature": "Servis sıcaklığı",
  "agingPotential": "Yaşlanma potansiyeli",
  "quickSummary": "2-3 cümlelik kısa özet",
  "detailedDescription": "Şarap hakkında detaylı 3-4 paragraflık açıklama (üretim yöntemi, tarihçe, özel özellikler vb.)",
  "priceRange": "Fiyat aralığı tahmini (€)",
  "rating": "Genel kalite puanı 1-100 arası"
}

Eğer fotoğrafta şarap şişesi bulamazsan veya tanıyamazsan:
{
  "found": false,
  "error": "Açıklama"
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
                text: "Bu şarap şişesini analiz et ve bilgilerini ver."
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

    // Parse the JSON response
    let wineInfo;
    try {
      // Extract JSON from response (handle markdown code blocks if present)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      const jsonStr = jsonMatch[1] || content;
      wineInfo = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      wineInfo = {
        found: true,
        wineName: "Bilinmeyen Şarap",
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
