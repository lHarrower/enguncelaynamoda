import { AynaMirrorService } from '@/services/aynaMirrorService';
import { WeatherService } from '@/services/weatherService';
import NotificationService, { notificationService } from '@/services/notificationService';
import { errorHandlingService } from '@/services/errorHandlingService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;

// Mock all external dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
}));
jest.mock('expo-location');
// Using global supabaseClient mock from jest.setup.js
// jest.mock('@/config/supabaseClient');

// Mock the services
jest.mock('@/services/enhancedWardrobeService', () => ({
  enhancedWardrobeService: {
    getUserWardrobe: jest.fn(),
  },
}));

jest.mock('@/services/intelligenceService', () => ({
  IntelligenceService: jest.fn().mockImplementation(() => ({
    generateStyleRecommendations: jest.fn(),
    calculateOutfitCompatibility: jest.fn(),
    calculateConfidenceScore: jest.fn(),
    predictUserSatisfaction: jest.fn(),
  })),
}));

describe('Error Handling Integration Tests', () => {
  const mockUserId = 'integration-test-user';

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset AsyncStorage mocks
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('AYNA Mirror Service Error Handling', () => {
    it('should handle complete service failure gracefully', async () => {
      // Mock all services to fail
      const { enhancedWardrobeService } = require('@/services/enhancedWardrobeService');
      enhancedWardrobeService.getUserWardrobe.mockRejectedValue(new Error('Wardrobe service down'));

      // Mock cached data to be available
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key.includes('wardrobe')) {
          return Promise.resolve(
            JSON.stringify({
              items: [
                {
                  id: 'cached-item',
                  userId: mockUserId,
                  category: 'tops',
                  colors: ['blue'],
                  tags: ['casual'],
                  usageStats: { averageRating: 4, totalWears: 5 },
                },
              ],
              cachedAt: new Date().toISOString(),
            }),
          );
        }
        if (key.includes('weather')) {
          return Promise.resolve(
            JSON.stringify({
              temperature: 70,
              condition: 'sunny',
              humidity: 50,
              location: 'Cached City',
              timestamp: new Date().toISOString(),
              cachedAt: new Date().toISOString(),
            }),
          );
        }
        return Promise.resolve(null);
      });

      // Should not throw error, should use cached data
      const result = await AynaMirrorService.generateDailyRecommendations(mockUserId);

      expect(result).toBeDefined();
      expect(result.userId).toBe(mockUserId);
      expect(result.recommendations).toBeDefined();
    });

    it('should retry failed operations with exponential backoff', async () => {
      const { enhancedWardrobeService } = require('@/services/enhancedWardrobeService');

      // Mock to fail twice, then succeed
      enhancedWardrobeService.getUserWardrobe
        .mockRejectedValueOnce(new Error('Temporary failure 1'))
        .mockRejectedValueOnce(new Error('Temporary failure 2'))
        .mockResolvedValueOnce([
          {
            id: 'retry-item',
            userId: mockUserId,
            category: 'tops',
            colors: ['green'],
            tags: ['work'],
            usageStats: { averageRating: 4.5, totalWears: 3 },
          },
        ]);

      const startTime = Date.now();
      const result = await AynaMirrorService.generateDailyRecommendations(mockUserId);
      const endTime = Date.now();

      // Should have taken some time due to retries with backoff
      expect(endTime - startTime).toBeGreaterThan(100); // At least some delay
      expect(result).toBeDefined();
      expect(enhancedWardrobeService.getUserWardrobe).toHaveBeenCalledTimes(3);
    });

    it('should cache successful results for offline use', async () => {
      const { enhancedWardrobeService } = require('@/services/enhancedWardrobeService');

      enhancedWardrobeService.getUserWardrobe.mockResolvedValue([
        {
          id: 'cache-test-item',
          userId: mockUserId,
          category: 'bottoms',
          colors: ['black'],
          tags: ['formal'],
          usageStats: { averageRating: 5, totalWears: 10 },
        },
      ]);

      await AynaMirrorService.generateDailyRecommendations(mockUserId);

      // Should have cached the results
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('recommendations'),
        expect.stringContaining(mockUserId),
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('wardrobe'),
        expect.stringContaining('cache-test-item'),
      );
    });
  });

  describe('Weather Service Error Handling', () => {
    it('should handle weather API failures with cached fallback', async () => {
      // Mock location service to work
      const mockLocation = require('expo-location');
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      mockLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: { latitude: 40.7128, longitude: -74.006 },
      });

      // Mock fetch to fail
      global.fetch = jest.fn().mockRejectedValue(new Error('Weather API down'));

      // Mock cached weather data
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key.includes('weather_cache')) {
          return Promise.resolve(
            JSON.stringify({
              data: {
                temperature: 75,
                condition: 'cloudy',
                humidity: 60,
                location: 'Cached Location',
                timestamp: new Date(),
              },
              timestamp: Date.now() - 1000 * 60 * 10, // 10 minutes ago (fresh)
            }),
          );
        }
        return Promise.resolve(null);
      });

      const result = await WeatherService.getCurrentWeatherContext(mockUserId);

      expect(result.temperature).toBe(75);
      expect(result.condition).toBe('cloudy');
      expect(result.location).toBe('Cached Location');
    });

    it('should provide seasonal fallback when no cache available', async () => {
      // Mock location service to work
      const mockLocation = require('expo-location');
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      mockLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: { latitude: 40.7128, longitude: -74.006 },
      });

      // Mock fetch to fail
      global.fetch = jest.fn().mockRejectedValue(new Error('Weather API down'));

      // No cached data
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await WeatherService.getCurrentWeatherContext(mockUserId);

      expect(result.temperature).toBeGreaterThan(0);
      expect(result.condition).toBeDefined();
      expect(['sunny', 'cloudy', 'rainy', 'snowy', 'windy']).toContain(result.condition);
    });

    it('should handle location permission denial gracefully', async () => {
      const mockLocation = require('expo-location');
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);

      // Should use default location
      const result = await WeatherService.getCurrentWeatherContext(mockUserId);

      expect(result).toBeDefined();
      expect(result.location).toBeDefined();
    });
  });

  describe('Notification Service Error Handling', () => {
    it('should handle notification permission denial', async () => {
      // Reset the service for fresh initialization
      notificationService.resetForTesting();
      
      // Get the global mock notifications object from the service
      const notificationServiceModule = require('@/services/notificationService');
      const mockNotifications = await notificationServiceModule.loadNotifications();
      
      // Mock permission denial
      mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);
      mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);

      const result = await notificationService.initialize();

      expect(result).toBe(false);
    });

    it('should store failed notifications for retry', async () => {
      const mockNotifications = require('expo-notifications');
      mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);
      mockNotifications.scheduleNotificationAsync.mockRejectedValue(
        new Error('Notification failed'),
      );

      // Mock errorHandlingService.executeWithRetry to fail after retries
      const { errorHandlingService } = require('@/services/errorHandlingService');
      const originalExecuteWithRetry = errorHandlingService.executeWithRetry;
      errorHandlingService.executeWithRetry = jest.fn().mockRejectedValue(
        new Error('Failed after retries'),
      );

      const notificationService = NotificationService;
      await notificationService.initialize();

      // Should handle the error and store for retry
      try {
        await notificationService.scheduleDailyMirrorNotification(mockUserId, {
          preferredTime: new Date(),
          timezone: 'UTC',
          enableWeekends: true,
          enableQuickOptions: true,
          confidenceNoteStyle: 'encouraging',
        });
      } catch (error) {
        // Expected to fail
      }

      // Should have stored pending notification
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'pending_notifications',
        expect.stringContaining(mockUserId),
      );

      // Restore original method
      errorHandlingService.executeWithRetry = originalExecuteWithRetry;
    });

    it('should retry failed notifications on service recovery', async () => {
      // Mock pending notifications in storage
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'pending_notifications') {
          return Promise.resolve(
            JSON.stringify([
              {
                userId: mockUserId,
                payload: { type: 'daily_mirror' },
                timestamp: new Date().toISOString(),
              },
            ]),
          );
        }
        return Promise.resolve(null);
      });

      await errorHandlingService.syncPendingOperations();

      // Should have attempted to sync notifications
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('pending_notifications');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('pending_notifications');
    });
  });

  describe('Cross-Service Error Recovery', () => {
    it('should maintain service when multiple services fail', async () => {
      const { enhancedWardrobeService } = require('@/services/enhancedWardrobeService');

      // Mock all services to fail initially
      enhancedWardrobeService.getUserWardrobe.mockRejectedValue(new Error('Wardrobe down'));
      global.fetch = jest.fn().mockRejectedValue(new Error('Weather API down'));

      // Mock some cached data
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key.includes('wardrobe')) {
          return Promise.resolve(
            JSON.stringify({
              items: [
                {
                  id: 'fallback-item',
                  userId: mockUserId,
                  category: 'tops',
                  colors: ['red'],
                  tags: ['emergency'],
                  usageStats: { averageRating: 3, totalWears: 1 },
                },
              ],
              cachedAt: new Date().toISOString(),
            }),
          );
        }
        return Promise.resolve(null);
      });

      // Should still provide some recommendations
      const result = await AynaMirrorService.generateDailyRecommendations(mockUserId);

      expect(result).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.weatherContext).toBeDefined();
    });

    it('should sync all pending operations when connectivity restored', async () => {
      // Mock various pending operations
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        switch (key) {
          case 'pending_feedback':
            return Promise.resolve(
              JSON.stringify([{ id: 'feedback-1', userId: mockUserId, rating: 5 }]),
            );
          case 'pending_notifications':
            return Promise.resolve(
              JSON.stringify([{ userId: mockUserId, payload: { type: 'daily_mirror' } }]),
            );
          case 'pending_wardrobe_updates':
            return Promise.resolve(
              JSON.stringify([{ id: 'update-1', userId: mockUserId, action: 'add' }]),
            );
          default:
            return Promise.resolve(null);
        }
      });

      await errorHandlingService.syncPendingOperations();

      // Should have attempted to sync all types
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('pending_feedback');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('pending_notifications');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('pending_wardrobe_updates');
    });

    it('should provide user-friendly error messages across services', () => {
      const networkError = new Error('Network timeout');

      const weatherMessage = errorHandlingService.getUserFriendlyErrorMessage(
        networkError,
        'weather',
      );
      const aiMessage = errorHandlingService.getUserFriendlyErrorMessage(networkError, 'ai');
      const notificationMessage = errorHandlingService.getUserFriendlyErrorMessage(
        networkError,
        'notification',
      );

      expect(weatherMessage).toContain('Weather service');
      expect(aiMessage).toContain('styling AI');
      expect(notificationMessage).toContain('Notifications');

      // All should be user-friendly and not technical
      expect(weatherMessage).not.toContain('timeout');
      expect(aiMessage).not.toContain('timeout');
      expect(notificationMessage).not.toContain('timeout');
    });
  });

  describe('Performance Under Error Conditions', () => {
    it('should not block user experience during retries', async () => {
      const { enhancedWardrobeService } = require('@/services/enhancedWardrobeService');

      // Mock slow failing service
      enhancedWardrobeService.getUserWardrobe.mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Slow failure')), 100)),
      );

      // Mock cached data available
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key.includes('recommendations')) {
          return Promise.resolve(
            JSON.stringify({
              id: 'fast-cache',
              userId: mockUserId,
              recommendations: [],
              generatedAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
              cachedAt: new Date().toISOString(),
            }),
          );
        }
        return Promise.resolve(null);
      });

      const startTime = Date.now();
      const result = await AynaMirrorService.generateDailyRecommendations(mockUserId);
      const endTime = Date.now();

      // Should return cached data quickly, not wait for retries
      expect(endTime - startTime).toBeLessThan(50); // Very fast with cache
      expect(result.id).toBe('fast-cache');
    });

    it('should limit error log storage to prevent memory issues', async () => {
      // Mock existing large error log
      const largeErrorLog = Array.from({ length: 150 }, (_, i) => ({
        service: 'test',
        operation: 'test',
        timestamp: new Date().toISOString(),
        errorMessage: `Error ${i}`,
      }));

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(largeErrorLog));

      const mockOperation = jest.fn().mockRejectedValue(new Error('New error'));

      try {
        await errorHandlingService.executeWithRetry(
          mockOperation,
          { service: 'test', operation: 'testOp' },
          { maxRetries: 0 },
        );
      } catch (error) {
        // Expected to fail
      }

      // Should have limited the log size
      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        (call) => call[0] === 'error_logs',
      );

      expect(setItemCall).toBeDefined();
      const savedLogs = JSON.parse(setItemCall[1]);
      expect(savedLogs.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Data Consistency During Errors', () => {
    it('should maintain data integrity when partial operations fail', async () => {
      const { enhancedWardrobeService } = require('@/services/enhancedWardrobeService');

      // Mock wardrobe service to succeed
      enhancedWardrobeService.getUserWardrobe.mockResolvedValue([
        {
          id: 'consistency-item',
          userId: mockUserId,
          category: 'tops',
          colors: ['purple'],
          tags: ['test'],
          usageStats: { averageRating: 4, totalWears: 2 },
        },
      ]);

      // Mock cache operations to partially fail
      (AsyncStorage.setItem as jest.Mock).mockImplementation((key, value) => {
        if (key.includes('recommendations')) {
          return Promise.reject(new Error('Cache write failed'));
        }
        return Promise.resolve();
      });

      // Should still complete the operation even if caching fails
      const result = await AynaMirrorService.generateDailyRecommendations(mockUserId);

      expect(result).toBeDefined();
      expect(result.recommendations).toBeDefined();
      // Should have attempted to cache wardrobe data (which succeeds)
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('wardrobe'),
        expect.any(String),
      );
    });
  });
});
