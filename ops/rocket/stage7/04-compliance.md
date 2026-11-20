# Stage 7, Part 13: UK GDPR and PECR compliance review

Decision Council and Verification specialists, acting as compliance reviewer. 19 Nov 2026. Read-only: nothing was sent, changed, imported or written to HQ, Shopify or Gmail. OpenRush credits used: 0.

> **This is not legal advice.** It is a plain-English operating summary based on published guidance and law-firm commentary found on 19 Nov 2026. The ICO website could not be opened directly from this session (host blocked); ICO pages were seen only through search-result extracts. Points marked HYPOTHESIS or listed in section 7 should be confirmed by a data-protection professional before relying on them.

Companion file: `compliance-assessment.csv` (29 activities: message type, recipient type, lawful basis, consent need, current practice, gap, risk, control, review needed).

---

## Summary for the owner

1. **You can email limited companies, LLPs and plcs without asking first**, as long as the email says who you are, gives a working way to opt out, and is honest. Since 19 Nov the trade agent emails limited companies only. That is the right rule. (VERIFIED rule; "limited only since 19 Nov" is as reported to me. The repo copy of the agent brief, `ops/email/trade-agent-brief.txt`, has **not** been updated with this rule yet.)
2. **Sole traders and ordinary (English/Welsh/NI) partnerships count as private individuals** under PECR. Marketing email to them needs their prior consent. Cold prospects cannot qualify for the "soft opt-in". Earlier batches to B&Bs, guest houses and holiday cottages probably reached some of these. That is the biggest past risk (High). Fix: check every contacted lead at Companies House, mark non-companies "do not contact", send them nothing more (no apology email).
3. **Three gaps remain on trade email:** no privacy line, no written legitimate-interests assessment (LIA), no retention rule. Sections 4, 5 and 6 below give ready drafts.
4. **New finding (VERIFIED, Shopify, 19 Nov):** 38 of 73 customer records are "subscribed" to email marketing. **12 of them have never ordered.** All are single opt-in. A 58% subscribe rate is high and fits a box that was pre-ticked before the 19 Nov fix (HYPOTHESIS). If so, those consents are not valid, and "subscribers only" on the abandoned-checkout flow does not by itself make it safe.
5. **Abandoned-checkout email 2 still mentions Clearpay** in its preview text (`ops/email/flows/abandoned-checkout.md`). Clearpay is a banned claim. Remove it before the flow is re-activated.
6. **Fines are now much higher.** Since 5 Feb 2026 PECR breaches can be fined at UK GDPR level (up to £17.5m or 4% of turnover). The ICO fines small firms, but usually after complaints. The 3 STOPs so far, one angry, are the kind of signal that leads to complaints.
7. **Order, delivery and aftercare messages need no consent** if they contain no promotion. Review requests are fine as service messages if the wording stays neutral (Judge.me wording from Stage 3 is neutral).

---

## 1. What the rules say (sources at the end)

| Rule | What it means for Eagle Bed | Label |
|---|---|---|
| **PECR reg. 22** (email, SMS, other "electronic mail" to **individual subscribers**) | Marketing needs prior consent, or the soft opt-in: (a) you got the details yourself, (b) during a sale or **negotiations for a sale**, (c) you market only your own similar products, (d) you gave a simple way to refuse **when you collected the details** and in every message. | VERIFIED (ICO extracts, Geldards, RPC) |
| "Negotiations for a sale" | ICO: browsing is not enough; an online enquiry about a product "could" be. An abandoned checkout is argued both ways by commentators (DMA: yes, intent to buy; others: no). No ICO statement on checkouts was found. | UNKNOWN → escalate |
| **Corporate vs individual subscribers** | Corporate: limited companies, LLPs, plcs, Scottish partnerships, some public bodies. Individual: sole traders, non-Scottish partnerships, other unincorporated bodies. | VERIFIED (ICO B2B page extract) |
| **PECR reg. 23** (all email marketing) | Never hide your identity; always give a valid address to opt out. Applies to corporate subscribers too. | VERIFIED (HISTORICAL Stage 1 + extracts) |
| **UK GDPR** | Applies whenever the address or data identifies a person (named staff, a sole trader's info@). B2B marketing is normally legitimate interests (Art. 6(1)(f)) with an LIA, privacy info under Art. 14 by the first email at the latest, and the absolute right to object (Art. 21). | VERIFIED |
| **DUAA 2025: legitimate interests** | The Act now lists direct marketing as an example of a legitimate interest. The balancing test (LIA) is **still required**; the no-balancing "recognised legitimate interests" list does **not** cover marketing. | VERIFIED (several law firms; ICO text not read) |
| **DUAA 2025: PECR fines** | PECR fines raised to UK GDPR levels (£17.5m / 4%). In force 5 Feb 2026 under SI 2026/82 (Commencement No. 6). | VERIFIED date by commentary; section-level check on legislation.gov.uk not completed |
| **DUAA 2025: charity soft opt-in** | New reg. 22(3A), in force 5 Feb 2026, for charities' charitable-purpose messages only. **Does not help Eagle Bed** (not a charity). Relevant only in that charities we email are not affected by it. | VERIFIED |
| **DUAA 2025: cookies** | From 5 Feb 2026 some low-risk cookies (e.g. first-party statistics) need no consent but need an opt-out. Advertising and remarketing pixels still need consent. ICO storage-and-access guidance finalised late April 2026. | VERIFIED (commentary) |
| **DUAA 2025: complaints** | From 19 Jun 2026 every controller must have a data-protection complaints procedure and acknowledge complaints within 30 days. | VERIFIED (commentary) |
| **Service messages** | Routine customer-service messages (order, dispatch, delivery, aftercare) are not marketing. Any promotional content turns a message into marketing, whatever it is called. An email asking for consent to marketing is itself marketing. | VERIFIED (ICO extracts, RPC, Edwin Coe on EE fine) |
| **SMS and WhatsApp** | SMS is "electronic mail" (same rules as email). In-app and social direct messages are treated the same way in ICO guidance; no ICO text naming WhatsApp was found. | SMS VERIFIED; WhatsApp HYPOTHESIS (very likely) |
| **Phone** | Live marketing calls (reg. 21): no consent needed, but do not call numbers on TPS (individuals, sole traders) or CTPS (companies) unless they have told you they want your calls. | HISTORICAL (Stage 1); not re-checked |

---

## 2. Team rulebook: what we may send to whom

**Before any message, ask two questions: (1) Is anything in it promotional? (2) Who is the recipient legally?**

### 2.1 Customers and shoppers (individuals)

| Message | May we send it? | Conditions |
|---|---|---|
| Order confirmation, payment, "your bed is being made", delivery date, delivery-day, returns, warranty, aftercare tips | **Yes, to every buyer** | No product promotion, no "new range", no offers, no cross-sell links |
| Answer to an enquiry or swatch request (email, WhatsApp, phone) | **Yes** | About what they asked. One follow-up about that request is fine |
| Review request | **Yes, to every buyer** (service) | Neutral wording only (Stage 3 R-request). No products, no discount, no incentive. 1 request + 1 reminder. Opt-out honoured |
| Abandoned-checkout email | **Only to customers with valid marketing consent** | Treat as marketing. Unsubscribe link in each email. Until a professional confirms otherwise, exclude anyone whose "subscription" came from the pre-19 Nov box if it was pre-ticked |
| Newsletter, new products, sale news, "we've restocked" | **Only to valid subscribers** (ticked the box themselves after 19 Nov) **and, if confirmed by a professional, past buyers under the soft opt-in** | Unsubscribe link, business name and Dewsbury address. Never to enquirers who did not opt in |
| WhatsApp or SMS promotion | **Only with consent for that channel** | No broadcast lists built from enquiry chats |
| An email asking someone if they'd like marketing | **No** | Asking for consent by email is itself marketing |

### 2.2 Businesses (trade)

| Recipient | Cold marketing email? | Phone? | Post? |
|---|---|---|---|
| **Limited company, LLP, plc** (Companies House number checked and recorded) | **Yes** at role addresses (info@, sales@, enquiries@). Privacy line + STOP line. One email + max 1 follow-up | Yes after CTPS screen | Yes |
| **Charitable company or CIO, public body, university, council** | Yes, same as above, once status is evidenced (Charity Commission / official site). CIO status: confirm (section 7) | Yes after CTPS screen | Yes |
| **Scottish partnership** | Allowed in law, but we cannot easily prove it. **Treat as sole trader unless evidenced** | After TPS/CTPS screen | Yes |
| **Sole trader, ordinary partnership, unincorporated club or trust** (most small B&Bs, guest houses, holiday cottages, individual landlords, many designers) | **No.** Only if they gave us consent (e.g. ticked trade-news on our form) | Yes after TPS screen | Yes |
| **Unknown legal form** | **No.** Unknown = sole trader | After TPS screen | Yes |
| Anyone on the suppression list | **Never, on any channel** | Never | Never |

**Inbound trade buyers** who contact us or fill in a trade form can always be answered and quoted. Later promotions to them need either their tick on the form (any legal form) or corporate status.

### 2.3 Always

- Say who we are: "Eagle Bed, trading name of ABBAS TRADE LTD", phone, website.
- Every marketing message has an easy opt-out (STOP line or unsubscribe link).
- Check the suppression list before every send, on every channel.
- No false claims (assembly is £69.99, never free; no Clearpay; BRIEF banned list).
- Never write customer names, emails or phones into HQ notes or files.

---

## 3. Suppression list design (HQ)

**Collection:** `suppression` in the HQ artifact database. One doc per suppressed identifier. Permanent: rows are never deleted (this is the one record we keep beyond normal retention, because it is needed to honour the objection).

| Field | Type | Example | Notes |
|---|---|---|---|
| `id` (doc_id) | string | `sup-<sha256 of normalised value, first 16 hex>` | Hash, so the list can be checked without storing more than needed |
| `kind` | enum | `email` / `domain` / `phone` / `business` | `domain` for whole businesses (e.g. after a STOP from info@) |
| `valueHash` | string | sha256 of lower-cased, trimmed value | Check by hashing the candidate and looking up |
| `valueHint` | string | `info@…ple-hotel.co.uk` | Business addresses only; **never** a consumer email in clear |
| `businessName` | string | B2B only | Allowed (B2B) |
| `reason` | enum | `stop_reply` / `unsubscribe` / `objection` / `hard_bounce` / `complaint` / `sole_trader_no_consent` / `legal_form_unknown` / `owner_decision` | |
| `channels` | array | `["email","phone","whatsapp","post"]` | Objection to marketing = all channels unless they said otherwise |
| `source` | string | `Gmail reply 18 Nov`, `Shopify unsubscribe`, `Companies House review` | |
| `addedAt` | ms | | |
| `addedBy` | string | `inbox-agent`, `owner` | |
| `leadRef` | string | `tb-<slug>` | Link to the lead, if any |
| `notes` | string | short, no personal data | |

**Rules:**
1. Sending agents (and the owner) check `suppression` by hash **and** by domain before every send. A match blocks the send.
2. Inbox agent adds a row within 1 working day of: any STOP/unsubscribe/"remove me"/"not interested in emails", any hard bounce, any complaint.
3. Shopify unsubscribes stay in Shopify (Shopify blocks them itself). Copy only business-domain ones into HQ.
4. The 3 existing STOPs, 13 hard bounces (including the Brighton agency left as "contacted") and every pre-19 Nov lead without a company number go in on day 1.
5. Monthly check: count of rows by reason; any send to a suppressed value = incident, logged and fixed.

---

## 4. Retention schedule (proposal for owner approval)

| Data | Where | Keep for | Then | Why |
|---|---|---|---|---|
| Trade lead, never replied | HQ `leads` | **12 months after last contact** | Delete, or keep business name + domain hash only to avoid re-mailing | Storage limitation |
| Full email body text on leads | HQ `leads.message` | **90 days** | Replace with subject + template id + date | Minimisation (the template is in git) |
| Trade lead who replied / quoted | HQ + Gmail | **2 years after last contact** | Delete | Ongoing relationship |
| Trade customer (ordered) | Shopify, accounts | **6 years after the financial year** of the sale | Delete / anonymise | Tax and limitation (HMRC records) |
| Consumer orders | Shopify | **6 years after the financial year** | Shopify data erasure / anonymise | Tax, warranty (5-year frame), consumer claims |
| Shoppers with no order (checkout or account only) | Shopify | **2 years after last activity** | Erase customer record | No purpose after that |
| Abandoned checkouts | Shopify | Shopify default; delete/ignore after **90 days** | – | Only useful while fresh |
| WhatsApp / Inbox enquiries with no order | Phone, Shopify Inbox | **12 months** | Delete chat | Minimisation |
| Marketing consent records (who, when, wording) | Shopify | **As long as we market to them + 2 years** | Delete | Proof of consent |
| Suppression list | HQ `suppression` | **Permanent** (hashed) | – | Needed to honour objections |
| LIA, consent-wording versions, legal-form evidence log | `ops/email/` (git) | **6 years** after last use | Archive | Accountability |
| Gmail sent trade mail | Gmail | **2 years** | Delete | Evidence of what was sent, then minimisation |

Review: one calendar reminder each quarter; an agent may list overdue items (read-only), the owner deletes.

---

## 5. Privacy lines (draft, owner approval needed)

**Trade email footer (above the STOP line):**

> Eagle Bed is a trading name of ABBAS TRADE LTD (company 16410472), Dewsbury. We found your business email on your website and use it only to offer beds to businesses. How we handle your details: www.eaglebed.co.uk/policies/privacy-policy. Reply STOP and we won't contact you again.

(Check the policy URL is live; Shopify's default is `/policies/privacy-policy`.)

**Trade enquiry form (under the submit button):**

> We use the details you send to reply and prepare your quote (ABBAS TRADE LTD, trading as Eagle Bed). We keep them for up to 2 years after we last speak, or longer if you order. Privacy policy: www.eaglebed.co.uk/policies/privacy-policy.
>
> ☐ Send me occasional trade news and new designs by email. You can unsubscribe at any time. *(unticked by default; record wording + date + tick)*

**Privacy policy additions (B2B section, short):** who we contact (businesses at published role addresses), where we got the address (the business's own website or an official listing), why (offering beds to businesses; legitimate interests), how long (section 4), how to object (reply STOP or email us; we stop at once and add you to our do-not-contact list), and the data-protection complaints route (email address, 30-day acknowledgement, right to complain to the ICO).

---

## 6. LIA outline: B2B email to corporate subscribers

Keep as `ops/email/LIA-trade-email.md` after owner approval. Review every 12 months or on any change.

1. **Purpose test.** Offer handmade beds to businesses that buy beds (letting agents, property managers, serviced accommodation companies, design studios, developers). Commercial interest of a small UK maker; direct marketing is named as a possible legitimate interest in UK GDPR (as amended by DUAA 2025).
2. **Necessity test.** Email to a published role address is the least intrusive scalable way to reach a business buyer. Alternatives considered: ads (costly, less targeted), post (slower), phone (more intrusive). Data used: business name, type, town, role email, source URL. No named individuals, no special category data, no enrichment, no bought lists.
3. **Balancing test.**
   - Relationship: none before contact. Expectation: businesses that publish info@/sales@ reasonably expect supplier approaches, especially relevant ones.
   - Impact: one short email + max 1 follow-up; low intrusion; easy opt-out.
   - Risk factors: role address may reach one person at a small company (mitigated by excluding sole traders and partnerships; corporate only); volume (cap per day; same business never twice).
   - Evidence: 3 STOPs in about 350 sends (≈1%), one angry → lowered by segment choice (hospitality paused).
4. **Safeguards.** Companies House check and record per lead; suppression list checked before every send; privacy line + STOP in every email; honest claims only (BRIEF); no open tracking; retention per section 4; Art. 21 objections acted on within 1 working day; quarterly review of STOP/complaint rates (stop the segment if STOP > 2% or any ICO complaint).
5. **Outcome.** Legitimate interests applies for corporate subscribers under these safeguards. Not applicable to sole traders/partnerships (PECR consent required regardless of the LIA).
6. **Sign-off.** Owner name/role, date, next review date.

---

## 7. Questions to escalate to a professional

| # | Question | Why it matters |
|---|---|---|
| Q1 | Can an abandoned checkout (email entered at checkout, not paid) count as "negotiations for a sale" for the soft opt-in, given Shopify's checkout shows an unticked marketing box (is that "a simple means of refusing" at collection)? | Decides whether the flow may go to non-subscribers. Until answered: subscribers only |
| Q2 | Was the Shopify checkout box pre-ticked before 19 Nov? If yes, are the 12 subscribed non-buyers' consents invalid, and can the 26 subscribed buyers be marketed under the soft opt-in instead? | Who may receive abandoned-checkout and newsletter email |
| Q3 | Sole-trader screening method: is "email only entities with a Companies House company/LLP number (or Charity Commission CIO / public body), everything else treated as individual" an adequate and proportionate check? Is a CIO a corporate subscriber? | Trade list rule |
| Q4 | Remediation for pre-19 Nov sends to likely sole traders/partnerships: is suppress + no further contact + internal record enough, or is any self-report or other step advisable? | Past High-risk exposure |
| Q5 | Are neutral review requests (Judge.me, Google) to buyers who did not opt in to marketing service messages? | Review programme |
| Q6 | Does the store privacy policy meet Art. 13/14 for B2B prospects and include the DUAA complaints procedure? | Transparency + 19 Jun 2026 duty |
| Q7 | Do Meta/TikTok/Google Ads pixels wait for consent in the Shopify banner, and does any of our analytics fit the new statistics exemption? | PECR reg. 6, fines now UK GDPR level |
| Q8 | Is ICO registration (data protection fee) in place for ABBAS TRADE LTD? (Not checked; UNKNOWN) | Legal duty for most businesses that process personal data |

---

## 8. Answer K: "How can we contact businesses lawfully?"

1. **Limited companies, LLPs, plcs, charitable companies/CIOs, public bodies:** yes, cold email to their published role address is allowed without consent. Check and record the company number first. Say who we are, include the privacy line and the STOP line, send one email and at most one follow-up, and check the suppression list first. Keep a written LIA.
2. **Sole traders and ordinary partnerships** (most small B&Bs, guest houses, holiday cottages, private landlords, many one-person design studios): **no cold email or text**. Reach them by phone (after TPS screening), by post, or let them come to us (trade page, Google Business Profile, directories, the trade form with an unticked opt-in). Once they ask for a quote, we can reply and quote.
3. **Not sure of the legal form?** Treat it as a sole trader: no email.
4. **Anyone who says stop**, on any channel, goes on the suppression list and is never contacted again.
5. **Phone:** fine for any business after screening TPS/CTPS; respect "don't call".

---

## 9. Evidence used

- `ops/rocket/stage1/05-trade-agency.md` §7.4 (HISTORICAL, 19 Nov): 253 sends, 3 STOPs, 13 hard bounces (1 left "contacted"), no privacy link (text search), no LIA, no retention rule, no legal-form check.
- `ops/email/trade-agent-brief.txt` (git `c545746`): still says only "skip sole traders who are clearly individuals"; no Companies House gate; no privacy line (VERIFIED, 19 Nov).
- `ops/email/PLAN.md`, `ops/email/flows/*.md`, `ops/whatsapp/SETUP.md`, `ops/rocket/stage3/enquiry-templates.md` (review templates).
- Send totals 292 + 61 and "limited companies only since 19 Nov": as reported in the task (not re-counted).
- Shopify Admin API, read-only, 19 Nov 2026: 73 customer records; 38 email SUBSCRIBED (26 with ≥1 order, 12 with 0), 22 NOT_SUBSCRIBED, 5 UNSUBSCRIBED, 8 without email; all subscribed are SINGLE_OPT_IN (VERIFIED). No names or emails were read or written.

## 10. Sources (searched 19 Nov 2026; ICO pages seen as search extracts only)

- ICO, Business-to-business marketing: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/
- ICO, What are the rules on direct marketing using electronic mail: https://ico.org.uk/for-organisations/guide-to-pecr/guidance-on-direct-marketing-using-electronic-mail/what-are-the-rules-on-direct-marketing-using-electronic-mail
- ICO, Identify direct marketing (service messages): https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/direct-marketing-guidance/identify-direct-marketing/
- ICO, The charitable purpose soft opt-in: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/the-charitable-purpose-soft-opt-in/
- ICO, The DUAA 2025: what does it mean for organisations: https://ico.org.uk/about-the-ico/what-we-do/legislation-we-cover/data-use-and-access-act-2025/the-data-use-and-access-act-2025-what-does-it-mean-for-organisations
- legislation.gov.uk, SI 2026/82 (DUAA Commencement No. 6): https://www.legislation.gov.uk/uksi/2026/82/regulation/2/made
- Geldards, ICO guidance on soft opt-in: https://geldards.com/?p=21581
- RPC, ICO fines over electronic marketing breaches (spring 2026): https://www.rpclegal.com/snapshots/data-protection/spring-2026/ico-issues-fines-over-electronic-marketing-breaches/
- RPC, DUAA commencement update (spring 2026): https://www.rpclegal.com/snapshots/data-protection/spring-2026/the-data-use-and-access-act-2025-commencement-update/
- Mishcon de Reya, data and e-privacy reform: https://www.mishcon.com/news/data-protection-and-electronic-privacy-reform-whats-hot-and-whats-not
- Lewis Silkin, UK data reform becomes reality (9 Feb 2026): https://www.lewissilkin.com/insights/2026/02/09/uk-data-reform-becomes-reality-what-this-means-for-you-and-what-you-need-to-do-n-102mh5x
- DLA Piper, commencement of DUAA data protection provisions (Feb 2026): https://privacymatters.dlapiper.com/2026/02/uk-commencement-of-the-data-protection-provisions-in-the-data-use-and-access-act/
- Bratby Law, recognised legitimate interests vs balancing test: https://bratby.law/recognised-legitimate-interests-duaa-uk-eu-divergence/
- Mills & Reeve, charity soft opt-in in force (Feb 2026): https://www.mills-reeve.com/blogs/charity/february-2026/soft-opt-in-is-now-in-force-and-here-is-what-it-means-for-charities/
- DLA Piper, complaints rules from 19 June 2026: https://privacymatters.dlapiper.com/2026/06/uk-new-complaints-handling-rules-under-duaa-take-effect-on-19-june-2026-are-you-ready/
- Trethowans, ICO storage and access technologies guidance (28 Apr 2026): https://www.trethowans.com/insights/new-ico-storage-and-access-technologies-aka-cookies-guidance-published-28-april-2026/
- DMA, Soft opt-in for direct marketing (abandoned basket view): https://dma.org.uk/article/soft-opt-what-soft-opt-in-for-direct-marketing
- Edwin Coe, Marketing email or service message (EE fine): https://www.edwincoe.com/blogs/main/marketing-email-or-service-message-ico-fines-ee-ltd-for-sending-unsolicited-marketing/
- Slaughter and May, lessons from ICO direct marketing enforcement: https://slaughterandmay.com/media/ffqd0nme/consents__records_and_disguises___lessons_from_ico_direct_marketing_enforcement_actions_3629pdf.pdf

## Limitations

- ico.org.uk and other pages could not be fetched (session network block); ICO wording comes from search extracts and law-firm summaries. Ask for `ico.org.uk` to be allowed to re-check.
- The exact commencement of the DUAA PECR penalty section (s.115) on 5 Feb 2026 is reported by several firms but was not confirmed line by line on legislation.gov.uk.
- Legal form of contacted leads was not checked; HQ `leads` and Gmail were not re-read this run; send totals are as reported.
- Pre-19 Nov behaviour of the Shopify marketing checkbox is UNKNOWN; the 58% subscribe rate is only an indicator.
- Shopify privacy policy text, cookie banner behaviour, Judge.me opt-out footer and ICO fee registration were not checked.

## Credits used

OpenRush: 0. WebSearch: 11 searches. Shopify Admin API: 2 read-only queries (plus 2 rejected for deprecated fields). No writes anywhere except the two files in `ops/rocket/stage7/`.
