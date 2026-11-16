#!/usr/bin/env python3
"""Eagle Bed brand film - "From Sketch to Sleep".

Procedural 2D flat-illustration animation rendered with pycairo, piped to ffmpeg.
No AI image generation needed. Every frame is drawn from code, so it is fully
reproducible:

    python3 render_film.py --format 16x9 --out film_16x9_silent.mp4
    python3 render_film.py --format 9x16 --out film_9x16_silent.mp4
    python3 render_film.py --format 16x9 --stills scenes/   # one PNG per scene

Requires: pycairo, ffmpeg, Playfair Display + Inter fonts installed for fontconfig.
Music is muxed afterwards by build_film.sh.
"""
import argparse
import math
import os
import subprocess
import sys

import cairo

FPS = 30
XF = 0.6  # crossfade seconds between scenes

# ---------------------------------------------------------------- palette
def hx(h, a=1.0):
    h = h.lstrip("#")
    return (int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255, a)

NAVY_DEEP = hx("0E1830")
NAVY = hx("1A2A4A")
NAVY_MID = hx("26385E")
WALL = hx("2B3B5C")
GOLD = hx("C9A24A")
GOLD_LT = hx("E8CD86")
CREAM = hx("F4EBDD")
PAPER = hx("FBF6EC")
WOOD = hx("B07A45")
WOOD_LT = hx("CF9A62")
WOOD_DK = hx("7A5230")
FLOOR = hx("6A4730")
INK = hx("2A2A35")
VELVET = hx("2A3D6B")
VELVET_LT = hx("3D5590")
FOAM = hx("F0DE9C")
WADDING = hx("FFFFFF")
GREEN1 = hx("5E7A5A")
GREEN2 = hx("7F9B72")
GREEN3 = hx("A3B88F")

FLOOR_Y = 860
VERTICAL = [False]
CUR_FOCUS = [960]


def src(c, col, a=None):
    if a is None:
        c.set_source_rgba(*col)
    else:
        c.set_source_rgba(col[0], col[1], col[2], col[3] * a)


def clamp(v, a=0.0, b=1.0):
    return max(a, min(b, v))


def ease(t):
    t = clamp(t)
    return t * t * (3 - 2 * t)


def ease_out_back(t, s=1.70158):
    t = clamp(t) - 1
    return t * t * ((s + 1) * t + s) + 1


def seg(t, a, b):
    """0..1 progress of t through [a,b]."""
    if b <= a:
        return 1.0 if t >= b else 0.0
    return clamp((t - a) / (b - a))


def rnd(i, k=0):
    """deterministic pseudo random 0..1"""
    x = math.sin(i * 12.9898 + k * 78.233) * 43758.5453
    return x - math.floor(x)


def lerp(a, b, t):
    return a + (b - a) * t


def rrect(c, x, y, w, h, r):
    r = min(r, w / 2, h / 2)
    c.new_sub_path()
    c.arc(x + w - r, y + r, r, -math.pi / 2, 0)
    c.arc(x + w - r, y + h - r, r, 0, math.pi / 2)
    c.arc(x + r, y + h - r, r, math.pi / 2, math.pi)
    c.arc(x + r, y + r, r, math.pi, 3 * math.pi / 2)
    c.close_path()


def glow(c, x, y, r, col, a=1.0):
    g = cairo.RadialGradient(x, y, 0, x, y, r)
    g.add_color_stop_rgba(0, col[0], col[1], col[2], a)
    g.add_color_stop_rgba(1, col[0], col[1], col[2], 0)
    c.set_source(g)
    c.arc(x, y, r, 0, 2 * math.pi)
    c.fill()


# ---------------------------------------------------------------- text
SERIF = "Playfair Display"
SANS = "Inter"


def text_w(c, s, font, size, slant=cairo.FONT_SLANT_NORMAL, weight=cairo.FONT_WEIGHT_NORMAL):
    c.select_font_face(font, slant, weight)
    c.set_font_size(size)
    return c.text_extents(s).x_advance


def draw_text(c, s, x, y, font, size, col, align="center", slant=cairo.FONT_SLANT_NORMAL,
              weight=cairo.FONT_WEIGHT_NORMAL, alpha=1.0, spacing=0.0):
    c.select_font_face(font, slant, weight)
    c.set_font_size(size)
    if spacing:
        w = sum(c.text_extents(ch).x_advance for ch in s) + spacing * (len(s) - 1)
    else:
        w = c.text_extents(s).x_advance
    if align == "center":
        x0 = x - w / 2
    elif align == "right":
        x0 = x - w
    else:
        x0 = x
    src(c, col, alpha)
    if spacing:
        cx = x0
        for ch in s:
            c.move_to(cx, y)
            c.show_text(ch)
            cx += c.text_extents(ch).x_advance + spacing
    else:
        c.move_to(x0, y)
        c.show_text(s)
    return w


def wrap_lines(c, s, font, size, max_w, slant=cairo.FONT_SLANT_NORMAL):
    words = s.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if text_w(c, trial, font, size, slant) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


# ---------------------------------------------------------------- characters
CAST = {
    # fictional animated family team (not real people)
    "maker": dict(skin=hx("E8B98F"), hair=hx("A3A8B0"), style="beard", shirt=hx("EFE6D6"), trousers=hx("3A3F4D")),
    "cutter": dict(skin=hx("C68A62"), hair=hx("3B2A20"), style="bun", shirt=hx("D9B25C"), trousers=hx("2E3445")),
    "young": dict(skin=hx("F1C9A5"), hair=hx("B5652B"), style="messy", shirt=hx("8FB3D9"), trousers=hx("3A3F4D")),
    "crew": dict(skin=hx("8D5A3B"), hair=hx("1E1A18"), style="short", shirt=NAVY, trousers=hx("2B2F3A"), polo=True),
}


def ik(sx, sy, tx, ty, L1, L2, bend):
    dx, dy = tx - sx, ty - sy
    d = math.hypot(dx, dy)
    d = max(abs(L1 - L2) + 0.01, min(d, L1 + L2 - 0.01))
    a = math.atan2(dy, dx)
    cb = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)
    b = math.acos(clamp(cb, -1, 1))
    ang = a + bend * b
    ex, ey = sx + L1 * math.cos(ang), sy + L1 * math.sin(ang)
    hx_, hy_ = sx + d * math.cos(a), sy + d * math.sin(a)
    return (ex, ey), (hx_, hy_)


def person(c, who, x, feet_y, s=1.0, t=0.0, lh=None, rh=None, nod=0.0, smile=0.5,
           look=0.0, apron=True, hold=None):
    """Front-facing flat character. lh/rh = absolute hand targets (or None = relaxed)."""
    p = CAST[who]
    head_y = feet_y - 345 * s + nod * 6 * s
    hip_y = feet_y - 150 * s
    sh_y = feet_y - 280 * s
    # legs
    src(c, p["trousers"])
    for dx in (-26, 26):
        rrect(c, x + dx * s - 20 * s, hip_y - 10 * s, 40 * s, 150 * s, 16 * s)
        c.fill()
    src(c, hx("2A211C"))
    for dx in (-30, 30):
        rrect(c, x + dx * s - 26 * s, feet_y - 18 * s, 52 * s, 20 * s, 9 * s)
        c.fill()
    # torso
    src(c, p["shirt"])
    rrect(c, x - 62 * s, sh_y - 14 * s, 124 * s, 165 * s, 34 * s)
    c.fill()
    if p.get("polo"):
        src(c, GOLD)
        c.set_line_width(5 * s)
        c.move_to(x - 16 * s, sh_y - 12 * s)
        c.line_to(x, sh_y + 10 * s)
        c.line_to(x + 16 * s, sh_y - 12 * s)
        c.stroke()
        # small gold chest wordmark bar (plain, no logo)
        src(c, GOLD)
        rrect(c, x + 16 * s, sh_y + 30 * s, 28 * s, 6 * s, 3 * s)
        c.fill()
    elif apron:
        src(c, NAVY)
        rrect(c, x - 46 * s, sh_y + 18 * s, 92 * s, 150 * s, 16 * s)
        c.fill()
        src(c, GOLD)
        c.set_line_width(3 * s)
        rrect(c, x - 40 * s, sh_y + 24 * s, 80 * s, 138 * s, 12 * s)
        c.stroke()
        rrect(c, x - 24 * s, sh_y + 92 * s, 48 * s, 30 * s, 6 * s)
        c.stroke()
        c.set_line_width(4 * s)
        c.move_to(x - 40 * s, sh_y + 20 * s)
        c.line_to(x - 30 * s, sh_y - 10 * s)
        c.move_to(x + 40 * s, sh_y + 20 * s)
        c.line_to(x + 30 * s, sh_y - 10 * s)
        c.stroke()
    # neck
    src(c, p["skin"])
    rrect(c, x - 14 * s, head_y + 30 * s, 28 * s, 30 * s, 8 * s)
    c.fill()
    # arms
    L1, L2 = 72 * s, 70 * s
    for side, tgt in ((-1, lh), (1, rh)):
        sx, sy = x + side * 54 * s, sh_y + 8 * s
        if tgt is None:
            sway = math.sin(t * 1.6 + side) * 4 * s
            tgt = (sx + side * 14 * s + sway, sy + 136 * s)
        (ex, ey), (hx_, hy_) = ik(sx, sy, tgt[0], tgt[1], L1, L2, -side * 1)
        c.set_line_cap(cairo.LINE_CAP_ROUND)
        c.set_line_join(cairo.LINE_JOIN_ROUND)
        src(c, p["shirt"])
        c.set_line_width(30 * s)
        c.move_to(sx, sy)
        c.line_to(ex, ey)
        c.stroke()
        src(c, p["skin"])
        c.set_line_width(24 * s)
        c.move_to(ex, ey)
        c.line_to(hx_, hy_)
        c.stroke()
        c.arc(hx_, hy_, 15 * s, 0, 2 * math.pi)
        c.fill()
    # head
    hx0 = x + look * 4 * s
    src(c, p["skin"])
    c.arc(hx0, head_y, 50 * s, 0, 2 * math.pi)
    c.fill()
    # ears
    for side in (-1, 1):
        c.arc(hx0 + side * 49 * s, head_y + 4 * s, 10 * s, 0, 2 * math.pi)
        c.fill()
    hair = p["hair"]
    src(c, hair)
    st = p["style"]
    if st == "beard":
        c.arc(hx0, head_y - 4 * s, 52 * s, math.pi * 1.05, math.pi * 1.95)
        c.close_path()
        c.fill()
        c.move_to(hx0 - 48 * s, head_y + 6 * s)
        c.curve_to(hx0 - 44 * s, head_y + 62 * s, hx0 + 44 * s, head_y + 62 * s, hx0 + 48 * s, head_y + 6 * s)
        c.curve_to(hx0 + 30 * s, head_y + 30 * s, hx0 - 30 * s, head_y + 30 * s, hx0 - 48 * s, head_y + 6 * s)
        c.fill()
    elif st == "bun":
        c.arc(hx0, head_y - 70 * s, 26 * s, 0, 2 * math.pi)
        c.fill()
        c.arc(hx0, head_y - 2 * s, 54 * s, math.pi * 0.95, math.pi * 2.05)
        c.close_path()
        c.fill()
        rrect(c, hx0 - 56 * s, head_y - 10 * s, 18 * s, 50 * s, 8 * s)
        c.fill()
        rrect(c, hx0 + 38 * s, head_y - 10 * s, 18 * s, 50 * s, 8 * s)
        c.fill()
    elif st == "messy":
        c.arc(hx0, head_y - 6 * s, 52 * s, math.pi * 1.0, math.pi * 2.0)
        c.close_path()
        c.fill()
        for i in range(6):
            a = math.pi * (1.1 + i * 0.16)
            c.arc(hx0 + math.cos(a) * 46 * s, head_y - 6 * s + math.sin(a) * 46 * s, 16 * s, 0, 2 * math.pi)
            c.fill()
    else:
        c.arc(hx0, head_y - 4 * s, 52 * s, math.pi * 1.02, math.pi * 1.98)
        c.close_path()
        c.fill()
    # face
    blink = (t + rnd(len(who))) % 3.3 < 0.12
    ex_ = hx0 + look * 6 * s
    src(c, INK)
    for side in (-1, 1):
        if blink:
            c.set_line_width(3 * s)
            c.move_to(ex_ + side * 17 * s - 6 * s, head_y + 2 * s)
            c.line_to(ex_ + side * 17 * s + 6 * s, head_y + 2 * s)
            c.stroke()
        else:
            c.save()
            c.translate(ex_ + side * 17 * s, head_y + 2 * s)
            c.scale(1, 1.25)
            c.arc(0, 0, 5.5 * s, 0, 2 * math.pi)
            c.restore()
            c.fill()
    # brows
    c.set_line_width(3.5 * s)
    src(c, hair if st != "beard" else hx("7D828A"))
    for side in (-1, 1):
        c.move_to(ex_ + side * 10 * s, head_y - 14 * s)
        c.line_to(ex_ + side * 25 * s, head_y - 15 * s - smile * 2 * s)
        c.stroke()
    # cheeks
    for side in (-1, 1):
        src(c, hx("E07A6A", 0.35))
        c.arc(hx0 + side * 28 * s, head_y + 18 * s, 8 * s, 0, 2 * math.pi)
        c.fill()
    # mouth
    src(c, INK)
    c.set_line_width(3.5 * s)
    c.arc(ex_, head_y + 14 * s, (8 + smile * 6) * s, math.pi * (0.2), math.pi * 0.8)
    c.stroke()


# ---------------------------------------------------------------- props
def wood_rect(c, x, y, w, h, col=WOOD, grain=True, r=4):
    src(c, col)
    rrect(c, x, y, w, h, r)
    c.fill()
    if grain:
        c.save()
        rrect(c, x, y, w, h, r)
        c.clip()
        src(c, WOOD_DK, 0.35)
        c.set_line_width(2)
        n = max(2, int(h / 12))
        for i in range(n):
            yy = y + (i + 0.5) * h / n
            c.move_to(x, yy)
            amp = 3 + rnd(i, 3) * 4
            c.curve_to(x + w * 0.3, yy - amp, x + w * 0.6, yy + amp, x + w, yy)
            c.stroke()
        c.restore()


def workbench(c, x0, x1, top=660):
    # legs
    for xx in (x0 + 30, x1 - 70):
        wood_rect(c, xx, top + 30, 40, FLOOR_Y - top - 30, WOOD_DK, grain=False)
    wood_rect(c, x0 + 40, FLOOR_Y - 90, x1 - x0 - 80, 22, WOOD_DK, grain=False)
    wood_rect(c, x0, top, x1 - x0, 34, WOOD)
    src(c, WOOD_LT)
    c.rectangle(x0, top, x1 - x0, 6)
    c.fill()


def motes(c, t, x0, x1, y0, y1, n=40, col=GOLD_LT, alpha=0.5):
    for i in range(n):
        px = x0 + (rnd(i, 1) * (x1 - x0) + math.sin(t * 0.5 + i) * 30) % (x1 - x0)
        py = y0 + ((rnd(i, 2) * (y1 - y0)) - t * (8 + rnd(i, 4) * 14)) % (y1 - y0)
        a = alpha * (0.4 + 0.6 * (0.5 + 0.5 * math.sin(t * 2 + i)))
        src(c, col, a)
        c.arc(px, py, 1.5 + rnd(i, 5) * 2.5, 0, 2 * math.pi)
        c.fill()


def bg_workshop(c, t, lamp=True):
    # big background extents so vertical crops still have content
    src(c, WALL)
    c.rectangle(-1500, -1500, 4920, FLOOR_Y + 1500)
    c.fill()
    # wall panelling
    src(c, NAVY_MID, 0.55)
    for i in range(-10, 32):
        c.rectangle(i * 120, -1500, 3, FLOOR_Y - 120 + 1500)
        c.fill()
    src(c, NAVY, 1)
    c.rectangle(-1500, FLOOR_Y - 140, 4920, 140)
    c.fill()
    src(c, GOLD, 0.6)
    c.rectangle(-1500, FLOOR_Y - 142, 4920, 4)
    c.fill()
    # window with warm daylight
    wx, wy, ww, wh = 1340, 120, 340, 400
    glow(c, wx + ww / 2, wy + wh / 2, 520, GOLD_LT, 0.28)
    src(c, hx("F7E3B0"))
    rrect(c, wx, wy, ww, wh, 10)
    c.fill()
    g = cairo.LinearGradient(0, wy, 0, wy + wh)
    g.add_color_stop_rgba(0, 0.99, 0.92, 0.75, 1)
    g.add_color_stop_rgba(1, 0.93, 0.78, 0.52, 1)
    c.set_source(g)
    rrect(c, wx + 12, wy + 12, ww - 24, wh - 24, 6)
    c.fill()
    # distant rooftops in window (West Yorkshire terraces, generic)
    src(c, hx("C9A57A"))
    c.move_to(wx + 12, wy + wh - 12)
    for i in range(7):
        bx = wx + 12 + i * 48
        c.line_to(bx, wy + wh - 90 - (i % 3) * 18)
        c.line_to(bx + 24, wy + wh - 110 - (i % 3) * 18)
        c.line_to(bx + 48, wy + wh - 90 - (i % 3) * 18)
    c.line_to(wx + ww - 12, wy + wh - 12)
    c.close_path()
    c.fill()
    src(c, WOOD_DK)
    c.rectangle(wx + ww / 2 - 6, wy, 12, wh)
    c.rectangle(wx, wy + wh / 2 - 6, ww, 12)
    c.fill()
    # light shafts
    c.save()
    c.move_to(wx + 20, wy + 20)
    c.line_to(wx + ww - 20, wy + 20)
    c.line_to(wx - 300, FLOOR_Y + 200)
    c.line_to(wx - 900, FLOOR_Y + 200)
    c.close_path()
    g = cairo.LinearGradient(wx, wy, wx - 600, FLOOR_Y)
    g.add_color_stop_rgba(0, 1, 0.9, 0.65, 0.16)
    g.add_color_stop_rgba(1, 1, 0.9, 0.65, 0.0)
    c.set_source(g)
    c.fill()
    c.restore()
    # pegboard with tools
    px, py = 180, 170
    src(c, hx("8B6A4A"))
    rrect(c, px, py, 520, 300, 8)
    c.fill()
    src(c, hx("6E5238"))
    for i in range(12):
        for j in range(7):
            c.arc(px + 25 + i * 43, py + 22 + j * 42, 3, 0, 2 * math.pi)
            c.fill()
    # hammer
    src(c, WOOD_LT)
    rrect(c, px + 60, py + 60, 14, 150, 5)
    c.fill()
    src(c, hx("9CA3AE"))
    rrect(c, px + 35, py + 50, 64, 26, 5)
    c.fill()
    # saw
    src(c, hx("B9C0C9"))
    c.move_to(px + 150, py + 70)
    c.line_to(px + 300, py + 90)
    c.line_to(px + 300, py + 130)
    c.line_to(px + 150, py + 100)
    c.close_path()
    c.fill()
    src(c, GOLD)
    rrect(c, px + 120, py + 60, 40, 50, 10)
    c.fill()
    # scissors
    c.set_line_width(6)
    src(c, hx("B9C0C9"))
    c.move_to(px + 360, py + 60)
    c.line_to(px + 420, py + 200)
    c.move_to(px + 420, py + 60)
    c.line_to(px + 360, py + 200)
    c.stroke()
    src(c, GOLD)
    c.arc(px + 360, py + 215, 14, 0, 2 * math.pi)
    c.stroke()
    c.arc(px + 420, py + 215, 14, 0, 2 * math.pi)
    c.stroke()
    # fabric rolls on shelf
    src(c, WOOD_DK)
    c.rectangle(px + 30, py + 255, 470, 12)
    c.fill()
    for i, col in enumerate([VELVET, hx("8E9E86"), hx("A7A39B"), hx("EDE4D3"), hx("B88A5A")]):
        src(c, col)
        c.arc(px + 75 + i * 90, py + 222, 32, 0, 2 * math.pi)
        c.fill()
        src(c, hx("000000", 0.18))
        c.arc(px + 75 + i * 90, py + 222, 10, 0, 2 * math.pi)
        c.fill()
    # floor
    src(c, FLOOR)
    c.rectangle(-1500, FLOOR_Y, 4920, 1600)
    c.fill()
    src(c, hx("5A3B27"))
    for i in range(14):
        c.rectangle(-1500, FLOOR_Y + 30 + i * 52, 4920, 3)
        c.fill()
    # hanging lamps
    if lamp:
        for lx in (520, 1180):
            src(c, INK)
            c.rectangle(lx - 1, -1500, 2, 1500 + 60)
            c.fill()
            glow(c, lx, 100, 260, GOLD_LT, 0.22)
            src(c, NAVY_DEEP)
            c.move_to(lx - 50, 100)
            c.line_to(lx - 18, 50)
            c.line_to(lx + 18, 50)
            c.line_to(lx + 50, 100)
            c.close_path()
            c.fill()
            src(c, GOLD)
            c.rectangle(lx - 50, 98, 100, 5)
            c.fill()
            src(c, hx("FFF4D0"))
            c.arc(lx, 106, 12, 0, math.pi)
            c.fill()


def headboard_path(c, x, y, w, h):
    """Arched-top headboard outline. (x,y) top-left of bounding box."""
    arch = h * 0.22
    c.new_path()
    c.move_to(x, y + h)
    c.line_to(x, y + arch)
    c.curve_to(x, y + arch * 0.2, x + w * 0.25, y, x + w / 2, y)
    c.curve_to(x + w * 0.75, y, x + w, y + arch * 0.2, x + w, y + arch)
    c.line_to(x + w, y + h)
    c.close_path()


def button_grid(x, y, w, h, rows=3, cols=6):
    pts = []
    for r in range(rows):
        off = 0.5 if r % 2 else 0.0
        n = cols - (1 if r % 2 else 0)
        for k in range(n):
            px = x + w * (k + 1 + off) / (cols + 1)
            py = y + h * (0.32 + r * 0.2)
            pts.append((px, py))
    return pts


def velvet_headboard(c, x, y, w, h, buttons=1.0, sheen_t=0.0, col=VELVET):
    headboard_path(c, x, y, w, h)
    g = cairo.LinearGradient(x, y, x + w, y + h)
    g.add_color_stop_rgba(0, *col[:3], 1)
    g.add_color_stop_rgba(0.5, col[0] * 1.35, col[1] * 1.35, col[2] * 1.35, 1)
    g.add_color_stop_rgba(1, *col[:3], 1)
    c.set_source(g)
    c.fill_preserve()
    c.save()
    c.clip()
    # moving sheen
    sx = x - w + (w * 3) * (sheen_t % 1.0)
    g2 = cairo.LinearGradient(sx, y, sx + w * 0.5, y + h)
    g2.add_color_stop_rgba(0, 1, 1, 1, 0)
    g2.add_color_stop_rgba(0.5, 1, 1, 1, 0.12)
    g2.add_color_stop_rgba(1, 1, 1, 1, 0)
    c.set_source(g2)
    c.paint()
    pts = button_grid(x, y, w, h)
    nshow = int(round(len(pts) * buttons))
    # tufting pleats between shown buttons
    src(c, NAVY_DEEP, 0.45)
    c.set_line_width(2.5)
    shown = pts[:nshow]
    for i, (ax, ay) in enumerate(shown):
        for bx, by in shown[i + 1:]:
            d = math.hypot(bx - ax, by - ay)
            if d < w / 6.2 and abs(by - ay) > 1:
                c.move_to(ax, ay)
                c.line_to(bx, by)
                c.stroke()
    c.restore()
    # piping
    headboard_path(c, x, y, w, h)
    src(c, GOLD, 0.85)
    c.set_line_width(4)
    c.stroke()
    for i, (px, py) in enumerate(shown):
        br = max(6.0, w / 52)
        src(c, NAVY_DEEP, 0.7)
        c.arc(px, py + 2, br + 1.5, 0, 2 * math.pi)
        c.fill()
        src(c, VELVET_LT)
        c.arc(px, py, br, 0, 2 * math.pi)
        c.fill()
        src(c, hx("FFFFFF", 0.35))
        c.arc(px - br * 0.3, py - br * 0.3, br * 0.35, 0, 2 * math.pi)
        c.fill()
    return pts


def bed_side(c, x, y, w, h_base, head_w=None, head_h=320, mattress=True, bedding=False, t=0.0):
    """Front-ish 3/4 bed: headboard behind, base and mattress in front. (x,y)=base top-left."""
    head_w = head_w or w
    hx0 = x + (w - head_w) / 2
    velvet_headboard(c, hx0, y - head_h + 40, head_w, head_h, sheen_t=t * 0.12)
    if mattress:
        src(c, hx("FFFFFF"))
        rrect(c, x + 10, y - 50, w - 20, 64, 16)
        c.fill()
        src(c, hx("D9D4CC"))
        c.rectangle(x + 20, y - 10, w - 40, 3)
        c.fill()
    if bedding:
        # pillows
        for i in range(2):
            px = x + w * (0.12 + i * 0.44)
            src(c, CREAM)
            rrect(c, px, y - 120, w * 0.32, 80, 30)
            c.fill()
            src(c, hx("E2D6C2"))
            c.set_line_width(2)
            rrect(c, px, y - 120, w * 0.32, 80, 30)
            c.stroke()
        # duvet
        g = cairo.LinearGradient(0, y - 60, 0, y + 70)
        g.add_color_stop_rgba(0, 0.98, 0.96, 0.92, 1)
        g.add_color_stop_rgba(1, 0.90, 0.86, 0.80, 1)
        c.set_source(g)
        rrect(c, x - 10, y - 66, w + 20, 130, 26)
        c.fill()
        # gold throw
        src(c, GOLD)
        rrect(c, x - 14, y - 4, w + 28, 54, 18)
        c.fill()
        src(c, GOLD_LT, 0.7)
        c.set_line_width(2)
        for i in range(6):
            c.move_to(x + i * w / 6 + 20, y + 2)
            c.line_to(x + i * w / 6 + 6, y + 44)
            c.stroke()
    # base (upholstered)
    g = cairo.LinearGradient(0, y + 10, 0, y + 10 + h_base)
    g.add_color_stop_rgba(0, VELVET_LT[0], VELVET_LT[1], VELVET_LT[2], 1)
    g.add_color_stop_rgba(1, VELVET[0], VELVET[1], VELVET[2], 1)
    c.set_source(g)
    rrect(c, x - 8, y + 10, w + 16, h_base, 14)
    c.fill()
    src(c, GOLD, 0.85)
    c.set_line_width(3)
    rrect(c, x - 8, y + 10, w + 16, h_base, 14)
    c.stroke()
    # feet
    src(c, WOOD_DK)
    for fx in (x + 20, x + w - 50):
        rrect(c, fx, y + 10 + h_base, 30, 24, 4)
        c.fill()


def sparkle(c, x, y, r, a=1.0, col=GOLD_LT):
    if a <= 0:
        return
    src(c, col, a)
    c.move_to(x, y - r)
    c.curve_to(x, y, x, y, x + r, y)
    c.curve_to(x, y, x, y, x, y + r)
    c.curve_to(x, y, x, y, x - r, y)
    c.curve_to(x, y, x, y, x, y - r)
    c.fill()


# ---------------------------------------------------------------- scenes
# Each scene: dict(dur, focus=(fx_func or const), draw(c, t, dur), head, sub)
def s1_sketch(c, t, d):
    bg_workshop(c, t)
    # easel / drafting board on bench
    bx, by, bw, bh = 880, 250, 420, 330
    src(c, WOOD_DK)
    c.set_line_width(14)
    c.move_to(bx + 40, by + bh)
    c.line_to(bx + 70, 660)
    c.move_to(bx + bw - 40, by + bh)
    c.line_to(bx + bw - 70, 660)
    c.stroke()
    wood_rect(c, bx - 14, by - 14, bw + 28, bh + 28, WOOD, grain=False, r=8)
    src(c, PAPER)
    rrect(c, bx, by, bw, bh, 4)
    c.fill()
    src(c, hx("C8D3E6", 0.6))
    c.set_line_width(1)
    for i in range(1, 14):
        c.move_to(bx + i * bw / 14, by)
        c.line_to(bx + i * bw / 14, by + bh)
        c.move_to(bx, by + i * bh / 11)
        c.line_to(bx + bw, by + i * bh / 11)
    c.stroke()
    # sketch: headboard + base, drawn progressively
    pts = []
    hx0, hy0, hw, hh = bx + 70, by + 50, bw - 140, 170
    N = 40
    # headboard arch path sampled
    for i in range(N + 1):
        u = i / N
        pts.append((hx0 + hw * u, hy0 + hh * 0.22 * (1 - math.sin(math.pi * u) ** 0.6)))
    pts = [(hx0, hy0 + hh)] + pts + [(hx0 + hw, hy0 + hh)]
    base = [(hx0 - 30, hy0 + hh), (hx0 + hw + 30, hy0 + hh), (hx0 + hw + 30, hy0 + hh + 60),
            (hx0 - 30, hy0 + hh + 60), (hx0 - 30, hy0 + hh)]
    allpts = pts + base
    L = [0.0]
    for i in range(1, len(allpts)):
        L.append(L[-1] + math.hypot(allpts[i][0] - allpts[i - 1][0], allpts[i][1] - allpts[i - 1][1]))
    prog = ease(seg(t, 0.6, d - 1.6)) * L[-1]
    src(c, INK, 0.85)
    c.set_line_width(3.2)
    c.set_line_cap(cairo.LINE_CAP_ROUND)
    c.move_to(*allpts[0])
    tip = allpts[0]
    for i in range(1, len(allpts)):
        if L[i] <= prog:
            c.line_to(*allpts[i])
            tip = allpts[i]
        else:
            f = (prog - L[i - 1]) / max(1e-6, L[i] - L[i - 1])
            tip = (lerp(allpts[i - 1][0], allpts[i][0], f), lerp(allpts[i - 1][1], allpts[i][1], f))
            c.line_to(*tip)
            break
    c.stroke()
    # button dots appear after outline
    bt = seg(t, d - 1.6, d - 0.6)
    for i, (px, py) in enumerate(button_grid(hx0, hy0, hw, hh)):
        if bt * 17 > i:
            src(c, INK, 0.8)
            c.arc(px, py, 3.5, 0, 2 * math.pi)
            c.fill()
    # pencil follows tip (or rests)
    if bt > 0:
        tip = (lerp(tip[0], hx0 + hw / 2, bt), lerp(tip[1], hy0 + hh * 0.5, bt))
    wig = math.sin(t * 22) * 2
    c.save()
    c.translate(tip[0] + wig, tip[1])
    c.rotate(-0.6)
    src(c, GOLD)
    c.rectangle(0, -5, 70, 10)
    c.fill()
    src(c, WOOD_LT)
    c.move_to(0, -5)
    c.line_to(-14, 0)
    c.line_to(0, 5)
    c.close_path()
    c.fill()
    src(c, INK)
    c.move_to(-9, -2)
    c.line_to(-14, 0)
    c.line_to(-9, 2)
    c.fill()
    c.restore()
    person(c, "maker", 760, FLOOR_Y + 10, 1.0, t, rh=(tip[0] + 30, tip[1] - 14),
           lh=(700, 650), look=0.6, smile=0.7)
    workbench(c, 600, 1360)
    # coffee mug & ruler on bench
    src(c, CREAM)
    rrect(c, 640, 612, 34, 48, 6)
    c.fill()
    src(c, GOLD)
    c.rectangle(640, 625, 34, 6)
    c.fill()
    motes(c, t, 300, 1700, 100, 820, 50)


def s2_timber(c, t, d):
    bg_workshop(c, t)
    split = 4.0
    if t < split + 0.3:
        a = 1 - seg(t, split - 0.2, split + 0.3)
        # plank on bench, saw cutting
        cut = seg(t, 0.4, split - 0.5)
        drop = ease(seg(t, split - 0.6, split - 0.1))
        c.push_group()
        person(c, "cutter", 1110, FLOOR_Y + 10, 1.0, t,
               rh=(1150 + math.sin(t * 9) * 40, 600 + cut * 30), lh=(980, 640), look=0.2, smile=0.6)
        workbench(c, 600, 1360)
        wood_rect(c, 660, 616, 470, 44, WOOD_LT)
        c.save()
        c.translate(1130 + drop * 30, 616 + drop * 10)
        c.rotate(drop * 0.15)
        wood_rect(c, 0, 0, 160, 44, WOOD_LT)
        c.restore()
        # saw
        sx = 1150 + math.sin(t * 9) * 40
        sy = 600 + cut * 30
        c.save()
        c.translate(sx, sy)
        c.rotate(-0.25)
        src(c, hx("C3CAD3"))
        c.move_to(-160, -6)
        c.line_to(10, -10)
        c.line_to(10, 30)
        c.line_to(-160, 10)
        c.close_path()
        c.fill()
        src(c, hx("8C949F"))
        for i in range(14):
            c.move_to(-158 + i * 12, 10 - i * 0.2)
            c.line_to(-152 + i * 12, 18)
            c.line_to(-146 + i * 12, 10)
            c.fill()
        src(c, GOLD)
        rrect(c, 4, -20, 46, 60, 14)
        c.fill()
        c.restore()
        # sawdust
        for i in range(36):
            life = (t * 1.3 + rnd(i, 7)) % 1.0
            px = 1132 + (rnd(i, 8) - 0.5) * 40 + life * (rnd(i, 9) - 0.5) * 60
            py = 660 + life * 200
            src(c, GOLD_LT, (1 - life) * 0.9 * (cut > 0.02 and cut < 1))
            c.arc(px, py, 2 + rnd(i, 6) * 2, 0, 2 * math.pi)
            c.fill()
        c.pop_group_to_source()
        c.paint_with_alpha(a)
    if t > split - 0.2:
        a = seg(t, split - 0.2, split + 0.3)
        c.push_group()
        u = t - split
        hit = (u * 2.4) % 1.0
        mallet_y = 360 - math.sin(hit * math.pi) * 80
        person(c, "maker", 700, FLOOR_Y + 10, 1.0, t, rh=(810, mallet_y + 40), lh=(640, 640), look=0.7,
               smile=0.6)
        person(c, "cutter", 1290, FLOOR_Y + 10, 1.0, t, lh=(1190, 540), rh=(1330, 660), look=-0.6,
               smile=0.8)
        workbench(c, 600, 1360)
        # frame assembling (front elevation)
        fx, fy, fw, fh, th = 780, 380, 400, 270, 36
        p1 = ease_out_back(seg(u, 0.0, 0.7))
        p2 = ease_out_back(seg(u, 0.5, 1.2))
        p3 = ease_out_back(seg(u, 1.0, 1.7))
        p4 = ease_out_back(seg(u, 1.5, 2.2))
        # bottom rail slides from left
        wood_rect(c, lerp(fx - 500, fx, p1), fy + fh - th, fw, th, WOOD)
        # left post from top
        wood_rect(c, fx, lerp(fy - 500, fy, p2), th, fh, WOOD_LT)
        # right post
        wood_rect(c, fx + fw - th, lerp(fy - 500, fy, p3), th, fh, WOOD_LT)
        # top rail from right
        wood_rect(c, lerp(fx + 500, fx, p4), fy, fw, th, WOOD)
        # slats
        sl = seg(u, 2.3, 3.0)
        for i in range(5):
            if sl * 5 > i:
                wood_rect(c, fx + th + 10 + i * 66, fy + th + 8, 44, fh - 2 * th - 16, WOOD_LT, grain=False)
        # joints glow
        for k, (jx, jy) in enumerate([(fx + th / 2, fy + th / 2), (fx + fw - th / 2, fy + th / 2),
                                       (fx + th / 2, fy + fh - th / 2), (fx + fw - th / 2, fy + fh - th / 2)]):
            ja = seg(u, 1.6 + k * 0.15, 1.9 + k * 0.15) * (1 - seg(u, 2.6, 3.4))
            sparkle(c, jx, jy, 22 * ja, ja)
        # mallet
        c.save()
        c.translate(810, mallet_y + 40)
        c.rotate(-0.4 + math.sin(hit * math.pi) * 0.4)
        src(c, WOOD_DK)
        rrect(c, -6, -80, 12, 90, 4)
        c.fill()
        src(c, WOOD_LT)
        rrect(c, -34, -110, 68, 40, 8)
        c.fill()
        c.restore()
        c.pop_group_to_source()
        c.paint_with_alpha(a)
    motes(c, t, 300, 1700, 100, 820, 50)


def s3_foam(c, t, d):
    bg_workshop(c, t)
    person(c, "young", 1300, FLOOR_Y + 10, 1.0, t, lh=(1190, 470 + math.sin(t * 5) * 8 * seg(t, 3.5, 4)),
           rh=(1350, 650), look=-0.7, smile=0.8)
    workbench(c, 600, 1360)
    x, y, w, h = 740, 260, 460, 400
    # plywood panel
    headboard_path(c, x, y, w, h)
    src(c, WOOD_LT)
    c.fill()
    headboard_path(c, x, y, w, h)
    src(c, WOOD_DK)
    c.set_line_width(3)
    c.stroke()
    # foam drops
    pf = seg(t, 0.6, 2.2)
    fy = lerp(-500, 0, ease(pf))
    sq = 1 + 0.08 * math.sin(seg(t, 2.2, 3.0) * math.pi * 3) * (1 - seg(t, 2.2, 3.0))
    c.save()
    c.translate(x + w / 2, y + h + fy)
    c.scale(1 / sq, sq)
    c.translate(-(x + w / 2), -(y + h))
    headboard_path(c, x + 12, y + 12, w - 24, h - 24)
    src(c, FOAM)
    c.fill_preserve()
    c.save()
    c.clip()
    src(c, hx("D9C37A"))
    for i in range(160):
        c.arc(x + rnd(i, 1) * w, y + rnd(i, 2) * h, 2 + rnd(i, 3) * 3, 0, 2 * math.pi)
        c.fill()
    c.restore()
    c.restore()
    # wadding (padding) unrolls downward
    pw = ease(seg(t, 3.4, 5.6))
    if pw > 0:
        c.save()
        c.rectangle(x - 20, y - 20, w + 40, (h + 40) * pw)
        c.clip()
        headboard_path(c, x + 6, y + 6, w - 12, h - 12)
        src(c, WADDING, 0.92)
        c.fill()
        src(c, hx("E6E2DA"))
        c.set_line_width(2)
        for i in range(14):
            yy = y + 30 + i * 26
            c.move_to(x + 20, yy)
            for k in range(10):
                c.curve_to(x + 20 + k * 43 + 10, yy - 6, x + 20 + k * 43 + 30, yy + 6, x + 20 + (k + 1) * 43, yy)
            c.stroke()
        c.restore()
        # roll edge
        ry = y + (h + 20) * pw
        if pw < 1:
            src(c, WADDING)
            rrect(c, x - 10, ry - 22, w + 20, 44, 22)
            c.fill()
            src(c, hx("DCD6CC"))
            c.set_line_width(2)
            rrect(c, x - 10, ry - 22, w + 20, 44, 22)
            c.stroke()
    motes(c, t, 300, 1700, 100, 820, 40)


SWATCHES = [
    ("Plush velvet", VELVET, "velvet"),
    ("Chenille", hx("8E9E86"), "chenille"),
    ("Naples", hx("A7A39B"), "naples"),
    ("Teddy bouclé", hx("EDE4D3"), "boucle"),
]


def swatch(c, x, y, w, h, col, kind, t):
    rrect(c, x, y, w, h, 14)
    src(c, col)
    c.fill_preserve()
    c.save()
    c.clip()
    if kind == "velvet":
        g = cairo.LinearGradient(x, y, x + w, y + h)
        g.add_color_stop_rgba(0, 1, 1, 1, 0)
        g.add_color_stop_rgba(0.45 + 0.1 * math.sin(t), 1, 1, 1, 0.22)
        g.add_color_stop_rgba(1, 1, 1, 1, 0)
        c.set_source(g)
        c.paint()
    elif kind == "chenille":
        src(c, hx("FFFFFF", 0.14))
        c.set_line_width(3)
        for i in range(30):
            c.move_to(x, y + i * 10)
            c.line_to(x + w, y + i * 10 + 4)
            c.stroke()
    elif kind == "naples":
        src(c, hx("000000", 0.10))
        c.set_line_width(2)
        for i in range(-20, 40):
            c.move_to(x + i * 9, y)
            c.line_to(x + i * 9 + h * 0.5, y + h)
            c.stroke()
    else:
        for i in range(90):
            src(c, hx("FFFFFF", 0.7))
            c.arc(x + rnd(i, 11) * w, y + rnd(i, 12) * h, 5 + rnd(i, 13) * 4, 0, 2 * math.pi)
            c.fill()
            src(c, hx("CFC3AE", 0.6))
            c.arc(x + rnd(i, 14) * w, y + rnd(i, 15) * h, 3, 0, 2 * math.pi)
            c.fill()
    c.restore()
    rrect(c, x, y, w, h, 14)
    src(c, GOLD, 0.9)
    c.set_line_width(3)
    c.stroke()


def s4_fabric(c, t, d):
    bg_workshop(c, t)
    person(c, "cutter", 640, FLOOR_Y + 10, 1.0, t, look=0.8, smile=0.8,
           rh=None if t < 3.6 else (lerp(720, 790, ease(seg(t, 3.6, 4.4))), lerp(700, 470, ease(seg(t, 3.6, 4.4)))))
    workbench(c, 560, 1400)
    pick = ease(seg(t, 4.2, 5.4))
    cw, ch = 190, 230
    for i, (name, col, kind) in enumerate(SWATCHES):
        pin = ease_out_back(seg(t, 0.4 + i * 0.35, 1.2 + i * 0.35))
        bx = 760 + i * 160
        by = lerp(1100, 380, pin)
        rot = (i - 1.5) * 0.08
        sel = i == 0
        c.save()
        if sel and pick > 0:
            bx = lerp(bx, 960 - cw * 0.65, pick)
            by = lerp(by, 270, pick)
            rot = lerp(rot, 0, pick)
            sc = lerp(1, 1.35, pick)
        else:
            sc = 1
        c.translate(bx + cw / 2, by + ch / 2)
        c.rotate(rot)
        c.scale(sc, sc)
        c.translate(-cw / 2, -ch / 2)
        dim = 1 - 0.55 * pick if not sel else 1
        c.push_group()
        src(c, hx("000000", 0.25))
        rrect(c, 6, 10, cw, ch, 14)
        c.fill()
        swatch(c, 0, 0, cw, ch, col, kind, t)
        src(c, CREAM)
        rrect(c, 0, ch - 54, cw, 54, 0)
        c.save()
        rrect(c, 0, 0, cw, ch, 14)
        c.clip()
        c.rectangle(0, ch - 54, cw, 54)
        src(c, CREAM)
        c.fill()
        c.restore()
        draw_text(c, name, cw / 2, ch - 20, SERIF, 22, NAVY)
        c.pop_group_to_source()
        c.paint_with_alpha(dim)
        c.restore()
        if sel:
            sparkle(c, bx + cw * 1.2, by + 10, 26 * pick, pick)
    motes(c, t, 300, 1700, 100, 820, 40)


def s5_buttons(c, t, d):
    bg_workshop(c, t)
    x, y, w, h = 720, 250, 500, 410
    pts = button_grid(x, y, w, h)
    prog = seg(t, 0.8, d - 1.2)
    nf = prog * len(pts)
    cur = min(len(pts) - 1, int(nf))
    tx, ty = pts[cur]
    press = math.sin((nf % 1.0) * math.pi)
    person(c, "young", 1330, FLOOR_Y + 10, 1.0, t, lh=(tx + 14, ty + 18 + press * 8) if prog < 1 else None,
           rh=(1390, 650), look=-0.7, smile=0.9)
    workbench(c, 600, 1360)
    velvet_headboard(c, x, y, w, h, buttons=prog, sheen_t=t * 0.15)
    # bounce + sparkle on newest button
    if prog < 1:
        bt = nf % 1.0
        sparkle(c, tx, ty, 18 * math.sin(bt * math.pi), 0.9 * math.sin(bt * math.pi))
    # needle & thread on the left
    nx = 760 + math.sin(t * 3) * 10
    ny = 300 + math.cos(t * 3) * 6
    src(c, GOLD_LT)
    c.set_line_width(2)
    c.move_to(nx, ny)
    c.curve_to(nx - 60, ny - 80, nx - 140, ny + 40, nx - 120, ny + 160)
    c.stroke()
    src(c, hx("D7DCE3"))
    c.set_line_width(4)
    c.move_to(nx, ny)
    c.line_to(nx + 46, ny - 30)
    c.stroke()
    motes(c, t, 300, 1700, 100, 820, 40)


def s6_upholster(c, t, d):
    bg_workshop(c, t)
    x, y, w, hb = 620, 560, 700, 150
    move = ease(seg(t, 0.6, d - 1.0))
    person(c, "maker", lerp(640, 1250, move), FLOOR_Y + 10, 1.0, t,
           rh=(lerp(700, 1310, move), 560 + math.sin(t * 8) * 10), lh=(lerp(560, 1170, move), 600),
           look=0.5, smile=0.7)
    # trestles
    for tx in (x + 60, x + w - 120):
        src(c, WOOD_DK)
        c.set_line_width(16)
        c.move_to(tx, y + hb)
        c.line_to(tx - 30, FLOOR_Y)
        c.move_to(tx + 60, y + hb)
        c.line_to(tx + 90, FLOOR_Y)
        c.stroke()
        wood_rect(c, tx - 20, y + hb, 100, 20, WOOD, grain=False)
    # bare timber base
    wood_rect(c, x, y, w, hb, WOOD_LT)
    for i in range(1, 6):
        src(c, WOOD_DK, 0.6)
        c.rectangle(x + i * w / 6, y, 4, hb)
        c.fill()
    # fabric wipes across
    c.save()
    c.rectangle(x - 14, y - 14, (w + 28) * move, hb + 28)
    c.clip()
    g = cairo.LinearGradient(0, y - 12, 0, y + hb + 12)
    g.add_color_stop_rgba(0, VELVET_LT[0], VELVET_LT[1], VELVET_LT[2], 1)
    g.add_color_stop_rgba(1, VELVET[0], VELVET[1], VELVET[2], 1)
    c.set_source(g)
    rrect(c, x - 10, y - 10, w + 20, hb + 20, 16)
    c.fill()
    src(c, GOLD, 0.85)
    c.set_line_width(3)
    rrect(c, x - 10, y - 10, w + 20, hb + 20, 16)
    c.stroke()
    c.restore()
    # loose fabric edge
    if move < 1:
        ex = x + (w + 28) * move
        src(c, VELVET_LT)
        c.move_to(ex, y - 14)
        c.curve_to(ex + 40, y + 20, ex + 10, y + 80, ex + 46, y + hb + 14)
        c.line_to(ex, y + hb + 14)
        c.close_path()
        c.fill()
    # staple puffs
    for i in range(12):
        sx = x + 20 + i * (w - 40) / 11
        sxp = (sx - x) / w
        a = 1 - seg(move - sxp, 0.0, 0.12)
        if move > sxp:
            sparkle(c, sx, y + hb + 4, 14 * a, a)
    # staple gun in right hand
    gx, gy = lerp(700, 1310, move), 560 + math.sin(t * 8) * 10
    src(c, hx("2F3A4F"))
    rrect(c, gx - 10, gy - 50, 70, 34, 8)
    c.fill()
    src(c, GOLD)
    rrect(c, gx, gy - 20, 20, 40, 6)
    c.fill()
    motes(c, t, 300, 1700, 100, 820, 40)


def s7_check(c, t, d):
    bg_workshop(c, t)
    # finished bed in workshop
    person(c, "cutter", 1370, FLOOR_Y + 10, 0.95, t, nod=math.sin(seg(t, 4.6, 5.6) * math.pi * 2) * 1.0,
           look=-0.6, smile=0.9, lh=(1290, 640))
    person(c, "young", 1560, FLOOR_Y + 10, 0.95, t, nod=math.sin(seg(t, 4.8, 5.8) * math.pi * 2),
           look=-0.6, smile=0.95)
    bed_side(c, 700, 640, 560, 120, head_w=600, head_h=360, mattress=True, t=t)
    # maker with clipboard in foreground-left
    cbx, cby = 470, 560
    person(c, "maker", 380, FLOOR_Y + 30, 1.0, t, rh=(cbx + 20, cby + 70), lh=(cbx - 10, cby + 40),
           look=0.7, smile=0.8, nod=math.sin(seg(t, 4.5, 5.5) * math.pi * 2))
    # checklist card
    ca = ease(seg(t, 0.5, 1.2))
    if ca > 0:
        c.save()
        px, py = 1480, 140
        c.translate(px, py + (1 - ca) * 40)
        src(c, hx("000000", 0.25 * ca))
        rrect(c, 8, 10, 340, 270, 18)
        c.fill()
        src(c, PAPER, ca)
        rrect(c, 0, 0, 340, 270, 18)
        c.fill()
        src(c, GOLD, ca)
        c.rectangle(0, 0, 340, 10)
        c.fill()
        draw_text(c, "Quality check", 30, 56, SERIF, 32, NAVY, align="left", alpha=ca)
        for i, item in enumerate(["Frame & joints", "Stitching & buttons", "Fabric finish"]):
            yy = 110 + i * 56
            src(c, NAVY, ca)
            c.set_line_width(3)
            rrect(c, 30, yy - 26, 32, 32, 6)
            c.stroke()
            draw_text(c, item, 80, yy, SANS, 24, NAVY, align="left", alpha=ca)
            tk = ease(seg(t, 1.6 + i * 0.8, 2.1 + i * 0.8))
            if tk > 0:
                src(c, GOLD, ca)
                c.set_line_width(6)
                c.set_line_cap(cairo.LINE_CAP_ROUND)
                c.move_to(34, yy - 10)
                p = min(1, tk * 2)
                c.line_to(34 + 10 * p, yy - 10 + 10 * p)
                if tk > 0.5:
                    q = (tk - 0.5) * 2
                    c.line_to(44 + 20 * q, yy - 28 * q)
                c.stroke()
        c.restore()
    # clipboard
    src(c, WOOD)
    rrect(c, cbx - 40, cby, 90, 120, 8)
    c.fill()
    src(c, PAPER)
    c.rectangle(cbx - 32, cby + 14, 74, 98)
    c.fill()
    src(c, GOLD)
    rrect(c, cbx - 14, cby - 6, 40, 16, 4)
    c.fill()
    motes(c, t, 300, 1700, 100, 820, 40)


def van(c, x, y, t, s=1.0, moving=True):
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    # body
    src(c, hx("000000", 0.25))
    c.save()
    c.scale(1, 0.2)
    c.arc(160, 0, 230, 0, 2 * math.pi)
    c.restore()
    c.fill()
    bob = math.sin(t * 18) * 2 if moving else 0
    c.translate(0, bob)
    src(c, NAVY)
    rrect(c, -40, -230, 330, 200, 18)
    c.fill()
    c.move_to(290, -200)
    c.line_to(370, -200)
    c.curve_to(400, -200, 420, -150, 430, -110)
    c.line_to(440, -40)
    c.line_to(290, -30)
    c.close_path()
    c.fill()
    # window
    src(c, hx("BFD6EA"))
    c.move_to(305, -185)
    c.line_to(365, -185)
    c.curve_to(385, -185, 400, -150, 408, -115)
    c.line_to(305, -115)
    c.close_path()
    c.fill()
    # gold stripe and wordmark
    src(c, GOLD)
    c.rectangle(-40, -76, 480, 8)
    c.fill()
    draw_text(c, "EAGLE BED", 125, -150, SERIF, 46, GOLD, spacing=4)
    draw_text(c, "Handmade in Dewsbury", 125, -108, SERIF, 20, GOLD_LT, slant=cairo.FONT_SLANT_ITALIC)
    # lights
    src(c, hx("FFE9A8"))
    rrect(c, 425, -70, 16, 22, 4)
    c.fill()
    # wheels
    for wx in (40, 340):
        src(c, hx("16181D"))
        c.arc(wx, -28, 42, 0, 2 * math.pi)
        c.fill()
        src(c, hx("9AA2AD"))
        c.arc(wx, -28, 18, 0, 2 * math.pi)
        c.fill()
        c.save()
        c.translate(wx, -28)
        c.rotate(t * 12 if moving else 0)
        src(c, hx("5A616B"))
        c.set_line_width(4)
        for k in range(4):
            c.move_to(0, 0)
            c.line_to(16 * math.cos(k * math.pi / 2), 16 * math.sin(k * math.pi / 2))
        c.stroke()
        c.restore()
    c.restore()


def house(c, x, y):
    src(c, hx("B9805A"))
    c.rectangle(x, y - 300, 380, 300)
    c.fill()
    src(c, hx("000000", 0.08))
    for i in range(12):
        c.rectangle(x, y - 300 + i * 25, 380, 2)
        c.fill()
    src(c, hx("4A5568"))
    c.move_to(x - 30, y - 300)
    c.line_to(x + 190, y - 430)
    c.line_to(x + 410, y - 300)
    c.close_path()
    c.fill()
    src(c, NAVY)
    rrect(c, x + 160, y - 150, 70, 150, 6)
    c.fill()
    src(c, GOLD)
    c.arc(x + 215, y - 75, 5, 0, 2 * math.pi)
    c.fill()
    for wx in (x + 40, x + 270):
        src(c, hx("FCE7B2"))
        c.rectangle(wx, y - 240, 70, 80)
        c.fill()
        src(c, CREAM)
        c.set_line_width(5)
        c.rectangle(wx, y - 240, 70, 80)
        c.move_to(wx + 35, y - 240)
        c.line_to(wx + 35, y - 160)
        c.stroke()


def s8_van(c, t, d):
    # sky
    g = cairo.LinearGradient(0, -400, 0, 700)
    g.add_color_stop_rgba(0, 0.36, 0.52, 0.74, 1)
    g.add_color_stop_rgba(1, 0.98, 0.88, 0.70, 1)
    c.set_source(g)
    c.rectangle(-1500, -1500, 4920, 3200)
    c.fill()
    glow(c, 1500, 230, 260, hx("FFF1C9"), 0.9)
    src(c, hx("FFF6DE"))
    c.arc(1500, 230, 70, 0, 2 * math.pi)
    c.fill()
    # clouds
    for i in range(5):
        cx = ((rnd(i, 21) * 2400 - t * (12 + i * 4)) % 2600) - 400
        cy = 80 + rnd(i, 22) * 240
        src(c, hx("FFFFFF", 0.85))
        for k in range(4):
            c.arc(cx + k * 45, cy + (k % 2) * 10, 40 + (k % 2) * 10, 0, 2 * math.pi)
            c.fill()
    c.save()
    c.translate(0, -130)
    # parallax hills
    for layer, (col, base, amp, speed) in enumerate([(GREEN3, 600, 70, 20), (GREEN2, 690, 60, 45), (GREEN1, 780, 45, 90)]):
        off = -t * speed
        src(c, col)
        c.move_to(-1500, 1700)
        xx = -1500
        while xx <= 3500:
            c.line_to(xx, base - amp * (0.5 + 0.5 * math.sin((xx - off) / (260 + layer * 60) + layer)))
            xx += 40
        c.line_to(3500, 1700)
        c.close_path()
        c.fill()
        # dry stone walls / hedges on middle layer
        if layer == 1:
            src(c, hx("6F8A64"))
            for i in range(-6, 30):
                hx_ = (i * 220 + off) % 4400 - 1500
                c.arc(hx_, base - amp * (0.5 + 0.5 * math.sin((hx_ - off) / 320 + 1)) + 8, 26, math.pi, 2 * math.pi)
                c.fill()
    # road
    src(c, hx("3E4352"))
    c.rectangle(-1500, 820, 4920, 120)
    c.fill()
    src(c, GOLD_LT)
    for i in range(-8, 40):
        rx = (i * 160 - t * 200 * (1 - seg(t, d - 2.2, d - 0.8))) % 4800 - 1500
        c.rectangle(rx, 876, 80, 8)
        c.fill()
    src(c, hx("5C7A4F"))
    c.rectangle(-1500, 940, 4920, 1600)
    c.fill()
    # house arrives on right at the end
    hp = ease(seg(t, d - 3.2, d - 0.8))
    house(c, lerp(2300, 1430, hp), 822)
    # van
    vx = lerp(-520, 880, ease(seg(t, 0.2, 3.0))) + lerp(0, 120, ease(seg(t, d - 2.4, d - 0.8)))
    van(c, vx, 905, t, 1.0, moving=t < d - 0.8)
    c.restore()
    # route dots England / Scotland / Wales
    ra = ease(seg(t, 1.2, 2.0))
    if ra > 0:
        names = ["England", "Scotland", "Wales"]
        for i, n in enumerate(names):
            pa = ease(seg(t, 1.2 + i * 0.4, 1.8 + i * 0.4)) * (1 - seg(t, d - 1.6, d - 0.8))
            bx = (CUR_FOCUS[0] + (i - 1) * 232) if VERTICAL[0] else 640 + i * 320
            by = 300 if VERTICAL[0] else 140
            c.save()
            src(c, NAVY, 0.92 * pa)
            rrect(c, bx - 108, by - 44 + (1 - pa) * 20, 216, 66, 33)
            c.fill()
            draw_text(c, n, bx, by + (1 - pa) * 20, SERIF, 32, GOLD_LT, alpha=pa)
            c.restore()


def bedroom_bg(c, t, night=0.0, lamp=1.0):
    # wall
    day = (0.40, 0.48, 0.62)
    nite = (0.11, 0.16, 0.28)
    wc = tuple(lerp(day[i], nite[i], night) for i in range(3))
    c.set_source_rgb(*wc)
    c.rectangle(-1500, -1500, 4920, FLOOR_Y + 1500)
    c.fill()
    # subtle panel mouldings
    src(c, hx("FFFFFF", 0.06))
    c.set_line_width(3)
    for i in range(-3, 9):
        rrect(c, i * 300 + 40, 200, 220, 420, 6)
        c.stroke()
    # window
    wx, wy, ww, wh = 1430, 140, 300, 380
    g = cairo.LinearGradient(0, wy, 0, wy + wh)
    g.add_color_stop_rgba(0, lerp(0.55, 0.06, night), lerp(0.70, 0.10, night), lerp(0.88, 0.26, night), 1)
    g.add_color_stop_rgba(1, lerp(0.95, 0.20, night), lerp(0.86, 0.24, night), lerp(0.70, 0.42, night), 1)
    c.set_source(g)
    rrect(c, wx, wy, ww, wh, 140)
    c.fill()
    if night > 0.3:
        a = seg(night, 0.3, 1)
        src(c, hx("FFF6DE"), a)
        c.arc(wx + 200, wy + 110, 34, 0, 2 * math.pi)
        c.fill()
        c.set_source_rgba(lerp(0.06, 0.06, 1), 0.10, 0.26, a)
        c.arc(wx + 214, wy + 100, 30, 0, 2 * math.pi)
        c.fill()
        for i in range(14):
            tw = 0.5 + 0.5 * math.sin(t * 3 + i * 1.7)
            sparkle(c, wx + 30 + rnd(i, 31) * (ww - 60), wy + 40 + rnd(i, 32) * (wh * 0.6), 4 + 4 * tw, a * tw,
                    col=hx("FFF6DE"))
    src(c, CREAM)
    c.set_line_width(10)
    rrect(c, wx, wy, ww, wh, 140)
    c.stroke()
    c.move_to(wx + ww / 2, wy)
    c.line_to(wx + ww / 2, wy + wh)
    c.stroke()
    # curtains
    for side in (-1, 1):
        cx = wx - 40 if side < 0 else wx + ww + 10
        src(c, GOLD, 0.9)
        rrect(c, cx, wy - 40, 30, wh + 120, 12)
        c.fill()
    # floor
    src(c, hx("5E432F"))
    c.rectangle(-1500, FLOOR_Y, 4920, 1600)
    c.fill()
    src(c, hx("4E3626"))
    for i in range(14):
        c.rectangle(-1500, FLOOR_Y + 30 + i * 52, 4920, 3)
        c.fill()
    # rug
    src(c, hx("C9B79A"))
    c.save()
    c.translate(960, FLOOR_Y + 70)
    c.scale(1, 0.18)
    c.arc(0, 0, 640, 0, 2 * math.pi)
    c.restore()
    c.fill()


def bedside(c, x, t, lamp_on=1.0):
    wood_rect(c, x, 700, 150, 160, WOOD_DK, grain=False, r=8)
    src(c, GOLD)
    c.arc(x + 75, 760, 6, 0, 2 * math.pi)
    c.fill()
    # lamp
    if lamp_on > 0:
        glow(c, x + 75, 600, 330, hx("FFD98A"), 0.45 * lamp_on)
    src(c, GOLD)
    rrect(c, x + 66, 610, 18, 90, 6)
    c.fill()
    c.save()
    c.move_to(x + 30, 610)
    c.line_to(x + 50, 540)
    c.line_to(x + 100, 540)
    c.line_to(x + 120, 610)
    c.close_path()
    c.set_source_rgba(lerp(0.85, 1.0, lamp_on), lerp(0.80, 0.92, lamp_on), lerp(0.70, 0.70, lamp_on), 1)
    c.fill()
    c.restore()


def s9_assembly(c, t, d):
    bedroom_bg(c, t, night=0.0)
    p = ease(seg(t, 0.5, 3.4))
    m = ease_out_back(seg(t, 3.8, 4.8))
    # crew carrying pieces in
    x, y, w = 680, 650, 560
    hb_x = lerp(-900, 0, p)
    base_x = lerp(900, 0, p)
    person(c, "crew", 520 + hb_x * 0.6, FLOOR_Y + 10, 1.0, t, rh=(650 + hb_x * 0.6, 600), look=0.7, smile=0.8,
           apron=False)
    person(c, "young", 1400 + base_x * 0.6, FLOOR_Y + 10, 1.0, t, lh=(1290 + base_x * 0.6, 700), look=-0.7,
           smile=0.8, apron=False)
    # headboard
    c.save()
    c.translate(hb_x, 0)
    velvet_headboard(c, x - 20, y - 320, w + 40, 360, sheen_t=t * 0.1)
    c.restore()
    # base
    c.save()
    c.translate(base_x, 0)
    g = cairo.LinearGradient(0, y + 10, 0, y + 130)
    g.add_color_stop_rgba(0, VELVET_LT[0], VELVET_LT[1], VELVET_LT[2], 1)
    g.add_color_stop_rgba(1, VELVET[0], VELVET[1], VELVET[2], 1)
    c.set_source(g)
    rrect(c, x - 8, y + 10, w + 16, 120, 14)
    c.fill()
    src(c, GOLD, 0.85)
    c.set_line_width(3)
    rrect(c, x - 8, y + 10, w + 16, 120, 14)
    c.stroke()
    src(c, WOOD_DK)
    for fx in (x + 20, x + w - 50):
        rrect(c, fx, y + 130, 30, 24, 4)
        c.fill()
    c.restore()
    # joining sparkle + screwdriver turns
    j = seg(t, 3.2, 3.9)
    for jx in (x, x + w):
        sparkle(c, jx, y + 40, 26 * math.sin(j * math.pi), math.sin(j * math.pi))
    # mattress drops
    if t > 3.8:
        src(c, hx("FFFFFF"))
        rrect(c, x + 10, lerp(y - 400, y - 50, m), w - 20, 64, 16)
        c.fill()
        src(c, hx("D9D4CC"))
        c.rectangle(x + 20, lerp(y - 400, y - 50, m) + 40, w - 40, 3)
        c.fill()
    # crew thumbs up at end
    tu = ease(seg(t, 5.0, 5.6))
    if tu > 0:
        sparkle(c, 960, 360, 30 * tu, tu)


def s10_reveal(c, t, d):
    night = ease(seg(t, 0.0, 2.5))
    lamp = ease(seg(t, 1.6, 2.6))
    bedroom_bg(c, t, night=night)
    bedside(c, 420, t, lamp)
    bedside(c, 1350, t, lamp)
    bed_side(c, 640, 640, 640, 130, head_w=700, head_h=380, mattress=True, bedding=True, t=t)
    # plant
    src(c, hx("B07A45"))
    rrect(c, 230, 760, 90, 100, 10)
    c.fill()
    for i in range(7):
        a = -math.pi / 2 + (i - 3) * 0.32 + math.sin(t * 1.2 + i) * 0.03
        src(c, GREEN1 if i % 2 else GREEN2)
        c.save()
        c.translate(275, 760)
        c.rotate(a + math.pi / 2)
        c.scale(1, 3.4)
        c.arc(0, -26, 18, 0, 2 * math.pi)
        c.restore()
        c.fill()
    # warm vignette when night falls
    g = cairo.RadialGradient(960, 600, 300, 960, 600, 1300)
    g.add_color_stop_rgba(0, 0, 0, 0, 0)
    g.add_color_stop_rgba(1, 0.02, 0.04, 0.10, 0.55 * night)
    c.set_source(g)
    c.rectangle(-1500, -1500, 4920, 4000)
    c.fill()
    motes(c, t, 300, 1700, 100, 820, 30, alpha=0.5 * lamp)


def s11_end(c, t, d):
    g = cairo.LinearGradient(0, -400, 0, 1500)
    g.add_color_stop_rgba(0, *NAVY[:3], 1)
    g.add_color_stop_rgba(1, *NAVY_DEEP[:3], 1)
    c.set_source(g)
    c.rectangle(-1500, -1500, 4920, 4000)
    c.fill()
    glow(c, 960, 480, 700, GOLD, 0.10)
    a1 = ease(seg(t, 0.2, 1.0))
    a2 = ease(seg(t, 0.8, 1.6))
    a3 = ease(seg(t, 1.4, 2.2))
    lw = 460 * ease(seg(t, 0.4, 1.4))
    src(c, GOLD, 0.9)
    c.rectangle(960 - lw / 2, 412, lw, 2)
    c.fill()
    c.rectangle(960 - lw / 2, 640, lw, 2)
    c.fill()
    draw_text(c, "EAGLE BED", 960, 520 + (1 - a1) * 20, SERIF, 120, GOLD, alpha=a1, spacing=10)
    draw_text(c, "Handmade in Dewsbury", 960, 600 + (1 - a2) * 16, SERIF, 46, CREAM, alpha=a2,
              slant=cairo.FONT_SLANT_ITALIC)
    draw_text(c, "eaglebed.co.uk", 960, 730 + (1 - a3) * 12, SANS, 44, GOLD_LT, alpha=a3,
              weight=cairo.FONT_WEIGHT_BOLD)
    if VERTICAL[0]:
        for k, ln in enumerate(["Family-run  ·  Handmade to order", "Free delivery & assembly"]):
            draw_text(c, ln, 960, 810 + k * 50, SANS, 34, CREAM, alpha=a3 * 0.85)
    else:
        draw_text(c, "Family-run  ·  Handmade to order  ·  Free delivery & assembly", 960, 800, SANS, 26, CREAM,
                  alpha=a3 * 0.85)
    for i in range(18):
        tw = 0.5 + 0.5 * math.sin(t * 2 + i)
        sparkle(c, 200 + rnd(i, 41) * 1520, 120 + rnd(i, 42) * 840, 3 + 5 * tw, 0.5 * tw * a1)


# (draw, duration, focus_x for vertical, headline, subline)
SCENES = [
    (s1_sketch, 7.0, 1010, "Every bed starts with a sketch", "Handmade to order in our own Dewsbury workshop"),
    (s2_timber, 8.0, 1000, "Solid timber, cut and joined", "A strong frame, built by hand"),
    (s3_foam, 7.0, 1030, "Foam and padding, layer by layer", None),
    (s4_fabric, 7.5, 1010, "Choose your fabric", "Plush velvet · Chenille · Naples · Teddy bouclé"),
    (s5_buttons, 8.0, 1020, "Stitched and buttoned by hand", None),
    (s6_upholster, 7.0, 970, "Upholstered with care", None),
    (s7_check, 7.0, 1000, "Checked by our family team", None),
    (s8_van, 8.0, 1150, "Free delivery by our own team", "Across England, Scotland and Wales"),
    (s9_assembly, 7.0, 960, "We assemble it in your room", None),
    (s10_reveal, 10.0, 960, "Your dream bed, made for you",
     "Single to super king · 14-day free returns · 5-year frame warranty · Klarna & Clearpay"),
    (s11_end, 6.0, 960, None, None),
]


def timeline():
    starts, t0 = [], 0.0
    for i, sc in enumerate(SCENES):
        starts.append(t0)
        t0 += sc[1] - (XF if i < len(SCENES) - 1 else 0)
    total = starts[-1] + SCENES[-1][1]
    return starts, total


# ---------------------------------------------------------------- caption overlay
def caption(c, W, H, head, sub, t, d, vertical, scene_idx):
    if not head:
        return
    a = ease(seg(t, 0.35, 0.95)) * (1 - ease(seg(t, d - 0.7, d - 0.15)))
    if a <= 0:
        return
    rise = (1 - ease(seg(t, 0.35, 1.0))) * 18
    if vertical:
        hs, ss = 66, 34
        maxw = W - 120
        # top band gradient
        g = cairo.LinearGradient(0, 0, 0, 520)
        g.add_color_stop_rgba(0, NAVY_DEEP[0], NAVY_DEEP[1], NAVY_DEEP[2], 0.88 * a)
        g.add_color_stop_rgba(1, NAVY_DEEP[0], NAVY_DEEP[1], NAVY_DEEP[2], 0)
        c.set_source(g)
        c.rectangle(0, 0, W, 520)
        c.fill()
        lines = wrap_lines(c, head, SERIF, hs, maxw)
        y = 210 + rise
        for ln in lines:
            draw_text(c, ln, W / 2, y, SERIF, hs, CREAM, alpha=a)
            y += hs * 1.15
        src(c, GOLD, a)
        c.rectangle(W / 2 - 60, y - hs * 0.55, 120, 3)
        c.fill()
        if sub:
            parts = [p.strip() for p in sub.split("·")] if len(sub) > 40 else [sub]
            y += 30
            if True:
                # bottom band: subline / fact list
                g = cairo.LinearGradient(0, H - 620, 0, H)
                g.add_color_stop_rgba(0, NAVY_DEEP[0], NAVY_DEEP[1], NAVY_DEEP[2], 0)
                g.add_color_stop_rgba(1, NAVY_DEEP[0], NAVY_DEEP[1], NAVY_DEEP[2], 0.9 * a)
                c.set_source(g)
                c.rectangle(0, H - 620, W, 620)
                c.fill()
                yy = H - 260 - (len(parts) - 1) * 31
                for k, ptxt in enumerate(parts):
                    pa = a * ease(seg(t, 1.0 + k * 0.35, 1.5 + k * 0.35))
                    for kk, ln in enumerate(wrap_lines(c, ptxt, SANS, 40, maxw)):
                        draw_text(c, ln, W / 2, yy + k * 62 + kk * 50, SANS, 40, GOLD_LT, alpha=pa,
                                  weight=cairo.FONT_WEIGHT_BOLD)
    else:
        hs, ss = 64, 30
        g = cairo.LinearGradient(0, H - 330, 0, H)
        g.add_color_stop_rgba(0, NAVY_DEEP[0], NAVY_DEEP[1], NAVY_DEEP[2], 0)
        g.add_color_stop_rgba(1, NAVY_DEEP[0], NAVY_DEEP[1], NAVY_DEEP[2], 0.88 * a)
        c.set_source(g)
        c.rectangle(0, H - 330, W, 330)
        c.fill()
        y = H - (120 if sub else 90) + rise
        draw_text(c, head, W / 2, y, SERIF, hs, CREAM, alpha=a)
        if sub:
            src(c, GOLD, a)
            c.rectangle(W / 2 - 60, y + 22, 120, 3)
            c.fill()
            draw_text(c, sub, W / 2, y + 72, SANS, ss, GOLD_LT, alpha=a, weight=cairo.FONT_WEIGHT_BOLD)
    # small brand bug top-left (wordmark only)
    if scene_idx < len(SCENES) - 1 and not (scene_idx == 7 and not vertical):
        ba = 0.9
        if vertical:
            draw_text(c, "EAGLE BED", W / 2, 90, SERIF, 30, GOLD, alpha=ba, spacing=4)
        else:
            draw_text(c, "EAGLE BED", 60, 70, SERIF, 30, GOLD, align="left", alpha=ba, spacing=4)


# ---------------------------------------------------------------- render
def render_scene(c, idx, t, W, H, vertical):
    fn, d, fx, head, sub = SCENES[idx]
    c.save()
    zoom = 1.0 + 0.045 * ease(t / d)
    if vertical:
        s = 1.3 * zoom
        fy = 560
        if idx == 7:  # follow the van
            vc = lerp(-520, 880, ease(seg(t, 0.2, 3.0))) + lerp(0, 120, ease(seg(t, d - 2.4, d - 0.8))) + 200
            fx = max(760, vc)
        if idx == len(SCENES) - 1:
            s, fx, fy = 1.0 * zoom, 960, 560
        CUR_FOCUS[0] = fx
        c.translate(W / 2, H / 2)
        c.scale(s, s)
        c.translate(-fx, -fy)
    else:
        s = (W / 1920) * zoom
        c.translate(W / 2, H / 2)
        c.scale(s, s)
        c.translate(-960, -540)
    fn(c, t, d)
    c.restore()
    caption(c, W, H, head, sub, t, d, vertical, idx)


def render_frame(c, T, W, H, vertical, starts, total):
    c.set_source_rgba(*NAVY_DEEP)
    c.paint()
    active = []
    for i, st in enumerate(starts):
        d = SCENES[i][1]
        if st <= T < st + d:
            active.append((i, T - st))
    for k, (i, lt) in enumerate(active):
        if k == 0:
            render_scene(c, i, lt, W, H, vertical)
        else:
            a = ease(lt / XF)
            c.push_group()
            render_scene(c, i, lt, W, H, vertical)
            c.pop_group_to_source()
            c.paint_with_alpha(a)
    # fade in / out
    fa = 1 - ease(T / 0.6)
    fo = ease((T - (total - 0.8)) / 0.8)
    f = max(fa, fo)
    if f > 0:
        c.set_source_rgba(0, 0, 0, f)
        c.paint()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--format", choices=["16x9", "9x16"], default="16x9")
    ap.add_argument("--out")
    ap.add_argument("--stills")
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--dur", type=float, default=None)
    ap.add_argument("--scene", type=int, default=None, help="render only scene N's segment (0-based)")
    ap.add_argument("--info", action="store_true")
    args = ap.parse_args()
    vertical = args.format == "9x16"
    VERTICAL[0] = vertical
    W, H = (1080, 1920) if vertical else (1920, 1080)
    starts, total = timeline()
    if args.info:
        print(len(SCENES), round(total, 2))
        return
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
    c = cairo.Context(surf)
    if args.stills:
        os.makedirs(args.stills, exist_ok=True)
        for i, st in enumerate(starts):
            d = SCENES[i][1]
            T = st + d * 0.72
            render_frame(c, T, W, H, vertical, starts, total)
            name = "%02d_%s_%s.png" % (i + 1, SCENES[i][0].__name__.split("_", 1)[1], args.format)
            surf.write_to_png(os.path.join(args.stills, name))
            print("wrote", name)
        return
    if args.scene is not None:
        bounds = [round(st * FPS) for st in starts] + [round(total * FPS)]
        n0, n1 = bounds[args.scene], bounds[args.scene + 1]
    else:
        t_end = total if args.dur is None else min(total, args.start + args.dur)
        n0, n1 = int(args.start * FPS), int(t_end * FPS)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", "%dx%d" % (W, H),
           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "19",
           "-pix_fmt", "yuv420p", "-movflags", "+faststart", args.out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for n in range(n0, n1):
        render_frame(c, n / FPS, W, H, vertical, starts, total)
        surf.flush()
        p.stdin.write(bytes(surf.get_data()))
        if n % 150 == 0:
            print("frame %d/%d" % (n, n1), file=sys.stderr, flush=True)
    p.stdin.close()
    p.wait()
    print("total duration %.2fs" % total)


if __name__ == "__main__":
    main()
