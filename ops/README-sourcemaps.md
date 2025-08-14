# Sentry Sourcemaps (Android)

Script: `ops/scripts/upload-sourcemaps-android.sh`

## Prerequisites
1. Set env vars: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `EXPO_PUBLIC_SENTRY_DSN`.
2. Perform a release build (EAS or local Gradle) so the JS bundle & sourcemap exist.
3. Install `sentry-cli` locally or in CI.

## Usage
```bash
bash ops/scripts/upload-sourcemaps-android.sh
```
Aborts if DSN missing or bundle/sourcemap not found.

## Release Naming
Format: `aynamoda@<appVersion>+<gitSha>` with `dist` = EAS build id (`EAS_BUILD_ID`) or `local`.

## Typical CI Step (pseudo)
```bash
eas build --profile production --platform android --non-interactive --wait
bash ops/scripts/upload-sourcemaps-android.sh
```

## Validation
- Open Sentry Release page: verify artifacts & commit list.
- Trigger a test error in production build; confirm stack trace symbolicated.
