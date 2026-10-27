#!/usr/bin/env python3
"""Draws the Eagle Bed fabric & colour guide used as the last image on every product.

Run from the repo root:  python3 tools/make_fabric_chart.py
Reads brand/fabrics.json (range -> [[colour name, hex], ...]) and writes
brand/eagle-bed-fabric-guide.jpg (2000x2000). Swatch textures are drawn here,
so the chart contains no third-party photography.
"""
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..', 'brand')
FONTS = '/usr/share/fonts/opentype/inter/'
SIZE = 2000
BG, NAVY, GOLD, INK, MUTED = '#F7F4EF', '#0F1B2A', '#C99A3A', '#0F1B2A', '#5B6573'
TAGLINES = {'Plush': 'Soft plush velvet', 'Chenille': 'Textured chenille weave',
            'Crushed': 'Crushed velvet shimmer', 'Linoso': 'Linen-look weave'}
rng = np.random.default_rng(7)


def font(weight, size):
    return ImageFont.truetype(FONTS + 'Inter-%s.otf' % weight, size)


def noise(h, w, cell_h, cell_w):
    """Smooth value noise in [-1, 1] at the given feature size."""
    small = rng.random((max(2, h // cell_h + 2), max(2, w // cell_w + 2)))
    img = Image.fromarray((small * 255).astype('uint8')).resize((w, h), Image.BICUBIC)
    return np.asarray(img, dtype=float) / 127.5 - 1


def texture(kind, h, w):
    y, x = np.mgrid[0:h, 0:w]
    fine = rng.normal(0, 1, (h, w))
    if kind == 'Plush':
        sheen = (x / w + y / h) / 2 - .5
        t = .14 * sheen + .05 * noise(h, w, 30, 90) + .02 * fine
    elif kind == 'Chenille':
        threads = np.sin(x * 2 * np.pi / 5) * .5 + np.sin(y * 2 * np.pi / 4) * .5
        t = .07 * threads * (1 + .5 * noise(h, w, 8, 8)) + .06 * noise(h, w, 20, 20) + .03 * fine
    elif kind == 'Crushed':
        ridges = 1 - np.abs(noise(h, w, 34, 26)) * 2 + .6 * (1 - np.abs(noise(h, w, 12, 16)) * 2)
        t = .16 * ridges / 1.6 + .03 * fine
    else:
        slub = noise(h, w, 3, 120)
        weave = np.sin(x * 2 * np.pi / 3) * .5
        t = .08 * slub + .03 * weave + .03 * fine
    return t


def swatch(kind, hex_colour, w, h):
    rgb = np.array([int(hex_colour[i:i + 2], 16) for i in (1, 3, 5)], dtype=float)
    t = texture(kind, h, w)[..., None]
    lit = np.where(t > 0, rgb + (255 - rgb) * t, rgb * (1 + t))
    img = Image.fromarray(np.clip(lit, 0, 255).astype('uint8'))
    return img.filter(ImageFilter.GaussianBlur(.4))


def luminance(hex_colour):
    r, g, b = (int(hex_colour[i:i + 2], 16) for i in (1, 3, 5))
    return .2126 * r + .7152 * g + .0722 * b


def rounded(img, radius):
    mask = Image.new('L', img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *img.size), radius, fill=255)
    out = Image.new('RGBA', img.size)
    out.paste(img, (0, 0), mask)
    return out


def main():
    fabrics = json.load(open(os.path.join(ROOT, 'fabrics.json')))
    canvas = Image.new('RGB', (SIZE, SIZE), BG)
    d = ImageDraw.Draw(canvas)

    # header band with wordmark
    d.rectangle((0, 0, SIZE, 250), fill=NAVY)
    mark = font('Bold', 96)
    word = 'EAGLE BED'
    spacing = 18
    widths = [d.textlength(c, font=mark) for c in word]
    total = sum(widths) + spacing * (len(word) - 1)
    x = (SIZE - total) / 2
    for c, cw in zip(word, widths):
        d.text((x, 52), c, font=mark, fill=GOLD)
        x += cw + spacing
    d.text((SIZE / 2, 188), 'FABRIC & COLOUR GUIDE', font=font('Medium', 38), fill='#E9EDF2', anchor='mm')

    margin, gap, top, bottom = 50, 28, 300, 1850
    col_w = (SIZE - 2 * margin - 3 * gap) // 4
    rows = max(len(v) for v in fabrics.values())
    head_h = 100
    row_gap = 10
    row_h = (bottom - top - head_h - row_gap * (rows - 1)) // rows
    for ci, (kind, colours) in enumerate(fabrics.items()):
        cx = margin + ci * (col_w + gap)
        d.text((cx + col_w / 2, top + 26), kind, font=font('Bold', 52), fill=INK, anchor='mm')
        d.text((cx + col_w / 2, top + 74), TAGLINES.get(kind, ''), font=font('Regular', 26), fill=MUTED, anchor='mm')
        for ri, (name, hex_colour) in enumerate(colours):
            y = top + head_h + ri * (row_h + row_gap)
            sw = rounded(swatch(kind, hex_colour, col_w, row_h), 14)
            canvas.paste(sw, (cx, y), sw)
            light = luminance(hex_colour) < 140
            d.text((cx + 22, y + row_h / 2), name, font=font('SemiBold', 34),
                   fill='#FFFFFF' if light else NAVY, anchor='lm')
        used = len(colours)
        if used < rows:
            # brand panel in the spare space of the shortest column
            y0 = top + head_h + used * (row_h + row_gap)
            d.rounded_rectangle((cx, y0, cx + col_w, bottom), 14, fill=NAVY)
            lines = [('Handmade in', 'Regular', 30, '#E9EDF2'), ('West Yorkshire', 'Bold', 40, GOLD),
                     ('', 'Regular', 18, NAVY),
                     ('Free fabric swatches', 'Regular', 30, '#E9EDF2'), ('posted to you', 'Bold', 40, GOLD),
                     ('', 'Regular', 18, NAVY),
                     ('Bespoke colours', 'Regular', 30, '#E9EDF2'), ('just ask', 'Bold', 40, GOLD)]
            heights = [s * 1.35 for _, _, s, _ in lines]
            yy = y0 + ((bottom - y0) - sum(heights)) / 2
            for (text, weight, size, colour), lh in zip(lines, heights):
                d.text((cx + col_w / 2, yy + lh / 2), text, font=font(weight, size), fill=colour, anchor='mm')
                yy += lh

    d.text((SIZE / 2, 1912), 'Colours are a guide and can look different on screen. Ask for free swatches before you order.',
           font=font('Regular', 28), fill=MUTED, anchor='mm')
    d.text((SIZE / 2, 1958), 'www.eaglebed.co.uk', font=font('Bold', 32), fill=INK, anchor='mm')
    canvas.save(os.path.join(ROOT, 'eagle-bed-fabric-guide.jpg'), quality=90, optimize=True, progressive=True)


if __name__ == '__main__':
    main()
