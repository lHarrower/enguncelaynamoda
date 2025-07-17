/**
 * End-to-End Tests for AYNA Mirror Daily Ritual Flow
 * Tests the complete user journey from notification to feedback collection
 */

// Mock external dependencies first
jest.mock('../../config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
  }
}));
jest.mock('../../services/weatherService');

import { aynaMirrorService } from '../../services/aynaMirrorService';
import { notificationService } from '../../services/notificationService';
import { intelligenceService } from '../../services/intelligenceService';
import { enhancedWardrobeService } from '../../services/enhancedWardrobeService';
import { weatherService } from '../../services/weatherService';
import { supabase } from '../../config/supabaseClient';

describe('AYNA Mirror Daily Ritual - End-to-End Flow', () => {
  const mockUserId = 'test-user-123';
  const mockDate = new Date('2024-01-15T06:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Complete Daily Ritual Flow', () => {
    it('should execute the complete daily ritual from notification to feedback', async () => {
      // Setup: Mock user wardrobe data
      const mockWardrobeItems = [
        {
          id: 'item-1',
          userId: mockUserId,
          category: 'tops',
          colors: ['blue', 'white'],
          tags: ['casual', 'work'],
          usageStats: { totalWears: 5, lastWorn: new Date('2024-01-10'), averageRating: 4.2 }
        },
        {
          id: 'item-2',
          userId: mockUserId,
          category: 'bottoms',
          colors: ['black'],
          tags: ['formal', 'work'],
          usageStats: { totalWears: 3, lastWorn: new Date('2024-01-12'), averageRating: 4.5 }
        },
        {
          id: 'item-3',
          userId: mockUserId,
          category: 'shoes',
          colors: ['brown'],
          tags: ['casual', 'comfortable'],
          usageStats: { totalWears: 8, lastWorn: new Date('2024-01-08'), averageRating: 4.8 }
        }
      ];

      const mockWeatherContext = {
        temperature: 22,
        condition: 'sunny' as const,
        humidity: 45,
        location: 'San Francisco',
        timestamp: mockDate
      };

      // Mock service responses
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockWardrobeItems,
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'recommendation-123' },
          error: null
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: {},
            error: null
          })
        })
      });

      (weatherService.getCurrentWeather as jest.Mock).mockResolvedValue(mockWeatherContext);

      // Step 1: Schedule daily notification (previous day)
      const notificationResult = await notificationService.scheduleDailyMirrorNotification(
        mockUserId,
        {
          preferredTime: new Date('2024-01-15T06:00:00Z'),
          timezone: 'America/Los_Angeles',
          enableWeekends: true,
          enableQuickOptions: true,
          confidenceNoteStyle: 'encouraging'
        }
      );

      expect(notificationResult).toBeDefined();

      // Step 2: Generate daily recommendations (triggered at 6 AM)
      const dailyRecommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);

      expect(dailyRecommendations).toBeDefined();
      expect(dailyRecommendations.recommendations).toHaveLength(3);
      expect(dailyRecommendations.weatherContext).toEqual(mockWeatherContext);
      expect(dailyRecommendations.date.toDateString()).toBe(mockDate.toDateString());

      // Step 3: User views recommendations and selects an outfit
      const selectedRecommendation = dailyRecommendations.recommendations[0];
      expect(selectedRecommendation.items).toBeDefined();
      expect(selectedRecommendation.confidenceNote).toBeTruthy();
      expect(selectedRecommendation.confidenceScore).toBeGreaterThan(0);

      // Step 4: User provides feedback (simulated 3 hours later)
      const feedbackTime = new Date(mockDate.getTime() + 3 * 60 * 60 * 1000);
      jest.setSystemTime(feedbackTime);

      const mockFeedback = {
        outfitId: selectedRecommendation.id,
        userId: mockUserId,
        confidenceRating: 5,
        emotionalResponse: {
          primary: 'confident' as const,
          intensity: 9,
          additionalEmotions: ['stylish', 'comfortable']
        },
        socialFeedback: {
          complimentsReceived: 2,
          positiveReactions: 5
        },
        occasion: 'work',
        comfort: 4,
        timestamp: feedbackTime
      };

      await aynaMirrorService.processUserFeedback(mockFeedback);

      // Step 5: Verify learning system updates
      const updatedStyleProfile = await intelligenceService.analyzeUserStyleProfile(mockUserId);
      expect(updatedStyleProfile).toBeDefined();

      // Step 6: Verify next day's recommendations are influenced by feedback
      const nextDayDate = new Date(mockDate.getTime() + 24 * 60 * 60 * 1000);
      jest.setSystemTime(nextDayDate);

      const nextDayRecommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);
      expect(nextDayRecommendations.recommendations).toBeDefined();
      
      // Verify that high-rated items are more likely to appear
      const nextDayItems = nextDayRecommendations.recommendations.flatMap(r => r.items.map(i => i.id));
      expect(nextDayItems).toContain('item-1'); // Previously rated highly
    });

    it('should handle the complete flow with error recovery', async () => {
      // Test error scenarios and graceful degradation
      (weatherService.getCurrentWeather as jest.Mock).mockRejectedValue(new Error('Weather service unavailable'));

      const dailyRecommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);

      // Should still generate recommendations with cached/default weather
      expect(dailyRecommendations).toBeDefined();
      expect(dailyRecommendations.recommendations.length).toBeGreaterThan(0);
    });

    it('should maintain performance benchmarks throughout the flow', async () => {
      const startTime = Date.now();

      // Generate recommendations
      const recommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);
      const recommendationTime = Date.now() - startTime;

      // Should complete within 1 second
      expect(recommendationTime).toBeLessThan(1000);

      // Process feedback
      const feedbackStartTime = Date.now();
      await aynaMirrorService.processUserFeedback({
        outfitId: 'test-outfit',
        userId: mockUserId,
        confidenceRating: 4,
        emotionalResponse: { primary: 'confident', intensity: 8, additionalEmotions: [] },
        comfort: 4,
        timestamp: new Date()
      });
      const feedbackTime = Date.now() - feedbackStartTime;

      // Feedback processing should be fast
      expect(feedbackTime).toBeLessThan(500);
    });
  });

  describe('User Journey Scenarios', () => {
    it('should handle new user onboarding flow', async () => {
      const newUserId = 'new-user-456';

      // Mock empty wardrobe for new user
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [],
            error: null
          })
        })
      });

      // Should handle empty wardrobe gracefully
      const recommendations = await aynaMirrorService.generateDailyRecommendations(newUserId);
      expect(recommendations.recommendations).toHaveLength(0);
    });

    it('should handle user with large wardrobe efficiently', async () => {
      // Create mock large wardrobe (100 items)
      const largeWardrobe = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        userId: mockUserId,
        category: ['tops', 'bottoms', 'shoes', 'accessories'][i % 4],
        colors: ['red', 'blue', 'green', 'black', 'white'][i % 5],
        tags: ['casual', 'formal', 'work', 'weekend'][i % 4],
        usageStats: { totalWears: Math.floor(Math.random() * 20), lastWorn: new Date(), averageRating: 3 + Math.random() * 2 }
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: largeWardrobe,
            error: null
          })
        })
      });

      const startTime = Date.now();
      const recommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);
      const processingTime = Date.now() - startTime;

      // Should still be fast with large wardrobe
      expect(processingTime).toBeLessThan(2000);
      expect(recommendations.recommendations).toHaveLength(3);
    });

    it('should handle timezone changes during travel', async () => {
      // User starts in PST
      await notificationService.scheduleDailyMirrorNotification(mockUserId, {
        preferredTime: new Date('2024-01-15T06:00:00Z'),
        timezone: 'America/Los_Angeles',
        enableWeekends: true,
        enableQuickOptions: true,
        confidenceNoteStyle: 'encouraging'
      });

      // User travels to EST
      await notificationService.handleTimezoneChange(mockUserId, 'America/New_York');

      // Should adjust notification timing
      const updatedPreferences = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', mockUserId)
        .single();

      expect(updatedPreferences.data?.timezone).toBe('America/New_York');
    });
  });

  describe('Accessibility and Inclusive Design', () => {
    it('should provide accessible confidence notes for screen readers', async () => {
      const recommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);
      
      recommendations.recommendations.forEach(recommendation => {
        // Confidence notes should be descriptive and screen-reader friendly
        expect(recommendation.confidenceNote).toBeTruthy();
        expect(recommendation.confidenceNote.length).toBeGreaterThan(20);
        expect(recommendation.confidenceNote).not.toMatch(/[^\w\s.,!?'-]/); // No special characters that confuse screen readers
      });
    });

    it('should support different confidence note styles for diverse users', async () => {
      const styles = ['encouraging', 'witty', 'poetic'] as const;
      
      for (const style of styles) {
        const mockOutfit = {
          id: 'test-outfit',
          items: [{ id: 'item-1', category: 'tops', colors: ['blue'] }],
          confidenceScore: 4.2
        };

        const confidenceNote = await aynaMirrorService.generateConfidenceNote(
          mockOutfit as any,
          { userId: mockUserId, stylePreferences: { confidenceNoteStyle: style } } as any
        );

        expect(confidenceNote).toBeTruthy();
        // Each style should have distinct characteristics
        if (style === 'encouraging') {
          expect(confidenceNote.toLowerCase()).toMatch(/(you|your|confidence|ready|amazing)/);
        }
      });
    });
  });
});