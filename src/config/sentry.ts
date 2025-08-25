// P0 Observability: Initialize Sentry for error tracking & performance tracing
// Optimized with dynamic imports to reduce bundle size
import { logInDev, warnInDev } from '@/utils/consoleSuppress';

let Sentry: typeof import('@sentry/react-native') | null = null;

// Only load Sentry in production to reduce development bundle size
const initSentry = async () => {
  if (!__DEV__ && !Sentry) {
    try {
      const SentryModule = await import('@sentry/react-native');
      Sentry = SentryModule;

      Sentry.init({
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
        tracesSampleRate: 0.2,
        enableAutoSessionTracking: true,
        debug: false,
        release: `aynamoda@${process.env.EXPO_APP_VERSION ?? '1.0.1'}`,
        dist: process.env.EXPO_BUILD_ID,
        enableNativeCrashHandling: true,
      });
    } catch (error) {
      warnInDev('Failed to initialize Sentry:', error);
    }
  }
  return Sentry;
};

interface SentryBreadcrumb {
  message?: string;
  category?: string;
  level?: string;
  data?: Record<string, unknown>;
}

interface SentryUser {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: unknown;
}

// Mock Sentry for development
const mockSentry = {
  captureException: (error: Error | unknown) => warnInDev('Sentry (dev):', error),
  captureMessage: (message: string) => logInDev('Sentry (dev):', message),
  addBreadcrumb: (breadcrumb: SentryBreadcrumb) => logInDev('Sentry breadcrumb (dev):', breadcrumb),
  setUser: (user: SentryUser) => logInDev('Sentry user (dev):', user),
  setTag: (key: string, value: string) => logInDev('Sentry tag (dev):', key, value),
  setContext: (key: string, context: Record<string, unknown>) =>
    logInDev('Sentry context (dev):', key, context),
};

export { initSentry, mockSentry as Sentry };
export default __DEV__ ? mockSentry : initSentry;
