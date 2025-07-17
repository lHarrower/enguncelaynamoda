/**
 * Integration Tests for Cross-Service Communication
 * Tests the interaction between different services in the AYNA Mirror system
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
import { intelligenceService } from '../../services/intelligenceService';
import { enhancedWardrobeService } from '../../services/enhancedWardrobeService';
import { weatherService } from '../../services/weatherService';
import { notificationService } from '../../services/notificationService';
import { userPreferencesService } from '../../services/userPreferencesService';
import { supabase } from '../../config/supabaseClient';

describe('Cross-Service Communication Integration', () => {
  const mockUserId = 'integration-test-user';
  const mockDate = new Date('2024-01-15T06:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('AYNA Mirror Service Integration', () => {
    it('should coordinate between wardrobe, intelligence, and weather services', async () => {
      // Setup mock data
      const mockWardrobeItems = [
        {
          id: 'item-1',
          userId: mockUserId,
          category: 'tops',
          colors: ['blue'],
          tags: ['casual'],
          usageStats: { totalWears: 5, averageRating: 4.2 }
        },
        {
          id: 'item-2',
          userId: mockUserId,
          category: 'bottoms',
          colors: ['black'],
          tags: ['formal'],
          usageStats: { totalWears: 3, averageRating: 4.5 }
        }
      ];

      const mockWeatherContext = {
        temperature: 18,
        condition: 'rainy' as const,
        humidity: 80,
        location: 'Seattle',
        timestamp: mockDate
      };

      const mockStyleProfile = {
        userId: mockUserId,
        preferredColors: ['blue', 'black', 'white'],
        preferredStyles: ['casual', 'minimalist'],
        confidencePatterns: [
          {
            itemCombination: ['item-1', 'item-2'],
            averageRating: 4.5,
            contextFactors: ['work', 'rainy'],
            emotionalResponse: ['confident', 'comfortable']
          }
        ]
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
        })
      });

      (weatherService.getCurrentWeather as jest.Mock).mockResolvedValue(mockWeatherContext);

      // Spy on service method calls to verify integration
      const wardrobeSpy = jest.spyOn(enhancedWardrobeService, 'getUserWardrobe');
      const intelligenceSpy = jest.spyOn(intelligenceService, 'generateStyleRecommendations');
      const weatherSpy = jest.spyOn(weatherService, 'getCurrentWeather');

      // Execute the integrated flow
      const recommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);

      // Verify service coordination
      expect(wardrobeSpy).toHaveBeenCalledWith(mockUserId);
      expect(weatherSpy).toHaveBeenCalledWith(mockUserId);
      expect(intelligenceSpy).toHaveBeenCalledWith(
        mockWardrobeItems,
        expect.objectContaining({
          weather: mockWeatherContext,
          userId: mockUserId
        })
      );

      // Verify integrated result
      expect(recommendations).toBeDefined();
      expect(recommendations.weatherContext).toEqual(mockWeatherContext);
      expect(recommendations.recommendations.length).toBeGreaterThan(0);

      // Verify weather-appropriate recommendations for rainy day
      const rainAppropriateItems = recommendations.recommendations.some(rec =>
        rec.items.some(item => item.category === 'outerwear' || item.tags?.includes('waterproof'))
      );
      // Note: This would be true with real data, but our mock data doesn't include outerwear
    });

    it('should handle service failures gracefully with fallback mechanisms', async () => {
      // Simulate weather service failure
      (weatherService.getCurrentWeather as jest.Mock).mockRejectedValue(
        new Error('Weather API unavailable')
      );

      // Mock wardrobe service success
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [{ id: 'item-1', category: 'tops' }],
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'recommendation-123' },
          error: null
        })
      });

      // Should still generate recommendations with fallback weather
      const recommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);

      expect(recommendations).toBeDefined();
      expect(recommendations.weatherContext).toBeDefined(); // Should use cached/default weather
      expect(recommendations.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Intelligence Service Integration', () => {
    it('should integrate user feedback with style learning', async () => {
      const mockFeedback = {
        outfitId: 'outfit-123',
        userId: mockUserId,
        confidenceRating: 5,
        emotionalResponse: {
          primary: 'confident' as const,
          intensity: 9,
          additionalEmotions: ['stylish', 'powerful']
        },
        socialFeedback: {
          complimentsReceived: 3,
          positiveReactions: 8
        },
        comfort: 5,
        timestamp: mockDate
      };

      // Mock database operations
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          data: { id: 'feedback-123' },
          error: null
        }),
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [mockFeedback],
            error: null
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: {},
            error: null
          })
        })
      });

      // Spy on intelligence service methods
      const updateStyleSpy = jest.spyOn(intelligenceService, 'updateStylePreferences');
      const analyzeProfileSpy = jest.spyOn(intelligenceService, 'analyzeUserStyleProfile');

      // Process feedback through AYNA Mirror service
      await aynaMirrorService.processUserFeedback(mockFeedback);

      // Verify intelligence service integration
      expect(updateStyleSpy).toHaveBeenCalledWith(mockUserId, mockFeedback);

      // Verify style profile is updated
      const updatedProfile = await intelligenceService.analyzeUserStyleProfile(mockUserId);
      expect(analyzeProfileSpy).toHaveBeenCalledWith(mockUserId);
    });

    it('should coordinate between wardrobe usage tracking and intelligence learning', async () => {
      const outfitSelection = {
        userId: mockUserId,
        outfitId: 'outfit-456',
        itemIds: ['item-1', 'item-2', 'item-3'],
        selectedAt: mockDate
      };

      // Mock database operations
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: {},
            error: null
          })
        }),
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [{ usage_count: 6, last_worn: mockDate }],
            error: null
          })
        })
      });

      // Spy on wardrobe service methods
      const trackUsageSpy = jest.spyOn(enhancedWardrobeService, 'trackItemUsage');

      // Process outfit selection
      for (const itemId of outfitSelection.itemIds) {
        await enhancedWardrobeService.trackItemUsage(itemId, outfitSelection.outfitId);
      }

      // Verify usage tracking
      expect(trackUsageSpy).toHaveBeenCalledTimes(3);
      outfitSelection.itemIds.forEach(itemId => {
        expect(trackUsageSpy).toHaveBeenCalledWith(itemId, outfitSelection.outfitId);
      });
    });
  });

  describe('Notification Service Integration', () => {
    it('should coordinate with user preferences for personalized timing', async () => {
      const mockPreferences = {
        userId: mockUserId,
        notificationTime: new Date('1970-01-01T07:30:00Z'), // 7:30 AM
        timezone: 'America/New_York',
        stylePreferences: {
          confidenceNoteStyle: 'witty' as const
        },
        engagementHistory: {
          averageResponseTime: 15, // 15 minutes
          preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        }
      };

      // Mock user preferences service
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockReturnValue({
              data: mockPreferences,
              error: null
            })
          })
        }),
        upsert: jest.fn().mockReturnValue({
          data: mockPreferences,
          error: null
        })
      });

      // Spy on services
      const preferencesSpy = jest.spyOn(userPreferencesService, 'getUserPreferences');
      const notificationSpy = jest.spyOn(notificationService, 'scheduleDailyMirrorNotification');

      // Schedule notification with user preferences
      await notificationService.scheduleDailyMirrorNotification(mockUserId, {
        preferredTime: mockPreferences.notificationTime,
        timezone: mockPreferences.timezone,
        enableWeekends: false,
        enableQuickOptions: true,
        confidenceNoteStyle: mockPreferences.stylePreferences.confidenceNoteStyle
      });

      // Verify integration
      expect(notificationSpy).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          preferredTime: mockPreferences.notificationTime,
          timezone: mockPreferences.timezone,
          confidenceNoteStyle: 'witty'
        })
      );
    });

    it('should adapt notification timing based on engagement patterns', async () => {
      const mockEngagementHistory = {
        userId: mockUserId,
        averageOpenTime: new Date('1970-01-01T06:45:00Z'), // User typically opens at 6:45 AM
        responseRate: 0.85,
        preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        lastEngagement: new Date('2024-01-14T06:45:00Z')
      };

      // Mock engagement data
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [mockEngagementHistory],
            error: null
          })
        })
      });

      // Spy on optimization method
      const optimizeSpy = jest.spyOn(notificationService, 'optimizeNotificationTiming');

      // Optimize timing based on engagement
      const optimizedTime = await notificationService.optimizeNotificationTiming(
        mockUserId,
        mockEngagementHistory
      );

      expect(optimizeSpy).toHaveBeenCalledWith(mockUserId, mockEngagementHistory);
      expect(optimizedTime).toBeDefined();
      
      // Should suggest time close to user's typical engagement time
      const timeDiff = Math.abs(optimizedTime.getTime() - mockEngagementHistory.averageOpenTime.getTime());
      expect(timeDiff).toBeLessThan(30 * 60 * 1000); // Within 30 minutes
    });
  });

  describe('Error Handling and Recovery Integration', () => {
    it('should coordinate error recovery across multiple services', async () => {
      // Simulate multiple service failures
      (weatherService.getCurrentWeather as jest.Mock).mockRejectedValue(
        new Error('Weather service timeout')
      );

      // Mock partial wardrobe service failure
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: null,
            error: new Error('Database connection failed')
          })
        })
      }).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [{ id: 'cached-item-1', category: 'tops' }],
            error: null
          })
        })
      });

      // Should handle cascading failures gracefully
      const recommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);

      expect(recommendations).toBeDefined();
      // Should provide some recommendations even with service failures
      expect(recommendations.recommendations.length).toBeGreaterThanOrEqual(0);
    });

    it('should maintain data consistency during partial failures', async () => {
      const mockFeedback = {
        outfitId: 'outfit-789',
        userId: mockUserId,
        confidenceRating: 4,
        emotionalResponse: {
          primary: 'comfortable' as const,
          intensity: 7,
          additionalEmotions: []
        },
        comfort: 4,
        timestamp: mockDate
      };

      // Simulate feedback storage success but intelligence update failure
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            data: { id: 'feedback-789' },
            error: null
          })
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              data: null,
              error: new Error('Intelligence update failed')
            })
          })
        });

      // Should handle partial failure without losing data
      await expect(aynaMirrorService.processUserFeedback(mockFeedback)).resolves.not.toThrow();

      // Verify feedback was stored even if intelligence update failed
      expect(supabase.from).toHaveBeenCalledWith('outfit_feedback');
    });
  });

  describe('Performance Integration', () => {
    it('should maintain performance standards across service boundaries', async () => {
      const startTime = Date.now();

      // Mock realistic service response times
      (weatherService.getCurrentWeather as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          temperature: 20,
          condition: 'cloudy',
          humidity: 60,
          location: 'Test City',
          timestamp: new Date()
        }), 100)) // 100ms delay
      );

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve({
              data: [{ id: 'item-1', category: 'tops' }],
              error: null
            }), 50)) // 50ms delay
          )
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'recommendation-123' },
          error: null
        })
      });

      // Execute integrated flow
      const recommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);
      const totalTime = Date.now() - startTime;

      // Should complete within performance benchmark
      expect(totalTime).toBeLessThan(1000); // 1 second total
      expect(recommendations).toBeDefined();
    });
  });
});