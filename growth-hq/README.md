# Growth HQ

Eagle Bed HQ as an app any business can use. 60 AI agents (SEO, social, ads, sales pages, customer care, operations, profit) work for a business through its own Claude API key and connected accounts. Every change waits for the owner's approval and can be undone.

- `src/catalog/`: the team (agents, departments), 68 one-tap actions, 20 connections, rules, and the generalised playbooks (`playbooks.json`).
- `catalog/eaglebed-hq-source.json`: the full catalogue extracted from the Eagle Bed HQ artifact. It is the source of truth that `npm run check:catalog` compares against.
- `src/lib/engine.ts`: runs agents on Claude (MCP connector, web search, Board tools, Google/Meta read tools).
- `src/app/`: the web app (Office, Actions, Manager chat, Board, Reports, Team, Connections, Business brief, Memory) and its API.
- `docs/FEATURE_MAP.md`: every HQ agent and button, and where it lives in the app.
- `docs/LAUNCH_PLAN.md`: architecture, Play Store/App Store steps, the API approvals to apply for, pricing.

## Run it
```bash
cp .env.example .env.local   # set APP_SECRET (32+ chars) and CRON_SECRET
npm install
npm run dev                  # http://localhost:3000
```
Sign up, fill in the business brief, and connect a Claude API key. Then press any action.

## Checks
```bash
npm run typecheck
npm run check:catalog        # proves every Eagle Bed HQ agent and button is covered
npm run build
```

Regenerate the playbooks after editing the source catalogue: `npm run catalog`. To re-extract it from a newer HQ artifact: `npm i --no-save acorn && node scripts/extract-hq-catalog.cjs path/to/hq.html`.
