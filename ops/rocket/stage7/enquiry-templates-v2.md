# Eagle Bed enquiry templates v2 (Stage 7, 20 Nov 2026)

Replaces `ops/rocket/stage3/enquiry-templates.md` for day-to-day use. The Stage 3 file stays as history. These are drafts in a file. Nothing has been sent, drafted in Gmail or turned on.

What changed from the Stage 3 version:
- Each enquiry is put in one of 9 classes (section A). Each class has a main template and, where it helps, a short follow-up.
- New facts added: the Ottoman Gas Lift Divan Base is 14 inches high. The business is ABBAS TRADE LTD, trading as Eagle Bed. Assembly is £69.99 (an option, never free). Room-of-choice drop-off is £29.99.
- Clearpay is removed everywhere. Payment wording is card, PayPal or Klarna at checkout, or cash on delivery by arrangement.
- New holding lines cover facts we do not have yet: workshop visits, storage depth, which side an ottoman opens, exact dimensions, gas-strut warranty cover, price of custom sizes, and trade terms. The reply admits the gap and gives a time for the answer. It never guesses.
- New templates: ready to buy (T1), dimensions/fit (T3-SIZE-FIT), base height (T3-HEIGHT), ottoman opening and storage (T3-OTTOMAN), Shopify Inbox / WhatsApp short versions, complaint (T8), and the "suspicious" reply.
- These were written after real replies went wrong in Nov 2026. Problems seen: answers like "Yes we can do" with no detail, assembly quoted at £50, "we do assembly" given with no price, "Yes, we do" to a showroom question, a wrong WhatsApp number (07417 449197), a reply sent with an internal note still in it, and quotes that were promised but never sent.

---

## A. Classification (use for every enquiry, every channel)

| Class | Name | Signals | Main template | Reply target | Owner fact needed? |
|---|---|---|---|---|---|
| 1 | Ready to purchase | "I want to order", names bed + size + colour, asks for a link or total | T1 | Same working day | Only if the spec is non-standard |
| 2 | Price / quote | "how much", "quote", custom build, itemise | T2, T2-FOLLOW-UP | Holding reply same day; quote within 1 working day | Yes for custom prices |
| 3 | Configuration | size, dimensions, fit, height, fabric, swatches, drawers vs ottoman, opening side, headboard, mattress, customer fabric | T3-SWATCH, T3-SWATCH-FOLLOW-UP, T3-SIZE-FIT, T3-HEIGHT, T3-OTTOMAN, T3-CUSTOM, T3-OWN-FABRIC, T3-MATTRESS | Within 1 working day | Often (dimensions, storage depth, opening side) |
| 4 | Delivery | "do you deliver to…", which days, by a date, "where is my order" | T4-AREA, T4-DATE, T4-WHERE | Same working day (post-order: within hours) | Delivery day from the workshop diary |
| 5 | Assembly | assembly, carrying upstairs, removal of an old bed | T5 | Same working day | No |
| 6 | Trade | business buyer, several beds, designer, landlord, holiday let | T6 | Within 1 working day | Yes, before any trade price or terms |
| 7 | Aftercare | care, gas lift, instructions, warranty question, change to an order | T7 | Within 1 working day | Gas-strut facts BLOCKED |
| 8 | Complaint | damage, fault, late, wrong item, unhappy | T8 | Same working day; phone first if possible | No |
| 9 | General | showroom/visit, payment, who are you, company details, anything else | T9-VISIT, T9-PAY, T9-COMPANY, T9-SUSPICIOUS | Within 1 working day | Visiting rule BLOCKED |

Rules for tagging:
- One main class per enquiry. Put any other topics in "secondary" (see `customer-enquiries.csv`).
- Class 1 beats every other class. A ready buyer who also asks about assembly is still class 1.
- Post-order messages are class 4, 5, 7 or 8. They are never class 1.
- Log every enquiry in HQ, whatever the channel: email, contact form, Shopify Inbox hand-off, WhatsApp, phone. Record the anonymised ID, class, product and next action date. Never record names.

## B. Safe-to-send rule (check before every send)

A reply is safe to send only if every answer below is YES.

1. **No placeholders.** The text has no `[`, `]`, `{`, `}`, `<`, `>`, "XX", "TBC", "OWNER:" or "note to". Search for each before sending.
2. **Facts come only from `ops/BRIEF.md`** or from a fact the owner has confirmed in writing for this customer. Anything else uses its holding line from section C.
3. **Price words.** Assembly is "Optional room-of-choice assembly is available for £69.99." Room-of-choice drop-off is £29.99. Delivery is free to the door (downstairs) across England, Scotland and Wales, and £90 for Northern Ireland, Jersey, Guernsey and the Isle of Man. Never write free or included assembly. Never write Clearpay, 0%, interest-free, DivideBuy, sleep trial, "mainland", fire-safety, hotel/contract supplier, "leading", "best" or medical claims. Never offer a discount. Never give a trade price or terms the owner has not written down.
4. **No date promise.** Write "usually within 3 to 5 working days", and say we contact the customer to agree a day. Give a specific day only after the owner has confirmed it in the workshop diary.
5. **Answer every question asked.** Use an answer or a holding line for each one. A one-word reply ("Sure", "Yes we can do") is never enough.
6. **Contact details are exact.** Phone and WhatsApp are 07417 439197, Mon–Fri 9am–6pm. Check the digits.
7. **No personal data in HQ** or in any shared file. Use order numbers or E-IDs.

Holding-line promise: when a fact is missing, say what we are checking and when the customer will hear back ("by the end of the next working day"). Put the next-action date in HQ the same day. If the owner cannot give the fact in time, send a second holding line before the deadline. Do not stay silent.

## C. Holding lines for facts we do not have (copy exactly)

| Unknown (status) | Holding line |
|---|---|
| Workshop visits: hours or appointment? (BLOCKED until the owner confirms the visiting rule) | "Our beds are made in our own workshop in Dewsbury. I am checking with the workshop when a visit can be arranged, and I will reply by the end of the next working day. In the meantime we can post free fabric swatches so you can see the colours at home." |
| Ottoman storage depth (BLOCKED) | "I am getting the exact storage depth for your size from the workshop and will send it by the end of the next working day." |
| Which side an ottoman opens (BLOCKED, per product) | "I am confirming with the workshop which way this base opens and whether it can be made to open the way you need. I will reply by the end of the next working day." |
| Exact dimensions of a design or size (UNKNOWN unless on the product page) | "I am getting the exact measurements for this design in your size from the workshop, including the headboard, and will send them by the end of the next working day." |
| Gas-strut warranty cover, strut rating, replacement process (BLOCKED) | "Every frame has a 5-year warranty. I am checking exactly how the gas struts are covered and will confirm by the end of the next working day." |
| Custom size or custom build price (needs the owner) | "I have passed your measurements to the workshop. We will tell you whether we can make it, and the price, by the end of the next working day." |
| Customer-supplied fabric quantity (BLOCKED per size) | "We will confirm the fabric quantity for your size." |
| Trade prices, minimums, VAT invoice process, lead times (BLOCKED) | "I will send a written quote for the full order by the end of the next working day." |
| Removal of an old bed (owner said "we don't remove existing beds" in a reply on 19 Nov; not yet in BRIEF) | Until it is added to BRIEF: "I am checking with the delivery team whether we can take away an old bed, and will confirm by the end of the next working day." |

---

## D. Templates

Every template: start with "Hello," (the first name may be added). Sign off "Eagle Bed" and give 07417 439197 (call or WhatsApp, Mon–Fri 9am–6pm). For WhatsApp or Shopify Inbox, drop the subject line and use the short version where one is given.

### T1 · Class 1 · Ready to purchase

Subject: Your Eagle Bed order

Hello,

Thank you, we would love to make this bed for you. Every Eagle Bed is handmade to order in our own workshop in Dewsbury.

You can order it here: https://www.eaglebed.co.uk. Choose the size, fabric and options on the product page. Delivery is free to your door (downstairs) across England, Scotland and Wales, by our own team. Northern Ireland, Jersey, Guernsey and the Isle of Man are £90. Room of Choice Drop Off is £29.99. Optional room-of-choice assembly is available for £69.99.

You can pay by card, PayPal or Klarna at checkout, or cash on delivery if we arrange it with you first.

Delivery is usually within 3 to 5 working days of your order. We will contact you to agree a day that suits you. Every frame has a 5-year warranty, and you can return an unused item in its original packaging free within 14 days.

If anything in your message needs checking with the workshop first, I have asked them and will reply by the end of the next working day.

Thank you,
Eagle Bed
07417 439197 (call or WhatsApp, Mon–Fri 9am–6pm)

*Short (Inbox/WhatsApp):* "Thank you, we'd love to make it for you. Order at www.eaglebed.co.uk: pick size, fabric and options on the product page. Free delivery to your door in England, Scotland and Wales, usually 3–5 working days, and we call to agree the day. Optional room-of-choice assembly is £69.99. Pay by card, PayPal or Klarna, or cash on delivery by arrangement."

### T2 · Class 2 · Price or quote

Subject: Your quote from Eagle Bed

Hello,

Thank you for asking for a quote. Prices for every standard design and size are on each product page at www.eaglebed.co.uk, and they include VAT. Delivery is free to your door across England, Scotland and Wales, and £90 for Northern Ireland, Jersey, Guernsey and the Isle of Man. Room of Choice Drop Off is £29.99. Optional room-of-choice assembly is available for £69.99.

For anything made specially for you, such as a size, fabric or build not shown on the site, I have passed your details to the workshop. I will send a written, itemised quote by the end of the next working day. If we cannot make something exactly as you describe, we will say so and suggest the nearest option.

You can pay by card, PayPal or Klarna at checkout, or cash on delivery by arrangement.

Thank you,
Eagle Bed
07417 439197

### T2-FOLLOW-UP · 3 days after a quote (once; once more at 7 days only if needed)

Subject: Your Eagle Bed quote

Hello,

I wanted to check that our quote reached you and whether you have any questions about size, fabric or delivery. If you would like to see the fabric first, we can post free swatches.

Just reply, or call or WhatsApp 07417 439197, Mon–Fri 9am–6pm.

Thank you,
Eagle Bed

### T3-SWATCH · Class 3 · Fabric swatches

Subject: Your free fabric swatches

Hello,

Thank you for your swatch request. We are happy to send free fabric swatches so you can see the colours in your own light before you choose. We will post the colours you asked for to the address you gave us, and let you know when they are on their way. If you would like a few more colours in the same fabric to compare, just say.

Our fabrics come in solid colours, stripes and two-tone finishes. You can also request swatches online: https://www.eaglebed.co.uk/pages/request-a-swatch

When you have chosen, reply with the bed, size and colour, and we will help you place the order.

Thank you,
Eagle Bed
07417 439197

### T3-SWATCH-FOLLOW-UP · 5 days after posting (one follow-up only)

Subject: Did your swatches arrive?

Hello,

I hope your fabric swatches arrived safely. If you would like help choosing a colour or size, or a second look at any fabric, just reply or call us on 07417 439197.

If you are not ready yet, that is fine. We won't keep emailing.

Thank you,
Eagle Bed

### T3-SIZE-FIT · Class 3 · Dimensions or "will it fit my room?"

Subject: Measurements for your bed

Hello,

Thank you for checking before you order. That is the best way to get the right bed.

I am getting the exact measurements for this design in your size from the workshop, including the headboard, and will send them by the end of the next working day. Because every bed is handmade to order in our Dewsbury workshop, if the standard size is a little too big for your space we can tell you whether we can make it to fit and what that would cost.

Our standard sizes are Kids Single 2ft6, Single 3ft, Small Double 4ft, Double 4ft6, King 5ft and Super King 6ft.

Thank you,
Eagle Bed
07417 439197

### T3-HEIGHT · Class 3 · Ottoman Gas Lift Divan Base height

Subject: Ottoman Gas Lift Divan Base height

Hello,

Thank you for your question. The Ottoman Gas Lift Divan Base is 14 inches high.

I am getting the exact storage depth for your size from the workshop and will send it by the end of the next working day.

Every base is handmade to order in our Dewsbury workshop. Delivery is free to your door across England, Scotland and Wales by our own team, usually within 3 to 5 working days, and we contact you to agree the day. If you would like to see the fabric first, we can post free swatches.

Thank you,
Eagle Bed
07417 439197

(Use only for the Ottoman Gas Lift Divan Base. The owner has not confirmed heights for other bases.)

### T3-OTTOMAN · Class 3 · Ottoman opening side, storage, drawers instead of ottoman

Subject: Your ottoman bed question

Hello,

Thank you for your message. All our beds are handmade to order in our Dewsbury workshop, so we can often adapt a design.

I am confirming with the workshop which way this base opens and whether it can be made to open the way you need. I am also getting the storage depth for your size. If you asked about drawers instead of an ottoman, or a separate headboard, I have passed that to the workshop too. You will have a full answer, with any price difference, by the end of the next working day.

Thank you,
Eagle Bed
07417 439197

### T3-CUSTOM · Class 3 · Made-to-measure size or custom build

Subject: Your made-to-measure bed

Hello,

Thank you for your message, and sorry for the wait. Every bed is handmade to order in our Dewsbury workshop, so we can often help with sizes and options that are not on the website.

I have passed your exact measurements and the design you like to the workshop. We will tell you whether we can make it, and the price, by the end of the next working day. If anything about the size needs checking, we will call you rather than guess.

Thank you,
Eagle Bed
07417 439197

### T3-OWN-FABRIC · Class 3 · Customer-supplied fabric

Subject: Using your own fabric

Hello,

Yes, we accept customer-supplied fabric. Every bed is handmade to order in our Dewsbury workshop, so we can upholster it in your fabric.

Please tell us the bed and size you want. We will confirm the fabric quantity for your size, and the price, by the end of the next working day.

Thank you,
Eagle Bed
07417 439197

### T3-MATTRESS · Class 3 · Mattress questions

Subject: Mattress for your bed

Hello,

Thank you for asking about mattresses. Our mattresses come with a 5-year guarantee, and you can add one to your bed order so that everything arrives together.

Please tell us the bed size and what you need from the mattress, for example firmer or softer. I will check with the workshop and reply by the end of the next working day with the options and prices for your size. We would rather give you an accurate answer than a quick guess.

Thank you,
Eagle Bed
07417 439197

### T4-AREA · Class 4 · "Do you deliver to my area / on which days?"

Subject: Delivery to your area

Hello,

Thank you for your message. Yes, delivery is free to your door (downstairs) anywhere in England, Scotland and Wales, by our own delivery team. Delivery to Northern Ireland, Jersey, Guernsey and the Isle of Man is £90. We deliver within the UK only.

Every bed is handmade to order in our Dewsbury workshop. Delivery is usually within 3 to 5 working days of your order. Once your bed is ready, we contact you to agree a delivery day that suits you.

If you have a date in mind, for example a move-in day, tell us and we will check it with the workshop before you order. We will not take an order for a date we cannot keep.

Room of Choice Drop Off is £29.99. Optional room-of-choice assembly is available for £69.99. You can choose either on the product page.

Thank you,
Eagle Bed
07417 439197 (call or WhatsApp, Mon–Fri 9am–6pm)

*Short (Inbox/WhatsApp):* "Yes, we deliver free to your door anywhere in England, Scotland and Wales with our own team, usually within 3–5 working days of ordering. When your bed is ready we contact you to agree a day that suits you. If you have a move-in date, tell us and we'll check it with the workshop before you order."

### T4-DATE · Class 4 · "Can I have it by a date?" (before ordering)

Subject: Your delivery date

Hello,

Thank you for asking. Each bed is handmade to order in our Dewsbury workshop. Delivery is usually within 3 to 5 working days of your order, free across England, Scotland and Wales by our own team.

I am checking the workshop diary for your date now and will confirm by the end of the next working day whether we can meet it. We will not take your order for a date we cannot keep.

Thank you,
Eagle Bed
07417 439197

### T4-WHERE · Class 4 · "Where is my order?" (after ordering)

Subject: Your Eagle Bed order

Hello,

Thank you for your order, and sorry if our earlier email was unclear. Your bed is handmade to order in our Dewsbury workshop. It is not sent by courier, so there is no tracking link. Our own team brings it to your door.

Delivery is usually within 3 to 5 working days of your order. I am checking with the workshop now. I will call or message you with your delivery day by the end of today, or by 10am on the next working day if you wrote to us after 4pm.

If you need a particular day, please tell us and we will do our best to fit it in.

Thank you,
Eagle Bed
07417 439197

### T5 · Class 5 · Assembly (before or after ordering)

Subject: Assembly for your bed

Hello,

Thank you for asking. Delivery is free to your door (downstairs). If you would like more help, there are two options:

- Room of Choice Drop Off, £29.99: our team carries the bed to the room you choose.
- Room of Choice Assembly, £69.99: our team carries it to your room and assembles it.

If you have not ordered yet, choose the option under Delivery Service on the product page. If you have already ordered, reply "Yes please" and we will add assembly to your order for £69.99 and confirm it before your delivery day. You can pay by card, or by cash on delivery if we arrange it with you first.

Thank you,
Eagle Bed
07417 439197

(If the customer also asks about taking away an old bed, add the removal holding line from section C.)

### T6 · Class 6 · Trade (business buyers)

Subject: Beds for your business

Hello,

Thank you for your interest. Eagle Bed is a family-run maker, and every bed is handmade to order in our own workshop in Dewsbury. Eagle Bed is the trading name of ABBAS TRADE LTD (company number 16410472, VAT number 520 9622 06). Prices include VAT.

Delivery is free to the door across England, Scotland and Wales by our own team. Room of Choice Drop Off is £29.99 per bed. Optional room-of-choice assembly is available for £69.99 per bed. We also accept customer-supplied fabric, and we will confirm the fabric quantity for each size.

Please tell us how many beds you need, the sizes and designs, and your delivery area. I will send a written quote for the full order by the end of the next working day.

Thank you,
Eagle Bed
07417 439197 (call or WhatsApp)

(Never add trade discounts, minimum orders, payment terms, lead times, fire-safety or contract claims until the owner writes them into BRIEF.)

### T7 · Class 7 · Aftercare (care, gas lift, instructions, change to an order)

Subject: Help with your Eagle Bed

Hello,

Thank you for getting in touch. We are happy to help.

Please reply with your order number and, if it helps, a photo or short video of what you are seeing. I will reply by the end of the next working day, or call you if that is quicker.

Every frame has a 5-year warranty, and mattresses have a 5-year guarantee. If you have a question about the gas lift or assembling your bed, I will check with the workshop team who made it and come back to you with clear steps.

You can also call or WhatsApp us on 07417 439197, Mon–Fri 9am–6pm.

Thank you,
Eagle Bed

(Gas-lift troubleshooting steps and strut replacement wording are BLOCKED until the owner gives strut facts. Do not invent steps.)

### T8 · Class 8 · Complaint, damage or fault

Subject: Your Eagle Bed order

Hello,

I am sorry to hear something isn't right, and thank you for telling us. We will sort it out.

Please reply with your order number and a photo of the problem. Returns are free within 14 days if the item is unused and in its original packaging. Every frame has a 5-year warranty, and mattresses have a 5-year guarantee. If anything arrived faulty or damaged, we will put it right with a repair, a replacement or a refund.

I will call you, or reply with the next step, by the end of the next working day.

Thank you,
Eagle Bed
07417 439197

(Rules: phone first if possible. Log it in the aftercare register with an anonymised ID. Never ask a customer not to leave a review. If they post a negative review, reply with R-reply-negative from the Stage 3 file.)

### T9-VISIT · Class 9 · "Do you have a showroom? Can I visit?" (BLOCKED wording)

Subject: Seeing our beds

Hello,

Thank you for asking. Our beds are made in our own workshop in Dewsbury, and we sell online across the UK. I am checking with the workshop when a visit can be arranged, and I will reply by the end of the next working day.

In the meantime, the easiest way to judge colour and feel at home is with our free fabric swatches, which we post to you: https://www.eaglebed.co.uk/pages/request-a-swatch

Every frame has a 5-year warranty, and unused items in their original packaging can be returned free within 14 days.

Thank you,
Eagle Bed
07417 439197

(Once the owner confirms the visiting rule, either opening hours or "by appointment", replace the second paragraph with that rule and remove BLOCKED. Never write "Yes, we have a showroom". Never give the owner's home address. The workshop is Pepproyd Street, Eastborough, Dewsbury WF13 1PA, but say "Dewsbury" in copy unless the owner approves the full address in replies.)

### T9-PAY · Class 9 · How can I pay?

Subject: Ways to pay

Hello,

You can pay by card, PayPal or Klarna at checkout on www.eaglebed.co.uk. If you would rather pay cash when your bed arrives, please call 07417 439197 or email us before you order and we will arrange it.

Thank you,
Eagle Bed

### T9-COMPANY · Class 9 · Who are you? (company details)

Subject: About Eagle Bed

Hello,

Thank you for asking. Eagle Bed is the trading name of ABBAS TRADE LTD, company number 16410472, VAT number 520 9622 06. We are a family-run business, and our beds are handmade to order in our own workshop in Dewsbury, West Yorkshire. We sell online across the UK.

Thank you,
Eagle Bed
07417 439197

(Do not give a registered office address until the owner and accountant confirm it.)

### T9-SUSPICIOUS · "Ship to someone else" / third-party payment messages

Do not send bank details. Do not accept cheques, third-party transfers or "agent" payments. Reply only with:

"Thank you. You can order any of our beds directly at www.eaglebed.co.uk. We deliver within the UK only."

---

## E. Next-action rules (HQ)

| Status | Rule |
|---|---|
| New | First reply within 1 working day. Shows red in HQ after 24 working hours |
| Holding line sent | Owner fact due by the date in the message. If it is missed, send a second holding line before the deadline |
| Swatches sent | One follow-up after 5 days (T3-SWATCH-FOLLOW-UP), then stop |
| Quote sent | Follow up at 3 days, then once more at 7 days (T2-FOLLOW-UP), then stop |
| Won | Record the order number (HQ matches privately; never store the email) |
| Lost / no reply | Record a reason: price, delivery time, no reply from us, no reply from them, can't make, other |
