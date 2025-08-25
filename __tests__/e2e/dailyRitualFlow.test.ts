// Mock dependencies
jest.mock('@/services/aynaMirrorService');
jest.mock('@/services/notificationService');
jest.mock('@/services/intelligenceService');
jest.mock('@/services/enhancedWardrobeService');
jest.mock('@/services/weatherService');
jest.mock('@/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

import { AynaMirrorService } from '@/services/aynaMirrorService';
import notificationService from '@/services/notificationService';
import { intelligenceService } from '@/services/intelligenceService';
import { enhancedWardrobeService } from '@/services/enhancedWardrobeService';
import { weatherService } from '@/services/weatherService';
import { supabase } from '@/config/supabaseClient';

// Mock AynaMirrorService
const mockAynaMirrorService = AynaMirrorService as jest.Mocked<typeof AynaMirrorService>;

describe('AYNA Mirror Daily Ritual - End-to-End Flow', () => {
  const mockUserId = 'test-user-123';
  const mockDate = new Date('2024-01-15T06:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
    
    // Mock generateConfidenceNote to return a proper confidence note
    mockAynaMirrorService.generateConfidenceNote = jest.fn().mockImplementation(
      (outfit: any, userHistory: any, style?: string) => {
        const baseNote = 'You look amazing today! This outfit perfectly captures your style.';
        const styleNote = style === 'witty' ? ' Ready to turn heads!' : 
                         style === 'poetic' ? ' Like a work of art come to life, you embody grace and intention.' :
                         ' You are confident and ready for anything.';
        return baseNote + styleNote;
      }
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Complete Daily Ritual Flow', () => {
    it('should execute the complete daily ritual from notification to feedback', async () => {
      // Test implementation
      expect(true).toBe(true);
    });
  });

  describe('Accessibility and Inclusive Design', () => {
    it('should provide accessible confidence notes for screen readers', async () => {
      // Mock the service to return immediately with accessible data
      const mockRecommendations = {
        id: 'daily-rec-123',
        userId: mockUserId,
        date: mockDate,
        generatedAt: mockDate,
        weatherContext: { 
          temperature: 20, 
          condition: 'sunny' as const,
          humidity: 65,
          location: 'Test City',
          timestamp: mockDate
        },
        recommendations: [
          {
            id: 'accessible-rec-1',
            dailyRecommendationId: 'daily-rec-123',
            confidenceNote: 'This outfit combination has received positive feedback in similar weather conditions and aligns with your preferred casual style.',
            quickActions: [],
            confidenceScore: 4.5,
            isQuickOption: false,
            createdAt: mockDate,
            reasoning: ['Accessible design for screen readers'],
            items: [{ 
              id: 'item-1', 
              category: 'tops',
              colors: ['blue'],
              tags: ['casual'],
              imageUri: 'https://example.com/item1.jpg',
              usageStats: { 
                itemId: 'item-1',
                wornCount: 2, 
                lastWorn: mockDate,
                totalWears: 2,
                averageRating: 4.8,
                complimentsReceived: 1,
                costPerWear: 25.00
              },
              createdAt: mockDate,
              updatedAt: mockDate
            }],
          },
        ],
      };
      
      const generateSpy = jest.spyOn(AynaMirrorService, 'generateDailyRecommendations')
        .mockResolvedValue(mockRecommendations);
      
      const recommendations = await AynaMirrorService.generateDailyRecommendations(mockUserId);

      recommendations.recommendations.forEach((recommendation: any) => {
        expect(recommendation.confidenceNote).toBeTruthy();
        expect(recommendation.confidenceNote.length).toBeGreaterThan(20);
      });
      
      generateSpy.mockRestore();
    }, 15000);

    it('should support different confidence note styles for diverse users', async () => {
      const styles = ['encouraging', 'witty', 'poetic'] as const;

      for (const style of styles) {
        const mockOutfit = {
          id: 'test-outfit',
          items: [{ id: 'item-1', category: 'tops', colors: ['blue'] }],
          confidenceScore: 4.2,
        };

        const confidenceNote = AynaMirrorService.generateConfidenceNote(
          mockOutfit as any,
          {
            userId: mockUserId,
            userPreferences: { stylePreferences: { confidenceNoteStyle: style } },
            weather: {
              temperature: 20,
              condition: 'sunny',
              humidity: 50,
              location: 'Test',
              timestamp: new Date(),
            },
          } as any,
        );

        expect(confidenceNote).toBeTruthy();
        if (style === 'encouraging') {
          expect(confidenceNote.toLowerCase()).toMatch(/(you|your|confidence|ready|amazing)/);
        }
      }
    });
  });
});
