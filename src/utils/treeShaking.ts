/**
 * Tree Shaking Optimization Utilities
 * Helps eliminate dead code and optimize imports for smaller bundle size
 */

import type { ComponentType } from 'react';
import { Platform } from 'react-native';

import { logger } from '@/lib/logger';

// Re-export only used utilities from lodash to enable tree shaking
// Using individual imports to avoid lodash type issues
export { default as cloneDeep } from 'lodash/cloneDeep';
export { default as debounce } from 'lodash/debounce';
export { default as memoize } from 'lodash/memoize';
export { default as throttle } from 'lodash/throttle';

// Optimized icon imports - only import what's needed
// Provide a safer, explicit component type to avoid `any`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComponent = ComponentType<any>;
export const Icons = {
  // Common icons used throughout the app
  Heart: (): Promise<IconComponent> =>
    import('@expo/vector-icons/AntDesign').then(
      (module) => module.default as unknown as IconComponent,
    ),
  Search: (): Promise<IconComponent> =>
    import('@expo/vector-icons/Feather').then(
      (module) => module.default as unknown as IconComponent,
    ),
  User: (): Promise<IconComponent> =>
    import('@expo/vector-icons/Feather').then(
      (module) => module.default as unknown as IconComponent,
    ),
  Settings: (): Promise<IconComponent> =>
    import('@expo/vector-icons/Feather').then(
      (module) => module.default as unknown as IconComponent,
    ),
  Camera: (): Promise<IconComponent> =>
    import('@expo/vector-icons/Feather').then(
      (module) => module.default as unknown as IconComponent,
    ),
  Plus: (): Promise<IconComponent> =>
    import('@expo/vector-icons/Feather').then(
      (module) => module.default as unknown as IconComponent,
    ),
  Filter: (): Promise<IconComponent> =>
    import('@expo/vector-icons/Feather').then(
      (module) => module.default as unknown as IconComponent,
    ),
  Share: (): Promise<IconComponent> =>
    import('@expo/vector-icons/Feather').then(
      (module) => module.default as unknown as IconComponent,
    ),

  // Material icons for specific use cases
  Favorite: (): Promise<IconComponent> =>
    import('@expo/vector-icons/MaterialIcons').then(
      (module) => module.default as unknown as IconComponent,
    ),
  ShoppingBag: (): Promise<IconComponent> =>
    import('@expo/vector-icons/MaterialIcons').then(
      (module) => module.default as unknown as IconComponent,
    ),

  // Ionicons for iOS-style icons
  ChevronBack: (): Promise<IconComponent> =>
    import('@expo/vector-icons/Ionicons').then(
      (module) => module.default as unknown as IconComponent,
    ),
  ChevronForward: (): Promise<IconComponent> =>
    import('@expo/vector-icons/Ionicons').then(
      (module) => module.default as unknown as IconComponent,
    ),
};

/**
 * Optimized React Native component imports
 * Only import what's actually used to reduce bundle size
 */
export const OptimizedRNComponents = {
  // Core components
  View: () => import('react-native').then((module) => ({ View: module.View })),
  Text: () => import('react-native').then((module) => ({ Text: module.Text })),
  Image: () => import('react-native').then((module) => ({ Image: module.Image })),
  ScrollView: () => import('react-native').then((module) => ({ ScrollView: module.ScrollView })),
  TouchableOpacity: () =>
    import('react-native').then((module) => ({ TouchableOpacity: module.TouchableOpacity })),

  // Input components
  TextInput: () => import('react-native').then((module) => ({ TextInput: module.TextInput })),
  Switch: () => import('react-native').then((module) => ({ Switch: module.Switch })),

  // Layout components
  FlatList: () => import('react-native').then((module) => ({ FlatList: module.FlatList })),
  SectionList: () => import('react-native').then((module) => ({ SectionList: module.SectionList })),

  // Modal and overlay components
  Modal: () => import('react-native').then((module) => ({ Modal: module.Modal })),
  Alert: () => import('react-native').then((module) => ({ Alert: module.Alert })),

  // Platform-specific components
  StatusBar: () => import('react-native').then((module) => ({ StatusBar: module.StatusBar })),
  SafeAreaView: () =>
    import('react-native').then((module) => ({ SafeAreaView: module.SafeAreaView })),
};

/**
 * Optimized third-party library imports
 */
export const OptimizedLibraries = {
  // Reanimated - only import what's needed
  Animated: () =>
    import('react-native-reanimated').then((module) => ({
      useSharedValue: module.useSharedValue,
      useAnimatedStyle: module.useAnimatedStyle,
      withTiming: module.withTiming,
      withSpring: module.withSpring,
      runOnJS: module.runOnJS,
    })),

  // Gesture Handler - specific gestures only
  GestureHandler: () =>
    import('react-native-gesture-handler').then((module) => ({
      PanGestureHandler: module.PanGestureHandler,
      TapGestureHandler: module.TapGestureHandler,
      PinchGestureHandler: module.PinchGestureHandler,
    })),

  // Expo modules - only what's used
  ExpoModules: {
    ImagePicker: () => import('expo-image-picker'),
    Camera: () => import('expo-camera'),
    Haptics: () => import('expo-haptics'),
    LinearGradient: () => import('expo-linear-gradient'),
    BlurView: () => import('expo-blur'),
  },
};

/**
 * Bundle analysis utilities
 */
export const BundleAnalysis = {
  /**
   * Log module usage for analysis
   */
  logModuleUsage: (moduleName: string, componentName?: string) => {
    if (__DEV__) {
      logger.debug('[Bundle Analysis] Loading module', {
        moduleName,
        componentName,
      });
    }
  },

  /**
   * Track heavy component usage
   */
  trackHeavyComponent: (componentName: string, size?: number) => {
    if (__DEV__) {
      logger.info('[Bundle Analysis] Heavy component loaded', {
        componentName,
        sizeKb: size,
      });
    }
  },

  /**
   * Measure component load time
   */
  measureLoadTime: async <T>(loadFn: () => Promise<T>, componentName: string): Promise<T> => {
    const startTime = Date.now();
    try {
      const result = await loadFn();
      const loadTime = Date.now() - startTime;

      if (__DEV__) {
        logger.debug('[Bundle Analysis] Component loaded', {
          componentName,
          loadTimeMs: loadTime,
        });
      }

      return result;
    } catch (error) {
      const loadTime = Date.now() - startTime;
      logger.error('[Bundle Analysis] Component failed to load', {
        componentName,
        loadTimeMs: loadTime,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
};

/**
 * Dead code elimination helpers
 */
export const DeadCodeElimination = {
  /**
   * Conditional import based on platform
   */
  platformSpecificImport: async <T>(
    iosImport: () => Promise<T>,
    androidImport: () => Promise<T>,
    webImport?: () => Promise<T>,
  ): Promise<T> => {
    if (Platform.OS === 'ios') {
      return iosImport();
    } else if (Platform.OS === 'android') {
      return androidImport();
    } else if (Platform.OS === 'web' && webImport) {
      return webImport();
    } else {
      // Fallback to iOS implementation
      return iosImport();
    }
  },

  /**
   * Feature flag based imports
   */
  featureFlagImport: <T>(
    featureFlag: boolean,
    enabledImport: () => Promise<T>,
    disabledImport: () => Promise<T>,
  ): Promise<T> => {
    return featureFlag ? enabledImport() : disabledImport();
  },

  /**
   * Environment-based imports
   */
  environmentImport: <T>(devImport: () => Promise<T>, prodImport: () => Promise<T>): Promise<T> => {
    return __DEV__ ? devImport() : prodImport();
  },
};

/**
 * Optimized utility functions that are tree-shakeable
 */
export const OptimizedUtils = {
  // Date utilities - only what's needed
  formatDate: (date: Date, format: string): string => {
    // Lightweight date formatting without moment.js
    const options: Intl.DateTimeFormatOptions = {};

    switch (format) {
      case 'short':
        options.dateStyle = 'short';
        break;
      case 'medium':
        options.dateStyle = 'medium';
        break;
      case 'long':
        options.dateStyle = 'long';
        break;
      default:
        options.dateStyle = 'medium';
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
  },

  // Color utilities - lightweight color manipulation
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  // Validation utilities - lightweight validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Storage utilities - optimized for React Native
  storage: {
    get: async (key: string): Promise<string | null> => {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return AsyncStorage.default.getItem(key);
    },

    set: async (key: string, value: string): Promise<void> => {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return AsyncStorage.default.setItem(key, value);
    },

    remove: async (key: string): Promise<void> => {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return AsyncStorage.default.removeItem(key);
    },
  },
};

/**
 * Bundle size monitoring
 */
export const BundleMonitoring = {
  /**
   * Initialize bundle monitoring in development
   */
  initialize: () => {
    if (__DEV__) {
      logger.info('[Bundle Monitoring] Initialized - tracking module loads');

      // Track memory usage
      interface PerformanceMemory {
        usedJSHeapSize?: number;
      }
      interface GlobalLike {
        performance?: { memory?: PerformanceMemory };
      }

      const trackMemory = () => {
        const g = globalThis as unknown as GlobalLike;
        const used = g.performance?.memory?.usedJSHeapSize;
        if (typeof used === 'number') {
          logger.debug('[Bundle Monitoring] Memory usage', {
            usedMB: Math.round(used / 1024 / 1024),
          });
        }
      };

      // Track every 30 seconds in development
      setInterval(trackMemory, 30000);
    }
  },

  /**
   * Report bundle metrics
   */
  reportMetrics: () => {
    if (__DEV__) {
      logger.info('[Bundle Monitoring] Bundle metrics reported');
      // In a real app, this would send metrics to analytics
    }
  },
};
