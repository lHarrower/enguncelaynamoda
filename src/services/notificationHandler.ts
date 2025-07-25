// Notification Handler Service
// Handles deep linking and notification responses for AYNA Mirror

import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

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
      console.log('Notification handler initialized');
    } catch (error) {
      console.error('Failed to initialize notification handler:', error);
    }
  }

  /**
   * Handle notification response when user taps on notification
   */
  private handleNotificationResponse = (response: NotificationResponse): void => {
    try {
      const { notification } = response;
      const data = notification.request.content.data;

      console.log('Notification response received:', data);

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
          console.warn('Unknown notification type:', data.type);
      }
    } catch (error) {
      console.error('Error handling notification response:', error);
    }
  };

  /**
   * Handle notification received while app is in foreground
   */
  private handleNotificationReceived = (notification: Notifications.Notification): void => {
    try {
      const data = notification.request.content.data;
      console.log('Notification received in foreground:', data);

      // You can show custom in-app notifications here if needed
      // For now, we'll let the system handle it
    } catch (error) {
      console.error('Error handling received notification:', error);
    }
  };

  /**
   * Handle deep links from notifications or external sources
   */
  private handleDeepLink = ({ url }: { url: string }): void => {
    try {
      console.log('Deep link received:', url);

      const parsedUrl = Linking.parse(url);
      const { hostname, path, queryParams } = parsedUrl;

      // Handle AYNA Mirror deep links
      if (hostname === 'ayna-mirror' || path === '/ayna-mirror') {
        this.navigateToAynaMirror(queryParams);
      } else if (path === '/ayna-mirror/settings') {
        this.navigateToAynaMirrorSettings();
      } else if (path === '/onboarding') {
        this.navigateToOnboarding();
      } else {
        // Default navigation
        this.navigateToAynaMirror();
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
      // Fallback to AYNA Mirror
      this.navigateToAynaMirror();
    }
  };

  /**
   * Handle daily mirror notification tap
   */
  private handleDailyMirrorNotification(data: any): void {
    try {
      console.log('Handling daily mirror notification for user:', data.userId);
      
      // Navigate to AYNA Mirror screen
      this.navigateToAynaMirror();

      // Track notification engagement
      this.trackNotificationEngagement('daily_mirror', data.userId);
    } catch (error) {
      console.error('Error handling daily mirror notification:', error);
    }
  }

  /**
   * Handle feedback prompt notification tap
   */
  private handleFeedbackPromptNotification(data: any): void {
    try {
      console.log('Handling feedback prompt notification for outfit:', data.outfitId);
      
      // Navigate to AYNA Mirror with feedback parameter
      this.navigateToAynaMirror({ feedback: data.outfitId });

      // Track notification engagement
      this.trackNotificationEngagement('feedback_prompt', data.userId);
    } catch (error) {
      console.error('Error handling feedback prompt notification:', error);
    }
  }

  /**
   * Handle re-engagement notification tap
   */
  private handleReEngagementNotification(data: any): void {
    try {
      console.log('Handling re-engagement notification for user:', data.userId);
      
      // Navigate to AYNA Mirror screen
      this.navigateToAynaMirror();

      // Track notification engagement
      this.trackNotificationEngagement('re_engagement', data.userId);
    } catch (error) {
      console.error('Error handling re-engagement notification:', error);
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
      console.error('Error navigating to AYNA Mirror:', error);
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
      console.error('Error navigating to AYNA Mirror settings:', error);
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
      console.error('Error navigating to onboarding:', error);
    }
  }

  /**
   * Track notification engagement for analytics
   */
  private trackNotificationEngagement(type: string, userId: string): void {
    try {
      // Store engagement data for analytics
      const engagementData = {
        type,
        userId,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
      };

      console.log('Notification engagement tracked:', engagementData);

      // TODO: Send to analytics service
      // analyticsService.track('notification_engagement', engagementData);
    } catch (error) {
      console.error('Error tracking notification engagement:', error);
    }
  }

  /**
   * Clean up listeners (for testing or app shutdown)
   */
  cleanup(): void {
    try {
      // Remove listeners
      Notifications.removeAllNotificationListeners();
      Linking.removeAllListeners('url');
      
      this.isInitialized = false;
      console.log('Notification handler cleaned up');
    } catch (error) {
      console.error('Error cleaning up notification handler:', error);
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