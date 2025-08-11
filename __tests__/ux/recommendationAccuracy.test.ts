/**
 * User Experience Tests for Recommendation Accuracy
 * Tests the quality and relevance of outfit recommendations
 */

// Mock external dependencies first
jest.mock('@/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
  }
}));
jest.mock('@/services/weatherService');

import { AynaMirrorService, aynaMirrorService } from '@/services/aynaMirrorService';
import { intelligenceService } from '@/services/intelligenceService';
import { weatherService } from '@/services/weatherService';
import { supabase } from '@/config/supabaseClient';

describe('Recommendation Accuracy - User Experience Tests', () => {
  const mockUserId = 'accuracy-test-user';
  const mockDate = new Date('2024-01-15T06:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Weather-Appropriate Recommendations', () => {
    it('should recommend appropriate clothing for cold weather', async () => {
      const coldWeatherContext = {
        temperature: 5, // 5°C / 41°F
        condition: 'snowy' as const,
        humidity: 70,
        location: 'Minneapolis',
        timestamp: mockDate
      };

      const mockWardrobeItems = [
        { id: 'sweater-1', category: 'tops', subcategory: 'sweater', colors: ['grey'], tags: ['warm', 'winter'] },
        { id: 'coat-1', category: 'outerwear', subcategory: 'coat', colors: ['black'], tags: ['winter', 'waterproof'] },
        { id: 'jeans-1', category: 'bottoms', subcategory: 'jeans', colors: ['blue'], tags: ['casual'] },
        { id: 'boots-1', category: 'shoes', subcategory: 'boots', colors: ['brown'], tags: ['winter', 'waterproof'] },
        { id: 'tshirt-1', category: 'tops', subcategory: 't-shirt', colors: ['white'], tags: ['summer', 'light'] }
      ];

      (weatherService.getCurrentWeather as jest.Mock).mockResolvedValue(coldWeatherContext);
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockWardrobeItems,
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'recommendation-cold' },
          error: null
        })
      });

  const recommendations = await AynaMirrorService.generateDailyRecommendations(mockUserId);

      expect(recommendations.recommendations.length).toBeGreaterThan(0);

      // Check that recommendations include appropriate items for cold weather
      const allRecommendedItems = recommendations.recommendations.flatMap(rec => rec.items);
      
      // Should include warm clothing
      const hasWarmClothing = allRecommendedItems.some(item => 
        item.tags?.includes('warm') || 
        item.tags?.includes('winter') ||
        item.subcategory === 'sweater' ||
        item.category === 'outerwear'
      );
      expect(hasWarmClothing).toBe(true);

      // Should NOT recommend summer clothing
      const hasSummerClothing = allRecommendedItems.some(item => 
        item.tags?.includes('summer') || 
        item.tags?.includes('light') ||
        item.subcategory === 't-shirt'
      );
      expect(hasSummerClothing).toBe(false);

      // Should include waterproof items for snowy conditions
      const hasWaterproofItems = allRecommendedItems.some(item => 
        item.tags?.includes('waterproof')
      );
      expect(hasWaterproofItems).toBe(true);
    });

    it('should recommend appropriate clothing for hot weather', async () => {
      const hotWeatherContext = {
        temperature: 32, // 32°C / 90°F
        condition: 'sunny' as const,
        humidity: 85,
        location: 'Miami',
        timestamp: mockDate
      };

      const mockWardrobeItems = [
        { id: 'tank-1', category: 'tops', subcategory: 'tank-top', colors: ['white'], tags: ['summer', 'breathable'] },
        { id: 'shorts-1', category: 'bottoms', subcategory: 'shorts', colors: ['khaki'], tags: ['summer', 'light'] },
        { id: 'sandals-1', category: 'shoes', subcategory: 'sandals', colors: ['brown'], tags: ['summer', 'breathable'] },
        { id: 'sweater-2', category: 'tops', subcategory: 'sweater', colors: ['wool'], tags: ['winter', 'warm'] },
        { id: 'boots-2', category: 'shoes', subcategory: 'boots', colors: ['black'], tags: ['winter'] }
      ];

      (weatherService.getCurrentWeather as jest.Mock).mockResolvedValue(hotWeatherContext);
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockWardrobeItems,
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'recommendation-hot' },
          error: null
        })
      });

  const recommendations = await AynaMirrorService.generateDailyRecommendations(mockUserId);
      const allRecommendedItems = recommendations.recommendations.flatMap(rec => rec.items);

      // Should include light, breathable clothing
      const hasLightClothing = allRecommendedItems.some(item => 
        item.tags?.includes('summer') || 
        item.tags?.includes('light') ||
        item.tags?.includes('breathable') ||
        item.subcategory === 'tank-top' ||
        item.subcategory === 'shorts'
      );
      expect(hasLightClothing).toBe(true);

      // Should NOT recommend heavy winter clothing
      const hasHeavyClothing = allRecommendedItems.some(item => 
        item.tags?.includes('winter') || 
        item.tags?.includes('warm') ||
        item.subcategory === 'sweater'
      );
      expect(hasHeavyClothing).toBe(false);
    });

    it('should adapt recommendations for rainy weather', async () => {
      const rainyWeatherContext = {
        temperature: 18, // 18°C / 64°F
        condition: 'rainy' as const,
        humidity: 95,
        location: 'Seattle',
        timestamp: mockDate
      };

      const mockWardrobeItems = [
        { id: 'raincoat-1', category: 'outerwear', subcategory: 'raincoat', colors: ['yellow'], tags: ['waterproof', 'rain'] },
        { id: 'umbrella-1', category: 'accessories', subcategory: 'umbrella', colors: ['black'], tags: ['rain', 'waterproof'] },
        { id: 'boots-3', category: 'shoes', subcategory: 'rain-boots', colors: ['green'], tags: ['waterproof', 'rain'] },
        { id: 'canvas-shoes', category: 'shoes', subcategory: 'sneakers', colors: ['white'], tags: ['casual'] }
      ];

      (weatherService.getCurrentWeather as jest.Mock).mockResolvedValue(rainyWeatherContext);
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockWardrobeItems,
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'recommendation-rain' },
          error: null
        })
      });

  const recommendations = await AynaMirrorService.generateDailyRecommendations(mockUserId);
      const allRecommendedItems = recommendations.recommendations.flatMap(rec => rec.items);

      // Should prioritize waterproof items
      const hasWaterproofItems = allRecommendedItems.some(item => 
        item.tags?.includes('waterproof') || 
        item.tags?.includes('rain')
      );
      expect(hasWaterproofItems).toBe(true);

      // Should avoid items that would be damaged by rain
      const hasFabricShoes = allRecommendedItems.some(item => 
        item.subcategory === 'sneakers' && !item.tags?.includes('waterproof')
      );
      expect(hasFabricShoes).toBe(false);
    });
  });

  describe('User Preference Learning', () => {
    it('should prioritize previously highly-rated items', async () => {
      const mockWardrobeItems = [
        { 
          id: 'favorite-dress', 
          category: 'dresses', 
          colors: ['navy'], 
          usageStats: { averageRating: 4.8, totalWears: 10 }
        },
        { 
          id: 'okay-shirt', 
          category: 'tops', 
          colors: ['grey'], 
          usageStats: { averageRating: 3.2, totalWears: 3 }
        },
        { 
          id: 'loved-jacket', 
          category: 'outerwear', 
          colors: ['black'], 
          usageStats: { averageRating: 4.9, totalWears: 15 }
        }
      ];

      const mockStyleProfile = {
        userId: mockUserId,
        confidencePatterns: [
          {
            itemCombination: ['favorite-dress', 'loved-jacket'],
            averageRating: 4.8,
            contextFactors: ['work', 'formal'],
            emotionalResponse: ['confident', 'professional']
          }
        ]
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockWardrobeItems,
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'recommendation-preference' },
          error: null
        })
      });

  const recommendations = await AynaMirrorService.generateDailyRecommendations(mockUserId);
      const allRecommendedItems = recommendations.recommendations.flatMap(rec => rec.items);

      // Should prioritize highly-rated items
      const includesFavoriteDress = allRecommendedItems.some(item => item.id === 'favorite-dress');
      const includesLovedJacket = allRecommendedItems.some(item => item.id === 'loved-jacket');
      const includesOkayShirt = allRecommendedItems.some(item => item.id === 'okay-shirt');

      expect(includesFavoriteDress || includesLovedJacket).toBe(true);
      expect(includesOkayShirt).toBe(false); // Lower-rated item should be less likely
    });

    it('should learn from color preferences', async () => {
      const mockWardrobeItems = [
        { id: 'blue-top', category: 'tops', colors: ['blue'], usageStats: { averageRating: 4.5 } },
        { id: 'green-top', category: 'tops', colors: ['green'], usageStats: { averageRating: 4.4 } },
        { id: 'orange-top', category: 'tops', colors: ['orange'], usageStats: { averageRating: 2.1 } }
      ];

      const mockStyleProfile = {
        userId: mockUserId,
        preferredColors: ['blue', 'navy', 'teal'], // User prefers blue tones
        confidencePatterns: [
          {
            itemCombination: ['blue-top'],
            averageRating: 4.5,
            contextFactors: ['casual'],
            emotionalResponse: ['confident']
          }
        ]
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockWardrobeItems,
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'recommendation-color' },
          error: null
        })
      });

  const recommendations = await AynaMirrorService.generateDailyRecommendations(mockUserId);
      const allRecommendedItems = recommendations.recommendations.flatMap(rec => rec.items);

      // Should favor preferred colors
      const blueItems = allRecommendedItems.filter(item => 
        item.colors?.some(color => color.toLowerCase().includes('blue'))
      );
      const orangeItems = allRecommendedItems.filter(item => 
        item.colors?.some(color => color.toLowerCase().includes('orange'))
      );

      expect(blueItems.length).toBeGreaterThan(orangeItems.length);
    });

    it('should avoid combinations that received poor feedback', async () => {
      const mockWardrobeItems = [
        { id: 'red-shirt', category: 'tops', colors: ['red'] },
        { id: 'pink-pants', category: 'bottoms', colors: ['pink'] },
        { id: 'blue-shirt', category: 'tops', colors: ['blue'] },
        { id: 'grey-pants', category: 'bottoms', colors: ['grey'] }
      ];

      // Mock poor feedback for red + pink combination
      const mockFeedbackHistory = [
        {
          outfitId: 'bad-combo',
          items: ['red-shirt', 'pink-pants'],
          confidenceRating: 1,
          emotionalResponse: { primary: 'uncomfortable', intensity: 8 }
        }
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockWardrobeItems,
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'recommendation-avoid' },
          error: null
        })
      });

      const recommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);

      // Should avoid the poorly-rated combination
      const hasRedPinkCombo = recommendations.recommendations.some(rec => {
        const itemIds = rec.items.map(item => item.id);
        return itemIds.includes('red-shirt') && itemIds.includes('pink-pants');
      });

      expect(hasRedPinkCombo).toBe(false);
    });
  });

  describe('Occasion Appropriateness', () => {
    it('should recommend work-appropriate outfits for weekdays', async () => {
      // Set to a Tuesday
      const weekdayDate = new Date('2024-01-16T06:00:00Z'); // Tuesday
      jest.setSystemTime(weekdayDate);

      const mockWardrobeItems = [
        { id: 'blazer-1', category: 'outerwear', subcategory: 'blazer', colors: ['navy'], tags: ['work', 'professional'] },
        { id: 'dress-shirt', category: 'tops', subcategory: 'shirt', colors: ['white'], tags: ['work', 'formal'] },
        { id: 'trousers-1', category: 'bottoms', subcategory: 'trousers', colors: ['black'], tags: ['work', 'formal'] },
        { id: 'crop-top', category: 'tops', subcategory: 'crop-top', colors: ['pink'], tags: ['party', 'casual'] },
        { id: 'mini-skirt', category: 'bottoms', subcategory: 'mini-skirt', colors: ['denim'], tags: ['party', 'casual'] }
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockWardrobeItems,
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'recommendation-work' },
          error: null
        })
      });

      const recommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);
      const allRecommendedItems = recommendations.recommendations.flatMap(rec => rec.items);

      // Should prioritize work-appropriate items
      const hasWorkClothing = allRecommendedItems.some(item => 
        item.tags?.includes('work') || 
        item.tags?.includes('professional') ||
        item.tags?.includes('formal')
      );
      expect(hasWorkClothing).toBe(true);

      // Should avoid party/casual items for work day
      const hasPartyClothing = allRecommendedItems.some(item => 
        item.tags?.includes('party') ||
        item.subcategory === 'crop-top' ||
        item.subcategory === 'mini-skirt'
      );
      expect(hasPartyClothing).toBe(false);
    });

    it('should recommend casual outfits for weekends', async () => {
      // Set to a Saturday
      const weekendDate = new Date('2024-01-20T06:00:00Z'); // Saturday
      jest.setSystemTime(weekendDate);

      const mockWardrobeItems = [
        { id: 'jeans-2', category: 'bottoms', subcategory: 'jeans', colors: ['blue'], tags: ['casual', 'weekend'] },
        { id: 'hoodie-1', category: 'tops', subcategory: 'hoodie', colors: ['grey'], tags: ['casual', 'comfortable'] },
        { id: 'sneakers-1', category: 'shoes', subcategory: 'sneakers', colors: ['white'], tags: ['casual', 'comfortable'] },
        { id: 'suit-jacket', category: 'outerwear', subcategory: 'suit-jacket', colors: ['black'], tags: ['formal', 'work'] }
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockWardrobeItems,
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'recommendation-weekend' },
          error: null
        })
      });

      const recommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);
      const allRecommendedItems = recommendations.recommendations.flatMap(rec => rec.items);

      // Should prioritize casual, comfortable items
      const hasCasualClothing = allRecommendedItems.some(item => 
        item.tags?.includes('casual') || 
        item.tags?.includes('comfortable') ||
        item.tags?.includes('weekend')
      );
      expect(hasCasualClothing).toBe(true);

      // Should de-prioritize formal work clothing
      const hasFormalClothing = allRecommendedItems.some(item => 
        item.tags?.includes('formal') ||
        item.subcategory === 'suit-jacket'
      );
      expect(hasFormalClothing).toBe(false);
    });
  });

  describe('Neglected Item Rediscovery', () => {
    it('should surface items that haven\'t been worn recently', async () => {
      const oldDate = new Date('2023-09-01'); // 4+ months ago
      const recentDate = new Date('2024-01-10'); // 5 days ago

      const mockWardrobeItems = [
        { 
          id: 'neglected-jacket', 
          category: 'outerwear', 
          colors: ['burgundy'], 
          usageStats: { lastWorn: oldDate, totalWears: 2 }
        },
        { 
          id: 'recent-shirt', 
          category: 'tops', 
          colors: ['white'], 
          usageStats: { lastWorn: recentDate, totalWears: 8 }
        },
        { 
          id: 'forgotten-dress', 
          category: 'dresses', 
          colors: ['emerald'], 
          usageStats: { lastWorn: oldDate, totalWears: 1 }
        }
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockWardrobeItems,
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'recommendation-rediscovery' },
          error: null
        })
      });

      const recommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);
      const allRecommendedItems = recommendations.recommendations.flatMap(rec => rec.items);

      // Should include some neglected items
      const includesNeglectedJacket = allRecommendedItems.some(item => item.id === 'neglected-jacket');
      const includesForgottenDress = allRecommendedItems.some(item => item.id === 'forgotten-dress');

      expect(includesNeglectedJacket || includesForgottenDress).toBe(true);

      // Confidence notes should encourage rediscovery
      const rediscoveryRecommendations = recommendations.recommendations.filter(rec =>
        rec.items.some(item => item.id === 'neglected-jacket' || item.id === 'forgotten-dress')
      );

      if (rediscoveryRecommendations.length > 0) {
        const confidenceNote = rediscoveryRecommendations[0].confidenceNote.toLowerCase();
        const hasRediscoveryLanguage = confidenceNote.includes('time') ||
                                      confidenceNote.includes('while') ||
                                      confidenceNote.includes('forgotten') ||
                                      confidenceNote.includes('rediscover');
        expect(hasRediscoveryLanguage).toBe(true);
      }
    });
  });

  describe('Recommendation Diversity', () => {
    it('should provide diverse outfit options across different styles', async () => {
      const mockWardrobeItems = [
        { id: 'formal-suit', category: 'suits', colors: ['black'], tags: ['formal', 'business'] },
        { id: 'casual-jeans', category: 'bottoms', colors: ['blue'], tags: ['casual', 'weekend'] },
        { id: 'boho-dress', category: 'dresses', colors: ['floral'], tags: ['bohemian', 'artistic'] },
        { id: 'sporty-top', category: 'tops', colors: ['neon'], tags: ['athletic', 'gym'] },
        { id: 'vintage-blouse', category: 'tops', colors: ['cream'], tags: ['vintage', 'elegant'] }
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockWardrobeItems,
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'recommendation-diversity' },
          error: null
        })
      });

      const recommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);

      expect(recommendations.recommendations).toHaveLength(3);

      // Should provide variety in style approaches
      const allTags = recommendations.recommendations.flatMap(rec => 
        rec.items.flatMap(item => item.tags || [])
      );
      const uniqueTags = new Set(allTags);

      expect(uniqueTags.size).toBeGreaterThan(2); // Should have diverse style tags
    });

    it('should balance between safe choices and style exploration', async () => {
      const mockWardrobeItems = [
        { 
          id: 'safe-black-dress', 
          category: 'dresses', 
          colors: ['black'], 
          usageStats: { averageRating: 4.5, totalWears: 20 }
        },
        { 
          id: 'bold-pattern-top', 
          category: 'tops', 
          colors: ['multicolor'], 
          usageStats: { averageRating: 3.8, totalWears: 2 }
        },
        { 
          id: 'classic-blazer', 
          category: 'outerwear', 
          colors: ['navy'], 
          usageStats: { averageRating: 4.2, totalWears: 15 }
        }
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockWardrobeItems,
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'recommendation-balance' },
          error: null
        })
      });

      const recommendations = await aynaMirrorService.generateDailyRecommendations(mockUserId);

      // Should include at least one safe, high-confidence option
      const hasSafeOption = recommendations.recommendations.some(rec => 
        rec.confidenceScore >= 4.0
      );
      expect(hasSafeOption).toBe(true);

      // Should also include some exploration/variety
      const hasVariety = recommendations.recommendations.some(rec => 
        rec.items.some(item => item.usageStats?.totalWears < 5)
      );
      expect(hasVariety).toBe(true);
    });
  });
});