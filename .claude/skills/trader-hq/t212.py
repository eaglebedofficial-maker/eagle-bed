#!/usr/bin/env python3
"""Trading 212 portfolio reader for Trading HQ. Read only, standard library only.

Never places, changes or cancels anything: Trading 212's API only allows
market orders with real money (no stop-loss or take-profit at the broker), so
Trading HQ uses it to watch the user's investments, not to day trade.

Keys come from the environment, never from the chat or a file:
    T212_API_KEY, T212_API_SECRET     (required; one key pair per account and environment)
    T212_ENV=live                     ("demo" for a Practice account)

    t212.py status        cash + holdings, one JSON (holdings also mapped to Yahoo tickers)
    t212.py cash | holdings

Exit 0 on success, 1 on a refusal or an API error (the reason is printed as JSON).
"""
import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request


class Refused(Exception):
    pass


def out(obj, code=0):
    print(json.dumps(obj, indent=2, default=str))
    sys.exit(code)


def env_name():
    return "demo" if os.environ.get("T212_ENV", "live").strip().lower() in ("demo", "practice", "paper") else "live"


def base_url():
    return "https://%s.trading212.com/api/v0" % env_name()


def auth_header():
    k, s = os.environ.get("T212_API_KEY"), os.environ.get("T212_API_SECRET")
    if not k or not s:
        raise Refused("T212_API_KEY and T212_API_SECRET are not set. Add them as environment variables "
                      "in the cloud environment settings; never paste them in chat.")
    return "Basic " + base64.b64encode(("%s:%s" % (k, s)).encode("utf-8")).decode("ascii")


def api(path, retries=1):
    req = urllib.request.Request(base_url() + path, headers={
        "Authorization": auth_header(), "Accept": "application/json", "User-Agent": "trading-hq/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8") or "null")
    except urllib.error.HTTPError as e:
        if e.code == 429 and retries > 0:  # Trading 212 rate-limits hard (a few seconds per call)
            time.sleep(6)
            return api(path, retries - 1)
        body = e.read().decode("utf-8", "replace")[:300]
        if e.code == 401:
            raise Refused("Trading 212 refused the key (401). Check the key and secret belong to this "
                          "account and to %s, and that the key has the account and portfolio "
                          "permissions ticked." % env_name())
        if e.code == 403:
            raise Refused("Trading 212 says this key lacks permission for %s (403). Tick that "
                          "permission when you create the key." % path)
        if e.code == 404:
            raise Refused("not found: %s" % path)
        raise Refused("Trading 212 %s answered %s: %s" % (path, e.code, body))
    except urllib.error.URLError as e:
        raise Refused("could not reach %s (%s). In a cloud session, add %s.trading212.com to the "
                      "environment's allowed domains." % (base_url(), e.reason, env_name()))


def yahoo_symbol(t212_ticker):
    """AAPL_US_EQ -> AAPL, BRK.B_US_EQ -> BRK-B, VODl_EQ -> VOD.L, other markets -> None."""
    t = str(t212_ticker or "")
    if t.endswith("_US_EQ"):
        return t[:-6].replace(".", "-")
    if t.endswith("l_EQ"):
        return t[:-4] + ".L"
    return None


def holdings():
    rows = None
    for path in ("/equity/portfolio", "/equity/positions"):
        try:
            rows = api(path)
            break
        except Refused as e:
            if not str(e).startswith("not found"):
                raise
            time.sleep(1)
    if rows is None:
        raise Refused("Trading 212 has no portfolio endpoint at /equity/portfolio or /equity/positions")
    items = []
    for p in rows or []:
        inst = p.get("instrument") or {}
        tick = p.get("ticker") or inst.get("ticker")
        qty = p.get("quantity")
        cur = p.get("currentPrice")
        items.append({
            "t212": tick, "symbol": yahoo_symbol(tick), "name": inst.get("name") or p.get("name"),
            "quantity": qty, "avg_price": p.get("averagePrice") or p.get("averagePricePaid"),
            "current_price": cur, "ppl": p.get("ppl", (p.get("walletImpact") or {}).get("unrealizedProfitLoss")),
            "fx_ppl": p.get("fxPpl"), "opened": p.get("initialFillDate") or p.get("createdAt"),
            "value": round(qty * cur, 2) if isinstance(qty, (int, float)) and isinstance(cur, (int, float)) else None,
        })
    items.sort(key=lambda x: -(x["value"] or 0))
    return items


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("cmd", choices=["status", "cash", "holdings"])
    a = p.parse_args(argv)
    try:
        if a.cmd == "cash":
            res = {"env": env_name(), "cash": api("/equity/account/cash")}
        elif a.cmd == "holdings":
            res = {"env": env_name(), "items": holdings()}
        else:
            cash = api("/equity/account/cash")
            time.sleep(2)
            try:
                currency = (api("/equity/account/info") or {}).get("currencyCode")
            except Refused:
                currency = None
            time.sleep(2)
            res = {"env": env_name(), "currency": currency, "cash": cash, "items": holdings()}
    except Refused as e:
        out({"ok": False, "refused": str(e)}, 1)
    out(res)


if __name__ == "__main__":
    main()
