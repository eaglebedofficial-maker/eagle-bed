#!/usr/bin/env python3
"""Eagle Bed cinematic video maker (twice-daily autopilot).

Makes one professional, cinematic 4K (2160x3840, 9:16) video of a real Eagle Bed product:
  1. picks the next product that has not been featured recently (tools/cinema/history.json),
  2. sends 1-2 of its real website photos to Google Gemini 3 Pro Image and asks for 4K
     cinematic scenes of that exact bed (shape, headboard, fabric and colour kept identical),
  3. turns the scenes into a 4K video with slow camera moves, cross-fades, on-screen text,
     an end card with the shop link and a follow/like call to action, and original
     royalty-free music (tools/cinema/music, made for Eagle Bed),
  4. writes the captions for YouTube Shorts, TikTok, Instagram and Facebook with the
     product link (UTM tagged).

Usage:  python3 tools/cinema/autovideo.py [--handle HANDLE] [--slot 09:00|18:00] [--out DIR]
Needs:  GEMINI_API_KEY in the environment, ffmpeg, Pillow. Network: www.eaglebed.co.uk,
        cdn.shopify.com, generativelanguage.googleapis.com.
When OpenHiggsfield gets a platform key (or the Gemini key gets Veo), the scene step can be
swapped for real AI motion; everything else stays the same.
"""
import argparse, base64, datetime, json, os, random, subprocess, sys, time, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = "https://www.eaglebed.co.uk"
W, H = 2160, 3840
FPS = 30
SCENE_S = 5.0
FADE_S = 0.6
END_S = 3.6
BRAND = (127, 40, 91)
BRAND_DARK = (58, 14, 40)
GOLD = (230, 185, 92)
CREAM = (255, 246, 234)
SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SANS_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
IMAGE_MODEL = os.environ.get("EB_IMAGE_MODEL", "gemini-3-pro-image")
FACTS = ["Handmade in Dewsbury", "Free delivery across Great Britain", "14-day free returns",
         "5-year frame warranty", "Klarna & Clearpay available", "Free fabric swatches"]


def log(*a):
    print("[autovideo]", *a, file=sys.stderr, flush=True)


def http_get(url, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": "EagleBedHQ/1.0 (+https://www.eaglebed.co.uk)"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def load_history():
    p = os.path.join(HERE, "history.json")
    try:
        return json.load(open(p))
    except Exception:
        return {"videos": []}


def save_history(h):
    json.dump(h, open(os.path.join(HERE, "history.json"), "w"), indent=1)


def pick_product(handle=None, exclude=()):
    data = json.loads(http_get(SITE + "/products.json?limit=250"))["products"]
    good = [p for p in data if p.get("images") and p.get("product_type") in
            ("Bed Frame", "Ottoman Bed", "Divan Bed", "Kids Bed", "Mattress", "Headboard")]
    if handle:
        for p in data:
            if p["handle"] == handle:
                return p
        raise SystemExit("No published product with handle " + handle)
    good = [p for p in good if p["handle"] not in set(exclude)] or good
    used = {}
    for v in load_history()["videos"]:
        used[v["handle"]] = max(used.get(v["handle"], ""), v["date"])
    # never featured first, then the longest ago; beds weighted ahead of headboards
    def key(p):
        return (used.get(p["handle"], ""), 0 if p["product_type"] != "Headboard" else 1, random.random())
    good.sort(key=key)
    return good[0]


def scene_prompts(p):
    t = p["product_type"]
    keep = ("Keep the bed EXACTLY as in the reference photo: same shape and proportions, same headboard design "
            "(panels, buttons, channels, wings), same fabric texture and colour, same base and feet. Do not add or "
            "remove any feature. Photorealistic interiors-magazine photograph, vertical 9:16 composition, the WHOLE bed "
            "fully visible and centred (nothing cut off at the edges), filling the lower two thirds of the frame, "
            "calm empty space at the top for text. No text, no logos, no watermarks, "
            "no people.")
    if t == "Mattress":
        return [
            "Place this exact mattress on a simple upholstered bed in a bright, airy UK bedroom with soft morning light "
            "through linen curtains, crisp white bedding folded back to show the mattress. " + keep.replace("bed", "mattress"),
            "Macro close-up of this exact mattress's quilted top and side panel, soft raking side light showing the "
            "texture and stitching, shallow depth of field. " + keep.replace("bed", "mattress"),
            "This exact mattress in a cosy evening bedroom, warm bedside lamps, deep blue dusk outside the window, "
            "made with neutral bedding. " + keep.replace("bed", "mattress"),
        ]
    if t == "Headboard":
        return [
            "Mount this exact headboard behind a made double bed in an elegant UK master bedroom, golden-hour window "
            "light, styled with neutral linen and two cushions. " + keep.replace("the bed", "the headboard"),
            "Close-up of this exact headboard's fabric, stitching and detailing, soft side light, shallow depth of "
            "field. " + keep.replace("the bed", "the headboard"),
            "This exact headboard in a cosy evening bedroom with warm bedside lamps and a soft throw. "
            + keep.replace("the bed", "the headboard"),
        ]
    extra = " The ottoman base is closed." if t == "Ottoman Bed" else ""
    return [
        "Photograph this exact bed in a beautifully styled, elegant UK master bedroom with large windows, golden-hour "
        "sunlight streaming across the bedding, neutral linen, a bench at the foot, a cinematic 35mm look with "
        "shallow depth of field." + extra + " " + keep,
        "Close-up detail of this exact bed's headboard: the fabric texture, stitching and detailing, soft raking "
        "side light, macro lens, shallow depth of field. " + keep,
        "This exact bed in a calm, cosy evening bedroom: warm bedside lamps, deep blue dusk outside the window, "
        "soft throw and cushions, a quiet luxurious mood." + extra + " " + keep,
    ]


def small_jpeg(b, max_side=1400):
    """Reference photos go up as ~300 KB JPEGs: large PNG uploads fail through the network proxy."""
    try:
        from PIL import Image
        import io
        im = Image.open(io.BytesIO(b))
        if im.mode in ("RGBA", "LA", "P"):
            im = im.convert("RGBA")
            bg = Image.new("RGB", im.size, (255, 255, 255))
            bg.paste(im, mask=im.split()[-1])
            im = bg
        else:
            im = im.convert("RGB")
        im.thumbnail((max_side, max_side))
        out = io.BytesIO()
        im.save(out, "JPEG", quality=88)
        return out.getvalue()
    except Exception:
        return b


def gemini_image(ref_bytes_list, prompt, out_path, tries=3):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise SystemExit("GEMINI_API_KEY is not set")
    parts = []
    ref_bytes_list = [small_jpeg(b) for b in ref_bytes_list]
    for b in ref_bytes_list:
        mime = "image/png" if b[:4] == b"\x89PNG" else ("image/webp" if b[8:12] == b"WEBP" else "image/jpeg")
        parts.append({"inline_data": {"mime_type": mime, "data": base64.b64encode(b).decode()}})
    parts.append({"text": prompt})
    body = {"contents": [{"role": "user", "parts": parts}],
            "generationConfig": {"responseModalities": ["IMAGE"],
                                 "imageConfig": {"aspectRatio": "9:16", "imageSize": "4K"}}}
    url = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent" % IMAGE_MODEL
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode(), method="POST",
                                         headers={"Content-Type": "application/json", "x-goog-api-key": key})
            with urllib.request.urlopen(req, timeout=300) as r:
                d = json.loads(r.read())
            for c in d.get("candidates", []):
                for pt in c.get("content", {}).get("parts", []):
                    inl = pt.get("inline_data") or pt.get("inlineData")
                    if inl and inl.get("data"):
                        open(out_path, "wb").write(base64.b64decode(inl["data"]))
                        return out_path
            last = "no image in response: " + json.dumps(d)[:400]
        except urllib.error.HTTPError as e:
            last = "HTTP %s %s" % (e.code, e.read()[:400])
        except Exception as e:  # network hiccup
            last = repr(e)
        log("image attempt", i + 1, "failed:", last)
        time.sleep(4 * (i + 1))
    raise RuntimeError(last)


def text_layer(path, lines, y_center, box=True, align="center"):
    """Transparent 4K PNG with lines [(text, font, size, colour)]."""
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    fonts = [(ImageFont.truetype(f, s), t, c) for t, f, s, c in lines]
    sizes = [d.textbbox((0, 0), t, font=f) for f, t, c in fonts]
    heights = [b[3] - b[1] for b in sizes]
    gap = 34
    total = sum(heights) + gap * (len(lines) - 1)
    width = max(b[2] - b[0] for b in sizes)
    top = int(y_center - total / 2)
    if box:
        pad_x, pad_y = 90, 70
        shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        x0 = (W - width) / 2 - pad_x
        sd.rounded_rectangle([x0, top - pad_y, x0 + width + 2 * pad_x, top + total + pad_y], radius=60,
                             fill=(20, 4, 14, 150))
        img = Image.alpha_composite(img, shadow.filter(ImageFilter.GaussianBlur(2)))
        d = ImageDraw.Draw(img)
    y = top
    for (f, t, c), b, hgt in zip(fonts, sizes, heights):
        w = b[2] - b[0]
        x = (W - w) / 2 - b[0]
        d.text((x + 4, y - b[1] + 5), t, font=f, fill=(0, 0, 0, 120))
        d.text((x, y - b[1]), t, font=f, fill=c)
        y += hgt + gap
    img.save(path)


def wrap(text, font_path, size, max_w):
    from PIL import ImageFont, Image, ImageDraw
    f = ImageFont.truetype(font_path, size)
    d = ImageDraw.Draw(Image.new("RGB", (10, 10)))
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) > max_w and cur:
            lines.append(cur)
            cur = w
        else:
            cur = t
    if cur:
        lines.append(cur)
    return lines[:3]


def end_card(path, product_img_path, title):
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    bg = Image.new("RGB", (W, H))
    px = bg.load()
    for y in range(H):
        k = y / H
        c = tuple(int(BRAND[i] * (1 - k) + BRAND_DARK[i] * k) for i in range(3))
        for x in range(0, W):
            px[x, y] = c
    try:
        im = Image.open(product_img_path).convert("RGB")
        im.thumbnail((1600, 1500))
        mask = Image.new("L", im.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.size[0], im.size[1]], radius=70, fill=255)
        sh = Image.new("RGBA", (im.size[0] + 160, im.size[1] + 160), (0, 0, 0, 0))
        ImageDraw.Draw(sh).rounded_rectangle([80, 100, im.size[0] + 80, im.size[1] + 100], radius=70, fill=(0, 0, 0, 140))
        sh = sh.filter(ImageFilter.GaussianBlur(40))
        x = (W - im.size[0]) // 2
        bg.paste(sh, (x - 80, 520 - 80), sh)
        bg.paste(im, (x, 520), mask)
    except Exception as e:
        log("end card image skipped:", e)
    d = ImageDraw.Draw(bg)

    def ctext(y, t, font, size, col):
        f = ImageFont.truetype(font, size)
        b = d.textbbox((0, 0), t, font=f)
        d.text(((W - (b[2] - b[0])) / 2 - b[0], y), t, font=f, fill=col)

    ctext(2180, "EAGLE BED", SERIF, 230, CREAM)
    for i, line in enumerate(wrap(title, SANS, 92, 1800)[:2]):
        ctext(2500 + i * 120, line, SANS, 92, CREAM)
    pill = [380, 2830, W - 380, 3080]
    d.rounded_rectangle(pill, radius=125, fill=GOLD)
    ctext(2885, "eaglebed.co.uk", SANS, 110, BRAND_DARK)
    ctext(3200, "Tap the link to shop · Free GB delivery", SANS_REG, 68, CREAM)
    ctext(3330, "Like & follow for a new bed every day", SANS, 76, GOLD)
    bg.save(path, quality=95)


def run(cmd):
    log(" ".join(cmd[:6]), "…")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr[-2000:])


def make_video(scenes, overlays, end_png, music, out_mp4):
    """scenes: 3 stills; overlays: 3 transparent PNGs; returns path."""
    n = len(scenes)
    inputs, filters = [], []
    frames = int(SCENE_S * FPS)
    moves = [
        # slow push-in, slow pull-out, slow pan; images are pre-scaled 1.15x so pans never show edges
        "zoompan=z='min(1.0+0.0005*on,1.07)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'",
        "zoompan=z='max(1.07-0.0005*on,1.0)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'",
        "zoompan=z='1.05':x='(iw-iw/zoom)*on/%d':y='ih/2-(ih/zoom/2)'" % frames,
    ]
    for i, s in enumerate(scenes):
        inputs += ["-loop", "1", "-t", str(SCENE_S), "-i", s]
    for o in overlays:
        inputs += ["-loop", "1", "-t", str(SCENE_S), "-i", o]
    inputs += ["-loop", "1", "-t", str(END_S), "-i", end_png, "-i", music]
    for i in range(n):
        filters.append(
            "[%d:v]scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d,%s:d=%d:s=%dx%d:fps=%d,setsar=1,format=yuv420p[s%d]"
            % (i, int(W * 1.04), int(H * 1.04), int(W * 1.04), int(H * 1.04), moves[i % 3], frames, W, H, FPS, i))
        filters.append("[%d:v]format=rgba,fade=t=in:st=0.5:d=0.6:alpha=1[t%d]" % (n + i, i))
        filters.append("[s%d][t%d]overlay=0:0:format=auto,format=yuv420p[v%d]" % (i, i, i))
    filters.append("[%d:v]scale=%d:%d,setsar=1,fps=%d,format=yuv420p[ve]" % (2 * n, W, H, FPS))
    cur, t = "v0", SCENE_S
    for i in range(1, n):
        filters.append("[%s][v%d]xfade=transition=fade:duration=%s:offset=%s[x%d]" % (cur, i, FADE_S, t - FADE_S, i))
        cur, t = "x%d" % i, t + SCENE_S - FADE_S
    filters.append("[%s][ve]xfade=transition=fadeblack:duration=%s:offset=%s[vout]" % (cur, FADE_S, t - FADE_S))
    total = t + END_S - FADE_S
    filters.append("[%d:a]atrim=0:%s,afade=t=in:d=0.8,afade=t=out:st=%s:d=1.6,volume=0.9[aout]"
                   % (2 * n + 1, total, total - 1.6))
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error"] + inputs + [
        "-filter_complex", ";".join(filters), "-map", "[vout]", "-map", "[aout]",
        "-c:v", "libx264", "-preset", "medium", "-profile:v", "high", "-level", "5.1",
        "-b:v", "6M", "-maxrate", "8M", "-bufsize", "12M", "-pix_fmt", "yuv420p", "-r", str(FPS),
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", "%.2f" % total, out_mp4]
    run(cmd)
    return total


def utm(url, source, campaign):
    sep = "&" if "?" in url else "?"
    return url + sep + "utm_source=%s&utm_medium=social&utm_campaign=%s" % (source, campaign)


def short_name(title):
    """'Fluted Velvet Bed – Vertical Fluted Upholstered Bed Frame' -> 'Fluted Velvet Bed'."""
    for sep in (" – ", " - ", " | ", ": "):
        if sep in title:
            return title.split(sep)[0].strip()
    return title


# Video SEO per bed type (ops/seo-types/video.md): search keyword, 3 type hashtags, collection page.
SEO_TYPES = {
    "teddy": ("Teddy Bouclé Bed", ["#teddybed", "#bouclebed", "#ottomanbed"], "ottoman-beds"),
    "kids": ("Kids Bed", ["#kidsbed", "#kidsbedroom", "#upholsteredbed"], "kids-beds"),
    "mattress": ("Mattress", ["#mattress", "#mattressuk", "#newmattress"], "mattresses"),
    "headboard": ("Upholstered Headboard", ["#headboard", "#upholsteredheadboard", "#bedroomdecor"], "headboards"),
    "gaslift": ("Gas Lift Ottoman Bed", ["#gasliftbed", "#ottomanbed", "#storagebed"], "ottoman-beds"),
    "ottoman": ("Ottoman Bed", ["#ottomanbed", "#storagebed", "#gasliftbed"], "ottoman-beds"),
    "divan": ("Upholstered Divan Bed", ["#divanbed", "#storagebed", "#upholsteredbed"], "divan-beds"),
    "chesterfield": ("Chesterfield Bed", ["#chesterfieldbed", "#chesterfield", "#upholsteredbed"], "chesterfield-beds"),
    "wingback": ("Wingback Bed", ["#wingbackbed", "#upholsteredbed", "#bedframe"], "wingback-beds"),
    "velvet": ("Velvet Bed", ["#velvetbed", "#velvetbedframe", "#upholsteredbed"], "upholstered-beds"),
    "upholstered": ("Upholstered Bed Frame", ["#upholsteredbed", "#bedframe", "#bedroomdecor"], "upholstered-beds"),
}


def seo_type(p):
    t, name = p["product_type"], p["title"].lower()
    if "teddy" in name or "bouc" in name:
        return "teddy"
    simple = {"Kids Bed": "kids", "Mattress": "mattress", "Headboard": "headboard", "Divan Bed": "divan"}
    if t in simple:
        return simple[t]
    if t == "Ottoman Bed":
        s = short_name(p["title"]).lower()
        return "gaslift" if s.endswith("base") or "gas lift" in s else "ottoman"
    for k in ("chesterfield", "wingback", "velvet"):
        if k in name:
            return k
    return "upholstered"


def with_keyword(name, kw):
    """Add the keyword only when its words are not already in the name."""
    return name if all(w in name.lower() for w in kw.lower().split()) else name + " – " + kw


def captions(p, slot):
    url = SITE + "/products/" + p["handle"]
    price = min(float(v["price"]) for v in p["variants"])
    title = p["title"]
    kind = seo_type(p)
    kw, ktags, coll = SEO_TYPES[kind]
    mattress = p["product_type"] == "Mattress"
    made = "Made in the UK" if mattress else "Handmade in Dewsbury"
    tags = "#eaglebed " + ("#madeinuk " if mattress else "#handmadeinbritain ") + ktags[0] + " #bedroominspo #bedroomdecor #ukhome" + ("" if mattress else " #dewsbury")
    yt_tags = " ".join(["#shorts"] + ktags + ["#eaglebed"])
    tt_tags = " ".join(ktags + ["#eaglebed", "#madeinuk" if mattress else "#handmadeinuk"])
    camp = "hq_cinema_" + slot.replace(":", "")
    pr = ("%.2f" % price).rstrip("0").rstrip(".")
    if mattress:
        body = ("%s, made in the UK. From £%s with free delivery across Great Britain, "
                "14-day free returns and a 5-year guarantee." % (title, pr))
    else:
        body = ("%s, handmade to order in our Dewsbury workshop. From £%s with free delivery across Great Britain, "
                "14-day free returns and a 5-year frame warranty." % (title, pr))
    cta = "Like and follow for a new bed every day, and tell us which %s you'd choose in the comments." % ("size" if mattress else "colour")
    head = with_keyword(short_name(title), kw)
    yt_title = next((t for t in (head + " | " + made, head + " | Eagle Bed", head) if len(t) <= 70), head[:70].rstrip())
    lead = "" if all(w in title.lower() for w in kw.lower().split()) else kw + ": "
    more = "More %s: %s" % (coll.replace("-", " "), utm(SITE + "/collections/" + coll, "youtube", camp) + "&utm_content=" + kind)
    return {
        "product": title, "handle": p["handle"], "url": url, "priceFrom": price,
        "seoType": kind, "seoKeyword": kw, "hashtags": ktags,
        "youtubeTitle": yt_title,
        "youtube": lead + body + "\n\nShop: " + utm(url, "youtube", camp) + "&utm_content=" + kind + "\n" + more + "\n\n" + cta + "\n\n" + yt_tags,
        "tiktok": lead + body + " Link in bio. " + cta + " " + tt_tags,
        "instagram": body + "\n\nTap the link in our bio to shop, or search '" + title + "' on eaglebed.co.uk.\n\n" + cta + "\n\n" + tags,
        "facebook": body + "\n\nShop now: " + utm(url, "facebook", camp) + "\n\n" + cta,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--handle")
    ap.add_argument("--slot", default="18:00")
    ap.add_argument("--out", default=os.path.join(HERE, "out"))
    ap.add_argument("--music", choices=["luxury", "calm", "upbeat"])
    ap.add_argument("--exclude", default="", help="comma-separated handles featured recently (from HQ videos)")
    ap.add_argument("--reuse", help="folder of an earlier run: reuse its scene PNGs (no new AI images)")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    p = pick_product(a.handle, [h.strip() for h in a.exclude.split(",") if h.strip()])
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d-%H%M")
    base = a.reuse.rstrip("/") if a.reuse else os.path.join(a.out, stamp + "-" + p["handle"][:50])
    os.makedirs(base, exist_ok=True)
    log("product:", p["title"], p["product_type"])
    refs = []
    for im in p["images"][:3]:
        try:
            refs.append(http_get(im["src"].split("?")[0] + "?width=1600"))
        except Exception as e:
            log("photo skipped", e)
    if not refs:
        raise SystemExit("No product photos could be downloaded")
    scenes = []
    for i, pr in enumerate(scene_prompts(p)):
        sp = os.path.join(base, "scene%d.png" % (i + 1))
        if a.reuse and os.path.exists(sp):
            scenes.append(sp)
            continue
        scenes.append(gemini_image(refs, pr, sp))  # every scene sees up to 3 real website photos of this product
    price = min(float(v["price"]) for v in p["variants"])
    name = short_name(p["title"])
    t_lines = wrap(name, SERIF, 170, 1850)
    overlays = []
    o1 = os.path.join(base, "t1.png")
    mattress = p["product_type"] == "Mattress"  # mattresses are made in the UK, with a 5-year guarantee
    text_layer(o1, [(l, SERIF, 170, CREAM) for l in t_lines] + [("MADE IN THE UK" if mattress else "HANDMADE IN DEWSBURY", SANS, 64, GOLD)], 3150)
    o2 = os.path.join(base, "t2.png")
    text_layer(o2, [("From £%s" % (("%.2f" % price).rstrip("0").rstrip(".")), SERIF, 170, CREAM),
                    ("Free delivery across Great Britain", SANS, 66, GOLD)], 3150)
    o3 = os.path.join(base, "t3.png")
    fx = random.sample(["14-day free returns", "5-year guarantee", "Klarna & Clearpay available"] if mattress else FACTS[2:], 2)
    text_layer(o3, [(fx[0], SANS, 84, CREAM), (fx[1], SANS, 84, CREAM)], 3150)
    overlays = [o1, o2, o3]
    endp = os.path.join(base, "end.jpg")
    end_card(endp, scenes[0], name)
    music = a.music or random.choice(["luxury", "calm", "upbeat"])
    mp4 = base + ".mp4"
    secs = make_video(scenes, overlays, endp, os.path.join(HERE, "music", music + ".mp3"), mp4)
    cap = captions(p, a.slot)
    cap.update({"video": mp4, "seconds": round(secs, 1), "music": music + " (Eagle Bed original, royalty-free)",
                "size": "2160x3840 (4K, 9:16)", "bytes": os.path.getsize(mp4), "slot": a.slot,
                "scenes": scenes, "model": IMAGE_MODEL, "made": stamp})
    json.dump(cap, open(base + ".json", "w"), indent=1)
    h = load_history()
    h["videos"] = [v for v in h["videos"] if not (a.reuse and v.get("file") == os.path.basename(mp4))]
    h["videos"].append({"date": datetime.date.today().isoformat(), "slot": a.slot, "handle": p["handle"],
                        "title": p["title"], "file": os.path.basename(mp4)})
    h["videos"] = h["videos"][-400:]
    save_history(h)
    print(json.dumps({"video": mp4, "captions": base + ".json", "product": p["title"], "seconds": round(secs, 1),
                      "mb": round(os.path.getsize(mp4) / 1e6, 1)}))


if __name__ == "__main__":
    main()
