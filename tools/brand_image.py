#!/usr/bin/env python3
"""Brands a CGI product image for Eagle Bed.

Usage:  python3 tools/brand_image.py <input image> <output.jpg>
Adds a small "EAGLE BED" mark in the bottom-right corner and writes
copyright metadata (Artist, Copyright, ImageDescription) into the JPEG.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

FONT = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
GOLD, NAVY = (201, 154, 58), (15, 27, 42)


def brand(src, dst):
    img = Image.open(src).convert('RGB')
    w, h = img.size
    size = max(18, w // 40)
    font = ImageFont.truetype(FONT, size)
    text = 'EAGLE BED'
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    tw = d.textlength(text, font=font) + size * .25 * (len(text) - 1)
    pad = size * .6
    x1, y1 = w - size * 1.2, h - size * 1.2
    x0, y0 = x1 - tw - 2 * pad, y1 - size - 2 * pad
    d.rounded_rectangle((x0, y0, x1, y1), radius=size * .4, fill=NAVY + (150,))
    x = x0 + pad
    for c in text:
        d.text((x, y0 + pad - size * .1), c, font=font, fill=GOLD + (235,))
        x += d.textlength(c, font=font) + size * .25
    out = Image.alpha_composite(img.convert('RGBA'), layer).convert('RGB')
    exif = Image.Exif()
    exif[0x013B] = 'Eagle Bed'
    exif[0x8298] = '(c) Eagle Bed, www.eaglebed.co.uk. All rights reserved.'
    exif[0x010E] = 'Eagle Bed handmade upholstered bed, CGI product image'
    out.save(dst, 'JPEG', quality=92, optimize=True, progressive=True, exif=exif)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    brand(sys.argv[1], sys.argv[2])
