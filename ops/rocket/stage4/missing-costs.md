# Missing costs report (Stage 4, part 6), 19 Nov 2026

The form to fill is `owner-cost-collection.xlsx`. Its Summary sheet recalculates every figure below as costs are entered.

## 1. Coverage today

| Measure | Covered by VERIFIED cost | Covered by VERIFIED or OWNER CONFIRMED | Total | Label |
|---|---|---|---|---|
| Published products | 0 (0%) | 0 (0%) | 145 | VERIFIED |
| Published variants | 0 (0%) | 0 (0%) | 763 | VERIFIED |
| Paid add-ons and services (form rows) | 0 (0%) | 0 (0%) | 68 | VERIFIED |
| Last-90-day net revenue (21 Aug–19 Nov, cancelled excluded) | £0 (0%) | £0 (0%) | £13,851.37 | VERIFIED |
| Payment fees on that revenue | £322.46 (86%) VERIFIED | – | £376.35 (£53.89 PayPal ESTIMATE) | VERIFIED / ESTIMATE |

Shopify holds `unitCost` £0.00 on 358 variants and £300.00 on 19 variants (4 beds, the same figure on every size); the other 386 are empty. None of these is evidence of a real cost, so all are counted as UNKNOWN.

## 2. What is missing

| ID (Stage 2) | Missing item | Needed for | Status |
|---|---|---|---|
| C1 | Making cost per bed per size: frame and timber, foam, fabric metres × price, springs, gas lifts, hardware, labour | product cost, every row | UNKNOWN |
| C1b | Cost of each paid add-on per size: Solid Board, Metal Ottoman, Mesh Metal Ottoman, Footend Lift, Side Lift, drawers, 60" and floor-standing headboards, Golden Strip | the add-ons sold on 17 of 34 orders | UNKNOWN |
| C2 | Mattress make or buy-in cost by type (Memory Orthopaedic, 1000/2000/3000 Pocket, Pillow Top) and size | 2 mattress products and the mattress add-ons sold on 9 orders | UNKNOWN |
| C3 | Delivery cost per drop by region band; drops per van run; fuel, driver, van, ULEZ and overnight costs | all 34 orders (free GB delivery by own team) | UNKNOWN |
| C4 | Assembly labour per job (Room of Choice Assembly) and extra handling for Room of Choice Drop Off | 5 + 2 orders | UNKNOWN |
| C5 | PayPal rate from a PayPal statement; Clearpay and Shop Pay Instalments rates | 5 PayPal orders | ESTIMATE / UNKNOWN |
| C6 | VAT registration and scheme, and which legal entity trades (EAGLE BED LTD strike-off accepted 1 Oct 2026) | all revenue (±20%) | UNKNOWN |
| C7 | Packaging per bed; swatch pack and postage | all orders, swatch requests | UNKNOWN |
| C8 | Monthly tools beyond Shopify (£25 subscription and £11–27 apps are VERIFIED) | overhead view only | PARTLY KNOWN |
| C9 | Returns handling cost and resale value | returns allowance | UNKNOWN |
| – | Google Ads cost per product | contribution after advertising | UNKNOWN (account level only) |

## 3. The 15 highest-value cells to fill first (by revenue)

"Revenue touched" means the net revenue (incl. any VAT) of the last-90-day orders that each cell's cost applies to. One order can touch several cells, so the column does not add up.

| Rank | Cell to fill | Where in the form | Orders touched | Revenue touched | Why first |
|---|---|---|---|---|---|
| 1 | VAT status (and trading entity) | Costs column M; Delivery & fees note | 34 | £13,851.37 | Changes every margin by up to 20% (£2,308.56) |
| 2 | Our delivery cost per drop (by region band) | Delivery & fees E3:E9 | 34 | £13,851.37 | Every GB order has free delivery by our own team |
| 3 | Room of Choice Assembly labour per job | Costs: service row; Delivery & fees | 5 | £2,651.58 | Sold on 5 orders; now £69.99 to the customer |
| 4 | Mesh Metal Ottoman base cost (King, Super King) | Costs: Base Type rows | 4 | £2,423.62 | Most-bought add-on (+£149.99) |
| 5 | PayPal rate from a statement | Delivery & fees (PayPal row) | 5 | £1,806.06 | The only fee still estimated |
| 6 | 60" and floor-standing headboard extra cost | Costs: Headboard rows | 4 | £1,857.50 | Add-on sold on 4 orders |
| 7 | Memory Orthopaedic mattress cost, Double 4FT6 | Costs: Mattress rows | 3 | £1,352.62 | Mattress add-on bought most often |
| 8 | Divan Ottoman Footend Lift base cost (Double, King) | Costs: Base Type rows | 2 | £1,157.65 | The +£189.99 gas-lift add-on |
| 9 | Ottoman Gas Lift Divan Base, King 5FT | Costs: P1 product rows | 3 | £1,056.78 | Best-selling product and size |
| 10 | Ottoman Gas Lift Divan Base, Super King 6FT | Costs: P1 product rows | 2 | £991.58 | Second-best size of the top product |
| 11 | Cloud Teddy Bouclé Ottoman Bed, King 5FT | Costs: P1 product rows | 2 | £977.39 | Highest-value bed per order |
| 12 | Solid Board Base cost | Costs: Base Type rows | 2 | £883.97 | Add-on on 2 orders |
| 13 | Eagle Savoy Channel Bed, King | Costs: P1 product rows | 1 | £823.48 | Largest single order (£823.48) |
| 14 | Pillow Top Pocket Sprung mattress cost, King 5FT | Costs: Mattress rows | 1 | £823.48 | Most expensive mattress add-on (+£279.99) |
| 15 | Side Lift Ottoman Storage Base, Small Double 4FT | Costs: P1 product rows | 3 | £769.99 | Most orders of any product and size (tied with #9) |

The 9 priority products had 21 orders and £8,686.37 of revenue (63%) in the last 90 days. Filling the 15 cells above plus all P1 product rows (9 products × 5 sizes) gives a full contribution figure for **17 of 34 orders, £6,380.47 (46%) of revenue**. The other 4 priority orders also need 1000, 2000 and 3000 pocket mattress costs and the Metal Ottoman cost. These are the next cells to fill. VERIFIED (arithmetic on order data).

## Limitations

- Shares are of last-90-day web revenue only; trade or phone orders outside Shopify are not included.
- "Revenue touched" for add-ons counts the whole order, not only the add-on's price.
- The 46% coverage figure assumes every listed cell and every P1 size row is filled.

## Credits used

- OpenRush: 0. This file reuses the data pulled for `02-profitability.md`, so it made no new calls.
