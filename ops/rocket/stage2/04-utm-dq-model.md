# Stage 2, parts 7, 10, 11: UTM standard, data quality monitor, revenue data model

Prepared 19 Nov 2026 by the Tracking & Measurement, Analytics and Profit & Cash specialists. This was a read-only stage. Nothing was changed in Shopify, HQ, scheduled tasks, Ads, Meta, GA4 or git.

Files written:
- this report
- `ops/rocket/stage2/data-model.json`: the unified reporting model, the channel map and the cost inputs the owner needs to supply
- `ops/rocket/stage2/dq-checks.json`: 16 data quality checks

Labels: VERIFIED (pulled today, source named), HISTORICAL (Stage 1 or a file), ESTIMATE (maths shown), UNKNOWN (reason given). No customer personal data appears here. Order numbers only.

---

## Headline findings

1. **The "HQ tags social links since 30 Oct" claim is only partly true.** The scheduled task that actually posts photos ("Eagle Bed social post", `trig_01KWcB82NnwV2BbFQhQ3iuhL`) adds `Shop: <url>` to Facebook posts with **no UTM**. The tagging helper `withUtm()` in the HQ page runs only when the owner presses "Post now". Result: **0 sessions with campaign `hq_post_*` in 90 days**. Facebook has sent 14 untagged sessions since 26 Oct. VERIFIED (ShopifyQL sessions; trigger prompt; HQ page line 2151).
2. **Tagged links exist in only three places:** Pinterest pins (`pinterest / social / pins`, 10 posted), cinema videos (`facebook|youtube / social / hq_cinema_0900|1800`, 4 posted), and the weekly GBP post (`google / organic / gbp_post`). None of these shows a single session in Shopify yet. VERIFIED.
3. **Five different spellings are in use** for organic social: `facebook`, `ig`, `Pinterest`, `eaglebed_video` and `eaglebed_cinema` as the source, and `social` or `organic` as the medium. Campaigns mix underscores, capitals and slot times. The GBP tag `google / organic` would merge with Google organic search in GA4.
4. **Trade emails (292 sent) and customer emails carry no UTMs.** Every trade-email click arrives as "direct" or "gmail". VERIFIED (`ops/email/trade-agent-brief.txt` line 15; ShopifyQL shows `email / gmail` = 6 sessions in 90 days).
5. **Google Ads clicks carry the feed's `utm_content=sag_organic`** on 7 PMax orders (for example #1042 and #1033). So `utm_content` cannot be used for the product ID until we test how a Final URL suffix interacts with the feed tags. VERIFIED (order `customerJourneySummary`).
6. **The data checks found these issues:** 3 order lines with no SKU (#1043, #1042, #1013), 1 line with no variant (#1009), the open #1020 refund, and GA4 reporting in USD. All 37 orders since 21 Aug are in GBP. VERIFIED.
7. **Profit is UNKNOWN.** The only cost that can be worked out today is payment fees: **about £372 on £14,214.96 in 90 days (2.6%)**. This is an ESTIMATE; the maths is in section 3.4.

---

## 1. UTM standard (part 7)

### 1.1 Conventions in use today (VERIFIED, ShopifyQL `FROM sessions … GROUP BY utm_source, utm_medium, utm_campaign SINCE -90d`)

| utm_source | utm_medium | utm_campaign | Sessions 90d | Carts | Orders* | Who sets it |
|---|---|---|---|---|---|---|
| (none) | | | 3,148 | 144 | 9 | direct/organic/untagged |
| google | product_sync | sag_organic | 2,756 | 63 | 5 | Shopify Google & YouTube app (feed) |
| google | cpc | pmax_all_products | 1,215 | 117 | 6 | Google Ads URL options |
| chatgpt.com | | | 320 | 34 | 1 | ChatGPT (auto) |
| facebook | paid | 120251989473090445 | 231 | 7 | 1 | Meta URL parameters (Aug ads; content = ad id, term = ad set id) |
| google | cpc | search_uk | 163 | 2 | 0 | Google Ads (paused) |
| google | cpc | shopping_uk | 63 | 5 | 0 | Google Ads (paused) |
| google | cpc | Google Shopping | 33 | 6 | 0 | old Google Ads (capitalised) |
| ig | social | | 12 | 0 | 0 | Instagram's own bio-link tag (ESTIMATE) |
| Pinterest | organic | | 5 | 0 | 0 | UNKNOWN (not our `pins` tag) |
| facebook | social | autopilot_w1 / weekly_push | 2 / 2 | 0 | 0 | old Sep posts (HISTORICAL) |
| klarna | referral | klarna-merchantboost | 2 | 2 | 0 | Klarna |
| britaine, shop_app, Scamadviser.com | referral / – | | 4 | 0 | 0 | third parties |

*Sessions that completed checkout.

Referrers with no UTM: Facebook 197, Instagram 2, Pinterest 7, YouTube 1. All social referrers together: 465 sessions and 2 completed checkouts, both from the August Meta ads. VERIFIED.

### 1.2 Values written by our own systems (VERIFIED by reading the source)

| System | Where | Value written today | Sessions seen 90d |
|---|---|---|---|
| Scheduled photo posts (FB) | trigger `trig_01KWcB82…` step 4a | `Shop: <url>`, **no UTM** | n/a (FB untagged 14 since 26 Oct) |
| Photo post captions (IG/TikTok) | same, step 3 | raw product URL at the end (not clickable on IG/TikTok); 20 of 162 posts | – |
| HQ "Post now" button | HQ page line 2151 | `facebook / social / hq_post_0900` (slot) | 0 |
| HQ photo-video caption | HQ page line 2330 | `eaglebed_video / social / hq_daily_video` | 0 |
| HQ cinema caption | HQ page line 2546 | `eaglebed_cinema / social / hq_cinema` | 0 |
| Daily autopilot photo video | trigger `trig_01JfLktS…` step 6b(a) | `Shop: <productUrl>`, **no UTM** | – |
| Cinema autopilot | `tools/cinema/autovideo.py` lines 314–316, 375, 387, 392, 395 | `facebook|youtube / social / hq_cinema_0900|1800`, YouTube adds `utm_content=<seoType>`; TikTok/IG "link in bio" | 0 |
| Pinterest pins | HQ `pins` P01–P20; `ops/seo-types/pin.md` line 94 | `pinterest / social / pins` (P01–P10 posted, P11–P20 queued) | 0 |
| GBP weekly post | `ops/cinema/RUNBOOK.md` line 63 | `google / organic / gbp_post` | 0 |
| Trade outreach email | `ops/email/trade-agent-brief.txt` lines 15, 17 | plain URLs, **no UTM** | – |
| Inbox replies | trigger `trig_015kv1BJ…` step 3 | "www.eaglebed.co.uk", no UTM | – |
| Shopify Email flows | `ops/email/flows/*.md` (swatch link line 39 etc.) | plain URLs; whether Shopify Email adds its own UTMs is UNKNOWN | – |
| WhatsApp quick replies | `ops/whatsapp/SETUP.md` lines 15, 21, 26, 27 | plain URLs | – |
| HQ agent prompt "tracking" | HQ page line 801 | asks for UTMs but names no standard | – |

### 1.3 The standard

Rules:
1. **Lowercase, hyphens only.** No spaces, no underscores, no capitals.
2. **`utm_source` = the platform or sender**, spelled one way only: `facebook`, `instagram`, `tiktok`, `pinterest`, `youtube`, `google-business-profile`, `whatsapp`, `trade-outreach`, `shopify-email`, `customer-service`, or the publication domain stem for PR (for example `yorkshirepost`).
3. **`utm_medium`, one of:** `social` (organic posts, bios and messaging), `paid-social`, `email`, `cpc`, `referral` (GBP, PR, partners), `affiliate`. We use `social` rather than `organic-social`, because GA4's default channel rules recognise `social` for any source. `organic-social` only works when the source is on Google's social-site list (from the analytics skill; not tested live).
4. **`utm_campaign` = `yyyy-mm-<theme>`** for anything dated, for example `2026-12-photo-posts`, `2026-12-cinema`, `2026-12-pins` or `2026-12-trade-outreach`. Always-on links that never change (bio links, GBP website button, WhatsApp quick replies, email flows) use `ao-<theme>`, so the link does not need editing every month.
5. **`utm_content` = the post or creative ID**, taken from the HQ document ID: `post-2026-12-01-0900`, `video-2026-12-01-1800`, `pin-p11`, `gbp-2026-12-01`, `flow-swatch-1`, or the trade template letter (`type-a`, `type-b`, `type-c`).
6. **`utm_term` is for paid keywords only.** It is unused for organic posts.
7. **No personal data** goes in any value: no names, emails, phone numbers or lead slugs. Lead doc IDs contain business names, and some of those are sole traders, so they are never used.
8. **Third-party tags are left alone:** `sag_organic`, `chatgpt.com`, `klarna`, `ig` (Instagram's bio auto-tag), `shop_app`. They are normalised in reports through the channel map instead.
9. **Test before shipping.** Click one live link per platform and check that the landing URL keeps all the parameters.

### 1.4 Table per channel

| Channel | utm_source | utm_medium | utm_campaign | utm_content | utm_term | Notes |
|---|---|---|---|---|---|---|
| Facebook organic post | facebook | social | yyyy-mm-photo-posts / yyyy-mm-cinema | post-YYYY-MM-DD-HHMM / video-… | – | the only clickable organic link |
| Facebook / Instagram paid (Meta) | facebook or instagram via `{{site_source_name}}`, mapped fb→facebook, ig→instagram in reports | paid-social | `{{campaign.name}}` with Meta campaigns named `yyyy-mm-<theme>` | `{{ad.id}}` | `{{adset.id}}` | only when Meta ads restart |
| Instagram bio link | instagram | social | ao-bio-link | bio | – | Instagram may append its own `ig/social`; test first |
| Instagram post caption | none (not clickable) | – | – | – | – | keep "Link in bio" |
| TikTok bio link | tiktok | social | ao-bio-link | bio | – | captions keep "Link in bio" |
| Pinterest pin | pinterest | social | yyyy-mm-pins | pin-p11 … | – | queued pins only |
| YouTube Shorts description | youtube | social | yyyy-mm-cinema | video-YYYY-MM-DD-HHMM | – | drop seoType from content |
| Google Business Profile post | google-business-profile | referral | yyyy-mm-gbp-posts | gbp-YYYY-MM-DD | – | not `google/organic` |
| Google Business Profile website button | google-business-profile | referral | ao-profile-website | website-button | – | owner edits in GBP |
| Google Ads | google | cpc | keep `pmax_all_products` (exception, see 1.5) | test `{product_id}` | `{keyword}` (Search only) | gclid auto-tagging stays on |
| Trade outreach email | trade-outreach | email | yyyy-mm-trade-outreach | type-a / type-b / type-c | – | product URLs and signature URL |
| Customer emails (Shopify Email / Messaging flows) | shopify-email | email | ao-flow-abandoned-checkout / ao-flow-post-purchase / ao-flow-swatch | button / swatch-link / review-link | – | built-in checkout link left as is |
| Inbox replies (1:1) | customer-service | email | ao-inbox-replies | signature | – | optional, low volume |
| WhatsApp quick replies | whatsapp | social | ao-quick-replies | pay / swatch / away / profile | – | |
| PR / press | publication stem | referral | yyyy-mm-<story> | article | – | ask the journalist to use the tagged link |
| Affiliates (none today) | partner | affiliate | yyyy-mm-<deal> | placement | – | |

### 1.5 Old to new mapping (history kept; no past URL is rewritten)

| Old (source / medium / campaign [/ content]) | New | Treatment in reports |
|---|---|---|
| facebook / social / hq_post_HHMM | facebook / social / yyyy-mm-photo-posts / post-… | channel "Organic social › facebook" |
| (no UTM) "Shop: <url>" on FB photo posts | as above | old sessions stay "Organic social (untagged)" |
| eaglebed_video / social / hq_daily_video | <platform> / social / yyyy-mm-photo-video / video-… | "Organic social › unknown platform" |
| eaglebed_cinema / social / hq_cinema | <platform> / social / yyyy-mm-cinema / video-… | same |
| facebook\|youtube / social / hq_cinema_0900\|1800 [/ seoType] | facebook\|youtube / social / yyyy-mm-cinema / video-YYYY-MM-DD-HHMM | "Organic social › platform" |
| pinterest / social / pins | pinterest / social / yyyy-mm-pins / pin-pNN (P11–P20 only) | P01–P10 keep `pins` |
| Pinterest / organic / – | leave (origin UNKNOWN) | map to pinterest |
| ig / social / – | leave (Instagram auto) | map to instagram |
| facebook / social / autopilot_w1, weekly_push | historical only | "Organic social › facebook" |
| google / organic / gbp_post | google-business-profile / referral / yyyy-mm-gbp-posts | map to "Google Business Profile" |
| facebook / paid / <campaign id> [content ad id, term ad set id] | facebook\|instagram / paid-social / {{campaign.name}} / {{ad.id}} / {{adset.id}} | "Meta Ads" |
| google / cpc / pmax_all_products, search_uk, shopping_uk | **unchanged** (documented exception) | "Google Ads" |
| google / cpc / Google Shopping | historical | "Google Ads" |
| google / product_sync / sag_organic | unchanged (Shopify app) | "Google feed" |
| chatgpt.com, klarna, shop_app | unchanged | "AI assistants" / "Referral" |

Why Google Ads keeps its names: renaming the slugs would split 90 days of trend lines for no decision benefit, and it needs an Ads change. Underscore values are allowlisted in check DQ07.

### 1.6 Exact changes proposed (all AWAITING APPROVAL; none applied)

| # | System | Exact text now | Proposed text | Why / benefit | Risk | Rollback | Approval |
|---|---|---|---|---|---|---|---|
| U1 | Task `trig_01KWcB82NnwV2BbFQhQ3iuhL` (social post) step 4a | `post the photo with the caption (+ "Shop: <url>")` | `post the photo with the caption (+ "Shop: <url>?utm_source=facebook&utm_medium=social&utm_campaign=<YYYY-MM>-photo-posts&utm_content=post-<YYYY-MM-DD>-<HHMM>")` | the main organic link gets measured | very low (prompt only) | restore old line | owner (task prompt) |
| U2 | same task, step 3 | `End the caption with the product link and "Like and follow…"` | `End the caption with "Like and follow…" (no URL; Facebook gets the tagged link in step 4a; Instagram/TikTok say "Link in bio.")` | removes dead, untagged URLs from IG/TikTok | low | restore | owner |
| U3 | Task `trig_01JfLktS4EjKHgtArtoHASzv` (daily autopilot) step 6b(a) | `… cash on delivery. Shop: <productUrl> #eaglebed …` | `… Shop: <productUrl>?utm_source=<platform>&utm_medium=social&utm_campaign=<YYYY-MM>-photo-video&utm_content=video-<YYYY-MM-DD>-1800 …` (one caption per platform, or "Link in bio" for TikTok/IG) | video links measured | low | restore | owner |
| U4 | `tools/cinema/autovideo.py` line 316 | `"utm_source=%s&utm_medium=social&utm_campaign=%s" % (source, campaign)` | `"utm_source=%s&utm_medium=social&utm_campaign=%s&utm_content=%s" % (source, campaign, content)` (add a `content` argument to `utm()` at line 314) | adds the video ID | low (code; test one caption) | git revert | owner (code) |
| U5 | same file, line 375 | `camp = "hq_cinema_" + slot.replace(":", "")` | `camp = date[:7] + "-cinema"`; `content = "video-" + date + "-" + slot.replace(":", "")` | standard campaign | low | git revert | owner |
| U6 | same file, lines 387 and 392 | `… + "&utm_content=" + kind` | drop the `+ "&utm_content=" + kind` suffix (content now set in `utm()`) | one content value | low | git revert | owner |
| U7 | `ops/cinema/RUNBOOK.md` line 63 | `?utm_source=google&utm_medium=organic&utm_campaign=gbp_post` | `?utm_source=google-business-profile&utm_medium=referral&utm_campaign=<YYYY-MM>-gbp-posts&utm_content=gbp-<YYYY-MM-DD>` | stops merging with organic search | low | revert line | owner |
| U8 | HQ `pins` P11–P20 (`link` field) | `?utm_source=pinterest&utm_medium=social&utm_campaign=pins` | `?utm_source=pinterest&utm_medium=social&utm_campaign=<month posted>-pins&utm_content=pin-p11` … (set at post time by RUNBOOK step 6c) | per-pin results | low (HQ data write) | restore old link | owner (HQ write) |
| U9 | HQ page line 2329 `withUtm(url,source,medium,campaign)` | 4 arguments | add a 5th argument `content` and set `utm_content` when given | HQ button posts carry the post ID | low (HQ republish) | republish previous version | owner (HQ) |
| U10 | HQ page line 2151 | `withUtm(p.url,"facebook","social","hq_post_"+p.slot.replace(":",""))` | `withUtm(p.url,"facebook","social",p.date.slice(0,7)+"-photo-posts","post-"+p.date+"-"+p.slot.replace(":",""))` | same as U1 | low | republish | owner |
| U11 | HQ page line 2330 | `withUtm(url||SITE,"eaglebed_video","social","hq_daily_video")` | per-platform source (`facebook`, `youtube`); campaign `<YYYY-MM>-photo-video` | correct platform | low | republish | owner |
| U12 | HQ page line 2546 | `withUtm(pl.productUrl||SITE,"eaglebed_cinema","social","hq_cinema")` | `withUtm(…,"facebook","social",<YYYY-MM>+"-cinema","video-"+<id>)` | correct platform | low | republish | owner |
| U13 | HQ page line 801 (tracking agent) | `… then UTMs on every social and email link (utm_source, utm_medium, utm_campaign).` | `… then UTMs on every social and email link following ops/rocket/stage2/04-utm-dq-model.md §1.3 (lowercase-hyphen; medium in social/paid-social/email/cpc/referral/affiliate; campaign yyyy-mm-theme).` | agents use one standard | very low | republish | owner |
| U14 | `ops/email/trade-agent-brief.txt` line 15 | `- 2-3 fitting products with "from £X" and URL;` | `- 2-3 fitting products with "from £X" and URL ending ?utm_source=trade-outreach&utm_medium=email&utm_campaign=<YYYY-MM>-trade-outreach&utm_content=type-<a|b|c>;` | trade clicks measured | low; plain query strings, not redirect trackers, so no deliverability change expected (ESTIMATE) | revert line | owner (trade email; PECR gate Q15 still applies) |
| U15 | same file, line 17 | `"www.eaglebed.co.uk"` | `"www.eaglebed.co.uk"` (keep plain; a bare domain in the signature is fine) | none; listed for completeness | – | – | – |
| U16 | `ops/email/flows/abandoned-checkout.md` line 39 and the swatch/post-purchase templates | `www.eaglebed.co.uk/pages/request-a-swatch` | `https://www.eaglebed.co.uk/pages/request-a-swatch?utm_source=shopify-email&utm_medium=email&utm_campaign=ao-flow-abandoned-checkout&utm_content=swatch-link` (same pattern per flow) | email flow clicks measured | low (owner pastes into Shopify) | edit template | owner |
| U17 | `ops/whatsapp/SETUP.md` lines 15, 21, 26, 27 | plain URLs | `?utm_source=whatsapp&utm_medium=social&utm_campaign=ao-quick-replies&utm_content=<profile|away|pay|swatch>` | WhatsApp clicks measured | low | edit replies | owner (WhatsApp app) |
| U18 | GBP website button (owner in GBP) | `https://www.eaglebed.co.uk` | `https://www.eaglebed.co.uk/?utm_source=google-business-profile&utm_medium=referral&utm_campaign=ao-profile-website&utm_content=website-button` | Maps/GBP visits separated from organic | low; Google sometimes rewrites the link (test) | restore URL | owner |
| U19 | Instagram and TikTok bio links (owner) | untagged | `?utm_source=instagram|tiktok&utm_medium=social&utm_campaign=ao-bio-link&utm_content=bio` | bio clicks measured | Instagram may add its own `ig` tag; test one click | restore | owner |
| U20 | Meta Ads URL parameters (only when ads restart) | `utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.id}}…` | `utm_source={{site_source_name}}&utm_medium=paid-social&utm_campaign={{campaign.name}}&utm_content={{ad.id}}&utm_term={{adset.id}}` | readable campaign names | low | restore | owner (Meta) |
| U21 | Google Ads Final URL suffix (TEST ONLY) | values as now | add `utm_content={product_id}` on a test, then check whether `sag_organic` from the feed overrides it (2 orders show both tags) | product-level ad data (Stage 1 Q23) | medium: duplicate params can break attribution; test 1 day | remove suffix | owner (Ads) |
| U22 | GA4 custom channel group (owner) | default group | add rules: medium `referral` + source `google-business-profile` → "Google Business Profile"; source `trade-outreach` → "Trade email"; referrer chatgpt/perplexity/gemini/copilot → "AI assistants" | GA4 matches the Shopify channel map | low (GA4 setting; non-destructive) | delete group | owner (GA4) |

Order to ship: U1, U2, U7, U14 first. These are the links that are posted or sent daily. Then U3–U6 and U8–U13. U16–U22 are owner screen changes.

---

## 2. Data quality monitor (part 10)

Full definitions are in `dq-checks.json`. Daily checks use only Shopify and HQ data (0 credits). Weekly checks cost 6 credits, with 3 more optional (9 maximum).

| ID | Check | Source | Query (short) | Threshold | Severity | Freq | Credits | Today |
|---|---|---|---|---|---|---|---|---|
| DQ01 | Orders vs payments (missing purchases) | GraphQL orders + ShopifyQL payments | orders yesterday vs `FROM payments … GROUP BY payment_gateway, payment_method SINCE -1d` | any mismatch | HIGH | daily | 0 | not run |
| DQ02 | Duplicate orders | GraphQL | same variants + total within 30 min | ≥1 pair | HIGH | daily | 0 | none seen in 37 orders |
| DQ03 | Paid-but-cancelled, failed refund, fulfilled-unpaid | GraphQL | cancelledAt + PAID; REFUND FAILURE; fulfilled + EXPIRED | ≥1 | CRITICAL | daily | 0 | **FAIL: #1020; #1010/#1014** (HISTORICAL S1 §16) |
| DQ04 | Currency | GraphQL; GA4 weekly | currencyCode / presentment = GBP; GA4 currency | any non-GBP | CRITICAL / HIGH | daily / weekly | 0 | orders PASS (VERIFIED); **GA4 USD FAIL** |
| DQ05 | Revenue sanity | ShopifyQL sales + GraphQL | £20–£3,000 per order; totals reconcile ±£1; discounts ≤15% | any breach | MEDIUM | daily | 0 | not run |
| DQ06 | Missing product/variant/SKU | GraphQL lineItems | product null (excl. "- Selections"), variant null, sku null | ≥1 | HIGH/MED/LOW | daily | 0 | **LOW: 3 SKU nulls; MED: #1009 variant null** |
| DQ07 | Broken / non-standard UTMs | ShopifyQL sessions by utm | regex + allowlist (§1.3, §1.5) | ≥1 row | MEDIUM | daily | 0 | would flag `Pinterest/organic`, `Scamadviser.com` |
| DQ08 | Untagged links on posts | HQ posts/videos/pins | posted yesterday, link lacks utm_campaign | ≥1 | MEDIUM | daily | 0 | **FAIL: every FB photo post** |
| DQ09 | Tracking drop | ShopifyQL UK human funnel | yesterday vs mean of last 4 same weekdays | 0 → CRIT; −40% → HIGH; 0 carts with ≥30 sessions → HIGH; 0 orders 7d with normal traffic → CRIT | CRITICAL/HIGH | daily | 0 | weekly UK human 225/258/326/341 (VERIFIED) |
| DQ10 | Unattributed orders | GraphQL journey | firstVisit null share, 14 days | >40% | MEDIUM | daily | 0 | 25% (4/16) PASS |
| DQ11 | Checkout probe spike | ShopifyQL all vs human | checkout reached > 3× carts and >30 | as stated | MEDIUM | daily | 0 | 15–17 Nov would have fired |
| DQ12 | Non-UK share | ShopifyQL by country | >40% of human sessions | | LOW | weekly | 0 | about 30% all sessions (HISTORICAL) |
| DQ13 | Shopify vs GA4 | OpenRush get_website_analytics | purchases & sessions, 7 closed days | GA4 0 with Shopify ≥2, gap >40%, GA4 > Shopify | HIGH/MED | weekly | 3 | not run (0 budget today) |
| DQ14 | Shopify vs Google Ads | OpenRush get_ad_performance + Shopify journeys | conversions/value vs Ads-touched orders | value >1.3× → HIGH; conv 0 with ≥2 touched orders → HIGH; value <£5 → MED; spend >2× → CRIT | CRIT/HIGH/MED | weekly | 3 (+3 optional) | known £1.05 action (HISTORICAL) |
| DQ15 | Shopify vs Meta | Meta Ads connector (free) + ShopifyQL | spend, clicks, purchases vs paid-social sessions/orders | spend >0 with 0 sessions → HIGH | HIGH/MED | weekly | 0 | SKIPPED: spend £0 since 8 Sep |
| DQ16 | Freshness | HQ dq/latest | age > 36 h | | MEDIUM | daily | 0 | n/a |

**Alert route.** Each run writes ArtifactData `dq/latest` and `dq-log/<date>`. The HQ page shows a "Data quality" card. The 23:59 daily report adds a "Data quality" section listing FAIL and WARN items only. CRITICAL items also send one push line straight away.

**Where the checks run (proposal, AWAITING APPROVAL):**
- Daily checks: add to the daily autopilot (`trig_01JfLktS4EjKHgtArtoHASzv`) step 1, after its existing Shopify pull. The proposed line is: `1b. Run the DAILY checks in /home/user/eagle-bed/ops/rocket/stage2/dq-checks.json (frequency daily, 0 credits) and ArtifactData set dq/latest + dq-log/<date>.`
- Weekly checks: add to the Monday Search Revenue report (`trig_01JT6xGfHqH2K1jH6V5SB8DX`), which already pulls GA4 and Ads.
- Daily report (`trig_01RxMxSftZmA5XFKM8QHTH84`): add step `5b. DATA QUALITY: ArtifactData get dq/latest; list FAIL/WARN with one plain line each`.

**Cost.**
- Daily: 0 credits.
- Weekly: 6 credits (GA4 3 + Ads 3); 9 with the optional campaign pull. About 26 a month.
- Saving: the daily autopilot already calls `get_ad_performance` and `get_search_performance` **every day**. That is 6 credits a day, about 180 a month (ESTIMATE from the prompt text; not checked against the usage log). If that run saves its Ads result to HQ, DQ14 costs 0, and a separate review of that daily spend could save more than this whole monitor costs.

---

## 3. Revenue intelligence data model (part 11)

Full model with all 61 fields: `data-model.json`. Summary below. `last_updated` is null for every field until the model runs; the column is omitted here.

### 3.1 Core fields

| Section | Field | Definition | Source + query/tool | Period | Refresh | DQ today |
|---|---|---|---|---|---|---|
| SALES | orders, gross_sales, discounts, returns, net_sales, shipping, total_sales, aov | Shopify standard (prices include tax) | ShopifyQL `FROM sales SHOW … TIMESERIES day` | D/W/M | daily | VERIFIED (returns PARTIAL: #1020) |
| SALES | taxes / VAT | tax on orders (all £0) | ShopifyQL `taxes` + owner | M | daily | UNKNOWN |
| SALES | sales_by_product (size) | net sales, qty by product + variant | `GROUP BY product_title, product_variant_title` | R30/90 | weekly | PARTIAL (Selections lines, SKU gaps) |
| SALES | payments_by_method | gross + count by gateway/method | `FROM payments … GROUP BY payment_gateway, payment_method` | M | weekly | VERIFIED |
| SALES | trade_orders | orders tagged `trade-<lead>` | GraphQL `orders(query:"tag:trade*")` + HQ leads | M | weekly | UNKNOWN (no tag rule) |
| TRAFFIC | sessions_all / human / **uk_human** | base population | ShopifyQL `FROM sessions … WHERE human_or_bot_session='human' AND session_country='United Kingdom'` | D/W | daily | VERIFIED |
| TRAFFIC | sessions_by_channel | via channel map | `GROUP BY utm_source, utm_medium, utm_campaign, referrer_source, referrer_name` | W | daily | PARTIAL (untagged social) |
| TRAFFIC | gsc clicks/impressions | organic Google | OpenRush get_search_performance (reuse Monday pull) | W | weekly | VERIFIED |
| TRAFFIC | ga4_sessions_by_channel | cross-check | OpenRush get_website_analytics | W | weekly | PARTIAL (USD) |
| TRAFFIC | ai_assistant_sessions | chatgpt.com etc. | ShopifyQL utm_source/referrer | W | daily | VERIFIED |
| CONVERSION | cart, checkout reached, completed (UK human) | funnel | ShopifyQL sessions metrics | D/W | daily | VERIFIED |
| CONVERSION | shopify CR; orders per UK human session; ATC, cart→checkout, completion rates | same-window ratios | derived | W/R30 | daily | VERIFIED |
| CONVERSION | abandoned_checkouts_true | abandoned with no later order | GraphQL `abandonedCheckouts` + order match | W | daily | PARTIAL |
| CONVERSION | unattributed_order_share | journey missing | GraphQL `customerJourneySummary` | R30 | daily | VERIFIED (25%) |
| MARKETING | orders by first touch / last non-direct | channel credit | GraphQL journeys | R30/90 | daily | PARTIAL |
| MARKETING | Google Ads spend, conv, value, ROAS; Shopify-ROAS; cost/order | ads | OpenRush get_ad_performance (+ Shopify) | W/R28 | weekly | VERIFIED / PARTIAL |
| MARKETING | non_brand_roas | excl. "eagle bed(s)" | search terms | R28 | weekly | ESTIMATE |
| MARKETING | Meta spend/results | paid social | Meta connector `ads_get_ad_entities` | W | weekly | VERIFIED (£0) |
| MARKETING | organic social output; sessions/orders per platform | posts and their traffic | HQ posts/videos/pins + ShopifyQL `utm_medium='social'` | W | daily | VERIFIED / PARTIAL |
| MARKETING | organic social reach | impressions | Supermetrics (not connected) | W | – | UNKNOWN |
| MARKETING | trade outreach funnel | sent, bounced, replied, quoted, won | HQ `leads`, `outreach/day-*` | W | daily | VERIFIED to replies; UNKNOWN after |
| MARKETING | email flow results | sends, clicks, orders | Shopify Messaging screen / utm_medium=email | M | weekly | UNKNOWN |
| PROFIT | cogs_per_order | owner unit cost × lines | HQ `costs/products` × GraphQL lineItems | per order | daily | **UNKNOWN** |
| PROFIT | delivery_cost_per_order | by region band | HQ `costs/delivery` × postcode area | per order | daily | **UNKNOWN** |
| PROFIT | assembly_labour_cost | £69.99 service cost | HQ `costs/assembly` | per order | daily | **UNKNOWN** |
| PROFIT | payment_fees | by method | ShopifyQL payments × rates | M | weekly | **ESTIMATE** (3.4) |
| PROFIT | contribution, margin %, profit after marketing, break-even ROAS | derived | derived | M | weekly | **UNKNOWN** |
| PROFIT | cash_position_items | unrefunded cancels etc. | DQ03 | D | daily | VERIFIED (#1020 open) |

### 3.2 Channel map

`data-model.json` → `channel_map`. It normalises every old and new value (for example `ig`→instagram, `Pinterest`→pinterest, `gbp_post`→Google Business Profile) without rewriting any past URL.

### 3.3 Cost data the owner must supply

| ID | What | Format | Priority |
|---|---|---|---|
| C1 | Manufacturing cost per product per size (frame, foam, fabric metres × price by fabric range, labour hours × rate, gas-lift / drawer hardware) | table: handle, size (3FT/4FT/4FT6/5FT/6FT), fabric range, £ | P1 |
| C2 | Mattress make or buy-in cost per size | table | P1 |
| C3 | Delivery cost per order by region band (Yorkshire; North; Midlands; London/SE; SW/Wales; Scotland; NI/islands courier) | £ per drop + typical drops per run | P1 |
| C4 | Assembly labour cost per job (the £69.99 service) | £ or hours × rate | P2 |
| C5 | Payment fees: confirm or correct the estimate below (PayPal account rate, Shop Pay Instalments rate, any third-party gateway surcharge on PayPal) | confirm | P2 |
| C6 | VAT registered? (all orders show £0 tax; prices are set tax-inclusive) | yes/no + scheme | P1 |
| C7 | Packaging per bed; swatch pack + postage | £ each | P3 |
| C8 | Monthly tools (Shopify Basic, Zapier, Publer, OpenRush, Gemini, Easify, Judge.me) | £/month | P3 |
| C9 | Returns handling cost and resale value | £ per return | P3 |

### 3.4 Payment fees: ESTIMATE

Inputs:
- Store plan: Shopify **Basic**, taxesIncluded = true (VERIFIED, GraphQL `shop`).
- 90-day payments (VERIFIED, ShopifyQL payments): card £10,128.89 over 25 transactions; Klarna £2,006.42 over 4; PayPal £2,079.65 over 6.
- Rates: card 2% + 25p and Klarna 4.99% + 30p come from Shopify UK pricing for the Basic plan, as reported by web search on 19 Nov ([shopify.co.uk/pricing](https://www.shopify.co.uk/pricing), [fena.co](https://www.fena.co/blog/shopify-basic-plan-payment-fees-uk-what-youre-actually-paying-per-order)). The PayPal UK standard domestic rate could not be confirmed ([PayPal UK merchant fees](https://www.paypal.com/uk/webapps/mpp/merchant-fees)). 2.9% + 30p is used as an assumption.

| Method | Maths | Fee |
|---|---|---|
| Card | 10,128.89 × 2% + 25 × £0.25 | £208.83 |
| Klarna | 2,006.42 × 4.99% + 4 × £0.30 | £101.32 |
| PayPal | 2,079.65 × 2.9% + 6 × £0.30 | £62.11 |
| **Total** | on £14,214.96 | **about £372 (2.6%)** |

Not included: international or premium card surcharges, chargebacks, the possible 2% Basic-plan surcharge on third-party gateways such as PayPal (UNKNOWN; this would add about £42), and the Shop Pay Instalments rate.

---

## 4. Prioritised actions (all AWAITING APPROVAL)

| Pri | Action | System | Benefit | Risk | Rollback |
|---|---|---|---|---|---|
| P1 | U1 + U2: tag the scheduled FB photo-post link | task prompt | first measurable organic social clicks | very low | restore line |
| P1 | U14: tag trade email product links | trade brief | trade email clicks visible | low | revert line |
| P1 | U7: GBP post tag fix | RUNBOOK | GBP separated from organic | low | revert |
| P1 | Turn on DQ daily checks (0 credits) + daily report section | autopilot + daily report prompts | errors such as #1020 caught the next day | low | remove step |
| P1 | Owner cost pack C1, C3, C6 | owner | unlocks every PROFIT field | none | – |
| P2 | U3–U13 code/HQ changes; U16–U19 owner link edits | code, HQ, apps | full channel coverage | low | revert/republish |
| P2 | Weekly DQ13/14/15 (6 credits); save the autopilot's daily Ads pull to HQ | Monday report | cross-platform checks at ~0 extra | low | remove step |
| P2 | GA4 currency to GBP; GA4 channel group (U22) | GA4 (owner) | GA4 revenue comparable | low | revert setting |
| P3 | U21 Ads `utm_content` test; U20 Meta params when ads restart | Ads/Meta | product-level ad data | medium (test) | remove suffix |

---

## Limitations

- GA4, Google Ads and Search Console were not pulled (0-credit budget). DQ13 and DQ14 are designed but not run. GA4 currency USD is HISTORICAL (Stage 1 §16).
- Whether Instagram overrides our UTMs on bio links, whether Google keeps UTMs on the GBP website button, and whether Shopify Email adds its own UTMs are all UNKNOWN until one test click each.
- The origin of `Pinterest / organic` (5 sessions) is UNKNOWN.
- The `campaign_sales` ShopifyQL schema returned no rows (no Shopify marketing activities). Order-level attribution therefore uses GraphQL `customerJourneySummary`.
- The PayPal rate and any gateway surcharge are unconfirmed, so payment fees stay an ESTIMATE.
- The trigger list was read on 19 Nov at about 12:45 UK. Prompts may change after that.
- The daily autopilot's OpenRush use (about 6 credits a day) is inferred from its prompt, not from the usage log.

## Credits used

- OpenRush: **0** (budget 0). Calls: none.
- Free reads:
  - ShopifyQL × 8 (sessions by UTM, by referrer, social by UTM, Facebook by week, campaign_sales, UK human weekly, payments × 2)
  - Shopify GraphQL × 3 (orders since 21 Aug, shop plan; one rejected deprecated-field query)
  - Shopify docs search × 1
  - ArtifactData list × 3 (posts 162, pins 20, videos 31; read-only)
  - list_triggers × 2 (read-only)
  - WebSearch × 2 (payment rates)
