// AYNA Mirror Notification Service Tests
// Testing for notification timing accuracy and timezone handling

import NotificationService from '@/services/notificationService';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationPreferences, EngagementHistory } from '@/types/aynaMirror';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  AndroidImportance: {
    HIGH: 'high',
    DEFAULT: 'default',
    LOW: 'low',
  },
  AndroidNotificationPriority: {
    HIGH: 'high',
  },
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('NotificationService', () => {
  let notificationService: typeof NotificationService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton instance for testing
    (NotificationService as any).instance = undefined;
    notificationService = NotificationService;
  });

  describe('Initialization', () => {
    it('should initialize successfully with granted permissions', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'test-push-token',
      });

      const result = await notificationService.initialize();

      expect(result).toBe(true);
      expect(notificationService.getNotificationToken()).toBe('test-push-token');
    });

    it('should request permissions if not already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'test-push-token',
      });

      // Reset the service for fresh initialization
      notificationService.resetForTesting();
      
      const result = await notificationService.initialize();

      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false if permissions are denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      // Reset the service for fresh initialization
      notificationService.resetForTesting();

      const result = await notificationService.initialize();

      expect(result).toBe(false);
    });
  });

  describe('Daily Mirror Notifications', () => {
    const mockPreferences: NotificationPreferences = {
      preferredTime: new Date('2024-01-01T06:00:00'),
      timezone: 'America/New_York',
      enableWeekends: true,
      enableQuickOptions: true,
      confidenceNoteStyle: 'encouraging',
    };

    beforeEach(async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id-123');
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await notificationService.initialize();
    });

    it('should schedule daily mirror notification with correct content', async () => {
      await notificationService.scheduleDailyMirrorNotification('user-123', mockPreferences);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: "Your AYNA Mirror is ready ✨",
            body: "3 confidence-building outfits await you. Start your day feeling ready for anything.",
            data: expect.objectContaining({
              type: 'daily_mirror',
              userId: 'user-123',
            }),
          }),
          trigger: expect.objectContaining({
            date: expect.any(Date),
          }),
        })
      );
    });

    it('should store scheduled notification info', async () => {
      await notificationService.scheduleDailyMirrorNotification('user-123', mockPreferences);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'notifications_user-123',
        expect.stringContaining('daily_mirror')
      );
    });

    it('should cancel existing daily notifications before scheduling new ones', async () => {
      const existingNotifications = [
        {
          id: 'old-notification',
          userId: 'user-123',
          type: 'daily_mirror',
          scheduledTime: new Date(),
          timezone: 'UTC',
          payload: { type: 'daily_mirror', userId: 'user-123' },
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingNotifications)
      );

      await notificationService.scheduleDailyMirrorNotification('user-123', mockPreferences);

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-notification');
    });
  });

  describe('Feedback Prompts', () => {
    beforeEach(async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('feedback-notification-123');
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await notificationService.initialize();
    });

    it('should schedule feedback prompt with correct content', async () => {
      await notificationService.scheduleFeedbackPrompt('user-123', 'outfit-456');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: "How did your outfit make you feel? 💫",
            body: "Your feedback helps AYNA learn your style. It takes just 30 seconds.",
            data: expect.objectContaining({
              type: 'feedback_prompt',
              userId: 'user-123',
              outfitId: 'outfit-456',
            }),
          }),
          trigger: expect.objectContaining({
            date: expect.any(Date),
          }),
        })
      );
    });

    it('should schedule feedback prompt with custom delay', async () => {
      await notificationService.scheduleFeedbackPrompt('user-123', 'outfit-456', 2);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({
            date: expect.any(Date),
          }),
        })
      );
    });
  });

  describe('Re-engagement Messages', () => {
    beforeEach(async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('re-engagement-123');
      
      await notificationService.initialize();
    });

    it('should send appropriate message for 3 days inactive', async () => {
      await notificationService.sendReEngagementMessage('user-123', 3);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Your AYNA Mirror misses you ✨",
          body: "Ready to feel confident again? Your personalized outfits are waiting.",
          data: {
            type: 're_engagement',
            userId: 'user-123',
            daysSinceLastUse: 3,
            timestamp: expect.any(Number),
          },
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
    });

    it('should send appropriate message for 7 days inactive', async () => {
      await notificationService.sendReEngagementMessage('user-123', 7);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Time to rediscover your style 🌟",
          body: "AYNA has learned new things about your wardrobe. Come see what's new!",
          data: expect.any(Object),
          sound: 'default',
        },
        trigger: null,
      });
    });

    it('should send appropriate message for long-term inactive users', async () => {
      await notificationService.sendReEngagementMessage('user-123', 14);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Your confidence ritual awaits 💫",
          body: "Remember how good it felt to start your day with confidence? Let's bring that back.",
          data: expect.any(Object),
          sound: 'default',
        },
        trigger: null,
      });
    });
  });

  describe('Notification Timing Optimization', () => {
    it('should optimize timing based on engagement history', async () => {
      const mockEngagementHistory: EngagementHistory = {
        totalDaysActive: 30,
        streakDays: 7,
        averageRating: 4.2,
        lastActiveDate: new Date('2024-01-01'),
        preferredInteractionTimes: [
          new Date('2024-01-01T07:30:00'),
          new Date('2024-01-02T07:15:00'),
          new Date('2024-01-03T07:45:00'),
        ],
      };

      const optimizedTime = await notificationService.optimizeNotificationTiming(
        'user-123',
        mockEngagementHistory
      );

      // Should average to around 7:30 AM
      expect(optimizedTime.getHours()).toBe(7);
      expect(optimizedTime.getMinutes()).toBe(30);
    });

    it('should return default 6 AM if no engagement history', async () => {
      const emptyEngagementHistory: EngagementHistory = {
        totalDaysActive: 0,
        streakDays: 0,
        averageRating: 0,
        lastActiveDate: new Date(),
        preferredInteractionTimes: [],
      };

      const optimizedTime = await notificationService.optimizeNotificationTiming(
        'user-123',
        emptyEngagementHistory
      );

      expect(optimizedTime.getHours()).toBe(6);
      expect(optimizedTime.getMinutes()).toBe(0);
    });
  });

  describe('Timezone Handling', () => {
    beforeEach(async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('timezone-notification-123');
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await notificationService.initialize();
    });

    it('should handle timezone changes and reschedule notifications', async () => {
      // Mock getting user preferences
      const getUserPreferencesSpy = jest.spyOn(
        notificationService as any,
        'getUserNotificationPreferences'
      );
      getUserPreferencesSpy.mockResolvedValue({
        preferredTime: new Date('2024-01-01T06:00:00'),
        timezone: 'America/New_York',
        enableWeekends: true,
        enableQuickOptions: true,
        confidenceNoteStyle: 'encouraging',
      });

      await notificationService.handleTimezoneChange('user-123', 'Europe/London');

      expect(getUserPreferencesSpy).toHaveBeenCalledWith('user-123');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();

      getUserPreferencesSpy.mockRestore();
    });
  });

  describe('Notification Management', () => {
    beforeEach(async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      
      await notificationService.initialize();
    });

    it('should cancel all scheduled notifications for a user', async () => {
      const mockNotifications = [
        {
          id: 'notification-1',
          userId: 'user-123',
          type: 'daily_mirror',
          scheduledTime: new Date(),
          timezone: 'UTC',
          payload: { type: 'daily_mirror', userId: 'user-123' },
        },
        {
          id: 'notification-2',
          userId: 'user-123',
          type: 'feedback_prompt',
          scheduledTime: new Date(),
          timezone: 'UTC',
          payload: { type: 'feedback_prompt', userId: 'user-123' },
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockNotifications)
      );

      await notificationService.cancelScheduledNotifications('user-123');

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-1');
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-2');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('notifications_user-123');
    });

    it('should check if notifications are enabled', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const isEnabled = await notificationService.areNotificationsEnabled();

      expect(isEnabled).toBe(true);
      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false if notifications are not enabled', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const isEnabled = await notificationService.areNotificationsEnabled();

      expect(isEnabled).toBe(false);
    });
  });

  describe('Time Calculations', () => {
    it('should calculate next notification time correctly', async () => {
      const mockPreferences: NotificationPreferences = {
        preferredTime: new Date('2024-01-01T06:00:00'),
        timezone: 'UTC',
        enableWeekends: true,
        enableQuickOptions: true,
        confidenceNoteStyle: 'encouraging',
      };

      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('time-calc-123');
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await notificationService.initialize();
      await notificationService.scheduleDailyMirrorNotification('user-123', mockPreferences);

      // Verify that a notification was scheduled
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
      
      const scheduledCall = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      const scheduledDate = scheduledCall.trigger.date;
      
      // Should be scheduled for 6 AM
      expect(scheduledDate.getHours()).toBe(6);
      expect(scheduledDate.getMinutes()).toBe(0);
    });
  });
});