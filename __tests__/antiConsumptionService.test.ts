import { antiConsumptionService } from '../services/antiConsumptionService';
import * as wardrobeService from '../services/wardrobeService';
import { supabase } from '../config/supabaseClient';

// Mock dependencies
jest.mock('../services/wardrobeService');
jest.mock('../config/supabaseClient');

const mockWardrobeService = wardrobeService as jest.Mocked<typeof wardrobeService>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('AntiConsumptionService', () => {
  const mockUserId = 'test-user-id';
  const mockWardrobeItems = [
    {
      id: 'item-1',
      userId: mockUserId,
      imageUri: 'test-image-1.jpg',
      processedImageUri: 'test-processed-1.jpg',
      category: 'tops',
      colors: ['blue', 'white'],
      tags: ['casual', 'cotton'],
      purchasePrice: 50,
      purchaseDate: new Date('2023-01-01'),
      lastWorn: new Date('2023-12-01'),
      usageCount: 10,
      notes: '',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: 'item-2',
      userId: mockUserId,
      imageUri: 'test-image-2.jpg',
      processedImageUri: 'test-processed-2.jpg',
      category: 'tops',
      colors: ['blue', 'navy'],
      tags: ['formal', 'silk'],
      purchasePrice: 100,
      purchaseDate: new Date('2023-06-01'),
      lastWorn: new Date('2023-08-01'),
      usageCount: 3,
      notes: '',
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date('2023-06-01'),
    },
    {
      id: 'item-3',
      userId: mockUserId,
      imageUri: 'test-image-3.jpg',
      processedImageUri: 'test-processed-3.jpg',
      category: 'bottoms',
      colors: ['black'],
      tags: ['formal', 'wool'],
      purchasePrice: 80,
      purchaseDate: new Date('2023-03-01'),
      lastWorn: undefined,
      usageCount: 0,
      notes: '',
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date('2023-03-01'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockWardrobeService.getWardrobeItems.mockResolvedValue(mockWardrobeItems);
  });

  describe('generateShopYourClosetRecommendations', () => {
    it('should generate recommendations for similar items', async () => {
      const recommendation = await antiConsumptionService.generateShopYourClosetRecommendations(
        mockUserId,
        'Blue casual shirt',
        'tops',
        ['blue'],
        'casual'
      );

      expect(recommendation).toBeDefined();
      expect(recommendation.userId).toBe(mockUserId);
      expect(recommendation.targetItem.description).toBe('Blue casual shirt');
      expect(recommendation.targetItem.category).toBe('tops');
      expect(recommendation.similarOwnedItems).toHaveLength(2); // Both tops should match
      expect(recommendation.confidenceScore).toBeGreaterThan(0);
      expect(recommendation.reasoning).toHaveLength(2); // Should have reasoning
    });

    it('should return empty recommendations when no similar items exist', async () => {
      const recommendation = await antiConsumptionService.generateShopYourClosetRecommendations(
        mockUserId,
        'Red dress',
        'dresses',
        ['red'],
        'formal'
      );

      expect(recommendation.similarOwnedItems).toHaveLength(0);
      expect(recommendation.confidenceScore).toBe(0);
    });

    it('should store recommendation in database', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      } as any);

      await antiConsumptionService.generateShopYourClosetRecommendations(
        mockUserId,
        'Blue casual shirt',
        'tops',
        ['blue'],
        'casual'
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('shop_your_closet_recommendations');
    });
  });

  describe('calculateCostPerWear', () => {
    beforeEach(() => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'wardrobe_items') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'item-1',
                    purchase_price: 50,
                    purchase_date: '2023-01-01',
                  },
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        if (table === 'outfit_feedback') {
          return {
            select: jest.fn().mockReturnValue({
              contains: jest.fn().mockResolvedValue({
                data: [
                  { created_at: '2023-01-15' },
                  { created_at: '2023-02-01' },
                  { created_at: '2023-03-01' },
                ],
                error: null,
              }),
            }),
          } as any;
        }
        return {} as any;
      });
    });

    it('should calculate cost per wear correctly', async () => {
      const costData = await antiConsumptionService.calculateCostPerWear('item-1');

      expect(costData).toBeDefined();
      expect(costData.itemId).toBe('item-1');
      expect(costData.purchasePrice).toBe(50);
      expect(costData.totalWears).toBe(3);
      expect(costData.costPerWear).toBeCloseTo(16.67, 2);
      expect(costData.daysSincePurchase).toBeGreaterThan(0);
      expect(costData.projectedCostPerWear).toBeDefined();
    });

    it('should handle items with no wears', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'wardrobe_items') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'item-3',
                    purchase_price: 80,
                    purchase_date: '2023-03-01',
                  },
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        if (table === 'outfit_feedback') {
          return {
            select: jest.fn().mockReturnValue({
              contains: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          } as any;
        }
        return {} as any;
      });

      const costData = await antiConsumptionService.calculateCostPerWear('item-3');

      expect(costData.totalWears).toBe(0);
      expect(costData.costPerWear).toBe(80); // Full purchase price when not worn
    });
  });

  describe('createRediscoveryChallenge', () => {
    beforeEach(() => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'wardrobe_items') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                or: jest.fn().mockResolvedValue({
                  data: [mockWardrobeItems[2]], // Only the unworn item
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        if (table === 'rediscovery_challenges') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'challenge-1',
                    created_at: new Date().toISOString(),
                  },
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        return {} as any;
      });
    });

    it('should create a rediscovery challenge for neglected items', async () => {
      const challenge = await antiConsumptionService.createRediscoveryChallenge(mockUserId);

      expect(challenge).toBeDefined();
      expect(challenge?.userId).toBe(mockUserId);
      expect(challenge?.challengeType).toBe('neglected_items');
      expect(challenge?.targetItems).toHaveLength(1);
      expect(challenge?.totalItems).toBe(1);
      expect(challenge?.progress).toBe(0);
      expect(challenge?.title).toContain('Rediscover');
    });

    it('should return null when no neglected items exist', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'wardrobe_items') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                or: jest.fn().mockResolvedValue({
                  data: [], // No neglected items
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        return {} as any;
      });

      const challenge = await antiConsumptionService.createRediscoveryChallenge(mockUserId);

      expect(challenge).toBeNull();
    });
  });

  describe('generateMonthlyConfidenceMetrics', () => {
    beforeEach(() => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'outfit_feedback') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  lte: jest.fn().mockResolvedValue({
                    data: [
                      {
                        confidence_rating: 4,
                        item_ids: ['item-1', 'item-2'],
                        created_at: '2023-12-15',
                      },
                      {
                        confidence_rating: 5,
                        item_ids: ['item-1'],
                        created_at: '2023-12-20',
                      },
                    ],
                    error: null,
                  }),
                }),
              }),
            }),
          } as any;
        }
        return {} as any;
      });
    });

    it('should generate monthly confidence metrics', async () => {
      const metrics = await antiConsumptionService.generateMonthlyConfidenceMetrics(
        mockUserId,
        12,
        2023
      );

      expect(metrics).toBeDefined();
      expect(metrics.userId).toBe(mockUserId);
      expect(metrics.month).toBe('2023-12');
      expect(metrics.year).toBe(2023);
      expect(metrics.totalOutfitsRated).toBe(2);
      expect(metrics.averageConfidenceRating).toBe(4.5);
      expect(metrics.mostConfidentItems).toBeDefined();
      expect(metrics.leastConfidentItems).toBeDefined();
    });

    it('should handle months with no data', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'outfit_feedback') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  lte: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          } as any;
        }
        return {} as any;
      });

      const metrics = await antiConsumptionService.generateMonthlyConfidenceMetrics(
        mockUserId,
        11,
        2023
      );

      expect(metrics.totalOutfitsRated).toBe(0);
      expect(metrics.averageConfidenceRating).toBe(0);
    });
  });

  describe('trackShoppingBehavior', () => {
    beforeEach(() => {
      let callCount = 0;
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'wardrobe_items') {
          callCount++;
          let mockData;
          
          // First call: current month purchases
          if (callCount === 1) {
            mockData = [
              { purchase_date: '2023-12-01', purchase_price: 50 }, 
              { purchase_date: '2023-12-15', purchase_price: 75 }
            ];
          }
          // Second call: previous month purchases  
          else if (callCount === 2) {
            mockData = [
              { purchase_date: '2023-11-01', purchase_price: 60 }, 
              { purchase_date: '2023-11-10', purchase_price: 80 }, 
              { purchase_date: '2023-11-20', purchase_price: 90 }
            ];
          }
          // Third call: recent purchases for streak calculation
          else {
            mockData = [{ purchase_date: '2023-11-15' }];
          }
          
          const mockChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
          };
          
          return mockChain as any;
        }
        return {} as any;
      });
    });

    it('should track shopping behavior correctly', async () => {
      const behaviorData = await antiConsumptionService.trackShoppingBehavior(mockUserId);

      expect(behaviorData).toBeDefined();
      expect(behaviorData.userId).toBe(mockUserId);
      expect(behaviorData.monthlyPurchases).toBeGreaterThanOrEqual(0);
      expect(behaviorData.previousMonthPurchases).toBeGreaterThanOrEqual(0);
      expect(behaviorData.reductionPercentage).toBeDefined();
      expect(behaviorData.streakDays).toBeGreaterThanOrEqual(0);
      expect(typeof behaviorData.totalSavings).toBe('number');
    });

    it('should calculate reduction percentage correctly', async () => {
      const behaviorData = await antiConsumptionService.trackShoppingBehavior(mockUserId);

      expect(behaviorData.reductionPercentage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            }),
          }),
        }),
      } as any);

      await expect(
        antiConsumptionService.calculateCostPerWear('invalid-item')
      ).rejects.toThrow('Database error');
    });

    it('should handle wardrobe service errors', async () => {
      mockWardrobeService.getWardrobeItems.mockRejectedValue(new Error('Wardrobe service error'));

      await expect(
        antiConsumptionService.generateShopYourClosetRecommendations(
          mockUserId,
          'Test item',
          'tops',
          ['blue'],
          'casual'
        )
      ).rejects.toThrow('Wardrobe service error');
    });
  });

  describe('Private helper methods', () => {
    beforeEach(() => {
      // Mock the store recommendation function to avoid database calls
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      } as any);
    });

    it('should find similar items correctly', async () => {
      const recommendation = await antiConsumptionService.generateShopYourClosetRecommendations(
        mockUserId,
        'Blue formal shirt',
        'tops',
        ['blue'],
        'formal'
      );

      // Should find the formal blue item (item-2)
      expect(recommendation.similarOwnedItems).toHaveLength(2);
      expect(recommendation.similarOwnedItems.some(item => item.id === 'item-2')).toBe(true);
    });

    it('should calculate similarity confidence correctly', async () => {
      const recommendation = await antiConsumptionService.generateShopYourClosetRecommendations(
        mockUserId,
        'Blue casual shirt',
        'tops',
        ['blue'],
        'casual'
      );

      expect(recommendation.confidenceScore).toBeGreaterThan(0);
      expect(recommendation.confidenceScore).toBeLessThanOrEqual(1);
    });

    it('should generate appropriate reasoning', async () => {
      const recommendation = await antiConsumptionService.generateShopYourClosetRecommendations(
        mockUserId,
        'Blue shirt',
        'tops',
        ['blue']
      );

      expect(recommendation.reasoning).toHaveLength(2);
      expect(recommendation.reasoning[0]).toContain('similar');
      // The second reasoning could be about recent wear or rediscovery
      expect(recommendation.reasoning[1]).toMatch(/(worn recently|rediscovered)/);
    });
  });
});