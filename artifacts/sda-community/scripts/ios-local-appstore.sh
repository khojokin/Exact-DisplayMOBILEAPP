#!/usr/bin/env bash
set -euo pipefail

UPLOAD=false
for arg in "$@"; do
  case "$arg" in
    --upload)
      UPLOAD=true
      ;;
    *)
      echo "Unknown argument: $arg"
      echo "Usage: scripts/ios-local-appstore.sh [--upload]"
      exit 1
      ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IOS_DIR="$ROOT_DIR/ios"
ARCHIVE_PATH="${ARCHIVE_PATH:-$IOS_DIR/build/SDACommunity.xcarchive}"
EXPORT_DIR="${EXPORT_DIR:-$IOS_DIR/build/export}"
EXPORT_OPTIONS_PLIST="${EXPORT_OPTIONS_PLIST:-$IOS_DIR/build/ExportOptions.plist}"
EXPORT_METHOD="${EXPORT_METHOD:-app-store}"
SCHEME="${IOS_SCHEME:-SDACommunity}"
WORKSPACE="${IOS_WORKSPACE:-SDACommunity.xcworkspace}"
TEAM_ID="${APPLE_TEAM_ID:-}"
API_KEY_PATH="${APPLE_API_KEY_PATH:-}"
API_KEY_ID="${APPLE_API_KEY_ID:-}"
API_ISSUER_ID="${APPLE_API_ISSUER_ID:-}"
APP_BUNDLE_ID="${IOS_BUNDLE_ID:-com.sdacommunity.app}"
SIGNING_MODE="${IOS_SIGNING_MODE:-auto}"
PROFILE_NAME="${IOS_PROVISIONING_PROFILE_NAME:-}"
CODE_SIGN_IDENTITY_VALUE="${IOS_CODE_SIGN_IDENTITY:-Apple Distribution}"

mkdir -p "$(dirname "$ARCHIVE_PATH")" "$EXPORT_DIR"

cat > "$EXPORT_OPTIONS_PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>${EXPORT_METHOD}</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>stripSwiftSymbols</key>
  <true/>
  <key>destination</key>
  <string>export</string>
  <key>uploadSymbols</key>
  <true/>
  <key>manageAppVersionAndBuildNumber</key>
  <false/>
</dict>
</plist>
PLIST

if [[ -n "$TEAM_ID" ]]; then
  /usr/libexec/PlistBuddy -c "Add :teamID string $TEAM_ID" "$EXPORT_OPTIONS_PLIST" >/dev/null 2>&1 || \
  /usr/libexec/PlistBuddy -c "Set :teamID $TEAM_ID" "$EXPORT_OPTIONS_PLIST"
fi

if [[ "$SIGNING_MODE" == "manual" ]]; then
  /usr/libexec/PlistBuddy -c "Set :signingStyle manual" "$EXPORT_OPTIONS_PLIST"
fi

# Fallback to installed App Store profile to avoid requiring a signed-in Xcode account.
if [[ "$SIGNING_MODE" != "auto" && -z "$PROFILE_NAME" ]]; then
  while IFS= read -r profile; do
    plist="$(security cms -D -i "$profile" 2>/dev/null || true)"
    [[ -z "$plist" ]] && continue
    app_id="$(echo "$plist" | plutil -extract Entitlements.application-identifier raw -o - - 2>/dev/null || true)"
    get_task_allow="$(echo "$plist" | plutil -extract Entitlements.get-task-allow raw -o - - 2>/dev/null || true)"
    name="$(echo "$plist" | plutil -extract Name raw -o - - 2>/dev/null || true)"
    if [[ "$app_id" == "$TEAM_ID.$APP_BUNDLE_ID" && "$get_task_allow" == "false" ]]; then
      PROFILE_NAME="$name"
      break
    fi
  done < <(ls -1 "$HOME/Library/MobileDevice/Provisioning Profiles"/*.mobileprovision 2>/dev/null || true)
fi

if [[ "$SIGNING_MODE" != "auto" && -n "$PROFILE_NAME" ]]; then
  /usr/libexec/PlistBuddy -c "Add :provisioningProfiles dict" "$EXPORT_OPTIONS_PLIST" >/dev/null 2>&1 || true
  /usr/libexec/PlistBuddy -c "Add :provisioningProfiles:$APP_BUNDLE_ID string $PROFILE_NAME" "$EXPORT_OPTIONS_PLIST" >/dev/null 2>&1 || \
  /usr/libexec/PlistBuddy -c "Set :provisioningProfiles:$APP_BUNDLE_ID $PROFILE_NAME" "$EXPORT_OPTIONS_PLIST"
fi

cd "$IOS_DIR"

XCODE_ARGS=(
  -workspace "$WORKSPACE"
  -scheme "$SCHEME"
  -configuration Release
  -destination "generic/platform=iOS"
  -archivePath "$ARCHIVE_PATH"
  -allowProvisioningUpdates
  -allowProvisioningDeviceRegistration
  clean archive
)

if [[ -n "$TEAM_ID" ]]; then
  XCODE_ARGS+=(DEVELOPMENT_TEAM="$TEAM_ID" CODE_SIGN_STYLE=Automatic)
fi

if [[ "$SIGNING_MODE" != "auto" ]]; then
  XCODE_ARGS+=(CODE_SIGN_STYLE=Manual CODE_SIGN_IDENTITY="$CODE_SIGN_IDENTITY_VALUE")
  if [[ -n "$PROFILE_NAME" ]]; then
    XCODE_ARGS+=(PROVISIONING_PROFILE_SPECIFIER="$PROFILE_NAME")
  fi
fi

if [[ -n "$API_KEY_PATH" && -n "$API_KEY_ID" && -n "$API_ISSUER_ID" ]]; then
  XCODE_ARGS+=(
    -authenticationKeyPath "$API_KEY_PATH"
    -authenticationKeyID "$API_KEY_ID"
    -authenticationKeyIssuerID "$API_ISSUER_ID"
  )
fi

echo "Archiving iOS app with Xcode..."
if [[ "$SIGNING_MODE" != "auto" ]]; then
  echo "Using manual signing mode"
  [[ -n "$PROFILE_NAME" ]] && echo "Provisioning profile: $PROFILE_NAME"
  echo "Code sign identity: $CODE_SIGN_IDENTITY_VALUE"
fi
xcodebuild "${XCODE_ARGS[@]}"

echo "Exporting IPA..."
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_DIR" \
  -exportOptionsPlist "$EXPORT_OPTIONS_PLIST"

IPA_PATH="$(find "$EXPORT_DIR" -maxdepth 1 -name "*.ipa" | head -n 1)"
if [[ -z "$IPA_PATH" ]]; then
  echo "No IPA found in $EXPORT_DIR"
  exit 1
fi

echo "IPA ready: $IPA_PATH"

if [[ "$UPLOAD" == "true" ]]; then
  if [[ -z "${APPLE_API_KEY_ID:-}" || -z "${APPLE_API_ISSUER_ID:-}" ]]; then
    echo "For --upload, set APPLE_API_KEY_ID and APPLE_API_ISSUER_ID."
    exit 1
  fi

  echo "Uploading IPA to App Store Connect with altool..."
  xcrun altool --upload-app \
    --type ios \
    --file "$IPA_PATH" \
    --apiKey "$APPLE_API_KEY_ID" \
    --apiIssuer "$APPLE_API_ISSUER_ID"

  echo "Upload finished. Check App Store Connect/TestFlight processing status."
else
  echo "Upload skipped."
  echo "You can upload manually with Transporter app or rerun with --upload and API key env vars."
fi
