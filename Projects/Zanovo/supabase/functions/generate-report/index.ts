import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.16";

type Lead = {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  message: string | null;
  created_at: string;
};

type ReportType = "daily" | "weekly";

// ── Timezone helpers (SAST = UTC+2) ─────────────────────────────────────────

const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;

const nowInSast = () => new Date(Date.now() + SAST_OFFSET_MS);

const startOfDayUtc = (sastNow: Date) => {
  const d = new Date(sastNow);
  d.setUTCHours(0, 0, 0, 0);
  return new Date(d.getTime() - SAST_OFFSET_MS);
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const fmtDate = (utcDate: Date) => {
  const d = new Date(utcDate.getTime() + SAST_OFFSET_MS);
  return `${DAY_NAMES[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

const fmtShortDate = (utcDate: Date) => {
  const d = new Date(utcDate.getTime() + SAST_OFFSET_MS);
  return `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]}`;
};

const fmtTime = (utcDate: Date) => {
  const d = new Date(utcDate.getTime() + SAST_OFFSET_MS);
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

// ── Date range calculation ───────────────────────────────────────────────────

const getDateRange = (type: ReportType) => {
  const sastNow = nowInSast();

  if (type === "daily") {
    const start = startOfDayUtc(sastNow);
    const end = new Date();
    const prevStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
    const prevEnd = new Date(start.getTime() - 1);
    return { start, end, prevStart, prevEnd, label: fmtDate(new Date()) };
  }

  // Weekly: Monday 00:00 SAST to Sunday 23:59 SAST of current week
  const dayOfWeek = sastNow.getUTCDay(); // 0=Sun
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const mondaySast = new Date(sastNow);
  mondaySast.setUTCDate(mondaySast.getUTCDate() - daysToMonday);
  mondaySast.setUTCHours(0, 0, 0, 0);

  const start = new Date(mondaySast.getTime() - SAST_OFFSET_MS);
  const end = new Date();

  // Previous week
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weekStart = new Date(start.getTime() + SAST_OFFSET_MS);
  const weekEnd = new Date(end.getTime() + SAST_OFFSET_MS);
  const label = `${fmtShortDate(weekStart)} – ${fmtShortDate(weekEnd)} ${weekEnd.getUTCFullYear()}`;

  return { start, end, prevStart, prevEnd, label };
};

// ── HTML email builder ───────────────────────────────────────────────────────

const escapeHtml = (v: string) =>
  v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

const sectionStyle = "margin: 0 0 32px;";
const headingStyle = `font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: #FF6B00; margin: 0 0 12px;
  padding-bottom: 8px; border-bottom: 2px solid #FF6B00;`;
const labelStyle = "font-size: 12px; color: #6b7280; width: 80px; vertical-align: top; padding: 3px 0;";
const valueStyle = "font-size: 13px; color: #111827; vertical-align: top; padding: 3px 0;";

const buildLeadCard = (lead: Lead, index: number) => `
  <div style="background: #f9fafb; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px;">
    <div style="font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 8px;">
      ${index + 1}. ${escapeHtml(lead.name)} — ${escapeHtml(lead.business)}
    </div>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="${labelStyle}">Email</td>
        <td style="${valueStyle}"><a href="mailto:${escapeHtml(lead.email)}" style="color: #FF6B00;">${escapeHtml(lead.email)}</a></td>
      </tr>
      <tr>
        <td style="${labelStyle}">Phone</td>
        <td style="${valueStyle}">${escapeHtml(lead.phone)}</td>
      </tr>
      <tr>
        <td style="${labelStyle}">Time</td>
        <td style="${valueStyle}">${fmtTime(new Date(lead.created_at))}</td>
      </tr>
      ${lead.message ? `
      <tr>
        <td style="${labelStyle}">Message</td>
        <td style="${valueStyle}; white-space: pre-wrap; max-width: 420px;">${escapeHtml(lead.message)}</td>
      </tr>` : ""}
    </table>
  </div>
`;

const buildLeadsByDay = (leads: Lead[]) => {
  const byDay: Record<string, Lead[]> = {};
  for (const lead of leads) {
    const d = new Date(new Date(lead.created_at).getTime() + SAST_OFFSET_MS);
    const key = DAY_NAMES[d.getUTCDay()];
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(lead);
  }
  return byDay;
};

const buildEmailHtml = (
  type: ReportType,
  label: string,
  leads: Lead[],
  prevLeads: Lead[],
  allTimeCount: number,
  meetLink: string,
) => {
  const isWeekly = type === "weekly";
  const title = isWeekly ? `Weekly Report — ${label}` : `Daily Report — ${label}`;
  const leadsCount = leads.length;
  const prevCount = prevLeads.length;
  const diff = leadsCount - prevCount;
  const diffText = diff > 0 ? `▲ ${diff} more than ${isWeekly ? "last week" : "yesterday"}`
    : diff < 0 ? `▼ ${Math.abs(diff)} fewer than ${isWeekly ? "last week" : "yesterday"}`
    : `Same as ${isWeekly ? "last week" : "yesterday"}`;
  const diffColor = diff > 0 ? "#16a34a" : diff < 0 ? "#dc2626" : "#6b7280";

  const leadsSection = leads.length === 0
    ? `<p style="color: #6b7280; font-size: 13px; margin: 0;">No leads ${isWeekly ? "this week" : "today"}.</p>`
    : leads.map((l, i) => buildLeadCard(l, i)).join("");

  let weeklyBreakdown = "";
  if (isWeekly && leads.length > 0) {
    const byDay = buildLeadsByDay(leads);
    const rows = DAY_NAMES.slice(1).concat(DAY_NAMES[0]).map((day) => {
      const count = byDay[day]?.length ?? 0;
      const bar = count > 0 ? `<span style="display:inline-block; width:${Math.min(count * 20, 140)}px; height:8px; background:#FF6B00; border-radius:4px; vertical-align:middle; margin-left:8px;"></span>` : "";
      return `<tr>
        <td style="font-size: 12px; color: #6b7280; padding: 3px 12px 3px 0; width: 90px;">${day}</td>
        <td style="font-size: 13px; font-weight: 600; color: #111827;">${count}${bar}</td>
      </tr>`;
    }).join("");
    weeklyBreakdown = `
      <div style="${sectionStyle}">
        <div style="${headingStyle}">Leads by Day</div>
        <table cellpadding="0" cellspacing="0">${rows}</table>
      </div>`;
  }

  const bookingSection = meetLink ? `
    <div style="${sectionStyle}">
      <div style="${headingStyle}">Strategy Calls</div>
      <p style="font-size: 13px; color: #374151; margin: 0 0 10px;">
        Book a strategy call directly with your scheduling link:
      </p>
      <a href="${escapeHtml(meetLink)}" style="display: inline-block; background: #FF6B00; color: #ffffff;
        font-weight: 700; font-size: 13px; padding: 10px 20px; border-radius: 6px;
        text-decoration: none;">
        Open Booking Calendar →
      </a>
    </div>` : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #f3f4f6;">
  <div style="max-width: 620px; margin: 32px auto; background: #ffffff;
    border-radius: 12px; overflow: hidden; font-family: Arial, sans-serif;">

    <!-- Header -->
    <div style="background: #0A0D12; padding: 28px 32px;">
      <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
        text-transform: uppercase; color: #FF6B00; margin-bottom: 6px;">Zanovo</div>
      <div style="font-size: 20px; font-weight: 700; color: #ffffff;">${escapeHtml(title)}</div>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">

      <!-- Snapshot -->
      <div style="${sectionStyle}">
        <div style="${headingStyle}">${isWeekly ? "Week" : "Today"} at a Glance</div>
        <table cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="text-align: center; padding: 16px; background: #f9fafb; border-radius: 8px; width: 33%;">
              <div style="font-size: 28px; font-weight: 700; color: #0A0D12;">${leadsCount}</div>
              <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em;">
                ${isWeekly ? "Leads this week" : "Leads today"}
              </div>
            </td>
            <td style="width: 16px;"></td>
            <td style="text-align: center; padding: 16px; background: #f9fafb; border-radius: 8px; width: 33%;">
              <div style="font-size: 28px; font-weight: 700; color: #0A0D12;">${allTimeCount}</div>
              <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em;">
                All-time leads
              </div>
            </td>
            <td style="width: 16px;"></td>
            <td style="text-align: center; padding: 16px; background: #f9fafb; border-radius: 8px; width: 33%;">
              <div style="font-size: 15px; font-weight: 700; color: ${diffColor};">${diffText}</div>
              <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px;">
                vs ${isWeekly ? "last week" : "yesterday"}
              </div>
            </td>
          </tr>
        </table>
      </div>

      ${weeklyBreakdown}

      <!-- Leads list -->
      <div style="${sectionStyle}">
        <div style="${headingStyle}">${isWeekly ? "All Leads This Week" : "Today's Leads"}</div>
        ${leadsSection}
      </div>

      ${bookingSection}

    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 11px; color: #9ca3af; text-align: center;">
        Generated automatically · Zanovo Systems · thabiso@zanovo.co.za
      </p>
    </div>

  </div>
</body>
</html>`;
};

// ── WhatsApp summary ─────────────────────────────────────────────────────────

const buildWhatsAppSummary = (type: ReportType, label: string, leads: Lead[], prevLeads: Lead[]) => {
  const diff = leads.length - prevLeads.length;
  const diffText = diff > 0 ? `▲ ${diff} vs ${type === "weekly" ? "last week" : "yesterday"}`
    : diff < 0 ? `▼ ${Math.abs(diff)} vs ${type === "weekly" ? "last week" : "yesterday"}`
    : `Same as ${type === "weekly" ? "last week" : "yesterday"}`;

  const lines = [
    `📊 ${type === "weekly" ? "Weekly" : "Daily"} Report — ${label}`,
    "",
    `Leads ${type === "weekly" ? "this week" : "today"}: ${leads.length} (${diffText})`,
  ];

  if (leads.length > 0) {
    lines.push("");
    for (const lead of leads.slice(0, 5)) {
      lines.push(`• ${lead.name} — ${lead.business}`);
    }
    if (leads.length > 5) {
      lines.push(`  + ${leads.length - 5} more. See email for full report.`);
    }
  } else {
    lines.push(`No leads ${type === "weekly" ? "this week" : "today"}.`);
  }

  lines.push("", "Full report in your inbox.");
  return lines.join("\n");
};

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPass = Deno.env.get("SMTP_PASS");
  const reportTo = Deno.env.get("LEAD_EMAIL_TO");
  const callMeBotPhone = Deno.env.get("CALLMEBOT_PHONE");
  const callMeBotApiKey = Deno.env.get("CALLMEBOT_APIKEY");
  const meetLink = Deno.env.get("GOOGLE_MEET_LINK") || "";

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase env vars.");
    return new Response(JSON.stringify({ error: "Not configured." }), { status: 500 });
  }

  let body: { type?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = { type: "daily" };
  }

  const type: ReportType = body.type === "weekly" ? "weekly" : "daily";
  const { start, end, prevStart, prevEnd, label } = getDateRange(type);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [leadsRes, prevLeadsRes, allTimeRes] = await Promise.all([
    supabase.from("leads").select("*")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: false }),
    supabase.from("leads").select("*")
      .gte("created_at", prevStart.toISOString())
      .lte("created_at", prevEnd.toISOString()),
    supabase.from("leads").select("id", { count: "exact", head: true }),
  ]);

  if (leadsRes.error) {
    console.error("Failed to fetch leads:", leadsRes.error.message);
    return new Response(JSON.stringify({ error: "Failed to fetch leads." }), { status: 500 });
  }

  const leads: Lead[] = leadsRes.data ?? [];
  const prevLeads: Lead[] = prevLeadsRes.data ?? [];
  const allTimeCount = allTimeRes.count ?? 0;

  const notifications: Promise<void>[] = [];

  // Send email report
  if (smtpUser && smtpPass && reportTo) {
    const host = Deno.env.get("SMTP_HOST") || "smtp.gmail.com";
    const port = Number(Deno.env.get("SMTP_PORT") || 465);
    const fromAddress = Deno.env.get("LEAD_EMAIL_FROM") || smtpUser;
    const isWeekly = type === "weekly";
    const subject = `📊 Zanovo ${isWeekly ? "Weekly" : "Daily"} Report — ${label}`;
    const html = buildEmailHtml(type, label, leads, prevLeads, allTimeCount, meetLink);

    const transporter = nodemailer.createTransport({
      host, port, secure: port === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    notifications.push(
      transporter.sendMail({ from: `"Zanovo Reports" <${fromAddress}>`, to: reportTo, subject, html })
        .then(() => transporter.close())
        .catch((err: Error) => {
          transporter.close();
          console.error("Report email failed:", err.message);
        })
    );
  } else {
    console.warn("SMTP not configured; skipping report email.");
  }

  // Send WhatsApp summary
  if (callMeBotPhone && callMeBotApiKey) {
    const text = buildWhatsAppSummary(type, label, leads, prevLeads);
    const params = new URLSearchParams({ phone: callMeBotPhone, text, apikey: callMeBotApiKey });

    notifications.push(
      fetch(`https://api.callmebot.com/whatsapp.php?${params}`)
        .then((res) => { if (!res.ok) console.warn(`CallMeBot status ${res.status}`); })
        .catch((err: Error) => console.error("WhatsApp report failed:", err.message))
    );
  }

  await Promise.allSettled(notifications);

  console.log(`${type} report sent. Leads: ${leads.length}. All-time: ${allTimeCount}.`);
  return new Response(JSON.stringify({ ok: true, type, leads: leads.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
