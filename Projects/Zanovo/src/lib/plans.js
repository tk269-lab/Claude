// ============================================================
// Zanovo: build packages — SINGLE SOURCE OF TRUTH
// Shared by the plans page (PlansPage.tsx) and checkout (CheckoutPage.tsx).
// Checkout charges `setupCents` through Paystack, so cents are the truth
// and every displayed price is derived from them — never typed twice.
// `cents` is in kobo (ZAR cents × 100) to match Paystack's amount unit.
// ============================================================

import { formatRand } from "./addons.js";

const RAW_PLANS = [
  {
    slug: "starter",
    name: "Starter Pack",
    setupCents: 650000,   // R6,500
    monthlyCents: 250000, // R2,500
    tag: null,            // homepage banner — only the anchor plan gets one
    checkoutTag: "Foundation",
    description: "The essential digital foundation — a professional web presence and structured lead capture — for businesses ready to grow with intention.",
    features: [
      "5-page mobile-optimised website",
      "Lead capture & enquiry management",
      "Google Business Profile setup",
      "Automated review requests (Email & WhatsApp)",
      "Monthly performance report",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    slug: "growth",
    name: "Growth Pack",
    setupCents: 950000,   // R9,500
    monthlyCents: 550000, // R5,500
    tag: "Most Popular",
    checkoutTag: "Most Popular",
    description: "A complete client acquisition system — web presence, lead capture, and automated follow-up — working together to generate consistent, measurable growth.",
    features: [
      "Everything in Starter",
      "AI webchat",
      "AI chatbot with lead qualification",
      "Automated follow-ups (Email & WhatsApp)",
      "Missed-call text-back",
      "CRM integration & lead dashboard",
      "Reputation management",
    ],
    cta: "Get Started",
    featured: true,
  },
  {
    slug: "growth-max",
    name: "Growth Max Pack",
    setupCents: 2500000,  // R25,000
    monthlyCents: 950000, // R9,500
    tag: null,
    checkoutTag: "Full Partnership",
    description: "Our most comprehensive engagement. For businesses committed to sustained growth, with dedicated strategy, advanced systems, and a true long-term partnership.",
    features: [
      "Everything in Growth",
      "AI SMS nurture sequences",
      "Custom landing pages & funnels",
      "Advanced booking & intake automation",
      "Priority support",
      "Monthly strategy call",
    ],
    cta: "Get Started",
    featured: false,
  },
];

// Zanovo Care retainers — monthly maintenance, billed from the first month.
// Checkout can charge these directly, so they live here for the same reason.
const RAW_CARE_PLANS = [
  {
    slug: "care-essential",
    name: "Essential Care",
    monthlyCents: 75000,  // R750
    tag: null,
    description: "Keep your website secure, backed up, and online — the essentials, handled for you.",
    bestFor: "A brochure site that rarely changes, where you mainly need it to stay up, stay safe, and stay current.",
    features: [
      "Managed hosting & SSL certificate",
      "Weekly automated backups",
      "Security & uptime monitoring",
      "Monthly software updates",
      "Up to 1 hour of content edits / month",
      "Email support",
    ],
    featured: false,
  },
  {
    slug: "care-pro",
    name: "Pro Care",
    monthlyCents: 150000, // R1,500
    tag: "Most Popular",
    description: "Everything kept current, plus priority help and a monthly health check on your site.",
    bestFor: "A site you actually use — new services, seasonal offers, prices that move — where you want the changes done for you and someone watching the numbers.",
    features: [
      "Everything in Essential Care",
      "Up to 3 hours of edits / month",
      "Priority support",
      "Monthly performance report",
      "Plugin & dependency updates",
      "Basic SEO monitoring",
    ],
    featured: true,
  },
  {
    slug: "care-premium",
    name: "Premium Care",
    monthlyCents: 250000, // R2,500
    tag: null,
    description: "Hands-off peace of mind, with ongoing strategy built into your retainer.",
    bestFor: "A business where the website is a main source of work, and you want it treated as one — edits on demand, leads tracked, and a quarterly look at what to do next.",
    features: [
      "Everything in Pro Care",
      "Unlimited small edits (fair use)",
      "Lead & conversion monitoring",
      "Quarterly strategy review",
      "Priority turnaround",
      "WhatsApp support line",
    ],
    featured: false,
  },
];

// Display strings are derived, so they can never drift from the charged amount
export const PLANS = RAW_PLANS.map((p) => ({
  ...p,
  kind: "pack",
  setupDisplay: formatRand(p.setupCents),
  monthlyDisplay: formatRand(p.monthlyCents),
}));

export const CARE_PLANS = RAW_CARE_PLANS.map((p) => ({
  ...p,
  kind: "care",
  monthlyDisplay: formatRand(p.monthlyCents),
}));

// Quick lookup by slug (used by checkout's ?plan= param)
export const PLAN_MAP = Object.fromEntries(PLANS.map((p) => [p.slug, p]));
export const CARE_PLAN_MAP = Object.fromEntries(CARE_PLANS.map((p) => [p.slug, p]));

// Every payable plan, packs and care together — what checkout resolves against
export const ALL_PLAN_MAP = { ...PLAN_MAP, ...CARE_PLAN_MAP };
