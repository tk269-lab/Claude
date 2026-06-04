import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = (origin: string | null) => {
  const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const allowOrigin =
    origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};

const sha256 = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("cf-connecting-ip") ||
  req.headers.get("x-real-ip") ||
  "unknown";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return new Response(null, { status: 405, headers: corsHeaders(origin) });
  }

  // Rate limit by IP — blocks a bot spamming this endpoint to flood WhatsApp.
  // Reuses the same Postgres RPC as the contact form. Fails open if not configured.
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const rateLimitSalt = Deno.env.get("RATE_LIMIT_SALT");
  if (supabaseUrl && serviceRoleKey && rateLimitSalt) {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const identifierHash = await sha256(`${rateLimitSalt}:whatsapp-click:${clientIp(req)}`);
      const { data: allowed } = await supabase.rpc("check_lead_rate_limit", {
        p_identifier_hash: identifierHash,
        p_max_requests: 10,
        p_window_seconds: 3600,
      });
      if (allowed === false) {
        return new Response(JSON.stringify({ ok: true, throttled: true }), {
          status: 200,
          headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
        });
      }
    } catch (err) {
      console.warn("WhatsApp-click rate-limit check failed (allowing):", err instanceof Error ? err.message : err);
    }
  }

  const phone = Deno.env.get("CALLMEBOT_PHONE");
  const apiKey = Deno.env.get("CALLMEBOT_APIKEY");

  if (!phone || !apiKey) {
    console.warn("CallMeBot not configured; skipping WhatsApp alert.");
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  const text =
    "👋 Someone just clicked WhatsApp on your Zanovo site — they're opening a chat with you now.";

  const params = new URLSearchParams({ phone, text, apikey: apiKey });

  try {
    const res = await fetch(`https://api.callmebot.com/whatsapp.php?${params}`);
    if (!res.ok) {
      console.warn(`CallMeBot responded with status ${res.status}`);
    }
  } catch (err) {
    console.error("CallMeBot fetch failed:", err instanceof Error ? err.message : err);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
});
