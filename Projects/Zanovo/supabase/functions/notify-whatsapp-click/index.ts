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

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return new Response(null, { status: 405, headers: corsHeaders(origin) });
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
