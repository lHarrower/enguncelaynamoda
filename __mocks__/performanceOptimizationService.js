// Mock for PerformanceOptimizationService
const mockRecommendations = {
  userId: 'test-user-123',
  date: '2024-01-15',
  recommendations: [
    {
      id: 'rec-1',
      type: 'outfit',
      items: ['item-1', 'item-2'],
      confidence: 0.9,
      reasoning: "Perfect for today's weather",
    },
  ],
  weather: {
    temperature: 22,
    condition: 'sunny',
    humidity: 60,
  },
  generatedAt: new Date().toISOString(),
};

const mockWardrobeData = {
  items: [
    {
      id: 'item-1',
      name: 'Blue Shirt',
      category: 'tops',
      color: 'blue',
      season: 'all',
    },
    {
      id: 'item-2',
      name: 'Black Pants',
      category: 'bottoms',
      color: 'black',
      season: 'all',
    },
  ],
  lastUpdated: new Date().toISOString(),
};

const mockPerformanceMetrics = {
  recommendationGenerationTime: [150, 200, 180],
  imageProcessingTime: [50, 75, 60],
  databaseQueryTime: [10, 15, 12],
  cacheHitRate: 0.85,
  errorRate: 0.02,
  lastUpdated: Date.now(),
};

export const PerformanceOptimizationService = {
  // Cache management
  async cacheRecommendations(userId, recommendations) {
    return Promise.resolve();
  },

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

  async cacheWardrobeData(userId, wardrobeData) {
    return Promise.resolve();
  },

  async getCachedWardrobeData(userId) {
    return Promise.resolve(mockWardrobeData);
  },

  // Pre-generation
  async preGenerateRecommendations(userId) {
    return Promise.resolve();
  },

  // Image optimization
  async optimizeImageLoading(imageUri) {
    return Promise.resolve(imageUri);
  },

  // Background processing
  async queueFeedbackForProcessing(feedback) {
    return Promise.resolve();
  },

  async restoreFeedbackQueue() {
    return Promise.resolve();
  },

  // Database optimization
  async executeOptimizedQuery(queryFn, cacheKey, cacheDuration) {
    if (typeof queryFn === 'function') {
      return queryFn();
    }
    return Promise.resolve({ data: 'mock-data' });
  },

  // Cleanup
  async performCleanup() {
    return Promise.resolve();
  },

  // Performance monitoring
  getPerformanceMetrics() {
    return mockPerformanceMetrics;
  },

  getPerformanceSummary() {
    return {
      avgRecommendationTime: 176.67,
      avgImageProcessingTime: 61.67,
      avgDatabaseQueryTime: 12.33,
      cacheHitRate: 0.85,
      errorRate: 0.02,
      totalOperations: 100,
      lastUpdated: Date.now(),
    };
  },

  async loadPerformanceMetrics() {
    return Promise.resolve();
  },

  async savePerformanceMetrics() {
    return Promise.resolve();
  },

  // Lifecycle
  async initialize() {
    return Promise.resolve();
  },

  async shutdown() {
    return Promise.resolve();
  },

  // Private method mocks (for testing)
  recordPerformanceMetric(type, value) {
    // Mock implementation
  },

  recordCacheHit() {
    // Mock implementation
  },

  recordCacheMiss() {
    // Mock implementation
  },

  schedulePeriodicCleanup() {
    // Mock implementation
  },
};

// Default export for CommonJS compatibility
module.exports = { PerformanceOptimizationService };
