// Database Performance Optimizations
import { supabase } from '../config/supabaseClient';
import { errorInDev, logInDev } from './consoleSuppress';

// Query performance monitoring
interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

// Lightweight connection info stored in the pool
interface ConnectionInfo {
  lastUsed?: number;
}

class DatabaseOptimizer {
  private queryMetrics: QueryMetrics[] = [];
  private readonly MAX_METRICS = 100;
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second
  private connectionPool: Map<string, ConnectionInfo> = new Map();
  private queryQueue: Array<{
    query: () => Promise<unknown>;
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
  }> = [];
  private isProcessingQueue = false;
  private readonly MAX_CONCURRENT_QUERIES = 5;
  private activeQueries = 0;

  // Enhanced query monitoring with connection pooling and queue management
  async monitorQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
    // Queue management for concurrent queries
    if (this.activeQueries >= this.MAX_CONCURRENT_QUERIES) {
      return new Promise<T>((resolve, reject) => {
        this.queryQueue.push({
          query: () => this.executeQuery(queryName, queryFn),
          resolve: (value: unknown) => resolve(value as T),
          reject: (error: unknown) => reject(error),
        });
        this.processQueue();
      });
    }

    return this.executeQuery(queryName, queryFn);
  }

  private async executeQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
    this.activeQueries++;
    const startTime = performance.now();

    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;

      this.recordMetric({
        query: queryName,
        duration,
        timestamp: Date.now(),
        success: true,
      });

      if (duration > this.SLOW_QUERY_THRESHOLD) {
        logInDev(`Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`);
        // Auto-optimize slow queries
        this.optimizeSlowQuery(queryName, duration);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      this.recordMetric({
        query: queryName,
        duration,
        timestamp: Date.now(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });

      errorInDev(`Query failed: ${queryName}`, error as Error);
      throw error;
    } finally {
      this.activeQueries--;
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (
      this.isProcessingQueue ||
      this.queryQueue.length === 0 ||
      this.activeQueries >= this.MAX_CONCURRENT_QUERIES
    ) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.queryQueue.length > 0 && this.activeQueries < this.MAX_CONCURRENT_QUERIES) {
      const { query, resolve, reject } = this.queryQueue.shift()!;

      try {
        const result = await query();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessingQueue = false;
  }

  private optimizeSlowQuery(queryName: string, duration: number): void {
    // Log slow query for analysis
    logInDev(`Optimizing slow query: ${queryName} (${duration.toFixed(2)}ms)`);

    // Implement query-specific optimizations
    if (queryName.includes('wardrobe')) {
      this.suggestWardrobeOptimizations(queryName);
    }
  }

  private suggestWardrobeOptimizations(queryName: string): void {
    logInDev(`Suggested optimizations for ${queryName}:`);
    logInDev('- Consider adding pagination');
    logInDev('- Use selective field queries');
    logInDev('- Implement proper indexing');
    logInDev('- Consider caching frequently accessed data');
  }

  private recordMetric(metric: QueryMetrics): void {
    this.queryMetrics.push(metric);

    // Keep only recent metrics
    if (this.queryMetrics.length > this.MAX_METRICS) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS);
    }
  }

  // Enhanced cleanup with memory management
  private cleanupMetrics(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.queryMetrics = this.queryMetrics.filter((metric) => metric.timestamp > oneHourAgo);

    // Clean up connection pool
    this.connectionPool.forEach((connection, key) => {
      if (connection.lastUsed && Date.now() - connection.lastUsed > 30 * 60 * 1000) {
        this.connectionPool.delete(key);
      }
    });
  }

  // Get performance analytics
  getPerformanceAnalytics(): {
    averageQueryTime: number;
    slowQueries: QueryMetrics[];
    successRate: number;
    totalQueries: number;
  } {
    const totalQueries = this.queryMetrics.length;
    const successfulQueries = this.queryMetrics.filter((m) => m.success).length;
    const averageQueryTime =
      totalQueries > 0
        ? this.queryMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries
        : 0;
    const slowQueries = this.queryMetrics.filter((m) => m.duration > this.SLOW_QUERY_THRESHOLD);

    return {
      averageQueryTime,
      slowQueries,
      successRate: totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 100,
      totalQueries,
    };
  }

  // Get performance statistics
  getPerformanceStats(): {
    averageDuration: number;
    slowQueries: QueryMetrics[];
    errorRate: number;
    totalQueries: number;
  } {
    const totalQueries = this.queryMetrics.length;
    const successfulQueries = this.queryMetrics.filter((m) => m.success);
    const slowQueries = this.queryMetrics.filter((m) => m.duration > this.SLOW_QUERY_THRESHOLD);

    const averageDuration =
      totalQueries > 0
        ? this.queryMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries
        : 0;

    const errorRate =
      totalQueries > 0 ? (totalQueries - successfulQueries.length) / totalQueries : 0;

    return {
      averageDuration,
      slowQueries,
      errorRate,
      totalQueries,
    };
  }

  // Destroy optimizer and cleanup resources
  destroy(): void {
    this.queryMetrics = [];
    this.connectionPool.clear();
    this.queryQueue = [];
    this.activeQueries = 0;
    this.isProcessingQueue = false;
  }
}

// Singleton instance
export const dbOptimizer = new DatabaseOptimizer();

// Cache entry type
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

// Optimized query builders with caching
export class OptimizedQueries {
  private static cache = new Map<string, CacheEntry<unknown>>();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 100;
  private static readonly CACHE_CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
  private static cleanupTimer: ReturnType<typeof setInterval> | null = null;

  static {
    // Start cache cleanup timer
    OptimizedQueries.startCacheCleanup();
  }

  private static startCacheCleanup(): void {
    if (OptimizedQueries.cleanupTimer) {
      clearInterval(OptimizedQueries.cleanupTimer);
    }

    OptimizedQueries.cleanupTimer = setInterval(() => {
      OptimizedQueries.performCacheCleanup();
    }, OptimizedQueries.CACHE_CLEANUP_INTERVAL);
  }

  private static performCacheCleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // Find expired entries
    OptimizedQueries.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    });

    // Remove expired entries
    expiredKeys.forEach((key) => {
      OptimizedQueries.cache.delete(key);
    });

    // Enforce cache size limit (LRU eviction)
    if (OptimizedQueries.cache.size > OptimizedQueries.MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(OptimizedQueries.cache.entries()).sort(
        ([, a], [, b]) => a.lastAccessed - b.lastAccessed,
      ); // Sort by last accessed (oldest first)

      const entriesToRemove = sortedEntries.slice(
        0,
        OptimizedQueries.cache.size - OptimizedQueries.MAX_CACHE_SIZE,
      );
      entriesToRemove.forEach(([key]) => {
        OptimizedQueries.cache.delete(key);
      });
    }
  }

  // Enhanced cached query wrapper with LRU and analytics
  static async cachedQuery<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
    ttl: number = OptimizedQueries.DEFAULT_TTL,
  ): Promise<T> {
    const cached = OptimizedQueries.cache.get(cacheKey) as CacheEntry<T> | undefined;
    const now = Date.now();

    // Return cached data if valid
    if (cached && now - cached.timestamp < cached.ttl) {
      // Update access statistics
      cached.accessCount++;
      cached.lastAccessed = now;
      OptimizedQueries.cache.set(cacheKey, cached as unknown as CacheEntry<unknown>);

      logInDev(`Cache hit for: ${cacheKey} (accessed ${cached.accessCount} times)`);
      return JSON.parse(JSON.stringify(cached.data)); // Return deep copy
    }

    // Execute query and cache result
    const data = await dbOptimizer.monitorQuery(cacheKey, queryFn);

    // Ensure cache size before adding new entry
    if (
      OptimizedQueries.cache.size >= OptimizedQueries.MAX_CACHE_SIZE &&
      !OptimizedQueries.cache.has(cacheKey)
    ) {
      OptimizedQueries.performCacheCleanup();
    }

    OptimizedQueries.cache.set(cacheKey, {
      data: JSON.parse(JSON.stringify(data)) as T, // Store deep copy
      timestamp: now,
      ttl,
      accessCount: 1,
      lastAccessed: now,
    } as unknown as CacheEntry<unknown>);

    logInDev(`Cache miss for: ${cacheKey}`);
    return data;
  }

  // Enhanced cache management
  static clearCache(key?: string): void {
    if (key) {
      OptimizedQueries.cache.delete(key);
      logInDev(`Cleared cache for: ${key}`);
    } else {
      OptimizedQueries.cache.clear();
      logInDev('Cleared all cache');
    }
  }

  // Clear cache by pattern
  static clearCacheByPattern(pattern: string): void {
    const keysToDelete: string[] = [];
    OptimizedQueries.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      OptimizedQueries.cache.delete(key);
    });

    logInDev(`Cleared ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
  }

  // Get cache statistics
  static getCacheStats(): {
    size: number;
    hitRate: number;
    mostAccessed: Array<{ key: string; accessCount: number }>;
  } {
    const entries = Array.from(OptimizedQueries.cache.entries());
    const totalAccesses = entries.reduce((sum, [, entry]) => sum + entry.accessCount, 0);
    const mostAccessed = entries
      .map(([key, entry]) => ({ key, accessCount: entry.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    return {
      size: OptimizedQueries.cache.size,
      hitRate: totalAccesses > 0 ? (entries.length / totalAccesses) * 100 : 0,
      mostAccessed,
    };
  }

  // Destroy cache and cleanup
  static destroy(): void {
    if (OptimizedQueries.cleanupTimer) {
      clearInterval(OptimizedQueries.cleanupTimer);
      OptimizedQueries.cleanupTimer = null;
    }
    OptimizedQueries.cache.clear();
  }

  // Optimized wardrobe items query with pagination
  static async getWardrobeItems(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      category?: string;
      sortBy?: 'created_at' | 'last_worn' | 'usage_count';
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    const { limit = 20, offset = 0, category, sortBy = 'created_at', sortOrder = 'desc' } = options;

    const cacheKey = `wardrobe_${userId}_${JSON.stringify(options)}`;

    return OptimizedQueries.cachedQuery(
      cacheKey,
      async () => {
        let query = (supabase as any)
          .from('wardrobe_items')
          .select(
            `
            id,
            name,
            category,
            subcategory,
            brand,
            price,
            colors,
            tags,
            image_url,
            created_at,
            last_worn,
            usage_count,
            ai_main_category,
            ai_subcategory
          `,
          )
          .eq('user_id', userId)
          .order(sortBy, { ascending: sortOrder === 'asc' })
          .range(offset, offset + limit - 1);

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }
        return data || [];
      },
      2 * 60 * 1000, // 2 minutes cache for wardrobe items
    );
  }

  // Optimized user preferences query
  static async getUserPreferences(userId: string) {
    const cacheKey = `preferences_${userId}`;

    return OptimizedQueries.cachedQuery(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && (error as { code?: string }).code !== 'PGRST116') {
          throw error;
        } // Ignore "not found" errors
        return data;
      },
      10 * 60 * 1000, // 10 minutes cache for preferences
    );
  }

  // Optimized daily recommendations query
  static async getDailyRecommendations(userId: string, date: string) {
    const cacheKey = `daily_rec_${userId}_${date}`;

    return OptimizedQueries.cachedQuery(
      cacheKey,
      async () => {
        const { data, error } = (await supabase
          .from('daily_recommendations')
          .select(
            `
            *,
            outfit_recommendations (
              id,
              outfit_items,
              confidence_score,
              style_notes
            )
          `,
          )
          .eq('user_id', userId)
          .eq('recommendation_date', date)
          .order('created_at', { ascending: false })
          .limit(1)) as any;

        if (error) {
          throw error;
        }
        return data?.[0] || null;
      },
      30 * 60 * 1000, // 30 minutes cache for daily recommendations
    );
  }

  // Batch operations for better performance
  static async batchInsertWardrobeItems(
    items: Array<{
      user_id: string;
      name: string;
      category: string;
      image_url?: string;
      [key: string]: unknown;
    }>,
  ) {
    return dbOptimizer.monitorQuery('batch_insert_wardrobe', async () => {
      const { data, error } = await (supabase as any).from('wardrobe_items').insert(items).select();

      if (error) {
        throw error;
      }

      // Clear related cache
      items.forEach((item) => {
        OptimizedQueries.clearCache(`wardrobe_${item.user_id}`);
      });

      return data;
    });
  }

  // Optimized search with full-text search
  static async searchWardrobeItems(
    userId: string,
    searchTerm: string,
    options: {
      categories?: string[];
      colors?: string[];
      limit?: number;
    } = {},
  ) {
    const { categories, colors, limit = 20 } = options;
    const cacheKey = `search_${userId}_${searchTerm}_${JSON.stringify(options)}`;

    return OptimizedQueries.cachedQuery(
      cacheKey,
      async () => {
        let query = (supabase as any)
          .from('wardrobe_items')
          .select('*')
          .eq('user_id', userId)
          .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,tags.cs.{"${searchTerm}"}`)
          .limit(limit);

        if (categories && categories.length > 0) {
          query = query.in('category', categories);
        }

        if (colors && colors.length > 0) {
          query = query.overlaps('colors', colors);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }
        return data || [];
      },
      1 * 60 * 1000, // 1 minute cache for search results
    );
  }
}

// Connection health monitoring
export class ConnectionMonitor {
  private static isHealthy = true;
  private static lastHealthCheck = 0;
  private static readonly HEALTH_CHECK_INTERVAL = 30 * 1000; // 30 seconds

  static async checkHealth(): Promise<boolean> {
    const now = Date.now();

    // Skip if recently checked
    if (now - ConnectionMonitor.lastHealthCheck < ConnectionMonitor.HEALTH_CHECK_INTERVAL) {
      return ConnectionMonitor.isHealthy;
    }

    try {
      const { error } = await (supabase as any).from('wardrobe_items').select('id').limit(1);

      ConnectionMonitor.isHealthy = !error;
      ConnectionMonitor.lastHealthCheck = now;

      if (!ConnectionMonitor.isHealthy) {
        errorInDev('Database health check failed:', error);
      }

      return ConnectionMonitor.isHealthy;
    } catch (error) {
      ConnectionMonitor.isHealthy = false;
      ConnectionMonitor.lastHealthCheck = now;
      errorInDev('Database health check error:', error as Error);
      return false;
    }
  }

  static getHealthStatus(): {
    isHealthy: boolean;
    lastCheck: number;
    timeSinceLastCheck: number;
  } {
    return {
      isHealthy: ConnectionMonitor.isHealthy,
      lastCheck: ConnectionMonitor.lastHealthCheck,
      timeSinceLastCheck: Date.now() - ConnectionMonitor.lastHealthCheck,
    };
  }
}

// Export utilities
export { dbOptimizer as default };
