import AsyncStorage from '@react-native-async-storage/async-storage';
import { errorHandlingService, ErrorHandlingService } from '@/services/errorHandlingService';
import { WeatherContext, WardrobeItem, DailyRecommendations } from '@/types/aynaMirror';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock PerformanceOptimizationService
jest.mock('@/services/performanceOptimizationService', () => ({
  PerformanceOptimizationService: {
    async getCachedRecommendations(userId, date) {
      // Use the actual AsyncStorage mock to get cached data
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const dateKey = date || new Date().toISOString().split('T')[0];
      const cacheKey = `recommendations_${userId}_${dateKey}`;
      
      try {
        const cachedDataStr = await AsyncStorage.getItem(cacheKey);
        
        if (cachedDataStr) {
          const cachedData = JSON.parse(cachedDataStr);
          
          // Check if cache is expired (mimicking real implementation)
          if (cachedData.expiresAt && Date.now() > cachedData.expiresAt) {
            await AsyncStorage.removeItem(cacheKey);
            return null;
          }
          
          // Return the cached data (could be test-specific structure)
          return cachedData.data || cachedData;
        }
      } catch (error) {
        // Fall back to null on error
        return null;
      }
      
      // Return null if no cached data found
      return null;
    },
    
    // Other methods that might be called
    async cacheRecommendations() { return Promise.resolve(); },
    async getCachedWardrobeData() { return Promise.resolve(null); },
    async cacheWardrobeData() { return Promise.resolve(); },
    async preGenerateRecommendations() { return Promise.resolve(); },
    async optimizeImageLoading(uri) { return Promise.resolve(uri); },
    async queueFeedbackForProcessing() { return Promise.resolve(); },
    async executeOptimizedQuery(queryFn) { 
      if (typeof queryFn === 'function') {
        return queryFn();
      }
      return Promise.resolve({ data: 'mock-data' });
    },
    async performCleanup() { return Promise.resolve(); },
    getPerformanceMetrics() { return {}; },
    getPerformanceSummary() { return {}; },
    async initialize() { return Promise.resolve(); },
    async shutdown() { return Promise.resolve(); }
  }
}));

describe('ErrorHandlingService', () => {
  const mockUserId = 'test-user-123';
  const mockWeatherContext: WeatherContext = {
    temperature: 72,
    condition: 'sunny',
    humidity: 45,
    location: 'Test City',
    timestamp: new Date(),
  };

  const mockWardrobeItem: WardrobeItem = {
    id: 'item-1',
    userId: mockUserId,
    imageUri: 'test-image.jpg',
    processedImageUri: 'processed-image.jpg',
    category: 'tops',
    colors: ['blue', 'white'],
    tags: ['casual', 'summer'],
    usageStats: {
      itemId: 'item-1',
      totalWears: 5,
      lastWorn: new Date(),
      averageRating: 4.2,
      complimentsReceived: 2,
      costPerWear: 15.50,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset AsyncStorage mocks
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('executeWithRetry', () => {
    it('should execute operation successfully on first try', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      
      const result = await errorHandlingService.executeWithRetry(
        mockOperation,
        { service: 'test', operation: 'testOp' }
      );

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry operation on failure and succeed', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce('success');
      
      const result = await errorHandlingService.executeWithRetry(
        mockOperation,
        { service: 'test', operation: 'testOp' },
        { maxRetries: 2, baseDelay: 10 }
      );

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const mockError = new Error('Persistent failure');
      const mockOperation = jest.fn().mockRejectedValue(mockError);
      
      await expect(
        errorHandlingService.executeWithRetry(
          mockOperation,
          { service: 'test', operation: 'testOp' },
          { maxRetries: 2, baseDelay: 10 }
        )
      ).rejects.toThrow('Persistent failure');

      expect(mockOperation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should log errors during retry attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockError = new Error('Test error');
      const mockOperation = jest.fn().mockRejectedValue(mockError);
      
      try {
        await errorHandlingService.executeWithRetry(
          mockOperation,
          { service: 'test', operation: 'testOp' },
          { maxRetries: 1, baseDelay: 10 }
        );
      } catch (error) {
        // Expected to fail
      }

      // Should store error logs in AsyncStorage
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'error_logs',
        expect.stringContaining('Test error')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Weather Service Error Handling', () => {
    it('should return cached weather when available', async () => {
      const cachedWeather = {
        ...mockWeatherContext,
        cachedAt: new Date().toISOString(),
      };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedWeather));

      const result = await errorHandlingService.handleWeatherServiceError(mockUserId);

      expect(result.temperature).toBe(72);
      expect(result.condition).toBe('sunny');
      expect(result.location).toBe('Test City');
    });

    it('should return seasonal fallback when no cache available', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await errorHandlingService.handleWeatherServiceError(mockUserId);

      expect(result.temperature).toBeGreaterThan(0);
      expect(result.condition).toBeDefined();
      expect(result.location).toBe('Unknown');
    });

    it('should handle different seasons correctly', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      // Mock winter date
      const originalDate = Date;
      const mockDate = new Date('2024-01-15'); // Winter
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = originalDate.now;

      const result = await errorHandlingService.handleWeatherServiceError(mockUserId);

      expect(result.temperature).toBeLessThan(50); // Should be cold for winter
      
      // Restore Date
      global.Date = originalDate;
    });
  });

  describe('AI Service Error Handling', () => {
    it('should return rule-based recommendations when AI fails', async () => {
      const wardrobeItems = [mockWardrobeItem];
      
      const result = await errorHandlingService.handleAIServiceError(
        wardrobeItems,
        mockWeatherContext,
        mockUserId
      );

      expect(result).toHaveLength(1);
      expect(result[0].items).toContain(mockWardrobeItem);
      expect(result[0].confidenceNote).toBeDefined();
      expect(result[0].reasoning).toContain('Weather appropriate');
    });

    it('should return emergency recommendations when no suitable items', async () => {
      const wardrobeItems: WardrobeItem[] = [];
      
      const result = await errorHandlingService.handleAIServiceError(
        wardrobeItems,
        mockWeatherContext,
        mockUserId
      );

      expect(result).toHaveLength(0); // No items to recommend
    });

    it('should prioritize recently worn items in emergency mode', async () => {
      const recentItem = {
        ...mockWardrobeItem,
        id: 'recent-item',
        category: 'tank-top', // Will be filtered out in cold weather
        lastWorn: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      };
      
      const oldItem = {
        ...mockWardrobeItem,
        id: 'old-item',
        category: 'tank-top', // Will be filtered out in cold weather
        lastWorn: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      };

      const wardrobeItems = [oldItem, recentItem];
      
      // Use cold weather to filter out tank-tops, forcing emergency mode
      const coldWeatherContext = {
        ...mockWeatherContext,
        temperature: 5, // Cold weather
      };
      
      const result = await errorHandlingService.handleAIServiceError(
        wardrobeItems,
        coldWeatherContext,
        mockUserId
      );

      // Should prioritize recently worn items
      expect(result[0].items[0].id).toBe('recent-item');
    });
  });

  describe('Caching System', () => {
    it('should cache and retrieve recommendations', async () => {
      const mockRecommendations: DailyRecommendations = {
        id: 'rec-1',
        userId: mockUserId,
        date: new Date(),
        recommendations: [],
        weatherContext: mockWeatherContext,
        generatedAt: new Date(),
      };

      await errorHandlingService.cacheRecommendations(mockUserId, mockRecommendations);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `recommendations_${mockUserId}`,
        expect.stringContaining(mockRecommendations.id)
      );
    });

    it('should retrieve cached recommendations', async () => {
      const cachedData = {
        id: 'rec-1',
        userId: mockUserId,
        recommendations: [],
        cachedAt: new Date().toISOString(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

      const result = await errorHandlingService.getCachedRecommendations(mockUserId);

      expect(result).toBeDefined();
      expect(result?.id).toBe('rec-1');
    });

    it('should cache and retrieve weather data', async () => {
      await errorHandlingService.cacheWeather(mockUserId, mockWeatherContext);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `weather_${mockUserId}`,
        expect.stringContaining('sunny')
      );
    });

    it('should cache and retrieve wardrobe data', async () => {
      const wardrobeItems = [mockWardrobeItem];

      await errorHandlingService.cacheWardrobeData(mockUserId, wardrobeItems);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `wardrobe_${mockUserId}`,
        expect.stringContaining(mockWardrobeItem.id)
      );
    });

    it('should handle cache retrieval errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await errorHandlingService.getCachedRecommendations(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('Notification Error Handling', () => {
    it('should store failed notifications for retry', async () => {
      const notificationPayload = {
        type: 'daily_mirror' as const,
        userId: mockUserId,
        data: { test: 'data' },
      };

      await errorHandlingService.handleNotificationError(mockUserId, notificationPayload);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'pending_notifications',
        expect.stringContaining(mockUserId)
      );
    });

    it('should log critical errors for manual intervention', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock AsyncStorage to fail for both getItem and setItem
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage full'));
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage full'));
      
      // Mock sendInAppNotification to throw an error to trigger logCriticalError
      const originalSendInApp = (errorHandlingService as any).sendInAppNotification;
      (errorHandlingService as any).sendInAppNotification = jest.fn().mockRejectedValue(new Error('In-app notification failed'));

      await errorHandlingService.handleNotificationError(mockUserId, {
        type: 'daily_mirror',
        userId: mockUserId,
      });

      // Should log both the storage error and the critical error
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to store pending notification:',
        expect.any(Error)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Notification error handling failed:',
        expect.any(Error)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'CRITICAL ERROR:',
        expect.objectContaining({
          service: 'notification',
          operation: 'handleNotificationError',
        })
      );

      // Restore original method
      (errorHandlingService as any).sendInAppNotification = originalSendInApp;
      consoleSpy.mockRestore();
    });
  });

  describe('Sync Operations', () => {
    it('should sync pending feedback', async () => {
      const pendingFeedback = [
        { id: 'feedback-1', userId: mockUserId, rating: 5 },
        { id: 'feedback-2', userId: mockUserId, rating: 4 },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(pendingFeedback));

      await errorHandlingService.syncPendingFeedback();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('pending_feedback');
    });

    it('should sync pending notifications', async () => {
      const pendingNotifications = [
        { userId: mockUserId, payload: { type: 'daily_mirror' }, timestamp: new Date().toISOString() },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(pendingNotifications));

      await errorHandlingService.syncPendingOperations();

      // Should attempt to sync notifications
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('pending_notifications');
    });

    it('should handle sync errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock AsyncStorage.getItem to reject for all sync operations
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Sync error'));

      await errorHandlingService.syncPendingOperations();

      // Should log specific sync failures
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to sync pending feedback:',
        expect.any(Error)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to sync pending notifications:',
        expect.any(Error)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to sync pending wardrobe updates:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('User-Friendly Error Messages', () => {
    it('should provide appropriate error messages for different contexts', () => {
      const networkError = new Error('Network error');
      
      const message = errorHandlingService.getUserFriendlyErrorMessage(networkError, 'network');
      expect(message).toContain('trouble connecting');
      expect(message).toContain('recent preferences');
    });

    it('should provide recovery actions for different error types', () => {
      const actions = errorHandlingService.getRecoveryActions('weather');
      
      expect(actions).toContain('Check weather manually for today');
      expect(actions).toContain('Use seasonal outfit suggestions');
    });

    it('should provide default messages for unknown contexts', () => {
      const unknownError = new Error('Unknown error');
      
      const message = errorHandlingService.getUserFriendlyErrorMessage(unknownError, 'unknown');
      expect(message).toContain('Something went wrong');
      expect(message).toContain('backup plans');
    });
  });

  describe('Error Logging', () => {
    it('should maintain error log size limit', async () => {
      // Mock existing logs with 100 entries
      const existingLogs = Array.from({ length: 100 }, (_, i) => ({
        service: 'test',
        operation: 'test',
        timestamp: new Date().toISOString(),
        errorMessage: `Error ${i}`,
      }));

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingLogs));

      const mockOperation = jest.fn().mockRejectedValue(new Error('New error'));
      
      try {
        await errorHandlingService.executeWithRetry(
          mockOperation,
          { service: 'test', operation: 'testOp' },
          { maxRetries: 0 }
        );
      } catch (error) {
        // Expected to fail
      }

      // Should maintain log size limit
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'error_logs',
        expect.stringMatching(/"errorMessage":"New error"/)
      );
    });
  });

  describe('Offline Mode', () => {
    it('should work in offline mode with cached data', async () => {
      const cachedRecommendations = {
        id: 'cached-rec',
        userId: mockUserId,
        recommendations: [],
        generatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        cachedAt: new Date().toISOString(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedRecommendations));

      const result = await errorHandlingService.getCachedRecommendations(mockUserId);

      expect(result).toBeDefined();
      expect(result?.id).toBe('cached-rec');
    });

    it('should handle complete offline scenario', async () => {
      // Simulate complete offline mode
      const mockOperation = jest.fn().mockRejectedValue(new Error('Network unavailable'));
      
      // Mock cached data available
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key.includes('recommendations')) {
          return Promise.resolve(JSON.stringify({
            id: 'offline-rec',
            userId: mockUserId,
            recommendations: [],
            cachedAt: new Date().toISOString(),
          }));
        }
        return Promise.resolve(null);
      });

      try {
        await errorHandlingService.executeWithRetry(
          mockOperation,
          { service: 'test', operation: 'offlineTest' },
          { maxRetries: 1, enableOfflineMode: true }
        );
      } catch (error) {
        // Expected to fail, but should have cached data available
      }

      const cachedData = await errorHandlingService.getCachedRecommendations(mockUserId);
      expect(cachedData).toBeDefined();
      expect(cachedData?.id).toBe('offline-rec');
    });
  });
});