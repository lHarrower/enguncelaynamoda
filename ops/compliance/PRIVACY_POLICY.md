# AYNA MODA Privacy Policy (Mobile App)
_Last updated: 2025-08-14_

AYNA MODA helps users build confidence through personalized wardrobe intelligence. We minimize the data we collect and give users control.

## 1. Data We Collect
| Category | Examples | Purpose | Retention | User Control |
|----------|----------|---------|-----------|--------------|
| Account & Auth | Email (if provided), Supabase UID | Authentication & sync | Until account deletion | Delete account request |
| Wardrobe Items | Images, category, colors, usage stats | Generate recommendations | User controlled; deleted when item removed | Delete / edit items |
| Usage & Feedback | Confidence ratings, emotional response tags | Model improvement & personalization | Rolling 12 months (aggregate thereafter) | Clear feedback history |
| Device Context | Timezone, platform, push token | Notification scheduling & performance diagnostics | Push token rotated periodically; context ephemeral | Disable notifications |
| Weather Context | City (derived), temperature | Contextual outfit recommendations | Not stored long-term (cached < 24h) | Disable location permission |
| Crash & Error Diagnostics | Stack traces, anonymized device info | Stability & debugging | 30 days (crash), aggregated metrics longer | Opt-out (disable crash reporting in settings, planned) |

We do NOT intentionally collect: precise geo coordinates beyond what is needed for weather (can be disabled), contact lists, payment data, biometrics, or advertising identifiers.

## 2. How Data Is Processed
- Client app gathers wardrobe data locally and syncs to Supabase (Postgres with Row Level Security).
- Recommendation logic queries wardrobe + feedback + weather context to produce daily sets.
- Feedback continuously tunes personalization signals.

## 3. Third Parties (Processors)
| Service | Purpose | Data Shared | Location |
|---------|---------|------------|----------|
| Supabase | Auth, database, storage, edge functions | Wardrobe records, feedback, auth metadata | Regional (per Supabase region selected) |
| Cloudinary | Image storage (unsigned upload preset) | Wardrobe images | Global CDN |
| Sentry | Crash/error telemetry | Stack traces, release & device metadata (no PII) | EU/US (per Sentry region) |

## 4. Legal Bases (GDPR)
- Performance of contract: core functionality.
- Legitimate interest: crash diagnostics (minimized & opt-out planned).
- Consent: notifications, optional location-based weather (system prompts), AI personalization.

## 5. User Rights
- Access & Export: Provide export via support request (planned automated portal).
- Rectification: Edit wardrobe items directly.
- Erasure: Delete account (will purge wardrobe, feedback, tokens).
- Restrict / Object: Disable notifications, location.
- Data Portability: JSON export (planned).

## 6. Data Retention
| Data | Retention |
|------|-----------|
| Wardrobe items | Until user deletion |
| Feedback events | 12 months raw, then aggregated |
| Crash logs | 30 days |
| Cached weather | <24h |
| Push tokens | Rotate on re-login / OS refresh |

## 7. Security Measures
- Row Level Security policies enforced in database.
- Client sends only anon key; all privileged logic in edge functions.
- Input validation & rate limiting on edge endpoints (progressive rollout).
- Image uploads constrained by unsigned upload preset.

## 8. Children
Not directed to children under 13. If we learn of child data, we will delete it.

## 9. Changes
We will update this document and version it in the repository.

## 10. Contact
privacy@aynamoda.example (replace with real contact before launch)
