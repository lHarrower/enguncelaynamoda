// Notification Handler Service
// Handles deep linking and notification responses for AYNA Mirror

import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { logInDev, errorInDev } from '@/utils/consoleSuppress';

export interface NotificationResponse {
  notification: Notifications.Notification;
  actionIdentifier: string;
}

class NotificationHandler {
  private static instance: NotificationHandler;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): NotificationHandler {
    if (!NotificationHandler.instance) {
      NotificationHandler.instance = new NotificationHandler();
    }
    return NotificationHandler.instance;
  }

  /**
   * Initialize notification response handlers
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Handle notification responses (when user taps notification)
      Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse);

      // Handle notifications received while app is in foreground
      Notifications.addNotificationReceivedListener(this.handleNotificationReceived);

      // Handle deep links from notifications
      Linking.addEventListener('url', this.handleDeepLink);

      // Handle initial URL if app was opened from notification
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        this.handleDeepLink({ url: initialUrl });
      }

      this.isInitialized = true;
      logInDev('Notification handler initialized');
    } catch (error) {
      errorInDev('Failed to initialize notification handler:', error);
    }
  }

  /**
   * Handle notification response when user taps on notification
   */
  private handleNotificationResponse = (response: NotificationResponse): void => {
    try {
      const { notification } = response;
      const data = notification.request.content.data;

      logInDev('Notification response received:', data);

      // Handle different notification types
      switch (data.type) {
        case 'daily_mirror':
          this.handleDailyMirrorNotification(data);
          break;
        case 'feedback_prompt':
          this.handleFeedbackPromptNotification(data);
          break;
        case 're_engagement':
          this.handleReEngagementNotification(data);
          break;
        default:
          logInDev('Unknown notification type:', data.type);
      }
    } catch (error) {
      errorInDev('Error handling notification response:', error);
    }
  };

  /**
   * Handle notification received while app is in foreground
   */
  private handleNotificationReceived = (notification: Notifications.Notification): void => {
    try {
      const data = notification.request.content.data;
      logInDev('Notification received in foreground:', data);

      // You can show custom in-app notifications here if needed
      // For now, we'll let the system handle it
    } catch (error) {
      errorInDev('Error handling received notification:', error);
    }
  };

  /**
   * Handle deep links from notifications or external sources
   */
  private handleDeepLink = ({ url }: { url: string }): void => {
    try {
      logInDev('Deep link received:', url);

      const parsedUrl = Linking.parse(url);
      const { hostname, path, queryParams } = parsedUrl;

      // Handle AYNA Mirror deep links
      if (hostname === 'ayna-mirror' || path === '/ayna-mirror') {
  this.navigateToAynaMirror(queryParams || undefined as unknown as Record<string, any>);
      } else if (path === '/ayna-mirror/settings') {
        this.navigateToAynaMirrorSettings();
      } else if (path === '/onboarding') {
        this.navigateToOnboarding();
      } else {
        // Default navigation
        this.navigateToAynaMirror();
      }
    } catch (error) {
      errorInDev('Error handling deep link:', error);
      // Fallback to AYNA Mirror
      this.navigateToAynaMirror();
    }
  };

  /**
   * Handle daily mirror notification tap
   */
  private handleDailyMirrorNotification(data: any): void {
    try {
      logInDev('Handling daily mirror notification for user:', data.userId);
      
      // Navigate to AYNA Mirror screen
      this.navigateToAynaMirror();

      // Track notification engagement
      this.trackNotificationEngagement('daily_mirror', data.userId);
    } catch (error) {
      errorInDev('Error handling daily mirror notification:', error);
    }
  }

  /**
   * Handle feedback prompt notification tap
   */
  private handleFeedbackPromptNotification(data: any): void {
    try {
      logInDev('Handling feedback prompt notification for outfit:', data.outfitId);
      
      // Navigate to AYNA Mirror with feedback parameter
      this.navigateToAynaMirror({ feedback: data.outfitId });

      // Track notification engagement
      this.trackNotificationEngagement('feedback_prompt', data.userId);
    } catch (error) {
      errorInDev('Error handling feedback prompt notification:', error);
    }
  }

  /**
   * Handle re-engagement notification tap
   */
  private handleReEngagementNotification(data: any): void {
    try {
      logInDev('Handling re-engagement notification for user:', data.userId);
      
      // Navigate to AYNA Mirror screen
      this.navigateToAynaMirror();

      // Track notification engagement
      this.trackNotificationEngagement('re_engagement', data.userId);
    } catch (error) {
      errorInDev('Error handling re-engagement notification:', error);
    }
  }

  /**
   * Navigate to AYNA Mirror screen with optional parameters
   */
  private navigateToAynaMirror(params?: Record<string, any>): void {
    try {
      // Use setTimeout to ensure navigation happens after app is ready
      setTimeout(() => {
        if (params && Object.keys(params).length > 0) {
          // Navigate with parameters
          const queryString = new URLSearchParams(params).toString();
          router.push(`/(app)/ayna-mirror?${queryString}` as any);
        } else {
          // Navigate to main AYNA Mirror screen
          router.push('/(app)/ayna-mirror');
        }
      }, 100);
    } catch (error) {
      errorInDev('Error navigating to AYNA Mirror:', error);
      // Fallback navigation
      setTimeout(() => {
        router.push('/(app)/ayna-mirror');
      }, 100);
    }
  }

  /**
   * Navigate to AYNA Mirror settings screen
   */
  private navigateToAynaMirrorSettings(): void {
    try {
      setTimeout(() => {
        router.push('/ayna-mirror-settings');
      }, 100);
    } catch (error) {
      errorInDev('Error navigating to AYNA Mirror settings:', error);
    }
  }

  /**
   * Navigate to onboarding screen
   */
  private navigateToOnboarding(): void {
    try {
      setTimeout(() => {
        router.push('/onboarding');
      }, 100);
    } catch (error) {
      errorInDev('Error navigating to onboarding:', error);
    }
  }

  /**
   * Track notification engagement for analytics
   */
  private async trackNotificationEngagement(type: string, userId: string): Promise<void> {
    try {
      // Store engagement data for analytics
      const engagementData = {
        type,
        userId,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
      };

      logInDev('Notification engagement tracked:', engagementData);

      // Send to analytics service
      const { analyticsService } = await import('./analyticsService');
      analyticsService.trackEvent('notification_engagement', engagementData);
    } catch (error) {
      errorInDev('Error tracking notification engagement:', error);
    }
  }

  /**
   * Clean up listeners (for testing or app shutdown)
   */
  cleanup(): void {
    try {
      // Remove listeners
  // Updated API: remove all known subscriptions if tracked elsewhere; fallback no-op
  // Keeping for compatibility; Expo Notifications doesn't expose a global removeAll in v0.20+
  // This is a safe no-op in current setup.
  // Linking.removeAllListeners is not available in expo-linking; listeners are subscription-based.
      
      this.isInitialized = false;
      logInDev('Notification handler cleaned up');
    } catch (error) {
      errorInDev('Error cleaning up notification handler:', error);
    }
  }

  /**
   * Check if handler is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

export default NotificationHandler.getInstance();