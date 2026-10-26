#!/usr/bin/env python3
"""Alpaca REST executor for Trading HQ. Standard library only.

Reads keys from the environment, never from the chat or a file:
    APCA_API_KEY_ID, APCA_API_SECRET_KEY      (required)
    APCA_PAPER=true                           (default; "false" for a live account)

Read commands (safe, no --yes):
    alpaca.py status                  account + clock + positions + open orders, one JSON
    alpaca.py account | clock | positions | orders [--all]
    alpaca.py fills [--date YYYY-MM-DD]     today's fills (New York date) by default

Write commands (each needs --yes; a live account also needs "paper": false in
trader/config.json, so one setting alone can never send a live order):
    alpaca.py submit --index 1 --yes        place order N of trader/orders.json, only when
                                            trader-risk passed that exact order today AND
                                            trader-broker recorded the user's yes for it
    alpaca.py cancel ORDER_ID --yes | cancel --all --yes
    alpaca.py close SYMBOL [--qty N] --yes | close --all --yes
    alpaca.py move-stop SYMBOL --stop 358.50 --yes        moves the open stop-loss leg
    alpaca.py move-target SYMBOL --target 372.00 --yes    moves the open take-profit leg

Exit 0 on success, 1 on a refusal or an API error (the reason is printed as JSON).
"""
import argparse
import datetime as dt
import importlib.util
import json
import os
import sys
import urllib.error
import urllib.request

try:
    from zoneinfo import ZoneInfo
    NY = ZoneInfo("America/New_York")
except Exception:  # pragma: no cover
    NY = None

HERE = os.path.dirname(os.path.abspath(__file__))
SKILLS = os.path.dirname(HERE)


class Refused(Exception):
    pass


def out(obj, code=0):
    print(json.dumps(obj, indent=2, default=str))
    sys.exit(code)


def ny_today():
    now = dt.datetime.now(NY) if NY else dt.datetime.utcnow() - dt.timedelta(hours=4)
    return now.strftime("%Y-%m-%d")


def read_json(path, default=None):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except FileNotFoundError:
        return default


def paper_mode():
    return os.environ.get("APCA_PAPER", "true").strip().lower() not in ("false", "0", "no", "live")


def base_url():
    return "https://paper-api.alpaca.markets" if paper_mode() else "https://api.alpaca.markets"


def keys():
    k, s = os.environ.get("APCA_API_KEY_ID"), os.environ.get("APCA_API_SECRET_KEY")
    if not k or not s:
        raise Refused("APCA_API_KEY_ID and APCA_API_SECRET_KEY are not set. Add them as environment "
                      "variables (secrets) in the cloud environment settings; never paste keys in chat.")
    return k, s


def api(method, path, body=None, query=None):
    k, s = keys()
    url = base_url() + path
    if query:
        from urllib.parse import urlencode
        url += "?" + urlencode(query)
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "APCA-API-KEY-ID": k, "APCA-API-SECRET-KEY": s,
        "Content-Type": "application/json", "Accept": "application/json",
        "User-Agent": "trading-hq/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read().decode("utf-8")
            return json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as e:
        msg = e.read().decode("utf-8", "replace")
        try:
            msg = json.loads(msg).get("message", msg)
        except Exception:
            pass
        raise Refused("Alpaca %s %s answered %s: %s" % (method, path, e.code, msg))
    except urllib.error.URLError as e:
        raise Refused("could not reach %s (%s). If this is a cloud session, add the host to the "
                      "environment's allowed domains." % (base_url(), e.reason))


def guard_write(args):
    if not args.yes:
        raise Refused("write commands need --yes, given only after the user said yes for this exact action")
    if not paper_mode():
        cfg = read_json("trader/config.json", {}) or {}
        if cfg.get("paper", True) is not False:
            raise Refused("APCA_PAPER is false but trader/config.json still says paper: true. "
                          "Both must say live before a live order can go out.")


def _load(module_path, name):
    spec = importlib.util.spec_from_file_location(name, module_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def to_rest(order):
    """trader-budget's place_stock_order shape -> Alpaca REST /v2/orders body."""
    body = {k: order[k] for k in ("symbol", "side", "qty", "notional", "type", "time_in_force",
                                  "limit_price", "stop_price", "trail_price", "trail_percent",
                                  "extended_hours", "client_order_id", "order_class")
            if order.get(k) is not None}
    if order.get("take_profit_limit_price") is not None:
        body["take_profit"] = {"limit_price": str(order["take_profit_limit_price"])}
    if order.get("stop_loss_stop_price") is not None:
        sl = {"stop_price": str(order["stop_loss_stop_price"])}
        if order.get("stop_loss_limit_price") is not None:
            sl["limit_price"] = str(order["stop_loss_limit_price"])
        body["stop_loss"] = sl
    for k in ("qty", "notional", "limit_price", "stop_price", "trail_price", "trail_percent"):
        if k in body:
            body[k] = str(body[k])
    return body


# ---------------------------------------------------------------- commands

def cmd_status(a):
    return {"paper": paper_mode(), "account": api("GET", "/v2/account"), "clock": api("GET", "/v2/clock"),
            "positions": api("GET", "/v2/positions"),
            "orders": api("GET", "/v2/orders", query={"status": "open", "nested": "true", "limit": 100})}


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
    today = ny_today()
    rv, why = ticket.risk_verdict(read_json(a.risk), fp, today)
    if rv is None:
        raise Refused(why)
    if rv.get("verdict") != "PASS":
        raise Refused("trader-risk BLOCKED this order: " + "; ".join(rv.get("reasons", [])))
    rec = ticket.latest(read_json(a.state, {"orders": []}), fp, today)
    if not rec or rec.get("status") != "approved":
        raise Refused("the user's yes for this exact order is not recorded today "
                      "(ticket.py approve --index %d --reply \"...\")" % a.index)
    if bool(doc.get("paper", True)) != paper_mode():
        raise Refused("orders.json was sized for a %s account but the keys are %s"
                      % ("paper" if doc.get("paper", True) else "live", "paper" if paper_mode() else "live"))
    placed = api("POST", "/v2/orders", body=to_rest(order))
    return {"placed": True, "paper": paper_mode(), "fingerprint": fp, "order": placed,
            "next": "ticket.py result --index %d --status placed --broker-id %s" % (a.index, placed.get("id"))}


def cmd_cancel(a):
    guard_write(a)
    if a.all:
        return {"cancelled": api("DELETE", "/v2/orders")}
    if not a.order_id:
        raise Refused("give an ORDER_ID or --all")
    api("DELETE", "/v2/orders/" + a.order_id)
    return {"cancelled": a.order_id}


def cmd_close(a):
    guard_write(a)
    if a.all:
        return {"closed": api("DELETE", "/v2/positions", query={"cancel_orders": "true"})}
    if not a.symbol:
        raise Refused("give a SYMBOL or --all")
    sym = a.symbol.upper()
    # open bracket legs hold the shares; cancel them first or the close is rejected
    for o in api("GET", "/v2/orders", query={"status": "open", "symbols": sym, "nested": "true"}):
        api("DELETE", "/v2/orders/" + o["id"])
    q = {"qty": str(a.qty)} if a.qty else None
    return {"closed": api("DELETE", "/v2/positions/" + sym, query=q)}


def _open_legs(sym):
    legs = []
    for o in api("GET", "/v2/orders", query={"status": "open", "symbols": sym, "nested": "true"}):
        legs.append(o)
        legs.extend(o.get("legs") or [])
    return [l for l in legs if l.get("status") in ("new", "accepted", "held", "partially_filled",
                                                    "pending_new", "accepted_for_bidding")]


def _move(a, kind):
    guard_write(a)
    sym = a.symbol.upper()
    want = "stop" if kind == "stop" else "limit"
    legs = [l for l in _open_legs(sym) if l.get("side") == "sell" and l.get("type") in
            ((want, "stop_limit") if kind == "stop" else (want,))]
    if not legs:
        raise Refused("no open %s order for %s to move" % ("stop-loss" if kind == "stop" else "take-profit", sym))
    field = "stop_price" if kind == "stop" else "limit_price"
    price = a.stop if kind == "stop" else a.target
    done = [api("PATCH", "/v2/orders/" + l["id"], body={field: "%.2f" % price}) for l in legs]
    return {"moved": kind, "symbol": sym, field: price, "orders": done}


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    for name in ("status", "account", "clock", "positions"):
        sub.add_parser(name)
    s = sub.add_parser("orders"); s.add_argument("--all", action="store_true")
    s = sub.add_parser("fills"); s.add_argument("--date")
    s = sub.add_parser("submit")
    s.add_argument("--index", type=int, default=1)
    s.add_argument("--orders", default="trader/orders.json")
    s.add_argument("--risk", default="trader/state/risk.json")
    s.add_argument("--state", default="trader/state/broker.json")
    s.add_argument("--yes", action="store_true")
    s = sub.add_parser("cancel"); s.add_argument("order_id", nargs="?"); s.add_argument("--all", action="store_true"); s.add_argument("--yes", action="store_true")
    s = sub.add_parser("close"); s.add_argument("symbol", nargs="?"); s.add_argument("--qty", type=float); s.add_argument("--all", action="store_true"); s.add_argument("--yes", action="store_true")
    s = sub.add_parser("move-stop"); s.add_argument("symbol"); s.add_argument("--stop", type=float, required=True); s.add_argument("--yes", action="store_true")
    s = sub.add_parser("move-target"); s.add_argument("symbol"); s.add_argument("--target", type=float, required=True); s.add_argument("--yes", action="store_true")
    a = p.parse_args(argv)
    try:
        if a.cmd == "status":
            res = cmd_status(a)
        elif a.cmd in ("account", "clock", "positions"):
            res = api("GET", "/v2/" + a.cmd)
        elif a.cmd == "orders":
            res = api("GET", "/v2/orders", query={"status": "all" if a.all else "open", "nested": "true", "limit": 100})
        elif a.cmd == "fills":
            res = api("GET", "/v2/account/activities/FILL", query={"date": a.date or ny_today()})
        elif a.cmd == "submit":
            res = cmd_submit(a)
        elif a.cmd == "cancel":
            res = cmd_cancel(a)
        elif a.cmd == "close":
            res = cmd_close(a)
        elif a.cmd == "move-stop":
            res = _move(a, "stop")
        else:
            res = _move(a, "target")
    except Refused as e:
        out({"ok": False, "refused": str(e)}, 1)
    out(res if isinstance(res, dict) else {"ok": True, "data": res})


if __name__ == "__main__":
    main()
