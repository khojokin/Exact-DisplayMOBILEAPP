# Church Social iOS (SwiftUI + Supabase)

Production-oriented native iOS social media app foundation for a church community with Instagram-style UX, Supabase backend, and scalable modular architecture.

## Architecture

- `SwiftUI` frontend
- `MVVM` feature modules
- `Supabase` for Auth, Postgres, Storage, and Realtime
- `AuthenticationServices` for Apple Sign In
- `GoogleSignIn` for Google Sign In
- `Keychain` for secure token/session storage
- `async/await` service layer with focused managers

## Folder Layout

- `App/` app bootstrap, environment loading, dependency container
- `Core/` shared models, security, network, validation
- `Features/` feature modules (`Auth`, `Feed`, `Profile`, `Messages`, `Church`, `Admin`)
- `Services/` upload, realtime, notifications, moderation managers
- `Supabase/` SQL schema and RLS policies

## Setup

1. Create a new Xcode iOS App project named `ChurchSocial` (SwiftUI lifecycle).
2. Add all source files under this folder into the Xcode target.
3. Add Swift packages:
   - `https://github.com/supabase-community/supabase-swift`
   - `https://github.com/google/GoogleSignIn-iOS`
4. Add URL schemes and entitlements:
   - Apple Sign In capability
   - Google Sign In URL scheme from `GoogleService-Info.plist`
5. Configure `AppEnvironment.plist` in target bundle with keys:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GOOGLE_CLIENT_ID`
6. Apply SQL in `Supabase/schema.sql` to your Supabase project.
7. Create Supabase storage buckets:
   - `avatars` (private/public based on policy preference)
   - `post-media` (private write, signed URL read)
   - `chat-media` (private)

## Local iOS Build (No Expo Cloud)

Build and sign directly on your Mac with Xcode tools:

1. Ensure Xcode is installed and command line tools are selected.
2. Export signing environment variables in your terminal:
   - `APPLE_TEAM_ID`
   - `APPLE_API_KEY_PATH` (path to `AuthKey_XXXXXX.p8`)
   - `APPLE_API_KEY_ID`
   - `APPLE_API_ISSUER_ID`
3. Run from repo root:

```bash
APPLE_TEAM_ID=QRMLKZR9B8 \
APPLE_API_KEY_PATH=/absolute/path/AuthKey_XXXXXX.p8 \
APPLE_API_KEY_ID=XXXXXX \
APPLE_API_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
bash scripts/ios-build-local.sh
```

Optional upload to App Store Connect in one step:

```bash
APPLE_TEAM_ID=QRMLKZR9B8 \
APPLE_API_KEY_PATH=/absolute/path/AuthKey_XXXXXX.p8 \
APPLE_API_KEY_ID=XXXXXX \
APPLE_API_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
bash scripts/ios-build-local.sh --upload
```

Generated IPA path:
- `artifacts/sda-community/ios/build/export`

## Security Notes

- Access tokens are persisted in Keychain, not UserDefaults.
- RLS requires authenticated access and ownership checks.
- Username uniqueness is enforced by a case-insensitive unique index.
- Input validation is enforced both on client and in DB constraints.

## App Store Readiness Notes

- Keep digital subscriptions and upgrades compliant with App Store IAP rules.
- Ensure privacy strings, Sign In with Apple, and data handling declarations are complete.
- Backend data lives in Supabase and is independent from app updates, so app updates do not delete accounts/data.
