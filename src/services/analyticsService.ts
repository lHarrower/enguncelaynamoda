/**
 * Analytics Service
 * Handles user interaction tracking and analytics data collection
 */

import { logger } from '@/lib/logger';

interface SwipeAnalytics {
  itemId: string;
  brand: string;
  product: string;
  direction: 'left' | 'right';
  timestamp: string;
  price: string;
}

interface UserPreference {
  brands: string[];
  priceRanges: string[];
  categories: string[];
  likedItems: string[];
  dislikedItems: string[];
}

class AnalyticsService {
  private preferences: UserPreference = {
    brands: [],
    priceRanges: [],
    categories: [],
    likedItems: [],
    dislikedItems: [],
  };

  /**
   * Track user swipe interactions
   */
  trackSwipe(swipeData: SwipeAnalytics): void {
    try {
      // Store swipe data locally for now
      const existingData = this.getStoredSwipes();
      existingData.push(swipeData);

      // In a real app, this would be stored in AsyncStorage or sent to analytics service
      logger.info('analytics_swipe_tracked', swipeData);

      // Update user preferences based on swipe
      this.updatePreferences(swipeData);

      // Future: Send to analytics service (Firebase, Mixpanel, etc.)
      // this.sendToAnalyticsService(swipeData);
    } catch (error) {
      logger.error('analytics_track_swipe_failed', error);
    }
  }

  /**
   * Update user preferences based on swipe behavior
   */
  private updatePreferences(swipeData: SwipeAnalytics): void {
    const { direction, brand, itemId, price } = swipeData;

    if (direction === 'right') {
      // User liked the item
      if (!this.preferences.likedItems.includes(itemId)) {
        this.preferences.likedItems.push(itemId);
      }
      if (!this.preferences.brands.includes(brand)) {
        this.preferences.brands.push(brand);
      }
      if (!this.preferences.priceRanges.includes(price)) {
        this.preferences.priceRanges.push(price);
      }
    } else {
      // User disliked the item
      if (!this.preferences.dislikedItems.includes(itemId)) {
        this.preferences.dislikedItems.push(itemId);
      }
    }

    logger.info('analytics_preferences_updated', this.preferences);
  }

  /**
   * Get user preferences for recommendation engine
   */
  getUserPreferences(): UserPreference {
    return { ...this.preferences };
  }

  /**
   * Get stored swipe data (mock implementation)
   */
  private getStoredSwipes(): SwipeAnalytics[] {
    // In a real app, this would read from AsyncStorage
    return [];
  }

  /**
   * Track general events
   */
  trackEvent(eventName: string, properties: Record<string, unknown> = {}): void {
    try {
      const eventData = {
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
        userId: 'current_user', // In real app, get from auth service
      } as const;

      logger.info('analytics_event_tracked', eventData);

      // Future: Send to analytics service
      // this.sendEventToAnalyticsService(eventData);
    } catch (error) {
      logger.error('analytics_track_event_failed', error);
    }
  }

  /**
   * Track screen views
   */
  trackScreenView(screenName: string, properties: Record<string, unknown> = {}): void {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Future: Send data to external analytics service
   */
  private async sendToAnalyticsService(data: unknown): Promise<void> {
    // Implementation for Firebase Analytics, Mixpanel, etc.
    // await analytics().logEvent('user_swipe', data);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
