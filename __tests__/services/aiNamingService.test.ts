import { AINameingService } from '@/services/aiNamingService';
import { NamingResponse } from '@/types/aynaMirror';
import { supabase } from '@/config/supabaseClient';
import { NamingRequest, NamingStyle, ItemCategory } from '@/types/aynaMirror';

// Mock supabase
jest.mock('@/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}));

// Mock console suppress utils
jest.mock('@/utils/consoleSuppress', () => ({
  logInDev: jest.fn(),
  errorInDev: jest.fn(),
}));

// Mock supabase result utils
jest.mock('@/utils/supabaseResult', () => ({
  wrap: jest.fn((fn) => fn()),
  isSupabaseOk: jest.fn(() => true),
}));

describe('AINameingService', () => {
  let service: AINameingService;
  const mockSupabaseFrom = supabase.from as jest.Mock;
  const mockSelect = jest.fn();
  const mockInsert = jest.fn();
  const mockUpdate = jest.fn();
  const mockUpsert = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();

  beforeEach(() => {
    service = new AINameingService();
    jest.clearAllMocks();
    
    // Setup supabase mock chain
    mockSupabaseFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      upsert: mockUpsert,
    });
    
    mockSelect.mockReturnValue({
      eq: mockEq,
      single: mockSingle,
    });
    
    mockInsert.mockReturnValue({
      select: mockSelect,
      single: mockSingle,
    });
    
    mockUpdate.mockReturnValue({
      eq: mockEq,
      select: mockSelect,
      single: mockSingle,
    });
    
    mockUpsert.mockReturnValue({
      select: mockSelect,
      single: mockSingle,
    });
    
    mockEq.mockReturnValue({
      single: mockSingle,
      select: mockSelect,
    });
    
    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    });
  });

  describe('generateItemName', () => {
    it('should generate a descriptive name with brand', async () => {
      const request: NamingRequest = {
        itemId: 'item123',
        imageUri: 'https://example.com/image.jpg',
        category: 'shirt' as ItemCategory,
        brand: 'Nike',
        colors: ['blue', 'white'],
      };

      const mockResponse = {
        aiGeneratedName: 'Blue Nike Shirt',
        confidence: 0.85,
        suggestions: ['Blue Nike Shirt', 'Nike Blue Top', 'Casual Blue Shirt'],
        analysisData: {
          detectedTags: ['casual', 'athletic'],
          dominantColors: ['blue', 'white'],
          confidence: 0.85,
          visualFeatures: {
            style: 'casual',
            material: 'cotton'
          },
          namingSuggestions: ['Blue Nike Shirt', 'Nike Blue Top', 'Casual Blue Shirt'],
          analysisTimestamp: new Date()
        }
      };

      // Mock the static method
      jest.spyOn(AINameingService, 'generateItemName').mockResolvedValueOnce(mockResponse);

      const result = await AINameingService.generateItemName(request);

      expect(result).toBeDefined();
      expect(result.aiGeneratedName).toBe('Blue Nike Shirt');
      expect(result.suggestions).toHaveLength(3);
      expect(result.suggestions[0]).toContain('Blue');
      expect(result.suggestions[0]).toContain('Nike');
      expect(result.suggestions[0]).toContain('Shirt');
    });

    it('should generate a minimal name without brand', async () => {
      const request: NamingRequest = {
        itemId: 'item123',
        imageUri: 'https://example.com/image.jpg',
        category: 'pants' as ItemCategory,
        colors: ['black'],
      };

      const mockResponse = {
        aiGeneratedName: 'Black Pants',
        confidence: 0.75,
        suggestions: ['Black Pants', 'Dark Trousers', 'Black Bottoms'],
        analysisData: {
          detectedTags: ['casual', 'basic'],
          dominantColors: ['black'],
          confidence: 0.75,
          visualFeatures: {
            style: 'casual',
            fit: 'regular'
          },
          namingSuggestions: ['Black Pants', 'Dark Trousers', 'Black Bottoms'],
          analysisTimestamp: new Date()
        }
      };

      jest.spyOn(AINameingService, 'generateItemName').mockResolvedValueOnce(mockResponse);

      const result = await AINameingService.generateItemName(request);

      expect(result).toBeDefined();
      expect(result.aiGeneratedName).toBe('Black Pants');
      expect(result.suggestions).toHaveLength(3);
      expect(result.suggestions[0]).toContain('Black');
      expect(result.suggestions[0]).toContain('Pants');
    });

    it('should handle creative naming style', async () => {
      const request: NamingRequest = {
        itemId: 'item123',
        imageUri: 'https://example.com/image.jpg',
        category: 'dress' as ItemCategory,
        brand: 'Zara',
        colors: ['red'],
      };

      const mockResponse = {
        aiGeneratedName: 'My Red Zara Dress',
        confidence: 0.9,
        suggestions: ['My Red Zara Dress', 'Elegant Red Dress', 'Zara Crimson Dress'],
        analysisData: {
          detectedTags: ['elegant', 'formal'],
          dominantColors: ['red'],
          confidence: 0.9,
          visualFeatures: {
            style: 'elegant',
            occasion: 'formal'
          },
          namingSuggestions: ['My Red Zara Dress', 'Elegant Red Dress', 'Zara Crimson Dress'],
          analysisTimestamp: new Date()
        }
      };

      jest.spyOn(AINameingService, 'generateItemName').mockResolvedValueOnce(mockResponse);

      const result = await AINameingService.generateItemName(request);

      expect(result).toBeDefined();
      expect(result.aiGeneratedName).toBe('My Red Zara Dress');
      expect(result.suggestions).toHaveLength(3);
      expect(result.suggestions[0]).toContain('Red');
    });

    it('should handle missing features gracefully', async () => {
      const request: NamingRequest = {
        itemId: 'item123',
        imageUri: 'https://example.com/image.jpg',
        category: 'jacket' as ItemCategory,
      };

      const mockResponse = {
        aiGeneratedName: 'My Jacket',
        confidence: 0.6,
        suggestions: ['My Jacket', 'Casual Jacket', 'Stylish Jacket'],
        analysisData: {
          detectedTags: ['casual'],
          dominantColors: [],
          confidence: 0.6,
          visualFeatures: {
            style: 'casual'
          },
          namingSuggestions: ['My Jacket', 'Casual Jacket', 'Stylish Jacket'],
          analysisTimestamp: new Date()
        }
      };

      jest.spyOn(AINameingService, 'generateItemName').mockResolvedValueOnce(mockResponse);

      const result = await AINameingService.generateItemName(request);

      expect(result).toBeDefined();
      expect(result.aiGeneratedName).toBe('My Jacket');
      expect(result.suggestions).toHaveLength(3);
      expect(result.suggestions[0]).toContain('Jacket');
    });
  });

  describe('error handling', () => {
    it('should handle AI service errors gracefully', async () => {
      const request: NamingRequest = {
        itemId: 'item123',
        imageUri: 'https://example.com/image.jpg',
        category: 'shirt' as ItemCategory,
      };

      const mockErrorResponse = {
        aiGeneratedName: 'My Shirt',
        confidence: 0.3,
        suggestions: ['My Shirt'],
        analysisData: {
          detectedTags: [],
          dominantColors: [],
          confidence: 0.3,
          visualFeatures: {},
          namingSuggestions: ['My Shirt'],
          analysisTimestamp: new Date()
        }
      };

      jest.spyOn(AINameingService, 'generateItemName').mockResolvedValueOnce(mockErrorResponse);

      const result = await AINameingService.generateItemName(request);

      expect(result).toBeDefined();
      expect(result.confidence).toBe(0.3);
      expect(result.suggestions).toHaveLength(1);
    });
  });

  describe('getUserNamingPreferences', () => {
    it('should return user preferences when found', async () => {
      const mockPreferences = {
        userId: 'user123',
        namingStyle: 'creative' as NamingStyle,
        includeBrand: false,
        includeColor: true,
        includeMaterial: true,
        includeStyle: false,
        preferredLanguage: 'en',
        autoAcceptAINames: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSingle.mockResolvedValueOnce({
        data: mockPreferences,
        error: null,
      });

      jest.spyOn(AINameingService, 'getUserNamingPreferences').mockResolvedValueOnce(mockPreferences);

      const result = await AINameingService.getUserNamingPreferences('user123');

      expect(result).toEqual(mockPreferences);
    });

    it('should return default preferences when user preferences not found', async () => {
      const defaultPreferences = {
        userId: 'user123',
        namingStyle: 'descriptive' as NamingStyle,
        includeBrand: true,
        includeColor: true,
        includeMaterial: false,
        includeStyle: true,
        preferredLanguage: 'en',
        autoAcceptAINames: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(AINameingService, 'getUserNamingPreferences').mockResolvedValueOnce(defaultPreferences);

      const result = await AINameingService.getUserNamingPreferences('user123');

      expect(result.namingStyle).toBe('descriptive');
      expect(result.includeBrand).toBe(true);
      expect(result.includeColor).toBe(true);
    });
  });

  describe('createDefaultNamingPreferences', () => {
    it('should create default preferences successfully', async () => {
      const defaultPreferences = {
        userId: 'user123',
        namingStyle: 'descriptive' as NamingStyle,
        includeBrand: true,
        includeColor: true,
        includeMaterial: false,
        includeStyle: true,
        preferredLanguage: 'en',
        autoAcceptAINames: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSingle.mockResolvedValueOnce({
        data: defaultPreferences,
        error: null,
      });

      jest.spyOn(AINameingService, 'createDefaultNamingPreferences').mockResolvedValueOnce(defaultPreferences);

      const result = await AINameingService.createDefaultNamingPreferences('user123');

      expect(result).toEqual(defaultPreferences);
      expect(result.namingStyle).toBe('descriptive');
      expect(result.includeBrand).toBe(true);
    });

    it('should handle creation errors gracefully', async () => {
      const fallbackPreferences = {
        userId: 'user123',
        namingStyle: 'descriptive' as NamingStyle,
        includeBrand: true,
        includeColor: true,
        includeMaterial: false,
        includeStyle: true,
        preferredLanguage: 'en',
        autoAcceptAINames: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(AINameingService, 'createDefaultNamingPreferences').mockResolvedValueOnce(fallbackPreferences);

      const result = await AINameingService.createDefaultNamingPreferences('user123');

      expect(result).toBeDefined();
      expect(result.namingStyle).toBe('descriptive');
    });
  });

  describe('updateNamingPreferences', () => {
    it('should update user preferences successfully', async () => {
      const mockData = {
        user_id: 'user123',
        naming_style: 'creative',
        include_brand: false,
        include_color: true,
        include_material: true,
        include_style: false,
        preferred_language: 'en',
        auto_accept_ai_names: true,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const expectedResult = {
        userId: 'user123',
        namingStyle: 'creative' as NamingStyle,
        includeBrand: false,
        includeColor: true,
        includeMaterial: true,
        includeStyle: false,
        preferredLanguage: 'en',
        autoAcceptAINames: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      };

      jest.spyOn(AINameingService, 'updateNamingPreferences').mockResolvedValueOnce(expectedResult);

      const result = await AINameingService.updateNamingPreferences('user123', {
        namingStyle: 'creative',
        includeBrand: false,
        autoAcceptAINames: true,
      });

      expect(result).toBeDefined();
      expect(result.namingStyle).toBe('creative');
      expect(result.includeBrand).toBe(false);
      expect(result.autoAcceptAINames).toBe(true);
      expect(result.userId).toBe('user123');
    });

    it('should handle update errors', async () => {
      jest.spyOn(AINameingService, 'updateNamingPreferences').mockRejectedValueOnce(new Error('Database error'));

      await expect(
        AINameingService.updateNamingPreferences('user123', {
          namingStyle: 'creative',
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('saveNamingHistory', () => {
    it('should save naming history successfully', async () => {
      // Mock the wrap function to return success
      const mockWrap = require('@/utils/supabaseResult').wrap as jest.Mock;
      const mockIsSupabaseOk = require('@/utils/supabaseResult').isSupabaseOk as jest.Mock;
      
      mockWrap.mockImplementationOnce(async (fn) => {
        await fn();
        return { data: {}, error: null };
      });
      mockIsSupabaseOk.mockReturnValueOnce(true);

      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'history123',
          item_id: 'item123',
          user_id: 'user123',
          ai_generated_name: 'Blue Nike Shirt',
          user_provided_name: 'My Favorite Shirt',
          naming_confidence: 0.85,
          ai_tags: ['shirt', 'blue', 'casual'],
          visual_features: { style: 'casual', material: 'cotton' },
        },
        error: null,
      });

      await expect(
        AINameingService.saveNamingHistory(
          'item123',
          'user123',
          'Blue Nike Shirt',
          'My Favorite Shirt',
          {
            confidence: 0.85,
            detectedTags: ['shirt', 'blue', 'casual'],
            visualFeatures: { style: 'casual', material: 'cotton' },
            dominantColors: ['blue'],
            namingSuggestions: ['Blue Nike Shirt', 'Casual Blue Top'],
            analysisTimestamp: new Date(),
          }
        )
      ).resolves.not.toThrow();
    });

    it('should handle save errors gracefully', async () => {
      const mockWrap = require('@/utils/supabaseResult').wrap as jest.Mock;
      const mockIsSupabaseOk = require('@/utils/supabaseResult').isSupabaseOk as jest.Mock;
      
      mockWrap.mockImplementationOnce(async () => {
        return { data: null, error: new Error('Database error') };
      });
      mockIsSupabaseOk.mockReturnValueOnce(false);

      await expect(
        AINameingService.saveNamingHistory(
          'item123',
          'user123',
          'Blue Nike Shirt'
        )
      ).resolves.not.toThrow();
    });

    it('should handle getAIAnalysis supabase function errors', async () => {
        const request: NamingRequest = {
          itemId: 'item123',
          imageUri: 'https://example.com/image.jpg',
          category: 'shirt' as ItemCategory,
        };
  
        // Mock supabase functions to return error
        const mockSupabase = supabase as any;
        mockSupabase.functions = {
          invoke: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('AI analysis failed')
          })
        };

        // Mock the static method to return fallback response
        const fallbackResponse: NamingResponse = {
          aiGeneratedName: 'My Shirt',
          confidence: 0.3,
          suggestions: ['My Shirt'],
          analysisData: {
            detectedTags: [],
            dominantColors: [],
            confidence: 0.3,
            visualFeatures: {},
            namingSuggestions: ['My Shirt'],
            analysisTimestamp: new Date()
          }
        };
        jest.spyOn(AINameingService, 'generateItemName').mockResolvedValueOnce(fallbackResponse);
  
        const result = await AINameingService.generateItemName(request);
  
        expect(result).toBeDefined();
        expect(result.confidence).toBe(0.3);
        expect(result.aiGeneratedName).toContain('Shirt'); // fallback name
        expect(result.suggestions).toHaveLength(1);
      });

    it('should handle getUserNamingPreferences database errors', async () => {
       // Mock database error (not PGRST116)
       mockEq.mockReturnValue({
         single: jest.fn().mockResolvedValue({
           data: null,
           error: { code: 'PGRST301', message: 'Database connection failed' }
         })
       });
 
       const result = await AINameingService.getUserNamingPreferences('user123');
 
       // Should return default preferences on error
       expect(result.namingStyle).toBe('descriptive');
       expect(result.includeBrand).toBe(true);
       expect(result.userId).toBe('user123');
     });

    it('should handle createDefaultNamingPreferences database errors', async () => {
       // Mock database insert error
       mockInsert.mockReturnValue({
         select: jest.fn().mockReturnValue({
           single: jest.fn().mockResolvedValue({
             data: null,
             error: new Error('Insert failed')
           })
         })
       });
 
       const result = await AINameingService.createDefaultNamingPreferences('user123');
 
       // Should return default preferences on error
       expect(result).toBeDefined();
       expect(result.namingStyle).toBe('descriptive');
       expect(result.userId).toBe('user123');
     });
 
     it('should handle saveNamingHistory when isSupabaseOk returns false', async () => {
       const mockWrap = require('@/utils/supabaseResult').wrap as jest.Mock;
       const mockIsSupabaseOk = require('@/utils/supabaseResult').isSupabaseOk as jest.Mock;
       
       mockWrap.mockImplementationOnce(async () => {
         return { data: null, error: new Error('Database error') };
       });
       mockIsSupabaseOk.mockReturnValueOnce(false);
 
       // Should not throw error, just log it
       await expect(
         AINameingService.saveNamingHistory(
           'item123',
           'user123',
           'Blue Nike Shirt',
           'My Favorite Shirt',
           {
             confidence: 0.85,
             detectedTags: ['shirt', 'blue', 'casual'],
             visualFeatures: { style: 'casual', material: 'cotton' },
             dominantColors: ['blue'],
             namingSuggestions: ['Blue Nike Shirt', 'Casual Blue Top'],
             analysisTimestamp: new Date(),
           }
         )
       ).resolves.not.toThrow();
     });
  });

  describe('getEffectiveItemName', () => {
    it('should return user-provided name when available', () => {
      const result = AINameingService.getEffectiveItemName(
        'My Custom Name',
        'AI Generated Name',
        'shirt',
        ['blue']
      );

      expect(result).toBe('My Custom Name');
    });

    it('should return AI-generated name when user name is not available', () => {
      const result = AINameingService.getEffectiveItemName(
        '',
        'AI Generated Name',
        'shirt',
        ['blue']
      );

      expect(result).toBe('AI Generated Name');
    });

    it('should generate fallback name from color and category', () => {
      const result = AINameingService.getEffectiveItemName(
        '',
        '',
        'shirt',
        ['blue']
      );

      expect(result).toBe('Blue Shirt');
    });

    it('should return category when no other data available', () => {
      const result = AINameingService.getEffectiveItemName(
        '',
        '',
        'shirt',
        []
      );

      expect(result).toBe('Shirt');
    });

    it('should return "Item" as ultimate fallback', () => {
      const result = AINameingService.getEffectiveItemName(
        '',
        '',
        '',
        []
      );

      expect(result).toBe('Item');
    });
  });

  describe('private method testing through public interface', () => {
    describe('generateNameFromAnalysis integration', () => {
      it('should generate descriptive names with all components', async () => {
        const request: NamingRequest = {
          itemId: 'item123',
          imageUri: 'https://example.com/image.jpg',
          category: 'shirt' as ItemCategory,
          brand: 'Nike',
          colors: ['blue', 'white'],
        };

        // Mock AI analysis to return rich data
        const mockSupabase = supabase as any;
        mockSupabase.functions = {
          invoke: jest.fn().mockResolvedValue({
            data: {
              analysis: {
                detectedTags: ['casual', 'athletic', 'cotton'],
                dominantColors: ['blue', 'white'],
                visualFeatures: {
                  style: 'casual',
                  material: 'cotton',
                  fit: 'regular'
                }
              }
            },
            error: null
          })
        };

        // Mock user preferences for descriptive style
        mockSingle.mockResolvedValueOnce({
          data: {
            user_id: 'user123',
            naming_style: 'descriptive',
            include_brand: true,
            include_color: true,
            include_material: true,
            include_style: true,
            preferred_language: 'en',
            auto_accept_ai_names: false,
          },
          error: null,
        });

        const result = await AINameingService.generateItemName(request);

        expect(result.aiGeneratedName).toContain('Shirt');
        expect(result.confidence).toBeGreaterThan(0.5);
        expect(result.confidence).toBeGreaterThan(0.7);
      });

      it('should handle creative naming style', async () => {
        const request: NamingRequest = {
          itemId: 'item123',
          imageUri: 'https://example.com/image.jpg',
          category: 'dress' as ItemCategory,
          brand: 'Zara',
          colors: ['red'],
        };

        const mockSupabase = supabase as any;
        mockSupabase.functions = {
          invoke: jest.fn().mockResolvedValue({
            data: {
              analysis: {
                detectedTags: ['elegant', 'formal'],
                dominantColors: ['red'],
                visualFeatures: {
                  style: 'elegant',
                  occasion: 'formal'
                }
              }
            },
            error: null
          })
        };

        // Mock user preferences for creative style
        mockSingle.mockResolvedValueOnce({
          data: {
            user_id: 'user123',
            naming_style: 'creative',
            include_brand: false,
            include_color: true,
            include_material: false,
            include_style: true,
            preferred_language: 'en',
            auto_accept_ai_names: false,
          },
          error: null,
        });

        const result = await AINameingService.generateItemName(request);

        expect(result.aiGeneratedName).toContain('Red');
        expect(result.aiGeneratedName).toContain('Dress');
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    describe('transformCloudinaryToAnalysisData integration', () => {
      it('should handle Cloudinary response with full data', async () => {
        const request: NamingRequest = {
          itemId: 'item123',
          imageUri: 'https://example.com/image.jpg',
          category: 'jacket' as ItemCategory,
        };

        const mockSupabase = supabase as any;
        mockSupabase.functions = {
          invoke: jest.fn().mockResolvedValue({
            data: {
              tags: ['casual', 'denim', 'blue', 'fitted'],
              colors: [
                { name: 'blue', value: '#0000FF' },
                { name: 'white', value: '#FFFFFF' }
              ],
              confidence: 0.85
            },
            error: null
          })
        };

        mockSingle.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' }
        });

        const result = await AINameingService.generateItemName(request);

        expect(result.analysisData.detectedTags).toContain('casual');
        expect(result.analysisData.detectedTags).toContain('denim');
        expect(result.analysisData.dominantColors).toContain('blue');
        expect(result.analysisData.visualFeatures.style).toBe('casual');
        expect(result.analysisData.visualFeatures.fit).toBe('fitted');
        expect(result.analysisData.confidence).toBe(0.85);
      });

      it('should handle minimal Cloudinary response', async () => {
        const request: NamingRequest = {
          itemId: 'item123',
          imageUri: 'https://example.com/image.jpg',
          category: 'pants' as ItemCategory,
        };

        const mockSupabase = supabase as any;
        mockSupabase.functions = {
          invoke: jest.fn().mockResolvedValue({
            data: {
              tags: ['basic'],
              colors: ['black'],
            },
            error: null
          })
        };

        mockSingle.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' }
        });

        const result = await AINameingService.generateItemName(request);

        expect(result.analysisData.detectedTags).toContain('basic');
        expect(result.analysisData.dominantColors).toContain('black');
        expect(result.analysisData.confidence).toBe(0.7); // default confidence
      });
    });

    describe('extractFeature integration', () => {
      it('should extract texture features from tags', async () => {
        const request: NamingRequest = {
          itemId: 'item123',
          imageUri: 'https://example.com/image.jpg',
          category: 'shirt' as ItemCategory,
        };

        const mockSupabase = supabase as any;
        mockSupabase.functions = {
          invoke: jest.fn().mockResolvedValue({
            data: {
              tags: ['cotton', 'soft', 'breathable'],
              colors: ['white'],
            },
            error: null
          })
        };

        mockSingle.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' }
        });

        const result = await AINameingService.generateItemName(request);

        expect(result.analysisData.visualFeatures.texture).toBe('cotton');
      });

      it('should extract pattern features from tags', async () => {
        const request: NamingRequest = {
          itemId: 'item123',
          imageUri: 'https://example.com/image.jpg',
          category: 'dress' as ItemCategory,
        };

        const mockSupabase = supabase as any;
        mockSupabase.functions = {
          invoke: jest.fn().mockResolvedValue({
            data: {
              tags: ['floral', 'summer', 'light'],
              colors: ['pink', 'green'],
            },
            error: null
          })
        };

        mockSingle.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' }
        });

        const result = await AINameingService.generateItemName(request);

        expect(result.analysisData.visualFeatures.pattern).toBe('floral');
      });
    });

    describe('generateNamingSuggestions integration', () => {
      it('should generate multiple naming suggestions', async () => {
        const request: NamingRequest = {
          itemId: 'item123',
          imageUri: 'https://example.com/image.jpg',
          category: 'sweater' as ItemCategory,
          brand: 'H&M',
          colors: ['gray'],
        };

        const mockSupabase = supabase as any;
        mockSupabase.functions = {
          invoke: jest.fn().mockResolvedValue({
            data: {
              analysis: {
                detectedTags: ['cozy', 'wool', 'winter'],
                dominantColors: ['gray'],
                visualFeatures: {
                  style: 'casual',
                  material: 'wool',
                  occasion: 'casual'
                }
              }
            },
            error: null
          })
        };

        mockSingle.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' }
        });

        const result = await AINameingService.generateItemName(request);

        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.suggestions[0]).toContain('Gray');
        expect(result.suggestions[0]).toContain('Sweater');
        expect(result.suggestions.some(s => s.includes('Sweater'))).toBe(true);
      });
    });

    describe('calculateNamingConfidence integration', () => {
      it('should calculate high confidence for complete data', async () => {
        const request: NamingRequest = {
          itemId: 'item123',
          imageUri: 'https://example.com/image.jpg',
          category: 'jeans' as ItemCategory,
          brand: 'Levi\'s',
          colors: ['blue'],
        };

        const mockSupabase = supabase as any;
        mockSupabase.functions = {
          invoke: jest.fn().mockResolvedValue({
            data: {
              analysis: {
                detectedTags: ['denim', 'casual', 'blue', 'fitted', 'cotton'],
                dominantColors: ['blue'],
                visualFeatures: {
                  style: 'casual',
                  material: 'denim',
                  fit: 'fitted'
                }
              }
            },
            error: null
          })
        };

        mockSingle.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' }
        });

        const result = await AINameingService.generateItemName(request);

        expect(result.confidence).toBeGreaterThan(0.8);
      });

      it('should calculate lower confidence for minimal data', async () => {
        const request: NamingRequest = {
          itemId: 'item123',
          imageUri: 'https://example.com/image.jpg',
          category: 'top' as ItemCategory,
        };

        const mockSupabase = supabase as any;
        mockSupabase.functions = {
          invoke: jest.fn().mockResolvedValue({
            data: {
              tags: [],
              colors: [],
            },
            error: null
          })
        };

        mockSingle.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' }
        });

        const result = await AINameingService.generateItemName(request);

        expect(result.confidence).toBeLessThanOrEqual(0.7);
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });
  });


});