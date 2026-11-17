"""Keyword processing, difficulty and relevance helpers (pure), rank checks (DataForSEO SERP)."""
from __future__ import annotations

import math
import re
from collections import Counter

STOP = set("a an and or but of to in on for with is are was were it this that i you we they my our your so very just also too not no as at be been have has had will would can could its from by up out if than then them there their these those what which who when where how all any each more most other some such only own same new set pcs pack x".split())


def tokens(s: str) -> list[str]:
    return [w for w in re.sub(r"[^a-z0-9äöüßàâçéèêëîïôûùÿñæœ'\s-]", " ", (s or "").lower()).split() if len(w) > 1 and w not in STOP and not w.isdigit()]


def process(raw: str, *, remove_words: list[str] | None = None, min_len: int = 1, dedupe_words: bool = True) -> dict:
    """Frankenstein-style processing: merge, clean, dedupe, filter, rank."""
    phrases = [p.strip().lower() for p in re.split(r"[\n,;\t]+", raw or "") if p.strip()]
    remove = {w.lower() for w in (remove_words or [])}
    cleaned = []
    for p in phrases:
        p = re.sub(r"\s+", " ", re.sub(r"[^\w\s'&-]", " ", p)).strip()
        if remove and any(w in p.split() for w in remove):
            continue
        if len(p.split()) >= min_len and p:
            cleaned.append(p)
    uniq = list(dict.fromkeys(cleaned))
    words = Counter(w for p in uniq for w in tokens(p))
    bigrams = Counter(" ".join(t[i:i + 2]) for p in uniq for t in [tokens(p)] for i in range(len(t) - 1))
    backend_words: list[str] = []
    for p in uniq:
        for w in tokens(p):
            if not dedupe_words or w not in backend_words:
                backend_words.append(w)
    backend = ""
    for w in backend_words:
        cand = (backend + " " + w).strip()
        if len(cand.encode("utf-8")) <= 249:
            backend = cand
    return {"input_count": len(phrases), "unique_count": len(uniq), "removed": len(phrases) - len(uniq), "phrases": uniq,
            "words": [{"word": w, "count": c} for w, c in words.most_common(200)], "bigrams": [{"phrase": w, "count": c} for w, c in bigrams.most_common(100)],
            "backend_terms": backend, "backend_bytes": len(backend.encode("utf-8"))}


def difficulty_from_serp(items: list[dict]) -> int | None:
    """0–100 from page-1 organic review walls and ratings (Kestrel method; estimate)."""
    org = [i for i in items if not i.get("sponsored")][:16]
    revs = [i.get("reviews") or 0 for i in org]
    if not revs:
        return None
    med = sorted(revs)[len(revs) // 2]
    big = sum(1 for r in revs if r > 1000) / len(revs)
    return int(round(min(100, (math.log10(med + 1) / math.log10(5000)) * 70 + big * 30)))


def relevance(keyword: str, seed_terms: list[str]) -> float:
    kt, st = set(tokens(keyword)), set(w for s in seed_terms for w in tokens(s))
    if not kt or not st:
        return 0.0
    return round(len(kt & st) / len(kt), 2)
