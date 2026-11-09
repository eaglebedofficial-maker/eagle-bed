# Growth HQ: product and launch plan

## What it is
Eagle Bed HQ, turned into an app any business can use. A customer signs up, fills in a business brief, connects their accounts and their own Claude API key, then presses buttons. 60 agents in 8 departments do the work. Every change waits on an approval Board, and the customer can undo it.

## Why each customer uses their own Claude key
- Each customer pays Anthropic for their own usage, so your tokens are never spent on their business.
- A Claude Pro/Max chat subscription can't be connected to a third-party app. The official way is an API key from console.anthropic.com. The app checks the key when it is saved and stores it encrypted (AES-256-GCM).
- Later option: a "managed" plan where you hold one key and charge per job. The engine already takes the key per workspace, so this is a billing change, not a rewrite.

## How it works (architecture)
- **Next.js app** (web + API) in `growth-hq/`. Mobile-first UI, installable as a PWA.
- **Engine** (`src/lib/engine.ts`): Claude Opus 5.5 with adaptive thinking, streaming, prompt caching and server-side refusal fallbacks. It runs the agent loop with:
  - the customer's remote **MCP servers** (Shopify, OpenRush, Canva, Zapier, Supermetrics), through Anthropic's MCP connector;
  - **built-in tools** for Search Console, GA4, Google Ads (read-only GAQL) and the Meta Graph API (GET);
  - **web search and web fetch**;
  - **Board tools**: `propose_change`, `save_report`, `remember_fact`, `save_lesson`.
- **Approval → apply**: approving an item starts a short Claude run limited to that one service. It reads the current value, stops on a conflict, and otherwise makes exactly that change. Undo does the reverse.
- **Autopilot**: `GET /api/cron/autopilot` (Bearer `CRON_SECRET`) runs each workspace's chosen jobs once a day. Weekly jobs run on Mondays and monthly jobs on the 1st. Pause means monitoring only; Close means nothing runs.
- **Storage**: JSON files per workspace (`DATA_DIR`), so it runs with zero infrastructure. Swap `src/lib/store.ts` for Postgres before real customers (same functions).

## Getting it onto the Play Store and App Store
1. Deploy the web app with HTTPS (Vercel, Render or Cloud Run). Set the `.env` values and a daily cron for `/api/cron/autopilot`.
2. **Android (Google Play)**: wrap the PWA as a Trusted Web Activity with Bubblewrap (`npx @bubblewrap/cli init --manifest https://YOUR_DOMAIN/manifest.webmanifest`). Add `/.well-known/assetlinks.json`, build the AAB and upload it in Play Console. You need a Google Play developer account (one-time fee) and a privacy policy URL.
3. **iOS (App Store)**: wrap with Capacitor. Apple wants some native value beyond a website, so add push notifications for "changes waiting for approval" and "autopilot report ready". You need an Apple Developer Program membership.
4. Store listing: screenshots of Office, Actions, Board and Reports (phone size), category Business, and a clear note that a Claude API key is needed.

## Approvals the company must get (start early; some take weeks)
| Service | What you need | Why |
|---|---|---|
| Google (Search Console, GA4, Business Profile, YouTube) | Google Cloud OAuth app, consent screen, **verification** for sensitive scopes | Customers sign in with Google |
| Google Ads | **Developer token** (basic access application) | Read campaigns, search terms |
| Meta (Facebook, Instagram) | Meta app + **App Review** for pages_manage_posts, instagram_content_publish, ads_read; business verification | Posting and insights |
| TikTok | Content Posting API approval | Direct video posting |
| Shopify | Partner account; public app review if listed on the Shopify App Store | Store access for many shops |
| Pinterest | App approval | Pins |

Until those are approved, customers can connect through **Zapier** or **Publer** (key-based). Eagle Bed already works this way.

## Before charging customers (to do)
- Postgres instead of JSON files; backups; per-workspace rate limits.
- Shopify and Meta work today with a pasted token (Shopify custom-app Admin token; long-lived Meta Page token). Still to do: MCP OAuth flow for Canva and the other MCP servers (today the customer pastes a token or server URL).
- Confirm each default MCP server URL in `src/catalog/connections.ts` against the vendor's current docs.
- Terms of service, privacy policy, GDPR data export and delete.
- Email/push notifications; password reset; team members per workspace.
- The Eagle Bed HQ browser features that need porting: the in-browser video maker (photos + music → MP4) and Cinema Studio generation calls. The app plans these today; generating the media is the next step.

## Pricing (built in)
One Business plan with everything: **£100 a month**, or **£1,080 a year** (10% off, £120 saved). New accounts get a free trial (`TRIAL_DAYS`, default 7; set 0 for none). Payment is by Stripe Checkout; customers manage, switch or cancel in Stripe's customer portal. Stripe's webhook (`/api/billing/webhook`) keeps each workspace's status in sync. Accounts listed in `OWNER_EMAILS` never pay. Without `STRIPE_SECRET_KEY`, everything is free (for testing). Claude usage is billed to the customer's own key.

Stripe setup: create an account, then copy the secret key into `STRIPE_SECRET_KEY`. Add a webhook endpoint at `APP_URL/api/billing/webhook` for `checkout.session.completed` and `customer.subscription.*`, and copy its signing secret into `STRIPE_WEBHOOK_SECRET`. Turn on the customer portal in Stripe settings.
