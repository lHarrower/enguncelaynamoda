// Unit tests for WardrobeService
import { WardrobeService } from '../../services/WardrobeService';
import { WardrobeItem, WardrobeCategory, WardrobeColor } from '../../types/wardrobe';
import { createMockWardrobeItem, mockApiResponses } from '../utils/testUtils';
import { mocks } from '../mocks';

// Mock dependencies
jest.mock('../../config/supabase', () => ({
  supabaseClient: mocks.supabase,
}));

jest.mock('@react-native-async-storage/async-storage', () => mocks.asyncStorage);

describe('WardrobeService', () => {
  let wardrobeService: WardrobeService;
  let mockItem: WardrobeItem;

  beforeEach(() => {
    wardrobeService = new WardrobeService();
    mockItem = createMockWardrobeItem();
    jest.clearAllMocks();
  });

  describe('getAllItems', () => {
    it('should fetch all wardrobe items successfully', async () => {
      const mockItems = [mockItem];
      mocks.supabase.from().select().mockResolvedValueOnce({
        data: mockItems,
        error: null,
      });

      const result = await wardrobeService.getAllItems();

      expect(result).toEqual(mockItems);
      expect(mocks.supabase.from).toHaveBeenCalledWith('wardrobe_items');
    });

    it('should handle fetch errors gracefully', async () => {
      const mockError = new Error('Database error');
      mocks.supabase.from().select().mockRejectedValueOnce(mockError);

      await expect(wardrobeService.getAllItems()).rejects.toThrow('Database error');
    });

    it('should return cached items when offline', async () => {
      const cachedItems = [mockItem];
      mocks.asyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(cachedItems));
      mocks.supabase.from().select().mockRejectedValueOnce(new Error('Network error'));

      const result = await wardrobeService.getAllItems();

      expect(result).toEqual(cachedItems);
      expect(mocks.asyncStorage.getItem).toHaveBeenCalledWith('wardrobe_cache');
    });
  });

  describe('getItemById', () => {
    it('should fetch item by ID successfully', async () => {
      mocks.supabase.from().select().eq().single().mockResolvedValueOnce({
        data: mockItem,
        error: null,
      });

      const result = await wardrobeService.getItemById(mockItem.id);

      expect(result).toEqual(mockItem);
      expect(mocks.supabase.from().select().eq).toHaveBeenCalledWith('id', mockItem.id);
    });

    it('should return null for non-existent item', async () => {
      mocks.supabase.from().select().eq().single().mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // Not found error
      });

      const result = await wardrobeService.getItemById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('addItem', () => {
    it('should add new item successfully', async () => {
      const newItem = { ...mockItem, id: undefined };
      const addedItem = { ...mockItem, id: 'new-id' };
      
      mocks.supabase.from().insert().select().single().mockResolvedValueOnce({
        data: addedItem,
        error: null,
      });

      const result = await wardrobeService.addItem(newItem as any);

      expect(result).toEqual(addedItem);
      expect(mocks.supabase.from().insert).toHaveBeenCalledWith(expect.objectContaining({
        name: newItem.name,
        category: newItem.category,
        colors: newItem.colors,
      }));
    });

    it('should handle validation errors', async () => {
      const invalidItem = { ...mockItem, name: '' };
      
      await expect(wardrobeService.addItem(invalidItem)).rejects.toThrow('Item name is required');
    });

    it('should handle database errors', async () => {
      const newItem = { ...mockItem, id: undefined };
      mocks.supabase.from().insert().select().single().mockResolvedValueOnce({
        data: null,
        error: { message: 'Database constraint violation' },
      });

      await expect(wardrobeService.addItem(newItem as any)).rejects.toThrow('Database constraint violation');
    });
  });

  describe('updateItem', () => {
    it('should update item successfully', async () => {
      const updatedItem = { ...mockItem, name: 'Updated Name' };
      
      mocks.supabase.from().update().eq().select().single().mockResolvedValueOnce({
        data: updatedItem,
        error: null,
      });

      const result = await wardrobeService.updateItem(mockItem.id, { name: 'Updated Name' });

      expect(result).toEqual(updatedItem);
      expect(mocks.supabase.from().update).toHaveBeenCalledWith({
        name: 'Updated Name',
        updated_at: expect.any(String),
      });
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { isFavorite: true };
      const updatedItem = { ...mockItem, ...partialUpdate };
      
      mocks.supabase.from().update().eq().select().single().mockResolvedValueOnce({
        data: updatedItem,
        error: null,
      });

      const result = await wardrobeService.updateItem(mockItem.id, partialUpdate);

      expect(result).toEqual(updatedItem);
    });
  });

  describe('deleteItem', () => {
    it('should delete item successfully', async () => {
      mocks.supabase.from().delete().eq().mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await wardrobeService.deleteItem(mockItem.id);

      expect(mocks.supabase.from().delete().eq).toHaveBeenCalledWith('id', mockItem.id);
    });

    it('should handle delete errors', async () => {
      mocks.supabase.from().delete().eq().mockResolvedValueOnce({
        data: null,
        error: { message: 'Item not found' },
      });

      await expect(wardrobeService.deleteItem(mockItem.id)).rejects.toThrow('Item not found');
    });
  });

  describe('searchItems', () => {
    it('should search items by query', async () => {
      const searchResults = [mockItem];
      mocks.supabase.from().select().or().mockResolvedValueOnce({
        data: searchResults,
        error: null,
      });

      const result = await wardrobeService.searchItems('blue dress');

      expect(result).toEqual(searchResults);
      expect(mocks.supabase.from().select().or).toHaveBeenCalled();
    });

    it('should filter by category', async () => {
      const filteredResults = [mockItem];
      mocks.supabase.from().select().eq().mockResolvedValueOnce({
        data: filteredResults,
        error: null,
      });

      const result = await wardrobeService.getItemsByCategory(WardrobeCategory.DRESSES);

      expect(result).toEqual(filteredResults);
      expect(mocks.supabase.from().select().eq).toHaveBeenCalledWith('category', WardrobeCategory.DRESSES);
    });

    it('should filter by color', async () => {
      const colorResults = [mockItem];
      mocks.supabase.from().select().contains().mockResolvedValueOnce({
        data: colorResults,
        error: null,
      });

      const result = await wardrobeService.getItemsByColor(WardrobeColor.BLUE);

      expect(result).toEqual(colorResults);
      expect(mocks.supabase.from().select().contains).toHaveBeenCalledWith('colors', [WardrobeColor.BLUE]);
    });

    it('should filter by tags', async () => {
      const tagResults = [mockItem];
      mocks.supabase.from().select().contains().mockResolvedValueOnce({
        data: tagResults,
        error: null,
      });

      const result = await wardrobeService.getItemsByTags(['casual']);

      expect(result).toEqual(tagResults);
      expect(mocks.supabase.from().select().contains).toHaveBeenCalledWith('tags', ['casual']);
    });
  });

  describe('getFavorites', () => {
    it('should fetch favorite items', async () => {
      const favoriteItems = [{ ...mockItem, isFavorite: true }];
      mocks.supabase.from().select().eq().mockResolvedValueOnce({
        data: favoriteItems,
        error: null,
      });

      const result = await wardrobeService.getFavorites();

      expect(result).toEqual(favoriteItems);
      expect(mocks.supabase.from().select().eq).toHaveBeenCalledWith('is_favorite', true);
    });
  });

  describe('getRecentlyAdded', () => {
    it('should fetch recently added items', async () => {
      const recentItems = [mockItem];
      mocks.supabase.from().select().order().limit().mockResolvedValueOnce({
        data: recentItems,
        error: null,
      });

      const result = await wardrobeService.getRecentlyAdded(10);

      expect(result).toEqual(recentItems);
      expect(mocks.supabase.from().select().order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mocks.supabase.from().select().order().limit).toHaveBeenCalledWith(10);
    });
  });

  describe('getStatistics', () => {
    it('should calculate wardrobe statistics', async () => {
      const items = [
        createMockWardrobeItem({ category: WardrobeCategory.DRESSES }),
        createMockWardrobeItem({ category: WardrobeCategory.TOPS }),
        createMockWardrobeItem({ category: WardrobeCategory.DRESSES }),
      ];
      
      mocks.supabase.from().select().mockResolvedValueOnce({
        data: items,
        error: null,
      });

      const stats = await wardrobeService.getStatistics();

      expect(stats).toEqual({
        totalItems: 3,
        categoryCounts: {
          [WardrobeCategory.DRESSES]: 2,
          [WardrobeCategory.TOPS]: 1,
        },
        colorCounts: expect.any(Object),
        favoriteCount: expect.any(Number),
        recentlyAddedCount: expect.any(Number),
      });
    });
  });

  describe('bulkOperations', () => {
    it('should perform bulk updates', async () => {
      const itemIds = ['item1', 'item2', 'item3'];
      const updates = { isFavorite: true };
      
      mocks.supabase.from().update().in().mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await wardrobeService.bulkUpdate(itemIds, updates);

      expect(mocks.supabase.from().update).toHaveBeenCalledWith({
        ...updates,
        updated_at: expect.any(String),
      });
      expect(mocks.supabase.from().update().in).toHaveBeenCalledWith('id', itemIds);
    });

    it('should perform bulk deletes', async () => {
      const itemIds = ['item1', 'item2', 'item3'];
      
      mocks.supabase.from().delete().in().mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await wardrobeService.bulkDelete(itemIds);

      expect(mocks.supabase.from().delete().in).toHaveBeenCalledWith('id', itemIds);
    });
  });

  describe('caching', () => {
    it('should cache items after successful fetch', async () => {
      const items = [mockItem];
      mocks.supabase.from().select().mockResolvedValueOnce({
        data: items,
        error: null,
      });

      await wardrobeService.getAllItems();

      expect(mocks.asyncStorage.setItem).toHaveBeenCalledWith(
        'wardrobe_cache',
        JSON.stringify(items)
      );
    });

    it('should invalidate cache after updates', async () => {
      const updatedItem = { ...mockItem, name: 'Updated' };
      mocks.supabase.from().update().eq().select().single().mockResolvedValueOnce({
        data: updatedItem,
        error: null,
      });

      await wardrobeService.updateItem(mockItem.id, { name: 'Updated' });

      expect(mocks.asyncStorage.removeItem).toHaveBeenCalledWith('wardrobe_cache');
    });
  });

  describe('validation', () => {
    it('should validate required fields', async () => {
      const invalidItem = {
        name: '',
        category: WardrobeCategory.DRESSES,
        colors: [],
        tags: [],
        imageUri: '',
      };

      await expect(wardrobeService.addItem(invalidItem as any)).rejects.toThrow('Item name is required');
    });

    it('should validate category enum', async () => {
      const invalidItem = {
        ...mockItem,
        category: 'invalid_category' as any,
      };

      await expect(wardrobeService.addItem(invalidItem)).rejects.toThrow('Invalid category');
    });

    it('should validate colors array', async () => {
      const invalidItem = {
        ...mockItem,
        colors: ['invalid_color'] as any,
      };

      await expect(wardrobeService.addItem(invalidItem)).rejects.toThrow('Invalid color');
    });
  });

  describe('error handling', () => {
    it('should handle network timeouts', async () => {
      mocks.supabase.from().select().mockRejectedValueOnce(new Error('Network timeout'));

      await expect(wardrobeService.getAllItems()).rejects.toThrow('Network timeout');
    });

    it('should handle database connection errors', async () => {
      mocks.supabase.from().select().mockRejectedValueOnce(new Error('Connection refused'));

      await expect(wardrobeService.getAllItems()).rejects.toThrow('Connection refused');
    });

    it('should handle malformed data gracefully', async () => {
      mocks.supabase.from().select().mockResolvedValueOnce({
        data: [{ invalid: 'data' }],
        error: null,
      });

      const result = await wardrobeService.getAllItems();
      expect(result).toEqual([]);
    });
  });
});