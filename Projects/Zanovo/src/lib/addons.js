// ============================================================
// Zanovo: optional add-on services
// Shared by the pricing modal (App.jsx) and checkout (CheckoutPage.jsx)
// `cents` is in kobo (ZAR cents × 100) to match Paystack's amount unit
// ============================================================

export const ADD_ONS = [
  {
    id: "photography",
    name: "Brand Photography Session",
    desc: "1–2 hour on-site shoot with 20–30 professionally edited photos for your website.",
    cents: 300000, // R3,000
  },
  {
    id: "copywriting",
    name: "Website Copywriting",
    desc: "Professionally written, conversion-focused copy for every page of your site.",
    cents: 250000, // R2,500
  },
  {
    id: "logo",
    name: "Logo Design",
    desc: "Custom logo with 3 initial concepts and 2 rounds of revisions.",
    cents: 300000, // R3,000
  },
  {
    id: "social",
    name: "Social Media Setup",
    desc: "Profile optimisation and branded content templates for 2 platforms.",
    cents: 200000, // R2,000
  },
];

// Quick lookup by id
export const ADD_ON_MAP = Object.fromEntries(ADD_ONS.map((a) => [a.id, a]));

// Format cents (kobo) as a ZAR string, e.g. 300000 -> "R3,000"
export function formatRand(cents) {
  const rands = Math.round(cents / 100);
  return "R" + rands.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Parse a comma-separated "addons" URL param into valid add-on ids
export function parseAddonParam(param) {
  if (!param) return [];
  return param
    .split(",")
    .map((s) => s.trim())
    .filter((id) => ADD_ON_MAP[id]);
}
