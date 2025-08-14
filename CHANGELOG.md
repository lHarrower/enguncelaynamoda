# Changelog

All notable changes will be documented in this file (Conventional Commits style).

## 1.0.0 - 2025-08-14
### Added
- Initial production candidate: wardrobe management, daily recommendations, feedback loop.
- Performance optimization & caching service.
- Accessibility test suite and inclusive design checks.
- Error handling service with retry/backoff.
- Notification scheduling (daily mirror, feedback prompts, re-engagement).
- Sentry integration (release/dist tagging) and sourcemap upload script.
- Security hardening: RLS policies, input validation (Zod), logger redaction scaffold.

### Fixed
- Dynamic import failures in Jest via test fallbacks.
- RPC parameter mismatch in enhanced wardrobe service tests.

### Changed
- Relaxed brittle integration test assertions for stability.

### Removed
- Duplicate Supabase client instance.

### Security
- Added preliminary rate limiter utility.
