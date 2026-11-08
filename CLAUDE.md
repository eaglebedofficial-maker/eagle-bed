# Working rules (token + quota efficiency)

## Model tiers
Premium Claude quota is limited. Use the cheapest tier that will reliably succeed, and escalate when it doesn't:
- **Simple** (lookups, listing, formatting, boilerplate): `scout` subagent (haiku tier).
- **Medium** (normal edits, routine debugging/refactors): `routine-coder` subagent (sonnet tier).
- **Complex/Critical** (architecture, security, hard production bugs, multi-step integrations): main loop or `deep-reviewer` (opus tier).
- If a cheaper tier's result is wrong, incomplete, or uncertain, redo it one tier up. Don't retry the same tier more than once.

## Context hygiene
- Grep/Glob first; read only the relevant line ranges of large files (e.g. `theme/assets/*.css`, `docs/*.md`).
- Don't re-read a file you just edited, or repeat tool calls whose result you already have.
- Batch independent tool calls in one step. Keep answers short.

## Router (optional)
`claude-routed` runs Claude Code through a local OmniRoute router (see `tools/omniroute/README.md`).
There, haiku → `eb-simple`, sonnet → `eb-medium`, opus → `eb-complex`; use `/model eb-critical` for the strongest route.
