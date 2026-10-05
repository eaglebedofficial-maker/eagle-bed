#!/usr/bin/env python3
"""Generates the ABBAS 3D showroom JSON templates and section groups.

Run from the repo root:  python3 tools/build_templates.py
Every fact used in copy comes from the live store (delivery, warranty, workshop, finance, products).
"""
import json, os

ROOT = os.path.join(os.path.dirname(__file__), '..', 'theme')
BESPOKE = 'shopify://pages/bespoke-beds-uk'
SWATCH = 'shopify://pages/request-a-swatch'
COLOURS = ("Grey:#8a8d91, Cream:#e6dac2, Silver:#c0c2c5, Steel:#6b7682, White:#eeeeea, Royal Blue:#23407a, "
           "Sky Blue:#8fb5d6, Emerald Green:#1f5c45, Beige:#cdbb9c, Baby Pink:#e3b7bd, Black:#1c1c1e, "
           "Brown:#5a3e2f, Red:#8e1f26, Pebble:#a39e93")
PENCIL = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" '
          'stroke-linejoin="round" aria-hidden="true"><path d="M15.5 4.5l4 4L8 20H4v-4z"/><path d="M13.5 6.5l4 4"/></svg>')


def write(rel, data):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')


def blocks(items):
    """items: list of (type, settings) -> (blocks, order)"""
    b, order = {}, []
    for i, (t, s) in enumerate(items, 1):
        key = f'{t}_{i}'
        b[key] = {'type': t, 'settings': s}
        order.append(key)
    return b, order


def section(type_, settings=None, items=None, disabled=False):
    s = {'type': type_, 'settings': settings or {}}
    if items:
        s['blocks'], s['block_order'] = blocks(items)
    if disabled:
        s['disabled'] = True
    return s


def template(sections):
    return {'sections': dict(sections), 'order': [k for k, _ in sections]}


# ---------------------------------------------------------------- shared copy
TRUST = [
    ('item', {'icon': 'spool', 'title': 'Handmade to order', 'text': 'Built in our West Yorkshire workshop'}),
    ('item', {'icon': 'truck', 'title': 'Free UK mainland delivery', 'text': 'By our own team, usually 3–5 working days'}),
    ('item', {'icon': 'shield', 'title': '5-year warranty', 'text': 'Solid wood frames on every bed'}),
    ('item', {'icon': 'card', 'title': 'Pay in instalments', 'text': 'Klarna and Clearpay at checkout'}),
]

FAQ_GENERAL = [
    ('faq', {'q': 'Is delivery really free?', 'a': '<p>Yes. Delivery is free to mainland UK addresses, and our own team brings your bed to your door. If you are outside mainland UK, please contact us before ordering and we will confirm the options.</p>', 'only_on': ''}),
    ('faq', {'q': 'How long will my bed take to arrive?', 'a': '<p>Every bed is made to order. Most orders are delivered within 3–5 working days. We will contact you to arrange a delivery day that suits you.</p>', 'only_on': ''}),
    ('faq', {'q': 'Can you make a bed in a custom size, fabric or design?', 'a': '<p>Often, yes. Because we make every bed by hand, custom sizes, fabrics, colours, headboard heights and storage are usually possible. Send us a photo, sketch or description through our <a href="/pages/bespoke-beds-uk#quote">bespoke quote form</a> and we will talk it through with you.</p>', 'only_on': ''}),
    ('faq', {'q': 'Can I see the fabric before I order?', 'a': '<p>Yes. Colours look different on every screen, so we post free fabric swatches. <a href="/pages/request-a-swatch">Request your swatches here</a>.</p>', 'only_on': ''}),
    ('faq', {'q': 'What warranty do I get?', 'a': '<p>Our beds are built on solid wood frames and come with a 5-year warranty. See our <a href="/pages/warranty">warranty page</a> for the details.</p>', 'only_on': ''}),
    ('faq', {'q': 'Can I spread the cost?', 'a': '<p>Yes. Klarna and Clearpay are available at checkout. See <a href="/pages/finance-options">finance options</a>.</p>', 'only_on': ''}),
    ('faq', {'q': 'Where are your beds made?', 'a': '<p>In our workshop on Pepproyd Street, Dewsbury, West Yorkshire. You are buying direct from the people who make the bed.</p>', 'only_on': ''}),
]

FAQ_MATTRESS = [
    ('faq', {'q': 'Which mattress is best for side sleepers?', 'a': '<p>Side sleepers usually prefer a softer or medium feel that lets the shoulders and hips sink in slightly, such as memory foam or a pillow top. Try our <a href="/pages/mattress-guide#mattress-finder">mattress finder</a> for a personal match.</p>', 'only_on': ''}),
    ('faq', {'q': 'Pocket sprung or memory foam?', 'a': '<p>Pocket springs move independently, feel more breathable and bouncy, and limit partner disturbance. Memory foam contours to your body and absorbs movement. A pillow top adds a plush layer over springs. Read our <a href="/blogs/news/pocket-sprung-vs-memory-foam-mattress">full comparison</a>.</p>', 'only_on': ''}),
    ('faq', {'q': 'What sizes do your mattresses come in?', 'a': '<p>All five standard UK sizes: Single (90 × 190 cm), Small Double (120 × 190 cm), Double (135 × 190 cm), King (150 × 200 cm) and Super King (180 × 200 cm).</p>', 'only_on': ''}),
    ('faq', {'q': 'Is mattress delivery free?', 'a': '<p>Yes, delivery is free to mainland UK addresses, and it can come with your bed.</p>', 'only_on': ''}),
]

FAQ_BESPOKE = [
    ('faq', {'q': 'What can you make?', 'a': '<p>Custom sizes, shapes, fabrics, colours, headboard heights and styles, storage (drawers or gas-lift ottoman), and matching headboards. If you have a photo of a bed you love, send it and we will tell you honestly what is possible.</p>', 'only_on': ''}),
    ('faq', {'q': 'How much does a bespoke bed cost?', 'a': '<p>It depends on the size, design and fabric. Most bespoke beds start from a similar price to the closest bed in our range. Send your idea and we will reply with a clear quote, usually within one working day.</p>', 'only_on': ''}),
    ('faq', {'q': 'How do I send my photos or drawings?', 'a': '<p>Fill in the quote form, then email your images straight after to eaglebedofficial@gmail.com with your name. We will match them to your request.</p>', 'only_on': ''}),
    ('faq', {'q': 'Is delivery free on bespoke beds?', 'a': '<p>Yes. Delivery is free to mainland UK addresses, just like the rest of our range.</p>', 'only_on': ''}),
]

PROCESS = [
    ('step', {'title': 'Your idea', 'text': 'Send us a photo, drawing, screenshot or a bed you want recreated, or simply describe what you want.'}),
    ('step', {'title': 'We discuss', 'text': 'We confirm the dimensions, fabric, colour, headboard, storage and mattress with you, and send a clear quote.'}),
    ('step', {'title': 'We create', 'text': 'Your bed is made by hand in our West Yorkshire workshop to the exact specification we agreed.'}),
    ('step', {'title': 'We deliver', 'text': 'Our own team delivers it free to your door anywhere on mainland UK.'}),
    ('step', {'title': 'You enjoy', 'text': 'The finished bed arrives ready for its new home, backed by our 5-year warranty.'}),
]

QUIZ = [
    ('mattress', {'product': '1000-pocket-sprung-mattress-uk', 'firmness': 6, 'type': 'pocket', 'positions': 'back,front,combo', 'partner': True, 'note': 'Everyday pocket-spring support at our most affordable spring price.'}),
    ('mattress', {'product': '2000-pocket-sprung-pillow-top-mattress-uk', 'firmness': 6.5, 'type': 'hybrid', 'positions': 'side,back,combo', 'partner': True, 'note': 'Medium-firm springs with a plush pillow top.'}),
    ('mattress', {'product': '3000-pocket-sprung-mattress-uk', 'firmness': 6, 'type': 'pocket', 'positions': 'side,back,combo', 'partner': True, 'note': 'Our most supportive spring count for pressure relief.'}),
    ('mattress', {'product': 'memory-foam-mattress-uk', 'firmness': 4, 'type': 'memory', 'positions': 'side,combo', 'partner': True, 'note': 'Contouring memory foam that cradles pressure points.'}),
    ('mattress', {'product': 'memory-orthopaedic-mattress-uk', 'firmness': 8, 'type': 'memory', 'positions': 'back,front', 'partner': True, 'note': 'Firm orthopaedic support with a memory foam comfort layer.'}),
    ('mattress', {'product': 'pillow-top-mattress-uk', 'firmness': 5, 'type': 'hybrid', 'positions': 'side,combo', 'partner': True, 'note': 'A soft, cushioned pillow top for a hotel feel.'}),
]

HELP = section('sr-help', {'kicker': 'Free design consultation', 'heading': '<p>Not sure what to <em>choose?</em></p>',
                           'text': "Talk to the people who make the beds. We'll help with sizes, fabrics, storage and access, with no pressure.",
                           'phone': '07417 439197', 'hours': 'Mon–Fri 9am–6pm', 'whatsapp': '', 'form_label': 'Get expert help',
                           'form_link': 'shopify://pages/contact'})

# ---------------------------------------------------------------- homepage
index = template([
    ('hero', section('sr-hero', {
        'fallback_collection': 'wingback-beds', 'focal': '60% 50%', 'kicker': 'Handmade in West Yorkshire',
        'heading': '<p>Beds made <em>around you</em></p>',
        'text': 'Premium upholstered beds, mattresses and bespoke designs, made to order in your size, fabric and colour.',
        'btn1_label': 'Shop beds', 'btn1_link': 'shopify://collections/upholstered-beds',
        'btn2_label': 'Shop mattresses', 'btn2_link': 'shopify://collections/mattresses',
        'bespoke_label': 'Design your bespoke bed', 'bespoke_link': BESPOKE,
        'card_title': 'Have a design in mind?', 'card_text': "Send us a photo, a sketch or a Pinterest pin. We'll talk you through making it.",
        'card_link_label': 'Request a bespoke quote', 'card_link': BESPOKE,
    }, [('chip', {'text': 'Free UK mainland delivery', 'icon': 'truck'}), ('chip', {'text': 'Handmade to order', 'icon': 'spool'}),
        ('chip', {'text': '5-year warranty', 'icon': 'shield'}), ('chip', {'text': 'Klarna & Clearpay', 'icon': 'card'})])),
    ('trust', section('sr-trust', {'label': 'Why Eagle Bed', 'heading': '', 'style': 'linen'}, TRUST)),
    ('categories', section('sr-categories', {
        'kicker': 'Explore the showroom', 'heading': '<p>Find your <em>style</em></p>',
        'text': 'Every design is made to order in the size, fabric and colour you choose.', 'show_count': True,
        'link_label': 'See every upholstered bed', 'link': 'shopify://collections/upholstered-beds',
    }, [('category', {'collection': h, 'title': t}) for h, t in [
        ('wingback-beds', ''), ('chesterfield-beds', ''), ('ottoman-beds', ''), ('panel-beds', ''), ('divan-beds', ''),
        ('divan-ottoman-beds', 'Divan ottomans'), ('storage-beds-with-drawers', 'Drawer storage beds'), ('kids-beds', ''),
        ('headboards', ''), ('mattresses', '')]])),
    ('configurator', section('sr-configurator', {
        'kicker': 'Design your dream bed', 'heading': '<p>If you can imagine it, <em>talk to us about making it</em></p>',
        'text': 'Choose a size, style, fabric and colour and watch the bed change. Then shop beds like it, or send the design to our workshop for a bespoke quote.',
        'colours': COLOURS, 'note': "Illustration only. Shapes and colours vary by screen, so we'll post free fabric swatches before you order.",
        'url_default': 'shopify://collections/upholstered-beds', 'url_modern': 'shopify://collections/upholstered-beds',
        'url_panel': 'shopify://collections/panel-beds', 'url_chesterfield': 'shopify://collections/chesterfield-beds',
        'url_wingback': 'shopify://collections/wingback-beds', 'url_ottoman': 'shopify://collections/ottoman-beds',
        'url_storage': 'shopify://collections/storage-beds-with-drawers', 'url_bespoke': BESPOKE,
    })),
    ('best', section('sr-products', {'kicker': 'Most ordered', 'heading': '<p>Best <em>sellers</em></p>',
                                     'text': 'The beds our customers order most, each one handmade to order.',
                                     'collection': 'best-sellers', 'limit': 12, 'layout': 'rail', 'bg': 'ivory', 'swatches': COLOURS,
                                     'button_label': 'View all best sellers'})),
    ('process', section('sr-process', {'kicker': 'How bespoke works', 'heading': '<p>We make <em>your idea</em></p>',
                                       'text': 'From a photo on your phone to a finished bed in your bedroom. Five simple steps, one team.',
                                       'button_label': 'Start your bespoke bed', 'button_link': BESPOKE}, PROCESS)),
    ('reels', section('eb3d-reels', {'kicker': 'Watch', 'heading': 'See the beds in motion', 'text': 'Short films of our beds, made by hand in Dewsbury.', 'link_label': '', 'link': ''},
                      [('video', {'title': '', 'product': h}) for h in ['cloud-teddy-boucle-ottoman-gas-lift-storage-bed', 'chesterfield-upholstered-bed-frame', 'liberty-wingback-upholstered-bed-frame', 'bumper-ottoman-gas-lift-divan-bed']])),
    ('bespoke', section('sr-bespoke', {'kicker': 'Bespoke service', 'heading': '<p>Have your <em>own design?</em></p>',
                                       'text': "Send us a photo, a drawing, a screenshot or a bed you want recreated. We'll confirm the size, fabric and finish with you, then make it in our West Yorkshire workshop.",
                                       'list': 'Custom sizes\nCustom fabrics\nCustom colours\nCustom headboards\nCustom storage\nUnique shapes',
                                       'full_form': False, 'whatsapp': '', 'button_label': 'Request my bespoke quote', 'bg': 'linen'})),
    ('quiz', section('sr-mattress-quiz', {'kicker': 'Find your perfect mattress', 'heading': '<p>Six questions. <em>One better night.</em></p>',
                                          'text': "Tell us how you sleep and we'll match you with the mattress that suits you, priced in your size.",
                                          'small': 'Takes about 30 seconds', 'all_link': 'shopify://collections/mattresses', 'bg': 'ivory'}, QUIZ)),
    ('trending', section('sr-products', {'kicker': 'Just added', 'heading': '<p>New &amp; <em>trending</em></p>',
                                         'text': 'Recently added designs and fabrics.', 'collection': 'new-trending', 'limit': 12,
                                         'layout': 'rail', 'bg': 'linen', 'swatches': COLOURS, 'button_label': 'View all new beds'})),
    ('reviews', section('sr-reviews', {'kicker': 'Customer reviews', 'heading': '<p>What our customers <em>say</em></p>', 'link_label': '', 'link': ''})),
    ('gallery', section('sr-gallery', {'kicker': 'Real homes. Real beds.', 'heading': '<p>Made by us, <em>loved at home</em></p>',
                                       'text': 'Photos shared by our customers. Tag @eaglebed.co.uk to be featured.',
                                       'link_label': 'Follow on Instagram', 'link': 'https://www.instagram.com/eaglebed.co.uk'})),
    ('guides', section('sr-guides', {'kicker': 'Advice from the workshop', 'heading': '<p>Buying <em>guides</em></p>',
                                     'text': 'Straight answers on sizes, storage, fabrics and mattresses, so you choose once and choose right.', 'blog': 'news', 'limit': 6},
                       [('guide', {'article': 'news/' + h, 'kicker': k}) for h, k in [
                           ('how-to-choose-the-best-bed-in-the-uk-2026-buying-guide', 'Start here'), ('uk-bed-size-guide', 'Sizes'),
                           ('ottoman-bed-vs-divan-bed-uk', 'Storage'), ('pocket-sprung-vs-memory-foam-mattress', 'Mattresses'),
                           ('how-to-measure-bedroom-for-new-bed-uk', 'Planning'), ('best-beds-for-small-bedrooms', 'Small rooms')]])),
    ('faq', section('sr-faq', {'kicker': 'Good to know', 'heading': '<p>Questions, <em>answered</em></p>', 'text': '',
                               'button_label': 'Ask us anything', 'button_link': 'shopify://pages/contact', 'open_first': True, 'schema': True, 'bg': 'linen'}, FAQ_GENERAL)),
    ('help', HELP),
])
write('templates/index.json', index)

# ---------------------------------------------------------------- product
product = template([
    ('main', section('eb3d-product', {'swatch_link': SWATCH}, [
        ('liquid', {'custom_liquid': '<a class="sr sr-bespoke-cta" href="/pages/bespoke-beds-uk#quote" data-sr-bespoke-link data-title="{{ product.title | escape }}" data-type="{{ product.type | escape }}">' + PENCIL + '<span>Request a bespoke version<small>Different size, fabric, headboard height or storage? Tell us and we\'ll quote.</small></span></a>'}),
    ])),
    ('extras', section('sr-pdp-extras', {
        'delivery_text': 'Every bed is made to order, then delivered free to mainland UK addresses by our own team.',
        'size_link': 'shopify://pages/bed-size-guide', 'bespoke_link': BESPOKE, 'mattresses': 'mattresses',
        'bespoke_text': 'Custom sizes, fabrics, colours, headboard heights and storage are often possible. Send us your idea for a quote.',
        'complete_heading': 'Add the mattress', 'complete_text': 'Made in the UK in every standard size. Not sure which one? Try our mattress finder.'})),
    ('reviews', {'type': 'apps', 'blocks': {'judge_me_reviews_review_widget_gPiWzx': {
        'type': 'shopify://apps/judge-me-reviews/blocks/review_widget/61ccd3b1-a9f2-4160-9fe9-4fec8413e5d8',
        'settings': {'review_data': 'real_data', 'max_width': 1200, 'show_shop_reviews': True, 'empty_state': 'empty_widget'}}},
        'block_order': ['judge_me_reviews_review_widget_gPiWzx'], 'settings': {'include_margins': True}}),
    ('faq', section('sr-faq', {'kicker': 'Before you order', 'heading': '<p>Questions, <em>answered</em></p>', 'text': '',
                               'button_label': 'Ask us anything', 'button_link': 'shopify://pages/contact', 'open_first': False, 'schema': False, 'bg': 'ivory'}, FAQ_GENERAL[:6])),
])
# The product-level FAQ is the same on every product, so its FAQPage schema stays off (it lives on the homepage and FAQ page).
write('templates/product.json', product)

# ---------------------------------------------------------------- collection buying advice (unique per collection)
GUIDES = [
    ('ottoman-beds,divan-ottoman-beds', 'How to choose an ottoman bed',
     '<p>An ottoman bed lifts on gas struts to reveal the whole area under the mattress, which is the biggest storage space any bed can give you. It suits smaller bedrooms where there is no room for drawers to open, and it is ideal for duvets, suitcases and seasonal clothes.</p><h3>Frame or divan?</h3><p>An <strong>ottoman bed frame</strong> has an upholstered frame and headboard, so it looks like a statement bed. An <strong>ottoman divan</strong> is a lower-profile base with a separate headboard. Both are handmade to order in our workshop.</p><h3>What to check</h3><ul><li>Leave enough space at the foot (or side, on side-lift models) to lift the base.</li><li>Choose a mattress that suits the lift. Most of our mattresses are designed to sit well on gas-lift bases.</li><li>Order free swatches to see the fabric in your light.</li></ul>',
     'Ottoman vs divan: which is better?|/blogs/news/ottoman-bed-vs-divan-bed-uk\nHow do ottoman beds work?|/blogs/news/how-do-ottoman-beds-work\nHow much storage does a gas-lift bed give?|/blogs/news/ottoman-storage-beds-uk-how-much-storage-does-a-gas-lift-bed-give-you\nOttoman bed buying guide|/pages/ottoman-bed-frame-buying-guide'),
    ('divan-beds', 'How to choose a divan bed',
     '<p>A divan is a solid upholstered base that sits close to the floor and supports the mattress evenly across its whole surface. Divans are practical, quick to set up and work in any room.</p><h3>Storage options</h3><p>Choose a plain divan, a divan with drawers (2 or 4), or a gas-lift ottoman divan for maximum storage. Pair it with one of our upholstered headboards in a matching fabric.</p><h3>Sizes</h3><p>Every divan is available from Single (3FT) to Super King (6FT), and we can quote for custom sizes.</p>',
     'Divan bed vs bed frame|/blogs/news/divan-bed-vs-bed-frame-uk\nShop headboards|/collections/headboards\nUK bed size guide|/blogs/news/uk-bed-size-guide'),
    ('wingback-beds', 'How to choose a wingback bed',
     '<p>A wingback bed has a tall headboard with side "wings" that wrap around the pillows. It makes a strong focal point and feels sheltered and cosy, which is why it suits main bedrooms and larger rooms best.</p><h3>Room size</h3><p>The wings add width to the frame, so measure your wall and allow space for bedside tables. For a smaller room, choose a lower headboard or a slimmer wing.</p><h3>Fabric</h3><p>Plush velvet shows off the deep channels and curves of a wingback. Order free swatches to compare colours before you buy.</p>',
     'Wingback bed buying guide|/blogs/news/wingback-bed-buying-guide-uk\nVelvet bed style guide|/blogs/news/velvet-bed-frames-uk-style-guide\nHow to measure your bedroom|/blogs/news/how-to-measure-bedroom-for-new-bed-uk'),
    ('chesterfield-beds', 'How to choose a Chesterfield bed',
     '<p>Chesterfield beds take their look from the classic Chesterfield sofa: deep, hand-set buttons across the headboard in a diamond pattern. They suit traditional and modern rooms alike, depending on the fabric and colour.</p><h3>What makes a good Chesterfield</h3><ul><li>Even, deep buttoning set by hand.</li><li>A solid wood frame. Every Eagle Bed frame is solid wood and backed by a 5-year warranty.</li><li>Fabric that holds the buttoning well, such as plush velvet.</li></ul>',
     'How to choose a Chesterfield bed|/blogs/news/how-to-choose-a-chesterfield-bed\nChesterfield beds buying guide|/blogs/news/chesterfield-beds-uk-buying-guide'),
    ('kids-beds', 'Choosing a bed for your child',
     "<p>Our kids' beds have soft, padded upholstered frames with no hard edges, in sizes from Kids Single to Small Double. They are made to order in fun and calm colours alike.</p><h3>Tips</h3><ul><li>A Single (3FT) fits most children's rooms and lasts into the teenage years.</li><li>Choose a mattress with good support for growing backs.</li><li>Ask us about storage options to keep toys tidy.</li></ul>",
     "Kids upholstered beds guide|/blogs/news/kids-upholstered-beds-uk-guide\nShop mattresses|/collections/mattresses"),
    ('mattresses', 'How to choose a mattress',
     '<p>The right mattress depends on how you sleep, how firm you like it and whether you share the bed. All our mattresses come in the five standard UK sizes and are delivered free to mainland UK.</p><h3>Quick guide</h3><ul><li><strong>Side sleepers</strong>: softer or medium, such as memory foam or a pillow top.</li><li><strong>Back sleepers</strong>: medium to medium-firm pocket springs.</li><li><strong>Front sleepers</strong>: firmer support, such as our Memory Orthopaedic.</li><li><strong>Couples</strong>: pocket springs move independently, so you feel less movement.</li></ul><p>Not sure? <a href="/pages/mattress-guide#mattress-finder">Take the 30-second mattress finder</a>.</p>',
     'Pocket sprung vs memory foam vs orthopaedic|/blogs/news/pocket-sprung-vs-memory-foam-mattress\nMattress finder quiz|/pages/mattress-guide\nCare guide|/blogs/news/how-to-care-for-an-upholstered-bed-and-mattress'),
    ('storage-beds,storage-beds-with-drawers', 'Ottoman or drawers?',
     '<p>Both keep your bedroom tidy. A <strong>gas-lift ottoman</strong> gives you the whole space under the mattress and needs no room at the sides. <strong>Drawers</strong> give you everyday access without lifting the mattress, but need around 50 cm of clear space to open.</p><p>Every storage bed is handmade to order in our workshop, in your choice of fabric, colour and size.</p>',
     'Storage bed for a small bedroom|/blogs/news/storage-bed-small-uk-bedroom-guide\nBest beds for small bedrooms|/blogs/news/best-beds-for-small-bedrooms\nShop ottoman beds|/collections/ottoman-beds'),
    ('upholstered-beds,best-sellers,new-trending,frontpage', 'How to choose an upholstered bed',
     '<p>An upholstered bed is padded and covered in fabric, so it feels soft to lean against and makes the bed the centrepiece of the room. Start with three decisions: the size your room can take, the headboard style you love, and whether you need storage.</p><h3>Our range</h3><p>Wingback, Chesterfield, panel, ottoman and divan designs, all handmade to order in West Yorkshire on solid wood frames, from Single to Super King, with free delivery to mainland UK.</p><p>Can\'t see exactly what you want? <a href="/pages/bespoke-beds-uk#quote">Ask about a bespoke bed</a>.</p>',
     'How to choose an upholstered bed|/blogs/news/how-to-choose-upholstered-bed-uk\nHow to choose the best bed (2026 guide)|/blogs/news/how-to-choose-the-best-bed-in-the-uk-2026-buying-guide\nUK bed size guide|/blogs/news/uk-bed-size-guide'),
    ('panel-beds', 'How to choose a panel bed',
     '<p>Panel beds have a headboard made of upholstered panels: vertical channels, fans, fluting or gold trim. Vertical panels make a room feel taller, while wide horizontal panels feel calm and modern.</p><p>All our panel beds are handmade to order with a choice of storage, from Single to Super King.</p>',
     'Velvet bed colours guide|/blogs/news/best-velvet-bed-colours-2025\nHow to style a king size bed|/blogs/news/how-to-style-king-size-upholstered-bed-uk'),
    ('headboards', 'How to choose a headboard',
     '<p>Our upholstered headboards fit standard divan bases. The 24 inch headboard suits rooms with low windowsills or sloping ceilings. The 54 inch headboard is a full statement piece.</p><p>Match the fabric to your base, or choose a contrasting colour. Free swatches are available.</p>',
     'Shop divan beds|/collections/divan-beds\nRequest free swatches|/pages/request-a-swatch'),
]

collection = template([
    ('main', section('eb3d-collection', {
        'show_description': True, 'stat_2': 'Handmade in Dewsbury', 'stat_3': 'Free mainland UK delivery',
        'chips': ['upholstered-beds', 'wingback-beds', 'chesterfield-beds', 'panel-beds', 'ottoman-beds', 'divan-beds', 'storage-beds', 'divan-ottoman-beds', 'kids-beds', 'headboards', 'mattresses'],
        'enable_filtering': True, 'enable_sorting': True, 'per_page': 24, 'show_about': True})),
    ('guide', section('sr-collection-guide', {}, [('guide', {'only_on': h, 'heading': t, 'body': b, 'links': l}) for h, t, b, l in GUIDES])),
    ('bespoke', section('sr-bespoke', {'kicker': 'Bespoke service', 'heading': "<p>Can't see <em>exactly</em> what you want?</p>",
                                       'text': 'We make every bed by hand, so custom sizes, fabrics, colours, headboards and storage are usually possible.',
                                       'list': 'Custom sizes\nCustom fabrics\nCustom headboards\nCustom storage',
                                       'full_form': False, 'whatsapp': '', 'button_label': 'Request my bespoke quote', 'bg': 'ivory'})),
    ('help', HELP),
])
write('templates/collection.json', collection)

# ---------------------------------------------------------------- cart / 404 / search
write('templates/cart.json', template([
    ('main', section('eb3d-cart')),
    ('suggest', section('eb3d-rail', {'heading': 'Complete your bed', 'text': 'Mattresses made in the UK in every standard size, delivered free with your bed.',
                                      'collection': 'mattresses', 'limit': 10, 'tag': '', 'link_label': 'Compare all mattresses', 'dark': False})),
    ('help', HELP),
]))
write('templates/404.json', template([('main', section('sr-404', {'menu': 'footer'}))]))

# ---------------------------------------------------------------- pages
PAGE_HERO = lambda **kw: section('sr-page-hero', {'title': '', 'kicker': kw.get('kicker', ''), 'text': kw.get('text', ''), 'btn_label': kw.get('btn_label', ''), 'btn_link': kw.get('btn_link', '')})
RICH = section('sr-rich', {'use_page': True, 'heading': '', 'center': False, 'bg': 'ivory'})

write('templates/page.json', template([('hero', PAGE_HERO()), ('main', RICH), ('help', HELP)]))
write('templates/page.contact.json', template([
    ('hero', PAGE_HERO(kicker='Contact', text='Questions about a bed, a bespoke design or an order? Call, email or use the form and the workshop team will reply.')),
    ('main', RICH),
    ('form', section('contact-form', {'heading': 'Send us a message', 'heading_size': 'h2', 'color_scheme': 'scheme-1', 'padding_top': 36, 'padding_bottom': 36})),
    ('help', HELP),
]))
write('templates/page.bespoke.json', template([
    ('hero', PAGE_HERO(kicker='Bespoke beds, made in West Yorkshire', text='Have a design in mind? We can create bespoke beds tailored to your size, style and space.', btn_label='Request a bespoke quote', btn_link=BESPOKE)),
    ('process', section('sr-process', {'kicker': 'How it works', 'heading': '<p>We make <em>your idea</em></p>', 'text': 'Five simple steps, one team, from first message to finished bed.', 'button_label': '', 'button_link': ''}, PROCESS)),
    ('quote', section('sr-bespoke', {'kicker': 'Bespoke bed request', 'heading': '<p>Tell us about <em>your bed</em></p>',
                                     'text': 'The more detail the better: a photo, measurements, the fabric you love. We usually reply within one working day.',
                                     'list': 'Custom sizes\nCustom fabrics\nCustom colours\nCustom headboards\nCustom storage\nUnique shapes',
                                     'full_form': True, 'whatsapp': '', 'button_label': 'Request my bespoke quote', 'bg': 'linen'})),
    ('main', RICH),
    ('faq', section('sr-faq', {'kicker': 'Bespoke questions', 'heading': '<p>Good to <em>know</em></p>', 'text': '', 'button_label': '', 'button_link': '', 'open_first': True, 'schema': True, 'bg': 'ivory'}, FAQ_BESPOKE)),
    ('help', HELP),
]))
write('templates/page.mattress-guide.json', template([
    ('hero', PAGE_HERO(kicker='Mattress guide', text='Firmness, support, materials and sizes explained in plain English, plus a 30-second quiz to find your match.')),
    ('quiz', section('sr-mattress-quiz', {'kicker': 'Find your perfect mattress', 'heading': '<p>Six questions. <em>One better night.</em></p>',
                                          'text': "Tell us how you sleep and we'll match you with the mattress that suits you, priced in your size.",
                                          'small': 'Takes about 30 seconds', 'all_link': 'shopify://collections/mattresses', 'bg': 'linen'}, QUIZ)),
    ('anatomy', section('eb3d-anatomy', {'kicker': 'Inside the mattress', 'heading': 'Built layer by layer',
                                         'text': 'Scroll to take one apart. Layers vary by model, and every mattress is made in the UK, comes in all five UK sizes and carries a 5-year guarantee.',
                                         'collection': 'mattresses', 'button_label': 'Shop mattresses'},
                        [('layer', {'title': 'Hygienic cover', 'text': 'A soft, easy-care outer cover that keeps the mattress fresh. Removable on our Memory Orthopaedic model.', 'look': 'cover'}),
                         ('layer', {'title': 'Pillow top comfort layer', 'text': 'A plush, cushioned top for pressure relief, on our Pillow Top and 2000 Pocket Sprung mattresses.', 'look': 'pillow'}),
                         ('layer', {'title': 'Memory foam comfort layer', 'text': 'Contours to your shape through the night. Used in our Memory Foam and Memory Orthopaedic mattresses.', 'look': 'memory'}),
                         ('layer', {'title': 'Individual pocket spring core', 'text': '1,000, 2,000 or 3,000 springs, each in its own pocket, moving independently to support you and cut partner disturbance.', 'look': 'springs'})])),
    ('main', RICH),
    ('faq', section('sr-faq', {'kicker': 'Mattress questions', 'heading': '<p>Good to <em>know</em></p>', 'text': '', 'button_label': '', 'button_link': '', 'open_first': True, 'schema': True, 'bg': 'ivory'}, FAQ_MATTRESS)),
    ('help', HELP),
]))
write('templates/page.size-guide.json', template([
    ('hero', PAGE_HERO(kicker='Size guide', text='Every UK bed and mattress size, with tips on choosing the right one for your room.')),
    ('sizes', section('sr-size-guide', {'kicker': 'At a glance', 'heading': 'UK bed sizes',
                                        'text': 'Standard UK mattress sizes. Bed frames are larger than the mattress, so allow extra room for the headboard and frame. Ask us for the exact external size of any bed.',
                                        'note': 'Need something in between? We can make beds to custom sizes. Request a bespoke quote.'})),
    ('main', RICH),
    ('help', HELP),
]))
write('templates/page.about.json', template([
    ('hero', PAGE_HERO(kicker='Our story', text='We believe your bedroom should be personal. So we make beds around you, not the other way round.')),
    ('main', RICH),
    ('trust', section('sr-trust', {'label': 'Our promise', 'heading': '', 'style': 'night'}, TRUST)),
    ('process', section('sr-process', {'kicker': 'How we work', 'heading': '<p>From your idea <em>to your bedroom</em></p>', 'text': '', 'button_label': 'Start a bespoke bed', 'button_link': BESPOKE}, PROCESS)),
    ('help', HELP),
]))
write('templates/page.faq.json', template([
    ('hero', PAGE_HERO(kicker='Help centre', text='Delivery, sizes, fabrics, bespoke beds and payment, answered.')),
    ('faq', section('sr-faq', {'kicker': 'Ordering and delivery', 'heading': '<p>Frequently asked <em>questions</em></p>', 'text': '', 'button_label': 'Contact us', 'button_link': 'shopify://pages/contact', 'open_first': True, 'schema': True, 'bg': 'ivory'}, FAQ_GENERAL + FAQ_MATTRESS[:3] + FAQ_BESPOKE[:2])),
    ('main', RICH),
    ('help', HELP),
]))
write('templates/page.reviews.json', template([
    ('hero', PAGE_HERO(kicker='Reviews', text='Real reviews from real customers.')),
    ('reviews', section('sr-reviews', {'kicker': 'Customer reviews', 'heading': '<p>What our customers <em>say</em></p>', 'link_label': '', 'link': ''})),
    ('gallery', section('sr-gallery', {'kicker': 'Real homes. Real beds.', 'heading': '<p>Made by us, <em>loved at home</em></p>', 'text': 'Photos shared by our customers.', 'link_label': 'Follow on Instagram', 'link': 'https://www.instagram.com/eaglebed.co.uk'})),
    ('main', RICH),
]))
write('templates/page.wishlist.json', template([
    ('hero', PAGE_HERO(kicker='Saved for later', text='The beds you have saved on this device.')),
    ('main', section('sr-wishlist', {'link': 'shopify://collections/upholstered-beds'})),
]))

# ---------------------------------------------------------------- header & footer groups
header_group = {
    'name': 't:sections.header.name', 'type': 'header',
    'sections': {
        'sr_announcement': section('sr-announcement', {}, [
            ('message', {'text': 'Free delivery to mainland UK', 'link': 'shopify://pages/delivery-information', 'icon': 'truck'}),
            ('message', {'text': 'Handmade to order in West Yorkshire', 'link': 'shopify://pages/about-us', 'icon': 'spool'}),
            ('message', {'text': 'Bespoke sizes & fabrics, just ask', 'link': BESPOKE, 'icon': 'pencil'}),
        ]),
        'eagle_countdown_QPQcWF': {'type': 'eagle-countdown', 'name': 'Countdown Timer Bar', 'disabled': True, 'settings': {
            'label': "TODAY'S SUMMER SALE — EXTRA 10% OFF — ENDS IN:", 'code_label': 'Use code', 'code': 'EAGLE10', 'padding_top': 10, 'padding_bottom': 10,
            'gap': 20, 'gap_mobile': 8, 'font_size': 13, 'font_size_mobile': 11, 'pill_radius': 20, 'bg_color': '#7f285b', 'text_color': '#ffffff',
            'code_bg_color': '#ffffff', 'code_text_color': '#7f285b'}},
        'announcement-bar': {'type': 'announcement-bar', 'disabled': True, 'blocks': {
            'announcement_sale': {'type': 'announcement', 'settings': {'text': 'Free delivery on all UK mainland orders', 'link': ''}}},
            'block_order': ['announcement_sale'], 'settings': {'auto_rotate': True, 'change_slides_speed': 3, 'color_scheme': 'scheme-218d0db5-2b5e-4901-bd81-67093bad7b7c',
                                                               'show_line_separator': True, 'show_social': False, 'enable_country_selector': False, 'enable_language_selector': False}},
        'eb3d_header': {'type': 'eb3d-header', 'settings': {'logo_width': 140, 'logo_text': 'Eagle Bed', 'menu': 'main-menu',
                                                            'popular': 'Ottoman, Wingback, Chesterfield, Super king, Velvet, Mattress', 'phone': '+447417439197'}},
        'header': {'type': 'header', 'disabled': True, 'settings': {'logo_position': 'middle-left', 'mobile_logo_position': 'center', 'menu': 'main-menu',
                                                                    'menu_type_desktop': 'dropdown', 'sticky_header_type': 'on-scroll-up', 'show_line_separator': True,
                                                                    'color_scheme': 'scheme-5', 'menu_color_scheme': 'scheme-1', 'enable_country_selector': True,
                                                                    'enable_language_selector': True, 'enable_customer_avatar': True, 'margin_bottom': 0, 'padding_top': 20, 'padding_bottom': 20}},
    },
    'order': ['sr_announcement', 'eagle_countdown_QPQcWF', 'announcement-bar', 'eb3d_header', 'header'],
}
write('sections/header-group.json', header_group)

footer_group = {
    'name': 't:sections.footer.name', 'type': 'footer',
    'sections': {
        'sr_footer': section('sr-footer', {
            'logo_text': 'Eagle Bed', 'about': 'Handmade upholstered beds, headboards and mattresses, made to order in West Yorkshire and delivered free across mainland UK.',
            'phone': '07417 439197', 'address': 'Pepproyd Street, Dewsbury WF13 1PA', 'hours': 'Mon–Fri 9am–6pm',
            'instagram': 'https://www.instagram.com/eaglebed.co.uk', 'tiktok': 'https://www.tiktok.com/@eagle.bed',
            'facebook': 'https://www.facebook.com/share/1CRno6bbgH/?mibextid=wwXIfr', 'show_newsletter': True,
            'news_heading': 'New fabrics and offers, occasionally', 'news_text': 'A short email when new designs land or a sale starts. No spam.'}, [
            ('column', {'heading': 'Shop', 'menu': '', 'links': 'Beds|/collections/upholstered-beds\nOttoman beds|/collections/ottoman-beds\nDivan beds|/collections/divan-beds\nMattresses|/collections/mattresses\nHeadboards|/collections/headboards\nKids beds|/collections/kids-beds\nBespoke beds|/pages/bespoke-beds-uk'}),
            ('column', {'heading': 'Customer service', 'menu': '', 'links': 'Contact|/pages/contact\nDelivery|/pages/delivery-information\nReturns|/pages/returns-policy\nWarranty|/pages/warranty\nFAQs|/pages/faq\nTrack order|/account\nFinance options|/pages/finance-options'}),
            ('column', {'heading': 'Information', 'menu': '', 'links': 'About us|/pages/about-us\nBespoke service|/pages/bespoke-beds-uk\nBed size guide|/blogs/news/uk-bed-size-guide\nMattress guide|/blogs/news/pocket-sprung-vs-memory-foam-mattress\nBuying guides|/blogs/news\nFree swatches|/pages/request-a-swatch'}),
            ('column', {'heading': 'Popular', 'menu': '', 'links': 'Wingback beds|/collections/wingback-beds\nChesterfield beds|/collections/chesterfield-beds\nPanel beds|/collections/panel-beds\nStorage beds with drawers|/collections/storage-beds-with-drawers\nBest sellers|/collections/best-sellers\nNew & trending|/collections/new-trending'}),
        ]),
        'eb3d_footer': {'type': 'eb3d-footer', 'disabled': True, 'settings': {
            'logo_text': 'Eagle Bed', 'cta_kicker': 'Made to order in West Yorkshire', 'cta_heading': "Need a size or fabric you can't see?",
            'cta_text': 'Talk to the workshop. We make every bed by hand, so custom sizes, fabrics and headboard heights are usually possible.',
            'address': 'Pepproyd Street, Dewsbury WF13 1PA', 'phone': '07417 439197', 'phone_link': '+447417439197', 'email': 'eaglebedofficial@gmail.com',
            'hours': 'Mon - Fri 9 AM - 6 PM', 'facebook_url': 'https://www.facebook.com/share/1CRno6bbgH/?mibextid=wwXIfr',
            'instagram_url': 'https://www.instagram.com/eaglebed.co.uk', 'tiktok_url': 'https://www.tiktok.com/@eagle.bed', 'menu_1_heading': 'Shop', 'menu_1': 'footer',
            'menu_2_heading': 'Useful links', 'menu_2': 'get-in-touch', 'show_newsletter': True, 'news_heading': 'Offers and new fabrics',
            'news_text': 'Occasional emails when new designs land or a sale starts. No spam.', 'show_giant': False}},
    },
    'order': ['sr_footer', 'eb3d_footer'],
}
write('sections/footer-group.json', footer_group)
print('templates written')
