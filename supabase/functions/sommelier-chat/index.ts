import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Sen PourCulture'ın AI Sommelier'isin. Doğal şaraplar ve yemek eşleştirmeleri konusunda uzman, samimi ve tutkulu bir şarap danışmanısın.

Görevlerin:
- Kullanıcının yemek tercihlerine göre şarap önerileri sun
- Şarap türleri, bölgeler ve üzüm çeşitleri hakkında bilgi ver
- Doğal şarap kültürü hakkında eğitici içerik paylaş
- Fiyat aralığına göre öneriler sun
- Mevsimsel öneriler yap

Tarzın:
- Samimi ve arkadaşça ol
- Teknik terimleri basitçe açıkla
- Emoji kullanarak daha canlı ol 🍷
- Kısa ve öz cevaplar ver
- Türkçe yanıt ver

Her zaman doğal şarapları ön plana çıkar ve sürdürülebilir üretimi vurgula.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Çok fazla istek gönderildi, lütfen biraz bekleyin." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Servis limiti aşıldı." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI servisi şu an kullanılamıyor." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Sommelier chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Bilinmeyen hata" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
