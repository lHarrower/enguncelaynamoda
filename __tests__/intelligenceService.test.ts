// Intelligence Service Unit Tests
// Comprehensive tests for AI-powered style learning and recommendations

import { IntelligenceService } from '@/services/intelligenceService';
import { supabase } from '@/config/supabaseClient';
import {
  WardrobeItem,
  StyleProfile,
  OutfitFeedback,
  RecommendationContext,
  WeatherContext,
  UserPreferences,
  Outfit
} from '@/types/aynaMirror';

// Mock Supabase client (use alias path to align with moduleNameMapper)
jest.mock('@/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn()
  }
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('IntelligenceService', () => {
  let intelligenceService: IntelligenceService;
  let mockWardrobeItems: WardrobeItem[];
  let mockFeedbackHistory: any[];
  let mockRecommendationContext: RecommendationContext;

  beforeEach(() => {
    intelligenceService = new IntelligenceService();
    jest.clearAllMocks();

    // Mock wardrobe items
    mockWardrobeItems = [
      {
        id: 'item1',
        userId: 'user1',
        imageUri: 'image1.jpg',
        processedImageUri: 'processed1.jpg',
        category: 'tops',
        colors: ['#000000', '#FFFFFF'],
        tags: ['casual', 'comfortable'],
        usageStats: {
          itemId: 'item1',
          totalWears: 5,
          lastWorn: new Date('2024-01-01'),
          averageRating: 4.2,
          complimentsReceived: 2,
          costPerWear: 10
        },
        styleCompatibility: {},
        confidenceHistory: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'item2',
        userId: 'user1',
        imageUri: 'image2.jpg',
        processedImageUri: 'processed2.jpg',
        category: 'bottoms',
        colors: ['#0000FF'],
        tags: ['casual', 'denim'],
        usageStats: {
          itemId: 'item2',
          totalWears: 8,
          lastWorn: new Date('2024-01-05'),
          averageRating: 4.5,
          complimentsReceived: 3,
          costPerWear: 8
        },
        styleCompatibility: {},
        confidenceHistory: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'item3',
        userId: 'user1',
        imageUri: 'image3.jpg',
        processedImageUri: 'processed3.jpg',
        category: 'shoes',
        colors: ['#8B4513'],
        tags: ['casual', 'leather'],
        usageStats: {
          itemId: 'item3',
          totalWears: 3,
          lastWorn: new Date('2023-12-01'), // Neglected item
          averageRating: 3.8,
          complimentsReceived: 1,
          costPerWear: 20
        },
        styleCompatibility: {},
        confidenceHistory: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    // Mock feedback history
    mockFeedbackHistory = [
      {
        id: 'feedback1',
        user_id: 'user1',
        confidence_rating: 5,
        emotional_response: { primary: 'confident', intensity: 8 },
        occasion: 'work',
        outfit_recommendations: {
          item_ids: ['item1', 'item2'],
          confidence_score: 0.9
        },
        created_at: '2024-01-10T10:00:00Z'
      },
      {
        id: 'feedback2',
        user_id: 'user1',
        confidence_rating: 3,
        emotional_response: { primary: 'comfortable', intensity: 6 },
        occasion: 'casual',
        outfit_recommendations: {
          item_ids: ['item2', 'item3'],
          confidence_score: 0.6
        },
        created_at: '2024-01-08T10:00:00Z'
      }
    ];

    // Mock recommendation context
    mockRecommendationContext = {
      userId: 'user1',
      date: new Date('2024-01-15'),
      weather: {
        temperature: 20,
        condition: 'sunny',
        humidity: 60,
        location: 'New York',
        timestamp: new Date('2024-01-15')
      },
      userPreferences: {
        userId: 'user1',
        notificationTime: new Date(),
        timezone: 'UTC',
        stylePreferences: {} as StyleProfile,
        privacySettings: {
          shareUsageData: true,
          allowLocationTracking: true,
          enableSocialFeatures: true,
          dataRetentionDays: 365
        },
        engagementHistory: {
          totalDaysActive: 30,
          streakDays: 5,
          averageRating: 4.2,
          lastActiveDate: new Date(),
          preferredInteractionTimes: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      styleProfile: {
        userId: 'user1',
        preferredColors: ['#000000', '#FFFFFF', '#0000FF'],
        preferredStyles: ['casual', 'comfortable'],
        bodyTypePreferences: [],
        occasionPreferences: { work: 4.5, casual: 4.0 },
        confidencePatterns: [],
        lastUpdated: new Date()
      }
    };
  });

  describe('analyzeUserStyleProfile', () => {
    it('should analyze user style profile successfully', async () => {
      // Mock Supabase responses
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockWardrobeItems.map(item => ({
              id: item.id,
              user_id: item.userId,
              colors: item.colors,
              tags: item.tags,
              category: item.category
            })),
            error: null
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                data: mockFeedbackHistory,
                error: null
              })
            })
          })
        })
      } as any);

      // Mock upsert for caching
      mockSupabase.from.mockReturnValueOnce({
        upsert: jest.fn().mockReturnValue({
          data: null,
          error: null
        })
      } as any);

      const result = await intelligenceService.analyzeUserStyleProfile('user1');

      expect(result).toBeDefined();
      expect(result.userId).toBe('user1');
      expect(result.preferredColors).toContain('#000000');
      expect(result.preferredStyles).toContain('casual');
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: null,
            error: new Error('Database error')
          })
        })
      } as any);

      await expect(intelligenceService.analyzeUserStyleProfile('user1'))
        .rejects.toThrow('Database error');
    });
  });

  describe('calculateOutfitCompatibility', () => {
    it('should calculate high compatibility for well-matched items', async () => {
      const compatibleItems = [
        mockWardrobeItems[0], // Black/white top
        mockWardrobeItems[1]  // Blue bottoms
      ];

      const score = await intelligenceService.calculateOutfitCompatibility(compatibleItems);

      expect(score).toBeGreaterThan(0.5);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should return neutral score for single item', async () => {
      const singleItem = [mockWardrobeItems[0]];

      const score = await intelligenceService.calculateOutfitCompatibility(singleItem);

      expect(score).toBe(0.5);
    });

    it('should handle empty array gracefully', async () => {
      const score = await intelligenceService.calculateOutfitCompatibility([]);

      expect(score).toBe(0.5);
    });

    it('should consider color harmony in scoring', async () => {
      const neutralItems = mockWardrobeItems.map(item => ({
        ...item,
        colors: ['#000000', '#FFFFFF'] // Neutral colors
      }));

      const score = await intelligenceService.calculateOutfitCompatibility(neutralItems);

      expect(score).toBeGreaterThan(0.7); // Neutral colors should score well
    });
  });

  describe('calculateConfidenceScore', () => {
    it('should calculate confidence based on historical feedback', async () => {
      const mockOutfit: Outfit = {
        id: 'outfit1',
        userId: 'user1',
        items: [mockWardrobeItems[0], mockWardrobeItems[1]],
        weatherContext: mockRecommendationContext.weather,
        confidenceScore: 0,
        createdAt: new Date()
      };

      // Mock historical feedback query
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                data: mockFeedbackHistory,
                error: null
              })
            })
          })
        })
      } as any);

      const score = await intelligenceService.calculateConfidenceScore(mockOutfit, {});

      expect(score).toBeGreaterThan(0.1);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should give bonus for frequently worn items', async () => {
      const highUsageItems = mockWardrobeItems.map(item => ({
        ...item,
        usageStats: {
          ...item.usageStats,
          totalWears: 20 // High usage
        }
      }));

      const mockOutfit: Outfit = {
        id: 'outfit1',
        userId: 'user1',
        items: highUsageItems,
        weatherContext: mockRecommendationContext.weather,
        confidenceScore: 0,
        createdAt: new Date()
      };

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                data: [],
                error: null
              })
            })
          })
        })
      } as any);

      const score = await intelligenceService.calculateConfidenceScore(mockOutfit, {});

      expect(score).toBeGreaterThan(0.5); // Should get usage bonus
    });

    it('should give rediscovery bonus for neglected items', async () => {
      const neglectedItems = mockWardrobeItems.map(item => ({
        ...item,
        lastWorn: new Date('2023-01-01') // Very old
      }));

      const mockOutfit: Outfit = {
        id: 'outfit1',
        userId: 'user1',
        items: neglectedItems,
        weatherContext: mockRecommendationContext.weather,
        confidenceScore: 0,
        createdAt: new Date()
      };

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                data: [],
                error: null
              })
            })
          })
        })
      } as any);

      const score = await intelligenceService.calculateConfidenceScore(mockOutfit, {});

      expect(score).toBeGreaterThan(0.1); // Should get rediscovery bonus
    });
  });

  describe('generateStyleRecommendations', () => {
    it('should generate 3 outfit recommendations', async () => {
      const recommendations = await intelligenceService.generateStyleRecommendations(
        mockWardrobeItems,
        mockRecommendationContext
      );

      expect(recommendations).toHaveLength(3);
      expect(recommendations[0]).toHaveProperty('items');
      expect(recommendations[0]).toHaveProperty('confidenceNote');
      expect(recommendations[0]).toHaveProperty('confidenceScore');
      expect(recommendations[0]).toHaveProperty('quickActions');
    });

    it('should mark first recommendation as quick option', async () => {
      const recommendations = await intelligenceService.generateStyleRecommendations(
        mockWardrobeItems,
        mockRecommendationContext
      );

      expect(recommendations[0].isQuickOption).toBe(true);
      expect(recommendations[1].isQuickOption).toBe(false);
      expect(recommendations[2].isQuickOption).toBe(false);
    });

    it('should include reasoning for recommendations', async () => {
      const recommendations = await intelligenceService.generateStyleRecommendations(
        mockWardrobeItems,
        mockRecommendationContext
      );

      recommendations.forEach(rec => {
        expect(rec.reasoning).toBeDefined();
        expect(rec.reasoning.length).toBeGreaterThan(0);
      });
    });

    it('should filter out recently worn items', async () => {
      const recentlyWornItems = mockWardrobeItems.map(item => ({
        ...item,
        lastWorn: new Date() // Worn today
      }));

      const recommendations = await intelligenceService.generateStyleRecommendations(
        recentlyWornItems,
        mockRecommendationContext
      );

      // Should still generate recommendations but with different logic
      expect(recommendations).toBeDefined();
    });
  });

  describe('predictUserSatisfaction', () => {
    it('should predict satisfaction based on style profile', async () => {
      const mockOutfit: Outfit = {
        id: 'outfit1',
        userId: 'user1',
        items: mockWardrobeItems,
        weatherContext: mockRecommendationContext.weather,
        confidenceScore: 0,
        createdAt: new Date()
      };

      const satisfaction = await intelligenceService.predictUserSatisfaction(
        mockOutfit,
        mockRecommendationContext.styleProfile
      );

      expect(satisfaction).toBeGreaterThanOrEqual(0);
      expect(satisfaction).toBeLessThanOrEqual(1);
    });

    it('should give higher satisfaction for preferred colors', async () => {
      const preferredColorItems = mockWardrobeItems.map(item => ({
        ...item,
        colors: ['#000000'] // User's preferred color
      }));

      const mockOutfit: Outfit = {
        id: 'outfit1',
        userId: 'user1',
        items: preferredColorItems,
        weatherContext: mockRecommendationContext.weather,
        confidenceScore: 0,
        createdAt: new Date()
      };

      const satisfaction = await intelligenceService.predictUserSatisfaction(
        mockOutfit,
        mockRecommendationContext.styleProfile
      );

      expect(satisfaction).toBeGreaterThan(0.5);
    });
  });

  describe('updateStylePreferences', () => {
    it('should update style preferences based on feedback', async () => {
      const mockFeedback: OutfitFeedback = {
        id: 'feedback1',
        userId: 'user1',
        outfitRecommendationId: 'rec1',
        confidenceRating: 5,
        emotionalResponse: {
          primary: 'confident',
          intensity: 9,
          additionalEmotions: ['stylish']
        },
        occasion: 'work',
        comfort: {
          physical: 5,
          emotional: 5,
          confidence: 5
        },
        timestamp: new Date()
      };

      // Mock all the database calls needed for updateStylePreferences
      const mockSelect = jest.fn();
      const mockEq = jest.fn();
      const mockOrder = jest.fn();
      const mockLimit = jest.fn();
      const mockSingle = jest.fn();
      const mockUpsert = jest.fn();

      // Chain the mocks properly
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ 
        data: mockWardrobeItems.map(item => ({
          id: item.id,
          user_id: item.userId,
          colors: item.colors,
          tags: item.tags
        })), 
        error: null 
      });

      // For the second call (feedback history)
      mockEq.mockReturnValueOnce({ 
        data: mockWardrobeItems.map(item => ({
          id: item.id,
          user_id: item.userId,
          colors: item.colors,
          tags: item.tags
        })), 
        error: null 
      }).mockReturnValueOnce({
        order: mockOrder
      });

      mockOrder.mockReturnValue({ limit: mockLimit });
      mockLimit.mockReturnValue({ data: mockFeedbackHistory, error: null });

      // For the third call (outfit recommendation)
      mockEq.mockReturnValueOnce({
        single: mockSingle
      });
      mockSingle.mockReturnValue({
        data: { item_ids: ['item1', 'item2'] },
        error: null
      });

      // For the upsert call
      mockUpsert.mockReturnValue({ data: null, error: null });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        upsert: mockUpsert
      } as any);

      await expect(intelligenceService.updateStylePreferences('user1', mockFeedback))
        .resolves.not.toThrow();
    });
  });

  describe('generateConfidenceNote', () => {
    it('should generate personalized confidence note', async () => {
      const mockOutfit: Outfit = {
        id: 'outfit1',
        userId: 'user1',
        items: mockWardrobeItems,
        weatherContext: mockRecommendationContext.weather,
        confidenceScore: 0.8,
        createdAt: new Date()
      };

      const note = await intelligenceService.generateConfidenceNote(mockOutfit, {});

      expect(note).toBeDefined();
      expect(typeof note).toBe('string');
      expect(note.length).toBeGreaterThan(10);
    });

    it('should return a confidence note even with empty items', async () => {
      const mockOutfit: Outfit = {
        id: 'outfit1',
        userId: 'user1',
        items: [],
        weatherContext: mockRecommendationContext.weather,
        confidenceScore: 0,
        createdAt: new Date()
      };

      const note = await intelligenceService.generateConfidenceNote(mockOutfit, {});

      expect(note).toBeDefined();
      expect(typeof note).toBe('string');
      expect(note.length).toBeGreaterThan(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase connection errors', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      await expect(intelligenceService.analyzeUserStyleProfile('user1'))
        .rejects.toThrow('Connection failed');
    });

    it('should return neutral scores on calculation errors', async () => {
      // Test with malformed data
      const malformedItems = [
        {
          ...mockWardrobeItems[0],
          colors: null as any
        }
      ];

      const score = await intelligenceService.calculateOutfitCompatibility(malformedItems);

      expect(score).toBe(0.5); // Should return neutral score
    });
  });

  describe('Performance', () => {
    it('should handle large wardrobes efficiently', async () => {
      // Create a large wardrobe
      const largeWardrobe = Array.from({ length: 100 }, (_, i) => ({
        ...mockWardrobeItems[0],
        id: `item${i}`,
        category: ['tops', 'bottoms', 'shoes', 'accessories'][i % 4] as any
      }));

      const startTime = Date.now();
      const recommendations = await intelligenceService.generateStyleRecommendations(
        largeWardrobe,
        mockRecommendationContext
      );
      const endTime = Date.now();

      expect(recommendations).toHaveLength(3);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should limit outfit combinations to reasonable number', async () => {
      const largeWardrobe = Array.from({ length: 50 }, (_, i) => ({
        ...mockWardrobeItems[0],
        id: `item${i}`,
        category: 'tops' as any
      }));

      const recommendations = await intelligenceService.generateStyleRecommendations(
        largeWardrobe,
        mockRecommendationContext
      );

      // Should still return exactly 3 recommendations
      expect(recommendations).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty wardrobe', async () => {
      const recommendations = await intelligenceService.generateStyleRecommendations(
        [],
        mockRecommendationContext
      );

      expect(recommendations).toHaveLength(0);
    });

    it('should handle wardrobe with single category', async () => {
      const singleCategoryWardrobe = mockWardrobeItems.map(item => ({
        ...item,
        category: 'tops' as any
      }));

      const recommendations = await intelligenceService.generateStyleRecommendations(
        singleCategoryWardrobe,
        mockRecommendationContext
      );

      expect(recommendations).toBeDefined();
    });

    it('should handle missing user preferences', async () => {
      const contextWithoutPrefs = {
        ...mockRecommendationContext,
        styleProfile: {
          userId: 'user1',
          preferredColors: [],
          preferredStyles: [],
          bodyTypePreferences: [],
          occasionPreferences: {},
          confidencePatterns: [],
          lastUpdated: new Date()
        }
      };

      const recommendations = await intelligenceService.generateStyleRecommendations(
        mockWardrobeItems,
        contextWithoutPrefs
      );

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });
});