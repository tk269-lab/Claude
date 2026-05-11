import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.16";

type LeadPayload = {
  name?: unknown;
  business?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
};

type Lead = {
  name: string;
  business: string;
  email: string;
  phone: string;
  message: string | null;
};

const FIELD_LIMITS = {
  name: 120,
  business: 160,
  email: 254,
  phone: 40,
  message: 2000,
} as const;

const corsHeaders = (origin: string | null) => {
  const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};

const json = (body: Record<string, unknown>, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const stripHeaderChars = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

const publicErrorMessage = (err: unknown) => {
  if (!Deno.env.get("SMTP_DEBUG_ERRORS")) return undefined;
  const message = err instanceof Error ? err.message : String(err);
  return stripHeaderChars(message).slice(0, 240);
};

const normalizeLead = (payload: LeadPayload): Lead => ({
  name: stripHeaderChars(asString(payload.name)),
  business: stripHeaderChars(asString(payload.business)),
  email: stripHeaderChars(asString(payload.email)).toLowerCase(),
  phone: stripHeaderChars(asString(payload.phone)),
  message: asString(payload.message) ? asString(payload.message).slice(0, FIELD_LIMITS.message) : null,
});

const validateLead = (lead: Lead) => {
  if (!lead.name || !lead.business || !lead.email || !lead.phone) {
    return "Missing required fields.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return "Invalid email address.";
  }
  if (!/^[+()0-9\s.-]{7,40}$/.test(lead.phone)) {
    return "Invalid phone number.";
  }
  if (lead.name.length > FIELD_LIMITS.name) return "Name is too long.";
  if (lead.business.length > FIELD_LIMITS.business) return "Business name is too long.";
  if (lead.email.length > FIELD_LIMITS.email) return "Email is too long.";
  if (lead.phone.length > FIELD_LIMITS.phone) return "Phone number is too long.";
  if ((lead.message || "").length > FIELD_LIMITS.message) return "Message is too long.";
  return "";
};

const sha256 = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const clientIdentifier = (req: Request, lead: Lead) => {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip");
  return `${forwardedFor || realIp || "unknown"}:${lead.email}`;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

// ── Shared SMTP transporter ──────────────────────────────────────────────────

const createSmtpTransporter = () => {
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPass = Deno.env.get("SMTP_PASS");
  if (!smtpUser || !smtpPass) return null;

  const host = Deno.env.get("SMTP_HOST") || "smtp.gmail.com";
  const port = Number(Deno.env.get("SMTP_PORT") || 465);

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });
};

// ── Email 1: Lead alert to Thabiso ───────────────────────────────────────────

const alertEmailText = (lead: Lead) =>
  [
    "New Zanovo lead",
    "",
    `Name: ${lead.name}`,
    `Business: ${lead.business}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    "",
    "Message:",
    lead.message || "No message provided.",
  ].join("\n");

const alertEmailHtml = (lead: Lead) => `
  <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
    <h2 style="margin: 0 0 16px;">New Zanovo lead</h2>
    <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
      <tr><td style="padding: 4px 16px 4px 0;"><strong>Name</strong></td><td>${escapeHtml(lead.name)}</td></tr>
      <tr><td style="padding: 4px 16px 4px 0;"><strong>Business</strong></td><td>${escapeHtml(lead.business)}</td></tr>
      <tr><td style="padding: 4px 16px 4px 0;"><strong>Email</strong></td><td>${escapeHtml(lead.email)}</td></tr>
      <tr><td style="padding: 4px 16px 4px 0;"><strong>Phone</strong></td><td>${escapeHtml(lead.phone)}</td></tr>
    </table>
    <h3 style="margin: 24px 0 8px;">Message</h3>
    <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(lead.message || "No message provided.")}</p>
  </div>
`;

const sendNotificationEmail = async (lead: Lead) => {
  const transporter = createSmtpTransporter();
  const to = Deno.env.get("LEAD_EMAIL_TO");

  if (!transporter || !to) {
    console.warn("SMTP is not configured; skipping lead alert email.");
    return;
  }

  const smtpUser = Deno.env.get("SMTP_USER")!;
  const fromAddress = Deno.env.get("LEAD_EMAIL_FROM") || smtpUser;
  const fromName = stripHeaderChars(Deno.env.get("LEAD_EMAIL_FROM_NAME") || "Zanovo Website");

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      replyTo: lead.email,
      subject: `New Zanovo lead: ${lead.business}`,
      text: alertEmailText(lead),
      html: alertEmailHtml(lead),
    });
  } finally {
    transporter.close();
  }
};

// ── Email 2: Confirmation to the lead ────────────────────────────────────────

const confirmationEmailText = (lead: Lead, meetLink: string) => {
  const bookingLine = meetLink
    ? `\nIf you'd like to get ahead of it, you can book a time directly here:\n${meetLink}\n`
    : "";

  return [
    `Hi ${lead.name},`,
    "",
    "Thanks for reaching out — your request for a strategy call has come through.",
    "",
    "I'll be in touch within one business day, either by phone or email, to lock in a time for us to talk.",
    bookingLine,
    "Talk soon,",
    "",
    "Thabiso Molekwa",
    "Founder, Zanovo",
    "thabiso@zanovo.co.za",
  ].join("\n");
};

const confirmationEmailHtml = (lead: Lead, meetLink: string) => {
  const bookingSection = meetLink
    ? `<p style="margin: 20px 0 0;">If you'd like to get ahead of it, you can <a href="${escapeHtml(meetLink)}" style="color: #FF6B00; font-weight: 600;">book a time directly here</a>.</p>`
    : "";

  return `
  <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 560px;">
    <p style="margin: 0 0 16px;">Hi ${escapeHtml(lead.name)},</p>
    <p style="margin: 0 0 16px;">Thanks for reaching out — your request for a strategy call has come through.</p>
    <p style="margin: 0 0 16px;">I'll be in touch within one business day, either by phone or email, to lock in a time for us to talk.</p>
    ${bookingSection}
    <p style="margin: 32px 0 4px;">Talk soon,</p>
    <p style="margin: 0;">
      <strong>Thabiso Molekwa</strong><br>
      Founder, Zanovo<br>
      <a href="mailto:thabiso@zanovo.co.za" style="color: #FF6B00;">thabiso@zanovo.co.za</a>
    </p>
  </div>
`;
};

const sendLeadConfirmationEmail = async (lead: Lead) => {
  const transporter = createSmtpTransporter();
  if (!transporter) {
    console.warn("SMTP is not configured; skipping lead confirmation email.");
    return;
  }

  const smtpUser = Deno.env.get("SMTP_USER")!;
  const fromAddress = Deno.env.get("LEAD_EMAIL_FROM") || smtpUser;
  const fromName = stripHeaderChars(Deno.env.get("LEAD_EMAIL_FROM_NAME") || "Thabiso | Zanovo");
  const meetLink = Deno.env.get("GOOGLE_MEET_LINK") || "";

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: lead.email,
      subject: "Your strategy call request has been received — Zanovo",
      text: confirmationEmailText(lead, meetLink),
      html: confirmationEmailHtml(lead, meetLink),
    });
  } finally {
    transporter.close();
  }
};

// ── WhatsApp alert to Thabiso with one-tap reply link ────────────────────────

const sendCallMeBotNewLead = async (lead: Lead) => {
  const phone = Deno.env.get("CALLMEBOT_PHONE");
  const apiKey = Deno.env.get("CALLMEBOT_APIKEY");

  if (!phone || !apiKey) {
    console.warn("CallMeBot is not configured; skipping WhatsApp alert.");
    return;
  }

  const meetLink = Deno.env.get("GOOGLE_MEET_LINK") || "";

  // Build a clean international number for wa.me (digits only, no leading +)
  const cleanPhone = lead.phone.replace(/\D/g, "").replace(/^0/, "27");

  const waMessage = meetLink
    ? `Hi ${lead.name}! Thanks for reaching out to Zanovo. I'd love to book your strategy call — here's my booking link: ${meetLink}`
    : `Hi ${lead.name}! Thanks for reaching out to Zanovo. I'll be in touch within one business day to book your strategy call.`;

  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

  const text = [
    "📋 New strategy call request",
    "",
    `Name: ${lead.name}`,
    `Business: ${lead.business}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    "",
    `Tap to WhatsApp them:\n${waLink}`,
  ].join("\n");

  const params = new URLSearchParams({ phone, text, apikey: apiKey });
  const res = await fetch(`https://api.callmebot.com/whatsapp.php?${params}`);
  if (!res.ok) {
    console.warn(`CallMeBot responded with status ${res.status}`);
  }
};

// ── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405, origin);
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 10_000) {
    return json({ error: "Request is too large." }, 413, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const rateLimitSalt = Deno.env.get("RATE_LIMIT_SALT");

  if (!supabaseUrl || !serviceRoleKey || !rateLimitSalt) {
    console.error("Missing required Supabase function environment variables.");
    return json({ error: "Server is not configured." }, 500, origin);
  }

  let payload: LeadPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON payload." }, 400, origin);
  }

  const lead = normalizeLead(payload);
  const validationError = validateLead(lead);
  if (validationError) {
    return json({ error: validationError }, 400, origin);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const identifierHash = await sha256(`${rateLimitSalt}:${clientIdentifier(req, lead)}`);
  const { data: rateLimitAllowed, error: rateLimitError } = await supabase.rpc("check_lead_rate_limit", {
    p_identifier_hash: identifierHash,
    p_max_requests: 5,
    p_window_seconds: 3600,
  });

  if (rateLimitError) {
    console.error("Rate-limit check failed:", rateLimitError.message);
    return json({ error: "Could not process submission." }, 500, origin);
  }

  if (!rateLimitAllowed) {
    return json({ error: "Too many submissions. Please try again later." }, 429, origin);
  }

  const { error: insertError } = await supabase.from("leads").insert({
    name: lead.name,
    business: lead.business,
    email: lead.email,
    phone: lead.phone,
    message: lead.message,
  });

  if (insertError) {
    console.error("Lead insert failed:", insertError.message);
    return json({ error: "Could not save submission." }, 500, origin);
  }

  // Run all three notifications in parallel.
  // Alert email to Thabiso is primary — failure returns 502.
  // Confirmation email to lead and WhatsApp alert are non-fatal.
  const [alertResult, confirmResult, whatsappResult] = await Promise.allSettled([
    sendNotificationEmail(lead),
    sendLeadConfirmationEmail(lead),
    sendCallMeBotNewLead(lead),
  ]);

  if (alertResult.status === "rejected") {
    const err = alertResult.reason;
    console.error("Lead alert email failed:", err instanceof Error ? err.message : err);
    return json({
      error: "Submission saved, but notification failed.",
      detail: publicErrorMessage(err),
    }, 502, origin);
  }

  if (confirmResult.status === "rejected") {
    const err = confirmResult.reason;
    console.error("Lead confirmation email failed:", err instanceof Error ? err.message : err);
  }

  if (whatsappResult.status === "rejected") {
    const err = whatsappResult.reason;
    console.error("WhatsApp alert failed:", err instanceof Error ? err.message : err);
  }

  return json({ ok: true }, 200, origin);
});
