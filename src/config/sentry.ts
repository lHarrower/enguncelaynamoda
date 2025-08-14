// P0 Observability: Initialize Sentry for error tracking & performance tracing
import * as Sentry from '@sentry/react-native';

if (!__DEV__) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
  debug: false,
  release: `aynamoda@${process.env.EXPO_APP_VERSION ?? '1.0.1'}`,
  dist: process.env.EXPO_BUILD_ID,
  enableNativeCrashHandling: true,
  });
}

export { Sentry };
