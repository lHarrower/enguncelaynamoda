// AYNA Mirror Notification Service
// Precise timing and delivery system for the daily confidence ritual

import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { warnInDev } from '@/utils/consoleSuppress';

import { EngagementHistory, NotificationPreferences } from '../types/aynaMirror';
import { safeParse } from '../utils/safeJSON';
import { secureStorage } from '../utils/secureStorage';
import { errorHandlingService } from './errorHandlingService';

// Import jest for test environment
// Mock notifications for test environment
let globalMockNotifications: unknown;
if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
  try {
    // Simple mock object without jest dependencies
    globalMockNotifications = {
      setNotificationHandler: () => {},
      getPermissionsAsync: () => Promise.resolve({ status: 'granted' }),
      requestPermissionsAsync: () => Promise.resolve({ status: 'granted' }),
      getExpoPushTokenAsync: () => Promise.resolve({ data: 'mock-token' }),
      setNotificationChannelAsync: () => Promise.resolve(),
      scheduleNotificationAsync: () => Promise.resolve('mock-notification-id'),
      cancelScheduledNotificationAsync: () => Promise.resolve(),
      cancelAllScheduledNotificationsAsync: () => Promise.resolve(),
      getAllScheduledNotificationsAsync: () => Promise.resolve([]),
      dismissNotificationAsync: () => Promise.resolve(),
      dismissAllNotificationsAsync: () => Promise.resolve(),
      getPresentedNotificationsAsync: () => Promise.resolve([]),
      setBadgeCountAsync: () => Promise.resolve(),
      getBadgeCountAsync: () => Promise.resolve(0),
      addNotificationReceivedListener: () => ({ remove: () => {} }),
      addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
      removeNotificationSubscription: () => {},
      AndroidImportance: {
        MAX: 5,
        HIGH: 4,
        DEFAULT: 3,
        LOW: 2,
        MIN: 1,
      },
      AndroidNotificationVisibility: {
        PUBLIC: 1,
        PRIVATE: 0,
        SECRET: -1,
      },
    };
  } catch (error) {
    // Jest not available, continue without mocking
  }
}

// Local minimal typed re-export to avoid broad any usage
type ExpoNotifications = typeof import('expo-notifications');

// Test environment type definitions
interface MinimalNotificationContent {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  /** Android only priority; kept optional and narrowed at runtime */
  priority?: number;
}
interface DateTrigger {
  date: Date;
}
interface ScheduleRequest {
  content: MinimalNotificationContent;
  trigger: DateTrigger | null;
}

// Lazy notifications module loader
let _notifications: ExpoNotifications | null = null;
let _notificationsConfigured = false;
export async function loadNotifications(): Promise<ExpoNotifications | null> {
  // In test environment, prefer returning the Jest-mocked module so tests can spy/override behavior
  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
    try {
      // Use require to ensure same singleton instance as tests

      const mockedModule = require('expo-notifications');
      const mocked = mockedModule && mockedModule.default ? mockedModule.default : mockedModule;
      return mocked as ExpoNotifications;
    } catch {
      // Fallback to simple in-file mock when module import fails (rare in tests)
      return globalMockNotifications as ExpoNotifications;
    }
  }

  if (!_notifications) {
    // Use dynamic import for all environments
    try {
      _notifications = (await import('expo-notifications')) as ExpoNotifications;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      warnInDev('expo-notifications not available:', err);
      return null; // Return null if notifications are not available
    }
  }
  if (!_notificationsConfigured && _notifications) {
    try {
      _notifications.setNotificationHandler?.({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch {
      // silent – handler is best-effort
    }
    _notificationsConfigured = true;
  }
  return _notifications;
}

// Detect Expo Go (SDK 53+ removed remote push)
const isExpoGo = !Application.applicationId || Application.applicationId === 'host.exp.Exponent';

export async function getPushTokenSafely(retries = 3): Promise<string | null> {
  // P0 Notifications: add retry/backoff & skip on Expo Go
  try {
    if (isExpoGo) {
      return null;
    }
    const Notifications = await loadNotifications();
    if (!Notifications) {
      return null;
    }
    const settings = await Notifications.getPermissionsAsync();
    let status = settings.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') {
      return null;
    }
    let lastErr: unknown;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        if (!Notifications) {
          throw new Error('Notifications not available');
        }
        const token = await Notifications.getExpoPushTokenAsync();
        return token.data ?? null;
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, (attempt + 1) * 400));
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      const msg =
        typeof lastErr === 'object' && lastErr && 'message' in lastErr
          ? String((lastErr as { message?: unknown }).message)
          : 'unknown error';
      warnInDev('[notifications] push token acquisition failed after retries', msg);
    }
    return null;
  } catch {
    return null;
  }
}

// (Handler configured lazily via loadNotifications())

export interface NotificationPayload {
  type: 'daily_mirror' | 'feedback_prompt' | 're_engagement';
  userId: string;
  data?: Record<string, unknown>;
}

export interface ScheduledNotification {
  id: string;
  userId: string;
  type: string;
  scheduledTime: Date;
  timezone: string;
  payload: NotificationPayload;
}

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;
  private notificationToken: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification service and request permissions
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Request permissions with error handling
      try {
        const Notifications = await loadNotifications();
        if (!Notifications) {
          this.isInitialized = true;
          return false;
        }
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus; // share same type to avoid unsafe enum comparison

        if (finalStatus !== 'granted') {
          const { status: requestedStatus } = await Notifications.requestPermissionsAsync();
          finalStatus = requestedStatus;
        }

        if (finalStatus !== 'granted') {
          this.isInitialized = true;
          return false;
        }
      } catch (permissionError) {
        // Silently handle permission errors in development
        this.isInitialized = true;
        return false;
      }

      // Get push token using safe helper (skips Expo Go)
      if (Device.isDevice) {
        this.notificationToken = await getPushTokenSafely();
      }

      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        const Notifications = await loadNotifications();
        if (!Notifications) {
          this.isInitialized = true;
          return false;
        }
        await Notifications.setNotificationChannelAsync('ayna-mirror', {
          name: 'AYNA Mirror',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
        await Notifications.setNotificationChannelAsync('feedback', {
          name: 'Outfit Feedback',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          sound: 'default',
        });
        await Notifications.setNotificationChannelAsync('re-engagement', {
          name: 'Re-engagement',
          importance: Notifications.AndroidImportance.LOW,
          sound: 'default',
        });
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      // Failed to initialize notification service
      return false;
    }
  }

  /**
   * Schedule daily AYNA Mirror notification at 6 AM (or user's preferred time)
   */
  async scheduleDailyMirrorNotification(
    userId: string,
    preferences: NotificationPreferences,
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return await errorHandlingService
      .executeWithRetry(
        async () => {
          // Cancel existing daily notifications for this user
          await this.cancelNotificationsByType(userId, 'daily_mirror');

          // Calculate next notification time
          const nextNotificationTime = this.calculateNextNotificationTime(
            preferences.preferredTime,
            preferences.timezone,
            preferences.enableWeekends,
          );

          // Schedule the notification
          const Notifications = await loadNotifications();
          if (!Notifications) {
            throw new Error('Notifications not available');
          }
          const maybePriority = (
            Notifications as Partial<typeof Notifications> & {
              AndroidNotificationPriority?: { HIGH?: number };
            }
          ).AndroidNotificationPriority?.HIGH;
          const scheduleReq: ScheduleRequest = {
            content: {
              title: 'Your AYNA Mirror is ready ✨',
              body: '3 confidence-building outfits await you. Start your day feeling ready for anything.',
              data: {
                type: 'daily_mirror',
                userId,
                timestamp: Date.now(),
                url: 'aynamoda://ayna-mirror',
              },
              sound: 'default',
              priority: typeof maybePriority === 'number' ? maybePriority : undefined,
            },
            trigger: { date: nextNotificationTime },
          };
          const notificationId = await Notifications.scheduleNotificationAsync(
            scheduleReq as import('expo-notifications').NotificationRequestInput,
          );

          // Store notification info for tracking
          await this.storeScheduledNotification({
            id: notificationId,
            userId,
            type: 'daily_mirror',
            scheduledTime: nextNotificationTime,
            timezone: preferences.timezone,
            payload: {
              type: 'daily_mirror',
              userId,
            },
          });

          // Daily mirror notification scheduled
        },
        {
          service: 'notification',
          operation: 'scheduleDailyMirrorNotification',
          userId,
        },
        {
          maxRetries: 2,
          enableOfflineMode: true,
        },
      )
      .catch(async (error) => {
        // Failed to schedule daily mirror notification after retries
        // Use error handling service to handle notification failure
        await errorHandlingService.handleNotificationError(userId, {
          type: 'daily_mirror',
          preferences,
          scheduledTime: new Date(),
        });
        throw error;
      });
  }

  /**
   * Schedule feedback prompt 2-4 hours after outfit selection
   */
  async scheduleFeedbackPrompt(
    userId: string,
    outfitId: string,
    delayHours: number = 3,
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const promptTime = new Date();
      promptTime.setHours(promptTime.getHours() + delayHours);

      const Notifications = await loadNotifications();
      if (!Notifications) {
        throw new Error('Notifications not available');
      }
      const req: ScheduleRequest = {
        content: {
          title: 'How did your outfit make you feel? 💫',
          body: 'Your feedback helps AYNA learn your style. It takes just 30 seconds.',
          data: {
            type: 'feedback_prompt',
            userId,
            outfitId,
            timestamp: Date.now(),
            url: `aynamoda://ayna-mirror?feedback=${outfitId}`,
          },
          sound: 'default',
        },
        // schedule API supports date triggers and null for immediate
        trigger: { date: promptTime },
      };
      const notificationId = await Notifications.scheduleNotificationAsync(
        req as import('expo-notifications').NotificationRequestInput,
      );

      await this.storeScheduledNotification({
        id: notificationId,
        userId,
        type: 'feedback_prompt',
        scheduledTime: promptTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        payload: {
          type: 'feedback_prompt',
          userId,
          data: { outfitId },
        },
      });

      // Feedback prompt scheduled
    } catch (error) {
      // Failed to schedule feedback prompt
      throw error;
    }
  }

  /**
   * Send re-engagement message for inactive users
   */
  async sendReEngagementMessage(userId: string, daysSinceLastUse: number): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const messages = this.getReEngagementMessage(daysSinceLastUse);

      const Notifications = await loadNotifications();
      if (!Notifications) {
        throw new Error('Notifications not available');
      }
      const req: ScheduleRequest = {
        content: {
          title: messages.title,
          body: messages.body,
          data: {
            type: 're_engagement',
            userId,
            daysSinceLastUse,
            timestamp: Date.now(),
          },
          sound: 'default',
        },
        trigger: null, // Send immediately
      };
      await Notifications.scheduleNotificationAsync(
        req as import('expo-notifications').NotificationRequestInput,
      );

      // Re-engagement message sent
    } catch (error) {
      // Failed to send re-engagement message
      throw error;
    }
  }

  /**
   * Optimize notification timing based on user engagement patterns
   */
  optimizeNotificationTiming(userId: string, engagementHistory: EngagementHistory): Date {
    try {
      // Analyze user's preferred interaction times
      const preferredTimes = engagementHistory.preferredInteractionTimes || [];

      // Use averageOpenTime as fallback when no preferredTimes provided
      if (preferredTimes.length === 0 && engagementHistory.averageOpenTime instanceof Date) {
        const avgOpen: Date = engagementHistory.averageOpenTime;
        // Return a time aligned to the same base date to avoid large diffs in tests
        return new Date(avgOpen);
      }

      if (preferredTimes.length === 0) {
        // Default to 6 AM if no history
        const defaultTime = new Date();
        defaultTime.setHours(6, 0, 0, 0);
        return defaultTime;
      }

      // Calculate average preferred time
      const totalMinutes = preferredTimes.reduce((sum, time) => {
        return sum + (time.getHours() * 60 + time.getMinutes());
      }, 0);

      const averageMinutes = totalMinutes / preferredTimes.length;
      const optimizedHour = Math.floor(averageMinutes / 60);
      const optimizedMinute = Math.floor(averageMinutes % 60);

      // Use the date of the first preferred time (or today if not available)
      const base = preferredTimes[0] ? new Date(preferredTimes[0]) : new Date();
      base.setHours(optimizedHour, optimizedMinute, 0, 0);
      return base;
    } catch (error) {
      // Failed to optimize notification timing
      // Fallback to 6 AM
      const fallbackTime = new Date();
      fallbackTime.setHours(6, 0, 0, 0);
      return fallbackTime;
    }
  }

  /**
   * Handle timezone changes (e.g., when user travels)
   */
  async handleTimezoneChange(userId: string, newTimezone: string): Promise<void> {
    try {
      // Get current user preferences
      const preferences = await this.getUserNotificationPreferences(userId);
      if (!preferences) {
        return;
      }

      // Update timezone
      preferences.timezone = newTimezone;

      // Reschedule daily notifications with new timezone
      await this.scheduleDailyMirrorNotification(userId, preferences);

      // Timezone updated
    } catch (error) {
      // Failed to handle timezone change
      throw error;
    }
  }

  /**
   * Cancel all scheduled notifications for a user
   */
  async cancelScheduledNotifications(userId: string): Promise<void> {
    try {
      const scheduledNotifications = await this.getScheduledNotifications(userId);

      for (const notification of scheduledNotifications) {
        const Notifications = await loadNotifications();
        if (!Notifications) {
          continue;
        }
        await Notifications.cancelScheduledNotificationAsync(notification.id);
      }

      // Clear from storage
      await secureStorage.initialize();
      await secureStorage.removeItem(`notifications_${userId}`);

      // Cancelled notifications
    } catch (error) {
      // Failed to cancel scheduled notifications
      throw error;
    }
  }

  /**
   * Cancel notifications by type
   */
  private async cancelNotificationsByType(userId: string, type: string): Promise<void> {
    try {
      const scheduledNotifications = await this.getScheduledNotifications(userId);
      const notificationsToCancel = scheduledNotifications.filter((n) => n.type === type);

      for (const notification of notificationsToCancel) {
        const Notifications = await loadNotifications();
        if (!Notifications) {
          continue;
        }
        await Notifications.cancelScheduledNotificationAsync(notification.id);
      }

      // Update storage
      const remainingNotifications = scheduledNotifications.filter((n) => n.type !== type);
      await secureStorage.setItem(
        `notifications_${userId}`,
        JSON.stringify(remainingNotifications),
      );

      // Cancelled notifications
    } catch (error) {
      // Failed to cancel notifications
      throw error;
    }
  }

  /**
   * Calculate next notification time considering timezone and weekend preferences
   */
  private calculateNextNotificationTime(
    preferredTime: Date,
    timezone: string,
    enableWeekends: boolean,
  ): Date {
    const now = new Date();
    const nextNotification = new Date();

    // Set to preferred time
    nextNotification.setHours(preferredTime.getHours(), preferredTime.getMinutes(), 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (nextNotification <= now) {
      nextNotification.setDate(nextNotification.getDate() + 1);
    }

    // Skip weekends if disabled
    if (!enableWeekends) {
      while (nextNotification.getDay() === 0 || nextNotification.getDay() === 6) {
        nextNotification.setDate(nextNotification.getDate() + 1);
      }
    }

    return nextNotification;
  }

  /**
   * Get re-engagement message based on days inactive
   */
  private getReEngagementMessage(daysSinceLastUse: number): { title: string; body: string } {
    if (daysSinceLastUse <= 3) {
      return {
        title: 'Your AYNA Mirror misses you ✨',
        body: 'Ready to feel confident again? Your personalized outfits are waiting.',
      };
    } else if (daysSinceLastUse <= 7) {
      return {
        title: 'Time to rediscover your style 🌟',
        body: "AYNA has learned new things about your wardrobe. Come see what's new!",
      };
    } else {
      return {
        title: 'Your confidence ritual awaits 💫',
        body: "Remember how good it felt to start your day with confidence? Let's bring that back.",
      };
    }
  }

  /**
   * Store scheduled notification info
   */
  private async storeScheduledNotification(notification: ScheduledNotification): Promise<void> {
    try {
      const existingNotifications = await this.getScheduledNotifications(notification.userId);
      const updatedNotifications = [...existingNotifications, notification];

      await secureStorage.initialize();
      await secureStorage.setItem(
        `notifications_${notification.userId}`,
        JSON.stringify(updatedNotifications),
      );
    } catch (error) {
      // Failed to store scheduled notification
    }
  }

  /**
   * Get scheduled notifications for a user
   */
  private async getScheduledNotifications(userId: string): Promise<ScheduledNotification[]> {
    try {
      await secureStorage.initialize();
      const stored = await secureStorage.getItem(`notifications_${userId}`);
      const parsed = safeParse<unknown>(stored, []);
      return Array.isArray(parsed)
        ? parsed.filter((n): n is ScheduledNotification => !!n && typeof n === 'object')
        : [];
    } catch (error) {
      // Failed to get scheduled notifications
      return [];
    }
  }

  /**
   * Get user notification preferences (mock implementation - should integrate with user service)
   */
  private getUserNotificationPreferences(userId: string): NotificationPreferences | null {
    try {
      // This should integrate with your user preferences service
      // For now, return default preferences
      const defaultTime = new Date();
      defaultTime.setHours(6, 0, 0, 0);

      return {
        preferredTime: defaultTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        enableWeekends: true,
        enableQuickOptions: true,
        confidenceNoteStyle: 'encouraging',
      };
    } catch (error) {
      // Failed to get user notification preferences
      return null;
    }
  }

  /**
   * Get notification token for remote notifications
   */
  getNotificationToken(): string | null {
    return this.notificationToken;
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    // kept async: awaits underlying calls
    try {
      const Notifications = await loadNotifications();
      if (!Notifications) {
        return false;
      }
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      // Failed to check notification permissions
      return false;
    }
  }

  /**
   * Reset initialization state (for testing purposes)
   */
  resetForTesting(): void {
    this.isInitialized = false;
    this.notificationToken = null;
  }
}
// Export a singleton instance for default import
const notificationService = NotificationService.getInstance();
export default notificationService;
// Also export named for easier spying in tests
export { notificationService };
