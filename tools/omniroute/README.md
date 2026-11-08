# OmniRoute: tiered, quota-aware model routing for Claude Code

[OmniRoute](https://github.com/cheaper-inference/OmniRoute) (npm `omniroute`, pinned to **3.8.53**) runs as a
local gateway on `127.0.0.1:20128`. `claude-routed` points Claude Code at it. Plain `claude` is left
untouched and keeps using your normal Claude login.

## Install / re-install (idempotent)

```bash
export GEMINI_API_KEY=...        # free tier: https://aistudio.google.com/apikey
export ANTHROPIC_API_KEY=...     # optional: puts Claude into the complex/critical tiers
bash tools/omniroute/install.sh
```

Other optional free tiers: `GROQ_API_KEY`, `CEREBRAS_API_KEY`, `OPENROUTER_API_KEY`, `MISTRAL_API_KEY`.
Keys are read from the environment and stored encrypted in `~/.omniroute`. Nothing secret is committed.

## Use

```bash
claude-routed                      # Claude Code via the router (default tier: eb-medium)
claude-routed --model eb-critical  # strongest route for one session
claude                             # unchanged: your normal Claude subscription
```

Inside Claude Code: `/model haiku` → `eb-simple`, `/model sonnet` → `eb-medium`, `/model opus` → `eb-complex`,
`/model eb-critical` → strongest. Background calls (titles, summaries) use the haiku slot, so they go to `eb-simple`.

## Tiers (priority strategy, so each list is an ordered fallback chain)

| Combo         | Order                                                                      |
| ------------- | -------------------------------------------------------------------------- |
| `eb-simple`   | gemini-3.1-flash-lite → 3.7-flash → 3.8-flash → groq llama-3.3-70b → 3.5-flash |
| `eb-medium`   | gemini-3.8-flash → gemini-3.1-pro → claude-sonnet-5-5 → gemini-pro-latest  |
| `eb-complex`  | gemini-3.1-pro → claude-sonnet-5-5 → claude-opus-5-5 → gemini-pro-latest   |
| `eb-critical` | claude-opus-5-5 → claude-sonnet-5-5 → gemini-3.1-pro → gemini-pro-latest (no compression) |

Entries for providers with no key are skipped automatically. Built-in `auto`, `auto/coding`, `auto/smart`,
`auto/cheap`, `auto/fast`, `auto/offline`, `auto/thrifty` and `auto/subscription` also work as model ids.

## Resilience

- Rate-limited (429) or failing connections get a cooldown, using upstream retry hints, up to 15 min.
  They're skipped until it ends, then used again automatically.
- Provider circuit breaker opens after 5 failures and probes again after 60s.
- Quota preflight skips a provider whose known quota is below 5%. Only one wait-retry is allowed when every target is cooling down.

## Check status

```bash
bash tools/omniroute/route-status.sh          # health, providers, breakers, one tiny live request per tier
bash tools/omniroute/route-status.sh --no-test
```

Every response carries `x-omniroute-model`, `x-omniroute-provider` and `x-omniroute-fallback-attempts` headers.
Dashboard: `omniroute dashboard` (password in `~/.omniroute/admin.pass`).

## Notes

- Cloud (claude.ai/code) sessions run Claude Code on a host-managed provider, so `claude-routed` is meant
  for your local machine, or for headless runs started with a clean environment.
- Escalation on *quality* is not automatic at the router level. The router fails over on errors and quota
  limits. Quality escalation happens in Claude Code (CLAUDE.md rules, subagent tiers, `/model`).
- Not used, on purpose: keyless web-scraper providers, Claude subscription OAuth via the proxy, and the
  TLS-fingerprint/MITM features. All of these carry terms-of-service risk.
