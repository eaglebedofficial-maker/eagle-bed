#!/usr/bin/env bash
# Idempotent installer: OmniRoute + tiered, quota-aware routing for Claude Code.
# Safe to re-run. Never prints secrets. Secrets live only in ~/.omniroute (chmod 600).
#
# Optional env (read from the environment, never written to the repo):
#   GEMINI_API_KEY      Google AI Studio key  -> free/cheap tiers
#   ANTHROPIC_API_KEY   Anthropic Console key -> Claude in the complex/critical tiers
#   GROQ_API_KEY, CEREBRAS_API_KEY, OPENROUTER_API_KEY, MISTRAL_API_KEY -> extra free tiers
set -euo pipefail

VERSION="${OMNIROUTE_VERSION:-3.8.53}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OMNI_HOME="${OMNIROUTE_HOME:-$HOME/.omniroute}"
URL="http://127.0.0.1:20128"
API="node $HERE/omni-api.mjs"
export NO_COLOR=1
q() { "$@" 2>&1 | grep -v -e "Loaded env" -e "is ignored" || true; }
log() { printf '\n==> %s\n' "$*"; }

log "1/8 Install omniroute@$VERSION"
if [ "$(omniroute --version 2>/dev/null | tail -1)" != "$VERSION" ]; then
  npm install -g "omniroute@$VERSION" --no-fund --no-audit --loglevel=error
fi
omniroute --version 2>/dev/null | tail -1

log "2/8 Harden local config (loopback only, API key required, random admin password)"
umask 077
mkdir -p "$OMNI_HOME"
touch "$OMNI_HOME/.env"
grep -q '^OMNIROUTE_SERVER_HOST=' "$OMNI_HOME/.env" || echo 'OMNIROUTE_SERVER_HOST=127.0.0.1' >>"$OMNI_HOME/.env"
grep -q '^REQUIRE_API_KEY=' "$OMNI_HOME/.env" || echo 'REQUIRE_API_KEY=true' >>"$OMNI_HOME/.env"
if [ ! -s "$OMNI_HOME/admin.pass" ]; then
  head -c 24 /dev/urandom | base64 | tr -d '/+=\n' >"$OMNI_HOME/admin.pass"
fi
# The npm package ships INITIAL_PASSWORD=CHANGEME; override it with our random one.
if ! grep -q '^INITIAL_PASSWORD=' "$OMNI_HOME/.env"; then
  printf 'INITIAL_PASSWORD=%s\n' "$(cat "$OMNI_HOME/admin.pass")" >>"$OMNI_HOME/.env"
fi
umask 022

log "3/8 Start server"
if ! curl -fsS -m 3 "$URL/api/health" >/dev/null 2>&1; then
  q omniroute serve --daemon --no-open --no-tray >/dev/null
fi
for _ in $(seq 1 90); do curl -fsS -m 2 "$URL/api/health" >/dev/null 2>&1 && break; sleep 1; done
q omniroute setup --non-interactive --password "$(cat "$OMNI_HOME/admin.pass")" | grep -E "✔|✖" || true
q omniroute restart >/dev/null
for _ in $(seq 1 90); do curl -fsS -m 2 "$URL/api/health" >/dev/null 2>&1 && break; sleep 1; done
curl -fsS -m 3 "$URL/api/health" >/dev/null && echo "server healthy on $URL (loopback)"

log "4/8 Provider connections (keys read from env; values never echoed)"
existing="$(q omniroute providers list)"
add_provider() { # provider name envvar priority
  local provider="$1" name="$2" var="$3" prio="$4"
  if [ -z "${!var:-}" ]; then echo "skip $name: \$$var not set"; return; fi
  if grep -q " $name " <<<"$existing"; then echo "ok   $name (already connected)"; return; fi
  q omniroute providers add "$provider" --name "$name" --credential-env "$var" --priority "$prio" --yes
}
add_provider gemini     gemini-free     GEMINI_API_KEY     1
add_provider groq       groq-free       GROQ_API_KEY       2
add_provider cerebras   cerebras-free   CEREBRAS_API_KEY   2
add_provider openrouter openrouter-free OPENROUTER_API_KEY 3
add_provider mistral    mistral-free    MISTRAL_API_KEY    3
add_provider anthropic  anthropic-api   ANTHROPIC_API_KEY  5

log "5/8 Client key for Claude Code"
if [ ! -s "$OMNI_HOME/claude-code.key" ]; then
  $API create-client-key claude-code-local
else
  echo "ok   ~/.omniroute/claude-code.key exists"
fi

log "6/8 Tier combos (priority = ordered fallback chain)"
combos="$(q omniroute combo list)"
mk() { # name models
  if grep -qw "$1" <<<"$combos"; then echo "ok   $1"; else q omniroute combo create "$1" --strategy priority --models "$2"; fi
}
mk eb-simple   "gemini/gemini-3.1-flash-lite,gemini/gemini-3.7-flash,gemini/gemini-3.8-flash,groq/llama-3.3-70b-versatile,gemini/gemini-3.5-flash"
mk eb-medium   "gemini/gemini-3.8-flash,gemini/gemini-3.1-pro-preview,anthropic/claude-sonnet-5-5,gemini/gemini-pro-latest"
mk eb-complex  "gemini/gemini-3.1-pro-preview,anthropic/claude-sonnet-5-5,anthropic/claude-opus-5-5,gemini/gemini-pro-latest"
mk eb-critical "anthropic/claude-opus-5-5,anthropic/claude-sonnet-5-5,gemini/gemini-3.1-pro-preview,gemini/gemini-pro-latest"

log "7/8 Resilience (quota-aware cooldowns, circuit breakers) + quality-safe compression"
$API cli PATCH /api/resilience '{
  "providerCooldown":{"enabled":true,"minRetryCooldownMs":5000,"maxRetryCooldownMs":900000},
  "quotaPreflight":{"enabled":true,"defaultThresholdPercent":5,"warnThresholdPercent":20,"providerWindowDefaults":{}},
  "providerBreaker":{"oauth":{"failureThreshold":5,"degradationThreshold":3,"resetTimeoutMs":120000},
                     "apikey":{"failureThreshold":5,"degradationThreshold":3,"resetTimeoutMs":60000}},
  "streamStallCooldown":{"enabled":true},
  "waitForCooldown":{"enabled":true,"maxRetries":1,"maxRetryWaitSec":20}
}' >/dev/null && echo "resilience applied"
$API dash PUT /api/settings/compression '{
  "enabled":true,"defaultMode":"lite","autoTriggerMode":"rtk","autoTriggerTokens":80000,
  "preserveSystemPrompt":true,"lite":{"compressToolResults":false},
  "engines":{"session-dedup":{"enabled":true},"lite":{"enabled":true},"rtk":{"enabled":true,"level":"minimal"},"caveman":{"enabled":false,"level":"lite"}},
  "cavemanConfig":{"enabled":false,"compressRoles":["user"],"skipRules":[],"minMessageLength":50,"preservePatterns":[],"intensity":"lite"},
  "comboOverrides":{"eb-critical":"off"}
}' >/dev/null && echo "compression applied"

log "8/8 Claude Code integration"
install -m 644 "$HERE/claude-routed.settings.json" "$OMNI_HOME/claude-routed.settings.json"
BIN_DIR="${OMNIROUTE_BIN_DIR:-$(dirname "$(command -v claude || echo /usr/local/bin/claude)")}"
install -m 755 "$HERE/claude-routed" "$BIN_DIR/claude-routed"
echo "installed $BIN_DIR/claude-routed  (settings: $OMNI_HOME/claude-routed.settings.json)"
echo
echo "Done. Verify with: bash $HERE/route-status.sh"
