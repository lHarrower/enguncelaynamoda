/**
 * Startup Performance Service
 *
 * Monitors and measures app startup performance to ensure we meet the target of < 2.5 seconds.
 * Provides detailed metrics and optimization recommendations.
 */

import { logger } from '@/utils/logger';
import { secureStorage } from '@/utils/secureStorage';

interface StartupMetrics {
  appStartTime: number;
  criticalFontsLoadTime: number;
  firstScreenRenderTime: number;
  totalStartupTime: number;
  bundleLoadTime: number;
  jsExecutionTime: number;
  nativeModuleInitTime: number;
  timestamp: number;
  deviceInfo: {
    platform: string;
    version: string;
    model?: string;
  };
}

interface PerformanceThresholds {
  target: number; // 2.5 seconds
  warning: number; // 2.0 seconds
  critical: number; // 3.0 seconds
}

class StartupPerformanceService {
  private static instance: StartupPerformanceService;
  private startupMetrics: StartupMetrics | null = null;
  private performanceMarks: Map<string, number> = new Map();

  private readonly THRESHOLDS: PerformanceThresholds = {
    target: 2500, // 2.5 seconds in ms
    warning: 2000, // 2.0 seconds in ms
    critical: 3000, // 3.0 seconds in ms
  };

  private readonly STORAGE_KEY = 'startup_performance_history';
  private readonly MAX_HISTORY_ENTRIES = 50;

  static getInstance(): StartupPerformanceService {
    if (!StartupPerformanceService.instance) {
      StartupPerformanceService.instance = new StartupPerformanceService();
    }
    return StartupPerformanceService.instance;
  }

  /**
   * Mark the start of app initialization
   */
  markAppStart(): void {
    const startTime = Date.now();
    this.performanceMarks.set('app_start', startTime);

    logger.info('startup_performance_app_start', {
      timestamp: startTime,
      mark: 'app_start',
    });
  }

  /**
   * Mark when critical fonts are loaded
   */
  markCriticalFontsLoaded(): void {
    const loadTime = Date.now();
    this.performanceMarks.set('critical_fonts_loaded', loadTime);

    const appStart = this.performanceMarks.get('app_start');
    if (appStart) {
      const duration = loadTime - appStart;
      logger.info('startup_performance_fonts_loaded', {
        timestamp: loadTime,
        duration,
        mark: 'critical_fonts_loaded',
      });
    }
  }

  /**
   * Mark when the first screen is rendered
   */
  markFirstScreenRender(): void {
    const renderTime = Date.now();
    this.performanceMarks.set('first_screen_render', renderTime);

    const appStart = this.performanceMarks.get('app_start');
    if (appStart) {
      const duration = renderTime - appStart;
      logger.info('startup_performance_first_render', {
        timestamp: renderTime,
        duration,
        mark: 'first_screen_render',
      });
    }
  }

  /**
   * Mark when app startup is complete
   */
  markStartupComplete(): void {
    const completeTime = Date.now();
    this.performanceMarks.set('startup_complete', completeTime);

    this.calculateAndStoreMetrics(completeTime);
  }

  /**
   * Calculate final startup metrics
   */
  private calculateAndStoreMetrics(completeTime: number): void {
    const appStart = this.performanceMarks.get('app_start');
    const fontsLoaded = this.performanceMarks.get('critical_fonts_loaded');
    const firstRender = this.performanceMarks.get('first_screen_render');

    if (!appStart) {
      logger.warn('startup_performance_missing_app_start');
      return;
    }

    const metrics: StartupMetrics = {
      appStartTime: appStart,
      criticalFontsLoadTime: fontsLoaded ? fontsLoaded - appStart : 0,
      firstScreenRenderTime: firstRender ? firstRender - appStart : 0,
      totalStartupTime: completeTime - appStart,
      bundleLoadTime: this.estimateBundleLoadTime(),
      jsExecutionTime: this.estimateJSExecutionTime(),
      nativeModuleInitTime: this.estimateNativeModuleTime(),
      timestamp: completeTime,
      deviceInfo: this.getDeviceInfo(),
    };

    this.startupMetrics = metrics;
    this.storeMetricsHistory(metrics);
    this.analyzePerformance(metrics);

    logger.info('startup_performance_complete', metrics);
  }

  /**
   * Estimate bundle loading time (simplified)
   */
  private estimateBundleLoadTime(): number {
    const appStart = this.performanceMarks.get('app_start');
    const firstRender = this.performanceMarks.get('first_screen_render');

    if (appStart && firstRender) {
      // Estimate bundle load as 60% of time to first render
      return Math.round((firstRender - appStart) * 0.6);
    }
    return 0;
  }

  /**
   * Estimate JavaScript execution time
   */
  private estimateJSExecutionTime(): number {
    const fontsLoaded = this.performanceMarks.get('critical_fonts_loaded');
    const firstRender = this.performanceMarks.get('first_screen_render');

    if (fontsLoaded && firstRender) {
      return firstRender - fontsLoaded;
    }
    return 0;
  }

  /**
   * Estimate native module initialization time
   */
  private estimateNativeModuleTime(): number {
    const appStart = this.performanceMarks.get('app_start');
    const fontsLoaded = this.performanceMarks.get('critical_fonts_loaded');

    if (appStart && fontsLoaded) {
      // Estimate native init as 30% of time to fonts loaded
      return Math.round((fontsLoaded - appStart) * 0.3);
    }
    return 0;
  }

  /**
   * Get device information for performance analysis
   */
  private getDeviceInfo() {
    // In a real implementation, you'd use react-native-device-info
    return {
      platform: 'unknown',
      version: 'unknown',
      model: 'unknown',
    };
  }

  /**
   * Analyze performance and provide recommendations
   */
  private analyzePerformance(metrics: StartupMetrics): void {
    const { totalStartupTime } = metrics;

    if (totalStartupTime > this.THRESHOLDS.critical) {
      logger.error('startup_performance_critical', {
        totalStartupTime,
        threshold: this.THRESHOLDS.critical,
        recommendations: this.getOptimizationRecommendations(metrics),
      });
    } else if (totalStartupTime > this.THRESHOLDS.target) {
      logger.warn('startup_performance_above_target', {
        totalStartupTime,
        threshold: this.THRESHOLDS.target,
        recommendations: this.getOptimizationRecommendations(metrics),
      });
    } else {
      logger.info('startup_performance_good', {
        totalStartupTime,
        threshold: this.THRESHOLDS.target,
      });
    }
  }

  /**
   * Get optimization recommendations based on metrics
   */
  private getOptimizationRecommendations(metrics: StartupMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.criticalFontsLoadTime > 500) {
      recommendations.push('Optimize font loading - consider reducing font variants');
    }

    if (metrics.bundleLoadTime > 1000) {
      recommendations.push('Implement code splitting and lazy loading for non-critical components');
    }

    if (metrics.jsExecutionTime > 800) {
      recommendations.push('Optimize JavaScript execution - reduce synchronous operations');
    }

    if (metrics.firstScreenRenderTime > 1500) {
      recommendations.push('Optimize first screen rendering - reduce initial component complexity');
    }

    return recommendations;
  }

  /**
   * Store metrics in local storage for trend analysis
   */
  private async storeMetricsHistory(metrics: StartupMetrics): Promise<void> {
    try {
      const existingHistory = await this.getMetricsHistory();
      const newHistory = [metrics, ...existingHistory].slice(0, this.MAX_HISTORY_ENTRIES);

      await secureStorage.setItem(this.STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      logger.error('startup_performance_storage_error', { error: String(error) });
    }
  }

  /**
   * Get historical performance metrics
   */
  async getMetricsHistory(): Promise<StartupMetrics[]> {
    try {
      const historyJson = await secureStorage.getItem(this.STORAGE_KEY);
      if (historyJson) {
        return JSON.parse(historyJson);
      }
    } catch (error) {
      logger.error('startup_performance_history_error', { error: String(error) });
    }
    return [];
  }

  /**
   * Get current startup metrics
   */
  getCurrentMetrics(): StartupMetrics | null {
    return this.startupMetrics;
  }

  /**
   * Get performance summary for the last N startups
   */
  async getPerformanceSummary(count: number = 10): Promise<{
    averageStartupTime: number;
    bestStartupTime: number;
    worstStartupTime: number;
    trendDirection: 'improving' | 'degrading' | 'stable';
    meetsTarget: boolean;
  }> {
    const history = await this.getMetricsHistory();
    const recentMetrics = history.slice(0, count);

    if (recentMetrics.length === 0) {
      return {
        averageStartupTime: 0,
        bestStartupTime: 0,
        worstStartupTime: 0,
        trendDirection: 'stable',
        meetsTarget: false,
      };
    }

    const startupTimes = recentMetrics.map((m) => m.totalStartupTime);
    const averageStartupTime = startupTimes.reduce((a, b) => a + b, 0) / startupTimes.length;
    const bestStartupTime = Math.min(...startupTimes);
    const worstStartupTime = Math.max(...startupTimes);

    // Calculate trend (simple comparison of first half vs second half)
    const halfPoint = Math.floor(recentMetrics.length / 2);
    const recentAvg = startupTimes.slice(0, halfPoint).reduce((a, b) => a + b, 0) / halfPoint;
    const olderAvg =
      startupTimes.slice(halfPoint).reduce((a, b) => a + b, 0) / (startupTimes.length - halfPoint);

    let trendDirection: 'improving' | 'degrading' | 'stable' = 'stable';
    if (recentAvg < olderAvg * 0.95) {
      trendDirection = 'improving';
    } else if (recentAvg > olderAvg * 1.05) {
      trendDirection = 'degrading';
    }

    return {
      averageStartupTime,
      bestStartupTime,
      worstStartupTime,
      trendDirection,
      meetsTarget: averageStartupTime <= this.THRESHOLDS.target,
    };
  }

  /**
   * Reset performance tracking (useful for testing)
   */
  reset(): void {
    this.performanceMarks.clear();
    this.startupMetrics = null;
  }
}

export const startupPerformanceService = StartupPerformanceService.getInstance();
export type { PerformanceThresholds, StartupMetrics };
