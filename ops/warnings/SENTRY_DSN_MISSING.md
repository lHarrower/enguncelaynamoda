# Warning: Sentry DSN Missing

The environment variable `EXPO_PUBLIC_SENTRY_DSN` was not detected.

## Why This Matters
Without a DSN, Sentry will not receive crash reports, JS errors, or performance spans from production builds. This weakens post-release observability and increases MTTR.

## Next Steps
1. Create a Sentry project (Platform: React Native / Expo).
2. Copy the Public DSN (never use the secret key DSN).
3. Add it to:
   - Local: `.env` as `EXPO_PUBLIC_SENTRY_DSN=...`
   - EAS: `eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value <dsn>`
4. Re-run: `npx expo config --type public | findstr /C:SENTRY` (Windows) to verify exposure.
5. After the next production build, confirm releases appear in Sentry and crash-free sessions metric populates.

## Optional Hardening
- Add release & dist tags (already configured in `src/config/sentry.ts`).
- Automate source map upload using the generated script in `ops/scripts/upload-sourcemaps-android.sh`.
