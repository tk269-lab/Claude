---
description: Check the factual claims in a piece of text against provable-authority sources — peer-reviewed literature, accredited universities, government statistics bodies. Reports unsupported claims and logs every source it rejected and why.
argument-hint: <file-path-or-pasted-text> [topic]
allowed-tools: [Read, Write, Bash, Glob, Grep, WebSearch, WebFetch, AskUserQuestion]
---

Invoke the `verify-research` skill (defined in SKILL.md) with the user's arguments: $ARGUMENTS

Follow the skill's full pipeline: locate the gate at `$RESEARCH_VERIFIER_HOME`, else `~/.claude/tools/research-verifier` → get the text → decompose into atomic, self-contained claims → search for primary sources and WebFetch verbatim quotes → `gate.js gate` → rule on each claim using only admissible evidence → `gate.js report --json` → report the claims that did not stand up.

Hold the skill's honesty rules: "unsupported" means unproven, not false; background knowledge is not evidence; never widen the source policy to make a claim pass. If the user gave no argument, ask which text to check before proceeding.
