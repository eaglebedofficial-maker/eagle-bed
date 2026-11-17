"""Sales estimation with explicit method, inputs and confidence range.

Signals, strongest first:
1. Amazon's "bought in past month" figure (from Keepa monthlySold or a user import) — a published lower bound.
2. Keepa sales-rank drops over 30 days — each drop is at least one sale (lower bound for slow sellers).
3. Best Sellers Rank → units curve per category and marketplace (model).
"""
from __future__ import annotations

# Monthly units at BSR #1,000 in the US top-level category, and marketplace scale factors.
CATEGORY_K = {
    "home & kitchen": 1800, "furniture": 700, "kitchen & dining": 900, "garden": 800, "diy & tools": 900, "tools & home improvement": 900,
    "health & personal care": 1700, "health & household": 1700, "beauty": 1500, "baby": 700, "toys & games": 1300, "sports & outdoors": 900,
    "pet supplies": 1000, "office products": 800, "stationery & office supplies": 800, "clothing": 1100, "fashion": 1100, "electronics": 600,
    "electronics & photo": 600, "computers": 500, "computers & accessories": 500, "automotive": 600, "car & motorbike": 600, "grocery": 1600,
    "arts & crafts": 600, "books": 900, "large appliances": 250, "musical instruments": 250, "video games": 400, "industrial": 300,
}
MARKET_FACTOR = {"US": 1.0, "UK": 0.32, "DE": 0.36, "FR": 0.18, "IT": 0.15, "ES": 0.13, "NL": 0.05, "CA": 0.14, "AU": 0.06}


def category_k(category: str) -> tuple[int, bool]:
    c = (category or "").lower()
    for k, v in CATEGORY_K.items():
        if k in c or (c and c in k):
            return v, True
    return 600, False


def units_from_bsr(bsr: int, category: str, marketplace: str) -> float:
    if not bsr or bsr <= 0:
        return 0.0
    k, _ = category_k(category)
    f = MARKET_FACTOR.get(marketplace, 0.2)
    b = 0.87
    if bsr >= 100:
        v = k * (bsr / 1000) ** -b
    else:
        v = k * (0.1 ** -b) * (bsr / 100) ** -0.45
    return max(0.0, v * f)


def next_bucket(n: int) -> int:
    if n < 100:
        return n + 50
    if n < 1000:
        return n + 100
    if n < 10000:
        return n + 1000
    return n * 2


def estimate(*, bsr: int | None, category: str, marketplace: str, bought_past_month: int | None = None, rank_drops_30: int | None = None) -> dict:
    model = units_from_bsr(bsr or 0, category, marketplace)
    _, known_cat = category_k(category)
    inputs, low, high, units, conf = [], None, None, None, "low"
    if bsr:
        inputs.append(f"BSR #{bsr:,} in {category or 'unknown category'}")
    if bought_past_month:
        lo, hi = bought_past_month, next_bucket(bought_past_month)
        units = min(max(model, lo), hi) if model else (lo + hi) / 2
        low, high = lo, hi
        inputs.append(f"Amazon “{bought_past_month:,}+ bought in past month”")
        conf = "high" if model and lo <= model <= hi else "medium"
        method = "Amazon monthly-bought figure, refined by the rank model"
    elif rank_drops_30 is not None and bsr:
        floor = rank_drops_30
        units = max(model, floor)
        low, high = max(floor, int(units * 0.7)), int(units * 1.4)
        inputs.append(f"{rank_drops_30} sales-rank drops in 30 days (Keepa)")
        conf = "medium"
        method = "Rank model with a Keepa rank-drop floor"
    elif model:
        units = model
        spread = 0.35 if known_cat else 0.6
        low, high = int(model * (1 - spread)), int(model * (1 + spread * 1.4))
        conf = "low" if not known_cat else "medium-low"
        method = "Best Sellers Rank model (category curve)"
    else:
        return {"units": None, "low": None, "high": None, "method": "No rank or sales signal available", "inputs": inputs, "confidence": "none", "classification": "estimated"}
    return {"units": int(round(units)), "low": int(low), "high": int(high), "method": method, "inputs": inputs, "confidence": conf, "classification": "estimated"}
