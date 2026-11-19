# Stage 6, parts 10, 13, 14 and 23: AI search, local/UK, 90-day content calendar, Stage 7 preparation

Prepared 19 Nov 2026 (night) by the AI Search, AI Recommendations, AI Platforms, Agentic SEO, Local SEO, Content Creation, Video & Voice SEO and Lead Finder specialists.

- **Read-only.** Nothing was changed on the site, theme, GBP, listings, products, feeds or HQ. No outreach. Nothing committed.
- **Files:** this report, `ai-search-tests.csv` (20 rows), `content-calendar.csv` (17 items).
- **OpenRush:** 25 credits (one `inspect_ai_visibility`). `describe_capabilities` was free.
- **Crawling:** about 35 requests to eaglebed.co.uk at no more than 1 per second. robots.txt allows everything requested.

| Label | Meaning |
|---|---|
| VERIFIED | Read live on 19 Nov from the site, OpenRush, HQ data or WebSearch |
| HISTORICAL | From an earlier stage or an earlier date |
| ESTIMATE / HYPOTHESIS | An inference, with the reasoning stated |
| UNKNOWN | Not measurable from here |

---

# ANSWER H: AI search visibility

## H1. Summary

1. **AI crawlers are not blocked.** VERIFIED.
   - robots.txt is Shopify's default (`User-agent: *` `Allow: /`). It names no AI bot.
   - A product page returned **200** to GPTBot, OAI-SearchBot, ChatGPT-User, Google-Extended, PerplexityBot, ClaudeBot, Bingbot, Applebot and a normal browser. Every response was the same full page (about 1.1 MB), with the same title and JSON-LD.
   - No challenge page appeared.
   - Limitation: the tests ran from a US data-centre IP with spoofed user agents. Cloudflare may treat the real bots, verified by their IP addresses, differently. That part is UNKNOWN.
2. **Google AI Overviews almost never cite eaglebed.co.uk.**
   - In OpenRush's sampled UK corpus, eaglebed.co.uk was cited **5 times**, ranking 6th of 10 domains.
   - Competitors: dreams.co.uk 11,750, happybeds.co.uk 2,799, bedkingdom.co.uk 1,808, divanbasedirect.co.uk 120, pascalbeds.co.uk 104.
   - VERIFIED tool output. Confidence is 0.4 and the result is directional only.
3. **Eagle Bed appeared in 0 of 12 commercial discovery searches** run through WebSearch. VERIFIED, with a caveat: this tool is a US-based, Bing-like index, not a UK Google results page.
4. **Gemini named Eagle Bed in 1 of 30 questions on 10 Nov** and cited eaglebed.co.uk in 2. The 9 Nov baseline was 0 of 12. HISTORICAL. It was not re-run today because the Gemini key returned 402 on 19 Nov.
5. **No independent mentions were found.** Four searches turned up nothing: no press, no directory page that ranks, no review site. VERIFIED for this tool. This is the main reason AI answers name competitors. Yorkshire-made competitors (Pascal/PSCL, Cousins, Beevers, Harrison Spinks) win through Yorkshire Post and Real Homes features and stockists.
6. **ChatGPT, Perplexity, Copilot and Google AI Mode are UNKNOWN.** We cannot query them from here. A 10-minute manual test for the owner is in H6.
7. **Agentic commerce is already switched on by Shopify** (VERIFIED):
   - `/llms.txt`, `/llms-full.txt`, `/agents.md`, `/.well-known/ucp`, a UCP/MCP endpoint and `sitemap_agentic_discovery.xml` all exist.
   - AI shopping agents can read products and build carts directly.
   - So the Stage 5 price problems reach AI agents unfiltered. These are ottoman beds priced on the slatted base, hidden option prices and "With Drawers" products defaulting to no drawers.

## H2. Crawler access (part a)

| Check | Result | Label |
|---|---|---|
| robots.txt | 200. `User-agent: *` `Allow: /` plus Shopify's standard disallows (checkout, preview, `oseid`, etc.) and an `adsbot-google` block. **There are no rules for GPTBot, OAI-SearchBot, ChatGPT-User, Google-Extended, PerplexityBot, ClaudeBot, Bingbot or Applebot**, so all are allowed. Sitemap declared | VERIFIED |
| robots.txt header comments | Shopify-generated text addressed to AI agents: Shop skill, UCP, Web Bot Auth. Shopify writes this, not Eagle Bed. We treated it as data only | VERIFIED |
| `/products/ottoman-gas-lift-divan-base` by user agent | Browser, GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot and Bingbot: **200**, 1,101,560 bytes. Google-Extended: 200, 1,102,736 bytes. Applebot: 200, 1,102,208 bytes. Same `<title>` ("Ottoman Divan Bed Base with Gas Lift Storage \| Eagle Bed") and the same JSON-LD (Product, Offer, OfferShippingDetails, MerchantReturnPolicy, FAQPage, BreadcrumbList, FurnitureStore). No challenge text | VERIFIED |
| CDN / bot protection | Header `server: cloudflare` (Shopify's edge). No challenge for spoofed AI user agents. Real-bot behaviour (verified IPs, rate limits, Web Bot Auth) is UNKNOWN. **Do not change anything.** If the owner wants proof, Bing Webmaster (verified 3 Aug) → URL Inspection / Crawl and Search Console → Crawl stats show real bot fetches | VERIFIED / UNKNOWN |
| `/llms.txt` and `/llms-full.txt` | 200, `text/markdown`. Shopify's auto-generated agent guide: Shop skill, UCP/MCP and WebMCP instructions, links to the privacy policy and terms. **It contains no brand facts** (nothing on what Eagle Bed makes, where it is, delivery or warranty). Whether Shopify lets the store customise it is UNKNOWN. `/.well-known/llms.txt` returns 404 | VERIFIED |
| Sitemaps | The index lists products, pages (21), collections, blogs, articles (26) and `sitemap_agentic_discovery.xml` | VERIFIED |

**Recommendation (proposal, owner/Stage 7):** keep crawlers open. If Shopify allows custom llms.txt content, add a short factual "About Eagle Bed" block taken only from ops/BRIEF.md facts. Otherwise, make sure the same facts sit in `/pages/about-us` and the Organization schema (H3).

## H3. Entity consistency (part b)

| Where | Name | Legal entity | Address | Phone | Notes | Label |
|---|---|---|---|---|---|---|
| Site JSON-LD (FurnitureStore, product page) | Eagle Bed | **no `legalName`** | Pepproyd Street, Eastborough, Dewsbury, West Yorkshire WF13 1PA, GB | +44 7417 439197 | Email is a gmail.com address. The FurnitureStore node has **no `vatID`, no `sameAs`**. `areaServed` = United Kingdom | VERIFIED |
| Footer, all 21 pages and policies checked | Eagle Bed | n/a | WF13 1PA on every page | 07417 439197 on every page | Consistent | VERIFIED |
| Terms of service, Contact information policy | Eagle Bed | "ABBAS TRADE LTD, trading as Eagle Bed … company number 16410472" | n/a | n/a | **The registered office address is not shown. The VAT number is not shown** | VERIFIED |
| "Eagle bed ltd", "EAGLE BED LTD", 17084410 | none of these on the 21 pages and policies checked, or on the product page | | | | Stage 4 entity fix holds | VERIFIED |
| Companies House (via the aggregator corpsignals.uk; not read on Companies House itself) | ABBAS TRADE LTD 16410472, active, incorporated 26 Apr 2025, SIC "retail not in stores" | | **Registered address listed in Batley** (not repeated here, per BRIEF) | | UK trading-disclosure rules generally expect the registered office on the website. The BRIEF forbids naming Batley. The owner and accountant should decide, for example by using a registered-office service address | ESTIMATE (aggregator) |
| Google Business Profile (HQ growth/main, Gmail 10 Nov) | Named "Eagle bed", renamed to "Eagle Bed" on 10 Nov via API | n/a | Pepproyd Street WF13 1PA | UNKNOWN | Oct: 100 views, **49 direction requests**, 4 website visits, 0 calls. "Action required: confirm your business details" (5 Nov). Verification status UNKNOWN: posts and edits went through on 10 Nov, which suggests access but is not proof | HISTORICAL / UNKNOWN |
| Apple Business | "Eagle bed" (lower-case b) | | | | Organisation not yet verified | HISTORICAL |
| Yell | exists, "owner Abbas", 0 reviews | | | | Not checked live (index) | HISTORICAL |
| Bing Places | live since 27 Jun 2026 | | | | | HISTORICAL |
| FreeIndex | sign-up pending activation | | | | | HISTORICAL |
| Facebook, Instagram, TikTok, YouTube, Pinterest | handles per BRIEF | | | | Not linked from the schema `sameAs` on this node | VERIFIED (schema) |

**Other live wording found during the scan** (VERIFIED, report only, nothing changed):
- `/pages/handmade-in-dewsbury` and `/pages/press-and-media` say "memory orthopaedic mattresses". The product itself is named "Memory Orthopaedic Mattress". The BRIEF bans orthopaedic and medical claims, so this is an owner decision. Do not repeat the term in any new copy.
- `/pages/ottoman-bed-frame-buying-guide` lists "End-opening (gas lift) … Ottoman Gas Lift Divan Base". That product's opening direction is **UNCONFIRMED** (Stage 5 OPEN), so this is an accuracy risk (C02).
- `/pages/beds-west-yorkshire` names Batley three times as a delivery town. The BRIEF rule ("never Batley") is about the address. The owner should confirm that using Batley as a delivery town is fine.
- The announcement bar on every page reads "10% off your order with code EAGLE10". It is live and owner-set. Drafts in this report never use discount percentages.
- `/blogs/news/beds-in-west-yorkshire-…` and `/pages/beds-west-yorkshire` have an **identical `<title>`**, so the two pages compete with each other (C01).

**Entity fixes (proposals for owner approval, not done):**
1. Add `legalName: "ABBAS TRADE LTD"`, `vatID` and `sameAs` (Facebook, Instagram, TikTok, YouTube, Pinterest) to the Organization/FurnitureStore schema. This is a theme change, so it needs owner approval and publishing.
2. Show the registered office and VAT number in the Terms and Contact information. The owner and accountant choose the address first.
3. In GBP, clear "confirm your business details". **Decide whether the address should be visible.** Eagle Bed has no walk-in shop, yet 49 people asked for directions in October. Google's guidance for businesses that don't serve customers at their address is a service-area profile with the address hidden. That change could reduce local pack visibility (trade-off). Owner decision.
4. Correct the Apple Business name to "Eagle Bed" before verification.

## H4. Independent mentions (part c)

The following searches found **no** third-party page about Eagle Bed (VERIFIED, WebSearch, 19 Nov):
- "Eagle Bed" Dewsbury beds
- "eaglebed.co.uk"
- "Eagle bed ltd" Dewsbury
- "Eagle Bed" reviews

These rivals appear instead:
- Dewsbury: RSB Furniture, RM Furnishers, Beautiful Beds, Emperor Beds, Highgate Beds and Happy Beds, plus Bed Kingdom's Heckmondwike showroom.
- Wakefield: Elliot's Beds, with about 394 Trustpilot reviews.

Directories that do surface for local queries: Johnston Press "findit" (Dewsbury Reporter, Spenborough Guardian), FreeIndex, Houzz and Yell. HQ aivis/latest also lists yell.com among the sources Gemini cited (5 times, HISTORICAL).

**Earnable mentions (no outreach in Stage 6):**
1. Finish FreeIndex and Apple Business verification.
2. Get reviews on GBP and Trustpilot or Judge.me from real customers. Stage 1 counted 2 reviews in total.
3. Pursue the Yorkshire Post "Made in Yorkshire" and Living North angles, already drafted in ops/sales/pr-pitches-2026-11-10.md.
4. Make the Houzz professional listing free.

All need the owner. Never write fake reviews or links.

## H5. Reproducible test set (part d), in `ai-search-tests.csv`

| ID | Question | WebSearch 19 Nov | Who appears instead |
|---|---|---|---|
| Q01 | Where can I buy an ottoman bed in the UK? | not named | Bensons, Furniture Choice, DFS, Homebase, Furniture Village |
| Q02 | Which UK retailers sell side lift ottoman beds? | not named | Flitch and uFurnish aggregators |
| Q03 | Where can I buy a gas lift divan base in the UK? | not named | Divan Base Direct, Archers, Land of Beds |
| Q04 | What should I look for when buying a storage bed? | not named | Furl, Time4Sleep, Simba, Bed Kingdom guides |
| Q05 | Which retailers offer upholstered beds made in Yorkshire? | not named | PSCL/Pascal, Cousins, Harrison Spinks, Beevers |
| Q06 | Difference between side lift and gas lift ottoman? | not named | Furl, Happy Beds, Mattressman (sources conflict) |
| Q07 | Where can I find a velvet king-size bed? | not named | John Lewis, Argos, Cotswold Co, Danetti, Happy Beds |
| Q08 | handmade beds UK | not named | Handmade Bed Co, Revival, Get Laid, Willow & Hall |
| Q09 | ottoman bed delivered free UK | not named | Bedstar, Archers, Tesco Marketplace |
| Q10 | bed shop Dewsbury / West Yorkshire | not named | Emperor Beds, RM Furnishers, Bed Kingdom |
| Q11 | Where can I buy a Chesterfield bed in Yorkshire? | not named (Gemini named us 10 Nov, HISTORICAL) | Pascal Beds, Fleming Howland |
| Q12 | Beds for HMO / landlords (trade) | not named | Landlord Furniture Co, LOFT, Mattressonline contract |

What the answers reward (pattern across the results):
- concrete numbers: strut rating, maximum mattress weight, storage depth, guarantee years, delivery-zone exceptions
- third-party mentions
- clear terminology

Eagle Bed has published none of the first group, and two key specs are owner-BLOCKED.

**Search Console signal** (VERIFIED, HQ seo/gsc-latest, 22 Oct to 18 Nov): long conversational queries already show impressions. Examples:
- "i'm moving into a new flat and need a bed base, should i get a divan, platform, or metal frame…": 28 impressions, position 3.8
- "divan base with drawers or an ottoman with gas lift — which holds more?": 41 impressions, position 6.3
- "ottoman beds — how does the gas-lift mechanism actually work?": 32 impressions, position 1.6

HYPOTHESIS: these come from AI Mode or AI-assisted searches. Either way, the site ranks well for them but gets 0 clicks.

## H6. Owner's 10-minute manual AI test (ChatGPT, Perplexity, Copilot, Google AI Mode)

**Setup (1 min):**
- Use a private/incognito window. Be logged out where possible (ChatGPT may need a login; use a free account).
- You are in the UK, so leave the location as it is.
- Turn on web search in ChatGPT if there is a toggle.

**Ask these 3 prompts on each of the 4 platforms (12 checks, about 45 seconds each).** Paste them exactly:
1. `Where can I buy an ottoman bed in the UK? Name specific shops.`
2. `Which bed retailers offer upholstered beds made in Yorkshire?`
3. `What is Eagle Bed (eaglebed.co.uk)? Who runs it, where is it based, what does it sell and what are its delivery terms?`

**Record each answer in a copy of `ai-search-tests.csv`:** one row per platform and prompt, with these columns:

| Column | What to enter |
|---|---|
| Date | Today's date |
| Eagle Bed appears? | yes / no |
| Cited? | Is eaglebed.co.uk linked? |
| Product referenced? | Which product, if any |
| Competitors named | The first 5 |
| Source URLs shown | The links the answer gives |

For prompt 3, also note any **wrong facts**:
- "Eagle Bed Ltd"
- a Batley address
- a showroom
- "free assembly"
- a sleep trial
- international delivery
- "mainland"

**Screenshots:** take one per answer, named `platform_prompt#_date.png` (e.g. `chatgpt_p3_2026-11-20.png`). Upload them to HQ → Social → photos, or send them to the Manager.

**Repeat** on the first Monday of each month with the same prompts. Do not change the wording, or the results stop being comparable.

---

# ANSWER J: Local and UK, AI-friendly content, the 90-day calendar, Stage 7 preparation

## J1. Local and UK facts (part 13)

| Fact | Status | Label |
|---|---|---|
| Delivery: free across Great Britain to the door/downstairs. Northern Ireland, Jersey, Guernsey and Isle of Man £90. Usually 3–5 working days, own team. UK only | Matches `/pages/delivery-information` ("We deliver free of charge to addresses across England, Scotland and Wales… Northern Ireland, Jersey, Guernsey and the Isle of Man for a £90 delivery charge") | VERIFIED |
| Delivery options | Downstairs drop-off free. Room of Choice Drop Off +£29.99. Room of Choice Assembly +£69.99, never free | BRIEF / HISTORICAL (19 Nov live check) |
| BFPO | Still in the GB free zone. This breaks the UK-only rule. PENDING (Stage 5 F9) | HISTORICAL, open |
| Address | Workshop: Pepproyd Street, Eastborough, Dewsbury WF13 1PA (site and schema). Registered office: **unconfirmed**. The aggregator shows a different town (H3) | VERIFIED / UNKNOWN |
| Walk-in customers | **None.** No showroom. The site's only "showroom" wording is in the competitor column of `/pages/why-buy-from-eagle-bed` ("a showroom if one is near you" under "Varies by retailer") | VERIFIED |
| GBP | Exists. Bed shop category. Weekly posts. Verification UNKNOWN. 49 direction requests in October conflict with "no walk-in" (H3 point 3) | HISTORICAL / UNKNOWN |
| Local queries in GSC (28 days) | beds dewsbury: 33 impressions, position 26.9. bed shop dewsbury: 2 impressions, position 35. handmade beds yorkshire: 31 impressions, position 20.5. beds made in yorkshire: 23 impressions, position 40. bespoke beds yorkshire: 16 impressions, position 44.8. ottoman beds birmingham: 38 impressions, position 53.5 (22 Oct–18 Nov). All 0 clicks | VERIFIED |
| West Yorkshire page | `/pages/beds-west-yorkshire` is live. It covers 7 towns, makes no showroom claim and has an FAQ schema. It shares its title with an older blog post (C01) | VERIFIED |
| "Bed Shop in Dewsbury" PMax campaign | Removed. £0 ever spent | HISTORICAL |

**Local position.** Eagle Bed is a **nationwide online maker** with a real Dewsbury workshop. Local content should say exactly that: "made in Dewsbury, delivered free across Great Britain by our own team".

**Do not:**
- create pages for towns outside West Yorkshire, even though "ottoman beds birmingham" has 38 impressions;
- say "visit us";
- add a showroom;
- target "bed shop near me" as if customers can walk in.

The one honest local edge is speed and contact with the maker. Phone and WhatsApp on 07417 439197 show the maker is reachable.

## J2. AI-friendly content: what exists and what is missing

| Topic (from the brief) | Already live (sitemap, VERIFIED) | Verdict |
|---|---|---|
| Ottoman buying guide | `/pages/ottoman-bed-frame-buying-guide`, `/blogs/news/best-ottoman-beds-uk-2025`, `/blogs/news/how-do-ottoman-beds-work`, `/blogs/news/ottoman-bed-vs-divan-bed-uk`, the ottoman-beds collection FAQ | **Do not add another.** Consolidate and correct (C02) |
| Side vs end lift | Covered partly in the buying guide, best-beds-for-small-bedrooms and the ottoman collection | New explainer of what the terms mean (C03). BLOCKED on opening directions |
| Gas lift explained | how-do-ottoman-beds-work (ranks at position 1.6–9.3 for mechanism questions) | Exists. Keep it |
| Storage dimensions | `/blogs/news/ottoman-storage-beds-uk-how-much-storage-…` gives no numbers (checked) | **BLOCKED** until the owner gives storage depth (C07) |
| Mattress compatibility | None | New (C04). BLOCKED on strut rating and mattress weights |
| Bed size guide | `/pages/bed-sizes-guide`, `/pages/single-beds-3ft-uk`, small-double guide | Refresh (C14) |
| Velvet vs bouclé | velvet-bed-frames-uk-style-guide, best-velvet-bed-colours-2025, boucle-beds-trend | One comparison piece linking to these (C09) |
| Divan base guide | divan-bed-vs-bed-frame-uk, ottoman-bed-vs-divan-bed-uk, divan collection table (19 Nov) | New buying guide on heights, drawers and headboards (C08), BLOCKED on specs |
| Delivery and assembly guide | `/pages/delivery-information` | Refresh (C06) plus a Christmas cut-off block (C05) |
| Kids bed sizing | kids-upholstered-beds-uk-guide | Refresh with dimensions (C14/C10) |

**Content quality standard** (every item; reviewed by a human before publishing):
1. **Answer first.** A 40–60 word direct answer under the H1 that AI can quote whole. Then a table, then the detail.
2. **Owner facts only.** Every spec, dimension, price, delivery term, warranty and material comes from ops/BRIEF.md, live Shopify data or a written owner reply, with its date. If a fact is missing, the item stays **BLOCKED**. Never write around it.
3. **Prices.** Live "from £" prices that include VAT, plus the line "options such as storage and assembly cost extra". Never quote the slatted-base price as an ottoman price.
4. **Banned words and claims.** Never use: best, leading, award, best-selling, orthopaedic, medical, posture, fire-safety, sleep trial, DivideBuy, 0% or interest-free, discount %, mainland, hotel supplier. Clearpay is unconfirmed: write "Klarna, subject to eligibility" until it is confirmed. Assembly is optional at £69.99 and never free. Free delivery means to the door or downstairs. UK only.
5. **First-hand evidence.** Real workshop photos and owner quotes. No AI images posing as real products. No invented reviews or customer stories.
6. **One job per URL.** Check the sitemap for an existing page first. Refreshing and consolidating beats publishing a new page.
7. **Structure.** Use H2s phrased as questions, an FAQPage JSON-LD that matches the visible FAQ, a "last updated" date, and 3–6 internal links to the relevant collection and products.
8. **Sign-off.** The human checklist in `content-calendar.csv` is ticked and the owner approves before any publish (Stage 6 publishes nothing).

## J3. 90-day content calendar (20 Nov 2026 – 18 Feb 2027): full detail in `content-calendar.csv`

| # | Date | Item | Type | Priority | Status |
|---|---|---|---|---|---|
| C01 | 24 Nov | West Yorkshire page vs two overlapping blog posts | Consolidate (decision) | P1 | READY (decision) |
| C02 | 27 Nov | Ottoman hub: correct the opening-direction row, one guide per job | Consolidate + correct | **P0** | BLOCKED (opening direction) |
| C03 | 1 Dec | Side lift, end lift, gas lift: what the words mean | New | P1 | BLOCKED |
| C04 | 4 Dec | Which mattress works on an ottoman bed | New | P1 | BLOCKED (strut rating, weights) |
| C05 | 8 Dec | Ordering a bed before Christmas | Seasonal FAQ block | **P0** | BLOCKED (owner dates) |
| C06 | 11 Dec | Delivery and assembly: what happens on the day | Refresh | P1 | READY after BFPO decision |
| C07 | 15 Dec | How much storage an ottoman gives, by size | Refresh with data | **P0** | BLOCKED (storage depth) |
| C08 | 5 Jan | Divan base buying guide | New | P2 | BLOCKED |
| C09 | 8 Jan | Velvet or bouclé for a bed | New | P2 | BLOCKED (fabric specs) |
| C10 | 12 Jan | Kids single 2ft6 vs single 3ft | Refresh | P2 | BLOCKED (dimensions) |
| C11 | 15 Jan | Memory foam vs pocket sprung | Refresh | P2 | READY (live facts) |
| C12 | 19 Jan | Trade page for landlords, agents and holiday lets | New | P1 | BLOCKED (trade terms) |
| C13 | 22 Jan | Choosing beds for a rental or HMO | New | P2 | BLOCKED (needs C12) |
| C14 | 26 Jan | UK bed sizes guide refresh | Refresh | P2 | BLOCKED (3ft6?) |
| C15 | 29 Jan | Chesterfield guide refresh | Refresh | P2 | BLOCKED (size-price anomaly) |
| C16 | 9 Feb | Caring for an upholstered bed + aftercare link | Refresh | P2 | READY (basics) |
| C17 | 16 Feb | Handmade in Dewsbury: real workshop photos | Refresh | P1 | BLOCKED (owner photos) |

Demand evidence:
- Search Console impressions and positions (VERIFIED, 22 Oct–18 Nov).
- **Search volumes.** Taken from `keyword-intelligence.csv` (another Stage 6 file, OpenRush, 19 Nov) where it has them (VERIFIED):
  - ottoman bed: 90,500
  - ottoman bed frame: 6,600
  - gas lift ottoman bed: 880 (grouped)
  - gas lift ottoman bed assembly instructions: 260
  - ottoman bed gas lift not working: 90 (feeds the aftercare section in C16)
- Every other volume is UNKNOWN. None were invented.

**Owner facts that unblock most of the calendar** (one 20-minute owner session):
1. Opening direction of every ottoman product, and the clearance needed.
2. Storage depth and internal dimensions per size.
3. Gas strut rating or maximum mattress weight.
4. Mattress weights and depths.
5. Drawer configurations and base heights.
6. Fabric composition and cleaning codes.
7. Kids bed dimensions.
8. Christmas cut-off date.
9. Trade terms (pricing basis, minimum order, VAT invoice, lead time, COM metres per size).
10. Any fire-regulation labels or certificates.

## J4. Stage 7 preparation: customer recovery and trade (part 23)

**Evidence (HISTORICAL unless stated):**
- Returning customer rate: 1 of 16 orders in the last 30 days (Stage 1).
- Reviews: 2 in total.
- About 45 abandoned checkouts a month after removing bots and later buyers (ESTIMATE, Stage 1). One customer on an abandoned-checkout list had already ordered (#1034).
- Shopify's abandoned-checkout email: the owner opened the editor, which put it in draft. **It must be set back to Active.**
- Trade:
  - 253 emails between 11 and 18 Nov: 1 interested reply, 0 orders (Stage 1, VERIFIED then).
  - The Manager's latest count is 292 emails and 1 interested.
  - `/pages/trade` returns **404** (VERIFIED). There is no inbound trade route.
  - PECR risk applies to sole-trader segments.

| Opportunity | Organic and search angle | What Stage 7 needs | Label |
|---|---|---|---|
| Inbound trade page (C12) | Captures "trade beds", "beds for landlords" and "HMO beds" searchers and is the PECR-safe alternative to cold email. Search answers to Q12 reward compliance proof and per-room or pack pricing | Trade terms, quote form or WhatsApp CTA, COM wording, no "hotel supplier", no fire claims without documents | HYPOTHESIS (volume UNKNOWN) |
| Landlord / HMO guide (C13) | Informational entry point that links to the trade page | As above | HYPOTHESIS |
| Designers and stagers | COM (customer's own fabric) is a real differentiator. The one interested lead (Ivywell Interiors) asked about it | Fabric metres per size, lead time | HISTORICAL evidence |
| Local trade (West Yorkshire letting agents, serviced apartments) | GBP and the West Yorkshire page can mention trade enquiries honestly ("made in Dewsbury, our own delivery team") | A phone route. No email without legal-form checks | HYPOTHESIS |
| Returning customers | The aftercare/care guide (C16) linked from the delivery confirmation and a review request. Headboards and mattresses as add-ons for past bed buyers. Owner photos for `/pages/share-your-bedroom` (with consent) | Shopify customer segments, consent flags (the marketing box is unticked by default since 19 Nov), Judge.me review flow | HYPOTHESIS |
| Abandoned checkout | Not SEO. Reactivate Shopify's flow first. Always check for a later order before any manual contact | Owner to set the email to Active | VERIFIED (status from CHANGELOG 19 Nov) |
| Recommendations | "Complete the bed" links on product pages (base, headboard, mattress) for AI agents and humans, using correct option prices. Depends on the Stage 5 price fixes | Price and option fixes | HYPOTHESIS |

**No outreach was done.** These are inputs for the Stage 7 plan.

---

## Limitations

- The WebSearch tool uses a US-based index. It is not UK Google and not Bing UK. "Not named" means not named in that tool on 19 Nov.
- The OpenRush AI Overview figure is a sampled corpus count, not live per-query results, and its confidence is 0.4. I ran it in competitor mode, which gave a ranked comparison but **no sample questions**. A solo run would cost another 25 credits.
- There was no per-question Google AI Overview check (`inspect_serp`), because the budget was used. ChatGPT, Perplexity, Copilot and AI Mode are UNKNOWN.
- The crawler tests used spoofed user agents from a US data-centre IP. They cannot prove how Cloudflare treats real verified bots.
- The registered office comes from a third-party aggregator, not from Companies House directly.
- GBP verification and the current listing state were not read live. Yell, Bing Places and Apple come from HQ notes (10–11 Nov).
- Most search volumes are UNKNOWN. Only five come from keyword-intelligence.csv; the rest of the calendar's demand uses Search Console impressions.
- Gemini was not re-run (key returned 402 on 19 Nov). Its figures are HISTORICAL (10 Nov).

## Credits used

| Call | Credits |
|---|---|
| `describe_capabilities` | 0 |
| `inspect_ai_visibility` (eaglebed.co.uk vs 9 competitors, United Kingdom, English) | 25 |
| **Total** | **25** (budget 25). Month ledger: 116 + 25 = 141 of 2,001 if no other Stage 6 calls. The 400 reserve was not touched |
