import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Helpers ────────────────────────────────────────────────────────────────

// Sends a WhatsApp alert to the site owner when something breaks.
// Uses CallMeBot (independent of SMTP, so it survives email outages).
// Never throws — alerting must not break the main flow.
async function notifyAdminAlert(context: string, detail: string): Promise<void> {
  const phone = Deno.env.get("CALLMEBOT_PHONE");
  const apiKey = Deno.env.get("CALLMEBOT_APIKEY");
  if (!phone || !apiKey) return;
  const text = `🚨 Zanovo system alert\n\n${context}\n${detail}`.slice(0, 900);
  try {
    const params = new URLSearchParams({ phone, text, apikey: apiKey });
    await fetch(`https://api.callmebot.com/whatsapp.php?${params}`);
  } catch (_) {
    // swallow — the alerter must never throw
  }
}

async function verifySignature(
  rawBody: string,
  signature: string,
  secretKey: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const computed = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return computed === signature;
}

// ── Handler ────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // Paystack only sends POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecret) {
      console.error("PAYSTACK_SECRET_KEY secret is not set");
      return new Response("Server configuration error", { status: 500 });
    }

    // Read raw body BEFORE parsing — signature is over the raw bytes
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";

    const valid = await verifySignature(rawBody, signature, paystackSecret);
    if (!valid) {
      console.error("Signature mismatch — request rejected");
      return new Response("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // Only act on successful charges — return 200 for everything else
    // so Paystack does not keep retrying
    if (event.event !== "charge.success") {
      return new Response(JSON.stringify({ received: true, action: "ignored" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = event.data;

    // Extract custom fields sent from CheckoutPage
    type Field = { variable_name: string; value: string };
    const fields: Field[] = data.metadata?.custom_fields ?? [];
    const getField = (name: string) =>
      fields.find((f) => f.variable_name === name)?.value ?? null;

    const userId     = getField("user_id");
    const planName   = getField("plan");
    const custName   = getField("customer_name");

    // Service role client — bypasses RLS so the function can always write
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { error } = await supabase.from("transactions").upsert(
      {
        user_id:             userId   || null,
        paystack_reference:  data.reference,
        plan:                planName ?? "unknown",
        amount:              data.amount,          // in kobo (ZAR cents × 100)
        currency:            data.currency ?? "ZAR",
        status:              "success",
        customer_email:      data.customer?.email ?? null,
        customer_name:       custName ?? null,
        paid_at:             data.paid_at ?? new Date().toISOString(),
      },
      { onConflict: "paystack_reference" }, // idempotent — safe if Paystack retries
    );

    if (error) {
      // Log but still return 200 — we don't want Paystack to flood us with retries
      console.error("Supabase upsert error:", JSON.stringify(error));
      // CRITICAL: money was received but not recorded — alert immediately
      await notifyAdminAlert(
        "Payment received but NOT recorded in database.",
        `Ref: ${data.reference} · ${planName ?? "?"} · R${(data.amount / 100).toFixed(2)} · ${data.customer?.email ?? "?"}`,
      );
    } else {
      console.log(`Transaction recorded: ${data.reference} · ${planName} · ${data.amount / 100} ZAR`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unhandled webhook error:", err);
    await notifyAdminAlert(
      "Paystack webhook crashed (unhandled error).",
      err instanceof Error ? err.message : String(err),
    );
    return new Response("Internal error", { status: 500 });
  }
});
