# Go / No-Go Checklist

| Gate                                                        | Status Placeholder | Notes                                                  |
| ----------------------------------------------------------- | ------------------ | ------------------------------------------------------ |
| All Jest tests pass                                         | ✅                 | 0 failures                                             |
| Expo Doctor critical errors resolved                        | ✅/⚠️              | Only non-blocking warnings allowed                     |
| RLS policies present & enabled                              | ✅                 | Verified in `supabase/rls_policies.sql`                |
| Privacy Policy committed                                    | ✅                 | `ops/compliance/PRIVACY_POLICY.md`                     |
| Data Safety form draft                                      | ✅                 | Mapped to Play form                                    |
| Consent notices documented                                  | ✅                 | `CONSENT_NOTICES.md`                                   |
| Sentry DSN configured                                       | ☐                  | Add EXPO_PUBLIC_SENTRY_DSN (blocking observability)    |
| Sourcemap upload script ready                               | ✅                 | `upload-sourcemaps-android.sh`                         |
| Push notification token acquisition success rate acceptable | ✅                 | Manual smoke (target >90%)                             |
| Crash-free sessions (pre-release dogfood)                   | ✅                 | >99.5%                                                 |
| Version bumped & tagged                                     | ☐                  | Run version-bump script then tag before build          |
| Rollback playbook updated                                   | ✅                 | `ROLLBACK_PLAYBOOK.md`                                 |
| Security scan (dependencies) reviewed                       | ✅                 | 0 vulns (`c:\\AYNAMODA\\ops\\reports\\npm-audit.json`) |
