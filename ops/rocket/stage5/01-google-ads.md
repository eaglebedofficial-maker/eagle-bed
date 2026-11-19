# Rocket Stage 5, parts 3, 4, 8, 12 and 13: Google Ads (live account, conversion truth, product attribution, PMax and brand, top 20s and experiments)

Prepared 19 Nov 2026 (evening) by the Google Ads, Search Terms & Negatives, Ad Creative and Analytics specialists. **Read-only.** Nothing was changed in Google Ads, Merchant Center, Shopify, the theme or HQ. Order numbers only, no customer data.

**Companion files**
- `ops/rocket/stage5/campaign-performance.csv`: every campaign × window, with Ads-reported and real-order metrics.
- `ops/rocket/stage5/ads-product-attribution.csv`: 86 products. These are the 9 priority products plus every product with a paid landing or an Ads-matched order.
- `ops/rocket/stage5/owner-ads-export-request.md`: the exact export instructions, plus the proposed product-ID test.

**Sources**
- OpenRush Google Ads 198-038-2450, pulled 19 Nov 20:04 UTC. 8 calls, 24 credits, listed at the end.
- Stage 4's saved 90-day search-term pull (top 300 rows) and the Stage 1 28-day pull, re-used at no cost.
- Shopify Admin GraphQL: all 43 orders since 1 Jul with status, refunds and journeys.
- ShopifyQL: paid sessions by region.
- Stage 4 (`04-ads-products.md`, `ads-by-product.csv`) for paid landings by product.

**Labels**
- VERIFIED: read directly from Google Ads or Shopify today.
- MATCHED: an Ads conversion tied to a Shopify order by click date and exact value. The arithmetic is exact, but the click → order link is inferred.
- ESTIMATE: a calculation that rests on an assumption.
- UNKNOWN: data we do not have.
- HISTORICAL: taken from an earlier stage.

Google counts a conversion on the **click** date. Shopify counts on the **order** date. The last 1–2 days of Ads data are preliminary.

---

## 0. The answers in brief

| Q | Answer | Label |
|---|---|---|
| **A. Which campaigns genuinely produce paid orders?** | **Only PMax.** In 90 days it produced 11 real, paid, not-cancelled orders worth £4,374.43. 8 were non-brand (£2,915.60) and 3 were "eagle bed" brand searches (£1,458.83). The paused **Shopping UK** campaign produced 1 real order (#1012) plus cancelled #1014, for a real ROAS of 0.70. The paused **Search UK** campaign produced 2 orders, both brand searches; its non-brand spend of about £350 sold nothing. **Warning:** PMax's last non-brand sale came from a 2 Nov click. Since 3 Nov the account has spent £434.69, and the only Ads orders are 2 brand orders (#1040 and #1042). | VERIFIED spend, MATCHED orders |
| **C. Products wasting spend** | **Cannot be proven yet.** Product-level spend is UNKNOWN until the owner sends the PMax Products export. The session-share ESTIMATE puts about **£421 of about £775** PMax spend (30 days) on 76 product pages with **0 Ads orders in 90 days**. Confidence by product: **medium** for Grand Princess (31 paid landings, **0 baskets**, about £24 a month) and Cambridge Curved Headboard (18 landings, 0 baskets, about £14). **Low** for Line Bumper (about £70), Line Ambassador (about £76; its only sale was a brand search), Royal Chesterfield (about £30), Mini Line Wingback Kids (about £20) and Roxy (about £17). **Very low** for Grand Extra-High (about £102): it has 15 baskets and sold #1043 direct on 18 Nov, which ads may have influenced. Fix the page blockers before calling any of these waste. | ESTIMATE |
| **D. Actual cost per acquisition (real paid orders)** | **90 days: £165.52.** That is £2,317.26 ÷ 14 paid orders. Google says £154.48 because it counts cancelled #1014. **Non-brand: about £244.60** (£2,201.40 ÷ 9). **Brand: about £23.17** (£115.84 ÷ 5). **PMax: £122.28.** Last 30 days: **£101.11** (£778.55 ÷ 7.70). The previous 30 days: £327.83. **180 days: £215.47.** £699.37 was spent from 15 Jul to 21 Aug with no recorded conversion; whether tracking existed then is UNKNOWN. | VERIFIED ÷ MATCHED |
| **H. Improvements possible without a budget increase** | 1. Fix the P0 page blockers on Ottoman Gas Lift Divan Base and Line Bumper (website, not ads).<br>2. Add a negative list for clearance, cheap, furniture, TV beds, toddler, reviews and trustpilot terms.<br>3. Clean up search themes: remove the competitor themes that are already negated, the local "near me"/town themes and "eagle bed".<br>4. Add ottoman-specific headlines to lift ad strength from "Average".<br>5. Turn on Enhanced Conversions.<br>6. Keep one primary purchase action and retract cancelled orders.<br>7. Get the Products export, then exclude only items confirmed as waste.<br>8. Run the 1-day product-ID URL test.<br>9. Report brand and non-brand separately every week.<br>10. Check Northern Ireland shipping is accurate in Merchant Center.<br>All are £0 extra and all are **proposals awaiting owner approval** (§7). | – |

**The headline number to use:** over 90 days, the account returns **£2.33 of real order value per £1 spent (£1.94 ex-VAT)**. Non-brand returns **£1.52 (£1.27 ex-VAT)**. Profit after ads is **UNKNOWN**, because no product costs exist yet (owner cost sheet 0% returned). At an ex-VAT ROAS of 1.27, non-brand advertising only breaks even if contribution margin is above about **79% of ex-VAT revenue**. That is the arithmetic, not a fact about Eagle Bed's margins.

---

## 1. Live account (VERIFIED, 19 Nov 20:04 UTC)

### 1.1 Campaign settings

| Campaign | Type | Status | Daily budget | Bidding | Budget-limited? | Other |
|---|---|---|---|---|---|---|
| Eagle Bed \| PMax \| All Products (24218981435) | Performance Max | **ENABLED**. Primary status **LIMITED: BUDGET_CONSTRAINED** | **£25.00** (standard delivery, not shared) | **Maximise conversions**, no target CPA or ROAS | **Yes** | Started 5 Sep; Merchant 5756953290; UK, presence-only targeting; all languages; optimisation score **70.1%** (Stage 1 said 74.9%); image extraction opted out |
| Eagle Bed \| Search \| UK (24034402493) | Search | PAUSED | £5.00 | Maximise clicks (target spend), max CPC £2.00 | – | Google Search only; AI Max off |
| Eagle Bed \| Shopping \| UK (24044219251) | Standard Shopping | PAUSED | £15.00 | Maximise clicks, max CPC £0.80 | – | Same Merchant feed |
| Bed Shop in Dewsbury (24029277249) | PMax | Removed | – | – | – | £0 ever |

**PMax is still £25/day: confirmed.** That is the whole live budget, inside the owner's £30/day cap. Google flags the campaign as budget-constrained. **This is not a recommendation to raise it.** The owner's rule is no ad-spend increase, and nothing below supports one until costs are known.

The only account-level negative is the content label "parked domains". The PMax campaign has 15 negative phrases: free, argos, debenhams, second hand, diy, used, dreams, ikea, furniture village, dream beds, bensons, dunelm, wayfair, highgrove, dream bed.

### 1.2 PMax structure

| Item | Live state | Comment |
|---|---|---|
| Asset groups | **1**, "Asset Group 1" (6746837045). Eligible, ad strength **AVERAGE** | All spend sits in one group |
| Listing group | One node, "UNIT_INCLUDED" = **all products** | No product tiers |
| Final URL | Home page only (`https://www.eaglebed.co.uk`). Product ads go to product pages via the feed | 144 of 803 PMax sessions (18%) landed on the home page in 30d (HISTORICAL, Stage 4) |
| Headlines | 16, of which 4 auto-created. Only one is ottoman-specific ("Ottoman Storage Beds") | No "gas lift", "side lift" or "end lift" headline, although ottomans are the only proven non-brand sellers |
| Descriptions | 7, of which 2 auto-created. They mention free GB delivery, 5-year warranty, 14-day free returns, Klarna, Clearpay and cash on delivery | All match BRIEF. No assembly claim (correct) |
| Videos | **5 auto-created YouTube videos** | YouTube took £58.77 in 90d with 0 conversions (§1.4) |
| Sitelinks | Wingback, Contact, Kids, Ottoman, Chesterfield, Divan collections | No sitelink to the best-selling product page or to free swatches |
| Search themes (signals) | 49 themes. They include **"eagle bed"** (brand), competitor names **"Dreams", "Furniture Village", "Bensons for Beds"** (all three also negated, so the negative wins), "time4sleep", "sonno bed", "WeMakeBeds", and local themes such as "beds near me", "bed shop near me", "beds Leeds", "beds Batley", "beds Dewsbury", "bed factory dewsbury" and "bed shops Yorkshire" | Contradictory, and local themes attract shop-visit searches. There is no showroom claim (BRIEF) |
| Audience signals | None returned (only search themes) | Website visitors and cart-abandoner lists are not used as signals |

### 1.3 Account metrics by window

These are account totals from Google's daily rows; the windows are exact. Real orders come from §2. ROAS ex-VAT = real value ÷ 1.2 ÷ spend.

| Window | Dates | Spend | Impr. | Clicks | CTR | CPC | Ads conv. | Ads value | Ads CPA | Ads ROAS | Real paid orders | Real value | **Real CPA** | **Real ROAS** | **Ex-VAT ROAS** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Last 7 | 13–19 Nov | £176.11 | 14,505 | 259 | 1.79% | £0.68 | 2 | £1,132.76 | £88.06 | 6.43 | 2 (#1040 and #1042, **both brand**) | £1,134.87 | £88.06 | 6.44 | 5.37 |
| Previous 7 | 6–12 Nov | £200.42 | 16,408 | 313 | 1.91% | £0.64 | 0 | £2.10 | – | 0.01 | 0 | £0 | – | 0 | 0 |
| Last 30 | 21 Oct–19 Nov | £778.55 | 63,509 | 1,276 | 2.01% | £0.61 | 7.70 | £2,966.63 | £101.11 | 3.81 | 7.70 | £2,966.63 | **£101.11** | 3.81 | 3.18 |
| Previous 30 | 21 Sep–20 Oct | £750.72 | 121,645 | 2,538 | 2.09% | £0.30 | 2.29 | £901.82 | £327.83 | 1.20 | 2.29 | £901.82 | £327.83 | 1.20 | 1.00 |
| Last 90 | 22 Aug–19 Nov | £2,317.26 | 361,586 | 6,994 | 1.93% | £0.33 | 15 | £5,712.92 | £154.48 | 2.47 | **14** (plus #1014 cancelled) | £5,402.42 | **£165.52** | **2.33** | **1.94** |
| Previous 90 | 24 May–21 Aug (live from 15 Jul) | £699.37 | 148,666 | 2,487 | 1.67% | £0.28 | 0 | £0 | – | 0 | UNKNOWN (Ads recorded none) | – | – | – | – |
| 180 days | 24 May–19 Nov | £3,016.63 | 510,252 | 9,481 | 1.86% | £0.32 | 15 | £5,712.92 | £201.11 | 1.89 | 14 | £5,402.42 | £215.47 | 1.79 | 1.49 |

How to read this:
- The last 30 days look much better than the previous 30: ROAS 3.81 against 1.20. Part of the reason is that Shopping (£104) and most Search (£137) spend stopped. Part is the ottoman orders of 22 Oct–2 Nov.
- Then the last 14 days produced only two orders, both brand. The 6–12 Nov week had **£200.42 of spend and no sale**.
- Conversion lag is real. #1033 converted 20 days after its click. So the latest 1–2 weeks can still improve. The full picture by campaign is in `campaign-performance.csv`.

**By campaign (VERIFIED):**

| Campaign | Last 7 | Previous 7 | Last 28 (23 Oct–19 Nov) | Previous 28 (25 Sep–22 Oct) | 90d | Previous 90 (15 Jul–21 Aug) | 180d |
|---|---|---|---|---|---|---|---|
| PMax spend / conv / value | £176.11 / 2 / £1,132.76 | £200.42 / 0 / £2.10 | £699.98 / 6.96 / £2,591.62 (ROAS 3.70) | £433.25 / 3.04 / £1,276.85 (2.95) | £1,345.08 / 11 / £4,374.45 (3.25) | not live | = 90d |
| Shopping UK | £0 | £0 | £0 | £104.21 / 0 | £616.62 / 2 / £739.49 (HISTORICAL) | £411.59 / 0 | £1,028.21 / 2 / £739.49 (0.72) |
| Search UK | £0 | £0 | £28.84 / 0 | £136.95 / 0 | £355.54 / 2 / £598.98 (HISTORICAL) | £287.79 / 0 | £643.33 / 2 / £598.98 (0.93) |

### 1.4 Device, network and geography (90 days, VERIFIED)

| Device | Spend | Share | Clicks | CPC | Conv. | Value | ROAS (Ads) |
|---|---|---|---|---|---|---|---|
| Mobile | £1,989.92 | 86% | 6,194 | £0.32 | 12 | £4,286.46 | 2.15 |
| Desktop | £252.18 | 11% | 403 | £0.63 | 1 (#1029) | £256.50 | 1.02 |
| Tablet | £73.73 | 3% | 397 | £0.19 | 2 (the #1027/#1033 pair) | £1,169.96 | 15.87 |
| Connected TV and other | £1.41 | 0% | 0 | – | 0 | £0 | 0 |

PMax has no device bid adjustments, so this is information, not a lever. 86% of paid traffic is mobile, which is why the 19 Nov mobile theme fixes matter for ads.

| Network | Spend | Share | Clicks | Conv. |
|---|---|---|---|---|
| Google Search (including Shopping ads on Search) | £2,135.81 | 92.2% | 6,073 | **15** |
| YouTube | £58.77 | 2.5% | 194 | 0 |
| Display (content) | £50.21 | 2.2% | 539 | 0 |
| Discover | £35.29 | 1.5% | 81 | 0 |
| Search partners | £33.98 | 1.5% | 92 | 0 |
| Gmail, Maps, mixed | £3.17 | 0.1% | 15 | 0 |
| **Non-Search total** | **£181.42** | **7.8%** | 921 | **0** |

**Geography:** Google's location report is not exposed through OpenRush, so it is UNKNOWN. A Shopify proxy (paid `utm_medium=cpc` sessions, 90d) was VERIFIED instead:

| Region | Sessions | Basket sessions | Completed checkouts |
|---|---|---|---|
| England | 1,211 | 111 | 5 |
| Scotland | 99 | 8 | 0 |
| Wales | 68 | 4 | 1 |
| (blank) | 51 | 3 | 0 |
| Northern Ireland | 34 | 5 | 0 |
| Outside the UK | about 15 | 0 | 0 |

Northern Ireland delivery costs **£90** (BRIEF), while the ads say "Free Delivery Across GB". GB is accurate, but NI shoppers meet a surprise. Shopify's session region is not Google's location report.

---

## 2. Conversion truth: every Ads conversion mapped to Shopify

All Google Ads conversions in the account's whole life (180 days = 90 days, because the first one was on 25 Aug) are listed below. The full click-date table is in Stage 4 §1.3; it was re-verified today against live Shopify statuses.

| Class | Orders | Ads conv. | Ads value | Shopify value | Note |
|---|---|---|---|---|---|
| **Paid, valid** | #1011, #1012, #1016, #1018, #1022, #1027, #1028, #1029, #1030, #1031, #1032, #1033, #1040, #1042 | 14 (including fractional splits) | £5,402.42 | £5,402.42 | All `PAID`, none refunded (VERIFIED live) |
| **Cancelled, still counted by Google** | **#1014** (Shopping UK, Side Lift Ottoman Small Double; cancelled/expired 25 Sep) | 1 | £310.50 | £0 | Google never retracted it |
| Refunded | none | 0 | £0 | – | Only #1001 and #1006 were ever refunded (Jul/Aug, not Ads conversions) |
| Unmatched Ads conversions | none | 0 | £0 | – | Fractions of £1.05 and £4.45 are data-driven splits of #1042 and #1030 |
| Shopify orders with a paid-Google tag but no Ads conversion | none since tags began (28 Sep) | – | – | – | Every `pmax_all_products` order is counted. #1013 (Grand Princess, `sag_organic`, 31 Aug) and #1024 (mattress, `sag_organic`, 6 Oct) were not counted, so they are probably free listings |
| Other cancelled orders | #1010 (Facebook journey), #1020 (no journey; **paid, never refunded**, Stage 1 P0) | – | – | – | Not Ads conversions. Excluded from all counts |

Shopify records £0 tax on these web orders, while prices include 20% VAT (owner confirmed VAT registration). The Google & YouTube app sends the order total, so **every Google conversion value includes VAT**. Ex-VAT value = value ÷ 1.2. ESTIMATE until the accountant confirms the scheme.

### 2.1 Real ROAS and CPA by campaign (90 days)

| Campaign | Spend | Google conv. / value | Real paid orders | Real value | Real ROAS | Ex-VAT ROAS | Real CPA | Brand / non-brand orders |
|---|---|---|---|---|---|---|---|---|
| PMax | £1,345.08 | 11 / £4,374.45 | 11 | £4,374.43 | **3.25** | **2.71** | **£122.28** | 3 brand / 8 non-brand |
| Shopping UK (paused) | £616.62 | 2 / £739.49 | **1** (+#1014 cancelled) | £428.99 | **0.70** | 0.58 | £616.62 | 0 / 1 |
| Search UK (paused) | £355.54 | 2 / £598.98 | 2 | £598.98 | 1.68 | 1.40 | £177.77 | **2 / 0** |
| **Account** | **£2,317.24** | 15 / £5,712.92 | **14** | **£5,402.42** | **2.33** | **1.94** | **£165.52** | 5 / 9 |

### 2.2 Brand vs non-brand (both counts shown)

Brand means a search term containing "eagle bed" or "eagle beds". Hidden search terms are assumed to be non-brand (ESTIMATE). Brand spend is visible spend only, so it is a floor.

| Segment | Window | Spend | Orders | Real value | ROAS | Ex-VAT ROAS | CPA | Label |
|---|---|---|---|---|---|---|---|---|
| Brand, all campaigns | 90d | £115.84 (visible) | **5** (#1011, #1016, #1031, #1040, #1042) | £2,057.83 (Ads £2,056.78) | 17.8 | 14.8 | **£23.17** | ESTIMATE |
| Non-brand, all campaigns | 90d | about £2,201.40 | **9** (#1012, #1018, #1022, #1027, #1028, #1029, #1030, #1032, #1033) | £3,344.59 | **1.52** | **1.27** | **about £244.60** | ESTIMATE |
| PMax brand | 90d | £111.00 | 3 | £1,458.85 | 13.1 | 11.0 | £37.00 | ESTIMATE |
| PMax non-brand | 90d | about £1,234.08 | 8 | £2,915.60 | **2.36** | **1.97** | about £154.26 | ESTIMATE |
| Brand, all | 28d (23 Oct–19 Nov) | £49.67 (visible) | 3 (#1031, #1040, #1042) | £1,458.84 | 29.4 | 24.5 | £16.56 | ESTIMATE |
| Non-brand, all | 28d (23 Oct–19 Nov) | about £679.15 | 3.96 (#1028, #1029, #1030 at 0.96, #1032) | £1,132.78 | **1.67** | **1.39** | about £171.50 | ESTIMATE |
| Non-brand, all | clicks 3–19 Nov | part of £434.69 | **0** | £0 | 0 | 0 | – | MATCHED (lag possible) |

Brand is about 5% of spend but **38% of real Ads value**. Brand buyers already knew Eagle Bed, so brand orders flatter PMax's 3.25. Judge PMax on non-brand: **2.36 (1.97 ex-VAT)** over 90 days and **1.67 (1.39 ex-VAT)** over the last 28 days.

---

## 3. Product attribution

The full data is in `ads-product-attribution.csv`: 86 rows, 9 of them priority products.

**Plain statement: product-level Google Ads spend, impressions, clicks, conversions and ROAS are UNKNOWN for every product.** They stay UNKNOWN until the owner supplies the Google Ads → Performance Max → Products export. The exact instructions are in `owner-ads-export-request.md`: CSV with Item ID, Title, Impr., Clicks, Cost, Conversions and Conv. value, for 21 Oct–19 Nov and 22 Aug–19 Nov. **Status: not supplied.**

Confidence classes used in the CSV:
- **A VERIFIED**: paid landing sessions from ShopifyQL.
- **B MATCHED**: Ads conversion = Shopify order (click date + exact value).
- **C ESTIMATE**: session-share spend, £774.73 × (product PMax landings ÷ 803). This assumes equal CPC, which is false: brand clicks cost about £1.04 against an average of £0.61.
- **D UNKNOWN**: Google per-product metrics.

### 3.1 The 9 priority products

| Product | PMax landings 30d (baskets) | Paid landings 90d | Ads-matched paid orders 90d (non-brand) | Real revenue 90d incl. VAT / ex-VAT | Est. PMax spend 30d (C) | Class | Reading |
|---|---|---|---|---|---|---|---|
| Ottoman Gas Lift Divan Base | 55 (4) | 94 | **3 (3)**: #1027, #1028, #1033 | £1,532.64 / £1,277.20 | about £53 | B | Best ad seller. **P0 page blocker** (end-lift base sold with side-lift options), so fix before any push |
| Side Lift Ottoman Storage Base | 28 (4) | 47 | **3 (3)**: #1029, #1030, #1032 | £778.99 / £649.16 | about £27 | B | Best ratio. Cancelled #1014 (£310.50) excluded |
| Line Kids Velvet Bed | 25 (4) | 45 | 1 (1): #1018 | £505.98 / £421.65 | about £24 | B | Search term "side guard bed" |
| Cloud Teddy Bouclé Ottoman | 3 (1) | 7 | 1 (0): #1040, brand | £556.19 / £463.49 | about £3 | B | Brand buyer, not "won" by the ad |
| Line Ambassador | 79 (10) | 134 | 1 (0): #1016, brand | £377.99 / £314.99 | about £76 | B | Heavy paid traffic, 15 baskets, no non-brand sale |
| Line Bumper Ottoman Divan | 73 (10) | 128 | 0 | £0 | about £70 | C | P0 blocker; 17 baskets in 90d, no sale |
| Grand Extra-Tall Panel | 106 (15) | 107 | 0 | £0 | about £102 | C | Most paid landings. #1043 bought direct on 18 Nov (journey: direct) |
| Royal Chesterfield | 31 (6) | 34 | 0 | £0 | about £30 | C | Sold #1036 via ChatGPT, not ads |
| Eagle Savoy Channel Bed | 2 (0) | 4 | 0 | £0 | about £2 | C | #1034 (£823.48) came direct; ads are hardly involved |

Other Ads-matched products: Curved Wingback (#1042, brand; clicked Stone), Memory Orthopaedic Mattress (#1011, brand Search), Mirror Strip Sunrise (#1012, Shopping), Cambridge Storage Panel (#1031, brand), Upholstered Ottoman Storage Box (#1022).

**Only 4 products have a non-brand Ads sale that the ad plausibly caused:** Ottoman Gas Lift Divan Base, Side Lift Ottoman, Line Kids and Ottoman Storage Box (plus Mirror Strip on paused Shopping). Five of the 8 PMax non-brand orders are two ottoman products.

### 3.2 Product-ID tracking test (PROPOSAL, not approved)

The proposal is to append `&utm_term={product_id}` to the PMax campaign's existing Final URL suffix (`utm_content={product_id}` is the alternative wording). We suggest `utm_term` because the feed already sends `utm_content=sag_organic`, which would collide.

- **Check:** a 1-day ShopifyQL check the next day. It passes if at least 80% of PMax product-page sessions carry the matching item ID.
- **Rollback:** paste back the saved original suffix (1 minute).
- **Cost:** £0. Google may re-review ads.

Full steps are in `owner-ads-export-request.md`. **Approval: owner YES needed (Stage 4 Q21).**

---

## 4. PMax and brand strategy

### 4.1 What people searched (90 days; top 300 visible terms = £655.86, 28% of spend; VERIFIED terms, our categories)

| Category | Terms | Spend | Clicks | Conv. | Value | Examples |
|---|---|---|---|---|---|---|
| Ottoman / gas lift (generic) | 62 | £150.81 | 171 | 0 | £0 | ottoman beds (£38.91), ottoman bed, side lift ottoman bed, ottoman divan base, solid base ottoman |
| Brand ("eagle bed/beds") | 5 | £115.84 | 129 | **5** | £2,056.78 | eagle bed, eagle beds |
| Competitors and other bed brands | 50 | £96.27 | 69 | **1** | £274.99 | **obs beds (sold #1032)**, hale and hale, sosoftbeds, midas beds, jysk wakefield, elitebeds, hush my bed, moorcroft |
| Colour-led | 36 | £69.90 | 86 | 0 | £0 | brown bed, chocolate brown bed, pink bed frame, red bed, navy and gold bed |
| Upholstered / style (wingback, chesterfield, headboard, panel, sleigh) | 40 | £55.13 | 81 | 0 | £0 | ambassador beds, chesterfield bed, high headboard bed, sleigh bed |
| Generic bed / size | 26 | £48.14 | 96 | 0 | £0 | beds, double bed, king size bed, beds for sale |
| Local / "near me" / shop | 26 | £42.62 | 81 | 0 | £0 | bed shops near me, bed factory dewsbury, bed shops leeds, mattress stores near me |
| Irrelevant: furniture, clearance, cheap | 17 | £20.50 | 39 | 0 | £0 | furniture closing down sale, clearance furniture, cheap beds, pay weekly beds, bedroom ideas |
| Custom / bespoke | 10 | £19.97 | 41 | 0 | £0 | custom bed frames, bespoke beds, made to measure beds (mostly Search UK) |
| Kids / toddler | 9 | £15.90 | 12 | **1** | £505.98 | **side guard bed (sold #1018)**, toddler bed side rail, pink toddler bed |
| Divan / storage | 12 | £12.13 | 16 | 0 | £0 | divan bed, bed with drawers underneath |
| Mattress | 6 | £6.88 | 11 | 0 | £0 | orthopedic mattress double |
| Irrelevant: TV beds | 1 | £1.77 | 3 | 0 | £0 | white tv beds |

The 8 non-brand orders whose terms are hidden all landed directly on product pages from the feed. That is consistent with product-type searches whose term volume was too small to show: ottoman searches that are "invisible" individually but convert in aggregate.

**Do not negate generic ottoman terms.** Note too that the competitor terms show a return (1 sale on £96, ROAS 2.86), so a blanket competitor exclusion is not supported.

Search-term insights (Google's own category view) are not exposed through OpenRush, so they are UNKNOWN. The owner can export them (Export 2 in the request file).

### 4.2 Conversion quality

- 14 of 15 Google conversions are real paid orders. One cancelled (#1014) was counted, on Shopping. The share of conversions that are real is 93% by count and 95% by value.
- Value includes VAT, so true revenue is ÷1.2.
- 3 of 11 PMax buyers returned "direct" via /cart before paying (#1027, #1030, #1042), so Shopify's last-click under-credits PMax. 4 recent orders have no journey data at all (#1035, #1037, #1039, #1041).
- Data-driven fractions (0.02–0.04) are applied, and one tiny secondary action is worth £1.05 (Stage 2 T3: 7 conversion actions from one tag; keep one primary).

### 4.3 Should PMax be reorganised?

**Recommendation: not yet. Make small structural fixes now and restructure only with product data.**

- **Volume is too low to split.** £25/day is already budget-limited, and there are about 4 non-brand conversions per 28 days. Splitting into several campaigns would starve each one of the data that Maximise Conversions needs.
- **A second asset group inside the same campaign does not split the budget.** The option of an "Ottomans" asset group (listing group = ottoman products; ottoman headlines such as "Gas Lift Ottoman Beds", "Side or End Lift"; final URL /collections/ottoman-beds) is reasonable **after** the Ottoman Gas Lift Divan Base P0 fix and the Products export. That is experiment E3.
- **Product tiers** (proposal; the listing-group exclusion step needs the export first):

| Tier | Products | Evidence | Proposed treatment |
|---|---|---|---|
| 1 Proven non-brand sellers | Ottoman Gas Lift Divan Base, Side Lift Ottoman, Line Kids, Ottoman Storage Box (Mirror Strip Sunrise on old Shopping) | ≥1 non-brand Ads order (B) | Keep; ottoman asset group (E3) after the P0 fix |
| 2 Baskets but no ad sale | Grand Extra-High, Line Ambassador, Line Bumper, Royal Chesterfield, Mini Line Wingback (+Kids), Curved Wingback, Roxy | ≥10 paid landings, ≥10% basket rate, 0 non-brand orders | Keep; fix the page and price issues (Stage 3); re-measure 14 days after the 19 Nov theme |
| 3 Traffic, no baskets | Grand Princess (31/0), Cambridge Curved Headboard (18/0), Royal Chesterfield Wingback (13/0) | 0 baskets from paid landings | Candidates for exclusion **only if** the export confirms spend with 0 conversions |
| 4 Long tail | About 60 products with fewer than 10 paid landings | Too little data | Leave in; nothing to decide |

### 4.4 Separate brand: brand exclusion list in PMax?

| | Exclude brand from PMax (with or without a small brand Search campaign) | Keep brand inside PMax (status quo) |
|---|---|---|
| Pros | Clean non-brand measurement and bidding. Stops PMax claiming buyers who already knew Eagle Bed. Stage 1 saw organic brand clicks fall from 34 to 16 while PMax bought brand clicks (HISTORICAL) | Brand orders cost about **£23 each** (90d) and £16.56 (28d), the cheapest sales in the account. No risk of a competitor or reseller taking the brand slot. No extra campaign to manage |
| Cons and risks | **Risk of losing cheap brand sales.** That is 5 orders and £2,057.83 in 90d, about £690 a month. Losing even one a month (about £400) costs far more than the money freed (about £40 a month of brand spend). A brand Search campaign would need part of the £25 (a budget change, so owner approval). The test cannot show a result in under 4–8 weeks at about 1.7 brand orders a month | Brand inflates PMax ROAS (3.25 reported against 2.36 non-brand) and may push Maximise Conversions towards cheap brand clicks |
| Verdict | **Do not exclude brand now.** This changes Stage 1 Q11 on today's evidence: the money at stake is small, and losing brand sales would cost much more | **Keep, and measure non-brand separately every week** (search-term split, as in §2.2). Remove "eagle bed" from the search themes (a signal only; harmless). Revisit if the owner's Search-term-insights export shows brand above 15% of PMax spend, or if competitors start bidding on "eagle bed" |

### 4.5 A separate high-intent Search campaign (ottoman / gas lift)?

This is an **option only, not recommended now.**
- **Evidence against:** Search UK spent about £350 on non-brand terms with 0 sales. The visible generic ottoman terms (£150.81) have not converted in PMax either. PMax already serves these queries and takes priority over Standard Shopping.
- **Cost:** at Search UK's history (CPC about £0.49, 0 non-brand conversions in 756 clicks), even £5 a day would be about 300 clicks a month from the same £25. It is a budget re-split, so owner approval is needed.
- **When to reconsider:** only after (1) the product costs show a break-even ROAS, (2) the Ottoman base P0 fix is live, and (3) the Products export shows ottoman items convert at a CPA below break-even.

### 4.6 Negative keyword list (PROPOSAL; phrase match; PMax campaign negatives or an account-level list)

| Group | Proposed negatives | Visible 90d spend blocked | Why |
|---|---|---|---|
| Clearance and cheap | clearance, closing down, display furniture, outlet, discount, cheap, pay weekly, offers | about £12 | Bargain intent; prices are fixed |
| Not a bed | furniture for sale, furniture for you, bedroom ideas, neutral bedroom, furnishing store | about £9 | Off-category |
| TV beds | tv bed, tv beds | £1.77 (Stage 1 saw more) | Not sold (VERIFIED: no TV bed in the 145 products, per Stage 4 product DB) |
| Toddler | toddler, cot | about £7 | Toddler beds and rails are not sold. **Keep "kids" and "side guard"**: they sold #1018 |
| Research, not buying | reviews, trustpilot | about £4 | Reading about another brand |
| Store-visit competitors | jysk | £2.38 | Local-store intent |
| Local shop intent (test first) | near me (phrase), bed factory, bed shops | £42.62, 0 sales in 81 clicks | No showroom claim. **Test: remove the local search themes first (E1). Add "near me" as a negative only if spend continues with 0 sales after 14 days** |
| **Do NOT negate** | ottoman, divan, gas lift, brand, kids, competitor bed brands in general, colours | – | Sellers or converters, or colour-led matches driven by the feed |

Housekeeping: remove the search themes "Dreams", "Furniture Village" and "Bensons for Beds", which conflict with the existing negatives. All of the above are proposals. **Owner approval is required, and the owner makes the change in Ads.**

---

## 5. Top 20 advertising opportunities

The money effect of all of these is UNKNOWN unless stated. None needs extra budget. Approval: owner for every live change.

| # | Evidence | Product / campaign | Opportunity | Action | Financial confidence | Approval | Agent | Dependencies | Risk | Success metric |
|---|---|---|---|---|---|---|---|---|---|---|
| O1 | 3 non-brand orders, £1,532.64; 55 PMax landings in 30d; P0 blocker | Ottoman Gas Lift Divan Base | Best ad product, with a broken option set | Fix the end-lift/side-lift option mismatch (Stage 3) | Medium (B orders) | Owner | CRO / Website | Owner decides the options | Wrong options lose sales | Paid landing → order rate over 30d |
| O2 | 3 non-brand orders from 47 paid landings | Side Lift Ottoman | Best conversion ratio | Feature it in ottoman assets (O7) and E3 | Medium | Owner | Ad Creative | Products export | Small sample | Non-brand orders per 28d |
| O3 | 73 landings in 30d, 10 baskets, 0 sales; P0 | Line Bumper Ottoman | Paid traffic leaking at the page | Stage 3 P0 fix | Low (C) | Owner | CRO | – | – | Baskets → orders |
| O4 | 15 baskets each, 0 non-brand sales | Grand Extra-High, Line Ambassador | Basket leak (price jump, colour picker) | Re-measure 14 days after the 19 Nov theme; apply Stage 3 inv-7 / inv-2 | Low | Owner | CRO / Analytics | Theme live (done) | – | Checkout rate from paid sessions |
| O5 | £20.50 clearance/furniture + £7 toddler + £1.77 TV + £4 reviews (visible) | PMax | Stop irrelevant clicks | Negative list (§4.6) | High that the spend is wasted; small £ | Owner | Search Terms & Negatives | – | Over-blocking | Irrelevant visible spend about £0 |
| O6 | Themes contradict the negatives; local themes £42.62, 0 sales | PMax signals | Cleaner signals | Remove the conflicting, local and brand themes | Medium | Owner | Google Ads | – | Minimal (signals only) | Local spend share down |
| O7 | Ad strength Average; 1 ottoman headline of 16 | Asset Group 1 | Better ads for the proven category | Add 3–5 ottoman / gas-lift headlines and 1 description (BRIEF facts only) | Low | Owner | Ad Creative | – | Claims must match BRIEF | Ad strength Good; CTR |
| O8 | #1033 converted 20 days after its click; 3 buyers returned via /cart | Account | More complete conversions | Turn on Enhanced Conversions (Stage 2 T2) | Medium (measurement) | Owner | Tracking | Google & YouTube app | Hashed data consent | Conversions recorded vs Shopify |
| O9 | #1014 counted; £1.05 secondary action; 7 actions | Account | Clean bidding signal | One primary purchase action; retract cancelled orders | High (£310.50 overstated) | Owner | Tracking | Ads → Goals screenshot | – | Ads value = real value |
| O10 | Product spend UNKNOWN | PMax | Real per-product ROAS | Owner Products export | – (unlocks) | Owner (5 min) | Analytics | – | None | File received |
| O11 | Shopify cannot see the advertised product | PMax | Daily product-level ad sessions | 1-day `{product_id}` suffix test | – | Owner | Analytics | – | Brief re-review | ≥80% tagged |
| O12 | About £421/30d est. on 0-order products (C) | Tier 3 items | Shift spend within £25 | Exclude only export-confirmed waste | Low until the export | Owner | Google Ads | O10 | Excluding a slow seller | Non-brand CPA down |
| O13 | Brand = 38% of value, 5% of spend | Reporting | Honest PMax judgement | Weekly brand/non-brand split in HQ | High (measurement) | Manager | Analytics | Search-term pull (3 cr/week) | Credits | Weekly report exists |
| O14 | No audience signals set | PMax | Better targeting hints | Add website-visitor and cart-abandoner signals (signals do not restrict) | Low | Owner | Google Ads | Audience lists in Ads | Minimal | Non-brand CTR / conversions |
| O15 | NI: 34 paid sessions, 5 baskets, 0 orders; NI delivery £90 | Merchant / feed | Accurate shipping in ads | Check Merchant Center shipping shows £90 for NI | Low | Owner | Shopping / Feed | – | – | NI basket → order |
| O16 | Colour-led terms £69.90, 0 sales | Feed | Better colour matching | Check the colour attribute and titles on top products | Low | Owner | Shopping / Feed | Stage 4 feed data | Title changes affect SEO | Colour-term CTR and conversions |
| O17 | Brand CPA £23 | PMax | Keep cheap brand sales | Do NOT exclude brand now (§4.4) | Medium | – | Google Ads | – | – | Brand orders steady |
| O18 | "obs beds" sold #1032; competitor ROAS 2.86 | PMax | Competitor intent works a little | Do not blanket-negate competitors | Low (1 order) | – | Search Terms | – | – | Competitor-term ROAS |
| O19 | Mobile is 86% of spend; mobile theme fixes live 19 Nov | Account | Higher paid conversion rate | Watch paid mobile basket → order for 14 days (E7) | Low | – | Analytics / CRO | – | – | Paid mobile conversion rate up |
| O20 | Sitelinks go to collections only | PMax | Route high-intent clicks | Add sitelinks for the Ottoman Gas Lift Divan Base page (after the fix) and free swatches | Low | Owner | Ad Creative | O1 | – | Sitelink CTR |

## 6. Top 20 advertising problems

| # | Evidence | Product / campaign | Issue | Action | Financial confidence | Approval | Agent | Dependencies | Risk if ignored | Success metric |
|---|---|---|---|---|---|---|---|---|---|---|
| P1 | Non-brand ROAS 1.52 (1.27 ex-VAT), CPA about £245 (90d) | Account | Non-brand probably below break-even (needs CM ≥ about 79%) | Get costs; no scaling | Medium (margins UNKNOWN) | Owner | Analytics / Finance | Cost sheet | Loss-making growth | Break-even ROAS known |
| P2 | 0 non-brand orders from clicks 3–19 Nov (£434.69 total spend) | PMax | 17-day non-brand drought | Watch; E7; no budget change | Medium (lag possible) | – | Google Ads | – | Further spend with no return | Non-brand order by 3 Dec |
| P3 | No product report via tools | PMax | Product spend UNKNOWN | O10 export | – | Owner | Analytics | – | Decisions on estimates | Export in hand |
| P4 | #1014 counted (£310.50) | Shopping (paused) | Ads value overstated | O9 | High | Owner | Tracking | – | Wrong ROAS | Retraction set |
| P5 | Shopify app sends the order total including VAT | Account | ROAS overstated 20% versus ex-VAT revenue | Report ex-VAT ROAS too | High | – | Analytics | VAT scheme (accountant) | Over-optimism | Ex-VAT in every report |
| P6 | £181.42 (7.8%) on YouTube, Display, Discover, partners and Gmail; 0 conversions | PMax | Non-Search spend unproven | Accept (PMax cannot exclude channels); maybe remove auto videos (minor) | Medium | Owner | Google Ads | – | About £60/month | Non-Search share |
| P7 | About £421/30d est. on products with 0 Ads orders | Tier 2–3 | Possible waste | O10 → O12 | Low (C) | Owner | Google Ads | Export | Waste continues | Confirmed waste list |
| P8 | 31 paid landings, 0 baskets | Grand Princess | Traffic with no interest | Check in the export; exclude if confirmed | Medium | Owner | Google Ads | Export | About £24/month | Spend £0 or baskets > 0 |
| P9 | P0 blocker on the top ad seller | Ottoman Gas Lift Divan Base | Paid clicks land on a confusing page | O1 | Medium | Owner | CRO | – | Lost ottoman sales | Fix live |
| P10 | Themes "Dreams", "Furniture Village", "Bensons" are negated; "eagle bed" is a theme | PMax | Contradictory signals | O6 | Low | Owner | Google Ads | – | Noise | Themes cleaned |
| P11 | Local terms £42.62, 81 clicks, 0 sales | PMax and Search | Shop-visit intent, no showroom | E1 | Medium | Owner | Search Terms | – | About £14/month | Local spend down |
| P12 | Clearance, cheap, TV and toddler terms | PMax | Irrelevant clicks | O5 | High (small £) | Owner | Search Terms | – | – | About £0 |
| P13 | 1 asset group, home final URL, ad strength Average, 5 auto videos | PMax | Generic creative for a category-led buyer | O7, E3 | Low | Owner | Ad Creative | O1 | – | Ad strength Good |
| P14 | "Limited by budget" at £25 | PMax | Google wants more budget | **Do not increase** (owner rule; no margin data) | – | – | Google Ads | Costs | Pressure to scale on revenue alone | Hold until break-even known |
| P15 | Brand is 5% of spend and 38% of value | PMax | ROAS flattered | O13; judge on non-brand | High (measurement) | – | Analytics | – | Wrong conclusions | Non-brand KPI used |
| P16 | Visible terms = 28% of 90d spend (31% of 28d) | Account | 70% of searches unseen | Owner search-term-insights export | – | Owner | Search Terms | – | Blind spots | Category export |
| P17 | Shopping UK real ROAS 0.70 (0.42 over 180d) | Shopping (paused) | Poor history | **Keep paused**; do not reactivate | High | – | Google Ads | – | Repeat losses | Stays paused |
| P18 | Search UK non-brand about £350, 0 sales | Search (paused) | Non-brand Search failed | Keep paused; §4.5 only after costs | High | – | Google Ads | – | – | Stays paused |
| P19 | 4 orders with no journey; 3 PMax buyers returned direct | Shopify | Last-click under-credits ads | O8; treat Ads-matched as the main truth | – | – | Analytics | – | Mis-attribution | Journey coverage |
| P20 | £699.37 spent 15 Jul–21 Aug, 0 conversions recorded | Shopping and Search (history) | Tracking start date UNKNOWN; old spend unaccounted | Owner checks the conversion action creation date in Ads → Goals | – | Owner | Tracking | – | Wrong history | Date confirmed |

Also noted, outside the top 20: desktop Ads ROAS 1.02 (no lever in PMax); optimisation score down from 74.9% to 70.1% (follow Google suggestions only where they do not raise budget).

---

## 7. Experiment queue (all £0 extra; all need owner approval; none started)

| # | Hypothesis | Baseline (VERIFIED/MATCHED) | Change / conditions | Comparison | Budget ceiling | Approval | Period | Success | Stop conditions |
|---|---|---|---|---|---|---|---|---|---|
| E1 | Removing local, brand and negated-competitor themes and adding the §4.6 negatives cuts junk without hurting sales | 28d visible junk + local spend; non-brand 3.96 orders / £679 (28d) | Theme cleanup + negatives only; budget and bidding unchanged | Next 14d and 28d against the previous 28d | £25/day (unchanged) | Owner | 14–28 days | Junk spend about £0; non-brand orders not lower | PMax impressions −40% in a week, or 0 orders for 14 days → restore themes |
| E2 | `{product_id}` in the URL suffix gives product-level ad sessions | 0% of sessions carry an item ID | §3.2 suffix change | Day after against the day before | £0 | Owner | 1 day | ≥80% of product-page PMax sessions tagged | Literal `{product_id}`, disapproval, or PMax sessions −50% → roll back |
| E3 | An "Ottomans" asset group with ottoman assets raises non-brand ottoman orders | 5 non-brand ottoman orders in 90d; about 1.25 per 28d | 2nd asset group (ottoman listing group + assets); same campaign, same £25 | 28d against the previous 28d (non-brand only) | £25/day | Owner | 28 days, **after** the O1 fix and the export | Non-brand ottoman orders up, CPA down | Total non-brand orders fall to 0 for 14 days |
| E4 | Excluding export-confirmed zero-sale items moves spend to sellers | Export spend on Tier 3 items | Listing-group exclusion of confirmed items only | 28d against 28d | £25/day | Owner | 28 days, after E2/export | Non-brand CPA lower; total orders not lower | Orders −30% → re-include |
| E5 | Brand exclusion frees spend without losing brand orders | 5 brand orders / 90d, £115.84 | Deferred. Run only if the export shows brand above 15% of PMax spend | 8 weeks against 8 weeks, all-channel brand orders | £25/day | Owner | 8 weeks | Brand orders (all channels) steady; non-brand up | Any fall in brand orders → undo |
| E6 | Enhanced Conversions and one primary action make Ads match Shopify | 15 conv. against 14 real; #1014 counted | Settings only | 14d of conversions against Shopify orders | £0 | Owner | 14 days | Ads = real orders (±1) | Duplicate conversions → revert |
| E7 | The 19 Nov mobile theme fixes raise paid conversion | Paid basket rate 7.6% (111/1,477 cpc sessions, 90d); 6 checkouts | No ad change (observation) | 20 Nov–3 Dec against the prior 30d | £0 | None (read-only) | 14 days | Paid basket → order rate up | – |

Run E1, E2 and E6 first; they are independent and reversible. Run E3 and E4 only after the export and the O1 fix. Do not run E3 and E4 at the same time: one change per 28 days keeps the comparison readable.

---

## Limitations

- Product-level Google metrics are not available through OpenRush (UNKNOWN). Product spend in the CSV is a session-share ESTIMATE for ranking only.
- Order matching uses click date and exact value: the arithmetic is exact but the link is inferred. #1027 and #1033 match only as a pair.
- Search terms cover 28% of 90d spend (top 300 rows) and 31% of 28d spend. Hidden terms are assumed non-brand, so brand spend is a floor and non-brand ROAS may be slightly higher.
- Search UK and Shopping UK 90d metrics are Stage 4's pull from earlier on 19 Nov (HISTORICAL; both campaigns are paused, so they are unchanged). PMax 90d = since 5 Sep. The 28d campaign windows (23 Oct–19 Nov) differ from the account's 30d daily window (21 Oct–19 Nov); the file says which is which.
- The previous-90 window has only 38 live days (15 Jul–21 Aug) and no recorded conversions. Real orders for it are UNKNOWN.
- Google's location report is not exposed. Region figures are Shopify sessions, not Ads.
- Search-term insights categories and audience reports are not exposed.
- Ex-VAT = ÷1.2, assuming standard-rate VAT on the full order total (accountant to confirm). Shopify records £0 tax on these orders.
- No costs exist (owner cost sheet 0%), so contribution and break-even per product are UNKNOWN. Break-even figures are arithmetic only.
- The last 1–2 days of Ads data are preliminary. Conversion lag of up to 20 days was observed.

## Credits used (OpenRush)

| # | Call | Credits |
|---|---|---|
| 1 | describe_capabilities | 0 |
| 2 | get_ad_campaigns (all campaigns: status, budget, bidding, negatives) | 3 |
| 3 | get_ad_performance report=date, last_6_months (daily rows → exact 7/30/90/180 windows) | 3 |
| 4 | get_ad_performance report=campaign, last_6_months | 3 |
| 5 | get_ad_performance report=campaign, last_7_days vs previous | 3 |
| 6 | get_ad_performance report=device, last_3_months | 3 |
| 7 | get_ad_campaigns campaign=PMax (asset group, assets, search themes, listing group) | 3 |
| 8 | get_ad_performance report=campaign, last_28_days vs previous | 3 |
| 9 | get_ad_performance report=network, last_3_months | 3 |
| | **Total** | **24 of 24** (month about 92 → about 116 of 2,001; the reserve was not touched) |

Free reads:
- Shopify Admin GraphQL × 1 (43 orders since 1 Jul with status, refunds, tax and journeys)
- ShopifyQL × 1 (paid sessions by region, 90d)
- The saved Stage 4 90d and Stage 1 28d search-term pulls, re-used at 0 credits
