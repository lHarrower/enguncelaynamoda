import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyRecommendations, OutfitRecommendation, WeatherContext, WardrobeItem } from '@/types/aynaMirror';
import { PerformanceOptimizationService } from '@/services/performanceOptimizationService';

export interface ErrorRecoveryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  enableOfflineMode: boolean;
}

export interface CacheConfig {
  recommendationsTTL: number; // Time to live in milliseconds
  weatherTTL: number;
  wardrobeTTL: number;
}

export interface ErrorContext {
  service: string;
  operation: string;
  userId?: string;
  timestamp: Date;
  error: Error;
  retryCount: number;
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private readonly defaultOptions: ErrorRecoveryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    enableOfflineMode: true,
  };

  private readonly cacheConfig: CacheConfig = {
    recommendationsTTL: 24 * 60 * 60 * 1000, // 24 hours
    weatherTTL: 2 * 60 * 60 * 1000, // 2 hours
    wardrobeTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  private constructor() {}

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Execute operation with retry logic and exponential backoff
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: Omit<ErrorContext, 'timestamp' | 'error' | 'retryCount'>,
    options: Partial<ErrorRecoveryOptions> = {}
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    let lastError: Error;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        const errorContext: ErrorContext = {
          ...context,
          timestamp: new Date(),
          error: lastError,
          retryCount: attempt,
        };

        // Log error for monitoring
        await this.logError(errorContext);

        // Don't retry on final attempt
        if (attempt === config.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          config.maxDelay
        );

        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Handle weather service errors with cached fallback
   */
  async handleWeatherServiceError(userId: string, location?: string): Promise<WeatherContext> {
    try {
      // Try to get cached weather data
      const cachedWeather = await this.getCachedWeather(userId);
      if (cachedWeather && this.isCacheValid(cachedWeather.timestamp, this.cacheConfig.weatherTTL)) {
        return cachedWeather;
      }

      // Fallback to general seasonal recommendations
      return this.getSeasonalWeatherFallback(location);
    } catch (error) {
      console.warn('Weather service fallback failed:', error);
      return this.getDefaultWeatherContext();
    }
  }

  /**
   * Handle AI service errors with rule-based fallback
   */
  async handleAIServiceError(
    wardrobeItems: WardrobeItem[],
    weatherContext: WeatherContext,
    userId: string
  ): Promise<OutfitRecommendation[]> {
    try {
      // Try cached recommendations first
      const cachedRecommendations = await this.getCachedRecommendations(userId);
      if (cachedRecommendations && this.isCacheValid(cachedRecommendations.generatedAt, this.cacheConfig.recommendationsTTL)) {
        return cachedRecommendations.recommendations;
      }

      // Fallback to rule-based recommendations
      return this.generateRuleBasedRecommendations(wardrobeItems, weatherContext);
    } catch (error) {
      console.warn('AI service fallback failed:', error);
      return this.getEmergencyRecommendations(wardrobeItems);
    }
  }

  /**
   * Handle notification service errors
   */
  async handleNotificationError(userId: string, notificationPayload: any): Promise<void> {
    try {
      // Store failed notification for retry
      await this.storePendingNotification(userId, notificationPayload);
      
      // Try alternative notification method (in-app notification)
      await this.sendInAppNotification(userId, notificationPayload);
    } catch (error) {
      console.error('Notification error handling failed:', error);
      // Log for manual intervention
      await this.logCriticalError({
        service: 'notification',
        operation: 'handleNotificationError',
        userId,
        timestamp: new Date(),
        error: error as Error,
        retryCount: 0,
      });
    }
  }

  /**
   * Cache management methods
   */
  async cacheRecommendations(userId: string, recommendations: DailyRecommendations): Promise<void> {
    try {
      const cacheKey = `recommendations_${userId}`;
      const cacheData = {
        ...recommendations,
        cachedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache recommendations:', error);
    }
  }

  async getCachedRecommendations(userId: string): Promise<DailyRecommendations | null> {
    try {
      // Use performance optimization service for caching
      return await PerformanceOptimizationService.getCachedRecommendations(userId);
    } catch (error) {
      console.warn('Failed to get cached recommendations:', error);
      return null;
    }
  }

  async cacheWeather(userId: string, weather: WeatherContext): Promise<void> {
    try {
      const cacheKey = `weather_${userId}`;
      const cacheData = {
        ...weather,
        cachedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache weather:', error);
    }
  }

  async getCachedWeather(userId: string): Promise<WeatherContext | null> {
    try {
      const cacheKey = `weather_${userId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to get cached weather:', error);
      return null;
    }
  }

  async cacheWardrobeData(userId: string, wardrobeItems: WardrobeItem[]): Promise<void> {
    try {
      const cacheKey = `wardrobe_${userId}`;
      const cacheData = {
        items: wardrobeItems,
        cachedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache wardrobe data:', error);
    }
  }

  async getCachedWardrobeData(userId: string): Promise<WardrobeItem[] | null> {
    try {
      const cacheKey = `wardrobe_${userId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        return data.items || null;
      }
      return null;
    } catch (error) {
      console.warn('Failed to get cached wardrobe data:', error);
      return null;
    }
  }

  /**
   * Sync pending operations when connection is restored
   */
  async syncPendingOperations(): Promise<void> {
    try {
      await Promise.all([
        this.syncPendingFeedback(),
        this.syncPendingNotifications(),
        this.syncPendingWardrobeUpdates(),
      ]);
    } catch (error) {
      console.error('Failed to sync pending operations:', error);
    }
  }

  async syncPendingFeedback(): Promise<void> {
    try {
      const pendingFeedback = await AsyncStorage.getItem('pending_feedback');
      if (pendingFeedback) {
        const feedbackItems = JSON.parse(pendingFeedback);
        // Process each feedback item
        for (const feedback of feedbackItems) {
          try {
            // This would call the actual feedback service
            // await feedbackService.submitFeedback(feedback);
            console.log('Synced feedback:', feedback.id);
          } catch (error) {
            console.warn('Failed to sync feedback item:', feedback.id, error);
          }
        }
        // Clear synced feedback
        await AsyncStorage.removeItem('pending_feedback');
      }
    } catch (error) {
      console.error('Failed to sync pending feedback:', error);
    }
  }

  /**
   * User-friendly error messages
   */
  getUserFriendlyErrorMessage(error: Error, context: string): string {
    const errorMessages: Record<string, string> = {
      network: "We're having trouble connecting. Your AYNA Mirror will use your recent preferences to create recommendations.",
      weather: "Weather service is temporarily unavailable. We'll use seasonal patterns to suggest appropriate outfits.",
      ai: "Our styling AI is taking a quick break. We've prepared some classic combinations based on your wardrobe.",
      notification: "Notifications are having issues, but your daily recommendations are ready in the app.",
      storage: "We're having trouble saving your preferences right now, but everything will sync when connection improves.",
    };

    return errorMessages[context] || "Something went wrong, but we've got backup plans to keep your style game strong.";
  }

  getRecoveryActions(context: string): string[] {
    const recoveryActions: Record<string, string[]> = {
      network: [
        "Check your internet connection",
        "Try again in a few moments",
        "Use offline mode for basic features"
      ],
      weather: [
        "Check weather manually for today",
        "Use seasonal outfit suggestions",
        "Try refreshing in a few minutes"
      ],
      ai: [
        "Browse your wardrobe manually",
        "Use quick outfit combinations",
        "Check back later for AI recommendations"
      ],
      notification: [
        "Open the app to see your recommendations",
        "Check notification settings",
        "Set a manual reminder"
      ],
    };

    return recoveryActions[context] || ["Try again later", "Contact support if the issue persists"];
  }

  /**
   * Private helper methods
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isCacheValid(timestamp: Date | string, ttl: number): boolean {
    const cacheTime = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return Date.now() - cacheTime.getTime() < ttl;
  }

  private async logError(context: ErrorContext): Promise<void> {
    try {
      const errorLog = {
        ...context,
        timestamp: context.timestamp.toISOString(),
        errorMessage: context.error.message,
        errorStack: context.error.stack,
      };
      
      // Store locally for later sync
      const existingLogs = await AsyncStorage.getItem('error_logs') || '[]';
      const logs = JSON.parse(existingLogs);
      logs.push(errorLog);
      
      // Keep only last 100 error logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      await AsyncStorage.setItem('error_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log error:', error);
    }
  }

  private async logCriticalError(context: ErrorContext): Promise<void> {
    await this.logError(context);
    // In a real app, this would also send to crash reporting service
    console.error('CRITICAL ERROR:', context);
  }

  private getSeasonalWeatherFallback(location?: string): WeatherContext {
    const now = new Date();
    const month = now.getMonth();
    
    // Simple seasonal logic
    let temperature = 20; // Default moderate temperature
    let condition: WeatherContext['condition'] = 'cloudy';
    
    if (month >= 11 || month <= 1) { // Winter
      temperature = 5;
      condition = 'cloudy';
    } else if (month >= 2 && month <= 4) { // Spring
      temperature = 15;
      condition = 'sunny';
    } else if (month >= 5 && month <= 7) { // Summer
      temperature = 25;
      condition = 'sunny';
    } else { // Fall
      temperature = 12;
      condition = 'cloudy';
    }

    return {
      temperature,
      condition,
      humidity: 50,
      location: location || 'Unknown',
      timestamp: now,
    };
  }

  private getDefaultWeatherContext(): WeatherContext {
    return {
      temperature: 20,
      condition: 'cloudy',
      humidity: 50,
      location: 'Unknown',
      timestamp: new Date(),
    };
  }

  private generateRuleBasedRecommendations(
    wardrobeItems: WardrobeItem[],
    weatherContext: WeatherContext
  ): OutfitRecommendation[] {
    // Simple rule-based recommendation logic
    const recommendations: OutfitRecommendation[] = [];
    
    // Filter items by weather appropriateness
    const appropriateItems = wardrobeItems.filter(item => {
      if (weatherContext.temperature < 10) {
        return item.category !== 'shorts' && item.category !== 'tank-top';
      } else if (weatherContext.temperature > 25) {
        return item.category !== 'coat' && item.category !== 'sweater';
      }
      return true;
    });

    // Create basic combinations
    const tops = appropriateItems.filter(item => ['shirt', 'blouse', 'sweater'].includes(item.category));
    const bottoms = appropriateItems.filter(item => ['pants', 'skirt', 'shorts'].includes(item.category));
    
    for (let i = 0; i < Math.min(3, tops.length); i++) {
      const top = tops[i];
      const bottom = bottoms[i % bottoms.length];
      
      if (top && bottom) {
        recommendations.push({
          id: `rule_${i}`,
          items: [top, bottom],
          confidenceNote: "A classic combination that always works well together.",
          quickActions: ['wear', 'save', 'share'],
          confidenceScore: 0.7,
          reasoning: ['Weather appropriate', 'Classic combination'],
          isQuickOption: i === 0,
        });
      }
    }

    return recommendations;
  }

  private getEmergencyRecommendations(wardrobeItems: WardrobeItem[]): OutfitRecommendation[] {
    // Return the most recently worn items as emergency recommendations
    const recentItems = wardrobeItems
      .filter(item => item.lastWorn)
      .sort((a, b) => new Date(b.lastWorn!).getTime() - new Date(a.lastWorn!).getTime())
      .slice(0, 3);

    return recentItems.map((item, index) => ({
      id: `emergency_${index}`,
      items: [item],
      confidenceNote: "One of your recent favorites - you know it works!",
      quickActions: ['wear', 'save'],
      confidenceScore: 0.6,
      reasoning: ['Recently worn', 'Proven choice'],
      isQuickOption: index === 0,
    }));
  }

  private async storePendingNotification(userId: string, payload: any): Promise<void> {
    try {
      const pendingKey = 'pending_notifications';
      const existing = await AsyncStorage.getItem(pendingKey) || '[]';
      const notifications = JSON.parse(existing);
      
      notifications.push({
        userId,
        payload,
        timestamp: new Date().toISOString(),
      });
      
      await AsyncStorage.setItem(pendingKey, JSON.stringify(notifications));
    } catch (error) {
      console.warn('Failed to store pending notification:', error);
    }
  }

  private async sendInAppNotification(userId: string, payload: any): Promise<void> {
    // This would integrate with an in-app notification system
    console.log('In-app notification for user:', userId, payload);
  }

  private async syncPendingNotifications(): Promise<void> {
    try {
      const pendingNotifications = await AsyncStorage.getItem('pending_notifications');
      if (pendingNotifications) {
        const notifications = JSON.parse(pendingNotifications);
        // Process notifications
        for (const notification of notifications) {
          try {
            // Retry sending notification
            console.log('Retrying notification:', notification.userId);
          } catch (error) {
            console.warn('Failed to retry notification:', error);
          }
        }
        await AsyncStorage.removeItem('pending_notifications');
      }
    } catch (error) {
      console.error('Failed to sync pending notifications:', error);
    }
  }

  private async syncPendingWardrobeUpdates(): Promise<void> {
    try {
      const pendingUpdates = await AsyncStorage.getItem('pending_wardrobe_updates');
      if (pendingUpdates) {
        const updates = JSON.parse(pendingUpdates);
        // Process wardrobe updates
        for (const update of updates) {
          try {
            console.log('Syncing wardrobe update:', update.id);
          } catch (error) {
            console.warn('Failed to sync wardrobe update:', error);
          }
        }
        await AsyncStorage.removeItem('pending_wardrobe_updates');
      }
    } catch (error) {
      console.error('Failed to sync pending wardrobe updates:', error);
    }
  }
}

export const errorHandlingService = ErrorHandlingService.getInstance();