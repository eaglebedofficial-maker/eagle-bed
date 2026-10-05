# Eagle Bed — Organic Growth Plan & HQ Agent Brief

Prepared 5 Oct 2026 from Shopify analytics (last 60–180 days). Search Console and Google Ads could not be read directly: the Supermetrics trial expired on 8 Sep 2026 and OpenRush has no credits. Those numbers need checking in GSC / Google Ads (checklist in §4).

## 1. What the data says

| Signal | Number | Meaning |
|---|---|---|
| Weekly sessions | 13 (Apr) → 1,021 (w/c 14 Sep) → 680 (w/c 28 Sep) | The store grew fast, then dropped by a third in 2 weeks |
| "Search" sessions/week | 674 → 486 → 332 | Almost the whole drop comes from Google |
| "Paid" sessions in 60 days | **1** | Ads clicks are not tagged as paid. Either Google Ads auto-tagging is off, or ads run as Shopping/PMax and Shopify files the clicks under "search". **The real organic number is unknown.** |
| Search landing pages | 85% are **product** pages; collections get 48 and 31 sessions | That is the shape of Google Shopping / ads traffic, not organic web rankings. Collections, the pages that should rank for "ottoman beds" or "wingback beds", barely get organic visits. |
| Mobile funnel (30 days) | 2,679 sessions → 65 carts → 12 checkouts → **2 orders** | Biggest revenue leak |
| Desktop funnel | 753 → 18 carts → 10 checkouts → 0 orders | Checkout-stage drop-off: delivery and trust questions go unanswered |
| Junk referrers | vivoooo, appleeee, oneplussss, mercanacar, zzpnbn … | Bot traffic inflating sessions and diluting conversion rate |
| Orders | 22 in ~12 weeks, ~£6.3k | |

### Root causes found in the theme (fixed in ABBAS 3D, **still live on the published theme**)
1. `layout/theme.liquid` on the live theme has **no `<html lang>` tag**, an **empty canonical tag placed before `<head>`**, plus a second canonical inside it. Google may ignore or misread canonicals site-wide.
2. **No Product structured data** on product pages, so no price/stock/star rich results.
3. No Breadcrumb/Collection/Article schema.
4. A permanent "50% off" compare-at price on every product, plus a looping "summer sale ends in" countdown in October. That hurts trust and click-through, and it is a legal risk under the DMCC Act 2024 (CMA unfair pricing guidance).
5. Thin collection pages (grid only). No unique buying advice for Google to rank.

**Publishing ABBAS 3D fixes 1–3 and 5 at once.** Item 4 needs a pricing decision by the owner.

## 2. The plan (in priority order)

### Week 1 — fix the foundations (owner + Claude)
- [ ] Preview ABBAS 3D, then **publish it** (fixes head/canonical/schema).
- [ ] Assign templates: `bespoke-beds-uk` → *page.bespoke*, `about-us` → *page.about*, `faq` → *page.faq*, `contact` → *page.contact*. Publish the new draft pages `mattress-guide`, `bed-size-guide` and `wishlist` once you're happy with them.
- [ ] Google Ads → Settings → **turn on auto-tagging**, so Shopify can split paid from organic.
- [ ] GSC → Indexing → Pages: export "Crawled – not indexed", "Duplicate without user-selected canonical" and "Alternate page with proper canonical". The broken canonical will show up here.
- [ ] GSC → Sitemaps: resubmit `https://www.eaglebed.co.uk/sitemap.xml`.
- [ ] Decide on compare-at prices: only show a "was" price that was genuinely charged recently.
- [ ] Merchant Center: check for "price mismatch" and "misrepresentation" warnings (the 50% compare-at prices can trigger them).

### Weeks 1–4 — content consolidation (SEO agent)
- Merge duplicate blog posts, keeping the stronger URL and 301-redirecting the other:
  - `ottoman-bed-vs-divan-bed` → `ottoman-bed-vs-divan-bed-uk`
  - `wingback-beds-guide` + `wingback-beds-uk-everything-you-need-to-know-before-you-buy` → `wingback-bed-buying-guide-uk`
  - `velvet-beds-uk-why-plush-velvet-is-the-most-popular-bed-fabric` → `velvet-bed-frames-uk-style-guide`
  - `best-beds-near-me-uk-luxury-handmade-beds-free-delivery` → noindex or merge into the homepage/bespoke page
- City pages: 3 are published (Leeds, Bradford, Wakefield), 41 are drafts. Keep only cities with **real, unique** content (a real delivery note, a customer photo, a local review). Merge the rest into `/pages/bespoke-beds-uk`, and don't publish the 41 templated drafts.
- Fix the main menu: "Contact Us" points to `/blogs/contact` and "Delivery Service" to `/blogs/delivery-informaction`. Point them to `/pages/contact` and `/pages/delivery-information`, then delete the one-post "blogs".

### Months 1–3 — make collections rank (SEO agent)
Target keywords map one-to-one to collections. The new `sr-collection-guide` section shows unique advice per collection (10 written; extend them):

| Collection | Primary UK query | Supporting |
|---|---|---|
| /collections/ottoman-beds | ottoman beds | ottoman bed frame, gas lift bed, king size ottoman bed |
| /collections/divan-beds | divan beds | divan bed with storage, double divan bed |
| /collections/wingback-beds | wingback bed | winged headboard bed, velvet wingback bed |
| /collections/chesterfield-beds | chesterfield bed | buttoned bed, chesterfield bed frame |
| /collections/upholstered-beds | upholstered beds uk | fabric beds, velvet beds |
| /collections/storage-beds | storage beds | storage beds with drawers |
| /collections/kids-beds | kids beds | children's upholstered bed |
| /collections/mattresses | mattresses uk | pocket sprung mattress, memory foam mattress |
| /pages/bespoke-beds-uk | bespoke beds | custom made beds uk, made to measure beds |

For each collection: rewrite the H1/meta title so it leads with the primary query, add 150–300 words of unique intro copy (collection description), and add 3–5 FAQs (FAQ section blocks with `only_on` = handle). Link each one to 2–3 guides.

Size-intent sub-collections, **only where there are ≥6 products** and unique copy: `king-size-ottoman-beds`, `super-king-ottoman-beds`, `double-ottoman-beds`, `king-size-wingback-beds`. Create them as smart collections (rule: tag + title contains size), not thousands of thin pages.

### Ongoing — earn links and brand demand (marketing agent)
- **Google Business Profile** for the Dewsbury workshop (if not already set up): photos of the workshop, beds being made, delivery vans. Ask every customer for a Google review. This drives "beds near me" and "bed shop Dewsbury" searches.
- Judge.me: turn on review request emails with photo incentive. Sync reviews to Google Shopping (Judge.me → Google Shopping integration) so stars appear on ads and free listings.
- Pinterest: upload every bed as Rich Pins (Pinterest is a top source for "bedroom ideas" traffic and already refers visitors).
- TikTok/Instagram: "made in the workshop" reels (the reels section already exists on the homepage). Every video description links to its product.
- Digital PR: pitch "Yorkshire workshop hand-making beds for UK homes" to Yorkshire Post, Huddersfield Examiner, Dewsbury Reporter and interiors bloggers. Local links are the fastest authority win.
- Free fabric swatch campaign: capture emails, then a 3-email nurture (swatch arrives → bed in that colour → 10% off).

### Conversion (theme already updated; HQ to monitor)
- Watch `bespoke_submit`, `quiz_complete`, `configurator_quote`, `add_to_cart_click` and `view_item` events (dataLayer + Shopify Customer Events). Build a GA4 funnel exploration.
- Mobile checkout: enable Shop Pay, Apple Pay and Google Pay in Shopify Payments if they're not already on. Make sure the checkout shows "Free UK mainland delivery".

## 3. Brief for the Eagle Bed HQ manager agent

> **Objective:** Grow organic (non-paid) revenue for www.eaglebed.co.uk. Measure success weekly as GSC clicks to /collections/* and /blogs/*, non-paid orders in Shopify, and Google Business Profile calls.
>
> **Guardrails:** Never invent reviews, ratings, years in business, certifications or delivery promises. Facts we can use: handmade to order in Dewsbury (Pepproyd Street, WF13 1PA); free delivery to mainland UK by our own team, usually 3–5 working days; 5-year warranty; solid wood frames; Klarna & Clearpay; free swatches; 07417 439197. No doorway pages. No fake "sale ends" countdowns.
>
> **Week 1 tasks**
> 1. SEO agent: produce the redirect list in §2 and apply it in Shopify → Navigation → URL redirects. Fix the main-menu links.
> 2. SEO agent: rewrite titles/meta descriptions and 150–300-word intros for the 9 collections in the keyword table (unique, no keyword stuffing).
> 3. Content agent: add 3–5 real FAQs per collection to the theme FAQ section (`only_on` = collection handle).
> 4. Marketing agent: draft a Google Business Profile post plan (2 per week) and a customer review-request message.
> 5. Analyst agent: once auto-tagging is on, report paid vs organic sessions and orders every Monday. Flag any week where organic clicks fall more than 15%.
>
> **Month 1 deliverables:** 4 new genuinely useful guides (ottoman lift space with real measurements from our beds; how we make a wingback, with workshop photos; choosing a mattress for an ottoman bed; bespoke bed case study), each linking to 2 collections. 10 local backlinks pitched.

## 4. Data access the owner needs to restore
- **Supermetrics** (trial expired 8 Sep): renew, or connect Search Console/GA4/Google Ads directly to OpenRush (`openrush.com/dashboard/connections`) and add credits. Then Claude can pull GSC queries, page-level drops and ad spend.
- **Second store (the "sleep and bed" store)**: share its Shopify access (or a Search Console / analytics export) so the HQ can compare which products, channels and keywords drive its sales.
