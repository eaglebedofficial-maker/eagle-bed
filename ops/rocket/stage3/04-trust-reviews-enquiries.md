# Stage 3 · Parts 8 and 10: Customer trust, reviews and enquiry conversion

Specialists: Reviews & Trust, Customer Care, Sales Closer, Brand Voice. Date: 19 Nov 2026. Read-only work. Nothing was changed, sent, drafted or labelled. No customer names, emails or addresses in this file (order numbers only).
Templates are in `ops/rocket/stage3/enquiry-templates.md`.
Screenshots: `ops/rocket/stage3/shots/trust-*.jpg` (6 files).

Labels: **VERIFIED** (seen in live data today) · **ESTIMATE** (reasoned from evidence) · **UNKNOWN** (cannot be read from here) · **RECOMMENDATION**.

---

## 1. Summary (read this first)

1. **Reviews: 3 in total, all 5 stars, all "Verified".** 2 product reviews (Side Lift 11 Nov, Cambridge 15 Nov) and 1 store review (20 Sep). VERIFIED (Shopify `judgeme` shop metafields: `all_reviews_count` 3, `shop_reviews_count` 1). Google Business Profile: Google's own 18 Nov email says "Go from 0 to more than 5 reviews", and no "new review" email from Google arrived after the 24 requests sent on 10 Nov. ESTIMATE: 0 Google reviews, 0 replies to the 24 emails (Gmail shows no replies).
2. **Judge.me review requests are almost certainly ON, at the default "14 days after fulfilment".** Order #1031 was marked fulfilled on 1 Nov at 17:17 and its review arrived on 15 Nov at 16:47. Order #1029 was marked fulfilled on 27 Oct and its review arrived on 11 Nov. ESTIMATE (strong). We have no access to the Judge.me admin, so we cannot see the setting.
3. **"Fulfilled" does not mean delivered.** 16 of the last 18 orders were marked fulfilled within 6 hours of purchase. Most were within 1 hour. Shopify then sends "Your order is on the way" on the day of the order, so customers chase us (#1038, #1040). Delivery dates are not recorded: 10 orders carry the same "delivered" time (3 Nov 11:41), which is a bulk update, and no order after #1030 has a delivered date. Only 1 of 23 fulfilments has tracking (a DPD parcel). VERIFIED.
4. **Some review requests can reach a customer before the bed does.** Judge.me counts from "fulfilled". On 10 Nov the Google request went to #1031–#1033. None of these had a delivered date, and #1033 was only ordered on 3 Nov. Customers who got the Google email will also get the Judge.me email, so they are asked twice. ESTIMATE.
5. **Our own reviews pages now say the wrong thing.** /pages/reviews says "showing zero published reviews". /pages/aftercare-and-feedback says "does not yet display customer reviews… nobody else can post". In fact, 3 reviews are live, and the Judge.me "Write a review" button is open to **everyone** (`write_review_button_visibility: everyone`, `autopublish: true`). VERIFIED.
6. **Judge.me ethics settings are mostly good.** Coupons are off. Review gating is off (no "negative review help screen"). Reviews auto-publish, so negative ones are not held back. The "Verified" badge is on. VERIFIED (live `jdgmSettings`). Gaps: no stars near the product title, the widget sits at the very bottom of the page under related products, and dates use the US format (11/11/2026).
7. **Clearpay is still promised on 16 of 21 site pages,** plus the home trust strip, every product page, the WhatsApp `/pay` quick reply and `ops/BRIEF.md`. There have been 0 Clearpay orders ever. VERIFIED (scan below). No page says "mainland", "interest-free", "free assembly" or "sleep trial". (The one "sleep trial" mention is a correct "No".)
8. **Company details are missing.** The Terms of Service page names "Eagle bed ltd" but gives no company number or registered office. No page shows a VAT number. A third-party register site lists "Eagle Bed Ltd 17084410" in Dewsbury, about 2 months old. UNKNOWN until the owner confirms (gov.uk is blocked from this session). The Terms page is 80 words long.
9. **Enquiries arrive in 5 places, and HQ sees 2 of them.** Those places are Gmail, the Shopify contact form (goes to Gmail), Shopify Inbox chat with an AI agent (goes to Gmail only as notifications), the Dondy WhatsApp bubble (phone) and the phone itself. **Shopify Inbox had 3 chats handed to the team in 8 days (12, 15 and 19 Nov). None of them are in HQ.** Today's chat came from a ready buyer: "I'll place the order once I have a date set to move in". VERIFIED.
10. **Reply speed loses sales.** A made-to-measure enquiry from 7 Nov, chased on 11 Nov, still has no reply after 12 days. A showroom question waited 5 days. A contact-form message waited 14 days. The site promises "within 24 hours" on one page and "two working days" on another. VERIFIED.
11. **Assembly price drift in a live reply.** On 18 Nov (order #1043) we replied "We will charge u £50 extra for bed assembly… pay cash on delivery". The listed price is £69.99. VERIFIED. The owner must decide whether to honour £50 (recommended, since it was promised in writing) and must never quote off-list again.

---

## 2. Reviews: what exists today

### 2.1 Judge.me installation (live HTML and settings), VERIFIED

| Item | Finding | Label |
|---|---|---|
| Product review widget | Present on product pages (revamped widget). On Side Lift it shows "5.0 · 1 review · Product reviews (1) · Store reviews (1)" with a "Verified" badge | VERIFIED (`trust-desktop-pdp-reviews.jpg`) |
| Position | At the bottom of the page, under "You may also like". Most mobile visitors will never reach it | VERIFIED |
| Star badge near title / on collections / home | Off (`preview_badge_*_install_preference: false`, `hide_badge_preview_if_no_reviews: true`) | VERIFIED |
| All-reviews page | /pages/reviews is a text "review policy" page with no live Judge.me all-reviews widget | VERIFIED |
| Store badge / trust badge / medals / floating tab / carousel | All off (`trust_badge_enabled: false`, medals hidden, floating tab none) | VERIFIED |
| Popup review widget | Settings exist ("top up thin pages" on, hidden on mobile). Not seen rendering | VERIFIED settings / UNKNOWN render |
| Coupons for reviews | `enable_coupons: false` | VERIFIED, good |
| Gating | `show_negative_reviews_help_screen: false` | VERIFIED, good |
| Publishing | `autopublish: true`, so all ratings publish without approval | VERIFIED, good |
| Who can write | `write_review_button_visibility: everyone`. Email confirmation is always required, but buying is not | VERIFIED. Conflicts with our "verified buyers only / nobody else can post" text |
| Photo/video reviews | Enabled (`enable_review_pictures`, `enable_review_videos`) | VERIFIED |
| Q&A | Off | VERIFIED |
| Date format | mm/dd/yyyy (US) | VERIFIED |
| Request emails: trigger, delay, reminder | Not visible from the storefront or Gmail. Customers receive them, not the shop | UNKNOWN, but see 2.3 |
| Sandbox note | `tracking.aws.judge.me` and `widget-view.dondy.net` were blocked in our browser. The review widget still rendered | VERIFIED |

### 2.2 Review data (Shopify metafields, read-only), VERIFIED

| Review | Date | Stars | Verified | Photo |
|---|---|---|---|---|
| Store review | 20 Sep 2026 | 5 | Yes | No |
| Side Lift Ottoman Storage Base (likely order #1029) | 11 Nov 2026 | 5 | Yes | No |
| Cambridge Panel Storage Bed (likely order #1031) | 15 Nov 2026 | 5 | Yes | No |

Two of the three reviews mention assembly by the customer ("easy fixings", "easy to put together"). They are useful honest content for the assembly question.

### 2.3 Review requests sent so far

| What | Evidence | Label |
|---|---|---|
| 24 Google review emails, 10 Nov, orders #1004–#1033, sent by hand from Gmail | Gmail Sent. Wording is honest: "would you leave an honest review on Google?" No incentive. Includes a "if anything isn't right, reply" line | VERIFIED |
| Replies to those 24 | 0 | VERIFIED (Gmail search) |
| New Google reviews since | No Google "new review" notification. Google says the profile should "go from 0 to more than 5" | ESTIMATE: 0 |
| Judge.me automatic requests | Review timestamps line up with 14 days after the fulfilment time (#1031: 14 days minus 30 min; #1029: 14.6 days) | ESTIMATE (strong) |
| Judge.me admin/notification emails in Gmail | None found (search "judge.me OR judgeme" since June: 0) | VERIFIED. Owner notifications go elsewhere or are off |

### 2.4 Fulfilment practice vs. review timing, VERIFIED

| Order | Ordered → marked fulfilled | Delivered date in Shopify |
|---|---|---|
| #1043 | 3.6 h | none |
| #1042 | 0.1 h | none |
| #1041 | 0.6 h | none |
| #1040 | 5.3 h | none (customer was told "Saturday", 21 Nov) |
| #1039 | 0.6 h | none |
| #1038 (NI) | 0.3 h | none (owner says delivered 17 Nov, 8 days after order) |
| #1031–#1037 | 0.6–5.8 h | none |
| #1021–#1030 | same day to 2 days | all "3 Nov 11:41", a bulk stamp, not real dates |

Effects:
- Shopify's "Your order is on the way" email goes out on the order day for a bed that has not been made yet. This drives "where is my order" chats (#1038, #1040). It also contradicts the delivery page ("Once your order is dispatched you'll receive tracking information by email"): 22 of 23 fulfilments have no tracking.
- Judge.me "14 days after fulfilment" lands about 9–11 days after a 3–5 day delivery. That is usually fine, but for slower deliveries (8 days for #1038, Saturday for #1040) the margin is small, and nothing guarantees it.

---

## 3. Ethical review collection system (RECOMMENDATION)

### 3.1 The law, briefly (checked 19 Nov 2026)

- The DMCC Act 2024, Schedule 20 para 13, bans **fake reviews** and **concealed incentivised reviews**. It also bans publishing reviews in a misleading way. In force since 6 April 2025. The CMA guidance CMA208 (4 Apr 2025) expects businesses that publish reviews to take "reasonable and proportionate steps" to prevent and remove banned reviews, and to have a clear review policy. Fines can reach 10% of global turnover. The CMA has checked over 100 business websites and sent 54 advisory letters. Sources: CMA208 (gov.uk), CMS, Lewis Silkin, Freshfields, gov.uk case page (links at the end). Note: gov.uk could not be opened from this session, so the summary relies on legal commentary that quotes it.
- Google Business Profile policy: do not offer incentives, and do not ask only happy customers (no "review gating"). Source: Google policy as summarised by review-industry sources.
- Our page /pages/reviews says "Fake and incentivised reviews are illegal". The precise rule is: fake reviews, and incentivised reviews whose incentive is **hidden**, are banned. Fix the sentence (see 3.6). We should still offer **no** incentives at all. That is simpler and is already our policy.

### 3.2 The system

| Step | Rule | Where |
|---|---|---|
| 1. Real delivery date | The delivery team marks the order **delivered** in Shopify on the day it is delivered (Shopify app → Order → Fulfilment → "Mark as delivered"). No more bulk stamps | Shopify (owner/driver) |
| 2. Fulfil on dispatch, not on order | Mark "fulfilled" only when the bed leaves the workshop on the delivery run. Until then the order stays Unfulfilled. Optional: use the "In progress" status | Shopify |
| 3. Judge.me trigger | Request trigger = **Delivered**. Delay = **5 days after delivery**, so the customer has slept on it and assembled it. Fallback "If not delivered, send X days after fulfilment" = **10 days**. That covers missed delivery marks, because fulfilment will then mean dispatch | Judge.me → Settings → Request scheduling (owner) |
| 4. One request + one reminder | 1 reminder **7 days** after the request, only if no review. No third email. Judge.me supports reminders | Judge.me |
| 5. Every buyer, same email | No pre-screening ("were you happy?"), no star preselection in links, no excluding complaint orders. If an order has an open complaint, still send (the request text invites contact) | Judge.me (keep `show_negative_reviews_help_screen` off) |
| 6. Photos | Ask for a photo in the request ("a photo of the bed in your room helps the next buyer most"). No reward for photos | Judge.me email template |
| 7. Google + Judge.me split | **One platform per customer.** Odd order numbers get the Judge.me product review only. Even order numbers get one Google request by email 5–7 days after delivery, plus the Judge.me request. Simpler alternative: Judge.me only, then Judge.me's own "also post on Google" step if the owner turns on Google syncing. Never ask the same person twice on the same platform. Do not re-ask the 24 customers from 10 Nov on Google | Judge.me / Gmail |
| 8. Verified-buyer label | Keep the "Verified" badge. Turn "Write a review" from "everyone" to **verified buyers only**, or keep it open and label non-buyer reviews "Review collected from a store visitor" (Judge.me transparency badge). This matches our published policy | Judge.me (owner) |
| 9. Publish everything | Keep auto-publish on for **all** star ratings. Remove only reviews that break Judge.me's content rules (abuse, personal data, spam). Log every removal with a reason in HQ `reviews/removed` | Judge.me + HQ |
| 10. Respond | Reply publicly to **every** review of 3 stars or less within 2 working days, and to 4–5 star reviews when there is something useful to add. Reply as "Eagle Bed". Say sorry, give a fact, offer contact by phone/email. Never argue, never reveal order details, never ask for removal | Judge.me / GBP |
| 11. Show it | Star badge under the product title (only when that product has 1+ reviews). Move the review widget up, to straight after the description accordion. Use UK date format dd/mm/yyyy. Add a "Customer photos" row once photos exist. No site-wide star claim until there are 10+ reviews, and then show the true count beside it | Theme / Judge.me (owner publishes) |
| 12. Weekly owner check (10 min, Monday) | Open HQ → Reviews: new reviews, replies due, requests sent, any removed. Read every 1–3 star review the same day | HQ |

### 3.3 Owner workflow (one line each)

1. Delivery day: driver/owner taps **Mark as delivered** on the order (phone, 10 seconds).
2. Judge.me sends the request 5 days later and the reminder 7 days after that. Nothing to do.
3. New review email → read it. If 1–3 stars, phone the customer first, then reply publicly (template R-reply in the templates file).
4. Monday: HQ Reviews card. Check "replies due = 0" and "requests sent this week = deliveries last week".
5. Never: write, buy, swap or edit a review. Never ask friends or family to post. Never offer a discount, refund or gift for a review. Never ask someone to change or remove a review.

### 3.4 What must change in Shopify fulfilment practice

| Change | Why | Owner effort |
|---|---|---|
| Fulfil on dispatch day, not on order day | Stops a false "on the way" email, stops early review timers, makes "fulfilled" mean something | Habit change |
| Mark delivered on delivery day | The only true trigger for review timing, and the base for honest delivery-time claims (Stage 1 O12) | 10 s per order |
| Edit the Shopify "Shipping confirmation" email: "Your bed is on its way. Our team will be with you on the date we agreed." Remove "Track your shipment" when there is no tracking | Honest, fewer chasers | 5 min, once |
| Add an "Order confirmation" line: "We make your bed to order. We will contact you to agree a delivery day, usually within 3–5 working days." | Sets expectations at the right moment | 5 min, once |
| Correct the delivery page sentence "you'll receive tracking information by email". Say instead: "we contact you to agree a delivery day" | The current sentence is untrue for 22 of 23 fulfilments | Text edit |
| Clean old data: leave the bulk "3 Nov 11:41" stamps but don't use them for timing reports | Data honesty | none |

### 3.5 Targets (ESTIMATE)

At about 4 orders a week, with a typical 10–20% response to a well-timed request plus a reminder (general e-commerce experience, not Eagle Bed data), expect about 2–3 new reviews a month and about 10 reviews by the end of February. That is enough for an honest star badge on the top 2–3 products. Do not set a target that tempts anyone to cut corners.

### 3.6 Text fixes on our own trust pages (RECOMMENDATION, owner to approve)

| Page | Now (VERIFIED) | Change to |
|---|---|---|
| /pages/reviews | "currently showing zero published reviews… not displaying a star rating anywhere" | "We have a small number of verified reviews so far, and every one is shown on the product it is about, good or bad. We do not show an overall star rating until we have enough reviews for it to mean something." |
| /pages/reviews | "Fake and incentivised reviews are illegal in the UK" | "Fake reviews, and reviews that hide a reward, are illegal in the UK. We do not offer any reward for a review." |
| /pages/reviews and /pages/aftercare-and-feedback | "Verified buyers only" / "nobody else can post" | Either make it true (Judge.me: verified buyers only) or say "Reviews from verified buyers carry a Verified label." |
| /pages/aftercare-and-feedback | "does not yet display customer reviews on this website" | Delete the sentence |
| /pages/aftercare-and-feedback vs /pages/returns-policy | "reply within two working days" vs "within 24 hours, Monday to Friday" | One promise everywhere: "We reply within one working day, Monday to Friday." |
| /pages/reviews footer | "Spread the cost with Klarna or Clearpay" | "Pay by card, PayPal or Klarna" (until Clearpay is proven on) |

---

## 4. Trust elements: live site check vs ops/BRIEF.md

Pages read with curl on 19 Nov: home, 21 sitemap pages, 5 Shopify policies, Side Lift product page. Browser-rendered: Side Lift product page, contact page and reviews page (iPhone 13 + 1366 desktop). All findings VERIFIED unless marked.

### 4.1 Business details

| Item | Where shown | Finding |
|---|---|---|
| Address | Footer and /policies/contact-information show the full workshop street address and postcode | It is the BRIEF workshop address ✔. The BRIEF also says "say Dewsbury only" in copy. The owner should confirm that the footer may keep the full address. Recommended, because a trading address builds trust and a registered office must appear on the site anyway |
| Phone | Bar, footer, every page; contact page uses +44 7417 439197 | Matches ✔ |
| Email | eaglebedofficial@gmail.com everywhere | Matches ✔. A Gmail address weakens trust for a £250–£650 purchase. RECOMMENDATION: a domain address (hello@eaglebed.co.uk forwarding to Gmail) |
| Hours | Mon–Fri 9–6 | Matches ✔ |
| Registered company name | Terms of Service: "Eagle bed ltd" only | No company number, no registered office, no place of registration anywhere. UK company websites must show the registered name, number, place of registration and registered office (Companies Trading Disclosures rules; see sources). UNKNOWN whether the company is registered: a third-party site lists "Eagle Bed Ltd 17084410", Dewsbury, about 2 months old. **Owner to confirm**, then add one footer line: "Eagle Bed Ltd, registered in England and Wales, company no. …, registered office …" |
| VAT number | Not shown | UNKNOWN whether VAT registered (Stage 2 cost item C6). Show it only if registered |
| Terms of Service | 80 words, no order/payment/delivery/cancellation/made-to-order terms | Weak. RECOMMENDATION: proper terms (contract formation, made-to-order and custom-size/customer-fabric orders, delivery, payment, cancellation, warranty, complaints). Get legal review |
| Privacy policy | Shopify standard text, updated 4 Nov 2026, contact = Gmail | No company identity. Does not name Judge.me, Google Ads Enhanced Conversions, Meta, WhatsApp, Omnisend. Owner to review (Stage 2 T2 already flags this) |

### 4.2 Consistency of facts

| Fact (BRIEF) | Pages that disagree or fall short | Label |
|---|---|---|
| Pay: Klarna, card, PayPal; **Clearpay NOT confirmed** (0 orders) | Clearpay promised on: home trust strip ("Klarna and Clearpay at checkout"), every product page (3 places), contact, about-us, bed-sizes-guide, why-buy, share-your-bedroom, handmade-in-dewsbury, press-and-media, aftercare-and-feedback, reviews, single-beds-3ft-uk, request-a-swatch, beds-west-yorkshire (4×), uk-bed-buying-guide (2×), faq, finance-options (6×), bespoke-beds-uk. Also `ops/whatsapp/SETUP.md` `/pay` and `ops/BRIEF.md` "Pay" line | VERIFIED. Biggest trust risk. Owner: switch Clearpay on, or remove it everywhere (Stage 1 O3) |
| NI, Jersey, Guernsey, IoM £90 | "Northern Ireland: £90" only (islands missing) on: contact, faq, bed-sizes-guide, why-buy, press-and-media, reviews, bespoke-beds-uk, /policies/shipping-policy | VERIFIED. Incomplete rather than wrong |
| Free delivery = to the door, downstairs | Delivery page ✔, product pages ✔ | ✔ |
| Assembly optional £69.99, never free | About ✔, product pages ✔. No "free assembly" found on the site. But a trade email on 18 Nov said "with assembly by our own team", and the #1043 reply quoted £50 | VERIFIED. Site OK, replies off-list |
| 14-day free returns, unused, original packaging | Refund policy says "two-man **courier** team" (BRIEF: own team). Refund policy has no mattress hygiene rule, but the returns page has one. Neither says how custom-size or customer-fabric orders are treated | VERIFIED. Align the policy with the returns page. Owner to decide on custom orders |
| 5-yr frame warranty; mattresses 5-yr guarantee | /pages/warranty: "Mattresses… may carry different terms", while About says "Mattresses: 5-year guarantee" | VERIFIED. Add the mattress line to the warranty page |
| Delivery "usually 3–5 working days", we contact you | Delivery page promises "tracking information by email" (see 2.4) | VERIFIED, untrue in practice |
| Banned words | No "mainland", "interest-free", "0%", "free assembly", "DivideBuy" or "award" found. "Orthopaedic" appears only as the product name "Memory Orthopaedic Mattress" (Meta already rejected it, Stage 2) | VERIFIED |
| "Best seller" badges (home, 9×) | Is it backed by sales? The BRIEF bans "best-selling" claims | ESTIMATE: keep only on products that really lead 90-day sales (Stage 2 product-intel), or rename "Popular" |
| Announcement bar "10% off… EAGLE10" | A live owner offer (Stage 1 O18). Our copy must not repeat it | Note only |
| Reply-time promise | "within 24 hours" (returns page), "two working days" (aftercare), none on the contact page | VERIFIED. Make it one promise |
| Courier vs own team | Press page: "never passed through a courier hub". Order #1022 was fulfilled with DPD tracking | VERIFIED. Owner: say "own team for beds" if small items go by courier |

### 4.3 Payment info on the site
Finance page lists Klarna, Clearpay and cash on delivery. Card and PayPal are mentioned only in its FAQ answer. RECOMMENDATION: lead with "Card, PayPal, Apple Pay/Google Pay, Klarna", keep cash on delivery "by arrangement", and drop Clearpay until it is proven on.

---

## 5. Enquiries: channels as they are today

### 5.1 Channels, VERIFIED

| Channel | What the customer sees | Where it lands | In HQ inbox? |
|---|---|---|---|
| Phone 07417 439197 | Bar, footer, product pages ("Call 07417 439197") | Owner's phone | No |
| WhatsApp | **Dondy WhatsApp Chat Widget** (app embed `dondy-whatsapp-chat-widget-101/ChatBubble.js`). No `wa.me` link anywhere on the site | Owner's WhatsApp. The forward-to-Gmail Zap in SETUP.md is an owner step, status UNKNOWN | No (UNKNOWN if Zap built) |
| Shopify Inbox chat | Second bubble, "Chat", bottom right (`shopify-chat`, empty greeting, "featured products" on). An **AI agent answers first** and transfers to the team | Shopify Inbox. Gmail gets "You have a new message… Agent transferred this conversation" | **No**. 3 transfers in 8 days (12, 15, 19 Nov) |
| Contact form (/pages/contact) | Name, Email, Phone number, Comment. No field is marked required in HTML. No subject, product, size or postcode fields | Gmail "New customer message" | Partly |
| Email | eaglebedofficial@gmail.com | Gmail | Yes (HQ inbox agent) |
| Judge.me Q&A | Off | – | – |

Sandbox note: the Dondy widget host was blocked in our browser, so its look and greeting are UNKNOWN. Two chat bubbles plus a sticky "Add to basket" bar compete for the bottom of the phone screen (Stage 1 #14 and the speed notes). RECOMMENDATION: keep **one** chat entry point (section 6.3).

### 5.2 Real enquiries since 1 Nov (Gmail + HQ `inbox` + Shopify Inbox notifications)

Excluded: trade-outreach bounces and auto-replies, STOP replies, vendor pitches. Customers are identified by order number or type only.

| # | Date | Channel | Stage | Type(s) | Outcome / first reply time |
|---|---|---|---|---|---|
| 1 | 28 Oct | Contact form | Pre-sale | Delivery area (Wales) | Replied after 14 days. ESTIMATE: likely a scam pattern ("ship… to someone in…", agency domain). Flag, don't chase |
| 2 | 6 Nov | Email | Pre-sale | Showroom / see beds | Replied after 5 days. Reply said "Yes, we do", which is not a BRIEF fact |
| 3 | 7 Nov (chased 11 Nov) | Email | Pre-sale | **Size/custom** (6ft × 6ft wingback, front-lift ottoman) | **No reply after 12 days**. Lost or at risk |
| 4 | 10 Nov | Email | Pre-sale | Custom end-lift ottoman + firm foam mattress + delivery window | Owner replied 11 Nov, sending them to WhatsApp. Price, foam details and date still owed |
| 5 | 11 Nov | Email | Pre-sale | Fabric swatches (7) | Replied 16 Nov. **Ordered 18 Nov, #1043, £539.97** ✔ |
| 6 | 12 Nov | Email | Pre-sale | Fabric swatches (7) | Replied 16 Nov, swatches posted. Open |
| 7 | 12 Nov | Shopify Inbox | UNKNOWN | UNKNOWN (agent transfer) | UNKNOWN. Not in HQ |
| 8 | 13–14 Nov | Email | Pre-sale | Fabric swatches (cream, Chesterfield) | Replied and posted 16 Nov. Open |
| 9 | 15 Nov | Email | Post-sale | **Delivery date** (#1038, NI) | Delivered 17 Nov |
| 10 | 15 Nov | Shopify Inbox | UNKNOWN | UNKNOWN (agent transfer) | UNKNOWN. Not in HQ |
| 11 | 17 Nov | Email (reply to outreach) | Trade | Trade + customer-supplied fabric | Replied same day ("Yes we do"). Waiting for sizes |
| 12 | 18 Nov | Email | Post-sale | **Delivery date** chase (#1040) | Replied same day (Saturday delivery) |
| 13 | 18 Nov | Email | Post-sale | **Assembly** add-on (#1043) | Replied in 11 min, but quoted £50 cash, not £69.99 |
| 14 | 19 Nov | Shopify Inbox | Pre-sale | **Delivery area/days** (South West England), "website says free delivery across Great Britain…" | Customer: "I'll place the order once I have a date set to move in". Hot lead, not in HQ. The answer given is UNKNOWN; the customer's reply suggests the agent or team gave a confusing delivery answer |

**Counts (14 enquiries, ESTIMATE where the type is UNKNOWN):**

| Type | Count | Notes |
|---|---|---|
| Fabric / swatches | 3 (+1 COM) | Best converter: 1 order already |
| Delivery date (post-order "where is it") | 2 | Caused by the early "on the way" email |
| Delivery area / days (pre-order) | 2 (+1 likely scam) | |
| Size / custom | 2 | 1 unanswered 12 days |
| Mattress (spec/firmness) | 1 (inside custom quote) | |
| Assembly | 1 | Price drift |
| Price / quote | 2 (inside custom) | Quotes not sent |
| Trade | 1 | |
| Showroom / viewing | 1 | No BRIEF fact. Needs an owner answer |
| Unknown (Inbox) | 2 | Not visible |

**Conversion so far:** 1 known order (#1043) from about 9 pre-sale enquiries in 19 days (11%). The window is too short and open to judge (ESTIMATE). Median first reply on email ≈ 2–5 days (VERIFIED for #2, #5, #6, #8, #1). Median on post-order chasers is the same day.

---

## 6. Better product enquiry experience (RECOMMENDATION, no live changes made)

### 6.1 "Ask about this bed" on every product page
Place it under "Add to basket", same width, outline style:

**Button:** `Ask about this bed` → opens WhatsApp with a ready message:
```
https://wa.me/447417439197?text=Hello%20Eagle%20Bed%2C%20I%27m%20looking%20at%20the%20{{ product.title | url_encode }}%20in%20{{ selected size | url_encode }}.%20My%20question%3A%20
```
- Liquid fills the product title. A small script updates the size when the shopper changes the size option (Easify / variant change event).
- Add `utm_source=whatsapp&utm_medium=chat&utm_campaign=pdp-ask` to the product URL inside the message, per the Stage 2 UTM standard.
- Under the button, small grey text: "WhatsApp or call 07417 439197, Mon–Fri 9–6. We reply within one working day." Second link: "Prefer email?" → `mailto:` with the subject "Question about {{ product.title }}" and a prefilled body (size, postcode district, question).
- Track a GA4/Shopify custom event `enquiry_click` with `channel` and `product` (Stage 2 tracking plan).

### 6.2 Swatch call-to-action prefilled
The product page already has "Order free swatches". Make the link carry the product: `/pages/request-a-swatch?bed={{ product.handle }}`. Prefill a hidden form field so the swatch request says which bed. Swatch requests are the best converter we have (enquiry #5 → #1043), so make this the second button on the page on mobile, not a text link.

### 6.3 One chat, not two
Evidence: the AI agent hands over to the team, but those handovers never reach HQ, and in today's chat the customer had to point at our own "free delivery across Great Britain" claim. RECOMMENDATION (owner decides):
- **Option A (simplest):** turn off the Shopify Inbox bubble. Keep the WhatsApp entry (Dondy bubble, or replace it with the plain `wa.me` button above, which saves about 70 KB per page, Stage 1 speed note).
- **Option B:** keep Shopify Inbox and turn **off** its AI agent, or give it only BRIEF facts. Add Inbox notifications to the HQ inbox agent's Gmail search (`from:no-reply@mailer.shopify.com subject:"new message"`).
Either way, the HQ inbox must capture every channel (section 7).

### 6.4 Contact form
Add: "What is it about?" (Delivery · Fabric & swatches · Size or custom bed · Mattress · Assembly · Price or quote · Trade/multiple beds · My order) · Bed name (optional) · Size (optional) · Postcode area (first half only, optional, e.g. "LS6"). Make Email required. Above the form: "We reply within one working day, Monday to Friday. For a quicker answer, WhatsApp 07417 439197." Remove "ClearPay" from this page.

### 6.5 Answers already on the page
The questions people ask (delivery days, assembly, custom size, mattress choice, fabrics) should be answered on the product page accordion before they need to ask. The accordion already covers delivery/assembly/returns/fabric. Add one line: "Need a size or fabric you can't see? Ask us. We will tell you if we can make it and the price." (homepage wording, already live).

---

## 7. Enquiry → quote → order tracking in HQ (RECOMMENDATION)

### 7.1 Collection `enquiries/{id}` (one document per enquiry, all channels)

| Field | Type | Example | Notes |
|---|---|---|---|
| id | string | `2026-11-19-inbox-01` | date-channel-n |
| createdAt | ISO time | 2026-11-19T12:00Z | first message time |
| channel | enum | email · contact-form · shopify-inbox · whatsapp · phone · trade-reply | |
| stage | enum | pre-sale · post-sale · trade · spam | |
| types | array | ["delivery-area","price"] | delivery-date, delivery-area, fabric-swatch, customer-fabric, mattress, assembly, size-custom, price-quote, trade, showroom, payment, order-status, after-sales |
| product | string | `side-lift-ottoman-gas-lift-storage-bed` | handle, optional |
| size | string | King 5ft | optional |
| postcodeArea | string | LS6 | **first half only** (data minimising) |
| contactRef | string | Gmail thread id / Inbox conversation id | **no name/email/phone stored in HQ**; open the source to see them |
| status | enum | new → replied → quote-sent → swatches-sent → won · lost · no-reply · spam | |
| firstReplyAt | ISO time | | for reply speed |
| quoteValue | number £ | 539.97 | when quote sent |
| quoteAt | ISO time | | |
| orderName | string | #1043 | when won |
| orderValue | number £ | 539.97 | net of discount |
| lostReason | enum | price · delivery-time · no-reply · bought-elsewhere · can't-make · other | |
| nextActionAt | ISO date | 2026-11-21 | drives the HQ "due today" list |
| nextAction | string | "Send price for 6x6 front-lift" | |
| owner | string | owner / agent | |

Status rules:
- **new**: first reply due within 1 working day (red after 24 working hours).
- **replied / swatches-sent**: follow up after 5 days once ("Did the swatches arrive?"), then one more after 10 days. Then **no-reply**.
- **quote-sent**: follow up after 3 days, then 7 days. Quotes are valid 14 days (owner to confirm).
- **won**: auto-match when a Shopify order arrives with the same email (HQ agent compares privately) or the owner enters the order number.

### 7.2 Weekly conversion metric (Monday card)

Use **closed, matching windows** (analytics skill rule). Count enquiries created in the week that ended **4 weeks ago**, and how many of those became orders within 28 days. Do not divide this week's orders by this week's enquiries.

| Metric | Formula | Target (ESTIMATE) |
|---|---|---|
| Enquiry → order (28-day) | won ÷ pre-sale enquiries created in week W-4 | 20%+ |
| Swatch → order (28-day) | won with "fabric-swatch" ÷ swatch enquiries in W-4 | 25%+ |
| First reply time (median, working hours) | median(firstReplyAt − createdAt), this week | ≤ 8 h |
| Open past due | count nextActionAt < today | 0 |
| Enquiry revenue | Σ orderValue of won, by month | report only |

### 7.3 Moving existing records
The 9 docs in HQ `inbox` hold names. On migration, keep only `contactRef` (thread id), type, status and order number in `enquiries`. Add the 3 Shopify Inbox conversations (12, 15, 19 Nov) by hand from Shopify Inbox. Add the unanswered 7 Nov made-to-measure enquiry as **new, overdue** (top of the list).

---

## 8. Priority actions (owner)

| P | Action | Effort | Label |
|---|---|---|---|
| P0 | Reply today to the 7 Nov made-to-measure enquiry (template T-size) and to today's South West chat lead (template T-area) | 10 min | VERIFIED need |
| P0 | Decide #1043 assembly: honour the written £50 (recommended) and note it on the order | 2 min | VERIFIED |
| P0 | Clearpay: switch on or remove everywhere (16 pages + theme + WhatsApp `/pay` + BRIEF) | owner decision | VERIFIED |
| P1 | Stop fulfilling on order day; mark delivered on delivery day; edit shipping confirmation email | habit + 10 min | VERIFIED |
| P1 | Judge.me: trigger Delivered +5 days, fallback 10 days after fulfilment, 1 reminder at 7 days, write-review = verified buyers (or label others), UK date format, star badge under title, widget higher | 20 min in app | RECOMMENDATION |
| P1 | Fix /pages/reviews and /pages/aftercare-and-feedback statements | text | VERIFIED wrong |
| P1 | One chat entry; route Shopify Inbox into HQ | 15 min | VERIFIED gap |
| P1 | Company number, registered office (and VAT if registered) in footer + Terms; proper Terms of Service | owner + legal | UNKNOWN status |
| P2 | "Ask about this bed" button + swatch prefill + contact form fields (theme copy, owner publishes) | ~2 h dev | RECOMMENDATION |
| P2 | HQ `enquiries` collection + Monday conversion card | ~2 h | RECOMMENDATION |
| P2 | Add Jersey/Guernsey/IoM to the 8 pages that say NI only; align refund policy with the returns page; mattress line on the warranty page | text | VERIFIED |

---

## Limitations

- No access to the Judge.me admin, Shopify Inbox conversations, the Dondy widget settings, WhatsApp chats or phone logs. The Judge.me request timing is inferred from review timestamps (ESTIMATE).
- Google Business Profile reviews were not visible: the web search found no listing, and the GBP API was not called (Zapier budget). The "0 Google reviews" figure is an ESTIMATE from Google's own email and the lack of review notifications.
- gov.uk (CMA208, Companies House) could not be opened from this session (DNS blocked). Legal points rely on reputable law-firm summaries of CMA208. The company number is from a third-party register and must be confirmed by the owner.
- The sandbox browser blocks third-party hosts (shop.app, Judge.me tracking, Dondy, Meta, TikTok). The review widget rendered, but chat bubbles may look different on real phones. No layout findings are claimed here. The sticky bar width seen in the sandbox (1,290 px) is UNVERIFIED (see the common brief).
- The enquiry sample is small (14 in 19 days) and conversion windows are still open.
- Customer data: read only to classify. Nothing is copied here except order numbers.

## Credits used

- OpenRush: **0** (budget 0).
- Zapier: 0. Shopify: 3 read-only GraphQL queries. Gmail: 9 read-only searches/reads. HQ ArtifactData: 2 reads (`inbox`, `leads`). WebSearch: 6. Playwright: 1 run (6 pages × 2 devices), 6 screenshots (13–60 KB each).

## Sources

- CMA, Fake reviews guidance CMA208 (4 Apr 2025): https://assets.publishing.service.gov.uk/media/67eeb64fe9c76fa33048c790/CMA208_-_Fake_reviews_guidance.pdf
- CMA, Online consumer reviews case page: https://www.gov.uk/cma-cases/online-consumer-reviews
- CMS, "No more faux five-stars: The DMCC Act bans fake reviews": https://cms.law/en/gbr/legal-updates/no-more-faux-five-stars-the-dmcc-act-bans-fake-reviews
- Lewis Silkin, "Get DMCC ready: review your reviews": https://www.lewissilkin.com/insights/2024/12/19/get-dmcc-ready-review-your-reviews-102jre1
- Freshfields, "CMA signals end of grace period, fake reviews enforcement steps up": https://riskandcompliance.freshfields.com/post/102kxvj/cma-signals-end-of-grace-period-fake-reviews-enforcement-steps-up
- Judge.me help, review request settings / reminders: https://judge.me/help/en/articles/8379844-setting-up-your-review-request-flow · https://judge.me/help/en/articles/11792628-review-request-reminders
- Judge.me blog, review request timing: https://judge.me/blog/review-requests-4-key-points-to-get-more-responses-and-better-reviews
- Google review policy (summary of review gating and incentives): https://www.podium.com/online-reviews/review-gating/ · https://www.reviewtrackers.com/review-gating-google/
- Company trading disclosures (registered name, number, office on websites): https://www.legislation.gov.uk/uksi/2015/17/part/6 · https://cms.law/en/gbr/legal-updates/trading-disclosures-under-the-companies-act-2006-an-overview
- Third-party company listing (to be confirmed at Companies House): https://corpsignals.uk/companies/uk/eagle-bed-ltd-17084410.html
