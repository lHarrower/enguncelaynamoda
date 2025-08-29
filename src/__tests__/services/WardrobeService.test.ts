// Unit tests for WardrobeService
import { WardrobeService } from '@/services/wardrobeService';
import type { WardrobeItem } from '@/services/wardrobeService';
import { WardrobeCategory, WardrobeColor } from '@/types/wardrobe';
import { createMockWardrobeItem, mockApiResponses } from '@/__tests__/utils/testUtils';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');

const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  single: jest.fn(),
  maybeSingle: jest.fn(),
  mockResolvedValueOnce: jest.fn(),
  mockRejectedValueOnce: jest.fn(),
};

jest.mock('../../lib/supa', () => ({
  supabase: {
    from: jest.fn(() => mockQueryBuilder),
  },
}));

const mockSupabase = require('../../lib/supa').supabase;

describe('Gardırop Servisi', () => {
  let wardrobeService: WardrobeService;
  let mockItem: WardrobeItem;

  beforeEach(() => {
    wardrobeService = new WardrobeService();
    mockItem = createMockWardrobeItem();
    jest.clearAllMocks();
  });

  describe('getAllItems', () => {
    it('tüm gardırop öğelerini başarıyla getirmeli', async () => {
      const mockItems = [mockItem];
      mockQueryBuilder.select.mockResolvedValueOnce({
        data: mockItems,
        error: null,
      });

      const result = await wardrobeService.getAllItems();

      expect(result).toEqual(mockItems);
      expect(mockSupabase.from).toHaveBeenCalledWith('wardrobe_items');
    });

    it('getirme hatalarını zarif bir şekilde ele almalı', async () => {
      const mockError = new Error('Database error');
      mockQueryBuilder.select.mockRejectedValueOnce(mockError);

      await expect(wardrobeService.getAllItems()).rejects.toThrow('Database error');
    });

    it('çevrimdışıyken önbelleğe alınmış öğeleri döndürmeli', async () => {
      const cachedItems = [mockItem];
      (
        jest.requireMock('@react-native-async-storage/async-storage')
          .getItem as unknown as jest.Mock
      ).mockResolvedValueOnce(JSON.stringify(cachedItems));
      mockQueryBuilder.select.mockRejectedValueOnce(new Error('Network error'));

      const result = await wardrobeService.getAllItems();

      expect(result).toEqual(cachedItems);
      expect(
        jest.requireMock('@react-native-async-storage/async-storage').getItem,
      ).toHaveBeenCalledWith('wardrobe_cache');
    });
  });

  describe('getItemById', () => {
    it('ID ile öğeyi başarıyla getirmeli', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockItem,
        error: null,
      });

      const result = await wardrobeService.getItemById(mockItem.id);

      expect(result).toEqual(mockItem);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', mockItem.id);
    });

    it('var olmayan öğe için null döndürmeli', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await wardrobeService.getItemById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('addItem', () => {
    it('yeni öğeyi başarıyla eklemeli', async () => {
      const newItem = { ...mockItem, id: undefined };
      const addedItem = { ...mockItem, id: 'new-id' };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: addedItem,
        error: null,
      });

      const result = await wardrobeService.addItem(newItem as any);

      expect(result).toEqual(addedItem);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: newItem.name,
          category: newItem.category,
          colors: newItem.colors,
        }),
      );
    });

    it('doğrulama hatalarını ele almalı', async () => {
      const invalidItem = { ...mockItem, name: '' };

      await expect(wardrobeService.addItem(invalidItem)).rejects.toThrow('Item name is required');
    });

    it('veritabanı hatalarını ele almalı', async () => {
      const newItem = { ...mockItem, id: undefined };
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database constraint violation' },
      });

      await expect(wardrobeService.addItem(newItem as any)).rejects.toThrow(
        'Database constraint violation',
      );
    });
  });

  describe('updateItem', () => {
    it('öğeyi başarıyla güncellemeli', async () => {
      const updatedItem = { ...mockItem, name: 'Updated Name' };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: updatedItem,
        error: null,
      });

      const result = await wardrobeService.updateItem(mockItem.id, { name: 'Updated Name' });

      expect(result).toEqual(updatedItem);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        name: 'Updated Name',
        updated_at: expect.any(String),
      });
    });

    it('kısmi güncellemeleri ele almalı', async () => {
      const partialUpdate = { isFavorite: true };
      const updatedItem = { ...mockItem, ...partialUpdate };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: updatedItem,
        error: null,
      });

      const result = await wardrobeService.updateItem(mockItem.id, partialUpdate);

      expect(result).toEqual(updatedItem);
    });
  });

  describe('deleteItem', () => {
    it('öğeyi başarıyla silmeli', async () => {
      mockQueryBuilder.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await wardrobeService.deleteItem(mockItem.id);

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', mockItem.id);
    });

    it('silme hatalarını ele almalı', async () => {
      mockQueryBuilder.eq.mockResolvedValueOnce({
        data: null,
        error: { message: 'Item not found' },
      });

      await expect(wardrobeService.deleteItem(mockItem.id)).rejects.toThrow('Item not found');
    });
  });

  describe('searchItems', () => {
    it('sorgu ile öğeleri aramalı', async () => {
      const searchResults = [mockItem];
      mockQueryBuilder.or.mockResolvedValueOnce({
        data: searchResults,
        error: null,
      });

      const result = await wardrobeService.searchItems('blue');

      expect(result).toEqual(searchResults);
      expect(mockQueryBuilder.or).toHaveBeenCalled();
    });

    it('kategoriye göre filtrelemeli', async () => {
      const filteredResults = [mockItem];
      mockQueryBuilder.eq.mockResolvedValueOnce({
        data: filteredResults,
        error: null,
      });

      const result = await wardrobeService.getItemsByCategory(WardrobeCategory.DRESSES);

      expect(result).toEqual(filteredResults);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('category', WardrobeCategory.DRESSES);
    });

    it('renge göre filtrelemeli', async () => {
      const colorResults = [mockItem];
      mockQueryBuilder.contains.mockResolvedValueOnce({
        data: colorResults,
        error: null,
      });

      const result = await wardrobeService.getItemsByColor(WardrobeColor.BLUE);

      expect(result).toEqual(colorResults);
      expect(mockQueryBuilder.contains).toHaveBeenCalledWith('colors', [WardrobeColor.BLUE]);
    });

    it('etiketlere göre filtrelemeli', async () => {
      const tagResults = [mockItem];
      mockQueryBuilder.contains.mockResolvedValueOnce({
        data: tagResults,
        error: null,
      });

      const result = await wardrobeService.getItemsByTags(['casual']);

      expect(result).toEqual(tagResults);
      expect(mockQueryBuilder.contains).toHaveBeenCalledWith('tags', ['casual']);
    });
  });

  describe('getFavorites', () => {
    it('favori öğeleri getirmeli', async () => {
      const favoriteItems = [{ ...mockItem, isFavorite: true }];
      mockQueryBuilder.eq.mockResolvedValueOnce({
        data: favoriteItems,
        error: null,
      });

      const result = await wardrobeService.getFavorites();

      expect(result).toEqual(favoriteItems);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('is_favorite', true);
    });
  });

  describe('getRecentlyAdded', () => {
    it('yakın zamanda eklenen öğeleri getirmeli', async () => {
      const recentItems = [mockItem];
      mockQueryBuilder.limit.mockResolvedValueOnce({
        data: recentItems,
        error: null,
      });

      const result = await wardrobeService.getRecentlyAdded();

      expect(result).toEqual(recentItems);
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('getStatistics', () => {
    it('gardırop istatistiklerini hesaplamalı', async () => {
      const items = [
        createMockWardrobeItem({ category: WardrobeCategory.DRESSES }),
        createMockWardrobeItem({ category: WardrobeCategory.TOPS }),
        createMockWardrobeItem({ category: WardrobeCategory.DRESSES }),
      ];

      mockQueryBuilder.select.mockResolvedValueOnce({
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

  describe('toplu işlemler', () => {
    it('toplu güncellemeler yapmalı', async () => {
      const itemIds = ['item1', 'item2', 'item3'];
      const updates = { isFavorite: true };

      mockQueryBuilder.in.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await wardrobeService.bulkUpdate(itemIds, updates);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        ...updates,
        updated_at: expect.any(String),
      });
      expect(mockQueryBuilder.in).toHaveBeenCalledWith('id', itemIds);
    });

    it('toplu silme işlemleri yapmalı', async () => {
      const itemIds = ['item1', 'item2', 'item3'];

      mockQueryBuilder.in.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await wardrobeService.bulkDelete(itemIds);

      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.in).toHaveBeenCalledWith('id', itemIds);
    });
  });

  describe('önbellekleme', () => {
    it('başarılı getirme işleminden sonra öğeleri önbelleğe almalı', async () => {
      const items = [mockItem];
      mockQueryBuilder.select.mockResolvedValueOnce({
        data: items,
        error: null,
      });

      await wardrobeService.getAllItems();

      expect(
        jest.requireMock('@react-native-async-storage/async-storage').setItem,
      ).toHaveBeenCalledWith('wardrobe_cache', JSON.stringify(items));
    });

    it('güncellemelerden sonra önbelleği geçersiz kılmalı', async () => {
      const updatedItem = { ...mockItem, name: 'Updated' };
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: updatedItem,
        error: null,
      });

      await wardrobeService.updateItem(mockItem.id, { name: 'Updated' });

      expect(
        jest.requireMock('@react-native-async-storage/async-storage').removeItem,
      ).toHaveBeenCalledWith('wardrobe_cache');
    });
  });

  describe('doğrulama', () => {
    it('gerekli alanları doğrulamalı', async () => {
      const invalidItem = { name: '', category: 'invalid_category', colors: [] };

      await expect(wardrobeService.addItem(invalidItem)).rejects.toThrow('Invalid category');
    });

    it('kategori enum değerini doğrulamalı', async () => {
      const invalidItem = {
        ...mockItem,
        category: 'invalid_category' as any,
      };

      await expect(wardrobeService.addItem(invalidItem)).rejects.toThrow('Invalid category');
    });

    it('renkler dizisini doğrulamalı', async () => {
      const invalidItem = {
        ...mockItem,
        colors: ['invalid_color'] as any,
      };

      await expect(wardrobeService.addItem(invalidItem)).rejects.toThrow('Invalid color');
    });
  });

  describe('hata işleme', () => {
    it('ağ zaman aşımlarını ele almalı', async () => {
      mockQueryBuilder.select.mockRejectedValueOnce(new Error('Network timeout'));

      await expect(wardrobeService.getAllItems()).rejects.toThrow('Network timeout');
    });

    it('veritabanı bağlantı hatalarını ele almalı', async () => {
      mockQueryBuilder.select.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(wardrobeService.getAllItems()).rejects.toThrow('Connection refused');
    });

    it('hatalı biçimlendirilmiş verileri zarif bir şekilde ele almalı', async () => {
      mockQueryBuilder.select.mockResolvedValueOnce({
        data: [{ invalid: 'data' }],
        error: null,
      });

      const result = await wardrobeService.getAllItems();
      expect(result).toEqual([]);
    });
  });
});
