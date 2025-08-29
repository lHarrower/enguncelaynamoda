/**
 * Performance Monitoring Hook
 * Real-time performance tracking for React Native components and app startup
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';

import { StartupMetrics, startupPerformanceService } from '@/services/startupPerformanceService';
import { errorInDev } from '@/utils/consoleSuppress';

interface PerformanceMetrics {
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
  frameDrops: number;
  componentMountTime: number;
}

interface PerformanceConfig {
  trackRenderTime?: boolean;
  trackInteractions?: boolean;
  trackMemory?: boolean;
  trackFrameDrops?: boolean;
  sampleRate?: number; // 0-1, percentage of renders to track
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

interface UsePerformanceMonitorReturn {
  metrics: PerformanceMetrics;
  startMeasurement: (label: string) => void;
  endMeasurement: (label: string) => number;
  trackInteraction: (interactionName: string, callback: () => void) => void;
  getPerformanceReport: () => PerformanceReport;
  // Startup performance monitoring
  startupMetrics: StartupMetrics | null;
  startupSummary: {
    averageStartupTime: number;
    bestStartupTime: number;
    worstStartupTime: number;
    trendDirection: 'improving' | 'degrading' | 'stable';
    meetsTarget: boolean;
  } | null;
  refreshStartupMetrics: () => Promise<void>;
  formatTime: (milliseconds: number) => string;
  getStartupStatus: () => 'excellent' | 'good' | 'warning' | 'critical';
  getOptimizationTips: () => string[];
}

interface PerformanceReport {
  averageRenderTime: number;
  averageInteractionTime: number;
  totalFrameDrops: number;
  peakMemoryUsage: number;
  slowestOperations: Array<{ name: string; duration: number }>;
  recommendations: string[];
}

const DEFAULT_CONFIG: Required<PerformanceConfig> = {
  trackRenderTime: true,
  trackInteractions: true,
  trackMemory: false, // Expensive operation, disabled by default
  trackFrameDrops: true,
  sampleRate: 0.1, // Track 10% of renders by default
  onMetricsUpdate: () => {},
};

// Global performance store
class PerformanceStore {
  private measurements = new Map<string, number>();
  private renderTimes: number[] = [];
  private interactionTimes: number[] = [];
  private frameDropCount = 0;
  private memoryPeaks: number[] = [];
  private slowOperations: Array<{ name: string; duration: number }> = [];

  startMeasurement(label: string): void {
    this.measurements.set(label, performance.now());
  }

  endMeasurement(label: string): number {
    const startTime = this.measurements.get(label);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.measurements.delete(label);

    // Track slow operations (>100ms)
    if (duration > 100) {
      this.slowOperations.push({ name: label, duration });
      // Keep only the 10 slowest operations
      this.slowOperations.sort((a, b) => b.duration - a.duration);
      this.slowOperations = this.slowOperations.slice(0, 10);
    }

    return duration;
  }

  addRenderTime(time: number): void {
    this.renderTimes.push(time);
    // Keep only last 100 render times
    if (this.renderTimes.length > 100) {
      this.renderTimes.shift();
    }
  }

  addInteractionTime(time: number): void {
    this.interactionTimes.push(time);
    // Keep only last 50 interaction times
    if (this.interactionTimes.length > 50) {
      this.interactionTimes.shift();
    }
  }

  incrementFrameDrops(): void {
    this.frameDropCount++;
  }

  addMemoryUsage(usage: number): void {
    this.memoryPeaks.push(usage);
    // Keep only last 20 memory readings
    if (this.memoryPeaks.length > 20) {
      this.memoryPeaks.shift();
    }
  }

  getReport(): PerformanceReport {
    const avgRenderTime =
      this.renderTimes.length > 0
        ? this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length
        : 0;

    const avgInteractionTime =
      this.interactionTimes.length > 0
        ? this.interactionTimes.reduce((a, b) => a + b, 0) / this.interactionTimes.length
        : 0;

    const peakMemory = this.memoryPeaks.length > 0 ? Math.max(...this.memoryPeaks) : 0;

    const recommendations: string[] = [];

    if (avgRenderTime > 16.67) {
      // 60fps threshold
      recommendations.push(
        'Average render time exceeds 16.67ms - consider optimizing render logic',
      );
    }

    if (avgInteractionTime > 100) {
      recommendations.push(
        'Slow interaction response time - consider debouncing or async processing',
      );
    }

    if (this.frameDropCount > 10) {
      recommendations.push('High frame drop count - review animations and heavy computations');
    }

    if (this.slowOperations.length > 5) {
      recommendations.push(
        'Multiple slow operations detected - consider code splitting or lazy loading',
      );
    }

    return {
      averageRenderTime: avgRenderTime,
      averageInteractionTime: avgInteractionTime,
      totalFrameDrops: this.frameDropCount,
      peakMemoryUsage: peakMemory,
      slowestOperations: [...this.slowOperations],
      recommendations,
    };
  }

  reset(): void {
    this.measurements.clear();
    this.renderTimes = [];
    this.interactionTimes = [];
    this.frameDropCount = 0;
    this.memoryPeaks = [];
    this.slowOperations = [];
  }
}

const globalPerformanceStore = new PerformanceStore();

/**
 * Hook for monitoring component and interaction performance
 */
export function usePerformanceMonitor(
  componentName: string,
  config: PerformanceConfig = {},
): UsePerformanceMonitorReturn {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const mountTimeRef = useRef<number>(performance.now());
  const renderCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(performance.now());

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    interactionTime: 0,
    frameDrops: 0,
    componentMountTime: 0,
  });

  // Startup performance state
  const [startupMetrics, setStartupMetrics] = useState<StartupMetrics | null>(null);
  const [startupSummary, setStartupSummary] = useState<{
    averageStartupTime: number;
    bestStartupTime: number;
    worstStartupTime: number;
    trendDirection: 'improving' | 'degrading' | 'stable';
    meetsTarget: boolean;
  } | null>(null);

  // Track component mount time
  useEffect(() => {
    const mountTime = performance.now() - mountTimeRef.current;
    setMetrics((prev) => ({ ...prev, componentMountTime: mountTime }));

    // Component mount time tracked
  }, [componentName]);

  // Track render performance
  useEffect(() => {
    if (!mergedConfig.trackRenderTime) return;

    renderCountRef.current++;

    // Sample renders based on sampleRate
    if (Math.random() > mergedConfig.sampleRate) return;

    const renderStart = performance.now();

    // Use requestAnimationFrame to measure actual render time
    const frameId = requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStart;
      globalPerformanceStore.addRenderTime(renderTime);

      setMetrics((prev) => {
        const newMetrics = { ...prev, renderTime };
        mergedConfig.onMetricsUpdate(newMetrics);
        return newMetrics;
      });

      // Track frame drops
      if (mergedConfig.trackFrameDrops) {
        const currentTime = performance.now();
        const timeSinceLastFrame = currentTime - lastFrameTimeRef.current;

        // If more than 16.67ms (60fps) + 5ms tolerance
        if (timeSinceLastFrame > 21.67) {
          globalPerformanceStore.incrementFrameDrops();
          setMetrics((prev) => ({ ...prev, frameDrops: prev.frameDrops + 1 }));
        }

        lastFrameTimeRef.current = currentTime;
      }
    });

    return () => cancelAnimationFrame(frameId);
  });

  // Track memory usage (if enabled)
  useEffect(() => {
    if (!mergedConfig.trackMemory) return;

    const interval = setInterval(() => {
      // @ts-ignore - performance.memory is available in some environments
      if (typeof performance !== 'undefined' && performance.memory) {
        // @ts-ignore
        const memoryUsage = performance.memory.usedJSHeapSize;
        globalPerformanceStore.addMemoryUsage(memoryUsage);
        setMetrics((prev) => ({ ...prev, memoryUsage }));
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [mergedConfig.trackMemory]);

  const startMeasurement = useCallback(
    (label: string) => {
      globalPerformanceStore.startMeasurement(`${componentName}:${label}`);
    },
    [componentName],
  );

  const endMeasurement = useCallback(
    (label: string): number => {
      return globalPerformanceStore.endMeasurement(`${componentName}:${label}`);
    },
    [componentName],
  );

  const trackInteraction = useCallback(
    (interactionName: string, callback: () => void) => {
      if (!mergedConfig.trackInteractions) {
        callback();
        return;
      }

      const interactionStart = performance.now();

      const wrappedCallback = () => {
        callback();

        InteractionManager.runAfterInteractions(() => {
          const interactionTime = performance.now() - interactionStart;
          globalPerformanceStore.addInteractionTime(interactionTime);

          setMetrics((prev) => {
            const newMetrics = { ...prev, interactionTime };
            mergedConfig.onMetricsUpdate(newMetrics);
            return newMetrics;
          });

          // Interaction time tracked
        });
      };

      wrappedCallback();
    },
    [componentName, mergedConfig],
  );

  const getPerformanceReport = useCallback((): PerformanceReport => {
    return globalPerformanceStore.getReport();
  }, []);

  // Startup performance monitoring functions
  const loadStartupMetrics = useCallback(async () => {
    try {
      const currentMetrics = startupPerformanceService.getCurrentMetrics();
      const summary = await startupPerformanceService.getPerformanceSummary(10);

      setStartupMetrics(currentMetrics);
      setStartupSummary(summary);
    } catch (error) {
      errorInDev('Failed to load startup metrics:', error);
    }
  }, []);

  const refreshStartupMetrics = useCallback(async () => {
    await loadStartupMetrics();
  }, [loadStartupMetrics]);

  const formatTime = useCallback((milliseconds: number): string => {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    return `${(milliseconds / 1000).toFixed(2)}s`;
  }, []);

  const getStartupStatus = useCallback((): 'excellent' | 'good' | 'warning' | 'critical' => {
    if (!startupSummary) {
      return 'warning';
    }

    const { averageStartupTime } = startupSummary;

    if (averageStartupTime <= 1500) {
      return 'excellent';
    } else if (averageStartupTime <= 2000) {
      return 'good';
    } else if (averageStartupTime <= 2500) {
      return 'warning';
    } else {
      return 'critical';
    }
  }, [startupSummary]);

  const getOptimizationTips = useCallback((): string[] => {
    const tips: string[] = [];

    if (!startupMetrics || !startupSummary) {
      return ['Enable performance monitoring to get optimization tips'];
    }

    const status = getStartupStatus();

    switch (status) {
      case 'critical':
        tips.push('🚨 Critical: Startup time exceeds 2.5s target');
        tips.push('Consider implementing more aggressive lazy loading');
        tips.push('Review and optimize heavy synchronous operations');
        break;

      case 'warning':
        tips.push('⚠️ Warning: Approaching 2.5s startup time limit');
        tips.push('Monitor performance trends closely');
        break;

      case 'good':
        tips.push('✅ Good: Performance within acceptable range');
        tips.push('Continue monitoring for regressions');
        break;

      case 'excellent':
        tips.push('🎉 Excellent: Outstanding startup performance!');
        tips.push('Consider sharing optimization techniques with team');
        break;
    }

    if (startupMetrics.criticalFontsLoadTime > 500) {
      tips.push('📝 Font loading is slow - consider reducing font variants');
    }

    if (startupMetrics.bundleLoadTime > 1000) {
      tips.push('📦 Bundle size is large - implement more code splitting');
    }

    if (startupMetrics.jsExecutionTime > 800) {
      tips.push('⚡ JS execution is slow - optimize synchronous operations');
    }

    if (startupMetrics.firstScreenRenderTime > 1500) {
      tips.push('🎨 First render is slow - simplify initial screen complexity');
    }

    if (startupSummary.trendDirection === 'degrading') {
      tips.push('📉 Performance is degrading - investigate recent changes');
    } else if (startupSummary.trendDirection === 'improving') {
      tips.push('📈 Performance is improving - great work!');
    }

    return tips;
  }, [startupMetrics, startupSummary, getStartupStatus]);

  // Load startup metrics on mount
  useEffect(() => {
    loadStartupMetrics();
  }, [loadStartupMetrics]);

  return {
    metrics,
    startMeasurement,
    endMeasurement,
    trackInteraction,
    getPerformanceReport,
    // Startup performance monitoring
    startupMetrics,
    startupSummary,
    refreshStartupMetrics,
    formatTime,
    getStartupStatus,
    getOptimizationTips,
  };
}

/**
 * Global performance utilities
 */
export const PerformanceMonitor = {
  /**
   * Get global performance report
   */
  getGlobalReport: (): PerformanceReport => globalPerformanceStore.getReport(),

  /**
   * Reset all performance metrics
   */
  reset: (): void => globalPerformanceStore.reset(),

  /**
   * Log performance report to console
   */
  logReport: (): void => {
    // Performance report logging disabled in production
    if (__DEV__) {
      const report = globalPerformanceStore.getReport();
      console.group('🚀 Performance Report');
      // Performance metrics logged internally

      if (report.slowestOperations.length > 0) {
        console.group('Slowest Operations:');
        report.slowestOperations.forEach((op) => {
          // Operation timing logged internally
        });
        console.groupEnd();
      }

      if (report.recommendations.length > 0) {
        console.group('Recommendations:');
        // Recommendations available in report object
        console.groupEnd();
      }

      console.groupEnd();
    }
  },

  /**
   * Export performance data for external analysis
   */
  exportData: (): string => {
    const report = globalPerformanceStore.getReport();
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        ...report,
      },
      null,
      2,
    );
  },
};

// Development mode performance logging
if (__DEV__) {
  // Log performance report every 30 seconds in development
  setInterval(() => {
    const report = globalPerformanceStore.getReport();
    if (report.averageRenderTime > 0) {
      PerformanceMonitor.logReport();
    }
  }, 30000);
}
