// ============================================================
// Zanovo: build packages — SINGLE SOURCE OF TRUTH
// Shared by the pricing cards (App.jsx) and checkout (CheckoutPage.jsx).
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

// Display strings are derived, so they can never drift from the charged amount
export const PLANS = RAW_PLANS.map((p) => ({
  ...p,
  setupDisplay: formatRand(p.setupCents),
  monthlyDisplay: formatRand(p.monthlyCents),
}));

// Quick lookup by slug (used by checkout's ?plan= param)
export const PLAN_MAP = Object.fromEntries(PLANS.map((p) => [p.slug, p]));
