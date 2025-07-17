// Performance Optimization Service Tests
import { PerformanceOptimizationService } from '../services/performanceOptimizationService';
import { AynaMirrorService } from '../services/aynaMirrorService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabaseClient';
import {
  DailyRecommendations,
  WardrobeItem,
  OutfitFeedback,
  EmotionalResponse
} from '../types/aynaMirror';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../config/supabaseClient');
jest.mock('../services/aynaMirrorService');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockAynaMirrorService = AynaMirrorService as jest.Mocked<typeof AynaMirrorService>;

describe('PerformanceOptimizationService', () => {
  const mockUserId = 'test-user-123';
  const mockDate = '2024-01-15';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Reset performance metrics
    (PerformanceOptimizationService as any).performanceMetrics = {
      recommendationGenerationTime: [],
      imageProcessingTime: [],
      databaseQueryTime: [],
      cacheHitRate: 0,
      errorRate: 0,
      lastUpdated: Date.now()
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ========================================================================
  // RECOMMENDATION CACHING TESTS
  // ========================================================================

  describe('Recommendation Caching', () => {
    const mockRecommendations: DailyRecommendations = {
      id: 'rec-123',
      userId: mockUserId,
      date: new Date('2024-01-15'),
      recommendations: [],
      weatherContext: {
        temperature: 72,
        condition: 'sunny',
        humidity: 45,
        location: 'San Francisco',
        timestamp: new Date()
      },
      generatedAt: new Date()
    };

    test('should cache daily recommendations successfully', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await PerformanceOptimizationService.cacheRecommendations(
        mockUserId,
        mockRecommendations,
        mockDate
      );

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        `recommendations_${mockUserId}_${mockDate}`,
        expect.stringContaining('"data"')
      );
    });

    test('should retrieve cached recommendations when valid', async () => {
      const cachedData = {
        data: mockRecommendations,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const result = await PerformanceOptimizationService.getCachedRecommendations(
        mockUserId,
        mockDate
      );

      expect(result).toEqual(mockRecommendations);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        `recommendations_${mockUserId}_${mockDate}`
      );
    });

    test('should return null for expired cached recommendations', async () => {
      const expiredCachedData = {
        data: mockRecommendations,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        expiresAt: Date.now() - 1 * 60 * 60 * 1000 // 1 hour ago (expired)
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(expiredCachedData));
      mockAsyncStorage.removeItem.mockResolvedValue();

      const result = await PerformanceOptimizationService.getCachedRecommendations(
        mockUserId,
        mockDate
      );

      expect(result).toBeNull();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        `recommendations_${mockUserId}_${mockDate}`
      );
    });

    test('should pre-generate recommendations for tomorrow', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null); // No existing cache
      mockAynaMirrorService.generateDailyRecommendations.mockResolvedValue(mockRecommendations);
      mockAsyncStorage.setItem.mockResolvedValue();

      await PerformanceOptimizationService.preGenerateRecommendations(mockUserId);

      expect(mockAynaMirrorService.generateDailyRecommendations).toHaveBeenCalledWith(mockUserId);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    test('should skip pre-generation if recommendations already cached', async () => {
      const existingCache = {
        data: mockRecommendations,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingCache));

      await PerformanceOptimizationService.preGenerateRecommendations(mockUserId);

      expect(mockAynaMirrorService.generateDailyRecommendations).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // WARDROBE DATA CACHING TESTS
  // ========================================================================

  describe('Wardrobe Data Caching', () => {
    const mockWardrobeItems: WardrobeItem[] = [
      {
        id: 'item-1',
        userId: mockUserId,
        imageUri: 'https://example.com/image1.jpg',
        processedImageUri: 'https://example.com/processed1.jpg',
        category: 'tops',
        colors: ['blue', 'white'],
        tags: ['casual', 'cotton'],
        usageStats: {
          itemId: 'item-1',
          totalWears: 5,
          lastWorn: new Date(),
          averageRating: 4.2,
          complimentsReceived: 2,
          costPerWear: 12.50
        },
        usageCount: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    test('should cache wardrobe data successfully', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await PerformanceOptimizationService.cacheWardrobeData(mockUserId, mockWardrobeItems);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        `wardrobe_${mockUserId}`,
        expect.stringContaining('"data"')
      );
    });

    test('should retrieve cached wardrobe data when valid', async () => {
      const cachedData = {
        data: mockWardrobeItems,
        timestamp: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days from now
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const result = await PerformanceOptimizationService.getCachedWardrobeData(mockUserId);

      expect(result).toEqual(mockWardrobeItems);
    });

    test('should return null for expired wardrobe cache', async () => {
      const expiredCachedData = {
        data: mockWardrobeItems,
        timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
        expiresAt: Date.now() - 1 * 24 * 60 * 60 * 1000 // 1 day ago (expired)
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(expiredCachedData));
      mockAsyncStorage.removeItem.mockResolvedValue();

      const result = await PerformanceOptimizationService.getCachedWardrobeData(mockUserId);

      expect(result).toBeNull();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // IMAGE OPTIMIZATION TESTS
  // ========================================================================

  describe('Image Optimization', () => {
    const mockImageUri = 'https://example.com/image.jpg';

    test('should optimize image loading and cache result', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null); // No cached image
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await PerformanceOptimizationService.optimizeImageLoading(mockImageUri);

      expect(result).toBe(mockImageUri); // Returns original URI for now
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    test('should return cached optimized image when available', async () => {
      const cachedImage = {
        data: 'https://example.com/optimized.jpg',
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days from now
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedImage));

      const result = await PerformanceOptimizationService.optimizeImageLoading(mockImageUri);

      expect(result).toBe('https://example.com/optimized.jpg');
    });

    test('should handle image optimization errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await PerformanceOptimizationService.optimizeImageLoading(mockImageUri);

      expect(result).toBe(mockImageUri); // Returns original URI on error
    });
  });

  // ========================================================================
  // BACKGROUND PROCESSING TESTS
  // ========================================================================

  describe('Background Processing', () => {
    const mockFeedback: OutfitFeedback = {
      outfitId: 'outfit-123',
      userId: mockUserId,
      confidenceRating: 4,
      emotionalResponse: {
        primary: 'confident',
        intensity: 8,
        additionalEmotions: ['stylish']
      } as EmotionalResponse,
      comfort: 4,
      timestamp: new Date()
    };

    test('should queue feedback for background processing', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await PerformanceOptimizationService.queueFeedbackForProcessing(mockFeedback);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'feedback_processing_queue',
        expect.stringContaining(mockFeedback.outfitId)
      );
    });

    test('should restore feedback queue on initialization', async () => {
      const queueData = [mockFeedback];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queueData));

      await PerformanceOptimizationService.restoreFeedbackQueue();

      // Queue should be restored (we can't directly test private properties)
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('feedback_processing_queue');
    });

    test('should handle empty feedback queue gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await PerformanceOptimizationService.restoreFeedbackQueue();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('feedback_processing_queue');
      // Should not throw error
    });
  });

  // ========================================================================
  // DATABASE OPTIMIZATION TESTS
  // ========================================================================

  describe('Database Optimization', () => {
    test('should execute optimized query with caching', async () => {
      const mockQueryFn = jest.fn().mockResolvedValue({ data: 'test-data' });
      const cacheKey = 'test-cache-key';
      const cacheDuration = 60000; // 1 minute

      mockAsyncStorage.getItem.mockResolvedValue(null); // No cache
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await PerformanceOptimizationService.executeOptimizedQuery(
        mockQueryFn,
        cacheKey,
        cacheDuration
      );

      expect(mockQueryFn).toHaveBeenCalled();
      expect(result).toEqual({ data: 'test-data' });
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    test('should return cached result when available', async () => {
      const cachedResult = {
        data: { data: 'cached-data' },
        timestamp: Date.now(),
        expiresAt: Date.now() + 60000
      };

      const mockQueryFn = jest.fn();
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedResult));

      const result = await PerformanceOptimizationService.executeOptimizedQuery(
        mockQueryFn,
        'test-cache-key',
        60000
      );

      expect(mockQueryFn).not.toHaveBeenCalled();
      expect(result).toEqual({ data: 'cached-data' });
    });

    test('should retry failed queries with exponential backoff', async () => {
      const mockQueryFn = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce({ data: 'success' });

      // Mock setTimeout to avoid actual delays in tests
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      const result = await PerformanceOptimizationService.executeOptimizedQuery(mockQueryFn);

      expect(mockQueryFn).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ data: 'success' });

      (global.setTimeout as jest.Mock).mockRestore();
    });
  });

  // ========================================================================
  // CLEANUP TESTS
  // ========================================================================

  describe('Cleanup Routines', () => {
    test('should perform comprehensive cleanup', async () => {
      // Mock Supabase delete operations
      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          lt: jest.fn().mockResolvedValue({ error: null })
        })
      } as any);

      // Mock AsyncStorage operations
      mockAsyncStorage.getAllKeys.mockResolvedValue([
        'recommendations_user1_2024-01-01',
        'wardrobe_user1',
        'weather_san-francisco',
        'other_key'
      ]);
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key.includes('recommendations_') || key.includes('wardrobe_')) {
          return Promise.resolve(JSON.stringify({
            data: {},
            timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
            expiresAt: Date.now() - 1 * 60 * 60 * 1000 // Expired
          }));
        }
        return Promise.resolve(null);
      });
      mockAsyncStorage.removeItem.mockResolvedValue();

      await PerformanceOptimizationService.performCleanup();

      expect(mockSupabase.from).toHaveBeenCalledWith('daily_recommendations');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
    });

    test('should handle cleanup errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          lt: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      } as any);

      // Should not throw error
      await expect(PerformanceOptimizationService.performCleanup()).resolves.not.toThrow();
    });
  });

  // ========================================================================
  // PERFORMANCE MONITORING TESTS
  // ========================================================================

  describe('Performance Monitoring', () => {
    test('should record and retrieve performance metrics', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      // Record some metrics (using private method via any cast)
      (PerformanceOptimizationService as any).recordPerformanceMetric('recommendationGenerationTime', 150);
      (PerformanceOptimizationService as any).recordPerformanceMetric('recommendationGenerationTime', 200);
      (PerformanceOptimizationService as any).recordPerformanceMetric('imageProcessingTime', 50);

      const metrics = PerformanceOptimizationService.getPerformanceMetrics();

      expect(metrics.recommendationGenerationTime).toHaveLength(2);
      expect(metrics.recommendationGenerationTime).toContain(150);
      expect(metrics.recommendationGenerationTime).toContain(200);
      expect(metrics.imageProcessingTime).toContain(50);
    });

    test('should calculate performance summary correctly', async () => {
      // Record metrics
      (PerformanceOptimizationService as any).recordPerformanceMetric('recommendationGenerationTime', 100);
      (PerformanceOptimizationService as any).recordPerformanceMetric('recommendationGenerationTime', 200);
      (PerformanceOptimizationService as any).recordPerformanceMetric('imageProcessingTime', 50);
      (PerformanceOptimizationService as any).recordPerformanceMetric('imageProcessingTime', 100);

      const summary = PerformanceOptimizationService.getPerformanceSummary();

      expect(summary.avgRecommendationTime).toBe(150); // (100 + 200) / 2
      expect(summary.avgImageProcessingTime).toBe(75); // (50 + 100) / 2
      expect(summary.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(summary.errorRate).toBeGreaterThanOrEqual(0);
    });

    test('should track cache hit and miss rates', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      // Record cache hits and misses
      (PerformanceOptimizationService as any).recordCacheHit();
      (PerformanceOptimizationService as any).recordCacheHit();
      (PerformanceOptimizationService as any).recordCacheMiss();

      const metrics = PerformanceOptimizationService.getPerformanceMetrics();

      // Cache hit rate should be positive (exact value depends on calculation)
      expect(metrics.cacheHitRate).toBeGreaterThan(0);
      expect(metrics.cacheHitRate).toBeLessThanOrEqual(1);
    });

    test('should load performance metrics from storage', async () => {
      const storedMetrics = {
        recommendationGenerationTime: [100, 150],
        imageProcessingTime: [25, 50],
        databaseQueryTime: [10, 20],
        cacheHitRate: 0.8,
        errorRate: 0.1,
        lastUpdated: Date.now() - 1000 // 1 second ago
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedMetrics));

      await PerformanceOptimizationService.loadPerformanceMetrics();

      const metrics = PerformanceOptimizationService.getPerformanceMetrics();
      expect(metrics.recommendationGenerationTime).toEqual([100, 150]);
      expect(metrics.cacheHitRate).toBe(0.8);
    });

    test('should ignore old performance metrics', async () => {
      const oldMetrics = {
        recommendationGenerationTime: [100],
        imageProcessingTime: [25],
        databaseQueryTime: [10],
        cacheHitRate: 0.9,
        errorRate: 0.05,
        lastUpdated: Date.now() - 25 * 60 * 60 * 1000 // 25 hours ago
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(oldMetrics));

      await PerformanceOptimizationService.loadPerformanceMetrics();

      const metrics = PerformanceOptimizationService.getPerformanceMetrics();
      // Should not load old metrics
      expect(metrics.recommendationGenerationTime).toHaveLength(0);
    });
  });

  // ========================================================================
  // INITIALIZATION AND LIFECYCLE TESTS
  // ========================================================================

  describe('Initialization and Lifecycle', () => {
    test('should initialize service successfully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await PerformanceOptimizationService.initialize();

      expect(mockAsyncStorage.getItem).toHaveBeenCalled();
    });

    test('should shutdown service gracefully', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await PerformanceOptimizationService.shutdown();

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    test('should handle initialization errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      // Should not throw error
      await expect(PerformanceOptimizationService.initialize()).resolves.not.toThrow();
    });
  });

  // ========================================================================
  // INTEGRATION TESTS
  // ========================================================================

  describe('Integration Tests', () => {
    test('should handle complete recommendation flow with caching', async () => {
      // Setup mocks for complete flow
      mockAsyncStorage.getItem.mockResolvedValue(null); // No cache initially
      mockAynaMirrorService.generateDailyRecommendations.mockResolvedValue(mockRecommendations);
      mockAsyncStorage.setItem.mockResolvedValue();

      // Pre-generate recommendations
      await PerformanceOptimizationService.preGenerateRecommendations(mockUserId);

      // Verify recommendations were generated and cached
      expect(mockAynaMirrorService.generateDailyRecommendations).toHaveBeenCalledWith(mockUserId);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    test('should handle feedback processing with database updates', async () => {
      // Setup mocks for feedback processing
      mockAsyncStorage.setItem.mockResolvedValue();
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { item_ids: ['item-1', 'item-2'] },
              error: null
            })
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        }),
        insert: jest.fn().mockResolvedValue({ error: null })
      } as any);

      await PerformanceOptimizationService.queueFeedbackForProcessing(mockFeedback);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'feedback_processing_queue',
        expect.any(String)
      );
    });

    test('should maintain performance metrics across operations', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      // Simulate various operations that record metrics
      await PerformanceOptimizationService.optimizeImageLoading('test-image.jpg');
      
      // Check that metrics were recorded
      const summary = PerformanceOptimizationService.getPerformanceSummary();
      expect(summary.avgImageProcessingTime).toBeGreaterThanOrEqual(0);
    });
  });

  // ========================================================================
  // PERFORMANCE BENCHMARKS
  // ========================================================================

  describe('Performance Benchmarks', () => {
    test('recommendation caching should be fast', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      const startTime = Date.now();
      await PerformanceOptimizationService.cacheRecommendations(mockUserId, mockRecommendations);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    test('cache retrieval should be fast', async () => {
      const cachedData = {
        data: mockRecommendations,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const startTime = Date.now();
      const result = await PerformanceOptimizationService.getCachedRecommendations(mockUserId);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50); // Should complete in under 50ms
      expect(result).toBeTruthy();
    });

    test('should handle large wardrobe datasets efficiently', async () => {
      // Create large wardrobe dataset
      const largeWardrobe: WardrobeItem[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        userId: mockUserId,
        imageUri: `https://example.com/image${i}.jpg`,
        category: 'tops',
        colors: ['blue'],
        tags: ['casual'],
        usageStats: {
          itemId: `item-${i}`,
          totalWears: 0,
          lastWorn: null,
          averageRating: 0,
          complimentsReceived: 0,
          costPerWear: 0
        },
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      mockAsyncStorage.setItem.mockResolvedValue();

      const startTime = Date.now();
      await PerformanceOptimizationService.cacheWardrobeData(mockUserId, largeWardrobe);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(500); // Should handle 1000 items in under 500ms
    });
  });
});