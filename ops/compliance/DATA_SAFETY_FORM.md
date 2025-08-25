# Google Play Data Safety Form Draft

| Data Type                                                   | Collected                          | Shared                 | Purpose                        | Processing / Storage       | Retention                  | User Control                      |
| ----------------------------------------------------------- | ---------------------------------- | ---------------------- | ------------------------------ | -------------------------- | -------------------------- | --------------------------------- |
| Personal Info (Email)                                       | Yes (if user registers with email) | No                     | Auth, sync                     | Supabase Auth              | Until account deletion     | Delete account                    |
| App Activity (Feature Usage, Feedback)                      | Yes                                | No                     | Personalization, quality       | Supabase DB                | 12 months raw -> aggregate | Clear feedback (planned UI)       |
| App Activity (Crash Logs)                                   | Yes                                | No                     | Stability diagnostics          | Sentry                     | 30 days                    | Disable crash reporting (planned) |
| Photos/Media (Wardrobe Images)                              | Yes (user provided)                | Cloudinary (processor) | Core feature (recommendations) | Cloudinary + Supabase refs | Until item deletion        | Delete item                       |
| Location (Approximate via weather lookup)                   | Yes (optional)                     | No                     | Weather-aware recommendations  | Memory / short-lived cache | <24h                       | Disable location permission       |
| Device IDs (Push Token)                                     | Yes                                | No                     | Notifications                  | Supabase                   | Rotated periodically       | Disable notifications             |
| Audio, Contacts, Calendar, Messages, Health, Fitness, Files | No                                 | N/A                    | N/A                            | N/A                        | N/A                        | N/A                               |
| Advertising / Analytics IDs                                 | No                                 | N/A                    | N/A                            | N/A                        | N/A                        | N/A                               |

## Security Practices

- Encrypted in transit (TLS) & at rest (Supabase managed storage & Postgres encryption).
- RLS prevents cross-tenant access.
- Minimal data surface; no advertising SDKs.

## Data Deletion

Account deletion purges wardrobe items, feedback, tokens, and references to images.

## WHY Not Collected

No payments yet; no contacts/social graph; no precise location tracking stored.
