/**
 * Bundle Optimization Configuration
 * Centralized configuration for bundle size optimization strategies
 */

import { Platform } from 'react-native';

import { logInDev } from '../utils/consoleSuppress';

export interface BundleOptimizationConfig {
  enableCodeSplitting: boolean;
  enableTreeShaking: boolean;
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableMinification: boolean;
  chunkSizeLimit: number;
  preloadStrategy: 'aggressive' | 'conservative' | 'smart';
  excludeFromBundle: string[];
  criticalModules: string[];
}

/**
 * Default optimization configuration
 */
export const defaultOptimizationConfig: BundleOptimizationConfig = {
  enableCodeSplitting: true,
  enableTreeShaking: true,
  enableLazyLoading: true,
  enableImageOptimization: true,
  enableMinification: !__DEV__,
  chunkSizeLimit: 250000, // 250KB per chunk
  preloadStrategy: 'smart',
  excludeFromBundle: [
    // Development-only modules
    'react-devtools',
    'flipper',
    '@storybook',

    // Large libraries that can be lazy loaded
    'react-native-svg',
    'react-native-camera',

    // Analytics and tracking (can be loaded after app start)
    '@sentry/react-native',
    'react-native-analytics',
  ],
  criticalModules: [
    // Core app functionality
    'react',
    'react-native',
    'expo-router',
    '@react-navigation',

    // Essential UI components
    'src/components/shared',
    'src/theme',
    'src/constants',

    // Authentication
    'src/components/auth',
    'src/hooks/useAuth',
  ],
};

/**
 * Platform-specific optimizations
 */
export const platformOptimizations = {
  ios: {
    ...defaultOptimizationConfig,
    // iOS-specific optimizations
    enableImageOptimization: true,
    chunkSizeLimit: 300000, // iOS can handle slightly larger chunks
  },
  android: {
    ...defaultOptimizationConfig,
    // Android-specific optimizations
    enableImageOptimization: true,
    chunkSizeLimit: 200000, // Smaller chunks for Android
  },
  web: {
    ...defaultOptimizationConfig,
    // Web-specific optimizations
    enableCodeSplitting: true,
    chunkSizeLimit: 500000, // Web can handle larger chunks
    preloadStrategy: 'aggressive' as const,
  },
};

/**
 * Get optimization config for current platform
 */
export function getOptimizationConfig(): BundleOptimizationConfig {
  return (
    platformOptimizations[Platform.OS as keyof typeof platformOptimizations] ||
    defaultOptimizationConfig
  );
}

/**
 * Bundle splitting strategies
 */
export const bundleSplittingStrategies = {
  /**
   * Route-based splitting
   */
  routes: {
    home: ['src/screens/HomeScreen', 'src/components/home'],
    wardrobe: ['src/screens/WardrobeScreen', 'src/components/wardrobe'],
    discovery: ['src/screens/DiscoveryScreen', 'src/components/discovery'],
    profile: ['src/screens/ProfileScreen', 'src/components/profile'],
    auth: ['src/screens/AuthScreen', 'src/components/auth'],
  },

  /**
   * Feature-based splitting
   */
  features: {
    vision: ['src/components/vision', 'src/services/visionService'],
    analytics: ['src/components/charts', 'src/services/analyticsService'],
    camera: ['src/components/camera', 'expo-camera'],
    sharing: ['src/components/sharing', 'src/utils/sharing'],
    notifications: ['src/services/notificationService', 'expo-notifications'],
  },

  /**
   * Vendor splitting
   */
  vendors: {
    react: ['react', 'react-native'],
    expo: ['expo', '@expo'],
    navigation: ['@react-navigation', 'expo-router'],
    ui: ['@shopify/restyle', 'react-native-reanimated'],
    external: ['lodash', 'date-fns', 'zod'],
  },
};

/**
 * Optimization metrics tracking
 */
export class BundleOptimizationMetrics {
  private static instance: BundleOptimizationMetrics;
  private metrics: Map<string, number | { used: number; total: number; limit: number }> = new Map();

  static getInstance(): BundleOptimizationMetrics {
    if (!BundleOptimizationMetrics.instance) {
      BundleOptimizationMetrics.instance = new BundleOptimizationMetrics();
    }
    return BundleOptimizationMetrics.instance;
  }

  /**
   * Track bundle load time
   */
  trackBundleLoadTime(bundleName: string, loadTime: number): void {
    this.metrics.set(`${bundleName}_load_time`, loadTime);

    if (__DEV__) {
      logInDev(`[Bundle Metrics] ${bundleName} loaded in ${loadTime}ms`);
    }
  }

  /**
   * Track bundle size
   */
  trackBundleSize(bundleName: string, size: number): void {
    this.metrics.set(`${bundleName}_size`, size);

    if (__DEV__) {
      logInDev(`[Bundle Metrics] ${bundleName} size: ${Math.round(size / 1024)}KB`);
    }
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage(): void {
    if (global.performance && 'memory' in global.performance) {
      const memory = (
        global.performance as Performance & {
          memory: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
      ).memory;
      this.metrics.set('memory_usage', {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      });

      if (__DEV__) {
        logInDev(`[Bundle Metrics] Memory: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`);
      }
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): Record<string, number | { used: number; total: number; limit: number }> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics.clear();
  }
}

/**
 * Bundle optimization utilities
 */
export const BundleOptimizationUtils = {
  /**
   * Check if a module should be included in the main bundle
   */
  shouldIncludeInMainBundle(modulePath: string): boolean {
    const config = getOptimizationConfig();

    // Guard against undefined arrays
    const criticalModules = Array.isArray(config.criticalModules) ? config.criticalModules : [];
    const excludeFromBundle = Array.isArray(config.excludeFromBundle)
      ? config.excludeFromBundle
      : [];

    // Check if it's a critical module
    const isCritical = criticalModules.some((critical) => modulePath.includes(critical));

    // Check if it's excluded
    const isExcluded = excludeFromBundle.some((excluded) => modulePath.includes(excluded));

    return isCritical && !isExcluded;
  },

  /**
   * Get chunk name for a module
   */
  getChunkName(modulePath: string): string {
    // Route-based chunks
    for (const [route, paths] of Object.entries(bundleSplittingStrategies.routes)) {
      if (paths.some((path) => modulePath.includes(path))) {
        return `route-${route}`;
      }
    }

    // Feature-based chunks
    for (const [feature, paths] of Object.entries(bundleSplittingStrategies.features)) {
      if (paths.some((path) => modulePath.includes(path))) {
        return `feature-${feature}`;
      }
    }

    // Vendor chunks
    for (const [vendor, paths] of Object.entries(bundleSplittingStrategies.vendors)) {
      if (paths.some((path) => modulePath.includes(path))) {
        return `vendor-${vendor}`;
      }
    }

    return 'common';
  },

  /**
   * Estimate bundle size impact
   */
  estimateSizeImpact(modulePath: string): number {
    // Rough estimates based on common module sizes
    const sizeEstimates: Record<string, number> = {
      'react-native': 500000,
      expo: 200000,
      '@react-navigation': 150000,
      'react-native-reanimated': 300000,
      'victory-native': 400000,
      lodash: 100000,
      '@expo/vector-icons': 250000,
    };

    for (const [module, size] of Object.entries(sizeEstimates)) {
      if (modulePath.includes(module)) {
        return size;
      }
    }

    // Default estimate for unknown modules
    return 10000;
  },

  /**
   * Initialize optimization monitoring
   */
  initializeMonitoring(): void {
    const metrics = BundleOptimizationMetrics.getInstance();

    // Track initial memory usage
    metrics.trackMemoryUsage();

    // Set up periodic monitoring in development
    if (__DEV__) {
      setInterval(() => {
        metrics.trackMemoryUsage();
      }, 30000); // Every 30 seconds
    }

    // Track app start time
    const startTime = Date.now();
    setTimeout(() => {
      const loadTime = Date.now() - startTime;
      metrics.trackBundleLoadTime('app-startup', loadTime);
    }, 100);
  },
};

/**
 * Initialize bundle optimization
 */
export function initializeBundleOptimization(): void {
  const config = getOptimizationConfig();

  if (__DEV__) {
    logInDev('[Bundle Optimization] Initialized with config:', config);
  }

  // Initialize monitoring
  BundleOptimizationUtils.initializeMonitoring();

  // Set up preloading strategy
  if (config.preloadStrategy === 'aggressive') {
    // Preload all non-critical modules after 2 seconds
    setTimeout(() => {
      // This would trigger preloading of lazy components
      logInDev('[Bundle Optimization] Starting aggressive preloading');
    }, 2000);
  } else if (config.preloadStrategy === 'smart') {
    // Preload based on user behavior patterns
    setTimeout(() => {
      logInDev('[Bundle Optimization] Starting smart preloading');
    }, 5000);
  }
}

// Note: initializeBundleOptimization() should be called explicitly from _layout.tsx
// Removed auto-initialization to prevent module-level execution issues
