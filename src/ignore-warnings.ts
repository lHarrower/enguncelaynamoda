import { LogBox } from 'react-native';

// Quiet noisy dev-time warnings.
LogBox.ignoreLogs([
  /Require cycle:/,
  /expo-notifications: Android Push notifications/,
  /Linking requires a build-time setting `scheme`/,
]);

// Add development-only global error listeners on web to capture the real error message
if (__DEV__ && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  // Avoid double registration in Fast Refresh
  const anyWindow = window as any;
  if (!anyWindow.__AYNAMODA_GLOBAL_ERROR_LISTENERS__) {
    anyWindow.__AYNAMODA_GLOBAL_ERROR_LISTENERS__ = true;

    window.addEventListener('error', (event) => {
      console.error('[GlobalError]', {
        message: event.message,
        file: event.filename,
        line: event.lineno,
        column: event.colno,
        href: window.location?.href,
        error: event.error?.message,
        stack: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const reason: any = event.reason;

      console.error('[GlobalUnhandledRejection]', {
        href: window.location?.href,
        type: typeof reason,
        reason,
        message: reason?.message,
        stack: reason?.stack,
      });
    });
  }
}

export {};
