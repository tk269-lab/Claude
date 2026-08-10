# Project Context

Consolidated context pulled from exported Claude Code conversation history (`~/Desktop/Claude logs`, 95 sessions). One section per project. Each is organized by topic: **Facts** (architecture/pricing), **Decisions**, **Action items / status**, **Open questions**. Dates are absolute. Prices are ZAR and verified against live source where noted.

---

## Zanovo

The live marketing site (`www.zanovo.co.za`) plus its lead/content pipeline and two sibling systems (dashboard, automation). Owner: TK (Thabiso Molekwa).

### Facts — architecture

- **Marketing site:** React 18 + TypeScript + Tailwind + Vite SPA, react-router 6 — the light "Axion" design adopted from `zanovo-redesign` on 2026-08-10. Source of truth for every price is `src/lib/plans.js` + `src/lib/addons.js` (cents), which both the plans page and checkout derive from. Backed by Supabase (lead capture) + Paystack (payments), not a CMS.
- **No accounts, no auth.** There is no login, no OAuth, and no Supabase auth client in the browser bundle (removed 2026-08-10). Checkout is guest-only: `/checkout` collects name, business, email, phone in its own form and charges via Paystack. Any unknown route (including `/login`) redirects to `/`.
- **Routes:** `/` · `/plans` (shareable pricing, see Decisions) · `/checkout` · `/privacy` · `/refund` · `/terms`. Everything else falls through to a catch-all redirect home.
- **Supabase edge functions:** `send-lead-email`, `paystack-webhook`, `generate-report`, `notify-whatsapp-click`. Contact form POSTs to an edge function with the anon key; checkout charges through Paystack off the shared price source above.
- **Deploy:** Vercel auto-deploys from `main`. Vercel project Root Directory is `Projects/Zanovo` **relative to `~/Claude`**, so manual deploys must run with `--cwd /Users/tk/Claude` (deploying from inside the Zanovo folder double-nests the path). `.vercel/` folders under `~/Claude` hold production secrets (`.env.production.local`) — never `git add -A` from the repo root.
- **Site health:** monitored by a GitHub Actions cron hitting `api/site-health-check.js`.
- **Security:** contact form guarded by reCAPTCHA + an `ALLOWED_ORIGINS` Supabase secret (edge functions pick up secret changes on next invocation, no redeploy needed).

### Facts — pricing (verified in `src/App.jsx`, 2026)

Build packages (once-off setup + monthly retainer):
- **Starter** — R6,500 setup + R2,500/mo
- **Growth** — R9,500 setup + R5,500/mo ("Most Popular" anchor / middle path)
- **Growth Max** — R25,000 setup + R9,500/mo

Zanovo Care retainers (maintenance):
- **Essential Care** R750/mo · **Pro Care** R1,500/mo · **Premium Care** R2,500/mo

### Decisions

- **2026-06-09 pricing change (shipped, Crucible-backed):** Starter setup R4,500 → **R6,500** (aligned to SA 5-page market median ~R6,634); Growth Max setup R18,000 → **R25,000** (mid Business-build band, below the R40k enterprise floor); Growth left untouched as the decoy/anchor. Monthly fees deliberately **not** touched (MRR is churn-sensitive; setup is the safe lever). Pricing page reframed **outcomes-first** (booked jobs / missed calls / funnel leaks before price) + a "cancel anytime, keep your domain, own your data" trust line. PricingSection moved off the homepage to a dedicated `/pricing` route (superseded 2026-08-10 — see below).
- **2026-08-10 — pricing goes private, accounts removed:** Pricing is no longer a public page. The same PricingSection + CareSection now live at **`/plans`**, marked `noindex, nofollow` and dropped from `sitemap.xml` — a link TK sends a client directly, where they can pay on the spot. Removed from the site nav (desktop + mobile); old `/pricing` redirects home. TK's brief: pricing goes out as a link when a client asks, and seeing the price and paying happen in one place. Login/OAuth deleted in the same pass (`AuthPage.jsx`, `src/lib/supabase.js`, navbar account widget); nothing on the site required a logged-in user, and checkout no longer stops to make one.
- **2026-08-10 — light redesign replaces the dark UI (TK's call):** The "Axion" light design from `zanovo-redesign` is now the live frontend; the original dark Framer-Motion UI is discarded (still in git history and in that repo's `zanovo-frontend-versions/v1-original-dark-theme`). Stack moved React 19/Vite 8/plain-JSX → React 18/Vite 5/TypeScript/Tailwind. Ported into the Zanovo repo rather than repointing Vercel at `zanovo-redesign`, because this repo holds `api/`, `supabase/`, the content pipeline and the health cron. Care retainers became payable at checkout in the process. Bundle grew ~235 kB → ~1.73 MB (479 kB gzip), almost entirely the `shaders` WebGL hero — open question below.
- Positioning stance: Zanovo sells a **subscription lead system**, not a one-time website — benchmark against the cost of a leaky funnel, not against web designers.
- Deploy rule (saved to memory): whenever TK asks to deploy to Vercel, **also commit to git** — but only the specific Zanovo files, never a blanket add (repo root is the large personal `~/Claude` dir with secrets).
- WhatsApp API: use **CallMeBot (free)** now; reconsider **360Dialog** only once there's revenue. 360Dialog's €500–1,000/mo pricing was the *Partner/reseller* hub — the wrong portal for a direct business user.

### Action items / status

- **Named SA case studies on `/plans`** — the highest-leverage open item. The price increases carry more bounce risk without a trust signal (e.g. "Plumber in Centurion, calls up 3.2x in 90 days"). Not yet done.
- **Disable the Google OAuth provider in the Supabase dashboard.** The site no longer uses it, but the provider stays enabled server-side until it is switched off by hand. Not yet done.
- **Orphaned auth data:** the `profiles` table and any existing user accounts are now unused. Data and RLS left untouched — decide whether to clean up.
- Contact-form automation (n8n): on submit → email confirmation ("received your strategy-call request, will be in touch within one day") + import phone into WhatsApp Business to send a Google Meet booking link. Built in the automation engine.

### Open questions

- Whether to add the case-study trust signals before/after further pricing moves.
- Whether the `shaders` hero is worth ~1.2 MB of JS on a South African mobile connection, or whether it should be lazy-loaded / swapped for a static image on mobile. Not yet measured on a real device.
- Whether the static hero fallback should be used on *all* mobile devices, not just pre-WebGPU ones, to save the shader's download cost on metered connections.
- Whether to add typescript-eslint so `npm run lint` covers the `.tsx` app code again.

---

## Zanovo Dashboard (separate repo: `~/Claude/Projects/zanovo-dashboard`)

Internal CRM/monitoring app. **Do not mix into the marketing-site repo.**

### Facts

- **Stack:** one Expo codebase targeting iOS **and** web (locked decision — not two codebases). Expo Router, Supabase, platform-aware auth storage (SecureStore native / localStorage web). Web build uses a persistent left sidebar; native uses bottom tabs (`app-tabs.web.tsx` vs `app-tabs.tsx`).
- **Supabase project:** `rvaxrzewjikepmmlwxra`. CRM schema already live: `contacts`, `deals`, `activities`, `site_health`, `device_tokens`, plus a nullable `converted_to_contact_id` on `leads`. Owner-scoped RLS on every new table. Paystack `transactions` and client `profiles` tables live in the **same** project.
- **Login:** `thabiso@zanovo.co.za` / temp password `ZanovoDash2026!` (change via Supabase → Authentication). This account pre-existed from planning. TK's Google login `tkmolekwa269@gmail.com` is a separate OAuth account.
- Push notifications are **iOS-only** (accepted gap). `send-push` edge function is live; `SEND_PUSH_SECRET` must be set as an Edge Function secret in the Supabase dashboard.

### Decisions

- **Direction: "Agency Command Center"**, not a pure sales CRM — three pillars mirroring the client lifecycle: **Acquire** (Leads + Pipeline, built) → **Deliver** (the build) → **Retain** (site health + traffic + Care, scoped per client). Money module (MRR from Care + Paystack) and an AI layer fold in. Stays single-user (no multi-tenant over-build).
- **Care plans** modeled as a new `care_plans` table (`contact_id`, `cadence`, `last_serviced_at`, `next_due_at`, `status`, `price_monthly`) — a "client" is just a `contact` with an active care plan. TK explicitly wants **maintenance-due tracking** front and center.
- Web-first build order; native stays scaffolded-but-dormant. Migrations are **reviewed before being applied** to the live DB — never applied silently.

### Action items / status

- `leads` table needed an UPDATE policy + a table-level `GRANT SELECT` to `authenticated` (a prior security-hardening migration stripped access) so the dashboard can read/convert the 23 existing leads — prepared as a reviewable migration.
- Planned tables for the Retain direction: `care_plans` (Retain spine) and `sites` (`url`, `contact_id`; `site_health` gains `site_id`, so it can monitor all client sites, not just zanovo.co.za).

### Open questions

- "Convert to Contact" dedup behavior when an incoming lead's email matches an existing contact (create duplicate vs. merge/attach).
- Whether Care plans/subscriptions are tracked anywhere structured today vs. only informally.

---

## Zanovo Automation Engine (separate repo: `~/Claude/Projects/zanovo-automation`)

### Facts

- **n8n** inbound-intake / outbound-preview pipeline, Docker + Cloudflare tunnel.
- **DNS gotcha:** `zanovo.co.za` nameservers point at Vercel, so requests to `automation.zanovo.co.za` are intercepted by Vercel's edge (`DEPLOYMENT_NOT_FOUND`) before reaching the Cloudflare tunnel.
- Lead matching writes to Supabase; workflow items carry a `"kind"` of `patch`/`candidate`.

### Action items / status

- n8n workflow debugging: a node showing only one green checkmark usually means a single node was run in isolation ("Test step"), not the whole chain from the trigger.

---

## Runway (personal repo: `~/Claude/Projects/runway`)

TK's strict personal budgeting iPhone app. Scaffolded + committed (commit `24b05ad`).

### Facts

- **Stack:** Expo iPhone app, **local-only SQLite**, no cloud. Mirrors the zanovo-dashboard Expo conventions (same sideload pipeline).
- **Core model:** hard-locked envelopes — payday auto-split (fixed → percent → remainder rules); an empty envelope **refuses** planned spends; moving money requires a logged reason (append-only override ledger). Actuals are never blocked by the lock (reconciliation settles planned spends to actual, else writes an unplanned spend).
- **Bank parsers:** `sniffParser()` dispatches to FNB + Nedbank/Discovery. Discovery statements arrive as **text-layer PDFs** (no OCR needed) — parsed by reconstructing the table from text positions via pdf.js inside a hidden WebView; pure parsing logic is unit-tested (9 tests) against a real statement. FNB target was CSV.
- **Payslip upload** (Income screen): reads a PDF on-device, scans for net-pay terminology across payroll systems (confirmed SimplePay "NETT PAY"; also "Net Pay"/"Take Home Pay"), pre-fills an editable amount. Extended to pull **gross, tax (PAYE), UIF, net** independently, guarded to take the *employee's* UIF line not the employer's. `payslip_history` table logs every upload (informational; never touches the split).
- Tabs: Calendar (home, forecast banner: "Storm Warning"/"Clear Skies"), Envelopes, Subscriptions, Income, plus day-detail. Rides the same Sun/Wed 12:00 cert-refresh schedule as Rync + dashboard once installed.

### Decisions

- Build the testable pure-logic engines first; keep react-native imports out of the vitest target so business logic stays pure.
- Don't guess bank/payslip layouts — build parsers only against real redacted samples.

### Action items / status

- **Blocked earlier on real statement samples;** Discovery PDF parser now built against a real statement. WebView/pdf.js extraction plumbing still needs an on-device smoke test (couldn't verify from the session — no simulator).
- Wire Runway into `~/ios-cert-refresh/refresh.sh` (done — Release config, `DEVELOPMENT_TEAM=FQ24Q6UYMV`, installs via `devicectl`) so it rebuilds Sun/Wed with the others after first manual install.

### Open questions

- FNB export format — if FNB offers OFX/QIF, prefer that over CSV (structured, more reliable to parse).

---

## Happenin (personal repo: `~/Claude/Projects/happenin`)

All-events discovery app, pre-launch. **Rebranded 2026-07-09 from "CapePlug"** → Happenin.

### Facts

- **Positioning:** all-events (festivals, comedy, markets, day parties, club nights), **city-neutral brand that launches in Cape Town** — deliberately not nightlife-only and not SA-locked, for scaling. Tagline: "Everything happening, matched to you."
- **Name/domains:** chose **Happenin** (dropped-'g', Gen-Z-native, echoes real speech; runner-up JoinPlans). `happenin.app` (primary) + `happenin.co.za` (launch market) both secured. Rule internalized: stop letting the bare `.com` gate a mobile-first brand — `.app` qualifies.
- **App stack:** Expo SDK 54 (expo 54.0.36, RN 0.81.5, expo-router 6.0.24) + **NativeWind** (Tailwind) — TK explicitly wanted Tailwind though the dashboard doesn't use it. Brand color hot magenta **#FF1E7A**, full light/dark. Prototype runs with zero backend so it films cleanly for reels (`~/Claude/Projects/happenin/app`, `npm run web`).
- **Revenue model:** affiliate — event detail shows price + "Book Now" opening an **external ticket link**, no in-app payment (example event R650).
- **Backend:** Supabase table `happenin_waitlist` (RLS anon insert-only, 18+ constraint preserved). Real-app swap point documented in `app/src/lib/supabase-stub.ts` (mock data → age-gated RLS reads).
- **App flow:** signup captures DOB (sets age tier). A resident/visitor gate comes first — "I live in Cape Town" → straight to feed; "I'm visiting" → a visitor questionnaire (dates, party size, interests, plan-my-week option, WhatsApp contact).

### Decisions

- Coded prototype **is** the V1 foundation (zero throwaway) — chosen over Figma/XD/ProtoPie mockups. Use Figma only alongside code for visual exploration; skip Adobe XD (discontinued).
- **Co-founder strategy** (doc `docs/08-cofounder-split.md`): split **demand vs. supply** (one owns audience/content, one owns venues); do **not** bring on a technical co-founder (product is the smallest engine). Non-negotiables: 4-year vesting w/ 1-year cliff; avoid reflexive 50/50 (TK originated idea, built prototype, owns brand/domains/funding → 60/40 or 70/30); split decision rights per domain; written founders' agreement + IP assignment reviewed by an actual attorney before either does a day of work; venue owners get exactly one point of contact. "Founding 50" program solves the "hands" problem at zero equity.

### Action items / status

- Prototype built, verified end-to-end (typecheck clean), committed. SDK 54 downgrade flushed out a real bug: `react-native-svg` was an undeclared transitive dep that lucide (all icons) needs — every icon would have crashed on device; now pinned.
- **Parked (waiting on TK):** landing-page designs and promo pages/app prototypes — not built speculatively. When resuming, TK to decide: one landing page or A/B variants; clickable web mockup vs. static carousel frames.
- Native iOS Simulator builds deferred to **after midnight** per the machine rule.

---

## South Central (client WordPress site — `south-central.co.za`)

Client business-directory site. Zanovo maintains it. **No local project** — edited live via WordPress admin (Customizer Additional CSS, Site Editor, WPCode, or REST API).

> Note: `southcentralbiz.com` is a *separate* related site (Pagelayer/PopularFX theme) used as a reference for the footer; `south-central.co.za` is the live Gutenberg block site being maintained.

### Facts

- **Build:** WordPress block editor (Gutenberg) — `wp-block-group`, `wp-block-columns`, `wp-block-column`, etc. Spacing presets: `--wp--preset--spacing--80` ≈ 5.06rem (~81px), `--...--50` ≈ 1.5rem (~24px).
- **Plugins:** WPForms, **AccelerateWP** (the only cache plugin — the "rocket" text seen is AccelerateWP's internal library, *not* a second WP Rocket install), WPCode, Site Kit by Google, Spectra (UAGB). Server is LiteSpeed, no Cloudflare.
- **Directory:** 12 category tiles = manually-placed blocks (heading + linked image), 3 rows of 4. No auto-alphabetize — reorder via List View drag. 56 directory images total.
- **Footer:** carries a Zanovo "WEBSITE MAINTAINED BY ▼ ZANOVO" bar (black background, right-aligned, above the grey "Powered by LOVE" bar, links to zanovo.co.za) + clickable tel/mailto contacts — copied to match southcentralbiz.com. Wrap-safe (`flex-wrap`, 40px black strip, eager-loaded logos).

### Decisions / lessons

- **Caching is the recurring gotcha:** after *every* footer/CSS edit, purge via **AccelerateWP → Clear and Preload Cache** — stale cache repeatedly made correct changes look broken (the footer bar "not showing" was pure cache, content was always saved correctly).
- **Do NOT combine JS/CSS** — on HTTP/3 with many plugins (Elementor, Spectra, sliders, forms) it's high-risk for near-zero gain. Enabled the other safe AccelerateWP optimizations (Defer JS, etc.); they were all previously off (basic page caching only).
- Scope CSS by page context: the homepage hero needs `.wp-block-cover { min-height: 45vh }`, but interior banners (e.g. `/motivation`) don't — use `body.home` / `body:not(.home)`.

### Action items / status

- **Left on the table (TK's call):** hero image is a 328KB PNG (`banner-image.png`) — converting to WebP/JPG cuts ~70%; AccelerateWP's auto image optimization is a **paid** upgrade so this is best done by hand.
- 90 JS + 43 CSS files load un-combined; combining is intentionally declined (see decision above).
- WordPress admin **session keeps expiring** mid-task — Claude can't enter passwords, so TK must re-login before Customizer/Site-Editor edits.

---

## Overflow Church (client site — `~/Claude/Projects/OverflowChurch`)

Rebuilt marketing site for Overflow Church, Fish Hoek, Cape Town. A React rebuild of their old Wix site, adapted from the Zanovo site template.

### Facts

- **Stack:** Vite + React 19 + Framer Motion (replacing the old Wix bundle/scroll-hijack). Tokens live in `src/tokens.js`.
- **Brand/design:** light cream `#F8F5EF` background (matches original beige); rose `#E11D48` accent kept for links/brand; **slate-grey gradient** (`#94A3B8 → #475569`) logo + "CHURCH" wordmark; "OVERFLOW CHURCH" set in the **Righteous** typeface (art-deco, matches original logo). Logo mark = two crescent arcs forming an O.
- **Sections (replaced Zanovo's Pain/Services/Process/Pricing):** About/"Our Story" (Pastor Ryan & Tammy; 2019 → "Fullies" → renamed Overflow Church **Feb 2023**; John 7:37–38), Alpha, Church Life, Give, Contact. Tagline: "We are the church that overflows in God's Love, His Grace & in His Power." Values: LOVE · GRACE · POWER.
- **Church Life:** 7-day calendar grid (Sun–Sat) with the real schedule (Sunday Service 09:00; Mon Prayer Night 18:30; Life Groups Tue/Wed/Thu 19:00; etc.); events are clickable → pre-filled Google Calendar "add event" links. Auto-rotating slideshow (6s) replaced the "Plan a Visit" pink block.
- **Give page** (replaces checkout): EFT bank details with click-to-copy, plus QR/other methods — **placeholder** account `62XXXXXXXXX` + FNB Fish Hoek (250655) as a guess.
- Contact: WhatsApp as primary CTA + Facebook/Instagram/YouTube social icons (URLs in `CHURCH.socials`).
- **Deliverables produced:** a Before → After redesign PDF (9 pages, 5.8MB) and an editable DOCX, both saved to `~/Desktop/Overflow Church/`.

### Action items / status

- **Before going live:** replace the placeholder bank details in `src/tokens.js` with the church's real banking info. Swap in real Overflow Church photos (`STORY_PHOTOS`, `SLIDES` in `tokens.js`).

### Open questions

- Real banking details and real photography still outstanding.

---

## Rync (personal iOS app — built as `HyroxStrength`)

TK's hybrid-fitness iPhone app (strength + HYROX + cardio/running + nutrition). **Renamed HyroxStrength → Rync** mid-project.

### Facts

- **Stack:** native Xcode (SwiftUI, SwiftData), hand-generated `project.pbxproj` via `generate_project.py` (no Swift Package Manager). Scheme `HyroxStrength`, signing team `FQ24Q6UYMV`, **bundle ID `com.tkmolekwa.HyroxStrength` (kept unchanged** through the rename so data + Supabase config survive; SwiftData automatic lightweight migration preserves existing data).
- **Rename:** only user-facing strings changed (CFBundleDisplayName, permission strings, PrivacyOverlay, DataExporter, userAgent); internal IDs untouched. The rename **also resolved the biggest legal risk** — the name no longer contains "HYROX" (now only descriptive/nominative use with a non-affiliation disclaimer).
- **Backend:** Supabase (project `https://uhxtbahzsjrlfispdqps.supabase.co`) via **dependency-free hand-rolled clients** over URLSession (chosen over `supabase-swift` because of the generated pbxproj): `SupabaseAuthService` (GoTrue REST), `SupabasePostgrestClient` (PostgREST), `SyncEngine` (push dirty → pull since watermark → last-write-wins). Tokens in iOS **Keychain**; ATS `NSAllowsArbitraryLoads=false`.
- **Schema:** `0001_initial_schema.sql` = 17 tables, **RLS on every one**, owner-only CRUD, auto-profile trigger. `0002_account_deletion.sql` = `delete_my_account()` SECURITY DEFINER RPC (Apple-required in-app account deletion, cascades to all user data). Applied via SQL Editor (app only carries the publishable key, which can't run DDL — the security boundary working as intended).
- **Health/fitness:** HealthKit as source (steps live via `HKObserverQuery`; sleep/recovery are **computed estimates**, labeled "est.", via `ReadinessCalculator`). Live cardio = full GPS/pace/distance on phone; live HR only real with a paired Apple Watch (iPhone has no HR sensor) or a BLE HR strap (service 0x180D). `GoalPlanner` = pure Mifflin–St Jeor TDEE → recommended **calories + macros + weekly cardio only, never food advice**; fully editable, non-medical disclaimer. Nutrition search (OpenFoodFacts) prioritizes English + user's country.
- **Legal docs:** full set tailored to Rync, POPIA + GDPR compliant (privacy, ToS, health disclaimer, copyright/IP, app-privacy nutrition label). 6-doc "vibecoding" pack + backend/security architecture doc + a 50-point vulnerability audit (36 ✅ / 10 🟡 / 6 ⬜).
- **Brand:** final app icon = glowing lowercase **"rync"** in Libre Baskerville, white letters + blue aura (`#2E9BFF`/`#6CC8FF`) on off-black, flattened opaque 1024×1024 (App Store rejects transparency). Design assets in `FitnessApp/design/rync-glow/`.

### Decisions (locked, do not silently re-open)

- **Supabase** backend; cloud sync + social + AI coaching; email/password + 2FA; **free at launch** (schema future-proofed for a Pro tier). Dependency-free clients over the SDK. Never test in the simulator — **TK reports issues from the app on his phone.**

### Security constraints (must persist)

- **Never put the Supabase service-role/secret key in the app** — only the publishable/anon key (public, guarded by RLS) belongs in Info.plist. TK once pasted a `sb_secret_...` key in chat; it was **refused, flagged as compromised, and must be rotated.** The correct `sb_publishable_...` key was then used.

### Action items / status

- Both SQL migrations (`0001`, `0002`) to be run in the Supabase SQL Editor.
- Dashboard settings still owed on Supabase: enable **leaked-password protection** + CAPTCHA; tune login rate limits. Add RLS-denial tests + a pen-test before launch.
- Installs to TK's iPhone on the automatic **Sun/Wed 12:00** launchd cert-refresh schedule (free Apple ID 7-day cert), 11:50 heads-up notification, rebuilds strictly 10:00–16:00. One trust-per-Apple-ID covers Rync + Zanovo Dashboard + Runway.

### Open questions

- Timing of "Sign in with Apple" (App Store requires it once any social login ships); coach/multi-athlete role spec; leaderboard fairness rule.
