/**
 * Performance Optimization Utilities
 * 60fps hedefi için optimizasyon araçları
 */
import type { DependencyList } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InteractionManager, LayoutAnimation, Platform } from 'react-native';

import { logger } from '@/lib/logger';

// Debounce hook for search and input optimization
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll and gesture optimization
export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
): T => {
  const lastRun = useRef(Date.now());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay],
  );
};

// Optimized layout animation
export const configureLayoutAnimation = () => {
  if (Platform.OS === 'ios') {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  }
};

// Interaction manager for heavy operations
export const runAfterInteractions = (callback: () => void) => {
  InteractionManager.runAfterInteractions(callback);
};

// Memoized style calculator
export const useMemoizedStyle = <T>(styleCalculator: () => T, dependencies: DependencyList): T => {
  return useMemo(styleCalculator, [styleCalculator, ...dependencies]);
};

// Optimized callback with dependencies
export const useOptimizedCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  dependencies: DependencyList,
): T => {
  return useCallback(callback, [callback, ...dependencies]);
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;
  type PerformanceLogger = {
    performance?: (n: string, v: number, meta?: Record<string, unknown>) => void;
  };
  const maybePerf = logger as unknown as PerformanceLogger;
  if (typeof maybePerf.performance === 'function') {
    // Prefer structured performance logging when available
    maybePerf.performance(name, duration, { name });
  } else {
    logger.info('performance', { name, duration_ms: duration });
  }
};

// Image loading optimization
export const optimizeImageUri = (uri: string, width: number, height: number): string => {
  if (uri.includes('unsplash.com')) {
    return `${uri}&w=${Math.round(width)}&h=${Math.round(height)}&fit=crop&auto=format&q=80`;
  }
  return uri;
};

// Memory cleanup utility
export const useMemoryCleanup = (cleanupFn: () => void) => {
  useEffect(() => {
    return cleanupFn;
  }, [cleanupFn]);
};

export default {
  useDebounce,
  useThrottle,
  configureLayoutAnimation,
  runAfterInteractions,
  useMemoizedStyle,
  useOptimizedCallback,
  measurePerformance,
  optimizeImageUri,
  useMemoryCleanup,
};
