"""Listing analysis rules (deterministic) and review theme extraction."""
from __future__ import annotations

import re
from collections import Counter

from .keywords import tokens

PROHIBITED = ["best seller", "#1", "number one", "100% guaranteed", "free shipping", "cheapest", "sale", "discount", "limited time", "eco-friendly", "antibacterial",
              "anti-bacterial", "non-toxic", "covid", "fda approved", "cure", "guarantee"]


def analyse(*, title: str, bullets: list[str], description: str, backend: str = "", keywords: list[str] | None = None, images: int | None = None,
            has_aplus: bool | None = None, has_video: bool | None = None, rating: float | None = None, reviews: int | None = None, competitor_titles: list[str] | None = None) -> dict:
    keywords = [k.lower().strip() for k in (keywords or []) if k.strip()]
    bullets = [b for b in bullets if b and b.strip()]
    text_front = f"{title} {' '.join(bullets)} {description}".lower()
    text_all = f"{text_front} {backend}".lower()
    comp: dict[str, dict] = {}
    issues: list[dict] = []

    def part(key, label, score, mx, note=""):
        comp[key] = {"label": label, "score": round(score), "max": mx, "note": note}

    def issue(sev, title_, detail, field=""):
        issues.append({"severity": sev, "title": title_, "detail": detail, "field": field})

    tl = len(title)
    ts = 0 if tl == 0 else 8 if tl < 60 else 14 if tl < 100 else 20 if tl <= 200 else 12
    part("title", "Title", ts, 20, f"{tl} characters")
    if tl == 0:
        issue("high", "Missing title", "The title is the strongest ranking and click-through factor.", "title")
    elif tl < 100:
        issue("medium", "Short title", f"{tl} characters. Most categories allow up to 200; use 120–200 with the main keyword first.", "title")
    elif tl > 200:
        issue("high", "Title over 200 characters", "Amazon can suppress listings with titles over the category limit.", "title")
    if title and title.isupper():
        issue("medium", "Title in capitals", "Amazon style guides ask for title case, not all capitals.", "title")
    if re.search(r"[!$?{}^~#<>*]", title):
        issue("medium", "Special characters in title", "Characters such as ! $ ? { } ^ ~ # < > * aren't allowed in titles.", "title")

    good = [b for b in bullets if 120 <= len(b) <= 500]
    bs = min(len(bullets), 5) / 5 * 12 + min(len(good), 5) / 5 * 8
    part("bullets", "Bullet points", bs, 20, f"{len(bullets)} bullets, {len(good)} of good length")
    if len(bullets) < 5:
        issue("high" if len(bullets) < 3 else "medium", f"Only {len(bullets)} bullet points", "Use all five: lead each with the benefit, then the proof.", "bullets")
    for i, b in enumerate(bullets):
        if len(b) < 80:
            issue("low", f"Bullet {i + 1} is thin", f"{len(b)} characters. Add the detail buyers ask about (sizes, materials, care, what's included).", "bullets")

    dl = len(description)
    ds = 10 if dl >= 1000 or has_aplus else 7 if dl >= 400 else 3 if dl > 0 else 0
    part("description", "Description / A+", ds, 10, "A+ content present" if has_aplus else f"{dl} characters")
    if not has_aplus and dl < 400:
        issue("medium", "Thin description", "Expand the description, or add A+ content if brand-registered.", "description")

    if images is not None:
        part("images", "Images", 15 if images >= 7 else 11 if images >= 6 else 6 if images >= 4 else 2, 15, f"{images} images")
        if images < 7:
            issue("medium" if images >= 4 else "high", f"{images} images", "Use 7 or more: white-background main image, lifestyle, infographic, size chart, close-ups.", "images")
    if has_video is not None:
        part("video", "Video", 5 if has_video else 0, 5)
        if not has_video:
            issue("low", "No video", "Product videos typically lift conversion.", "video")

    if keywords:
        used = [k for k in keywords if k in text_all]
        front = [k for k in keywords if k in text_front]
        in_title = [k for k in keywords if k in title.lower()]
        missing = [k for k in keywords if k not in text_all]
        part("keywords", "Keyword coverage", len(used) / len(keywords) * 20, 20, f"{len(used)} of {len(keywords)} target keywords used ({len(in_title)} in the title)")
        if missing:
            issue("high" if len(missing) > len(keywords) / 2 else "medium", f"{len(missing)} target keywords missing", ", ".join(missing[:12]) + ("…" if len(missing) > 12 else ""), "keywords")
        if keywords and keywords[0] not in title.lower():
            issue("medium", "Main keyword not in title", f"Put “{keywords[0]}” near the start of the title.", "title")
    else:
        used, front, missing = [], [], []

    if backend:
        b = len(backend.encode("utf-8"))
        if b > 249:
            issue("high", "Backend search terms over 249 bytes", f"{b} bytes. Amazon ignores search terms beyond the limit.", "backend")
        dup = [w for w in set(tokens(backend)) if w in set(tokens(title))]
        if dup:
            issue("low", "Backend repeats title words", "Words already in the title waste backend space: " + ", ".join(sorted(dup)[:10]), "backend")

    flagged = [w for w in PROHIBITED + ["best", "top rated", "bestseller"] if re.search(r"(?<![a-z])" + re.escape(w) + r"(?![a-z])", text_all)]
    if flagged:
        issue("high", "Restricted claims or promotional words", "Remove: " + ", ".join(flagged), "compliance")
    if rating is not None:
        part("reviews", "Rating & reviews", (10 if rating >= 4.5 else 7 if rating >= 4.2 else 4 if rating >= 3.8 else 1), 10, f"{rating}★ · {reviews or 0} ratings")
        if rating < 4.2:
            issue("high", f"Rating {rating}★", "Below 4.2★ hurts conversion. Fix the top complaints (Review Intelligence).", "reviews")

    # keyword gaps vs competitors
    gaps = []
    if competitor_titles:
        cw = Counter(w for t in competitor_titles for w in set(tokens(t)))
        own = set(tokens(text_all))
        gaps = [{"word": w, "competitors": c} for w, c in cw.most_common(60) if w not in own and c >= max(2, len(competitor_titles) // 3)][:25]
        if gaps:
            issue("medium", f"{len(gaps)} words competitors use that you don't", ", ".join(g["word"] for g in gaps[:12]), "keywords")

    total = sum(c["score"] for c in comp.values())
    mx = sum(c["max"] for c in comp.values())
    score = round(total / mx * 100) if mx else 0
    order = {"high": 0, "medium": 1, "low": 2}
    return {"score": score, "components": comp, "issues": sorted(issues, key=lambda i: order[i["severity"]]), "keyword_usage": {"used": used, "front": front, "missing": missing},
            "competitor_gaps": gaps, "stats": {"title_chars": tl, "bullets": len(bullets), "description_chars": dl, "backend_bytes": len((backend or "").encode("utf-8"))},
            "classification": "estimated", "method": "Kestrel listing rules (Amazon style guide limits + keyword coverage)"}


NEG = ["broke", "broken", "cheap", "flimsy", "return", "refund", "poor", "disappoint", "waste", "stopped working", "faulty", "defective", "smell", "thin", "weak",
       "uncomfortable", "difficult", "hard to", "tore", "ripped", "leak", "rust", "wobbl", "squeak", "creak", "noisy", "missing", "damaged", "terrible", "awful",
       "worst", "useless", "sagging", "sag", "lumpy", "too small", "too big", "doesn't fit", "not as described", "instructions", "screws", "assembly", "late",
       "scratch", "stain", "peel", "crack", "collapsed", "hurt", "hot", "packaging", "box was"]
POS = ["love", "great", "excellent", "perfect", "comfortable", "comfy", "sturdy", "easy", "beautiful", "soft", "quality", "amazing", "recommend", "happy", "worth",
       "solid", "durable", "gorgeous", "brilliant", "fantastic", "spacious", "quick", "value", "stylish", "supportive", "well made", "quiet"]
THEMES = {
    "Quality & durability": ["broke", "broken", "flimsy", "cheap", "durable", "sturdy", "solid", "well made", "quality", "crack", "collapsed", "wobbl"],
    "Assembly & instructions": ["assembly", "assemble", "instructions", "screws", "missing", "parts", "easy to put", "build"],
    "Size & fit": ["too small", "too big", "fit", "size", "dimensions", "measure", "smaller", "bigger"],
    "Comfort": ["comfortable", "comfy", "uncomfortable", "firm", "soft", "hard", "support", "sag", "lumpy", "back pain"],
    "Delivery & packaging": ["delivery", "arrived", "late", "damaged", "packaging", "box", "courier"],
    "Smell & materials": ["smell", "odour", "odor", "fabric", "material", "chemical"],
    "Noise": ["squeak", "creak", "noisy", "noise", "quiet"],
    "Value for money": ["price", "value", "worth", "expensive", "cheap", "money"],
    "Appearance": ["looks", "beautiful", "colour", "color", "stylish", "gorgeous", "photo", "picture"],
    "Customer service": ["seller", "customer service", "refund", "replacement", "contacted", "response"],
}


def review_themes(reviews: list[dict]) -> dict:
    n = len(reviews)
    stars = Counter(int(round(r.get("rating") or 0)) for r in reviews if r.get("rating"))
    sentiment = {"positive": sum(v for k, v in stars.items() if k >= 4), "neutral": stars.get(3, 0), "negative": sum(v for k, v in stars.items() if 0 < k <= 2)}
    themes = []
    for name, words in THEMES.items():
        hits = [r for r in reviews if any(w in f"{r.get('title', '')} {r.get('body', '')}".lower() for w in words)]
        if not hits:
            continue
        neg = [r for r in hits if (r.get("rating") or 3) <= 2]
        pos = [r for r in hits if (r.get("rating") or 3) >= 4]
        quote = next((r.get("body", "")[:220] for r in (neg or hits) if len(r.get("body", "")) > 30), "")
        themes.append({"theme": name, "mentions": len(hits), "share": round(len(hits) / n, 3) if n else 0, "negative": len(neg), "positive": len(pos), "example": quote})
    words = Counter()
    for r in reviews:
        t = f"{r.get('title', '')} {r.get('body', '')}".lower()
        for w in NEG:
            if w in t:
                words[("neg", w)] += 1
        for w in POS:
            if w in t:
                words[("pos", w)] += 1
    return {"count": n, "stars": {str(k): stars.get(k, 0) for k in range(1, 6)}, "sentiment": sentiment if stars else None,
            "themes": sorted(themes, key=lambda t: -t["mentions"]), "complaint_terms": [{"term": w, "count": c} for (k, w), c in words.most_common() if k == "neg"][:25],
            "praise_terms": [{"term": w, "count": c} for (k, w), c in words.most_common() if k == "pos"][:25]}


def parse_reviews(text: str) -> list[dict]:
    """Parse pasted Amazon review text or CSV (rating,title,body)."""
    import csv
    import io
    text = (text or "").strip()
    if not text:
        return []
    first = text.splitlines()[0].lower()
    if "," in first and ("rating" in first or "body" in first or "review" in first):
        rows = list(csv.DictReader(io.StringIO(text)))
        out = []
        for r in rows:
            lk = {k.lower().strip(): v for k, v in r.items() if k}
            rating = lk.get("rating") or lk.get("stars") or lk.get("score")
            try:
                rating = float(str(rating).split()[0])
            except (TypeError, ValueError, IndexError):
                rating = None
            out.append({"rating": rating, "title": lk.get("title", ""), "body": lk.get("body") or lk.get("review") or lk.get("text") or lk.get("content", ""), "date": lk.get("date", "")})
        return [r for r in out if r["body"] or r["title"]]
    blocks = re.split(r"\n(?=\s*\d(?:[.,]\d)? out of 5 stars)", "\n" + text)
    out = []
    for b in blocks:
        b = b.strip()
        if not b:
            continue
        m = re.match(r"(\d(?:[.,]\d)?) out of 5 stars\s*(.*)", b, re.S)
        if m:
            rest = m.group(2).strip().splitlines()
            out.append({"rating": float(m.group(1).replace(",", ".")), "title": rest[0][:200] if rest else "", "body": " ".join(l.strip() for l in rest[1:] if l.strip() and not re.match(r"(Reviewed in|Verified Purchase|\d+ people found|Helpful|Report)", l.strip()))[:4000]})
        elif len(blocks) == 1:
            out += [{"rating": None, "title": "", "body": para.strip()} for para in re.split(r"\n\s*\n", b) if len(para.strip()) > 20]
    return out
