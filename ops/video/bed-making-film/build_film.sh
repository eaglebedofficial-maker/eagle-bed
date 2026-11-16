#!/usr/bin/env bash
# Renders the Eagle Bed brand film in 16:9 and 9:16 (one encoded file per scene, 4 in parallel),
# joins them with the concat demuxer (-c copy) and adds the music bed.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="${WORK:-$HERE/.build}"
MUSIC="${MUSIC:-$HERE/../../../tools/cinema/music/luxury.mp3}"
mkdir -p "$WORK"
read -r NSC TOTAL < <(python3 "$HERE/render_film.py" --info)
echo "scenes=$NSC total=${TOTAL}s"

# music: loop the 24s track with 2s crossfades, fade in/out, trim to film length
python3 - "$MUSIC" "$TOTAL" "$WORK/music.m4a" <<'PY'
import subprocess, sys, math
src, total, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
L = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",src]))
n = max(1, math.ceil((total + 2) / (L - 2)) + 1)
inputs = sum([["-i", src] for _ in range(n)], [])
f, cur = [], "[0:a]"
for i in range(1, n):
    f.append("%s[%d:a]acrossfade=d=2:c1=tri:c2=tri[a%d]" % (cur, i, i)); cur = "[a%d]" % i
f.append("%satrim=0:%.3f,afade=t=in:d=1.0,afade=t=out:st=%.3f:d=3.0,volume=0.9[out]" % (cur, total, total - 3.0))
subprocess.check_call(["ffmpeg","-y","-loglevel","error"]+inputs+["-filter_complex",";".join(f),"-map","[out]","-c:a","aac","-b:a","192k",out])
PY

for FMT in 16x9 9x16; do
  pids=()
  for ((i=0;i<NSC;i++)); do
    OUT="$WORK/${FMT}_scene$(printf %02d $i).mp4"
    [ -s "$OUT" ] && continue
    ( python3 "$HERE/render_film.py" --format "$FMT" --scene "$i" --out "$OUT.part.mp4" 2>/dev/null \
        && mv "$OUT.part.mp4" "$OUT" ) &
    pids+=($!)
    if (( ${#pids[@]} >= 4 )); then wait "${pids[0]}"; pids=("${pids[@]:1}"); fi
  done
  wait
  : > "$WORK/${FMT}_list.txt"
  for ((i=0;i<NSC;i++)); do echo "file '${FMT}_scene$(printf %02d $i).mp4'" >> "$WORK/${FMT}_list.txt"; done
  ffmpeg -y -loglevel error -f concat -safe 0 -i "$WORK/${FMT}_list.txt" -c copy "$WORK/${FMT}_silent.mp4"
  ffmpeg -y -loglevel error -i "$WORK/${FMT}_silent.mp4" -i "$WORK/music.m4a" -map 0:v -map 1:a -c:v copy -c:a copy \
     -shortest -movflags +faststart "$HERE/eagle-bed-film_${FMT}.mp4.part.mp4"
  mv "$HERE/eagle-bed-film_${FMT}.mp4.part.mp4" "$HERE/eagle-bed-film_${FMT}.mp4"
  echo "done $FMT"
done
