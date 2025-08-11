// User Preferences Service Tests
import { UserPreferencesService } from '@/services/userPreferencesService';
import { supabase } from '@/config/supabaseClient';
import * as Location from 'expo-location';
import { 
  UserPreferences, 
  NotificationPreferences, 
  PrivacySettings,
  ConfidenceNoteStyle 
} from '@/types/aynaMirror';

// Mock dependencies
jest.mock('@/config/supabaseClient');
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: {
    Low: 1
  }
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockLocation = Location as jest.Mocked<typeof Location>;

describe('UserPreferencesService', () => {
  const mockUserId = 'test-user-123';
  const mockDate = new Date('2024-01-15T06:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();
    // Don't mock Date constructor globally as it breaks date comparisons
    jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUserPreferences', () => {
    it('should return existing user preferences', async () => {
      const mockRecord = {
        user_id: mockUserId,
        notification_time: '06:00:00',
        timezone: 'America/New_York',
        style_preferences: {
          preferredColors: ['blue', 'black'],
          preferredStyles: ['casual'],
          bodyTypePreferences: [],
          occasionPreferences: {},
          confidencePatterns: [],
          confidenceNoteStyle: 'encouraging'
        },
        privacy_settings: {
          shareUsageData: false,
          allowLocationTracking: true,
          enableSocialFeatures: true,
          dataRetentionDays: 365
        },
        engagement_history: {
          totalDaysActive: 5,
          streakDays: 3,
          averageRating: 4.2,
          lastActiveDate: '2024-01-15',
          preferredInteractionTimes: []
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockRecord, error: null })
          })
        })
      } as any);

      const result = await UserPreferencesService.getUserPreferences(mockUserId);

      expect(result.userId).toBe(mockUserId);
      expect(result.timezone).toBe('America/New_York');
      expect(result.stylePreferences.preferredColors).toEqual(['blue', 'black']);
      expect(result.privacySettings.shareUsageData).toBe(false);
    });

    it('should create default preferences for new user', async () => {
      // Mock no existing preferences
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } // No rows returned
            })
          })
        })
      } as any);

      // Mock timezone detection
      Object.defineProperty(Intl, 'DateTimeFormat', {
        value: jest.fn(() => ({
          resolvedOptions: () => ({ timeZone: 'America/Los_Angeles' })
        })),
        writable: true
      });

      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({ 
        status: 'denied' as any,
        expires: 'never',
        granted: false,
        canAskAgain: true
      });

      // Mock insert for creating default preferences
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                user_id: mockUserId,
                notification_time: '06:00:00',
                timezone: 'UTC', // Use UTC for consistency
                style_preferences: {},
                privacy_settings: {},
                engagement_history: {},
                created_at: mockDate.toISOString(),
                updated_at: mockDate.toISOString()
              },
              error: null
            })
          })
        })
      } as any);

      const result = await UserPreferencesService.getUserPreferences(mockUserId);

      expect(result.userId).toBe(mockUserId);
      expect(result.timezone).toBe('UTC');
      expect(result.notificationTime.getHours()).toBe(6);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { message: 'Database error' } 
            })
          })
        })
      } as any);

      const result = await UserPreferencesService.getUserPreferences(mockUserId);

      // Should return default preferences on error
      expect(result.userId).toBe(mockUserId);
      expect(result.timezone).toBe('UTC');
      expect(result.notificationTime.getHours()).toBe(6);
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences successfully', async () => {
      const mockCurrentPreferences: UserPreferences = {
        userId: mockUserId,
        notificationTime: new Date('2024-01-01T06:00:00'),
        timezone: 'UTC',
        stylePreferences: {
          userId: mockUserId,
          preferredColors: [],
          preferredStyles: [],
          bodyTypePreferences: [],
          occasionPreferences: {},
          confidencePatterns: [],
          lastUpdated: mockDate
        },
        privacySettings: {
          shareUsageData: false,
          allowLocationTracking: true,
          enableSocialFeatures: true,
          dataRetentionDays: 365
        },
        engagementHistory: {
          totalDaysActive: 0,
          streakDays: 0,
          averageRating: 0,
          lastActiveDate: mockDate,
          preferredInteractionTimes: []
        },
        createdAt: mockDate,
        updatedAt: mockDate
      };

      // Mock getting current preferences
      jest.spyOn(UserPreferencesService, 'getUserPreferences')
        .mockResolvedValue(mockCurrentPreferences);

      const updates = {
        timezone: 'America/New_York',
        notificationTime: new Date('2024-01-01T07:00:00')
      };

      const mockUpdatedRecord = {
        user_id: mockUserId,
        notification_time: '07:00:00',
        timezone: 'America/New_York',
        style_preferences: {},
        privacy_settings: mockCurrentPreferences.privacySettings,
        engagement_history: mockCurrentPreferences.engagementHistory,
        created_at: mockDate.toISOString(),
        updated_at: mockDate.toISOString()
      };

      mockSupabase.from.mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: mockUpdatedRecord, 
              error: null 
            })
          })
        })
      } as any);

      const result = await UserPreferencesService.updateUserPreferences(mockUserId, updates);

      expect(result.timezone).toBe('America/New_York');
      expect(result.notificationTime.getHours()).toBe(7);
    });

    it('should handle update errors', async () => {
      jest.spyOn(UserPreferencesService, 'getUserPreferences')
        .mockResolvedValue({} as UserPreferences);

      mockSupabase.from.mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { message: 'Update failed' } 
            })
          })
        })
      } as any);

      await expect(
        UserPreferencesService.updateUserPreferences(mockUserId, { timezone: 'UTC' })
      ).rejects.toThrow();
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update notification preferences', async () => {
      const mockCurrentPreferences: UserPreferences = {
        userId: mockUserId,
        notificationTime: new Date('2024-01-01T06:00:00'),
        timezone: 'UTC',
        stylePreferences: {
          userId: mockUserId,
          preferredColors: [],
          preferredStyles: [],
          bodyTypePreferences: [],
          occasionPreferences: {},
          confidencePatterns: [],
          confidenceNoteStyle: 'encouraging',
          lastUpdated: mockDate
        },
        privacySettings: {
          shareUsageData: false,
          allowLocationTracking: true,
          enableSocialFeatures: true,
          dataRetentionDays: 365
        },
        engagementHistory: {
          totalDaysActive: 0,
          streakDays: 0,
          averageRating: 0,
          lastActiveDate: mockDate,
          preferredInteractionTimes: []
        },
        createdAt: mockDate,
        updatedAt: mockDate
      };

      jest.spyOn(UserPreferencesService, 'getUserPreferences')
        .mockResolvedValue(mockCurrentPreferences);
      
      jest.spyOn(UserPreferencesService, 'updateUserPreferences')
        .mockResolvedValue(mockCurrentPreferences);

      const notificationPrefs: Partial<NotificationPreferences> = {
        preferredTime: new Date('2024-01-01T07:30:00'),
        timezone: 'America/New_York',
        confidenceNoteStyle: 'witty'
      };

      await UserPreferencesService.updateNotificationPreferences(mockUserId, notificationPrefs);

      expect(UserPreferencesService.updateUserPreferences).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          notificationTime: notificationPrefs.preferredTime,
          timezone: notificationPrefs.timezone,
          stylePreferences: expect.objectContaining({
            confidenceNoteStyle: 'witty'
          })
        })
      );
    });
  });

  describe('updatePrivacySettings', () => {
    it('should update privacy settings', async () => {
      const mockPrivacySettings: PrivacySettings = {
        shareUsageData: false,
        allowLocationTracking: true,
        enableSocialFeatures: true,
        dataRetentionDays: 365
      };

      jest.spyOn(UserPreferencesService, 'getPrivacySettings')
        .mockResolvedValue(mockPrivacySettings);
      
      jest.spyOn(UserPreferencesService, 'updateUserPreferences')
        .mockResolvedValue({} as UserPreferences);

      const updates: Partial<PrivacySettings> = {
        shareUsageData: true,
        dataRetentionDays: 180
      };

      await UserPreferencesService.updatePrivacySettings(mockUserId, updates);

      expect(UserPreferencesService.updateUserPreferences).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          privacySettings: expect.objectContaining({
            shareUsageData: true,
            dataRetentionDays: 180,
            allowLocationTracking: true,
            enableSocialFeatures: true
          })
        })
      );
    });
  });

  describe('detectAndUpdateTimezone', () => {
    it('should detect timezone from device', async () => {
      Object.defineProperty(Intl, 'DateTimeFormat', {
        value: jest.fn(() => ({
          resolvedOptions: () => ({ timeZone: 'Europe/London' })
        })),
        writable: true
      });

      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({ 
        status: 'denied' as any,
        expires: 'never',
        granted: false,
        canAskAgain: true
      });

      jest.spyOn(UserPreferencesService, 'updateUserPreferences')
        .mockResolvedValue({} as UserPreferences);

      const result = await UserPreferencesService.detectAndUpdateTimezone(mockUserId);

      expect(result).toBe('Europe/London');
      expect(UserPreferencesService.updateUserPreferences).toHaveBeenCalledWith(
        mockUserId,
        { timezone: 'Europe/London' }
      );
    });

    it('should use location-based timezone when available', async () => {
      Object.defineProperty(Intl, 'DateTimeFormat', {
        value: jest.fn(() => ({
          resolvedOptions: () => ({ timeZone: 'America/New_York' })
        })),
        writable: true
      });

      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({ 
        status: 'granted' as any,
        expires: 'never',
        granted: true,
        canAskAgain: false
      });

      mockLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      });

      jest.spyOn(UserPreferencesService, 'updateUserPreferences')
        .mockResolvedValue({} as UserPreferences);

      const result = await UserPreferencesService.detectAndUpdateTimezone(mockUserId);

      expect(result).toBe('America/New_York');
    });

    it('should fallback to UTC on error', async () => {
      Object.defineProperty(Intl, 'DateTimeFormat', {
        value: jest.fn(() => {
          throw new Error('Timezone detection failed');
        }),
        writable: true
      });

      const result = await UserPreferencesService.detectAndUpdateTimezone(mockUserId);

      expect(result).toBe('UTC');
    });
  });

  describe('trackDailyEngagement', () => {
    it('should call updateEngagementHistory when tracking engagement', async () => {
      const mockPreferences: UserPreferences = {
        userId: mockUserId,
        notificationTime: new Date('2024-01-01T06:00:00'),
        timezone: 'UTC',
        stylePreferences: {
          userId: mockUserId,
          preferredColors: [],
          preferredStyles: [],
          bodyTypePreferences: [],
          occasionPreferences: {},
          confidencePatterns: [],
          lastUpdated: mockDate
        },
        privacySettings: {
          shareUsageData: false,
          allowLocationTracking: true,
          enableSocialFeatures: true,
          dataRetentionDays: 365
        },
        engagementHistory: {
          totalDaysActive: 5,
          streakDays: 3,
          averageRating: 4.0,
          lastActiveDate: new Date('2024-01-01'), // Different day to trigger update
          preferredInteractionTimes: []
        },
        createdAt: mockDate,
        updatedAt: mockDate
      };

      jest.spyOn(UserPreferencesService, 'getUserPreferences')
        .mockResolvedValue(mockPreferences);
      
      jest.spyOn(UserPreferencesService, 'updateEngagementHistory')
        .mockResolvedValue();

      await UserPreferencesService.trackDailyEngagement(mockUserId);

      expect(UserPreferencesService.updateEngagementHistory).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          totalDaysActive: expect.any(Number),
          streakDays: expect.any(Number)
        })
      );
    });

    it('should handle engagement tracking errors gracefully', async () => {
      jest.spyOn(UserPreferencesService, 'getUserPreferences')
        .mockRejectedValue(new Error('Database error'));

      // Should not throw error
      await expect(
        UserPreferencesService.trackDailyEngagement(mockUserId)
      ).resolves.not.toThrow();
    });
  });

  describe('syncPreferences', () => {
    it('should force refresh preferences from database', async () => {
      const mockRecord = {
        user_id: mockUserId,
        notification_time: '06:00:00',
        timezone: 'UTC',
        style_preferences: {},
        privacy_settings: {},
        engagement_history: {},
        created_at: mockDate.toISOString(),
        updated_at: mockDate.toISOString()
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockRecord, error: null })
          })
        })
      } as any);

      const result = await UserPreferencesService.syncPreferences(mockUserId);

      expect(result.userId).toBe(mockUserId);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences');
    });

    it('should create default preferences if none exist during sync', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } 
            })
          })
        })
      } as any);

      jest.spyOn(UserPreferencesService, 'createDefaultPreferences' as any)
        .mockResolvedValue({
          userId: mockUserId,
          timezone: 'UTC'
        } as UserPreferences);

      const result = await UserPreferencesService.syncPreferences(mockUserId);

      expect(result.userId).toBe(mockUserId);
    });
  });
});