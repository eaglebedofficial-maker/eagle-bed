# EXEC E-content: two buying guides (20 Nov 2026)

Owner approval: chat on 20 Nov 2026, "Yes abc" to item C (two new buying guides: Divan base buying guide, and Velvet vs bouclé bed). Nothing committed. No theme changes and no schema added.

## Done

| Article | Live URL | Article id | Body words | H2 | Unique links |
|---|---|---|---|---|---|
| Divan Base Buying Guide: Drawers, Ottoman or Plain? | https://www.eaglebed.co.uk/blogs/news/divan-base-buying-guide-uk | gid://shopify/Article/1006219329867 | 1,270 | 8 | 12 |
| Velvet vs Bouclé Bed: Look, Feel and Care Compared | https://www.eaglebed.co.uk/blogs/news/velvet-vs-boucle-bed | gid://shopify/Article/1006219362635 | 1,133 | 9 | 9 |

- Blog: `news` (gid://shopify/Blog/125086138699). Neither handle existed before (33 articles were checked).
- Created with `articleCreate`: title = H1 text (the H1 is not repeated in the body), body = the pack-E HTML minus the leading comment and H1, author "Eagle Bed", 1-2 sentence summary. The ArticleCreateInput has no `seo` field, so the SEO title and meta went into the metafields `global.title_tag` (single_line_text_field) and `global.description_tag` (multi_line_text_field).
- The articles were created hidden first (`isPublished:false`). I read the bodies back and compared them with the files: the content was identical, and Shopify only reflowed the table tags. Then I published both at 2026-11-20T16:48:56Z.

## Verified (live, 20 Nov)
- Pre-publish: the banned-word grep on both files found 0 hits. All 20 unique internal links returned 200.
- Both URLs return 200. The `<title>` matches the SEO title plus " – Eagle Bed". The meta description equals the SEO description exactly. og:title matches, there is 1 H1, the canonical is self-referencing, and there is no noindex.
- All 52 / 54 text blocks (p, li, h2, h3, td) of each source file appear in the live HTML (0 missing).
- The banned-word grep on the live article text found 0 hits. The only page-wide hits are theme CSS (`0%`/`100%`) and the site-wide announcement bar (see follow-ups).
- Both articles are linked from /blogs/news (2 links each) and appear in /blogs/news.atom.

## Skipped
- Optional step 4 (append a guide link to the divan-beds / upholstered-beds collection description) was skipped. Both collections showed `updatedAt 2026-11-20T16:48:51Z`, seconds before my read, so another agent was editing them at the same time (likely Pack A/B). A full `descriptionHtml` replacement could have overwritten that work. The sentences to add later (back up `descriptionHtml` first):
  - divan-beds (gid://shopify/Collection/682712793419): `Read our <a href="/blogs/news/divan-base-buying-guide-uk">divan base buying guide</a>.`
  - upholstered-beds (gid://shopify/Collection/682710696267): `Read our <a href="/blogs/news/velvet-vs-boucle-bed">velvet vs bouclé bed guide</a>.`

## Rollback
- Hide: `articleUpdate(id: "<id>", article: {isPublished: false})`. Remove: `articleDelete(id: "<id>")`. The ids are listed above and in backups/E-content/created-articles.json. No existing content was changed, so nothing else needs restoring.

## Owner follow-ups
- The site-wide announcement bar shows "10% off your order with code EAGLE10". A discount % is on the BRIEF banned list. This is a theme/announcement setting and was not touched here.
- The live divan-beds and upholstered-beds collection descriptions still say "Klarna and Clearpay available" and "solid wood frames". These are Pack B decisions and were not touched here.
- The articles have no featured image. The owner or Manager may add one from product photos.
