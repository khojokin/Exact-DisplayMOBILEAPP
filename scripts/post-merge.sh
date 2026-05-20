#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push

# Patch Expo CORS middleware to allow Replit proxy domains (.replit.dev, .replit.app)
# This is needed because Replit proxies requests through a different origin than localhost.
patch_cors() {
  local file="$1"
  if [ -f "$file" ]; then
    if grep -q 'isReplitDomain' "$file"; then
      echo "CORS patch already applied: $file"
    else
      sed -i 's/const isAllowedHost = allowedHosts.includes(host) || isLocalhost;/const isReplitDomain = hostname.endsWith(".replit.dev") || hostname.endsWith(".replit.app"); const isAllowedHost = allowedHosts.includes(host) || allowedHosts.includes(hostname) || isLocalhost || isReplitDomain;/' "$file"
      echo "Applied CORS patch: $file"
    fi
  fi
}

for f in node_modules/.pnpm/@expo+cli*/node_modules/@expo/cli/build/src/start/server/middleware/CorsMiddleware.js; do
  patch_cors "$f"
done
