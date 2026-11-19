# Abandoned checkout flow (Shopify Email automation)

Ready to paste. Nothing here has been sent or switched on. See SETUP.md for where each part goes.

```
Sequence: Abandoned checkout
Trigger: Customer starts checkout, gives their email, does not pay
Goal: Customer returns to their saved checkout and completes the order
Length: 2 emails
Timing: 1 hour after leaving, then 24 hours after leaving
Exit: Customer completes the order (Shopify stops the flow automatically)
Who gets it: only customers your checkout settings allow (see SETUP.md, GDPR/PECR)
```

Rules used: no discounts, no countdowns, no "only X left", no "interest-free". Delivery and assembly wording matches BRIEF (free delivery to the door/downstairs; room-of-choice assembly is an optional paid extra and is not mentioned here).

Liquid notes:
- `{{ customer.first_name }}` works in Shopify Email text blocks. If a customer has no first name, the line reads "Hi ," so in the editor use **Personalise > First name** and set the fallback to `there` (this does the same job as `{{ customer.first_name | default: "there" }}`).
- Keep the template's built-in **Abandoned checkout items** section (shows their bed, size and price) and its **button**. The button already links to that customer's own saved checkout (`{{ checkout.url }}`), so you only change the button text.

---

## Email 1: Your bed is saved

**Send:** 1 hour after checkout is abandoned

**Subject:** {{ customer.first_name }}, your bed is saved in your basket

**Preview text:** Every Eagle Bed is handmade to order in our Dewsbury workshop. Any questions before you order?

**Body:**

Hi {{ customer.first_name }},

You left a bed in your checkout, so we've kept it for you below.

Every Eagle Bed is handmade to order in our own workshop in Dewsbury, by a family-run team. Delivery is free across England, Scotland and Wales, by our own delivery team.

Not sure about the colour? We'll post you free fabric swatches first: www.eaglebed.co.uk/pages/request-a-swatch

If something stopped you, such as a size question or delivery to your area, message us on WhatsApp on 07417 439197 and you'll get a real person from the workshop.

[ Abandoned checkout items section ]

**Button:** Return to my checkout → (built-in checkout link)

Thanks,
The Eagle Bed family

---

## Email 2: Questions answered

**Send:** 24 hours after checkout is abandoned (only if they still haven't ordered)

**Subject:** Questions about your Eagle Bed order?

**Preview text:** Free delivery, Klarna or Clearpay, 14-day free returns and a 5-year frame warranty.

**Body:**

Hi {{ customer.first_name }},

Buying a bed online is a big decision, so here are the answers people ask us most:

- **Delivery:** free across England, Scotland and Wales to your door, by our own team. Room of choice drop off is +£29.99 and room of choice assembly is +£69.99, both optional.
- **Paying:** card, PayPal, Klarna or Clearpay at checkout.
- **Returns:** 14-day free returns if the bed is unused, unassembled and in its original packaging.
- **Warranty:** 5-year frame warranty.
- **Fabric:** free swatches, or send us your own fabric.

Your bed is still in your checkout below.

[ Abandoned checkout items section ]

**Button:** Complete my order → (built-in checkout link)

Or call us Mon–Fri 9am–6pm on 07417 439197, WhatsApp the same number, or email eaglebedofficial@gmail.com.

The Eagle Bed family

---

## What to watch (after 4 weeks)

- Recovery rate (orders recovered ÷ emails sent), shown in Marketing > Automations for each email.
- Replies and WhatsApp messages that mention the email: these are often questions worth adding to the product pages.
- If email 2 recovers more than email 1, the FAQ points are doing the work; consider moving delivery and returns into email 1.
