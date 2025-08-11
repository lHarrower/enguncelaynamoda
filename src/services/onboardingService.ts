// Onboarding Service - Handles user onboarding flow and data persistence
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/config/supabaseClient';
// OnboardingFlow doesn't export types; define a local shape for persisted data
export interface OnboardingData {
  notificationPermissionGranted: boolean;
  wardrobeItemsAdded: number;
  stylePreferences?: any;
  completedAt: Date;
}
import { StylePreferences } from '@/components/onboarding/StylePreferenceQuestionnaire';
import notificationService from '@/services/notificationService';
import { logInDev, errorInDev } from '@/utils/consoleSuppress';

const ONBOARDING_STORAGE_KEY = 'ayna_onboarding_completed';
const STYLE_PREFERENCES_STORAGE_KEY = 'ayna_style_preferences';

export interface OnboardingStatus {
  isCompleted: boolean;
  completedAt?: Date;
  stylePreferences?: StylePreferences;
  notificationPermissionGranted: boolean;
}

class OnboardingService {
  private static instance: OnboardingService;

  private constructor() {}

  static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  /**
   * Check if user has completed onboarding
   */
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      return completed === 'true';
    } catch (error) {
      errorInDev('Failed to check onboarding status:', error);
      return false;
    }
  }

  /**
   * Get complete onboarding status
   */
  async getOnboardingStatus(): Promise<OnboardingStatus> {
    try {
      const [completed, stylePrefsData] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_STORAGE_KEY),
        AsyncStorage.getItem(STYLE_PREFERENCES_STORAGE_KEY)
      ]);

      const isCompleted = completed === 'true';
      const stylePreferences = stylePrefsData ? JSON.parse(stylePrefsData) : undefined;
      
      // Check notification permissions
      const notificationPermissionGranted = await notificationService.areNotificationsEnabled();

      return {
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
        stylePreferences,
        notificationPermissionGranted,
      };
    } catch (error) {
      errorInDev('Failed to get onboarding status:', error);
      return {
        isCompleted: false,
        notificationPermissionGranted: false,
      };
    }
  }

  /**
   * Complete onboarding and save user data
   */
  async completeOnboarding(data: OnboardingData, userId?: string): Promise<void> {
    try {
      // Save onboarding completion locally
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      
      // Save style preferences locally
      if (data.stylePreferences) {
        await AsyncStorage.setItem(
          STYLE_PREFERENCES_STORAGE_KEY, 
          JSON.stringify(data.stylePreferences)
        );
      }

      // Save to Supabase if user is authenticated
      if (userId) {
        await this.saveOnboardingDataToSupabase(userId, data);
      }

      // Set up notifications if permission was granted
      if (data.notificationPermissionGranted) {
        await this.setupDailyNotifications(userId);
      }

      logInDev('Onboarding completed successfully');
    } catch (error) {
      errorInDev('Failed to complete onboarding:', error);
      throw error;
    }
  }

  /**
   * Save onboarding data to Supabase
   */
  private async saveOnboardingDataToSupabase(userId: string, data: OnboardingData): Promise<void> {
    try {
      // Save to user_preferences table
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          style_preferences: data.stylePreferences || {},
          notification_preferences: {
            enabled: data.notificationPermissionGranted,
            preferred_time: '06:00:00',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            confidence_note_style: data.stylePreferences?.confidenceNoteStyle || 'encouraging',
          },
          onboarding_completed_at: data.completedAt.toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        errorInDev('Failed to save onboarding data to Supabase:', error);
        throw error;
      }

      logInDev('Onboarding data saved to Supabase successfully');
    } catch (error) {
      errorInDev('Error saving onboarding data to Supabase:', error);
      // Don't throw here - we want onboarding to complete even if Supabase fails
    }
  }

  /**
   * Set up daily notifications after onboarding
   */
  private async setupDailyNotifications(userId?: string): Promise<void> {
    try {
      if (!userId) {
        logInDev('Cannot setup notifications without user ID');
        return;
      }

      // Initialize notification service
      const initialized = await notificationService.initialize();
      if (!initialized) {
        logInDev('Failed to initialize notification service');
        return;
      }

      // Schedule daily notifications with default preferences
      const defaultPreferences = {
        preferredTime: new Date(0, 0, 0, 6, 0, 0), // 6:00 AM
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        enableWeekends: true,
        enableQuickOptions: true,
        confidenceNoteStyle: 'encouraging' as const,
      };

      await notificationService.scheduleDailyMirrorNotification(userId, defaultPreferences);
      logInDev('Daily notifications set up successfully');
    } catch (error) {
      errorInDev('Failed to setup daily notifications:', error);
      // Don't throw - onboarding should complete even if notifications fail
    }
  }

  /**
   * Update style preferences after onboarding
   */
  async updateStylePreferences(preferences: StylePreferences, userId?: string): Promise<void> {
    try {
      // Save locally
      await AsyncStorage.setItem(
        STYLE_PREFERENCES_STORAGE_KEY, 
        JSON.stringify(preferences)
      );

      // Save to Supabase if user is authenticated
      if (userId) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            style_preferences: preferences,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          errorInDev('Failed to update style preferences in Supabase:', error);
        }
      }

      logInDev('Style preferences updated successfully');
    } catch (error) {
      errorInDev('Failed to update style preferences:', error);
      throw error;
    }
  }

  /**
   * Get saved style preferences
   */
  async getStylePreferences(): Promise<StylePreferences | null> {
    try {
      const data = await AsyncStorage.getItem(STYLE_PREFERENCES_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      errorInDev('Failed to get style preferences:', error);
      return null;
    }
  }

  /**
   * Reset onboarding (for testing purposes)
   */
  async resetOnboarding(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY),
        AsyncStorage.removeItem(STYLE_PREFERENCES_STORAGE_KEY),
      ]);
      logInDev('Onboarding reset successfully');
    } catch (error) {
      errorInDev('Failed to reset onboarding:', error);
      throw error;
    }
  }

  /**
   * Bootstrap intelligence service with onboarding data
   */
  async bootstrapIntelligenceService(userId: string, preferences: StylePreferences): Promise<void> {
    try {
      // Create initial style profile based on onboarding preferences
      const initialStyleProfile = {
        userId,
        preferredColors: preferences.preferredColors,
        preferredStyles: preferences.preferredStyles,
        bodyTypePreferences: preferences.bodyTypePreferences || [],
        occasionPreferences: this.convertOccasionsToPreferences(preferences.occasions),
        confidencePatterns: [], // Will be built over time
        lastUpdated: new Date(),
      };

      // Save initial style profile to Supabase
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          style_preferences: initialStyleProfile,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        errorInDev('Failed to bootstrap intelligence service:', error);
      } else {
        logInDev('Intelligence service bootstrapped successfully');
      }
    } catch (error) {
      errorInDev('Error bootstrapping intelligence service:', error);
    }
  }

  /**
   * Convert occasion array to preference scores
   */
  private convertOccasionsToPreferences(occasions: string[]): Record<string, number> {
    const preferences: Record<string, number> = {};
    
    // Give each selected occasion a high preference score
    occasions.forEach(occasion => {
      preferences[occasion] = 4.5; // High preference (out of 5)
    });

    return preferences;
  }

  /**
   * Check if user needs to see onboarding
   */
  async shouldShowOnboarding(): Promise<boolean> {
    try {
      const isCompleted = await this.isOnboardingCompleted();
      return !isCompleted;
    } catch (error) {
      errorInDev('Failed to check if should show onboarding:', error);
      return true; // Show onboarding if we can't determine status
    }
  }
}

export default OnboardingService.getInstance();