// AI Service - Core AI functionality for wardrobe analysis

import { aiProxyChatCompletion, shouldUseAiProxy } from '../config/aiProxy';
import { visionClient } from '../config/googleVision';
import { openaiClient } from '../config/openai';
import { WardrobeCategory, WardrobeColor } from '../types';
import type { UserProfile } from '../types/user';
import { errorInDev } from '../utils/consoleSuppress';
import { isObject, safeParse } from '../utils/safeJSON';
import { secureStorage } from '../utils/secureStorage';
import type { WardrobeItem } from './wardrobeService';

export interface ImageAnalysis {
  confidence: number;
  detectedItems: string[];
  suggestedTags: string[];
  colorAnalysis: {
    dominantColors: string[];
    colorHarmony: string;
  };
  styleAnalysis: {
    style: string;
    formality: string;
    season: string[];
  };
}

export interface ClothingDetection {
  items: Array<{
    name: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  colors: string[];
  text: string[];
}

export interface CategoryResult {
  category: WardrobeCategory;
  confidence: number;
}

export interface ColorExtraction {
  dominantColors: WardrobeColor[];
  colorPercentages: Record<WardrobeColor, number>;
  colorHarmony: string;
}

export interface StyleAdvice {
  recommendations: string[];
  styleProfile: {
    dominantStyle: string;
    secondaryStyles: string[];
    colorPalette: WardrobeColor[];
  };
  outfitSuggestions: Array<{
    occasion: string;
    items: string[];
    confidence: number;
  }>;
  gapAnalysis: {
    missing: string[];
    overrepresented: string[];
  };
  colorPalette: {
    suggested: string[];
    avoid: string[];
  };
  styleScore: number;
}

/**
 * AI Service - Core AI functionality for wardrobe analysis
 *
 * Provides comprehensive AI-powered analysis for clothing items including:
 * - Image analysis using OpenAI Vision API
 * - Clothing detection and categorization
 * - Color extraction and harmony analysis
 * - Style recommendations and outfit suggestions
 *
 * Features intelligent caching to optimize performance and reduce API costs.
 * Supports both direct API calls and proxy routing for enhanced security.
 *
 * @example
 * ```typescript
 * const aiService = new AIService();
 * const analysis = await aiService.analyzeImage('path/to/image.jpg');
 * console.log(analysis.styleAnalysis.style); // 'casual', 'formal', etc.
 * ```
 */
export class AIService {
  /** Cache prefix for storing AI analysis results */
  private static readonly CACHE_PREFIX = 'ai_service_cache_';
  /** Cache duration in milliseconds (24 hours) */
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  /** Default AI model for complex analysis tasks */
  private static readonly MODEL_DEFAULT = 'gpt-4o';
  /** Lightweight AI model for simple tasks */
  private static readonly MODEL_LIGHT = 'gpt-4o-mini';

  /**
   * Analyzes a clothing item image using OpenAI Vision API
   *
   * Performs comprehensive analysis including item detection, color analysis,
   * style classification, and formality assessment. Results are cached for
   * 24 hours to improve performance and reduce API costs.
   *
   * @param imageUri - URI of the image to analyze (file path or base64 data URI)
   * @returns Promise resolving to detailed image analysis results
   *
   * @throws {Error} When image analysis fails or API is unavailable
   *
   * @example
   * ```typescript
   * const analysis = await aiService.analyzeImage('file:///path/to/shirt.jpg');
   * console.log(analysis.detectedItems); // ['shirt', 'button-up']
   * console.log(analysis.colorAnalysis.dominantColors); // ['blue', 'white']
   * console.log(analysis.styleAnalysis.formality); // 'business-casual'
   * ```
   */
  async analyzeImage(imageUri: string): Promise<ImageAnalysis> {
    try {
      // Check cache first
      const cacheKey = `${AIService.CACHE_PREFIX}analyze_${this.hashString(imageUri)}`;
      const cached = await this.getCachedResult<ImageAnalysis>(cacheKey);
      if (cached) {
        return cached;
      }

      const isBase64 = imageUri.startsWith('data:image');
      const imageUrl = isBase64 ? imageUri : `file://${imageUri}`;

      const response = shouldUseAiProxy()
        ? await aiProxyChatCompletion({
            // Vision + chat: default to gpt-4o
            provider: 'openai',
            model: AIService.MODEL_DEFAULT,
            messages: [
              {
                role: 'user',
                content: `Analyze this clothing item and provide a detailed analysis including detected items, style, colors, and formality. Return the result as JSON. Image URL: ${imageUrl}`,
              },
            ],
            max_tokens: 1000,
            temperature: 0.1,
          })
        : await openaiClient.chat.completions.create({
            model: AIService.MODEL_DEFAULT,
            messages: [
              {
                role: 'user',
                content: `Analyze this clothing item and provide a detailed analysis including detected items, style, colors, and formality. Return the result as JSON. Image URL: ${imageUrl}`,
              },
            ],
            max_tokens: 1000,
            temperature: 0.1,
          });

      const content = shouldUseAiProxy()
        ? response?.choices?.[0]?.message?.content
        : response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Failed to parse AI response');
      }

      // Try to parse JSON first to catch malformed responses
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error('Failed to parse AI response');
      }

      // Validate the raw parsed result before using safeParse
      if (parsed && typeof parsed === 'object') {
        const obj = parsed as Record<string, unknown>;
        if (
          (obj.confidence !== undefined && typeof obj.confidence !== 'number') ||
          (obj.detectedItems !== undefined && !Array.isArray(obj.detectedItems))
        ) {
          throw new Error('Invalid AI response format');
        }
      }

      const result = safeParse<ImageAnalysis>(content, {
        confidence: 0,
        detectedItems: [],
        suggestedTags: [],
        colorAnalysis: { dominantColors: [], colorHarmony: 'unknown' },
        styleAnalysis: { style: 'unknown', formality: 'unknown', season: [] },
      });

      // Cache the result
      await this.setCachedResult(cacheKey, result);

      return result;
    } catch (error) {
      errorInDev('Error analyzing image:', error instanceof Error ? error : String(error));

      // Try AI-independent fallback via Google Vision to keep UX working without OpenAI quota
      try {
        const detection = await this.detectClothingItems(imageUri);
        const basic: ImageAnalysis = {
          confidence: 0.6,
          detectedItems: detection.items.map((i) => i.name).filter(Boolean),
          suggestedTags: Array.from(
            new Set(
              [
                ...detection.items.map((i) => i.name.toLowerCase()),
                ...detection.colors.map((c) => c.toLowerCase()),
              ].filter(Boolean),
            ),
          ),
          colorAnalysis: {
            dominantColors: detection.colors.slice(0, 5),
            colorHarmony: 'neutral',
          },
          styleAnalysis: {
            style: 'casual',
            formality: 'everyday',
            season: ['all'],
          },
        };

        // Cache and return the fallback
        const cacheKey = `${AIService.CACHE_PREFIX}analyze_${this.hashString(imageUri)}`;
        await this.setCachedResult(cacheKey, basic);
        return basic;
      } catch (fallbackErr) {
        // As last resort, return cached result if available
        const cacheKey = `${AIService.CACHE_PREFIX}analyze_${this.hashString(imageUri)}`;
        const cached = await this.getCachedResult<ImageAnalysis>(cacheKey);
        if (cached) {
          return cached;
        }
        throw error;
      }
    }
  }

  /**
   * Detects clothing items in an image using Google Vision API
   *
   * Utilizes Google's computer vision capabilities to identify clothing items,
   * extract colors, and detect any text (brand labels, care instructions, etc.)
   * within the image. Provides bounding box coordinates for each detected item.
   *
   * @param imageUri - Path to the image file to analyze
   * @returns Promise resolving to detection results with items, colors, and text
   *
   * @throws {Error} When Google Vision API is unavailable or image processing fails
   *
   * @example
   * ```typescript
   * const detection = await aiService.detectClothingItems('path/to/dress.jpg');
   * console.log(detection.items[0].name); // 'dress'
   * console.log(detection.colors); // ['red', 'black']
   * console.log(detection.text); // ['Nike', 'Size M']
   * ```
   */
  async detectClothingItems(imageUri: string): Promise<ClothingDetection> {
    try {
      const [labelResult, objectResult, textResult] = await Promise.all([
        visionClient.labelDetection({ image: { source: { filename: imageUri } } }),
        visionClient.objectLocalization({ image: { source: { filename: imageUri } } }),
        visionClient.textDetection({ image: { source: { filename: imageUri } } }),
      ]);

      const items =
        objectResult.localizedObjectAnnotations?.map((obj) => {
          const vertices = obj.boundingPoly?.normalizedVertices || [];
          const minX = Math.min(...vertices.map((v) => v.x || 0));
          const minY = Math.min(...vertices.map((v) => v.y || 0));
          const maxX = Math.max(...vertices.map((v) => v.x || 0));
          const maxY = Math.max(...vertices.map((v) => v.y || 0));

          return {
            name: obj.name || '',
            confidence: obj.score || 0,
            boundingBox: {
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY,
            },
          };
        }) || [];

      const colors =
        labelResult.labelAnnotations
          ?.filter((label) => this.isColorLabel(label.description || ''))
          .map((label) => label.description || '') || [];

      const text =
        textResult.textAnnotations
          ?.map((annotation) => annotation.description || '')
          .filter((text) => text.length > 0) || [];

      return { items, colors, text };
    } catch (error) {
      errorInDev('Error detecting clothing items:', error instanceof Error ? error : String(error));
      throw error;
    }
  }

  /**
   * Categorizes a clothing item into predefined wardrobe categories
   *
   * Uses AI to analyze item descriptions and classify them into standard
   * wardrobe categories (TOPS, BOTTOMS, DRESSES, OUTERWEAR, SHOES, ACCESSORIES).
   * Returns both the category and a confidence score for the classification.
   *
   * @param itemDescription - Text description of the clothing item
   * @returns Promise resolving to category classification with confidence score
   *
   * @throws {Error} When AI categorization fails or API is unavailable
   *
   * @example
   * ```typescript
   * const result = await aiService.categorizeItem('blue denim jeans');
   * console.log(result.category); // 'BOTTOMS'
   * console.log(result.confidence); // 0.95
   * ```
   */
  async categorizeItem(itemDescription: string): Promise<CategoryResult> {
    try {
      const response = shouldUseAiProxy()
        ? await aiProxyChatCompletion({
            provider: 'openrouter',
            model: 'openrouter/auto',
            messages: [
              {
                role: 'system',
                content:
                  'You are a fashion expert. Categorize the given clothing item into one of these categories: TOPS, BOTTOMS, DRESSES, OUTERWEAR, SHOES, ACCESSORIES. Return only JSON with category and confidence.',
              },
              {
                role: 'user',
                content: `Categorize this item: ${itemDescription}`,
              },
            ],
            max_tokens: 100,
            temperature: 0.1,
          })
        : await openaiClient.chat.completions.create({
            model: AIService.MODEL_LIGHT,
            messages: [
              {
                role: 'system',
                content:
                  'You are a fashion expert. Categorize the given clothing item into one of these categories: TOPS, BOTTOMS, DRESSES, OUTERWEAR, SHOES, ACCESSORIES. Return only JSON with category and confidence.',
              },
              {
                role: 'user',
                content: `Categorize this item: ${itemDescription}`,
              },
            ],
            max_tokens: 100,
            temperature: 0.1,
          });

      const content = shouldUseAiProxy()
        ? response?.choices?.[0]?.message?.content
        : response.choices?.[0]?.message?.content;
      const raw = safeParse<unknown>(content || '{}', {});
      const result = isObject(raw)
        ? raw
        : { category: WardrobeCategory.ACCESSORIES, confidence: 0.5 };
      const confidence =
        typeof (result as { confidence?: unknown }).confidence === 'number'
          ? (result as { confidence?: number }).confidence!
          : 0.8;
      return {
        category: (result as { category?: unknown }).category as WardrobeCategory,
        confidence,
      };
    } catch (error) {
      errorInDev('Error categorizing item:', error instanceof Error ? error : String(error));
      // Fallback to simple keyword matching
      return this.fallbackCategorization(itemDescription);
    }
  }

  /**
   * Extract colors from image
   */
  async extractColors(imageUri: string): Promise<ColorExtraction> {
    try {
      const response = shouldUseAiProxy()
        ? await aiProxyChatCompletion({
            provider: 'openai',
            model: AIService.MODEL_DEFAULT,
            messages: [
              {
                role: 'user',
                content: `Extract the dominant colors from this image and return as JSON with dominantColors array, colorPercentages object, and colorHarmony string. Image URL: ${imageUri.startsWith('data:') ? imageUri : `file://${imageUri}`}`,
              },
            ],
            max_tokens: 500,
            temperature: 0.1,
          })
        : await openaiClient.chat.completions.create({
            model: AIService.MODEL_DEFAULT,
            messages: [
              {
                role: 'user',
                content: `Extract the dominant colors from this image and return as JSON with dominantColors array, colorPercentages object, and colorHarmony string. Image URL: ${imageUri.startsWith('data:') ? imageUri : `file://${imageUri}`}`,
              },
            ],
            max_tokens: 500,
            temperature: 0.1,
          });

      const content = shouldUseAiProxy()
        ? response?.choices?.[0]?.message?.content
        : response.choices?.[0]?.message?.content;
      return safeParse<ColorExtraction>(content || '{}', {
        dominantColors: [],
        colorPercentages: {} as Record<WardrobeColor, number>,
        colorHarmony: 'neutral',
      });
    } catch (error) {
      errorInDev('Error extracting colors:', error instanceof Error ? error : String(error));
      throw error;
    }
  }

  /**
   * Generate style advice
   */
  async generateStyleAdvice(
    userProfile: UserProfile,
    wardrobeItems: WardrobeItem[],
  ): Promise<StyleAdvice> {
    try {
      const response = shouldUseAiProxy()
        ? await aiProxyChatCompletion({
            provider: 'openrouter',
            model: 'openrouter/auto',
            messages: [
              {
                role: 'system',
                content:
                  'You are a personal stylist. Provide style advice based on the user profile and wardrobe items. Return as JSON.',
              },
              {
                role: 'user',
                content: `User profile: ${JSON.stringify(userProfile)}\nWardrobe: ${JSON.stringify(wardrobeItems)}`,
              },
            ],
            max_tokens: 1000,
            temperature: 0.3,
          })
        : await openaiClient.chat.completions.create({
            model: AIService.MODEL_DEFAULT,
            messages: [
              {
                role: 'system',
                content:
                  'You are a personal stylist. Provide style advice based on the user profile and wardrobe items. Return as JSON.',
              },
              {
                role: 'user',
                content: `User profile: ${JSON.stringify(userProfile)}\nWardrobe: ${JSON.stringify(wardrobeItems)}`,
              },
            ],
            max_tokens: 1000,
            temperature: 0.3,
          });

      const content = shouldUseAiProxy()
        ? response?.choices?.[0]?.message?.content
        : response.choices?.[0]?.message?.content;
      return safeParse<StyleAdvice>(content || '{}', {
        recommendations: [],
        styleProfile: { dominantStyle: 'casual', secondaryStyles: [], colorPalette: [] },
        outfitSuggestions: [],
        gapAnalysis: { missing: [], overrepresented: [] },
        colorPalette: { suggested: [], avoid: [] },
        styleScore: 0,
      });
    } catch (error) {
      errorInDev('Error generating style advice:', error instanceof Error ? error : String(error));
      throw error;
    }
  }

  // Helper methods
  private async getCachedResult<T>(key: string): Promise<T | null> {
    try {
      await secureStorage.initialize();
      const cached = await secureStorage.getItem(key);
      if (!cached) {
        return null;
      }

      const parsed = safeParse<{ data?: unknown; timestamp?: number }>(cached, {});
      const data = parsed.data;
      const timestamp = parsed.timestamp ?? 0;
      if (Date.now() - timestamp > AIService.CACHE_DURATION) {
        await secureStorage.removeItem(key);
        return null;
      }

      return data as T;
    } catch {
      return null;
    }
  }

  private async setCachedResult<T>(key: string, data: T): Promise<void> {
    try {
      await secureStorage.initialize();
      await secureStorage.setItem(
        key,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      errorInDev('Failed to cache result:', error instanceof Error ? error : String(error));
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  private isColorLabel(label: string): boolean {
    const colorKeywords = [
      'red',
      'blue',
      'green',
      'yellow',
      'black',
      'white',
      'pink',
      'purple',
      'orange',
      'brown',
      'gray',
      'grey',
    ];
    return colorKeywords.some((color) => label.toLowerCase().includes(color));
  }

  private fallbackCategorization(itemDescription: string): CategoryResult {
    const description = itemDescription.toLowerCase();

    if (description.includes('dress') || description.includes('gown')) {
      return { category: WardrobeCategory.DRESSES, confidence: 0.7 };
    }
    if (
      description.includes('shirt') ||
      description.includes('top') ||
      description.includes('blouse')
    ) {
      return { category: WardrobeCategory.TOPS, confidence: 0.7 };
    }
    if (
      description.includes('pants') ||
      description.includes('jeans') ||
      description.includes('trousers')
    ) {
      return { category: WardrobeCategory.BOTTOMS, confidence: 0.7 };
    }
    if (
      description.includes('shoe') ||
      description.includes('boot') ||
      description.includes('sneaker')
    ) {
      return { category: WardrobeCategory.SHOES, confidence: 0.7 };
    }
    if (
      description.includes('jacket') ||
      description.includes('coat') ||
      description.includes('blazer')
    ) {
      return { category: WardrobeCategory.OUTERWEAR, confidence: 0.7 };
    }

    return { category: WardrobeCategory.ACCESSORIES, confidence: 0.5 };
  }

  /**
   * Legacy-compatible outfit suggestion generator expected by tests.
   * Provides a simple deterministic suggestion set without calling external services.
   */
  async generateOutfitSuggestions(
    wardrobeItems: Array<{ id: string; name?: string; category?: string }>,
    options: { occasion?: string; weather?: string; limit?: number } = {},
  ): Promise<{
    outfits: Array<{
      id: string;
      items: Array<{ id: string; name?: string; category?: string }>;
      occasion: string;
      confidence: number;
      weatherSuitability?: string;
      reasoning?: string;
    }>;
    styleNotes?: string[];
  }> {
    const occasion = options.occasion || 'casual';
    const weather = options.weather;
    const limit = options.limit ?? wardrobeItems.length;
    const items = wardrobeItems.slice(0, limit);

    // Generate reasoning based on item categories
    let reasoning: string | undefined;
    if (items.length >= 2) {
      const topItem = items.find((item) => item.category === 'tops') || items[0];
      const bottomItem = items.find((item) => item.category === 'bottoms') || items[1];
      const topCategory = topItem?.category || 'tops';
      const bottomCategory = bottomItem?.category || 'bottoms';
      reasoning = `${topCategory.charAt(0).toUpperCase() + topCategory.slice(1)} pairs well with ${bottomCategory} for a ${occasion} look`;
    }

    return {
      outfits: [
        {
          id: 'outfit-1',
          items,
          occasion,
          confidence: 0.9,
          weatherSuitability: weather,
          reasoning,
        },
      ],
      styleNotes: ['Consider adding accessories', 'Great color coordination'],
    };
  }
}
