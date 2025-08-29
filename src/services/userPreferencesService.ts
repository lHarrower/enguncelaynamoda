// User Preferences Service - AYNA Mirror Settings Management
import * as Location from 'expo-location';

import { supabase } from '@/config/supabaseClient';
import { errorInDev, logInDev } from '@/utils/consoleSuppress';
import { ensureSupabaseOk } from '@/utils/supabaseErrorMapping';
import { isSupabaseOk, wrap } from '@/utils/supabaseResult';

import {
  EngagementHistory,
  isConfidenceNoteStyle,
  NotificationPreferences,
  PrivacySettings,
  StyleProfile,
  UserPreferences,
  UserPreferencesRecord,
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
      logInDev('[UserPreferencesService] Getting preferences for user:', userId);

      const res = await wrap(
        async () =>
          await supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
      );

      if (!isSupabaseOk(res) && (res.error as { code?: string })?.code !== 'PGRST116') {
        // Use ensureSupabaseOk for non-PGRST116 errors (record not found handled below)
        ensureSupabaseOk(res, { action: 'getUserPreferences' });
      }

      if (!isSupabaseOk(res)) {
        // PGRST116 -> create defaults
        // Create default preferences for new user
        logInDev('[UserPreferencesService] Creating default preferences for new user');
        return await this.createDefaultPreferences(userId);
      }

      // Convert database record to UserPreferences interface
      const data = ensureSupabaseOk(res, {
        action: 'createDefaultPreferences',
      }) as UserPreferencesRecord;
      return this.convertRecordToPreferences(data);
    } catch (error) {
      errorInDev(
        '[UserPreferencesService] Failed to get user preferences:',
        error instanceof Error ? error : String(error),
      );
      // Return default preferences on error
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(
    userId: string,
    updates: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    try {
      logInDev('[UserPreferencesService] Updating preferences for user:', userId);

      // Get current preferences
      const currentPreferences = await this.getUserPreferences(userId);

      // Merge updates with current preferences
      const updatedPreferences: UserPreferences = {
        ...currentPreferences,
        ...updates,
        userId,
        updatedAt: new Date(),
      };

      // Convert to database record format
      const record = this.convertPreferencesToRecord(updatedPreferences);

      // Upsert to database
      const res = await wrap(
        async () =>
          await supabase
            .from('user_preferences')
            .upsert(record, { onConflict: 'user_id' })
            .select()
            .single(),
      );
      const data = ensureSupabaseOk(res, {
        action: 'updateUserPreferences',
      }) as UserPreferencesRecord;

      logInDev('[UserPreferencesService] Successfully updated preferences');
      return this.convertRecordToPreferences(data);
    } catch (error) {
      errorInDev(
        '[UserPreferencesService] Failed to update preferences:',
        error instanceof Error ? error : String(error),
      );
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
    notificationPrefs: Partial<NotificationPreferences>,
  ): Promise<void> {
    try {
      logInDev('[UserPreferencesService] Updating notification preferences');

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
          confidenceNoteStyle: notificationPrefs.confidenceNoteStyle,
        };
      }

      await this.updateUserPreferences(userId, updates);
    } catch (error) {
      errorInDev(
        '[UserPreferencesService] Failed to update notification preferences:',
        error instanceof Error ? error : String(error),
      );
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
        confidenceNoteStyle: preferences.stylePreferences.confidenceNoteStyle || 'encouraging',
      };
    } catch (error) {
      errorInDev(
        '[UserPreferencesService] Failed to get notification preferences:',
        error instanceof Error ? error : String(error),
      );
      // Return default notification preferences
      return {
        preferredTime: new Date('2024-01-01T06:00:00'),
        timezone: 'UTC',
        enableWeekends: true,
        enableQuickOptions: true,
        confidenceNoteStyle: 'encouraging',
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
    privacySettings: Partial<PrivacySettings>,
  ): Promise<void> {
    try {
      logInDev('[UserPreferencesService] Updating privacy settings');

      const updates: Partial<UserPreferences> = {
        privacySettings: {
          ...(await this.getPrivacySettings(userId)),
          ...privacySettings,
        },
      };

      await this.updateUserPreferences(userId, updates);
    } catch (error) {
      errorInDev(
        '[UserPreferencesService] Failed to update privacy settings:',
        error instanceof Error ? error : String(error),
      );
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
      errorInDev(
        '[UserPreferencesService] Failed to get privacy settings:',
        error instanceof Error ? error : String(error),
      );
      // Return default privacy settings
      return {
        shareUsageData: false,
        allowLocationTracking: true,
        enableSocialFeatures: true,
        dataRetentionDays: 365,
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
      logInDev('[UserPreferencesService] Detecting user timezone');

      // Get device timezone
      const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Try to get location-based timezone if location permission is granted
      let locationTimezone: string | null = null;

      try {
        const { status } = await Location.getForegroundPermissionsAsync();

        if (status === Location.PermissionStatus.GRANTED) {
          const _location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
          });

          // Use a timezone lookup service or library to get timezone from coordinates
          // For now, we'll use the device timezone as fallback
          locationTimezone = deviceTimezone;
        }
      } catch (locationError) {
        logInDev('[UserPreferencesService] Could not get location for timezone detection');
      }

      const detectedTimezone = locationTimezone || deviceTimezone;

      // Update user preferences with detected timezone
      await this.updateUserPreferences(userId, {
        timezone: detectedTimezone,
      });

      logInDev('[UserPreferencesService] Updated timezone to:', detectedTimezone);
      return detectedTimezone;
    } catch (error) {
      errorInDev(
        '[UserPreferencesService] Failed to detect timezone:',
        error instanceof Error ? error : String(error),
      );
      return 'UTC'; // Fallback to UTC
    }
  }

  /**
   * Handle timezone change (e.g., when user travels)
   */
  static async handleTimezoneChange(userId: string, newTimezone: string): Promise<void> {
    try {
      logInDev('[UserPreferencesService] Handling timezone change to:', newTimezone);

      await this.updateUserPreferences(userId, {
        timezone: newTimezone,
      });

      // Notify notification service to reschedule notifications
      try {
        const { notificationService } = await import('./notificationService');
        await notificationService.handleTimezoneChange(userId, newTimezone);
        logInDev(
          '[UserPreferencesService] Successfully rescheduled notifications for new timezone',
        );
      } catch (notificationError) {
        errorInDev(
          '[UserPreferencesService] Failed to reschedule notifications:',
          notificationError instanceof Error ? notificationError : String(notificationError),
        );
        // Don't throw - timezone update should succeed even if notification rescheduling fails
      }
    } catch (error) {
      errorInDev(
        '[UserPreferencesService] Failed to handle timezone change:',
        error instanceof Error ? error : String(error),
      );
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
    engagementData: Partial<EngagementHistory>,
  ): Promise<void> {
    try {
      const currentPreferences = await this.getUserPreferences(userId);
      const currentEngagement = currentPreferences.engagementHistory;

      const updatedEngagement: EngagementHistory = {
        ...currentEngagement,
        ...engagementData,
        lastActiveDate: new Date(),
      };

      await this.updateUserPreferences(userId, {
        engagementHistory: updatedEngagement,
      });
    } catch (error) {
      errorInDev(
        '[UserPreferencesService] Failed to update engagement history:',
        error instanceof Error ? error : String(error),
      );
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
      const isNewDay = !lastActive || today.toDateString() !== lastActive.toDateString();

      if (isNewDay) {
        // Check if streak continues (yesterday was active)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const streakContinues =
          lastActive && lastActive.toDateString() === yesterday.toDateString();

        const newStreakDays = streakContinues ? engagement.streakDays + 1 : 1;

        await this.updateEngagementHistory(userId, {
          totalDaysActive: engagement.totalDaysActive + 1,
          streakDays: newStreakDays,
          lastActiveDate: today,
        });
      }
    } catch (error) {
      errorInDev(
        '[UserPreferencesService] Failed to track daily engagement:',
        error instanceof Error ? error : String(error),
      );
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
    styleUpdates: Partial<StyleProfile>,
  ): Promise<void> {
    try {
      const currentPreferences = await this.getUserPreferences(userId);

      const updatedStyleProfile: StyleProfile = {
        ...currentPreferences.stylePreferences,
        ...styleUpdates,
        userId,
        lastUpdated: new Date(),
      };

      await this.updateUserPreferences(userId, {
        stylePreferences: updatedStyleProfile,
      });
    } catch (error) {
      errorInDev(
        '[UserPreferencesService] Failed to update style preferences:',
        error instanceof Error ? error : String(error),
      );
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
      logInDev('[UserPreferencesService] Syncing preferences with backend');

      // Force fetch from database (bypass any caching)
      const res = await wrap(
        async () =>
          await supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
      );

      if (!isSupabaseOk(res) && (res.error as { code?: string })?.code !== 'PGRST116') {
        ensureSupabaseOk(res, { action: 'syncPreferences' });
      }

      if (!isSupabaseOk(res)) {
        // PGRST116 -> create defaults
        // Create default preferences if none exist
        return await this.createDefaultPreferences(userId);
      }
      return this.convertRecordToPreferences(res.data as UserPreferencesRecord);
    } catch (error) {
      errorInDev(
        '[UserPreferencesService] Failed to sync preferences:',
        error instanceof Error ? error : String(error),
      );
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

      // Detect timezone WITHOUT writing to DB yet to avoid recursive create -> update loop
      // (Previously detectAndUpdateTimezone called updateUserPreferences which could re-enter createDefaultPreferences)
      const detectedTimezone = await this.detectTimezone();
      defaultPreferences.timezone = detectedTimezone;

      // Persist the freshly prepared default preferences
      const record = this.convertPreferencesToRecord(defaultPreferences);

      const res = await wrap(
        async () => await supabase.from('user_preferences').insert(record).select().single(),
      );
      const data = ensureSupabaseOk(res, {
        action: 'createDefaultPreferences',
      }) as UserPreferencesRecord;
      return this.convertRecordToPreferences(data);
    } catch (error) {
      errorInDev(
        '[UserPreferencesService] Failed to create default preferences:',
        error instanceof Error ? error : String(error),
      );
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
        lastUpdated: now,
      },
      privacySettings: {
        shareUsageData: false,
        allowLocationTracking: true,
        enableSocialFeatures: true,
        dataRetentionDays: 365,
      },
      engagementHistory: {
        totalDaysActive: 0,
        streakDays: 0,
        averageRating: 0,
        lastActiveDate: now,
        preferredInteractionTimes: [sixAM],
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Convert database record to UserPreferences interface
   */
  private static convertRecordToPreferences(record: UserPreferencesRecord): UserPreferences {
    const safeObj = (val: unknown): Record<string, unknown> =>
      val && typeof val === 'object' ? (val as Record<string, unknown>) : {};

    const styleRaw = safeObj(record.style_preferences);
    const privacyRaw = safeObj(record.privacy_settings);
    const engagementRaw = safeObj(record.engagement_history);

    return {
      userId: record.user_id,
      notificationTime: this.parseTimeString(record.notification_time),
      timezone: typeof record.timezone === 'string' && record.timezone ? record.timezone : 'UTC',
      stylePreferences: this.convertStylePreferences(record.user_id, styleRaw, record.updated_at),
      privacySettings: this.convertPrivacySettings(privacyRaw),
      engagementHistory: this.convertEngagementHistory(engagementRaw),
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    };
  }

  /**
   * Convert style preferences from database record
   */
  private static convertStylePreferences(
    userId: string,
    styleRaw: Record<string, unknown>,
    updatedAt: string,
  ) {
    return {
      userId,
      preferredColors: this.extractStringArray(styleRaw.preferredColors),
      preferredStyles: this.extractStringArray(styleRaw.preferredStyles),
      bodyTypePreferences: this.extractStringArray(styleRaw.bodyTypePreferences),
      occasionPreferences:
        typeof styleRaw.occasionPreferences === 'object' && styleRaw.occasionPreferences
          ? (styleRaw.occasionPreferences as Record<string, number>)
          : {},
      confidencePatterns: this.convertConfidencePatterns(styleRaw.confidencePatterns),
      confidenceNoteStyle: isConfidenceNoteStyle(styleRaw.confidenceNoteStyle)
        ? styleRaw.confidenceNoteStyle
        : 'encouraging',
      lastUpdated: new Date(updatedAt),
    };
  }

  /**
   * Convert privacy settings from database record
   */
  private static convertPrivacySettings(privacyRaw: Record<string, unknown>) {
    return {
      shareUsageData:
        typeof privacyRaw.shareUsageData === 'boolean' ? privacyRaw.shareUsageData : false,
      allowLocationTracking:
        typeof privacyRaw.allowLocationTracking === 'boolean'
          ? privacyRaw.allowLocationTracking
          : true,
      enableSocialFeatures:
        typeof privacyRaw.enableSocialFeatures === 'boolean'
          ? privacyRaw.enableSocialFeatures
          : true,
      dataRetentionDays:
        typeof privacyRaw.dataRetentionDays === 'number' ? privacyRaw.dataRetentionDays : 365,
    };
  }

  /**
   * Convert engagement history from database record
   */
  private static convertEngagementHistory(engagementRaw: Record<string, unknown>) {
    const preferredInteractionTimes = Array.isArray(engagementRaw.preferredInteractionTimes)
      ? (engagementRaw.preferredInteractionTimes as unknown[])
          .filter((t): t is string => typeof t === 'string')
          .map((t) => new Date(t))
      : [];

    return {
      totalDaysActive:
        typeof engagementRaw.totalDaysActive === 'number' ? engagementRaw.totalDaysActive : 0,
      streakDays: typeof engagementRaw.streakDays === 'number' ? engagementRaw.streakDays : 0,
      averageRating:
        typeof engagementRaw.averageRating === 'number' ? engagementRaw.averageRating : 0,
      lastActiveDate:
        typeof engagementRaw.lastActiveDate === 'string'
          ? new Date(engagementRaw.lastActiveDate)
          : new Date(),
      preferredInteractionTimes,
    };
  }

  /**
   * Extract string array from unknown value
   */
  private static extractStringArray(value: unknown): string[] {
    return Array.isArray(value)
      ? (value as unknown[]).filter((c): c is string => typeof c === 'string')
      : [];
  }

  /**
   * Convert confidence patterns from database record
   */
  private static convertConfidencePatterns(patterns: unknown) {
    if (!Array.isArray(patterns)) {
      return [];
    }

    return (patterns as unknown[])
      .filter(
        (c): c is string | Record<string, unknown> =>
          typeof c === 'string' || (c !== null && typeof c === 'object'),
      )
      .map((c) => this.normalizeConfidencePattern(c));
  }

  /**
   * Normalize confidence pattern from string or object
   */
  private static normalizeConfidencePattern(pattern: string | Record<string, unknown>) {
    if (typeof pattern === 'string') {
      return {
        itemCombination: [],
        averageRating: 0,
        contextFactors: [],
        emotionalResponse: [pattern],
      };
    }

    const obj = pattern;
    return {
      itemCombination: this.extractStringArray(obj.itemCombination),
      averageRating: typeof obj.averageRating === 'number' ? obj.averageRating : 0,
      contextFactors: this.extractStringArray(obj.contextFactors),
      emotionalResponse: this.extractStringArray(obj.emotionalResponse),
    };
  }

  /**
   * Convert UserPreferences to database record format
   */
  private static convertPreferencesToRecord(preferences: UserPreferences): Omit<
    UserPreferencesRecord,
    'created_at' | 'updated_at'
  > & {
    created_at?: string;
    updated_at?: string;
  } {
    return {
      user_id: preferences.userId,
      notification_time: this.formatTimeString(preferences.notificationTime),
      timezone: preferences.timezone,
      style_preferences: {
        preferredColors: preferences.stylePreferences.preferredColors,
        preferredStyles: preferences.stylePreferences.preferredStyles,
        bodyTypePreferences: preferences.stylePreferences.bodyTypePreferences,
        occasionPreferences: preferences.stylePreferences.occasionPreferences,
        // Persist only minimal string representation for patterns (emotionalResponse tags) to keep JSON lean
        confidencePatterns: preferences.stylePreferences.confidencePatterns.map(
          (p) => p.emotionalResponse[0] || 'pattern',
        ),
        confidenceNoteStyle: preferences.stylePreferences.confidenceNoteStyle,
      },
      privacy_settings: preferences.privacySettings,
      engagement_history: {
        totalDaysActive: preferences.engagementHistory.totalDaysActive,
        streakDays: preferences.engagementHistory.streakDays,
        averageRating: preferences.engagementHistory.averageRating,
        lastActiveDate: preferences.engagementHistory.lastActiveDate.toISOString(),
        preferredInteractionTimes: preferences.engagementHistory.preferredInteractionTimes.map(
          (time) => time.toISOString(),
        ),
        averageOpenTime: preferences.engagementHistory.averageOpenTime
          ? preferences.engagementHistory.averageOpenTime.toISOString()
          : undefined,
      },
      created_at: preferences.createdAt.toISOString(),
      updated_at: preferences.updatedAt.toISOString(),
    };
  }

  /**
   * Parse time string (HH:MM:SS) to Date object
   */
  private static parseTimeString(timeString: string): Date {
    const date = new Date();
    if (typeof timeString === 'string') {
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        const hours = Number(parts[0]);
        const minutes = Number(parts[1]);
        const seconds = parts[2] ? Number(parts[2]) : 0;
        if (
          Number.isFinite(hours) &&
          Number.isFinite(minutes) &&
          hours >= 0 &&
          hours < 24 &&
          minutes >= 0 &&
          minutes < 60 &&
          Number.isFinite(seconds) &&
          seconds >= 0 &&
          seconds < 60
        ) {
          date.setHours(hours, minutes, seconds, 0);
          return date;
        }
      }
    }
    // Fallback: 06:00:00
    date.setHours(6, 0, 0, 0);
    return date;
  }

  /**
   * Lightweight timezone detection without persisting changes (used during initial creation)
   */
  private static async detectTimezone(): Promise<string> {
    try {
      const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      let locationTimezone: string | null = null;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === Location.PermissionStatus.GRANTED) {
          await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
          // Use device timezone as location-based timezone (future: derive from coordinates)
          locationTimezone = deviceTimezone;
        }
      } catch {
        // Ignore detection errors, fallback below
      }
      return locationTimezone || deviceTimezone || 'UTC';
    } catch {
      return 'UTC';
    }
  }

  /**
   * Format Date object to time string (HH:MM:SS)
   */
  private static formatTimeString(date: Date): string {
    const str = date.toTimeString();
    if (typeof str === 'string') {
      const first = str.split(' ')[0];
      if (first && first.includes(':')) {
        return first;
      }
    }
    return '06:00:00';
  }
}

// Export singleton instance for convenience
export const userPreferencesService = UserPreferencesService;
