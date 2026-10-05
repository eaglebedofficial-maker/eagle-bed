# Eagle Bed — Digital Showroom Blueprint (ABBAS 3D theme)

Theme: **ABBAS 3D** (`gid://shopify/OnlineStoreTheme/209282236747`, unpublished, Dawn 15 base + the `eb3d` layer).
Store: EAGLE BED, www.eaglebed.co.uk, GBP, Shopify Basic.
Verified business facts (from the store, used in every piece of copy):
handmade to order in Dewsbury, West Yorkshire (Pepproyd Street, WF13 1PA) · free delivery to mainland UK by our own team, usually in 3–5 working days ·
5-year warranty · solid wood frames · Klarna and Clearpay · free fabric swatches · 07417 439197 · Instagram, TikTok and Facebook.
Nothing in the theme claims years of trading, certifications or reviews that the store hasn't supplied.

---

## 0. Audit findings that drive the design

| # | Finding | Impact | Fix in this theme |
|---|---------|--------|-------------------|
| 1 | `layout/theme.liquid` (the **live** theme too, same checksum) is missing `<html lang>`, puts an empty `<link rel="canonical" href="">` **before** `<head>`, and preloads `section.settings.image` (always blank in the layout). | Google sees malformed head, conflicting canonicals and a wasted preload on every URL. A likely contributor to the organic decline. | Layout rewritten: one canonical inside `<head>`, `lang`, a hero preload only on the homepage, Organization/WebSite/SearchAction schema. |
| 2 | `eb3d-product` outputs **no Product JSON-LD**. | No price/stock/rating rich results in Google or free Shopping listings enhancement. | `sr-schema` snippet: Product + Offer (per variant) + AggregateRating (from Judge.me `reviews.*` metafields only when present) + BreadcrumbList. |
| 3 | Collections and articles have no BreadcrumbList / Article / FAQ schema. | Missed rich results. | Added through `sr-schema` + FAQ sections. |
| 4 | Header shows "TODAY'S SUMMER SALE — ENDS IN" countdown in October, plus a permanent 50% compare-at price on every product. | Looks cheap. A permanent "was" price and a looping countdown carry risk under the UK DMCC Act 2024 / CMA pricing guidance. | Countdown disabled in ABBAS 3D. A calm announcement bar now leads with delivery, handmade and bespoke. Compare-at prices are **flagged to the owner**, not changed. |
| 5 | 77% of sessions are mobile. Mobile: 2,679 sessions → 65 add-to-carts → 12 checkouts → 2 orders (30 days). | The mobile funnel is the biggest revenue leak. | Thumb-zone sticky buy bar, a lighter page, bespoke/WhatsApp/phone paths, and delivery and finance answers above the fold. |
| 6 | Google organic sessions fell 674 → 486 → 332 per week (14 Sep → 28 Sep). Shopify records just 1 "paid" session in 60 days. | Either Google Ads clicks lack auto-tagging (so they count as organic), or ad spend dropped. Either way the real organic baseline is unknown. | Analytics layer (`sr-analytics.js`) and an owner checklist: turn on auto-tagging in Google Ads, check GSC → Pages/Indexing. |
| 7 | Bot referrers (`vivoooo`, `appleeee`, `oneplussss`, `mercanacar` …) | Inflate sessions, crush conversion rate. | Ignore them when reading reports. Check Shopify bot protection. |
| 8 | 44 thin "Beds delivered to {City}" pages (3 published) and duplicate blog posts (ottoman-vs-divan ×2, wingback ×3, velvet ×2). | Doorway-page and cannibalisation risk. | The SEO plan merges and redirects these (see `docs/02-organic-growth-plan.md`). |

---

## 1. Sitemap

```
/                                   Homepage: digital showroom
/collections/all-beds (upholstered-beds)  All beds hub
  /collections/wingback-beds        Style collections (33)
  /collections/chesterfield-beds    (13)
  /collections/panel-beds           (23)
  /collections/ottoman-beds         Storage (37)
  /collections/divan-ottoman-beds   (35)
  /collections/divan-beds           (31)
  /collections/storage-beds         (59)
  /collections/storage-beds-with-drawers (12)
  /collections/kids-beds            (18)
  /collections/headboards           (17)
  /collections/best-sellers · /collections/new-trending
/collections/mattresses             Mattress hub (6) + quiz
/products/{handle}                  Product page (eb3d-product + showroom extras)
/pages/bespoke-beds-uk              Bespoke landing + quote form   [template page.bespoke]
/pages/mattress-guide               Quiz + firmness guide          [template page.mattress-guide]
/pages/bed-size-guide               Size guide                      [template page.size-guide]
/pages/about-us                     Brand story                     [template page.about]
/pages/delivery-information · /pages/returns-policy · /pages/warranty · /pages/faq [page.faq]
/pages/contact · /pages/request-a-swatch · /pages/finance-options
/pages/reviews                      Judge.me all-reviews + real homes [page.reviews]
/blogs/news/{article}               Buying guides (31 → ~22 after merges)
/search · /cart · /account · /404
/policies/privacy-policy · /policies/terms-of-service · /policies/refund-policy
```
Wishlist: none is installed. The card heart saves items to `localStorage` and links to `/pages/wishlist` (an optional page with the `page.wishlist` template), so customers never hit a dead end.

## 2. Information architecture

Primary nav (desktop mega, mobile drawer):
**Beds** (by style · by storage · by size) · **Storage beds** · **Mattresses** · **Headboards** · **Kids** · **Bespoke** · **Help** (delivery, returns, size guide, finance, contact).
Every product sits in one *style* collection and one *function* collection. Breadcrumbs follow the style collection.
Guides link down to collections. Collections link across to guides (the `sr-collection-guide` section). Products link back up to their collection and across to the bespoke page.

## 3. Homepage wireframe (mobile-first order)

```
[Announcement: Free UK mainland delivery · Handmade in West Yorkshire · Bespoke sizes & fabrics]
[Header: logo · search · basket · menu]
1  HERO (sr-hero)        Cinematic bedroom image, parallax depth layers, slow light sweep
                         H1 "Beds made around you"  ·  sub  ·  [Shop beds] [Shop mattresses]
                         link: Design your bespoke bed →   ·  chips: Free UK delivery / Handmade / 5-yr warranty
2  TRUST STRIP (sr-trust)  4 animated line icons
3  CATEGORIES (sr-categories)  Tilting image tiles: Wingback · Chesterfield · Ottoman · Divan · Panel · Kids · Headboards · Mattresses
4  DESIGN YOUR DREAM BED (sr-configurator)  Live SVG bed: size / style / fabric / colour / headboard / storage / mattress
                         → "Shop beds like this" + "Send this design for a quote"
5  BEST SELLERS (sr-products)  premium cards
6  WE MAKE YOUR IDEA (sr-process)  5-step scroll story, progress line draws as you scroll
7  HAVE YOUR OWN DESIGN? (sr-bespoke)  Quote form (full form on the bespoke page)
8  FIND YOUR MATTRESS (sr-mattress-quiz)  6 questions → recommended mattresses (live prices)
9  REAL HOMES (sr-gallery)  Customer photos (hidden until the merchant adds images)
10 REVIEWS (sr-reviews)  Judge.me carousel app block (real data only)
11 GUIDES (sr-guides)  Latest buying guides
12 FAQ (sr-faq) + FAQPage schema
13 EXPERT HELP (sr-help)  "Not sure what to choose?" → phone / WhatsApp / form
[Footer]
```

## 4. Product-page wireframe

```
breadcrumb
[gallery: big image, thumbs, zoom, 3D colour preview]   [title · rating · price · was (only if real)
                                                          Klarna/Clearpay line
                                                          SIZE pills
                                                          bcpo app options (fabric, colour, headboard, storage)
                                                          delivery timeline: Ordered → Ready → Delivered (dates)
                                                          qty · ADD TO BASKET · Buy now
                                                          ✦ Request a bespoke version (pre-fills the quote form)
                                                          trust icons · accordions]
SHOWROOM EXTRAS (sr-pdp-extras): delivery estimate · size guide (dimensions table) · "Complete your bed" mattress picks
FAQ for this product type (+ FAQPage schema) · Reviews (Judge.me) · More from collection
mobile: sticky price + add-to-basket bar in the thumb zone
```

## 5. Bespoke-bed journey

Entry points: hero link · configurator "send this design" · PDP "Request a bespoke version" · nav "Bespoke" · footer.
→ `/pages/bespoke-beds-uk#quote` → the form is pre-filled from the configurator or the product (sessionStorage + URL params)
→ fields: name, email, phone, bed type, size (incl. custom), colour, material, headboard, storage, mattress, budget, details
→ inspiration images: Shopify's native contact form can't upload files, so after sending, the thank-you state offers **"Send your photos"** by email (`mailto:` pre-filled with the reference) or WhatsApp (if a number is set in the theme settings). This works on every plan with no app.
→ the submission arrives as a Shopify contact email to eaglebedofficial@gmail.com. It fires `bespoke_submit` (dataLayer + Shopify customer event) for GA4/Meta/TikTok.
Upgrade path: install a form app with file upload and drop its app block into the `sr-bespoke` section.

## 6. Mattress-selection journey

Collection hub or homepage → quiz (size → firmness → position → feel → partner → construction) → score each of the 6 real mattresses (attributes set as section blocks) → top 2 with live price for the chosen size, plus "why it fits" → product page. `quiz_complete` event.

## 7. Design system

Tokens on `:root` (`assets/sr-showroom.css`):
- Radius 4 / 10 / 18 / 999 · spacing scale 4-8-12-16-24-32-48-72-112 · max width 1360px · 16px mobile gutter
- Elevation: `--sr-shadow-1` (cards), `--sr-shadow-2` (hover), `--sr-shadow-3` (drawers)
- Components: `sr-btn` (solid / ghost / link), `sr-chip`, `sr-card`, `sr-kicker`, `sr-h1/h2`, `sr-field`, `sr-pill`, `sr-swatch`, `sr-acc` (accordion)

## 8. Typography

- Display: **Bodoni Moda** (already the brand face on PDP titles) at 500–700, tight tracking, for H1/H2 only
- Text: **Manrope** 400/500/700, for UI and body copy (16px base on mobile, 1.6 line height)
- Scale (clamp): H1 40→76px · H2 30→52px · H3 20→26px · body 16→17px · small 13px · kicker 12px uppercase +0.18em
- Loaded from Google Fonts with `display=swap` and preconnect. Only the weights we use.

## 9. Colour

| Token | Hex | Use |
|---|---|---|
| `--sr-ivory` | #F7F3EE | page background (warm, never pure white) |
| `--sr-linen` | #EDE5DA | alternate sections |
| `--sr-ink` | #17151A | text, primary buttons |
| `--sr-graphite` | #4A4650 | secondary text (7.9:1 on ivory) |
| `--sr-plum` | #6B2350 | brand accent (evolved from the existing #7f285b), links, focus |
| `--sr-brass` | #B48A52 | fine details, stars, rules (decorative only, never text on ivory) |
| `--sr-night` | #121015 | cinematic dark sections |
| `--sr-success` | #2F6B4F | delivery and stock messages |

All text pairs pass WCAG AA. Dark sections use ivory text on night (17:1).

## 10. Animation system

- One IntersectionObserver (`sr-showroom.js`) adds `.is-in` to `[data-sr-reveal]`. CSS handles fade/rise/clip reveals with staggered `--sr-i` delays.
- Hero: pointer-driven parallax on 3 layers (transform only, rAF-throttled) plus a CSS light sweep. Scroll parallax uses `transform: translate3d`.
- Process story: the progress line is a scaleY transform tied to scroll position. Steps light up in turn.
- Cards: a second image cross-fades, the image scales to 1.04, the CTA rises and the swatches stagger.
- Configurator: SVG attribute and CSS variable transitions (colour 400ms, width 500ms, ottoman lift 700ms).
- Everything is **transform/opacity only**, so it runs on the GPU and never triggers layout. `prefers-reduced-motion: reduce` turns off parallax, sweeps and reveals, and content shows immediately.

## 11. Component architecture (new files, all prefixed `sr-`)

```
layout/theme.liquid                  (fixed + tokens + fonts + schema + analytics)
assets/sr-showroom.css               design system + all sections (~30KB, one request)
assets/sr-showroom.js                reveal, parallax, carousel, wishlist, analytics, tilt
assets/sr-configurator.js            loaded only where the configurator section exists
assets/sr-quiz.js                    loaded only where the quiz exists
snippets/sr-schema.liquid            Organization, WebSite, Product, Breadcrumb, Article
snippets/sr-card.liquid              premium product card
snippets/sr-icon.liquid              line-icon set (truck, spool, shield, card, ruler, chat, star, heart, check …)
snippets/sr-bed-svg.liquid           parametric bed illustration used by the configurator
sections/sr-announcement · sr-hero · sr-trust · sr-categories · sr-configurator · sr-products ·
         sr-process · sr-bespoke · sr-mattress-quiz · sr-gallery · sr-reviews · sr-guides ·
         sr-faq · sr-help · sr-pdp-extras · sr-collection-guide · sr-page-hero · sr-size-guide ·
         sr-404 · sr-rich
templates/index.json, product.json, collection.json, cart.json, 404.json,
          page.bespoke.json, page.mattress-guide.json, page.size-guide.json, page.about.json,
          page.faq.json, page.reviews.json, page.wishlist.json
```
The existing `eb3d-*` sections (header, product, collection, cart, footer) stay, because they already work with the bcpo options app and Judge.me. The showroom layer wraps around them.

## 12. SEO architecture

- **Technical:** valid head, one canonical, `lang="en-GB"`, unique titles/descriptions (pagination and tag suffixes kept), hero preload on the homepage only, lazy images below the fold, width/height on every image (CLS), noindex on `/search`.
- **Structured data:** Organization (+ sameAs socials, contact point), WebSite + SearchAction, Product + Offer + AggregateRating (real metafields only), BreadcrumbList (product, collection, article), Article (blog), FAQPage (FAQ sections).
- **Hubs → spokes:** /collections/upholstered-beds (Beds UK) → style/storage/size collections → products. Mattress hub → 6 products. Guides link to collections with descriptive anchors.
- **Collection copy:** the `sr-collection-guide` section shows buying advice, FAQs and links per collection (blocks filtered by collection handle), so each collection page has unique, useful content below the grid.
- **Landing-page rule:** a page exists only with unique copy, a product grid, FAQs and internal links. City pages are consolidated, not multiplied.

## 13. Conversion strategy (every page answers the 9 questions)

| Question | Where it is answered |
|---|---|
| What is it? | H1 + kicker + product type |
| How much? | Price next to the title, finance line under it, per-size price in the quiz and cards |
| What sizes? | Size pills first, plus a size guide table on the PDP |
| Can I customise? | bcpo options + "Request a bespoke version" on every PDP, bespoke section on the home and collection pages |
| When will it arrive? | Delivery timeline with real dates (3–5 working days) |
| Is delivery free? | Announcement bar, PDP trust row, cart line, footer |
| Can I trust you? | Workshop address, phone, warranty, Judge.me reviews, secure checkout |
| What do others think? | Judge.me stars on cards (when present), reviews carousel |
| How do I order? | One primary CTA per screen, a sticky buy bar on mobile, a Buy-now button |

## 14. Mobile strategy

Designed at 375px first. Sticky thumb-zone buy bar. Horizontal snap rails instead of grids for categories and products. The configurator's controls become a swipeable step tray under a sticky preview. The quiz shows one question per screen with 56px tap targets. The form uses `inputmode`/`autocomplete` attributes. Phone/WhatsApp links use `tel:`/`wa.me`. No hover-only information.

## 15. Performance strategy

- One CSS file + one deferred JS file for the showroom. The configurator/quiz JS loads only when that section is on the page. No jQuery, no three.js on the homepage (the old PDP 3D preview loads it lazily on tab click only).
- LCP: the hero image uses `fetchpriority="high"`, `loading="eager"`, responsive `srcset` (Shopify CDN serves AVIF/WebP automatically) and a homepage-only preload.
- CLS: aspect-ratio boxes on all media, `font-display: swap`, fallback font metrics close to the web fonts.
- INP: passive listeners, rAF-throttled pointer/scroll handlers, no long tasks, IntersectionObserver instead of scroll polling.
- Budget: < 60KB extra JS+CSS (gzipped ~18KB). Homepage LCP target < 2.5s on 4G.
