# AYNAMODA Production Deployment Guide

This guide provides step-by-step instructions for configuring AYNAMODA for production deployment.

## 🚀 Quick Start Checklist

- [ ] Set up Supabase project
- [ ] Configure Google OAuth
- [ ] Set up Cloudinary for image uploads
- [ ] Configure Sentry for error monitoring
- [ ] Set up OpenWeather API
- [ ] Configure environment variables
- [ ] Set up EAS build secrets
- [ ] Test production build
- [ ] Deploy to app stores

## 📋 Detailed Setup Instructions

### 1. Supabase Configuration

#### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key
4. Run the database migrations:
   ```bash
   npx supabase db push
   ```

#### 1.2 Configure Row Level Security (RLS)
1. Enable RLS on all tables in Supabase Dashboard
2. Set up authentication policies
3. Test with a test user account

#### 1.3 Set up Edge Functions
1. Deploy AI proxy function:
   ```bash
   npx supabase functions deploy ai-proxy
   ```
2. Configure function secrets in Supabase Dashboard:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key

### 2. Google OAuth Setup

#### 2.1 Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: Add your app's auth callback URLs

#### 2.2 Configure OAuth Consent Screen
1. Set up OAuth consent screen
2. Add your app domain
3. Configure scopes (email, profile)
4. Add test users for development

### 3. Cloudinary Setup

#### 3.1 Create Cloudinary Account
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Note your cloud name
3. Create an unsigned upload preset:
   - Go to Settings > Upload
   - Create new upload preset
   - Set to "Unsigned"
   - Configure allowed formats and transformations

### 4. Sentry Configuration

#### 4.1 Create Sentry Project
1. Sign up at [sentry.io](https://sentry.io)
2. Create new React Native project
3. Note your DSN
4. Configure release tracking

### 5. OpenWeather API

#### 5.1 Get API Key
1. Sign up at [openweathermap.org](https://openweathermap.org)
2. Subscribe to Current Weather Data API
3. Note your API key

### 6. Environment Configuration

#### 6.1 Create Production Environment File
```bash
# Copy the template
cp .env.production.template .env

# Edit with your actual values
nano .env
```

#### 6.2 Required Environment Variables
```bash
# Core Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_client_id.apps.googleusercontent.com

# Cloudinary
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Sentry
EXPO_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Weather
EXPO_PUBLIC_WEATHER_API_KEY=your_openweather_api_key

# AI Proxy
EXPO_PUBLIC_USE_AI_PROXY=true
```

### 7. EAS Build Configuration

#### 7.1 Install EAS CLI
```bash
npm install -g @expo/eas-cli
eas login
```

#### 7.2 Configure Build Secrets
```bash
# Set environment variables for EAS builds
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project-id.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your_supabase_anon_key"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "your_client_id.apps.googleusercontent.com"
eas secret:create --scope project --name EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME --value "your_cloud_name"
eas secret:create --scope project --name EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET --value "your_upload_preset"
eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value "https://your-dsn@sentry.io/project-id"
eas secret:create --scope project --name EXPO_PUBLIC_WEATHER_API_KEY --value "your_openweather_api_key"
```

### 8. App Store Configuration

#### 8.1 iOS App Store
1. Create app in App Store Connect
2. Configure app metadata
3. Upload app icons and screenshots
4. Set up TestFlight for beta testing

#### 8.2 Google Play Store
1. Create app in Google Play Console
2. Configure app metadata
3. Upload app icons and screenshots
4. Set up internal testing track

### 9. Build and Deploy

#### 9.1 Test Production Build
```bash
# Run production configuration checker
node scripts/production-config.js

# Build for production
eas build --platform all --profile production
```

#### 9.2 Submit to App Stores
```bash
# Submit to iOS App Store
eas submit --platform ios

# Submit to Google Play Store
eas submit --platform android
```

## 🔒 Security Checklist

### Database Security
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Authentication policies configured
- [ ] Service role key secured (not exposed in client)
- [ ] Database backups configured

### API Security
- [ ] All API keys secured in environment variables
- [ ] No secrets exposed in client bundle
- [ ] Rate limiting configured
- [ ] CORS policies configured

### App Security
- [ ] Code obfuscation enabled
- [ ] Certificate pinning implemented
- [ ] Sensitive data encrypted
- [ ] Debug logs disabled in production

## 🧪 Testing Checklist

### Pre-deployment Testing
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance tests passing
- [ ] Security audit completed

### Production Testing
- [ ] Authentication flow works
- [ ] Image upload works
- [ ] AI recommendations work
- [ ] Weather integration works
- [ ] Error reporting works
- [ ] Analytics tracking works

## 📊 Monitoring Setup

### Error Monitoring
- [ ] Sentry configured and receiving errors
- [ ] Alert rules configured
- [ ] Performance monitoring enabled

### Analytics
- [ ] User analytics configured
- [ ] Performance metrics tracked
- [ ] Business metrics tracked

### Logging
- [ ] Structured logging implemented
- [ ] Log aggregation configured
- [ ] Log retention policies set

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
- Check environment variables are set correctly
- Verify all dependencies are compatible
- Check for TypeScript errors

#### Authentication Issues
- Verify Google OAuth configuration
- Check Supabase RLS policies
- Verify redirect URLs

#### Image Upload Issues
- Check Cloudinary configuration
- Verify upload preset settings
- Check network connectivity

#### AI Features Not Working
- Verify Edge Function deployment
- Check OpenRouter API key
- Verify AI proxy configuration

## 📞 Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review the error logs in Sentry
3. Check the EAS build logs
4. Verify all environment variables are set correctly
5. Run the production configuration checker: `node scripts/production-config.js`

## 🔄 Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Review security policies
- [ ] Monitor performance metrics
- [ ] Update app store metadata

### Emergency Procedures
- [ ] Incident response plan documented
- [ ] Rollback procedures tested
- [ ] Emergency contacts configured
- [ ] Backup restoration tested

---

**Note**: This guide assumes you have basic knowledge of React Native, Expo, and mobile app deployment. For detailed documentation on specific services, refer to their official documentation.