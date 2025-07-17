// Wardrobe Service - Supabase Integration
import { supabase } from '../config/supabaseClient';

export interface NewClothingItem {
  image_uri: string;
  processed_image_uri: string;
  category: string;
  subcategory?: string;
  colors: string[];
  brand?: string;
  size?: string;
  notes?: string;
  // user_id will be handled by RLS (Row Level Security) in Supabase
}

export interface WardrobeItem {
  id: string;
  userId: string;
  imageUri: string;
  processedImageUri?: string;
  category: string;
  subcategory?: string;
  colors: string[];
  brand?: string;
  size?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  tags: string[];
  notes?: string;
  usageCount: number;
  lastWorn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Gets all wardrobe items for a user.
 * @param userId - The user ID to get wardrobe items for.
 * @returns Array of wardrobe items.
 */
export const getWardrobeItems = async (userId: string): Promise<WardrobeItem[]> => {
  console.log('[WardrobeService] Getting wardrobe items for user:', userId);

  try {
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[WardrobeService] Supabase select error:', error);
      throw error;
    }

    // Transform database format to interface format
    const wardrobeItems: WardrobeItem[] = (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      imageUri: item.image_uri,
      processedImageUri: item.processed_image_uri,
      category: item.category,
      subcategory: item.subcategory,
      colors: item.colors || [],
      brand: item.brand,
      size: item.size,
      purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
      purchasePrice: item.purchase_price,
      tags: item.tags || [],
      notes: item.notes,
      usageCount: item.usage_count || 0,
      lastWorn: item.last_worn ? new Date(item.last_worn) : undefined,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));

    console.log('[WardrobeService] Successfully retrieved items:', wardrobeItems.length);
    return wardrobeItems;

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error(`[WardrobeService] Failed to get wardrobe items: ${message}`);
    throw new Error(`Failed to get wardrobe items: ${message}`);
  }
};

/**
 * Saves a new clothing item to the Supabase database.
 * @param item - The clothing item data, which should already contain the public URLs for the images.
 * @returns The data of the newly created item from the database.
 */
export const saveClothingItem = async (item: NewClothingItem) => {
  console.log('[WardrobeService] Attempting to save item:', item);

  try {
    const { data, error } = await supabase
      .from('wardrobeItems')
      .insert([item])
      .select()
      .single();

    if (error) {
      console.error('[WardrobeService] Supabase insert error:', error);
      throw error;
    }

    console.log('[WardrobeService] Successfully inserted item:', data);
    return data;

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error(`[WardrobeService] Failed to save clothing item: ${message}`);
    throw new Error(`Failed to save clothing item: ${message}`);
  }
}; 