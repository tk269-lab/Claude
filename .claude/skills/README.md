# Skills

Skills in this folder load automatically in **every** Claude Code session for this
repo — local terminal sessions and cloud sessions on claude.ai/code alike, and from
any subdirectory including `Projects/Zanovo`.

## Where skills can live

| Location | Loads in | Committed to git |
|---|---|---|
| `<repo>/.claude/skills/<name>/SKILL.md` | This repo, local + cloud | Yes — this folder |
| `~/.claude/skills/<name>/SKILL.md` | Every project, local machine only | No |
| claude.ai → Settings → Capabilities → Skills | Every cloud session, any repo | No (synced by Anthropic) |

A plain folder of markdown (the old top-level `Skills/` directory) is **not** a skill
install. Claude Code does not read from arbitrary paths — it reads the three locations
above and nothing else.

## Rules for adding a skill here

1. One folder per skill: `.claude/skills/<name>/SKILL.md`.
2. The folder name must match the `name:` field in the SKILL.md frontmatter, lowercase
   and hyphenated. A mismatch means the skill silently fails to load.
3. Frontmatter needs `name` and `description`. The description is what Claude matches
   against to decide when to trigger the skill, so write it as trigger conditions, not
   as a summary.
4. Supporting files (`personas.md`, `benches.md`, reference docs) sit beside SKILL.md in
   the same folder and are referenced by relative path.

## What is here

- `crucible/` — multi-persona council that stress-tests a decision. Invoked deliberately
  via `/crucible`, not automatically. Supporting data in `personas.md` and `benches.md`.
- `frontend-developer/` — frontend implementation persona (React/Vue/Angular, UI, perf).
- `i-have-adhd/` — output shaping: action-first, numbered steps, no preamble. From
  github.com/ayghri/i-have-adhd (MIT). Moved here from `Projects/Zanovo/.claude/skills/`
  so it applies repo-wide.

## Personal skills vs repo skills

Skills about **how TK reads output** (`tk-context`, `i-have-adhd`) ideally live in
claude.ai → Settings → Capabilities → Skills, so they apply in every session everywhere,
including repos other than this one. Skills about **how this repo works** belong here.
