# Stage 2, part 6: Meta tracking audit (pixel, Conversions API, catalogue)

Tracking & Measurement + Social specialists. 19 Nov 2026, pulls about 12:40–13:30 UTC. READ-ONLY: no Meta, Shopify or theme setting was changed, no campaign was touched, no test event or test order was sent.
Method: `conversion-tracking` skill (audit flow: inventory the senders, check value and item IDs, compare with the order record, diagnose before changing) and `analytics` skill (match closed windows).
Sources: Meta Ads MCP (read tools only), Shopify Admin GraphQL (read), live homepage HTML (curl), Stage 1 reports, `ops/sales/shopping-health-2026-11-10.md`.

## 1. Headline

1. **The Eagle Bed site's tracking works. The Meta ad account cannot use it.** The live site sends events to pixel **504564665962911 ("tech aba")**, owned by business **Tech ABA (498070783385123)**. The ad account named "Eagle bed" (**641104701697209**) sits in business **"Legend Beds" (2040644216402486)**. Its only pixel is **890821269640047 ("legend beds")**, which fires on **legendbeds.co.uk**, not on eaglebed.co.uk. VERIFIED (ads_get_ad_accounts, ads_get_datasets, ads_get_dataset_stats by host).
2. **Every Eagle Bed purchase campaign optimised on the Legend Beds pixel.** The August 2026 ad set "Eagle Bed | Broad UK | Purchase" and the July ad set "Eagle Bed — UK Broad — Purchase" have `promoted_object.pixel_id = 890821269640047`, event PURCHASE. The March 2026 ad set used product set 1619592636110170, which belongs to the **Legend Beds catalogue 1138454554959873**. VERIFIED (ads_get_ad_entities, ads_catalog_list_product_sets). This explains Stage 1's open question: Meta logged 0 pixel purchases while Shopify showed 2 Facebook-ad buyers (#1008, #1009). The sales landed in the Eagle Bed pixel, which the campaign never looked at. **Any Meta relaunch must fix this first (P0).**
3. **The Eagle Bed pixel itself is healthy.** It gets browser and server (Conversions API) events for the whole funnel. It is loaded once, by the Shopify Facebook & Instagram app (web pixel), not hard-coded. Purchase match quality is 8.0/10. It caught **12 of 16 Shopify orders** in the window; the 4 it missed are exactly the 4 orders with no tracked visit at all (no consent or blocked tracking).

## 2. Ad accounts and datasets (VERIFIED, ads_get_ad_accounts / ads_get_datasets / ads_get_dataset_details)

| Ad account | Name | Business | Currency / status | Datasets | Notes |
|---|---|---|---|---|---|
| 641104701697209 | Eagle bed | Legend Beds (2040644216402486) | GBP, ACTIVE, card on file | 890821269640047 "legend beds" | All 12 campaigns paused (Stage 1). Pixel fires on legendbeds.co.uk |
| 648147397688148 | (no name) | none | GBP, ACTIVE | 960027406236165 "Legend Beds" | Pixel has **never fired** |
| 1587599885205115 | Tech | Tech ABA (498070783385123) | USD, ACTIVE, **no payment method** | (not readable: MCP not enabled) | Same business as the Eagle Bed pixel and catalogue |
| 903963004952432 | TECHABA | Popular Ecom | GBP | 492725926784408 "StyleAba pixel" (last fired Feb 2025), 1503810186949790 (never fired) | Not Eagle Bed |
| 2 others | — | — | PKR, not queryable | — | Unrelated, not read |

Business Tech ABA (498070783385123) datasets:

| Dataset | Name | Created | Last browser event | Last server event | Status |
|---|---|---|---|---|---|
| **504564665962911** | tech aba | 11 Dec 2024 | 19 Nov 2026 12:30 UTC | 19 Nov 2026 12:30 UTC | **Live on eaglebed.co.uk.** Automatic advanced matching ON (em, fn, ln, ge, ph, ct, st, zp, db, country, external_id). First-party cookie ON. Gateway: not onboarded |
| 911849111119381 | Tech ABA's pixel | 7 Jan 2025 | 7 Jan 2025 | 7 Jan 2025 | Dead. Still attached to the Eagle Bed catalogue as an event source |

The same business (498070783385123) also owns the Eagle Bed WhatsApp Business account (ops/whatsapp/SETUP.md) and the Eagle Bed catalogue. So "Tech ABA" is Eagle Bed's own business under an old name. HISTORICAL (shopping-health 10 Nov) + VERIFIED.

## 3. How the pixel loads on the live site (VERIFIED, curl of www.eaglebed.co.uk, 19 Nov)

- No hard-coded `fbq(`, `fbevents.js` or `connect.facebook.net` in the page HTML. 0 matches.
- Shopify `webPixelsConfigList` contains one Meta entry: app id 2329312 (Facebook & Instagram channel), `pixel_id 504564665962911`, purposes ANALYTICS + MARKETING + SALE_OF_DATA. So the pixel runs inside Shopify's web-pixel sandbox and respects the cookie banner.
- Other web pixels: Google & YouTube app (AW-18232390122, G-C7EZSL4WPV), Simprosys/GSF Google Shopping app (Merchant 5756953290; its custom script has no Meta code, checked), Omnisend, Pinterest (tag 2613451611314), TikTok (D8T756BC77U4IS6DJ1H0), Judge.me, Shopify custom-pixel slot.
- **Duplicate risk: none found** in page code. One Meta sender in the browser (the channel web pixel) plus the channel's own server CAPI. The Legend Beds pixel is not on the site.
- Limit: the Shopify "Customer events → Custom pixels" admin screen cannot be read here. A merchant-made custom pixel would not show in the HTML. The `shopify-custom-pixel` entry is Shopify's standard slot. UNKNOWN whether a Meta custom pixel exists there (owner check, 1 minute).

## 4. Event volumes, pixel 504564665962911 (VERIFIED, ads_get_dataset_stats, Meta days in Pacific time)

Raw events received. Browser (WEB_ONLY) and server (SERVER_ONLY) are counted separately. Meta's own total (`event_total_counts`) equals browser + server, so these are **before** deduplication.

**27 complete days, 23 Oct – 18 Nov (PT)** (the API allows at most 28 days back; 22 Oct is partial and left out):

| Event | Browser | Server (CAPI) | Raw total | Server ÷ browser |
|---|---|---|---|---|
| PageView | 3,816 | 3,322 | 7,138 | 0.87 |
| ViewContent | 1,547 | 1,729 | 3,276 | 1.12 |
| AddToCart | 186 | 272 | 458 | 1.46 |
| InitiateCheckout | 52 | 115 | 167 | 2.21 |
| AddPaymentInfo | 36 | 33 | 69 | 0.92 |
| Purchase | 10 | 11 | 21 | 1.10 |
| Search | 47 | 50 | 97 | 1.06 |

**Last 7 complete days, 12–18 Nov (PT):**

| Event | Browser | Server | Raw total |
|---|---|---|---|
| PageView | 872 | 850 | 1,722 |
| ViewContent | 377 | 423 | 800 |
| AddToCart | 54 | 89 | 143 |
| InitiateCheckout | 17 | 49 | 66 |
| AddPaymentInfo | 6 | 6 | 12 |
| Purchase | 2 | 3 | 5 |

Reading:
- **Conversions API is ON.** Server events arrive for every funnel event, with hourly freshness. This is the Shopify channel's built-in CAPI. VERIFIED.
- **InitiateCheckout server count is 2.2x browser** and spikes on 5 Nov (23 server vs 11 browser), 15 Nov (18 vs 3) and 16 Nov (20 vs 3). Those dates match the checkout bot attempts in Stage 1 section 5.5 (15–17 Nov). Bots reach Shopify's checkout server-side without running the browser pixel. ESTIMATE (date match). Meta's InitiateCheckout is inflated by bots on those days; do not use it as a funnel KPI.
- 7-day window (12–18 Nov): browser 2 + server 3 = 5 raw Purchases. Shopify had 4 orders (#1040–#1043, £2,178.82). After dedup Meta should hold 3 (see section 5).

## 5. Meta Purchase vs Shopify orders, same window (VERIFIED + ESTIMATE)

Shopify orders created 23 Oct 00:00 – 18 Nov 24:00 PT (= 23 Oct 07:00 UTC – 19 Nov 08:00 UTC): **16 orders, £6,947.57 total, all GBP, all web, none test, none cancelled.** Tax £0 on all; shipping £90 on one order (#1038). VERIFIED (Shopify GraphQL `orders`).

Matching each order to Meta's per-day Purchase counts (browser and server, by Pacific date):

| Result | Orders | Value | How |
|---|---|---|---|
| Caught by browser AND server (should dedup to 1) | 9: #1028, #1030, #1031, #1032, #1033, #1036, #1038, #1040, #1042 | | day counts 1 web + 1 server |
| Caught by server only (browser blocked) | 2: #1034 (6 Nov), #1043 | | 1 server, 0 web |
| Caught by browser only | 1: #1029 (27 Oct) | | 1 web, 0 server |
| **Missed** | 4: **#1035, #1037, #1039, #1041** | £1,336.86 | 0 events those days or 1 short |
| **Total Meta (after dedup)** | **12 of 16 (75%)** | about **£5,611.11** of £6,947.57 (81%) | ESTIMATE |

- The 4 missed orders are exactly the 4 with **0 tracked visits** in Shopify's customer journey (momentsCount 0). VERIFIED (Shopify `customerJourneySummary`). So the loss is consent or blocked tracking, which Shopify's channel honours for both browser and CAPI. It is not a wiring fault. This also matches Stage 1 ("4 of 16 orders have no tracking").
- Raw Meta count 21 vs Shopify 16 does **not** mean over-counting. 21 is browser + server before dedup; about 12 unique remain. ESTIMATE.
- The skill's verdict band: a 25% count gap is within the normal 10–30% loss for browser + consent setups. Not broken.
- **Purchase value and currency inside Meta: UNKNOWN.** No read tool returns event parameters, and no ad account linked to this pixel can report `purchase_values`. Shopify's channel normally sends the order total in presentment currency (GBP; this store sells only in GBP). Owner check: Events Manager → dataset 504564665962911 → Purchase → "View details" → Parameters (value, currency, content_ids).
- The one shipping-charged order (#1038, £90) is the only case where "total" and "subtotal" differ. Tax is £0 on every order. So the value basis matters for 1 order in 16.

## 6. Deduplication and match quality

**Dedup (event_id): UNKNOWN from these tools, likely fine.** Browser and server events arrive for the same orders on the same days. The Shopify Facebook & Instagram channel sends both from one integration with a shared event ID by design. Meta's dedup percentage is only visible in Events Manager (Overview → event → "Deduplication"). ESTIMATE + owner check.

**Event Match Quality (VERIFIED, ads_get_dataset_quality, web channel):**

| Event | EMQ (of 10) | Keys sent (coverage) |
|---|---|---|
| Purchase | **8.0** | email, phone, first/last name, city, county, postcode, country, external_id, IP, user agent: all 100% |
| ViewContent | 5.0 | IP, UA, external_id 100%; email 1.3%, phone 1.3%, fbc 1.9% |
| PageView | 4.8 | IP, UA, external_id 100%; email 2.6%, phone 1.9%, fbc 1.1% |
| AddToCart | 4.4 | IP, UA, external_id 100% |
| InitiateCheckout | 4.4 | IP, UA, external_id 100% |
| Search | 4.4 | IP, UA, external_id 100% |
| SubscribedButtonClick | no score | (low volume) |

Reading: Purchase EMQ 8.0 is good. Upper-funnel 4.4–5.0 is normal for anonymous browsing (skill: 3–5 expected). fbc (click ID) coverage is about 1–2% because no Meta ads have run since 8 Sep; it will rise when ads run.

## 7. content_ids and catalogue IDs

- Catalogue item `retailer_id` = **Shopify variant ID** (e.g. 56499380060491 = Side Lift Open Ottoman, Standard Double). `retailer_product_group_id` = **Shopify product ID** (15524053320011). VERIFIED (ads_catalog_list_products vs Shopify `nodes`).
- Pixel `content_ids`: not readable with these tools. The Shopify channel sends variant IDs, which match `retailer_id`. Meta's dynamic-ads check "Low Content ID Coverage Rate" **passed**. ESTIMATE (consistent, not observed).
- Conflict to note: `ads_catalog_event_source_get_health` says ViewContent, AddToCart and Purchase "weren't received in the last 7 days" for this catalogue, with match-rate data UNAVAILABLE (partial read). Dataset stats show 800 ViewContent, 143 AddToCart, 5 Purchase in those days, and the dynamic-ads check "event source missing events" **passed**. The health warning is likely about catalogue-matched events (or a stale/partial read). UNKNOWN. Owner check: Commerce Manager → catalogue → Events tab → match rate.

## 8. Catalogue 1311394936570400 (VERIFIED, catalog tools + Shopify GraphQL)

| Check | Result |
|---|---|
| Owner | Business Tech ABA (498070783385123), vertical commerce |
| Source | One Shopify partner integration, store 0whctf-mu, connected, last sync 19 Nov 01:53 UTC succeeded, no fatal sync errors, no data discrepancy flag. Data source status "error" reflects item health (the 3 rejections) |
| Products (groups) | **149** = **145 Eagle Bed + 4 styleaba.com** |
| Shopify | 145 products published to both Online Store and Facebook & Instagram; **763 variants**. 42 ACTIVE products are on neither channel (matches Stage 1's "42 active-but-unpublished") |
| Items (variants) | 767 = **763 Eagle Bed (exact match with Shopify) + 4 foreign** |
| Prices | 10 of 10 spot-checked variants match Shopify exactly, currency GBP, no sale price set. VERIFIED. Not every item checked |
| Availability | All sampled items "in stock", published, eligible |
| Out of sync | None found (counts match; last sync today) |
| Event sources | 504564665962911 (live) and 911849111119381 (dead since Jan 2025) |
| Product sets | 21 |
| Custom conversions (ad account 641104701697209) | **0** |

**Diagnostics (unchanged since Stage 1):**

| Issue | Severity | Items | Detail |
|---|---|---|---|
| Policy violation | must fix (Shops only) | 3 | All 3 are variants of **Memory Orthopaedic Mattress** (56499377832267, 56499377865035, 56499377897803). "Orthopaedic" reads as a health claim |
| Duplicate images | opportunity | 60 | Variant image repeats the main image (not a Shopify fault, per 10 Nov check) |
| Fewer than 2 images | opportunity | 62 | Same cause, per variant |

**Foreign products still in the catalogue (flagged on 10 Nov, not yet removed):** HiSmile Fast Whitening Bundle, Teeth Whiteniing Strips, Hismile Teeth Whitening, HISMILE V34 TEETH. URLs go to styleaba.com. Published and **eligible for ads and Shops**. They are not from the Shopify source (it holds exactly 763 items), so they are leftovers from an earlier StyleAba feed and only Commerce Manager can delete them.

**Dynamic ads health:** 13 checks run, 2 failed: policy violations, shop visibility issues. Readiness **blocked** until those are cleared. Feed upload, event-source events, content-ID coverage, currency coverage all passed. VERIFIED.

## 9. Problems by severity

| # | Severity | Problem | Evidence | Impact |
|---|---|---|---|---|
| M1 | **P0 (before any Meta spend)** | Ad account 641104701697209 sits in "Legend Beds" business and can only see the Legend Beds pixel (legendbeds.co.uk) and Legend Beds catalogue. Past Eagle Bed purchase ad sets optimised on that pixel | Sections 1, 2 | Any relaunch from this account would optimise on another site's buyers and report 0 Eagle Bed purchases. Likely cause of Aug "0 purchases" |
| M2 | P1 | 4 styleaba.com teeth-whitening items in the Eagle Bed catalogue, eligible for ads and Shops | Section 8 | Could appear in Eagle Bed catalogue ads/Shop. Brand and policy risk |
| M3 | P1 | Owner/structure unclear: Eagle Bed assets are in "Tech ABA" business; the account named "Eagle bed" is in "Legend Beds"; the "Tech" account in Tech ABA is USD with no payment method | Section 2 | Needs an owner decision on which business runs Eagle Bed ads |
| M4 | P2 | 3 Memory Orthopaedic Mattress variants rejected for Shops | Section 8 | Product hidden on FB/IG Shops; blocks DA "ready" status |
| M5 | P2 | InitiateCheckout inflated by checkout bots (server events) on 5, 15, 16 Nov | Section 4 | Wrong funnel numbers if InitiateCheckout is used as a KPI or optimisation event |
| M6 | P3 | Dead pixel 911849111119381 still attached to the catalogue; unused never-fired pixel 960027406236165 | Sections 2, 8 | Clutter; risk someone picks the wrong pixel |
| M7 | P3 | 0 custom conversions; 25% of orders invisible to Meta (consent/blocked) | Sections 5, 8 | Normal for UK consent; just set expectations |
| M8 | Info | Catalogue event-source health shows "missing events" while stats show events | Section 7 | Unresolved; owner check |

What is fine (keep): one Meta sender, loaded via the native channel; CAPI on; Purchase EMQ 8.0; catalogue in sync with Shopify (145/763 exact); prices match; GBP throughout.

## 10. Proposed fixes, AWAITING APPROVAL (nothing done)

**F1 (P0). Point Meta ads at the Eagle Bed pixel and catalogue.**
- What: decide which ad account runs Eagle Bed ads. Option A: in Meta Business Settings of **Tech ABA (498070783385123)**, share dataset 504564665962911 and catalogue 1311394936570400 with ad account 641104701697209 (Data sources → Datasets → Assign ad account; Catalogues → Add assets), then build any new ad set with promoted pixel 504564665962911. Option B: run Eagle Bed ads from an ad account inside Tech ABA (the "Tech" account is USD with no payment method, so a new GBP ad account is cleaner), and leave the Legend Beds business alone.
- Why: section 1. System: Meta Business Manager.
- Benefit: purchase optimisation and reporting on the real Eagle Bed buyers; catalogue ads possible.
- Risk: low. Option A grants a business you may not control access to your data; confirm who owns "Legend Beds" first. Never edit or reuse the Legend Beds pixel.
- Rollback: remove the asset assignment / close the new account.
- Approval: owner (business admin). Do with any Meta relaunch, not before; no spend change implied.
- Verify: Events Manager → Test events on www.eaglebed.co.uk shows PageView with pixel 504564665962911; ad set's "Conversion" shows that pixel.

**F2 (P1). Delete the 4 styleaba.com items from catalogue 1311394936570400.**
- What: Commerce Manager → Catalogue → Items → filter "teeth" → delete 4 items. Benefit: clean Eagle Bed catalogue. Risk: none for Eagle Bed (they are not Shopify items; the sync will not re-add them). Rollback: re-adding is not needed. Approval: owner (catalogue admin). Same action as 10 Nov owner action 1.

**F3 (P2). Clear the Memory Orthopaedic Mattress rejection.**
- What: request a second review in Commerce Manager. If refused, the owner decides on a title change in Shopify (e.g. drop "Orthopaedic"); that changes SEO and needs approval. Benefit: product visible in Shops; DA readiness. Risk: title change affects Google listings. Rollback: restore title.

**F4 (P2). Report funnels from human-filtered Shopify data, not Meta InitiateCheckout.**
- What: in HQ dashboards use Shopify human sessions/checkouts (Stage 1 15.1); treat Meta InitiateCheckout on 5/15/16 Nov as bot-inflated; if ads relaunch, optimise on Purchase (or AddToCart), not InitiateCheckout. System: reporting only. Risk: none. Bot blocking itself belongs to the checkout/fraud task.

**F5 (P3). Tidy unused datasets.**
- What: remove event source 911849111119381 from the catalogue; leave 960027406236165 unassigned or archive. Benefit: no wrong-pixel picks. Risk: none (both silent since Jan 2025 / never fired). Rollback: re-add.

**F6 (owner checks, 5 minutes, read-only).**
1. Events Manager → 504564665962911 → Overview → Purchase: note dedup %, `value`, `currency`, `content_ids` sample (expect GBP, order total, variant IDs).
2. Shopify → Settings → Customer events: confirm there is no Meta custom pixel (avoid a second sender).
3. Commerce Manager → catalogue → Events: match rate (resolves M8).
4. Confirm who owns business "Legend Beds" (2040644216402486) and legendbeds.co.uk.

No test conversion was fired. Per the skill, a real test order would put a real Purchase into Meta; do it only with the owner's yes, when F1 is done, and refund afterwards (Meta has no refund adjustment).

## Limitations
- Meta per-day buckets are Pacific time; Shopify order matching by date is an ESTIMATE (two days had 2 orders and 1 event).
- Event parameters (value, currency, content_ids, event_id) are not exposed by the read tools: UNKNOWN.
- Dataset stats allow only 28 days back, so the window is 27 complete days (23 Oct – 18 Nov PT), not a full 28.
- Ad account 1587599885205115 ("Tech") is not MCP-enabled; its campaigns and pixels were not read.
- Shopify Customer events (custom pixels) admin screen and Meta Events Manager dedup screen cannot be read here.
- Live HTML was fetched from the sandbox; Meta/third-party hosts are blocked here, so runtime firing was not observed in a browser.
- Catalogue price check covered 10 of 763 variants.

## Credits used
- OpenRush: **0** (budget 0). No calls.
- Meta Ads MCP (read only, no cost): ads_get_ad_accounts 1, ads_get_datasets 4, ads_get_dataset_details 2, ads_get_dataset_stats 7, ads_get_dataset_quality 1, ads_get_ad_entities 1 (no next_actions returned), ads_get_customconversions 1, ads_catalog_list_catalogs 1, ads_catalog_event_source_get 1, ads_catalog_event_source_get_health 1, ads_catalog_get_diagnostics 1, ads_catalog_get_dynamic_ads_health 1, ads_catalog_list_partner_integrations 1, ads_catalog_get_data_sources 1, ads_catalog_list_products 4, ads_catalog_list_product_sets 1.
- Shopify GraphQL (read): 9 queries (2 failed on schema, 0 writes).
- curl: homepage, GSF custom pixel script.
