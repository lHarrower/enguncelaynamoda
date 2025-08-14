# Sourcemaps Not Uploaded

The production Android build finished, but sourcemaps were not uploaded (required Sentry env vars missing at time of processing).

Latest build:
```
buildId: 9dc902d0-b0ae-4372-8bdb-ff1e502613d2
artifactUrl: https://expo.dev/artifacts/eas/ku595pjWtqRbktnT7oJrSb.aab
appVersion: 1.0.1 (runtimeVersion 1.0.1, reported appVersion in build metadata 1.0.0)
release (expected): aynamoda@1.0.1+<gitSha>
dist (expected): <EAS_BUILD_ID>
```

## 1. Required Environment Variables
Set (locally) or create on EAS (so they are injected in future builds):
```
export SENTRY_AUTH_TOKEN=<token with project:releases>
export SENTRY_ORG=<your-org>
export SENTRY_PROJECT=aynamoda
export EXPO_PUBLIC_SENTRY_DSN=<public_dsn>
```
Persist in EAS (optional):
```
eas secret:create --name SENTRY_AUTH_TOKEN --value <token>
eas secret:create --name SENTRY_ORG --value <org>
eas secret:create --name SENTRY_PROJECT --value aynamoda
eas secret:create --name EXPO_PUBLIC_SENTRY_DSN --value <dsn>
```

## 2. Run Script (Preferred)
After ensuring a fresh release build is available locally (or right after CI build with artifacts on disk):
```
bash ops/scripts/upload-sourcemaps-android.sh > ops/reports/sourcemaps-upload.txt 2>&1
```

## 3. Manual sentry-cli Steps (Fallback)
If you need to craft manually:
```
RELEASE="aynamoda@1.0.1+$(git rev-parse --short HEAD)"
DIST="$EAS_BUILD_ID"
sentry-cli releases new "$RELEASE" || true
sentry-cli releases set-commits "$RELEASE" --auto || true

ANDROID_BUNDLE=android/app/build/generated/assets/react/release/index.android.bundle
ANDROID_SOURCEMAP=android/app/build/generated/sourcemaps/react/release/index.android.bundle.map

sentry-cli releases files "$RELEASE" upload-sourcemaps \
	--dist "$DIST" \
	--rewrite \
	--strip-prefix $(pwd) \
	"$ANDROID_BUNDLE" "$ANDROID_SOURCEMAP"

sentry-cli releases finalize "$RELEASE"
```

## 4. Verification
In Sentry UI → Releases → find `aynamoda@1.0.1+<gitSha>`
Ensure: release present, artifacts count > 0, stack traces are symbolicated.

## 5. If Paths Missing
Run a local release build to populate the bundle/sourcemap:
```
eas build --platform android --profile production --local
```
Then re-run the script.

---
Document updated automatically due to missing env at upload attempt.
