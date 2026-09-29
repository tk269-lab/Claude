# Zanovo — marketing site + content pipeline

Live site www.zanovo.co.za: AI-powered websites, lead capture and automation for South African small businesses. Project facts, prices and open items are in `context.md` (Zanovo section by default; other projects have their own sections there but separate repos, listed at the bottom).

## Layout

- `src/` — React 18 + TS + Tailwind + Vite SPA. No auth, guest-only checkout. `src/_archive/` is dead code.
- `src/lib/plans.js` + `addons.js` — the only place prices live (cents). Checkout and the plans page derive from them; never hardcode a price.
- `api/site-health-check.js` — Vercel function called by the GitHub Actions health cron.
- `supabase/` — migrations and edge functions.
- `content-pipeline/` — SQLite social pipeline (ideas → review → drafts → approve), driven by `/pulse`, `/review`, `/generate-content`, `/approve`.
- `.claude/skills/` — mostly vendored; don't edit their internals (supadata is Zanovo-customized).
- `outputs/`, `analytics-reports/`, `security-report/` — generated, not source.

## Verify

`npm run build` (`tsc -b` is the real type check) + `npm run lint` + browser preview. There is no test suite; don't add one unprompted. Lint only covers `.js`/`.jsx`.

## Gotchas

- The git root is `~/Claude` (a large personal folder with `.vercel/` secrets), not this folder. Stage specific files; never `git add -A`.
- Hero shader uses WebGPU in a blob worker: keep the `navigator.gpu` fallback in `Home.tsx` (older SA Android/iOS), keep `worker-src 'self' blob:` in the CSP, and never call `getContext('webgl')` on that canvas to debug (it locks the context type and breaks the render loop).
- `vercel.json` excludes `/api/` from the SPA rewrite on purpose (commit 89d496a). Don't simplify the regex.
- `main` auto-deploys to production. Manual deploys need `--cwd /Users/tk/Claude` (Vercel root is `Projects/Zanovo`).

## Rules

- Pushing to `main` needs TK's explicit go on a plain-English summary of the change, after build + lint pass.
- Drafts publish only via TK's approval in `/approve`.
- Copy: professional, warm, direct, sparing contractions, ZAR pricing. No stat or client claim without a real source.

## Related repos (don't mix code in)

`../zanovo-dashboard` (CRM app) · `../zanovo-automation` (n8n engine) · `../zanovo-redesign` (design experiments)
