/**
 * Dynamic Import Utilities
 * Provides code splitting and lazy loading capabilities to reduce bundle size
 */

import React, { ComponentType, lazy, Suspense } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { logger } from '@/lib/logger';

import { DesignSystem } from '../theme/DesignSystem';

// Loading component for lazy-loaded components
const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={DesignSystem.colors.terracotta[500]} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

// Error boundary for lazy-loaded components
class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('lazy_load_error', {
      error: String(error),
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent =
        this.props.fallback ||
        (() => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load component</Text>
          </View>
        ));
      return <FallbackComponent />;
    }

    return this.props.children;
  }
}

/**
 * Creates a lazy-loaded component with error boundary and loading fallback
 */
export function createLazyComponent<TProps extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<TProps> }>,
  loadingMessage?: string,
  fallbackComponent?: React.ComponentType,
): React.FC<TProps> {
  const LazyComponent = lazy(
    importFn as unknown as () => Promise<{ default: ComponentType<TProps> }>,
  ) as unknown as ComponentType<TProps>;

  const LazyWrapper: React.FC<TProps> = (props) => (
    <LazyLoadErrorBoundary fallback={fallbackComponent}>
      <Suspense fallback={<LoadingFallback message={loadingMessage} />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyLoadErrorBoundary>
  );
  LazyWrapper.displayName = 'LazyComponent';

  return LazyWrapper;
}

/**
 * Dynamic import for screens with route-based code splitting
 */
export const createLazyScreen = <TProps extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<TProps> }>,
  screenName: string,
) => createLazyComponent(importFn, `Loading ${screenName}...`);

/**
 * Dynamic import for heavy components (charts, complex UI)
 */
export const createLazyHeavyComponent = <TProps extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<TProps> }>,
  componentName: string,
) => createLazyComponent(importFn, `Loading ${componentName}...`);

/**
 * Preload a component for better UX
 */
export function preloadComponent(importFn: () => Promise<{ default: ComponentType<unknown> }>) {
  // Start loading the component but don't wait for it
  importFn().catch((error) => {
    logger.warn('preload_component_failed', { error: String(error) });
  });
}

/**
 * Bundle splitting utilities for different feature areas
 */
export const LazyComponents = {
  // Wardrobe components (heavy with image processing)
  WardrobeGrid: createLazyComponent(
    () =>
      import('../components/wardrobe/WardrobeGrid') as Promise<{ default: ComponentType<unknown> }>,
    'Loading wardrobe...',
  ),

  // Discovery components (AI-heavy)
  DiscoveryEngine: createLazyComponent(
    () =>
      import('../components/discovery/DiscoveryEngine') as Promise<{
        default: ComponentType<unknown>;
      }>,
    'Loading discovery...',
  ),

  // Charts and analytics (heavy libraries)
  PieChartWrapper: createLazyComponent(
    () => import('../components/charts/LineChart') as Promise<{ default: ComponentType<unknown> }>,
    'Loading analytics...',
  ),

  // Auth components (can be lazy loaded after initial load)
  AuthContainer: createLazyComponent(
    () =>
      import('../components/auth/AuthContainer') as Promise<{ default: ComponentType<unknown> }>,
    'Loading authentication...',
  ),
};

/**
 * Lazy screens for route-based code splitting
 */
export const LazyScreens = {
  AddItem: createLazyScreen(
    () => import('../screens/AddItemScreen') as Promise<{ default: ComponentType<unknown> }>,
    'AddItem',
  ),

  AynaMirror: createLazyScreen(
    () => import('../screens/AynaMirrorScreen') as Promise<{ default: ComponentType<unknown> }>,
    'AynaMirror',
  ),

  AynaMirrorSettings: createLazyScreen(
    () =>
      import('../screens/AynaMirrorSettingsScreen') as Promise<{ default: ComponentType<unknown> }>,
    'AynaMirrorSettings',
  ),

  MainRitual: createLazyScreen(
    () => import('../screens/MainRitualScreen') as Promise<{ default: ComponentType<unknown> }>,
    'MainRitual',
  ),

  Wardrobe: createLazyScreen(
    () => import('../screens/WardrobeScreen') as Promise<{ default: ComponentType<unknown> }>,
    'Wardrobe',
  ),
};

/**
 * Utility to check if a module should be loaded based on user behavior
 */
export function shouldLoadModule(
  moduleName: string,
  userPreferences?: Record<string, unknown>,
): boolean {
  // Example logic - can be enhanced based on user analytics
  const criticalModules = ['home', 'wardrobe', 'auth'];

  if (criticalModules.includes(moduleName.toLowerCase())) {
    return true;
  }

  // Load based on user preferences or usage patterns
  if (
    userPreferences?.frequentlyUsed &&
    Array.isArray(userPreferences.frequentlyUsed) &&
    userPreferences.frequentlyUsed.includes(moduleName)
  ) {
    return true;
  }

  return false;
}

/**
 * Preload strategy for better UX
 */
export function initializePreloadStrategy() {
  // Preload critical components after initial render
  setTimeout(() => {
    preloadComponent(
      () =>
        import('../components/wardrobe/WardrobeGrid') as Promise<{
          default: ComponentType<unknown>;
        }>,
    );
    preloadComponent(
      () =>
        import('../components/discovery/DiscoveryEngine') as Promise<{
          default: ComponentType<unknown>;
        }>,
    );
  }, 2000);

  // Preload based on user interaction patterns
  setTimeout(() => {
    preloadComponent(
      () =>
        import('../components/charts/LineChart') as Promise<{ default: ComponentType<unknown> }>,
    );
    preloadComponent(
      () => import('../screens/AynaMirrorScreen') as Promise<{ default: ComponentType<unknown> }>,
    );
  }, 5000);
}

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
    justifyContent: 'center',
    padding: DesignSystem.spacing.lg,
  },
  errorText: {
    color: DesignSystem.colors.error.main,
    fontSize: DesignSystem.typography.body.fontSize,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
    justifyContent: 'center',
    padding: DesignSystem.spacing.lg,
  },
  loadingText: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.body.fontSize,
    marginTop: DesignSystem.spacing.md,
    textAlign: 'center',
  },
});
