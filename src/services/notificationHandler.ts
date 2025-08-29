// Notification Handler Service
// Handles deep linking and notification responses for AYNA Mirror

// P0 Notifications: convert static expo-notifications import to dynamic lazy loader to reduce startup & comply with lazy policy
// Narrowed lazy module reference; internal use only
let Notifications: typeof import('expo-notifications') | null = null;
async function ensureNotifications() {
  if (!Notifications) {
    Notifications = await import('expo-notifications');
  }
  return Notifications;
}
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Platform } from 'react-native';

import { errorInDev, logInDev } from '@/utils/consoleSuppress';

// Shared discriminated union for notification payload types
type NotificationType = 'daily_mirror' | 'feedback_prompt' | 're_engagement';
interface BasePayload {
  type: NotificationType;
  userId: string;
  timestamp?: number;
}
interface DailyMirrorPayload extends BasePayload {
  type: 'daily_mirror';
}
interface FeedbackPromptPayload extends BasePayload {
  type: 'feedback_prompt';
  outfitId: string;
}
interface ReEngagementPayload extends BasePayload {
  type: 're_engagement';
  daysSinceLastUse?: number;
}
type AnyNotificationPayload =
  | DailyMirrorPayload
  | FeedbackPromptPayload
  | ReEngagementPayload
  | BasePayload;

// Minimal runtime-safe structural types (avoids compile-time dependency on module namespace)
export interface NotificationEnvelope {
  request: { content: { data: unknown } };
}
export interface NotificationResponse {
  notification: NotificationEnvelope;
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
    if (this.isInitialized) {
      return;
    }

    try {
      // Handle notification responses (when user taps notification)
      const N = await ensureNotifications();
      N.addNotificationResponseReceivedListener(this.handleNotificationResponse);

      // Handle notifications received while app is in foreground
      N.addNotificationReceivedListener(this.handleNotificationReceived);

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
      errorInDev(
        'Failed to initialize notification handler:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Handle notification response when user taps on notification
   */
  private handleNotificationResponse = (response: NotificationResponse): void => {
    try {
      const { notification } = response;
      const raw = notification.request.content.data;
      const data = this.normalisePayload(raw);

      logInDev('Notification response received:', data);

      // Handle different notification types
      if (data.type === 'daily_mirror') {
        this.handleDailyMirrorNotification(data as DailyMirrorPayload);
      } else if (data.type === 'feedback_prompt' && 'outfitId' in data) {
        this.handleFeedbackPromptNotification(data);
      } else if (data.type === 're_engagement') {
        this.handleReEngagementNotification(data as ReEngagementPayload);
      } else {
        {
          const unknownType = (data as { type?: unknown })?.type;
          logInDev(
            'Unknown notification type:',
            unknownType instanceof Error ? unknownType : String(unknownType),
          );
        }
      }
    } catch (error) {
      errorInDev(
        'Error handling notification response:',
        error instanceof Error ? error : String(error),
      );
    }
  };

  /**
   * Handle notification received while app is in foreground
   */
  private handleNotificationReceived = (notification: NotificationEnvelope): void => {
    try {
      const data = this.normalisePayload(notification.request.content.data);
      logInDev('Notification received in foreground:', data);

      // You can show custom in-app notifications here if needed
      // For now, we'll let the system handle it
    } catch (error) {
      errorInDev(
        'Error handling received notification:',
        error instanceof Error ? error : String(error),
      );
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
        // Normalise possible array params to first value (simple use-case)
        const normalised: Record<string, string | number | boolean | undefined> | undefined =
          queryParams
            ? Object.fromEntries(
                Object.entries(queryParams).map(([k, v]) => [
                  k,
                  Array.isArray(v) ? (v.length > 0 ? v[0] : undefined) : v,
                ]),
              )
            : undefined;
        this.navigateToAynaMirror(normalised);
      } else if (path === '/ayna-mirror/settings') {
        this.navigateToAynaMirrorSettings();
      } else if (path === '/onboarding') {
        this.navigateToOnboarding();
      } else {
        // Default navigation
        this.navigateToAynaMirror();
      }
    } catch (error) {
      errorInDev('Error handling deep link:', error instanceof Error ? error : String(error));
      // Fallback to AYNA Mirror
      this.navigateToAynaMirror();
    }
  };

  /**
   * Handle daily mirror notification tap
   */
  private handleDailyMirrorNotification(data: DailyMirrorPayload): void {
    try {
      logInDev('Handling daily mirror notification for user:', data.userId);

      // Navigate to AYNA Mirror screen
      this.navigateToAynaMirror();

      // Track notification engagement
      void this.trackNotificationEngagement('daily_mirror', data.userId);
    } catch (error) {
      errorInDev(
        'Error handling daily mirror notification:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Handle feedback prompt notification tap
   */
  private handleFeedbackPromptNotification(data: FeedbackPromptPayload): void {
    try {
      logInDev('Handling feedback prompt notification for outfit:', data.outfitId);

      // Navigate to AYNA Mirror with feedback parameter
      this.navigateToAynaMirror({ feedback: data.outfitId });

      // Track notification engagement
      void this.trackNotificationEngagement('feedback_prompt', data.userId);
    } catch (error) {
      errorInDev(
        'Error handling feedback prompt notification:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Handle re-engagement notification tap
   */
  private handleReEngagementNotification(data: ReEngagementPayload): void {
    try {
      logInDev('Handling re-engagement notification for user:', data.userId);

      // Navigate to AYNA Mirror screen
      this.navigateToAynaMirror();

      // Track notification engagement
      void this.trackNotificationEngagement('re_engagement', data.userId);
    } catch (error) {
      errorInDev(
        'Error handling re-engagement notification:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Navigate to AYNA Mirror screen with optional parameters
   */
  private navigateToAynaMirror(
    params?: Record<string, string | number | boolean | undefined>,
  ): void {
    try {
      // Use setTimeout to ensure navigation happens after app is ready
      setTimeout(() => {
        if (params && Object.keys(params).length > 0) {
          // Convert values to strings for query params, dropping undefined & boolean -> 'true'/'false'
          const qp: Record<string, string> = {};
          for (const [k, v] of Object.entries(params)) {
            if (v === undefined) {
              continue;
            }
            qp[k] = String(v);
          }
          const queryString = new URLSearchParams(qp).toString();
          router.push(`/(app)/ayna-mirror?${queryString}`);
        } else {
          // Navigate to main AYNA Mirror screen
          router.push('/(app)/ayna-mirror');
        }
      }, 100);
    } catch (error) {
      errorInDev(
        'Error navigating to AYNA Mirror:',
        error instanceof Error ? error : String(error),
      );
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
      errorInDev(
        'Error navigating to AYNA Mirror settings:',
        error instanceof Error ? error : String(error),
      );
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
      errorInDev('Error navigating to onboarding:', error instanceof Error ? error : String(error));
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
      errorInDev(
        'Error tracking notification engagement:',
        error instanceof Error ? error : String(error),
      );
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
      errorInDev(
        'Error cleaning up notification handler:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Check if handler is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Runtime normalisation & type-narrowing for incoming notification payloads.
   * Ensures we always return an object with at least a `type` & `userId` when possible.
   */
  private normalisePayload(raw: unknown): AnyNotificationPayload {
    if (raw && typeof raw === 'object') {
      const r = raw as Record<string, unknown>;
      const type = typeof r.type === 'string' ? (r.type as NotificationType) : 'daily_mirror';
      const userId = typeof r.userId === 'string' ? r.userId : 'unknown';
      if (type === 'feedback_prompt' && typeof r.outfitId === 'string') {
        return { type, userId, outfitId: r.outfitId, timestamp: r.timestamp as number | undefined };
      }
      if (type === 're_engagement') {
        return {
          type,
          userId,
          daysSinceLastUse: r.daysSinceLastUse as number | undefined,
          timestamp: r.timestamp as number | undefined,
        };
      }
      if (type === 'daily_mirror') {
        return { type, userId, timestamp: r.timestamp as number | undefined };
      }
      return { type, userId };
    }
    return { type: 'daily_mirror', userId: 'unknown' };
  }
}

export default NotificationHandler.getInstance();
