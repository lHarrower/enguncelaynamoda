// WardrobeService class wrapper to align with tests and imports
import { supabase } from '@/config/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WardrobeItem {
  id: string;
  name?: string;
  category: string;
  colors: string[];
  // Some callers use a singular 'color' field; keep optional for compatibility
  color?: string;
  brand?: string;
  price?: number;
  isFavorite?: boolean;
  tags?: string[];
  created_at?: string | Date;
}

export class WardrobeService {
  private cache: Map<string, WardrobeItem[]> = new Map();

  async getAllItems(userId?: string): Promise<WardrobeItem[]> {
    const cacheKey = `all_${userId || 'default'}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    try {
      let query: any = supabase.from('wardrobe_items').select('*');
      if (userId) {
        query = query.eq('user_id', userId).order('created_at', { ascending: false });
      }
      const { data, error } = await query;
      if (error) throw error;
      this.cache.set(cacheKey, (data || []) as WardrobeItem[]);
      await AsyncStorage.setItem('wardrobe_cache', JSON.stringify(data || []));
      return (data || []) as WardrobeItem[];
    } catch (e) {
      const cached = await AsyncStorage.getItem('wardrobe_cache');
      if (cached) return JSON.parse(cached);
      throw e;
    }
  }

  async getItemById(id: string): Promise<WardrobeItem | null> {
    const { data, error } = await supabase.from('wardrobe_items').select('*').eq('id', id).single();
    if (error) return null;
    return data as WardrobeItem;
  }

  // Flexible signature: addItem(item) or addItem(userId, item)
  async addItem(arg1: string | Partial<WardrobeItem>, arg2?: Partial<WardrobeItem>): Promise<WardrobeItem> {
    const item = (typeof arg1 === 'string' ? arg2 : arg1) as Partial<WardrobeItem>;
    if (!item.name) throw new Error('Item name is required');
    // Normalize single color -> colors array
    const record: any = {
      ...item,
    };
    if (!record.colors && record.color) {
      record.colors = [record.color];
    }
    const { data, error } = await supabase.from('wardrobe_items').insert(record).select().single();
    if (error) throw new Error(error.message || 'Insert failed');
    this.cache.clear();
    return data as WardrobeItem;
  }

  // Flexible signature: updateItem(id, updates) or updateItem(userId, id, updates)
  async updateItem(arg1: string, arg2: string | Partial<WardrobeItem>, arg3?: Partial<WardrobeItem>): Promise<WardrobeItem> {
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
    let query: any = supabase.from('wardrobe_items').update(updates).eq('id', id);
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query.select().single();
    if (error) throw new Error(error.message || 'Update failed');
    this.cache.clear();
    return data as WardrobeItem;
  }

  async bulkUpdateItems(userId: string, items: WardrobeItem[]): Promise<void> {
    await supabase.from('wardrobe_items').upsert(items);
    this.cache.clear();
  }

  async bulkUpdate(itemIds: string[], updates: Partial<WardrobeItem>): Promise<void> {
    const { error } = await supabase.from('wardrobe_items').update(updates).in('id', itemIds);
    if (error) throw new Error(error.message || 'Bulk update failed');
    this.cache.clear();
  }

  async bulkDelete(itemIds: string[]): Promise<void> {
    const { error } = await supabase.from('wardrobe_items').delete().in('id', itemIds);
    if (error) throw new Error(error.message || 'Bulk delete failed');
    this.cache.clear();
  }

  async deleteItem(id: string): Promise<boolean> {
    const { error } = await supabase.from('wardrobe_items').delete().eq('id', id);
    if (error) throw new Error(error.message || 'Delete failed');
    this.cache.clear();
    return true;
  }

  // Flexible signature: searchItems(queryText) or searchItems(userId, queryText)
  async searchItems(arg1: string, arg2?: string): Promise<WardrobeItem[]> {
    const hasUser = typeof arg2 === 'string';
    const userId = hasUser ? arg1 : undefined;
    const queryText = hasUser ? (arg2 as string) : arg1;
    // Follow chain mocked in tests: select -> eq(user_id) -> or(...) -> order
    const like = `%${queryText}%`;
    let builder: any = (supabase as any).from('wardrobe_items').select('*');
    if (userId) builder = builder.eq('user_id', userId);
    const { data, error } = await builder
      .or(`name.ilike.${like},brand.ilike.${like}`)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message || 'Search failed');
    return (data || []) as WardrobeItem[];
  }

  async getItemsByCategory(category: string): Promise<WardrobeItem[]> {
    const { data, error } = await supabase.from('wardrobe_items').select('*').eq('category', category);
    if (error) throw new Error(error.message || 'Query failed');
    return (data || []) as WardrobeItem[];
  }

  async getItemsByColor(color: string): Promise<WardrobeItem[]> {
    // Using contains on colors array when supported; fallback to filtering client-side
    try {
      const { data, error } = await (supabase as any)
        .from('wardrobe_items')
        .select('*')
        .contains('colors', [color]);
      if (error) throw error;
      return (data || []) as WardrobeItem[];
    } catch {
      const all = await this.getAllItems();
      return all.filter(i => Array.isArray(i.colors) && i.colors.includes(color));
    }
  }

  async getItemsByTags(tags: string[]): Promise<WardrobeItem[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('wardrobe_items')
        .select('*')
        .overlaps('tags', tags);
      if (error) throw error;
      return (data || []) as WardrobeItem[];
    } catch {
      const all = await this.getAllItems();
      return all.filter(i => i.tags && i.tags.some(t => tags.includes(t)));
    }
  }

  async getFavorites(): Promise<WardrobeItem[]> {
    try {
      const { data, error } = await supabase.from('wardrobe_items').select('*').eq('is_favorite', true);
      if (error) throw error;
      return (data || []) as WardrobeItem[];
    } catch {
      const all = await this.getAllItems();
      return all.filter(i => i.isFavorite);
    }
  }

  async getRecentlyAdded(limit = 10): Promise<WardrobeItem[]> {
    const { data, error } = await (supabase as any)
      .from('wardrobe_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message || 'Query failed');
    return (data || []) as WardrobeItem[];
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
    // Ensure there is at least a minimal wardrobe; seed a placeholder if empty
    const items = await this.getAllItems();
    if (items.length > 0) return items;
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