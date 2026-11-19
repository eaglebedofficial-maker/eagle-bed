# CRO fixes, 19 Nov 2026 (theme copy "Eagle Bed CRO fixes 19 Nov - PUBLISH", id 213270004043)

Owner approval: 19 Nov 2026, "Fix the website" (Rocket Stage 3, group A: A1-A5).
Unpublished copy of the live theme. The live theme was **not** touched (its layout/theme.liquid checksum is unchanged: 72573e6235196be3559e14ce444dfb9a). The owner publishes the copy.

| | Theme | ID | Role |
|---|---|---|---|
| Original (live today) | Eagle Bed SEO fixes 10 Nov - PUBLISH | 212418724171 | MAIN |
| New copy (this work) | Eagle Bed CRO fixes 19 Nov - PUBLISH | 213270004043 | UNPUBLISHED |

Made with Admin GraphQL `themeDuplicate` (19 Nov 2026, ~14:45 UTC), files written with `themeFilesUpsert` (unpublished theme only). Theme slots now 16 of 20.

Preview: https://www.eaglebed.co.uk/?preview_theme_id=213270004043
Product example: https://www.eaglebed.co.uk/products/side-lift-open-ottoman-bed?preview_theme_id=213270004043

## Files

| File | Change | before/ | after/ |
|---|---|---|---|
| layout/theme.liquid | 3 lines added after `base.css` (comment + CSS link + deferred JS) | yes (md5 72573e62...) | yes (md5 09c8d905...) |
| assets/eb-cro-fixes-19nov.css | NEW file (all CSS fixes, one marked block) | (did not exist) | yes |
| assets/eb-cro-fixes-19nov.js | NEW file (sticky bar timing + sticky tap) | (did not exist) | yes |

Checksums of all 3 files read back from the copy match `after/` byte for byte. No other theme file, product, price, app setting, checkout or payment setting was changed. No copy (text) was changed.

## Publish (owner)

Shopify admin > Online Store > Themes > find "Eagle Bed CRO fixes 19 Nov - PUBLISH" > "..." or Publish > Publish.
Check first on your own iPhone: https://www.eaglebed.co.uk/products/side-lift-open-ottoman-bed?preview_theme_id=213270004043
Note: any theme-editor change made to the live theme after 19 Nov 14:45 UTC is not in the copy.

## Roll back

Shopify admin > Online Store > Themes > "Eagle Bed SEO fixes 10 Nov - PUBLISH" (212418724171) > Publish. About a minute. Then open the home page and one product page on a phone.
Partial undo inside the copy: delete the 3 added lines in layout/theme.liquid (or restore `before/layout/theme.liquid`).

Full results: REPORT.md. Screenshots: shots/ (before-* = live theme, after-* = this copy).
