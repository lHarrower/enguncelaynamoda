# AYNAMODA Sharing Checklist

Use this list before sharing the app or repo externally.

- [ ] Remove .env from git (git rm --cached .env) and rotate any keys previously committed.
- [ ] Set GitHub Actions secrets (Settings → Secrets and variables → Actions):
  - EXPO_TOKEN
  - EXPO_PUBLIC_SUPABASE_URL
  - EXPO_PUBLIC_SUPABASE_ANON_KEY
  - (Optional) EXPO_PUBLIC_WEATHER_API_KEY
  - (If proxying AI) OPENAI_API_KEY, HUGGINGFACE_TOKEN
- [ ] Confirm Supabase RLS policies and run a read/write smoke test with anon role.
- [ ] Ensure CI passes (lint, test, coverage upload).
- [ ] Validate Google OAuth IDs for web (and native IDs for iOS/Android if using native sign-in).
- [ ] If using AI:
  - Prefer a Supabase Edge Function proxy. Keep keys server-side.
  - Remove EXPO_PUBLIC_OPENAI_API_KEY from client builds.
- [ ] Publish to Expo with a staging or production channel.
