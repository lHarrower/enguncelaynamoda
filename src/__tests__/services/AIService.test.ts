// Unit tests for AIService
import { AIService } from '../../services/AIService';
import { WardrobeCategory, WardrobeColor } from '../../types/wardrobe';
import { createMockWardrobeItem } from '../utils/testUtils';

// Mock dependencies
jest.mock('../../config/openai', () => ({
  openaiClient: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
}));

// Mock secureStorage
jest.mock('@/utils/secureStorage', () => {
  const mockSecureStorage = {
    initialize: jest.fn().mockResolvedValue(undefined),
    setItem: jest.fn().mockResolvedValue(undefined),
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(undefined),
    getAllKeys: jest.fn().mockResolvedValue([]),
    clearSecureData: jest.fn().mockResolvedValue(undefined),
    getLastError: jest.fn().mockReturnValue(null),
  };

  return {
    secureStorage: mockSecureStorage,
    SecureStorageManager: mockSecureStorage,
  };
});

// Mock Google Vision
const mockGoogleVision = {
  textDetection: jest.fn(),
  labelDetection: jest.fn(),
  objectLocalization: jest.fn(),
};

jest.mock('../../config/googleVision', () => {
  const mockVision = {
    textDetection: jest.fn(),
    labelDetection: jest.fn(),
    objectLocalization: jest.fn(),
  };
  return {
    visionClient: mockVision,
    default: mockVision,
  };
});

// Helper functions to get mocks
const getMockOpenAI = () => {
  const { openaiClient } = require('../../config/openai');
  return openaiClient;
};

const getMockSecureStorage = () => {
  const { secureStorage } = require('@/utils/secureStorage');
  return secureStorage;
};

const getMockGoogleVision = () => {
  const { visionClient } = require('../../config/googleVision');
  return visionClient;
};

describe('AIService', () => {
  let aiService: AIService;
  const mockImageUri = 'file://test-image.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
    getMockOpenAI().chat.completions.create.mockReset();
    getMockSecureStorage().getItem.mockReset();
    getMockSecureStorage().setItem.mockReset();
    aiService = new AIService();
  });

  describe('analyzeImage', () => {
    it('should analyze image and return structured data', async () => {
      const mockResponse = {
        confidence: 0.95,
        detectedItems: ['dress', 'shoes'],
        suggestedTags: ['formal', 'evening'],
        colorAnalysis: {
          dominantColors: ['black', 'red'],
          colorHarmony: 'complementary',
        },
        styleAnalysis: {
          style: 'elegant',
          formality: 'formal',
          season: ['fall', 'winter'],
        },
      };

      getMockOpenAI().chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockResponse),
            },
          },
        ],
      });

      const result = await aiService.analyzeImage(mockImageUri);

      expect(result).toEqual(mockResponse);
      expect(getMockOpenAI().chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.any(String),
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('Analyze this clothing item'),
            }),
          ]),
          max_tokens: 1000,
          temperature: 0.1,
        }),
      );
    });

    it('should handle API errors gracefully', async () => {
      getMockOpenAI().chat.completions.create.mockRejectedValueOnce(
        new Error('API Error'),
      );

      await expect(aiService.analyzeImage(mockImageUri)).rejects.toThrow('API Error');
    });

    it('should cache analysis results', async () => {
      const mockResponse = {
        confidence: 0.9,
        detectedItems: ['shirt'],
        suggestedTags: ['casual'],
        colorAnalysis: { dominantColors: ['blue'], colorHarmony: 'monochromatic' },
        styleAnalysis: { style: 'casual', formality: 'casual', season: ['spring'] },
      };

      // First call - should hit API
      getMockOpenAI().chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockResponse),
            },
          },
        ],
      });

      const result1 = await aiService.analyzeImage(mockImageUri);
      expect(result1).toEqual(mockResponse);
      expect(getMockOpenAI().chat.completions.create).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      getMockSecureStorage().getItem.mockResolvedValueOnce(
        JSON.stringify({
          data: mockResponse,
          timestamp: Date.now(),
        })
      );
      const result2 = await aiService.analyzeImage(mockImageUri);
      expect(result2).toEqual(mockResponse);
      expect(getMockOpenAI().chat.completions.create).toHaveBeenCalledTimes(1); // Still 1
    });
  });

  describe('generateOutfitSuggestions', () => {
    it('should generate outfit suggestions for different occasions', async () => {
      const mockItems = [
        { id: '1', name: 'Blue Shirt', category: 'tops' },
        { id: '2', name: 'Black Pants', category: 'bottoms' },
      ];

      const result = await aiService.generateOutfitSuggestions(mockItems, { occasion: 'casual' });

      expect(result.outfits).toHaveLength(1);
      expect(result.outfits[0]).toMatchObject({
        id: 'outfit-1',
        items: mockItems,
        occasion: 'casual',
        confidence: 0.9,
      });
      expect(result.styleNotes).toEqual(['Consider adding accessories', 'Great color coordination']);
    });

    it('should handle different weather conditions', async () => {
      const mockItems = [
        { id: '1', name: 'Summer Dress', category: 'dresses' },
      ];

      const result = await aiService.generateOutfitSuggestions(mockItems, { 
        occasion: 'casual', 
        weather: 'sunny' 
      });

      expect(result.outfits[0].weatherSuitability).toBe('sunny');
      expect(result.outfits[0].occasion).toBe('casual');
    });
  });

  describe('categorizeItem', () => {
    it('should categorize item and return category with confidence', async () => {
      const mockResult = {
        category: WardrobeCategory.BOTTOMS,
        confidence: 0.9,
      };

      getMockOpenAI().chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockResult),
            },
          },
        ],
      });

      const result = await aiService.categorizeItem('Blue Jeans');

      expect(result).toEqual(mockResult);
      expect(getMockOpenAI().chat.completions.create).toHaveBeenCalled();
    });
  });

  describe('error handling and validation', () => {
    it('should validate AI response format', async () => {
      const invalidResponse = {
        confidence: 'invalid',
        detectedItems: 'not an array',
      };

      getMockOpenAI().chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(invalidResponse),
            },
          },
        ],
      });

      await expect(aiService.analyzeImage(mockImageUri)).rejects.toThrow(
        'Invalid AI response format',
      );
    });

    it('should handle malformed JSON responses', async () => {
      getMockOpenAI().chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'invalid json',
            },
          },
        ],
      });

      await expect(aiService.analyzeImage(mockImageUri)).rejects.toThrow();
    });

    it('should handle empty responses', async () => {
      getMockOpenAI().chat.completions.create.mockResolvedValueOnce({
        choices: [],
      });

      await expect(aiService.analyzeImage(mockImageUri)).rejects.toThrow();
    });
  });

  describe('caching mechanism', () => {
    it('should use cached results when available', async () => {
       const cachedAnalysis = {
         confidence: 0.8,
         detectedItems: ['cached-item'],
         suggestedTags: ['cached'],
         colorAnalysis: { dominantColors: ['cached-color'], colorHarmony: 'cached' },
         styleAnalysis: { style: 'cached', formality: 'cached', season: ['cached'] },
       };

       getMockSecureStorage().getItem.mockResolvedValueOnce(
         JSON.stringify({
           data: cachedAnalysis,
           timestamp: Date.now()
         }),
       );

       const result = await aiService.analyzeImage(mockImageUri);

       expect(result).toEqual(cachedAnalysis);
        expect(getMockOpenAI().chat.completions.create).not.toHaveBeenCalled();
      });
  });

  describe('performance optimization', () => {
    it('should handle multiple requests efficiently', async () => {
      const imageUris = ['file://image1.jpg', 'file://image2.jpg', 'file://image3.jpg'];

      getMockOpenAI().chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                confidence: 0.9,
                detectedItems: ['item'],
                suggestedTags: ['tag'],
                colorAnalysis: { dominantColors: ['color'], colorHarmony: 'harmony' },
                styleAnalysis: { style: 'style', formality: 'formal', season: ['season'] },
              }),
            },
          },
        ],
      });

      const promises = imageUris.map((uri) => aiService.analyzeImage(uri));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(getMockOpenAI().chat.completions.create).toHaveBeenCalledTimes(3);
    });

    it('should compress images before sending to API', async () => {
      const largeImageUri = 'file://large-image.jpg';

      getMockOpenAI().chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                confidence: 0.9,
                detectedItems: ['dress'],
                suggestedTags: ['formal'],
                colorAnalysis: { dominantColors: ['red'], colorHarmony: 'warm' },
                styleAnalysis: { style: 'elegant', formality: 'formal', season: ['all'] },
              }),
            },
          },
        ],
      });

      await aiService.analyzeImage(largeImageUri);

      expect(getMockOpenAI().chat.completions.create).toHaveBeenCalled();
    });
  });
});
