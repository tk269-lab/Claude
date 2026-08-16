---
name: verify-research
description: |
  Check the factual claims in a piece of text against sources whose authority can be proven —
  peer-reviewed literature, accredited tertiary institutions anywhere in the world, government
  statistics bodies. Reports which claims are not carried by a qualified source, and lists every
  source it rejected and why. Uses your own WebSearch/WebFetch, so it costs no API credits.
  Trigger phrases: /verify, "verify this", "check these claims", "is this sourced",
  "fact-check this", "check the sources on this", "are these claims real",
  "verify before I publish", "check this draft for unsourced claims".
  NOT an AI-content detector — it does not ask whether a model wrote the text.
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - WebSearch
  - WebFetch
  - AskUserQuestion
---

# verify-research

You do the judgement. A local script does the registry lookups and the report.

The script never calls a model and needs no API key. Everything requiring thought — splitting the
text into claims, searching, quoting, ruling on the evidence — you do with your own tools, in this
conversation.

## Locate the tool

The verifier is machine-global, not tied to any project. Resolve it in this order — first hit wins:

```bash
VERIFIER="${RESEARCH_VERIFIER_HOME:-}"
if [ -z "$VERIFIER" ] || [ ! -f "$VERIFIER/src/gate.js" ]; then
  for candidate in "$HOME/.claude/tools/research-verifier" \
                   "$HOME/Claude/Projects/Zanovo/research-verifier"; do
    if [ -f "$candidate/src/gate.js" ]; then VERIFIER="$candidate"; break; fi
  done
fi
ls "$VERIFIER/src/gate.js"
```

1. **`$RESEARCH_VERIFIER_HOME`** — the user-controlled override.
2. **`~/.claude/tools/research-verifier`** — the canonical home.
3. **`~/Claude/Projects/Zanovo/research-verifier`** — the pre-relocation path, kept only so an old checkout still works.

If none of them exist, stop and tell the user every path you looked at. Do not reimplement the gate.

## Step 1 — Get the text

From the command argument, a file the user names, or the current selection. If none is obvious, ask
which text to check. Ask for a one-line topic if the subject is ambiguous — it sharpens the searches.

## Step 2 — Decompose into atomic claims

One assertion per claim. Split conjunctions, and split a causal statement from the facts it links.

- Make each claim self-contained: resolve every "this", "they", "the study" against the surrounding text.
- Preserve numbers, units, dates, populations and qualifiers exactly. "Around 40% of adults" is not
  "40% of people".
- Set aside opinions, recommendations, value judgements and predictions as **skipped** — no source can
  settle those. Do not judge them.
- Do not invent claims the text does not make.

Cap at ~25 claims unless the user asks for more.

## Step 3 — Search and quote

For each claim, search for **primary** sources: peer-reviewed papers, official statistics, material
from accredited universities and government agencies. If a news article reports on a study, find and
fetch the study itself — the news article will be rejected by the gate anyway.

WebFetch the promising pages and take **verbatim quotes** from the fetched text. This is the point of
running in-conversation rather than through the API: you are reading the actual page, so the quotes
are real.

- Never paraphrase a quote. Never reconstruct one from memory.
- If a page cannot be fetched, do not quote it. Put its URL in `seen_urls` instead.
- Quote enough to show **what was measured, in what population, and when**.
- Actively look for evidence that contradicts the claim, not just support.
- Record every URL you looked at in `seen_urls`, including ones you did not quote. The rejection log
  is half the value of the report.

## Step 4 — Gate the sources

Write the JSON to a temp file and run stage 1:

```bash
node "$VERIFIER/src/gate.js" gate < claims.json > gated.json
```

Input shape:

```json
{
  "input_label": "draft.md",
  "claims": [
    {
      "id": "c1",
      "text": "Self-contained restatement of the claim.",
      "original": "The span exactly as written in the source text.",
      "coverage_note": "What the search could not find.",
      "evidence": [
        { "url": "https://...", "quote": "verbatim passage",
          "author": "Named author or empty string",
          "institution": "Stated affiliation or empty string" }
      ],
      "seen_urls": ["https://...", "https://..."]
    }
  ],
  "skipped": [
    { "id": "c9", "original": "We should invest more here.", "note": "recommendation, not a factual claim" }
  ]
}
```

Stage 1 prints a readable brief of the admissible evidence to stderr. Read it.

Useful flags: `--tier A` (drop preprints and lone professionals), `--academic-only` (peer review and
universities only, no government or standards bodies).

## Step 5 — Rule on each claim

**Use only the sources listed under `admissible` in `gated.json`.** Stage 2 rejects the run if you
cite anything else, and that guard is there on purpose.

This is the discipline that makes the tool worth anything: if you know a claim is true but no
admissible source in front of you establishes it, the verdict is **`unsupported`**. That is the
correct answer, not a failure. Your background knowledge is not evidence.

Verdicts:

- `supported` — admissible evidence establishes the claim as written.
- `partially_supported` — direction is right, but magnitude, population, timeframe or certainty is
  overstated. Put what the evidence *does* support in `corrected_statement`. This counts as unverified.
- `contradicted` — an admissible source states the opposite.
- `disputed` — admissible sources genuinely disagree with each other.
- `unsupported` — nothing admissible settles it either way.

Match the claim exactly. Evidence about a different population, period or measure does not support it —
mark that source `irrelevant` and say so.

Rate each source's `depth` on the quoted text alone: `substantive` (states method, population, limits),
`adequate` (specific but partial), `shallow` (asserts without method, sample or caveat, however
well-known the publisher).

Never inflate confidence to be agreeable. `low` is right when the evidence is thin.

Add to each claim in `gated.json`:

```json
"adjudication": {
  "verdict": "partially_supported",
  "confidence": "medium",
  "rationale": "Two or three sentences referencing the quoted evidence, not general knowledge.",
  "corrected_statement": "What the evidence actually supports, or an empty string.",
  "source_appraisals": [
    { "url": "https://...", "stance": "supports|contradicts|mixed|irrelevant",
      "depth": "substantive|adequate|shallow", "depth_note": "One clause, or empty string." }
  ]
}
```

## Step 6 — Render the report

```bash
node "$VERIFIER/src/gate.js" report --json < ruled.json
```

Exit code 2 means at least one claim did not stand up. That is a normal outcome, not an error.
Exit 1 is a real failure — read the message.

## Step 7 — Tell the user

Lead with the count of claims that did not stand up and the worst offender. Then, briefly:

- each unverified claim and what the evidence actually supports instead
- any flagged sources, with the reminder that dissent is not error — a single good study can be right
  against a crowd, so these are prompts to look, never grounds to discard
- the report path

Do not restate the whole report. They can open it.

## Honesty rules

- **"Unsupported" means unproven, not false.** Say it that way.
- Depth ratings are your judgement. Registry results (ROR, Crossref, OpenAlex) are measured. Do not
  blur the two when summarising.
- If you could not fetch much, say so plainly rather than presenting a thin run as thorough.
- Never quietly widen the policy to make a claim pass. If the user wants government or industry
  sources admitted, that is their call to make explicitly.
