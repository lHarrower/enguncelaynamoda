/**
 * Performance Monitoring Hook
 * Real-time performance tracking for React Native components
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';

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

  // Track component mount time
  useEffect(() => {
    const mountTime = performance.now() - mountTimeRef.current;
    setMetrics((prev) => ({ ...prev, componentMountTime: mountTime }));

    if (mountTime > 100) {
      console.warn(
        `[Performance] Slow component mount: ${componentName} took ${mountTime.toFixed(2)}ms`,
      );
    }
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

          if (interactionTime > 100) {
            console.warn(
              `[Performance] Slow interaction: ${componentName}:${interactionName} took ${interactionTime.toFixed(2)}ms`,
            );
          }
        });
      };

      wrappedCallback();
    },
    [componentName, mergedConfig],
  );

  const getPerformanceReport = useCallback((): PerformanceReport => {
    return globalPerformanceStore.getReport();
  }, []);

  return {
    metrics,
    startMeasurement,
    endMeasurement,
    trackInteraction,
    getPerformanceReport,
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
    const report = globalPerformanceStore.getReport();
    console.group('🚀 Performance Report');
    console.log('Average Render Time:', `${report.averageRenderTime.toFixed(2)}ms`);
    console.log('Average Interaction Time:', `${report.averageInteractionTime.toFixed(2)}ms`);
    console.log('Total Frame Drops:', report.totalFrameDrops);
    console.log('Peak Memory Usage:', `${(report.peakMemoryUsage / 1024 / 1024).toFixed(2)}MB`);

    if (report.slowestOperations.length > 0) {
      console.group('Slowest Operations:');
      report.slowestOperations.forEach((op) => {
        console.log(`${op.name}: ${op.duration.toFixed(2)}ms`);
      });
      console.groupEnd();
    }

    if (report.recommendations.length > 0) {
      console.group('Recommendations:');
      report.recommendations.forEach((rec) => console.log(`• ${rec}`));
      console.groupEnd();
    }

    console.groupEnd();
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
