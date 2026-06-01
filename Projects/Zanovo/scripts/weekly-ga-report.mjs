// ============================================================
// Zanovo — Weekly Google Analytics (GA4) report
// Pulls the last 7 days of data and writes a Markdown report
// into analytics-reports/.
//
// Requires (one-time setup):
//   1. .ga-service-account.json  — GA4 service-account key (gitignored)
//   2. GA_PROPERTY_ID            — set in .env (numeric GA4 property id)
//
// Run manually:  node scripts/weekly-ga-report.mjs
// ============================================================

import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── Read a key from process.env, falling back to a tiny .env parser ──
function getEnv(key) {
  if (process.env[key]) return process.env[key];
  try {
    const txt = readFileSync(join(ROOT, ".env"), "utf8");
    const line = txt.split("\n").find((l) => l.trim().startsWith(`${key}=`));
    return line ? line.slice(line.indexOf("=") + 1).trim() : undefined;
  } catch {
    return undefined;
  }
}

const PROPERTY_ID = getEnv("GA_PROPERTY_ID");
const KEY_FILE = join(ROOT, ".ga-service-account.json");

if (!PROPERTY_ID) {
  console.error("✗ GA_PROPERTY_ID is not set in .env");
  process.exit(1);
}
if (!existsSync(KEY_FILE)) {
  console.error("✗ .ga-service-account.json not found in project root");
  process.exit(1);
}

const client = new BetaAnalyticsDataClient({ keyFilename: KEY_FILE });
const property = `properties/${PROPERTY_ID}`;
const dateRanges = [{ startDate: "7daysAgo", endDate: "yesterday" }];

// ── Helpers ──────────────────────────────────────────────────
const fmtDuration = (secs) => {
  const s = Math.round(Number(secs) || 0);
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
};

async function run() {
  // 1) Headline totals
  const [totals] = await client.runReport({
    property,
    dateRanges,
    metrics: [
      { name: "totalUsers" },
      { name: "newUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
    ],
  });
  const t = totals.rows?.[0]?.metricValues ?? [];
  const headline = {
    users: t[0]?.value ?? "0",
    newUsers: t[1]?.value ?? "0",
    sessions: t[2]?.value ?? "0",
    views: t[3]?.value ?? "0",
    avgDuration: fmtDuration(t[4]?.value),
  };

  // 2) Top pages
  const [pages] = await client.runReport({
    property,
    dateRanges,
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 10,
  });

  // 3) Traffic sources
  const [channels] = await client.runReport({
    property,
    dateRanges,
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 10,
  });

  // 4) Events (clicks, payments, consent)
  const [events] = await client.runReport({
    property,
    dateRanges,
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 25,
  });

  // ── Compose markdown ──
  const today = new Date();
  const stamp = today.toISOString().slice(0, 10);
  const rows = (rep) =>
    (rep.rows ?? [])
      .map((r) => `| ${r.dimensionValues[0].value || "(not set)"} | ${r.metricValues[0].value} |`)
      .join("\n") || "| (no data) | 0 |";

  const md = `# Zanovo — Weekly Analytics Report
**Period:** last 7 days (up to ${stamp})

## Headline
| Metric | Value |
|---|---|
| Total users | ${headline.users} |
| New users | ${headline.newUsers} |
| Sessions (visits) | ${headline.sessions} |
| Page views | ${headline.views} |
| Average visit duration | ${headline.avgDuration} |

## Top pages
| Page | Views |
|---|---|
${rows(pages)}

## Traffic sources
| Channel | Sessions |
|---|---|
${rows(channels)}

## Events (clicks & actions)
| Event | Count |
|---|---|
${rows(events)}

---
*Generated automatically on ${today.toLocaleString("en-ZA")}.*
`;

  const outDir = join(ROOT, "analytics-reports");
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `ga-report-${stamp}.md`);
  writeFileSync(outFile, md, "utf8");
  console.log(`✓ Report written to analytics-reports/ga-report-${stamp}.md`);
}

run().catch((err) => {
  console.error("✗ Report failed:", err.message || err);
  process.exit(1);
});
