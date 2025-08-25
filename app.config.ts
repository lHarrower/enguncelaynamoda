import 'dotenv/config';

import type { ExpoConfig } from '@expo/config-types';

const config: ExpoConfig = {
  name: 'AYNAMODA',
  slug: 'aynamoda',
  version: '1.0.1',
  scheme: 'aynamoda',
  userInterfaceStyle: 'automatic',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#FAF9F6',
  },
  description:
    'AYNAMODA - AI-powered fashion companion that helps you discover your unique style, organize your wardrobe, and make sustainable fashion choices.',
  platforms: ['ios', 'android'],
  web: { bundler: 'metro' },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.aynamoda.app',
    buildNumber: '1.0.1',
    appStoreUrl: 'https://apps.apple.com/app/aynamoda/id123456789',
    infoPlist: {
      NSCameraUsageDescription:
        'AYNAMODA needs camera access to capture photos of your clothing items for wardrobe organization.',
      NSPhotoLibraryUsageDescription:
        'AYNAMODA needs photo library access to import images of your clothing items.',
      NSMicrophoneUsageDescription:
        'AYNAMODA may use microphone for voice commands and style feedback.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FAF9F6',
    },
    package: 'com.aynamoda.app',
    versionCode: 1,
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.aynamoda.app',
    permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'RECORD_AUDIO'],
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-splash-screen',
    [
      'expo-image-picker',
      {
        photosPermission: 'AYNAMODA needs access to your photo library to import clothing images.',
        cameraPermission: 'AYNAMODA needs camera access to capture photos of your clothing items.',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          'AYNAMODA uses camera to capture photos of your clothing items for wardrobe organization.',
      },
    ],
    // Sentry error monitoring - production ready
    [
      '@sentry/react-native/expo',
      {
        organization: process.env.SENTRY_ORG || 'aynamoda-org',
        project: process.env.SENTRY_PROJECT || 'aynamoda',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    ],
  ],
  // Bare workflow: use static string runtimeVersion (policies not supported)
  runtimeVersion: '1.0.1',
  updates: {
    url: 'https://u.expo.dev/3b04f89d-193b-4a40-a5a7-6af7007e0c54',
  },
  extra: {
    eas: { projectId: '3b04f89d-193b-4a40-a5a7-6af7007e0c54' },
    google: {
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    },
  },
};

export default config;
