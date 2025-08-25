# Versioning & Release Numbering

This project keeps a single source of truth for app version and runtimeVersion inside `app.config.ts`.

## Bump Policy

- Patch: Bug fixes, internal refactors, test-only changes.
- Minor: User-visible feature (non-breaking), performance improvements, new screen, additive API.
- Major: Breaking data model, auth flow reset, large redesign.

Runtime version mirrors the semantic version to align with OTA update rollouts (if enabled).

## Usage

Run (examples):

```
# Patch
npx ts-node ops/scripts/version-bump.ts patch
# Minor
npx ts-node ops/scripts/version-bump.ts minor
# Major
npx ts-node ops/scripts/version-bump.ts major
```

The script outputs JSON with previous/next for CI consumption.

## CI Integration Suggestion

1. Validate clean working tree.
2. Run bump script with level from commit labels or conventional commits.
3. Commit modified `app.config.ts` with message: `chore(release): vX.Y.Z`.
4. Tag the commit `vX.Y.Z`.
5. Trigger EAS build referencing the tag.

## Guardrails

- Script aborts if version key not found.
- Consider adding a pre-commit hook verifying CHANGELOG updated when version changes.
