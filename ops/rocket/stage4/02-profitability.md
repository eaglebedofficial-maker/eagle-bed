# Stage 4, parts 5 and 6: profitability engine and owner cost collection

Project Rocket Sales, Stage 4. Profit & Cash, Workshop Planner and Analytics specialists. Written 19 Nov 2026. Read-only: nothing in Shopify, Ads, Gmail or the theme was changed.

**Files from this work** (all in `ops/rocket/stage4/`):

| File | What it is |
|---|---|
| `02-profitability.md` | This report: the cost evidence found, the contribution model and its formulas, the 90-day result |
| `contribution-model.csv` | 90-day model: 20 product rows, 1 total row, 34 order rows. Every unknown cost is written as `UNKNOWN` |
| `owner-cost-collection.xlsx` | The owner's form: Summary, How to fill, Costs (763 variant rows + 68 add-on/service rows), Delivery & fees, Product list, Contribution formulas |
| `owner-cost-collection.csv` | The Costs sheet as CSV (formula columns empty) |
| `missing-costs.md` | Coverage today (0%), what is missing, and the 15 cells to fill first |

---

## 1. Summary

1. **No product cost exists anywhere we can read.** No supplier invoice, purchase order, quote, price list, van, fuel or packaging receipt is in Gmail. No owner-stated cost is in the BRIEF, HQ `settings`, `memory` or 643 `worklog` documents. The HQ `costs` collection does not exist yet. Product, packaging, delivery and assembly costs are all **UNKNOWN**. VERIFIED (searches listed in section 3).
2. **Shopify's unit cost field is not a real cost.** Of 763 published variants, 386 are empty, 358 hold £0.00 and 19 hold £300.00. The £300 sits on every size of 4 beds (Grand Princess, Grand Luxury, Princess Luxury, Curved Wingback), from Single to Super King. That pattern is a placeholder, so we do not use it. VERIFIED (GraphQL `inventoryItem.unitCost`).
3. **Payment fees are now VERIFIED, not only estimated.** Shopify keeps the real fee on each transaction. Over 90 days, card fees were 2% + 25p (Visa and Mastercard), Amex 3.1% + 25p, and Klarna 4.99% + 30p. That is £322.46 VERIFIED on 29 orders. PayPal's fee is not visible to us, so the 5 PayPal orders use 2.9% + 30p, which is £53.89 ESTIMATE. Total £376.35, which is **2.70% of money taken**. Stage 2's 2.6% ESTIMATE was close.
4. **Shopify adds no extra fee for PayPal.** The Shopify bills for 13 Oct (£51.74) and 12 Nov (£36.41) show only the subscription (£25.00) and apps. There is no transaction-fee line, even though 4 PayPal orders fell in the 12 Nov billing period. VERIFIED. This removes the possible £42 extra charge Stage 2 flagged.
5. **90-day sales.** From 21 Aug to 19 Nov 2026 there were 34 orders, 35 units and **£13,851.37 net revenue including any VAT**. The 3 cancelled orders (#1010, #1014, #1020) are excluded, and so is the £90 shipping on #1038. This reconciles to Shopify net sales: £14,124.96 minus #1020's £273.59 = £13,851.37. VERIFIED.
6. **VAT is UNKNOWN.** Every order shows £0 tax, and prices are set as tax-inclusive. If the business is VAT-registered, about £2,308.56 of the £13,851.37 is VAT and ex-VAT revenue is £11,542.81 (ESTIMATE). Companies House emails show that an application to strike off **EAGLE BED LTD** (company 17084410) was accepted on 1 Oct 2026. So it is also unclear which legal entity trades now. The accountant must confirm the trading entity and its VAT status. VERIFIED (email). What it means is UNKNOWN.
7. **What we can say today.** Revenue after payment fees is £13,475.02. Contribution before advertising is **UNKNOWN for every product**, because the largest cost lines (making the bed, base and mattress, delivery, assembly) are missing.
8. **Advertising cannot be split by product.** Google Ads spend is known only at account level: £1,383.85 from 25 Sep to 19 Nov (Stage 1, VERIFIED). In the same window, all web orders brought in £9,683.98. So ads cost about **14.3% of revenue** (17.1% of ex-VAT revenue if VAT-registered). A bed needs a contribution margin above that share before ads just to pay for advertising at today's level (ESTIMATE, account-level). The parallel Stage 4 ads report (`04-ads-products.md`, `ads-by-product.csv`) confirms that per-product Ads cost is UNKNOWN: all PMax spend is in one asset group. That report allocates PMax cost by landing sessions as an ESTIMATE, which can be joined to this model once costs exist.
9. **The owner form is ready.** `owner-cost-collection.xlsx` has one row per published variant and per paid add-on, dropdowns, validation and formulas. Contribution and margin % appear on a row as soon as its cost is typed in. The form was tested in LibreOffice with sample numbers; the formulas compute and the Summary updates.

---

## 2. Scope and definitions

| Item | Definition used | Label |
|---|---|---|
| Window | 21 Aug 2026 to 19 Nov 2026 (90 days), web orders | VERIFIED |
| Cancelled orders | #1010, #1014 (PayPal, expired) and #1020 (PayPal, cancelled; the refund attempts failed, as Stage 1/2 noted) are excluded from all sales metrics | VERIFIED |
| Net revenue incl. VAT | Order total minus shipping charged, after all discounts (EAGLE10 etc.). Easify add-ons (bases, mattresses, headboards, assembly) are part of the bed's line, so they are included | VERIFIED |
| Net revenue ex-VAT | Net revenue incl. VAT ÷ 1.2. Shown only as a second column, labelled ESTIMATE, until VAT status is confirmed | ESTIMATE |
| Orders / units | 34 orders / 35 units (#1007 had 2 kids beds) | VERIFIED |
| Gross / discounts | £14,827.35 line value; £975.98 discounts; £13,851.37 net | VERIFIED |
| Payment method mix | 22 Visa/Mastercard, 3 Amex, 4 Klarna (all through Shopify Payments), 5 PayPal | VERIFIED |

---

## 3. Cost evidence register (every cost found, and where we looked)

| # | Cost item | Value | Applies to | Source | Date | Status |
|---|---|---|---|---|---|---|
| 1 | Card fee: Visa / Mastercard | 2% + £0.25 per sale | 22 orders, £10,128.89 card payments in 90 days | Shopify `OrderTransaction.fees` on each sale; matches published UK Basic rate | 21 Aug–19 Nov 2026 | **VERIFIED** |
| 2 | Card fee: American Express | 3.1% + £0.25 | #1025, #1037, #1039 | Shopify transaction fee records | Oct–Nov 2026 | **VERIFIED** |
| 3 | Klarna fee (through Shopify Payments) | 4.99% + £0.30 | #1018, #1022, #1026, #1034 | Shopify transaction fee records | Sep–Nov 2026 | **VERIFIED** |
| 4 | PayPal fee | 2.9% + £0.30 assumed | #1017, #1027, #1028, #1029, #1030 | Not visible in Shopify; published UK rate not confirmed (sources conflict: PayPal UK fees page vs third-party calculators) | 19 Nov 2026 web search | **ESTIMATED** |
| 5 | Shopify third-party gateway surcharge on PayPal | £0 | PayPal orders | Shopify bills 13 Oct and 12 Nov list only Subscription + Apps | Oct–Nov 2026 | **VERIFIED** |
| 6 | Clearpay fee; Shop Pay Instalments fee | not known | no sale in 90 days (1 failed Shop Pay Instalments attempt on #1018) | – | – | **UNKNOWN** |
| 7 | Shopify Basic subscription (fixed, not contribution) | £25.00 / month | whole shop | Shopify bills 13 Oct, 12 Nov | 2026 | **VERIFIED** |
| 8 | Shopify apps (fixed) | £11.41 (Nov), £26.74 (Oct) | whole shop | Shopify bills | 2026 | **VERIFIED** |
| 9 | Google Ads spend (account level) | £709.44 (23 Oct–19 Nov), £674.41 (25 Sep–22 Oct) | all products, no split | Stage 1 report §7.2 | 19 Nov 2026 | **VERIFIED** (per product **UNKNOWN**) |
| 10 | Shopify `inventoryItem.unitCost` | £0.00 on 358 variants; empty on 386 | 763 published variants | GraphQL read | 19 Nov 2026 | **UNKNOWN** (placeholder, no cost) |
| 11 | Shopify `inventoryItem.unitCost` | £300.00 on all 19 variants of Grand Princess, Grand Luxury, Princess Luxury, Curved Wingback | those 4 beds, every size | GraphQL read; same value from Single to Super King, no document behind it | inventory items last updated 22 Jun / 12 Aug 2026 | **UNKNOWN**: not accepted as a cost |
| 12 | Product metafields that look like cost | none | 187 active products scanned (all metafield namespaces: judgeme, bcpo, mm-google-shopping, mc-facebook, global, shopify, reviews) | GraphQL read | 19 Nov 2026 | VERIFIED: none exist |
| 13 | Manufacturing cost (frame, foam, fabric, springs, gas lifts, labour) | – | all products | Not found in Gmail, repo or HQ | – | **UNKNOWN** |
| 14 | Mattress make or buy-in cost | – | 2 mattress products + mattress add-ons | Not found | – | **UNKNOWN** |
| 15 | Delivery cost per drop (van, fuel, driver) | – | all orders (free GB delivery, own team) | Not found | – | **UNKNOWN** |
| 16 | Assembly labour (£49.99 add-on on 5 orders; £69.99 from 19 Nov) | – | #1025, #1026, #1036, #1037, #1042 | Not found | – | **UNKNOWN** |
| 17 | Packaging per bed; swatch packs (sent free, e.g. 16 and 18 Nov) | – | all orders; swatch requests | Not found | – | **UNKNOWN** |
| 18 | VAT status | – | all revenue | £0 tax on every order; Companies House strike-off of EAGLE BED LTD (17084410) accepted 1 Oct 2026; no HMRC/accountant email | – | **UNKNOWN** |

**Where we looked (read-only):**
- **Shopify GraphQL:** all 187 active products (145 published) with variants, prices, SKUs, `inventoryItem.unitCost` and metafields. All 37 orders since 21 Aug, with line items, Easify attributes, transactions, card brand and fees.
- **ShopifyQL:** payments by gateway and method, and sales by product and variant for 90 days.
- **Gmail** (search and get only; no drafts or labels). Queries: `invoice / proforma / "purchase order" / quotation / receipt / statement / payout / fees / VAT` (excluding sent outreach); supplier words (`supplier, wholesale, "price list", foam, fabric, timber, mdf, chipboard, springs, "gas lift", pallet, fuel, van`); `from:(paypal OR klarna OR clearpay OR hmrc OR gov.uk OR xero OR quickbooks OR accountant)`; `VAT OR HMRC OR accountant OR Klarna settlement OR PayPal fees`. Results:
  - Shopify bills: Aug £43.93, Sep £43.73, Oct £51.74, Nov £36.41.
  - Tool receipts (Anthropic, OpenRush; amounts not read).
  - Companies House emails.
  - Unsolicited supplier marketing: Kernel Grip T-nut samples (19 Nov), a sealant promotion (16 Nov) and skip hire (13 Nov). None of these is a purchase.
  - Customer swatch and quote threads.
  - **No supplier invoice, purchase order, supplier quote, fuel, van or packaging receipt, no PayPal or Klarna statement, and no accountant or HMRC email.**
- **Repo:** we grepped `ops/` for cost, margin, supplier, COGS, VAT and fuel. Found: Stage 2 §3.3–3.4 (payment fee ESTIMATE 2.6% and cost fields C1–C9), Stage 1 (ads spend; VAT unknown), and the CEO roadmap ("profit dashboard needs owner product and delivery cost"). None holds a cost figure.
- **HQ database:** `settings/main`, `memory` (5 docs), `worklog` (643 docs), `costs` (empty). Past Profit & Cash entries say only "no cost data exists" and give break-even maths. There is no owner cost statement.

---

## 4. Contribution model (formula sheet)

The same formulas are on the "Contribution formulas" sheet of the workbook and are built into the Costs sheet.

| Line | Formula | Today |
|---|---|---|
| A. Net revenue incl. VAT | order total − shipping charged (after discounts; cancelled orders excluded) | VERIFIED |
| B. Net revenue ex-VAT | A ÷ 1.2 if VAT-registered; A if not | ESTIMATE (VAT UNKNOWN), both columns shown |
| C. Product cost | bed frame for the size **plus** each paid add-on in the order (ottoman / metal base, drawers, mattress, taller headboard, strip) | UNKNOWN |
| D. Packaging | per bed | UNKNOWN |
| E. Delivery | cost per drop for the order's region band (own van and crew) | UNKNOWN |
| F. Assembly | labour when Room of Choice Assembly is sold; extra handling for Room of Choice Drop Off | UNKNOWN |
| G. Payment fees | Shopify fee record (VERIFIED) or PayPal 2.9% + 30p (ESTIMATE) | KNOWN: £376.35 |
| H. Other variable | swatches, consumables, returns allowance | UNKNOWN |
| **I. Contribution before advertising** | **B − (C + D + E + F + G + H)** | **UNKNOWN** |
| J. Attributable ad cost | Google Ads spend for that product | UNKNOWN (no product-level Ads report; Stage 2 U21/P7 tagging test needed) |
| **K. Contribution after advertising** | **I − J** | **UNKNOWN** |
| Margin % | I ÷ B | UNKNOWN |
| Break-even ROAS | B ÷ I | UNKNOWN |
| Max ad cost per order | I per order | UNKNOWN |

The workbook rule for VAT: if the owner picks "Unsure", the form uses ex-VAT revenue (÷ 1.2). That is the careful view. A separate column always shows the not-VAT-registered result next to it.

### 4.1 Product level, last 90 days (known parts only)

Revenue after fees is **not** contribution. It only shows what is known. All £ include any VAT unless marked ex-VAT.

| Product | Orders | Units | Net revenue | Ex-VAT (ESTIMATE) | Payment fees | Fee status | Revenue after fees | Product, delivery, assembly, packaging cost | Contribution before / after ads |
|---|---|---|---|---|---|---|---|---|---|
| Ottoman Gas Lift Divan Base | 7 | 7 | £2,666.63 | £2,222.19 | £69.77 | £31.10 VERIFIED + £38.67 ESTIMATE | £2,596.86 | UNKNOWN | UNKNOWN |
| Side Lift Ottoman Storage Base | 6 | 6 | £1,603.38 | £1,336.15 | £41.53 | £26.31 VERIFIED + £15.22 ESTIMATE | £1,561.85 | UNKNOWN | UNKNOWN |
| Line Kids Velvet Bed | 2 | 3 | £1,067.57 | £889.64 | £37.03 | VERIFIED | £1,030.54 | UNKNOWN | UNKNOWN |
| Cloud Teddy Bouclé Ottoman Bed | 2 | 2 | £977.39 | £814.49 | £21.84 | VERIFIED | £955.55 | UNKNOWN | UNKNOWN |
| Eagle Savoy Channel Bed | 1 | 1 | £823.48 | £686.23 | £41.39 | VERIFIED (Klarna) | £782.09 | UNKNOWN | UNKNOWN |
| Royal Chesterfield Bed | 1 | 1 | £629.96 | £524.97 | £12.85 | VERIFIED | £617.11 | UNKNOWN (incl. assembly) | UNKNOWN |
| 3000 Pocket Sprung Mattress | 2 | 2 | £595.39 | £496.16 | £12.41 | VERIFIED | £582.98 | UNKNOWN | UNKNOWN |
| Regal Luxe Panel Bed | 1 | 1 | £578.97 | £482.48 | £29.19 | VERIFIED (Klarna) | £549.78 | UNKNOWN (incl. assembly) | UNKNOWN |
| Curved Wingback Bed | 1 | 1 | £578.68 | £482.23 | £11.82 | VERIFIED | £566.86 | UNKNOWN (incl. assembly) | UNKNOWN |
| Elegant Panel Bed | 1 | 1 | £562.48 | £468.73 | £17.69 | VERIFIED (Amex) | £544.79 | UNKNOWN (incl. assembly) | UNKNOWN |
| Eagle Sunrise Fan Panel Bed | 1 | 1 | £549.98 | £458.32 | £11.25 | VERIFIED | £538.73 | UNKNOWN | UNKNOWN |
| Grand Extra-Tall Panel Bed | 1 | 1 | £539.97 | £449.98 | £11.05 | VERIFIED | £528.92 | UNKNOWN | UNKNOWN |
| Eagle Regal Gold-Trim Bed | 1 | 1 | £503.98 | £419.98 | £10.33 | VERIFIED | £493.65 | UNKNOWN | UNKNOWN |
| Mirror Strip Sunrise Bed | 1 | 1 | £428.99 | £357.49 | £8.83 | VERIFIED | £420.16 | UNKNOWN | UNKNOWN |
| Line Ambassador Bed | 1 | 1 | £377.99 | £314.99 | £7.81 | VERIFIED | £370.18 | UNKNOWN | UNKNOWN |
| Hilton Wingback Bed | 1 | 1 | £363.59 | £302.99 | £7.52 | VERIFIED | £356.07 | UNKNOWN | UNKNOWN |
| Divan Storage Base with Drawers | 1 | 1 | £359.98 | £299.98 | £7.45 | VERIFIED | £352.53 | UNKNOWN | UNKNOWN |
| Cambridge Panel Storage Bed | 1 | 1 | £323.98 | £269.98 | £6.73 | VERIFIED | £317.25 | UNKNOWN | UNKNOWN |
| Memory Orthopaedic Mattress | 1 | 1 | £220.99 | £184.16 | £4.67 | VERIFIED | £216.32 | UNKNOWN | UNKNOWN |
| Upholstered Ottoman Storage Box | 1 | 1 | £97.99 | £81.66 | £5.19 | VERIFIED (Klarna) | £92.80 | UNKNOWN | UNKNOWN |
| **Total** | **34** | **35** | **£13,851.37** | **£11,542.81** | **£376.35** | £322.46 VERIFIED + £53.89 ESTIMATE | **£13,475.02** | **UNKNOWN** | **UNKNOWN** |

Order-level rows (fee, method, region band, paid add-ons per order) are in `contribution-model.csv`.

### 4.2 What is known and what is not

| Cost line | Known? | Share of the model |
|---|---|---|
| Revenue incl. VAT, discounts | Yes, VERIFIED | – |
| VAT | No: two columns until confirmed | affects every £ |
| Payment fees | Yes: 86% of the £ VERIFIED, 14% ESTIMATE (PayPal) | 1 of 7 cost lines |
| Product cost (frame + add-ons) | No | biggest line, UNKNOWN |
| Packaging, delivery, assembly, other | No | UNKNOWN |
| Ad cost per product | No (account level only) | UNKNOWN |

The orders hold useful cost drivers even without costs:
- 17 orders included paid add-ons that the owner must cost: bases (board, metal, mesh, ottoman lift) on 9, mattresses on 9, 60" or floor-standing headboards on 4, drawers on 2 and a golden strip on 1.
- 5 orders bought Room of Choice Assembly and 2 bought Room of Choice Drop Off.
- The region bands of the 34 orders: London & South East 12, Midlands & East 9, North 5, Yorkshire 2, Scotland 2, South West & Wales 2, Northern Ireland 2.

### 4.3 Things noticed while building the model

- **#1016 had a Northern Ireland postcode (BT) but was charged £0 shipping.** The BRIEF says Northern Ireland pays £90, and #1038 (also BT) did pay £90. Owner to check. VERIFIED (order data).
- **Easify option prices changed during the window.** Older orders (Aug–Sep) show different add-on prices, for example a 4ft6 memory mattress at £75.00 and a 4ft 1000-pocket mattress at £125.00. Newer ones show £99.99 and £179.99. Assembly was £49.99 on all 5 orders, and is £69.99 from 19 Nov. Costs must be matched to the price at the time.
- **#1009 was for a variant that no longer exists** (Side Lift, King / Black). Its revenue is mapped to the current King (5FT) row in the form.

---

## 5. Owner cost collection form (part 6)

`owner-cost-collection.xlsx`, sheets:

| Sheet | Contents |
|---|---|
| **Summary** | Live coverage formulas: % of variants VERIFIED (and VERIFIED + OWNER CONFIRMED), % of products with a verified cost, % of add-on rows verified, % of last-90-day revenue covered, count of the 9 priority products filled, delivery bands filled, VAT chosen yes/no |
| **How to fill** | Plain-English steps. Start with the 9 priority products (Fill priority = P1). A cost per size (3FT, 4FT, 4FT6, 5FT, 6FT) is enough. Payment fees can stay empty. Pick "Unsure" for VAT if not sure. Do not use the Shopify £0/£300 figures |
| **Costs** | 831 rows. There are 763 rows for published product variants: product name, product ID, variant ID, SKU, size/option, current price, the Shopify unit cost for reference, fill priority and 90-day revenue. There are 68 rows for paid add-ons and services: 7 base types × 5 sizes (Board, Metal Ottoman, Mesh Metal Ottoman, Footend Lift, Side Lift, 2-drawer, 4-drawer), 5 mattress types × 5 sizes, headboard heights, Golden Strip, Room of Choice Assembly (£69.99), Room of Choice Drop Off (£29.99) and downstairs drop-off. The input columns G–L are pale yellow. There are dropdowns for VAT treatment and Status, number validation and a date check. Grey formula columns (Revenue used, Payment fee used, Total variable cost, Contribution before ads, Margin %, Contribution if NOT VAT registered) stay blank until column G is filled. A negative margin turns red. The header row and first column are frozen, with a filter on all columns |
| **Delivery & fees** | Region bands with VERIFIED 90-day order counts and the customer charge; cost per drop and drops per run are owner inputs. Van, fuel, driver, ULEZ, overnight, assembly labour, packaging and swatch-pack inputs. Payment fee rates by method, with the published rate filled in and marked VERIFIED (Shopify fee records) or ESTIMATED (PayPal, cash). The blended 90-day rate (2.70%) is used by the Costs formulas. Fixed monthly costs (Shopify £25, apps) are listed for the overhead view |
| **Product list** | Helper sheet: one row per published product with verified-variant counts (feeds Summary) |
| **Contribution formulas** | The formula sheet from section 4 |

**The 9 commercial priority products (P1).** There is no single "9 priority" list in Stages 1–3, so this report defines it (RECOMMENDATION; change it if the Manager uses another list). It is the 6 beds with the most 90-day revenue, plus the 3 Stage 3 investigation products with the most traffic and no or one sale:
1. Ottoman Gas Lift Divan Base
2. Side Lift Ottoman Storage Base
3. Line Kids Velvet Bed
4. Cloud Teddy Bouclé Ottoman Bed
5. Eagle Savoy Channel Bed
6. Royal Chesterfield Bed
7. Grand Extra-Tall Panel Bed
8. Line Ambassador Bed
9. Line Bumper Ottoman Divan Bed

Together they have 98 variant rows. Line Ambassador alone has 60 (size × colour); one cost per size is enough.

---

## 6. Recommendations (all AWAITING APPROVAL; none applied)

| Pri | RECOMMENDATION | Who | Why |
|---|---|---|---|
| P1 | Fill `owner-cost-collection.xlsx`, P1 rows first, plus one delivery cost per drop and the VAT choice (about 45 minutes) | Owner | Unlocks contribution, margin %, break-even ROAS and a profit-based Ads limit |
| P1 | Ask the accountant: which legal entity trades the shop since the EAGLE BED LTD strike-off application (1 Oct 2026), and whether it is VAT-registered | Owner + accountant | Changes revenue by 20% (£2,308.56 in 90 days) |
| P2 | Copy the PayPal rate from one PayPal statement into "Delivery & fees" | Owner | Turns £53.89 of fees from ESTIMATE into VERIFIED |
| P2 | When costs arrive, store them in HQ `costs/products`, `costs/delivery` and `costs/assembly` (Stage 2 data model). Recompute `contribution-model.csv` from the same formulas | Profit & Cash | Daily profit fields become live |
| P3 | Remove or replace the £300 Shopify unit cost on the 4 beds only when real costs are known (live change, so it needs owner approval) | Owner | Stops Shopify's own profit reports showing a false margin |
| P3 | Check #1016: Northern Ireland postcode charged £0 delivery | Owner | Possible £90 under-charge |

---

## Limitations

- Product, packaging, delivery and assembly costs are UNKNOWN, so no contribution, margin or break-even figure is stated for any product.
- PayPal fees are an ESTIMATE (2.9% + 30p). Published UK sources conflicted on 19 Nov (one official snippet showed 1.29% + 30p, others 2.9% + 30p).
- Ex-VAT revenue is an ESTIMATE at 20% until VAT status is confirmed. Whether a VAT scheme such as flat rate applies is UNKNOWN.
- Ad cost per product is UNKNOWN. The 14.3% ads-to-revenue figure uses all web orders in the window, not only ad-attributed orders. It is ESTIMATE, account-level only, and 21 Aug–24 Sep ad spend is not included (UNKNOWN in Stage 1 data).
- Region bands were set from the postcode area only (no addresses stored in reports). Band edges such as MK and PE are judgement calls.
- Gmail search is limited to what the connector returns. Paper invoices, WhatsApp messages and other inboxes were not searched. Attachments were not opened.
- Customer add-on prices for some mattress type and size combinations vary by product option set and are left blank in the form.
- The "9 commercial priority products" list is this report's definition.

## Credits used

- **OpenRush: 0 credits** (budget 0). Calls: none.
- **Shopify (free):** GraphQL read × 7 (products ×4 pages, inventory item dates ×1, orders 90 days ×1, transaction payment details ×1); schema lookup × 0; ShopifyQL × 2 (payments by gateway and method; sales by product and variant).
- **Gmail (read-only, free):** search × 7, get thread × 2 (Shopify bills 12 Nov and 13 Oct). No drafts, labels or sends.
- **HQ database:** read only. Lists of `settings`, `memory`, `worklog` and `costs`. No writes.
- **Web search × 2** (PayPal UK rates; Shopify Payments UK rates).

Sources: [Shopify UK pricing](https://www.shopify.co.uk/pricing), [Fena: Shopify Basic plan fees UK](https://www.fena.co/blog/shopify-basic-plan-payment-fees-uk-what-youre-actually-paying-per-order), [PayPal UK merchant fees](https://www.paypal.com/UK/webapps/mpp/merchant-fees), [Fee calculator (PayPal UK)](https://feeprobe.pages.dev/paypal-uk/).
