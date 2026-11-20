# Pack B: compliance wording scan (P-prep, 20 Nov 2026)

## Count summary

Scope: read-only Shopify GraphQL scan on 20 Nov 2026 of all 257 products (187 active, 70 draft: title, descriptionHtml, SEO title, SEO description), all 80 pages (title, body) and all 26 collections (title, descriptionHtml, SEO). HTML was stripped before matching. Nothing was changed.

| Phrase | Matches (all) | Matches on live content | Items affected (all / live) | Risk |
|---|---|---|---|---|
| Clearpay | 346 | 256 | 308 / 226 | HIGH legal (OWNER DECISION) |
| orthop(aedic) | 132 | 115 | 104 / 94 | 10 HIGH legal on live content (descriptive claims); the rest MED (references to the product name "Memory Orthopaedic Mattress") |
| mainland | 90 | 6 | 78 / 6 | MED trust (84 of the 90 are on draft products or hidden pages) |
| best | 19 | 17 | 17 / 15 | LOW ("suits ... best", "Best for" table headers; none is a superiority claim) |
| hotel | 10 | 0 | 6 / 0 | LOW ("hotel-style" design wording on 6 DRAFT products; not a supplier claim) |
| Batley | 4 | 3 | 2 / 1 | HIGH on the published page beds-west-yorkshire (owner hard rule); LOW on 1 hidden internal page |
| medical | 2 | 2 | 1 / 1 | LOW (a "not a medical device" disclaimer on the Memory Orthopaedic Mattress) |
| sleep trial | 1 | 1 | 1 / 1 | LOW (the FAQ answers "No", then explains 14-day free returns) |
| assembly included | 1 | 1 | 1 / 1 | LOW (general buyer advice, not an Eagle Bed claim) |
| leading, award, No.1, number one, DivideBuy, 0%, interest free, free assembly, fire retardant / fire safe / BS 7177 / crib 5, two-man, back pain | 0 | 0 | 0 | none found |
| 07xxx numbers other than 07417 439197 | 0 | 0 | 0 | none found |
| **Total** | **605 rows** | **401 rows** | **315 items / 228 live** | |

Risk split across all rows: 269 HIGH legal (live), 97 HIGH legal (not live now), 203 MED trust, 36 LOW.

## What drives the pack

1. **Clearpay (346 rows).** The same template sentences appear on 198 live product rows plus pages and collections ("Pay in instalments with Klarna or Clearpay at checkout." 121x, "Spread the cost with Klarna or Clearpay at checkout." 98x). The published `finance-options` page has a whole Clearpay section. Every Clearpay row says OWNER DECISION. If the owner confirms Clearpay is NOT live, the fix is to drop "or Clearpay" / "and Clearpay" and delete the Clearpay section of finance-options. If it is live, no change is needed. This is one decision that fixes 346 rows.
2. **"Memory Orthopaedic Mattress" (product name).** 99 live product rows cross-link to it ("Browse our mattresses, such as the Memory Orthopaedic Mattress"). These text changes depend on the owner renaming the product, which is already a Stage 6 BLOCKED item. Ten live rows go further and make a descriptive claim ("orthopaedic support core", "What is an orthopaedic mattress?", "Orthopaedic: a firmer, more supportive feel" on the mattresses collection). Those can change now to "firm", which is the product's own live SEO wording.
3. **"mainland" (90 rows).** 67 rows are one sentence on draft products: "Free delivery to mainland UK addresses by our own team...". Only 6 rows are on active products. The fix is "across England, Scotland and Wales" or "across Great Britain".
4. **Batley.** The published page `/pages/beds-west-yorkshire` names Batley 3 times (heading "Beds in Batley and Mirfield"). Fix: remove the town and keep Mirfield.

## Outside the requested phrases (for the owner, not in the CSV)

- "solid wood frames" appears on 117 active products, 14 collections and 2 published pages. Stage 6 flagged this as a material claim that needs owner confirmation.
- Blog articles were not in scope. Several article titles contain "best" (e.g. `how-to-choose-the-best-bed-in-the-uk-2026-buying-guide`), and one is titled "...vs Orthopaedic". Scan them in a later pass.

## Files

- `pack-B-compliance.csv`: one row per match. Columns: id, type, handle, field, phrase, snippet (≤140 chars), proposed_fix, risk, visibility (live / not live). Sorted HIGH, then MED, then LOW.
