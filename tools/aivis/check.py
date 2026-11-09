#!/usr/bin/env python3
"""AI recommendation check for Eagle Bed.

Asks real UK buyer questions to Google Gemini with live Google Search grounding (the same
source Google AI Overviews and Gemini answers use) and records, for each question:
whether Eagle Bed is named, whether eaglebed.co.uk is cited, and which shops are recommended.

Usage: python3 tools/aivis/check.py [--out FILE] [--prompts FILE]
Needs GEMINI_API_KEY. Writes JSON (default tools/aivis/latest.json).
"""
import argparse, datetime, json, os, re, sys, time, urllib.request, urllib.error
from urllib.parse import urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = os.environ.get("EB_AIVIS_MODEL", "gemini-3.5-flash")
DEFAULT_PROMPTS = [
    "What is the best place to buy an upholstered bed online in the UK?",
    "Where can I buy a cheap but good quality bed in the UK?",
    "Best ottoman storage bed in the UK?",
    "Who makes handmade beds in the UK?",
    "Best UK bed manufacturers that sell direct to the public",
    "Bed shop near Dewsbury",
    "Where to buy a bed in West Yorkshire?",
    "Best velvet wingback bed UK",
    "Best divan bed with storage UK",
    "Best kids beds UK",
    "Best value mattress UK",
    "Chesterfield bed UK where to buy",
]
BRAND_RE = re.compile(r"eagle\s*bed", re.I)


def ask(q, key, tries=3):
    body = {"contents": [{"role": "user", "parts": [{"text":
            q + "\n\nAnswer as a helpful shopping assistant for a buyer in the United Kingdom. "
                "Name the specific shops, brands or websites you recommend and say briefly why."}]}],
            "tools": [{"google_search": {}}]}
    url = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent" % MODEL
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode(), method="POST",
                                         headers={"Content-Type": "application/json", "x-goog-api-key": key})
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            last = "HTTP %s %s" % (e.code, e.read()[:300])
        except Exception as e:
            last = repr(e)
        time.sleep(3 * (i + 1))
    return {"error": last}


def domain(u):
    try:
        return urlparse(u).netloc.lower().replace("www.", "")
    except Exception:
        return ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(HERE, "latest.json"))
    ap.add_argument("--prompts")
    a = ap.parse_args()
    key = os.environ.get("GEMINI_API_KEY") or sys.exit("GEMINI_API_KEY is not set")
    prompts = json.load(open(a.prompts)) if a.prompts else DEFAULT_PROMPTS
    rows = []
    for q in prompts:
        d = ask(q, key)
        if "error" in d:
            rows.append({"prompt": q, "error": d["error"]})
            continue
        c = (d.get("candidates") or [{}])[0]
        text = "".join(p.get("text", "") for p in c.get("content", {}).get("parts", []))
        gm = c.get("groundingMetadata") or {}
        sources = []
        for ch in gm.get("groundingChunks", []) or []:
            w = ch.get("web") or {}
            title = w.get("title") or ""
            sources.append(title if "." in title else domain(w.get("uri", "")))
        sources = [s for s in sources if s]
        named = bool(BRAND_RE.search(text))
        cited = any("eaglebed" in s.lower() for s in sources)
        shops = sorted(set(re.findall(r"\b([A-Z][A-Za-z&']+(?: [A-Z][A-Za-z&']+){0,2})\b(?=[^.]{0,40}(?:\.co\.uk|\.com|beds?\b))", text)))[:12]
        rows.append({"prompt": q, "named": named, "cited": cited, "sources": sources[:10],
                     "shops": shops, "answer": text[:1200], "queries": gm.get("webSearchQueries", [])[:4]})
        print(("YES " if named or cited else "no  ") + q, file=sys.stderr)
    ok = [r for r in rows if "error" not in r]
    out = {"at": int(time.time() * 1000), "date": datetime.date.today().isoformat(), "model": MODEL,
           "asked": len(ok), "named": sum(1 for r in ok if r["named"]), "cited": sum(1 for r in ok if r["cited"]),
           "rows": rows}
    comp = {}
    for r in ok:
        for s in r["sources"]:
            s2 = s.lower()
            if "eaglebed" in s2:
                continue
            comp[s2] = comp.get(s2, 0) + 1
    out["topSources"] = sorted(comp.items(), key=lambda x: -x[1])[:15]
    json.dump(out, open(a.out, "w"), indent=1)
    print(json.dumps({k: out[k] for k in ("date", "asked", "named", "cited")} | {"top": out["topSources"][:8]}))


if __name__ == "__main__":
    main()
