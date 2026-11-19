# Stage 3, Parts 11–12: Competitor UX benchmark and conversion experiments (19 Nov 2026)

Roles: Market Research, Competitor Spy, Store Designer/CRO, Analytics.
Read-only. Nothing was changed in Shopify, the theme, ads, email or prices.
Screenshot prefix: `comp`. Evidence folder: `ops/rocket/stage3/shots/`.

Labels used: **VERIFIED** (seen today by me), **HISTORICAL** (search-index copy of a competitor's own page, crawl date unknown), **ESTIMATE**, **UNKNOWN**, **RECOMMENDATION**.

---

## 0. How this was done (read first)

| Step | Result | Label |
|---|---|---|
| curl to pascalbeds.co.uk, stylobeds.com, bedwick.co.uk, ukbedsdirect.com, somnibeds.co.uk, dunelm.com (19 Nov, ~13:10 UTC) | All failed (HTTP 000, proxy tunnel refused) | VERIFIED |
| Playwright Chromium to PSCL, Stylo, Bedwick, Dunelm | All `net::ERR_TUNNEL_CONNECTION_FAILED` | VERIFIED |
| OpenRush `inspect_page` on the PSCL ottoman base page (UK) | Returns ranking data only (0 keywords, 0 traffic). It does **not** return page content or layout, so it cannot benchmark UX. I stopped after 1 call. | VERIFIED |
| WebSearch (19 searches) restricted to each competitor's own domain | Gave short summaries of their own product, FAQ and collection pages | HISTORICAL |
| Eagle Bed: public `/products/<handle>.json` + one Playwright iPhone 13 pass on 2 product pages | Today's facts below | VERIFIED |

**What this means.** I could not see any competitor page with my own eyes. Things you can only judge by looking (photo order, mobile layout, sticky buttons, basket and checkout) are **UNKNOWN** for competitors. The benchmark below only holds what their indexed page text says. A 15-minute manual check on a real phone (section 3) would fill the gaps at no cost.

**Sandbox caveat (from COMMON-BRIEF).** My test browser blocks some third-party scripts. In it, the Line Bumper page was 712 px wide on a 390 px phone and the photo was pushed right (`shots/comp-eagle-line-bumper-ottoman-divan-bed-mobile.jpg`). The owner's own iPhone shows the page fits. So I treat the overflow as **UNVERIFIED (sandbox only)** and do not build an experiment on it.

---

## 1. Competitor UX benchmark: king ottoman / gas-lift product page

Date of record: 19 Nov 2026. All competitor cells are HISTORICAL (their own indexed page text) unless marked UNKNOWN.

### 1.1 Pages benchmarked

| # | Seller | Page used (URL) | Why chosen |
|---|---|---|---|
| A | **Eagle Bed** (VERIFIED) | https://www.eaglebed.co.uk/products/ottoman-gas-lift-divan-base and /products/line-bumper-ottoman-divan-bed | Top landing product and the high-traffic, zero-sale product |
| B | PSCL Beds | https://pascalbeds.co.uk/product/ottoman-storage-end-lift-divan-bed-base/ and /product/milan-wingback-bed/ | Closest Yorkshire rival, 5.0 Trustpilot |
| C | Stylo Beds | https://www.stylobeds.com/products/nova-modern-ottoman-storage-bed and /collections/ottoman-beds | West Yorkshire maker, page 1 for "ottoman bed uk" |
| D | Bedwick | https://bedwick.co.uk/ and /tools/bed-size-room-fit-calculator | Bradford maker, #4 for "ottoman bed uk" |
| E | UK Beds Direct | https://ukbedsdirect.com/products/madison-ottoman-bed and /products/fabric-samples-best-fabric-available-at-ukbeds | Handmade-to-order online seller |
| F | Somni Beds | https://somnibeds.co.uk/products/aeroline-round-corner-wingback-bed-somni-beds-b103 and /pages/faqs | #1 for "ottoman bed uk" |
| G | Dunelm | https://www.dunelm.com/product/side-lift-ottoman-bedstead-1000088788 and /product/side-lift-ottoman-bed-frame-faux-leather-1000242984 | Big high-street benchmark |

### 1.2 Side-by-side

| Element | Eagle Bed (VERIFIED today) | PSCL | Stylo | Bedwick | UK Beds Direct | Somni | Dunelm |
|---|---|---|---|---|---|---|---|
| **Title visible above price** | **No.** H1 is `rgb(255,255,255)` on white on both pages tested today | UNKNOWN (title text uses "2026 … Bed®" naming) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| **Photo count** | Divan Base 4; Line Bumper 8; Cloud Teddy 6; Side Lift storage bed 15 (from product JSON) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | ~7 on a comparable ottoman ("zoom image position 1 of 7", Ariana Chenille) |
| **Lifestyle vs cut-out** | Lifestyle room renders; last image on every bed is a shared fabric guide | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| **Storage-open shot** | Yes on Divan Base (image 2 alt "open storage") and Line Bumper (image 2, lid up) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| **Dimensions / size diagram** | Divan Base: cm in description. Line Bumper and Cloud Teddy: **no cm figures** on page | Size guide per size (e.g. Milan king 211 × 162 cm, headboard 122 cm) and base height by base type (25 / 30 / 33 cm) | Guide content: storage 25–30 cm deep, 60 cm walkway, room width for a king | Room-fit calculator tool | Dimensions on product page (varied by model) | "Dimensions" section present; max mattress weight 60 kg on another page | Full dims incl. **storage area** (150 × 198 cm) and storage height 23 cm |
| **3D / colour preview** | **Yes:** "Photos / 3D colour preview" and "See it in your colour" (VERIFIED screenshot) | Fabric-and-colour pages per fabric | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| **Description structure** | Intro, Key features, Sizes with prices, Materials & build, accordions (Delivery, returns & warranty) | Long page with FAQs, reviews, size guide | Product + guide links | UNKNOWN | FAQ-style blocks | Feature list + Dimensions | Spec table + assembly PDF |
| **Size selection** | Size buttons (5 sizes), price updates with size | UNKNOWN | **Headline price is the single size;** king adds £89.99 | UNKNOWN | UNKNOWN | 5 sizes | Price range by size (£191.20–£271.20 one listing) |
| **Fabric / swatch** | Easify picker; colour group also titled "Fabric Type" (Stage 1 #7); free swatches mentioned in text, no swatch button | Free fabric samples (reviewer mentions samples before buying) | Fabrics listed; swatches UNKNOWN | "Custom fabrics & free swatches" | **Swatches £3.99 each**, sold as a product, dispatched in 7–10 working days | Velvet, chenille, linen, plush | Fixed colours, no swatches |
| **Base / storage option** | On "Storage Bed" listings, Base Type defaults to **slatted (no storage)**; lift-up base +£119.99 to +£189.99 (Stage 1 #5) | "Optional Ottoman Storage" stated **in the product name** | Gas-lift included ("kings from £359.98 with gas-lift base") | Slatted or solid ottoman (Stage 1) | "Optional ottoman" on some models | "Optional storage" | Storage built in |
| **Delivery promise** | "Free delivery across Great Britain … by our own team", 3–5 working days; PDP timeline showed a Sunday (Stage 1 #12) | Free standard 5–10 working days; paid "Rapid" range | Free UK mainland **7–10 working days**; some areas £69 | Free to England, Wales & Ireland; time UNKNOWN | Free; **7–14 working days** | Free ex NI; can delay up to 6 months | Large-item fee unless over threshold |
| **Assembly** | Optional Room of Choice Assembly **+£69.99** by own team, shown as a delivery option | Paid extra; a reviewer mentions the crew assembled in 10 min and a video guide | UNKNOWN | UNKNOWN | Self-assembly, "two people" | **Flat-pack, self-assembly** | **"Flat Pack (Full Assembly Required)"** stated; reviews: two people, ~2 hours |
| **Reviews near title** | **No stars.** "Product reviews (0) · Store reviews (1)"; 2 product reviews across 145 products | On-page stars: Milan **4.95 from 399**; ottoman base 5.00 from 3; Trustpilot ~2,276 | **"4.9/5 from 1800+ customers"** on page | None found | 3 reviews on Madison; Trustpilot 4.5 / 37 | 3 homepage testimonials | 4.5 / 44 and 4.3 / 158 on comparable models |
| **Finance** | "Klarna or Clearpay at checkout" text (Clearpay **not** confirmed: 0 Clearpay orders) | "From £21/month" (Klarna / Zopa) near price | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| **Price display** | No "was" prices, no countdowns (good) | Strike-through "£249, was £400" | Single-size headline price | UNKNOWN | Sale vs "reg" prices | "Sale £399, reg £567" | Price range |
| **Contact on PDP** | `tel:` link; Chat bubble; **no wa.me link** (VERIFIED today) | WhatsApp + 0800 number (Stage 1) | Contact page | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| **Mobile experience** | Owner's iPhone: page fits. Sandbox: overflow (UNVERIFIED) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| **Basket / checkout** | Basket lists every option and correct total (£857.96 test); Shopify one-page checkout; phone required | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### 1.3 What the benchmark tells us

1. **Eagle Bed's offer is stronger than its page shows** (VERIFIED own facts vs HISTORICAL rivals). It is the only one of the seven with all three: free GB delivery by its own team, 3–5 working days, and an optional assembly service. Stylo says 7–10 days, UK Beds Direct 7–14, PSCL 5–10. Somni and Dunelm ship flat-pack for self-assembly.
2. **Eagle Bed's swatches are free** (BRIEF). UK Beds Direct charges £3.99 each. But Eagle shows no swatch button.
3. **Eagle Bed already has a 3D colour preview.** I found no rival mentioning one. It is worth keeping and making obvious.
4. **Biggest gaps: reviews and clarity.** Rivals show stars and counts near the title (PSCL 399 on one bed, Stylo "1800+"). Eagle shows none, and its title is invisible.
5. **Rivals state storage facts plainly.** Dunelm gives storage area and depth. PSCL gives base height by base type. Eagle's Line Bumper and Cloud Teddy pages give no cm figures.
6. **Rivals say "optional ottoman storage" in the name** when storage costs extra. Eagle's "… Gas Lift Storage Bed" names default to a slatted base. Eagle should be at least as clear.
7. **Price tactics to avoid.** PSCL, UK Beds Direct and Somni use "was / reg" prices. Under the DMCC Act 2024 and CMA pricing guidance, reference prices need evidence. Eagle has 0 compare-at prices today (Stage 1). Keep it that way.

### 1.4 Ideas Eagle Bed can use (no copying)

Every idea uses Eagle's own facts (ops/BRIEF.md) and generic e-commerce patterns. None copies a rival's layout, wording, names, photos or "®/™" styling.

| # | Idea | Seen at | Eagle version (RECOMMENDATION) | Claim check |
|---|---|---|---|---|
| I1 | Size and storage facts on the page | Dunelm, PSCL | Add a short "Size and storage" table per bed: outside size, base height, storage depth, lift direction, opening space needed. **Owner measures. No invented numbers.** | Only owner-measured cm |
| I2 | Plain "storage is optional" wording | PSCL | If storage is an add-on, say so in the name and next to the price (see X2) | Price truth |
| I3 | Swatch request button | UKBD (paid), Bedwick | "Order free fabric swatches" button next to the fabric picker | BRIEF: free swatches |
| I4 | Stars and count near the title | PSCL, Stylo, Dunelm | Show Judge.me stars next to the title **only once real reviews exist** (see X5) | Never fake or seeded reviews |
| I5 | Room-fit help | Bedwick, Stylo | Short "Will it fit?" note: the owner's measured footprint plus "check the lid can open". Link to an existing size guide | No invented specs |
| I6 | Assembly made clear | Dunelm, Somni (flat-pack) | Near the price: "Optional Room of Choice Assembly by our own team, +£69.99". Never "free assembly" | BRIEF: +£69.99, never free |
| I7 | Delivery speed made concrete | Stylo, UKBD (slower) | "Usually 3–5 working days by our own team" with a working-day estimate (X8). Do not compare to named rivals on the page | BRIEF wording |
| I8 | Monthly-payment message | PSCL | Use **Klarna's own on-site messaging widget only**. It handles the regulated wording. Do not write "0%", "interest-free" or Clearpay | BRIEF bans 0%/interest-free; Clearpay unconfirmed |
| I9 | Make the 3D preview obvious | (Eagle only) | Keep it. Test it in usability round 1 (do people find and use it?) | – |

---

## 2. Conversion experiment programme (Part 12)

### 2.1 Baselines (VERIFIED, Stage 2 §8, UK human sessions, 20 Oct – 19 Nov 2026)

| Segment | Sessions | Carts | Checkouts | Completed (tracked) | Rate used in maths |
|---|---|---|---|---|---|
| UK human, all | 1,373 | 166 | 45 | 12 | session→order 0.874%; session→cart 12.09%; cart→checkout 27.1%; checkout→done 26.7% |
| Mobile (human, all countries) | 1,213 (81% of 1,504) | 139 | 36 | 11 | session→order 0.91% |
| Desktop (human) | 271 | 38 | 21 | 1 | checkout→done 4.8% (1/21) |
| Paid (google/cpc) | 861 | 93 | 15 | 6 | session→cart 10.8%; cart→checkout 16.1%; session→order 0.70% |
| Product-page landings | 1,007 | 123 | 30 | 7 | session→cart 12.2% |
| Line Bumper landings (30 days) | 82 | 13 | – | 0 | 90 days: 441 landings, 28 carts, 2 checkouts, 0 sales |

### 2.2 Sample-size maths (why classic A/B tests will not work here)

Standard two-proportion test, two-sided alpha 0.05 (z = 1.960), power 0.80 (z = 0.842):

n per arm = [ 1.960·√(2·p̄(1−p̄)) + 0.842·√(p₁(1−p₁) + p₂(1−p₂)) ]² / (p₂ − p₁)²,  where p̄ = (p₁ + p₂)/2.

**MDE is not a forecast.** The 20% / 50% / 100% columns are *minimum detectable effects*: the smallest change a test could reliably see. They are not predicted uplifts. I make no uplift claim for any experiment.

**Worked example (orders per UK session).** p₁ = 12/1,373 = 0.00874. To detect a 50% relative change, p₂ = 0.01311, p̄ = 0.01092.
- 1.960 × √(2 × 0.01092 × 0.98908) = 0.2881
- 0.842 × √(0.00874 × 0.99126 + 0.01311 × 0.98689) = 0.1237
- (0.2881 + 0.1237)² = 0.1696; (p₂ − p₁)² = 0.00437² = 0.0000191
- n = 0.1696 / 0.0000191 ≈ **8,882 sessions per arm, 17,764 in total**
- At 1,373 UK sessions per 30 days: 17,764 / 1,373 × 30 ≈ **388 days**.

| Metric (baseline) | Traffic per 30 days (denominator) | MDE 20%: total n · days | MDE 50%: total n · days | MDE 100%: total n · days |
|---|---|---|---|---|
| UK session → order (0.874%) | 1,373 sessions | 97,834 · ~2,138 d (5.9 y) | 17,764 · ~388 d | 5,316 · ~116 d |
| Mobile session → order (0.91%) | 1,213 | 94,256 · ~2,331 d | 17,112 · ~423 d | 5,122 · ~127 d |
| Paid session → order (0.70%) | 861 | 122,944 · ~4,284 d (11.7 y) | 22,328 · ~778 d | 6,686 · ~233 d |
| UK session → cart (12.09%) | 1,373 | 6,190 · ~135 d | 1,100 · ~24 d | 318 · ~7 d |
| Product landing → cart (12.2%) | 1,007 | – | 1,088 · ~32 d | 314 · ~9 d |
| Mobile session → cart (11.46%) | 1,213 | 6,584 · ~163 d | 1,172 · ~29 d | 338 · ~8 d |
| UK cart → checkout (27.1%) | 166 carts | 2,234 · ~404 d | 382 · ~69 d | 102 · ~18 d |
| Paid cart → checkout (16.1%) | 93 carts | 4,402 · ~1,420 d | 776 · ~250 d | 220 · ~71 d |
| UK checkout → order (26.7%) | 45 checkouts | 2,286 · ~1,524 d | 392 · ~261 d | 104 · ~69 d |
| Desktop checkout → order (4.8%) | 21 checkouts | 17,180 · ~67 y | 3,098 · ~12 y | 916 · ~3.6 y |
| Line Bumper landing → cart (15.9%) | 82 | – | 792 · ~290 d | 226 · ~83 d |

(Days = total n ÷ monthly denominator × 30, with a 50/50 split. Computed with the formula above; ESTIMATE only in that traffic will vary.)

**Reading the table.**
- An A/B test on **orders** needs 4 months even to detect a doubling, and over a year for a 50% change. Not practical.
- **Add-to-cart** is the only metric with enough volume: about 1 month for a 50% change, about 1 week for a doubling.
- Shopify does not split traffic natively. A split test needs a third-party app (cost, extra script weight on already-heavy pages: Stage 1 #10).
- So: most items below are **fixes to ship and monitor**, not tests. Usability tests find problems; monitored rollouts check for harm.

### 2.3 Prioritised programme

Type: **FIX** = removes a verified defect or claim risk; ship after owner approval, then monitor. **VALIDATE** = test with 5 users first, then roll out and monitor. **INVESTIGATE** = find the cause before changing anything.
Priority uses evidence strength, reach (share of sessions affected), effort and risk. It does **not** use guessed uplift.

| Rank | ID | Change | Type | Evidence | Reach | Complexity |
|---|---|---|---|---|---|---|
| 1 | X1 | Make the product title visible | FIX | VERIFIED today: H1 white on white on 2 more PDPs | All PDP sessions (1,007 landings per 30 days) | Very low (1 CSS rule) |
| 2 | X2 | Honest storage-base price on "Storage Bed" listings | FIX | VERIFIED Stage 1 #5 | Storage-bed PDPs | Medium (owner price decision) |
| 3 | X11 | Finance wording matches checkout (Clearpay) | FIX | VERIFIED: "Clearpay" still on PDPs today; 0 of 43 orders used it | All PDPs + cart | Low |
| 4 | X3 | Mobile sticky "Add to basket" works on bed pages | VALIDATE on real phones | Stage 1 #2 (sandbox); owner phone shows page fits; sticky state UNKNOWN | 81% of sessions | Low–Medium |
| 5 | X4 | Running total near price + basket shows options and total incl. delivery/assembly | VALIDATE | Stage 1 #6; paid cart→checkout only 16.1% | All bed PDPs, cart | Medium (Easify/theme) |
| 6 | X8 | Delivery date estimate in working days | FIX | Stage 1 #12 (showed a Sunday) | All PDPs | Low (owner gives make time) |
| 7 | X6 | Free swatch CTA by the fabric picker | VALIDATE | BRIEF (free swatches); rivals charge or show it | Bed PDPs | Low |
| 8 | X7 | "Ask about this bed" WhatsApp link | VALIDATE | VERIFIED today: no wa.me link | All PDPs | Low |
| 9 | X12 | Size and storage facts block (owner-measured) | VALIDATE | VERIFIED: no cm on Line Bumper, Cloud Teddy | Ottoman PDPs | Medium (owner measures) |
| 10 | X9 | Line Bumper intent check and fix | INVESTIGATE | 441 landings, 28 carts, 0 sales (90 d) | 1 product, ~82 landings/30 d | Low (read Ads search terms) |
| 11 | X5 | Real reviews, then stars near the title | FIX (collection) then VALIDATE | 2 reviews across 145 products | All PDPs | Low (Judge.me requests) |
| 12 | X10 | Desktop checkout friction diagnosis | INVESTIGATE | 21 desktop checkouts, 1 order | 271 desktop sessions | Low (read data) |

### 2.4 Experiment cards

Common guardrails for every card (pre-registered, check weekly): (a) UK human checkout→order rate does not fall below **15%** over any rolling 4-week window (baseline 26.7%, P30 was 15.4%); (b) no rise in customer messages about price surprise or wrong options; (c) no new console/theme errors and mobile LCP not worse on a real phone; (d) refunds/returns not above the 90-day level (2 refunds ever, none since 21 Aug). Rollback for all theme items: keep the unchanged theme as a saved copy; the owner republishes it (minutes).

**X1. Visible product title**
- Hypothesis: shoppers who cannot see the bed name above the price are less sure they are on the right bed, especially from ads that named it.
- Pages: all PDPs and /cart heading. Audience: all, both devices.
- Baseline: H1 `rgb(255,255,255)` on white (VERIFIED today, Line Bumper and Divan Base). Product landing→cart 12.2%.
- Change: set the title colour to the theme's dark ink (Stage 1 #3).
- Primary: product landing→cart. Secondary: WCAG contrast pass; bounce on PDP.
- Sample size: none needed. It is an accessibility defect (WCAG 1.4.3). Ship and monitor 4 weeks.
- Duration: 4 weeks monitor. Complexity: very low. Rollback: revert one CSS line.

**X2. Honest storage-base price display**
- Hypothesis: shoppers on a "Gas Lift Storage Bed" page expect storage in the shown price. A +£119.99 to +£189.99 add-on found late causes doubt or wrong orders.
- Pages: Cloud Teddy, Savoy, Side Lift and any listing named "storage" whose Base Type defaults to slatted. Audience: all; paid traffic most (cart→checkout 16.1%).
- Baseline: VERIFIED Stage 1 #5 (King Teddy £467.99 shown; with Metal Ottoman £587.98 before mattress/assembly).
- Change (owner chooses): (a) make the ottoman base the default and show that price, or (b) rename to "… with optional ottoman storage" and make Base Type required, with the add-on price shown next to the main price.
- Primary: cart→checkout on these PDPs' sessions. Secondary: share of storage-bed orders with a lift-up base; customer messages about price.
- Guardrails: common set + session→cart on these PDPs not down by more than half over 4 weeks (a higher shown price may cut carts; that can be correct).
- Sample size: cart→checkout at 50% MDE needs 382 carts (~69 days site-wide). Too slow per product. Treat as a compliance FIX (CMA drip-pricing risk). Monitor 8 weeks.
- Complexity: medium. Rollback: restore option defaults / title.

**X3. Mobile sticky Add to basket on bed pages**
- Hypothesis: on long bed pages, a reachable Add to basket button helps mobile shoppers who have finished choosing options.
- Pages: bed PDPs. Audience: mobile (81% of sessions).
- Baseline: mobile session→cart 11.46%; sticky bar never activated on 3 bed pages in the sandbox (Stage 1 #2, UNVERIFIED on real phones).
- Change: first, check on 2 real phones (owner's iPhone + an Android) whether the sticky bar appears after scrolling. Fix only if it does not.
- Primary: mobile product landing→cart. Secondary: taps on sticky button (needs an event, Stage 2 E1).
- Sample size: 50% MDE ~29 days at mobile volume; a doubling ~8 days. A before/after check of 4 weeks is enough to spot harm, not to prove a gain.
- Complexity: low–medium. Rollback: hide the bar with one setting.

**X4. Running total + basket clarity**
- Hypothesis: shoppers who see the full price (bed + base + mattress + delivery service) before the basket are less surprised at the basket, so more carts reach checkout.
- Pages: bed PDPs, /cart. Audience: all, paid first.
- Baseline: price only moves with size; add-ons show as "additional charge of £X" under the options (Stage 1 #6). UK cart→checkout 27.1%; paid 16.1%. The basket already lists every option and the correct line total (good).
- Change: show "Total: £X" next to the main price and in the sticky bar. In the basket, add one line: "Delivery service: Downstairs (free) / Room of Choice +£29.99 / Assembly +£69.99" as chosen, and "Delivery: free in Great Britain".
- Primary: cart→checkout. Secondary: session→cart (may dip if totals look high: that is honest).
- Sample size: 50% MDE needs 382 carts ≈ 69 days. Run as usability round 2 then a monitored rollout.
- Complexity: medium (Easify/theme). Rollback: turn the block off.

**X5. Real reviews, then stars near the title**
- Hypothesis: for a £300–£900 purchase from a small brand, visible genuine reviews reduce doubt.
- Pages: all PDPs. Audience: all.
- Baseline: 2 product reviews across 145 products (VERIFIED Stage 1 §16); no stars near title (VERIFIED today).
- Change: step 1, turn on Judge.me review requests to past buyers (owner approval; consented email only). Step 2, once a product has real reviews, show stars + count next to the title. Never show empty stars or a "0 reviews" badge near the price. Never seed, buy or import reviews from elsewhere.
- Primary: product landing→cart on products with reviews vs before. Secondary: review count growth.
- Sample size: not testable now (too few reviewed products). Monitor.
- Complexity: low. Rollback: hide the badge.

**X6. Free swatch CTA**
- Hypothesis: shoppers unsure about colour will order a free swatch instead of leaving, and come back to buy.
- Pages: bed PDPs, next to the fabric picker. Audience: all, mobile first.
- Baseline: swatches mentioned in text only; swatch requests not tracked (UNKNOWN count).
- Change: "Order free fabric swatches" button that opens the existing swatch route (owner to name it: form, WhatsApp or email).
- Primary: swatch requests per 100 bed-PDP sessions (needs an event). Secondary: orders from swatch requesters within 30 days (match by order note, no personal data in reports).
- Guardrail: product landing→cart not down by more than 30% over 4 weeks (the swatch path may delay some purchases).
- Sample size: none for the button itself; track counts.
- Complexity: low. Rollback: remove the button.

**X7. "Ask about this bed" WhatsApp link**
- Hypothesis: mobile shoppers with a question (size, fabric, delivery day) buy more often if they can ask quickly.
- Pages: all PDPs under Add to basket; /cart. Audience: mobile.
- Baseline: no wa.me link (VERIFIED today); WhatsApp clicks unmeasured (Stage 2 E8).
- Change: `https://wa.me/447417439197?text=Hi, I have a question about the <product title>` with "Mon–Fri 9–6".
- Primary: WhatsApp clicks per 100 PDP sessions. Secondary: orders following a chat (owner logs "came via WhatsApp" on the order, no personal data in reports).
- Guardrail: owner reply time within business hours stays under 2 hours (owner capacity).
- Complexity: low. Rollback: remove the link.

**X8. Delivery date estimate**
- Hypothesis: a believable date range builds trust; a range that shows a Sunday or a next-day "ready" date breaks it.
- Pages: all PDPs. Audience: all.
- Baseline: timeline showed Sun–Tue on a Thursday (Stage 1 #12).
- Change: working days only, owner's real make time, worded "usually delivered between <date> and <date>". Keep "usually 3–5 working days" wording from BRIEF.
- Primary: complaint/chaser messages about delivery dates. Secondary: product landing→cart.
- Sample size: none; it is an accuracy fix. Monitor 4 weeks.
- Complexity: low. Rollback: revert snippet.

**X9. Line Bumper intent check and fix**
- Hypothesis (UNVERIFIED): some Line Bumper visitors want something else (for example a kids or single bed, given the "Line" name shared with the kids beds), so they add to basket, see the price or size, and leave. The images show an adult room setting (VERIFIED: image 2 is a king-style bed in a bedroom).
- Pages: /products/line-bumper-ottoman-divan-bed. Audience: paid Shopping/PMax visitors.
- Baseline: 441 landings, 28 carts, 2 checkouts, 0 sales in 90 days; 82 landings, 13 carts last 30 days (VERIFIED Stage 2).
- Change: **investigate first.** Read the Google Ads search terms and Shopping product report for this product (read-only). If kids/single searches dominate, the fix is in ads (negatives, feed title) and on-page cross-links to the kids range, not a page redesign. If not, run a 5-user walk-through of this page.
- Primary: Line Bumper cart→checkout. Secondary: ad cost per Line Bumper landing.
- Sample size: landing→cart at 50% MDE ~290 days on this one page. Untestable; use the investigation.
- Complexity: low (read data). Rollback: n/a (ads changes are reversible in Ads).

**X10. Desktop checkout friction**
- Hypothesis: desktop checkouts fail for a specific reason (bots/probes, 3-D Secure card failure, the required phone field, or shipping surprise), not general design.
- Pages: checkout. Audience: desktop.
- Baseline: 21 desktop checkouts → 1 order (4.8%) vs mobile 36 → 11 (Stage 2 §8.2). 4 of the last 16 orders had a failed first card attempt (Stage 1 §16).
- Change: investigate before changing: abandoned checkouts by device and step (Shopify read-only), payment failures, repeat attempts. Then consider better help text on the phone field ("Our own delivery team calls you to book a day").
- Primary: desktop checkout→order. Secondary: abandoned checkouts with a later order by the same customer (Stage 1 §6.1 C).
- Sample size: a 50% change needs ~12 years at desktop volume. Investigation only.
- Complexity: low. Rollback: n/a.

**X11. Finance wording matches checkout**
- Hypothesis: a shopper who expects Clearpay and does not find it may leave at the last step; it is also a misleading-claim risk.
- Pages: PDPs, cart, announcement bar, BRIEF. Audience: all.
- Baseline: "Klarna or Clearpay" text on PDPs today (VERIFIED); Clearpay not at checkout; 0 Clearpay orders.
- Change: owner confirms in Settings → Payments. If off, remove "Clearpay" everywhere. Optionally add Klarna's own messaging widget (I8).
- Primary: checkout→order. Secondary: share of Klarna orders.
- Sample size: none; compliance fix.
- Complexity: low. Rollback: n/a (accuracy).

**X12. Size and storage facts block**
- Hypothesis: shoppers buying a bed online worry about fit and storage space. Clear measured facts reduce that worry and questions.
- Pages: ottoman and storage PDPs, starting with Line Bumper, Cloud Teddy, Side Lift, Divan Base. Audience: all.
- Baseline: Line Bumper and Cloud Teddy show no cm figures (VERIFIED today).
- Change: owner-measured table per size: outside length/width, headboard height, base height, storage depth, lift direction. Optional simple line drawing (Eagle's own, not a rival's).
- Primary: product landing→cart on those PDPs. Secondary: pre-sale questions about size.
- Guardrail: every number measured by the owner; no "storage capacity" or materials claims beyond BRIEF.
- Sample size: page-level, too slow (see table). Usability round + monitor.
- Complexity: medium (owner measures). Rollback: hide block.

### 2.5 The practical method for low volume

**Step 1. Ship the four FIX items first (X1, X2, X11, X8).** They remove verified defects or claim risks. Testing them would mean keeping a known problem live for months.

**Step 2. Staged usability tests, 5 users per round.**
- Who: 5 people who match buyers (UK adults planning to buy a bed in the next 3 months; mostly on their own phone). Recruit friends-of-friends or past enquirers who agree; pay a small voucher. Not staff or family.
- Task script (15 min each, remote video call, phone screen shared): "Find a king-size ottoman bed in grey velvet with storage and assembly. Tell me the total price and when it would arrive. Add it to the basket and go to checkout, but stop before typing your details."
- Record: task success (yes/no), time, every hesitation, and their stated total vs the real total.
- Round 1: current site (baseline problems). Round 2: after X1/X2/X4/X8. Round 3: after X6/X7/X12.
- Stop rule: fix any problem seen by 2 or more of 5 users before the next round.

**Step 3. Before/after monitored rollouts with pre-registered guardrails.**
- Before each change, write down in `ops/rocket/stage3/` (one line): change, date, primary metric, its 4-week baseline, guardrails. Log it as a change annotation.
- Compare 4 weeks after vs 4 weeks before, UK human sessions only, same metric definitions as Stage 2 §8. Also show paid vs non-paid separately, because ad budget changes move the mix.
- Ship one change per area at a time where possible, at least 2 weeks apart, so effects are not mixed up.

**Step 4. Session recording (only if the owner approves).**
- Tool: e.g. Microsoft Clarity (free) or Shopify-compatible equivalent. It must load **only after analytics consent** through the store's cookie banner (PECR / UK GDPR). Mask all text inputs. It never runs on checkout (Shopify blocks it). Update the privacy policy. Delete recordings after 90 days.
- Use: watch 20–30 mobile bed-page sessions per fortnight for rage taps, option confusion, sticky bar use. No customer personal data leaves the tool or goes into reports.

**Step 5. Decision rule (pre-registered).**
- **Keep** a change if: (a) the usability round shows the task problem it targets is gone (0–1 of 5 users hit it), and (b) no guardrail is breached over 4 weeks.
- **Roll back** if any guardrail is breached in 2 weekly checks in a row, or a usability round shows the change caused a new problem for 2+ of 5 users.
- **Do not claim a win** from before/after numbers alone. With 12 orders a month, a change in orders of a few either way is noise. Report "no harm seen" or "harm seen", not "uplift of X%".
- **Run a true A/B test only** on add-to-cart, only if a split-test app is approved, and only when the change is reversible and not a compliance fix (for example two wordings of the swatch button). Use the table in 2.2 for duration.

### 2.6 Measurement needed first (from Stage 2 §11)

| Needed for | Event | Status |
|---|---|---|
| X3, X4, X6, X12 | Product option selected; sticky button tap; swatch button click | VERIFIED missing (Stage 2 E1) |
| X7 | WhatsApp click | VERIFIED missing (Stage 2 E8) |
| X10 | Checkout step by device, payment failure | Readable in Shopify (read-only) |
| All | Change log with dates | RECOMMENDATION: one line per change |

---

## 3. Next manual check (no credits, 15 minutes)

Owner or Manager on a real phone, today's date written down: open each URL in 1.1 and note (1) title visible above price, (2) photo count and whether one shows the storage open, (3) dimensions shown, (4) stars and count near the title, (5) delivery days and assembly price, (6) finance line, (7) whether a sticky Add to basket appears. This fills every UNKNOWN in table 1.2.

---

## Limitations

- **No competitor page was seen directly.** curl and Playwright were blocked for all six domains; OpenRush `inspect_page` returns ranking data, not page content. Competitor facts are search-index summaries of their own pages (HISTORICAL, crawl date unknown). Prices, review counts and delivery times may have changed.
- Competitor photography, mobile layout, sticky buttons, basket and checkout are UNKNOWN.
- Eagle Bed checks today used a sandbox browser that blocks some third-party scripts. The overflow seen (Line Bumper 712 px) is UNVERIFIED; the owner's iPhone shows the page fits. The white title is confirmed by computed CSS, and the owner's screenshot did not clearly show it either.
- Funnel numbers are 30-day Shopify session data (Stage 2). Tracked completions (12) are fewer than orders (16).
- Sample sizes assume steady traffic and a 50/50 split; real traffic varies with ad spend and season (Black Friday).
- The Line Bumper kids-intent idea is a hypothesis. No search-term data was read in this task.
- No uplift percentages are claimed anywhere. MDE columns are detection limits, not forecasts.
- Profit impact: UNKNOWN (product costs not known).

## Credits used

| Call | Cost |
|---|---|
| OpenRush `inspect_page` https://pascalbeds.co.uk/product/ottoman-storage-end-lift-divan-bed-base/ (UK) | 4 (rate stated in the task brief; the tool response does not print a cost) |
| **Total OpenRush** | **4 of 12 allowed** |

Other sources (no credits): 19 WebSearch queries; curl and Playwright attempts (blocked); Eagle Bed public `/products/*.json`; one Playwright iPhone 13 pass on 2 Eagle PDPs. Screenshots saved: `ops/rocket/stage3/shots/comp-eagle-line-bumper-ottoman-divan-bed-mobile.jpg` (17 KB) and `ops/rocket/stage3/shots/comp-eagle-ottoman-gas-lift-divan-base-mobile.jpg` (22 KB). No competitor screenshots were possible (sites blocked).
