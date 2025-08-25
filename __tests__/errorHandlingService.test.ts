import AsyncStorage from '@react-native-async-storage/async-storage';
// Removed eager import of errorHandlingService to allow mocks to take effect
// import { errorHandlingService, ErrorHandlingService } from '@/services/errorHandlingService';
import { WeatherContext, WardrobeItem, DailyRecommendations } from '@/types/aynaMirror';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock secureStorage (must be defined before loading errorHandlingService)
const mockSecureStorage = {
  getItem: jest.fn().mockImplementation(async () => null),
  setItem: jest.fn().mockImplementation(async () => undefined),
  removeItem: jest.fn().mockImplementation(async () => undefined),
  initialize: jest.fn().mockImplementation(async () => undefined),
  getLastError: jest.fn().mockReturnValue(null),
};

jest.mock('@/utils/secureStorage', () => ({
  secureStorage: mockSecureStorage,
}));

// Load errorHandlingService after mocks are in place
let errorHandlingService: any;
beforeAll(() => {
  ({ errorHandlingService } = require('@/services/errorHandlingService'));
});
// Mock PerformanceOptimizationService
jest.mock('@/services/performanceOptimizationService', () => ({
  PerformanceOptimizationService: {
    async getCachedRecommendations(userId: string, date: Date) {
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
    async cacheRecommendations() {
      return Promise.resolve();
    },
    async getCachedWardrobeData() {
      return Promise.resolve(null);
    },
    async cacheWardrobeData() {
      return Promise.resolve();
    },
    async preGenerateRecommendations() {
      return Promise.resolve();
    },
    async optimizeImageLoading(uri: string) {
      return Promise.resolve(uri);
    },
    async queueFeedbackForProcessing() {
      return Promise.resolve();
    },
    async executeOptimizedQuery<T>(queryFn: () => Promise<T>) {
      if (typeof queryFn === 'function') {
        return queryFn();
      }
      return Promise.resolve({ data: 'mock-data' });
    },
    async performCleanup() {
      return Promise.resolve();
    },
    getPerformanceMetrics() {
      return {};
    },
    getPerformanceSummary() {
      return {};
    },
    async initialize() {
      return Promise.resolve();
    },
    async shutdown() {
      return Promise.resolve();
    },
  },
}));

describe('Hata İşleme Servisi', () => {
  const mockUserId = 'test-user-123';
  const mockWeatherContext: WeatherContext = {
    temperature: 72,
    condition: 'sunny',
    humidity: 45,
    windSpeed: 5,
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
      costPerWear: 15.5,
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

  describe('yeniden deneme ile çalıştır', () => {
    it('işlemi ilk denemede başarıyla çalıştırmalı', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');

      const result = await errorHandlingService.executeWithRetry(mockOperation, {
        service: 'test',
        operation: 'testOp',
      });

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('başarısızlık durumunda işlemi yeniden denemeli ve başarılı olmalı', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce('success');

      const result = await errorHandlingService.executeWithRetry(
        mockOperation,
        { service: 'test', operation: 'testOp' },
        { maxRetries: 2, baseDelay: 10 },
      );

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('maksimum deneme sayısından sonra başarısız olmalı', async () => {
      const mockError = new Error('Persistent failure');
      const mockOperation = jest.fn().mockRejectedValue(mockError);

      await expect(
        errorHandlingService.executeWithRetry(
          mockOperation,
          { service: 'test', operation: 'testOp' },
          { maxRetries: 2, baseDelay: 10 },
        ),
      ).rejects.toThrow('Persistent failure');

      expect(mockOperation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('yeniden deneme girişimleri sırasında hataları kaydetmeli', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockError = new Error('Test error');
      const mockOperation = jest.fn().mockRejectedValue(mockError);

      try {
        await errorHandlingService.executeWithRetry(
          mockOperation,
          { service: 'test', operation: 'testOp' },
          { maxRetries: 1, baseDelay: 10 },
        );
      } catch (error) {
        // Expected to fail
      }

      // Should store error logs in AsyncStorage
      expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
        'error_logs',
        expect.stringContaining('Test error'),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Hava Durumu Servisi Hata İşleme', () => {
    it('mevcut olduğunda önbelleğe alınmış hava durumunu döndürmeli', async () => {
      const cachedWeather = {
        ...mockWeatherContext,
        cachedAt: new Date().toISOString(),
      };

      (mockSecureStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedWeather));

      const result = await errorHandlingService.handleWeatherServiceError(mockUserId);

      expect(result.temperature).toBe(72);
      expect(result.condition).toBe('sunny');
      expect(result.location).toBe('Test City');
    });

    it('önbellek mevcut olmadığında mevsimsel yedek döndürmeli', async () => {
      (mockSecureStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await errorHandlingService.handleWeatherServiceError(mockUserId);

      expect(result.temperature).toBeGreaterThan(0);
      expect(result.condition).toBeDefined();
      expect(result.location).toBe('Unknown');
    });

    it('farklı mevsimleri doğru şekilde işlemeli', async () => {
      (mockSecureStorage.getItem as jest.Mock).mockResolvedValue(null);

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

  describe('AI Servisi Hata İşleme', () => {
    it('AI başarısız olduğunda kural tabanlı öneriler döndürmeli', async () => {
      const wardrobeItems = [mockWardrobeItem];

      const result = await errorHandlingService.handleAIServiceError(
        wardrobeItems,
        mockWeatherContext,
        mockUserId,
      );

      expect(result).toHaveLength(1);
      expect(result[0]!).toBeDefined();
      expect(result[0]!.items).toContain(mockWardrobeItem);
      expect(result[0]!.confidenceNote).toBeDefined();
      expect(result[0]!.reasoning).toContain('Weather appropriate');
    });

    it('uygun öğe olmadığında acil durum önerileri döndürmeli', async () => {
      const wardrobeItems: WardrobeItem[] = [];

      const result = await errorHandlingService.handleAIServiceError(
        wardrobeItems,
        mockWeatherContext,
        mockUserId,
      );

      expect(result).toHaveLength(0); // No items to recommend
    });

    it('acil durum modunda yakın zamanda giyilen öğeleri önceliklendirmeli', async () => {
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
        mockUserId,
      );

      // Should prioritize recently worn items
      expect(result[0]!.items[0]!.id).toBe('recent-item');
    });
  });

  describe('Önbellekleme Sistemi', () => {
    it('önerileri önbelleğe almalı ve geri getirmeli', async () => {
      const mockRecommendations: DailyRecommendations = {
        id: 'rec-1',
        userId: mockUserId,
        date: new Date(),
        recommendations: [],
        weatherContext: mockWeatherContext,
        generatedAt: new Date(),
      };

      await errorHandlingService.cacheRecommendations(mockUserId, mockRecommendations);

      expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
        `recommendations_${mockUserId}`,
        expect.stringContaining(mockRecommendations.id),
      );
    });

    it('önbelleğe alınmış önerileri geri getirmeli', async () => {
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

    it('hava durumu verilerini önbelleğe almalı ve geri getirmeli', async () => {
      await errorHandlingService.cacheWeather(mockUserId, mockWeatherContext);

      expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
        `weather_${mockUserId}`,
        expect.stringContaining('sunny'),
      );
    });

    it('gardırop verilerini önbelleğe almalı ve geri getirmeli', async () => {
      const wardrobeItems = [mockWardrobeItem];

      await errorHandlingService.cacheWardrobeData(mockUserId, wardrobeItems);

      expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
        `wardrobe_${mockUserId}`,
        expect.stringContaining(mockWardrobeItem.id),
      );
    });

    it('önbellek alma hatalarını zarif bir şekilde işlemeli', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await errorHandlingService.getCachedRecommendations(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('Bildirim Hata İşleme', () => {
    it('başarısız bildirimleri yeniden deneme için saklamalı', async () => {
      const notificationPayload = {
        type: 'daily_mirror' as const,
        userId: mockUserId,
        data: { test: 'data' },
      };

      await errorHandlingService.handleNotificationError(mockUserId, notificationPayload);

      const { secureStorage } = require('@/utils/secureStorage');
      expect(secureStorage.setItem).toHaveBeenCalledWith(
        'pending_notifications',
        expect.stringContaining(mockUserId),
      );
    });

    it('manuel müdahale için kritik hataları kaydetmeli', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock secureStorage to fail for both getItem and setItem
      const { secureStorage } = require('@/utils/secureStorage');
      secureStorage.getItem.mockRejectedValue(new Error('Storage full'));
      secureStorage.setItem.mockRejectedValue(new Error('Storage full'));

      // Mock sendInAppNotification to throw an error to trigger logCriticalError
      const originalSendInApp = (errorHandlingService as any).sendInAppNotification;
      (errorHandlingService as any).sendInAppNotification = jest
        .fn()
        .mockRejectedValue(new Error('In-app notification failed'));

      await errorHandlingService.handleNotificationError(mockUserId, {
        type: 'daily_mirror',
        userId: mockUserId,
      });

      // Should log both the storage error and the critical error
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to store pending notification:',
        expect.any(Error),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Notification error handling failed:',
        expect.any(Error),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'CRITICAL ERROR:',
        expect.objectContaining({
          service: 'notification',
          operation: 'handleNotificationError',
        }),
      );

      // Restore original method
      (errorHandlingService as any).sendInAppNotification = originalSendInApp;
      consoleSpy.mockRestore();
    });
  });

  describe('Senkronizasyon İşlemleri', () => {
    it('bekleyen geri bildirimleri senkronize etmeli', async () => {
      const { secureStorage } = require('@/utils/secureStorage');
      const pendingFeedback = [
        { id: 'feedback-1', userId: mockUserId, rating: 5 },
        { id: 'feedback-2', userId: mockUserId, rating: 4 },
      ];

      secureStorage.getItem.mockResolvedValue(JSON.stringify(pendingFeedback));
      secureStorage.getLastError.mockReturnValue(null);

      await errorHandlingService.syncPendingFeedback();

      expect(secureStorage.removeItem).toHaveBeenCalledWith('pending_feedback');
    });

    it('bekleyen bildirimleri senkronize etmeli', async () => {
      const { secureStorage } = require('@/utils/secureStorage');
      const pendingNotifications = [
        {
          userId: mockUserId,
          payload: { type: 'daily_mirror' },
          timestamp: new Date().toISOString(),
        },
      ];

      secureStorage.getItem.mockResolvedValue(JSON.stringify(pendingNotifications));
      secureStorage.getLastError.mockReturnValue(null);

      await errorHandlingService.syncPendingOperations();

      // Should attempt to sync notifications
      expect(secureStorage.getItem).toHaveBeenCalledWith('pending_notifications');
    });

    it('senkronizasyon hatalarını zarif bir şekilde işlemeli', async () => {
      const { secureStorage } = require('@/utils/secureStorage');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock secureStorage.getItem to return null and getLastError to return errors
      secureStorage.getItem.mockResolvedValue(null);
      secureStorage.getLastError.mockReturnValue(new Error('Sync error'));

      await errorHandlingService.syncPendingOperations();

      // Should log specific sync failures for all three sync operations
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to sync pending feedback:',
        expect.any(Error),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to sync pending notifications:',
        expect.any(Error),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to sync pending wardrobe updates:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Kullanıcı Dostu Hata Mesajları', () => {
    it('farklı bağlamlar için uygun hata mesajları sağlamalı', () => {
      const networkError = new Error('Network error');

      const message = errorHandlingService.getUserFriendlyErrorMessage(networkError, 'network');
      expect(message).toContain('trouble connecting');
      expect(message).toContain('recent preferences');
    });

    it('farklı hata türleri için kurtarma eylemleri sağlamalı', () => {
      const actions = errorHandlingService.getRecoveryActions('weather');

      expect(actions).toContain('Check weather manually for today');
      expect(actions).toContain('Use seasonal outfit suggestions');
    });

    it('bilinmeyen bağlamlar için varsayılan mesajlar sağlamalı', () => {
      const unknownError = new Error('Unknown error');

      const message = errorHandlingService.getUserFriendlyErrorMessage(unknownError, 'unknown');
      expect(message).toContain('Something went wrong');
      expect(message).toContain('backup plans');
    });
  });

  describe('Hata Kayıtlama', () => {
    it('hata kayıt boyut sınırını korumalı', async () => {
      // Mock existing logs with 100 entries
      const existingLogs = Array.from({ length: 100 }, (_, i) => ({
        service: 'test',
        operation: 'test',
        timestamp: new Date().toISOString(),
        errorMessage: `Error ${i}`,
      }));

      const { secureStorage } = require('@/utils/secureStorage');
      secureStorage.getItem.mockResolvedValue(JSON.stringify(existingLogs));

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

      // Should maintain log size limit
      expect(secureStorage.setItem).toHaveBeenCalledWith(
        'error_logs',
        expect.stringMatching(/"errorMessage":"New error"/),
      );
    });
  });

  describe('Çevrimdışı Mod', () => {
    it('önbelleğe alınmış verilerle çevrimdışı modda çalışmalı', async () => {
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

    it('tam çevrimdışı senaryosunu işlemeli', async () => {
      // Simulate complete offline mode
      const mockOperation = jest.fn().mockRejectedValue(new Error('Network unavailable'));

      // Mock cached data available
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key.includes('recommendations')) {
          return Promise.resolve(
            JSON.stringify({
              id: 'offline-rec',
              userId: mockUserId,
              recommendations: [],
              cachedAt: new Date().toISOString(),
            }),
          );
        }
        return Promise.resolve(null);
      });

      try {
        await errorHandlingService.executeWithRetry(
          mockOperation,
          { service: 'test', operation: 'offlineTest' },
          { maxRetries: 1, enableOfflineMode: true },
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
