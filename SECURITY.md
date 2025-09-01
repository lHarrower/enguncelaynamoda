# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of AYNAMODA seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Where to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@aynamoda.com**

### What to Include

Please include the following information in your report:

- **Type of issue** (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths of source file(s)** related to the manifestation of the issue
- **The location of the affected source code** (tag/branch/commit or direct URL)
- **Any special configuration required** to reproduce the issue
- **Step-by-step instructions to reproduce the issue**
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit the issue

### Response Timeline

We will acknowledge receipt of your vulnerability report within 48 hours and will send you regular updates about our progress.

## Environment Variables

### Critical Security Rules

1. **NEVER** commit `.env` files to version control
2. Use `.env.example` as a template for required variables
3. Use different API keys for development, staging, and production
4. Rotate API keys regularly (every 90 days)
5. Use secure secret management in production

### Required Environment Variables

- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `EXPO_PUBLIC_HUGGINGFACE_TOKEN`: HuggingFace API token
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: Google OAuth client ID

## API Security

### Supabase Security

- Enable Row Level Security (RLS) on all tables
- Use service role key only in secure server environments
- Implement proper authentication flows
- Validate all user inputs

### External API Security

- Implement rate limiting
- Use HTTPS for all API calls
- Validate API responses
- Handle API errors gracefully

## Data Protection

### User Data

- Encrypt sensitive user data
- Implement proper data retention policies
- Follow GDPR/CCPA compliance requirements
- Provide data export/deletion capabilities

### Image Processing

- Validate image file types and sizes
- Scan uploaded images for malicious content
- Implement proper image storage permissions

## Authentication & Authorization

### Best Practices

- Use secure authentication providers (Google, Apple)
- Implement proper session management
- Use JWT tokens with appropriate expiration
- Implement proper logout functionality

## Mobile App Security

### Code Protection

- Obfuscate production builds
- Use certificate pinning for API calls
- Implement root/jailbreak detection
- Use secure storage for sensitive data

### Build Security

- Use signed builds for production
- Implement proper code signing
- Use secure build environments
- Scan dependencies for vulnerabilities

## Monitoring & Logging

### Security Monitoring

- Implement error tracking (Sentry)
- Monitor API usage patterns
- Track authentication failures
- Set up security alerts

### Privacy

- Anonymize user data in logs
- Implement proper log retention policies
- Ensure logs don't contain sensitive information

## Compliance

### Standards

- Follow OWASP Mobile Security Guidelines
- Implement GDPR compliance
- Follow platform-specific security guidelines (iOS/Android)
- Regular security audits and penetration testing

## Incident Response

### Preparation

- Maintain incident response plan
- Have emergency contacts ready
- Implement security breach notification procedures
- Regular security training for development team

## Dependencies

### Package Security

- Regularly update dependencies
- Use `npm audit --omit=dev` to check for production dependency vulnerabilities
- Pin dependency versions in production
- Review new dependencies for security issues

## Deployment Security

### Production Deployment

- Use secure CI/CD pipelines
- Implement proper secret management
- Use infrastructure as code
- Regular security scans of deployed applications
