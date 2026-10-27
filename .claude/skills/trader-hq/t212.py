#!/usr/bin/env python3
"""Trading 212 connector for Trading HQ: the user's investments (read) and the
desk's day trades (write). Standard library only.

Trading 212's public API (beta) allows only MARKET orders with real money, and
holds no stop-loss or take-profit for you. So the desk's stop and target live
in trader/state/t212_desk.json and `manage` enforces them: every cycle it reads
the broker's own prices and sends a market sell when a stop, a target or the
flat-by time is hit. Between checks a fast move or a gap can go past the stop.

Only the desk's own trades are ever sold: `close` and `manage` sell at most the
quantity the desk bought, never the user's long-term holdings.

Keys come from the environment, never from the chat or a file:
    T212_API_KEY, T212_API_SECRET   one key pair per account and environment
    T212_ENV=live | demo            demo = a Practice account
    T212_BASE_URL                   tests only: point at a local mock server

Read (no --yes):
    t212.py status | cash | holdings | orders
    t212.py resolve TSLA            the Trading 212 ticker (TSLA_US_EQ), from the instrument list
    t212.py desk                    the desk's open trades with their stop and target

Write (each needs --yes; a live account also needs "paper": false in trader/config.json):
    t212.py submit --index 1 --yes  buy order N of trader/orders.json, only when trader-risk passed
                                    that exact order today AND trader-broker recorded the user's yes
    t212.py close TSLA --yes        sell what the desk holds in TSLA
    t212.py close --all --yes       sell every desk trade (never the user's other holdings)
    t212.py cancel ORDER_ID --yes
    t212.py move-stop TSLA --stop 364.18 --yes | move-target TSLA --target 372 --yes
    t212.py manage --yes [--flat-by 15:55] [--break-even]   enforce stops, targets, flat-by time

Exit 0 on success, 1 on a refusal or an API error (the reason is printed as JSON).
"""
import argparse
import base64
import datetime as dt
import importlib.util
import json
import os
import sys
import time
import urllib.error
import urllib.request

try:
    from zoneinfo import ZoneInfo
    NY = ZoneInfo("America/New_York")
except Exception:  # pragma: no cover
    NY = None

HERE = os.path.dirname(os.path.abspath(__file__))
SKILLS = os.path.dirname(HERE)
DESK = "trader/state/t212_desk.json"
INSTRUMENTS = "trader/state/t212_instruments.json"


class Refused(Exception):
    pass


def out(obj, code=0):
    print(json.dumps(obj, indent=2, default=str))
    sys.exit(code)


def now_ny():
    return dt.datetime.now(NY) if NY else dt.datetime.utcnow() - dt.timedelta(hours=4)


def read_json(path, default=None):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except FileNotFoundError:
        return default


def write_json(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, indent=2)
    os.replace(tmp, path)


def env_name():
    return "demo" if os.environ.get("T212_ENV", "live").strip().lower() in ("demo", "practice", "paper") else "live"


def base_url():
    return os.environ.get("T212_BASE_URL") or "https://%s.trading212.com/api/v0" % env_name()


def auth_header():
    k, s = os.environ.get("T212_API_KEY"), os.environ.get("T212_API_SECRET")
    if not k or not s:
        raise Refused("T212_API_KEY and T212_API_SECRET are not set. Add them as environment variables "
                      "in the cloud environment settings; never paste them in chat.")
    if k.strip() == s.strip():
        raise Refused("T212_API_SECRET is the same as T212_API_KEY. Trading 212 shows two different codes "
                      "when you create a key: the API key and, below it, the secret. Make a new key and "
                      "save each one in its own variable.")
    return "Basic " + base64.b64encode(("%s:%s" % (k.strip(), s.strip())).encode("utf-8")).decode("ascii")


def api(method, path, body=None, retries=1):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(base_url() + path, data=data, method=method, headers={
        "Authorization": auth_header(), "Accept": "application/json",
        "Content-Type": "application/json", "User-Agent": "trading-hq/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read().decode("utf-8")
            return json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as e:
        # Trading 212 rate-limits hard. Retry reads; never retry a write on its own
        # (the beta API is not idempotent, a retried order can fill twice).
        if e.code == 429 and retries > 0 and method == "GET":
            time.sleep(6)
            return api(method, path, body, retries - 1)
        msg = e.read().decode("utf-8", "replace")[:300]
        try:
            j = json.loads(msg)
            msg = j.get("message") or j.get("code") or msg
        except Exception:
            pass
        if e.code == 401:
            raise Refused("Trading 212 refused the key (401). Check the key and secret belong to this "
                          "account and to %s, and were copied whole." % env_name())
        if e.code == 403:
            raise Refused("Trading 212 says this key lacks the permission for %s %s (403). Make a key "
                          "with that permission ticked." % (method, path))
        if e.code == 404:
            raise Refused("not found: %s" % path)
        if e.code == 429:
            raise Refused("Trading 212 rate limit on %s %s; wait a minute" % (method, path))
        raise Refused("Trading 212 %s %s answered %s: %s" % (method, path, e.code, msg))
    except urllib.error.URLError as e:
        raise Refused("could not reach %s (%s). In a cloud session, add %s.trading212.com to the "
                      "environment's allowed domains." % (base_url(), e.reason, env_name()))


# ---------------------------------------------------------------- read

def yahoo_symbol(t212_ticker):
    """AAPL_US_EQ -> AAPL, BRK.B_US_EQ -> BRK-B, VODl_EQ -> VOD.L, other markets -> None."""
    t = str(t212_ticker or "")
    if t.endswith("_US_EQ"):
        return t[:-6].replace(".", "-")
    if t.endswith("l_EQ"):
        return t[:-4] + ".L"
    return None


def raw_positions():
    for path in ("/equity/portfolio", "/equity/positions"):
        try:
            return api("GET", path) or []
        except Refused as e:
            if not str(e).startswith("not found"):
                raise
    raise Refused("Trading 212 has no portfolio endpoint at /equity/portfolio or /equity/positions")


def position_of(p):
    inst = p.get("instrument") or {}
    tick = p.get("ticker") or inst.get("ticker")
    qty, cur = p.get("quantity"), p.get("currentPrice")
    return {"t212": tick, "symbol": yahoo_symbol(tick), "name": inst.get("name") or p.get("name"),
            "quantity": qty, "avg_price": p.get("averagePrice") or p.get("averagePricePaid"),
            "current_price": cur, "ppl": p.get("ppl", (p.get("walletImpact") or {}).get("unrealizedProfitLoss")),
            "fx_ppl": p.get("fxPpl"), "opened": p.get("initialFillDate") or p.get("createdAt"),
            "value": round(qty * cur, 2) if isinstance(qty, (int, float)) and isinstance(cur, (int, float)) else None}


def holdings():
    items = [position_of(p) for p in raw_positions()]
    items.sort(key=lambda x: -(x["value"] or 0))
    return items


def instruments(refresh=False):
    cache = read_json(INSTRUMENTS)
    if cache and not refresh and time.time() - cache.get("t", 0) < 7 * 86400:
        return cache["items"]
    rows = api("GET", "/equity/metadata/instruments") or []
    items = [{"ticker": r.get("ticker"), "name": r.get("shortName") or r.get("name"),
              "type": r.get("type"), "currency": r.get("currencyCode")} for r in rows]
    write_json(INSTRUMENTS, {"t": time.time(), "items": items})
    return items


def resolve(symbol):
    sym = symbol.upper().replace("-", ".")
    want = sym + "_US_EQ"
    for r in instruments():
        if r["ticker"] == want:
            return r["ticker"]
    raise Refused("%s is not a US stock Trading 212 lists (looked for %s)" % (symbol.upper(), want))


# ---------------------------------------------------------------- write guards

def guard_write(a):
    if not a.yes:
        raise Refused("write commands need --yes, given only after the user said yes for this exact action")
    if env_name() == "live":
        cfg = read_json("trader/config.json", {}) or {}
        if cfg.get("paper", True) is not False:
            raise Refused("T212_ENV is live but trader/config.json still says paper: true. Switch the app "
                          "to live money on the Rules tab before the desk can trade real money.")


def load_desk():
    return read_json(DESK, {"trades": []})


def save_desk(d):
    write_json(DESK, d)


def _load(module_path, name):
    spec = importlib.util.spec_from_file_location(name, module_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def market(ticker, qty):
    """qty > 0 buys, qty < 0 sells (Trading 212's convention)."""
    return api("POST", "/equity/orders/market", body={"ticker": ticker, "quantity": round(qty, 6)})


# ---------------------------------------------------------------- commands

def cmd_submit(a):
    guard_write(a)
    doc = read_json(a.orders)
    if not doc or not doc.get("orders"):
        raise Refused("no orders in %s; run trader-budget size.py --write first" % a.orders)
    if not 1 <= a.index <= len(doc["orders"]):
        raise Refused("order %d does not exist (there are %d)" % (a.index, len(doc["orders"])))
    order = doc["orders"][a.index - 1]
    ticket = _load(os.path.join(SKILLS, "trader-broker", "ticket.py"), "ticket")
    fp = ticket.fingerprint(order)
    today = now_ny().strftime("%Y-%m-%d")
    rv, why = ticket.risk_verdict(read_json(a.risk), fp, today)
    if rv is None:
        raise Refused(why)
    if rv.get("verdict") != "PASS":
        raise Refused("trader-risk BLOCKED this order: " + "; ".join(rv.get("reasons", [])))
    rec = ticket.latest(read_json(a.state, {"orders": []}), fp, today)
    if not rec or rec.get("status") != "approved":
        raise Refused("the user's yes for this exact order is not recorded today "
                      "(ticket.py approve --index %d --reply \"...\")" % a.index)
    if order.get("side") != "buy":
        raise Refused("the desk only opens long trades")
    qty = float(order.get("qty") or 0)
    stop, target = order.get("stop_loss_stop_price"), order.get("take_profit_limit_price")
    if qty <= 0 or stop is None or target is None:
        raise Refused("the order needs a whole quantity, a stop and a target")
    tick = resolve(order["symbol"])
    desk = load_desk()
    if any(t["t212"] == tick and t.get("open") for t in desk["trades"]):
        raise Refused("the desk already has an open trade in %s" % order["symbol"])
    if tick in _held():
        raise Refused("you already hold %s in this account as an investment; the desk does not day-trade "
                      "a stock you own, so your holding and its trade never get mixed" % order["symbol"])
    plan = read_json(a.plan, {}) or {}
    entry = order.get("limit_price") or (order.get("plan") or {}).get("entry") or (plan.get("entry") if str(plan.get("symbol", "")).upper() == order["symbol"].upper() else None)
    placed = market(tick, qty)
    desk["trades"].append({"symbol": order["symbol"].upper(), "t212": tick, "qty": qty,
                           "entry": float(entry) if entry is not None else None,
                           "stop": float(stop), "target": float(target), "orig_stop": float(stop),
                           "opened": int(time.time() * 1000), "date": today, "order_id": placed.get("id"),
                           "fingerprint": fp, "open": True})
    save_desk(desk)
    return {"placed": True, "env": env_name(), "ticker": tick, "qty": qty, "order": placed,
            "managed_exits": {"stop": float(stop), "target": float(target)},
            "next": "ticket.py result --index %d --status placed --broker-id %s" % (a.index, placed.get("id"))}


def _desk_trade(desk, symbol):
    sym = symbol.upper()
    for t in desk["trades"]:
        if t.get("open") and (t["symbol"] == sym or t["t212"] == sym):
            return t
    raise Refused("the desk has no open trade in %s (the user's own holdings are never sold by the desk)" % sym)


def _sell(t, held, reason):
    qty = min(float(t["qty"]), float(held or 0))
    if qty <= 0:
        t["open"] = False
        t["closed_reason"] = "already gone at the broker"
        return {"symbol": t["symbol"], "sold": 0, "reason": t["closed_reason"]}
    res = market(t["t212"], -qty)
    t.update({"open": False, "closed": int(time.time() * 1000), "closed_reason": reason,
              "close_order_id": res.get("id")})
    return {"symbol": t["symbol"], "sold": qty, "reason": reason, "order": res}


def _held():
    return {p.get("ticker") or (p.get("instrument") or {}).get("ticker"): p for p in raw_positions()}


def cmd_close(a):
    guard_write(a)
    desk, held = load_desk(), _held()
    targets = [t for t in desk["trades"] if t.get("open")] if a.all else [_desk_trade(desk, a.symbol)]
    if a.all and not targets:
        return {"closed": [], "note": "the desk has no open trades"}
    done = []
    for t in targets:
        p = held.get(t["t212"]) or {}
        done.append(_sell(t, p.get("quantity"), a.reason or "closed by you"))
        save_desk(desk)
        if len(targets) > 1:
            time.sleep(1.5)
    return {"closed": done}


def cmd_move(a, kind):
    guard_write(a)
    desk = load_desk()
    t = _desk_trade(desk, a.symbol)
    cur = (_held().get(t["t212"]) or {}).get("currentPrice")
    if kind == "stop":
        if cur is not None and a.stop >= cur:
            raise Refused("a stop must sit below the current price (%.2f)" % cur)
        t["stop"] = round(a.stop, 2)
    else:
        if cur is not None and a.target <= cur:
            raise Refused("a target must sit above the current price (%.2f)" % cur)
        t["target"] = round(a.target, 2)
    save_desk(desk)
    return {"moved": kind, "symbol": t["symbol"], "stop": t["stop"], "target": t["target"]}


def cmd_manage(a):
    """The bracket Trading 212 cannot hold: stop, target, break-even and flat-by, from broker prices."""
    guard_write(a)
    desk = load_desk()
    open_trades = [t for t in desk["trades"] if t.get("open")]
    if not open_trades:
        return {"actions": [], "open": 0}
    held, actions = _held(), []
    now = now_ny()
    flat = None
    if a.flat_by:
        h, m = (int(x) for x in a.flat_by.split(":"))
        flat = now.replace(hour=h, minute=m, second=0, microsecond=0)
    for t in open_trades:
        p = held.get(t["t212"])
        if not p:
            t.update({"open": False, "closed": int(time.time() * 1000), "closed_reason": "no longer held at the broker"})
            actions.append({"symbol": t["symbol"], "note": t["closed_reason"]})
            continue
        price = p.get("currentPrice")
        if t.get("entry") is None and p.get("averagePrice"):
            t["entry"] = p["averagePrice"]
        if price is None:
            actions.append({"symbol": t["symbol"], "note": "no price from the broker this check"})
            continue
        if price <= t["stop"]:
            reason = "break-even stop" if t.get("entry") and abs(t["stop"] - t["entry"]) < 0.005 else "stop"
            actions.append(_sell(t, p.get("quantity"), reason) | {"price": price})
        elif price >= t["target"]:
            actions.append(_sell(t, p.get("quantity"), "target") | {"price": price})
        elif flat and now >= flat and t.get("date") == now.strftime("%Y-%m-%d"):
            actions.append(_sell(t, p.get("quantity"), "flat by close") | {"price": price})
        elif a.break_even and t.get("entry") and t["stop"] < t["entry"] \
                and price >= t["entry"] + (t["entry"] - t["orig_stop"]):
            t["stop"] = round(t["entry"], 2)
            actions.append({"symbol": t["symbol"], "moved_stop_to": t["stop"], "price": price})
        save_desk(desk)
    save_desk(desk)
    return {"actions": actions, "open": sum(1 for t in desk["trades"] if t.get("open"))}


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    for name in ("status", "cash", "holdings", "orders", "desk"):
        sub.add_parser(name)
    s = sub.add_parser("resolve"); s.add_argument("symbol")
    s = sub.add_parser("submit")
    s.add_argument("--index", type=int, default=1)
    s.add_argument("--orders", default="trader/orders.json")
    s.add_argument("--risk", default="trader/state/risk.json")
    s.add_argument("--state", default="trader/state/broker.json")
    s.add_argument("--plan", default="trader/plan.json")
    s.add_argument("--yes", action="store_true")
    s = sub.add_parser("close"); s.add_argument("symbol", nargs="?"); s.add_argument("--all", action="store_true"); s.add_argument("--reason"); s.add_argument("--yes", action="store_true")
    s = sub.add_parser("cancel"); s.add_argument("order_id"); s.add_argument("--yes", action="store_true")
    s = sub.add_parser("move-stop"); s.add_argument("symbol"); s.add_argument("--stop", type=float, required=True); s.add_argument("--yes", action="store_true")
    s = sub.add_parser("move-target"); s.add_argument("symbol"); s.add_argument("--target", type=float, required=True); s.add_argument("--yes", action="store_true")
    s = sub.add_parser("manage"); s.add_argument("--flat-by"); s.add_argument("--break-even", action="store_true"); s.add_argument("--yes", action="store_true")
    a = p.parse_args(argv)
    try:
        if a.cmd == "cash":
            res = {"env": env_name(), "cash": api("GET", "/equity/account/cash")}
        elif a.cmd == "holdings":
            res = {"env": env_name(), "items": holdings()}
        elif a.cmd == "orders":
            res = {"env": env_name(), "orders": api("GET", "/equity/orders")}
        elif a.cmd == "desk":
            res = load_desk()
        elif a.cmd == "resolve":
            res = {"symbol": a.symbol.upper(), "t212": resolve(a.symbol)}
        elif a.cmd == "status":
            cash = api("GET", "/equity/account/cash")
            time.sleep(2)
            try:
                currency = (api("GET", "/equity/account/info") or {}).get("currencyCode")
            except Refused:
                currency = None
            time.sleep(2)
            desk = {t["t212"]: t for t in load_desk()["trades"] if t.get("open")}
            items = holdings()
            for it in items:
                if it["t212"] in desk:
                    it["desk_qty"] = desk[it["t212"]]["qty"]
            res = {"env": env_name(), "currency": currency, "cash": cash, "items": items}
        elif a.cmd == "submit":
            res = cmd_submit(a)
        elif a.cmd == "close":
            if not a.all and not a.symbol:
                raise Refused("give a SYMBOL or --all")
            res = cmd_close(a)
        elif a.cmd == "cancel":
            guard_write(a)
            api("DELETE", "/equity/orders/" + a.order_id)
            res = {"cancelled": a.order_id}
        elif a.cmd == "move-stop":
            res = cmd_move(a, "stop")
        elif a.cmd == "move-target":
            res = cmd_move(a, "target")
        else:
            res = cmd_manage(a)
    except Refused as e:
        out({"ok": False, "refused": str(e)}, 1)
    out(res)


if __name__ == "__main__":
    main()
