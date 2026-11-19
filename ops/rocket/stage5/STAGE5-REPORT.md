# EAGLE BED — PROJECT ROCKET SALES / STAGE 5: GOOGLE ADS REVENUE GROWTH

Prepared 19 Nov 2026 (evening) by the Manager's report writer. It draws on the three Stage 5 specialist reports and their data files, plus the Stage 4 report for continuity.

- **Read-only.** Nothing was changed in Google Ads, Merchant Center, Shopify, Easify, the theme, the policies or Gmail. No customer or supplier was contacted. Order numbers only; no customer personal data. Nothing was committed.
- **OpenRush:** this report used 0 credits.

**Labels**

| Label | Meaning |
|---|---|
| **VERIFIED** | Read directly from Google Ads, Shopify or the live site on 19 Nov, or checked live by the Manager |
| **MATCHED WITH ATTRIBUTION LIMITATIONS** (short form MATCHED) | An Ads conversion tied to a Shopify order by click date and exact value. The arithmetic is exact, but the link between click and order is inferred |
| **ESTIMATE** | A calculation that rests on a stated assumption |
| **UNKNOWN** | The data does not exist yet |
| **HISTORICAL** | A figure from an earlier stage or an earlier period |

**Rules used throughout**
- Cancelled orders #1010, #1014 and #1020 are excluded from every paid-order count and shown separately.
- Website prices include 20% VAT, so ex-VAT revenue = price ÷ 1.2. Google's conversion values include VAT.
- Google counts a conversion on the click date and Shopify counts it on the order date. The last 1–2 days of Ads data are preliminary.

**Sources** (all in `ops/rocket/stage5/` unless stated)

| Source | Contents |
|---|---|
| `01-google-ads.md` | Live Ads account, conversion truth, product attribution, brand, search terms, top-20s, experiments |
| `campaign-performance.csv` | Every campaign by time window |
| `ads-product-attribution.csv` | 86 products |
| `owner-ads-export-request.md` | The export instructions for the owner |
| `02-feed-price-truth.md` | Merchant Center audit, plus landing pages tested on 9 products × 3 devices |
| `feed-correction-queue.csv` | 15 feed corrections |
| `shots/` | 77 screenshots |
| `03-decisions-profit-measurement.md` | Decisions, profit, measurement, catalogue, trust, kids range |
| `owner-decisions.csv` | Status of the 29 Stage 4 approvals plus 4 extra owner decisions |
| `owner-decision-request.md` | The 10 open questions for the owner |
| `product-funnel-baseline.csv` | 30-day baseline funnel for the 9 products |
| `ops/rocket/stage4/STAGE4-REPORT.md` | Stage 4, for continuity |

---

## 1. Executive summary

1. **Only Performance Max (PMax) produces real paid orders today.**
   - In 90 days PMax produced 11 real, paid, not-cancelled orders worth £4,374.43 from £1,345.08 of spend. That is a real ROAS of 3.25 (2.71 ex-VAT) and a cost per order of £122.28.
   - 8 of those orders were non-brand (£2,915.60) and 3 were "eagle bed" brand searches.
   - The paused Shopping campaign returned 0.70 and the paused Search campaign returned 1.68, from brand searches only. Both stay paused.
   - VERIFIED spend, MATCHED orders.
2. **Account truth over 90 days:**
   - £2,317.26 spend.
   - 14 real paid orders worth £5,402.42.
   - Real ROAS 2.33, or 1.94 ex-VAT.
   - Real CPA £165.52.
   - Google reports 15 conversions and a CPA of £154.48, because it still counts cancelled #1014 (£310.50).
   - VERIFIED ÷ MATCHED.
3. **Judge the ads on non-brand.**
   - Brand ("eagle bed") is about 5% of spend but 38% of real Ads value. Brand orders cost about £23 each.
   - Non-brand over 90 days: 9 orders, ROAS 1.52 (1.27 ex-VAT), CPA about £245.
   - PMax non-brand alone: 2.36 (1.97 ex-VAT).
   - ESTIMATE, because about 70% of search terms are hidden.
4. **Warning since 3 Nov.**
   - The account has spent £434.69 since 3 Nov. The only Ads orders in that time are 2 brand orders (#1040, #1042).
   - PMax's last non-brand sale came from a 2 Nov click.
   - Conversions can lag the click by up to 20 days, so this can still improve. It needs watching, not a budget change.
   - MATCHED.
5. **Profit after ads is UNKNOWN.**
   - The owner's cost sheet has 0 of 831 cost rows filled, so the verified break-even ROAS is UNKNOWN.
   - The break-even formula with VAT is **1.2 ÷ contribution margin**.
   - The account's 2.33 breaks even only if margin is at least 51.5%. Non-brand 1.52 needs at least 79%.
   - That is arithmetic, not a statement about Eagle Bed's margins. ESTIMATE.
6. **New P0 (Manager, VERIFIED): Shopify records £0 tax on every order**, although ABBAS TRADE LTD is VAT registered (520 9622 06).
   - The accountant must check Shopify's tax settings ("prices include tax", UK VAT collection).
   - This affects the VAT returns and the ex-VAT revenue basis of every profit figure.
7. **Product-level ad spend is UNKNOWN for every product.**
   - It stays UNKNOWN until the owner sends the PMax Products export (about 5 minutes).
   - The estimate from each product's share of sessions puts about £421 of £775 PMax spend (30 days) on products with 0 Ads orders in 90 days. That is for ranking only.
   - No product is proven to waste money yet. ESTIMATE.
8. **Four products have a plausibly ad-caused non-brand sale:**
   - Ottoman Gas Lift Divan Base (3).
   - Side Lift Ottoman Storage Base (3).
   - Line Kids Velvet (1).
   - Upholstered Ottoman Storage Box (1).
   - Ottomans are the only proven non-brand category. MATCHED.
9. **Merchant Center cannot be read by our tools.** Disapprovals are UNKNOWN until the owner sends the export. Two risks are VERIFIED:
   - **Two feed sources are live:** Simprosys and the Shopify Google & YouTube channel.
   - **9 "Ottoman … Gas Lift Storage Bed" listings advertise the slatted-base price.** The storage costs +£119.99 to +£189.99 more. This is a misrepresentation risk; the risk level itself is an ESTIMATE.
10. **The landing pages work, but they hide the real price.**
    - All 9 priority pages fit Pixel 7, iPhone 13 and desktop, and add to basket worked in all 27 runs. VERIFIED.
    - The page and sticky price never include add-ons. The configured basket is +30% to +46% above the price shown.
    - Every Stage 4 price-truth issue is still present.
11. **Brand exclusion is an owner decision, not settled.**
    - Stage 1 advised separating brand from PMax.
    - Stage 5's Ads specialist advises **not** excluding brand now, because brand gives the cheapest orders in the account.
    - Section 10 sets out both positions.
12. **Owner decisions:**
    - Of the 29 Stage 4 items: 1 COMPLETED, 27 PENDING, 1 NOT APPLICABLE.
    - Four decisions outside the list are COMPLETED: the theme fixes, VAT registration, the 14 in base height, and assembly / UK only / marketing box.
    - S5-3 and S5-4 (price truth and configuration) have **not started**; they are blocked by approvals.
13. **Budget stays at £25/day.**
    - Google says PMax is "limited by budget". Nothing in this stage supports a budget increase until costs exist.
    - Every improvement proposed here costs £0 extra and needs the owner's YES.

### Key numbers

| Measure | Value | Label |
|---|---|---|
| Ad spend, 90 days (22 Aug–19 Nov) | £2,317.26 | VERIFIED |
| Real paid Ads orders, 90 days | 14 (+ #1014 cancelled, still counted by Google) | MATCHED |
| Real Ads revenue, 90 days | £5,402.42 incl. VAT (£4,502.02 ex-VAT) | MATCHED |
| Real ROAS / ex-VAT ROAS, 90 days | 2.33 / 1.94 | VERIFIED ÷ MATCHED |
| Real CPA, 90 days | £165.52 (Google says £154.48) | VERIFIED ÷ MATCHED |
| Non-brand ROAS / CPA, 90 days | 1.52 (1.27 ex-VAT) / about £244.60 | ESTIMATE |
| Brand ROAS / CPA, 90 days | 17.8 / £23.17 | ESTIMATE |
| PMax ROAS / CPA, 90 days | 3.25 (2.71 ex-VAT) / £122.28 | VERIFIED ÷ MATCHED |
| Last 30 days ROAS / CPA | 3.81 (3.18 ex-VAT) / £101.11 | VERIFIED ÷ MATCHED |
| Spend since 3 Nov / non-brand orders from those clicks | £434.69 / 0 | VERIFIED / MATCHED |
| Live budget | PMax £25/day, limited by budget (owner cap £30) | VERIFIED |
| Break-even margin needed at 2.33 / non-brand 1.52 | ≥ 51.5% / ≥ 78.9% | ESTIMATE (arithmetic) |
| Verified break-even ROAS | UNKNOWN (costs 0%) | UNKNOWN |
| Product-level ad spend | UNKNOWN (Products export not supplied) | UNKNOWN |
| Owner approvals | 1 completed, 27 pending, 1 n/a (+4 completed outside the list) | VERIFIED |
| OpenRush, Stage 5 | 24 credits; month 116 / 2,001; reserve untouched | VERIFIED (Manager) |

### P0 owner actions (this week)

| # | Action | Why | Who |
|---|---|---|---|
| P0-1 | **Accountant checks Shopify tax settings**: "All prices include tax" and UK VAT collection on registration 520 9622 06 | Shopify records £0 tax on every order. This affects the VAT returns and the ex-VAT basis of all profit and ROAS figures | Owner + accountant |
| P0-2 | Check PayPal and refund #1020 (£273.59) if still owed | Cancelled 23 Sep, still PAID in Shopify with £0 refunded | Owner |
| P0-3 | Fill the 5 key cost cells: delivery per drop, assembly labour, Gas Lift Divan Base King, Side Lift Small Double, Mesh Metal Ottoman King | They give the first break-even ROAS for the two best ad sellers | Owner |
| P0-4 | Send the Google Ads PMax **Products export** for 30 and 90 days (5 minutes) | Replaces every per-product spend ESTIMATE with real numbers | Owner |
| P0-5 | Send the **Merchant Center export**: diagnostics CSV, data-sources screenshot, shipping screenshot (10 minutes) | Disapprovals, duplicate feed sources and NI shipping are UNKNOWN without it | Owner |
| P0-6 | Confirm how the Ottoman Gas Lift Divan Base opens (end, side or both) | It is the best ad seller, and its page text contradicts its options | Owner + workshop |

---

## 2. Previous stage verification

### 2.1 Manager verification notes (VERIFIED by Manager, 19 Nov)

| # | Note | Status |
|---|---|---|
| (a) | ABBAS TRADE LTD Terms and Contact policy text checked live 19 Nov (company 16410472; "Eagle bed ltd" no longer appears) | **VERIFIED** by Manager. Stage 4 P0-1 entity part is done. Still open: the registered office line is not on the site, and the VAT number is not shown |
| (b) | Theme 213270004043 is live, checked 19 Nov | **VERIFIED** by Manager. The 02 specialist also saw this theme ID on every one of the 27 page-device runs |
| (c) | OpenRush Stage 5 = 24 credits; month 116 / 2,001; reserve 400 untouched | **VERIFIED** by Manager. All 24 were in the Ads work (section 20) |
| (d) | **Shopify records £0 tax on every order although the company is VAT registered (520 9622 06).** The accountant must check Shopify's tax settings ("prices include tax", UK VAT collecting) | **VERIFIED** by Manager. This is a **P0 owner/accountant item**. It affects the VAT returns and the ex-VAT revenue basis used in this report |
| (e) | There are two positions on "brand exclusion". Stage 1 advised separating brand. The Stage 5 Ads specialist recommends NOT excluding brand now, because brand gives the cheapest orders | **Owner decision, not settled.** Section 10 sets out both positions |

### 2.2 Stage 4 items re-checked in Stage 5

| Stage 4 item | Stage 5 finding | Label |
|---|---|---|
| Ads real ROAS 2.34, spend £2,312.62 (90d) | Re-pulled live: £2,317.26, ROAS **2.33**, CPA £165.52. The small difference is the later pull time on 19 Nov. Report 03 still quotes the Stage 4 figures (2.34, £165.19); **this report uses the live 2.33** | VERIFIED / HISTORICAL |
| Non-brand "pays for itself above about 66% margin" | With VAT confirmed, this becomes **about 79%** (1.2 ÷ 1.52). Stage 4 had ignored VAT (1 ÷ 1.52) | ESTIMATE |
| Cancelled #1014 counted by Google | Still counted, and never retracted | VERIFIED |
| Price-truth issues (12 rows) | **All still present.** Only #1016 has partly changed: the NI zone now charges £90 correctly | VERIFIED |
| Costs 0% | Still 0 of 831 rows. HQ `costs/schema` and `costs/status` structure written | VERIFIED |
| Theme measurement from 20 Nov | Baseline written to HQ `cro/programme`. Read-outs 27 Nov, 4 Dec, 18 Dec | VERIFIED |
| Owner approvals 1–29 | 1 COMPLETED, 27 PENDING, 1 NOT APPLICABLE | VERIFIED |
| TV-bed negative (Stage 1) | **Corrected:** do NOT negate TV-bed searches, because the Kingston Ottoman TV Bed is sold | VERIFIED |
| Brand exclusion (Stage 1 Q11) | The Stage 5 Ads specialist reverses the advice for now. Owner decision (section 10) | ESTIMATE |

---

## 3. Updated Google Ads baseline

Account 198-038-2450, pulled 19 Nov 20:04 UTC through OpenRush. VERIFIED.

### 3.1 Live settings

| Campaign | Type | Status | Daily budget | Bidding | Notes |
|---|---|---|---|---|---|
| Eagle Bed \| PMax \| All Products | Performance Max | **ENABLED**. Limited by budget | **£25.00** | Maximise conversions, no target | Started 5 Sep. Merchant 5756953290. UK, presence only. Optimisation score 70.1% (Stage 1: 74.9%) |
| Eagle Bed \| Search \| UK | Search | PAUSED (since 28 Oct) | £5.00 | Maximise clicks, max CPC £2.00 | – |
| Eagle Bed \| Shopping \| UK | Standard Shopping | PAUSED | £15.00 | Maximise clicks, max CPC £0.80 | – |
| Bed Shop in Dewsbury | PMax | Removed | – | – | £0 ever |

PMax structure:
- 1 asset group, ad strength **Average**.
- The listing group includes all products.
- The final URL is the home page.
- 16 headlines, only 1 of them about ottomans.
- 5 auto-created videos.
- 49 search themes, including "eagle bed", 3 competitor names that are also negated, and local "near me" themes.
- No audience signals.
- 15 campaign negatives.

### 3.2 Account by window

Real value = paid, non-cancelled Shopify orders matched to Ads conversions.

| Window | Dates | Spend | Clicks | Google conv. / value | Real orders | Real value (incl. VAT) | Real CPA | Real ROAS | Ex-VAT ROAS | Label |
|---|---|---|---|---|---|---|---|---|---|---|
| Last 7 | 13–19 Nov | £176.11 | 259 | 2 / £1,132.76 | 2 (both brand) | £1,134.87 | £88.06 | 6.44 | 5.37 | VERIFIED / MATCHED |
| Previous 7 | 6–12 Nov | £200.42 | 313 | 0 / £2.10 | 0 | £0 | – | 0 | 0 | VERIFIED |
| Last 30 | 21 Oct–19 Nov | £778.55 | 1,276 | 7.70 / £2,966.63 | 7.70 | £2,966.63 | £101.11 | 3.81 | 3.18 | VERIFIED / MATCHED |
| Previous 30 | 21 Sep–20 Oct | £750.72 | 2,538 | 2.29 / £901.82 | 2.29 | £901.82 | £327.83 | 1.20 | 1.00 | VERIFIED / MATCHED |
| Last 90 | 22 Aug–19 Nov | £2,317.26 | 6,994 | 15 / £5,712.92 | **14** | **£5,402.42** | **£165.52** | **2.33** | **1.94** | VERIFIED / MATCHED |
| Previous 90 | 24 May–21 Aug (live from 15 Jul) | £699.37 | 2,487 | 0 / £0 | UNKNOWN | – | – | – | – | VERIFIED Ads = 0; real UNKNOWN |
| 180 days | 24 May–19 Nov | £3,016.63 | 9,481 | 15 / £5,712.92 | 14 | £5,402.42 | £215.47 | 1.79 | 1.49 | VERIFIED / MATCHED |

How to read this:
- The last 30 days look much better than the previous 30. Part of the reason is that Shopping and Search spend stopped. Part is the ottoman orders of 22 Oct–2 Nov.
- In the last 14 days there were only 2 orders, both brand. The week of 6–12 Nov had £200.42 of spend and no sale.
- £699.37 was spent from 15 Jul to 21 Aug with no recorded conversion. Whether tracking existed then is UNKNOWN.

### 3.3 Conversion truth

| Class | Orders | Value | Label |
|---|---|---|---|
| Paid, valid | #1011, #1012, #1016, #1018, #1022, #1027, #1028, #1029, #1030, #1031, #1032, #1033, #1040, #1042 | £5,402.42 | VERIFIED status / MATCHED link |
| Cancelled but still counted by Google | #1014 (Shopping, Side Lift Small Double) | £310.50 | VERIFIED |
| Cancelled, not Ads conversions (shown separately) | #1010 (Facebook journey); #1020 (no journey; still PAID, never refunded) | – | VERIFIED |
| Unmatched Ads conversions | none | £0 | MATCHED |

- 14 of 15 Google conversions are real: 93% by count and 95% by value.
- Every Google value includes VAT.
- 3 of the 11 PMax buyers came back "direct" through /cart before paying, so Shopify's last-click view under-credits PMax.
- 4 recent orders have no journey data.

---

## 4. Campaign performance

### 4.1 Real ROAS by campaign, 90 days

| Campaign | Spend | Google conv. / value | Real orders | Real value | Real ROAS | Ex-VAT ROAS | Real CPA | Brand / non-brand orders | Label |
|---|---|---|---|---|---|---|---|---|---|
| PMax (since 5 Sep) | £1,345.08 | 11 / £4,374.45 | 11 | £4,374.43 | **3.25** | **2.71** | **£122.28** | 3 / 8 | VERIFIED / MATCHED |
| Shopping UK (paused) | £616.62 | 2 / £739.49 | **1** (+ #1014 cancelled) | £428.99 | **0.70** | 0.58 | £616.62 | 0 / 1 | HISTORICAL (Stage 4 pull) / MATCHED |
| Search UK (paused) | £355.54 | 2 / £598.98 | 2 | £598.98 | 1.68 | 1.40 | £177.77 | **2 / 0** | HISTORICAL / MATCHED |
| **Account** | **£2,317.24** | 15 / £5,712.92 | **14** | **£5,402.42** | **2.33** | **1.94** | **£165.52** | 5 / 9 | MATCHED |

### 4.2 PMax over time

| Window | Spend | Conv. / value | ROAS | Label |
|---|---|---|---|---|
| Last 7 (13–19 Nov) | £176.11 | 2 / £1,132.76 (brand) | 6.43 | VERIFIED |
| Previous 7 (6–12 Nov) | £200.42 | 0 / £2.10 | 0.01 | VERIFIED |
| Last 28 (23 Oct–19 Nov) | £699.98 | 6.96 / £2,591.62 | 3.70 (3.09 ex-VAT) | VERIFIED / MATCHED |
| Previous 28 (25 Sep–22 Oct) | £433.25 | 3.04 / £1,276.85 | 2.95 | VERIFIED / MATCHED |
| Since start (5 Sep) | £1,345.08 | 11 / £4,374.45 | 3.25 | VERIFIED / MATCHED |

### 4.3 Verdict per campaign

| Campaign | Verdict |
|---|---|
| **PMax** | Keep at £25/day. The only producer. Make the small structural fixes in sections 16 and 18. Do not restructure until product data exists |
| **Shopping UK** | Keep paused. Real ROAS 0.70 over 90 days (0.42 over 180 days) |
| **Search UK** | Keep paused. About £350 of non-brand spend with 0 sales. A separate ottoman Search campaign is an option only, after costs, the Divan Base fix and the Products export |

---

## 5. Product-level advertising intelligence

**Plain statement: Google's per-product spend, impressions, clicks, conversions and ROAS are UNKNOWN for every product.** They stay UNKNOWN until the owner supplies the PMax → Products export (`owner-ads-export-request.md`). Status: **not supplied**.

What we can say, using `ads-product-attribution.csv` (86 products):

| Product | PMax landings 30d (baskets) | Paid landings 90d | Ads-matched paid orders 90d (non-brand) | Real Ads revenue 90d incl. / ex-VAT | Est. PMax spend 30d | Class |
|---|---|---|---|---|---|---|
| Ottoman Gas Lift Divan Base | 55 (4) | 94 | 3 (3): #1027, #1028, #1033 | £1,532.64 / £1,277.20 | about £53 | B |
| Side Lift Ottoman Storage Base | 28 (4) | 47 | 3 (3): #1029, #1030, #1032 | £778.99 / £649.16 | about £27 | B |
| Line Kids Velvet | 25 (4) | 45 | 1 (1): #1018 | £505.98 / £421.65 | about £24 | B |
| Cloud Teddy Bouclé Ottoman | 3 (1) | 7 | 1 (0): #1040, brand | £556.19 / £463.49 | about £3 | B |
| Line Ambassador | 79 (10) | 134 | 1 (0): #1016, brand | £377.99 / £314.99 | about £76 | B |
| Curved Wingback | 18 (3) | 19 | 1 (0): #1042, brand | £578.68 / £482.23 | about £17 | B |
| Line Bumper Ottoman | 73 (10) | 128 | 0 | £0 | about £70 | C |
| Grand Extra-Tall | 106 (15) | 107 | 0 | £0 | about £102 | C |
| Royal Chesterfield | 31 (6) | 34 | 0 | £0 | about £30 | C |
| Grand Princess | 25 (0) | 31 | 0 | £0 | about £24 | C |
| Mini Line Wingback Kids | 21 (2) | 50 | 0 | £0 | about £20 | C |

Other Ads-matched orders:
- Memory Orthopaedic Mattress: #1011, brand, Search.
- Mirror Strip Sunrise: #1012, Shopping, non-brand.
- Cambridge Storage Panel: #1031, brand.
- Upholstered Ottoman Storage Box: #1022, non-brand.

**Product tiers** (a proposal; any exclusion needs the export first):

| Tier | Products | Treatment |
|---|---|---|
| 1. Proven non-brand sellers | Gas Lift Divan Base, Side Lift, Line Kids, Ottoman Storage Box | Keep. Candidates for an ottoman asset group (E3) after the Divan Base fix |
| 2. Baskets but no ad sale | Grand Extra-Tall, Line Ambassador, Line Bumper, Royal Chesterfield, Mini Line Wingback (+Kids), Curved Wingback, Roxy | Keep. Fix the page and price issues and re-measure 14 days after the 19 Nov theme |
| 3. Traffic but no baskets | Grand Princess (31/0), Cambridge Curved Headboard (18/0), Royal Chesterfield Wingback (13/0) | Exclude **only if** the export confirms spend with 0 conversions |
| 4. Long tail | About 60 products with fewer than 10 paid landings | Leave in |

---

## 6. Attribution accuracy (classes A–D)

| Class | Meaning | What it covers | Use it for |
|---|---|---|---|
| **A. VERIFIED** | Paid landing sessions from ShopifyQL (`utm_medium=cpc`) | All 86 products in the CSV, at session level | Traffic and basket rates. These are landing sessions, not product-level ad clicks |
| **B. MATCHED WITH ATTRIBUTION LIMITATIONS** | An Ads conversion = a Shopify order, by click date + exact value | 14 orders across 10 products | Real orders and revenue per product. #1027 and #1033 match only as a pair; data-driven fractions apply |
| **C. ESTIMATE** | Session-share spend: £774.73 × (product PMax landings ÷ 803) | Every product with PMax landings | **Ranking only.** It assumes equal CPC, which is false (brand clicks cost about £1.04 against an average of £0.61) |
| **D. UNKNOWN** | Google's per-product impressions, clicks, cost, conversions and ROAS | All 145 products | Nothing until the Products export arrives |

Known gaps:
- Search terms are visible for only 28% of 90-day spend. Hidden terms are assumed non-brand, so brand spend is a floor.
- Google's location report is not exposed. Regions are Shopify sessions instead.
- Conversion lag of up to 20 days has been seen (#1033).
- The proposed `{product_id}` URL test (E2) would turn class C into class A for PMax product sessions every day.

---

## 7. Product profitability readiness

| Input | Status | Label |
|---|---|---|
| Owner cost workbook (`owner-cost-collection.xlsx`) | **0 of 831 rows filled**; delivery, labour and packaging empty | VERIFIED |
| HQ cost structure | `costs/schema` v1 and `costs/status` v1 written. Cost statuses: A Verified actual · B Supplier quote · C Owner estimate · D Modelled · E Unknown. Only A, B and C count; D is never used for a profit claim | VERIFIED |
| VAT | Registered (520 9622 06). Prices include 20%. Ex-VAT = ÷ 1.2. **But Shopify records £0 tax** (P0, accountant). Scheme not yet confirmed | VERIFIED / UNKNOWN (scheme) |
| Payment fees | About 2.70% of money taken, which is about 3.24% of ex-VAT revenue | VERIFIED / ESTIMATE mix |
| Products with a known contribution | **0 of 145** | VERIFIED |
| First unlock | The 5 cells in owner question 4 give a first break-even ESTIMATE for the two ottoman bases. The 15 key cells plus the 9 priority products' size rows cover 17 of 34 orders (46% of 90-day revenue) | ESTIMATE |

**Readiness verdict: not ready.** No product can be called profitable to advertise. The £300 placeholder cost on 4 beds must not be used.

---

## 8. Break-even ROAS analysis

### 8.1 Formula (VAT confirmed)

- Google conversion value **V** = order total including VAT.
- Ex-VAT revenue **R** = V ÷ 1.2.
- Contribution before ads **C** = R − (product + add-ons + packaging + delivery + assembly labour if sold + payment fees + other variable costs).
- Contribution margin **m** = C ÷ R.
- **Break-even ROAS on Google's value = 1.2 ÷ m.** On ex-VAT value it is 1 ÷ m.
- **Maximum affordable CPA** = m × (AOV incl. VAT ÷ 1.2). The last-30-day AOV is £428.60, or £357.17 ex-VAT (VERIFIED).
- Target ROAS that keeps a share **p** of contribution as profit = 1.2 ÷ (m × (1 − p)).
- Fees cap m at about 96.8%, even before any product cost.

### 8.2 Real ROAS figures and the margin each needs to break even

These are ESTIMATES (arithmetic on VERIFIED / MATCHED ROAS).

| Segment, window | Real ROAS incl. VAT | Ex-VAT ROAS | Margin needed to break even (1.2 ÷ ROAS) | Label |
|---|---|---|---|---|
| Account, 90d | 2.33 | 1.94 | **51.5%** | ESTIMATE |
| Non-brand, 90d | 1.52 | 1.27 | **78.9%** | ESTIMATE |
| PMax, 90d | 3.25 | 2.71 | 36.9% | ESTIMATE |
| PMax non-brand, 90d | 2.36 | 1.97 | 50.8% | ESTIMATE |
| Non-brand, 28d | 1.67 | 1.39 | 71.9% | ESTIMATE |
| Account, last 30d (small sample) | 3.81 | 3.18 | 31.5% | ESTIMATE |
| Brand, 90d | 17.8 | 14.8 | 6.7% | ESTIMATE |

### 8.3 ILLUSTRATIVE margins only (these are not Eagle Bed's margins)

| Illustrative margin m | Break-even ROAS (Google value) | Break-even ROAS (ex-VAT) | Max CPA per order | Account 2.33 would be… | Non-brand 1.52 would be… |
|---|---|---|---|---|---|
| 20% | 6.00 | 5.00 | £71.43 | loss-making | loss-making |
| 30% | 4.00 | 3.33 | £107.15 | loss-making | loss-making |
| 40% | 3.00 | 2.50 | £142.87 | loss-making | loss-making |
| 50% | 2.40 | 2.00 | £178.58 | just below break-even | loss-making |
| 60% | 2.00 | 1.67 | £214.30 | above break-even | loss-making |
| 70% | 1.71 | 1.43 | £250.02 | above break-even | loss-making |
| 80% | 1.50 | 1.25 | £285.74 | above break-even | just above break-even |

**Verified break-even ROAS: UNKNOWN.** It stays UNKNOWN until real costs (status A, B or C) exist. No profitability claim is made in this report.

---

## 9. Merchant Center audit

**What could be read.**
- No Merchant Center connector exists.
- Shopify denied `productFeeds` and `productResourceFeedback`, because the scopes are missing.
- So disapprovals, warnings, the item ID format and Merchant Center shipping settings are **UNKNOWN**.

| Finding | Detail | Class | Label |
|---|---|---|---|
| Coverage | All 145 live products are published to Google & YouTube (catalog 339816186187). The 42 ACTIVE products that are not online are not on Google either | – | VERIFIED |
| Basic data | Brand "Eagle Bed"; Google category set; condition new; ≥2 images (main ≥752 px); `custom_product = true` (no GTIN needed); custom labels for range, seller and price band | ok | VERIFIED |
| **F1. Ottoman price vs title/image** | 9 "Ottoman … Gas Lift Storage Bed" products advertise the slatted-base size price. Example: Line Bumper King £435.99 on the ad and page, but £595.97 with an ottoman and a 60" headboard. Google's automatic price check passes, because the feed price equals the page price. The risk is a misrepresentation review | Eligibility risk | VERIFIED (prices) / ESTIMATE (policy risk) |
| **F2. Two feed sources** | The Shopify Google & YouTube channel and Simprosys (Merchant 5756953290, linked to PMax). Simprosys free-listing links brought 22 sessions in 30 days. Whether both feed one Merchant Center account is UNKNOWN | Performance / eligibility | VERIFIED (both active) / UNKNOWN (overlap) |
| F3. "With Drawers" divans default to No Drawers | 6 products | Eligibility risk (lower volume) | VERIFIED |
| F4. Hidden add-on prices; no running total | 60" (+£39.99), Golden Strip, Diamond Button | Performance | VERIFIED |
| F5. Size ladders | Royal Chesterfield SK < K; Prism K < D; Valentina Single > SD | Performance | VERIFIED |
| F6. Line Ambassador 60 offers | 12 Shopify colours, while Easify asks for the colour again | Performance | VERIFIED |
| F7. Grand "Extra-Tall" | Only 50/54/60" options shown; no height stated | Eligibility risk | VERIFIED |
| F8. Divan Base opening | Text says end-opening; options offer only side opening | Performance / returns | VERIFIED |
| F9. Shipping | Shopify NI £90 zone works (#1038 paid £90). #1016 paid £0 in Sep (HISTORICAL). **BFPO sits in the GB free zone** (breaks the UK-only rule). Merchant Center shipping is UNKNOWN | Eligibility (NI mismatch) | VERIFIED / UNKNOWN |
| F10. Handling time | Pages say "3–5 working days"; two chased orders were told about 8 days | Trust | VERIFIED (2 cases) |
| F11–F15 | 183 variants without SKU (not a Google issue); no GTIN (correct); stock placeholders; headboard titled as a bed frame; empty Simprosys gtag | Cosmetic | VERIFIED |

**Proposed temporary listing-group exclusions.** These are owner approval requests only; nothing was changed.

| # | Request | Why | Undo |
|---|---|---|---|
| R1 | Exclude the 9 ottoman-named beds (custom_label_0 = ottoman), **except** the two storage bases, until F1 is fixed | Policy risk. Line Bumper had 72 paid landings and 0 orders in 30 days | Re-include |
| R2 | Exclude Grand Extra-Tall until its height is stated | Highest estimated spend; title claim not on the page | Re-include |
| R3 | Optional: exclude Line Ambassador's 48 non-Cream colour offers | Double colour picker | Re-include |
| R4 | **Do not** exclude the two storage bases, Royal Chesterfield or Stone | They sell or reach baskets; their fixes are cheap | – |

The full queue is in `feed-correction-queue.csv`. The exact export steps for the owner are in `02-feed-price-truth.md` §7.

---

## 10. Brand vs non-brand

| Segment | Window | Spend | Orders | Real value | ROAS (ex-VAT) | CPA | Label |
|---|---|---|---|---|---|---|---|
| Brand, all campaigns | 90d | £115.84 (visible; a floor) | 5 (#1011, #1016, #1031, #1040, #1042) | £2,057.83 | 17.8 (14.8) | **£23.17** | ESTIMATE |
| Non-brand, all campaigns | 90d | about £2,201.40 | 9 | £3,344.59 | **1.52 (1.27)** | **about £244.60** | ESTIMATE |
| PMax brand | 90d | £111.00 | 3 | £1,458.85 | 13.1 (11.0) | £37.00 | ESTIMATE |
| PMax non-brand | 90d | about £1,234.08 | 8 | £2,915.60 | **2.36 (1.97)** | about £154.26 | ESTIMATE |
| Brand | 28d | £49.67 | 3 | £1,458.84 | 29.4 | £16.56 | ESTIMATE |
| Non-brand | 28d | about £679.15 | 3.96 | £1,132.78 | 1.67 (1.39) | about £171.50 | ESTIMATE |
| Non-brand | clicks 3–19 Nov | part of £434.69 | **0** | £0 | 0 | – | MATCHED (lag possible) |

### Two positions on brand exclusion (Manager note (e)): OWNER DECISION, NOT SETTLED

| | **Position 1 (Stage 1): separate or exclude brand from PMax** | **Position 2 (Stage 5 Ads specialist): keep brand in PMax for now** |
|---|---|---|
| Argument | Clean non-brand measurement and bidding. Stops PMax claiming buyers who already knew Eagle Bed. Stage 1 saw organic brand clicks fall from 34 to 16 while PMax bought brand clicks (HISTORICAL) | Brand orders are the cheapest in the account: about £23 each (90d), £16.56 (28d). No risk of a competitor or reseller taking the brand slot. No extra campaign to manage |
| Risk | Losing cheap brand sales. That is 5 orders and £2,057.83 in 90 days, about £690 a month. Losing even one order a month (about £400) costs more than the brand spend freed (about £40 a month). A brand Search campaign would take part of the £25 (a budget change). At about 1.7 brand orders a month, a test needs 4–8 weeks to show anything | Brand inflates PMax ROAS (3.25 reported against 2.36 non-brand) and may pull Maximise Conversions towards cheap brand clicks |
| What it needs | Owner YES (Stage 4 approval 22). Ideally the search-term-insights export first | Weekly brand/non-brand split in HQ. Remove "eagle bed" from the search themes (a signal only) |
| When to revisit | – | If the export shows brand above 15% of PMax spend, or competitors start bidding on "eagle bed" (experiment E5) |

The Manager's reading:
- Both positions agree on one thing: **PMax must be judged on non-brand.**
- They differ only on whether to act now.
- Approval 22 stays **PENDING**. The owner chooses: (1) exclude brand now, (2) keep brand and report it separately, or (3) decide after the search-term-insights export.

---

## 11. Search-term intelligence

The top 300 visible terms over 90 days cover £655.86, which is 28% of spend. The terms are VERIFIED; the categories are ours.

| Category | Terms | Spend | Clicks | Conv. | Value | Examples |
|---|---|---|---|---|---|---|
| Ottoman / gas lift (generic) | 62 | £150.81 | 171 | 0 | £0 | ottoman beds, side lift ottoman bed, ottoman divan base |
| Brand | 5 | £115.84 | 129 | **5** | £2,056.78 | eagle bed, eagle beds |
| Competitors / other brands | 50 | £96.27 | 69 | **1** | £274.99 | **obs beds (sold #1032)**, hale and hale, midas beds |
| Colour-led | 36 | £69.90 | 86 | 0 | £0 | brown bed, pink bed frame |
| Upholstered / style | 40 | £55.13 | 81 | 0 | £0 | ambassador beds, chesterfield bed |
| Generic bed / size | 26 | £48.14 | 96 | 0 | £0 | double bed, beds for sale |
| Local / "near me" | 26 | £42.62 | 81 | 0 | £0 | bed shops near me, bed factory dewsbury |
| Irrelevant: furniture / clearance / cheap | 17 | £20.50 | 39 | 0 | £0 | clearance furniture, pay weekly beds |
| Custom / bespoke | 10 | £19.97 | 41 | 0 | £0 | made to measure beds |
| Kids / toddler | 9 | £15.90 | 12 | **1** | £505.98 | **side guard bed (sold #1018)**, toddler bed side rail |
| Divan / storage | 12 | £12.13 | 16 | 0 | £0 | divan bed |
| Mattress | 6 | £6.88 | 11 | 0 | £0 | orthopedic mattress double |
| TV beds (relevant) | 1 | £1.77 | 3 | 0 | £0 | white tv beds |

What the terms show:
- The 8 PMax non-brand orders have **hidden** terms. They landed straight on product pages from the feed, which is consistent with ottoman product searches that are too small to show individually.
- **Do not negate generic ottoman terms.**
- Competitor terms returned 1 sale on £96, so a blanket competitor exclusion is not supported.

**Proposed negatives** (owner approval; phrase match):

| Negate | Blocks (visible 90d) |
|---|---|
| clearance, closing down, display furniture, outlet, discount, cheap, pay weekly, offers | about £12 |
| furniture for sale, bedroom ideas, furnishing store | about £9 |
| toddler, cot | about £7 |
| reviews, trustpilot | about £4 |
| jysk | £2.38 |

**Do NOT negate:** ottoman, divan, gas lift, TV bed, brand, kids, side guard, colours.

**Test first, then negate:** "near me" and the local terms. Remove the local search themes first (E1), and negate only if spend continues with 0 sales after 14 days.

Search-term insights (Google's category view) are UNKNOWN; this is Export 2 in the owner request.

---

## 12. Device & geographic performance

**Device, 90 days** (VERIFIED, Ads):

| Device | Spend | Share | Clicks | CPC | Conv. | Value | ROAS (Ads) |
|---|---|---|---|---|---|---|---|
| Mobile | £1,989.92 | 86% | 6,194 | £0.32 | 12 | £4,286.46 | 2.15 |
| Desktop | £252.18 | 11% | 403 | £0.63 | 1 | £256.50 | 1.02 |
| Tablet | £73.73 | 3% | 397 | £0.19 | 2 (the #1027/#1033 pair) | £1,169.96 | 15.87 |
| TV / other | £1.41 | 0% | 0 | – | 0 | £0 | 0 |

PMax has no device bid adjustments, so this is information, not a lever. 86% of paid traffic is mobile, which is why the 19 Nov mobile theme fixes matter for the ads.

**Network, 90 days** (VERIFIED):
- Google Search, including Shopping ads on Search: £2,135.81 (92.2%), 15 conversions.
- Every other network together (YouTube, Display, Discover, Search partners, Gmail/Maps): **£181.42 (7.8%), 0 conversions**.

**Geography.**
- Google's location report is UNKNOWN; it is not exposed.
- The Shopify proxy below counts paid `cpc` sessions over 90 days. VERIFIED.

| Region | Sessions | Basket sessions | Completed checkouts |
|---|---|---|---|
| England | 1,211 | 111 | 5 |
| Scotland | 99 | 8 | 0 |
| Wales | 68 | 4 | 1 |
| Northern Ireland | 34 | 5 | 0 |
| Blank / outside the UK | about 66 | 3 | 0 |

Northern Ireland delivery costs £90, while the ads say "Free Delivery Across GB". "GB" is accurate, but NI shoppers meet a surprise. Merchant Center's NI shipping setting is UNKNOWN (F9).

---

## 13. Nine priority product reports

These are Stage 4's nine priority products.
- `ads-product-attribution.csv` flags Line Kids Velvet instead of Stone. Line Kids is covered in section 5 and in S5-8.
- **Exposure:** paid `cpc` landings, 30 days (funnel baseline, 20 Oct–18 Nov) and 90 days. VERIFIED.
- **Shopify orders:** product orders from any landing, 30 days. VERIFIED.
- **Contribution readiness is UNKNOWN for all nine** (0% costs).

### 13.1 Ottoman Gas Lift Divan Base
| Item | Finding |
|---|---|
| Exposure | 58 paid landings / 4 carts / 2 checkouts (30d); 94 paid landings (90d). VERIFIED |
| Spend confidence | Class C: about £53 / 30d (ESTIMATE). Google per-product figures UNKNOWN |
| Value | 3 non-brand Ads orders (#1027, #1028, #1033), £1,532.64 (£1,277.20 ex-VAT). MATCHED |
| Shopify orders | 4 orders, £1,399.65 (30d). VERIFIED |
| Contribution readiness | UNKNOWN. Needs cost cell Q4(3) (King make cost) + delivery + labour |
| Website readiness | **P0:** the text says end-opening, the options say left/right side, and Base Type is not required. The 14 in height is not on the page. Price is true (0% basket gap). VERIFIED |
| Feed readiness | F8 (opening text). Price is accurate. VERIFIED |
| Recommended ad status | **KEEP ACTIVE.** No promotion or ottoman asset group until the opening is confirmed and fixed |

### 13.2 Side Lift Ottoman Storage Base
| Item | Finding |
|---|---|
| Exposure | 28 / 4 / 2 (30d); 47 (90d). VERIFIED |
| Spend confidence | Class C: about £27 / 30d (ESTIMATE) |
| Value | 3 non-brand Ads orders (#1029, #1030, #1032), £778.99 (£649.16 ex-VAT). MATCHED. Cancelled #1014 is excluded |
| Shopify orders | 4 orders, £1,080.48 (30d). VERIFIED |
| Contribution readiness | UNKNOWN. Needs cost cell Q4(4) (Small Double) |
| Website readiness | Good: price true, 0% gap, 1 review. Missing: dimensions and storage depth |
| Feed readiness | Clean |
| Recommended ad status | **KEEP ACTIVE.** Best conversion ratio. Feature it in the ottoman headlines (O7) and in E3 |

### 13.3 Cloud Teddy Bouclé Ottoman Bed
| Item | Finding |
|---|---|
| Exposure | 3 / 1 / 0 (30d); 7 (90d). VERIFIED |
| Spend confidence | Class C: about £3 / 30d |
| Value | 1 Ads order, brand (#1040), £556.19. MATCHED |
| Shopify orders | 2 orders, £977.39 (30d). VERIFIED |
| Contribution readiness | UNKNOWN (Cloud Teddy King is in the 15 key cells) |
| Website readiness | Ottoman price not in the headline: +34% basket gap. #1038 bought it with a slatted base. VERIFIED |
| Feed readiness | **F1** (ottoman title vs slatted price) |
| Recommended ad status | Low exposure. Falls under R1 (temporary exclusion) if the owner approves, until owner question 9 is answered |

### 13.4 Line Bumper Ottoman Divan Bed
| Item | Finding |
|---|---|
| Exposure | 72 / 10 / 1 (30d); 128 (90d). 90d all channels: 441 landings, 0 orders (HISTORICAL). VERIFIED |
| Spend confidence | Class C: about £70 / 30d |
| Value | 0 Ads orders. VERIFIED |
| Shopify orders | 0 (30d). VERIFIED |
| Contribution readiness | UNKNOWN |
| Website readiness | **P0 price truth:** King £435.99 shown, £595.97 configured (+37%). No "base optional" wording |
| Feed readiness | **F1** |
| Recommended ad status | **Owner decision:** R1 temporary exclusion until F1 is fixed, or fix the page first (question 9: A or B). Not proven waste |

### 13.5 Line Ambassador Bed
| Item | Finding |
|---|---|
| Exposure | 79 / 11 / 1 (30d); 134 (90d). VERIFIED |
| Spend confidence | Class C: about £76 / 30d |
| Value | 1 Ads order, brand (#1016, Search), £377.99. MATCHED |
| Shopify orders | 0 (30d). VERIFIED |
| Contribution readiness | UNKNOWN |
| Website readiness | Double colour picker; +37% gap |
| Feed readiness | **F6:** 60 colour offers |
| Recommended ad status | Keep, but R3 optional (keep 1 colour × 5 sizes) until the picker is fixed (approval 12) |

### 13.6 Eagle Savoy Channel Bed
| Item | Finding |
|---|---|
| Exposure | 2 / 0 / 0 (30d); 4 (90d). VERIFIED |
| Spend confidence | Class C: about £2 / 30d |
| Value | 0 Ads orders |
| Shopify orders | 1 order, £823.48 (#1034, direct). 9 checkouts from 6 baskets = probing; excluded from rate judgements |
| Contribution readiness | UNKNOWN (Savoy King is in the 15 key cells) |
| Website readiness | +33% gap (hidden add-on prices) |
| Feed readiness | Clean |
| Recommended ad status | Leave in (long tail). Nothing to decide |

### 13.7 Royal Chesterfield Bed
| Item | Finding |
|---|---|
| Exposure | 31 / 6 / 1 (30d); 34 (90d). VERIFIED |
| Spend confidence | Class C: about £30 / 30d |
| Value | 0 Ads orders |
| Shopify orders | 1 order, £629.96 (#1036, via ChatGPT). VERIFIED |
| Contribution readiness | UNKNOWN |
| Website readiness | Super King £389.99 is below King £399.99; hidden Diamond price; +40% gap |
| Feed readiness | **F5** ladder |
| Recommended ad status | **Keep live (R4).** Fix the ladder and the swatch price first (approvals 10, 14) |

### 13.8 Grand Extra-Tall Panel Bed
| Item | Finding |
|---|---|
| Exposure | 106 / 15 / 1 (30d); 107 (90d). The most paid landings. VERIFIED |
| Spend confidence | Class C: about £102 / 30d, the highest estimate. Confidence that this is waste is **very low** |
| Value | 0 Ads orders |
| Shopify orders | 1 order, £539.97 (#1043, direct, 18 Nov; ads may have influenced it). VERIFIED |
| Contribution readiness | UNKNOWN |
| Website readiness | "Extra-Tall" is not supported: only 50/54/60" options and no height stated. +46% gap. No SKUs |
| Feed readiness | **F7** |
| Recommended ad status | **Owner decision:** R2 temporary exclusion until the height is stated (approval 13), or keep and re-measure 14 days after the theme |

### 13.9 Stone Premium Bed
| Item | Finding |
|---|---|
| Exposure | 5 / 2 / 1 (30d); 26 (90d). VERIFIED. Below the 100-landing claim threshold |
| Spend confidence | Class C: about £3 / 30d |
| Value | 0 Ads orders. #1042 clicked Stone but bought Curved Wingback |
| Shopify orders | 0 (30d) |
| Contribution readiness | UNKNOWN |
| Website readiness | The first, unlabelled strip swatch costs +£19.99. 3 of 6 photos are WhatsApp images from Feb 2025. +30% gap |
| Feed readiness | F4 (hidden price) |
| Recommended ad status | Keep (R4). Do not promote until it has photos (approval 25) and swatch prices |

---

## 14. CRO measurement results

**There are no results yet, by design.** The theme was published on 19 Nov. Post-publication data amounts to a few hours, with 0 orders since publication at the time of the check. **No claim is made.**

**Programme** (HQ `cro/programme` v1):
- POST period: 20 Nov–17 Dec.
- Baseline PRE-A: 20 Oct–18 Nov, with 19 Nov excluded.
- PRE-B: 22 Oct–18 Nov, the same length as POST.
- PRE-C: 24 Sep–21 Oct, for the trend.

| Read-out | Date | What it may say |
|---|---|---|
| 1 | **27 Nov** | Guardrails only: nothing broken, no collapse |
| 2 | **4 Dec** | Directional only |
| 3 | **18 Dec** | Final directional result |

**Baseline, 20 Oct–18 Nov** (VERIFIED, ShopifyQL, UK human sessions):

| Segment | Sessions | Carts | Checkouts | Completed | Add to cart | Basket → checkout | Completion |
|---|---|---|---|---|---|---|---|
| Store | 1,360 | 164 | 45 | 12 | 12.1% | 27.4% | 26.7% |
| Mobile | 1,143 | 134 | 36 | 11 | 11.7% | 26.9% | 30.6% |
| Desktop | 199 | 26 | 9 | 1 | 13.1% | 34.6% | 11.1% |
| **Paid (cpc)** | **852** | **92** | **15** | **6** | **10.8%** | **16.3%** | 40.0% |
| Non-paid | 508 | 72 | 30 | 6 | 14.2% | 41.7% | 20.0% |

- Store orders were 16, with net sales of £6,857.57 incl. VAT and £5.04 revenue per session.
- EAGLE10 was used on 13 of the 16 orders.
- **Paid basket → checkout (16.3%) is the weakest step.** It is the number the ads team most needs to rise.

**Claim rules:**
- No claim before 18 Dec.
- A store-level claim needs ≥ 1,000 POST sessions and ≥ 100 cart sessions.
- A product-level claim needs ≥ 100 POST landings.
- Every result is DIRECTIONAL.

**Confounders to report alongside every read-out:**
- Black Friday (27 Nov) and Cyber Monday (30 Nov).
- The EAGLE10 share of orders.
- The Christmas cut-off (UNKNOWN; owner question 10).
- Dated PMax changes.
- Bot traffic and checkout probing.

---

## 15. Eight workstream results (S5-1 to S5-8)

| # | Workstream | Status | What was done | What blocks the rest |
|---|---|---|---|---|
| S5-1 | Measurement | **DONE (set-up)**. Read-outs pending | HQ `cro/programme` v1: periods, metric definitions, store/device/paid and 9-product baseline, read-out dates, claim rules | Time: first read-out 27 Nov |
| S5-2 | Profit engine | **Structure DONE; BLOCKED by approval / owner data** | HQ `costs/schema` and `costs/status` written; formulas with VAT; illustrative table | Owner costs (approval 3, question 4); accountant VAT check (P0-1) |
| S5-3 | Ottoman price truth | **NOT STARTED: BLOCKED by approval** | Live re-check only: all issues still present | Approvals 4, 6, 8, 9 PENDING |
| S5-4 | Configuration clean-up | **NOT STARTED: BLOCKED by approval** | Live re-check only: all issues still present | Approvals 10–15 PENDING |
| S5-5 | Ads with product data | **Analysis DONE; product level BLOCKED by approval** | Live account, conversion truth, brand split, tiers, negatives, experiments, export request | Approvals 20 (export), 21 (URL test), 22 (brand) PENDING |
| S5-6 | Catalogue focus | **Read-only analysis DONE; changes BLOCKED by approval** | 1 likely duplicate pair (Chesterfield Tufted / Chester Chesterfield); Mayfair pair uncertain; headboard options | Approvals 16–18 PENDING; retire review after 18 Dec |
| S5-7 | Trust and proof | **Audit DONE; fixes BLOCKED by approval** | Reviews 3; no dimensions; Clearpay wording live with 0 Clearpay payments; "3–5 days" vs about 8 days | Approvals 19, 24–26; questions 3, 5, 6 |
| S5-8 | Kids range | **Read-only investigation DONE** | 439 landings, 18 baskets, 2 orders (90d). 72% of landings come from free listings at a 1.3% basket rate. Paid basket rate about 13%, 0 paid checkouts. 5 hypotheses | None for analysis. Recommendation: no extra kids ad spend; add dimensions and a "which mattress fits 2ft6" answer (owner) |

---

## 16. Top 20 advertising opportunities

The money effect of each is UNKNOWN unless stated. None needs extra budget. Every live change needs the owner's YES.

| # | Opportunity | Evidence | Action | Confidence | Agent | Depends on |
|---|---|---|---|---|---|---|
| O1 | Fix the best ad seller's page | Gas Lift Divan Base: 3 non-brand orders, P0 opening conflict | Confirm the opening; align text and options; add 14 in | Medium (B) | CRO / Website | Owner Q2, Q3 |
| O2 | Lean on the best ratio | Side Lift: 3 non-brand orders from 47 paid landings | Use it in the ottoman assets | Medium | Ad Creative | – |
| O3 | Stop leaking Line Bumper traffic | 72 landings, 10 carts, 0 orders (30d) | Price truth A or B (Q9) | Low (C) | CRO | Owner Q9 |
| O4 | Basket leak on Grand / Ambassador | 15 carts each, 0 non-brand sales | Re-measure 14 days after the theme; height and picker fixes | Low | CRO / Analytics | Approvals 12, 13 |
| O5 | Negative list | About £34 of visible junk (90d) | Section 11 list | High (small £) | Search Terms | Owner |
| O6 | Clean the search themes | Negated competitors set as themes; local themes £42.62 with 0 sales | Remove the conflicting, local and brand themes | Medium | Google Ads | Owner |
| O7 | Ottoman headlines | Ad strength Average; 1 ottoman headline of 16 | Add 3–5 gas-lift / side-lift headlines (BRIEF facts only) | Low | Ad Creative | Owner |
| O8 | Enhanced Conversions | 20-day lag; 3 buyers returned direct | Turn on (Stage 2 T2) | Medium (measurement) | Tracking | Owner |
| O9 | One primary action; retract cancelled orders | #1014 still counted; 7 actions | Settings fix | High | Tracking | Owner |
| O10 | Products export | Product spend UNKNOWN | Owner exports (5 min) | Unlocks everything | Analytics | Owner |
| O11 | Product ID in URLs | No product ID in sessions | 1-day `utm_term={product_id}` test | Unlocks daily data | Analytics | Owner (approval 21) |
| O12 | Move spend within £25 | About £421 / 30d est. on 0-order products | Exclude only export-confirmed waste | Low until the export | Google Ads | O10 |
| O13 | Honest weekly KPI | Brand 38% of value, 5% of spend | Weekly brand / non-brand split in HQ `ads/latest` | High | Analytics | 3 credits / week |
| O14 | Single feed source | F2: two feeds live | Keep the Shopify Google & YouTube feed; pause the other | Medium | Shopping / Feed | MC export |
| O15 | Temporary listing-group exclusion | F1 policy risk; Line Bumper 0 orders | R1 (and R2) until the fix | Low–medium | Google Ads | Owner |
| O16 | Audience signals | None set | Add website-visitor and cart-abandoner signals | Low | Google Ads | Owner |
| O17 | Accurate NI shipping and BFPO | NI 34 sessions, 5 carts, 0 orders; BFPO in the free zone | MC BT postcode rule £90; remove BFPO | Low | Shopping / Feed | MC export, owner |
| O18 | Keep cheap brand sales | Brand CPA £23 | Owner decides brand (section 10) | Medium | Google Ads | Owner |
| O19 | Mobile theme payoff | 86% of spend is mobile; fixes live 19 Nov | E7 observation (paid basket → order) | Low | Analytics / CRO | Time |
| O20 | Better sitelinks | Sitelinks go to collections only | Add Gas Lift Divan Base (after the fix) and free swatches | Low | Ad Creative | O1 |

---

## 17. Top 20 advertising problems

| # | Problem | Evidence | Action | Risk if ignored | Agent |
|---|---|---|---|---|---|
| X1 | **Shopify records £0 tax; VAT basis unchecked** | Manager note (d), VERIFIED | Accountant checks the tax settings (P0-1) | Wrong VAT returns; wrong ex-VAT ROAS | Owner + accountant |
| X2 | Non-brand probably below break-even | ROAS 1.52 needs ≥79% margin | Costs first; no scaling | Loss-making growth | Finance / Analytics |
| X3 | 17-day non-brand drought | 0 non-brand orders from clicks 3–19 Nov (£434.69 total spend) | Watch; read-out 27 Nov; no budget change | Further spend with no return | Google Ads |
| X4 | Product spend UNKNOWN | No product report through our tools | O10 | Decisions on estimates | Analytics |
| X5 | Ottoman price misrepresentation risk | F1, 9 products | Q9 + R1 | Disapproval or account review | Shopping / CRO |
| X6 | Two feed sources | F2 | O14 | Duplicate or stale offers | Shopping / Feed |
| X7 | Google counts cancelled #1014 | £310.50 overstated | O9 | Wrong bidding signal | Tracking |
| X8 | ROAS includes VAT | Shopify app sends the gross total | Report ex-VAT every time | 20% over-optimism | Analytics |
| X9 | Non-Search spend with no conversions | £181.42 (7.8%), 0 conv. | Accept (PMax); maybe remove the auto videos | About £60 / month | Google Ads |
| X10 | Possible waste on 0-order products | About £421 / 30d est. | O10 → O12 | Waste continues | Google Ads |
| X11 | Grand Princess: traffic, 0 baskets | 31 landings, 0 baskets | Check in the export | About £24 / month | Google Ads |
| X12 | P0 page blocker on the top seller | Gas Lift opening | O1 | Lost ottoman sales | CRO |
| X13 | Contradictory signals | Negated competitors as themes; "eagle bed" as a theme | O6 | Noise | Google Ads |
| X14 | Local intent, no showroom | £42.62, 81 clicks, 0 sales | E1 | About £14 / month | Search Terms |
| X15 | Weak creative | 1 asset group, home final URL, ad strength Average | O7, E3 | Generic ads | Ad Creative |
| X16 | "Limited by budget" pressure | Google wants more budget | **Do not increase** until break-even is known | Scaling on revenue alone | Google Ads |
| X17 | 70% of searches unseen | Visible terms = 28% of spend | Owner Export 2 | Blind spots | Search Terms |
| X18 | Paid basket → checkout only 16.3% | Baseline (paid) vs 41.7% non-paid | Price truth (S5-3 / S5-4); hidden prices | Paid clicks lost at the basket | CRO |
| X19 | Last-click under-credits ads | 4 orders with no journey; 3 PMax buyers returned direct | O8; use MATCHED as the main truth | Mis-attribution | Analytics |
| X20 | £699.37 of old spend, tracking date UNKNOWN | 15 Jul–21 Aug, 0 conversions | Owner checks when the conversion action was created | Wrong history | Tracking |

Also noted:
- Shopping UK (0.70) and Search UK non-brand (0 sales) stay paused.
- The optimisation score has fallen from 74.9% to 70.1%. Accept Google's suggestions only where they do not raise the budget.

---

## 18. Controlled experiment queue

All are £0 extra. All need the owner's approval. None has started.
- Run E1, E2 and E6 first; they are independent and reversible.
- Run E3, E4 and E8 only after the Products export.
- Never run two listing-group changes in the same 28 days.

| # | Hypothesis | Baseline | Change | Period | Success | Stop / roll back |
|---|---|---|---|---|---|---|
| E1 | Theme cleanup + negatives cut junk without hurting sales | Non-brand 3.96 orders / £679 (28d); junk and local spend visible | Remove local, brand and negated-competitor themes; add the negatives | 14–28 days | Junk spend about £0; non-brand orders not lower | Impressions −40% in a week, or 0 orders for 14 days → restore |
| E2 | `{product_id}` in the URL suffix gives product-level ad sessions | 0% of sessions tagged | Add `&utm_term={product_id}` to the PMax suffix | 1 day | ≥80% of PMax product sessions tagged | Literal `{product_id}`, disapproval, or sessions −50% → paste the old suffix back |
| E3 | An "Ottomans" asset group raises non-brand ottoman orders | About 1.25 non-brand ottoman orders per 28d | 2nd asset group, same campaign, same £25 | 28 days, **after** O1 and the export | Ottoman orders up, CPA down | Non-brand orders 0 for 14 days |
| E4 | Excluding export-confirmed zero-sale items moves spend to sellers | Export spend on Tier 3 | Listing-group exclusion of confirmed items | 28 days | Non-brand CPA lower, orders not lower | Orders −30% → re-include |
| E5 | Brand exclusion frees spend without losing brand orders | 5 brand orders / 90d, £115.84 | **Deferred: owner decision (section 10).** Run only if brand is above 15% of PMax spend | 8 weeks | All-channel brand orders steady; non-brand up | Any fall in brand orders → undo |
| E6 | Enhanced Conversions + one primary action make Ads = Shopify | 15 conv. vs 14 real | Settings only | 14 days | Ads = real orders (±1) | Duplicates → revert |
| E7 | The 19 Nov mobile fixes raise paid conversion | Paid basket rate 7.6% (90d); paid basket → checkout 16.3% (30d) | None (observation) | 20 Nov–3 Dec | Paid basket → order up | – |
| E8 | Temporarily excluding the ottoman-named beds (R1) and Grand (R2) keeps PMax orders while removing the policy risk | PMax 14 days before | R1 / R2 listing-group exclusions | 14 days | PMax orders and ROAS not lower | Orders fall → re-include |

---

## 19. Outstanding owner approvals

### 19.1 The 29 Stage 4 approvals (from `owner-decisions.csv`)

| # | Decision | Status |
|---|---|---|
| 1 | Trading entity, VAT, Terms/footer | **COMPLETED** (Manager verified live). Residual: registered office line not shown; **Shopify £0 tax (P0)** |
| 2 | #1020 refund £273.59 | PENDING |
| 3 | Cost sheet | PENDING (0 of 831) |
| 4 | Gas Lift Divan Base opening | PENDING |
| 5 | #1038 expectation check | PENDING (owner's own call) |
| 6 | Ottoman-named beds: price in or rename | PENDING |
| 7 | "With Drawers" default | PENDING |
| 8 | Running total | PENDING |
| 9 | "From £X with ottoman base" | PENDING |
| 10 | Print hidden option prices | PENDING |
| 11 | Tie mattress size to bed size | PENDING |
| 12 | Ambassador: one colour picker | PENDING |
| 13 | Grand Extra-Tall: height, options, SKUs | PENDING |
| 14 | Size ladders | PENDING |
| 15 | Missing option sets | PENDING |
| 16 | 6 MERGE products | PENDING (analysis done) |
| 17 | Headboards | PENDING |
| 18 | Retire review after 18 Dec | PENDING (the default holds) |
| 19 | Clearpay | PENDING |
| 20 | **Ads Products export** | PENDING |
| 21 | `utm_content` / `utm_term` `{product_id}` test | PENDING |
| 22 | **Brand exclusion** | PENDING. Owner decision between the two positions (section 10) |
| 23 | Inventory rule | PENDING |
| 24 | Dimensions | PENDING (partial: 14 in stated by the owner, not on the page) |
| 25 | Photos: Divan Base and Stone | PENDING |
| 26 | Review requests | PENDING |
| 27 | Mattress price list | PENDING |
| 28 | #1016 NI £0 delivery | PENDING |
| 29 | Remove the £300 placeholder | NOT APPLICABLE until costs exist |

Completed outside the list: X1 theme fixes published · X2 VAT registered · X3 base height 14 in · X4 assembly £69.99 never free / UK only / marketing box unticked / trade emails to companies only.

### 19.2 New Stage 5 approval requests (all PENDING; nothing changed)

| Request | Source | Status |
|---|---|---|
| **Merchant Center export** (diagnostics CSV, data sources, shipping, linked accounts) | 02 §7 | PENDING |
| **Ads Products export** (30 + 90 days) + search-term insights | 01, approval 20 | PENDING |
| **Single feed source** (keep the Shopify Google & YouTube feed; pause Simprosys or the reverse) | F2 | PENDING |
| **PMax listing-group exclusions** R1 (ottoman-named beds), R2 (Grand), R3 (Ambassador colours, optional) | 02 §8 | PENDING |
| **Negative keyword list** + search-theme cleanup | 01 §4.6, E1 | PENDING |
| **Enhanced Conversions** | O8, E6 | PENDING |
| **Cancelled-order conversion**: retract #1014; one primary purchase action | O9, E6 | PENDING |
| **BFPO zone**: remove British Forces from the GB free zone | F9 | PENDING |
| Merchant Center NI shipping (BT postcode rule £90) and handling time | F9, F10 | PENDING (needs the MC export) |
| Ottoman headlines / sitelinks / audience signals | O7, O16, O20 | PENDING |
| **Shopify tax settings** (accountant) | Manager note (d) | **P0, PENDING** |

### 19.3 The 10-question owner decision request (`owner-decision-request.md`)

| # | Question | Answer options | Status |
|---|---|---|---|
| 1 | #1020 (£273.59, PayPal): refunded? | YES / NO, I will refund | Unanswered |
| 2 | Gas Lift Divan Base: which end opens? | END / SIDE / BOTH | Unanswered |
| 3 | Put "Base height 14 inches" on the page? | YES / NO | Unanswered |
| 4 | Fill 5 cost cells this week (delivery per drop, assembly labour, Gas Lift King, Side Lift SD, Mesh Metal Ottoman King)? | YES / NO | Unanswered |
| 5 | Clearpay switched on? | ON (keep wording) / OFF (remove) | Unanswered |
| 6 | Is "3–5 working days" still right? | YES / NO, ___ days | Unanswered |
| 7 | #1016 NI £0 delivery intended? | YES / NO | Unanswered |
| 8 | Export Google Ads PMax → Products (30 and 90 days)? | YES / NO | Unanswered |
| 9 | Line Bumper / Cloud Teddy: base price in headline (A) or rename "… with Ottoman Storage Option" (B)? | A / B / NO change | Unanswered |
| 10 | Christmas last order date? | Date | Unanswered |
| + | (Accountant) VAT scheme standard 20%? Should Shopify record VAT? | – | Now **P0** (Manager note (d)) |

---

## 20. OpenRush resource usage

| Item | Credits |
|---|---|
| Stage 5 total (VERIFIED by Manager) | **24** |
| Of which, Ads specialist (01): get_ad_campaigns ×2, get_ad_performance ×6 (date, campaign 6 months, campaign 7 days, device, campaign 28 days, network), at 3 credits each; describe_capabilities free | 24 |
| Feed & price truth (02) | 0 |
| Decisions, profit, measurement (03) | 0 |
| This report | 0 |
| **Month to date** | **116 / 2,001** (was 92 after Stage 4) |
| Protected reserve (400) | **Untouched** |

Re-used at no cost: the Stage 4 90-day search-term pull and the Stage 1 28-day pull.

Proposed recurring cost: a weekly brand / non-brand split, about 3 credits per week (O13).

---

## 21. Stage 6 preparation

**What must happen first.** Stage 6 should not be a growth or scaling stage until these are in place:

1. **Accountant checks Shopify tax settings and the VAT scheme** (P0-1). Every ex-VAT and profit figure rests on it.
2. **Costs:** at least the 5 key cells, then the 15 key cells and the 9 priority products. This turns break-even ROAS from UNKNOWN into an ESTIMATE, then into VERIFIED.
3. **Products export + Merchant Center export** in hand. This turns class C into real product data and shows feed disapprovals and duplicates.
4. **Price truth on the ottomans** (owner questions 2 and 9; approvals 4, 6, 8, 9). Without it, the best ad category keeps a basket shock and a policy risk.
5. **Read-outs on 27 Nov and 4 Dec** of the theme programme, so that ads changes are not confused with website effects.
6. **The first £0 ad experiments approved:** E1, E2, E6.

**Suggested Stage 6 theme:** "Profit-proven advertising". It would compute per-product break-even with real costs, apply export-confirmed listing-group decisions (E4), run the ottoman asset group (E3), and make a brand decision on evidence.

**Not in Stage 6 until costs exist:** budget increases, new campaigns, discounts.

---

## Prioritised task queue (P0–P3)

| P | Task | Evidence | Responsible agent | Expected result | Dependencies | Approval | Completion criteria |
|---|---|---|---|---|---|---|---|
| P0 | Shopify tax settings and VAT scheme check | £0 tax on every order; VAT 520 9622 06 (Manager (d)) | Owner + accountant (Profit & Cash prepares the question) | Correct VAT recording; confirmed ex-VAT basis | – | Owner / accountant | Accountant answer recorded; test order shows VAT |
| P0 | #1020 refund check | PAID, £0 refunded, cancelled 23 Sep | Owner | Customer refunded or confirmed | – | Owner | PayPal refund confirmed in CHANGELOG |
| P0 | 5 key cost cells | Costs 0% | Owner → Profit & Cash | First break-even ESTIMATE for the two bases | – | Owner (Q4) | 5 cells filled with status A, B or C |
| P0 | PMax Products export (30/90d) | Product spend UNKNOWN | Owner → Analytics | Real per-product spend and ROAS | – | Owner (Q8 / approval 20) | Both CSVs received and mapped |
| P0 | Merchant Center export | MC UNKNOWN; F1/F2 risk | Owner → Shopping / Feed | Disapprovals and sources known | – | Owner | CSVs and screenshots received; queue re-ranked |
| P0 | Gas Lift Divan Base opening | Text vs options conflict | Owner + workshop → CRO | One true description and option set | – | Owner (Q2 / approval 4) | Page, options and feed agree; Base Type required |
| P1 | Price truth on the ottoman-named beds (Line Bumper, Cloud Teddy first) | F1; +37% gap; 0 orders | CRO / Product Pages | Basket shock removed; policy risk reduced | Q9 | Owner (approvals 6, 9) | Live page shows the base price or "base optional" |
| P1 | Single feed source | F2 | Shopping / Feed | One source, no duplicates | MC export | Owner | MC data sources shows one active source |
| P1 | Retract #1014; one primary purchase action; Enhanced Conversions | 15 vs 14; 20-day lag | Tracking | Ads conversions = real orders | – | Owner | E6 passes (±1 for 14 days) |
| P1 | Negatives + theme cleanup (E1) | About £34 junk; £42.62 local, 0 sales | Search Terms & Negatives | Junk spend about £0 | – | Owner | Negatives and themes live; 14-day check done |
| P1 | Brand decision | Two positions (section 10) | Owner, advised by Google Ads | Settled policy | Optional Export 2 | Owner (approval 22) | Choice recorded in CHANGELOG |
| P1 | Weekly brand / non-brand KPI in HQ `ads/latest` | Brand 38% of value | Analytics | Honest weekly ROAS | 3 credits / week | Manager | Doc updated weekly |
| P1 | Read-out 1 (guardrails) | `cro/programme` | Analytics / CRO | Confirm nothing is broken | Time | None | Read-out written 27 Nov |
| P2 | `{product_id}` URL test (E2) | No product ID in sessions | Analytics | Daily product ad sessions | – | Owner (approval 21) | ≥80% tagged, or rolled back |
| P2 | Listing-group exclusions R1 / R2 (E8) | F1, F7 | Google Ads | Policy risk removed, spend moved | Products export preferred | Owner | 14-day before/after done |
| P2 | Ottoman headlines and sitelinks | Ad strength Average | Ad Creative | Ad strength Good | O1 | Owner | Assets live; ad strength checked |
| P2 | Hidden prices + running total (S5-4) | F4; +30–46% gap | CRO | Paid basket → checkout up | – | Owner (approvals 8, 10) | Live on all configurable beds |
| P2 | BFPO zone; NI shipping in MC; handling time | F9, F10 | Shopping / Feed | Accurate shipping in ads | MC export; Q6 | Owner | MC and Shopify zones match the policy |
| P2 | Read-out 2 (4 Dec) | `cro/programme` | Analytics | Directional result | Time | None | Read-out written |
| P3 | Ottoman asset group (E3); export-confirmed exclusions (E4) | Tiers | Google Ads | Lower non-brand CPA | Export; O1; costs | Owner | 28-day result recorded |
| P3 | SKUs, headboard title, inventory rule, Simprosys gtag | F11–F15 | Shopping / Feed | Clean data | – | Owner | Queue items closed |
| P3 | Kids range page answers (dimensions, 2ft6 mattress) | S5-8 | Product Pages | Clearer kids pages | Owner measurements | Owner | Live on both pages |
| P3 | Read-out 3 (18 Dec) + catalogue retire review | Programme | Analytics / Decision Council | Final directional result; catalogue decisions | Time | Owner for retirements | Report written |

---

## CEO questions A–J

**A. Which Google Ads campaigns are genuinely producing paid orders?**
- **Only Performance Max.** 90 days: 11 real paid orders, £4,374.43, ROAS 3.25 (2.71 ex-VAT), CPA £122.28; 8 non-brand, 3 brand. VERIFIED spend / MATCHED orders (§4.1).
- Shopping UK (paused): 1 real order, ROAS 0.70. Search UK (paused): 2 brand orders, £0 from about £350 non-brand spend. HISTORICAL / MATCHED (§4.1, §4.3).
- Warning: since 3 Nov, £434.69 spent and only 2 brand orders; last non-brand sale came from a 2 Nov click. MATCHED (§3.2, §17 X3).

**B. Which products deserve more advertising attention?**
- The proven non-brand sellers: **Ottoman Gas Lift Divan Base** (3 orders, £1,532.64), **Side Lift Ottoman Storage Base** (3, £778.99), Line Kids Velvet (1), Upholstered Ottoman Storage Box (1). Ottomans are the only proven non-brand category. MATCHED (§5 Tier 1).
- Their own ad cost is UNKNOWN until the Products export (session-share ESTIMATE about £53 and £27 per 30 days for the two bases).
- Fix the Divan Base page first (P0 opening conflict), then use both bases in ottoman headlines and an ottoman asset group (O1, O2, O7, E3).

**C. Which products are wasting advertising expenditure?**
- **Not proven yet.** Product-level spend is UNKNOWN. ESTIMATE: about £421 of £775 PMax spend (30d) lands on products with 0 Ads orders in 90 days (§5, §17 X10).
- Strongest suspects (traffic, 0 baskets): Grand Princess (31 landings, about £24/month) and Cambridge Curved Headboard (18, about £14). Weaker: Line Bumper, Line Ambassador, Royal Chesterfield, Mini Line Wingback Kids, Roxy; Grand Extra-Tall is very low confidence. ESTIMATE.
- Exclude only items the Products export confirms (O12, E4).

**D. What is the actual cost of acquiring customers?**
- Measured as cost per real paid Ads order (new and returning customers are not separated): **£165.52** over 90 days (£2,317.26 ÷ 14); Google says £154.48 because it counts cancelled #1014. VERIFIED ÷ MATCHED (§3.2).
- Non-brand about **£244.60**; brand about £23.17 (ESTIMATE). PMax £122.28; last 30 days £101.11; 180 days £215.47. VERIFIED ÷ MATCHED.

**E. What is the verified break-even ROAS?**
- **UNKNOWN.** 0 of 831 cost rows are filled, so no product has a known margin (§7, §8).
- Formula: break-even ROAS on Google's value = **1.2 ÷ contribution margin** (§8.1).
- Arithmetic only: the account's 2.33 needs ≥51.5% margin; non-brand 1.52 needs ≥78.9%. ESTIMATE (§8.2). The 5 cost cells (P0-3) give the first estimate.

**F. Which product-feed problems are reducing advertising opportunities?**
- **F1:** 9 "Ottoman … Gas Lift Storage Bed" listings show the slatted-base price (storage +£119.99 to +£189.99): misrepresentation risk. VERIFIED prices / ESTIMATE risk.
- **F2:** two live feed sources (Shopify Google & YouTube and Simprosys); overlap UNKNOWN. VERIFIED.
- F3 "With Drawers" divans default to No Drawers (6); F7 Grand "Extra-Tall" has no height; F9 BFPO in the GB free zone, NI shipping in Merchant Center UNKNOWN. VERIFIED (§9).
- Disapprovals and warnings are UNKNOWN until the Merchant Center export (P0-5).

**G. Which website problems are wasting paid traffic?**
- **Hidden real price:** page and sticky prices exclude add-ons; the configured basket is +30% to +46% above the price shown. VERIFIED (§1 item 10, §13).
- **Paid basket → checkout is 16.3%**, against 41.7% for non-paid traffic: the weakest step. VERIFIED (§14).
- P0 Gas Lift Divan Base: text says end-opening, options say side; 14 in height not shown (§13.1). Line Bumper King £435.99 shown vs £595.97 configured; 72 landings, 10 carts, 0 orders in 30 days (§13.4, O3). Ambassador double colour picker; Grand height unsupported (§13). VERIFIED.
- Pages fit mobile and add to basket worked in all 27 runs (VERIFIED); effects of the 19 Nov theme are unknown until the 27 Nov / 4 Dec / 18 Dec read-outs (§14).

**H. Which advertising improvements can be made without increasing the budget?**
- Negative list and search-theme cleanup (O5, O6, E1); ottoman headlines, sitelinks, audience signals (O7, O16, O20).
- Enhanced Conversions, one primary purchase action, retract #1014 (O8, O9, E6).
- Products and Merchant Center exports; 1-day product-ID URL test (O10, O11, E2).
- One feed source; temporary listing-group exclusions R1/R2 (O14, O15); weekly brand / non-brand report (O13).
- Fix the Divan Base and Line Bumper pages (O1, O3). All £0 extra; all PENDING owner approval (§16, §19.2).

**I. Which owner decisions are blocking progress?**
- **P0:** accountant check of Shopify's £0 tax (P0-1); cost cells (approval 3, Q4); Products export (approval 20, Q8); Merchant Center export (§19.2).
- **Price truth:** Divan Base opening (approval 4, Q2) and ottoman price-in or rename (approval 6, Q9). S5-3 / S5-4 have not started; they are blocked by approvals (§1 item 12).
- **Brand exclusion** (approval 22; §10) and the #1020 refund (approval 2, Q1).
- Overall: 27 of 29 Stage 4 approvals and all new Stage 5 requests are PENDING; all 10 owner questions are unanswered. VERIFIED (§19).

**J. What must happen before Stage 6?**
1. Accountant confirms Shopify tax settings and the VAT scheme.
2. Costs: the 5 key cells, then the 15 key cells and the 9 priority products.
3. Products export and Merchant Center export in hand.
4. Price truth on the ottomans (Q2, Q9; approvals 4, 6, 8, 9).
5. Theme read-outs on 27 Nov and 4 Dec.
6. The first £0 experiments approved: E1, E2, E6.
- No budget increases, new campaigns or discounts until costs exist (§21).

---

## Limitations

- Google's per-product metrics and Merchant Center diagnostics are not available through our tools. They are UNKNOWN until the owner exports them.
- Order matching uses click date and exact value; the link is inferred (MATCHED). #1027 and #1033 match only as a pair.
- Search terms cover 28% of 90-day spend. Brand spend is a floor and non-brand ROAS may be slightly higher.
- Search UK and Shopping UK 90-day metrics come from Stage 4's pull earlier on 19 Nov (HISTORICAL). Both are paused.
- Report 03 quotes Stage 4's 2.34 ROAS and £165.19 CPA. This report uses the live re-pull (2.33, £165.52).
- Ex-VAT = ÷1.2 assumes standard-rate VAT on the full total. Shopify records £0 tax (P0-1).
- Every margin in section 8.3 is illustrative. Eagle Bed's margins are UNKNOWN.
- Theme effects cannot be judged before the read-outs; no CRO claim is made.
- The kids search intent is UNKNOWN (no `utm_term`).

## Credits used

- **OpenRush:** Stage 5 total **24 credits** (all in `01-google-ads.md`). Month **116 / 2,001**. Reserve untouched. This report: **0**.
- **HQ (ArtifactData):** 1 read (`ads/latest`, absent) and 1 write (`set ads/latest`, new, under 100 KB).
- **Files written:**
  - `ops/rocket/stage5/STAGE5-REPORT.md`
  - HTML summary `rocket-stage5.html` in the session scratchpad
- Nothing was published or committed.
