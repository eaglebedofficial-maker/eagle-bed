# Stage 6, Parts 6, 11 and 12: Keywords, competitors and backlinks (19 Nov 2026, night)

Specialists: Keyword Research, Spy Agent, Market Research, Off-Page & PR, Link Scanner.
Read-only. Nothing was changed in Shopify, the theme, GBP, listings or HQ. No outreach was sent.

Files in this folder:
- `keyword-intelligence.csv`: 148 keywords (UK)
- `competitor-keywords.csv`: 51 competitor/SERP rows
- `backlink-opportunities.csv`: 36 authority rows (including 2 risk rows)

Labels: VERIFIED (pulled today), HISTORICAL (earlier stage or earlier pull), ESTIMATE, HYPOTHESIS, UNKNOWN.

**Note on "B" and "G":** I could not find the Stage 6 question list in the repo. I read B as "which commercial keywords should Eagle Bed target and on which pages" and G as "who outranks us, and how do we build authority safely". If the Manager's list words them differently, the content still answers both.

---

## Answer B: Commercial keyword map (UK)

### B1. How the data was built

- **Search volume** comes from OpenRush `research_keywords` (UK, English, pulled 19 Nov 21:45). There were 6 calls: 2 broad ("ottoman bed", "divan bed") and 4 long-tail ("ottoman bed", "bed frame", "upholstered bed", "gas lift ottoman"). OpenRush gives close variants the **same grouped volume**. For example, "ottoman bed", "bed ottoman" and "ottoman for bed" all show 90,500. So don't add variant volumes together. Labelled VERIFIED.
- **SEO difficulty: UNKNOWN for every row.** OpenRush returns paid "competition level" (HIGH/MEDIUM/LOW, a Google Ads measure) but no organic difficulty score. The CSV shows the paid level only, labelled as such.
- **Eagle Bed position, impressions and clicks** come from GSC for 22 Oct–18 Nov (HQ `seo/gsc-latest` plus the Stage 1/2 tables). No credits were spent re-pulling. Where a term is not in those rows, it says UNKNOWN.
- **Competitors** come from live SERPs pulled today for 3 terms, plus the 2 Stage 1 SERPs (HISTORICAL).
- **Landing pages** use only existing handles. All 148 rows were checked against `/collections.json` (26 collections) and `/products.json` (145 products) today.
- **Not researched (budget):** chesterfield, wingback, velvet, bouclé, kids and mattress volumes. These are UNKNOWN in the CSV. GSC impressions stand in where they exist.

### B2. Demand by cluster (VERIFIED volumes, UK monthly, grouped)

| Cluster | Biggest terms (volume) | Eagle today | Landing page (existing) |
|---|---|---|---|
| Ottoman (head) | ottoman bed 90,500; ottoman storage bed 8,100; ottoman bed frame 6,600 | Not in top 20 for "ottoman bed uk" (HISTORICAL); "ottoman beds uk" 21.1 on /collections/storage-beds | /collections/ottoman-beds |
| Ottoman by size | king size ottoman bed 33,100; small double ottoman bed 27,100; ottoman double bed 27,100; single ottoman bed 22,200; double ottoman bed 18,100; super king ottoman bed 9,900 | Small double 69.6; 4ft ottoman bed 33.7; super king 61.7; king not ranking | /collections/king-size-ottoman-beds, /collections/small-double-ottoman-beds, /collections/super-king-beds |
| Ottoman divan | divan ottoman bed / ottoman divan bed 4,400 | 70.6 / 70.7 (122 and 76 impressions) | /collections/divan-ottoman-beds |
| Gas lift | gas lift ottoman bed 880; assembly instructions 260 (LOW paid competition); not working 90 (LOW); king 70; double 50; small double 30 | **#38 today** (Side Lift Ottoman Storage Base page); GSC average 19.1, 117 impressions, 0 clicks | /collections/ottoman-beds |
| Divan | divan bed 33,100; double divan bed 9,900; divan bed base 9,900 (HISTORICAL pull) | divan bed 76.4; divan beds uk 40.0 (2 clicks); drawers terms 28–64 | /collections/divan-beds, /collections/double-divan-beds, /collections/storage-beds-with-drawers, /products/divan-drawer-storage-base |
| Upholstered | upholstered bed 2,900; upholstered bed frame 2,400; single 1,000; double 720; small double 480; king 390; super king 260; upholstered bed frame uk 140 | Not in top 20 for "upholstered bed uk" (HISTORICAL); king size upholstered bed frame 43.4 | /collections/upholstered-beds and size collections |
| Bed frame (broad) | double bed frame 74,000; bed frame 60,500; king size bed frame 49,500; small double bed frame 18,100 | UNKNOWN | Size collections (long-term only) |
| Style | chesterfield / wingback / panel / velvet / bouclé: volume UNKNOWN | panel bed **10.7**; wingback panel bed **9.3** (103 impressions); cloud bed small double **8.0**; cloud teddy bed 10.6; chesterfield bed 52.8 | /collections/panel-beds, /collections/wingback-beds, /collections/chesterfield-beds, Cloud Teddy product |

### B3. Priorities (from the CSV: 32 P1, 59 P2, 47 P3, 10 Skip)

**P1, near page 1 already (snippet and internal-link fixes, no new pages):**
1. **panel bed / panel beds** (10.7 / 14.2) → /collections/panel-beds.
2. **wingback panel bed** (9.3, 103 impressions, 0 clicks) and **wingback bed** (26.6) → /collections/wingback-beds.
3. **Cloud Teddy cluster** (cloud bed small double 8.0, cloud teddy bed 10.6, bouclé small double 11.3) → Cloud Teddy product. It is on page 1 but gets almost no clicks.
4. **Guides that already rank 8–18** (how do ottoman beds work, what is a divan bed, divan vs bed frame): add product and collection blocks. Stage 1 found 0 blog orders.

**P1, money terms with a weak SERP (VERIFIED today; "beatable" is a HYPOTHESIS):**
5. **gas lift ottoman bed / gas lift bed / gas lift ottoman beds** → /collections/ottoman-beds. Today's top 10 has 5 Facebook seller posts, a campervan site at #3, Amazon and only 3 real bed collections. Eagle sits at #38 with a *base* product page, not the collection. Make /collections/ottoman-beds the single ottoman hub. Stage 1 found ottoman terms split between storage-beds and ottoman-beds.
6. **chesterfield bed / chesterfield beds / chesterfield upholstered bed** → /collections/chesterfield-beds. In today's SERP, #4 is a URL called "dummy-product", #7 is a thin furniture portal home page and #9–10 have no description. Eagle is not in the top 48 and is split across up to 5 URLs including ?variant= (Stage 1). Fix canonicals first.
7. **divan bed with drawers / divan base with drawers / divan bed base with drawers** → /collections/storage-beds-with-drawers and /products/divan-drawer-storage-base. 19 of the top 48 results are Facebook posts. **Blocked first by Stage 5:** 6 "with Drawers" products default to no drawers.
8. **king size ottoman bed (33,100), small double ottoman bed, 4ft ottoman bed, ottoman divan bed**: the size collections exist but rank 34–70 or not at all. **Blocked by Stage 5 ottoman price/config issues** (9 ottoman-named beds priced on a slatted base). Do not push traffic to them until the prices are right.
9. **upholstered bed / upholstered bed frame (uk)** → /collections/upholstered-beds. Stage 2 found it shows at 9.0 with 0 clicks for some queries. That points to the snippet, not the ranking.
10. **Brand and local:** eagle bed (2.3), eagle bed dewsbury (not on page 1, HISTORICAL), handmade beds yorkshire (19.9).

**Low-competition long tail with evidence (OpenRush paid competition LOW or tiny volume, exact Eagle fit):** gas lift ottoman bed assembly instructions (260, LOW), ottoman bed gas lift not working (90, LOW), ottoman gas lift bed instructions (70, MEDIUM), gas lift ottoman bed king size (70), double / small double gas lift ottoman bed (50 / 30), are all ottoman beds gas lift (20), difference between gas lift and ottoman bed (20), upholstered bed frame uk (140). The two support terms suit /pages/aftercare-and-feedback, which already gets 7 clicks at 7.7. Any assembly or "not working" copy must not make safety claims.

**Gaps in existing pages (no new pages proposed here, just recorded):** no double-ottoman, super-king-ottoman, side-lift or end-lift collection; no velvet or bouclé collection (guides exist); no Chesterfield-ottoman landing, even though a customer asked for one (CHANGELOG 11 Nov). Opening-direction, storage-depth and dimension copy is **BLOCKED** until the owner confirms it (Stage 5 rule).

**Skip (irrelevant):** wooden/metal/IKEA/Argos/Dusk/Dreams terms, bunk/trundle, adjustable beds. Mattress terms rank 36–83 and stay P3 (not core; no orthopaedic or medical claims).

---

## Answer G, part 1: Competitors (SERP data and WebSearch only; competitor sites blocked)

### G1. Who outranks Eagle Bed

| Query (UK) | Top results | Eagle |
|---|---|---|
| gas lift ottoman bed (VERIFIED 21:46) | facebook posts (17 of 47 results), luxcampervans.co.uk #3, livingwithluxury #4, rebeldreams #6, amazon #8, bedroomking #10, beduniverse #11, bedsdirectwarehouse #13, justbed #21 | #38 |
| divan bed with drawers (VERIFIED) | next #1, facebook (19 of 48), sognarebeds #3, ukonlinefurniture #4, divanbedking #7, Independent "best storage beds 2026" #9, moonsleepbeds #12, bedkingdom #19 | not in top 48 |
| chesterfield bed (VERIFIED) | ebay #1, amazon #2, bedcreed #4 ("dummy-product"), craftedbeds #5, trhomefurnitureltd #8, nicebeds #9, britainluxurybed #10, ukbedsdirect #22/#27, bedkingdom #25 | not in top 48 |
| ottoman bed uk (HISTORICAL, Stage 1) | somnibeds #1, furniture123 #3, bedwick #4, ukbedsdirect #5, stylobeds #8, wayfair #10, divanbasedirect #11 | not in top 20 |
| upholstered bed uk (HISTORICAL, Stage 1) | ehbuildmart, theluxurybedcentre, next, amazon, johnlewis, mude, sunrisebeds, beduniverse, bedpoint, bedcreed, made.com, ukbedsdirect | not in top 20 |

**PSCL (pascalbeds.co.uk), Stage 1's closest rival, was not seen in any of the 5 SERPs.** Its edge is reviews (Trustpilot 5.0, about 2,276; HISTORICAL) and the brand, not generic rankings. Dunelm and Argos were also not seen. Argos appears only as navigational searches.

### G2. What they do (observed in titles and snippets; no text copied)

- **Collection structure:** rivals have dedicated pages for each search angle. Examples: justbed "Gas Lift Ottoman Bed UK | Hydraulic Storage Beds", bedroomking "4ft6 Double Ottoman Divan Gas Lift Storage Beds", divanbedking "Beds with Drawer Storage", ukbedsdirect "Chesterfield Beds" plus a size-split king ottoman collection (Stage 1), Very's size-faceted divan pages (Double 4ft6 / King 5ft drawers). Eagle has size collections for king and small double ottomans but none for double, super king, side-lift or gas-lift.
- **Content strategy:** a definition paragraph on the collection (livingwithluxury: end-lift vs side-lift; sognare and moonsleep: "what a divan is"). Price-led guides (bedkingdom "Divan Beds UK: Prices, Drawers and Sizes"; wowcher 2-drawer vs 4-drawer guide). Tools (Bedwick room-fit calculator) and guide blogs (Stylo, Stage 1). Eagle already has 26 guides, including Chesterfield, wingback, velvet and ottoman ones. The gap is linking guides to collections, not the number of guides.
- **Review visibility:** the SERP tool does not return star ratings, so stars are UNKNOWN for most. One snippet showed stars: Very "3.6 out of 5, 63 reviews". From Stage 1 (HISTORICAL): PSCL Trustpilot 5.0 / ~2,276 and UK Beds Direct 4.5 / ~37–46. Eagle has no Trustpilot profile and 1 Judge.me review was found.
- **Technical strengths observable:** little can be seen without site access. Several high-ranking results have no snippet text (beduniverse, britainluxurybed, nicebeds), which suggests weak on-page optimisation (HYPOTHESIS).
- **Local:** bedkingdom has a "Beds in Dewsbury" showroom page, and Yell/MapQuest/findit list other Dewsbury bed firms. Eagle has no walk-in showroom and must not imply one, so no city doorway pages.
- **Social:** Google is showing many fresh Facebook seller posts for these money terms. Eagle has a Facebook page. Accurate product posts are a cheap test (HYPOTHESIS; the results are volatile).

### G3. Pages we could beat (HYPOTHESIS, based on today's SERP quality)
bedcreed "dummy-product" (#4 chesterfield), andersonsfurniture home portal (#7 chesterfield), luxcampervans (#3 gas lift), beduniverse URL-only result (#11 gas lift), justbed page 2 (#21 gas lift), ukonlinefurniture "Bed base- 2 drawer storage" (#4 divan drawers), Facebook seller posts.

---

## Answer G, part 2: Backlinks and authority

### G4. Eagle Bed link profile (VERIFIED, OpenRush inspect_backlinks, 19 Nov 21:46)

| Measure | Value |
|---|---|
| Domain rank (0–1000) | **0** |
| Referring domains | **34** |
| Backlinks | **58** (35 to eaglebed.co.uk/, 21 to www.eaglebed.co.uk/) |
| Dofollow ratio | 60.3% |
| Spam score (domain) | 39 |
| Broken backlinks | 0 |
| Lost links | Not pulled (a second 15-credit call; UNKNOWN) |

**Quality:** only **1 of 34 referring domains is genuine: yell.com** (21 nofollow links from Yell search pages). The other 33 are spam:
- **31 domains** carry the anchor "High Quality Dofollow Backlinks DA 50 PA 40 Premium PBN Network Service eaglebed.co.uk Rank First Page Google…". 2 more use "Powerful Dofollow Link Building…". They sit on `/all/904/29.html`-style pages of unrelated sites (casino, crime, pizza, film, Turkish/Hungarian domains). All are dofollow, spam score 60–75, first seen 4 Aug – 14 Nov 2026 and still arriving.
- **2 domains** (seonix.agency, rank-seo-now.shop) are "Linkly agency" testimonial pages that mention eaglebed.co.uk as plain text. Both nofollow.
- These look like link-seller advertising or automated spam that uses the domain name, not links Eagle built (HYPOTHESIS). **Owner question:** has anyone ever paid for links or "SEO packages" for this site?

**UK relevance:** Yell only. **Anchor mix:** 31 PBN-advert anchors, 21 "Website" (Yell), 4 "eaglebed.co.uk", 2 "Powerful Dofollow…". There are **no** branded or product anchors from real sites, and no editorial, supplier, press or directory links apart from Yell.

**Yell problem (VERIFIED):** Yell lists Eagle Bed under "office furniture", "fitted bedrooms", "fitted furniture" and "bespoke furniture" pages for Dewsbury, Batley, Ossett, Heckmondwike, Mirfield and Liversedge. These are wrong categories for a bed maker. Fix it in Yell (B01).

**Brand mentions (WebSearch):** none found for "eaglebed.co.uk" or "Eagle Bed" Dewsbury (2 searches). The brand SERP problem from 10 Nov stands (HISTORICAL): ukbedsdirect's "Eagle Bed Frame" product and the old Facebook "Furniture Repair" text.

**Known listings (HQ growth/main.listings and CHANGELOG, HISTORICAL):**

| Listing | Status |
|---|---|
| GBP | done; title and category fixed 10 Nov |
| Yell | done |
| Bing Places and Bing Webmaster | done |
| Pinterest business | done |
| Apple Business | signed up, verification pending |
| FreeIndex | signed up, activation pending |
| Thomson Local | UNKNOWN |
| Trustpilot | none |

### G5. Competitor backlink gap (free data only)
No paid gap tool was used (compare_backlink_gap is 60 credits). Free evidence shows rivals hold review platforms (PSCL Trustpilot ~2,276), local directories (other Dewsbury firms on Yell, findit.dewsburyreporter.co.uk, MapQuest, Houzz) and editorial round-ups (the Independent 2026 storage beds list ranks #9 for a money term). Eagle has none of these yet. Rival referring-domain counts: UNKNOWN.

### G6. Authority opportunity register (legitimate only; see backlink-opportunities.csv)

| Priority | Opportunity |
|---|---|
| P1 | Fix Yell categories (B01) |
| P1 | Genuine GBP reviews from delivered orders; the 24 saved drafts (B02) |
| P1 | Trustpilot free profile + invitations (B03) |
| P1 | Judge.me post-delivery requests (B04) |
| P1 | Facebook About fix (B09) |
| P1 | Send Make it British, Ideal Home, IndyBest and Yorkshire Post pitches; already drafted in ops/sales/pr-pitches-2026-11-10.md (B12, B17, B19, B25) |
| P1 | Decide on the spam links (B34) |
| P2 | Apple and FreeIndex activation (B06, B07) |
| P2 | Dewsbury Reporter "findit" free listing (B10) |
| P2 | Made in Britain membership: fee by turnover, needs proof of manufacture (B14) |
| P2 | Homes & Antiques, Expert Reviews, Livingetc pitches |
| P2 | Factual local-maker story for Dewsbury Reporter / Examiner, to be drafted (B27) |
| P3 | Houzz profile, From Britain With Love, Make it British Directory (paid), Furniture Makers' Guild Mark / BFM, Dewsbury Chamber of Trade, West & North Yorkshire Chamber, supplier stockist pages, Thomson Local, marketplace profiles |

No outreach was sent. Every send is an owner step.

### G7. Google spam policies: what to avoid (WebSearch, 19 Nov)
Google's spam policies define **link spam** as links placed mainly to manipulate rankings. Buying or selling links (money, goods, services or free products in exchange for links) is link spam unless the link is qualified with `rel="sponsored"` or `nofollow`. Google's SpamBrain detects both buyers and sellers, and violations can lead to a manual action. The policies also cover doorway pages, scaled content abuse, site reputation abuse and fake reviews. Avoid:
1. Buying "DA 50 / PBN / dofollow" packages. Ignore the sellers whose adverts already point at the site.
2. Paid directory or membership links that are followed. Make it British, Made in Britain and Chamber memberships are fine only as qualified links or as accreditation.
3. Paying bloggers for followed links in round-ups; link exchanges with other bed sellers.
4. City doorway pages ("ottoman beds Birmingham", "beds Leeds") without a real presence. Eagle has no showroom.
5. Mass AI-written guides (scaled content abuse).
6. **Reviews:** any incentive for a GBP review (discount, prize, gift), review gating, staff quotas, or offering something to remove a bad review. All of these are "Fake Engagement" under the GBP policy and can restrict the profile. Never write reviews yourself.
7. **Disavow:** Google says most sites do not need it and ignores spammy links on its own. John Mueller advises disavowing only links you paid for or that risk a manual action, at domain level for large spam attacks. **Recommendation:** if the owner confirms no links were bought and Search Console shows no manual action, leave the 33 spam domains alone and check monthly. Otherwise, prepare a domain-level disavow file (the owner uploads it; nothing done here).

Sources:
- [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Google: link spam / spam policies (alt URL)](https://developers.google.com/search/docs/advanced/guidelines/malicious-behavior)
- [Search Engine Roundtable: undetectable links](https://seroundtable.com/stop-emailing-google-undetectable-links-for-sale-35961.html)
- [Ahrefs: link spam / SpamBrain](https://ahrefs.com/seo/glossary/link-spam)
- [SEJ: disavow not part of normal maintenance](https://www.searchenginejournal.com/google-says-disavow-tool-not-part-of-normal-site-maintenance/543861)
- [SEJ: Mueller domain-level disavow](https://beta.searchenginejournal.com/mueller-domain-level-disavow-spammy-links/569097/)
- [Search Engine Roundtable: GBP review policy update](https://www.seroundtable.com/google-business-profile-review-policies-updated-40962.html)
- [PinMeTo: incentivised reviews 2026](https://www.pinmeto.com/news/google-incentivized-reviews-penalty-2026/)
- [Made in Britain apply](https://madeinbritain.org/apply)
- [Dewsbury Chamber of Trade (Kirklees directory)](https://communitydirectory.kirklees.gov.uk/communityDirectory/organisationdetails.aspx?orgid=344)
- [Bdaily: W&N Yorkshire Chamber](https://www.bdaily.co.uk/articles/2025/08/04/chamber-expands-reach-with-exciting-new-chapter)
- [Yorkshire Post Made in Yorkshire](https://www.yorkshirepost.co.uk/lifestyle/homes-and-gardens/made-in-yorkshire-1774075)
- [findit Dewsbury Reporter](https://findit.dewsburyreporter.co.uk/company/786329306116096)

Secondary sources are used where Google's own page text was truncated in search results.

---

## Limitations

- Competitor sites are blocked from this session, so competitor structure comes only from SERP titles and snippets plus Stage 1 index copies. No traffic figures were invented, and none are given.
- OpenRush returns no organic difficulty (UNKNOWN on every row). Volumes are grouped across close variants. Long-tail lists are truncated by volume (for example, 150 of 13,103 ottoman suggestions).
- Volumes for chesterfield, wingback, velvet, bouclé, kids and mattress terms were not pulled (budget). These are UNKNOWN.
- GSC figures are the 22 Oct–18 Nov window from HQ/Stage 1/Stage 2, not re-pulled. Terms below the GSC row limits show UNKNOWN.
- The SERP tool returns domain-root URLs for most results, so exact competitor URLs are often unknown. Titles are given instead. It does not report review stars.
- Lost links were not pulled (a second inspect_backlinks call). A backlink index never lists every link.
- Stage 5 blockers stay OPEN: ottoman price/config, the 6 "with Drawers" defaults, Merchant Center diagnostics UNKNOWN, VAT, costs. Do not push SEO traffic to affected ottoman and drawer pages until they are fixed.

## Credits used (OpenRush, UK/English on every call)

| # | Call | Credits |
|---|---|---|
| 1 | research_keywords "ottoman bed" (ideas, 60) | 4 |
| 2 | research_keywords "divan bed" (ideas, 50) | 4 |
| 3 | research_keywords "ottoman bed" (suggestions, 150) | 4 |
| 4 | research_keywords "bed frame" (suggestions, 200) | 4 |
| 5 | research_keywords "upholstered bed" (suggestions, 150) | 4 |
| 6 | research_keywords "gas lift ottoman" (suggestions, 150) | 4 |
| 7 | inspect_serp "gas lift ottoman bed" (depth 50) | 3 |
| 8 | inspect_serp "divan bed with drawers" (depth 50) | 3 |
| 9 | inspect_serp "chesterfield bed" (depth 50) | 3 |
| 10 | inspect_backlinks eaglebed.co.uk (authority, referring_domains, anchors, backlinks; limit 300) | 15 |
| | describe_capabilities | 0 |
| | **Total** | **48 of 50** (at the published per-tool costs; whether the 4-view backlinks call was billed as one call could not be confirmed from the tool) |

compare_keyword_coverage (30) and compare_backlink_gap (60) were not used. Other sources (no credits): 8 WebSearch queries, Eagle Bed public collections.json, products.json and blog feed, HQ seo/gsc-latest and growth/main (read only).
