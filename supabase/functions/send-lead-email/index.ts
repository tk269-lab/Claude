// ─────────────────────────────────────────────────────────────
//  ZANOVO — Supabase Edge Function
//  Path: supabase/functions/send-lead-email/index.ts
//
//  Sends a lead notification email via Zoho SMTP
//  to thabiso@zanovo.co.za whenever the contact form is submitted.
//
//  Required secrets (set in Supabase Dashboard → Edge Functions → Secrets):
//    ZOHO_SMTP_USER    your Zoho email address, e.g. thabiso@zanovo.co.za
//    ZOHO_SMTP_PASS    your Zoho App Password (NOT your login password)
//    NOTIFY_EMAIL      thabiso@zanovo.co.za
// ─────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle preflight CORS request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, business, email, phone, message } = await req.json();

    // Validate required fields
    if (!name || !email || !phone || !business) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Build the email HTML ──────────────────────────────────
    const submittedAt = new Date().toLocaleString("en-ZA", {
      timeZone:     "Africa/Johannesburg",
      dateStyle:    "full",
      timeStyle:    "short",
    });

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead — Zanovo</title>
</head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#0A0D12;padding:32px 40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;">
                    <!-- V Mark inline SVG -->
                    <svg width="28" height="21" viewBox="0 0 120 87" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="0,0 28,0 60,87 44,87" fill="#FF6B00"/>
                      <polygon points="120,0 92,0 60,87 76,87" fill="#CC4A00"/>
                    </svg>
                  </td>
                  <td>
                    <span style="font-family:Arial,sans-serif;font-size:18px;letter-spacing:0.28em;color:#ffffff;font-weight:700;">ZANOVO</span>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:13px;color:rgba(255,255,255,0.4);letter-spacing:0.1em;text-transform:uppercase;">
                New strategy call request
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 32px;font-size:16px;color:#6B7280;line-height:1.6;">
                A new lead has submitted the contact form. Here are their details:
              </p>

              <!-- Lead details table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E6E1;border-radius:4px;overflow:hidden;">
                ${[
                  ["Name",          name],
                  ["Business",      business],
                  ["Email",         email],
                  ["Phone",         phone],
                  ["Message",       message || "—"],
                  ["Submitted at",  submittedAt],
                ].map(([label, value], i) => `
                <tr style="background:${i % 2 === 0 ? "#FAF9F7" : "#ffffff"};">
                  <td style="padding:14px 20px;font-size:12px;font-weight:700;color:#0A0D12;letter-spacing:0.08em;text-transform:uppercase;width:160px;border-bottom:1px solid #E8E6E1;">
                    ${label}
                  </td>
                  <td style="padding:14px 20px;font-size:14px;color:#374151;border-bottom:1px solid #E8E6E1;word-break:break-word;">
                    ${value}
                  </td>
                </tr>`).join("")}
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td style="background:#FF6B00;border-radius:3px;">
                    <a href="mailto:${email}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.04em;">
                      Reply to ${name} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F7F6F3;padding:24px 40px;border-top:1px solid #E8E6E1;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;">
                This is an automated notification from your Zanovo contact form.<br>
                © ${new Date().getFullYear()} Zanovo. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // ── Send via Zoho SMTP ────────────────────────────────────
    const client = new SmtpClient();

    await client.connectTLS({
      hostname: "smtp.zoho.com",
      port:     465,
      username: Deno.env.get("ZOHO_SMTP_USER")!,
      password: Deno.env.get("ZOHO_SMTP_PASS")!,
    });

    await client.send({
      from:    `Zanovo Website <${Deno.env.get("ZOHO_SMTP_USER")}>`,
      to:      Deno.env.get("NOTIFY_EMAIL")!,
      subject: `New lead: ${name} — ${business}`,
      content: `New strategy call request from ${name} (${business})\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message || "—"}`,
      html:    htmlBody,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[send-lead-email] error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to send email", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
