# Eagle Bed: ABBAS 3D showroom theme layer

Source for the premium "digital showroom" redesign of the **ABBAS 3D** Shopify theme (Dawn base + `eb3d` layer) for www.eaglebed.co.uk.

- `theme/`: the files added or changed in the Shopify theme, mirrored at their theme paths (`layout/`, `sections/`, `snippets/`, `assets/`, `templates/`).
- `tools/build_templates.py`: generates every JSON template and section group from one source of truth (copy, FAQs, collection buying guides).
- `docs/01-showroom-blueprint.md`: sitemap, IA, wireframes, design system, animation, SEO, CRO, mobile and performance strategy.
- `docs/02-organic-growth-plan.md`: traffic diagnosis and the organic growth plan for the Eagle Bed HQ agents.

Everything new is prefixed `sr-` (showroom). The original `eb3d-*` product, collection, header and cart sections are kept, because they work with the bcpo options app and Judge.me.

## Trading agent (`.claude/`)

- `.claude/skills/trader-*`: the 11 skills from [Jakeschincariol/day-trader-skill](https://github.com/Jakeschincariol/day-trader-skill) (MIT, see `.claude/skills/DAY-TRADER-LICENSE`).
- `.claude/skills/trader-agent`: one front door. Upload a chart picture, type an instruction, or ask for signals: `/trader-agent`.
- `.claude/agents/day-trader.md`: the same as a subagent ("use the day-trader agent").
- Trading state (config, orders, fills) goes in `trader/`, which is git-ignored. Paper trading is the default. Not financial advice.

## Trading HQ app (`apps/trading-hq/`)

- The app: https://claude.ai/artifact/HvGS44nRXudsBLsmoVgGzn (source `apps/trading-hq/index.html`). Desk with Start / Pause / Stop, signals to approve, positions with close / cancel / move stop and target, chart reader, chat with the Manager, journal, money-management rules.
- The engine: `.claude/skills/trader-hq/` runs in a Claude Code cloud session the app starts. It drives the 11 `trader-*` skills, writes results to the app's database, and places only orders you approve in the app, through `alpaca.py` (Alpaca REST, paper by default).
- Setup: Alpaca keys as environment variables `APCA_API_KEY_ID`, `APCA_API_SECRET_KEY`, `APCA_PAPER=true`, plus `SEC_USER_AGENT`; allow the Alpaca, Yahoo, Nasdaq Trader, SEC and House Clerk domains in the environment's network settings.
