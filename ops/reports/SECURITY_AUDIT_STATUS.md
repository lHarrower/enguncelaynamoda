# Dependency Security Audit

This file summarizes the latest `npm audit --production` results.

Raw JSON: `ops/reports/npm-audit.json`

Interpretation Guidance:
- HIGH/CRITICAL findings must have: mitigation PR link OR justification (false positive / unreachable code path).
- MEDIUM may defer if no known exploit path in mobile runtime (document rationale).

Current Status (2025-08-14):
- Total vulnerabilities: 0
- Critical: 0
- High: 0
- Medium: 0
- Low: 0

Next Steps:
1. Re-run monthly or before each release candidate.
2. If non-zero findings appear: attempt `npx expo install <pkg>@<fixed>`; if blocked by Expo SDK pin record deferral rationale here.
3. Add automated CI gate to fail on Critical/High counts > 0.
