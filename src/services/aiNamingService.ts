// AI Naming Service - Automatic wardrobe item naming
import { supabase } from '../config/supabaseClient';
import {
  AIAnalysisData,
  ItemCategory,
  NamingPreferences,
  NamingRequest,
  NamingResponse,
  NamingStyle,
  VisualFeatures,
} from '../types/aynaMirror';
import {
  CloudinaryColorEntry,
  CloudinaryUploadResult,
  isCloudinaryResult,
} from '../types/external/cloudinary';
import { errorInDev, logInDev } from '../utils/consoleSuppress';
import { isSupabaseOk, wrap } from '../utils/supabaseResult';

export class AINameingService {
  private static readonly DEFAULT_PREFERENCES: Partial<NamingPreferences> = {
    namingStyle: 'descriptive',
    includeBrand: true,
    includeColor: true,
    includeMaterial: false,
    includeStyle: true,
    preferredLanguage: 'en',
    autoAcceptAINames: false,
  };

  private static readonly STYLE_TEMPLATES = {
    descriptive: {
      withBrand: '{color} {brand} {category}',
      withoutBrand: '{color} {category}',
      withMaterial: '{color} {material} {category}',
      withStyle: '{style} {color} {category}',
    },
    creative: {
      withBrand: 'My {color} {brand} {category}',
      withoutBrand: 'My {color} {category}',
      favorite: 'Favorite {category}',
      essential: '{color} Essential',
    },
    minimal: {
      basic: '{category}',
      withColor: '{color} {category}',
      brandOnly: '{brand}',
    },
    brand_focused: {
      primary: '{brand} {category}',
      withColor: '{brand} {color} {category}',
      brandOnly: '{brand}',
    },
  };

  private static readonly CATEGORY_SYNONYMS: Record<string, string[]> = {
    tops: ['shirt', 'blouse', 'top', 'tee', 'sweater', 'cardigan'],
    bottoms: ['pants', 'trousers', 'jeans', 'shorts', 'skirt'],
    dresses: ['dress', 'gown', 'frock'],
    shoes: ['sneakers', 'heels', 'boots', 'flats', 'sandals'],
    accessories: ['bag', 'purse', 'belt', 'scarf', 'jewelry'],
    outerwear: ['jacket', 'coat', 'blazer', 'cardigan'],
    activewear: ['workout', 'athletic', 'sports', 'gym'],
  };

  /**
   * Generate AI-powered name for a wardrobe item
   */
  static async generateItemName(request: NamingRequest): Promise<NamingResponse> {
    try {
      logInDev('[AINameingService] Generating name for item:', request);

      // Get user preferences or use defaults
      const preferences = await this.getUserNamingPreferences(request.userPreferences?.userId);

      // Get AI analysis data
      const analysisData = await this.getAIAnalysis(request.imageUri, request.itemId);

      // Generate name based on preferences and analysis
      const aiGeneratedName = this.generateNameFromAnalysis(analysisData, request, preferences);

      // Generate alternative suggestions
      const suggestions = this.generateNamingSuggestions(analysisData, request, preferences);

      // Calculate confidence score
      const confidence = this.calculateNamingConfidence(analysisData, request);

      return {
        aiGeneratedName,
        confidence,
        suggestions,
        analysisData,
      };
    } catch (error) {
      errorInDev(
        '[AINameingService] Error generating name:',
        error instanceof Error ? error : String(error),
      );

      // Fallback naming
      const fallbackName = this.generateFallbackName(request);

      return {
        aiGeneratedName: fallbackName,
        confidence: 0.3,
        suggestions: [fallbackName],
        analysisData: {
          detectedTags: [],
          dominantColors: request.colors || [],
          confidence: 0.3,
          visualFeatures: {},
          namingSuggestions: [fallbackName],
          analysisTimestamp: new Date(),
        },
      };
    }
  }

  /**
   * Get AI analysis data from existing analysis or trigger new analysis
   */
  private static async getAIAnalysis(imageUri: string, itemId?: string): Promise<AIAnalysisData> {
    try {
      // Call the existing AI analysis function
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: { imageUrl: imageUri, itemId },
      });

      if (error) {
        throw error;
      }
      // If edge function returns structured analysis, prefer it
      if (data && data.analysis) {
        const a = data.analysis;
        return {
          detectedTags: a.detectedTags || [],
          dominantColors: a.dominantColors || [],
          confidence: 0.8,
          visualFeatures: {},
          namingSuggestions: [],
          analysisTimestamp: new Date(),
        } as AIAnalysisData;
      }

      // Otherwise, transform raw payload
      return this.transformCloudinaryToAnalysisData(data);
    } catch (error) {
      errorInDev(
        '[AINameingService] Error getting AI analysis:',
        error instanceof Error ? error : String(error),
      );
      throw error;
    }
  }

  /**
   * Transform Cloudinary AI response to our AIAnalysisData format
   */
  private static transformCloudinaryToAnalysisData(raw: unknown): AIAnalysisData {
    const cloudinaryData: CloudinaryUploadResult = isCloudinaryResult(raw) ? raw : {};
    const tags: string[] = Array.isArray(cloudinaryData.tags) ? cloudinaryData.tags : [];
    const rawColors = cloudinaryData.colors;
    const colors: (CloudinaryColorEntry | string)[] = Array.isArray(rawColors)
      ? (rawColors as (CloudinaryColorEntry | string)[])
      : [];

    // Extract visual features from tags
    const visualFeatures: VisualFeatures = {
      texture: this.extractFeature(tags, ['cotton', 'silk', 'wool', 'denim', 'leather']),
      pattern: this.extractFeature(tags, ['striped', 'floral', 'solid', 'plaid', 'polka']),
      style: this.extractFeature(tags, ['casual', 'formal', 'vintage', 'modern', 'bohemian']),
      fit: this.extractFeature(tags, ['fitted', 'loose', 'oversized', 'slim', 'regular']),
      occasion: this.extractFeature(tags, ['work', 'party', 'casual', 'formal', 'sport']),
    };

    return {
      detectedTags: tags,
      dominantColors: colors.map((c) =>
        typeof c === 'string' ? c : c.name || c.value || c[0] || 'unknown',
      ),
      confidence: typeof cloudinaryData.confidence === 'number' ? cloudinaryData.confidence : 0.7,
      visualFeatures,
      namingSuggestions: [],
      analysisTimestamp: new Date(),
    };
  }

  /**
   * Extract specific feature from tags
   */
  private static extractFeature(tags: string[], keywords: string[]): string | undefined {
    for (const tag of tags) {
      for (const keyword of keywords) {
        if (tag.toLowerCase().includes(keyword.toLowerCase())) {
          return keyword;
        }
      }
    }
    return undefined;
  }

  /**
   * Generate name from AI analysis data
   */
  private static generateNameFromAnalysis(
    analysisData: AIAnalysisData,
    request: NamingRequest,
    preferences: NamingPreferences,
  ): string {
    const { namingStyle, includeBrand, includeColor, includeMaterial, includeStyle } = preferences;

    // Extract components
    const category = this.getCategoryDisplayName(request.category, analysisData.detectedTags);
    const color = includeColor
      ? this.getPrimaryColor(analysisData.dominantColors, request.colors)
      : null;
    const brand = includeBrand ? request.brand : null;
    const material = includeMaterial ? analysisData.visualFeatures.material : null;
    const style = includeStyle ? analysisData.visualFeatures.style : null;

    // Generate name based on style
    return this.applyNamingTemplate(namingStyle, {
      category,
      color,
      brand,
      material,
      style,
    });
  }

  /**
   * Get display name for category
   */
  private static getCategoryDisplayName(
    category?: ItemCategory,
    detectedTags: string[] = [],
  ): string {
    if (!category) {
      // Try to infer from detected tags
      for (const [cat, synonyms] of Object.entries(this.CATEGORY_SYNONYMS)) {
        if (detectedTags.some((tag) => synonyms.some((syn) => tag.toLowerCase().includes(syn)))) {
          return this.capitalizeFirst(cat);
        }
      }
      return 'Item';
    }

    // Check if detected tags suggest a more specific name
    const synonyms = this.CATEGORY_SYNONYMS[category] || [];
    for (const tag of detectedTags) {
      for (const synonym of synonyms) {
        if (tag.toLowerCase().includes(synonym)) {
          return this.capitalizeFirst(synonym);
        }
      }
    }

    return this.capitalizeFirst(category);
  }

  /**
   * Get primary color for naming
   */
  private static getPrimaryColor(aiColors: string[], requestColors?: string[]): string | null {
    // Prefer colors from request (user-provided)
    if (requestColors && requestColors.length > 0 && typeof requestColors[0] === 'string') {
      return this.capitalizeFirst(requestColors[0]);
    }

    // Use AI-detected colors
    if (aiColors && aiColors.length > 0 && typeof aiColors[0] === 'string') {
      return this.capitalizeFirst(aiColors[0]);
    }

    return null;
  }

  /**
   * Apply naming template based on style
   */
  private static applyNamingTemplate(
    style: NamingStyle,
    components: {
      category: string;
      color?: string | null;
      brand?: string | null;
      material?: string | null;
      style?: string | null;
    },
  ): string {
    const { category, color, brand, material, style: styleComponent } = components;

    switch (style) {
      case 'descriptive':
        if (brand && color) {
          return `${color} ${brand} ${category}`;
        } else if (color && material) {
          return `${color} ${material} ${category}`;
        } else if (styleComponent && color) {
          return `${styleComponent} ${color} ${category}`;
        } else if (color) {
          return `${color} ${category}`;
        }
        return category;

      case 'creative':
        if (brand && color) {
          return `My ${color} ${brand} ${category}`;
        } else if (color) {
          return Math.random() > 0.5 ? `My ${color} ${category}` : `${color} Essential`;
        }
        return `Favorite ${category}`;

      case 'minimal':
        if (color && Math.random() > 0.5) {
          return `${color} ${category}`;
        }
        return category;

      case 'brand_focused':
        if (brand) {
          return color ? `${brand} ${color} ${category}` : `${brand} ${category}`;
        }
        return color ? `${color} ${category}` : category;

      default:
        return color ? `${color} ${category}` : category;
    }
  }

  /**
   * Generate multiple naming suggestions
   */
  private static generateNamingSuggestions(
    analysisData: AIAnalysisData,
    request: NamingRequest,
    preferences: NamingPreferences,
  ): string[] {
    const suggestions: string[] = [];
    const category = this.getCategoryDisplayName(request.category, analysisData.detectedTags);
    const color = this.getPrimaryColor(analysisData.dominantColors, request.colors);
    const brand = request.brand;

    // Generate variations for different styles
    const styles: NamingStyle[] = ['descriptive', 'creative', 'minimal', 'brand_focused'];

    for (const style of styles) {
      const name = this.applyNamingTemplate(style, {
        category,
        color,
        brand,
        material: analysisData.visualFeatures.material,
        style: analysisData.visualFeatures.style,
      });

      if (!suggestions.includes(name)) {
        suggestions.push(name);
      }
    }

    // Add some creative variations
    if (color) {
      suggestions.push(`${color} Piece`);
      suggestions.push(`${color} Find`);
    }

    if (brand) {
      suggestions.push(brand);
    }

    // Add occasion-based names
    if (analysisData.visualFeatures.occasion) {
      suggestions.push(`${analysisData.visualFeatures.occasion} ${category}`);
    }

    return suggestions.slice(0, 6); // Limit to 6 suggestions
  }

  /**
   * Calculate naming confidence based on available data
   */
  private static calculateNamingConfidence(
    analysisData: AIAnalysisData,
    request: NamingRequest,
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on available data
    if (request.category) {
      confidence += 0.2;
    }
    if (request.brand) {
      confidence += 0.1;
    }
    if (request.colors && request.colors.length > 0) {
      confidence += 0.1;
    }
    if (analysisData.detectedTags.length > 3) {
      confidence += 0.1;
    }
    if (analysisData.confidence > 0.8) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate fallback name when AI analysis fails
   */
  private static generateFallbackName(request: NamingRequest): string {
    const category = request.category ? this.capitalizeFirst(request.category) : 'Item';
    const color =
      request.colors && request.colors.length > 0 && typeof request.colors[0] === 'string'
        ? this.capitalizeFirst(request.colors[0])
        : null;
    const brand = request.brand;

    if (brand && color) {
      return `${color} ${brand} ${category}`;
    } else if (color) {
      return `${color} ${category}`;
    } else if (brand) {
      return `${brand} ${category}`;
    }

    return category;
  }

  /**
   * Get user naming preferences
   */
  static async getUserNamingPreferences(userId?: string): Promise<NamingPreferences> {
    if (!userId) {
      return {
        userId: '',
        ...this.DEFAULT_PREFERENCES,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as NamingPreferences;
    }

    try {
      const { data, error } = await supabase
        .from('naming_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Not found error
        throw error;
      }

      if (data) {
        return {
          userId: data.user_id,
          namingStyle: data.naming_style,
          includeBrand: data.include_brand,
          includeColor: data.include_color,
          includeMaterial: data.include_material,
          includeStyle: data.include_style,
          preferredLanguage: data.preferred_language,
          autoAcceptAINames: data.auto_accept_ai_names,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
      }

      // Create default preferences for user
      return await this.createDefaultNamingPreferences(userId);
    } catch (error) {
      errorInDev(
        '[AINameingService] Error getting naming preferences:',
        error instanceof Error ? error : String(error),
      );
      return {
        userId,
        ...this.DEFAULT_PREFERENCES,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as NamingPreferences;
    }
  }

  /**
   * Create default naming preferences for a user
   */
  static async createDefaultNamingPreferences(userId: string): Promise<NamingPreferences> {
    try {
      const { data, error } = await supabase
        .from('naming_preferences')
        .insert({
          user_id: userId,
          ...this.DEFAULT_PREFERENCES,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        userId: data.user_id,
        namingStyle: data.naming_style,
        includeBrand: data.include_brand,
        includeColor: data.include_color,
        includeMaterial: data.include_material,
        includeStyle: data.include_style,
        preferredLanguage: data.preferred_language,
        autoAcceptAINames: data.auto_accept_ai_names,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      errorInDev(
        '[AINameingService] Error creating default preferences:',
        error instanceof Error ? error : String(error),
      );
      return {
        userId,
        ...this.DEFAULT_PREFERENCES,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as NamingPreferences;
    }
  }

  /**
   * Update user naming preferences
   */
  static async updateNamingPreferences(
    userId: string,
    preferences: Partial<NamingPreferences>,
  ): Promise<NamingPreferences> {
    try {
      const { data, error } = await supabase
        .from('naming_preferences')
        .upsert({
          user_id: userId,
          naming_style: preferences.namingStyle,
          include_brand: preferences.includeBrand,
          include_color: preferences.includeColor,
          include_material: preferences.includeMaterial,
          include_style: preferences.includeStyle,
          preferred_language: preferences.preferredLanguage,
          auto_accept_ai_names: preferences.autoAcceptAINames,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        userId: data.user_id,
        namingStyle: data.naming_style,
        includeBrand: data.include_brand,
        includeColor: data.include_color,
        includeMaterial: data.include_material,
        includeStyle: data.include_style,
        preferredLanguage: data.preferred_language,
        autoAcceptAINames: data.auto_accept_ai_names,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      errorInDev(
        '[AINameingService] Error updating preferences:',
        error instanceof Error ? error : String(error),
      );
      throw error;
    }
  }

  /**
   * Save naming history
   */
  static async saveNamingHistory(
    itemId: string,
    userId: string,
    aiGeneratedName: string,
    userProvidedName?: string,
    analysisData?: AIAnalysisData,
  ): Promise<void> {
    try {
      const histRes = await wrap(
        async () =>
          await supabase
            .from('item_naming_history')
            .insert({
              item_id: itemId,
              user_id: userId,
              ai_generated_name: aiGeneratedName,
              user_provided_name: userProvidedName,
              naming_confidence: analysisData?.confidence || 0.5,
              ai_tags: analysisData?.detectedTags || [],
              visual_features: analysisData?.visualFeatures || {},
            })
            .select('*')
            .single(),
      );
      if (!isSupabaseOk(histRes)) {
        errorInDev('[AINameingService] Failed to save naming history', histRes.error);
      }
    } catch (error) {
      errorInDev(
        '[AINameingService] Error saving naming history:',
        error instanceof Error ? error : String(error),
      );
    }
  }

  /**
   * Get effective item name (user name or AI name)
   */
  static getEffectiveItemName(
    name?: string,
    aiGeneratedName?: string,
    category?: string,
    colors?: string[],
  ): string {
    if (name && name.trim()) {
      return name;
    }

    if (aiGeneratedName && aiGeneratedName.trim()) {
      return aiGeneratedName;
    }

    // Fallback
    if (colors && colors.length > 0 && typeof colors[0] === 'string' && category) {
      return `${this.capitalizeFirst(colors[0])} ${this.capitalizeFirst(category)}`;
    }

    return category ? this.capitalizeFirst(category) : 'Item';
  }

  /**
   * Utility: Capitalize first letter
   */
  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
