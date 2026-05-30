#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT_DIR/artifacts/sda-community"
SCRIPT_PATH="$APP_DIR/scripts/ios-local-appstore.sh"

if [[ ! -f "$SCRIPT_PATH" ]]; then
  echo "Missing script: $SCRIPT_PATH"
  exit 1
fi

if [[ -z "${APPLE_TEAM_ID:-}" ]]; then
  echo "APPLE_TEAM_ID is required (example: QRMLKZR9B8)."
  exit 1
fi

# Optional but recommended for non-interactive automatic signing
# APPLE_API_KEY_PATH=/absolute/path/AuthKey_XXXXXX.p8
# APPLE_API_KEY_ID=XXXXXX
# APPLE_API_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

bash "$SCRIPT_PATH" "$@"
