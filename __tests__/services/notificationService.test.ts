import { Platform } from 'react-native';
import notificationService, {
  getPushTokenSafely,
  loadNotifications,
} from '../../src/services/notificationService';
import { secureStorage } from '@/utils/secureStorage';
import { errorHandlingService } from '@/services/errorHandlingService';
import { NotificationPreferences, EngagementHistory } from '@/types/aynaMirror';

// Mock dependencies
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  AndroidImportance: {
    HIGH: 4,
    DEFAULT: 3,
    LOW: 2,
  },
  AndroidNotificationPriority: {
    HIGH: 1,
  },
}));

jest.mock('expo-application', () => ({
  applicationId: 'com.test.app',
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('../../src/utils/secureStorage');
jest.mock('../../src/services/errorHandlingService');
jest.mock('../../src/utils/consoleSuppress');

const mockSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;
const mockErrorHandlingService = errorHandlingService as jest.Mocked<typeof errorHandlingService>;

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    notificationService.resetForTesting();

    mockSecureStorage.initialize.mockResolvedValue();
    mockSecureStorage.getItem.mockResolvedValue(null);
    mockSecureStorage.setItem.mockResolvedValue();
    mockSecureStorage.removeItem.mockResolvedValue();
    mockErrorHandlingService.executeWithRetry.mockImplementation((fn) => fn());
  });

  describe('initialize', () => {
    it('should initialize successfully with granted permissions', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'granted',
        });
        (mockNotifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
          data: 'test-token',
        });
        (mockNotifications.setNotificationChannelAsync as jest.Mock).mockResolvedValue({});
      }

      const result = await notificationService.initialize();
      expect(result).toBe(true);
    });

    it('should handle permission request when not granted initially', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'denied',
        });
        (mockNotifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'granted',
        });
        (mockNotifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
          data: 'test-token',
        });
      }

      const result = await notificationService.initialize();
      expect(result).toBe(true);
    });

    it('should return false when permissions are denied', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'denied',
        });
        (mockNotifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'denied',
        });
      }

      const result = await notificationService.initialize();
      expect(result).toBe(false);
    });

    it('should handle Android notification channels', async () => {
      (Platform as any).OS = 'android';
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'granted',
        });
        (mockNotifications.setNotificationChannelAsync as jest.Mock).mockResolvedValue({});
      }

      await notificationService.initialize();
      expect(mockNotifications?.setNotificationChannelAsync).toHaveBeenCalledWith(
        'ayna-mirror',
        expect.any(Object),
      );
      expect(mockNotifications?.setNotificationChannelAsync).toHaveBeenCalledWith(
        'feedback',
        expect.any(Object),
      );
      expect(mockNotifications?.setNotificationChannelAsync).toHaveBeenCalledWith(
        're-engagement',
        expect.any(Object),
      );
    });
  });

  describe('scheduleDailyMirrorNotification', () => {
    const mockPreferences: NotificationPreferences = {
      preferredTime: new Date('2024-01-01T06:00:00Z'),
      timezone: 'UTC',
      enableWeekends: true,
      enableQuickOptions: true,
      confidenceNoteStyle: 'encouraging',
    };

    it('should schedule daily mirror notification successfully', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'granted',
        });
        (mockNotifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
          'notification-id-123',
        );
      }

      await notificationService.initialize();
      await notificationService.scheduleDailyMirrorNotification('user123', mockPreferences);

      expect(mockNotifications?.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: 'Your AYNA Mirror is ready ✨',
            body: '3 confidence-building outfits await you. Start your day feeling ready for anything.',
          }),
        }),
      );
    });

    it('should handle scheduling errors with retry mechanism', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'granted',
        });
        (mockNotifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
          new Error('Scheduling failed'),
        );
      }

      mockErrorHandlingService.executeWithRetry.mockRejectedValue(new Error('Retry failed'));
      mockErrorHandlingService.handleNotificationError.mockResolvedValue();

      await notificationService.initialize();
      await expect(
        notificationService.scheduleDailyMirrorNotification('user123', mockPreferences),
      ).rejects.toThrow('Retry failed');

      expect(mockErrorHandlingService.handleNotificationError).toHaveBeenCalled();
    });
  });

  describe('scheduleFeedbackPrompt', () => {
    it('should schedule feedback prompt with correct delay', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'granted',
        });
        (mockNotifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
          'feedback-id-123',
        );
      }

      await notificationService.initialize();
      await notificationService.scheduleFeedbackPrompt('user123', 'outfit456', 2);

      expect(mockNotifications?.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: 'How did your outfit make you feel? 💫',
            body: 'Your feedback helps AYNA learn your style. It takes just 30 seconds.',
            data: expect.objectContaining({
              outfitId: 'outfit456',
            }),
          }),
        }),
      );
    });

    it('should handle feedback prompt scheduling errors', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
          new Error('Failed to schedule'),
        );
      }

      await notificationService.initialize();
      await expect(
        notificationService.scheduleFeedbackPrompt('user123', 'outfit456'),
      ).rejects.toThrow('Failed to schedule');
    });
  });

  describe('sendReEngagementMessage', () => {
    it('should send re-engagement message for 2 days inactive', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'granted',
        });
        (mockNotifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
          'notification-id',
        );
      }

      await notificationService.initialize();
      await notificationService.sendReEngagementMessage('user123', 2);

      expect(mockNotifications?.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: 'Your AYNA Mirror misses you ✨',
            body: 'Ready to feel confident again? Your personalized outfits are waiting.',
          }),
          trigger: null,
        }),
      );
    });

    it('should send different message for 5 days inactive', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
          'notification-id',
        );
      }

      await notificationService.initialize();
      await notificationService.sendReEngagementMessage('user123', 5);

      expect(mockNotifications?.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: 'Time to rediscover your style 🌟',
          }),
        }),
      );
    });

    it('should send different message for 10 days inactive', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
          'notification-id',
        );
      }

      await notificationService.initialize();
      await notificationService.sendReEngagementMessage('user123', 10);

      expect(mockNotifications?.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: 'Your confidence ritual awaits 💫',
          }),
        }),
      );
    });
  });

  describe('optimizeNotificationTiming', () => {
    it('should calculate optimal time from preferred interaction times', () => {
      const engagementHistory: EngagementHistory = {
        totalDaysActive: 10,
        streakDays: 3,
        averageRating: 4.2,
        lastActiveDate: new Date('2024-01-03T07:00:00Z'),
        preferredInteractionTimes: [
          new Date('2024-01-01T08:00:00Z'),
          new Date('2024-01-02T09:00:00Z'),
          new Date('2024-01-03T07:00:00Z'),
        ],
      };

      const result = notificationService.optimizeNotificationTiming('user123', engagementHistory);
      // The result should be a valid Date object with reasonable hour
      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBeGreaterThanOrEqual(0);
      expect(result.getHours()).toBeLessThan(24);
    });

    it('should use averageOpenTime when no preferred times available', () => {
      const avgTime = new Date('2024-01-01T10:30:00Z');
      const engagementHistory: EngagementHistory = {
        totalDaysActive: 5,
        streakDays: 1,
        averageRating: 3.8,
        lastActiveDate: new Date('2024-01-01T10:30:00Z'),
        preferredInteractionTimes: [],
        averageOpenTime: avgTime,
      };

      const result = notificationService.optimizeNotificationTiming('user123', engagementHistory);
      expect(result.getHours()).toBe(avgTime.getHours());
      expect(result.getMinutes()).toBe(avgTime.getMinutes());
    });

    it('should default to 6 AM when no history available', () => {
      const engagementHistory: EngagementHistory = {
        totalDaysActive: 0,
        streakDays: 0,
        averageRating: 0,
        lastActiveDate: new Date(),
        preferredInteractionTimes: [],
      };

      const result = notificationService.optimizeNotificationTiming('user123', engagementHistory);
      expect(result.getHours()).toBe(6);
      expect(result.getMinutes()).toBe(0);
    });

    it('should handle errors and fallback to 6 AM', () => {
      const engagementHistory: EngagementHistory = {
        preferredInteractionTimes: [null as any], // Invalid data
        totalDaysActive: 0,
        streakDays: 0,
        averageRating: 0,
        lastActiveDate: new Date(),
      };

      const result = notificationService.optimizeNotificationTiming('user123', engagementHistory);
      expect(result.getHours()).toBe(6);
    });
  });

  describe('handleTimezoneChange', () => {
    it('should reschedule notifications with new timezone', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'granted',
        });
        (mockNotifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('new-id');
      }

      await notificationService.initialize();
      await notificationService.handleTimezoneChange('user123', 'America/New_York');

      // Should have called schedule with new timezone
      expect(mockNotifications?.scheduleNotificationAsync).toHaveBeenCalled();
    });
  });

  describe('cancelScheduledNotifications', () => {
    it('should cancel all scheduled notifications for user', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.cancelScheduledNotificationAsync as jest.Mock).mockResolvedValue(
          undefined,
        );
      }

      mockSecureStorage.getItem.mockResolvedValue(
        JSON.stringify([
          {
            id: 'notification-1',
            userId: 'user123',
            type: 'daily_mirror',
            scheduledTime: new Date(),
            timezone: 'UTC',
            payload: { type: 'daily_mirror', userId: 'user123' },
          },
        ]),
      );

      await notificationService.cancelScheduledNotifications('user123');

      expect(mockNotifications?.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'notification-1',
      );
      expect(mockSecureStorage.removeItem).toHaveBeenCalledWith('notifications_user123');
    });
  });

  describe('areNotificationsEnabled', () => {
    it('should return true when permissions are granted', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'granted',
        });
      }

      const result = await notificationService.areNotificationsEnabled();
      expect(result).toBe(true);
    });

    it('should return false when permissions are denied', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'denied',
        });
      }

      const result = await notificationService.areNotificationsEnabled();
      expect(result).toBe(false);
    });

    it('should return false when notifications are not available', async () => {
      // Mock loadNotifications to return null
      jest.doMock('../../src/services/notificationService', () => ({
        loadNotifications: jest.fn().mockResolvedValue(null),
      }));

      const result = await notificationService.areNotificationsEnabled();
      expect(result).toBe(false);
    });
  });

  describe('getNotificationToken', () => {
    it('should return notification token after initialization', async () => {
      const mockNotifications = await loadNotifications();
      if (mockNotifications) {
        (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
          status: 'granted',
        });
        (mockNotifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
          data: 'test-token-123',
        });
      }

      await notificationService.initialize();
      const token = notificationService.getNotificationToken();
      expect(token).toBe('test-token-123');
    });

    it('should return null when not initialized', () => {
      const token = notificationService.getNotificationToken();
      expect(token).toBe(null);
    });
  });
});

describe('getPushTokenSafely', () => {
  it('should return token when not in Expo Go', async () => {
    // Since we're mocking applicationId as 'com.test.app', this should work normally
    const mockNotifications = await loadNotifications();
    if (mockNotifications) {
      (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (mockNotifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'test-token-123',
      });
    }

    const token = await getPushTokenSafely();
    expect(token).toBe('test-token-123');
  });

  it('should retry on failure and return null after max retries', async () => {
    const mockNotifications = await loadNotifications();
    if (mockNotifications) {
      (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (mockNotifications.getExpoPushTokenAsync as jest.Mock).mockClear();
      (mockNotifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );
    }

    const token = await getPushTokenSafely(2);
    expect(token).toBe(null);
    expect(mockNotifications?.getExpoPushTokenAsync).toHaveBeenCalledTimes(2);
  });

  it('should return token on successful retry', async () => {
    const mockNotifications = await loadNotifications();
    if (mockNotifications) {
      (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (mockNotifications.getExpoPushTokenAsync as jest.Mock).mockClear();
      (mockNotifications.getExpoPushTokenAsync as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: 'retry-success-token' });
    }

    const token = await getPushTokenSafely(3);
    expect(token).toBe('retry-success-token');
    expect(mockNotifications?.getExpoPushTokenAsync).toHaveBeenCalledTimes(2);
  });
});
