# EAGLE BED — PROJECT ROCKET SALES / STAGE 1: FORENSIC REVENUE AUDIT

Prepared 19 Nov 2026 by the Manager's report writer. Read-only stage. Nothing was changed in Shopify, Google Ads, Gmail, HQ or git.

Sources: the five specialist reports in this folder (01 to 05), `ops/BRIEF.md`, `ops/ceo/ROADMAP-2026-11-19.md`, and the Manager's own checks today (marked "Manager check").

Labels used on every finding:
- **VERIFIED**: pulled or measured on 19 Nov 2026 (source named).
- **HISTORICAL**: from files, screenshots or search-index copies.
- **ESTIMATE**: worked out; the maths and assumptions are shown.
- **UNKNOWN**: not available; the reason is given.
- **RECOMMENDATION**: a proposed action. Nothing is done without owner approval where marked.

Privacy: no customer names, emails or phone numbers. Order numbers only.
Profit is **UNKNOWN** everywhere. Product, material, labour and delivery costs are not in any system.

---

## 1. Executive summary

1. **The last 30 days were the best month the store has had.** 16 orders, £6,857.57 net sales, £6,947.57 total sales, average order £428.60. Orders doubled (+100%) and net sales rose +173% against the previous 30 days. VERIFIED (Shopify, report 01). The owner's screenshot matches.
2. **Traffic fell, but buyers rose.** Human sessions fell from 2,431 to 1,489 (-38.7%). The fall is mostly paused Google Shopping and Search clicks that never sold, about 100 junk sessions, and a tag change that made "free Google listings" look as if they collapsed. Real organic Google clicks went **up** 29% (130 to 168). VERIFIED (reports 01, 02).
3. **Where buyers come from.** 8 of the 16 orders first came from Google Ads Performance Max (£3,106.50). 3 were direct, 1 came from ChatGPT (£629.96), 4 have no tracking. Social, email, blog and organic web search: 0 orders in the period. VERIFIED (report 02).
4. **Google Ads works, but less well than it looks.** PMax at £25/day returned 3.65x in 28 days (£709.44 spend, 6.96 sales, £2,591.62). 3 of the 7 sales came from people searching "eagle bed/beds". Without brand searches the return is about **1.7x**, about £165 per sale. VERIFIED / ESTIMATE (report 02).
5. **Mobile is now where the sales are.** 81% of human sessions and 11 of 12 tracked conversions are on mobile. Mobile conversion rose from 0.20% to 0.91%. VERIFIED (report 01).
6. **But a possible mobile layout bug needs a real-phone check today.** In a test iPhone 13 browser the Side Lift product page is 1,495 px wide on a 390 px screen, and the product title is white on white. Real phones are clearly buying, and the test browser blocks some scripts. So this is a **P0 "confirm on a real phone today"**, not a proven outage. Manager check, VERIFIED in test browser.
7. **Three honesty risks are live.** Product pages promise "Klarna or Clearpay at checkout", but no Clearpay was seen at checkout. 253 trade emails implied free assembly, which the owner has ruled out (£69.99). "Gas lift storage bed" listings show a price that does not include the storage base. VERIFIED (reports 03, 05).
8. **Only 20 of 145 live products sold in 90 days.** Ottoman beds were 10 of the last 16 orders. Headboards (17 live) sold nothing. VERIFIED (report 01).
9. **Reviews are the biggest gap against rivals.** About 1 product review found. The closest Yorkshire rival shows about 2,276 Trustpilot reviews at 5.0. VERIFIED (own) / HISTORICAL (rival).
10. **Trade email has not sold yet.** 253 emails, 1 interested reply (an interior design studio), 0 quotes, 0 orders. There is a legal-form gap under PECR. VERIFIED (report 05).
11. **The 66-agent agency is mostly idle.** About 15 agents do real, repeated work. 21 have never had a task. 68% of finished tasks still say "NEEDS VERIFICATION". About 60% of scheduled wake-ups on the account are not Eagle Bed. VERIFIED (report 05).
12. **Stage 1 cost 24 OpenRush credits.** Month total 55 of 2,001. The 400-credit reserve is untouched. VERIFIED (credit lists in reports 02, 04).

**The one-line answer:** the store converts better than ever, but it depends on one paid campaign and on brand searches, it has almost no reviews, and several page and claim problems may be costing orders now.

---

## 2. Verified Shopify baseline

Window: last 30 = 20 Oct to 19 Nov 2026; previous 30 = 19 Sep to 19 Oct 2026 (same as the owner's screenshot). Human sessions only, as the Shopify dashboard shows. VERIFIED (ShopifyQL, report 01).

| Metric | Last 30 | Prev 30 | Change |
|---|---|---|---|
| Orders | 16 | 8 | +100% |
| Gross sales | £7,472.64 | £3,257.86 | +129.4% |
| Discounts | -£615.07 | -£157.86 | +289.6% |
| Returns | £0.00 | -£585.90 | see note 1 |
| Net sales | £6,857.57 | £2,514.10 | +172.8% |
| Shipping | £90.00 | £0.00 | one NI order (#1038) |
| Total sales | £6,947.57 | £2,514.10 | +176.3% |
| Average order value | £428.60 | £387.50 | +10.6% |
| Sessions (human) | 1,489 | 2,431 | -38.7% |
| Sessions with add to cart | 180 | 100 | +80% |
| Sessions reached checkout | 57 | 27 | +111% |
| Sessions completed checkout | 12 | 4 | +200% |
| Shopify conversion rate | 0.81% | 0.16% | about 5x |
| Orders per human session | 1.07% | 0.33% | |
| Returning customer rate | 6.25% (1 of 16) | 0% | |

**Owner screenshot check.** Every money figure matches to the penny. Sessions -37% (screenshot) vs -38.7% (now) differ by about 70 previous-period sessions. Shopify re-labels bot sessions after the fact. ESTIMATE of cause. It changes no conclusion.

**Things the headline hides (VERIFIED, report 01):**
1. The previous-30 "returns" of -£585.90 are two old orders cancelled on 25 Sep (#1010, #1014), not product returns. Payment status EXPIRED.
2. **#1020 (£273.59) was cancelled 18 minutes after purchase but still shows PAID with £0 refunded.** If no refund was made outside Shopify, previous-30 net sales are overstated. Adjusted previous-30 net = £2,240.51 and net growth = +206% (ESTIMATE). **Owner to check #1020.**
3. 4 of the 16 orders have no linked session (cookies declined or tracking blocked, ESTIMATE). So Shopify's 0.81% under-counts real buying. The real rate is about 1.07%.
4. EAGLE10 (10% off) was used on 13 of 16 orders (81%). It cost £615.07 this month and £1,154.02 since July. It is the only discount code in use.
5. All 16 orders were marked "fulfilled" within 8 minutes to 2 days of purchase (median about 2 h 48 min). None has tracking. In this store "fulfilled" means "accepted", not "shipped".
6. All web orders show £0 tax. Whether prices include VAT, or the store is not VAT-registered, is UNKNOWN.

### 2.1 Sessions discrepancy, resolved (Manager note)

| Figure | Source | What it counts | Window |
|---|---|---|---|
| **1,489** | Report 01, owner screenshot | Human sessions only (`human_or_bot_session = 'human'`) | 20 Oct–19 Nov |
| 1,972 | Report 01 | All sessions, including bots | 20 Oct–19 Nov |
| **1,969** | Report 02 | All sessions, including bots | 20 Oct–18 Nov |
| **1,380** | Report 02 | United Kingdom only, all sessions incl. bots | 20 Oct–18 Nov |

- Report 02 could not reproduce 1,489 because it did not apply the human-only filter. Report 01 did. **Conflict resolved: 1,489 = human sessions.** VERIFIED.
- 1,969 vs 1,972 is the one-day window difference.
- 483 of 1,972 sessions (24%) are bots. About 30% of all sessions are non-UK. Eagle Bed sells only in the UK.
- UK-only **human** sessions were not pulled. UNKNOWN. This is the number the business should track (see section 15).
- The same filter explains other gaps: "reached checkout" is 57 human vs 163 all (106 bots); "add to cart" 180 human vs 194 all.

### 2.2 Other conflicts between reports, resolved

| Topic | Report A | Report B | Resolution |
|---|---|---|---|
| Previous-period orders | 01: 8 orders, £2,514.10 (to 19 Oct, includes cancelled #1020) | 02: 7 orders + 1 adjustment row, £2,551.01 (to 18 Oct) | Different end date and cancellation handling. Use report 01 (matches the screenshot). Both say orders at least doubled. |
| Mobile share | 01: 80.9% of human sessions | 02: 1,327 of 1,969 = 67% of all sessions; 03: "77%" | 03 quotes the October figure (HISTORICAL). Bots are mostly desktop, which lowers mobile share in 02. Use 81% human. |
| Google Ads spend (28 days) | Roadmap: £708.82 | 02: £709.44 | Pulled at different times; last 2 days are preliminary. Use £709.44 (later pull). |
| Trade emails sent | Roadmap: "about 300" | 05: 253 (HQ), 244 Gmail threads | 253 VERIFIED in HQ and day docs. The 9-thread Gmail gap is unexplained. |
| EAGLE10 creation date | 03: discount "created 19 Nov 2026 05:08 UTC" | 01: EAGLE10 used on 24 orders since August | Both cannot describe the same discount. Possibly the code was re-created today, or 03 read a cart timestamp. UNKNOWN. **Owner to check Shopify → Discounts.** |
| Side Lift page tested | 03 tested `/products/side-lift-open-ottoman-bed` | 01 best seller lands on `/products/side-lift-ottoman-gas-lift-storage-bed` | These may be two different listings. The real-phone check must cover both. |
| Mobile "leak" | 03: mobile pages broken (P0) | 01: mobile CR 0.91%, 11 of 12 conversions on mobile | Real phones are buying. The test browser may exaggerate. Hence "confirm on a real phone today" (section 6). |

---

## 3. Sales comparison

| Window | Orders | Net sales | AOV | Note |
|---|---|---|---|---|
| Last 30 (20 Oct–19 Nov) | 16 | £6,857.57 | £428.60 | Best month ever. VERIFIED |
| Prev 30 (19 Sep–19 Oct) | 8 | £2,514.10 (or £2,240.51 if #1020 not refunded) | £387.50 | VERIFIED / ESTIMATE |
| Last 90 (22 Aug–19 Nov) | 36 | £13,563.37 | £393.04 | 36 of the 43 orders ever. VERIFIED |
| Prev 90 (24 May–21 Aug) | 7 | £1,952.19 | £352.43 | Only about 40 trading days (first order 13 Jul). VERIFIED |

Plain English:
- Sales are growing fast from a small base. 16 orders a month means one order moves any figure a lot.
- 90-day growth (+595%) overstates momentum, because the earlier window held only about 40 days of trading.
- Weekly trend (report 02, all sessions): since 26 Oct, weeks have fewer sessions but 2 to 3 times more carts than September. Traffic quality rose as volume fell. VERIFIED.
- Size mix moved from singles and kids beds (July–August) to King and Super King adult beds (53% of units in 90 days). No single beds since 21 Aug. VERIFIED.
- Mattresses sold nothing in the last 30 days (2 the month before). VERIFIED.
- Only 1 of 16 last-30 orders came from a returning customer.

---

## 4. Product performance ranking (top 20 + categories A–G)

### 4.1 Top 20 by net sales, last 90 days (VERIFIED, report 01)

Only 20 products sold in 90 days, so this is every product that sold.

| Rank | Product | Net | Net units | Landing sessions (90d) | Trend L30 vs P30 |
|---|---|---|---|---|---|
| 1 | Ottoman Gas Lift Divan Base | £2,666.63 | 7 | 604 | Up |
| 2 | Side Lift Ottoman Storage Base | £1,603.38 | 6 | 274 | Up |
| 3 | Cloud Teddy Bouclé Ottoman Bed | £977.39 | 2 | 124 | New |
| 4 | Eagle Savoy Channel Bed | £823.48 | 1 | 36 | New |
| 5 | Royal Chesterfield Bed | £629.96 | 1 | 64 | New |
| 6 | 3000 Pocket Sprung Mattress | £595.39 | 2 | under 12 | Down |
| 7 | Regal Luxe Panel Bed | £578.97 | 1 | under 12 | Down |
| 8 | Curved Wingback Bed | £578.68 | 1 | 38 | New |
| 9 | Elegant Panel Bed | £562.48 | 1 | 19 | Down |
| 10 | Eagle Sunrise Fan Panel Bed | £549.98 | 1 | under 12 | Flat |
| 11 | Grand Extra-Tall Panel Bed | £539.97 | 1 | 116 | New |
| 12 | Eagle Regal Gold-Trim Bed | £503.98 | 1 | 36 | New |
| 13 | Mirror Strip Sunrise Bed | £428.99 | 1 | 39 | Flat |
| 14 | Line Ambassador Bed | £351.00 | 1 | 373 | Flat |
| 15 | Line Kids Velvet Bed | £350.99 | 1 | 205 | Flat |
| 16 | Hilton Wingback Bed | £327.60 | 1 | 14 | Flat |
| 17 | Cambridge Panel Storage Bed | £323.98 | 1 | 7 (L30) | New |
| 18 | Memory Orthopaedic Mattress | £220.99 | 1 | 22 | Flat |
| 19 | Divan Storage Base with Drawers | £194.99 | 1 | 119 | Flat |
| 20 | Upholstered Ottoman Storage Box | £97.99 | 1 | 27 | Down |

Plus "Selections" add-on lines from the VO Product Options app: £656.55 net (no product attached).

By type (90 days): bed frames £5,875.09 (43%), ottoman beds £5,247.40 (39%), mattresses £816.38 (6%), divans £518.97, kids £350.99, storage box £97.99.

### 4.2 Categories A–G

| Cat | Meaning | Products | Label |
|---|---|---|---|
| **A** | Best sellers (units) | Ottoman Gas Lift Divan Base (7), Side Lift Ottoman (6), Cloud Teddy and 3000 Pocket mattress (2 each) | VERIFIED |
| **B** | Highest revenue | Ottoman Gas Lift £2,666.63; Side Lift £1,603.38; Cloud Teddy £977.39; Savoy £823.48; Royal Chesterfield £629.96 | VERIFIED |
| **C** | Growing | Side Lift (0→4), Ottoman Gas Lift (1→4), Cloud Teddy (0→2); first sales for Savoy, Royal Chesterfield, Curved Wingback, Grand Extra-Tall, Regal Gold-Trim, Cambridge Storage | VERIFIED |
| **D** | Declining | 3000 Pocket mattress (2→0); Regal Luxe, Elegant Panel, Storage Box (1→0); Line Kids Velvet faded since August | VERIFIED |
| **E** | Traffic but weak sales | Line Bumper Ottoman (441 sessions, 28 carts, 0 sales); Line Ambassador (373, 26 carts, 1); Stone Premium (270, 2 carts, 0); Mini Line Wingback Kids (248, 10, 0); Grand Extra-Tall (116, 17 carts, 1); Savoy (36 landings, 9 checkouts reached, 1 sale) | VERIFIED |
| **F** | No meaningful sales | 125 of 145 live products (86%) sold nothing in 90 days; 136 of 145 (94%) nothing in 30 days. All 17 live headboards: 0. Pillow Top, Memory Foam, 1000 and 2000 pocket mattresses: 0. All kids beds except Line Kids Velvet: 0 | VERIFIED |
| **G** | New products to watch | 8 frames added 24 Aug have sold: £4,512.80 net (33% of 90-day net), about £564 a unit. Watch Grand Extra-Tall (top landing page in last 30 days, 16 carts) and Royal Chesterfield (11 carts from 60 landings). 9 products from 6 Oct are unpublished, so no data | VERIFIED |

Notes:
- Category E "many carts, no sales" points to a price, option or delivery surprise, not low interest. HYPOTHESIS, not tested.
- **Savoy checkout leak, corrected.** 9 human checkout sessions and 1 sale looks like a leak. But abandoned-checkout lists include people who later bought (see section 6, Manager note on #1034). Some of the 9 may be the same buyer. The true Savoy leak is smaller than it looks. UNKNOWN how much.
- 42 active products are unpublished (24 Aug storage-divan and kids batch, and all 9 from 6 Oct). 70 drafts. VERIFIED.
- The same product at the same size sells at different prices because options are built into the line price. Not a pricing error.

---

## 5. Traffic source analysis

### 5.1 Why sessions fell (report 02, VERIFIED unless marked)

| Cause | Size | Verdict |
|---|---|---|
| Paused Google Shopping (678 clicks, 0 sales) and Search (294 clicks, 0 sales) | Ads clicks 2,111 → 1,154 (-957) | Real loss, but these clicks did not sell |
| Junk referrers (syndicatedsearch, googlesyndication, vivoooo, appleeee and others) | about 100 sessions last period, almost none now | Not real visitors |
| `sag_organic` tag change around 28 Sep | "free Google listings" 1,149 → 22 sessions | Very likely paid PMax/Shopping clicks were labelled as free before 28 Sep. ESTIMATE (inference from tag timing) |
| Mid-September traffic spike | previous window holds a spike (986 and 900 human sessions a week) | Not a collapse; normal level is about 280–420 a week. VERIFIED (report 01) |
| Shopify's 21 Sep session-definition change | no visible step on 21 Sep | HISTORICAL claim, size UNKNOWN; not the main driver |
| Organic Google search | clicks 130 → 168 (+29%), impressions 9,569 → 14,916 | **Rose.** VERIFIED (OpenRush GSC) |
| Brand search | organic "eagle bed" clicks 34 → 16 | PMax now buys brand clicks (54 clicks, £49.67) that used to be free |

### 5.2 Sessions by UTM campaign (all sessions, VERIFIED)

| Source | Now | Before | Carts now | Checkouts completed now |
|---|---|---|---|---|
| (none): direct, organic web, bots | 881 | 966 | 74 | 5 |
| Google Ads PMax | 809 | 356 | 89 | 6 |
| ChatGPT | 188 | 61 | 23 | 1 |
| Ads Search (paused 28 Oct) | 44 | 115 | 0 | 0 |
| Free Google listings (`sag_organic`) | 22 | 1,149 | 2 | 0 |
| Ads Shopping (paused) | 4 | 59 | 1 | 0 |
| Klarna referral | 2 | 0 | 2 | 0 |

Shopify files Google Ads clicks under "search", not "paid". Only the UTM table separates paid from free.

### 5.3 Which sources bring buyers (first touch per order, VERIFIED)

| First touch | Last 30 orders | Value | 90-day valid orders |
|---|---|---|---|
| Google Ads PMax | 8 | £3,106.50 | 9 |
| Direct | 3 | £1,874.65 | 5 |
| ChatGPT | 1 | £629.96 | 1 |
| No tracking data | 4 | £1,336.46 | 10 |
| Google feed `sag_organic` (paid or free) | 0 | – | 6 (all before 7 Oct) |
| Facebook paid ads (August) | 0 | – | 2 |
| Organic web search (SEO) | 0 | – | 1 (August) |
| Social organic, email, Pinterest | 0 | – | 0 |

- Several PMax buyers came back "direct" through /cart to finish. Their last touch hides an ads customer.
- **ChatGPT is the fastest-growing source:** 61 → 188 sessions, 23 carts, 1 order. VERIFIED.
- Social posting (3 posts a day) has sold nothing directly in 90 days. VERIFIED (journey data). Indirect effect UNKNOWN.

### 5.4 Device and country

- Mobile: 81% of human sessions, 11 of 12 completed checkouts, CR 0.91% (was 0.20%). Mobile add-to-cart rate 11.5% (was 4.3%). VERIFIED.
- Desktop: 21 human checkouts reached, 1 order. Weak, but small numbers.
- Non-UK: about 30% of all sessions (US 303). These dilute every rate.

### 5.5 Possible card-testing bots on checkout, 15–17 Nov (Manager note, from report 02)

- 97 "reached checkout" sessions on 15–17 Nov against only 14 cart sessions. VERIFIED.
- Desktop, "direct", landing straight on `/checkout/…/shoppay_login`, from the US, Brazil, Bangladesh, Vietnam, Venezuela and Argentina. VERIFIED.
- This looks like automated checkout probing, for example card testing. ESTIMATE (pattern match).
- RECOMMENDATION (P0): owner checks Shopify → Settings → Checkout bot protection, and Shopify Payments for small failed or declined charges.

---

## 6. Website conversion audit

Method: live site in Playwright Chromium, iPhone 13 emulation (390 px) and desktop (1366 px). Nothing was typed into checkout. VERIFIED (report 03) unless marked.

### 6.1 Manager verification notes (VERIFIED by the Manager today)

**A. Side Lift product page on a test iPhone 13 browser.**
- Page width 1,495 px on a 390 px screen. The product title (h1) colour is white, rgb(255,255,255), on a white background.
- Caveat 1: the test sandbox blocks some third-party scripts (Shopify telemetry, Judge.me tracking, shop.app). This may change the layout.
- Caveat 2: real mobile conversion rose to 0.91%, with 11 of 12 tracked conversions on mobile. Real phones can buy.
- **Classification: P0 "confirm on a real phone today".** The owner opens the Side Lift page on their own phone and checks two things: (1) can the page be scrolled sideways, or is the photo/price cut off? (2) is the bed name visible above the price? Check both Side Lift URLs (`side-lift-open-ottoman-bed` and `side-lift-ottoman-gas-lift-storage-bed`) and the Savoy page.

**B. Clearpay.**
- The product page text says "Spread the cost with Klarna or Clearpay at checkout". The cart says "Pay in 3 with Klarna or Clearpay". The BRIEF lists Clearpay.
- The specialist saw Card, Klarna, Shop Pay instalments and PayPal at checkout, with **no Clearpay** (£305.99 test basket).
- **Owner to confirm in Shopify → Settings → Payments.** If Clearpay is off, either switch it on or remove the word from the theme, product copy and BRIEF. This is a misleading-claim risk until settled.

**C. Abandoned-checkout lists include people who already bought.**
- A Gmail draft to an abandoned-checkout customer was deleted, because that customer had already ordered (#1034, Savoy).
- So "abandoned checkout" counts and lists overstate lost sales. Any recovery contact must first check for a later order by the same customer.

### 6.2 Findings (report 03)

| # | Problem | Evidence | Sev | Fix | Approval |
|---|---|---|---|---|---|
| 1 | Mobile product pages wider than the phone (Side Lift 1,495 px, Savoy 1,110 px, Cloud Teddy 540 px, Divan Base 441 px) | VERIFIED in test browser; screenshots in scratchpad `rocket-cro/` | **P0 confirm** | CSS `min-width:0` on the grid column (test brought Side Lift to 390 px; Savoy only to 689 px, so another cause exists). Test all PDPs at 360/390 px | Yes (theme) |
| 2 | Sticky "Add to basket" bar never appears on overflowing pages | VERIFIED (same root cause) | P0 confirm | Fixing #1 should fix it | Yes (theme) |
| 3 | Product title white on white on every PDP; "Your basket" heading 1.2:1 contrast | VERIFIED, Manager re-checked rgb(255,255,255) | **P1** | Set title colour to the theme's dark ink in eb3d.css | Yes (theme) |
| 4 | Clearpay promised, not seen at checkout | VERIFIED | **P1** (P0 to confirm) | Owner checks Payments | Yes |
| 5 | "Gas lift storage bed" price leaves out the storage base (+£119.99 to +£189.99); Base Type defaults to slatted | VERIFIED | **P1** | Price the ottoman into the headline or rename; make Base Type required | Yes (price) |
| 6 | Main price does not move with add-ons; only a line "additional charge of £X" | VERIFIED | P2 | Show a running total | Yes (app) |
| 7 | Colour group also titled "Fabric Type" | VERIFIED | P2 | Rename "Colour" in Easify | Yes (app) |
| 8 | Mattress size does not follow bed size | VERIFIED | P2 | Easify conditional logic | Yes |
| 9 | Desktop layout shift CLS up to 0.47 (Easify injects late) | VERIFIED (varies by run) | P2 | Reserve height for options block | Yes (theme) |
| 10 | Heavy PDPs: about 3 MB, 1.26 MB JS; Easify 412 KB, also on /cart | VERIFIED (lab) | P2 | Unload Easify from cart; defer chat widgets | Yes |
| 11 | Phone required at checkout | VERIFIED | P2 | Keep if delivery team needs it; better help text | Yes |
| 12 | Delivery timeline shows Sunday and next-day ready; clashes with "3–5 working days" | VERIFIED | P2 | Skip weekends; use owner's real make time | Yes |
| 13 | Reviews: "Product reviews (0) · Store reviews (1)" | VERIFIED | P2 | Judge.me requests to past buyers | Yes |
| 14 | No direct WhatsApp link | VERIFIED | P3 | Add wa.me link | Yes |
| 15 | Mattress page has no delivery-service option | VERIFIED | P3 | Owner decides | Yes |
| 16 | Two Product JSON-LD blocks per PDP | VERIFIED | P3 | Keep one | Yes |
| 17 | Accessibility: gold vendor text 3.19:1, focusable hidden slides, `lang="en"` | VERIFIED (axe) | P2–P3 | Contrast tokens, `en-GB`, `inert` | Yes |
| 18 | Checkout redirects via shop.app first | VERIFIED | P3 | None; check speed on a real phone | No |

### 6.3 What works (keep)

- Required options block "Add to basket" with a clear message.
- Add-on prices reach the basket exactly (King Teddy configuration £857.96 matched).
- Delivery options correct: Downstairs free, Room of Choice +£29.99, Assembly +£69.99. Assembly is never shown as free.
- No countdowns, no "was" prices (0 of 145 have compare-at prices).
- EAGLE10 bar is honest and the code works.
- Delivery, returns and phone are above the fold on every page.
- Product photo loads fast (lab LCP 1.5–2.1 s throttled).
- Guest checkout, Klarna, Shop Pay instalments, PayPal, cards; UK default.
- 0 images missing alt text.

### 6.4 October findings re-checked

Fixed: `lang`, canonical, preload, Product schema, countdown and permanent "was" prices. Improved: thin city pages. Still open: mobile funnel (now converting, but possible overflow and invisible title). VERIFIED (report 03).

---

## 7. Google Ads audit

Account 198-038-2450. Read-only via OpenRush. VERIFIED unless marked.

### 7.1 Campaigns now

| Campaign | Type | Status | Budget | Bidding |
|---|---|---|---|---|
| Eagle Bed \| PMax \| All Products | Performance Max | ENABLED, limited by budget | £25/day | Maximise conversions, no ROAS target |
| Eagle Bed \| Search \| UK | Search | PAUSED 28 Oct | £5/day | Max clicks |
| Eagle Bed \| Shopping \| UK | Standard Shopping | PAUSED | £15/day | Max clicks |
| Bed Shop in Dewsbury | PMax | Removed/ended | – | – |

Total live budget £25/day, within the owner's £30/day cap. Optimisation score 74.9%. Only one account negative (parked domains).

### 7.2 Performance, 28 days

| Metric | 23 Oct–19 Nov | 25 Sep–22 Oct |
|---|---|---|
| Spend | £709.44 | £674.41 |
| Clicks | 1,154 | 2,111 |
| Avg CPC | £0.61 | £0.32 |
| Conversions | 6.96 | 3.04 |
| Conversion value | £2,591.62 | £1,276.85 |
| Cost per conversion | £101.87 | £221.85 |
| ROAS | **3.65** | 1.89 |

- PMax alone: £680.60 spend, ROAS 3.81. All 6.96 conversions came from the Search/Shopping network. YouTube, Display, Gmail and Discover spent about £27 for 0.
- **No conversions 3–12 Nov** (10 days, about £255). Only 6 of 28 days had a sale.

### 7.3 Are the conversions real?

- Yes. All 7 match real Shopify orders by date and value. No double counting. VERIFIED.
- #1033 (repeat buyer, PMax first touch) is in Shopify but not in Ads: a slight under-count.
- A second conversion action records £1.05 values. It should be "secondary". UNKNOWN which action.

### 7.4 Brand vs non-brand (ESTIMATE)

| Segment | Spend | Sales | Value | ROAS |
|---|---|---|---|---|
| Brand ("eagle bed/beds") | £49.67 | 3 | £1,457.80 | about 29 |
| Non-brand | about £659.77 | about 4 | about £1,133.82 | **about 1.7** |

Assumption: the 2 sales outside the top-60 search terms were non-brand. Cost per non-brand sale about £165. Whether that is profitable is UNKNOWN (no product costs).

### 7.5 Waste and gaps

| Issue | Evidence | RECOMMENDATION |
|---|---|---|
| Brand cannibalisation | Organic brand clicks 34 → 16 while PMax bought 54 brand clicks | Brand exclusion on PMax; optional £1–2/day brand Search |
| Competitor and off-range terms | about £30 on sosoftbeds, moorcroft, jysk, TV beds, toddler rails, "red bed" | Account-level negative list |
| "ottoman beds" is the top paid term (£35.80, 0 sales) | organic rank about 43 | Strong ottoman collection page; check PMax final-URL expansion |
| No product-level report | OpenRush has no listing-group report | Add `utm_content` with product or ad-group ID |
| Enhanced Conversions | not confirmed | Turn on in Google & YouTube app (free) |
| Merchant Center health | not readable by any tool | Owner opens Products → Needs attention, and free-listing clicks |
| No GTINs | normal for handmade | Confirm "identifier exists = no" is sent. UNKNOWN |

Do **not** raise the budget (owner rule). Consider a ROAS target only after 15+ conversions in 30 days.

---

## 8. SEO opportunity report

Search Console 22 Oct–18 Nov, VERIFIED (OpenRush; matches HQ cache `seo/gsc-latest`).
Site: 168 clicks (+38), 14,916 impressions (+5,347), CTR 1.13%, average position 26.6 (worse only because many more deep queries now show).

### 8.1 Top pages

| Page | Clicks | Impressions | Position |
|---|---|---|---|
| / | 31 (-16, brand) | 400 | 8.3 |
| /blogs/news/divan-bed-vs-bed-frame-uk | 14 (+14) | 827 | 17.8 |
| Cloud Teddy product | 9 (+6) | 933 | 9.2 |
| /blogs/news/how-do-ottoman-beds-work | 6 | 1,291 | 7.8 |
| /collections/storage-beds | 5 (+4) | 1,066 | 38.7 |
| /collections/divan-beds | 3 | 564 | 50.8 |
| /products/memory-foam-mattress-uk | 1 | 788 | 55.0 |
| /blogs/news/best-beds-for-small-bedrooms | 1 | 741 | 35.4 |

Only brand queries lost clicks. No non-brand query lost more than 1 click.

### 8.2 Near-win queries (positions 8–20)

| Query | Page | Impr. | Pos. |
|---|---|---|---|
| wingback panel bed | /collections/wingback-beds | 103 | 9.3 |
| panel bed / panel beds | /collections/panel-beds | 51 / 25 | 10.7 / 14.2 |
| cloud teddy bed and variants | Cloud Teddy product | 13–30 each | 10–13 |
| how do ottoman beds work | blog | 30–33 | 8–9 |
| divan vs bed frame | blog | 72 | 12.7 |
| what is a divan bed | blog | 101 | 18.6 |
| gas lift ottoman bed | /collections/ottoman-beds | 117 | 19.1 |
| chesterfield upholstered bed | product + ?variant URL | 34 | 18–19 |
| handmade beds yorkshire | site | 33 | 19.9 |

### 8.3 Core commercial terms (weak)

"ottoman beds" about 43 (HISTORICAL cache); "ottoman storage beds" 24.8; "ottoman divan bed" 68–71; "divan beds" 74.6; "upholstered beds uk" not ranking; "king size ottoman bed" not ranking. Live SERP check: Eagle Bed is not in the top 20 for "ottoman bed uk" or "upholstered bed uk". VERIFIED (reports 02, 04).

### 8.4 Findings and RECOMMENDATIONS

1. **Ottoman terms are split** between /collections/storage-beds and /collections/ottoman-beds. Pick one ottoman hub and point links at it.
2. **Chesterfield and divan-base rankings split across up to 5 URLs**, including `?variant=` URLs (29 parameter URLs earn impressions). Check canonicals.
3. **Fastest wins:** panel-beds, wingback-beds, Cloud Teddy, the two ottoman/divan guides. Better titles, meta descriptions and internal links.
4. **Guides earn clicks but sell nothing** (0 blog orders in 90 days). Add product blocks with "from £…" prices.
5. **AI-style long questions rank at positions 2–8.** With ChatGPT referrals up 3x, the FAQ/guide format works for AI answers.
6. Mattress pages rank deep (55–62). Low priority.
7. A rival (ukbedsdirect.com) sells a product called "Eagle Bed Frame" that ranks for our name. HISTORICAL.

---

## 9. Competitor intelligence

Competitor sites were blocked by the session network. Rival facts come from search-index copies of their own pages: **HISTORICAL (crawl date unknown)**. Re-check before any price decision. Eagle Bed prices VERIFIED today. Report 04.

| Seller | King ottoman / gas-lift | King upholstered frame | Free delivery | Lead time | Assembly | Trustpilot |
|---|---|---|---|---|---|---|
| **Eagle Bed** | £305.99 base; £467.99 Cloud | £349.99 typical; £484.99 Savoy | Yes, GB, own team | 3–5 working days | +£69.99 | none; about 1 Judge.me review |
| PSCL Beds (Yorkshire) | £249 base (size?) | £349–£589 | Yes, mainland | 5–10 days (3–5 paid) | paid | **5.0 / about 2,276** |
| Stylo Beds (W Yorks) | from £359.98 | UNKNOWN | Yes | UNKNOWN | UNKNOWN | none found |
| Bedwick (Bradford) | UNKNOWN | UNKNOWN | Eng/Wales/Ireland | UNKNOWN | UNKNOWN | none found |
| UK Beds Direct | £439.99 | £399.99 | Yes | 7–14 days | UNKNOWN | 4.5 / about 37–46 |
| Somni Beds | £389 (size?) | £439.00 | Yes, ex NI | UNKNOWN | flat-pack | none found |
| Divan Base Direct | £509.95–£719.95 | n/a | Yes, room of choice | 3–10 days | set-up extra | UNKNOWN |
| Dunelm | £263.20–£639.20 | UNKNOWN | £12.95, free over £300/£600 | UNKNOWN | UNKNOWN | on-site |
| Furniture123 | about £199.97–£369.97 | UNKNOWN | most of UK | next-day options | UNKNOWN | UNKNOWN |
| John Lewis | £1,149–£1,599 | UNKNOWN | free standard | UNKNOWN | UNKNOWN | on-site |

**Genuine edges (use in copy, all true per BRIEF):**
1. Speed: "usually 3–5 working days" beats every handmade rival's standard.
2. Free GB delivery by our own team, including Scotland.
3. Customer's own fabric accepted (no rival states this).
4. Handmade in Dewsbury, family-run.
5. 5-year frame warranty (PSCL 24 months, UK Beds Direct 2 years).
6. Mid-market price among handmade makers; far below John Lewis.
7. Cash on delivery; Klarna; PayPal. (Clearpay only once confirmed, see section 6.)

**Weaknesses:**
1. Reviews: the biggest gap by far.
2. Not on page 1 for core terms; similar-size rivals (Somni, Bedwick, Stylo) are.
3. Content tools: rivals have room-fit calculators and buying guides.
4. Brand confusion ("Eagle Bed Frame" sold by a rival).
5. Assembly is paid; one rival includes room-of-choice delivery.

Rival claims, designs and wording must not be copied. No rival price is invented above.

---

## 10. Trade sales audit

VERIFIED (HQ, Gmail read-only, Shopify), report 05.

| Stage | Count |
|---|---|
| Prospects in HQ | 271 |
| Never contacted (phone-only local leads, 10 Nov) | 18 |
| Emailed (11–18 Nov) | 253 |
| Hard bounces | 13 (5.1%); 1 not yet marked in HQ |
| Delivered (ESTIMATE: sent minus bounces) | 240 |
| Human replies | 4 |
| Positive replies | 1 (an interior design studio asking about customer-supplied fabric) |
| STOP | 3 (all set to do-not-contact) |
| Quotes sent | 0 |
| Trade orders / revenue | 0 / £0 |

By segment: the only positive signal is interior designers (1 of 16). Hospitality (B&Bs, guest houses, holiday cottages) produced all 3 STOPs and 7 of 13 bounces. Letting agents: 76 delivered, 0 replies, 0 STOPs.

**Problems found:**
1. **All 253 emails implied free assembly** ("free delivery … with assembly by our own team"). The owner's rule (19 Nov) is £69.99, never free. The brief is now fixed. Correct it in any reply or quote. Do not send a mass correction (that would be more unsolicited marketing).
2. **PECR legal-form gap.** Nothing checks whether a prospect is a company or a sole trader/partnership. Sole traders need prior consent for marketing email. Up to about 110 of 253 sends went to segments where sole traders are common (ESTIMATE; real number UNKNOWN until checked at Companies House).
3. No privacy-notice line in any email; no written legitimate-interests assessment; no retention rule.
4. The interested design studio was told only "Yes we do" on 17 Nov. No price list, fabric quantity or lead time. No follow-up scheduled.
5. No second-touch sequence and no quote record anywhere.
6. The send volume is set to rise to 140/day on 25 Nov and 200/day on 2 Dec, from a personal Gmail address.
7. The 10 Nov leads file wrongly says its leads were emailed; only 2 of 20 were.

**Segment verdicts (judgement, sample tiny):** more for interior designers and stagers; more for local West Yorkshire trade **by phone**; keep letting agents with a better offer; hold care homes (fire-safety and wipe-clean specs UNKNOWN, and fire-safety claims are banned); less, then pause, for hotels, B&Bs and holiday lets.

Legal points are general guidance, not legal advice. Owner to confirm on ico.org.uk.

---

## 11. Existing 66-agent performance audit

VERIFIED (HQ `runs`, `worklog`, `settings`, page source), report 05.

**Headline numbers:**
- 65 agents in HQ plus the Manager = 66.
- 490 task records read; 460 marked "done". QA verdicts: NEEDS VERIFICATION 332 (68%), BLOCKED 66 (13%), DONE 61 (12%), REASSIGNED 15, VERIFIED 4.
- **21 agents have never had a task.**
- About two-thirds of finished work comes from 10 agents (QA 48, Technical 44, Analytics 43, CRO 33, Ads 29, Product 26, Checkout 24, On-Page 20, Content 16, Email & SMS 16).
- Real store changes ("applied"): On-Page SEO 16, Product Pages 11, Technical SEO 5, Claude Code 3.
- Real sales work is done by **scheduled tasks** (Email Marketing, Inbox, Social), not by the HQ agents of the same name.

**Seven groups:**

| Group | Count | Members (short) |
|---|---|---|
| 1 Measurable value | 5 | Google Ads, On-Page SEO, Product Pages, Email Marketing, Customer Care (via Inbox task) |
| 2 Supports commercial work | 8 | Keyword, Content, New Products, Shopping, CRO, Reviews & Trust, Checkout Doctor, Offer & Pricing |
| 3 Operational | 7 | Technical SEO, Analytics, Tracking, Theme Engineer, Weekly Issue Scout, QA, Site Health |
| 4 Duplicate | 22 | 4 AI-search agents, 5 social, Speed, Drift, Topic Clusters, Search Experience, Image SEO, Brand SEO, Link Scanner, Spy, Market Research, Search Terms, Ad Creative, Buyer Walkthrough, Accessibility |
| 5 Resource without benefit | 10 | Video Studio, Higgsfield, Cinematic Director, CGI Photos, Marketplaces, Teardown (off), Materials, Quality, Brand Voice, Decision Council |
| 6 Needs better instructions or data | 10 | Off-Page & PR, Customer Finder, Local SEO, Schema, Email & SMS, Reddit/Quora, Workshop Planner, Delivery & Returns, Seasons, Profit & Cash |
| 7 Needs better coordination | 4 | Manager (three queue runners), Lead Finder vs Email Marketing (18 leads fell between), Social vs autopilot (double-post risk), Sales Closer vs Customer Care vs Inbox |

**Scheduled tasks:** 12 enabled, about 280 wake-ups a week (ESTIMATE).
- The "Trading HQ" watchdog runs hourly (168 a week). It is **not Eagle Bed** and is about 60% of all wake-ups.
- Cinema task still wakes 14 times a week though video is paused (Gemini out of credit).
- Social task runs a fresh Opus session 3 times a day with 7 connectors, about 360 Zapier tasks a month of 750.
- Four Eagle Bed tasks share one long session, so its context keeps growing.

**RECOMMENDATIONS (keep all 66; owner approval needed):**
1. One lead agent per cluster (12 leads). The Manager routes to the lead.
2. Do not assign work to agents whose missing data is unmet. Write one owner action instead.
3. One queue runner (CEO sprint). Autopilot and the browser only report.
4. `review:true` only for Shopify writes, money and outbound messages. ESTIMATE: 40–50% fewer HQ Claude calls.
5. Move or slow the Trading HQ watchdog (owner decision); disable the Cinema schedule while paused; run the social task on the default model.
6. Hold the trade email ramp at 80/day until the legal-form gate, privacy line, follow-up and quote record exist.

Missing capabilities (none needs a new agent): product costs, quote record, suppression list and legal-form check, phone-call workflow, Omnisend connector, Gemini credit, theme write/QA path, owner make and lead times.

---

## 12. Top 20 revenue opportunities

Rules for estimates: AOV £428.60 (last 30, VERIFIED). Mobile human sessions about 1,204 a month (VERIFIED). Store cart-to-order rate about 10% (36 orders / 353 human cart sessions, 90 days, VERIFIED). All money estimates are **revenue, not profit** (profit UNKNOWN). Small numbers: treat every estimate as a direction.

Columns: Dir = direction of impact. Effort L/M/H. Risk L/M/H.

### O1. Confirm and fix mobile product-page width and sticky bar
- **Evidence:** test iPhone 13: Side Lift 1,495 px, Savoy 1,110 px on 390 px; sticky bar off-screen. Manager check + report 03 (VERIFIED in test browser). Real mobile CR 0.91% (VERIFIED) means not all phones are affected.
- **Why it matters:** 81% of sessions are mobile. Long bed pages are the money pages.
- **Direction:** up (orders). **ESTIMATE:** if real and fixing it lifts mobile CR by 10% relative: 1,204 × 0.91% × 10% ≈ 1.1 orders ≈ £470 a month.
- **Effort:** L (CSS) + sweep of all PDPs. **Risk:** L (theme copy first).
- **Agents:** Theme Engineer (lead), Checkout Doctor, Site Health Watch. **Integrations:** Shopify theme (copy), real phone.
- **Owner approval:** yes (owner publishes the theme). **Success:** owner's phone shows no sideways scroll on Side Lift and Savoy; all PDPs 390 px wide at 360/390 px; mobile CR holds or rises over 4 weeks.

### O2. Make the product title visible
- **Evidence:** h1 rgb(255,255,255) on white on every PDP. Manager check + report 03 (VERIFIED).
- **Why:** shoppers cannot see the bed name above the price. Fails WCAG contrast.
- **Direction:** up (trust, conversion). Size UNKNOWN. **Effort:** L (minutes). **Risk:** L.
- **Agents:** Theme Engineer, Accessibility. **Integrations:** theme. **Approval:** yes. **Success:** title visible on phone and desktop; axe contrast passes.

### O3. Settle the Clearpay promise
- **Evidence:** PDP and cart text promise Clearpay; checkout showed none (report 03, VERIFIED). Owner to confirm in Settings → Payments.
- **Why:** a buyer who chose us for Clearpay meets a surprise at the last step; misleading-claim risk.
- **Direction:** up (if switched on) or risk down (if wording removed). **Effort:** L. **Risk:** L.
- **Agents:** Checkout Doctor, Product Pages. **Integrations:** Shopify Payments. **Approval:** yes. **Success:** checkout payment list and site copy say the same thing.

### O4. Honest price on "gas lift storage bed" listings
- **Evidence:** Cloud Teddy, Savoy, Side Lift default to slatted base; lift-up base +£119.99 to +£189.99 (report 03, VERIFIED). Cloud Teddy landing: 16 carts, 5 checkouts, 0 completed on that landing (90 days, report 01).
- **Why:** surprise cost at basket; drip-pricing risk; wrong-base orders.
- **Direction:** up (fewer drop-offs), risk down. **Effort:** M. **Risk:** M (headline price changes).
- **Agents:** Offer & Pricing, Product Pages. **Integrations:** Shopify, Easify. **Approval:** yes (price). **Success:** the named product's shown price includes what the name promises; Base Type required.

### O5. Stop paying for brand clicks and junk terms in PMax
- **Evidence:** brand £49.67 for 54 clicks; about £30 on competitor/off-range terms in 28 days; organic brand clicks 34 → 16 (report 02, VERIFIED).
- **Why:** frees about £80 per 28 days (about 11% of spend) for non-brand buyers within the same £25/day.
- **Direction:** up (non-brand reach) at the same spend. **ESTIMATE:** £80 / £165 per non-brand sale ≈ 0.5 extra sale per 28 days. Risk: some of the 3 brand sales may be lost if the organic result is not top.
- **Effort:** L. **Risk:** M (watch brand sales for 4 weeks).
- **Agents:** Google Ads (lead), Search Terms & Negatives. **Integrations:** Google Ads (owner-only write). **Approval:** yes. **Success:** non-brand ROAS reported weekly; total Ads sales not lower after 4 weeks.

### O6. One strong ottoman hub page
- **Evidence:** ottoman terms split between storage-beds and ottoman-beds; "ottoman beds" top paid term (£35.80, 0 sales), organic about 43; ottomans = 10 of 16 orders (reports 01, 02).
- **Why:** ottomans are the best sellers; both ads and SEO need one good landing page.
- **Direction:** up (organic and paid). Size UNKNOWN until ranks move. **Effort:** M. **Risk:** L.
- **Agents:** On-Page SEO (lead), Content Creation, Google Ads. **Integrations:** Shopify, OpenRush (rank checks). **Approval:** yes for theme/redirects; copy edits are safe. **Success:** one ottoman URL ranks for "ottoman beds" family; position < 20 in 8 weeks.

### O7. Push near-win pages onto page 1
- **Evidence:** panel-beds 10.7, wingback-beds 9.3 (103 impr.), Cloud Teddy 10–13, two guides 8–18 (report 02, VERIFIED).
- **Why:** page-1 positions get most clicks.
- **Direction:** up (clicks). **ESTIMATE:** if 5 pages with about 1,500 combined impressions move from CTR about 1% to 3%: +30 clicks a month. At blog-like conversion, small orders impact. **Effort:** L. **Risk:** L.
- **Agents:** On-Page SEO, Keyword Research. **Integrations:** Shopify, OpenRush GSC. **Approval:** no for safe title/meta edits (logged). **Success:** positions < 8 for those queries.

### O8. Turn guides into shop windows
- **Evidence:** "how do ottoman beds work" 1,291 impressions at 7.8; blog 0 orders in 90 days (report 02).
- **Why:** readers are bed buyers; nothing on the page leads to a product.
- **Direction:** up. Size UNKNOWN. **Effort:** L–M. **Risk:** L.
- **Agents:** Content Creation, Product Pages. **Integrations:** Shopify. **Approval:** theme section yes; copy no. **Success:** guide-to-product clicks and carts visible in Shopify landing-page report.

### O9. Build genuine reviews
- **Evidence:** about 1 product review; "Store reviews (1)"; rival 2,276 Trustpilot reviews (reports 03, 04).
- **Why:** £400–£900 purchase from a small brand needs social proof. Biggest gap vs rivals.
- **Direction:** up (conversion). **ESTIMATE:** about 35 valid delivered orders × 30% response ≈ 10 reviews. **Effort:** L. **Risk:** L (never fake reviews).
- **Agents:** Reviews & Trust (lead), Customer Care. **Integrations:** Judge.me. **Approval:** yes (emails to customers). **Success:** 10+ genuine reviews in 6 weeks; stars on PDPs.

### O10. Make swatches the main route to a sale
- **Evidence:** a swatch request on 12 Nov became order #1043 (£539.97) on 18 Nov (roadmap, report 05).
- **Why:** colour and feel are the doubts that stop a £500 online bed purchase.
- **Direction:** up. **ESTIMATE:** if 10 swatch requests a month and 20% order: 2 orders ≈ £860 a month (assumptions unproven). **Effort:** M. **Risk:** L (swatch cost UNKNOWN).
- **Agents:** Store Designer/CRO, Customer Care. **Integrations:** theme, Gmail. **Approval:** yes. **Success:** swatch requests logged; swatch-to-order rate measured.

### O11. Safe abandoned-checkout recovery
- **Evidence:** 57 human checkouts reached vs 12 completed per month (report 01). Manager note: one abandoned-checkout customer had already ordered (#1034); a draft was deleted.
- **Why:** many real buyers drop at checkout. But lists include people who later bought.
- **Direction:** up. **ESTIMATE:** about 45 abandoned (minus later buyers, bots excluded) × 3% ≈ 1 order a month ≈ £430. **Effort:** L. **Risk:** M (contacting someone who already bought).
- **Agents:** Email & SMS, Customer Care. **Integrations:** Shopify abandoned-checkout email, Omnisend. **Approval:** yes. **Success:** built-in recovery on; rule "check for later order first" written; recovered orders counted.

### O12. Real delivery dates and an honest timeline
- **Evidence:** all orders marked fulfilled within hours, no tracking (report 01); PDP timeline shows Sunday delivery and next-day ready (report 03); customers chasing (roadmap).
- **Why:** over-promise leads to complaints, refunds and bad reviews.
- **Direction:** risk down; reviews up. **Effort:** M. **Risk:** L.
- **Agents:** Delivery & Returns, Workshop Planner, Theme Engineer. **Integrations:** Shopify fulfilment, theme. **Approval:** yes; needs owner make times. **Success:** fulfilled = dispatched; every order gets a date; timeline skips weekends.

### O13. Grow AI-answer visibility (ChatGPT)
- **Evidence:** ChatGPT sessions 61 → 188, 23 carts, 1 order £629.96; AI-style questions rank 2–8 (report 02).
- **Why:** fastest-growing source with real carts.
- **Direction:** up. Size UNKNOWN. **Effort:** M. **Risk:** L.
- **Agents:** AI Recommendations (lead), Content Creation. **Integrations:** OpenRush AI visibility (credits). **Approval:** no for content drafts. **Success:** ChatGPT sessions and carts tracked monthly.

### O14. Quote the interested design studio properly
- **Evidence:** the only positive trade reply; waiting since 17 Nov with only "Yes we do" (report 05).
- **Why:** designers buy repeatedly and in volume; COM fabric is a unique offer.
- **Direction:** up. Value UNKNOWN. **Effort:** L. **Risk:** L (use £69.99 assembly wording).
- **Agents:** Sales Closer, Email Marketing. **Integrations:** Gmail. **Approval:** yes (owner sends). **Success:** quote sent within 24 hours; reply logged; quote record created.

### O15. Phone the 18 local leads
- **Evidence:** found 10 Nov, phone-only, never contacted (report 05).
- **Why:** closest buyers, cheapest delivery, no PECR email issue (screen against CTPS first).
- **Direction:** up. Value UNKNOWN. **Effort:** M (owner time). **Risk:** L.
- **Agents:** Lead Finder, Sales Closer (call script). **Integrations:** HQ `leads`. **Approval:** yes (owner calls). **Success:** 18 calls logged with outcome.

### O16. Find the blocker on Line Bumper Ottoman and Line Ambassador
- **Evidence:** Line Bumper 441 sessions, 28 carts, 0 sales; Line Ambassador 373 sessions, 26 carts, 1 sale (90 days, report 01).
- **Why:** strong interest, no buying: a price, option or delivery surprise (HYPOTHESIS).
- **Direction:** up. **ESTIMATE:** at the store's 10% cart-to-order rate, 54 carts ≈ 5 orders in 90 days; 4 more than now ≈ 1.3 a month ≈ £560 a month. **Effort:** M. **Risk:** L.
- **Agents:** Buyer Walkthrough, Checkout Doctor. **Integrations:** browser test, Shopify. **Approval:** no for the test; yes for fixes. **Success:** cause found and fixed; carts start turning into orders.

### O17. Easify option clarity
- **Evidence:** no running total; colour group labelled "Fabric Type"; mattress size not linked to bed size (report 03).
- **Why:** confusion and wrong-size orders.
- **Direction:** up; returns down. **Effort:** M. **Risk:** L.
- **Agents:** Product Pages, Store Designer/CRO. **Integrations:** Easify settings/support. **Approval:** yes. **Success:** total visible next to price; no wrong-size orders.

### O18. Review EAGLE10 (once margins are known)
- **Evidence:** used on 81% of orders; £615.07 this month; £1,154.02 since July (report 01).
- **Why:** it acts as a permanent price cut. Whether buyers would pay full price is UNKNOWN.
- **Direction:** revenue per order up, but conversion could fall. **ESTIMATE:** if half the code users would buy anyway at full price, about £300 a month kept. Unproven. **Effort:** L. **Risk:** M.
- **Agents:** Offer & Pricing, Profit & Cash, Decision Council. **Integrations:** Shopify Discounts. **Approval:** yes (price). **Success:** a timed test with order count and AOV compared.

### O19. Lighter, steadier product pages
- **Evidence:** about 3 MB and 1.26 MB JS per PDP; Easify on /cart; desktop CLS up to 0.47; home LCP 5.3 s throttled (report 03).
- **Why:** slow taps on 4G; Core Web Vitals affect ranking.
- **Direction:** up (small). **Effort:** M. **Risk:** L–M (app behaviour).
- **Agents:** Technical SEO, Theme Engineer. **Integrations:** theme, apps. **Approval:** yes. **Success:** CLS < 0.1; Easify absent from cart.

### O20. Product-level ad measurement
- **Evidence:** no product report in OpenRush; £1.05 secondary action; repeat buyer #1033 not counted (report 02).
- **Why:** budget cannot be moved to the products that sell (ottomans) without it.
- **Direction:** up (better spend). **Effort:** L. **Risk:** L.
- **Agents:** Tracking & Measurement, Google Ads. **Integrations:** Google & YouTube app, Google Ads. **Approval:** yes. **Success:** Shopify shows sales by ad product; Enhanced Conversions on; £1.05 action secondary.

---

## 13. Top 20 business problems

| # | Problem | Evidence | Label |
|---|---|---|---|
| 1 | Possible mobile overflow and invisible title on product pages | Manager check + report 03 | VERIFIED (test browser); real phone UNKNOWN |
| 2 | Clearpay promised, not seen at checkout | Report 03 | VERIFIED; owner to confirm |
| 3 | 253 trade emails implied free assembly | Report 05 | VERIFIED |
| 4 | No legal-form check before cold email (PECR) | Report 05 | VERIFIED gap; exposure ESTIMATE |
| 5 | Almost no reviews | Reports 03, 04 | VERIFIED |
| 6 | Paid sales lean on brand searches; non-brand ROAS about 1.7 | Report 02 | ESTIMATE |
| 7 | One campaign and one source (PMax) bring half the orders | Report 02 | VERIFIED |
| 8 | 125 of 145 live products sold nothing in 90 days | Report 01 | VERIFIED |
| 9 | "Fulfilled" is not "shipped"; no tracking; timeline over-promises | Reports 01, 03 | VERIFIED |
| 10 | Profit unknown: no product or delivery costs | All reports | UNKNOWN |
| 11 | Metrics polluted: 24% bots, about 30% non-UK | Reports 01, 02 | VERIFIED |
| 12 | Possible card-testing bots on checkout, 15–17 Nov | Report 02 | VERIFIED pattern; cause ESTIMATE |
| 13 | #1020 cancelled but still PAID, £0 refunded (£273.59) | Report 01 | VERIFIED; refund UNKNOWN |
| 14 | EAGLE10 on 81% of orders works as a standing price cut | Report 01 | VERIFIED |
| 15 | Storage-bed headline price leaves out the storage | Report 03 | VERIFIED |
| 16 | Not on page 1 for core terms; rankings split across URLs | Reports 02, 04 | VERIFIED |
| 17 | Blog, social and email produced 0 orders in 90 days | Report 02 | VERIFIED (first touch) |
| 18 | Abandoned-checkout lists include buyers who later ordered (#1034 case) | Manager note | VERIFIED |
| 19 | Agency waste: 21 idle agents, 68% unverified tasks, three queue runners, 60% of wake-ups not Eagle Bed | Report 05 | VERIFIED |
| 20 | Blind spots: Merchant Center, conversion actions, product-level ads, UK human sessions | Report 02 | UNKNOWN (no tool access) |

---

## 14. Resource and credit efficiency

### 14.1 OpenRush credits (VERIFIED)

| Item | Credits |
|---|---|
| Used before Stage 1 this month | 31 |
| Stage 1: competitors (2 × inspect_serp) | 6 |
| Stage 1: traffic/ads (3 × get_search_performance, 1 × get_ad_campaigns, 2 × get_ad_performance) | 18 |
| Stage 1: sales, website, trade reports | 0 |
| **Stage 1 total** | **24** |
| **Month total now** | **55 of 2,001** |
| Reserve (untouched) | 400 |
| Left to spend outside the reserve | 1,546 |

Stage 1 stayed well under its budgets (traffic 18 of 30, competitors 6 of 12). This report used 0 credits.

### 14.2 Other resources

| Resource | Finding | RECOMMENDATION |
|---|---|---|
| Scheduled wake-ups | about 280 a week; 168 are the non-Eagle-Bed Trading HQ watchdog; 14 are a paused Cinema task | Move/slow the watchdog; disable Cinema while paused (owner) |
| HQ agent calls | 2 Claude calls per task (`review:true`) | Review only where it matters: about 40–50% fewer calls (ESTIMATE) |
| Social task | Fresh Opus session, 7 connectors, 3 times a day; about 360 Zapier tasks a month of 750; 0 direct orders in 90 days | Default model, 2 connectors (owner) |
| Gemini | Out of credit; video paused | Leave paused until there is evidence video sells |
| Monday GSC reads | three Monday tasks read Search Console | Share one `seo/gsc-latest` pull |
| Google Ads | £709.44 per 28 days; about £80 on brand/junk; about £27 on YouTube/Display/Gmail | Brand exclusion + negatives (section 7) |
| EAGLE10 | £615.07 a month | Review once margins are known |

---

## 15. Stage 2 implementation plan

### 15.1 Tracking gaps
- No UK-only human sessions view. Build one (ShopifyQL: human + UK) and use it for every rate.
- Checkout bots inflate "reached checkout". Exclude bots and non-UK from funnel reports.
- 4 of 16 orders have no session (consent or blocked tracking). Report "orders per UK human session" next to Shopify CR.
- Social and email have no tracked buyers. Add UTMs to every social post and email link.

### 15.2 Missing integrations (UNKNOWN today)
- Merchant Center diagnostics and free-listing clicks: owner check, or a connector.
- Google Ads conversion-action list and product report: owner check in Ads; add `utm_content`.
- Omnisend connector for email flows.
- Judge.me admin (true review count).
- Competitor sites (blocked by network); re-check live prices before any price decision.

### 15.3 Analytics discrepancies to keep explaining
- 1,489 human vs 1,972/1,969 all vs 1,380 UK (section 2.1).
- Ads 6.96 conversions vs 8 PMax first-touch orders (repeat buyer not counted; click date vs order date).
- Gmail 244 threads vs HQ 253 trade sends.
- EAGLE10 creation date (19 Nov) vs use since August.
- #1020 PAID after cancel.

### 15.4 Conversion measurement
- Weekly: UK human sessions, carts, checkouts (human), orders, AOV, mobile vs desktop.
- Per product: landing sessions, carts, orders (category E watch list).
- Abandoned checkouts: count only those with no later order.

### 15.5 Attribution
- Report Ads ROAS split brand / non-brand every week.
- Credit "direct via /cart" finishes to the original PMax click where the journey shows it.
- Turn on Enhanced Conversions; confirm £1.05 action is secondary.
- Track ChatGPT as its own source.

### 15.6 Product data
- Size names differ (Savoy "King" vs others "King (5FT)"). Standardise for Shopping and filters.
- Fabric spelling (Conniston/Coniston) and a "Chenille" mention not offered as an option.
- 42 active-but-unpublished products and 70 drafts: owner decides publish or archive.
- "Selections" add-on lines carry no product; report them separately.

### 15.7 Missing financial information (owner)
- Product cost per bed and size; delivery cost per order; payment fees.
- VAT status (all web orders show £0 tax).
- #1020 refund status.
- Real make time and delivery lead time.
- Swatch cost; COM fabric metres per size.

### 15.8 Exact next actions
See the queue below. P0 items are today. P1 within 7 days. Nothing that changes the store, ads, prices or emails happens without the owner's OK.

---

## Prioritised execution queue

| ID | Pri | Task | Owner agent | Evidence | Expected outcome | Depends on | Approval | Done when |
|---|---|---|---|---|---|---|---|---|
| Q1 | **P0** | Owner opens Side Lift (both URLs) and Savoy on own phone: sideways scroll? title visible? | Owner, with Checkout Doctor | §6.1A | Know if the bug is real | – | n/a (owner check) | Owner answers yes/no for each page, ideally with a screenshot |
| Q2 | **P0** | Confirm Clearpay in Shopify → Settings → Payments | Owner, with Checkout Doctor | §6.1B | Claim and checkout agree | – | n/a (check) | Owner says on or off; decision to enable or remove wording recorded |
| Q3 | **P0** | Check checkout bot protection; look for small failed charges 15–17 Nov | Owner, with Analytics | §5.5 | Card testing stopped or ruled out | – | Yes (settings) | Bot protection on; Payments checked |
| Q4 | **P0** | Rule: before any abandoned-checkout contact, check for a later order | Customer Care / Inbox task | §6.1C | No messages to people who already bought | – | Yes (prompt change) | Rule in Inbox and Email & SMS prompts |
| Q5 | **P0** | Decide on holding the trade email ramp at 80/day (step-up due 25 Nov) | Email Marketing | §10 | No volume rise before legal gate exists | – | Yes | Owner decision recorded before 25 Nov |
| Q6 | **P0** | Draft a proper quote for the design studio (COM fabric, £69.99 assembly wording) | Sales Closer | §10 | First trade quote | owner prices | Yes (owner sends) | Quote sent and logged |
| Q7 | P1 | Fix product title colour on a theme copy | Theme Engineer | §6.2 #3 | Bed name visible | – | Yes (owner publishes) | Title visible; contrast passes |
| Q8 | P1 | If Q1 confirms: fix overflow + sticky bar; test all PDPs at 360/390 px | Theme Engineer | §6.2 #1–2 | Full-width pages | Q1 | Yes | All PDPs 390 px wide |
| Q9 | P1 | Clearpay: enable, or remove wording site-wide and in BRIEF | Product Pages | §6.1B | Honest payment claim | Q2 | Yes | Site and checkout match |
| Q10 | P1 | Storage-bed price and Base Type default | Offer & Pricing | §6.2 #5 | No price surprise | owner price | Yes | Headline matches the name |
| Q11 | P1 | PMax brand exclusion + account negative list | Google Ads | §7.5 | About £80 per 28 days to non-brand | – | Yes (owner in Ads) | Lists live; weekly brand/non-brand report |
| Q12 | P1 | Judge.me review requests to past delivered orders | Reviews & Trust | §12 O9 | 10+ genuine reviews | – | Yes | Requests sent; reviews counted |
| Q13 | P1 | Check #1020 refund; check EAGLE10 creation date | Profit & Cash | §2.2 | Clean baseline | – | n/a (check) | Owner answers both |
| Q14 | P1 | Fulfil only at dispatch; send a delivery date; fix timeline weekends | Delivery & Returns | §12 O12 | Fewer chasers, honest promise | owner make times | Yes | Process written; timeline fixed |
| Q15 | P1 | Legal-form gate, privacy line, LIA, suppression list | Email Marketing | §10 | PECR gap closed | – | Yes | Gate in prompt; footer live; LIA in `ops/email/` |
| Q16 | P1 | Phone the 18 local leads (CTPS screened) | Lead Finder + owner | §10 | Local trade conversations | call script | Yes | 18 outcomes logged |
| Q17 | P1 | Merchant Center: needs-attention list and free-listing clicks | Google Shopping + owner | §7.5 | Feed health known | – | n/a (check) | Owner reports results |
| Q18 | P2 | One ottoman hub; consolidate ottoman links | On-Page SEO | §8.4 | Ottoman rankings up | – | Yes (redirects) | Hub chosen; links moved |
| Q19 | P2 | Near-win titles/metas (panel, wingback, Cloud, guides) | On-Page SEO | §8.2 | Page-1 positions | – | No (safe, logged) | Changes logged; positions tracked |
| Q20 | P2 | Product blocks inside top 3 guides | Content Creation | §8.4 | Guide → product clicks | theme section | Yes | Blocks live |
| Q21 | P2 | Easify: running total, "Colour" label, mattress size logic | Product Pages | §6.2 #6–8 | Clearer options | Easify support | Yes | All three fixed |
| Q22 | P2 | Speed: Easify off /cart, reserve options height, defer chat | Technical SEO | §6.2 #9–10 | CLS < 0.1 | theme copy | Yes | Lab re-test passes |
| Q23 | P2 | Enhanced Conversions, `utm_content`, £1.05 action secondary | Tracking & Measurement | §7.3 | Product-level ad data | – | Yes | Settings confirmed |
| Q24 | P2 | Line Bumper / Line Ambassador walk-through | Buyer Walkthrough | §4.2 E | Blocker found | – | No (test only) | Cause written up |
| Q25 | P2 | Swatch button and 3–4 day follow-up | Store Designer/CRO | §12 O10 | More swatch-led orders | swatch cost | Yes | Button live; follow-up running |
| Q26 | P2 | UK human weekly dashboard | Analytics | §15.1 | One trusted set of numbers | – | No | Dashboard in HQ |
| Q27 | P2 | Agency: cluster leads, one runner, `review:true` only where needed | Manager | §11 | 40–50% fewer calls | – | Yes | Settings changed and logged |
| Q28 | P2 | Trading HQ watchdog and Cinema schedule | Manager | §14.2 | about 45% fewer wake-ups | – | Yes (owner) | Schedules changed |
| Q29 | P3 | Accessibility: contrast tokens, `en-GB`, hidden slides | Accessibility | §6.2 #17 | WCAG pass | – | Yes | axe clean |
| Q30 | P3 | One Product JSON-LD; WhatsApp link; size names; fabric spelling | Schema Markup / Product Pages | §6.2, §15.6 | Cleaner data | – | Yes | Items fixed |

---

## Final answers

### A. What is working
- Sales: best month ever, 16 orders, £6,857.57 net, AOV £428.60. VERIFIED.
- Mobile conversion rose about 4.5x to 0.91%; 11 of 12 tracked conversions are mobile. VERIFIED.
- Google Ads PMax: 8 of 16 orders, real orders, ROAS 3.65 overall. VERIFIED.
- Ottoman beds (10 of 16 orders) and the August bed frames (33% of 90-day net). VERIFIED.
- Organic Google clicks up 29%; impressions up 56%. VERIFIED.
- ChatGPT referrals up 3x with real carts. VERIFIED.
- Basket, option pricing, delivery options and honest pricing (no countdowns, no "was" prices). VERIFIED.
- Swatch-to-order (one £539.97 order). HISTORICAL.
- Pausing Shopping and Search, which sold nothing. VERIFIED.

### B. What is failing
- Possible mobile layout bug and invisible product title (to confirm on a real phone today).
- Clearpay promise vs checkout.
- Reviews almost absent.
- Non-brand ads return only about 1.7x.
- 125 of 145 products never sell; headboards 0.
- Blog, social, email, trade: 0 orders.
- "Fulfilled" ≠ shipped; delivery timeline over-promises.
- Trade emails said free assembly; PECR gap.
- Agency: most agents idle or unverified; most wake-ups not Eagle Bed.

### C. Why the business is not generating more orders
1. **Too few buying visitors.** About 1,100–1,400 real UK visitors a month (ESTIMATE from 1,489 human sessions less about 30% non-UK in all sessions). At about 1% conversion that is about 15 orders. Growth needs more non-brand buyers, not more clicks.
2. **One source carries the business.** Half the orders come from one £25/day campaign, and part of that is people who already knew the brand.
3. **Weak trust signals for a £400–£900 purchase.** No reviews, no stars, possible page bugs, and a payment promise that may not hold.
4. **Price and option surprises on the bestselling type.** Storage costs extra on "storage beds"; totals do not update; carts on popular pages do not turn into orders.
5. **Organic search is not yet on page 1** for "ottoman beds", "upholstered beds" and "divan beds", and the content that ranks does not lead to products.
6. **Effort goes to channels that do not sell yet** (3 social posts a day, 253 trade emails, idle agents) while proven levers (reviews, swatches, product pages) wait.

### D. The 20 highest-value improvements (full detail in section 12)

| # | Improvement | Pri |
|---|---|---|
| O1 | Confirm and fix mobile page width and sticky bar | P0 check / P1 fix |
| O2 | Make the product title visible | P1 |
| O3 | Settle the Clearpay promise | P0 check / P1 fix |
| O4 | Honest price on gas-lift storage listings | P1 |
| O5 | PMax brand exclusion and negatives | P1 |
| O6 | One strong ottoman hub page | P2 |
| O7 | Near-win pages to page 1 | P2 |
| O8 | Guides with product blocks | P2 |
| O9 | Genuine reviews via Judge.me | P1 |
| O10 | Swatches as the main route to sale | P2 |
| O11 | Safe abandoned-checkout recovery | P0 rule / P2 build |
| O12 | Real delivery dates, honest timeline | P1 |
| O13 | AI-answer (ChatGPT) visibility | P2 |
| O14 | Quote the design studio | P0 |
| O15 | Phone 18 local leads | P1 |
| O16 | Fix Line Bumper / Line Ambassador blocker | P2 |
| O17 | Easify option clarity | P2 |
| O18 | EAGLE10 review (needs margins) | P3 until costs known |
| O19 | Lighter, steadier product pages | P2 |
| O20 | Product-level ad measurement | P2 |

### E. Exact Stage 2 plan (short)
1. **Today (P0):** owner phone check (Q1), Clearpay check (Q2), bot protection (Q3), abandoned-checkout rule (Q4), trade ramp decision (Q5), design-studio quote (Q6).
2. **This week (P1):** title colour and overflow fix on a theme copy; Clearpay wording; storage price; PMax brand exclusion and negatives; Judge.me requests; #1020 and EAGLE10 checks; fulfilment process; PECR gate; phone local leads; Merchant Center check.
3. **Next two weeks (P2):** ottoman hub and near-win SEO; guide product blocks; Easify clarity; speed; ad measurement; Line Bumper walk-through; swatch button; UK human dashboard; agency and schedule clean-up.
4. **Owner data pack (any time, unlocks profit work):** product costs, delivery costs, VAT status, make and lead times, swatch cost.
5. **Measure weekly:** UK human sessions, orders, AOV, mobile CR, non-brand ROAS, reviews count, trade quotes.

### F. Evidence for every major recommendation

| Recommendation | Evidence in this report | Source report |
|---|---|---|
| Real-phone check of product pages | §6.1A, §6.2 #1–3 | 03 + Manager check |
| Clearpay settle | §6.1B, §6.2 #4 | 03 + Manager note |
| Bot protection | §5.5 | 02 |
| Abandoned-checkout rule | §6.1C, §4.2 notes | Manager note, 01 |
| Hold trade ramp, PECR gate | §10, §11 | 05 |
| Design-studio quote | §10 | 05 |
| Storage price | §6.2 #5, §12 O4 | 03, 01 |
| PMax brand exclusion | §7.4, §7.5 | 02 |
| Reviews | §6.2 #13, §9 | 03, 04 |
| Delivery dates | §2 note 5, §6.2 #12 | 01, 03 |
| Ottoman hub, near-wins, guides | §8 | 02 |
| ChatGPT visibility | §5.2, §5.3, §8.4 | 02 |
| Line Bumper / Ambassador | §4.2 E | 01 |
| EAGLE10 review | §2 note 4, §12 O18 | 01, 03 |
| Agency and schedules | §11, §14.2 | 05 |
| Sessions explanation | §2.1 | 01, 02 + Manager note |
| Credits | §14.1 | 02, 04 |

---

## Limitations
- This report adds no new data pulls. It combines the five specialist reports and the Manager's checks of 19 Nov 2026.
- The mobile overflow was measured in a test browser that blocks some scripts. Real-phone behaviour is UNKNOWN until Q1.
- Competitor facts are search-index copies (crawl date unknown).
- Ads, GSC and Shopify windows differ by 1–3 days.
- Monthly numbers are small (16 orders); one order moves any rate.
- Profit is UNKNOWN throughout.

## Credits used
- This report: 0 OpenRush credits.
- Stage 1 total: 24 (6 competitors + 18 traffic/ads). Month total 55 of 2,001. Reserve 400 untouched.
