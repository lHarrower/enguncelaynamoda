// AI Service - Core AI functionality for wardrobe analysis
import { openaiClient } from '@/config/openai';
import { aiProxyChatCompletion, shouldUseAiProxy } from '@/config/aiProxy';
import { visionClient } from '@/config/googleVision';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WardrobeCategory, WardrobeColor } from '@/types';
import { logInDev, errorInDev } from '@/utils/consoleSuppress';

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
}

export class AIService {
  private static readonly CACHE_PREFIX = 'ai_service_cache_';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly MODEL_DEFAULT = 'gpt-4o';
  private static readonly MODEL_LIGHT = 'gpt-4o-mini';

  /**
   * Analyze image using OpenAI Vision API
   */
  async analyzeImage(imageUri: string): Promise<ImageAnalysis> {
    try {
      // Check cache first
      const cacheKey = `${AIService.CACHE_PREFIX}analyze_${this.hashString(imageUri)}`;
      const cached = await this.getCachedResult<ImageAnalysis>(cacheKey);
      if (cached) return cached;

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
                content: [
                  {
                    type: 'text',
                    text: 'Analyze this clothing item and provide a detailed analysis including detected items, style, colors, and formality. Return the result as JSON.',
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: imageUrl,
                    },
                  },
                ],
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
            content: [
              {
                type: 'text',
                text: 'Analyze this clothing item and provide a detailed analysis including detected items, style, colors, and formality. Return the result as JSON.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
        });

      const content = shouldUseAiProxy() ? response?.choices?.[0]?.message?.content : (response as any).choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Failed to parse AI response');
      }
      const result = JSON.parse(content) as ImageAnalysis;
      
      // Cache the result
      await this.setCachedResult(cacheKey, result);
      
      return result;
    } catch (error) {
      errorInDev('Error analyzing image:', error);

      // Try AI-independent fallback via Google Vision to keep UX working without OpenAI quota
      try {
        const detection = await this.detectClothingItems(imageUri);
        const basic: ImageAnalysis = {
          confidence: 0.6,
          detectedItems: detection.items.map(i => i.name).filter(Boolean),
          suggestedTags: Array.from(new Set([...
            detection.items.map(i => i.name.toLowerCase()),
            ...detection.colors.map(c => c.toLowerCase()),
          ].filter(Boolean))) as string[],
          colorAnalysis: {
            dominantColors: detection.colors.slice(0, 5) as string[],
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
        if (cached) return cached;
        throw error;
      }
    }
  }

  /**
   * Detect clothing items using Google Vision API
   */
  async detectClothingItems(imageUri: string): Promise<ClothingDetection> {
    try {
      const [labelResult, objectResult, textResult] = await Promise.all([
        visionClient.labelDetection({ image: { source: { filename: imageUri } } }),
        visionClient.objectLocalization({ image: { source: { filename: imageUri } } }),
        visionClient.textDetection({ image: { source: { filename: imageUri } } }),
      ]);

      const items = objectResult.localizedObjectAnnotations?.map(obj => {
        const vertices = obj.boundingPoly?.normalizedVertices || [];
        const minX = Math.min(...vertices.map(v => v.x || 0));
        const minY = Math.min(...vertices.map(v => v.y || 0));
        const maxX = Math.max(...vertices.map(v => v.x || 0));
        const maxY = Math.max(...vertices.map(v => v.y || 0));

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

      const colors = labelResult.labelAnnotations
        ?.filter(label => this.isColorLabel(label.description || ''))
        .map(label => label.description || '') || [];

      const text = textResult.textAnnotations
        ?.map(annotation => annotation.description || '')
        .filter(text => text.length > 0) || [];

      return { items, colors, text };
    } catch (error) {
      errorInDev('Error detecting clothing items:', error);
      throw error;
    }
  }

  /**
   * Categorize clothing item
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
            content: 'You are a fashion expert. Categorize the given clothing item into one of these categories: TOPS, BOTTOMS, DRESSES, OUTERWEAR, SHOES, ACCESSORIES. Return only JSON with category and confidence.',
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
    content: 'You are a fashion expert. Categorize the given clothing item into one of these categories: TOPS, BOTTOMS, DRESSES, OUTERWEAR, SHOES, ACCESSORIES. Return only JSON with category and confidence.',
          },
          {
            role: 'user',
    content: `Categorize this item: ${itemDescription}`,
          },
        ],
        max_tokens: 100,
        temperature: 0.1,
      });

      const content = shouldUseAiProxy() ? response?.choices?.[0]?.message?.content : (response as any).choices?.[0]?.message?.content;
      const result = JSON.parse(content || '{}');
      return {
        category: result.category as WardrobeCategory,
        confidence: result.confidence || 0.8,
      };
    } catch (error) {
      errorInDev('Error categorizing item:', error);
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
            content: [
              {
                type: 'text',
        text: 'Extract the dominant colors from this image and return as JSON with dominantColors array, colorPercentages object, and colorHarmony string.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUri.startsWith('data:') ? imageUri : `file://${imageUri}`,
                },
              },
            ],
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
            content: [
              {
                type: 'text',
        text: 'Extract the dominant colors from this image and return as JSON with dominantColors array, colorPercentages object, and colorHarmony string.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUri.startsWith('data:') ? imageUri : `file://${imageUri}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      });

      const content = shouldUseAiProxy() ? response?.choices?.[0]?.message?.content : (response as any).choices?.[0]?.message?.content;
      return JSON.parse(content || '{}') as ColorExtraction;
    } catch (error) {
      errorInDev('Error extracting colors:', error);
      throw error;
    }
  }

  /**
   * Generate style advice
   */
  async generateStyleAdvice(userProfile: any, wardrobeItems: any[]): Promise<StyleAdvice> {
    try {
  const response = shouldUseAiProxy()
    ? await aiProxyChatCompletion({
        provider: 'openrouter',
        model: 'openrouter/auto',
        messages: [
          {
            role: 'system',
    content: 'You are a personal stylist. Provide style advice based on the user profile and wardrobe items. Return as JSON.',
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
    content: 'You are a personal stylist. Provide style advice based on the user profile and wardrobe items. Return as JSON.',
          },
          {
            role: 'user',
    content: `User profile: ${JSON.stringify(userProfile)}\nWardrobe: ${JSON.stringify(wardrobeItems)}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const content = shouldUseAiProxy() ? response?.choices?.[0]?.message?.content : (response as any).choices?.[0]?.message?.content;
      return JSON.parse(content || '{}') as StyleAdvice;
    } catch (error) {
      errorInDev('Error generating style advice:', error);
      throw error;
    }
  }

  // Helper methods
  private async getCachedResult<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > AIService.CACHE_DURATION) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return data as T;
    } catch {
      return null;
    }
  }

  private async setCachedResult<T>(key: string, data: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      errorInDev('Failed to cache result:', error);
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  private isColorLabel(label: string): boolean {
    const colorKeywords = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey'];
    return colorKeywords.some(color => label.toLowerCase().includes(color));
  }

  private fallbackCategorization(itemDescription: string): CategoryResult {
    const description = itemDescription.toLowerCase();
    
    if (description.includes('dress') || description.includes('gown')) {
      return { category: WardrobeCategory.DRESSES, confidence: 0.7 };
    }
    if (description.includes('shirt') || description.includes('top') || description.includes('blouse')) {
      return { category: WardrobeCategory.TOPS, confidence: 0.7 };
    }
    if (description.includes('pants') || description.includes('jeans') || description.includes('trousers')) {
      return { category: WardrobeCategory.BOTTOMS, confidence: 0.7 };
    }
    if (description.includes('shoe') || description.includes('boot') || description.includes('sneaker')) {
      return { category: WardrobeCategory.SHOES, confidence: 0.7 };
    }
    if (description.includes('jacket') || description.includes('coat') || description.includes('blazer')) {
      return { category: WardrobeCategory.OUTERWEAR, confidence: 0.7 };
    }
    
    return { category: WardrobeCategory.ACCESSORIES, confidence: 0.5 };
  }
}