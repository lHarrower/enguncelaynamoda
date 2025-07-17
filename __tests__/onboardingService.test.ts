import AsyncStorage from '@react-native-async-storage/async-storage';
import onboardingService from '../services/onboardingService';
import { OnboardingData } from '../components/onboarding/OnboardingFlow';
import { StylePreferences } from '../components/onboarding/StylePreferenceQuestionnaire';
import notificationService from '../services/notificationService';
import { supabase } from '../config/supabaseClient';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../config/supabaseClient');
jest.mock('../services/notificationService');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('OnboardingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockClear();
    mockAsyncStorage.setItem.mockClear();
    mockAsyncStorage.removeItem.mockClear();
    mockNotificationService.areNotificationsEnabled.mockResolvedValue(false);
    mockNotificationService.initialize.mockResolvedValue(true);
    mockNotificationService.scheduleDailyMirrorNotification.mockResolvedValue();
    
    // Reset Supabase mocks
    mockSupabase.from.mockClear();
    (mockSupabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    });
  });

  describe('isOnboardingCompleted', () => {
    it('returns true when onboarding is completed', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('true');
      
      const result = await onboardingService.isOnboardingCompleted();
      
      expect(result).toBe(true);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('ayna_onboarding_completed');
    });

    it('returns false when onboarding is not completed', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await onboardingService.isOnboardingCompleted();
      
      expect(result).toBe(false);
    });

    it('returns false when AsyncStorage throws error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const result = await onboardingService.isOnboardingCompleted();
      
      expect(result).toBe(false);
    });
  });

  describe('getOnboardingStatus', () => {
    it('returns complete status with style preferences', async () => {
      const mockStylePreferences: StylePreferences = {
        preferredStyles: ['casual', 'business'],
        preferredColors: ['neutrals', 'earth-tones'],
        occasions: ['work', 'casual-daily'],
        bodyTypePreferences: [],
        confidenceNoteStyle: 'encouraging',
      };

      mockAsyncStorage.getItem
        .mockResolvedValueOnce('true') // onboarding completed
        .mockResolvedValueOnce(JSON.stringify(mockStylePreferences)); // style preferences
      
      mockNotificationService.areNotificationsEnabled.mockResolvedValue(true);
      
      const result = await onboardingService.getOnboardingStatus();
      
      expect(result).toEqual({
        isCompleted: true,
        completedAt: expect.any(Date),
        stylePreferences: mockStylePreferences,
        notificationPermissionGranted: true,
      });
    });

    it('returns incomplete status when onboarding not done', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await onboardingService.getOnboardingStatus();
      
      expect(result).toEqual({
        isCompleted: false,
        notificationPermissionGranted: false,
      });
    });
  });

  describe('completeOnboarding', () => {
    const mockOnboardingData: OnboardingData = {
      stylePreferences: {
        preferredStyles: ['casual'],
        preferredColors: ['neutrals'],
        occasions: ['work'],
        bodyTypePreferences: [],
        confidenceNoteStyle: 'encouraging',
      },
      notificationPermissionGranted: true,
      wardrobeItemsAdded: 5,
      completedAt: new Date(),
    };

    it('saves onboarding data locally and to Supabase', async () => {
      const userId = 'test-user-id';
      
      await onboardingService.completeOnboarding(mockOnboardingData, userId);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('ayna_onboarding_completed', 'true');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'ayna_style_preferences',
        JSON.stringify(mockOnboardingData.stylePreferences)
      );
      
      expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences');
    });

    it('sets up notifications when permission granted', async () => {
      const userId = 'test-user-id';
      
      await onboardingService.completeOnboarding(mockOnboardingData, userId);
      
      expect(mockNotificationService.initialize).toHaveBeenCalled();
      expect(mockNotificationService.scheduleDailyMirrorNotification).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          preferredTime: expect.any(Date),
          timezone: expect.any(String),
          enableWeekends: true,
          enableQuickOptions: true,
          confidenceNoteStyle: 'encouraging',
        })
      );
    });

    it('completes successfully without userId', async () => {
      await onboardingService.completeOnboarding(mockOnboardingData);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('ayna_onboarding_completed', 'true');
      // Should not call Supabase without userId
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('handles Supabase errors gracefully', async () => {
      const userId = 'test-user-id';
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn(() => ({ error: new Error('Supabase error') })),
      });
      
      // Should not throw even if Supabase fails
      await expect(onboardingService.completeOnboarding(mockOnboardingData, userId))
        .resolves.not.toThrow();
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('ayna_onboarding_completed', 'true');
    });

    it('handles notification setup errors gracefully', async () => {
      const userId = 'test-user-id';
      mockNotificationService.initialize.mockResolvedValue(false);
      
      // Should not throw even if notification setup fails
      await expect(onboardingService.completeOnboarding(mockOnboardingData, userId))
        .resolves.not.toThrow();
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('ayna_onboarding_completed', 'true');
    });
  });

  describe('updateStylePreferences', () => {
    const mockStylePreferences: StylePreferences = {
      preferredStyles: ['casual', 'business'],
      preferredColors: ['neutrals'],
      occasions: ['work'],
      bodyTypePreferences: [],
      confidenceNoteStyle: 'witty',
    };

    it('updates style preferences locally and in Supabase', async () => {
      const userId = 'test-user-id';
      
      await onboardingService.updateStylePreferences(mockStylePreferences, userId);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'ayna_style_preferences',
        JSON.stringify(mockStylePreferences)
      );
      
      expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences');
    });

    it('updates locally without userId', async () => {
      await onboardingService.updateStylePreferences(mockStylePreferences);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'ayna_style_preferences',
        JSON.stringify(mockStylePreferences)
      );
      
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe('getStylePreferences', () => {
    it('returns saved style preferences', async () => {
      const mockStylePreferences: StylePreferences = {
        preferredStyles: ['casual'],
        preferredColors: ['neutrals'],
        occasions: ['work'],
        bodyTypePreferences: [],
        confidenceNoteStyle: 'encouraging',
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStylePreferences));
      
      const result = await onboardingService.getStylePreferences();
      
      expect(result).toEqual(mockStylePreferences);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('ayna_style_preferences');
    });

    it('returns null when no preferences saved', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await onboardingService.getStylePreferences();
      
      expect(result).toBeNull();
    });

    it('returns null when AsyncStorage throws error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const result = await onboardingService.getStylePreferences();
      
      expect(result).toBeNull();
    });
  });

  describe('resetOnboarding', () => {
    it('removes onboarding data from AsyncStorage', async () => {
      await onboardingService.resetOnboarding();
      
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('ayna_onboarding_completed');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('ayna_style_preferences');
    });

    it('throws error when AsyncStorage fails', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));
      
      await expect(onboardingService.resetOnboarding()).rejects.toThrow('Storage error');
    });
  });

  describe('bootstrapIntelligenceService', () => {
    it('creates initial style profile in Supabase', async () => {
      const userId = 'test-user-id';
      const mockStylePreferences: StylePreferences = {
        preferredStyles: ['casual', 'business'],
        preferredColors: ['neutrals', 'earth-tones'],
        occasions: ['work', 'casual-daily'],
        bodyTypePreferences: [],
        confidenceNoteStyle: 'encouraging',
      };
      
      await onboardingService.bootstrapIntelligenceService(userId, mockStylePreferences);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences');
    });

    it('handles Supabase errors gracefully', async () => {
      const userId = 'test-user-id';
      const mockStylePreferences: StylePreferences = {
        preferredStyles: ['casual'],
        preferredColors: ['neutrals'],
        occasions: ['work'],
        bodyTypePreferences: [],
        confidenceNoteStyle: 'encouraging',
      };
      
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn(() => ({ error: new Error('Supabase error') })),
      });
      
      // Should not throw even if Supabase fails
      await expect(onboardingService.bootstrapIntelligenceService(userId, mockStylePreferences))
        .resolves.not.toThrow();
    });
  });

  describe('shouldShowOnboarding', () => {
    it('returns false when onboarding is completed', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('true');
      
      const result = await onboardingService.shouldShowOnboarding();
      
      expect(result).toBe(false);
    });

    it('returns true when onboarding is not completed', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await onboardingService.shouldShowOnboarding();
      
      expect(result).toBe(true);
    });

    it('returns true when check fails', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const result = await onboardingService.shouldShowOnboarding();
      
      expect(result).toBe(true);
    });
  });
});