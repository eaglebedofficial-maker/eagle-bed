# Post-purchase emails

Ready to paste. Nothing here has been sent or switched on. See SETUP.md for where each one goes.

```
Sequence: After an order
Trigger: Order paid on www.eaglebed.co.uk (or cash-on-delivery order confirmed by phone/email)
Goal: Customer feels looked after while their bed is made, is ready on delivery day, and leaves an honest review
Length: 4 emails
Timing: on order > 1–2 working days later > day before / morning of delivery > 3–5 days after delivery
Exit: Order cancelled or refunded (don't send the rest)
```

Placeholders in **{curly brackets}** are for you to fill in before sending. Search for `{` before you press send. In the Shopify notification (Email 1) the `{{ ... }}` parts are Shopify Liquid and fill themselves in; leave those as they are.

Delivery wording follows BRIEF: free delivery is to the door/downstairs. Room of choice drop off (+£29.99) and room of choice assembly (+£69.99) are paid options the customer chose at checkout, so email 3 asks you to check which one they have.

---

## Email 1: Order confirmed

**How:** Add to Shopify's own order confirmation email (Settings > Notifications > Order confirmation). Paste the block below just under the line that thanks them for their order. Shopify sends it automatically.

**Subject (Shopify field):** Order {{ order_name }} confirmed: your bed is going into the workshop

**Paste this block:**

```
<p>Hi {{ customer.first_name }},</p>
<p>Thank you for your order. Your bed is now in the queue at our workshop in Dewsbury, where our family-run team will make it by hand to your size and fabric.</p>
<p>What happens next:</p>
<ul>
  <li>We'll email you when your bed is being made.</li>
  <li>We'll confirm your delivery date by phone or email.</li>
  <li>Our own team delivers it, free across England, Scotland and Wales.</li>
</ul>
<p>Need to change something, like the fabric or delivery address? WhatsApp us on 07417 439197 or reply to this email as soon as you can.</p>
```

(About 85 words. Shopify adds the order summary and prices underneath.)

---

## Email 2: Your bed is being made

**How:** Send by hand from eaglebedofficial@gmail.com 1–2 working days after the order, when the bed goes on the bench. Plain text.

**Subject:** Your Eagle Bed is being made

Hi {first name},

Good news from the workshop: we've started making your {bed name} in {fabric}.

Every Eagle Bed is cut, built and upholstered by hand here in Dewsbury, so it's made for your order and nobody else's.

We'll confirm your delivery date by phone or email. Delivery is free across England, Scotland and Wales, by our own delivery team.

If you'd like to add room of choice drop off (£29.99) or room of choice assembly (£69.99) before delivery, just reply and we'll arrange it.

Any questions in the meantime, WhatsApp us on 07417 439197.

Thanks,
{your name}
Eagle Bed

---

## Email 3: Delivery day

**How:** Send by hand (email, or copy the same text into WhatsApp) the day before delivery or first thing on the morning. Fill in the date and delivery option they chose.

**Subject:** Your Eagle Bed arrives {delivery day and date}

Hi {first name},

Your {bed name} is out with our delivery team on {delivery day and date}.

You chose: {downstairs drop off / room of choice drop off / room of choice assembly}.

A few things that help on the day:
- Clear a path from the door to where the bed is going.
- Measure tight stairs or doorways if you're unsure, and tell us before we set off.
- Someone needs to be in to take the delivery.

If the day no longer suits you, call or WhatsApp us on 07417 439197 as early as you can (Mon–Fri 9am–6pm).

See you soon,
{your name}
Eagle Bed

---

## Email 4: After delivery (care tips + review)

**How:** Send by hand 3–5 days after delivery. If you set up a Shopify Email "Thank customer after purchase" automation instead, see SETUP.md (it only goes to customers who agreed to marketing).

**Subject:** How's your new bed, {first name}?

Hi {first name},

Your bed has been home for a few days now, and we'd love to know how you're finding it.

A few care tips to keep the fabric looking good:
- Vacuum it now and then with the soft brush attachment.
- Blot spills straight away with a clean, dry cloth. Don't rub.
- Check the bolts and fittings every few months and tighten if needed.

Your frame has a 5-year warranty. If anything isn't right, WhatsApp us on 07417 439197.

If you're happy with your bed, would you leave us a short, honest review? It helps other families find a small workshop like ours:
{review link}

Thank you for buying from us,
{your name}
Eagle Bed

---

## Notes for the owner

- **{review link}**: use your Google Business Profile review link (Google Business Profile > Ask for reviews > copy link) or your Facebook page https://www.facebook.com/share/1GQsNDz1cV/. Don't offer anything in return for a review, and ask every customer, not just the happy ones.
- **Care tips:** these are general fabric care tips. If your fabrics come with their own care advice (for example from the fabric supplier), use that instead.
- **Returns reminder:** if a customer asks about returning, the rule is 14 days, unused, unassembled and in original packaging. That's why it isn't in email 4: by then the bed is usually assembled.
