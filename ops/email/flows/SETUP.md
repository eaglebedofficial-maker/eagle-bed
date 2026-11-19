# Email flows: setup guide for the owner

Prepared 19 Nov 2026. Nothing has been sent and nothing in the Shopify store has been changed. You switch each flow on yourself when you're happy with it.

Files in this folder:
- `abandoned-checkout.md`: 2 automatic emails for people who leave the checkout
- `swatch-follow-up.md`: 2 emails you send by hand after posting swatches
- `post-purchase.md`: 4 emails from order to after delivery
- `SETUP.md`: this guide

---

## Step 1: Check who can receive abandoned checkout emails (do this first)

1. Shopify admin > **Settings** > **Checkout**.
2. Find **Abandoned checkouts** (or "Customer contact" / "Email marketing" options on the same page).
3. Choose **Email subscribers only** (people who ticked the marketing box) unless you have taken advice that you can send to everyone. See the GDPR/PECR note at the bottom.
4. On the same page, make sure **Show a sign-up option at checkout** is ticked, so customers can opt in. Leave the box **unticked by default**: in the UK the customer has to tick it themselves.
5. Click **Save**.

## Step 2: Turn off the old built-in reminder (so nobody gets two)

Shopify has an older single "abandoned checkout" email under **Settings > Notifications**, and a newer automation under **Marketing > Automations**. Use only the automation.

1. **Marketing** > **Automations**. If you already have "Recover abandoned checkout" turned on, open it and check that is the one you're editing.
2. In **Settings > Checkout**, if there is an option to send abandoned checkout emails automatically from there, turn it off once the automation is live.

## Step 3: Build the abandoned checkout automation

1. **Marketing** > **Automations** > **Create automation**.
2. Pick the template **Recover abandoned checkout** (Shopify Email).
3. Set the first **Wait** to **1 hour**.
4. Click the first **Send marketing email** step > **Edit email**:
   - Subject and preview text: copy from Email 1 in `abandoned-checkout.md`.
   - Text block: paste the body. For the first name use **Personalise > First name** and set the fallback to `there`.
   - Leave the **Abandoned checkout items** section and the **button** in place. Change only the button text to `Return to my checkout`.
   - Footer: make sure it shows your address as **Dewsbury** (not a home address) and has the unsubscribe link (Shopify adds it).
5. Add the second email: after the first email add **Wait 23 hours**, then a **Condition**: "Checkout is not completed" (the template may already include this check), then **Send marketing email**. Paste Email 2.
6. Click **Turn on workflow** only when you've tested it (Step 4).

## Step 4: Test before switching on

1. In each email editor click **Send test** and send it to eaglebedofficial@gmail.com. Check on your phone: name, button, bed photo and prices all look right.
2. Do a real test: on www.eaglebed.co.uk add a bed to the basket, go to checkout using a second email address of yours, tick the marketing box, enter your name and email, then leave without paying.
3. Turn the automation on. You should get Email 1 about an hour later. Click the button: it should open your saved checkout with the bed still in it.
4. Leave it 24 hours to check Email 2 arrives, then delete the test checkout (Orders > Abandoned checkouts).

## Step 5: Add the order confirmation text

1. **Settings** > **Notifications** > **Customer notifications** > **Order confirmation** > **Edit code**.
2. Change the subject to the one in `post-purchase.md` (Email 1).
3. Paste the HTML block from Email 1 just below the "thank you for your purchase" line. Don't delete anything else.
4. Click **Preview**, then **Send test email** to yourself. Click **Save**.
5. If anything looks broken, click **Revert to default** and tell us.

Before you edit, copy the existing code into a note on your computer so you can put it back.

## Step 6: The emails you send by hand

These go from eaglebedofficial@gmail.com:
- **Swatches:** Email 1 three or four days after posting, Email 2 seven days later if they haven't replied.
- **Being made:** 1–2 working days after the order.
- **Delivery day:** the day before or morning of delivery.
- **After delivery:** 3–5 days after delivery.

Tip: in Gmail, save each one as a template (Settings > See all settings > Advanced > Templates > Enable; then in a new email: three dots > Templates > Save draft as template). Always fill in every `{...}` placeholder and search for `{` before sending.

## Step 7: Check results each month

- **Marketing > Automations**: open the abandoned checkout flow to see sent, opened, clicked and orders for each email.
- Note how many swatch customers went on to order. That tells you if the swatch follow-ups are worth the time.

---

## UK GDPR and PECR: the short version

This is a plain-English summary, not legal advice. The ICO (ico.org.uk) has the official guidance.

- **Order emails** (order confirmation, being made, delivery day) are service messages about something the customer bought. You can send these to every customer. Keep them about the order.
- **Abandoned checkout emails** are treated as marketing because the person hasn't bought. Send them only to customers your Shopify checkout settings allow. The safe setting is **email subscribers only** (customers who ticked the marketing box). Some UK shops rely on the "soft opt-in" rule for people who started buying; if you want to send to everyone, check that rule with the ICO first and make sure every email has an unsubscribe link.
- **Marketing emails** (newsletters, new beds, the "thank you" automation if it promotes products) need consent: the customer ticked the box themselves, and the box was not pre-ticked.
- **Swatch follow-ups** are replies to someone who asked you for swatches. Keep them about their swatches and their order, send no more than the two here, and stop if they say no. Don't add them to a newsletter list unless they agreed.
- **Every marketing email** needs an unsubscribe link (Shopify adds this) and your business name and address. Use Dewsbury for the address.
- **If someone unsubscribes or asks you to stop**, stop straight away, including the hand-sent emails.
- **Keep customer details safe**: don't forward customer lists, and delete test data when you're done.

---

## What these emails never say

Checked against BRIEF.md before writing: no discounts or % off, no "best" or "leading", no awards, no health or medical claims, no sleep trial, no 0% or interest-free, no countdowns or "only a few left", no made-up reviews. Assembly is always described as the paid option (£69.99). If you change a price or policy, update these emails too.
