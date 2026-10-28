#!/usr/bin/env python3
"""Resumable CGI image batch for Eagle Bed products.

Each product folder holds jobs.json (the shot list) and progress.json (what is
done). Finished shots are skipped, so the batch can be stopped at any time and
re-run later to carry on where it left off. It stops at the first quota or
billing error instead of retrying, so no credit is wasted.

Usage (from the repo root):
    python3 cgi-studio/run.py cgi-studio/fluted-velvet-bed            # all pending shots
    python3 cgi-studio/run.py cgi-studio/fluted-velvet-bed --max 1    # just the next shot
    python3 cgi-studio/run.py cgi-studio/fluted-velvet-bed --only 01-front --redo
    python3 cgi-studio/run.py cgi-studio/fluted-velvet-bed --status
"""

import argparse
import json
import os
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

SKILL = Path(".agents/skills/nano-banana-2/scripts/generate_image.py")
STOP_WORDS = ("quota", "429", "resource_exhausted", "billing", "api key not valid", "permission_denied")


def now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_progress(path):
    return json.loads(path.read_text()) if path.exists() else {}


def save_progress(path, progress):
    path.write_text(json.dumps(progress, indent=2) + "\n")


def fetch_references(folder, refs):
    for ref in refs.values():
        target = folder / ref["file"]
        if target.exists():
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        print(f"Downloading reference {ref['file']} ...")
        urllib.request.urlretrieve(ref["url"], target)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("folder", type=Path)
    parser.add_argument("--max", type=int, default=0, help="Stop after this many new images (0 = no limit)")
    parser.add_argument("--only", action="append", default=[], help="Run only these job ids")
    parser.add_argument("--redo", action="store_true", help="Regenerate jobs even if already done")
    parser.add_argument("--resolution", default="2K", choices=["512px", "1K", "2K", "4K"])
    parser.add_argument("--status", action="store_true", help="Show progress and exit")
    args = parser.parse_args()

    spec = json.loads((args.folder / "jobs.json").read_text())
    progress_path = args.folder / "progress.json"
    progress = load_progress(progress_path)

    if args.status:
        for job in spec["jobs"]:
            entry = progress.get(job["id"], {})
            print(f"{job['id']:24} {entry.get('status', 'pending'):8} {entry.get('file', '')}")
        return

    if not os.environ.get("GEMINI_API_KEY"):
        sys.exit("GEMINI_API_KEY is not set. Add it in the environment settings and start a new session.")

    fetch_references(args.folder, spec["references"])
    (args.folder / "output").mkdir(exist_ok=True)

    made = 0
    for job in spec["jobs"]:
        if args.only and job["id"] not in args.only:
            continue
        if progress.get(job["id"], {}).get("status") == "done" and not args.redo:
            continue
        if args.max and made >= args.max:
            break

        out = args.folder / "output" / f"{job['id']}.png"
        cmd = ["uv", "run", str(SKILL), "--prompt", f"{spec['style']} {job['prompt']}",
               "--filename", str(out), "--resolution", args.resolution]
        if job.get("aspect"):
            cmd += ["--aspect-ratio", job["aspect"]]
        for ref in job["refs"]:
            cmd += ["--input-image", str(args.folder / spec["references"][ref]["file"])]

        print(f"\n=== {job['id']} ===")
        result = subprocess.run(cmd, capture_output=True, text=True)
        print(result.stdout.strip())

        if result.returncode == 0 and out.exists():
            progress[job["id"]] = {"status": "done", "file": str(out), "resolution": args.resolution, "at": now()}
            save_progress(progress_path, progress)
            made += 1
            continue

        error = (result.stderr or result.stdout).strip()
        progress[job["id"]] = {"status": "failed", "error": error[-500:], "at": now()}
        save_progress(progress_path, progress)
        print(error, file=sys.stderr)
        if any(word in error.lower() for word in STOP_WORDS):
            sys.exit("Stopped: quota, billing or key problem. Fix it, then re-run to continue.")

    print(f"\nMade {made} new image(s). Progress saved in {progress_path}")


if __name__ == "__main__":
    main()
