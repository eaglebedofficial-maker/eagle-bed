#!/usr/bin/env python3
"""Upload a file to a Shopify staged upload target.

Usage: python3 tools/cinema/staged_upload.py TARGET_JSON FILE
TARGET_JSON is a file holding one stagedTargets entry from the Shopify Admin mutation
stagedUploadsCreate (keys: url, resourceUrl, parameters[{name,value}]).
Use resource FILE (not VIDEO) so Shopify keeps the original 4K file instead of transcoding.
Afterwards call fileCreate(originalSource: resourceUrl, contentType: FILE) and read the
GenericFile url: a public https://cdn.shopify.com/... link that Zapier and Publer can fetch.
"""
import json, subprocess, sys

t = json.load(open(sys.argv[1]))
if "stagedTargets" in t:
    t = t["stagedTargets"][0]
cmd = ["curl", "-sS", "-m", "600", "-o", "/dev/null", "-w", "%{http_code}", t["url"]]
for p in t["parameters"]:
    cmd += ["-F", "%s=%s" % (p["name"], p["value"])]
cmd += ["-F", "file=@%s;type=video/mp4" % sys.argv[2]]
code = subprocess.run(cmd, capture_output=True, text=True).stdout.strip()
print(json.dumps({"http": code, "resourceUrl": t["resourceUrl"], "ok": code in ("200", "201", "204")}))
sys.exit(0 if code in ("200", "201", "204") else 1)
