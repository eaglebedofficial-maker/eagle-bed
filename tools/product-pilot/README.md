# Product Pilot v2

Amazon research suite for Eagle Bed: a Chrome extension that reads Amazon directly, plus the Product Pilot artifact on claude.ai.

## Pieces

- `extension/`: Chrome extension (Manifest V3). Load it unpacked from `chrome://extensions`, or use `dist/product-pilot-extension-v2.zip`.
  - **X-Ray** on search and Best Sellers pages: BSR, est. sales (rank model + Amazon "bought in past month" badge), revenue, FBA fee, net, sellers, niche score, market analysis, keywords, CSV, load pages 2–3.
  - **Product card and panel** on product pages: profit calculator, price history (CamelCamelCamel chart, Keepa with your API key), reviews, listing grade, keyword rank check, sourcing.
  - **Studio** (`studio.html`): product research database, keyword research (live Amazon autocomplete A–Z + page-1 analysis), reverse ASIN, index checker, daily product and keyword-rank trackers with desktop alerts, profit calculator, listing builder, review analyzer, settings and backup.
- `artifact/`: source of the Product Pilot artifact. `python3 artifact/build.py` builds `artifact/product-pilot.html` (engine inlined, extension zip embedded for download) and `dist/product-pilot-extension-v2.zip`.
- `extension/engine.js`: shared engine (marketplaces, sales model, US/UK/EU FBA and referral fees, profit, scores, Amazon parsers, Keepa decoding).
- `tests/`: Playwright tests that run the extension and the artifact against Amazon-like fixture pages (`node tests/ext-test.js <outdir>`, `node tests/artifact-test.js <outdir>`).

## What is real and what is estimated

Read straight from Amazon: price, rating, reviews, BSR and category, "bought in past month" badge, seller and fulfilment, offers, variations, size and weight, images, A+, organic and sponsored positions, autocomplete suggestions.
Estimated (as in every paid tool): monthly sales from BSR, revenue, FBA fees (2025 published tiers, approximate), keyword demand.
Not possible without Amazon seller APIs: refund recovery, review-request automation, live PPC management, follow-up emails.
