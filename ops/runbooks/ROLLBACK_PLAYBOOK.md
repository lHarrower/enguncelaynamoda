# Rollback Playbook

## 1. OTA (Update) Rollback
If an OTA update has a regression:
```bash
eas update:list --branch production
# Identify previous stable update group
EAS_UPDATE_GROUP=<group-id>
eas update:republish --group $EAS_UPDATE_GROUP --branch production --message "Rollback to stable"
```
(Newer Expo versions may require channel-based rollback; adapt accordingly.)

## 2. Channel Repoint (If Using Channels)
- Temporarily point production users to last known-good channel in config / release.

## 3. Native Binary Rollback
If the binary itself is defective (crashes before OTA loads):
- Unpublish staged rollout in Play.
- Rebuild fixed version: increment patch version.
- Submit new AAB; halt old rollout.

## 4. Edge Function Revert
```bash
git log -- supabase/functions
# Identify last good commit
supabase functions deploy <function-name> --project-ref <project> --import-map import_map.json
```
Or revert in source + redeploy pipeline.

## 5. Config / Secret Regression
- Rotate compromised keys (Supabase anon, Cloudinary preset) immediately.
- Re-issue build with updated env.

## 6. Communication Matrix
| Audience | Action |
|----------|--------|
| Internal Team | Incident channel update with root cause, rollback action, status |
| Users (if severe) | In-app banner post-fix |

## 7. Post-Rollback
- Add regression test reproducing issue.
- Update runbook if gap discovered.
