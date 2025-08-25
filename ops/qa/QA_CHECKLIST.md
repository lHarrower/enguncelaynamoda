# QA Checklist

## Functional Paths

- [ ] Onboarding full path (wardrobe add -> style prefs -> notifications -> sample recs)
- [ ] Skip-heavy onboarding path
- [ ] Daily recommendation generation (cold start before 6 AM vs after)
- [ ] Wardrobe item add (camera + gallery)
- [ ] Wardrobe item edit & delete
- [ ] Feedback submission (confidence + emotion tagging)
- [ ] Re-engagement notification scheduling & cancellation
- [ ] Deep link handling (aynamoda://ayna-mirror)

## Failure / Edge Cases

- [ ] Supabase network loss (retry/backoff surfaces user-appropriate state)
- [ ] Weather API missing key fallback
- [ ] Empty wardrobe baseline recommendations (graceful placeholder)
- [ ] Large wardrobe (>500 items) performance acceptable
- [ ] Permission denied flows (camera, gallery, notifications, location)

## Offline Behavior

- [ ] Launch offline -> cached recommendations used (if any)
- [ ] Queue feedback offline and sync later

## Notifications

- [ ] Initial permission request
- [ ] Daily mirror notification scheduling time accuracy (timezone change)
- [ ] Feedback prompt scheduling

## Accessibility Quick Sweep

- [ ] Screen reader focus order logical on primary screens
- [ ] All actionable components have accessible labels
- [ ] Meaningful alt text / labels for images where needed
- [ ] Color contrast spot check (primary buttons)

## Performance

- [ ] Warm start < 1s on mid device
- [ ] No jank during scroll of wardrobe grid

## Logging / Privacy

- [ ] No PII in console logs (dev build inspection)
- [ ] Error paths captured in Sentry (simulated throw)

## Regression

- [ ] Previous high-severity bugs retested

## Sign-off

- [ ] QA Lead
- [ ] Engineering
- [ ] Product
