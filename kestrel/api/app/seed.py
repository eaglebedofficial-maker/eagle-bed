"""Idempotent reference data: marketplaces, referral rules, FBA fee schedules.

Fee values are seeded from Amazon's published 2025 rate cards (UK and US). They are
editable in Settings → Fee database and carry effective dates and source links.
Verify against the source before relying on them; connect SP-API for exact per-ASIN fees.
"""
from datetime import date

from sqlalchemy import select

from .db import SessionLocal
from .models import FeeSchedule, Marketplace, ReferralRule

MARKETPLACES = [
    # code, name, domain, currency, keepa id (0 = not covered by Keepa), SP marketplace id, region, VAT rate
    ("UK", "Amazon UK", "amazon.co.uk", "GBP", 2, "A1F83G8C2ARO7P", "eu", 20.0),
    ("US", "Amazon US", "amazon.com", "USD", 1, "ATVPDKIKX0DER", "na", 0.0),
    ("DE", "Amazon Germany", "amazon.de", "EUR", 3, "A1PA6795UKMFR9", "eu", 19.0),
    ("FR", "Amazon France", "amazon.fr", "EUR", 4, "A13V1IB3VIYZZH", "eu", 20.0),
    ("IT", "Amazon Italy", "amazon.it", "EUR", 8, "APJ6JRA9NG5V4", "eu", 22.0),
    ("ES", "Amazon Spain", "amazon.es", "EUR", 9, "A1RKKUPIHCS9HS", "eu", 21.0),
    ("NL", "Amazon Netherlands", "amazon.nl", "EUR", 0, "A1805IZSGTT6HS", "eu", 21.0),
    ("CA", "Amazon Canada", "amazon.ca", "CAD", 6, "A2EUQ1WTGCTBG2", "na", 0.0),
    ("AU", "Amazon Australia", "amazon.com.au", "AUD", 0, "A39IBJ37TRP1C6", "fe", 10.0),
]

EFF = date(2025, 2, 1)
UK_SRC = "https://sell.amazon.co.uk/pricing"
US_SRC = "https://sell.amazon.com/pricing"
EU_SRC = "https://sell.amazon.de/preise"

# UK FBA fulfilment (price > £10). (tier, max L, max W, max H cm, weight_to g, amount £, per kg over last band)
UK_FBA = [
    ("Light envelope", 33, 23, 2.5, 100, 1.83, 0),
    ("Standard envelope", 33, 23, 2.5, 210, 2.15, 0), ("Standard envelope", 33, 23, 2.5, 460, 2.32, 0),
    ("Large envelope", 33, 23, 4, 960, 2.83, 0),
    ("Extra-large envelope", 33, 23, 6, 960, 3.08, 0),
    ("Small parcel", 35, 25, 12, 150, 3.06, 0), ("Small parcel", 35, 25, 12, 400, 3.25, 0), ("Small parcel", 35, 25, 12, 900, 3.53, 0),
    ("Small parcel", 35, 25, 12, 1400, 3.83, 0), ("Small parcel", 35, 25, 12, 1900, 4.04, 0), ("Small parcel", 35, 25, 12, 3900, 5.65, 0),
    ("Standard parcel", 45, 34, 26, 150, 3.08, 0), ("Standard parcel", 45, 34, 26, 400, 3.33, 0), ("Standard parcel", 45, 34, 26, 900, 3.73, 0),
    ("Standard parcel", 45, 34, 26, 1400, 4.04, 0), ("Standard parcel", 45, 34, 26, 1900, 4.28, 0), ("Standard parcel", 45, 34, 26, 2900, 5.23, 0),
    ("Standard parcel", 45, 34, 26, 3900, 5.72, 0), ("Standard parcel", 45, 34, 26, 5900, 6.38, 0), ("Standard parcel", 45, 34, 26, 8900, 7.36, 0),
    ("Standard parcel", 45, 34, 26, 11900, 7.91, 0),
    ("Small oversize", 61, 46, 46, 760, 5.89, 0), ("Small oversize", 61, 46, 46, 1260, 6.38, 0), ("Small oversize", 61, 46, 46, 1760, 6.73, 0.25),
    ("Standard oversize", 101, 60, 60, 760, 7.40, 0.28),
    ("Large oversize", 120, 60, 60, 1000, 11.31, 0.29),
    ("Special oversize", None, None, None, 1000, 16.81, 0.40),
]
# US FBA fulfilment (price $10–$50), inches → cm, oz/lb → g
US_FBA = [
    ("Small standard", 38.1, 30.48, 1.905, 56.7, 3.06, 0), ("Small standard", 38.1, 30.48, 1.905, 113.4, 3.15, 0),
    ("Small standard", 38.1, 30.48, 1.905, 170.1, 3.24, 0), ("Small standard", 38.1, 30.48, 1.905, 226.8, 3.33, 0),
    ("Small standard", 38.1, 30.48, 1.905, 283.5, 3.43, 0), ("Small standard", 38.1, 30.48, 1.905, 340.2, 3.53, 0),
    ("Small standard", 38.1, 30.48, 1.905, 396.9, 3.60, 0), ("Small standard", 38.1, 30.48, 1.905, 453.6, 3.65, 0),
    ("Large standard", 45.72, 35.56, 20.32, 113.4, 3.68, 0), ("Large standard", 45.72, 35.56, 20.32, 226.8, 3.90, 0),
    ("Large standard", 45.72, 35.56, 20.32, 340.2, 4.15, 0), ("Large standard", 45.72, 35.56, 20.32, 453.6, 4.55, 0),
    ("Large standard", 45.72, 35.56, 20.32, 567, 4.99, 0), ("Large standard", 45.72, 35.56, 20.32, 680.4, 5.37, 0),
    ("Large standard", 45.72, 35.56, 20.32, 793.8, 5.52, 0), ("Large standard", 45.72, 35.56, 20.32, 907.2, 5.77, 0),
    ("Large standard", 45.72, 35.56, 20.32, 1020.6, 5.87, 0), ("Large standard", 45.72, 35.56, 20.32, 1134, 6.05, 0),
    ("Large standard", 45.72, 35.56, 20.32, 1247.4, 6.21, 0), ("Large standard", 45.72, 35.56, 20.32, 1360.8, 6.62, 0.705),
    ("Large bulky", 149.86, 83.82, 83.82, 453.6, 9.61, 0.838),
    ("Extra-large", None, None, None, 453.6, 26.33, 0.838),
]
UK_STORAGE = [("Standard", "offpeak", 0.78), ("Standard", "peak", 1.10), ("Oversize", "offpeak", 0.53), ("Oversize", "peak", 0.75)]
US_STORAGE = [("Standard", "offpeak", 0.78), ("Standard", "peak", 2.40), ("Oversize", "offpeak", 0.56), ("Oversize", "peak", 1.40)]

UK_REFERRAL = [("Default", 0.15, None, None), ("Home & Kitchen", 0.15, None, None), ("Furniture", 0.15, 175, 0.10), ("Beauty", 0.08, 10, 0.15),
               ("Health & Personal Care", 0.08, 10, 0.15), ("Grocery", 0.05, 10, 0.15), ("Electronics", 0.07, None, None), ("Computers", 0.07, None, None),
               ("Clothing", 0.08, 15, 0.15), ("Jewellery", 0.20, 225, 0.05), ("Toys & Games", 0.15, None, None), ("DIY & Tools", 0.13, None, None),
               ("Garden", 0.15, None, None), ("Baby", 0.08, 10, 0.15), ("Sports & Outdoors", 0.15, None, None), ("Automotive", 0.15, 45, 0.09),
               ("Pet Supplies", 0.15, None, None), ("Office Products", 0.15, None, None), ("Books", 0.15, None, None), ("Large Appliances", 0.07, None, None)]
US_REFERRAL = [("Default", 0.15, None, None), ("Home & Kitchen", 0.15, None, None), ("Furniture", 0.15, 200, 0.10), ("Beauty", 0.08, 10, 0.15),
               ("Health & Personal Care", 0.08, 10, 0.15), ("Grocery", 0.08, 15, 0.15), ("Electronics", 0.08, None, None), ("Computers", 0.08, None, None),
               ("Clothing", 0.17, None, None), ("Jewellery", 0.20, 250, 0.05), ("Toys & Games", 0.15, None, None), ("Tools & Home Improvement", 0.15, None, None),
               ("Garden", 0.15, None, None), ("Baby", 0.08, 10, 0.15), ("Sports & Outdoors", 0.15, None, None), ("Automotive", 0.12, None, None),
               ("Pet Supplies", 0.15, None, None), ("Office Products", 0.15, None, None), ("Books", 0.15, None, None), ("Large Appliances", 0.08, None, None)]


def seed(db=None):
    own = db is None
    db = db or SessionLocal()
    for code, name, domain, cur, kid, spid, region, vat in MARKETPLACES:
        m = db.get(Marketplace, code)
        if not m:
            db.add(Marketplace(code=code, name=name, domain=domain, currency=cur, keepa_domain_id=kid, sp_marketplace_id=spid, region=region, vat_rate=vat))
    db.flush()
    if not db.scalar(select(FeeSchedule).where(FeeSchedule.org_id.is_(None)).limit(1)):
        def add_fba(mkt, rows, src):
            prev = {}
            for tier, l, w, h, wt, amt, perkg in rows:
                db.add(FeeSchedule(marketplace=mkt, fee_type="fba", size_tier=tier, max_length_cm=l, max_width_cm=w, max_height_cm=h,
                                   weight_from_g=prev.get(tier, 0), weight_to_g=wt if not perkg else None, amount=amt, per_kg_over=perkg,
                                   effective_from=EFF, source_url=src, notes="Seeded from published 2025 rate card; verify and edit."))
                prev[tier] = wt
        add_fba("UK", UK_FBA, UK_SRC)
        add_fba("US", US_FBA, US_SRC)
        for mk in ("DE", "FR", "IT", "ES", "NL"):  # pan-EU local fees approximated from UK × 1.12 in EUR
            add_fba(mk, [(t, l, w, h, wt, round(a * 1.12, 2), round(p * 1.12, 2)) for t, l, w, h, wt, a, p in UK_FBA], EU_SRC)
        for mk in ("CA",):
            add_fba(mk, [(t, l, w, h, wt, round(a * 1.38, 2), round(p * 1.38, 2)) for t, l, w, h, wt, a, p in US_FBA], "https://sell.amazon.ca/pricing")
        for mk, rows in (("UK", UK_STORAGE), ("US", US_STORAGE), ("DE", UK_STORAGE), ("FR", UK_STORAGE), ("IT", UK_STORAGE), ("ES", UK_STORAGE), ("NL", UK_STORAGE), ("CA", US_STORAGE)):
            for tier, season, amt in rows:
                db.add(FeeSchedule(marketplace=mk, fee_type="storage", size_tier=tier, amount=amt, unit="per_cuft_month", season=season,
                                   effective_from=EFF, source_url=UK_SRC if mk not in ("US", "CA") else US_SRC))
        for mk, rows, src in (("UK", UK_REFERRAL, UK_SRC), ("US", US_REFERRAL, US_SRC)):
            for cat, rate, thr, above in rows:
                db.add(ReferralRule(marketplace=mk, category=cat, rate=rate, threshold=thr, rate_above=above, min_fee=0.25 if mk == "UK" else 0.30,
                                    effective_from=EFF, source_url=src, tiered_whole_price=cat in ("Beauty", "Health & Personal Care", "Grocery", "Clothing", "Baby")))
        for mk in ("DE", "FR", "IT", "ES", "NL", "AU"):
            for cat, rate, thr, above in UK_REFERRAL:
                db.add(ReferralRule(marketplace=mk, category=cat, rate=rate, threshold=thr, rate_above=above, min_fee=0.30, effective_from=EFF, source_url=EU_SRC,
                                    tiered_whole_price=cat in ("Beauty", "Health & Personal Care", "Grocery", "Clothing", "Baby")))
        for cat, rate, thr, above in US_REFERRAL:
            db.add(ReferralRule(marketplace="CA", category=cat, rate=rate, threshold=thr, rate_above=above, min_fee=0.30, effective_from=EFF, source_url="https://sell.amazon.ca/pricing",
                                tiered_whole_price=cat in ("Beauty", "Health & Personal Care", "Grocery", "Baby")))
    db.commit()
    if own:
        db.close()


if __name__ == "__main__":
    seed()
    print("seeded")
