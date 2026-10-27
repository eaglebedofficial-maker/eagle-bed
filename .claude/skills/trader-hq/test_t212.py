#!/usr/bin/env python3
"""Proves t212.py against a local mock of the Trading 212 API (no network, no money).

    python3 .claude/skills/trader-hq/test_t212.py -v

The mock checks the Basic auth header, keeps positions, fills market orders at
the current price (qty > 0 buys, qty < 0 sells, like Trading 212), and lets a
test move prices. Each test runs the real tools (trader-risk check.py,
trader-broker ticket.py, t212.py) as subprocesses in a fresh folder.
"""
import base64
import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
SKILLS = os.path.dirname(HERE)
KEY, SECRET = "KEYabc123", "SECRETxyz789"
AUTH = "Basic " + base64.b64encode(("%s:%s" % (KEY, SECRET)).encode()).decode()

ORDERS = {"created_by": "trader-budget", "paper": True, "orders": [{
    "symbol": "TSLA", "side": "buy", "qty": "8", "type": "market", "time_in_force": "day",
    "order_class": "bracket", "take_profit_limit_price": "370.04", "stop_loss_stop_price": "358.32",
    "plan": {"entry": 364.18, "stop": 358.32, "target": 370.04}}]}


class Broker:
    def __init__(self):
        self.prices = {"TSLA_US_EQ": 364.18, "AAPL_US_EQ": 230.00, "NVDA_US_EQ": 140.00}
        # the user's own long-term holding, which the desk must never sell
        self.positions = {"AAPL_US_EQ": {"quantity": 10.0, "averagePrice": 180.0}}
        self.orders, self.n = [], 0

    def portfolio(self):
        return [{"ticker": t, "quantity": p["quantity"], "averagePrice": p["averagePrice"],
                 "currentPrice": self.prices[t], "ppl": round((self.prices[t] - p["averagePrice"]) * p["quantity"], 2),
                 "fxPpl": 0} for t, p in self.positions.items() if p["quantity"] > 0]

    def market(self, ticker, qty):
        self.n += 1
        price = self.prices[ticker]
        p = self.positions.setdefault(ticker, {"quantity": 0.0, "averagePrice": price})
        if qty > 0:
            p["averagePrice"] = (p["averagePrice"] * p["quantity"] + price * qty) / (p["quantity"] + qty)
        elif -qty > p["quantity"] + 1e-9:
            return None
        p["quantity"] = round(p["quantity"] + qty, 6)
        o = {"id": self.n, "ticker": ticker, "quantity": qty, "filledQuantity": qty, "filledValue": price * abs(qty), "status": "FILLED"}
        self.orders.append(o)
        return o


def make_handler(broker):
    class H(BaseHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def send(self, code, obj):
            body = json.dumps(obj).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def authed(self):
            if self.headers.get("Authorization") != AUTH:
                self.send(401, {"code": "AuthenticationFailed"})
                return False
            return True

        def do_GET(self):
            if not self.authed():
                return
            p = self.path.split("?")[0]
            if p == "/api/v0/equity/account/cash":
                inv = sum(x["averagePrice"] * x["quantity"] for x in broker.positions.values())
                return self.send(200, {"free": 5000.0, "total": 5000.0 + inv, "invested": inv, "ppl": 0, "result": 0, "blocked": 0})
            if p == "/api/v0/equity/account/info":
                return self.send(200, {"currencyCode": "GBP", "id": 1})
            if p == "/api/v0/equity/portfolio":
                return self.send(200, broker.portfolio())
            if p == "/api/v0/equity/orders":
                return self.send(200, [])
            if p == "/api/v0/equity/metadata/instruments":
                return self.send(200, [{"ticker": t, "shortName": t.split("_")[0], "type": "STOCK", "currencyCode": "USD"} for t in broker.prices])
            self.send(404, {"code": "NotFound"})

        def do_POST(self):
            if not self.authed():
                return
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
            if self.path == "/api/v0/equity/orders/market":
                o = broker.market(body["ticker"], float(body["quantity"]))
                return self.send(200, o) if o else self.send(400, {"code": "SellingEquityNotOwned"})
            self.send(404, {"code": "NotFound"})

        def do_DELETE(self):
            if not self.authed():
                return
            self.send(200, {})
    return H


class T212Test(unittest.TestCase):
    def setUp(self):
        self.broker = Broker()
        self.srv = ThreadingHTTPServer(("127.0.0.1", 0), make_handler(self.broker))
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()
        self.dir = tempfile.mkdtemp()
        os.makedirs(os.path.join(self.dir, "trader"))
        shutil.copy(os.path.join(SKILLS, "trader-budget", "config.example.json"), os.path.join(self.dir, "trader", "config.json"))
        with open(os.path.join(self.dir, "trader", "orders.json"), "w") as fh:
            json.dump(ORDERS, fh)
        self.env = dict(os.environ, T212_API_KEY=KEY, T212_API_SECRET=SECRET, T212_ENV="demo",
                        T212_BASE_URL="http://127.0.0.1:%d/api/v0" % self.srv.server_address[1],
                        NO_PROXY="127.0.0.1,localhost", no_proxy="127.0.0.1,localhost")

    def tearDown(self):
        self.srv.shutdown()
        self.srv.server_close()
        shutil.rmtree(self.dir, ignore_errors=True)

    def run_tool(self, *args, tool="trader-hq/t212.py", env=None):
        r = subprocess.run([sys.executable, os.path.join(SKILLS, tool)] + list(args), cwd=self.dir,
                           env=env or self.env, capture_output=True, text=True, timeout=60)
        try:
            return r.returncode, json.loads(r.stdout)
        except ValueError:
            return r.returncode, {"raw": r.stdout + r.stderr}

    def today(self):
        import datetime
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo("America/New_York")).strftime("%Y-%m-%d")

    def pass_risk_and_approve(self):
        r = subprocess.run([sys.executable, os.path.join(SKILLS, "trader-risk", "check.py"), "--now", self.today() + " 10:15"],
                           cwd=self.dir, env=self.env, capture_output=True, text=True)
        self.assertIn("1 passed", r.stdout, r.stdout + r.stderr)
        r = subprocess.run([sys.executable, os.path.join(SKILLS, "trader-broker", "ticket.py"), "approve", "--index", "1", "--reply", "Yes, place it"],
                           cwd=self.dir, env=self.env, capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)

    # ------------------------------------------------------------ reading

    def test_status_reads_cash_and_holdings_with_basic_auth(self):
        code, res = self.run_tool("status")
        self.assertEqual(code, 0, res)
        self.assertEqual(res["currency"], "GBP")
        self.assertEqual(res["items"][0]["t212"], "AAPL_US_EQ")
        self.assertEqual(res["items"][0]["symbol"], "AAPL")

    def test_same_key_and_secret_is_explained(self):
        env = dict(self.env, T212_API_SECRET=KEY)
        code, res = self.run_tool("cash", env=env)
        self.assertEqual(code, 1)
        self.assertIn("same as T212_API_KEY", res["refused"])

    def test_wrong_secret_is_a_401(self):
        code, res = self.run_tool("cash", env=dict(self.env, T212_API_SECRET="nope"))
        self.assertEqual(code, 1)
        self.assertIn("401", res["refused"])

    # ------------------------------------------------------------ the gates

    def test_no_order_without_yes_flag(self):
        code, res = self.run_tool("submit", "--index", "1")
        self.assertEqual(code, 1)
        self.assertIn("--yes", res["refused"])
        self.assertEqual(self.broker.orders, [])

    def test_no_order_without_risk_pass(self):
        code, res = self.run_tool("submit", "--index", "1", "--yes")
        self.assertEqual(code, 1)
        self.assertIn("trader-risk", res["refused"])
        self.assertEqual(self.broker.orders, [])

    def test_no_order_without_the_users_recorded_yes(self):
        subprocess.run([sys.executable, os.path.join(SKILLS, "trader-risk", "check.py"), "--now", self.today() + " 10:15"],
                       cwd=self.dir, env=self.env, capture_output=True, text=True)
        code, res = self.run_tool("submit", "--index", "1", "--yes")
        self.assertEqual(code, 1)
        self.assertIn("yes for this exact order", res["refused"])
        self.assertEqual(self.broker.orders, [])

    def test_live_account_needs_live_mode_in_the_app(self):
        self.pass_risk_and_approve()
        code, res = self.run_tool("submit", "--index", "1", "--yes", env=dict(self.env, T212_ENV="live"))
        self.assertEqual(code, 1)
        self.assertIn("paper: true", res["refused"])
        self.assertEqual(self.broker.orders, [])

    def test_never_day_trades_a_stock_the_user_owns(self):
        orders = json.loads(json.dumps(ORDERS))
        orders["orders"][0]["symbol"] = "AAPL"
        orders["orders"][0]["stop_loss_stop_price"], orders["orders"][0]["take_profit_limit_price"] = "226.00", "238.00"
        orders["orders"][0]["qty"] = "5"
        orders["orders"][0]["plan"] = {"entry": 230.0}
        with open(os.path.join(self.dir, "trader", "orders.json"), "w") as fh:
            json.dump(orders, fh)
        self.pass_risk_and_approve()
        code, res = self.run_tool("submit", "--index", "1", "--yes")
        self.assertEqual(code, 1)
        self.assertIn("already hold AAPL", res["refused"])
        self.assertEqual(self.broker.orders, [])

    # ------------------------------------------------------------ the trade

    def test_approved_order_buys_and_records_the_managed_bracket(self):
        self.pass_risk_and_approve()
        code, res = self.run_tool("submit", "--index", "1", "--yes")
        self.assertEqual(code, 0, res)
        self.assertEqual(self.broker.orders[-1]["quantity"], 8.0)
        self.assertEqual(self.broker.positions["TSLA_US_EQ"]["quantity"], 8.0)
        code, desk = self.run_tool("desk")
        t = desk["trades"][0]
        self.assertEqual((t["entry"], t["stop"], t["target"], t["open"]), (364.18, 358.32, 370.04, True))

    def test_stop_hit_sells_only_the_desk_quantity(self):
        self.pass_risk_and_approve()
        self.run_tool("submit", "--index", "1", "--yes")
        self.broker.prices["TSLA_US_EQ"] = 358.00
        self.broker.prices["AAPL_US_EQ"] = 100.00  # the user's holding crashes: the desk must not touch it
        code, res = self.run_tool("manage", "--yes")
        self.assertEqual(code, 0, res)
        self.assertEqual(res["actions"][0]["reason"], "stop")
        self.assertEqual(self.broker.positions["TSLA_US_EQ"]["quantity"], 0)
        self.assertEqual(self.broker.positions["AAPL_US_EQ"]["quantity"], 10.0)

    def test_target_hit_sells(self):
        self.pass_risk_and_approve()
        self.run_tool("submit", "--index", "1", "--yes")
        self.broker.prices["TSLA_US_EQ"] = 370.50
        code, res = self.run_tool("manage", "--yes")
        self.assertEqual(res["actions"][0]["reason"], "target")
        self.assertEqual(self.broker.positions["TSLA_US_EQ"]["quantity"], 0)

    def test_break_even_moves_the_stop_then_protects_the_trade(self):
        self.pass_risk_and_approve()
        self.run_tool("submit", "--index", "1", "--yes")
        # the fixture's target is 1R; widen it to 2R so +1R is reached before the target
        desk_path = os.path.join(self.dir, "trader", "state", "t212_desk.json")
        with open(desk_path) as fh:
            d = json.load(fh)
        d["trades"][0]["target"] = 375.90
        with open(desk_path, "w") as fh:
            json.dump(d, fh)
        self.broker.prices["TSLA_US_EQ"] = 364.18 + 5.86   # up exactly 1R
        code, res = self.run_tool("manage", "--yes", "--break-even")
        self.assertEqual(res["actions"][0]["moved_stop_to"], 364.18)
        self.broker.prices["TSLA_US_EQ"] = 364.10
        code, res = self.run_tool("manage", "--yes", "--break-even")
        self.assertEqual(res["actions"][0]["reason"], "break-even stop")

    def test_flat_by_close_sells_todays_trade(self):
        self.pass_risk_and_approve()
        self.run_tool("submit", "--index", "1", "--yes")
        code, res = self.run_tool("manage", "--yes", "--flat-by", "00:00")
        self.assertEqual(res["actions"][0]["reason"], "flat by close")

    def test_move_stop_rules(self):
        self.pass_risk_and_approve()
        self.run_tool("submit", "--index", "1", "--yes")
        code, res = self.run_tool("move-stop", "TSLA", "--stop", "365", "--yes")
        self.assertEqual(code, 1)
        self.assertIn("below the current price", res["refused"])
        code, res = self.run_tool("move-stop", "TSLA", "--stop", "361.00", "--yes")
        self.assertEqual((code, res["stop"]), (0, 361.0))

    def test_close_all_never_sells_the_users_holdings(self):
        self.pass_risk_and_approve()
        self.run_tool("submit", "--index", "1", "--yes")
        code, res = self.run_tool("close", "--all", "--reason", "stopped by you", "--yes")
        self.assertEqual(code, 0, res)
        self.assertEqual([c["symbol"] for c in res["closed"]], ["TSLA"])
        self.assertEqual(self.broker.positions["AAPL_US_EQ"]["quantity"], 10.0)
        code, res = self.run_tool("close", "AAPL", "--yes")
        self.assertEqual(code, 1)
        self.assertIn("never sold by the desk", res["refused"])


if __name__ == "__main__":
    unittest.main()
