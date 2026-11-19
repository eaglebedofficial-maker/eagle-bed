# Stage 4, report 03: Product configuration, pricing and inventory intelligence (19 Nov 2026)

Parts 8 (configuration and pricing) and 10 (inventory and supply). Roles: Offer & Pricing, Product Pages, Workshop Planner, Delivery & Returns, Quality Control.
**Read-only.** No prices, variants, inventory, products, themes or Easify settings were changed. No customers or suppliers were contacted. OpenRush: 0 calls.

Companion file: `config-prices.csv` (14,100 rows, one row per product × option value, all 145 published products).

Method:
- Shopify size variants and prices from the live `/products.json` (145 published products, 763 variants). Cross-checked against Admin GraphQL (257 products in the admin).
- Easify option sets read from the `window.TPOConfigs` JSON embedded in every product page. The page carries all 7 of the store's option sets, each with its product list, groups, values, add-on prices, required flags, defaults and show conditions.
- Rendering checked in Playwright (iPhone 13) on 7 pages. Stage 3 had already rendered 7 more (`ops/rocket/stage3/inv-*.md`).
- 43 Shopify orders read from Admin GraphQL, including Easify line properties.
- Gmail read-only: 5 searches and 2 threads read.

---

## 1. Answer in twelve lines

1. **Every bed runs on one of 7 Easify option sets** (section 2). 135 of 145 published products get options. 10 get none: 6 mattresses, the storage box, and **3 bed frames (Aurora Luxury Vertical Panel, Vegas, Coca) with no fabric or colour choice at all**. VERIFIED (render).
2. **Storage pricing.** 18 products have ottoman, storage, gas-lift or drawer in the name. **Only 2 include the storage in the headline price** (Ottoman Gas Lift Divan Base, Side Lift Ottoman Storage Base). 9 ottoman-named beds need +£119.99 (metal ottoman) or +£189.99 (the described divan gas-lift base). 6 "with Drawers" divans default to an orderable "No Drawers" at £0. VERIFIED (config).
3. **Customers do buy storage.** 25 of 35 non-cancelled bed lines included a storage base. On headboard beds since the new Easify set went live, 7 of 10 lines added a paid base, most often the Mesh Metal Ottoman (+£149.99). VERIFIED (orders).
4. **Real basket vs headline.** Since 18 Sep the average configured bed line is **£488.31**. The shown size price for the same lines averages £345.47 (+41%), and the "from" price on cards averages £285.04. VERIFIED.
5. **The main price never moves with add-ons** (running total missing; Report 3.1 left it open). Typical gaps: +46% for a Line Bumper Double with its gas-lift base, and +141% for a fully loaded Grand Super King. VERIFIED (Stage 3 mechanism, prices from config).
6. **Hidden upgrade prices.** These buttons and swatches show no price: Stone Golden Strip +£19.99, Royal Diamond Button +£19.99, and **the 60" headboard: +£39.99 on 102 beds and +£29.99 on the 4 tall-set beds**. The price only appears in the "additional charge" line. VERIFIED (render).
7. **Size-ladder anomalies:**
   - Royal Chesterfield: Super King £389.99 is less than King £399.99.
   - Prism Geometric (`luxury-geometric-upholstered-bed`): King £444.99 is less than Double £504.99. **New finding.**
   - Valentina Arch: Small Double £389.99 is less than Single £419.99. **New finding.**
   - 5 products charge the same for Small Double and Double.
   - Mattress add-on: 2000 Pocket 4ft (£169.99) is cheaper than 1000 Pocket 4ft (£179.99).

   VERIFIED.
8. **Mattress size is not linked to bed size.** It is a separate, unconditioned picker with all 5 sizes. No wrong-size order has been seen yet (8 of 8 mattress add-on orders matched). VERIFIED.
9. **Compare-at prices: none** on any of the 763 variants. **No variant is unavailable.** Inventory counts are placeholders: 680 variants sit at 1,000, and the rest are a few units under 1,000 or larger fills (3,000 and 12,000). The policy is mixed: 454 tracked and continue, 241 tracked and deny, 68 untracked. Treat stock as made-to-order. VERIFIED.
10. **Lead time actually achieved is UNKNOWN.**
    - "Fulfilled" is set a median of 2.7 h after the order.
    - The delivered timestamps are 3 bulk stamps (25 Sep ×16, 19 Oct ×3, 3 Nov ×9), not real deliveries.
    - Customers chased #1038 and #1040, each promised delivery 8 calendar days after the order. The BRIEF says 3–5 working days.

    VERIFIED (data) / ESTIMATE (gap).
11. **Grand Extra-Tall is attached to the "tall headboard" set (60–90", +£29.99 to +£119.99), but the normal set wins.** Buyers see only 50/54/60". The same double attachment affects Line Bumper and Arizona. VERIFIED (render plus order #1043 property `_tpo_add_by=805903`).
12. **No supplier emails exist** (no fabric, foam, timber, mattress or gas-lift supplier, price list or PO in Gmail). Supplier, vendor and cost fields are UNKNOWN. The Shopify vendor field is "Eagle Bed" on all 257 products. VERIFIED.

---

## 2. The configuration system (VERIFIED from embedded Easify config, 19 Nov)

Easify ("TPO", theme app v2). There are 7 option sets, all status active, and no option value is flagged disabled. Each product is attached by a manual product list (`option_set_products`); the tag conditions stored with the sets are not what decides this. Where a product sits in two sets, only one renders. In all 3 cases checked, the higher-numbered set rendered (Grand and Line Bumper show 805903, not 805898; Chester-style shows 805897, not 805896). The rule is inferred, not documented.

| Set | Name (as in app) | Products rendered | Groups (required = *) | Base Type |
|---|---|---|---|---|
| 805903 | "Upholdersted normal bed" | 64 | Fabric*, Colour*, Headboard*, Base, Mattress Type, Mattress Size*, Delivery* | **optional**, none pre-selected |
| 805897 | "Button bed" | 25 | + Button Type* (Matching £0 / **Diamond +£19.99**) | required, Slatted £0 first |
| 805893 | "normal Headboard" | 17 (headboards) | Fabric*, Colour*, Headboard Height* (50/54 £0; 60" +£39.99; 70" +£59.99; 80" +£79.99; 90" +£99.99, "Comes in 2 Parts") | n/a. **No Delivery Service group**: VERIFIED in config |
| 803938 | " strip bed" | 13 | + Strip Colour* (**Golden +£19.99** / Silver £0) | required, Slatted £0 first |
| 805896 | "divan drawer bed" | 10 | Headboard: 50" Struts £0 / 50" Floor Standing +£19.99 / 60" Floor Standing +£39.99 | required: No Drawers £0; 1 drawer +£19.99; 2 drawers +£39.99; 4 drawers +£79.99; Divan Ottoman side or foot lift +£189.99 |
| 805898 | "tall headboard bed" | 4 (Tower, Mini Line Luxury, Level Lines, Multi Mini Line Luxury) | Headboard 50/54 £0; 60" +£29.99; 70" +£49.99; 80" +£89.99; 90" +£119.99 | **optional** |
| 808111 | "Ottoman storage box without headboard" | 2 (Ottoman Gas Lift Divan Base, Side Lift Ottoman Storage Base) | Fabric*, Colour*, Base (left or right side opening, £0), Mattress, Delivery* | ottoman **included** |
| none | | 10 | no options at all | |

**Common to all bed sets (VERIFIED):**

| Group | Values and add-on price | Required | Pre-selected | Price visible on the option? |
|---|---|---|---|---|
| Fabric Type | Plush Velvet, Naples, Galaxy, Conniston, Teddy Boucle (£0) | yes | none | n/a |
| Colour (also titled "Fabric Type") | 15 / 11 / 9 / 9 / 11 colours, £0 (typos "Charoal", "Tumeric") | yes | none | n/a |
| Headboard Height (normal, button, strip sets) | Standard 50" £0, 54" £0, **60" +£39.99** | yes | none | **No.** The button shows only `60"` (VERIFIED on Grand, Chester-style, Line Bumper) |
| Base Type (normal, button, strip, tall sets) | Slatted £0 · Solid Board +£29.99 · Metal Ottoman +£119.99 · Mesh Metal Ottoman +£149.99 · Divan Ottoman Footend Lift +£189.99 · Divan Ottoman Side Lift +£189.99 | see table above | none | Yes ("£119.99 GBP" under the swatch) |
| Mattress Type | No Mattress (**default**), Memory Orthopedic, 1000 / 2000 / 3000 Pocket, Pillow Top | no | No Mattress | n/a |
| Mattress Size (shown per mattress type) | Memory 89.99 / 99.99 / 99.99 / 119.99 / 149.99 · 1000P 129.99 / 179.99 / 179.99 / 199.99 / 249.99 · 2000P 149.99 / **169.99** / 179.99 / 199.99 / 249.99 · 3000P 179.99 / 219.99 / 229.99 / 249.99 / 299.99 · Pillow Top 219.99 / 249.99 / 249.99 / 279.99 / 319.99 (3ft / 4ft / 4ft6 / 5ft / 6ft) | yes, once a mattress is chosen | none | yes (label always shown) |
| Delivery Service | Downstairs Drop Off £0 · Room of Choice Drop Off +£29.99 · Room of Choice Assembly +£69.99 | yes | **none** | yes (Stage 3 C10) |

The Shopify Size variant is always pre-selected on the first size (Single, or Small Double where there is no Single). On Line Ambassador, the Shopify Colour (12 values, Cream pre-selected, no price difference) duplicates the Easify colour (Stage 3 inv-2).

---

## 3. Pricing issues, quantified

### 3.1 Storage-named products whose headline excludes the storage (VERIFIED from config and `.js` prices)

Format: headline → with cheapest storage → with the storage the name or description describes.

| Product | Set / Base rule | Single | Small Double | Double | King | Super King | 90d landings (S2) |
|---|---|---|---|---|---|---|---|
| Line Bumper Ottoman Divan Bed – Gas Lift Storage Bed | 805903, base optional | 324.99 → 444.98 → 514.98 | 402.99 → 522.98 → 592.98 | 415.99 → 535.98 → **605.98** | 435.99 → 555.98 → 625.98 | 493.99 → 613.98 → 683.98 | 441 |
| Cloud Teddy Bouclé Ottoman Bed – Gas Lift Storage Bed | 805903, optional | 376.99 → 496.98 → 566.98 | 402.99 → 522.98 → 592.98 | 428.99 → 548.98 → 618.98 | 467.99 → 587.98 → 657.98 | 532.99 → 652.98 → 722.98 | 124 |
| Mayfair Ottoman Divan Bed – Gas Lift Storage Bed | 805903, optional | 337.99 → 457.98 → 527.98 | 415.99 → 535.98 → 605.98 | 441.99 → 561.98 → 631.98 | 467.99 → 587.98 → 657.98 | 519.99 → 639.98 → 709.98 | 28 |
| Side Lift Open Ottoman Bed – Gas Lift Storage Bed | 805903, optional | 415.99 → 535.98 → 605.98 | 454.99 → 574.98 → 644.98 | 493.99 → 613.98 → 683.98 | 532.99 → 652.98 → 722.98 | 636.99 → 756.98 → 826.98 | 11 |
| Mayfair Bumper Ottoman Storage Bed – Gas Lift | 805903, optional | 363.99 → 483.98 → 553.98 | 467.99 → 587.98 → 657.98 | 487.99 → 607.98 → 677.98 | 513.99 → 633.98 → 703.98 | 558.99 → 678.98 → 748.98 | 9 |
| Mayfair Ottoman Storage Bed – End-Opening Gas Lift | 805903, optional | 363.99 → 483.98 → 553.98 | 454.99 → 574.98 → 644.98 | 480.99 → 600.98 → 670.98 | 513.99 → 633.98 → 703.98 | 597.99 → 717.98 → 787.98 | 5 |
| Multi Mini Line Divan Ottoman Bed – Complete Divan Set | 805903, optional | 324.99 → 444.98 → 514.98 | 389.99 → 509.98 → 579.98 | 415.99 → 535.98 → 605.98 | 448.99 → 568.98 → 638.98 | 493.99 → 613.98 → 683.98 | 4 |
| Florida Ottoman Bed – Gas Lift Storage Bed | 805897, required but Slatted £0 | 357.99 → 477.98 → 547.98 | 454.99 → 574.98 → 644.98 | 467.99 → 587.98 → 657.98 | 519.99 → 639.98 → 709.98 | 623.99 → 743.98 → 813.98 | 6 |
| Bumper Ottoman Storage Bed – Gas Lift | 805897, required but Slatted £0 | 376.99 → 496.98 → 566.98 | 454.99 → 574.98 → 644.98 | 480.99 → 600.98 → 670.98 | 513.99 → 633.98 → 703.98 | 584.99 → 704.98 → 774.98 | 6 |
| 5 "Storage Bed with Drawers" divans (Grey Button-Tufted Platform, Oxford Wingback, Sussex Panel, Oxford Panel, Cambridge Panel) | 805896, "No Drawers" £0 orderable | 259.99 → 279.98 (1 drawer) → 299.98 (2) | 285.99 → 305.98 → 325.98 | 299.99 → 319.98 → 339.98 | 324.99 → 344.98 → 364.98 | 399.99 → 419.98 → 439.98 | small |
| Divan Storage Base with Drawers | 805896, same | 168.99 → 188.98 → 208.98 | 188.99 → 208.98 → 228.98 | 194.99 → 214.98 → 234.98 | 214.99 → 234.98 → 254.98 | 259.99 → 279.98 → 299.98 | n/a |
| **Ottoman Gas Lift Divan Base** | 808111, **included** | 220.99 | 253.99 | 272.99 | 305.99 | 363.99 | best seller |
| **Side Lift Ottoman Storage Base** | 808111, **included** | 249.99 | 274.99 | 284.99 | 334.99 | 394.99 | best seller |

- The store's own price for a storage base is inconsistent. The standalone **Side Lift Ottoman Storage Base, Double £284.99**, already includes fabric, upholstery and the gas-lift box. The **same "Divan Ottoman Side Lift" as an add-on to a headboard bed costs a flat £189.99 at every size**, Single to Super King. Whether £189.99 covers a Super King ottoman is UNKNOWN (no cost data). Owner question.
- **Evidence the risk is real, #1038** (Cloud Teddy Bouclé *Ottoman* Bed, King, Northern Ireland, £511.20 with £90 shipping): the order line carries `Base Type: Slatted Base`. The customer paid for an "ottoman bed" without an ottoman. Whether they expected one is UNKNOWN. **Owner should confirm with the workshop what is being built for #1038 before it ships** (internal check only; this report contacts no one).

### 3.2 Additional basket charges (VERIFIED)
- Every paid choice is added by Easify into the line price. Line price = variant + add-ons, and this matched the property amounts on all 21 configured lines checked.
- Shipping: £0 for Great Britain. **£90 shipping** was charged on #1038 (Northern Ireland, per the BRIEF rate) and appears only at checkout.
- No other surcharges. No compare-at prices.
- Discounts: 25 of 40 non-cancelled orders carry exactly 10% off (codes not analysed here).

### 3.3 Royal Chesterfield Super King < King (VERIFIED)
Super King £389.99 vs King £399.99 (and Standard Double £389.99). Royal Chesterfield **Wingback** has a normal ladder (King £359.99, Super King £399.99). Likely a typo for £429.99–£439.99: ESTIMATE, owner to set.

### 3.4 Size price ladder, whole catalogue (VERIFIED, `ladder.json` in scratchpad)

| Type | Product | Ladder (Single / SD / D / K / SK) |
|---|---|---|
| Larger cheaper | **Prism Geometric Bed** (`luxury-geometric-upholstered-bed`) | 429.99 / 489.99 / 504.99 / **444.99** / 634.99. King is £60 below Double, then +£190 to Super King |
| Larger cheaper | **Valentina Double Arch** | **419.99** / 389.99 / 409.99 / 439.99 / 469.99. Single dearer than Small Double and Double |
| Larger cheaper | Royal Chesterfield | 364.99 / 374.99 / 389.99 / 399.99 / **389.99** |
| Equal SD = D | Black Bumper (337.99), Florida Wingback (324.99), Gold V-Cross Line (454.99), Coca (454.99), 1000 Pocket mattress (233.99) | |
| Big first step (≥£78, ≥17%) | Mayfair Bumper Ottoman +£104 (29%), Florida Ottoman +£97 (27%), Mayfair Ottoman Gas Lift +£91 (25%), Line Bumper +£78 (24%), Mayfair Ottoman Divan +£78 (23%), Bumper Ottoman +£78 (21%), Stone +£78 (17%) | Single to Small Double |
| Big last step (≥£90) | Prism +£190, Side Lift Open Ottoman +£104, Florida Ottoman +£104, Black Piping / Eric / Romeo / Star / Oxygen +£91 | King to Super King |
| Easify mattress add-on | 2000 Pocket 4ft **£169.99** < 1000 Pocket 4ft £179.99. 4ft = 4ft6 on Memory, 1000 Pocket and Pillow Top | |
| Add-on vs standalone mattress (Double) | Memory Ortho add-on £99.99 vs product £194.99 · 1000 Pocket £179.99 vs £233.99 · 3000 Pocket £229.99 vs £259.99 · Pillow Top £249.99 vs £389.99 | Same mattress? UNKNOWN. A mattress buyer pays £30–£140 more on the mattress page than as a bed add-on |

### 3.5 Paid upgrades shown without a price (VERIFIED by render)
- **Stone Golden Strip +£19.99**: the image swatch has no label or price (13 strip-set beds). Bought on #1041.
- **Royal Diamond Button +£19.99**: swatch shows no label (25 button-set beds). Not yet bought (2 orders chose Matching).
- **60" headboard +£39.99**: the button reads `60"` only. This applies to 102 beds across the normal, button and strip sets; 60" also costs +£29.99 on the 4 tall-set beds. Bought on #1036 and #1043 (2 of 10 recent headboard-bed lines). The buyer learns the price only from the "Your selections will add an additional charge" line.
- On headboards: 60–90" (+£39.99 to +£99.99) and Divan "50" Floor Standing" +£19.99 use the same button style, so their price is likely hidden too. INFERRED from config, not rendered.

### 3.6 Mattress size not tied to bed size (VERIFIED, config)
Each mattress type opens its own "Mattress Size" picker with all 5 sizes. There is no condition on the Shopify Size, and nothing is pre-selected. In orders, 8 of 8 mattress add-ons matched the bed size (#1018, #1019, #1025, #1027, #1028, #1033, #1034, #1036; legacy lines included). So the risk is UNREALISED so far. The control is a checkbox with `multi_select: 0`; whether two sizes can be ticked is UNTESTED.

### 3.7 Running-total gap (VERIFIED, Stage 3 C2; Report 3.1 left it open)
The page price changes only with Size. Add-ons appear as one line, "Your selections will add an additional charge of £X GBP". The basket is the first place the real total appears. Size of the gap, from the examples in section 4: +25% to +141% over the shown size price.

---

## 4. Transparent price model and examples (top 9)

**Final configuration price = Shopify size price + Σ paid Easify options (headboard height, strip/button, base, mattress size) + delivery service (£0 / £29.99 / £69.99) + shipping (£0 Great Britain; £90 Northern Ireland, Jersey, Guernsey, Isle of Man) − discount code.** VAT-inclusive (VAT registration status UNKNOWN).

| Product | Example 1: minimum (required fields only) | Example 2: typical storage | Example 3: loaded |
|---|---|---|---|
| Ottoman Gas Lift Divan Base | Double £272.99 | Double + Memory 4ft6 £99.99 + Room of Choice Drop Off £29.99 = **£402.97** (+48%; = #1028) | King + 2000P 5ft £199.99 + Assembly £69.99 = **£575.97** (+88%) |
| Side Lift Ottoman Storage Base | Double £284.99 | Double + Assembly £69.99 = **£354.98** (+25%) | King + 1000P 5ft £199.99 + Assembly = **£604.97** (+81%) |
| Cloud Teddy Bouclé Ottoman | Double £428.99 (**no ottoman**) | Double + Metal Ottoman £119.99 = **£548.98** (+28%) | King + Footend Lift £189.99 + 1000P 5ft + Assembly = **£927.96** (+98%) |
| Line Bumper Ottoman | Double £415.99 (**no ottoman**) | Double + Footend Lift £189.99 = **£605.98** (+46%) | King + Footend + 1000P 5ft + Assembly = **£895.96** (+106%) |
| Line Ambassador | Double £389.99 | Double + Mesh Ottoman £149.99 + Room of Choice £29.99 = **£569.97** (+46%) | King + 60" £39.99 + Footend + 1000P 5ft + Assembly = **£928.95** (+117%) |
| Savoy Channel | Double £454.99 | King + Mesh Ottoman = **£634.98** (+31%) | King + Mesh + Pillow Top 5ft £279.99 + Assembly = **£984.96** (+103%; #1034 = £914.97 without assembly) |
| Royal Chesterfield | Double £389.99 (Slatted, Matching buttons) | Double + 60" + Metal Ottoman + Memory 4ft6 + Assembly = **£719.95** (+85%; #1036 = £699.95 at the old £49.99 assembly) | **Super King** + Diamond £19.99 + Footend + Assembly = **£669.96**. The same on a King = £679.96 (ladder bug) |
| Grand Extra-Tall | King £349.99 | King + 60" + Mesh Ottoman = **£539.97** (+54%; = #1043) | Super King + 60" + Footend + 1000P 6ft £249.99 + Assembly = **£939.95** (+141%) |
| Stone Premium | Double £558.99 (Silver strip) | Double + Golden Strip £19.99 + Metal Ottoman = **£698.97** (+25%) | King + Golden + 60" + Footend + 1000P 5ft + Assembly = **£1,117.94** (+87%) |

All add-on prices are from the live config (VERIFIED). Totals are arithmetic. Stage 3 confirmed that basket total = checkout total for 14 such baskets.

---

## 5. What customers actually buy (orders, VERIFIED; cancelled #1010, #1014, #1020 excluded; TEMU #1003 included as a mattress)

40 non-cancelled orders and 46 order lines: 35 bed lines (36 units), 6 mattress-only, and 1 storage box. Legacy orders up to #1018 used a separate "selections add-on" line; those are folded into their bed line here.

| Measure | All 35 bed lines | Since 18 Sep (current Easify, 21 lines) |
|---|---|---|
| Lines with a storage base (ottoman, drawers, or a storage-included base product) | 25 (71%) | 18 (86%) |
| Lines with a mattress add-on | 9 | 6 |
| Lines with paid delivery (Room of Choice) | 9 (7 assembly) | 7 |
| Mean shown size price (current) | £333.79 | £345.47 |
| **Mean configured line price** | **£435.78** | **£488.31** (+41%) |
| Mean "from" price of the same products | £280.10 | £285.04 |
| Median configured ÷ size price | 1.18 | 1.44 |

**Best sellers by configuration (since 18 Sep):**
- Ottoman Gas Lift Divan Base: 7 lines. 3 bare, 3 with a mattress (£402.97–£663.98), 1 with Room of Choice Drop Off.
- Side Lift Ottoman Storage Base: 4 lines. 3 bare (£274.99–£284.99), 1 with Assembly.
- Headboard beds, 10 lines:

| Order | Product | Configured | Shown size price |
|---|---|---|---|
| #1019 | Aurora Sunrise King + 1000P | £549.98 | £349.99 |
| #1025 | Elegant Vertical Small Double + Pillow Top + Assembly | £624.97 | £324.99 |
| #1026 | Regal Luxe Double + Footend Lift + Assembly | £578.97 | £338.99 |
| #1034 | Savoy King + Mesh + Pillow Top | £914.97 | £484.99 |
| #1036 | Royal Double + 60" + Metal Ottoman + Memory + Assembly | £699.95 | £389.99 |
| #1038 | Cloud Teddy King + **Slatted** | £467.99 | £467.99 |
| #1040 | Cloud Teddy King + Mesh | £617.98 | £467.99 |
| #1041 | Regal Gold Trim Super King + Golden Strip + Mesh | £559.97 | £389.99 |
| #1042 | Curved Wingback King + Footend + Assembly | £642.97 | £402.99 |
| #1043 | Grand King + 60" + Mesh | £539.97 | £349.99 |

**Reading:**
- Buyers of headboard beds overwhelmingly add a storage base. The **Mesh Metal Ottoman (+£149.99) is the most chosen base** (4 of 10).
- King is the most common size (6 of 10).
- Showing "from £X with ottoman base" would match what people actually buy. RECOMMENDATION.
- Historical: Side Lift base Small Double was £253.99 in Aug (#1004) and is £274.99 now; King was £305.99 (#1009) and is £334.99 now. Assembly was £49.99 on all orders to #1042 and is now £69.99 (owner, 19 Nov).

---

## 6. Recommended corrections (proposals only; owner approval required for every price, name or app change)

| # | Proposal | Products | Evidence | Expected effect / test |
|---|---|---|---|---|
| R1 | **Either** price the storage in (default price = cheapest true storage config, e.g. Line Bumper Double £535.98 or £605.98), **or** rename to "… Bed Frame (ottoman base optional)" and make Base Type required with no £0 default on ottoman-named beds. For "with Drawers" divans, remove "No Drawers" or drop "with Drawers" from the name | 9 ottoman-named beds + 6 drawer divans (§3.1) | §3.1, #1038 | Name, photo and price agree. Before/after 3–4 weeks: cart→checkout per landing (Stage 3 method) |
| R2 | Show "**from £X with ottoman base**" (Double + Metal Ottoman) under the price on headboard beds | all 805903/805897/803938 beds | §5: 86% of recent lines carry storage | Fewer basket surprises |
| R3 | **Running total** next to the main and sticky price (Easify total-price setting or theme snippet) | all | §3.7 | Basket = page price |
| R4 | Fix ladders: Royal Chesterfield SK; Prism Geometric King; Valentina Single; review SD = D on 5 products; 2000P 4ft mattress add-on | 3 + 5 + mattress | §3.3–3.4 | No larger size cheaper |
| R5 | Put the price in the label of hidden paid options: 60" (+£39.99), Golden Strip, Diamond Button, 50"/60" Floor Standing, 70–90" | 106 beds + headboards + divans | §3.5 | No hidden charges (consumer-law risk: hypothesis, not legal advice) |
| R6 | Tie mattress size to bed size (Easify condition per Shopify size, or pre-select the matching size) | all with mattresses | §3.6 | No wrong-size orders |
| R7 | Detach Grand Extra-Tall, Line Bumper and Arizona from the set that should not apply. For Grand, the tall set gives 70–90" options it advertises | 4 products | §1 line 11 | Grand shows its real headboard choices |
| R8 | Attach an option set (fabric, colour, delivery) to Aurora Luxury Vertical Panel, Vegas and Coca, or unpublish them | 3 | §1 line 1 | Orders specify fabric and delivery service |
| R9 | Decide one mattress price list (add-on vs standalone) | 6 mattresses | §3.4 | Consistent price signals |
| R10 | Owner to confirm whether the flat £189.99 Divan Ottoman lift is intended for all sizes | 116 beds | §3.1 | Margin protection (cost UNKNOWN) |

---

## 7. Inventory and supply (part 10)

### 7.1 Inventory per variant (VERIFIED, Admin GraphQL, 145 published products / 763 variants)

| Setting | Variants | Products |
|---|---|---|
| Tracked, policy CONTINUE (sell when out) | 454 | 82, plus Line Ambassador's 60 |
| Tracked, policy **DENY** | 241 | 49 (mostly the Aug–Oct "Regal/Aurora/Monarch" and headboard ranges, storage box, Royal, Savoy, Grand, Cambridge) |
| Not tracked (CONTINUE) | 68 | 13 + 1 mixed (Arizona, Black Bumper, Black Piping, Charlie, Curved Wingback, Eric, Florida Ottoman, Florida Wingback, Hilton, Indigo, Multi Mini Line Divan, 3 mattresses) |
| Quantity | 680 at 1,000; 22 at 999; 5 at 998; 2 at 997; 3 at 3,000; 1 at 12,000 | Placeholders. The small decrements equal units sold |
| Unavailable / out of stock | **0** | none |
| Compare-at price | **0** | none |
| Easify values disabled | **0** | none |

Reading: quantities are not real stock. Beds are made to order (BRIEF). The DENY policy on 241 variants would only bite if someone set a count to 0. RECOMMENDATION: one policy (untracked, or tracked + CONTINUE) for all made-to-order products, owner decision.

Admin also holds 42 ACTIVE products not published to the Online Store (21 divans "with storage", 13 kids beds, Soho Smart Ottoman and others) and 70 DRAFTs. Not on sale, so not in this pricing analysis.

### 7.2 Supplier and vendor fields
- Vendor = "Eagle Bed" on all 257 products. No cost per item was analysed here (Stage 2 C-fields: UNKNOWN).
- **Gmail: no supplier correspondence found** for fabric, foam, timber or plywood, mattresses, gas-lift mechanisms, price lists, pro formas, POs or lead times. The searches were material keywords plus "pro forma / purchase order / trade account / lead time / back order / out of stock / price increase", which returned 0 threads.
- The only logistics email is an unsolicited pitch from a two-man delivery firm (17 Nov, not answered here).

Supplier names, prices and lead times: **UNKNOWN**. They are probably handled by phone or WhatsApp. Owner to supply.

### 7.3 Lead times and delivery evidence

| Evidence | Finding | Label |
|---|---|---|
| BRIEF promise | Usually 3–5 working days, own team | owner fact |
| Order → "fulfilled" | Median 2.7 h; 31 of 42 within 6 h; max 99 h (#1022 storage box, DPD) | VERIFIED. "Fulfilled" = accepted, not dispatched |
| Tracking | Only 2 of 42 have tracking: #1003 (TEMU mattress, EVRI) and #1022 (storage box, DPD). No bed has tracking | VERIFIED |
| "Delivered" timestamps | 28 fulfilments marked delivered on just 3 dates (25 Sep 11:45 ×16, 19 Oct 14:37 ×3, 3 Nov 11:41 ×9). These are bulk "mark as delivered" actions, not real delivery days | VERIFIED (pattern) |
| #1038 (Mon 9 Nov, NI) | Customer chased on 15 Nov; told "this Tuesday" (17 Nov) = 8 days / 6 working days. Actual delivery UNKNOWN | VERIFIED (email) |
| #1040 (Fri 13 Nov) | Customer chased on 18 Nov citing "3–5 days"; told "this Saturday" (21 Nov) = 8 days / 5 working days + Saturday | VERIFIED (email) |
| Observed lead time | Order to promised delivery about 8 calendar days in both chased cases. True average UNKNOWN (no delivery dates recorded) | ESTIMATE |

### 7.4 Cancelled and delayed orders

| Order | Product | Status | Reason recorded | Note |
|---|---|---|---|---|
| #1010 | Ottoman Gas Lift Divan Base King | Cancelled 25 Sep, payment EXPIRED, marked fulfilled + "delivered" 19 Oct | CUSTOMER | Stage 1/2 open item |
| #1014 | Side Lift Ottoman Base Small Double + Memory mattress (legacy add-on) | Cancelled 25 Sep, EXPIRED, fulfilled + "delivered" 19 Oct | CUSTOMER | as above |
| #1020 | Ottoman Gas Lift Divan Base Small Double + Assembly | Cancelled the same day, still PAID, refunds failed (Stage 2: £273.59) | CUSTOMER | P0 money item (owner) |

No supply-related cancellation reason is recorded. Delays seen in email: #1038 and #1040, both on Cloud Teddy Bouclé.

### 7.5 Products with demand but availability or configuration problems

| Product | Demand (S2, 90d landings / carts) | Problem |
|---|---|---|
| Line Bumper Ottoman | 441 / 28, 0 orders | Ottoman not in price; also attached to the tall set |
| Cloud Teddy Bouclé | 124 / 16, 2 orders | Ottoman optional (#1038 without); both orders chased for delay |
| Grand Extra-Tall | 116 / 17, 1 order (#1043) | Tall-headboard options configured but not shown |
| Aurora Luxury Vertical Panel | 12 / 2 (2 reached checkout) | **No Easify options**: no fabric, colour or delivery choice |
| Vegas / Coca | 14 / 0; 5 / 0 | No Easify options |
| Upholstered Ottoman Storage Box | 27 / 1, 1 order | No fabric or colour choice; DENY policy |

No product is out of stock or unavailable in Shopify.

---

## Limitations
- Easify rendering was checked live on 7 pages plus Stage 3's 7. The rule "higher set id wins when two sets are attached" is inferred from 3 cases. Arizona's rendered set is UNVERIFIED.
- Price visibility for headboard-set and drawer-set paid heights is inferred from the shared button style, not rendered.
- Configured order prices use **today's** size prices. Two Side Lift base orders were placed at older, lower prices (noted).
- Order-line analysis read Admin GraphQL directly; `order-lines.csv` did not exist when this ran. Cart and checkout counts come from Stage 2 `product-intel.json` (session-level).
- Real delivery dates, supplier names, material costs, lead times and margins are UNKNOWN. Nothing here is a cost or margin claim.
- "Hidden price" consumer-law implications are a hypothesis, not legal advice.

## Credits used
- **OpenRush: 0.**
- Shopify Admin GraphQL: 5 read-only queries (products ×3 pages, Line Ambassador variants, orders ×43). 1 query was rejected for using a deprecated field. No mutations.
- Public storefront: `/products.json` (1 fetch) and 1 product page HTML (Easify config).
- Playwright (iPhone 13): about 10 page loads on 7 products. 6 failed on a proxy tunnel error and were retried one at a time.
- Gmail (read-only): 4 searches, 2 threads read. No drafts, labels or sends.
- Files written: `ops/rocket/stage4/03-pricing-config-inventory.md` and `ops/rocket/stage4/config-prices.csv`. Scratch evidence is in the session scratchpad `s4p/` (`sets.json`, `orders.json`, `basket.json`, `ladder.json`, `admin_all.json`, `render.json`, scripts).
