# Release Runbook (AYNA MODA)

## 1. Version & Branch Prep

- Update code / merge PRs to `main`.
- Optional: bump version: `ts-node ops/scripts/version-bump.ts patch`.
- Commit & push.

## 2. Preflight

- Tests green (Jest summary = 0 failures).
- `npx expo-doctor` (non-blocking warnings reviewed).
- Privacy & Data Safety docs finalized.
- Sentry DSN set & sourcemap script present.

## 3. Build (Android)

```bash
eas build --platform android --profile production --non-interactive --wait
```

Artifact URL saved to `ops/reports/last-build.json`.

## 4. (Optional) Staging / Soak

If using channels:

```bash
eas update --branch staging --message "staging soak"
```

Monitor crash-free sessions & key metrics.

## 5. Promote / Production OTA (if using updates)

```bash
eas update --branch production --message "vX.Y.Z release"
```

## 6. Sentry Release & Sourcemaps

```bash
bash ops/scripts/upload-sourcemaps-android.sh
```

Validate in Sentry UI.

## 7. Store Submission

- Upload AAB to Play Console internal testing.
- Attach `ops/release/RELEASE_NOTES.md` excerpt and privacy policy link.

## 8. Post-Release Health Checks (Day 0–3)

| Metric                          | Target                    |
| ------------------------------- | ------------------------- |
| Crash-free sessions             | > 99.5%                   |
| Average cold start              | < 2.5s (mid-range device) |
| Error rate (Sentry)             | < 1% events/session       |
| Daily recommendation success    | > 95%                     |
| Push token registration success | > 90%                     |

## 9. Rollback Triggers

- Crash-free < 98% for 2h.
- Elevated auth or wardrobe fetch failures > 5%.

## 10. Communication

- Release notes short & user-facing.
- Internal Slack: build URL, Sentry release link, metrics after 24h.
