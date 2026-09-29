# Zanovo context

Facts and open items for the Zanovo marketing site and automation engine. **Last verified: 2026-09-29.** If this contradicts the code, the code wins; fix the entry.

Other projects keep their context in their own repo, where it loads automatically:
Dashboard `../zanovo-dashboard/CLAUDE.md` · Runway `../runway/AGENTS.md` · Happenin `../happenin/app/AGENTS.md` (strategy in `../happenin/docs/`) · Overflow Church `../OverflowChurch/CLAUDE.md` · Rync `~/Dev (Code & Tools)/Fitness App (personal app project)/CLAUDE.md` · South Central (no repo) in Claude's memory notes.

## Marketing site (www.zanovo.co.za)

- Supabase for lead capture, Paystack for payments, no CMS.
- Prices (source of truth is `src/lib/plans.js`):
  - Build: Starter R6,500 setup + R2,500/mo · Growth R9,500 + R5,500/mo (anchor) · Growth Max R25,000 + R9,500/mo
  - Care: Essential R750/mo · Pro R1,500/mo · Premium R2,500/mo
- Routes: `/` · `/plans` (private pricing link, `noindex`, not in sitemap) · `/care` · `/checkout` · `/privacy` · `/refund` · `/terms`. Unknown routes (including `/login`) redirect to `/`.
- Edge functions: `send-lead-email`, `paystack-webhook`, `generate-report`, `notify-whatsapp-click`.
- Health cron: GitHub Actions (`~/Claude/.github/workflows/site-health-cron.yml`) calls `/api/site-health-check` with `CRON_SECRET`; the endpoint pings every row in the dashboard's `sites` table.

### Open

- Named SA case studies on `/plans`: the highest-leverage open item; price rises carry bounce risk without a trust signal.
- Disable the Google OAuth provider in Supabase (unused but still enabled server-side).
- Orphaned `profiles` table and old user accounts: decide whether to clean up.
- Is the ~1.2 MB shader hero worth it on SA mobile data? Never measured on a real device.
- Add typescript-eslint so lint covers `.tsx`.
- `api/site-health-check.js` still has a stale `TODO` saying push isn't sent; the dashboard's migration 0011 trigger now sends site-down pushes.

## Automation engine (`../zanovo-automation`)

- n8n inbound-intake / outbound-preview pipeline, Docker + Cloudflare tunnel. Writes lead matches to Supabase; workflow items carry a `kind` of `patch`/`candidate`.
- DNS trap: `zanovo.co.za` nameservers point at Vercel, so `automation.zanovo.co.za` is intercepted by Vercel's edge (`DEPLOYMENT_NOT_FOUND`) before it reaches the tunnel.
- Debugging: a node with a single green tick usually means someone ran "Test step" alone, not the whole chain from the trigger.
- Status: scaffolded, blocked on API keys.
