# Log Redaction Checklist

| Field Type              | Example          | Action                                         | Implemented?                                         |
| ----------------------- | ---------------- | ---------------------------------------------- | ---------------------------------------------------- |
| Email                   | user@example.com | Mask local part (u\*\*\*@example.com)          | Pending (logger redaction patterns)                  |
| Auth Tokens             | JWT / session    | NEVER log; ensure filters                      | Logger drops /[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/ tokens |
| Access / Refresh Tokens | Supabase         | Omit; rely on SDK internal handling            | Yes (not manually logged)                            |
| Image URIs              | Cloudinary URL   | Allowed (non-sensitive) but avoid query params | OK                                                   |
| Device Identifiers      | Push token       | Hash (SHA256) if logged                        | Recommendation: hash before logging                  |
| Location                | City/lat/long    | Do not log raw coordinates; at most city       | Ensure weather service avoids raw coords in logs     |
| Feedback Text (future)  | Free-form note   | Trim & remove PII pattern matches              | Add before enabling free-form fields                 |
| Errors                  | Stack traces     | Strip user-specific data paths                 | Sentry sanitization + review                         |

## Logger Guidance

Use `logger.info({ event: 'x', userId })` instead of string concatenation. Never pass whole user/session objects.

## To Add

- Central redaction test case asserting no emails/tokens leak.
