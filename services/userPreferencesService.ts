// User Preferences Service - AYNA Mirror Settings Management
import { supabase } from '../config/supabaseClient';
import * as Location from 'expo-location';
import { 
  UserPreferences,
  NotificationPreferences,
  PrivacySettings,
  EngagementHistory,
  StyleProfile,
  ConfidenceNoteStyle,
  UserPreferencesRecord
} from '../types/aynaMirror';

/**
 * UserPreferencesService - Manages user settings and preferences for AYNA Mirror
 * 
 * This service handles:
 * - Notification timing and style preferences
 * - Privacy settings and data control
 * - Timezone detection and automatic adjustment
 * - Preference synchronization with Supabase backend
 * - User engagement tracking and adaptation
 */
export class UserPreferencesService {
  
  // ============================================================================
  // CORE PREFERENCE MANAGEMENT
  // ============================================================================

  /**
   * Get user preferences with fallback to defaults
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      console.log('[UserPreferencesService] Getting preferences for user:', userId);

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (!data) {
        // Create default preferences for new user
        console.log('[UserPreferencesService] Creating default preferences for new user');
        return await this.createDefaultPreferences(userId);
      }

      // Convert database record to UserPreferences interface
      return this.convertRecordToPreferences(data);

    } catch (error) {
      console.error('[UserPreferencesService] Failed to get user preferences:', error);
      // Return default preferences on error
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(
    userId: string, 
    updates: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      console.log('[UserPreferencesService] Updating preferences for user:', userId);

      // Get current preferences
      const currentPreferences = await this.getUserPreferences(userId);
      
      // Merge updates with current preferences
      const updatedPreferences: UserPreferences = {
        ...currentPreferences,
        ...updates,
        userId,
        updatedAt: new Date()
      };

      // Convert to database record format
      const record = this.convertPreferencesToRecord(updatedPreferences);

      // Upsert to database
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(record, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      console.log('[UserPreferencesService] Successfully updated preferences');
      return this.convertRecordToPreferences(data);

    } catch (error) {
      console.error('[UserPreferencesService] Failed to update preferences:', error);
      throw error;
    }
  }

  // ============================================================================
  // NOTIFICATION PREFERENCES
  // ============================================================================

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(
    userId: string,
    notificationPrefs: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      console.log('[UserPreferencesService] Updating notification preferences');

      const currentPreferences = await this.getUserPreferences(userId);
      
      // Update notification-related fields
      const updates: Partial<UserPreferences> = {};
      
      if (notificationPrefs.preferredTime) {
        updates.notificationTime = notificationPrefs.preferredTime;
      }
      
      if (notificationPrefs.timezone) {
        updates.timezone = notificationPrefs.timezone;
      }

      // Update style preferences if confidence note style changed
      if (notificationPrefs.confidenceNoteStyle) {
        updates.stylePreferences = {
          ...currentPreferences.stylePreferences,
          confidenceNoteStyle: notificationPrefs.confidenceNoteStyle
        };
      }

      await this.updateUserPreferences(userId, updates);

    } catch (error) {
      console.error('[UserPreferencesService] Failed to update notification preferences:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      return {
        preferredTime: preferences.notificationTime,
        timezone: preferences.timezone,
        enableWeekends: true, // Default to true, can be made configurable
        enableQuickOptions: true, // Default to true, can be made configurable
        confidenceNoteStyle: preferences.stylePreferences.confidenceNoteStyle || 'encouraging'
      };

    } catch (error) {
      console.error('[UserPreferencesService] Failed to get notification preferences:', error);
      // Return default notification preferences
      return {
        preferredTime: new Date('2024-01-01T06:00:00'),
        timezone: 'UTC',
        enableWeekends: true,
        enableQuickOptions: true,
        confidenceNoteStyle: 'encouraging'
      };
    }
  }

  // ============================================================================
  // PRIVACY SETTINGS
  // ============================================================================

  /**
   * Update privacy settings
   */
  static async updatePrivacySettings(
    userId: string,
    privacySettings: Partial<PrivacySettings>
  ): Promise<void> {
    try {
      console.log('[UserPreferencesService] Updating privacy settings');

      const updates: Partial<UserPreferences> = {
        privacySettings: {
          ...await this.getPrivacySettings(userId),
          ...privacySettings
        }
      };

      await this.updateUserPreferences(userId, updates);

    } catch (error) {
      console.error('[UserPreferencesService] Failed to update privacy settings:', error);
      throw error;
    }
  }

  /**
   * Get privacy settings
   */
  static async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    try {
      const preferences = await this.getUserPreferences(userId);
      return preferences.privacySettings;

    } catch (error) {
      console.error('[UserPreferencesService] Failed to get privacy settings:', error);
      // Return default privacy settings
      return {
        shareUsageData: false,
        allowLocationTracking: true,
        enableSocialFeatures: true,
        dataRetentionDays: 365
      };
    }
  }

  // ============================================================================
  // TIMEZONE MANAGEMENT
  // ============================================================================

  /**
   * Detect and update user's timezone automatically
   */
  static async detectAndUpdateTimezone(userId: string): Promise<string> {
    try {
      console.log('[UserPreferencesService] Detecting user timezone');

      // Get device timezone
      const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Try to get location-based timezone if location permission is granted
      let locationTimezone: string | null = null;
      
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low
          });
          
          // Use a timezone lookup service or library to get timezone from coordinates
          // For now, we'll use the device timezone as fallback
          locationTimezone = deviceTimezone;
        }
      } catch (locationError) {
        console.log('[UserPreferencesService] Could not get location for timezone detection');
      }

      const detectedTimezone = locationTimezone || deviceTimezone;
      
      // Update user preferences with detected timezone
      await this.updateUserPreferences(userId, {
        timezone: detectedTimezone
      });

      console.log('[UserPreferencesService] Updated timezone to:', detectedTimezone);
      return detectedTimezone;

    } catch (error) {
      console.error('[UserPreferencesService] Failed to detect timezone:', error);
      return 'UTC'; // Fallback to UTC
    }
  }

  /**
   * Handle timezone change (e.g., when user travels)
   */
  static async handleTimezoneChange(userId: string, newTimezone: string): Promise<void> {
    try {
      console.log('[UserPreferencesService] Handling timezone change to:', newTimezone);

      await this.updateUserPreferences(userId, {
        timezone: newTimezone
      });

      // TODO: Notify notification service to reschedule notifications
      // This will be integrated with the notification service in task 5

    } catch (error) {
      console.error('[UserPreferencesService] Failed to handle timezone change:', error);
      throw error;
    }
  }

  // ============================================================================
  // ENGAGEMENT TRACKING
  // ============================================================================

  /**
   * Update user engagement history
   */
  static async updateEngagementHistory(
    userId: string,
    engagementData: Partial<EngagementHistory>
  ): Promise<void> {
    try {
      const currentPreferences = await this.getUserPreferences(userId);
      const currentEngagement = currentPreferences.engagementHistory;

      const updatedEngagement: EngagementHistory = {
        ...currentEngagement,
        ...engagementData,
        lastActiveDate: new Date()
      };

      await this.updateUserPreferences(userId, {
        engagementHistory: updatedEngagement
      });

    } catch (error) {
      console.error('[UserPreferencesService] Failed to update engagement history:', error);
      throw error;
    }
  }

  /**
   * Track daily engagement
   */
  static async trackDailyEngagement(userId: string): Promise<void> {
    try {
      const preferences = await this.getUserPreferences(userId);
      const engagement = preferences.engagementHistory;
      
      const today = new Date();
      const lastActive = engagement.lastActiveDate;
      
      // Check if this is a new day of engagement
      const isNewDay = !lastActive || 
        today.toDateString() !== lastActive.toDateString();

      if (isNewDay) {
        // Check if streak continues (yesterday was active)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const streakContinues = lastActive && 
          lastActive.toDateString() === yesterday.toDateString();

        const newStreakDays = streakContinues ? engagement.streakDays + 1 : 1;

        await this.updateEngagementHistory(userId, {
          totalDaysActive: engagement.totalDaysActive + 1,
          streakDays: newStreakDays,
          lastActiveDate: today
        });
      }

    } catch (error) {
      console.error('[UserPreferencesService] Failed to track daily engagement:', error);
    }
  }

  // ============================================================================
  // STYLE PREFERENCES
  // ============================================================================

  /**
   * Update style preferences
   */
  static async updateStylePreferences(
    userId: string,
    styleUpdates: Partial<StyleProfile>
  ): Promise<void> {
    try {
      const currentPreferences = await this.getUserPreferences(userId);
      
      const updatedStyleProfile: StyleProfile = {
        ...currentPreferences.stylePreferences,
        ...styleUpdates,
        userId,
        lastUpdated: new Date()
      };

      await this.updateUserPreferences(userId, {
        stylePreferences: updatedStyleProfile
      });

    } catch (error) {
      console.error('[UserPreferencesService] Failed to update style preferences:', error);
      throw error;
    }
  }

  // ============================================================================
  // PREFERENCE SYNCHRONIZATION
  // ============================================================================

  /**
   * Sync preferences with backend (force refresh from database)
   */
  static async syncPreferences(userId: string): Promise<UserPreferences> {
    try {
      console.log('[UserPreferencesService] Syncing preferences with backend');

      // Force fetch from database (bypass any caching)
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create default preferences if none exist
        return await this.createDefaultPreferences(userId);
      }

      return this.convertRecordToPreferences(data);

    } catch (error) {
      console.error('[UserPreferencesService] Failed to sync preferences:', error);
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Create default preferences for a new user
   */
  private static async createDefaultPreferences(userId: string): Promise<UserPreferences> {
    try {
      const defaultPreferences = this.getDefaultPreferences(userId);
      
      // Detect timezone for new user
      const detectedTimezone = await this.detectAndUpdateTimezone(userId);
      defaultPreferences.timezone = detectedTimezone;

      // Save to database
      const record = this.convertPreferencesToRecord(defaultPreferences);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .insert(record)
        .select()
        .single();

      if (error) throw error;

      return this.convertRecordToPreferences(data);

    } catch (error) {
      console.error('[UserPreferencesService] Failed to create default preferences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Get default preferences structure
   */
  private static getDefaultPreferences(userId: string): UserPreferences {
    const now = new Date();
    const sixAM = new Date();
    sixAM.setHours(6, 0, 0, 0);

    return {
      userId,
      notificationTime: sixAM,
      timezone: 'UTC',
      stylePreferences: {
        userId,
        preferredColors: [],
        preferredStyles: [],
        bodyTypePreferences: [],
        occasionPreferences: {},
        confidencePatterns: [],
        confidenceNoteStyle: 'encouraging',
        lastUpdated: now
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
        lastActiveDate: now,
        preferredInteractionTimes: [sixAM]
      },
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Convert database record to UserPreferences interface
   */
  private static convertRecordToPreferences(record: UserPreferencesRecord): UserPreferences {
    return {
      userId: record.user_id,
      notificationTime: this.parseTimeString(record.notification_time),
      timezone: record.timezone,
      stylePreferences: {
        userId: record.user_id,
        preferredColors: record.style_preferences?.preferredColors || [],
        preferredStyles: record.style_preferences?.preferredStyles || [],
        bodyTypePreferences: record.style_preferences?.bodyTypePreferences || [],
        occasionPreferences: record.style_preferences?.occasionPreferences || {},
        confidencePatterns: record.style_preferences?.confidencePatterns || [],
        confidenceNoteStyle: record.style_preferences?.confidenceNoteStyle || 'encouraging',
        lastUpdated: new Date(record.updated_at)
      },
      privacySettings: {
        shareUsageData: record.privacy_settings?.shareUsageData ?? false,
        allowLocationTracking: record.privacy_settings?.allowLocationTracking ?? true,
        enableSocialFeatures: record.privacy_settings?.enableSocialFeatures ?? true,
        dataRetentionDays: record.privacy_settings?.dataRetentionDays ?? 365
      },
      engagementHistory: {
        totalDaysActive: record.engagement_history?.totalDaysActive || 0,
        streakDays: record.engagement_history?.streakDays || 0,
        averageRating: record.engagement_history?.averageRating || 0,
        lastActiveDate: record.engagement_history?.lastActiveDate ? 
          new Date(record.engagement_history.lastActiveDate) : new Date(),
        preferredInteractionTimes: record.engagement_history?.preferredInteractionTimes?.map(
          (time: string) => new Date(time)
        ) || []
      },
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at)
    };
  }

  /**
   * Convert UserPreferences to database record format
   */
  private static convertPreferencesToRecord(preferences: UserPreferences): Omit<UserPreferencesRecord, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string } {
    return {
      user_id: preferences.userId,
      notification_time: this.formatTimeString(preferences.notificationTime),
      timezone: preferences.timezone,
      style_preferences: {
        preferredColors: preferences.stylePreferences.preferredColors,
        preferredStyles: preferences.stylePreferences.preferredStyles,
        bodyTypePreferences: preferences.stylePreferences.bodyTypePreferences,
        occasionPreferences: preferences.stylePreferences.occasionPreferences,
        confidencePatterns: preferences.stylePreferences.confidencePatterns,
        confidenceNoteStyle: preferences.stylePreferences.confidenceNoteStyle
      },
      privacy_settings: preferences.privacySettings,
      engagement_history: {
        ...preferences.engagementHistory,
        lastActiveDate: preferences.engagementHistory.lastActiveDate.toISOString(),
        preferredInteractionTimes: preferences.engagementHistory.preferredInteractionTimes.map(
          time => time.toISOString()
        )
      },
      created_at: preferences.createdAt.toISOString(),
      updated_at: preferences.updatedAt.toISOString()
    };
  }

  /**
   * Parse time string (HH:MM:SS) to Date object
   */
  private static parseTimeString(timeString: string): Date {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds || 0, 0);
    return date;
  }

  /**
   * Format Date object to time string (HH:MM:SS)
   */
  private static formatTimeString(date: Date): string {
    return date.toTimeString().split(' ')[0]; // Gets HH:MM:SS part
  }
}

// Export singleton instance for convenience
export const userPreferencesService = UserPreferencesService;