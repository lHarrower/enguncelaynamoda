// User Preferences Integration Tests
import { UserPreferencesService } from '../services/userPreferencesService';
import { supabase } from '../config/supabaseClient';

// Mock dependencies
jest.mock('../config/supabaseClient');
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: {
    Low: 1
  }
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('UserPreferencesService Integration', () => {
  const mockUserId = 'integration-test-user';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle complete preference management flow', async () => {
    // Mock database responses for the complete flow
    let callCount = 0;
    
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              // First call - no preferences exist
              return Promise.resolve({ 
                data: null, 
                error: { code: 'PGRST116' } 
              });
            } else {
              // Subsequent calls - return created preferences
              return Promise.resolve({
                data: {
                  user_id: mockUserId,
                  notification_time: '06:00:00',
                  timezone: 'UTC',
                  style_preferences: {
                    preferredColors: [],
                    preferredStyles: [],
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
                    totalDaysActive: 0,
                    streakDays: 0,
                    averageRating: 0,
                    lastActiveDate: null,
                    preferredInteractionTimes: []
                  },
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                error: null
              });
            }
          })
        })
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              user_id: mockUserId,
              notification_time: '06:00:00',
              timezone: 'UTC',
              style_preferences: {},
              privacy_settings: {},
              engagement_history: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            error: null
          })
        })
      }),
      upsert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              user_id: mockUserId,
              notification_time: '07:00:00',
              timezone: 'America/New_York',
              style_preferences: {
                confidenceNoteStyle: 'witty'
              },
              privacy_settings: {
                shareUsageData: true,
                allowLocationTracking: true,
                enableSocialFeatures: true,
                dataRetentionDays: 365
              },
              engagement_history: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            error: null
          })
        })
      })
    } as any));

    // Step 1: Get preferences for new user (should create defaults)
    const initialPreferences = await UserPreferencesService.getUserPreferences(mockUserId);
    expect(initialPreferences.userId).toBe(mockUserId);
    expect(initialPreferences.timezone).toBe('UTC');

    // Step 2: Update notification preferences
    await UserPreferencesService.updateNotificationPreferences(mockUserId, {
      preferredTime: new Date('2024-01-01T07:00:00'),
      timezone: 'America/New_York',
      confidenceNoteStyle: 'witty',
      enableWeekends: true,
      enableQuickOptions: true
    });

    // Step 3: Update privacy settings
    await UserPreferencesService.updatePrivacySettings(mockUserId, {
      shareUsageData: true
    });

    // Step 4: Track engagement
    await UserPreferencesService.trackDailyEngagement(mockUserId);

    // Step 5: Sync preferences
    const syncedPreferences = await UserPreferencesService.syncPreferences(mockUserId);
    expect(syncedPreferences.userId).toBe(mockUserId);

    // Verify all database operations were called
    expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences');
  });

  it('should handle error scenarios gracefully', async () => {
    // Mock database error
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' }
          })
        })
      })
    } as any);

    // Should return default preferences on error
    const preferences = await UserPreferencesService.getUserPreferences(mockUserId);
    expect(preferences.userId).toBe(mockUserId);
    expect(preferences.timezone).toBe('UTC');
  });

  it('should maintain data consistency across operations', async () => {
    const mockPreferencesData = {
      user_id: mockUserId,
      notification_time: '06:00:00',
      timezone: 'UTC',
      style_preferences: {
        preferredColors: ['blue', 'black'],
        preferredStyles: ['casual'],
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
        averageRating: 4.2
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPreferencesData,
            error: null
          })
        })
      })
    } as any);

    const preferences = await UserPreferencesService.getUserPreferences(mockUserId);
    
    // Verify data transformation consistency
    expect(preferences.stylePreferences.preferredColors).toEqual(['blue', 'black']);
    expect(preferences.stylePreferences.preferredStyles).toEqual(['casual']);
    expect(preferences.privacySettings.shareUsageData).toBe(false);
    expect(preferences.engagementHistory.totalDaysActive).toBe(5);
  });
});