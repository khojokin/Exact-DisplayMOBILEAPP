---
name: Expo web native shims
description: Native modules that crash silently on web and must be shimmed in metro.config.js for the SDA Community app
---

# Expo Web Native Module Shims

When a native-only module is imported anywhere in the app (even transitively through `lib/clerk.ts`), it causes a **silent white screen** on web. The `ErrorBoundary` swallows the crash, leaving no visible error.

## Current shims in `artifacts/sda-community/shims/`

| Module | Shim file | Notes |
|---|---|---|
| `@clerk/clerk-expo` | `clerk-expo-web.js` | Mocks a signed-in preview user |
| `expo-secure-store` | `expo-secure-store.js` | localStorage-based replacement |
| `expo-in-app-purchases` | `expo-in-app-purchases.js` | Empty stub |
| `react-native-keyboard-controller` | `react-native-keyboard-controller.js` | Empty stub |
| `@livekit/react-native` | `livekit-react-native.js` | Empty stub |
| `@livekit/react-native-webrtc` | `livekit-react-native-webrtc.js` | Empty stub |
| `ws` | `ws.js` | Browser WebSocket wrapper |
| `stream` | `empty.js` | Empty stub |

All wired via `config.resolver.resolveRequest` in `metro.config.js` under the `platform === "web"` guard.

**Why:** Native modules use platform-specific C++/Java/Swift code that doesn't exist in the browser. Metro doesn't auto-exclude them on web — the bundle includes them and they crash at runtime.

**How to apply:** Any time you add a new dependency that is native-only (check if it has a `.web.js` export or `"browser"` field in package.json — if not, it needs a shim), add a shim file and a resolver rule in `metro.config.js`.

**Key gotcha:** `lib/clerk.ts` imports `expo-secure-store` directly (not via `@clerk/clerk-expo`), so shimming Clerk alone wasn't enough — `expo-secure-store` needed its own shim too.
