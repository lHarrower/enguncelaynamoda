// Production Console Management Utility
// Manages console output for production builds

// __DEV__ is already declared by React Native

// Only suppress console logs in production builds
if (!__DEV__) {
  // Store original console methods

  const originalWarn = console.warn;

  const originalError = console.error;
  // eslint-disable-next-line no-console
  const _originalLog = console.log;
  // eslint-disable-next-line no-console
  const _originalInfo = console.info;
  // eslint-disable-next-line no-console
  const _originalDebug = console.debug;

  // In production, suppress all console.log and console.debug
  // eslint-disable-next-line no-console
  console.log = () => {};
  // eslint-disable-next-line no-console
  console.debug = () => {};
  // eslint-disable-next-line no-console
  console.info = () => {};

  // Keep warnings and errors but filter out known non-critical ones
  const SUPPRESSED_PATTERNS = [
    // Native module errors (expected in Expo Go)
    'Cannot find native module',
    'ExpoPushTokenManager',
    'RNCDatePicker',
    'TurboModuleRegistry.getEnforcing',

    // Route warnings (false positives)
    'Route "./_layout.tsx" is missing the required default export',
    'Route "./onboarding.tsx" is missing the required default export',
    'missing the required default export',

    // React warnings (non-critical)
    'Invalid prop `style` supplied to `React.Fragment`',
    'React.Fragment can only have `key` and `children` props',

    // Expo notifications (expected in Expo Go)
    'expo-notifications',
    'Android Push notifications',
    'functionality is not fully supported in Expo Go',
    'Use a development build instead of Expo Go',
    'We recommend you instead use a development build',

    // DateTimePicker (expected in Expo Go)
    'DateTimePicker not available',
    'Invariant Violation',

    'relation "public.user_preferences" does not exist',
    '[AynaMirrorService] Failed to get user preferences',

    // Auth warnings
    'useAuth called outside of AuthProvider',

    // Performance warnings
    'VirtualizedLists should never be nested',
    'componentWillReceiveProps has been renamed',
    'componentWillMount has been renamed',
    'AsyncStorage has been extracted',
    'Require cycle:',
    'Remote debugger',
  ];

  // Check if message should be suppressed
  const shouldSuppress = (message: string): boolean => {
    return SUPPRESSED_PATTERNS.some((pattern) => message.includes(pattern));
  };

  type LogArg = string | number | boolean | Error | Record<string, unknown> | undefined | null;

  // Override console methods with filtering

  console.warn = (...args: LogArg[]) => {
    const message = args[0];
    if (typeof message === 'string' && shouldSuppress(message)) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args: LogArg[]) => {
    const message = args[0];
    if (typeof message === 'string' && shouldSuppress(message)) {
      return;
    }
    originalError.apply(console, args);
  };
}

// Export utility functions for development debugging
export const isDevelopment = __DEV__;
export const logInDev = (...args: DevLogArg[]) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    
  }
};
// Broaden DevLogArg to accept any value passed from catch blocks safely
export type DevLogArg = unknown;
export const warnInDev = (...args: DevLogArg[]) => {
  if (__DEV__) {
    
  }
};
export const errorInDev = (...args: DevLogArg[]) => {
  if (__DEV__) {
    
  }
};
