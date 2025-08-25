# AYNAMODA Production Deployment Guide

## 🚀 Production Environment Setup

### Prerequisites

1. **EAS CLI Installation**
   ```bash
   npm install -g @expo/eas-cli
   eas login
   ```

2. **Required Accounts & Services**
   - Expo Account (with EAS subscription)
   - Apple Developer Account ($99/year)
   - Google Play Console Account ($25 one-time)
   - Supabase Production Project
   - Sentry Account for Error Monitoring
   - Cloudinary Account for Image Management

### 🔐 Environment Variables Configuration

#### 1. EAS Secrets Setup

```bash
# Supabase Production
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-prod-project.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your_production_anon_key"

# Google OAuth
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "your_web_client_id"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID --value "your_android_client_id"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "your_ios_client_id"

# AI Services
eas secret:create --scope project --name EXPO_PUBLIC_HUGGINGFACE_TOKEN --value "hf_your_token"
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --value "sk-your_key"

# Cloudinary
eas secret:create --scope project --name EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME --value "your_cloud_name"
eas secret:create --scope project --name EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET --value "your_preset"

# Monitoring
eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value "https://your_sentry_dsn"
eas secret:create --scope project --name EXPO_PUBLIC_WEATHER_API_KEY --value "your_weather_key"

# App Store Connect
eas secret:create --scope project --name APPLE_ID --value "your-apple-id@email.com"
eas secret:create --scope project --name ASC_APP_ID --value "1234567890"
eas secret:create --scope project --name APPLE_TEAM_ID --value "XXXXXXXXXX"
```

#### 2. Service Account Keys

Create `keys/` directory and add:
- `google-play-service-account.json` (Google Play Console API)
- `AuthKey_XXXXXXXXXX.p8` (App Store Connect API)

### 📱 Platform-Specific Setup

#### iOS Configuration

1. **Apple Developer Account Setup**
   - Create App ID: `com.aynamoda.app`
   - Configure capabilities: Push Notifications, Sign in with Apple
   - Create Distribution Certificate
   - Create App Store Provisioning Profile

2. **App Store Connect**
   - Create new app with bundle ID `com.aynamoda.app`
   - Configure app metadata, screenshots, descriptions
   - Set up App Store Connect API key

#### Android Configuration

1. **Google Play Console**
   - Create new app with package name `com.aynamoda.app`
   - Configure app signing (let Google manage keys)
   - Set up Google Play Console API access
   - Create service account and download JSON key

2. **Google OAuth Setup**
   - Configure OAuth consent screen
   - Add authorized domains
   - Create OAuth 2.0 client IDs for Android and Web

### 🏗️ Build Process

#### 1. Development Build
```bash
eas build --profile development --platform all
```

#### 2. Preview Build
```bash
eas build --profile preview --platform all
```

#### 3. Production Build
```bash
# Build for both platforms
eas build --profile production --platform all

# Build for specific platform
eas build --profile production --platform ios
eas build --profile production --platform android
```

### 📤 Submission Process

#### Automated Submission
```bash
# Submit to both stores
eas submit --profile production --platform all

# Submit to specific store
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

#### Manual Submission
1. Download builds from EAS dashboard
2. Upload to respective stores manually
3. Configure store listings and metadata

### 🔍 Pre-Deployment Checklist

#### Code Quality
- [ ] All TypeScript errors resolved
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security audit completed
- [ ] Performance testing completed

#### Configuration
- [ ] All production environment variables set
- [ ] App icons and splash screens updated
- [ ] App metadata and descriptions finalized
- [ ] Privacy policy and terms of service updated
- [ ] Store screenshots and descriptions ready

#### Services
- [ ] Supabase production database configured
- [ ] RLS policies tested and verified
- [ ] Sentry error monitoring configured
- [ ] Analytics tracking verified
- [ ] Push notifications tested
- [ ] Deep linking configured

#### Platform Specific
- [ ] iOS: Certificates and provisioning profiles valid
- [ ] iOS: App Store Connect metadata complete
- [ ] Android: App signing configured
- [ ] Android: Google Play Console metadata complete
- [ ] Both: OAuth consent screens approved

### 🚨 Security Best Practices

1. **API Key Management**
   - Use different keys for each environment
   - Rotate keys quarterly
   - Monitor key usage and set alerts
   - Use least-privilege principle

2. **Database Security**
   - Enable Row Level Security (RLS)
   - Regular security audits
   - Monitor for unusual activity
   - Backup and recovery procedures

3. **App Security**
   - Code obfuscation for production builds
   - Certificate pinning for API calls
   - Secure storage for sensitive data
   - Regular dependency updates

### 📊 Monitoring & Analytics

1. **Error Monitoring (Sentry)**
   - Real-time error tracking
   - Performance monitoring
   - Release health tracking
   - Custom alerts and notifications

2. **Analytics**
   - User engagement tracking
   - Feature usage analytics
   - Crash reporting
   - Performance metrics

### 🔄 CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/production-deploy.yml
name: Production Deployment

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test
      - run: npx eas-cli build --profile production --platform all --non-interactive
      - run: npx eas-cli submit --profile production --platform all --non-interactive
```

### 🆘 Troubleshooting

#### Common Issues

1. **Build Failures**
   - Check EAS build logs
   - Verify all dependencies are compatible
   - Ensure environment variables are set correctly

2. **Submission Rejections**
   - Review store guidelines
   - Check app metadata and screenshots
   - Verify privacy policy compliance

3. **Runtime Errors**
   - Monitor Sentry for crash reports
   - Check device compatibility
   - Verify API endpoints are accessible

#### Support Resources
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

### 📈 Post-Deployment

1. **Monitor Release Health**
   - Track crash rates
   - Monitor user feedback
   - Check performance metrics

2. **Gradual Rollout**
   - Start with small percentage of users
   - Monitor for issues
   - Gradually increase rollout percentage

3. **Hotfix Process**
   - Quick patch deployment procedure
   - Rollback strategy
   - Communication plan

---

**Note**: This guide assumes you have the necessary accounts and permissions. Always test the deployment process in a staging environment before production deployment.