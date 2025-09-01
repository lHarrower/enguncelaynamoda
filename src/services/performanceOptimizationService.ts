// Performance Optimization Service - AYNA Mirror Daily Ritual
// Implements caching, background processing, and performance monitoring

import { supabase } from '@/config/supabaseClient';
import { fireAndForget } from '@/utils/asyncUtils';
import { errorInDev, logInDev } from '@/utils/consoleSuppress';
import { isObject, safeParse } from '@/utils/safeJSON';
import { secureStorage } from '@/utils/secureStorage';
import { isSupabaseOk, wrap } from '@/utils/supabaseResult';

import {
  DailyRecommendations,
  OutfitFeedback,
  UsageStats,
  WardrobeItem,
} from '@/types/aynaMirror';

// NOTE: Intentionally avoid static import of AynaMirrorService to break circular dependency:
// aynaMirrorService -> performanceOptimizationService -> aynaMirrorService.
// We will lazy-load it only when pre-generation is invoked.

// ============================================================================
// CACHE KEYS AND CONFIGURATION
// ============================================================================

const CACHE_KEYS = {
  DAILY_RECOMMENDATIONS: (userId: string, date: string) => `recommendations_${userId}_${date}`,
  WARDROBE_DATA: (userId: string) => `wardrobe_${userId}`,
  USER_PREFERENCES: (userId: string) => `preferences_${userId}`,
  WEATHER_DATA: (location: string) => `weather_${location}`,
  STYLE_PROFILE: (userId: string) => `style_profile_${userId}`,
  PROCESSED_IMAGES: (imageId: string) => `processed_image_${imageId}`,
  FEEDBACK_QUEUE: 'feedback_processing_queue',
  PERFORMANCE_METRICS: 'performance_metrics',
};

const CACHE_EXPIRY = {
  DAILY_RECOMMENDATIONS: 24 * 60 * 60 * 1000, // 24 hours
  WARDROBE_DATA: 7 * 24 * 60 * 60 * 1000, // 7 days
  USER_PREFERENCES: 24 * 60 * 60 * 1000, // 24 hours
  WEATHER_DATA: 2 * 60 * 60 * 1000, // 2 hours
  STYLE_PROFILE: 24 * 60 * 60 * 1000, // 24 hours
  PROCESSED_IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
  PERFORMANCE_METRICS: 60 * 60 * 1000, // 1 hour
};

interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PerformanceMetrics {
  recommendationGenerationTime: number[];
  imageProcessingTime: number[];
  databaseQueryTime: number[];
  cacheHitRate: number;
  errorRate: number;
  lastUpdated: number;
}

// ============================================================================
// PERFORMANCE OPTIMIZATION SERVICE
// ============================================================================

export class PerformanceOptimizationService {
  // OPERASYON DİSİPLİN: Memory leak önleme için timer referansları
  private static cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private static initialCleanupTimer: ReturnType<typeof setTimeout> | null = null;
  private static feedbackProcessingQueue: OutfitFeedback[] = [];
  private static isProcessingFeedback = false;
  private static performanceMetrics: PerformanceMetrics = {
    recommendationGenerationTime: [],
    imageProcessingTime: [],
    databaseQueryTime: [],
    cacheHitRate: 0,
    errorRate: 0,
    lastUpdated: Date.now(),
  };

  // ========================================================================
  // RECOMMENDATION CACHING
  // ========================================================================

  /**
   * Pre-generate and cache next day's recommendations
   */
  static async preGenerateRecommendations(userId: string): Promise<void> {
    const startTime = Date.now();

    try {
      logInDev('[PerformanceService] Pre-generating recommendations for user:', userId);

      // Calculate tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowKey = tomorrow.toISOString().split('T')[0];

      // Check if recommendations already exist for tomorrow
      const existingRecommendations = await this.getCachedRecommendations(userId, tomorrowKey);
      if (existingRecommendations) {
        logInDev('[PerformanceService] Recommendations already cached for tomorrow');
        return;
      }

      // Dynamic import to avoid require cycle
      type MirrorModule = {
        AynaMirrorService?: {
          generateDailyRecommendations: (uid: string) => Promise<DailyRecommendations>;
        };
        default?: { generateDailyRecommendations: (uid: string) => Promise<DailyRecommendations> };
        aynaMirrorService?: {
          generateDailyRecommendations: (uid: string) => Promise<DailyRecommendations>;
        };
      };
      const mod: MirrorModule = await import('./aynaMirrorService');
      const target = mod.AynaMirrorService ||
        mod.default ||
        mod.aynaMirrorService || {
          generateDailyRecommendations: (uid: string): DailyRecommendations => ({
            id: 'fallback',
            userId: uid,
            date: new Date(),
            recommendations: [],
            weatherContext: {
              temperature: 70,
              condition: 'cloudy',
              humidity: 50,
              windSpeed: 5,
              location: 'Unknown',
              timestamp: new Date(),
            },
            generatedAt: new Date(),
          }),
        };
      const recommendations = await target.generateDailyRecommendations(userId);

      // Cache the recommendations
      await this.cacheRecommendations(userId, recommendations, tomorrowKey);

      const processingTime = Date.now() - startTime;
      this.recordPerformanceMetric('recommendationGenerationTime', processingTime);

      logInDev(`[PerformanceService] Pre-generated recommendations in ${processingTime}ms`);
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to pre-generate recommendations:',
        error instanceof Error ? error : String(error),
      );
      this.recordError();
    }
  }

  /**
   * Cache daily recommendations
   */
  static async cacheRecommendations(
    userId: string,
    recommendations: DailyRecommendations,
    dateKey?: string,
  ): Promise<void> {
    try {
      const date =
        dateKey && typeof dateKey === 'string'
          ? dateKey
          : recommendations.date.toISOString().split('T')[0];
      const cacheKey = CACHE_KEYS.DAILY_RECOMMENDATIONS(userId, date as string);

      const cachedData: CachedData<DailyRecommendations> = {
        data: recommendations,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRY.DAILY_RECOMMENDATIONS,
      };

      await secureStorage.initialize();
      await secureStorage.setItem(cacheKey, JSON.stringify(cachedData));
      logInDev('[PerformanceService] Cached recommendations for:', date);
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to cache recommendations:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Get cached daily recommendations
   */
  static async getCachedRecommendations(
    userId: string,
    dateKey?: string,
  ): Promise<DailyRecommendations | null> {
    try {
      const date =
        dateKey && typeof dateKey === 'string' ? dateKey : new Date().toISOString().split('T')[0];
      const cacheKey = CACHE_KEYS.DAILY_RECOMMENDATIONS(userId, date as string);

      await secureStorage.initialize();
      const cachedDataStr = await secureStorage.getItem(cacheKey);
      if (!cachedDataStr) {
        this.recordCacheMiss();
        return null;
      }

      const parsed = safeParse<unknown>(cachedDataStr, null);
      const unwrap = (val: unknown): DailyRecommendations | null => {
        if (
          val &&
          typeof val === 'object' &&
          'data' in val &&
          (val as { data?: unknown }).data &&
          (val as { data?: { recommendations?: unknown } }).data?.recommendations
        ) {
          const container = val as { data: DailyRecommendations; expiresAt?: number };
          if (typeof container.expiresAt === 'number' && Date.now() > container.expiresAt) {
            return null;
          }
          return container.data;
        }
        if (val && typeof val === 'object' && 'recommendations' in val) {
          return val as DailyRecommendations;
        }
        return null;
      };

      const data = unwrap(parsed);
      if (!data) {
        await secureStorage.initialize();
        await secureStorage.removeItem(cacheKey).catch(() => {});
        this.recordCacheMiss();
        return null;
      }

      this.recordCacheHit();
      logInDev('[PerformanceService] Cache hit for recommendations:', date);

      // Rehydrate date & nested timestamps (defensively) without broad any casts
      interface HasOptionalDates {
        date?: unknown;
        generatedAt?: unknown;
        weatherContext?: { timestamp?: unknown } | null;
      }
      const rehydrate = (val: unknown): void => {
        if (!val || typeof val !== 'object') {
          return;
        }
        const obj = val as HasOptionalDates;
        if (typeof obj.date === 'string') {
          obj.date = new Date(obj.date);
        }
        if (typeof obj.generatedAt === 'string') {
          obj.generatedAt = new Date(obj.generatedAt);
        }
        if (
          obj.weatherContext &&
          typeof obj.weatherContext === 'object' &&
          typeof obj.weatherContext.timestamp === 'string'
        ) {
          obj.weatherContext.timestamp = new Date(obj.weatherContext.timestamp);
        }
      };
      rehydrate(data);
      return data;
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to get cached recommendations:',
        error instanceof Error ? error : String(error),
      );
      this.recordCacheMiss();
      return null;
    }
  }

  // ========================================================================
  // WARDROBE DATA CACHING
  // ========================================================================

  /**
   * Cache wardrobe data with optimized image references
   */
  static async cacheWardrobeData(userId: string, wardrobeItems: WardrobeItem[]): Promise<void> {
    try {
      const cacheKey = CACHE_KEYS.WARDROBE_DATA(userId);

      // Optimize wardrobe data for caching
      const optimizedItems = wardrobeItems.map((item) => ({
        ...item,
        // Store only essential data, images are cached separately
        imageUri: item.imageUri,
        processedImageUri: item.processedImageUri,
      }));

      const cachedData: CachedData<WardrobeItem[]> = {
        data: optimizedItems,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRY.WARDROBE_DATA,
      };

      await secureStorage.initialize();
      await secureStorage.setItem(cacheKey, JSON.stringify(cachedData));
      logInDev(`[PerformanceService] Cached ${wardrobeItems.length} wardrobe items`);
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to cache wardrobe data:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Get cached wardrobe data
   */
  static async getCachedWardrobeData(userId: string): Promise<WardrobeItem[] | null> {
    try {
      const cacheKey = CACHE_KEYS.WARDROBE_DATA(userId);
      await secureStorage.initialize();
      const cachedDataStr = await secureStorage.getItem(cacheKey);

      if (!cachedDataStr) {
        this.recordCacheMiss();
        return null;
      }

      const cachedData = safeParse<CachedData<unknown>>(cachedDataStr, {
        data: [],
        timestamp: 0,
        expiresAt: 0,
      });

      if (Date.now() > cachedData.expiresAt) {
        await secureStorage.removeItem(cacheKey);
        this.recordCacheMiss();
        return null;
      }

      this.recordCacheHit();
      // Rehydrate date fields in wardrobe items with runtime guards
      const toDate = (val: unknown): Date | undefined =>
        typeof val === 'string' ? new Date(val) : val instanceof Date ? val : undefined;

      const items: WardrobeItem[] = (Array.isArray(cachedData.data) ? cachedData.data : [])
        .map((raw) => {
          if (!raw || typeof raw !== 'object') {
            return null;
          }
          const obj = raw as Partial<WardrobeItem> & Record<string, unknown>;
          const usage =
            obj.usageStats && typeof obj.usageStats === 'object'
              ? (obj.usageStats as unknown)
              : undefined;
          return {
            ...(obj as WardrobeItem),
            createdAt: toDate(obj.createdAt) || new Date(),
            updatedAt: toDate(obj.updatedAt) || new Date(),
            usageStats: usage
              ? (() => {
                  const u = usage as Record<string, unknown>;
                  const reconstructed: UsageStats = {
                    itemId:
                      typeof u.itemId === 'string' ? u.itemId : (obj.id as string) || 'unknown',
                    totalWears: typeof u.totalWears === 'number' ? u.totalWears : 0,
                    lastWorn: toDate(u.lastWorn) || null,
                    averageRating: typeof u.averageRating === 'number' ? u.averageRating : 0,
                    complimentsReceived:
                      typeof u.complimentsReceived === 'number' ? u.complimentsReceived : 0,
                    costPerWear: typeof u.costPerWear === 'number' ? u.costPerWear : 0,
                  };
                  return reconstructed;
                })()
              : undefined,
          };
        })
        .filter((i): i is WardrobeItem => !!i);
      return items;
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to get cached wardrobe data:',
        error instanceof Error ? error : String(error),
      );
      this.recordCacheMiss();
      return null;
    }
  }

  // ========================================================================
  // IMAGE OPTIMIZATION
  // ========================================================================

  /**
   * Optimize image loading with progressive loading and caching
   */
  static async optimizeImageLoading(imageUri: string): Promise<string> {
    const startTime = Date.now();

    try {
      const imageId = this.generateImageId(imageUri);
      const cacheKey = CACHE_KEYS.PROCESSED_IMAGES(imageId);

      // Check if optimized image is cached
      await secureStorage.initialize();
      const cachedImageStr = await secureStorage.getItem(cacheKey);
      if (cachedImageStr) {
        const cachedImage = safeParse<CachedData<string>>(cachedImageStr, {
          data: '',
          timestamp: 0,
          expiresAt: 0,
        });
        if (Date.now() < cachedImage.expiresAt) {
          this.recordCacheHit();
          return cachedImage.data;
        }
      }

      // Process and optimize image
      const optimizedImageUri = await this.processImageForOptimalLoading(imageUri);

      // Cache the optimized image reference
      const cachedData: CachedData<string> = {
        data: optimizedImageUri,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRY.PROCESSED_IMAGES,
      };

      await secureStorage.setItem(cacheKey, JSON.stringify(cachedData));

      const processingTime = Date.now() - startTime;
      this.recordPerformanceMetric('imageProcessingTime', processingTime);

      return optimizedImageUri;
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to optimize image loading:',
        error instanceof Error ? error : String(error),
      );
      this.recordError();
      return imageUri; // Return original URI as fallback
    }
  }

  /**
   * Process image for optimal loading
   */
  private static async processImageForOptimalLoading(imageUri: string): Promise<string> {
    try {
      // Basic image optimization implementation
      // 1. Check if image is already optimized
      const imageId = this.generateImageId(imageUri);
      const cacheKey = CACHE_KEYS.PROCESSED_IMAGES(imageId);

      const cached = await this.getCachedQueryResult<string>(cacheKey);
      if (cached) {
        this.recordCacheHit();
        return cached;
      }

      // 2. For now, implement basic optimization by adding query parameters
      // In a full implementation, this would use image processing libraries
      let optimizedUri = imageUri;

      // Add compression and resize parameters if the URI supports it
      if (imageUri.includes('unsplash.com') || imageUri.includes('images.')) {
        const separator = imageUri.includes('?') ? '&' : '?';
        optimizedUri = `${imageUri}${separator}w=800&h=600&fit=crop&q=80&fm=webp`;
      }

      // 3. Cache the optimized URI
      await this.cacheQueryResult(cacheKey, optimizedUri, CACHE_EXPIRY.PROCESSED_IMAGES);

      this.recordCacheMiss();
      return optimizedUri;
    } catch (error) {
      errorInDev(
        '[PerformanceOptimizationService] Image optimization failed:',
        error instanceof Error ? error : String(error),
      );
      this.recordError();
      return imageUri; // Fallback to original
    }
  }

  /**
   * Generate consistent image ID for caching
   */
  private static generateImageId(imageUri: string): string {
    // Simple hash function for image URI
    let hash = 0;
    for (let i = 0; i < imageUri.length; i++) {
      const char = imageUri.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  // ========================================================================
  // BACKGROUND PROCESSING
  // ========================================================================

  /**
   * Queue user feedback for background processing
   */
  static async queueFeedbackForProcessing(feedback: OutfitFeedback): Promise<void> {
    try {
      this.feedbackProcessingQueue.push(feedback);

      // Persist queue to storage
      await secureStorage.initialize();
      await secureStorage.setItem(
        CACHE_KEYS.FEEDBACK_QUEUE,
        JSON.stringify(this.feedbackProcessingQueue),
      );

      // Start processing if not already running
      if (!this.isProcessingFeedback) {
        fireAndForget(this.processFeedbackQueue(), 'processFeedbackQueue');
      }

      logInDev('[PerformanceService] Queued feedback for processing');
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to queue feedback:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Process feedback queue in background
   */
  private static async processFeedbackQueue(): Promise<void> {
    if (this.isProcessingFeedback || this.feedbackProcessingQueue.length === 0) {
      return;
    }

    this.isProcessingFeedback = true;

    try {
      logInDev(
        `[PerformanceService] Processing ${this.feedbackProcessingQueue.length} feedback items`,
      );

      while (this.feedbackProcessingQueue.length > 0) {
        const feedback = this.feedbackProcessingQueue.shift();
        if (!feedback) {
          continue;
        }
        // Process sequentially (await preserves ordering); keep minimal delay only outside tests
        await this.processSingleFeedback(feedback);
        if (process.env.NODE_ENV !== 'test') {
          await new Promise((r) => setTimeout(r, 50));
        }
      }

      // Clear persisted queue
      await secureStorage.initialize();
      await secureStorage.removeItem(CACHE_KEYS.FEEDBACK_QUEUE);

      logInDev('[PerformanceService] Finished processing feedback queue');
    } catch (error) {
      errorInDev(
        '[PerformanceService] Error processing feedback queue:',
        error instanceof Error ? error : String(error),
      );
      this.recordError();
    } finally {
      this.isProcessingFeedback = false;
    }
  }

  /**
   * Process individual feedback item
   */
  private static async processSingleFeedback(feedback: OutfitFeedback): Promise<void> {
    try {
      // Import services dynamically to avoid circular dependencies
      const { IntelligenceService } = await import('./intelligenceService');
      const intelligenceService = new IntelligenceService();

      // Update user style preferences based on feedback
      await intelligenceService.updateStylePreferences(feedback.userId, feedback);

      // Update item usage statistics
      await this.updateItemUsageStats(feedback);

      // Update confidence patterns
      await this.updateConfidencePatterns(feedback);

      logInDev(
        '[PerformanceService] Processed feedback for outfit:',
        feedback.outfitRecommendationId,
      );
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to process feedback:',
        error instanceof Error ? error : String(error),
      );
      this.recordError();
    }
  }

  /**
   * Update item usage statistics
   */
  private static async updateItemUsageStats(feedback: OutfitFeedback): Promise<void> {
    try {
      // Get outfit items from database
      const { data: outfitData, error } = await supabase
        .from('outfit_recommendations')
        .select('item_ids')
        .eq('id', feedback.outfitRecommendationId)
        .single();

      if (error) {
        throw error;
      }

      const rawIds = (outfitData as { item_ids?: unknown }).item_ids;
      const itemIds: string[] = Array.isArray(rawIds)
        ? rawIds.filter((x): x is string => typeof x === 'string')
        : [];

      // Update usage stats for each item
      for (const itemId of itemIds) {
        // Fetch current usage to increment safely when raw() unavailable in tests
        const currentRes = await supabase
          .from('wardrobe_items')
          .select('usage_count')
          .eq('id', itemId)
          .single();
        const current = (currentRes as { data?: { usage_count?: number } }).data?.usage_count ?? 0;
        await supabase
          .from('wardrobe_items')
          .update({
            usage_count: current + 1,
            last_worn: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', itemId);
      }
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to update item usage stats:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Update confidence patterns based on feedback
   */
  private static async updateConfidencePatterns(feedback: OutfitFeedback): Promise<void> {
    try {
      // Store confidence pattern data for future analysis
      const patternData = {
        user_id: feedback.userId,
        outfit_id: feedback.outfitRecommendationId,
        confidence_rating: feedback.confidenceRating,
        emotional_response: feedback.emotionalResponse,
        occasion: feedback.occasion,
        timestamp: feedback.timestamp,
      };

      const insertRes = await wrap(
        async () =>
          await supabase.from('confidence_patterns').insert(patternData).select('*').single(),
      );
      if (!isSupabaseOk(insertRes)) {
        errorInDev('[PerformanceService] Failed to insert confidence pattern', insertRes.error);
      }
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to update confidence patterns:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Restore feedback queue from storage on app start
   */
  static async restoreFeedbackQueue(): Promise<void> {
    try {
      await secureStorage.initialize();
      const queueStr = await secureStorage.getItem(CACHE_KEYS.FEEDBACK_QUEUE);
      if (queueStr) {
        const raw = safeParse<unknown>(queueStr, []);
        if (Array.isArray(raw)) {
          this.feedbackProcessingQueue = raw.filter(
            (f): f is OutfitFeedback =>
              isObject(f) && typeof (f as { userId?: unknown }).userId === 'string',
          );
        }
        logInDev(
          `[PerformanceService] Restored ${this.feedbackProcessingQueue.length} feedback items from queue`,
        );

        // Start processing if queue has items
        if (this.feedbackProcessingQueue.length > 0 && !this.isProcessingFeedback) {
          fireAndForget(this.processFeedbackQueue(), 'processFeedbackQueue-restore');
        }
      }
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to restore feedback queue:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  // ========================================================================
  // DATABASE OPTIMIZATION
  // ========================================================================

  /**
   * Execute optimized database query with caching and retry logic
   */
  static async executeOptimizedQuery<T>(
    queryFn: () => Promise<T>,
    cacheKey?: string,
    cacheDuration?: number,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      // Check cache first if cache key provided
      if (cacheKey) {
        const cachedResult = await this.getCachedQueryResult<T>(cacheKey);
        if (cachedResult) {
          this.recordCacheHit();
          return cachedResult;
        }
      }

      // Execute query with retry logic
      const result = await this.executeWithRetry(queryFn, 3);

      // Cache result if cache key provided
      if (cacheKey && cacheDuration) {
        await this.cacheQueryResult(cacheKey, result, cacheDuration);
      }

      const queryTime = Date.now() - startTime;
      this.recordPerformanceMetric('databaseQueryTime', queryTime);

      return result;
    } catch (error) {
      errorInDev(
        '[PerformanceService] Optimized query failed:',
        error instanceof Error ? error : String(error),
      );
      this.recordError();
      throw error;
    }
  }

  /**
   * Execute function with retry logic
   */
  private static async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    delay: number = process.env.NODE_ENV === 'test' ? 0 : 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff (noop in tests)
        const waitTime = delay * Math.pow(2, attempt - 1);
        if (waitTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        } else {
          // Yield in tests without timers
          await Promise.resolve();
        }

        logInDev(`[PerformanceService] Retry attempt ${attempt}/${maxRetries} after ${waitTime}ms`);
      }
    }

    throw lastError!;
  }

  /**
   * Cache query result
   */
  private static async cacheQueryResult<T>(
    cacheKey: string,
    result: T,
    duration: number,
  ): Promise<void> {
    try {
      const cachedData: CachedData<T> = {
        data: result,
        timestamp: Date.now(),
        expiresAt: Date.now() + duration,
      };

      await secureStorage.initialize();
      await secureStorage.setItem(cacheKey, JSON.stringify(cachedData));
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to cache query result:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Get cached query result
   */
  private static async getCachedQueryResult<T>(cacheKey: string): Promise<T | null> {
    try {
      await secureStorage.initialize();
      const cachedDataStr = await secureStorage.getItem(cacheKey);
      if (!cachedDataStr) {
        return null;
      }

      const cachedData = safeParse<CachedData<T>>(cachedDataStr, {
        data: null as unknown as T,
        timestamp: 0,
        expiresAt: 0,
      });

      if (Date.now() > cachedData.expiresAt) {
        await secureStorage.removeItem(cacheKey);
        return null;
      }

      return cachedData.data;
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to get cached query result:',
        error instanceof Error ? error : String(error),
      );
      return null;
    }
  }

  // ========================================================================
  // CLEANUP ROUTINES
  // ========================================================================

  /**
   * Clean up old recommendations and temporary data
   */
  static async performCleanup(): Promise<void> {
    try {
      logInDev('[PerformanceService] Starting cleanup routine');

      await Promise.all([
        this.cleanupOldRecommendations(),
        this.cleanupExpiredCache(),
        this.cleanupOldFeedbackData(),
        this.cleanupTempImages(),
      ]);

      logInDev('[PerformanceService] Cleanup routine completed');
    } catch (error) {
      errorInDev(
        '[PerformanceService] Cleanup routine failed:',
        error instanceof Error ? error : String(error),
      );
      this.recordError();
    }
  }

  /**
   * Clean up old recommendations (older than 30 days)
   */
  private static async cleanupOldRecommendations(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { error } = await supabase
        .from('daily_recommendations')
        .delete()
        .lt('recommendation_date', thirtyDaysAgo.toISOString());

      if (error) {
        throw error;
      }

      logInDev('[PerformanceService] Cleaned up old recommendations');
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to cleanup old recommendations:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Clean up expired cache entries
   */
  private static async cleanupExpiredCache(): Promise<void> {
    try {
      await secureStorage.initialize();
      const allKeys = await secureStorage.getAllKeys();
      const cacheKeys = allKeys.filter(
        (key) =>
          key.includes('recommendations_') ||
          key.includes('wardrobe_') ||
          key.includes('weather_') ||
          key.includes('style_profile_'),
      );

      for (const key of cacheKeys) {
        try {
          const cachedDataStr = await secureStorage.getItem(key);
          if (cachedDataStr) {
            const cachedData = safeParse<{ expiresAt?: number }>(cachedDataStr, {});
            if (typeof cachedData.expiresAt === 'number' && Date.now() > cachedData.expiresAt) {
              await secureStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted cache entries
          await secureStorage.removeItem(key);
        }
      }

      logInDev('[PerformanceService] Cleaned up expired cache entries');
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to cleanup expired cache:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Clean up old feedback data (older than 1 year)
   */
  private static async cleanupOldFeedbackData(): Promise<void> {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { error } = await supabase
        .from('outfit_feedback')
        .delete()
        .lt('created_at', oneYearAgo.toISOString());

      if (error) {
        throw error;
      }

      logInDev('[PerformanceService] Cleaned up old feedback data');
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to cleanup old feedback data:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Clean up temporary images and processed image cache
   */
  private static async cleanupTempImages(): Promise<void> {
    try {
      // Clean up processed image cache entries older than 30 days
      await secureStorage.initialize();
      const allKeys = await secureStorage.getAllKeys();
      const imageKeys = allKeys.filter((key) => key.includes('processed_image_'));

      for (const key of imageKeys) {
        try {
          const cachedDataStr = await secureStorage.getItem(key);
          if (cachedDataStr) {
            const cachedData = safeParse<{ expiresAt?: number }>(cachedDataStr, {});
            if (typeof cachedData.expiresAt === 'number' && Date.now() > cachedData.expiresAt) {
              await secureStorage.removeItem(key);
            }
          }
        } catch (error) {
          await secureStorage.removeItem(key);
        }
      }

      logInDev('[PerformanceService] Cleaned up temporary images');
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to cleanup temporary images:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  // ========================================================================
  // PERFORMANCE MONITORING
  // ========================================================================

  /**
   * Record performance metric
   */
  private static recordPerformanceMetric(metric: keyof PerformanceMetrics, value: number): void {
    if (Array.isArray(this.performanceMetrics[metric])) {
      const metricArray = this.performanceMetrics[metric] as number[];
      metricArray.push(value);

      // Keep only last 100 measurements
      if (metricArray.length > 100) {
        metricArray.shift();
      }
    }

    void this.persistPerformanceMetrics();
  }

  /**
   * Record cache hit
   */
  private static recordCacheHit(): void {
    // Simple cache hit rate calculation
    const currentRate = this.performanceMetrics.cacheHitRate;
    this.performanceMetrics.cacheHitRate = currentRate * 0.9 + 1.0 * 0.1;
    void this.persistPerformanceMetrics();
  }

  /**
   * Record cache miss
   */
  private static recordCacheMiss(): void {
    const currentRate = this.performanceMetrics.cacheHitRate;
    this.performanceMetrics.cacheHitRate = currentRate * 0.9 + 0.0 * 0.1;
    void this.persistPerformanceMetrics();
  }

  /**
   * Record error occurrence
   */
  private static recordError(): void {
    const currentRate = this.performanceMetrics.errorRate;
    this.performanceMetrics.errorRate = currentRate * 0.9 + 1.0 * 0.1;
    void this.persistPerformanceMetrics();
  }

  /**
   * Get current performance metrics
   */
  static getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get performance summary
   */
  static getPerformanceSummary(): {
    avgRecommendationTime: number;
    avgImageProcessingTime: number;
    avgDatabaseQueryTime: number;
    cacheHitRate: number;
    errorRate: number;
  } {
    const metrics = this.performanceMetrics;

    return {
      avgRecommendationTime: this.calculateAverage(metrics.recommendationGenerationTime),
      avgImageProcessingTime: this.calculateAverage(metrics.imageProcessingTime),
      avgDatabaseQueryTime: this.calculateAverage(metrics.databaseQueryTime),
      cacheHitRate: metrics.cacheHitRate,
      errorRate: metrics.errorRate,
    };
  }

  /**
   * Calculate average of array
   */
  private static calculateAverage(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Persist performance metrics to storage
   */
  private static async persistPerformanceMetrics(): Promise<void> {
    try {
      this.performanceMetrics.lastUpdated = Date.now();
      await secureStorage.initialize();
      await secureStorage.setItem(
        CACHE_KEYS.PERFORMANCE_METRICS,
        JSON.stringify(this.performanceMetrics),
      );
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to persist performance metrics:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Load performance metrics from storage
   */
  static async loadPerformanceMetrics(): Promise<void> {
    try {
      await secureStorage.initialize();
      const metricsStr = await secureStorage.getItem(CACHE_KEYS.PERFORMANCE_METRICS);
      if (metricsStr) {
        const loadedMetrics = safeParse<PerformanceMetrics>(metricsStr, this.performanceMetrics);

        // Check if metrics are not too old (older than 24 hours)
        if (Date.now() - loadedMetrics.lastUpdated < 24 * 60 * 60 * 1000) {
          this.performanceMetrics = loadedMetrics;
          logInDev('[PerformanceService] Loaded performance metrics from storage');
        }
      }
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to load performance metrics:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  // ========================================================================
  // INITIALIZATION AND LIFECYCLE
  // ========================================================================

  /**
   * Initialize performance optimization service
   */
  static async initialize(): Promise<void> {
    try {
      logInDev('[PerformanceService] Initializing performance optimization service');

      await Promise.all([this.loadPerformanceMetrics(), this.restoreFeedbackQueue()]);

      // Schedule periodic cleanup (every 24 hours) - skip in tests to avoid open handles
      if (process.env.NODE_ENV !== 'test') {
        this.schedulePeriodicCleanup();
      }

      logInDev('[PerformanceService] Performance optimization service initialized');
    } catch (error) {
      errorInDev(
        '[PerformanceService] Failed to initialize performance service:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Schedule periodic cleanup
   * OPERASYON DİSİPLİN: Memory leak önleme ile güvenli timer yönetimi
   */
  private static schedulePeriodicCleanup(): void {
    // Önceki timer'ları temizle
    this.stopPeriodicCleanup();

    // Run cleanup every 24 hours
    if (process.env.NODE_ENV !== 'test') {
      this.cleanupTimer = setInterval(
        () => {
          void this.performCleanup();
        },
        24 * 60 * 60 * 1000,
      );

      // Run initial cleanup after 5 minutes
      this.initialCleanupTimer = setTimeout(
        () => {
          void this.performCleanup();
        },
        5 * 60 * 1000,
      );
    }
  }

  /**
   * OPERASYON DİSİPLİN: Memory leak önleme - tüm timer'ları durdur
   */
  private static stopPeriodicCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    if (this.initialCleanupTimer) {
      clearTimeout(this.initialCleanupTimer);
      this.initialCleanupTimer = null;
    }
  }

  /**
   * Shutdown performance optimization service
   * OPERASYON DİSİPLİN: Memory leak önleme - tüm timer'ları temizle
   */
  static async shutdown(): Promise<void> {
    try {
      logInDev('[PerformanceService] Shutting down performance optimization service');

      // OPERASYON DİSİPLİN: Timer'ları durdur
      this.stopPeriodicCleanup();

      // Process any remaining feedback in queue
      if (this.feedbackProcessingQueue.length > 0) {
        await this.processFeedbackQueue();
      }

      // Persist final metrics
      await this.persistPerformanceMetrics();

      logInDev('[PerformanceService] Performance optimization service shut down');
    } catch (error) {
      errorInDev(
        '[PerformanceService] Error during shutdown:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * OPERASYON DİSİPLİN: Component unmount'ta çağrılması gereken cleanup metodu
   * React component'lerde useEffect cleanup function'ında kullanılmalı
   */
  static cleanup(): void {
    void this.shutdown();
  }
}

// Export singleton instance
export const performanceOptimizationService = PerformanceOptimizationService;
