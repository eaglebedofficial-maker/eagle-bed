# SEO fixes, 10 Nov 2026 (theme copy "Eagle Bed SEO fixes 10 Nov - PUBLISH", id 212418724171)

Unpublished copy of the live theme "Eagle Bed PageSpeed fix 9 Nov - PUBLISH" (212291486027, MAIN). The live theme was not touched. The owner publishes the copy.

Preview: https://www.eaglebed.co.uk/?preview_theme_id=212418724171
Product example: https://www.eaglebed.co.uk/products/luxury-fluted-velvet-upholstered-bed-frame?preview_theme_id=212418724171

Originals are in `original/`. The uploaded versions are in `new/` (same paths as in the theme).

## Changes

1. **snippets/meta-tags.liquid**
   - Added `<meta name="robots" content="max-image-preview:large">` just above `og:site_name` (all pages).
   - Organization JSON-LD (home page only, as before): added `"alternateName": ["EagleBed", "Eagle Bed Dewsbury"]`.
   - sameAs unchanged. YouTube was **not** added: no channel URL exists in the repo or theme settings (`social_youtube_link` is empty; the repo only has video links like youtube.com/watch?v=0L9VMgCpw-Y, not the channel address). Owner: copy the channel URL from YouTube Studio, then add it.
   - Home page only: og:title, og:description, twitter:title and twitter:description now use the shop SEO metafields (see item 4).
2. **"mainland" changed to "Great Britain"** (BRIEF bans "mainland"):
   - `sections/eb3d-product.liquid`: the delivery timeline footnote ("Free delivery within 3–5 working days across Great Britain."). **This text was showing on every live product page.** Also changed the defaults for trust_2 and tab_1.
   - `snippets/eagle-delivery-timeline.liquid`: the default footnote.
   - `templates/collection.json`: the collection header badge stat_3 ("Free delivery across Great Britain"). **This was showing on every collection page.**
   - Schema defaults only (not shown today, changed so they cannot come back): `sections/eb3d-cart.liquid` (delivery_label; cart.json already said "Free across Great Britain"), `sections/eb3d-collection.liquid` (stat_3), `sections/eagle-usps-section.liquid`, `sections/eagle-delivery-timeline.liquid`, `sections/eagle-timeline-section.liquid`, `sections/eagle-product-benefits.liquid`, `snippets/eagle-product-usps.liquid`.
   - config/settings_data.json, the other templates/*.json, header/footer groups and locales/en.default*.json have no "mainland". Old GemPages/Dawn files (gp-section-*, main-product) were not used by any template and have no "mainland" either.
3. **Product page video** (`sections/eb3d-product.liquid`, the section used by templates/product.json):
   - Under the photos and thumbnails, every product media item of type `video` (Shopify `video_tag`: controls, muted, playsinline, `preload: 'none'`, 1400px poster) or `external_video` (`external_video_tag`, lazy) is shown in a rounded box styled like the main photo stage. The thumbnail strip and its JavaScript are unchanged, so the main photo stays the first media item and the LCP image.
   - VideoObject JSON-LD, output **only** when the product has a Shopify-hosted video (`media_type == 'video'`): name = product title; description = product description, HTML stripped, truncated to 300 characters (falls back to the title if empty); thumbnailUrl = the video preview image (1280px, https); uploadDate = `product.published_at | date: '%Y-%m-%d'`; contentUrl = the largest mp4 source (https). YouTube/Vimeo videos are shown but get no VideoObject (there is no mp4 source).
   - No product has video media yet, so nothing shows until the owner attaches one (see ops/seo-types/video.md, section 4).
4. **Home page title and meta description** (coordinator request, owner approved) in `layout/theme.liquid`:
   - On the index template, if `shop.metafields.global.title_tag` is not blank, the `<title>` is exactly that value (no " – Eagle Bed" suffix). Same for `shop.metafields.global.description_tag` and the meta description. Other pages keep the old logic.
   - Current values: title "Eagle Bed | Handmade Upholstered Beds from Dewsbury"; description "Eagle Bed makes upholstered beds by hand in our Dewsbury workshop. Free Great Britain delivery by our own team, 14-day free returns and a 5-year warranty." The live home page title today is "Eagle Bed UK | Luxury Handmade Upholstered Beds".

## Checks (10 Nov)

- All 12 changed files were read back from the copy and are byte-for-byte the same as `new/`. Liquid tags are balanced in all 11 .liquid files; collection.json is valid JSON.
- The preview pages return 200 and run on the copy (Shopify.theme id 212418724171): product page, home page, /collections/upholstered-beds and /cart.
- Every page has `max-image-preview:large`. None has "Liquid error", "Liquid syntax error" or "mainland".
- Home page: alternateName is present; `<title>`, meta description, og:title, og:description and twitter:title show the metafield values.
- Product page: the timeline footnote says "across Great Britain"; there is no VideoObject and no video box (correct, as the product has no video). **alternateName is not on the product page.** That is by design: the Organization node is output on the home page only, and other pages only carry the FurnitureStore node.
- Product page title and description are unchanged.

## Not done / for the owner

- YouTube in sameAs: needs the real channel URL.
- Publish the copy in Shopify admin (Online Store > Themes). Any theme-editor changes made to the live theme after 10 Nov will not be in this copy.
- Side note, not changed: the eagle-product-benefits section default says "satisfaction guarantee", which is not in BRIEF. The section is not used by any template.
