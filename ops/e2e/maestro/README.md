# Maestro Smoke Test

This directory contains a minimal smoke test for the core "Analyze" interaction and a deep link sanity check.

## Prerequisites
1. Install Java (for Android emulator if not already).
2. Install Maestro CLI:
```
curl -Ls "https://get.maestro.mobile.dev" | bash
```
Ensure the install path is on PATH (Windows users can use PowerShell to download the release binary from GitHub).

3. Have an Android emulator running OR a connected device with the production build installed. The app id used here is `com.aynamoda.app`—adjust if the final package differs.

## Test Script
`aynamoda.smoke.yaml` executes:
1. Launch app
2. Open a test deep link `aynamoda://test`
3. Navigate to Wardrobe
4. Tap "Analyze"
5. Assert modal / analyze UI text appears
6. Dismiss (Back)
7. Relaunch and verify Analyze UI still accessible

## Run
```
maestro test ops/e2e/maestro/aynamoda.smoke.yaml
```

## If Wardrobe Lacks Data
If the Analyze button requires at least one wardrobe item, seed an item manually in a dev build or add a pre-test step that navigates to an add-item screen. Update YAML accordingly.

## Output
Capture run output:
```
maestro test ops/e2e/maestro/aynamoda.smoke.yaml > ops/reports/maestro-smoke.txt 2>&1
```

## Next
Integrate into CI after adding an emulator spin-up and artifact install step.
