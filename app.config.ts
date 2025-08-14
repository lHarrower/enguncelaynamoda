import 'dotenv/config';
import type { ExpoConfig } from '@expo/config-types';

const config: ExpoConfig = {
  name: 'aynamoda',
  slug: 'aynamoda',
  version: '1.0.1', // Bare workflow requirement for static runtimeVersion mapping
  scheme: 'aynamoda',
  plugins: [
    ["@sentry/react-native/expo", { organization: 'your-org', project: 'aynamoda' }]
  ],
  // Bare workflow: use static string runtimeVersion (policies not supported)
  runtimeVersion: '1.0.1',
  updates: {
    url: 'https://u.expo.dev/3b04f89d-193b-4a40-a5a7-6af7007e0c54'
  },
  extra: {
    eas: { projectId: '3b04f89d-193b-4a40-a5a7-6af7007e0c54' },
    google: {
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    },
  },
};

export default config;
