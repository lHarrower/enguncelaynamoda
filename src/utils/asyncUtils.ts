// Async utility helpers
// Centralized fire-and-forget pattern to satisfy no-floating-promises while preserving intent.
// Usage: fireAndForget(doWork()) or fireAndForget(doWork(), 'label')

export function fireAndForget<T>(promise: Promise<T>, label?: string): undefined {
  promise.catch((err) => {
    if (process.env.NODE_ENV !== 'production') {
      const tag = label ? `[fireAndForget:${label}]` : '[fireAndForget]';

      warnInDev(`${tag} unhandled rejection`, err instanceof Error ? err.message : err);
    }
  });
}

import { warnInDev } from './consoleSuppress';
