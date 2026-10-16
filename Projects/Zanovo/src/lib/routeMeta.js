// ============================================================
// Zanovo: per-page title, description and indexing.
//
// Read in two places, so they never drift apart:
//   - App.tsx updates the live tags on every route change (Google renders JS).
//   - vite.config.ts writes a static <route>/index.html at build time with
//     these tags baked in, because WhatsApp, Facebook and LinkedIn link
//     previews do not run JavaScript.
// The homepage entry must match the tags in index.html.
// ============================================================
import { CARE_PLANS } from './plans.js'

export const SITE_ORIGIN = 'https://www.zanovo.co.za'

const careFrom = CARE_PLANS.reduce((min, p) => (p.monthlyCents < min.monthlyCents ? p : min)).monthlyDisplay

const HOME = {
  title: 'Web Design & Business Growth Solutions South Africa | Zanovo',
  description:
    "South Africa's web design & business growth solutions agency. We help small businesses capture leads, close clients, and operate 24/7 — even after hours. Get a free consultation.",
  // og/twitter use a shorter variant without the call to action
  shareDescription:
    "South Africa's web design & business growth solutions agency. We help small businesses capture leads, close clients, and operate 24/7 — even after hours.",
}

export const ROUTE_META = {
  '/': HOME,
  '/care': {
    title: 'Zanovo Care — Website Maintenance & Support | Zanovo',
    description: `Ongoing website care for South African small businesses: hosting, backups, security monitoring, updates and edits, month-to-month. Plans from ${careFrom} per month.`,
  },
  '/plans': {
    title: 'Your Plan & Pricing | Zanovo',
    description:
      'Website and lead-capture packages for South African small businesses, with a once-off setup fee and a monthly retainer that starts after go-live.',
    noindex: true,
  },
  '/checkout': {
    title: 'Checkout | Zanovo',
    description: 'Complete your Zanovo booking securely by card or EFT.',
    noindex: true,
  },
  '/terms': {
    title: 'Terms of Service | Zanovo',
    description:
      "The terms that govern Zanovo's website and services, including payments, cancellations, liability and intellectual property.",
  },
  '/privacy': {
    title: 'Privacy Policy | Zanovo',
    description: 'How Zanovo collects, uses and protects your personal information, in line with POPIA.',
  },
  '/refund': {
    title: 'Refund & Cancellation Policy | Zanovo',
    description: "Zanovo's refund and cancellation policy: what you can cancel, when, and how refunds are handled.",
  },
}

export function metaFor(pathname) {
  const m = ROUTE_META[pathname] ?? HOME
  return { ...m, shareDescription: m.shareDescription ?? m.description, url: SITE_ORIGIN + pathname }
}
