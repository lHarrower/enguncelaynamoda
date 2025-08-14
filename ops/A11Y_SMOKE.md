# Accessibility Smoke Test

Run this minimal pass each release to ensure no regressions in baseline accessibility support.

## 1. Launch & Global
- App launches without crash with TalkBack enabled.
- Dynamic text size (Largest) does not truncate critical CTAs on first 3 screens.

## 2. Authentication
- Login screen: All input fields have accessible labels.
- Error validation messages announced after submitting empty form.

## 3. Primary Flow (Mirror)
- Main mirror screen: Primary action buttons reachable via sequential navigation order.
- No focus traps when opening and dismissing modal overlays.

## 4. Color & Contrast
- Check a dark background + primary text with a contrast checker (target >= 4.5:1 for body text).
- Themed toggle preserves contrast in both light/dark.

## 5. Images & Media
- Key imagery has descriptive accessibilityLabel or is marked decorative if not informative.
- Video / motion elements (if any) do not autoplay with sound.

## 6. Haptics & Motion
- Motion intensive transitions respect system Reduced Motion setting (if platform supported).

## 7. Keyboard / Switch (Android TV / Emulator)
- Basic navigation possible with D-Pad: focus clearly visible.

## 8. Screen Reader Specific
- No duplicate announcements on tab switch.
- Time-sensitive toasts are announced (or have accessible fallback region).

## 9. Regression Log
Log any discovered issues here with date and screen.

| Date | Screen | Issue | Severity | Ticket |
|------|--------|-------|----------|--------|
|      |        |       |          |        |

## 10. Exit Criteria
Release only if: No blocker (crash / unreadable flow) and <= 2 minor a11y issues open with planned fix versions.
