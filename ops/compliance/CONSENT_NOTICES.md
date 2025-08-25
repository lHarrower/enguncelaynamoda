# In-App Consent & Notice Points

| Feature                  | Trigger                                        | Notice / Prompt                                                         | Actionable Controls                                   |
| ------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------- |
| Notifications            | Onboarding step ("Enable Daily Notifications") | Rationale: Daily confidence ritual reminders                            | Accept / Maybe Later; settings toggle later           |
| Location (Weather)       | First weather fetch                            | OS permission sheet + inline explanation                                | Allow / Deny; fallback to generic recommendations     |
| Crash Reporting (Sentry) | First launch (planned)                         | Lightweight modal: "Help us improve stability"                          | Enable / Disable (store preference)                   |
| AI Personalization       | First feedback submission                      | Inline tooltip: explains usage of feedback to adapt                     | Implicit consent via use; offer reset personalization |
| Image Upload             | Before camera/gallery access                   | OS permission + inline note: "Used only to build your private wardrobe" | Proceed / Cancel                                      |
| Data Export / Deletion   | Settings > Privacy                             | Inform about irreversible deletion                                      | Confirm dialog                                        |

## Ordering Guidance

1. Core functionality (style onboarding) before optional permissions.
2. Bundle low-risk prompts (notifications) separate from higher-friction (location).
3. Offer skip paths that preserve progress.
