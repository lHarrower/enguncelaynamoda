#!/usr/bin/env bash
set -euo pipefail

# Upload React Native / Hermes sourcemaps for Android release to Sentry.
# Usage (after a successful EAS Android build & before publishing to users):
#   bash ops/scripts/upload-sourcemaps-android.sh
# Requires: sentry-cli configured via env (SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT)

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
APP_CONFIG_TS="$ROOT_DIR/app.config.ts"

# Extract version from app.config.ts (assumes export default with version field)
APP_VERSION=$(grep -E "version:" "$APP_CONFIG_TS" | head -1 | sed -E "s/.*version: ['\"]([^'\"]+)['\"].*/\1/")
RUNTIME_VERSION=$(grep -E "runtimeVersion" "$APP_CONFIG_TS" | head -1 | sed -E "s/.*runtimeVersion: ['\"]([^'\"]+)['\"].*/\1/")
BUILD_ID="${EAS_BUILD_ID:-local}"
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "nogit")

if [[ -z "${EXPO_PUBLIC_SENTRY_DSN:-}" ]]; then
  echo "[warn] EXPO_PUBLIC_SENTRY_DSN missing; aborting upload" >&2
  exit 1
fi

if ! command -v sentry-cli >/dev/null 2>&1; then
  echo "sentry-cli not installed. Install from https://docs.sentry.io/product/cli/" >&2
  exit 1
fi

RELEASE="aynamoda@${APP_VERSION}+${GIT_SHA}"
DIST="${BUILD_ID}"

echo "Creating Sentry release: $RELEASE (dist=$DIST runtimeVersion=$RUNTIME_VERSION)"
sentry-cli releases new "$RELEASE" || true
sentry-cli releases set-commits "$RELEASE" --auto || true

# React Native bundle & sourcemap locations (Hermes + Metro) expected after build
ANDROID_BUNDLE="$ROOT_DIR/android/app/build/generated/assets/react/release/index.android.bundle"
ANDROID_SOURCEMAP="$ROOT_DIR/android/app/build/generated/sourcemaps/react/release/index.android.bundle.map"

if [[ ! -f "$ANDROID_BUNDLE" || ! -f "$ANDROID_SOURCEMAP" ]]; then
  echo "Bundle or sourcemap not found. Ensure you've run a release build before uploading." >&2
  exit 1
fi

echo "Uploading Android sourcemaps..."
sentry-cli releases files "$RELEASE" upload-sourcemaps \
  --dist "$DIST" \
  --rewrite \
  --strip-prefix "$ROOT_DIR" \
  "$ANDROID_BUNDLE" "$ANDROID_SOURCEMAP"

echo "Finalizing release"
sentry-cli releases finalize "$RELEASE"

echo "Sourcemap upload complete."
