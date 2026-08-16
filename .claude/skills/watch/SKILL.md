---
name: watch
description: Monitor a target over time and report only when something meaningfully changes. Use when the user wants an eye kept on a live site, a competitor's pricing or copy, a deploy, a CI run, a Supabase table, an API response, or a file, and wants to hear about it only if it moves. Triggers on "/watch", "keep an eye on", "monitor", "tell me if X changes", "let me know when this goes down", "is it back up yet". Do not use for a one-off check — just check it and answer.
---

# watch

Watching is not checking repeatedly. Checking repeatedly produces noise. Watching
produces a baseline, compares against it, discards the parts that always change,
and speaks only when something real moved.

Most of this skill is about the discarding.

## What this skill does and does not do

**Does:** define the target, capture a baseline, diff subsequent checks against it,
suppress known-noisy fields, classify severity, and report changes worth a human's
attention.

**Does not:** stay running by itself. A conversation cannot watch anything while it
is closed. Pick a runner:

| Runner | Lifetime | Use for |
|---|---|---|
| `/loop <interval> /watch <target>` | While the session is open | Watching a deploy land, a CI run finish, a fix take effect |
| GitHub Actions cron | Permanent, survives everything | Uptime, competitor pages, anything that matters at 3am |
| Manual `/watch <target>` | Single comparison | Checking what changed since the last baseline |

`Projects/Zanovo/api/site-health-check.js` plus its Actions cron is the existing
example of the permanent pattern. Extend that rather than rebuilding it when the
target is site health.

**Always say which runner is in play.** Never let the user believe a closed session
is still watching something.

## State

Each watch keeps a baseline at `.claude/watches/<name>.json`:

```json
{
  "name": "zanovo-uptime",
  "target": "https://www.zanovo.co.za",
  "type": "http",
  "created": "2026-08-16T14:00:00Z",
  "lastChecked": "2026-08-16T14:30:00Z",
  "checks": 7,
  "baseline": { "status": 200, "contentHash": "…", "significantFields": {} },
  "ignore": ["csrf-token", "timestamp", "build-id"],
  "history": [{ "at": "…", "change": "…", "severity": "…" }]
}
```

Rules:
- First run on a new target establishes the baseline and reports **nothing except
  that the baseline is set**. There is nothing to compare against yet. Say so.
- Keep the last 20 history entries. Trim beyond that.
- Never commit a watch file containing credentials, tokens, or private response
  bodies. Store a hash, not the body, when the body is sensitive.

## Target types

| Type | What is compared |
|---|---|
| `http` | Status code, response time band, and a hash of the meaningful body |
| `content` | Rendered text of a page, after stripping the noise fields below |
| `git` | Branch head, CI status, open PR count on a watched repo |
| `file` | Contents or mtime of a local path or glob |
| `command` | stdout of a command, exit code |
| `supabase` | Row count or result set of a named read-only query |

If the target is ambiguous ("watch the site" — uptime, or copy changes?), pick the
reading that would hurt more if missed, state the pick in one line, and proceed.
Do not stall the watch on a clarifying question.

## Workflow per check

1. **Fetch** the target once. One request per check, no retries unless the failure
   is a timeout, and then a maximum of two.
2. **Normalise** — strip the noise fields before comparing anything.
3. **Compare** against the baseline.
4. **Classify** severity.
5. **Report or stay silent.** Silence is the correct output for an unchanged target.
6. **Update** `lastChecked` and `checks` whether or not anything changed. Append to
   history only on a real change.

## Noise suppression

This is where a watcher earns its place. Strip these before comparing, always:

- Timestamps, dates, relative times ("3 minutes ago"), and cache headers
- Session IDs, CSRF tokens, nonces, request IDs, trace IDs
- Build hashes and asset fingerprints in filenames, unless the watch is specifically
  on deploys
- View counters, like counts, "N people are looking at this"
- Rotating content: ad slots, testimonial carousels, "related posts"
- Whitespace and attribute ordering in HTML

When a field changes on three consecutive checks, it is noise. Add it to `ignore`,
say once that it was added, and stop reporting it. A watcher that cries wolf gets
muted, and a muted watcher is worse than none.

Never suppress: status codes, pricing, contact details, legal and policy text,
anything the user explicitly named as the thing being watched.

## Severity

| Level | Meaning | Response |
|---|---|---|
| **Critical** | Target down, returning 5xx, or a payment or lead path is broken | Report immediately and interrupt whatever else is happening |
| **Notable** | Meaningful content change: price moved, copy rewritten, a feature appeared | Report at the next natural break |
| **Minor** | Small wording or layout change, no substantive difference | Batch it — report with the next Notable or on request |
| **Noise** | Matched a suppression rule | Silent. Do not mention it |

A target that recovers is Critical too. "Back up after 14 minutes" is news.

## Report format

Unchanged:
```
zanovo-uptime — no change (check 8, 200, 340ms)
```
One line. Do not expand it.

Changed:
```
zanovo-uptime — NOTABLE
Was:  Starter package R7 500
Now:  Starter package R8 500
Seen: 2026-08-16 14:30, previously matched on 6 checks
```

Always show old value, new value, and when it changed. A change report without the
previous value is not actionable.

## Guardrails

1. **Do not hammer.** Minimum 60 seconds between checks on any target, minimum
   15 minutes on a third party's site. Aggressive polling of a competitor's site is
   rude, gets the IP blocked, and is visible in their analytics.
2. **Public and permitted targets only.** No authenticated scraping of a service the
   user does not own, no bypassing rate limits or blocks, no evading a robots
   directive on a third-party site.
3. **Read-only.** A watch never writes to the thing it watches. Supabase watches use
   read-only queries against tables the user owns.
4. **No secrets in state.** See the state rules above.
5. **Stop on request, and stop when pointless.** If a target has 404'd for five
   consecutive checks, the thing is gone — report that conclusion and stop rather
   than logging it forever.

## Starting a watch

Ask for nothing that can be inferred. From "watch zanovo.co.za" build:

```
name:     zanovo-uptime
target:   https://www.zanovo.co.za
type:     http
interval: 15m  (suggest a runner, do not assume one is running)
```

State the four fields back in one block, note that the baseline is now set, and name
the runner needed to keep it alive. Then stop. Do not begin polling inside a session
without the user choosing a runner.
