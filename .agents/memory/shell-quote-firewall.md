---
name: shell-quote firewall block
description: Replit package firewall blocks shell-quote 1.8.1–1.8.3; 1.8.4+ passes. Override pinned in pnpm-workspace.yaml overrides.
---

# shell-quote firewall block

**Rule:** `shell-quote` versions 1.8.1, 1.8.2, and 1.8.3 return HTTP 403 from the Replit package firewall (`package-firewall.replit.local`). Version 1.8.4 returns 200 OK.

**Why:** Replit's security scanner blocks those specific versions (likely a CVE or policy flag). The age-gate (`minimumReleaseAge`) is NOT the cause — 1.8.3 is over 1 year old.

**How to apply:** The `pnpm-workspace.yaml` `overrides` section pins `shell-quote: "1.8.4"`. If the override is ever removed and installs break again, check `curl -I "http://package-firewall.replit.local/npm/shell-quote/-/shell-quote-<version>.tgz"` to find which version passes (200 OK) and re-add the override.

**Context:** `shell-quote` is a transitive dep of `react-devtools-core` via `react-native`. It is not a direct dependency of this project.
