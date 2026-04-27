import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Whitelist origins for the reset-link redirect. Without this an
    // attacker could spoof the Origin header and trick our edge function
    // into emailing a real user a reset link that resolves on a phishing
    // domain. Anything not on the list falls back to the canonical site.
    const ALLOWED_ORIGINS = [
      "https://pourculture.com",
      "https://www.pourculture.com",
      "https://app.pourculture.com",
      // Lovable preview + local dev — useful for testing, not exploitable
      // because the reset email goes to the legitimate account owner.
      "http://localhost:5173",
      "http://localhost:8080",
    ];
    const incomingOrigin = req.headers.get("origin");
    const isLovablePreview = incomingOrigin?.endsWith(".lovableproject.com") ?? false;
    const safeOrigin = (incomingOrigin && (ALLOWED_ORIGINS.includes(incomingOrigin) || isLovablePreview))
      ? incomingOrigin
      : "https://pourculture.com";

    const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${safeOrigin}/auth?mode=reset`,
    });

    if (error) {
      console.error("Password reset error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }


    return new Response(
      JSON.stringify({ success: true, message: "Password reset email sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in reset-password function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
