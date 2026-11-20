# Stage 7, Parts 8–12: trade infrastructure, owner trade facts, trade page, landlord/HMO guide, trade lead management

Lead Finder, Email Marketing, Sales Closer, Market Research, Content Creation and Theme Engineer specialists. 20 Nov 2026. Read-only for live systems: nothing was sent, drafted in Gmail, published, or written to HQ or Shopify.

**Sources read now (VERIFIED, 19–20 Nov):**
- HQ db: `leads` (332 docs), `outreach` (plan + 7 day docs), `inbox` (11 docs)
- Gmail (read-only): the Ivywell thread in full, bounces and replies since 17 Nov, inbox since 17 Nov
- Shopify Admin GraphQL (read-only): all 83 pages, URL redirects, all 4 menus, orders since 10 Nov
- Live site: `products.json` (145 products), `/pages/trade` and 7 other pages fetched
- Repo: grep of `ops/`, `docs/`, `theme/` and git history for `/pages/trade`
- WebSearch: the 1988 fire regulations and HMO room sizes (sources listed in the guide draft)
- OpenRush: 2 `research_keywords` calls (UK)

**Files written (all in `ops/rocket/stage7/`):** `03-trade.md` (this file), `trade-market-research.csv`, `owner-trade-questions.md`, `trade-page-draft.html`, `trade-page-requirements.csv`, `landlord-hmo-guide-draft.md`, `trade-lead-register.csv`.

---

## Summary for the owner

1. **A designer is waiting for us, not the other way round.** On 17 Nov our reply to Ivywell Interiors (Bristol) promised "how much fabric we'd need for each bed size … within one working day". It was never sent; it is now 2 working days late. The same reply also said our team "assemble the beds on site", which breaks the rule that assembly is an optional £69.99. Answer questions 1–3 in `owner-trade-questions.md` and we can send a correct reply the same day.
2. **Trade email totals to 19 Nov:** 314 businesses emailed, 15 hard bounces, 1 interested reply, 3 STOPs, 0 quotes, 0 orders, £0 revenue (VERIFIED).
3. **19 Nov run (limited companies only):** 61 sent. So far there has been 1 hard bounce, 1 out-of-office reply and 0 real replies (VERIFIED, 20 Nov).
4. **Lawful-contact gap.** 251 of the 314 businesses emailed have no limited-company evidence in HQ. All of them were emailed before the 19 Nov rule. Do not email them again unless a Companies House check shows they are a limited company or LLP.
5. **`/pages/trade` is a 404 because the page was never created.** It was not deleted and it is not a wrong handle. No menu, page, email or template links to it.
6. **The trade page draft is ready.** 32 requirements: 24 can go live now, and 8 are blocked by owner facts (prices, lead times, fire labels, returns, VAT invoice). 17 rows name an open owner fact.
7. **Fire safety.** Landlords and agents must supply beds, headboards and mattresses that meet the 1988 fire regulations, and they will ask for labels. We have no fire documentation on file. Until you answer questions 17–19, neither the trade page nor the guide claims compliance.

---

## G. Trade history and why /pages/trade is 404

### G1. Funnel, 10–20 Nov (all trade outreach)

| Stage | Count | Label and source |
|---|---|---|
| Prospects in HQ `leads` | **332** | VERIFIED (HQ, 20 Nov). Stage 1 had 271; 61 were added on 19 Nov |
| Never contacted | 18 | VERIFIED. All are phone- or website-only leads from the 10 Nov Lead Finder list |
| Emailed | **314** | VERIFIED. `emailedAt` on 314 docs; day docs 38+36+33+35+39+72+61 = 314 |
| Hard bounces | **15** (4.8%) | VERIFIED. 13 are marked `bounced` in HQ. **2 are still "contacted" in HQ:** a Brighton accommodation agency (11 Nov, domain not found) and Square Lettings, Aberdeen (19 Nov, domain not found) |
| Soft bounces still retrying | 2 | VERIFIED. Gmail delay notices on 19 Nov: a London letting agent and a Leicester aparthotel |
| Delivered | **299** | ESTIMATE. 314 − 15. There are no delivery receipts, and open tracking is off |
| Auto-replies | at least 5 | 4 counted by Stage 1 (HISTORICAL) plus 1 on 19 Nov from a Highland housebuilder (VERIFIED) |
| Human replies | **4** | VERIFIED. 1 interested and 3 STOPs |
| Interested | **1** | VERIFIED. Ivywell Interiors (interior designer, Bristol) |
| STOP / opt-outs | **3** | VERIFIED. All set to `doNotContact` |
| Quotes sent | **0** | VERIFIED (HQ, inbox docs, Gmail sent mail) |
| Trade orders | **0** | VERIFIED. Orders since 10 Nov are #1039–#1043, each a single bed bought by a consumer. No orders after #1043 |
| Trade revenue | **£0** | VERIFIED |

**Ivywell Interiors: status now.**
- **13 Nov:** we sent the cold email. It said "free delivery … with assembly by our own team" and "we'll send a trade quote the same day".
- **17 Nov, 13:45:** the director asked whether we make beds in client-supplied fabric.
- **17 Nov, 15:13:** we sent two replies:
  - A long reply promising the fabric quantity per size "within one working day", asking for designs, sizes and quantity, and saying our team "assemble the beds on site".
  - The owner's own "Yes we do".
- **Since then:** no further message in either direction (VERIFIED, Gmail 20 Nov).

**Pipeline status: Awaiting information, with the next move overdue on our side.** The fabric quantity was due on 18 Nov.

**Correction needed.** The next message must say that room-of-choice assembly is optional at £69.99 per bed. Correct it in that reply. Do not send a separate apology.

**Draft follow-up text** (for the owner; not sent or drafted in Gmail). Send it only once Q1–Q3 are answered:

> Hi, thank you for your patience. For a standard upholstered bed with headboard we need: Single [BLOCKED: Q1] m, Small Double [BLOCKED] m, Double [BLOCKED] m, King [BLOCKED] m, Super King [BLOCKED] m of fabric. Please send the fabric to our workshop at Pepproyd Street, Eastborough, Dewsbury WF13 1PA [BLOCKED: Q3]. One correction to my last email: delivery is free across England, Scotland and Wales by our own team, and room-of-choice assembly is an optional extra at £69.99 per bed. If you let us know the designs, sizes and number of beds, we will put a written quote together. Eagle Bed, 07417 439197.

**Cold email since 19 Nov (limited companies only):**

| Measure | 19 Nov run | Label |
|---|---|---|
| Sent | 61 (10am run 39, top-up 22) | VERIFIED (HQ day doc and lead sources) |
| Limited-company evidence in HQ `why` | 61 of 61 (Ltd/Limited/LLP, a company number or a Companies House reference) | VERIFIED as recorded text; not re-checked at Companies House |
| By segment | Letting agents 20; independent hotels 8; serviced accommodation 6; interior designers 6; developers 6; holiday-let managers 5; property managers 4; HMO agents 3; landlords 2; furniture pack 1 | VERIFIED (HQ types, mapped by keyword) |
| Hard bounces | 1 (Square Lettings, domain not found; HQ not yet updated) | VERIFIED |
| Auto-replies | 1 | VERIFIED |
| Human replies, STOPs, quotes, orders | 0, 0, 0, 0 | VERIFIED (20 Nov, about 1 day after sending; too early to judge) |

**Three things to note about the 19 Nov run:**
- 8 of its 61 emails still went to independent hotels, although Stage 1 said "less, then pause" for hospitality. They were limited companies, so this is a PECR-lawful choice, but it goes against the Stage 1 advice.
- Every email still promises "a trade quote the same day", although no trade pricing basis exists (Q4, Q22).
- The emails carry no privacy-notice line (Stage 1 7.4 gap, still open).

### G2. By segment (VERIFIED, HQ `leads.type` mapped by keyword, 20 Nov)

| Segment | Prospects | Emailed | Hard bounced | STOP | Interested | Quotes | Orders | Revenue |
|---|---|---|---|---|---|---|---|---|
| Letting agents | 92 | 85 | 1 | 0 | 0 | 0 | 0 | £0 |
| Small accommodation (hotels, guest houses, B&Bs, inns) | 67 | 66 | 6 | 2 | 0 | 0 | 0 | £0 |
| Holiday-let operators and agencies | 45 | 44 | 1 | 1 | 0 | 0 | 0 | £0 |
| Serviced accommodation | 29 | 26 | 4 | 0 | 0 | 0 | 0 | £0 |
| Interior designers | 23 | 22 | 1 | 0 | **1** | 0 | 0 | £0 |
| Care homes / supported living | 20 | 19 | 0 | 0 | 0 | 0 | 0 | £0 |
| Landlords (student / professional) | 18 | 17 | 1 | 0 | 0 | 0 | 0 | £0 |
| HMO operators and HMO agents | 13 | 11 | 1 | 0 | 0 | 0 | 0 | £0 |
| Developers / housebuilders | 8 | 8 | 0 | 0 | 0 | 0 | 0 | £0 |
| Home stagers | 7 | 7 | 0 | 0 | 0 | 0 | 0 | £0 |
| Property managers | 7 | 7 | 0 | 0 | 0 | 0 | 0 | £0 |
| Furniture-pack firms | 3 | 2 | 0 | 0 | 0 | 0 | 0 | £0 |
| **Total** | **332** | **314** | **15** | **3** | **1** | **0** | **0** | **£0** |

The segment mapping differs slightly from Stage 1 (for example, HMO-specialist agents are now their own row). The totals reconcile.

### G3. Why `/pages/trade` returns 404

| Check | Result | Label |
|---|---|---|
| Live URL | `https://www.eaglebed.co.uk/pages/trade` returns 404 (20 Nov) | VERIFIED |
| Shopify pages (all 83, published and unpublished) | No page with handle `trade` or `trade-*`, and no wholesale/business page under any other handle | VERIFIED (GraphQL) |
| URL redirects | None for `/pages/trade` or any path containing "trade" | VERIFIED (GraphQL) |
| Menus (Main, Footer, Useful Links, Customer account) | No item links to it | VERIFIED (GraphQL) |
| Site HTML (home, contact, FAQ, about, delivery, get-in-touch, why-buy) | No link to `/pages/trade`; the word "trade" only appears in "trade-offs" | VERIFIED (crawl) |
| Stage 6 `indexing-audit.csv` | No `/pages/trade` row, so it was never in the sitemap and had no internal links | VERIFIED |
| Emails and templates | `ops/email/trade-agent-brief.txt`, the 314 sent messages, the Stage 3 templates and WhatsApp quick replies all link product pages or WhatsApp, never `/pages/trade`. The path first appears in the repo in the Stage 6 reports (git `385e016`) | VERIFIED |
| CHANGELOG | No entry for creating or deleting a trade page | VERIFIED |

**Cause: the page was never created.** It was not deleted (there is no record or redirect, and no link points to it). It is not a wrong handle (no similar page exists). Stage 6 tested the URL as the obvious inbound trade route and found nothing there.

**Limit:** Shopify's Admin API does not list deleted pages, so a deletion before September cannot be ruled out completely. Nothing suggests one.

**Fix:** create the page with handle `trade` from `trade-page-draft.html` once the owner approves (OA19). See requirements R01–R06.

---

## H. Trade segments and market (`trade-market-research.csv`, 12 rows)

| Segment | Suitability | Why (short) |
|---|---|---|
| Interior designers | **High** | The only interested reply. Customer's own fabric is accepted (owner, 17 Nov). Higher-value designs. Mostly limited companies |
| Landlords | Medium | Need storage divans and ottomans plus mattresses. Many are sole traders, so inbound contact only |
| Letting agents | Medium (keep, fix the offer) | 85 emailed, 0 replies. Agents refer landlords rather than buy |
| HMO operators and agents | Medium, **blocked on fire documents** | Search answers for HMO beds reward proof of fire compliance (Stage 6 Q12) |
| Property managers | Medium-low | Sample too small |
| Home stagers | Medium | May want to hire rather than buy (HYPOTHESIS) |
| Developers (show homes) | Medium-low | Usually furnished through interior designers |
| Holiday lets | Low (pause cold email) | 1 STOP and many sole traders |
| Serviced accommodation | Low | 15% bounced and contract buying is central. "Hotel/contract" demand (880 a month each) cannot be targeted because those claims are banned |
| Small hotels, guest houses, B&Bs | Low (pause) | 2 STOPs and 6 bounces |
| Care homes | Hold | Contract fire and infection-control specs are unknown |
| Furniture-pack firms | Owner decision | Could be partners or competitors |

**Products by segment (live from-prices, 20 Nov, include VAT):**
- **Lets and HMOs:**
  - Divan Storage Base with Drawers, £168.99. This is the "No Drawers" default price (Stage 5 F3), so drawers must be quoted separately.
  - Ottoman Gas Lift Divan Base, £220.99
  - Side Lift Ottoman Storage Base, £249.99
  - 1000 Pocket Sprung Mattress, £194.99
  - 3000 Pocket Sprung Mattress, £220.99
- **Designers, stagers and developers:**
  - Mayfair Wingback, £285.99
  - Chelsea Panel, £384.99
  - Fluted Velvet, £384.99
  - Savoy Channel, £379.99
  - Royal Chesterfield, £364.99
  - Harlington Wingback, £324.99
  - Headboards from £155.99
- **Holiday lets:**
  - Hampton Panel, £312.99
  - Windsor Chesterfield, £312.99
  - 2000 Pocket Sprung Pillow Top Mattress, £253.99
- **Never offer:** the "Memory Orthopaedic" mattress (trade brief rule).

**Search demand (OpenRush research_keywords, UK, 19 Nov, VERIFIED volumes):**
- "landlord beds": 30 a month
- "beds for rent": 390 (mixed intent)
- "hmo compliant": 90 (informational)
- "contract beds" and "hotel contract beds": 880 each, cost per click about $6. Not usable, because we cannot make contract or hotel claims.
- "HMO" head terms are informational: "hmo licence" 3,600 and "hmo requirements" 320.
- "hmo beds", "hmo furniture" and "trade beds": no exact volume returned, so UNKNOWN (not 0).

**Conclusion:** trade demand from search is small. The trade page is worth having as a place for referrals, replies and GBP visitors to land, and as a route that does not depend on cold email (PECR-safe). It will not be a big source of traffic.

**Documents buyers will ask for (WebSearch, 20 Nov; sources in the guide draft):**
- **Who the rules cover.** The Furniture and Furnishings (Fire) (Safety) Regulations 1988 (amended, including in 2025) apply to landlords and letting agents who supply furniture in lets. They cover beds, headboards and mattresses.
- **Mattresses, divans and bed bases** are exempt from the permanent label but are tested to BS 7177.
- **Other upholstered items, such as headboards,** generally need a permanent label.
- **Councils** enforce the rules.
- **Eagle Bed** has no labels or certificates on file, so this is owner questions 17–19. No page may claim compliance.

---

## I. Owner facts, trade page and landlord/HMO guide

### I1. Owner trade questions (`owner-trade-questions.md`)

The file has 23 short questions. Each one can be answered by ticking or filling in a blank.

- **Urgent:**
  - Q1–3: fabric per size, any extra charge for customer's own fabric, and where to send it
- **Prices:**
  - Q4: how trade prices are worked out
  - Q5: minimum order
  - Q6: prices shown with or without VAT
- **Paperwork:**
  - Q7: VAT invoice (note: Stage 5 found Shopify records £0 tax)
  - Q8: payment terms
  - Q9: trade account or quote per order
- **Making and delivery:**
  - Q10: lead times for 1, 5 and 10+ beds
  - Q11: several delivery addresses
  - Q12: assembly price for several beds
  - Q13: delivery on a set day
- **Products:**
  - Q14: which products suit rentals
  - Q15: hard-wearing fabric
  - Q16: non-standard sizes
- **Fire safety:** Q17–19
- **Returns and damage for trade:** Q20–21
- **Decisions:**
  - Q22: quote "same day" or "next working day"
  - Q23: whether customers can visit the workshop

The file does not repeat anything already answered: customer's own fabric accepted, VAT registered, assembly price, delivery terms, warranty, 300 kg.

### I2. Trade page draft (`trade-page-draft.html` and `trade-page-requirements.csv`)

**Sections (content-only page body):**
1. Intro
2. Who we work with
3. What we make
4. Landlords, letting agents and HMOs
5. Holiday lets and serviced accommodation
6. Designers and stagers (customer's own fabric accepted: "we will confirm the fabric quantity for your size")
7. Sizes and options
8. Delivery (BRIEF wording only)
9. Enquiry form
10. How a quote works
11. Contact (workshop address, phone, email, ABBAS TRADE LTD 16410472)
12. FAQs

**What the page leaves out, and why:**
- **Not on the page:**
  - trade prices or discounts
  - minimum order
  - lead times for several beds
  - VAT invoices or the VAT number (OA16 open)
  - payment terms
  - trade returns terms
  - workshop visits
  - registered office
  - any fire-safety claim
  - "hotel", "contract" or "care" wording
- **No hard-coded product prices.** Prices change; the page says the live price on each product page includes VAT.
- **Fire question in the FAQ.** The neutral answer is: "tell us which documents you need, and we will tell you what we can provide before you order."

**Form:**
- **Fields:**
  - business name
  - type of business (10 options)
  - contact name
  - business email
  - phone (optional)
  - product requirements
  - estimated quantity (1–999)
  - delivery postcode area (first half only, for data minimisation)
  - timeframe
  - notes
- **Validation:** HTML5 checks.
- **Privacy:** a privacy-notice line with a link.
- **Marketing consent:** a separate, unticked checkbox that is not needed to send the form.
- **Hidden fields:** `contact[tags]=trade,trade-page`.
- **Route:** Shopify contact form → Gmail → Inbox agent (every 2h) → HQ `leads` doc (stage New) → phone alert.
- **Measurement:** GA4 `generate_lead` fires only on the success state, never on the button click.

**Requirements:** 24 of 32 are READY and 8 are BLOCKED (R08, R12, R13, R14, R17, R26, R27, R29). R21 has one blocked part (the privacy-policy paragraph) and R28 another (VAT number, visits). R15, R18 and R30 can go live now, and gain detail once the owner answers.

**Preferred implementation (Theme Engineer):** a `page.trade` template with the Liquid section below, built on an unpublished theme copy. The owner publishes it, so Shopify's bot protection and success message apply:

```liquid
{%- comment -%} sections/trade-enquiry.liquid (draft, unpublished theme copy only) {%- endcomment -%}
<div id="trade-enquiry" class="page-width">
  {%- form 'contact', id: 'TradeEnquiryForm' -%}
    {%- if form.posted_successfully? -%}
      <p class="form__message" role="status">Thank you. We have your enquiry and will reply by email or phone.</p>
    {%- elsif form.errors -%}
      <div class="form__message" role="alert">{{ form.errors | default_errors }}</div>
    {%- endif -%}
    <input type="hidden" name="contact[tags]" value="trade,trade-page">
    <input type="hidden" name="contact[Source]" value="Trade page">
    {%- comment -%} Same fields, labels and validation as trade-page-draft.html section 9 {%- endcomment -%}
    <button type="submit" class="button">Send enquiry</button>
  {%- endform -%}
</div>
{% schema %}{ "name": "Trade enquiry form", "settings": [] }{% endschema %}
```

### I3. Landlord/HMO guide (C13) (`landlord-hmo-guide-draft.md`)

**What it covers:**
- matching the bed to the room (UK standard mattress sizes; the 6.51 m² one-person HMO minimum in England, with its source)
- storage: drawers or ottoman
- wear and tear (300 kg; 5-year frame warranty)
- planning replacements
- delivery to several properties (BRIEF delivery options)
- fire safety: 5 questions to ask **any** supplier about BS 7177 labels, permanent labels, certificates and customer's own fabric, plus keeping photos of labels
- a checklist, and links to the trade page and products

**BLOCKED markers (6):**
- our frame dimensions
- ottoman depth and opening
- trade warranty and returns terms
- hard-wearing fabric
- lead times
- several addresses and a set delivery day
- our fire documents

**Publishing order:** publish only after C12 (the trade page).

---

## J. Trade lead management (in the existing HQ `leads` collection; no new CRM)

### J1. Pipeline stages

| Stage | Meaning | Entry rule |
|---|---|---|
| New | An inbound enquiry (form, email, WhatsApp, phone) or a reply showing interest | Created by the Inbox agent |
| Qualified | Business type, products, quantity, postcode area and timeframe are known and suitable | Within 1 working day of New |
| Awaiting information | We or the buyer owe a detail. `waitingOn` says who | |
| Quote requested | The buyer wants a price, and the details are complete | |
| Quote prepared | The owner has priced it and the quote text or PDF is ready | |
| Quote sent | The quote has been emailed | Sets `followUpDue` = +3 working days |
| Follow-up due | No answer by day 3 (first follow-up) or day 7 (second and last) | |
| Negotiation | The buyer asks for changes | |
| Won | Paid order exists | `wonOrder` = Shopify order number |
| Lost | Declined, chose another supplier, or no answer 14 days after quote | `lostReason` |
| Not suitable | Undeliverable, opted out, outside the UK, a product we don't make, or a care/contract spec | `lostReason` |

### J2. Fields to add to existing `leads` docs

The existing fields stay as they are: `name, type, area, contact, why, fit, message, status, emailedAt, source, replyNote, bounceNote, bouncedAt, doNotContact`.

| Field | Values | Notes |
|---|---|---|
| `stage` | the 11 stages above, or empty | Empty means outreach only, not yet a lead |
| `stageAt` | ms timestamp | |
| `segment` | the 12 segments in `trade-market-research.csv` | |
| `channel` | cold-email · inbound-form · whatsapp · phone · referral | |
| `legalForm` / `legalFormSource` | ltd · llp · plc · charity · sole-trader · partnership · unknown / URL | Companies House |
| `lawfulBasis` | pecr-corporate · consent · inbound-enquiry · unknown-do-not-email | Drives the send gate |
| `marketingConsent` / `consentAt` | yes/no, date | From the form checkbox only |
| `waitingOn` | us · buyer · owner | |
| `requirements` | `{products, sizes, qty, fabric (own/ours), postcodeAreas[], timeframe}` | First half of postcode only |
| `quoteRef`, `quoteSentAt`, `quoteValueExVat`, `quoteValidUntil` | | Value excludes VAT (BRIEF: profit uses price ÷ 1.2) |
| `followUpDue`, `followUps` | date, count 0–2 | |
| `wonOrder`, `lostReason` | "#10xx" / text | |
| `nextAction`, `nextActionDue`, `assignee` | | |
| `retentionReviewAt` | last contact + 12 months | Delete or anonymise with no reply (Stage 1 7.4) |

### J3. Migrating existing statuses (`trade-lead-register.csv`, 332 rows)

| HQ status now | Count | Pipeline `stage` | Action |
|---|---|---|---|
| replied (Ivywell) | 1 | Awaiting information (`waitingOn: us`) | Overdue reply (G1) |
| contacted | 295 | empty (outreach only) | No second cold touch. A reply makes it New |
| of which: Ltd/LLP evidence recorded | 63 (incl. 2 untracked bounces) | | `lawfulBasis: pecr-corporate` |
| of which: legal form unknown | 251 | | `lawfulBasis: unknown-do-not-email` until a Companies House check |
| contacted, but hard-bounced in Gmail | 2 | Not suitable (undeliverable) | Set HQ `status: bounced` and `doNotContact: true` |
| bounced | 13 | Not suitable (undeliverable) | Keep suppressed |
| not interested (STOP) | 3 | Not suitable (opted out) | Permanent `doNotContact` |
| new (never contacted) | 18 | empty | Owner decides on phone calls after TPS/CTPS screening. Care home: Hold |

`contacted` leads are not moved to "New". That would turn 295 silent cold emails into fake pipeline.

### J4. Quote process and SLA (proposed; Q22 decides the customer-facing promise)

1. **Enquiry.** The Inbox agent creates or updates the lead (stage New) within 2 hours during 9am–9pm and alerts the owner.
2. **Qualify within 1 working day.** Reply using the Stage 3 template T-trade (already correct on assembly and customer's own fabric). Ask for anything missing, then set Qualified or Awaiting information.
3. **Owner prices it.** Target: within 2 working days of Qualified (proposal). The quote is built from the live product prices plus options (drop-off £29.99 and assembly £69.99 per bed, optional) and the owner's trade basis (Q4–Q6). Delivery: free across England, Scotland and Wales; £90 for NI, Jersey, Guernsey and the Isle of Man.
4. **Quote email (and an optional PDF later).** The template must include:
   - lines (design, size, fabric, quantity, unit price incl. VAT)
   - options
   - delivery
   - total incl. VAT and ex VAT
   - how long the quote is valid [BLOCKED: owner]
   - payment terms [BLOCKED: Q8]
   - lead time [BLOCKED: Q10]
   - returns [BLOCKED: Q20]
   - "ABBAS TRADE LTD trading as Eagle Bed, company 16410472"

   No fire claims. Stage `Quote sent`.
5. **Follow-up on working day 3 and day 7.** Each is one short message on the same thread: a reply to their request, not marketing. Stop as soon as they answer.
6. **Close.**
   - **Won:** they pay by Shopify checkout or invoice (Q8); record `wonOrder`.
   - **Lost:** declined, or no reply 14 days after the quote.
   - **After either:** no further marketing without consent.

**SLA summary:**
- Acknowledge and qualify within 1 working day.
- Quote within 3 working days of first contact (ESTIMATE target).
- Follow-ups on days 3 and 7.
- Each lead's next action is reviewed every Monday.

**Data fixes for the Email Marketing / Inbox owners (not done here, because Stage 7 is read-only):**
1. Mark Square Lettings and the Brighton agency as bounced.
2. Watch the 2 delayed sends.
3. Add the privacy-notice line and the "next working day" wording to `ops/email/trade-agent-brief.txt` after Q22.
4. Track replies and STOPs as separate fields in `outreach/day-*` (Stage 1 note, still open).

---

## Limitations

- **Delivered (299) is an ESTIMATE.** Gmail gives no delivery receipts.
- **Legal-form status comes from the text recorded in HQ.** It was not re-checked at Companies House. The 251 "unknown" leads may include limited companies.
- **Ivywell attachments** (5 images in the director's email) were not opened.
- **Segment mapping is by keyword.** Some leads could fit two segments.
- **The fire-safety summary is general guidance** from council and legislation.gov.uk search results (the statute was not re-read in full). It is not legal advice. The two-person HMO minimum is deliberately not quoted.
- **Keyword volumes come from OpenRush "ideas" mode.** Exact volumes for "trade beds", "hmo beds" and "hmo furniture" were not returned, so they are UNKNOWN, not 0.
- **Shopify does not show deleted pages,** so an old deletion of a trade page cannot be fully ruled out (no evidence of one).
- **Stage 6 OA19 and OA16** (trade page approval, VAT number public) are still open. They were not asked again here.

## Credits used

- **OpenRush:** 2 `research_keywords` calls (seeds "beds for landlords" and "hmo beds", United Kingdom), within the 8-credit cap. The tool did not return a per-call credit figure, so the exact debit is UNKNOWN. The reserve of 400 was not touched.
- **Free sources:**
  - Shopify GraphQL: 4 read queries
  - Gmail: 4 searches and 2 thread reads
  - HQ: 3 list reads
  - WebSearch: 3 queries
  - Site: 9 fetches, including `products.json`
