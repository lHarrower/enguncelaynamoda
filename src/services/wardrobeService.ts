// WardrobeService class wrapper to align with tests and imports
import { supabase } from '@/config/supabaseClient';
import type { WardrobeItemRecord } from '@/types/aynaMirror';
import { logInDev } from '@/utils/consoleSuppress';
import { ConnectionMonitor, dbOptimizer, OptimizedQueries } from '@/utils/databaseOptimizations';
import { safeParse } from '@/utils/safeJSON';
import { secureStorage } from '@/utils/secureStorage';
import { ensureSupabaseOk } from '@/utils/supabaseErrorMapping';
import { isSupabaseOk, wrap } from '@/utils/supabaseResult';
import {
  databasePerformanceService,
  executeOptimizedQuery,
  WardrobeOptimizedQueries,
} from './databasePerformanceService';

export interface WardrobeItem {
  id: string;
  name?: string;
  category: string;
  colors: string[];
  // Some callers use a singular 'color' field; keep optional for compatibility
  color?: string;
  brand?: string;
  price?: number;
  purchasePrice?: number;
  purchaseDate?: Date;
  isFavorite?: boolean;
  tags?: string[];
  created_at?: string | Date;
}

/**
 * Wardrobe Service - Manages user's clothing items and wardrobe data
 *
 * Provides comprehensive wardrobe management functionality including:
 * - CRUD operations for wardrobe items
 * - Intelligent caching for performance optimization
 * - Data transformation between database and domain models
 * - Offline support with local storage fallback
 *
 * Features automatic cache invalidation and error recovery mechanisms
 * to ensure data consistency and reliability.
 *
 * @example
 * ```typescript
 * const wardrobeService = new WardrobeService();
 * const items = await wardrobeService.getWardrobeItems('user123');
 * await wardrobeService.addWardrobeItem(newItem);
 * ```
 */
export class WardrobeService {
  /** In-memory cache for wardrobe items by user ID */
  private cache: Map<string, WardrobeItem[]> = new Map();
  private lastFetchTime = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached users
  private readonly CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
  private cleanupTimer: ReturnType<typeof setInterval> | null = null; // OPERASYON DİSİPLİN: Memory leak önleme
  private isDestroyed = false;

  constructor() {
    this.startCleanupTimer();
  }

  // Start periodic cache cleanup
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredCache();
    }, this.CLEANUP_INTERVAL);
  }

  // Clean up expired cache entries and enforce size limits
  private cleanupExpiredCache(): void {
    if (this.isDestroyed) {
      return;
    }

    const now = Date.now();
    const expiredKeys: string[] = [];

    // Find expired entries
    this.lastFetchTime.forEach((fetchTime, userId) => {
      if (now - fetchTime > this.CACHE_DURATION) {
        expiredKeys.push(userId);
      }
    });

    // Remove expired entries
    expiredKeys.forEach((userId) => {
      this.cache.delete(userId);
      this.lastFetchTime.delete(userId);
    });

    // Enforce cache size limit (LRU eviction)
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(this.lastFetchTime.entries()).sort(([, a], [, b]) => a - b); // Sort by fetch time (oldest first)

      const entriesToRemove = sortedEntries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
      entriesToRemove.forEach(([userId]) => {
        this.cache.delete(userId);
        this.lastFetchTime.delete(userId);
      });
    }
  }

  // Check if cache is valid for a user
  private isCacheValid(userId: string): boolean {
    if (this.isDestroyed) {
      return false;
    }

    const lastFetch = this.lastFetchTime.get(userId);
    if (!lastFetch) {
      return false;
    }

    return Date.now() - lastFetch < this.CACHE_DURATION;
  }

  // Destroy service and cleanup resources
  // OPERASYON DİSİPLİN: Memory leak önleme - tüm interval'ları temizle
  public destroy(): void {
    this.isDestroyed = true;

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.cache.clear();
    this.lastFetchTime.clear();

    // Clear related caches
    OptimizedQueries.clearCacheByPattern('wardrobe');
  }

  /**
   * OPERASYON DİSİPLİN: Component unmount'ta çağrılması gereken cleanup metodu
   * React component'lerde useEffect cleanup function'ında kullanılmalı
   */
  public cleanup(): void {
    this.destroy();
  }

  // Get performance metrics for this service
  public getPerformanceMetrics(): {
    cacheSize: number;
    cacheHitRate: number;
    dbPerformance: ReturnType<typeof dbOptimizer.getPerformanceAnalytics>;
  } {
    const cacheStats = OptimizedQueries.getCacheStats();
    const dbStats = databasePerformanceService.getPerformanceSummary();

    return {
      cacheSize: this.cache.size,
      cacheHitRate: cacheStats.hitRate,
      dbPerformance: dbStats.dbStats,
    };
  }

  // Optimize wardrobe table
  public async optimizeDatabase(): Promise<void> {
    try {
      await databasePerformanceService.optimizeTable('wardrobe_items');
      logInDev('Wardrobe database optimization completed');
    } catch (error) {
      logInDev(
        'Failed to optimize wardrobe database:',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private toDomain(record: WardrobeItemRecord | Record<string, unknown>): WardrobeItem {
    const r = record as Record<string, unknown>;

    // Handle colors array or fallback to single color
    const rawColors = r.colors || r.color_palette;
    const fallbackColor = r.color;
    const colors: string[] = Array.isArray(rawColors)
      ? rawColors.filter((c): c is string => typeof c === 'string')
      : typeof fallbackColor === 'string'
        ? [fallbackColor]
        : [];

    return {
      id: String(r.id),
      name: typeof r.name === 'string' ? r.name : undefined,
      category: typeof r.category === 'string' ? r.category : 'uncategorised',
      colors,
      color: colors[0],
      brand: typeof r.brand === 'string' ? r.brand : undefined,
      price: typeof r.price === 'number' ? r.price : undefined,
      isFavorite: Boolean(r.is_favorite || r.isFavorite),
      tags: Array.isArray(r.tags)
        ? r.tags.filter((t): t is string => typeof t === 'string')
        : undefined,
      created_at:
        typeof r.created_at === 'string' || r.created_at instanceof Date ? r.created_at : undefined,
    };
  }

  private normaliseArray(input: unknown): WardrobeItem[] {
    if (!Array.isArray(input)) {
      return [];
    }
    return input.map((rec) => this.toDomain(rec as Record<string, unknown>));
  }

  /**
   * Retrieves all wardrobe items for a user with intelligent caching
   *
   * Fetches wardrobe items from the database with automatic caching for performance.
   * Falls back to local storage cache if network request fails. Supports both
   * user-specific queries and global item retrieval.
   *
   * @param userId - Optional user ID to filter items. If not provided, returns all items
   * @returns Promise resolving to array of wardrobe items
   *
   * @throws {Error} When database query fails and no cached data is available
   *
   * @example
   * ```typescript
   * const userItems = await wardrobeService.getAllItems('user123');
   * const allItems = await wardrobeService.getAllItems();
   * ```
   */
  async getAllItems(userId?: string): Promise<WardrobeItem[]> {
    if (this.isDestroyed) {
      throw new Error('WardrobeService has been destroyed');
    }

    const cacheKey = `all_${userId || 'default'}`;
    const cachedResult = this.getCachedItems(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const normalised = await this.fetchItemsFromDatabase(userId);
      await this.cacheItems(cacheKey, normalised);
      return [...normalised];
    } catch (e) {
      const fallbackItems = await this.getFallbackItems();
      if (fallbackItems) {
        return fallbackItems;
      }
      throw e;
    }
  }

  /**
   * Get cached items if available and valid
   */
  private getCachedItems(cacheKey: string): WardrobeItem[] | null {
    if (this.isCacheValid(cacheKey)) {
      const cachedItems = this.cache.get(cacheKey);
      if (cachedItems) {
        // Update access time for LRU
        this.lastFetchTime.set(cacheKey, Date.now());
        return [...cachedItems]; // Return a copy to prevent mutations
      }
    }
    return null;
  }

  /**
   * Fetch items from database with health check
   */
  private async fetchItemsFromDatabase(userId?: string): Promise<WardrobeItem[]> {
    // Check database health before querying
    const isHealthy = await ConnectionMonitor.checkHealth();
    if (!isHealthy) {
      const cachedItems = await this.getStoredCacheItems();
      if (cachedItems) {
        return cachedItems;
      }
    }

    if (userId) {
      // Use optimized query with performance monitoring for user-specific items
      const items = await this.getItems();
      return items.slice(0, 1000); // Apply limit
    } else {
      // Fallback to direct query for all items (admin use case)
      const { data, error } = await dbOptimizer.monitorQuery(
        'getAllItems_global',
        async () => await supabase.from('wardrobe_items').select('*'),
      );
      if (error) {
        throw error;
      }
      return this.normaliseArray(data);
    }
  }

  /**
   * Get items from stored cache
   */
  private async getStoredCacheItems(): Promise<WardrobeItem[] | null> {
    logInDev('Database unhealthy, using cached data');
    await secureStorage.initialize();
    const cached = await secureStorage.getItem('wardrobe_cache');
    if (cached) {
      const parsed = safeParse<unknown>(cached, []);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
          .map((r) => this.toDomain(r));
      }
    }
    return null;
  }

  /**
   * Cache items in memory and storage
   */
  private async cacheItems(cacheKey: string, items: WardrobeItem[]): Promise<void> {
    // Ensure we don't exceed cache size before adding
    if (this.cache.size >= this.MAX_CACHE_SIZE && !this.cache.has(cacheKey)) {
      this.cleanupExpiredCache();
    }

    this.cache.set(cacheKey, items);
    this.lastFetchTime.set(cacheKey, Date.now());
    await secureStorage.setItem('wardrobe_cache', JSON.stringify(items));
  }

  /**
   * Get fallback items from storage when database fails
   */
  private async getFallbackItems(): Promise<WardrobeItem[] | null> {
    const cached = await secureStorage.getItem('wardrobe_cache');
    if (cached) {
      const parsed = safeParse<unknown>(cached, []);
      if (Array.isArray(parsed)) {
        const items = parsed
          .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
          .map((r) => this.toDomain(r));
        return [...items]; // Return a copy
      }
    }
    return null;
  }

  /**
   * Retrieves a specific wardrobe item by its ID
   *
   * @param id - Unique identifier of the wardrobe item
   * @returns Promise resolving to the wardrobe item or null if not found
   *
   * @example
   * ```typescript
   * const item = await wardrobeService.getItemById('item-123');
   * if (item) {
   *   // Example: item.name
   * }
   * ```
   */
  async getItemById(id: string): Promise<WardrobeItem | null> {
    const data = await executeOptimizedQuery(
      'SELECT_BY_ID',
      'wardrobe_items',
      async () => {
        const res = await wrap(
          async () => await supabase.from('wardrobe_items').select('*').eq('id', id).single(),
        );
        if (!isSupabaseOk(res)) {
          return null;
        }
        return res.data;
      },
      `wardrobe_item_${id}`,
      10 * 60 * 1000, // 10 minutes cache for individual items
    );

    if (!data) {
      return null;
    }
    return this.toDomain(data as Record<string, unknown>);
  }

  /**
   * Adds a new item to the wardrobe with flexible parameter handling
   *
   * Supports two calling patterns:
   * - addItem(item) - Adds item for current user
   * - addItem(userId, item) - Adds item for specific user
   *
   * Automatically invalidates cache and generates unique ID if not provided.
   *
   * @param arg1 - Either userId (string) or item data (Partial<WardrobeItem>)
   * @param arg2 - Item data when first argument is userId
   * @returns Promise resolving to the created wardrobe item
   *
   * @throws {Error} When item creation fails or validation errors occur
   *
   * @example
   * ```typescript
   * // Add item for current user
   * const item = await wardrobeService.addItem({
   *   name: 'Blue Jeans',
   *   category: 'BOTTOMS',
   *   imageUri: 'path/to/image.jpg'
   * });
   *
   * // Add item for specific user
   * const item = await wardrobeService.addItem('user123', {
   *   name: 'Red Dress',
   *   category: 'DRESSES'
   * });
   * ```
   */
  async addItem(
    arg1: string | Partial<WardrobeItem>,
    arg2?: Partial<WardrobeItem>,
  ): Promise<WardrobeItem> {
    const item = (typeof arg1 === 'string' ? arg2 : arg1) as Partial<WardrobeItem>;
    if (!item.name) {
      throw new Error('Item name is required');
    }
    // Normalize single color -> colors array
    const record: Record<string, unknown> = { ...item };
    if (!record.colors && record.color) {
      record.colors = [record.color];
    }
    const res = await wrap(
      async () => await supabase.from('wardrobe_items').insert(record).select().single(),
    );
    const data = ensureSupabaseOk(res, { action: 'addItem' }) as WardrobeItemRecord;
    this.cache.clear();
    return this.toDomain(data);
  }

  // Flexible signature: updateItem(id, updates) or updateItem(userId, id, updates)
  async updateItem(
    arg1: string,
    arg2: string | Partial<WardrobeItem>,
    arg3?: Partial<WardrobeItem>,
  ): Promise<WardrobeItem> {
    let userId: string | undefined;
    let id: string;
    let updates: Partial<WardrobeItem>;
    if (typeof arg2 === 'string') {
      userId = arg1;
      id = arg2;
      updates = arg3 || {};
    } else {
      id = arg1;
      updates = arg2 || {};
    }
    let query = supabase.from('wardrobe_items').update(updates).eq('id', id);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const res = await wrap(async () => await query.select().single());
    const data = ensureSupabaseOk(res, { action: 'updateItem' }) as WardrobeItemRecord;
    this.cache.clear();
    return this.toDomain(data);
  }

  async bulkUpdateItems(userId: string, items: WardrobeItem[]): Promise<void> {
    await supabase.from('wardrobe_items').upsert(items);
    this.cache.clear();
  }

  async bulkUpdate(itemIds: string[], updates: Partial<WardrobeItem>): Promise<void> {
    const res = await wrap(
      async () => await supabase.from('wardrobe_items').update(updates).in('id', itemIds),
    );
    ensureSupabaseOk(res, { action: 'bulkUpdate' });
    this.cache.clear();
  }

  async bulkDelete(itemIds: string[]): Promise<void> {
    const res = await wrap(
      async () => await supabase.from('wardrobe_items').delete().in('id', itemIds),
    );
    ensureSupabaseOk(res, { action: 'bulkDelete' });
    this.cache.clear();
  }

  async deleteItem(id: string): Promise<boolean> {
    const res = await wrap(async () => await supabase.from('wardrobe_items').delete().eq('id', id));
    ensureSupabaseOk(res, { action: 'deleteItem' });
    this.cache.clear();
    return true;
  }

  // Flexible signature: searchItems(queryText) or searchItems(userId, queryText)
  async searchItems(arg1: string, arg2?: string): Promise<WardrobeItem[]> {
    const hasUser = typeof arg2 === 'string';
    const userId = hasUser ? arg1 : undefined;
    const queryText = hasUser ? arg2 : arg1;

    if (userId) {
      // Use enhanced optimized search for user-specific queries
      const data = await WardrobeOptimizedQueries.searchWardrobeItems(userId, queryText, {
        limit: 50, // Reasonable limit for search results
      });
      return this.normaliseArray(data as unknown);
    } else {
      // Fallback to direct query for global search
      const like = `%${queryText}%`;
      const res = await dbOptimizer.monitorQuery(
        'searchItems_global',
        async () =>
          await supabase
            .from('wardrobe_items')
            .select('*')
            .or(`name.ilike.${like},brand.ilike.${like}`)
            .order('created_at', { ascending: false })
            .limit(50),
      );
      if (res.error) {
        throw new Error(`Search items failed: ${res.error.message}`);
      }
      const data = res.data;
      return this.normaliseArray(data);
    }
  }

  async getItemsByCategory(category: string): Promise<WardrobeItem[]> {
    const res = await wrap(
      async () => await supabase.from('wardrobe_items').select('*').eq('category', category),
    );
    const data = ensureSupabaseOk(res, { action: 'getItemsByCategory' });
    return this.normaliseArray(data as unknown);
  }

  async getItemsByColor(color: string): Promise<WardrobeItem[]> {
    // Using contains on colors array when supported; fallback to filtering client-side
    try {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .contains('colors', [color]);
      if (error) {
        throw error;
      }
      return this.normaliseArray(data);
    } catch {
      const all = await this.getAllItems();
      return all.filter((i) => Array.isArray(i.colors) && i.colors.includes(color));
    }
  }

  async getItemsByTags(tags: string[]): Promise<WardrobeItem[]> {
    try {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .overlaps('tags', tags);
      if (error) {
        throw error;
      }
      return this.normaliseArray(data);
    } catch {
      const all = await this.getAllItems();
      return all.filter((i) => i.tags && i.tags.some((t) => tags.includes(t)));
    }
  }

  async getFavorites(): Promise<WardrobeItem[]> {
    try {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('is_favorite', true);
      if (error) {
        throw error;
      }
      return this.normaliseArray(data);
    } catch {
      const all = await this.getAllItems();
      return all.filter((i) => i.isFavorite);
    }
  }

  async getRecentlyAdded(limit = 10): Promise<WardrobeItem[]> {
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      throw new Error(error.message || 'Query failed');
    }
    return this.normaliseArray(data);
  }

  async getStatistics(): Promise<{ total: number; byCategory: Record<string, number> }> {
    const items = await this.getAllItems();
    const byCategory: Record<string, number> = {};
    for (const item of items) {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    }
    return { total: items.length, byCategory };
  }

  // Backwards-compatible API expected by some services/tests
  async getItems(): Promise<WardrobeItem[]> {
    return this.getAllItems();
  }

  async initializeWardrobe(): Promise<WardrobeItem[]> {
    // Ensure there is at least a minimal wardrobe; seed a starter item if empty
    const items = await this.getAllItems();
    if (items.length > 0) {
      return items;
    }
    try {
      await this.addItem({ name: 'First Item', category: 'tops', colors: ['black'] });
    } catch {
      // Ignore seeding failures; proceed to read whatever exists
    }
    return this.getAllItems();
  }
}

export const wardrobeService = new WardrobeService();
// Backwards-compatible named API expected by some tests/imports
export async function getWardrobeItems(userId?: string): Promise<WardrobeItem[]> {
  return wardrobeService.getAllItems(userId);
}
export default WardrobeService;
