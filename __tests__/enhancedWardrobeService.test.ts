// Enhanced Wardrobe Service - Unit Tests
import { EnhancedWardrobeService } from '@/services/enhancedWardrobeService';
import { supabase } from '@/config/supabaseClient';
import { WardrobeItemRecord, UsageStats, UtilizationStats, ItemCategory } from '@/types/aynaMirror';

// Mock Supabase client
jest.mock('@/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn()
  }
}));

describe('EnhancedWardrobeService', () => {
  let service: EnhancedWardrobeService;
  let mockSupabaseFrom: jest.MockedFunction<any>;
  let mockSupabaseRpc: jest.MockedFunction<any>;

  beforeEach(() => {
    service = new EnhancedWardrobeService();
    mockSupabaseFrom = supabase.from as jest.MockedFunction<any>;
    mockSupabaseRpc = supabase.rpc as jest.MockedFunction<any>;
    jest.clearAllMocks();
  });

  // ========================================================================
  // CORE WARDROBE OPERATIONS TESTS
  // ========================================================================

  describe('saveClothingItem', () => {
    it('should save a clothing item with enhanced features', async () => {
      const mockItem = {
        image_uri: 'test-image.jpg',
        processed_image_uri: 'processed-test-image.jpg',
        category: 'tops',
        colors: ['#FF0000'],
        brand: 'TestBrand'
      };

      const mockResponse = {
        id: 'test-id',
        user_id: 'user-123',
        ...mockItem,
        usage_count: 0,
        confidence_score: 0,
        tags: ['casual', 'everyday', 'branded'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null })
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const result = await service.saveClothingItem(mockItem);

  expect(mockSupabaseFrom).toHaveBeenCalledWith('wardrobe_items');
      expect(mockChain.insert).toHaveBeenCalledWith([{
        ...mockItem,
        usage_count: 0,
        confidence_score: 0,
        tags: expect.arrayContaining(['casual', 'everyday', 'branded'])
      }]);
      expect(result).toEqual(mockResponse);
    });

    it('should auto-categorize item when category is missing', async () => {
      const mockItem = {
        image_uri: 'test-image.jpg',
        processed_image_uri: 'processed-test-image.jpg',
        category: '',
        colors: ['#FF0000']
      };

      const mockResponse = {
        id: 'test-id',
        ...mockItem,
        category: 'tops',
        usage_count: 0,
        confidence_score: 0,
        tags: ['casual', 'everyday'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null })
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const result = await service.saveClothingItem(mockItem);

      expect(result.category).toBe('tops');
    });

    it('should extract colors when colors array is empty', async () => {
      const mockItem = {
        image_uri: 'test-image.jpg',
        processed_image_uri: 'processed-test-image.jpg',
        category: 'tops',
        colors: []
      };

      const mockResponse = {
        id: 'test-id',
        ...mockItem,
        colors: ['#000000'],
        usage_count: 0,
        confidence_score: 0,
        tags: ['casual', 'everyday'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null })
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const result = await service.saveClothingItem(mockItem);

      expect(result.colors).toEqual(['#000000']);
    });

    it('should handle database errors gracefully', async () => {
      const mockItem = {
        image_uri: 'test-image.jpg',
        processed_image_uri: 'processed-test-image.jpg',
        category: 'tops',
        colors: ['#FF0000']
      };

      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      await expect(service.saveClothingItem(mockItem)).rejects.toThrow('Database error');
    });
  });

  describe('getUserWardrobe', () => {
    it('should retrieve and transform user wardrobe items', async () => {
      const mockUserId = 'user-123';
      const mockRecords: WardrobeItemRecord[] = [{
        id: 'item-1',
        user_id: mockUserId,
        image_uri: 'image1.jpg',
        processed_image_uri: 'processed1.jpg',
        category: 'tops',
        colors: ['#FF0000'],
        brand: 'TestBrand',
        size: 'M',
        purchase_price: 50,
        tags: ['casual'],
        notes: 'Test item',
        usage_count: 5,
        last_worn: '2024-01-01',
        confidence_score: 4.5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }];

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockRecords, error: null })
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const result = await service.getUserWardrobe(mockUserId);

  expect(mockSupabaseFrom).toHaveBeenCalledWith('wardrobe_items');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('item-1');
      expect(result[0].usageStats.costPerWear).toBe(10); // 50 / 5
    });
  });

  // ========================================================================
  // USAGE TRACKING TESTS
  // ========================================================================

  describe('trackItemUsage', () => {
    it('should track item usage successfully', async () => {
      const itemId = 'item-123';
      const outfitId = 'outfit-456';

      mockSupabaseRpc.mockResolvedValue({ error: null });

      await service.trackItemUsage(itemId, outfitId);

      expect(mockSupabaseRpc).toHaveBeenCalledWith('track_item_usage', {
        item_id: itemId,
        outfit_id: outfitId
      });
    });

    it('should track item usage without outfit ID', async () => {
      const itemId = 'item-123';

      mockSupabaseRpc.mockResolvedValue({ error: null });

      await service.trackItemUsage(itemId);

      expect(mockSupabaseRpc).toHaveBeenCalledWith('track_item_usage', {
        item_id: itemId,
        outfit_id: null
      });
    });

    it('should handle tracking errors', async () => {
      const itemId = 'item-123';
      mockSupabaseRpc.mockResolvedValue({ error: { message: 'Tracking failed' } });

      await expect(service.trackItemUsage(itemId)).rejects.toThrow('Tracking failed');
    });
  });

  describe('getItemUsageStats', () => {
    it('should return detailed usage statistics', async () => {
      const itemId = 'item-123';
      const mockData = {
        id: itemId,
        usage_count: 10,
        last_worn: '2024-01-15',
        confidence_score: 4.2,
        purchase_price: 100
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const result = await service.getItemUsageStats(itemId);

      expect(result).toEqual({
        itemId,
        totalWears: 10,
        lastWorn: new Date('2024-01-15'),
        averageRating: 4.2,
        complimentsReceived: 0,
        costPerWear: 10 // 100 / 10
      });
    });

    it('should handle items with no purchase price', async () => {
      const itemId = 'item-123';
      const mockData = {
        id: itemId,
        usage_count: 5,
        last_worn: '2024-01-15',
        confidence_score: 3.8,
        purchase_price: null
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const result = await service.getItemUsageStats(itemId);

      expect(result.costPerWear).toBe(0);
    });
  });

  describe('getNeglectedItems', () => {
    it('should return neglected items', async () => {
      const userId = 'user-123';
      const daysSince = 30;
      const mockNeglectedData = [{
        id: 'item-1',
        image_uri: 'image1.jpg',
        category: 'tops',
        colors: ['#FF0000'],
        brand: 'TestBrand',
        last_worn: '2023-12-01',
        days_since_worn: 45
      }];

      const mockFullItem = {
        id: 'item-1',
        user_id: userId,
        image_uri: 'image1.jpg',
        processed_image_uri: 'processed1.jpg',
        category: 'tops',
        colors: ['#FF0000'],
        brand: 'TestBrand',
        size: 'M',
        tags: ['casual'],
        usage_count: 2,
        last_worn: '2023-12-01',
        confidence_score: 3.0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockSupabaseRpc.mockResolvedValue({ data: mockNeglectedData, error: null });

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockFullItem, error: null })
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const result = await service.getNeglectedItems(userId, daysSince);

      expect(mockSupabaseRpc).toHaveBeenCalledWith('get_neglected_items', expect.objectContaining({
        user_uuid: userId,
        days_threshold: daysSince,
        p_user_id: userId,
        p_days_since: daysSince,
      }));
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('item-1');
    });
  });

  // ========================================================================
  // COST-PER-WEAR CALCULATIONS TESTS
  // ========================================================================

  describe('calculateCostPerWear', () => {
    it('should calculate cost per wear correctly', async () => {
      const itemId = 'item-123';
      
      const mockData = {
        id: itemId,
        usage_count: 8,
        last_worn: '2024-01-15',
        confidence_score: 4.0,
        purchase_price: 100
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const result = await service.calculateCostPerWear(itemId);

      expect(result).toBe(12.5);
    });
  });

  describe('getWardrobeUtilizationStats', () => {
    it('should return comprehensive utilization statistics', async () => {
      const userId = 'user-123';
      const mockStats = [{
        total_items: 50,
        active_items: 35,
        neglected_items: 15,
        average_cost_per_wear: '15.75',
        utilization_percentage: '70.00'
      }];

      mockSupabaseRpc.mockResolvedValue({ data: mockStats, error: null });

      const result = await service.getWardrobeUtilizationStats(userId);

      expect(mockSupabaseRpc).toHaveBeenCalledWith('get_wardrobe_utilization_stats', {
        user_uuid: userId
      });
      expect(result).toEqual({
        totalItems: 50,
        activeItems: 35,
        neglectedItems: 15,
        averageCostPerWear: 15.75,
        utilizationPercentage: 70.00
      });
    });
  });

  // ========================================================================
  // AUTOMATIC CATEGORIZATION & COLOR EXTRACTION TESTS
  // ========================================================================

  describe('categorizeItemAutomatically', () => {
    it('should return default category for auto-categorization', async () => {
      const imageUri = 'test-image.jpg';
      
      const result = await service.categorizeItemAutomatically(imageUri);

      expect(result).toBe('tops');
    });

    it('should handle categorization errors gracefully', async () => {
      const imageUri = 'invalid-image.jpg';
      
      const result = await service.categorizeItemAutomatically(imageUri);

      expect(result).toBe('tops'); // Should return fallback
    });
  });

  describe('extractItemColors', () => {
    it('should return default colors for extraction', async () => {
      const imageUri = 'test-image.jpg';
      
      const result = await service.extractItemColors(imageUri);

      expect(result).toEqual(['#000000']);
    });

    it('should handle color extraction errors gracefully', async () => {
      const imageUri = 'invalid-image.jpg';
      
      const result = await service.extractItemColors(imageUri);

      expect(result).toEqual(['#000000']); // Should return fallback
    });
  });

  describe('suggestItemTags', () => {
    it('should suggest tags based on category', async () => {
      const item = { category: 'tops' as ItemCategory };
      
      const result = await service.suggestItemTags(item);

      expect(result).toContain('casual');
      expect(result).toContain('everyday');
    });

    it('should suggest tags for different categories', async () => {
      const activewearItem = { category: 'activewear' as ItemCategory };
      const result = await service.suggestItemTags(activewearItem);

      expect(result).toContain('workout');
      expect(result).toContain('athletic');
      expect(result).toContain('comfortable');
    });

    it('should suggest neutral tag for neutral colors', async () => {
      const item = { 
        category: 'tops' as ItemCategory,
        colors: ['#000000', '#FFFFFF'] 
      };
      
      const result = await service.suggestItemTags(item);

      expect(result).toContain('neutral');
    });

    it('should suggest branded tag when brand is present', async () => {
      const item = { 
        category: 'tops' as ItemCategory,
        brand: 'Nike'
      };
      
      const result = await service.suggestItemTags(item);

      expect(result).toContain('branded');
    });

    it('should remove duplicate tags', async () => {
      const item = { 
        category: 'tops' as ItemCategory,
        colors: ['#000000'],
        brand: 'TestBrand'
      };
      
      const result = await service.suggestItemTags(item);

      const uniqueTags = [...new Set(result)];
      expect(result.length).toBe(uniqueTags.length);
    });
  });

  // ========================================================================
  // CONFIDENCE SCORING TESTS
  // ========================================================================

  describe('updateItemConfidenceScore', () => {
    it('should update confidence score successfully', async () => {
      const itemId = 'item-123';
      const rating = 5;

      mockSupabaseRpc.mockResolvedValue({ error: null });

      await service.updateItemConfidenceScore(itemId, rating);

      expect(mockSupabaseRpc).toHaveBeenCalledWith('update_item_confidence_score', {
        item_id: itemId,
        new_rating: rating
      });
    });

    it('should handle confidence score update errors', async () => {
      const itemId = 'item-123';
      const rating = 5;

      mockSupabaseRpc.mockResolvedValue({ error: { message: 'Update failed' } });

      await expect(service.updateItemConfidenceScore(itemId, rating)).rejects.toThrow('Update failed');
    });
  });

  // ========================================================================
  // UTILITY METHODS TESTS
  // ========================================================================

  describe('transformRecordToWardrobeItem', () => {
    it('should transform database record to WardrobeItem correctly', async () => {
      const mockRecord: WardrobeItemRecord = {
        id: 'item-1',
        user_id: 'user-123',
        image_uri: 'image1.jpg',
        processed_image_uri: 'processed1.jpg',
        category: 'tops',
        colors: ['#FF0000'],
        brand: 'TestBrand',
        size: 'M',
        purchase_date: '2024-01-01',
        purchase_price: 50,
        tags: ['casual'],
        notes: 'Test item',
        usage_count: 5,
        last_worn: '2024-01-15',
        confidence_score: 4.5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      // Access the private method through getUserWardrobe which uses it
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [mockRecord], error: null })
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const result = await service.getUserWardrobe('user-123');
      const transformedItem = result[0];

      expect(transformedItem.id).toBe('item-1');
      expect(transformedItem.userId).toBe('user-123');
      expect(transformedItem.category).toBe('tops');
      expect(transformedItem.purchaseDate).toEqual(new Date('2024-01-01'));
      expect(transformedItem.usageStats.costPerWear).toBe(10); // 50 / 5
      expect(transformedItem.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'));
    });
  });
});

// Mock console methods to avoid noise in test output
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});