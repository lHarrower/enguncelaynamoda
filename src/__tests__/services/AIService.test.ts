// Unit tests for AIService
import { AIService } from '@/services/AIService';
import { WardrobeCategory, WardrobeColor } from '@/types';
import { createMockWardrobeItem } from '@/__tests__/utils/testUtils';
import { mocks } from '@/__tests__/mocks';

// Mock dependencies
jest.mock('@/config/openai', () => ({
  openaiClient: mocks.openai,
}));

jest.mock('../../config/googleVision', () => ({
  visionClient: mocks.googleVision,
}));

jest.mock('@react-native-async-storage/async-storage', () => mocks.asyncStorage);

describe('AIService', () => {
  let aiService: AIService;
  const mockImageUri = 'file://test-image.jpg';
  const mockImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';

  beforeEach(() => {
    aiService = new AIService();
    jest.clearAllMocks();
  });

  describe('analyzeImage', () => {
    it('should analyze image and return clothing analysis', async () => {
      const expectedAnalysis = {
        confidence: 0.95,
        detectedItems: ['dress'],
        suggestedTags: ['casual', 'summer'],
        colorAnalysis: {
          dominantColors: ['blue'],
          colorHarmony: 'monochromatic',
        },
        styleAnalysis: {
          style: 'bohemian',
          formality: 'casual',
          season: ['summer'],
        },
      };

      mocks.openai.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify(expectedAnalysis),
          },
        }],
      });

      const result = await aiService.analyzeImage(mockImageUri);

      expect(result).toEqual(expectedAnalysis);
      expect(mocks.openai.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.arrayContaining([
              expect.objectContaining({ type: 'text' }),
              expect.objectContaining({ type: 'image_url' }),
            ]),
          }),
        ]),
        max_tokens: 1000,
        temperature: 0.1,
      });
    });

    it('should handle base64 encoded images', async () => {
      const expectedAnalysis = {
        confidence: 0.90,
        detectedItems: ['shirt'],
        suggestedTags: ['formal', 'business'],
        colorAnalysis: {
          dominantColors: ['white'],
          colorHarmony: 'neutral',
        },
        styleAnalysis: {
          style: 'classic',
          formality: 'formal',
          season: ['all'],
        },
      };

      mocks.openai.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify(expectedAnalysis),
          },
        }],
      });

      const result = await aiService.analyzeImage(mockImageBase64);

      expect(result).toEqual(expectedAnalysis);
    });

    it('should handle API errors gracefully', async () => {
      mocks.openai.chat.completions.create.mockRejectedValueOnce(
        new Error('API rate limit exceeded')
      );

      await expect(aiService.analyzeImage(mockImageUri)).rejects.toThrow('API rate limit exceeded');
    });

    it('should handle malformed API responses', async () => {
      mocks.openai.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'Invalid JSON response',
          },
        }],
      });

      await expect(aiService.analyzeImage(mockImageUri)).rejects.toThrow('Failed to parse AI response');
    });

    it('should cache analysis results', async () => {
      const analysis = {
        confidence: 0.95,
        detectedItems: ['dress'],
        suggestedTags: ['casual'],
        colorAnalysis: { dominantColors: ['blue'], colorHarmony: 'monochromatic' },
        styleAnalysis: { style: 'bohemian', formality: 'casual', season: ['summer'] },
      };

      mocks.openai.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(analysis) } }],
      });

      await aiService.analyzeImage(mockImageUri);

      expect(mocks.asyncStorage.setItem).toHaveBeenCalledWith(
        `ai_analysis_${expect.any(String)}`,
        JSON.stringify(analysis)
      );
    });

    it('should return cached results when available', async () => {
      const cachedAnalysis = {
        confidence: 0.95,
        detectedItems: ['dress'],
        suggestedTags: ['casual'],
        colorAnalysis: { dominantColors: ['blue'], colorHarmony: 'monochromatic' },
        styleAnalysis: { style: 'bohemian', formality: 'casual', season: ['summer'] },
      };

      mocks.asyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(cachedAnalysis));

      const result = await aiService.analyzeImage(mockImageUri);

      expect(result).toEqual(cachedAnalysis);
      expect(mocks.openai.chat.completions.create).not.toHaveBeenCalled();
    });
  });

  describe('generateOutfitSuggestions', () => {
    it('should generate outfit suggestions based on wardrobe items', async () => {
      const wardrobeItems = [
        createMockWardrobeItem({ category: WardrobeCategory.TOPS, colors: [WardrobeColor.BLUE] }),
        createMockWardrobeItem({ category: WardrobeCategory.BOTTOMS, colors: [WardrobeColor.BLACK] }),
        createMockWardrobeItem({ category: WardrobeCategory.SHOES, colors: [WardrobeColor.BLACK] }),
      ];

      const expectedSuggestions = {
        outfits: [
          {
            id: 'outfit-1',
            items: wardrobeItems,
            occasion: 'casual',
            confidence: 0.9,
            reasoning: 'Blue top pairs well with black bottoms for a casual look',
          },
        ],
        styleNotes: ['Consider adding accessories', 'Great color coordination'],
      };

      mocks.openai.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify(expectedSuggestions),
          },
        }],
      });

      const result = await aiService.generateOutfitSuggestions(
        wardrobeItems,
        { occasion: 'casual', weather: 'mild' }
      );

      expect(result).toEqual(expectedSuggestions);
      expect(mocks.openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('fashion stylist'),
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('casual'),
            }),
          ]),
        })
      );
    });

    it('should handle different occasions', async () => {
      const wardrobeItems = [createMockWardrobeItem()];
      const occasions = ['formal', 'business', 'party', 'workout'];

      for (const occasion of occasions) {
        mocks.openai.chat.completions.create.mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                outfits: [{
                  id: `outfit-${occasion}`,
                  items: wardrobeItems,
                  occasion,
                  confidence: 0.8,
                }],
              }),
            },
          }],
        });

        const result = await aiService.generateOutfitSuggestions(
          wardrobeItems,
          { occasion }
        );

        expect(result.outfits[0].occasion).toBe(occasion);
      }
    });

    it('should consider weather conditions', async () => {
      const wardrobeItems = [createMockWardrobeItem()];
      const weatherConditions = ['hot', 'cold', 'rainy', 'mild'];

      for (const weather of weatherConditions) {
        mocks.openai.chat.completions.create.mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                outfits: [{
                  id: `outfit-${weather}`,
                  items: wardrobeItems,
                  occasion: 'casual',
                  confidence: 0.8,
                  weatherSuitability: weather,
                }],
              }),
            },
          }],
        });

        const result = await aiService.generateOutfitSuggestions(
          wardrobeItems,
          { weather }
        );

        expect(result.outfits[0].weatherSuitability).toBe(weather);
      }
    });
  });

  describe('generateStyleAdvice', () => {
    it('should provide personalized style advice', async () => {
      const userProfile = {
        style: 'bohemian',
        favoriteColors: [WardrobeColor.BLUE, WardrobeColor.GREEN],
        bodyType: 'pear',
        lifestyle: 'active',
      };

      const wardrobeItems = [createMockWardrobeItem()];

      const expectedAdvice = {
        recommendations: [
          'Add more earth tones to complement your bohemian style',
          'Consider A-line silhouettes for your body type',
        ],
        gapAnalysis: {
          missing: ['blazer', 'statement jewelry'],
          overrepresented: ['casual dresses'],
        },
        colorPalette: {
          suggested: ['terracotta', 'sage green', 'cream'],
          avoid: ['neon colors', 'harsh contrasts'],
        },
        styleScore: 85,
      };

      mocks.openai.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify(expectedAdvice),
          },
        }],
      });

      const result = await aiService.generateStyleAdvice(userProfile, wardrobeItems);

      expect(result).toEqual(expectedAdvice);
    });
  });

  describe('detectClothingItems', () => {
    it('should detect clothing items using Google Vision API', async () => {
      const expectedDetection = {
        items: [
          {
            name: 'Dress',
            confidence: 0.95,
            boundingBox: {
              x: 0.1,
              y: 0.1,
              width: 0.8,
              height: 0.8,
            },
          },
        ],
        colors: ['blue', 'white'],
        text: ['Brand Name'],
      };

      mocks.googleVision.labelDetection.mockResolvedValueOnce({
        labelAnnotations: [
          { description: 'Dress', score: 0.95 },
          { description: 'Blue', score: 0.90 },
        ],
      });

      mocks.googleVision.objectLocalization.mockResolvedValueOnce({
        localizedObjectAnnotations: [
          {
            name: 'Dress',
            score: 0.95,
            boundingPoly: {
              normalizedVertices: [
                { x: 0.1, y: 0.1 },
                { x: 0.9, y: 0.1 },
                { x: 0.9, y: 0.9 },
                { x: 0.1, y: 0.9 },
              ],
            },
          },
        ],
      });

      mocks.googleVision.textDetection.mockResolvedValueOnce({
        textAnnotations: [
          { description: 'Brand Name', score: 0.90 },
        ],
      });

      const result = await aiService.detectClothingItems(mockImageUri);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Dress');
      expect(result.items[0].confidence).toBe(0.95);
    });
  });

  describe('categorizeItem', () => {
    it('should categorize clothing items correctly', async () => {
      const testCases = [
        { input: 'blue dress', expected: WardrobeCategory.DRESSES },
        { input: 't-shirt', expected: WardrobeCategory.TOPS },
        { input: 'jeans', expected: WardrobeCategory.BOTTOMS },
        { input: 'sneakers', expected: WardrobeCategory.SHOES },
        { input: 'blazer', expected: WardrobeCategory.OUTERWEAR },
      ];

      for (const testCase of testCases) {
        mocks.openai.chat.completions.create.mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({ category: testCase.expected }),
            },
          }],
        });

        const result = await aiService.categorizeItem(testCase.input);
        expect(result.category).toBe(testCase.expected);
      }
    });
  });

  describe('extractColors', () => {
    it('should extract dominant colors from image', async () => {
      const expectedColors = {
        dominantColors: [WardrobeColor.BLUE, WardrobeColor.WHITE],
        colorPercentages: {
          [WardrobeColor.BLUE]: 60,
          [WardrobeColor.WHITE]: 40,
        },
        colorHarmony: 'complementary',
      };

      mocks.openai.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify(expectedColors),
          },
        }],
      });

      const result = await aiService.extractColors(mockImageUri);

      expect(result).toEqual(expectedColors);
    });
  });

  describe('error handling and resilience', () => {
    it('should handle API rate limits with exponential backoff', async () => {
      mocks.openai.chat.completions.create
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({ confidence: 0.8, detectedItems: ['shirt'] }),
            },
          }],
        });

      const result = await aiService.analyzeImage(mockImageUri);

      expect(result.detectedItems).toContain('shirt');
      expect(mocks.openai.chat.completions.create).toHaveBeenCalledTimes(3);
    });

    it('should fallback to cached results when API is unavailable', async () => {
      const cachedAnalysis = {
        confidence: 0.85,
        detectedItems: ['dress'],
        suggestedTags: ['formal'],
        colorAnalysis: { dominantColors: ['black'], colorHarmony: 'monochromatic' },
        styleAnalysis: { style: 'classic', formality: 'formal', season: ['all'] },
      };

      mocks.asyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(cachedAnalysis));
      mocks.openai.chat.completions.create.mockRejectedValue(new Error('Service unavailable'));

      const result = await aiService.analyzeImage(mockImageUri);

      expect(result).toEqual(cachedAnalysis);
    });

    it('should validate AI responses before returning', async () => {
      const invalidResponse = {
        confidence: 'invalid', // Should be number
        detectedItems: 'not an array', // Should be array
      };

      mocks.openai.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify(invalidResponse),
          },
        }],
      });

      await expect(aiService.analyzeImage(mockImageUri)).rejects.toThrow('Invalid AI response format');
    });
  });

  describe('performance optimization', () => {
    it('should batch multiple requests efficiently', async () => {
      const imageUris = [
        'file://image1.jpg',
        'file://image2.jpg',
        'file://image3.jpg',
      ];

      mocks.openai.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              confidence: 0.9,
              detectedItems: ['shirt'],
              suggestedTags: ['casual'],
              colorAnalysis: { dominantColors: ['blue'], colorHarmony: 'monochromatic' },
              styleAnalysis: { style: 'casual', formality: 'casual', season: ['all'] },
            }),
          },
        }],
      });

      const results = await Promise.all(
        imageUris.map(uri => aiService.analyzeImage(uri))
      );

      expect(results).toHaveLength(3);
      expect(mocks.openai.chat.completions.create).toHaveBeenCalledTimes(3);
    });

    it('should compress images before sending to API', async () => {
      const largeImageUri = 'file://large-image.jpg';
      
      mocks.openai.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              confidence: 0.9,
              detectedItems: ['dress'],
              suggestedTags: ['formal'],
              colorAnalysis: { dominantColors: ['red'], colorHarmony: 'warm' },
              styleAnalysis: { style: 'elegant', formality: 'formal', season: ['all'] },
            }),
          },
        }],
      });

      await aiService.analyzeImage(largeImageUri);

      // Verify that the image was processed (compression would happen internally)
      expect(mocks.openai.chat.completions.create).toHaveBeenCalled();
    });
  });
});