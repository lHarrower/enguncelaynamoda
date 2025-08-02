// Enhanced Wardrobe Service - AYNA Mirror Intelligence Features
import { supabase } from '@/config/supabaseClient';
import { 
  WardrobeItem, 
  WardrobeItemRecord, 
  UsageStats, 
  UtilizationStats, 
  ItemCategory,
  NamingRequest,
  NamingResponse 
} from '@/types/aynaMirror';
import { AINameingService } from './aiNamingService';

export interface NewClothingItem {
  image_uri: string;
  processed_image_uri: string;
  category: string;
  subcategory?: string;
  colors: string[];
  brand?: string;
  size?: string;
  purchase_date?: string;
  purchase_price?: number;
  tags?: string[];
  notes?: string;
  name?: string;
  ai_generated_name?: string;
  name_override?: boolean;
  ai_analysis_data?: any;
  // user_id will be handled by RLS (Row Level Security) in Supabase
}

// ============================================================================
// ENHANCED WARDROBE SERVICE CLASS
// ============================================================================

export class EnhancedWardrobeService {
  
  // ========================================================================
  // CORE WARDROBE OPERATIONS
  // ========================================================================

  /**
   * Saves a new clothing item to the Supabase database with enhanced features.
   * @param item - The clothing item data with intelligence features
   * @param generateAIName - Whether to generate AI name for the item
   * @returns The data of the newly created item from the database
   */
  async saveClothingItem(item: NewClothingItem, generateAIName: boolean = true): Promise<WardrobeItemRecord> {
    console.log('[EnhancedWardrobeService] Attempting to save item:', item);

    try {
      // Automatically categorize if not provided
      if (!item.category) {
        item.category = await this.categorizeItemAutomatically(item.image_uri);
      }

      // Extract colors if not provided
      if (!item.colors || item.colors.length === 0) {
        item.colors = await this.extractItemColors(item.image_uri);
      }

      // Generate AI name if requested and not provided
      if (generateAIName && !item.ai_generated_name && !item.name) {
        try {
          const namingResponse = await this.generateItemName({
            imageUri: item.image_uri,
            category: item.category as ItemCategory,
            colors: item.colors,
            brand: item.brand
          });
          
          if (namingResponse) {
            item.ai_generated_name = namingResponse.aiGeneratedName;
            item.ai_analysis_data = namingResponse.analysisData;
            item.name_override = false;
          }
        } catch (error) {
          console.warn('[EnhancedWardrobeService] Failed to generate AI name:', error);
          // Continue without AI name
        }
      }

      // Suggest tags based on item properties
      const suggestedTags = await this.suggestItemTags(item as Partial<WardrobeItem>);
      item.tags = [...(item.tags || []), ...suggestedTags];

      const { data, error } = await supabase
        .from('wardrobeItems')
        .insert([{
          ...item,
          usage_count: 0,
          confidence_score: 0,
          tags: item.tags || []
        }])
        .select()
        .single();

      if (error) {
        console.error('[EnhancedWardrobeService] Supabase insert error:', error);
        throw new Error(error.message || 'Database error');
      }

      console.log('[EnhancedWardrobeService] Successfully inserted item:', data);
      return data;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      console.error(`[EnhancedWardrobeService] Failed to save clothing item: ${message}`);
      throw new Error(`Failed to save clothing item: ${message}`);
    }
  }

  /**
   * Retrieves all wardrobe items for a user with enhanced data
   */
  async getUserWardrobe(userId: string): Promise<WardrobeItem[]> {
    try {
      const { data, error } = await supabase
        .from('wardrobeItems')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(this.transformRecordToWardrobeItem);
    } catch (error) {
      console.error('[EnhancedWardrobeService] Failed to get user wardrobe:', error);
      throw error;
    }
  }

  // ========================================================================
  // USAGE TRACKING METHODS
  // ========================================================================

  /**
   * Tracks usage of a wardrobe item when worn in an outfit
   */
  async trackItemUsage(itemId: string, outfitId?: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('track_item_usage', {
        item_id: itemId,
        outfit_id: outfitId || null
      });

      if (error) {
        throw new Error(error.message || 'Failed to track item usage');
      }

      console.log(`[EnhancedWardrobeService] Tracked usage for item: ${itemId}`);
    } catch (error) {
      console.error('[EnhancedWardrobeService] Failed to track item usage:', error);
      throw error;
    }
  }

  /**
   * Gets detailed usage statistics for a specific item
   */
  async getItemUsageStats(itemId: string): Promise<UsageStats> {
    try {
      const { data, error } = await supabase
        .from('wardrobeItems')
        .select('id, usage_count, last_worn, confidence_score, purchase_price')
        .eq('id', itemId)
        .single();

      if (error) throw error;

      // Calculate cost per wear
      const costPerWear = data.purchase_price && data.usage_count > 0 
        ? data.purchase_price / data.usage_count 
        : 0;

      return {
        itemId: data.id,
        totalWears: data.usage_count,
        lastWorn: data.last_worn ? new Date(data.last_worn) : null,
        averageRating: data.confidence_score,
        complimentsReceived: 0, // TODO: Implement from feedback system
        costPerWear
      };
    } catch (error) {
      console.error('[EnhancedWardrobeService] Failed to get item usage stats:', error);
      throw error;
    }
  }

  /**
   * Identifies items that haven't been worn in the specified number of days
   */
  async getNeglectedItems(userId: string, daysSince: number = 30): Promise<WardrobeItem[]> {
    try {
      const { data, error } = await supabase.rpc('get_neglected_items', {
        user_uuid: userId,
        days_threshold: daysSince
      });

      if (error) throw error;

      // Transform the returned data to full WardrobeItem objects
      const fullItems = await Promise.all(
        data.map(async (item: any) => {
          const { data: fullItem, error: itemError } = await supabase
            .from('wardrobeItems')
            .select('*')
            .eq('id', item.id)
            .single();

          if (itemError) throw itemError;
          return this.transformRecordToWardrobeItem(fullItem);
        })
      );

      return fullItems;
    } catch (error) {
      console.error('[EnhancedWardrobeService] Failed to get neglected items:', error);
      throw error;
    }
  }

  // ========================================================================
  // COST-PER-WEAR CALCULATIONS
  // ========================================================================

  /**
   * Calculates cost-per-wear for a specific item
   */
  async calculateCostPerWear(itemId: string): Promise<number> {
    try {
      const stats = await this.getItemUsageStats(itemId);
      return stats.costPerWear;
    } catch (error) {
      console.error('[EnhancedWardrobeService] Failed to calculate cost per wear:', error);
      return 0;
    }
  }

  /**
   * Gets comprehensive wardrobe utilization statistics
   */
  async getWardrobeUtilizationStats(userId: string): Promise<UtilizationStats> {
    try {
      const { data, error } = await supabase.rpc('get_wardrobe_utilization_stats', {
        user_uuid: userId
      });

      if (error) throw error;

      const stats = data[0];
      return {
        totalItems: stats.total_items,
        activeItems: stats.active_items,
        neglectedItems: stats.neglected_items,
        averageCostPerWear: parseFloat(stats.average_cost_per_wear) || 0,
        utilizationPercentage: parseFloat(stats.utilization_percentage) || 0
      };
    } catch (error) {
      console.error('[EnhancedWardrobeService] Failed to get utilization stats:', error);
      throw error;
    }
  }

  // ========================================================================
  // AUTOMATIC CATEGORIZATION & COLOR EXTRACTION
  // ========================================================================

  /**
   * Automatically categorizes an item based on image analysis
   * TODO: Integrate with AI service for actual image recognition
   */
  async categorizeItemAutomatically(imageUri: string): Promise<ItemCategory> {
    try {
      console.log(`[EnhancedWardrobeService] Auto-categorizing image: ${imageUri}`);
      
      // Use existing AI analysis function
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: { imageUrl: imageUri }
      });

      if (error) {
        console.warn('[EnhancedWardrobeService] AI analysis failed:', error);
        return 'tops'; // Default fallback
      }

      // Extract category from AI analysis
      if (data && data.category) {
        return data.category as ItemCategory;
      }

      // Try to infer from tags
      if (data && data.tags && data.tags.length > 0) {
        const categoryMap: Record<string, ItemCategory> = {
          'shirt': 'tops',
          'blouse': 'tops',
          'sweater': 'tops',
          'cardigan': 'tops',
          'pants': 'bottoms',
          'jeans': 'bottoms',
          'shorts': 'bottoms',
          'skirt': 'bottoms',
          'dress': 'dresses',
          'shoes': 'shoes',
          'sneakers': 'shoes',
          'boots': 'shoes',
          'jacket': 'outerwear',
          'coat': 'outerwear',
          'blazer': 'outerwear'
        };

        for (const tag of data.tags) {
          const category = categoryMap[tag.toLowerCase()];
          if (category) {
            return category;
          }
        }
      }
      
      return 'tops'; // Default fallback
    } catch (error) {
      console.error('[EnhancedWardrobeService] Failed to auto-categorize item:', error);
      return 'tops'; // Safe fallback
    }
  }

  /**
   * Extracts dominant colors from an item image
   */
  async extractItemColors(imageUri: string): Promise<string[]> {
    try {
      console.log(`[EnhancedWardrobeService] Extracting colors from: ${imageUri}`);
      
      // Use existing AI analysis function
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: { imageUrl: imageUri }
      });

      if (error) {
        console.warn('[EnhancedWardrobeService] AI color analysis failed:', error);
        return ['black']; // Default fallback
      }

      // Extract colors from AI analysis
      if (data && data.colors && data.colors.length > 0) {
        // Convert color objects to color names
        return data.colors.map((color: any) => {
          if (typeof color === 'string') {
            return color;
          }
          return color.name || color.hex || 'black';
        }).slice(0, 3); // Limit to top 3 colors
      }
      
      return ['black']; // Default fallback
    } catch (error) {
      console.error('[EnhancedWardrobeService] Failed to extract colors:', error);
      return ['black']; // Safe fallback
    }
  }

  /**
   * Suggests relevant tags for an item based on its properties
   */
  async suggestItemTags(item: Partial<WardrobeItem>): Promise<string[]> {
    const tags: string[] = [];

    try {
      // Category-based tags
      if (item.category) {
        switch (item.category) {
          case 'tops':
            tags.push('casual', 'everyday');
            break;
          case 'bottoms':
            tags.push('versatile');
            break;
          case 'shoes':
            tags.push('footwear');
            break;
          case 'outerwear':
            tags.push('layering', 'weather');
            break;
          case 'dresses':
            tags.push('one-piece', 'elegant');
            break;
          case 'accessories':
            tags.push('accent', 'finishing-touch');
            break;
          case 'activewear':
            tags.push('workout', 'athletic', 'comfortable');
            break;
        }
      }

      // Color-based tags
      if (item.colors) {
        const hasNeutral = item.colors.some(color => 
          ['#000000', '#FFFFFF', '#808080', '#A0A0A0'].includes(color.toUpperCase())
        );
        if (hasNeutral) tags.push('neutral');

        const hasBright = item.colors.some(color => {
          // Simple brightness check - would be more sophisticated in real implementation
          const hex = color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          return brightness > 200;
        });
        if (hasBright) tags.push('bright');
      }

      // Brand-based tags
      if (item.brand) {
        tags.push('branded');
      }

      return tags.filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
    } catch (error) {
      console.error('[EnhancedWardrobeService] Failed to suggest tags:', error);
      return [];
    }
  }

  // ========================================================================
  // CONFIDENCE SCORING
  // ========================================================================

  /**
   * Updates the confidence score for an item based on user feedback
   */
  async updateItemConfidenceScore(itemId: string, rating: number): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_item_confidence_score', {
        item_id: itemId,
        new_rating: rating
      });

      if (error) {
        throw new Error(error.message || 'Failed to update confidence score');
      }

      console.log(`[EnhancedWardrobeService] Updated confidence score for item: ${itemId}`);
    } catch (error) {
      console.error('[EnhancedWardrobeService] Failed to update confidence score:', error);
      throw error;
    }
  }

  // ========================================================================
  // AI NAMING METHODS
  // ========================================================================

  /**
   * Generates an AI-powered name for a clothing item
   */
  async generateItemName(request: NamingRequest): Promise<NamingResponse | null> {
    try {
      const aiService = new AINameingService();
      return await aiService.generateItemName(request);
    } catch (error) {
      console.error('[EnhancedWardrobeService] Failed to generate AI name:', error);
      return null;
    }
  }

  /**
   * Updates an item's name (either user-provided or AI-generated)
   */
  async updateItemName(itemId: string, name: string, isUserOverride: boolean = true): Promise<void> {
    try {
      const updateData: any = {
        name: name,
        name_override: isUserOverride
      };

      const { error } = await supabase
        .from('wardrobeItems')
        .update(updateData)
        .eq('id', itemId);

      if (error) {
        throw new Error(error.message || 'Failed to update item name');
      }

      console.log(`[EnhancedWardrobeService] Updated name for item: ${itemId}`);
    } catch (error) {
      console.error('[EnhancedWardrobeService] Failed to update item name:', error);
      throw error;
    }
  }

  /**
   * Regenerates AI name for an existing item
   */
  async regenerateItemName(itemId: string): Promise<string | null> {
    try {
      // First get the item details
      const { data: item, error: fetchError } = await supabase
        .from('wardrobeItems')
        .select('image_uri, category, colors, brand')
        .eq('id', itemId)
        .single();

      if (fetchError || !item) {
        throw new Error('Item not found');
      }

      // Generate new AI name
      const namingResponse = await this.generateItemName({
        imageUri: item.image_uri,
        category: item.category as ItemCategory,
        colors: item.colors,
        brand: item.brand
      });

      if (!namingResponse) {
        return null;
      }

      // Update the item with new AI name
      const { error: updateError } = await supabase
        .from('wardrobeItems')
        .update({
          ai_generated_name: namingResponse.aiGeneratedName,
          ai_analysis_data: namingResponse.analysisData
        })
        .eq('id', itemId);

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update AI name');
      }

      return namingResponse.aiGeneratedName;
    } catch (error) {
      console.error('[EnhancedWardrobeService] Failed to regenerate AI name:', error);
      return null;
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Transforms a database record to a WardrobeItem interface
   */
  private transformRecordToWardrobeItem(record: WardrobeItemRecord): WardrobeItem {
    return {
      id: record.id,
      userId: record.user_id,
      imageUri: record.image_uri,
      processedImageUri: record.processed_image_uri,
      category: record.category as ItemCategory,
      subcategory: record.subcategory,
      colors: record.colors,
      brand: record.brand,
      size: record.size,
      purchaseDate: record.purchase_date ? new Date(record.purchase_date) : undefined,
      purchasePrice: record.purchase_price,
      tags: record.tags,
      notes: record.notes,
      usageStats: {
        itemId: record.id,
        totalWears: record.usage_count,
        lastWorn: record.last_worn ? new Date(record.last_worn) : null,
        averageRating: record.confidence_score,
        complimentsReceived: 0, // TODO: Implement from feedback system
        costPerWear: record.purchase_price && record.usage_count > 0 
          ? record.purchase_price / record.usage_count 
          : 0
      },
      styleCompatibility: {}, // TODO: Implement compatibility scoring
      confidenceHistory: [], // TODO: Implement confidence history tracking
      lastWorn: record.last_worn ? new Date(record.last_worn) : undefined,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at)
    };
  }
}

// Export singleton instance for convenience
export const enhancedWardrobeService = new EnhancedWardrobeService();