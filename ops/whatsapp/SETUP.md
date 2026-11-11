# WhatsApp Business setup (11 Nov 2026)

Connected: WhatsApp Business (Cloud API) in Zapier, WABA 731849639356224, Business 498070783385123.
Zapier can: send replies within 24h of a customer message, send photos, send approved templates.
Zapier cannot: edit the WhatsApp profile, bio or catalogue (owner does those in the app / Meta).
New-message trigger only works inside a Zap, so forward WhatsApp messages to Gmail with one Zap (owner).

## Business profile (paste in WhatsApp Business > Settings > Business tools > Business profile)
Category: Furniture store
Description (max 512):
Eagle Bed is a family-run bed maker. Every bed is handmade to order in our own workshop in Dewsbury, West Yorkshire: ottoman storage beds, divans, wingback, Chesterfield and panel beds, kids beds, headboards and mattresses. Free delivery across England, Scotland and Wales, and our own team assembles your bed. 14-day free returns, 5-year frame warranty, free fabric swatches. Ask us for a quote or trade prices for multiple beds.
Address: Pepproyd Street, Eastborough, Dewsbury WF13 1PA
Hours: Mon-Fri 9:00-18:00
Email: eaglebedofficial@gmail.com
Website: https://www.eaglebed.co.uk

## Greeting message (Business tools > Greeting message)
Hello and thanks for messaging Eagle Bed! Tell us which bed you like (or send a photo), the size, and your town, and we'll reply with a price and delivery date. Every bed is handmade in our Dewsbury workshop, with free GB delivery and assembly.

## Away message (outside 9-6 Mon-Fri)
Thanks for your message! We're away right now and will reply from 9am on the next working day. Browse our beds at www.eaglebed.co.uk.

## Quick replies
/delivery  Free delivery across England, Scotland and Wales by our own team, who assemble the bed, usually in 3-5 working days. Northern Ireland, Jersey, Guernsey and the Isle of Man £90.
/returns   14-day free returns (unused, in original packaging). 5-year frame warranty.
/pay       Pay by card, PayPal, Klarna or Clearpay at checkout on www.eaglebed.co.uk.
/swatch    Free fabric swatches: https://www.eaglebed.co.uk/pages/request-a-swatch
/trade     We offer special trade prices for multiple beds. How many beds and which sizes do you need?

## Catalogue
Meta Commerce Manager already has the Eagle Bed catalogue (1311394936570400, 145 products synced from Shopify).
Connect it: WhatsApp Manager (business.facebook.com/wa/manage) > your phone number > Catalogue > choose that catalogue. All products then appear in WhatsApp automatically, with prices kept in sync.

## Zap to forward WhatsApp messages to Gmail (1 task per message)
zapier.com > Create Zap > Trigger: WhatsApp Business "New Message Received" > Action: Gmail "Send Email"
To: eaglebedofficial@gmail.com · Subject: WhatsApp from {{From}} · Body: {{Text body}} (from {{From}})
The Inbox agent then drafts a reply and sends a phone alert.
