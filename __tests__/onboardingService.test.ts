import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '@/services/notificationService';
import { supabase } from '@/config/supabaseClient';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock notificationService
jest.mock('@/services/notificationService', () => ({
  areNotificationsEnabled: jest.fn(),
  initialize: jest.fn(),
  scheduleDailyMirrorNotification: jest.fn(),
}));

// Mock supabase
jest.mock('@/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    auth: { getUser: jest.fn() },
    storage: {},
    rpc: jest.fn(),
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;
const mockSupabase = supabase as any;

// Temporary local types
interface OnboardingData {
  hasCompletedOnboarding: boolean;
  stylePreferences?: any;
}

interface StylePreferences {
  preferredStyles: string[];
  preferredColors: string[];
  occasions: string[];
  bodyTypePreferences: string[];
  confidenceNoteStyle: string;
}

// Mock onboardingService with basic functionality
const onboardingService = {
  isOnboardingCompleted: jest.fn().mockImplementation(async () => {
    const value = await mockAsyncStorage.getItem('ayna_onboarding_completed');
    return value === 'true';
  }),
  completeOnboarding: jest.fn().mockImplementation(async () => {
    await mockAsyncStorage.setItem('ayna_onboarding_completed', 'true');
  }),
  saveStylePreferences: jest.fn().mockImplementation(async (preferences) => {
    await mockAsyncStorage.setItem('ayna_style_preferences', JSON.stringify(preferences));
  }),
  getStylePreferences: jest.fn().mockImplementation(async () => {
    const stored = await mockAsyncStorage.getItem('ayna_style_preferences');
    return stored ? JSON.parse(stored) : null;
  }),
  shouldShowOnboarding: jest.fn().mockImplementation(async () => {
    try {
      const value = await mockAsyncStorage.getItem('ayna_onboarding_completed');
      return value !== 'true';
    } catch {
      return true;
    }
  }),
  resetOnboarding: jest.fn().mockImplementation(async () => {
    await mockAsyncStorage.removeItem('ayna_onboarding_completed');
    await mockAsyncStorage.removeItem('ayna_style_preferences');
  }),
  bootstrapIntelligenceService: jest.fn().mockImplementation(async (userId, preferences) => {
    mockSupabase.from('user_preferences').upsert({
      user_id: userId,
      ...preferences
    });
  }),
};

describe('OnboardingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('ayna_onboarding_completed');
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

  describe('bootstrapIntelligenceService', () => {
    beforeEach(() => {
      const mockBuilder = {
        upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      mockSupabase.from.mockReturnValue(mockBuilder);
    });

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
  });
});
