// Comprehensive Monitoring Configuration
// Integrates Sentry, Analytics, and Performance Monitoring

import { Platform } from 'react-native';

import { logInDev, warnInDev } from '../utils/consoleSuppress';

// Monitoring Services Interface
interface MonitoringConfig {
  sentry: {
    enabled: boolean;
    dsn?: string;
    environment: string;
    release: string;
    tracesSampleRate: number;
    enableAutoSessionTracking: boolean;
    enableNativeCrashHandling: boolean;
    beforeSend?: (event: any) => any;
  };
  analytics: {
    enabled: boolean;
    trackingId?: string;
    enableCrashReporting: boolean;
    enablePerformanceMonitoring: boolean;
  };
  performance: {
    enabled: boolean;
    sampleRate: number;
    trackUserInteractions: boolean;
    trackNetworkRequests: boolean;
  };
}

// Default monitoring configuration
const defaultConfig: MonitoringConfig = {
  sentry: {
    enabled: !__DEV__,
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: __DEV__ ? 'development' : 'production',
    release: `aynamoda@${process.env.EXPO_APP_VERSION || '1.0.1'}`,
    tracesSampleRate: __DEV__ ? 0.1 : 0.2,
    enableAutoSessionTracking: true,
    enableNativeCrashHandling: true,
    beforeSend: (event) => {
      // Filter out sensitive data
      if (event.exception) {
        const exception = event.exception.values?.[0];
        if (exception?.stacktrace?.frames) {
          exception.stacktrace.frames = exception.stacktrace.frames.map((frame: any) => {
            // Remove sensitive file paths
            if (frame.filename) {
              frame.filename = frame.filename.replace(/\/Users\/[^/]+/g, '/Users/***');
              frame.filename = frame.filename.replace(/\/home\/[^/]+/g, '/home/***');
            }
            return frame;
          });
        }
      }

      // Remove sensitive user data
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }

      return event;
    },
  },
  analytics: {
    enabled: !__DEV__,
    enableCrashReporting: true,
    enablePerformanceMonitoring: true,
  },
  performance: {
    enabled: true,
    sampleRate: __DEV__ ? 1.0 : 0.1,
    trackUserInteractions: true,
    trackNetworkRequests: true,
  },
};

// Monitoring Service Class
class MonitoringService {
  private config: MonitoringConfig;
  private isInitialized = false;
  private Sentry: any = null;

  constructor(config: MonitoringConfig = defaultConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.initializeSentry();
      await this.initializeAnalytics();
      await this.initializePerformanceMonitoring();

      this.isInitialized = true;
      logInDev('Monitoring services initialized successfully');
    } catch (error) {
      warnInDev('Failed to initialize monitoring services:', error);
    }
  }

  private async initializeSentry(): Promise<void> {
    if (!this.config.sentry.enabled || !this.config.sentry.dsn) {
      logInDev('Sentry monitoring disabled or DSN not provided');
      return;
    }

    try {
      const SentryModule = await import('@sentry/react-native');
      this.Sentry = SentryModule;

      this.Sentry.init({
        dsn: this.config.sentry.dsn,
        environment: this.config.sentry.environment,
        release: this.config.sentry.release,
        tracesSampleRate: this.config.sentry.tracesSampleRate,
        enableAutoSessionTracking: this.config.sentry.enableAutoSessionTracking,
        enableNativeCrashHandling: this.config.sentry.enableNativeCrashHandling,
        beforeSend: this.config.sentry.beforeSend,
        integrations: [
          new SentryModule.ReactNativeTracing({
            enableUserInteractionTracing: true,
            enableNativeFramesTracking: true,
          }),
        ],
        // Additional configuration
        attachStacktrace: true,
        enableOutOfMemoryTracking: true,
        enableWatchdogTerminationTracking: Platform.OS === 'ios',
      });

      logInDev('Sentry initialized successfully');
    } catch (error) {
      warnInDev('Failed to initialize Sentry:', error);
    }
  }

  private async initializeAnalytics(): Promise<void> {
    if (!this.config.analytics.enabled) {
      logInDev('Analytics disabled');
      return;
    }

    // Initialize analytics services (Firebase Analytics, etc.)
    // This would be implemented based on your analytics provider
    logInDev('Analytics initialized');
  }

  private async initializePerformanceMonitoring(): Promise<void> {
    if (!this.config.performance.enabled) {
      logInDev('Performance monitoring disabled');
      return;
    }

    // Initialize performance monitoring
    logInDev('Performance monitoring initialized');
  }

  // Error Reporting Methods
  captureException(error: Error, context?: Record<string, any>): void {
    if (this.Sentry) {
      this.Sentry.withScope((scope: any) => {
        if (context) {
          Object.keys(context).forEach((key) => {
            scope.setContext(key, context[key]);
          });
        }
        this.Sentry.captureException(error);
      });
    } else {
      warnInDev('Sentry not initialized, logging error:', error);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (this.Sentry) {
      this.Sentry.captureMessage(message, level);
    } else {
      logInDev(`Sentry message (${level}):`, message);
    }
  }

  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'info' | 'warning' | 'error';
    data?: Record<string, any>;
  }): void {
    if (this.Sentry) {
      this.Sentry.addBreadcrumb(breadcrumb);
    } else {
      logInDev('Sentry breadcrumb:', breadcrumb);
    }
  }

  setUser(user: { id?: string; username?: string; segment?: string }): void {
    if (this.Sentry) {
      this.Sentry.setUser({
        id: user.id,
        username: user.username,
        segment: user.segment,
      });
    } else {
      logInDev('Sentry user:', user);
    }
  }

  setTag(key: string, value: string): void {
    if (this.Sentry) {
      this.Sentry.setTag(key, value);
    } else {
      logInDev(`Sentry tag ${key}:`, value);
    }
  }

  // Performance Monitoring Methods
  startTransaction(name: string, operation: string): any {
    if (this.Sentry) {
      return this.Sentry.startTransaction({ name, op: operation });
    }
    return null;
  }

  // Analytics Methods
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (this.config.analytics.enabled) {
      // Implement analytics tracking
      logInDev(`Analytics event: ${eventName}`, properties);
    }
  }

  trackScreen(screenName: string, properties?: Record<string, any>): void {
    if (this.config.analytics.enabled) {
      // Implement screen tracking
      logInDev(`Analytics screen: ${screenName}`, properties);
    }
  }

  // Health Check
  isHealthy(): boolean {
    return this.isInitialized;
  }

  getConfig(): MonitoringConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();
export default monitoringService;

// Export types
export type { MonitoringConfig };

// Utility functions
export const initializeMonitoring = async (config?: Partial<MonitoringConfig>) => {
  if (config) {
    monitoringService.updateConfig(config);
  }
  await monitoringService.initialize();
};

export const captureError = (error: Error, context?: Record<string, any>) => {
  monitoringService.captureException(error, context);
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  monitoringService.trackEvent(eventName, properties);
};

export const trackScreen = (screenName: string, properties?: Record<string, any>) => {
  monitoringService.trackScreen(screenName, properties);
};
