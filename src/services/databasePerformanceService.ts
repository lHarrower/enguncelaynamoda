import { supabase } from '../config/supabaseClient';
import { errorInDev, logInDev } from '../utils/consoleSuppress';
import { dbOptimizer, OptimizedQueries } from '../utils/databaseOptimizations';

interface PerformanceMetric {
  operation: string;
  table: string;
  duration: number;
  rowsAffected?: number;
  timestamp: number;
  queryPlan?: unknown;
  cacheHit: boolean;
}

interface IndexRecommendation {
  table: string;
  columns: string[];
  reason: string;
  estimatedImprovement: number;
  priority: 'high' | 'medium' | 'low';
}

interface TableStatistics {
  operations: number;
  totalDuration: number;
  slowOperations: number;
  cacheHits: number;
  averageDuration?: number;
  slowOperationRate?: number;
  cacheHitRate?: number;
}

interface OperationStatistics {
  count: number;
  totalDuration: number;
  slowCount: number;
  averageDuration?: number;
  slowRate?: number;
}

class DatabasePerformanceService {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000;
  private readonly ANALYSIS_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private analysisTimer: ReturnType<typeof setInterval> | null = null; // OPERASYON DİSİPLİN: Memory leak önleme
  private indexRecommendations: IndexRecommendation[] = [];

  constructor() {
    this.startPerformanceAnalysis();
  }

  // Start continuous performance analysis
  private startPerformanceAnalysis(): void {
    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
    }

    this.analysisTimer = setInterval(() => {
      this.analyzePerformance();
    }, this.ANALYSIS_INTERVAL);
  }

  // Record database operation metrics
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);

    // Keep metrics within limit
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log slow operations immediately
    if (fullMetric.duration > 1000) {
      logInDev(
        `Slow database operation detected: ${fullMetric.operation} on ${fullMetric.table} took ${fullMetric.duration}ms`,
      );
      this.generateIndexRecommendation(fullMetric);
    }
  }

  // Analyze performance patterns
  private analyzePerformance(): void {
    const recentMetrics = this.getRecentMetrics(60 * 60 * 1000); // Last hour

    if (recentMetrics.length === 0) {
      return;
    }

    const analysis = {
      totalOperations: recentMetrics.length,
      averageDuration: recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length,
      slowOperations: recentMetrics.filter((m) => m.duration > 1000),
      cacheHitRate: (recentMetrics.filter((m) => m.cacheHit).length / recentMetrics.length) * 100,
      tableStats: this.getTableStatistics(recentMetrics),
      operationStats: this.getOperationStatistics(recentMetrics),
    };

    logInDev('Database Performance Analysis:', analysis);

    // Generate recommendations based on analysis
    this.generatePerformanceRecommendations(analysis);
  }

  // Get recent metrics within time window
  private getRecentMetrics(timeWindow: number): PerformanceMetric[] {
    const cutoff = Date.now() - timeWindow;
    return this.metrics.filter((m) => m.timestamp > cutoff);
  }

  // Get statistics by table
  private getTableStatistics(metrics: PerformanceMetric[]): Record<string, TableStatistics> {
    const tableStats: Record<string, TableStatistics> = {};

    metrics.forEach((metric) => {
      const stats = (tableStats[metric.table] ??= {
        operations: 0,
        totalDuration: 0,
        slowOperations: 0,
        cacheHits: 0,
      });

      stats.operations++;
      stats.totalDuration += metric.duration;
      if (metric.duration > 1000) {
        stats.slowOperations++;
      }
      if (metric.cacheHit) {
        stats.cacheHits++;
      }
    });

    // Calculate averages and rates
    Object.values(tableStats).forEach((stats: TableStatistics) => {
      stats.averageDuration = stats.totalDuration / stats.operations;
      stats.slowOperationRate = (stats.slowOperations / stats.operations) * 100;
      stats.cacheHitRate = (stats.cacheHits / stats.operations) * 100;
    });

    return tableStats;
  }

  // Get statistics by operation type
  private getOperationStatistics(
    metrics: PerformanceMetric[],
  ): Record<string, OperationStatistics> {
    const operationStats: Record<string, OperationStatistics> = {};

    metrics.forEach((metric) => {
      const stats = (operationStats[metric.operation] ??= {
        count: 0,
        totalDuration: 0,
        slowCount: 0,
      });

      stats.count++;
      stats.totalDuration += metric.duration;
      if (metric.duration > 1000) {
        stats.slowCount++;
      }
    });

    // Calculate averages
    Object.values(operationStats).forEach((stats: OperationStatistics) => {
      stats.averageDuration = stats.totalDuration / stats.count;
      stats.slowRate = (stats.slowCount / stats.count) * 100;
    });

    return operationStats;
  }

  // Generate index recommendations based on slow operations
  private generateIndexRecommendation(metric: PerformanceMetric): void {
    // Skip if already recommended
    const existingRecommendation = this.indexRecommendations.find(
      (r) => r.table === metric.table && r.reason.includes(metric.operation),
    );

    if (existingRecommendation) {
      return;
    }

    let recommendation: IndexRecommendation | null = null;

    // Generate table-specific recommendations
    switch (metric.table) {
      case 'wardrobe_items':
        if (metric.operation.includes('SELECT') && metric.duration > 2000) {
          recommendation = {
            table: 'wardrobe_items',
            columns: ['user_id', 'category', 'created_at'],
            reason: `Slow SELECT operations detected (${metric.duration}ms)`,
            estimatedImprovement: 70,
            priority: 'high',
          };
        }
        break;

      case 'daily_recommendations':
        if (metric.operation.includes('SELECT') && metric.duration > 1500) {
          recommendation = {
            table: 'daily_recommendations',
            columns: ['user_id', 'date', 'status'],
            reason: `Slow recommendation queries (${metric.duration}ms)`,
            estimatedImprovement: 60,
            priority: 'medium',
          };
        }
        break;

      case 'outfit_recommendations':
        if (metric.operation.includes('INSERT') && metric.duration > 1000) {
          recommendation = {
            table: 'outfit_recommendations',
            columns: ['user_id', 'created_at'],
            reason: `Slow INSERT operations (${metric.duration}ms)`,
            estimatedImprovement: 50,
            priority: 'medium',
          };
        }
        break;
    }

    if (recommendation) {
      this.indexRecommendations.push(recommendation);
      logInDev('New index recommendation generated:', recommendation);
    }
  }

  // Generate performance recommendations
  private generatePerformanceRecommendations(analysis: {
    totalOperations: number;
    averageDuration: number;
    slowOperations: PerformanceMetric[];
    cacheHitRate: number;
    tableStats: Record<string, TableStatistics>;
    operationStats: Record<string, OperationStatistics>;
  }): void {
    const recommendations: string[] = [];

    // Cache hit rate recommendations
    if (analysis.cacheHitRate < 70) {
      recommendations.push(
        `Low cache hit rate (${analysis.cacheHitRate.toFixed(1)}%). Consider increasing cache TTL or improving cache keys.`,
      );
    }

    // Slow operations recommendations
    if (analysis.slowOperations.length > analysis.totalOperations * 0.1) {
      recommendations.push(
        `High number of slow operations (${analysis.slowOperations.length}/${analysis.totalOperations}). Consider query optimization.`,
      );
    }

    // Table-specific recommendations
    const tableEntries = Object.entries(analysis.tableStats) as Array<[string, TableStatistics]>;
    tableEntries.forEach(([table, stats]) => {
      const slowRate = stats.slowOperationRate ?? 0;
      const cacheHitRate = stats.cacheHitRate ?? 0;

      if (slowRate > 20) {
        recommendations.push(
          `Table '${table}' has high slow operation rate (${slowRate.toFixed(1)}%). Consider adding indexes.`,
        );
      }

      if (cacheHitRate < 50) {
        recommendations.push(
          `Table '${table}' has low cache hit rate (${cacheHitRate.toFixed(1)}%). Consider caching strategy optimization.`,
        );
      }
    });

    if (recommendations.length > 0) {
      logInDev('Performance Recommendations:', ...recommendations);
    }
  }

  // Get current performance summary
  getPerformanceSummary(): {
    metrics: PerformanceMetric[];
    indexRecommendations: IndexRecommendation[];
    cacheStats: ReturnType<typeof OptimizedQueries.getCacheStats>;
    dbStats: ReturnType<typeof dbOptimizer.getPerformanceAnalytics>;
  } {
    const recentMetrics = this.getRecentMetrics(60 * 60 * 1000);

    return {
      metrics: recentMetrics,
      indexRecommendations: this.indexRecommendations,
      cacheStats: OptimizedQueries.getCacheStats(),
      dbStats: dbOptimizer.getPerformanceAnalytics(),
    };
  }

  // Execute index recommendations
  async executeIndexRecommendations(recommendations?: IndexRecommendation[]): Promise<void> {
    const toExecute =
      recommendations || this.indexRecommendations.filter((r) => r.priority === 'high');

    for (const recommendation of toExecute) {
      try {
        await this.createIndex(recommendation);
        logInDev(`Successfully created index for ${recommendation.table}`);
      } catch (error) {
        errorInDev(`Failed to create index for ${recommendation.table}:`, String(error));
      }
    }
  }

  // Create database index
  private async createIndex(recommendation: IndexRecommendation): Promise<void> {
    const indexName = `idx_${recommendation.table}_${recommendation.columns.join('_')}`;
    const columns = recommendation.columns.join(', ');

    const createIndexSQL = `
      CREATE INDEX CONCURRENTLY IF NOT EXISTS ${indexName}
      ON ${recommendation.table} (${columns});
    `;

    await supabase.rpc('execute_sql', { sql: createIndexSQL });
  }

  // Optimize specific table
  async optimizeTable(tableName: string): Promise<void> {
    try {
      // Analyze table statistics
      await supabase.rpc('execute_sql', {
        sql: `ANALYZE ${tableName};`,
      });

      // Vacuum if needed
      await supabase.rpc('execute_sql', {
        sql: `VACUUM ANALYZE ${tableName};`,
      });

      logInDev(`Optimized table: ${tableName}`);
    } catch (error) {
      errorInDev(`Failed to optimize table ${tableName}:`, String(error));
    }
  }

  // Clear old metrics
  clearOldMetrics(olderThan: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThan;
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
  }

  // Destroy service and cleanup
  // OPERASYON DİSİPLİN: Memory leak önleme - tüm interval'ları temizle
  destroy(): void {
    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
      this.analysisTimer = null;
    }
    this.metrics = [];
    this.indexRecommendations = [];
  }

  /**
   * OPERASYON DİSİPLİN: Component unmount'ta çağrılması gereken cleanup metodu
   * React component'lerde useEffect cleanup function'ında kullanılmalı
   */
  cleanup(): void {
    this.destroy();
  }
}

// Create singleton instance
export const databasePerformanceService = new DatabasePerformanceService();

// Enhanced database operation wrapper
export async function executeOptimizedQuery<T>(
  operation: string,
  table: string,
  queryFn: () => Promise<T>,
  cacheKey?: string,
  cacheTTL?: number,
): Promise<T> {
  const startTime = performance.now();
  let cacheHit = false;
  let result: T;

  try {
    if (cacheKey) {
      // Use cached query
      result = await OptimizedQueries.cachedQuery(cacheKey, queryFn, cacheTTL);
      cacheHit = true;
    } else {
      // Execute query directly with monitoring
      result = await dbOptimizer.monitorQuery(`${operation}_${table}`, queryFn);
    }

    const duration = performance.now() - startTime;

    // Record performance metric
    databasePerformanceService.recordMetric({
      operation,
      table,
      duration,
      cacheHit,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    databasePerformanceService.recordMetric({
      operation,
      table,
      duration,
      cacheHit: false,
    });

    throw error;
  }
}

// Wardrobe-specific optimized queries
export class WardrobeOptimizedQueries {
  // Get wardrobe items with performance monitoring
  static async getWardrobeItems(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      category?: string;
      sortBy?: string;
    } = {},
  ) {
    const { limit = 50, offset = 0, category, sortBy = 'created_at' } = options;

    const cacheKey = `wardrobe_items_${userId}_${JSON.stringify(options)}`;

    return executeOptimizedQuery(
      'SELECT',
      'wardrobe_items',
      async () => {
        let query = supabase
          .from('wardrobe_items')
          .select('*')
          .eq('user_id', userId)
          .order(sortBy, { ascending: false });

        query = query.range(offset, offset + limit - 1);

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) {
          throw error;
        }
        return data;
      },
      cacheKey,
      5 * 60 * 1000, // 5 minutes cache
    );
  }

  // Search wardrobe items with performance monitoring
  static async searchWardrobeItems(
    userId: string,
    searchTerm: string,
    options: {
      limit?: number;
      categories?: string[];
    } = {},
  ) {
    const { limit = 20, categories } = options;

    const cacheKey = `wardrobe_search_${userId}_${searchTerm}_${JSON.stringify(options)}`;

    return executeOptimizedQuery(
      'SEARCH',
      'wardrobe_items',
      async () => {
        let query = supabase.from('wardrobe_items').select('*').eq('user_id', userId);

        query = query.or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{"${searchTerm}"}`,
        );
        query = query.limit(limit);

        if (categories && categories.length > 0) {
          query = query.in('category', categories);
        }

        const { data, error } = await query;
        if (error) {
          throw error;
        }
        return data;
      },
      cacheKey,
      2 * 60 * 1000, // 2 minutes cache for searches
    );
  }

  // Get wardrobe statistics with caching
  static async getWardrobeStats(userId: string) {
    const cacheKey = `wardrobe_stats_${userId}`;

    return executeOptimizedQuery(
      'AGGREGATE',
      'wardrobe_items',
      async () => {
        const { data, error } = await supabase.rpc('get_wardrobe_stats', { user_id: userId });

        if (error) {
          throw error;
        }
        return data;
      },
      cacheKey,
      10 * 60 * 1000, // 10 minutes cache for stats
    );
  }
}

export default databasePerformanceService;
