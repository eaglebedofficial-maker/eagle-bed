#!/usr/bin/env bash
# Show OmniRoute routing status and send one tiny test request per tier.
# usage: bash tools/omniroute/route-status.sh [--no-test]
set -uo pipefail
export NO_COLOR=1
URL="http://127.0.0.1:20128"
KEY_FILE="${OMNIROUTE_HOME:-$HOME/.omniroute}/claude-code.key"
q() { "$@" 2>&1 | grep -v -e "Loaded env" -e "is ignored"; }

echo "== Server";      q omniroute health | grep -E "Status|Version"
echo "== Providers";   q omniroute providers status
echo "== Combos";      q omniroute combo list | grep eb-
echo "== Breakers / cooldowns"; q omniroute resilience breakers; q omniroute resilience cooldowns
[ "${1:-}" = "--no-test" ] && exit 0

echo "== Live routing test (tiny prompt, max 64 tokens)"
K="$(cat "$KEY_FILE")"
for m in eb-simple eb-medium eb-complex eb-critical auto/coding auto/cheap; do
  hdr="$(curl -sS -m 120 -o /dev/null -D - -H "Authorization: Bearer $K" -H 'content-type: application/json' \
    "$URL/v1/messages" -d "{\"model\":\"$m\",\"max_tokens\":64,\"messages\":[{\"role\":\"user\",\"content\":\"Reply OK\"}]}")"
  code="$(head -1 <<<"$hdr" | awk '{print $2}')"
  model="$(grep -i '^x-omniroute-model:' <<<"$hdr" | cut -d' ' -f2 | tr -d '\r')"
  prov="$(grep -i '^x-omniroute-provider:' <<<"$hdr" | cut -d' ' -f2 | tr -d '\r')"
  fb="$(grep -i '^x-omniroute-fallback-attempts:' <<<"$hdr" | cut -d' ' -f2 | tr -d '\r')"
  printf '%-13s http=%s -> %s/%s%s\n' "$m" "$code" "${prov:-?}" "${model:-?}" "${fb:+  (skipped $fb unavailable/failed targets)}"
done
