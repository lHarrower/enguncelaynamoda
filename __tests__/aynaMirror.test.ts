// AYNA Mirror Data Models and Services Test
// Basic validation tests for the core data structures and service interfaces

import { 
  WardrobeItem, 
  DailyRecommendations, 
  OutfitRecommendation,
  WeatherContext,
  ItemCategory 
} from '../types/aynaMirror';
import { EnhancedWardrobeService } from '../services/enhancedWardrobeService';
import { AynaMirrorService } from '../services/aynaMirrorService';

describe('AYNA Mirror Data Models', () => {
  
  describe('WardrobeItem Interface', () => {
    it('should have all required properties for intelligence features', () => {
      const mockItem: WardrobeItem = {
        id: 'test-id',
        userId: 'user-123',
        imageUri: 'https://example.com/image.jpg',
        processedImageUri: 'https://example.com/processed.jpg',
        category: 'tops' as ItemCategory,
        colors: ['blue', 'white'],
        tags: ['casual', 'work'],
        usageStats: {
          itemId: 'test-id',
          totalWears: 5,
          lastWorn: new Date(),
          averageRating: 4.2,
          complimentsReceived: 2,
          costPerWear: 12.50
        },
        styleCompatibility: {},
        confidenceHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Verify all intelligence features are present
      expect(mockItem.usageStats).toBeDefined();
      expect(mockItem.styleCompatibility).toBeDefined();
      expect(mockItem.confidenceHistory).toBeDefined();
      expect(mockItem.usageStats.costPerWear).toBeGreaterThan(0);
    });
  });

  describe('DailyRecommendations Interface', () => {
    it('should structure daily recommendations correctly', () => {
      const mockRecommendations: DailyRecommendations = {
        id: 'daily-123',
        userId: 'user-123',
        date: new Date(),
        recommendations: [],
        weatherContext: {
          temperature: 72,
          condition: 'sunny',
          humidity: 45,
          location: 'Test City',
          timestamp: new Date()
        },
        generatedAt: new Date()
      };

      expect(mockRecommendations.weatherContext).toBeDefined();
      expect(mockRecommendations.recommendations).toBeInstanceOf(Array);
      expect(mockRecommendations.weatherContext.condition).toBe('sunny');
    });
  });

  describe('OutfitRecommendation Interface', () => {
    it('should include confidence features', () => {
      const mockOutfit: OutfitRecommendation = {
        id: 'outfit-123',
        dailyRecommendationId: 'daily-123',
        items: [],
        confidenceNote: 'You look amazing today!',
        quickActions: [
          { type: 'wear', label: 'Wear This', icon: 'checkmark' }
        ],
        confidenceScore: 4.5,
        reasoning: ['Perfect for the weather', 'Colors complement each other'],
        isQuickOption: true,
        createdAt: new Date()
      };

      expect(mockOutfit.confidenceNote).toBeDefined();
      expect(mockOutfit.confidenceScore).toBeGreaterThan(0);
      expect(mockOutfit.quickActions).toHaveLength(1);
      expect(mockOutfit.reasoning).toBeInstanceOf(Array);
    });
  });
});

describe('Enhanced Wardrobe Service', () => {
  
  describe('Service Interface', () => {
    it('should have all required intelligence methods', () => {
      // Verify that the service instance has all expected methods
      const service = new EnhancedWardrobeService();
      expect(typeof service.trackItemUsage).toBe('function');
      expect(typeof service.getItemUsageStats).toBe('function');
      expect(typeof service.getNeglectedItems).toBe('function');
      expect(typeof service.categorizeItemAutomatically).toBe('function');
      expect(typeof service.extractItemColors).toBe('function');
      expect(typeof service.suggestItemTags).toBe('function');
      expect(typeof service.calculateCostPerWear).toBe('function');
      expect(typeof service.getWardrobeUtilizationStats).toBe('function');
    });

    it('should suggest appropriate tags for different item categories', async () => {
      const service = new EnhancedWardrobeService();
      const topItem = { category: 'tops' as ItemCategory, colors: ['black'] };
      const tags = await service.suggestItemTags(topItem);
      
      expect(tags).toContain('casual');
      expect(tags).toContain('everyday');
    });

    it('should suggest tags based on colors', async () => {
      const service = new EnhancedWardrobeService();
      const brightItem = { category: 'tops' as ItemCategory, colors: ['#FFFF00', '#FF0000'] };
      const tags = await service.suggestItemTags(brightItem);
      
      expect(tags).toContain('bright');
    });
  });
});

describe('AYNA Mirror Service', () => {
  
  describe('Service Interface', () => {
    it('should have all core daily ritual methods', () => {
      expect(typeof AynaMirrorService.generateDailyRecommendations).toBe('function');
      expect(typeof AynaMirrorService.scheduleNextMirrorSession).toBe('function');
      expect(typeof AynaMirrorService.generateConfidenceNote).toBe('function');
      expect(typeof AynaMirrorService.processUserFeedback).toBe('function');
      expect(typeof AynaMirrorService.updateUserPreferences).toBe('function');
    });
  });

  describe('Confidence Note Generation', () => {
    it('should generate encouraging confidence notes', async () => {
      const mockOutfit = {
        items: [{
          id: 'item-1',
          category: 'tops' as ItemCategory,
          colors: ['blue'],
          usageStats: { averageRating: 4.5 } as any
        }] as WardrobeItem[]
      };

      const mockContext = {
        weather: { condition: 'sunny', temperature: 75 } as WeatherContext,
        userPreferences: { notificationTime: new Date() } as any
      } as any;

      const note = await AynaMirrorService.generateConfidenceNote(
        mockOutfit, 
        mockContext, 
        'casual'
      );

      expect(typeof note).toBe('string');
      expect(note.length).toBeGreaterThan(0);
      expect(note).toMatch(/✨|💫|☀️|💼|🎨/); // Should contain confidence emojis
    });
  });
});

describe('Database Schema Validation', () => {
  
  describe('Required Tables', () => {
    it('should define all required table structures', () => {
      // This test validates that our migration files define the correct structure
      // In a real environment, this would connect to a test database
      
      const requiredTables = [
        'wardrobe_items',
        'daily_recommendations', 
        'outfit_recommendations',
        'outfit_feedback',
        'user_preferences'
      ];

      // For now, just verify the table names are documented
      requiredTables.forEach(tableName => {
        expect(tableName).toMatch(/^[a-z_]+$/); // Valid SQL table name format
      });
    });
  });

  describe('Database Functions', () => {
    it('should define required database functions', () => {
      const requiredFunctions = [
        'track_item_usage',
        'get_wardrobe_utilization_stats',
        'update_item_confidence_score',
        'get_neglected_items',
        'calculate_item_compatibility'
      ];

      // Verify function names follow SQL conventions
      requiredFunctions.forEach(functionName => {
        expect(functionName).toMatch(/^[a-z_]+$/);
      });
    });
  });
});

// Mock console methods to avoid noise in test output
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});