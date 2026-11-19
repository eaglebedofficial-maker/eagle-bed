# Stage 1, Parts 7 and 8: trade sales and the 66-member agency

Lead Finder, Email Marketing and Decision Council specialists. 19 Nov 2026. Read-only: no emails sent, drafted or labelled, nothing written to HQ, Shopify or Gmail.

**Sources pulled now (VERIFIED, 19 Nov):**
- HQ database: `leads` (271 docs), `outreach` (plan plus 6 day docs), `inbox` (8), `runs` (39 runs, 490 task docs), `worklog` (642), `memory`, `settings/main`
- Gmail, read-only: sent mail, bounces and replies since 10 Nov
- Shopify: orders since 10 Nov
- The scheduled-task list
- HQ page source `eagle-bed-hq.html` (`AGENTS`, `DEPTS`)

**Files read (HISTORICAL):** `ops/sales/*`, `ops/email/*`, `ops/BRIEF.md`, `ops/ceo/AUDIT-2026-11-19.md`.

---

## Summary for the owner

1. **Trade email has sent 253 emails in 6 working days (11–18 Nov).** They produced 1 interested reply, 0 quotes, 0 orders and £0 revenue. 3 businesses replied STOP and 13 addresses hard-bounced. That is too early to judge the channel, but it is not producing sales yet.
2. **The one real lead is an interior designer.** Interior designers and home stagers are the only segments with a positive signal. Hospitality (B&Bs, guest houses, holiday cottages) gave all 3 STOPs and most of the bounces.
3. **All 253 emails said "free delivery … with assembly by our own team".** That contradicts the owner's decision (19 Nov) that assembly is never free and costs £69.99. The brief and the task prompts are now fixed, but the claim has already gone out.
4. **18 local leads near Dewsbury were found on 10 Nov but never contacted.** They have phone numbers only. These are the closest buyers to the workshop and the cheapest to deliver to.
5. **Compliance gap (UK GDPR / PECR).** Current practice is probably fine for limited companies, but nothing checks whether a prospect is a sole trader or a partnership. Many B&Bs, holiday lets, small landlords and designers are. Under PECR, those need prior consent for marketing email. There is also no privacy notice link in the emails and no written legitimate-interests assessment.
6. **Agency: 66 members, of which about 15 do real, repeated work.** In the HQ task records:
   - 21 of 65 agents have never been given a task
   - 460 of 490 tasks are marked finished, but only 65 (13%) got a DONE or VERIFIED verdict
   - 332 (68%) were left "NEEDS VERIFICATION"

   The real sales work is done by scheduled tasks (Email Marketing, Inbox, Social), not by the HQ agents with the same names.
7. **About 60% of scheduled-task wake-ups are not Eagle Bed at all.** The "Trading HQ" watchdog runs hourly (168 a week) on the same account.

---

# PART 7: Trade sales

## 7.1 Funnel since 10 Nov (all trade outreach)

| Stage | Count | Label and source |
|---|---|---|
| Prospects in HQ `leads` | **271** | VERIFIED, HQ |
| Prospects never contacted | 18 (all from the 10 Nov Lead Finder list, phone or website only) | VERIFIED, HQ status "new", and no matching Gmail sent mail |
| Contacted (emailed) | **253** | VERIFIED, HQ `emailedAt`. Day docs agree: 38+36+33+35+39+72 = 253 |
| Contacted, cross-check in Gmail | 244 sent threads containing "Reply STOP" | VERIFIED, Gmail. Gap of 9 (3.6%). Possible causes: thread grouping, wording differences or retries. Not resolved. |
| Hard bounces | **13** (5.1%) | VERIFIED, Gmail. 12 are marked "bounced" in HQ. 1 more (a Brighton accommodation agency, 11 Nov, domain not found) is still "contacted" in HQ. |
| Soft bounces (delays still open) | 2 | VERIFIED, Gmail "Delay" notices on 18 Nov, not yet final |
| Delivered | **240** | ESTIMATE: 253 sent − 13 hard bounces. There are no delivery receipts, and open tracking is (correctly) off. |
| Auto-replies | 4 (out-of-office or "inbox not monitored"; one says the contact has left the business) | VERIFIED, Gmail |
| Human replies | **4** (1.7% of delivered) | VERIFIED, Gmail and HQ |
| Positive replies | **1** (0.4% of delivered) | VERIFIED. An interior design studio (Bristol) asked whether we use client-supplied fabric. The owner replied "Yes we do" on 17 Nov. |
| STOP / unsubscribe | **3** (1.25%) | VERIFIED. All 3 are set to `doNotContact` in HQ. |
| Qualified leads (named need and buying intent) | **1** | VERIFIED. The same design studio is waiting to send its designs, sizes and quantity. |
| Quotes sent | **0** | VERIFIED. No quote in HQ, the inbox docs or Gmail sent mail. |
| Trade orders | **0** | VERIFIED. Shopify has 5 orders since 10 Nov (#1039–#1043). All are consumer orders on webmail addresses. None matches a lead's domain. |
| Trade revenue | **£0** | VERIFIED |
| Profit | UNKNOWN | Product costs are not known |

**Follow-up status:**
- **The interested design studio.** Waiting on the prospect since 17 Nov, 2 days with no further reply. No follow-up is scheduled. The prospect has been told only "Yes we do", with no trade price list, no fabric quantity per size and no lead time.
- **Everyone else.** There is no second-touch sequence. Every contacted lead is "contacted" with no next step.
- **No conflict with the inbox agent.** It rightly treats STOP replies as "no draft, set doNotContact".

**Data issues to fix (for Stage 2):**
- Mark the Brighton bounce as "bounced" so it is never mailed again.
- The 10 Nov file `ops/sales/trade-leads-2026-11-10.md` has a banner saying "emails already sent on 10 Nov". Gmail and HQ both show that only 2 of its 20 leads were emailed (on 11 Nov). The banner is wrong.
- `outreach/day-*` "replies" totals 3, but that counts the STOPs. Reply and STOP fields should be kept separate.

## 7.2 By segment (VERIFIED from HQ `leads.type`, mapped by keyword)

| Segment | Prospects | Contacted | Hard bounced | STOP | Positive replies | Quotes | Orders | Revenue |
|---|---|---|---|---|---|---|---|---|
| Landlords (student/HMO landlords, student housing providers) | 14 | 13 | 0 | 0 | 0 | 0 | 0 | £0 |
| Letting agents | 85 | 76 | 1 (untracked in HQ) | 0 | 0 | 0 | 0 | £0 |
| Property managers | 2 | 2 | 0 | 0 | 0 | 0 | 0 | £0 |
| Holiday lets (cottage agencies, self-catering) | 40 | 39 | 1 | 1 | 0 | 0 | 0 | £0 |
| Interior designers | 16 | 16 | 1 | 0 | **1** | 0 | 0 | £0 |
| Home stagers | 8 | 7 | 0 | 0 | 0 | 0 | 0 | £0 |
| Serviced accommodation (serviced apartments, aparthotels) | 23 | 20 | 4 | 0 | 0 | 0 | 0 | £0 |
| Care homes (incl. supported living) | 20 | 19 | 0 | 0 | 0 | 0 | 0 | £0 |
| Other: hotels, B&Bs, guest houses, inns | 59 | 58 | 6 | 2 | 0 | 0 | 0 | £0 |
| Other: furniture-pack firms, property developers | 4 | 3 | 0 | 0 | 0 | 0 | 0 | £0 |
| **Total** | **271** | **253** | **13** | **3** | **1** | **0** | **0** | **£0** |

**Anonymised examples:**
- A Bristol interior design studio replied within 4 days asking about client-supplied (COM) fabric. This is the only real lead.
- A Scottish holiday-cottage business replied "STOP AND NEVER START SEND AGAIN". This is the strongest sign of annoyance so far.
- A Lake District small hotel and a North Wales guest house replied "STOP" within 30 minutes of sending.
- A Kent care home's auto-reply said the addressed contact had left the business. This shows that role addresses at small firms can still reach named individuals.
- 4 of 20 serviced-apartment addresses bounced (20%). Most came from third-party listings, not the firm's own website.

## 7.3 Which segments deserve more effort (Decision Council view)

The sample is tiny (1 positive reply in 240). None of the rates below is statistically meaningful. This is a judgement on fit, risk and early signal, not proof.

| Segment | Verdict | Why |
|---|---|---|
| **Interior designers and home stagers** | **More** | <ul><li>The only positive reply came from this segment (1 of 16, about 6%).</li><li>The "we upholster in your client's own fabric" offer is unique and owner-confirmed.</li><li>Higher-value beds.</li><li>Studios are often limited companies, so the PECR risk is lower, but legal form must be checked (7.4).</li></ul> |
| **Local West Yorkshire trade (letting agents, landlords, care homes, serviced apartments within about 25 miles)** | **More, by phone, not email** | <ul><li>The 18 phone-only leads have not been tried.</li><li>Our own delivery team is local, so a "we're 3 miles away, can bring a sample headboard" offer is credible.</li><li>No PECR consent issue for a call to a business number that is not on the TPS/CTPS. Screen against CTPS first.</li></ul> |
| **Letting agents and property managers (national)** | **Keep, but fix the offer** | <ul><li>76 delivered, 0 replies, 0 STOPs, near-zero bounces.</li><li>The audience is right; the email has no hook.</li><li>Agents rarely buy beds themselves. They refer landlords.</li><li>Try a landlord referral line or a "furnished-let bed pack" price, not "trade prices".</li></ul> |
| **Care homes** | **Hold** | <ul><li>Care buyers need contract-grade fire safety and infection-control (wipe-clean) specs.</li><li>Our compliance for that use is UNKNOWN, and the brief rightly bans fire-safety claims.</li><li>Do not push until the owner confirms which products meet the standards.</li></ul> |
| **Serviced accommodation, aparthotels** | **Less** | <ul><li>20% bounce rate and 0 replies.</li><li>Groups buy centrally through contract suppliers.</li></ul> |
| **Hotels, B&Bs, guest houses, holiday cottages** | **Less, then pause** | <ul><li>All 3 STOPs and 7 of 13 bounces came from these segments.</li><li>Highest share of sole traders and partnerships, so the highest PECR risk (7.4).</li></ul> |

## 7.4 UK GDPR and PECR review of B2B email

This is general guidance, not legal advice. It is based on the ICO's published guidance on electronic mail marketing and business-to-business marketing as I know it (HISTORICAL; ICO pages not re-fetched today). The owner should confirm the Data (Use and Access) Act 2025 changes and their start dates on ico.org.uk.

**The rules:**
- **PECR reg. 22: individual subscribers need consent.** Unsolicited marketing email to an "individual subscriber" needs prior consent, unless the soft opt-in for existing customers applies. Cold prospects never qualify for the soft opt-in. Individual subscribers include:
  - sole traders
  - partnerships in England, Wales and Northern Ireland (Scottish partnerships are separate legal persons and count as corporate)
- **PECR reg. 23: corporate subscribers can be emailed without consent.** Corporate subscribers are limited companies, LLPs, plcs, Scottish partnerships, charities that are companies, and public bodies. You must not hide who you are, and you must give a valid address for opt-outs. The ICO also expects you to keep a suppression list and honour objections.
- **UK GDPR still applies to company addresses that identify a person.** This covers a named person's address, or a generic address that in practice reaches one identifiable person, such as a sole trader's info@. For B2B cold email the lawful basis is normally legitimate interests (Art. 6(1)(f)). You need:
  - a written legitimate-interests assessment (LIA)
  - privacy information under Art. 14, at the latest with the first email (a short line with a link is enough)
  - the absolute right to object to direct marketing (Art. 21)

  The DUAA 2025 now says in the UK GDPR that direct marketing *may* be a legitimate interest. The balancing test is still required.
- **Fines.** The DUAA 2025 raises PECR fines to UK GDPR levels. Verify the exact start date.
- **Separate from data protection: advertising law.** Claims in trade emails must not mislead. This falls under the CAP Code and the consumer protection rules, now in the DMCC Act 2024, which mostly protect consumers. Sole traders can also be protected under the Business Protection from Misleading Marketing Regulations 2008.

**Is current practice compliant? (assessment of the brief `ops/email/trade-agent-brief.txt`, the task prompts and the 253 messages)**

| Requirement | Current practice | Verdict |
|---|---|---|
| Identify the sender | Business name, phone and website in every email | OK |
| Valid opt-out address | "Reply STOP" in all 253 emails. 3 of 3 STOPs set to `doNotContact`. | OK |
| Suppression of bounces | 12 of 13 bounces suppressed; 1 missed | Minor gap |
| Corporate vs individual subscriber check | The brief says "skip sole traders who are clearly individuals". Nothing checks legal form. | **Gap.** Hospitality (97 contacted), small landlords (13) and some designers and stagers are often sole traders or partnerships. If a business has no Ltd, LLP or charity number, treat it as an individual subscriber: **no cold email**. ESTIMATE: up to about 110 of 253 sends went to segments where sole traders are common. The real number is UNKNOWN until each lead is checked at Companies House. |
| Only role addresses, no named people | Yes (info@, enquiries@, hello@ and similar; no named-person addresses found among the 253) | OK |
| Art. 14 privacy information | No privacy link in any of the 253 messages (VERIFIED: text search) | **Gap** |
| Written LIA | None found in the repo or HQ | **Gap** |
| Retention of lead data | No rule. Leads keep full email text indefinitely. | Gap (set, for example, 12 months after last contact) |
| Truthful offer | 251 emails said "assembly by our own team" and 2 said "assembling the bed on delivery", next to "free delivery". This reads as free assembly, against the owner's 19 Nov rule (£69.99, never free). The brief was corrected on 19 Nov (git `3eb1e24`). | **Gap, already sent.** Correct it in any reply or quote. Do not send a mass correction email; that would be more unsolicited marketing. |
| Sending infrastructure | Personal Gmail address, ramping to 200 a day | Not a legal breach, but a deliverability and account risk (cold-email best practice: a separate sending domain, verified lists) |

**What to change (Stage 2 proposals; do not act until the owner approves):**
1. **Add a legal-form gate before any email.** For each prospect, look up Companies House (or the Charity Commission). Email only Ltd, LLP, plc, charitable companies, Scottish partnerships and public bodies. Record `legalForm` and its source on the lead.
2. **Stop cold-emailing sole-trader-heavy segments by default.** These are B&Bs, guest houses, holiday cottages and individual landlords. Reach them only by:
   - phone (after TPS/CTPS screening)
   - post
   - inbound routes (trade page, Google Business Profile, local directories)
3. **Review the 253 already contacted.** Flag any that turn out to be sole traders or partnerships as `doNotContact` (no further email). No apology mailing.
4. **Add one footer line:** "We use your business contact details to offer trade prices. Privacy notice: [link]. Reply STOP to opt out." Publish a short B2B section in the store privacy policy.
5. **Write a one-page LIA** (purpose, necessity, balancing, safeguards) and keep it in `ops/email/`.
6. **Make `doNotContact` permanent and global.** Keep a suppression list collection in HQ covering STOPs, hard bounces and objections. Check it before every send.
7. **Set a retention rule.** Delete or anonymise leads 12 months after last contact with no reply.
8. **Answer the design studio properly.** Send a trade quote with true assembly wording ("optional room-of-choice assembly £69.99").

---
# PART 8: The 66-member agency

## 8.1 What was checked

- **Roster.** `AGENTS` in `eagle-bed-hq.html` has 65 agents. With the Manager that makes 66, matching `ops/ceo/AUDIT-2026-11-19.md` (VERIFIED).
- **Departments.** `DEPTS` puts 63 agents into 8 departments. **Email Marketing and Lead Finder's twin are not in any department.** Email Marketing has no department. Lead Finder sits in "Customers & Channels".
- **Settings.** `settings/main` (VERIFIED, version 35):
  - `agentsOff = ["teardown"]`
  - `review: true`, `conc: 3`, `autopilot: true`, `autoPost: false`
  - `autoCinema: false`, paused 19 Nov because Gemini is out of credit
- **Work evidence.** 490 task docs from 28 runs. 3 more runs had no tasks, and 8 small CEO and old runs were not read. Some big runs may hold more than the 32 tasks returned. Plus 642 worklog entries. 460 tasks have status "done", but their QA verdicts were:

  | Verdict | Tasks | Share |
  |---|---|---|
  | NEEDS VERIFICATION | 332 | 68% |
  | BLOCKED | 66 | 13% |
  | DONE | 61 | 12% |
  | REASSIGNED | 15 | 3% |
  | VERIFIED | 4 | 1% |
  | none | 12 | 2% |

  Worklog "applied" entries (real changes made to the store), by agent:

  | Agent | Applied entries |
  |---|---|
  | On-Page SEO | 16 (+2 more by Claude Code) |
  | Product Pages | 11 |
  | Technical SEO | 5 |
  | Claude Code (CEO and SEO) | 3 |

- **What an agent is.** The audit found that an agent is a prompt plus read-only tools. It works only when the Manager hands it a task, and each task costs 2 Claude calls because `review:true`.

## 8.2 Responsibility matrix (66)

How to read the columns:
- **Data sources / integrations:** OpenRush = SEO, search results, backlinks. GSC and GA4 come through OpenRush. Shopify is read-only for all agents except: New Products (creates drafts) and On-Page SEO (title fixes, plus `fixSuffixes` on page load). Zapier Google Ads is a read-only report.
- **Scheduled task link:** the cloud task that does the real-world version of the job, if any.
- **Work completed:** VERIFIED from HQ `runs/*/tasks` and `worklog`, read now.
- **Business impact:**
  - measurable = tied to a number you can check (spend saved, changes live, leads, orders)
  - supporting = useful analysis or plans for sales work
  - operational = keeps the system honest or running
  - none = no finished output, or blocked
- **Group** is the primary class of 7. Many agents also fit a second class; see 8.3.

| Agent | Department | Responsibilities | Data sources / integrations | Scheduled task link | Status | Work completed (evidence) | Business impact | Cost driver | Duplicates | Missing capability | Group |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Manager | (all) | Plans orders, hands out tasks, checks reports, writes Master Audit | all | CEO sprint Mon/Thu; autoResume | on | 39 runs, 490 tasks read | operational | 1 complex plan + 6 complex report calls per order | CEO sprint, Daily Autopilot | owner-approved priorities | 7 Needs better coordination |
| Keyword Research | Search & AI | Builds the UK keyword database, intent, demand, CPC and the keyword-to-URL map. | GSC (OpenRush), OpenRush, Shopify | Weekly Google check (overlap) | on | 12 done/13 tasks, last 28 Oct | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | cluster, content, sxo | live keyword volumes need OpenRush credits | 2 Supports commercial |
| On-Page SEO | Search & AI | Titles, metas, headings, internal links and page relevance | GSC (OpenRush), OpenRush, Shopify | Weekly Google check; autopilot step 3 | on | 20 done/20 tasks, 18 applied, last 17 Nov | measurable | HQ task = 2 Claude calls (review:true) + OpenRush credits | product, drift, media | before/after GSC tracking per change | 1 Measurable value |
| Technical SEO | Search & AI | Crawl, indexation, canonicals, sitemap, speed and structured data | GSC (OpenRush), OpenRush, Shopify | Autopilot step 3/4 | on | 44 done/47 tasks, 2 blocked, 5 applied, last 30 Oct | operational | HQ task = 2 Claude calls (review:true) + OpenRush credits | perf, drift, sitewatch, schema | real CWV field data | 3 Operational |
| Content Creation | Search & AI | Buying guides, topic clusters and articles that lead to products. | GSC (OpenRush), OpenRush, Shopify | - | on | 16 done/19 tasks, 2 blocked, last 17 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | keyword, cluster | publishing rights (drafts only) | 2 Supports commercial |
| Product Pages | Revenue & Conversion | Makes every product page a revenue page | GSC (OpenRush), OpenRush, Shopify | Autopilot step 3 | on | 26 done/29 tasks, 3 blocked, 11 applied, last 17 Nov | measurable | HQ task = 2 Claude calls (review:true) + OpenRush credits | onpage, media | per-product conversion tracking | 1 Measurable value |
| New Products | Offer & Merchandising | Finds best-selling and trending bed and mattress designs UK competitors sell that Eagle Bed doesn't, then creates 3–5 or… | OpenRush, Shopify | Skill eagle-bed-new-product-agent (manual) | on | 1 done/1 tasks, last 10 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | research, spy | product cost data | 2 Supports commercial |
| Off-Page & PR | Search & AI | Earns real links and press | OpenRush | - | on | 9 done/9 tasks, last 17 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | links | outreach channel (it cannot send pitches) | 6 Needs better instructions |
| Link Scanner | Search & AI | Watches Eagle Bed's backlinks | OpenRush | - | on | 6 done/6 tasks, last 20 Oct | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | offpage | - | 4 Duplicate |
| Spy Agent | Search & AI | Competitor intelligence and SERP battles | OpenRush | - | on | 7 done/7 tasks, last 20 Oct | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | teardown, research | - | 4 Duplicate |
| AI Search | Search & AI | Gets Eagle Bed cited in Google AI Overviews and AI answers. | GSC (OpenRush), OpenRush | Monday AI check (cinema task, Gemini 402) | on | 4 done/4 tasks, last 20 Oct | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | airec, aiplat, agentseo | working AI-visibility source (Gemini out of credit) | 4 Duplicate |
| Google Ads | Paid Growth | Cuts wasted spend, finds profitable keywords, builds the paid-to-organic list. | GA4 (OpenRush), OpenRush, Shopify, Zapier Google Ads | Autopilot step 7 (Mon); CEO sprint | on | 29 done/31 tasks, 2 blocked, last 16 Nov | measurable | HQ task = 2 Claude calls (review:true) + OpenRush credits + Zapier tasks | searchterms, adcreative, shopping | write access is owner-only (by design) | 1 Measurable value |
| Google Shopping | Paid Growth | Product feed, Merchant Center health and Shopping performance. | OpenRush, Shopify, Zapier Google Ads | - | on | 12 done/12 tasks, last 10 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits + Zapier tasks | ads | Merchant Center connector | 2 Supports commercial |
| Store Designer / CRO | Revenue & Conversion | Turns visitors into buyers | GA4 (OpenRush), OpenRush, Shopify | - | on | 33 done/35 tasks, 1 blocked, last 17 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | persona, access, checkout | A/B test tool | 2 Supports commercial |
| Analytics | Data & QA | KPI baselines, funnel, alerts and weekly reporting. | GA4 (OpenRush), GSC (OpenRush), OpenRush, Shopify, Zapier Google Ads | Daily report; weekly report | on | 43 done/45 tasks, 2 blocked, last 17 Nov | operational | HQ task = 2 Claude calls (review:true) + OpenRush credits + Zapier tasks | tracking, scout, profit | single source of truth for UK-only metrics | 3 Operational |
| Social Media | Social & Video | Facebook, Instagram, TikTok, YouTube and Google profile | Shopify | Social post 3x/day; autopilot step 6 | on | 6 done/6 tasks, last 06 Nov; posts via scheduled task | supporting | Zapier 4 tasks/post + Opus session 3x/day | instagram, tiktok, youtube, pinterest, videoseo | reach/engagement data back into HQ | 7 Needs better coordination |
| Video & Music Studio | Social & Video | Makes one short vertical video a day (1080x1920, 10-20 seconds) of a real Eagle Bed bed with attractive background music… | Shopify | Autopilot step 6b | on (superseded) | 1 done/1 tasks, last 09 Nov | none | HQ task = 2 Claude calls (review:true) | cinema, higgsfield | phone photos from owner | 5 Resource without benefit |
| Higgsfield AI Studio | Social & Video | Runs the OpenHiggsfield AI film studio | GA4 (OpenRush), Shopify | - | blocked | 1 done/1 tasks | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | cinema, studio | platform key (never configured) | 5 Resource without benefit |
| Cinematic AI Director | Social & Video | Plans cinematic AI videos of real beds with OpenHiggsfield | Shopify | Cinema 08:46/17:46 (autoCinema=false since 19 Nov) | blocked | 1 done/1 tasks | none | 2 runs/day (now stop early) + Gemini | higgsfield, studio | Gemini credit | 5 Resource without benefit |
| AI Recommendations | Search & AI | Gets Eagle Bed named when UK buyers ask ChatGPT, Gemini, Meta AI, Claude, Copilot or Google AI Overviews for a bed ('bes… | GSC (OpenRush), OpenRush, Shopify | Monday AI check | on | 4 done/4 tasks, last 17 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | ai, aiplat | working AI-visibility source | 4 Duplicate |
| Agentic SEO | Search & AI | Uses the Claude SEO skills (seo-agentic, seo-geo, seo-technical, seo-schema, seo-ecommerce, seo-local, seo-content) to m… | OpenRush, Shopify | Autopilot step 9d (Mon) | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | ai, technical | - | 4 Duplicate |
| Instagram Growth | Social & Video | Grows Eagle Bed's Instagram (@eaglebed.co.uk) into sales | GA4 (OpenRush), Shopify | Autopilot step 9b (Mon) | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | social | IG insights | 4 Duplicate |
| YouTube Channel | Social & Video | Runs the Eagle Bed YouTube channel | Shopify | Autopilot step 9c (Mon) | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) | social, videoseo | YouTube analytics | 4 Duplicate |
| Customer Finder | Customers & Channels | Finds people ready to buy a bed and brings them to eaglebed.co.uk the honest way | GA4 (OpenRush), OpenRush, Shopify | Autopilot step 9a (daily) | on | 6 done/6 tasks, last 17 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | closer, leadfinder | abandoned-checkout list (blocked export) | 6 Needs better instructions |
| Reviews & Trust | Revenue & Conversion | Genuine reviews, E-E-A-T and trust signals. | OpenRush, Shopify | - | on | 9 done/9 tasks, last 17 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | - | review platform connector | 2 Supports commercial |
| Local SEO | Search & AI | Google Business Profile and real local presence only. | OpenRush | - | on | 11 done/11 tasks, last 17 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | brandseo | GBP write access / owner listing time | 6 Needs better instructions |
| Image & Video SEO | Offer & Merchandising | Alt text, image speed, Google Images and video plans. | OpenRush, Shopify | - | on | 7 done/7 tasks, last 20 Oct | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | onpage, product, videoseo | - | 4 Duplicate |
| AI Platforms | Search & AI | Gets Eagle Bed's products and brand found in ChatGPT, Gemini, Microsoft Copilot/Bing and Perplexity | OpenRush, Shopify | - | on | 7 done/7 tasks, last 17 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | ai, airec | Bing Webmaster data | 4 Duplicate |
| Schema Markup | Search & AI | Uses the seo-schema skill | OpenRush, Shopify | - | on | 3 done/3 tasks, last 17 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | technical | theme write path (codequeue only) | 6 Needs better instructions |
| Search Experience | Search & AI | Uses the seo-sxo skill | GA4 (OpenRush), GSC (OpenRush), OpenRush, Shopify | - | on | 1 done/1 tasks, last 28 Oct | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | keyword, cluster | - | 4 Duplicate |
| Speed & Core Web Vitals | Search & AI | Uses the Claude SEO speed checklists | GA4 (OpenRush), GSC (OpenRush), OpenRush, Shopify | - | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | technical, sitewatch | CrUX/PageSpeed data | 4 Duplicate |
| SEO Drift Watch | Search & AI | Uses the seo-drift skill | GSC (OpenRush), OpenRush, Shopify | - | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | onpage, sitewatch | baseline store | 4 Duplicate |
| Topic Clusters | Search & AI | Uses the seo-cluster skill | GSC (OpenRush), OpenRush, Shopify | - | on | 1 done/1 tasks, last 28 Oct | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | keyword, content | - | 4 Duplicate |
| Checkout Doctor | Revenue & Conversion | Owns the gap between basket and paid order, the most expensive leak in the business | GA4 (OpenRush), Shopify | - | on | 24 done/27 tasks, 3 blocked, last 17 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | cro, sitewatch | real browser test run | 2 Supports commercial |
| Sales Closer | Revenue & Conversion | Beds over £300 are often sold by conversation | Shopify | Inbox agent (overlap) | on | 9 done/11 tasks, 2 blocked, last 17 Nov | supporting | HQ task = 2 Claude calls (review:true) | care, customers, Inbox task | sending rights (drafts only) | 7 Needs better coordination |
| Offer & Pricing | Offer & Merchandising | Designs offers that raise profit, not just sales | OpenRush, Shopify | - | on | 7 done/7 tasks, last 17 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | seasons, profit | product cost data | 2 Supports commercial |
| Email & SMS | Customers & Channels | Recovers sales the store already earned, using Omnisend (installed) | GA4 (OpenRush), Shopify | - | on | 16 done/16 tasks, last 17 Nov | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | emailmkt | Omnisend connector | 6 Needs better instructions |
| Brand SEO | none (not in DEPTS) | Makes sure a search for 'Eagle Bed' shows Eagle Bed first | GSC (OpenRush), OpenRush, Shopify | - | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | local | - | 4 Duplicate |
| Video & Voice SEO | none (not in DEPTS) | Makes the twice-daily cinematic videos rank | GSC (OpenRush), OpenRush, Shopify | - | on | 1 done/1 tasks, last 17 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | youtube, media | - | 4 Duplicate |
| Email Marketing | none (not in DEPTS) | Runs Eagle Bed's trade email marketing every weekday at 10am UK | Shopify | Email Marketing 09:53 + top-up 14:23 (weekdays) | on | 253 trade emails 11-18 Nov via scheduled task; 1 qualified lead | measurable | 2 runs/day + up to 4-10 sub-agents, ~1 web search per lead | leadfinder | legal-form check, suppression list, quote tracking | 1 Measurable value |
| Lead Finder | Customers & Channels | Brings orders by finding real buyers | OpenRush, Shopify | (none: real work is inside the Email Marketing task) | on | 20 local leads 10 Nov (18 phone-only, never contacted) | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | emailmkt, customers | phone-call workflow for phone-only leads | 7 Needs better coordination |
| Marketplaces | Customers & Channels | Finds low-cost extra sales channels where UK bed buyers already shop | OpenRush, Shopify | - | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | - | marketplace accounts/connectors | 5 Resource without benefit |
| Tracking & Measurement | Data & QA | From The Agency's Tracking & Measurement Specialist | GA4 (OpenRush), GSC (OpenRush), Shopify, Zapier Google Ads | - | on | 14 done/16 tasks, 2 blocked, last 17 Nov | operational | HQ task = 2 Claude calls (review:true) + OpenRush credits + Zapier tasks | analytics | GTM/GA4 admin access | 3 Operational |
| Search Terms & Negatives | Paid Growth | From The Agency's Search Query Analyst | OpenRush, Shopify, Zapier Google Ads | Autopilot step 7 (Mon) | on | 1 done/2 tasks, 1 blocked, last 09 Nov | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits + Zapier tasks | ads | - | 4 Duplicate |
| Ad Creative | Paid Growth | From The Agency's Ad Creative Strategist | OpenRush, Shopify, Zapier Google Ads | - | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) + OpenRush credits + Zapier tasks | ads | - | 4 Duplicate |
| Buyer Walkthrough | Revenue & Conversion | From The Agency's Persona Walkthrough Specialist | GA4 (OpenRush), OpenRush, Shopify | - | on | 2 done/2 tasks, last 30 Oct | supporting | HQ task = 2 Claude calls (review:true) + OpenRush credits | cro, checkout | - | 4 Duplicate |
| Accessibility | Revenue & Conversion | From The Agency's Accessibility Auditor | OpenRush, Shopify | - | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | cro, theme | - | 4 Duplicate |
| CGI Product Photos | Offer & Merchandising | Uses the CGI studio and the nano-banana-2 and Pollinations image skills (run by Claude Code) to plan product photos | Shopify | - | blocked | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) | cinema | Gemini credit | 5 Resource without benefit |
| Theme Engineer | Revenue & Conversion | Owns the ABBAS 3D Shopify theme code in the repository (Claude Code maps it with graphify and checks changes with the EC… | OpenRush, Shopify | codequeue -> autopilot 07:47 | on | 7 done/7 tasks, last 17 Nov | operational | HQ task = 2 Claude calls (review:true) + OpenRush credits | perf, cro | preview-theme QA | 3 Operational |
| Competitor Teardown | Offer & Merchandising | Uses the REA reverse-engineering skill (run by Claude Code) and live Google results to study how leading UK bed sites se… | OpenRush | - | off | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | spy, research | - | 5 Resource without benefit |
| TikTok Growth | Social & Video | From The Agency's TikTok Strategist | GA4 (OpenRush), Shopify | - | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | social | TikTok analytics | 4 Duplicate |
| Pinterest | Social & Video | Pinterest already sends bedroom-ideas visitors | GA4 (OpenRush), OpenRush, Shopify | Pin queue (autopilot) | on | 0 HQ tasks | none | Zapier 4 tasks/post + Opus session 3x/day | social | Pinterest analytics | 4 Duplicate |
| Reddit, Quora & Forums | Social & Video | From The Agency's Reddit Community Builder | OpenRush, Shopify | - | on | 2 done/3 tasks, 1 blocked, last 17 Nov | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | offpage | posting is manual (by design) | 6 Needs better instructions |
| Weekly Issue Scout | Data & QA | Every Monday checks the whole week (sales funnel, Board, watchdog alerts, Claude Code jobs, social posts, videos, SEO ch… | GA4 (OpenRush), GSC (OpenRush), Shopify, Zapier Google Ads | Auto on Mondays (HQ page) | on | 0 HQ tasks | operational | HQ task = 2 Claude calls (review:true) + OpenRush credits + Zapier tasks | analytics, CEO sprint | - | 3 Operational |
| Verification / QA | Data & QA | Checks every report for invented data, conflicts and missing evidence. | OpenRush, Shopify | - | on | 48 done/48 tasks, last 17 Nov | operational | HQ task = 2 Claude calls (review:true) + OpenRush credits | Manager review step | - | 3 Operational |
| Workshop Planner | Operations & Workshop | Turns paid orders into a weekly make plan for the Dewsbury workshop | Shopify | - | blocked | 0 done/1 tasks, 1 blocked, last 17 Nov | none | HQ task = 2 Claude calls (review:true) | stock, seasons | make-time data from owner | 6 Needs better instructions |
| Materials & Demand | Operations & Workshop | Forecasts which beds, sizes and colours will sell in the next 4-8 weeks from real Shopify sales, ranks products A/B/C by… | Shopify | - | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) | workshop | materials/stock data | 5 Resource without benefit |
| Quality Control | Operations & Workshop | Logs every defect, complaint and return reason against the bed, order and supplier, contains the problem first, then fin… | Shopify | - | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) | delivery, care | returns/complaints log | 5 Resource without benefit |
| Delivery & Returns | Operations & Workshop | Keeps every delivery promise | Shopify | - | blocked | 0 done/1 tasks, 1 blocked, last 17 Nov | none | HQ task = 2 Claude calls (review:true) | care | lead-time data from owner | 6 Needs better instructions |
| Brand Voice | Social & Video | Builds one Eagle Bed VOICE PROFILE from our own real words (best product pages, posts that sold, the owner's replies to … | OpenRush, Shopify | - | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | copy rules in every prompt | - | 5 Resource without benefit |
| Market Research | Offer & Merchandising | Decision-grade research on the UK bed market | OpenRush, Shopify | - | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) + OpenRush credits | spy, teardown | - | 4 Duplicate |
| Decision Council | Data & QA | For big go/no-go calls (a price change, a new sales channel, a bigger ad budget, a new product line, a costly feature) | OpenRush, Shopify, Zapier Google Ads | - | on | 0 HQ tasks | none | HQ task = 2 Claude calls (review:true) + OpenRush credits + Zapier tasks | CEO sprint | cost/margin data | 5 Resource without benefit |
| Site Health Watch | Data & QA | After every theme or app change, checks that the home page, a top collection, a best seller, the basket and checkout sti… | GA4 (OpenRush), GSC (OpenRush), OpenRush, Shopify | - | on | 6 done/6 tasks, last 17 Nov | operational | HQ task = 2 Claude calls (review:true) + OpenRush credits | technical, perf, drift | browser test runner | 3 Operational |
| Profit & Cash | Data & QA | Knows what each sale is really worth | Shopify, Zapier Google Ads | - | on | 3 done/4 tasks, 1 blocked, last 10 Nov | none | HQ task = 2 Claude calls (review:true) + Zapier tasks | offer | product cost data (UNKNOWN) | 6 Needs better instructions |
| Customer Care | Customers & Channels | Looks after customers after they pay | GA4 (OpenRush), Shopify | Inbox agent every 2h (real work) | on | 0 HQ tasks; Inbox task: 8 threads handled, 1 swatch enquiry later ordered (#1043) | measurable | 7 runs/day in a shared long session | closer, Inbox task | - | 1 Measurable value |
| Seasons & Promotions | Offer & Merchandising | Plans the trading calendar so the busy weeks are ready early | OpenRush, Shopify, Zapier Google Ads | - | blocked | 0 done/2 tasks, 2 blocked, last 17 Nov | none | HQ task = 2 Claude calls (review:true) + OpenRush credits + Zapier tasks | offer, workshop | make-time data from owner | 6 Needs better instructions |

## 8.3 The seven groups

| # | Group | Members | Count |
|---|---|---|---|
| 1 | **Measurable value** | <ul><li>Google Ads: paused the Search campaign that spent £148.33 with 0 conversions in 30 days (HISTORICAL, worklog 28 Oct)</li><li>On-Page SEO: 16 applied title/meta changes</li><li>Product Pages: 11 applied</li><li>Email Marketing: 253 sends, 1 qualified lead</li><li>Customer Care: through the Inbox task. Replies to 8 threads; 1 swatch enquirer later ordered #1043, £539.97. Attribution is partial.</li></ul> | 5 |
| 2 | **Supports commercial work** | Keyword Research, Content Creation, New Products, Google Shopping, Store Designer/CRO, Reviews & Trust, Checkout Doctor, Offer & Pricing | 8 |
| 3 | **Operational** | Technical SEO, Analytics, Tracking & Measurement, Theme Engineer, Weekly Issue Scout, Verification/QA, Site Health Watch | 7 |
| 4 | **Duplicate** (a same-cluster agent already covers the job) | <ul><li>AI search: AI Search, AI Recommendations, AI Platforms, Agentic SEO</li><li>Social: Instagram, YouTube, TikTok, Pinterest, Video & Voice SEO</li><li>Technical: Speed & CWV, SEO Drift Watch</li><li>Keyword: Topic Clusters, Search Experience</li><li>Image & Video SEO</li><li>Brand SEO</li><li>Link Scanner</li><li>Competitor: Spy Agent, Market Research</li><li>Ads: Search Terms, Ad Creative</li><li>Conversion: Buyer Walkthrough, Accessibility</li></ul> | 22 |
| 5 | **Resource without benefit** (no output, or blocked by a missing key or credit) | Video & Music Studio, Higgsfield AI Studio, Cinematic AI Director, CGI Product Photos, Marketplaces, Competitor Teardown (OFF), Materials & Demand, Quality Control, Brand Voice, Decision Council | 10 |
| 6 | **Needs better instructions** (blocked waiting for owner data, or asked for things its tools cannot do) | <ul><li>Off-Page & PR (cannot send pitches)</li><li>Customer Finder (abandoned-checkout export blocked)</li><li>Local SEO (needs the owner to create listings)</li><li>Schema Markup (no theme write path)</li><li>Email & SMS (no Omnisend connector)</li><li>Reddit/Quora (posting is manual)</li><li>Workshop Planner, Delivery & Returns, Seasons & Promotions (all need owner make-time and lead-time data)</li><li>Profit & Cash (product costs UNKNOWN)</li></ul> | 10 |
| 7 | **Needs better coordination** | <ul><li>Lead Finder and Email Marketing: the HQ agent and the scheduled task are separate, and 18 local leads fell between them.</li><li>Social Media and the 3x-a-day task plus the HQ `autopilotTick`: double-post risk.</li><li>Sales Closer, Customer Care and the Inbox task.</li><li>Manager vs CEO sprint vs Daily Autopilot vs `autoResume`: three runners for one queue.</li></ul> | 4 |
| | **Total** | | **66** |

**Key facts behind the groups (VERIFIED):**
- **21 agents have 0 HQ tasks.** Agentic SEO, Instagram, YouTube, Speed, Drift, Brand SEO, Email Marketing, Lead Finder, Marketplaces, Ad Creative, Accessibility, CGI, Teardown, TikTok, Pinterest, Weekly Issue Scout (it runs a separate scan, `scanWeek`, instead), Materials, Quality, Brand Voice, Market Research, Decision Council.
- **6 more have only blocked tasks or a single task.** Workshop, Delivery and Seasons are all blocked waiting for the same owner data (make times and lead times).
- **About two-thirds of finished HQ work comes from 10 agents.** QA 48, Technical 44, Analytics 43, CRO 33, Ads 29, Product 26, Checkout 24, On-Page 20, Content 16, Email & SMS 16. That is 299 of the 460 tasks with status "done".

**Missing capabilities across the agency** (none of these needs a new agent):
- product cost data, needed for profit and offers
- a quote and trade-order record (there is no "quotes" collection)
- a suppression list and a legal-form check for outreach
- a phone-call workflow for phone-only leads
- an Omnisend or email-flow connector
- a Gemini top-up, or another image and video source
- a theme write and QA path other than the 07:47 `codequeue`
- owner-supplied make times and lead times

## 8.4 Scheduled tasks currently enabled (VERIFIED, read-only list, 19 Nov)

12 enabled, 1 disabled (the old 09:00/13:00/18:00 social task). Fires per week are worked out from each schedule (ESTIMATE). Claude usage per run is UNKNOWN, because the platform does not report it per task.

| # | Task | Schedule (UK) | Fires/week | What it does | What it costs |
|---|---|---|---|---|---|
| 1 | **Trading HQ watchdog** | hourly, :01 (UTC) | **168** | Runs a cycle of a *different* app ("Trading HQ", artifact HvGS…). Not Eagle Bed. | 60% of all fires on the account. Session …KwUK. |
| 2 | Trading HQ next cycle | one-off 19 Nov 04:32 UTC | 0–1 | Same app, one-off wake-up | Small |
| 3 | Eagle Bed social post | 08:41 / 12:41 / 17:41 daily | 21 | 3 photo posts a day to FB, IG and TikTok via Zapier. Keeps 7 days of posts. Caption rules updated for £69.99 assembly (VERIFIED in prompt). | **Fresh session each time, pinned to Opus, 7 connectors.** About 4 Zapier tasks per post (about 360 a month of the 750 cap). |
| 4 | Cinema 4K videos | 08:46 / 17:46 daily | 14 | Video autopilot | `autoCinema=false` since 19 Nov, so each run should stop at step 2. Still 14 wake-ups a week in session …UwSR. Gemini is out of credit. |
| 5 | Daily monitoring & autopilot | 07:47 daily | 7 | Monitor, alerts, apply READY items, registry, social check, photo-video docs, Monday ads, Customer Finder / IG / YouTube / Agentic SEO | Up to 3 background sonnet agents for HQ jobs + 2 for registry items. OpenRush credits. Shares the long session …UwSR. |
| 6 | Weekly Search Revenue report | Mon 08:52 | 1 | Weekly organic and paid review, next actions | OpenRush credits. Session …UwSR. |
| 7 | **Email Marketing agent** | Mon–Fri 09:53 | 5 | Replies, bounces, STOPs, then sends today's target (80/day now; 140 from 25 Nov; 200 from 2 Dec) | ceil(target/20) sub-agents per run: 4 now, 7 from 25 Nov, 10 from 2 Dec. About 1 web search per business. Session …M81b. |
| 8 | Email Marketing top-up | Mon–Fri 14:23 | 5 | Fills the shortfall in the daily target | More sub-agents. Same session. |
| 9 | Inbox agent | 09:07–21:07 every 2h | 49 | Drafts replies, records them in HQ, phone alert | Small per run, but 7 a day in the same long session …M81b, so its context keeps growing |
| 10 | Daily report | 23:59 daily | 7 | One gathering agent, then an email to the owner, a push alert and an HQ worklog entry | 1 sub-agent + 1 Gmail send a day |
| 11 | CEO sprint | Mon and Thu 10:23 | 2 | Runs queued HQ tasks or plans a new sprint | Several jobs per run. OpenRush. Zapier Ads report. |
| 12 | Weekly Google growth check | Mon 11:17 (new 19 Nov) | 1 | GSC queries and pages, up to 3 search-result checks, safe SEO fixes | **≤40 OpenRush credits a week** (about 170 a month) |

**Total about 280 wake-ups a week (ESTIMATE).** Eagle Bed's own tasks are about 112, and 49 of those are the inbox agent. Four Eagle Bed tasks share session …M81b and three share …UwSR, so those contexts grow all day.

## 8.5 Architecture improvements (keep all 66; no agents added or removed)

These are proposals for the owner to approve in Stage 2. Nothing has been changed.

**A. One lead agent per cluster.** The Manager routes every cluster task to the lead first. The others become "specialist notes" that the lead may call, or are pulled into its prompt.

| Cluster | Lead | Members routed through the lead |
|---|---|---|
| Search core | On-Page SEO | Keyword, Content, Topic Clusters, Search Experience, Image & Video SEO, Product Pages (copy) |
| Technical | Technical SEO | Speed & CWV, Drift, Site Health, Schema, Theme Engineer (code) |
| AI visibility | AI Recommendations | AI Search, AI Platforms, Agentic SEO, Brand SEO, Video & Voice SEO |
| Paid | Google Ads | Shopping, Search Terms, Ad Creative |
| Conversion | Checkout Doctor | CRO, Buyer Walkthrough, Accessibility |
| Social | Social Media | Instagram, TikTok, YouTube, Pinterest, Reddit, Brand Voice (style rules) |
| Video | Cinematic AI Director | Higgsfield, Studio, CGI. **Mark the whole cluster "blocked: Gemini credit"** so the Manager never assigns it. |
| Trade sales | Email Marketing | Lead Finder, Customer Finder, Sales Closer. Lead Finder owns the list. Email Marketing owns sending, follow-up and quotes. Closer writes the quote. |
| Customers | Customer Care | Reviews & Trust, Delivery & Returns, Quality Control |
| Offer & operations | Offer & Pricing | Seasons, Profit & Cash, Workshop, Materials & Demand. All wait for one owner data pack: costs, make times, lead times. |
| Competitor | Market Research | Spy, Teardown (off), New Products, Marketplaces |
| Data & decisions | Analytics | Tracking, Weekly Issue Scout, QA, Decision Council. The Council is used only for go/no-go questions the owner asks. |

**B. Routing rules for the Manager:**
1. **Use one agent per question, not the whole cluster.** At most 1 agent per cluster per order unless the owner asks for more.
2. **Do not assign blocked work.** If an agent's "missing capability" (8.2) is unmet, it is not assigned. The Manager writes one owner action instead. This stops the 66 BLOCKED tasks from repeating.
3. **Hand trade leads to the trade workflow.** Any lead without an email goes into a `calls` list for the owner (phone script and offer), not into email.
4. **One runner for the queue.** Let only the CEO sprint run queued HQ tasks. The Daily Autopilot and the browser's `autoResume` would only report "tasks waiting". This removes the triple-runner risk (audit E5).

**C. Merged prompts.** Give each cluster lead one merged prompt that contains its members' role text as checklists. Keep the members' names on the switch panel so "all 66" stay visible, but have the Manager call the lead. This cuts the roster text sent with every plan (`roster()` sends all on-agents).

**D. Cost of `review:true`.**
- Each HQ task makes 2 Claude calls: a draft, then a final, both with tools. ESTIMATE: turning review off for routine tasks halves HQ agent calls.
- Recommend: `review:true` only for:
  - tasks that write to Shopify (On-Page, Product, New Products)
  - tasks that touch money (Ads, Offer)
  - anything sent outside the business
- Everything else gets one call, plus QA sampling (QA already re-checks: 48 tasks).
- The QA verdicts show the double pass is not buying certainty: 68% of tasks still end "NEEDS VERIFICATION".

**E. Schedules (proposals):**
1. **Trading HQ watchdog:** move it off this account, or cut it from hourly to every 4–6 hours. It is 60% of all wake-ups and earns nothing for Eagle Bed. The owner's decision.
2. **Cinema task:** disable the schedule while `autoCinema=false`. Re-enable it when Gemini is topped up. Saves 14 wake-ups a week.
3. **Social post task:** run it on the default model with only the Shopify and Zapier connectors. Alternatively, plan 3 posts in one daily run and let the other two fires just publish.
4. **Inbox agent:** keep it at 2-hourly, but move it to its own session, or make it start fresh, so session …M81b (4 tasks) stops growing.
5. **Email Marketing:** **hold the ramp at 80 a day.** Do not step up to 140 on 25 Nov or 200 on 2 Dec until:
   - the legal-form gate and privacy line exist (7.4)
   - there is a follow-up step and a quote record
   - at least 2–3 positive replies show which segment works

   Cost and risk rise with volume; replies so far do not.
6. **Weekly Google growth check, Weekly Search Revenue report and CEO sprint:** all Monday mornings, all reading GSC. Share one `seo/gsc-latest` pull (the growth check already saves it) so the others reuse it and do not spend credits again.

**F. Decision Council verdict on the agency:** do not delete anything. **Do** route through 12 leads, gate blocked agents, use one queue runner, use `review:true` only where it matters, and pause the non-Eagle-Bed and dead schedules. Expected effect (ESTIMATE): roughly 40–50% fewer HQ Claude calls per order, and roughly 45% fewer weekly scheduled wake-ups (168 + 14 out of about 280 are Trading HQ and Cinema), with no loss of finished work. The 21 never-used agents produce nothing today.

---

## Limitations

- Gmail search counts are estimates. The sent-mail check found 244 threads against 253 in HQ, and the gap was not resolved. Older bounces were found only with trash included.
- "Delivered" is inferred: sent minus hard bounces. There is no open or delivery tracking.
- The segment mapping is keyword-based on free-text `type` fields. A few leads could sit in a neighbouring segment.
- Legal form (company vs sole trader) was **not** checked for any lead. The PECR exposure is an ESTIMATE.
- The legal points come from my knowledge of ICO guidance, PECR, UK GDPR and the DUAA 2025, not from pages fetched today. Get them confirmed before relying on them.
- HQ task lists for 8 small runs were not read. Some large runs may have more than the 32 tasks returned per listing. Per-agent counts are therefore minimums.
- Claude usage per scheduled task or per HQ call is not reported anywhere. Costs are given as run counts and resource drivers, not £.
- Trade revenue is £0 based on Shopify orders #1039–#1043 since 10 Nov. Any offline or phone trade sale not entered in Shopify would be missed.

## Credits used

OpenRush: **0 credits** (budget 0). No OpenRush calls were made.

Other read-only calls:
- HQ ArtifactData list/get (about 35)
- Gmail search_threads (9)
- Shopify graphql_query (1, orders since 10 Nov)
- list_triggers (1)
