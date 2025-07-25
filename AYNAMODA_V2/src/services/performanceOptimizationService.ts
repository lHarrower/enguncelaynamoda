// Performance Optimization Service - AYNA Mirror Daily Ritual
// Implements caching, background processing, and performance monitoring

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabaseClient';
import {
  DailyRecommendations,
  WardrobeItem,
  OutfitFeedback,
  UserPreferences
} from '../types/aynaMirror';

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
  PERFORMANCE_METRICS: 'performance_metrics'
};

const CACHE_EXPIRY = {
  DAILY_RECOMMENDATIONS: 24 * 60 * 60 * 1000, // 24 hours
  WARDROBE_DATA: 7 * 24 * 60 * 60 * 1000, // 7 days
  USER_PREFERENCES: 24 * 60 * 60 * 1000, // 24 hours
  WEATHER_DATA: 2 * 60 * 60 * 1000, // 2 hours
  STYLE_PROFILE: 24 * 60 * 60 * 1000, // 24 hours
  PROCESSED_IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
  PERFORMANCE_METRICS: 60 * 60 * 1000 // 1 hour
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
  private static feedbackProcessingQueue: OutfitFeedback[] = [];
  private static isProcessingFeedback = false;
  private static performanceMetrics: PerformanceMetrics = {
    recommendationGenerationTime: [],
    imageProcessingTime: [],
    databaseQueryTime: [],
    cacheHitRate: 0,
    errorRate: 0,
    lastUpdated: Date.now()
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
      console.log('[PerformanceService] Pre-generating recommendations for user:', userId);
      
      // Calculate tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowKey = tomorrow.toISOString().split('T')[0];
      
      // Check if recommendations already exist for tomorrow
      const existingRecommendations = await this.getCachedRecommendations(userId, tomorrowKey);
      if (existingRecommendations) {
        console.log('[PerformanceService] Recommendations already cached for tomorrow');
        return;
      }

      // Import AynaMirrorService dynamically to avoid circular dependency
      const { AynaMirrorService } = await import('./aynaMirrorService');
      
      // Generate recommendations for tomorrow
      const recommendations = await AynaMirrorService.generateDailyRecommendations(userId);
      
      // Cache the recommendations
      await this.cacheRecommendations(userId, recommendations, tomorrowKey);
      
      const processingTime = Date.now() - startTime;
      this.recordPerformanceMetric('recommendationGenerationTime', processingTime);
      
      console.log(`[PerformanceService] Pre-generated recommendations in ${processingTime}ms`);
    } catch (error) {
      console.error('[PerformanceService] Failed to pre-generate recommendations:', error);
      this.recordError();
    }
  }

  /**
   * Cache daily recommendations
   */
  static async cacheRecommendations(
    userId: string, 
    recommendations: DailyRecommendations,
    dateKey?: string
  ): Promise<void> {
    try {
      const date = dateKey || recommendations.date.toISOString().split('T')[0];
      const cacheKey = CACHE_KEYS.DAILY_RECOMMENDATIONS(userId, date);
      
      const cachedData: CachedData<DailyRecommendations> = {
        data: recommendations,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRY.DAILY_RECOMMENDATIONS
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedData));
      console.log('[PerformanceService] Cached recommendations for:', date);
    } catch (error) {
      console.error('[PerformanceService] Failed to cache recommendations:', error);
    }
  }

  /**
   * Get cached daily recommendations
   */
  static async getCachedRecommendations(
    userId: string, 
    dateKey?: string
  ): Promise<DailyRecommendations | null> {
    try {
      const date = dateKey || new Date().toISOString().split('T')[0];
      const cacheKey = CACHE_KEYS.DAILY_RECOMMENDATIONS(userId, date);
      
      const cachedDataStr = await AsyncStorage.getItem(cacheKey);
      if (!cachedDataStr) {
        this.recordCacheMiss();
        return null;
      }
      
      const cachedData: CachedData<DailyRecommendations> = JSON.parse(cachedDataStr);
      
      // Check if cache is expired
      if (Date.now() > cachedData.expiresAt) {
        await AsyncStorage.removeItem(cacheKey);
        this.recordCacheMiss();
        return null;
      }
      
      this.recordCacheHit();
      console.log('[PerformanceService] Cache hit for recommendations:', date);
      return cachedData.data;
    } catch (error) {
      console.error('[PerformanceService] Failed to get cached recommendations:', error);
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
      const optimizedItems = wardrobeItems.map(item => ({
        ...item,
        // Store only essential data, images are cached separately
        imageUri: item.imageUri,
        processedImageUri: item.processedImageUri
      }));
      
      const cachedData: CachedData<WardrobeItem[]> = {
        data: optimizedItems,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRY.WARDROBE_DATA
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedData));
      console.log(`[PerformanceService] Cached ${wardrobeItems.length} wardrobe items`);
    } catch (error) {
      console.error('[PerformanceService] Failed to cache wardrobe data:', error);
    }
  }

  /**
   * Get cached wardrobe data
   */
  static async getCachedWardrobeData(userId: string): Promise<WardrobeItem[] | null> {
    try {
      const cacheKey = CACHE_KEYS.WARDROBE_DATA(userId);
      const cachedDataStr = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedDataStr) {
        this.recordCacheMiss();
        return null;
      }
      
      const cachedData: CachedData<WardrobeItem[]> = JSON.parse(cachedDataStr);
      
      if (Date.now() > cachedData.expiresAt) {
        await AsyncStorage.removeItem(cacheKey);
        this.recordCacheMiss();
        return null;
      }
      
      this.recordCacheHit();
      return cachedData.data;
    } catch (error) {
      console.error('[PerformanceService] Failed to get cached wardrobe data:', error);
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
      const cachedImageStr = await AsyncStorage.getItem(cacheKey);
      if (cachedImageStr) {
        const cachedImage: CachedData<string> = JSON.parse(cachedImageStr);
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
        expiresAt: Date.now() + CACHE_EXPIRY.PROCESSED_IMAGES
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedData));
      
      const processingTime = Date.now() - startTime;
      this.recordPerformanceMetric('imageProcessingTime', processingTime);
      
      return optimizedImageUri;
    } catch (error) {
      console.error('[PerformanceService] Failed to optimize image loading:', error);
      this.recordError();
      return imageUri; // Return original URI as fallback
    }
  }

  /**
   * Process image for optimal loading (placeholder implementation)
   */
  private static async processImageForOptimalLoading(imageUri: string): Promise<string> {
    // In a real implementation, this would:
    // 1. Resize images to appropriate dimensions
    // 2. Compress images for faster loading
    // 3. Generate thumbnails for list views
    // 4. Convert to optimal formats (WebP, AVIF)
    
    // For now, return the original URI
    // TODO: Implement actual image optimization
    return imageUri;
  }

  /**
   * Generate consistent image ID for caching
   */
  private static generateImageId(imageUri: string): string {
    // Simple hash function for image URI
    let hash = 0;
    for (let i = 0; i < imageUri.length; i++) {
      const char = imageUri.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
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
      await AsyncStorage.setItem(
        CACHE_KEYS.FEEDBACK_QUEUE,
        JSON.stringify(this.feedbackProcessingQueue)
      );
      
      // Start processing if not already running
      if (!this.isProcessingFeedback) {
        this.processFeedbackQueue();
      }
      
      console.log('[PerformanceService] Queued feedback for processing');
    } catch (error) {
      console.error('[PerformanceService] Failed to queue feedback:', error);
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
      console.log(`[PerformanceService] Processing ${this.feedbackProcessingQueue.length} feedback items`);
      
      while (this.feedbackProcessingQueue.length > 0) {
        const feedback = this.feedbackProcessingQueue.shift();
        if (feedback) {
          await this.processSingleFeedback(feedback);
          
          // Small delay to prevent overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Clear persisted queue
      await AsyncStorage.removeItem(CACHE_KEYS.FEEDBACK_QUEUE);
      
      console.log('[PerformanceService] Finished processing feedback queue');
    } catch (error) {
      console.error('[PerformanceService] Error processing feedback queue:', error);
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
      
      console.log('[PerformanceService] Processed feedback for outfit:', feedback.outfitId);
    } catch (error) {
      console.error('[PerformanceService] Failed to process feedback:', error);
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
        .eq('id', feedback.outfitId)
        .single();
      
      if (error) throw error;
      
      const itemIds = outfitData.item_ids;
      
      // Update usage stats for each item
      for (const itemId of itemIds) {
        await supabase
          .from('wardrobe_items')
          .update({
            usage_count: supabase.raw('usage_count + 1'),
            last_worn: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', itemId);
      }
    } catch (error) {
      console.error('[PerformanceService] Failed to update item usage stats:', error);
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
        outfit_id: feedback.outfitId,
        confidence_rating: feedback.confidenceRating,
        emotional_response: feedback.emotionalResponse,
        occasion: feedback.occasion,
        timestamp: feedback.timestamp
      };
      
      await supabase
        .from('confidence_patterns')
        .insert(patternData);
        
    } catch (error) {
      console.error('[PerformanceService] Failed to update confidence patterns:', error);
    }
  }

  /**
   * Restore feedback queue from storage on app start
   */
  static async restoreFeedbackQueue(): Promise<void> {
    try {
      const queueStr = await AsyncStorage.getItem(CACHE_KEYS.FEEDBACK_QUEUE);
      if (queueStr) {
        this.feedbackProcessingQueue = JSON.parse(queueStr);
        console.log(`[PerformanceService] Restored ${this.feedbackProcessingQueue.length} feedback items from queue`);
        
        // Start processing if queue has items
        if (this.feedbackProcessingQueue.length > 0) {
          this.processFeedbackQueue();
        }
      }
    } catch (error) {
      console.error('[PerformanceService] Failed to restore feedback queue:', error);
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
    cacheDuration?: number
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
      console.error('[PerformanceService] Optimized query failed:', error);
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
    delay: number = 1000
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
        
        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        console.log(`[PerformanceService] Retry attempt ${attempt}/${maxRetries} after ${waitTime}ms`);
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
    duration: number
  ): Promise<void> {
    try {
      const cachedData: CachedData<T> = {
        data: result,
        timestamp: Date.now(),
        expiresAt: Date.now() + duration
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedData));
    } catch (error) {
      console.error('[PerformanceService] Failed to cache query result:', error);
    }
  }

  /**
   * Get cached query result
   */
  private static async getCachedQueryResult<T>(cacheKey: string): Promise<T | null> {
    try {
      const cachedDataStr = await AsyncStorage.getItem(cacheKey);
      if (!cachedDataStr) {
        return null;
      }
      
      const cachedData: CachedData<T> = JSON.parse(cachedDataStr);
      
      if (Date.now() > cachedData.expiresAt) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }
      
      return cachedData.data;
    } catch (error) {
      console.error('[PerformanceService] Failed to get cached query result:', error);
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
      console.log('[PerformanceService] Starting cleanup routine');
      
      await Promise.all([
        this.cleanupOldRecommendations(),
        this.cleanupExpiredCache(),
        this.cleanupOldFeedbackData(),
        this.cleanupTempImages()
      ]);
      
      console.log('[PerformanceService] Cleanup routine completed');
    } catch (error) {
      console.error('[PerformanceService] Cleanup routine failed:', error);
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
      
      if (error) throw error;
      
      console.log('[PerformanceService] Cleaned up old recommendations');
    } catch (error) {
      console.error('[PerformanceService] Failed to cleanup old recommendations:', error);
    }
  }

  /**
   * Clean up expired cache entries
   */
  private static async cleanupExpiredCache(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => 
        key.includes('recommendations_') || 
        key.includes('wardrobe_') || 
        key.includes('weather_') ||
        key.includes('style_profile_')
      );
      
      for (const key of cacheKeys) {
        try {
          const cachedDataStr = await AsyncStorage.getItem(key);
          if (cachedDataStr) {
            const cachedData = JSON.parse(cachedDataStr);
            if (Date.now() > cachedData.expiresAt) {
              await AsyncStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted cache entries
          await AsyncStorage.removeItem(key);
        }
      }
      
      console.log('[PerformanceService] Cleaned up expired cache entries');
    } catch (error) {
      console.error('[PerformanceService] Failed to cleanup expired cache:', error);
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
      
      if (error) throw error;
      
      console.log('[PerformanceService] Cleaned up old feedback data');
    } catch (error) {
      console.error('[PerformanceService] Failed to cleanup old feedback data:', error);
    }
  }

  /**
   * Clean up temporary images and processed image cache
   */
  private static async cleanupTempImages(): Promise<void> {
    try {
      // Clean up processed image cache entries older than 30 days
      const allKeys = await AsyncStorage.getAllKeys();
      const imageKeys = allKeys.filter(key => key.includes('processed_image_'));
      
      for (const key of imageKeys) {
        try {
          const cachedDataStr = await AsyncStorage.getItem(key);
          if (cachedDataStr) {
            const cachedData = JSON.parse(cachedDataStr);
            if (Date.now() > cachedData.expiresAt) {
              await AsyncStorage.removeItem(key);
            }
          }
        } catch (error) {
          await AsyncStorage.removeItem(key);
        }
      }
      
      console.log('[PerformanceService] Cleaned up temporary images');
    } catch (error) {
      console.error('[PerformanceService] Failed to cleanup temporary images:', error);
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
    
    this.persistPerformanceMetrics();
  }

  /**
   * Record cache hit
   */
  private static recordCacheHit(): void {
    // Simple cache hit rate calculation
    const currentRate = this.performanceMetrics.cacheHitRate;
    this.performanceMetrics.cacheHitRate = (currentRate * 0.9) + (1.0 * 0.1);
    this.persistPerformanceMetrics();
  }

  /**
   * Record cache miss
   */
  private static recordCacheMiss(): void {
    const currentRate = this.performanceMetrics.cacheHitRate;
    this.performanceMetrics.cacheHitRate = (currentRate * 0.9) + (0.0 * 0.1);
    this.persistPerformanceMetrics();
  }

  /**
   * Record error occurrence
   */
  private static recordError(): void {
    const currentRate = this.performanceMetrics.errorRate;
    this.performanceMetrics.errorRate = (currentRate * 0.9) + (1.0 * 0.1);
    this.persistPerformanceMetrics();
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
      errorRate: metrics.errorRate
    };
  }

  /**
   * Calculate average of array
   */
  private static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Persist performance metrics to storage
   */
  private static async persistPerformanceMetrics(): Promise<void> {
    try {
      this.performanceMetrics.lastUpdated = Date.now();
      await AsyncStorage.setItem(
        CACHE_KEYS.PERFORMANCE_METRICS,
        JSON.stringify(this.performanceMetrics)
      );
    } catch (error) {
      console.error('[PerformanceService] Failed to persist performance metrics:', error);
    }
  }

  /**
   * Load performance metrics from storage
   */
  static async loadPerformanceMetrics(): Promise<void> {
    try {
      const metricsStr = await AsyncStorage.getItem(CACHE_KEYS.PERFORMANCE_METRICS);
      if (metricsStr) {
        const loadedMetrics = JSON.parse(metricsStr);
        
        // Check if metrics are not too old (older than 24 hours)
        if (Date.now() - loadedMetrics.lastUpdated < 24 * 60 * 60 * 1000) {
          this.performanceMetrics = loadedMetrics;
          console.log('[PerformanceService] Loaded performance metrics from storage');
        }
      }
    } catch (error) {
      console.error('[PerformanceService] Failed to load performance metrics:', error);
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
      console.log('[PerformanceService] Initializing performance optimization service');
      
      await Promise.all([
        this.loadPerformanceMetrics(),
        this.restoreFeedbackQueue()
      ]);
      
      // Schedule periodic cleanup (every 24 hours)
      this.schedulePeriodicCleanup();
      
      console.log('[PerformanceService] Performance optimization service initialized');
    } catch (error) {
      console.error('[PerformanceService] Failed to initialize performance service:', error);
    }
  }

  /**
   * Schedule periodic cleanup
   */
  private static schedulePeriodicCleanup(): void {
    // Run cleanup every 24 hours
    setInterval(() => {
      this.performCleanup();
    }, 24 * 60 * 60 * 1000);
    
    // Run initial cleanup after 5 minutes
    setTimeout(() => {
      this.performCleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Shutdown performance optimization service
   */
  static async shutdown(): Promise<void> {
    try {
      console.log('[PerformanceService] Shutting down performance optimization service');
      
      // Process any remaining feedback in queue
      if (this.feedbackProcessingQueue.length > 0) {
        await this.processFeedbackQueue();
      }
      
      // Persist final metrics
      await this.persistPerformanceMetrics();
      
      console.log('[PerformanceService] Performance optimization service shut down');
    } catch (error) {
      console.error('[PerformanceService] Error during shutdown:', error);
    }
  }
}

// Export singleton instance
export const performanceOptimizationService = PerformanceOptimizationService;