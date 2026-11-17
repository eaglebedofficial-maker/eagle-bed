"""Opportunity score (0–100) from 12 factors, each explained. Missing factors are excluded and
listed, and the remaining weights are renormalised — the score never invents a missing input.
A high score means the evidence looks favourable; it is never a guarantee of profit.
"""
from __future__ import annotations

import math

WEIGHTS = {
    "demand": 15, "competition": 12, "revenue": 8, "profitability": 12, "sales_consistency": 8, "price_stability": 6,
    "review_barrier": 8, "brand_dominance": 6, "seasonality": 5, "supplier_availability": 8, "sourcing_difficulty": 6, "restrictions": 6,
}
LABELS = {
    "demand": "Demand", "competition": "Competition", "revenue": "Revenue potential", "profitability": "Profitability", "sales_consistency": "Sales consistency",
    "price_stability": "Price stability", "review_barrier": "Review barrier", "brand_dominance": "Brand dominance", "seasonality": "Seasonality",
    "supplier_availability": "Supplier availability", "sourcing_difficulty": "Sourcing difficulty", "restrictions": "Restrictions & compliance",
}
RESTRICTED_HINTS = ("supplement", "vitamin", "cosmetic", "skin", "baby food", "medical", "battery", "batteries", "aerosol", "knife", "lithium", "pesticide", "ce marked", "toy")


def clamp(v, lo=0.0, hi=1.0):
    return max(lo, min(hi, v))


def logscale(v, lo, hi):
    if not v or v <= 0:
        return 0.0
    return clamp((math.log10(v) - math.log10(lo)) / (math.log10(hi) - math.log10(lo)))


def score(p: dict, ctx: dict | None = None) -> dict:
    """p: product fields (units, revenue, price, reviews, rating, offers, margin, price_stability, sales_consistency, seasonality,
    amazon_sells, brand_share, size_tier, weight_g, title, category). ctx: supplier_count, eligibility, niche_avg_reviews."""
    ctx = ctx or {}
    f: dict[str, dict] = {}

    def put(key, value01, reason):
        f[key] = {"label": LABELS[key], "score": round(value01 * 100), "weight": WEIGHTS[key], "reason": reason}

    def missing(key, what):
        f[key] = {"label": LABELS[key], "score": None, "weight": WEIGHTS[key], "reason": f"Not scored — {what}", "missing": True}

    units = p.get("units")
    if units:
        put("demand", logscale(units, 30, 3000), f"About {units:,} units a month (estimate).")
    else:
        missing("demand", "no sales rank or monthly-sold signal")

    reviews, offers = p.get("reviews"), p.get("offers")
    if reviews is not None or offers is not None:
        comp = 1.0
        parts = []
        if reviews is not None:
            comp -= 0.65 * logscale(reviews + 1, 20, 5000)
            parts.append(f"{reviews:,} reviews")
        if offers is not None:
            comp -= 0.35 * clamp((offers - 1) / 15)
            parts.append(f"{offers} sellers on the listing")
        put("competition", clamp(comp), ", ".join(parts) + ".")
    else:
        missing("competition", "no review or offer count")

    rev = p.get("revenue")
    if rev:
        put("revenue", logscale(rev, 1000, 150000), f"About {rev:,.0f} a month in revenue (estimate).")
    else:
        missing("revenue", "needs price and a sales estimate")

    margin = p.get("margin")
    if margin is not None:
        put("profitability", clamp((margin - 5) / 30), f"Net margin {margin:.0f}% after fees" + (" with your unit cost." if p.get("cost_known") else " assuming an estimated unit cost."))
    else:
        missing("profitability", "enter a unit cost or weight/dimensions for fees")

    sc = p.get("sales_consistency")
    if sc is not None:
        put("sales_consistency", clamp(sc), f"Rank history consistency {sc * 100:.0f}/100 over the retrieved period.")
    else:
        missing("sales_consistency", "needs rank history (Keepa or tracking)")

    ps = p.get("price_stability")
    if ps is not None:
        put("price_stability", clamp(ps), f"Price stability {ps * 100:.0f}/100 over the retrieved period.")
    else:
        missing("price_stability", "needs price history (Keepa or tracking)")

    nr = ctx.get("niche_avg_reviews", reviews)
    if nr is not None:
        put("review_barrier", clamp(1 - logscale(nr + 1, 50, 4000)), f"Review wall around {int(nr):,} reviews to compete with.")
    else:
        missing("review_barrier", "no review data")

    if p.get("amazon_sells") is not None or p.get("brand_share") is not None:
        v = 1.0
        why = []
        if p.get("amazon_sells"):
            v -= 0.6
            why.append("Amazon sells this item itself")
        bs = p.get("brand_share")
        if bs is not None:
            v -= 0.4 * clamp(bs)
            why.append(f"top brand holds {bs * 100:.0f}% of tracked revenue")
        put("brand_dominance", clamp(v), "; ".join(why) or "No dominant seller detected.")
    else:
        missing("brand_dominance", "no seller or brand-share data")

    seas = p.get("seasonality")
    if seas is not None:
        put("seasonality", clamp(1 - seas), "Strongly seasonal demand." if seas > 0.5 else "Demand is fairly even through the year.")
    else:
        missing("seasonality", "needs 12 months of rank history")

    sup = ctx.get("supplier_count")
    if sup is not None:
        put("supplier_availability", clamp(sup / 4), f"{sup} supplier{'s' if sup != 1 else ''} linked in your workspace." if sup else "No suppliers found yet.")
    else:
        missing("supplier_availability", "supplier search not run")

    tier, w = (p.get("size_tier") or "").lower(), p.get("weight_g")
    if tier or w:
        v = 1.0
        why = []
        if any(x in tier for x in ("oversize", "bulky", "extra-large")):
            v -= 0.45
            why.append(f"{p.get('size_tier')} item (higher freight, fees and storage)")
        if w and w > 5000:
            v -= 0.25
            why.append(f"heavy ({w / 1000:.1f} kg)")
        put("sourcing_difficulty", clamp(v), "; ".join(why) or "Standard-size item, simple to ship.")
    else:
        missing("sourcing_difficulty", "no size or weight")

    elig = ctx.get("eligibility")
    text = f"{p.get('title', '')} {p.get('category', '')}".lower()
    hints = [h for h in RESTRICTED_HINTS if h in text]
    if elig:
        put("restrictions", {"eligible": 1.0, "approval_required": 0.45, "restricted": 0.0}.get(elig, 0.5), f"Your eligibility check: {elig.replace('_', ' ')}.")
    elif hints:
        put("restrictions", 0.5, f"May need approval or certification ({', '.join(hints[:3])}). Check eligibility in Seller Central.")
    else:
        missing("restrictions", "no eligibility check recorded")

    scored = {k: v for k, v in f.items() if v["score"] is not None}
    wsum = sum(v["weight"] for v in scored.values())
    total = round(sum(v["score"] * v["weight"] for v in scored.values()) / wsum) if wsum else None
    coverage = wsum / sum(WEIGHTS.values())
    if margin is not None and margin < 0 and total is not None:
        total = min(total, 25)
    strengths = sorted([v for v in scored.values() if v["score"] >= 70], key=lambda v: -v["weight"])[:3]
    weaknesses = sorted([v for v in scored.values() if v["score"] < 45], key=lambda v: -v["weight"])[:3]
    summary = []
    if total is None:
        summary.append("Not enough data to score this product yet.")
    else:
        summary.append(("Strong" if total >= 70 else "Moderate" if total >= 45 else "Weak") + f" opportunity on the data available ({round(coverage * 100)}% of factors scored).")
        if strengths:
            summary.append("Helped by " + ", ".join(s["label"].lower() for s in strengths) + ".")
        if weaknesses:
            summary.append("Held back by " + ", ".join(s["label"].lower() for s in weaknesses) + ".")
    return {"score": total, "coverage": round(coverage, 2), "confidence": "high" if coverage >= 0.8 else "medium" if coverage >= 0.55 else "low",
            "factors": f, "summary": " ".join(summary), "disclaimer": "A score reflects the evidence available, not a guarantee of profit."}


def competition_level(reviews: int | None, offers: int | None) -> str:
    if reviews is None and offers is None:
        return ""
    r, o = reviews or 0, offers or 1
    if r > 2000 or o > 15:
        return "high"
    if r > 400 or o > 6:
        return "medium"
    return "low"
