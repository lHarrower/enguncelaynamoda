// Feedback Collection System Tests
// Tests for the feedback collection components and data validation

import { OutfitFeedback, EmotionalResponse, SocialFeedback, ComfortRating, EmotionalState } from '@/types/aynaMirror';

describe('Feedback Collection System', () => {
  
  describe('OutfitFeedback Data Structure', () => {
    it('should have all required properties for feedback collection', () => {
      const mockFeedback: OutfitFeedback = {
        id: 'feedback-123',
        userId: 'user-456',
        outfitRecommendationId: 'outfit-789',
        confidenceRating: 4,
        emotionalResponse: {
          primary: 'confident',
          intensity: 8,
          additionalEmotions: ['stylish', 'comfortable'],
        },
        socialFeedback: {
          complimentsReceived: 2,
          positiveReactions: ['Compliments', 'Smiles'],
          socialContext: 'Work meeting',
        },
        occasion: 'Work',
        comfort: {
          physical: 4,
          emotional: 5,
          confidence: 4,
        },
        timestamp: new Date(),
      };

      expect(mockFeedback.id).toBeDefined();
      expect(mockFeedback.userId).toBeDefined();
      expect(mockFeedback.outfitRecommendationId).toBeDefined();
      expect(mockFeedback.confidenceRating).toBeGreaterThan(0);
      expect(mockFeedback.confidenceRating).toBeLessThanOrEqual(5);
      expect(mockFeedback.emotionalResponse).toBeDefined();
      expect(mockFeedback.comfort).toBeDefined();
      expect(mockFeedback.timestamp).toBeInstanceOf(Date);
    });

    it('should validate confidence rating range', () => {
      const validRatings = [1, 2, 3, 4, 5];
      const invalidRatings = [0, 6, -1, 10];

      validRatings.forEach(rating => {
        expect(rating).toBeGreaterThanOrEqual(1);
        expect(rating).toBeLessThanOrEqual(5);
      });

      invalidRatings.forEach(rating => {
        expect(rating < 1 || rating > 5).toBeTruthy();
      });
    });
  });

  describe('EmotionalResponse Data Structure', () => {
    it('should have valid emotional states', () => {
      const validEmotions: EmotionalState[] = [
        'confident', 'comfortable', 'stylish', 'powerful', 'creative', 'elegant', 'playful'
      ];

      const mockResponse: EmotionalResponse = {
        primary: 'confident',
        intensity: 7,
        additionalEmotions: ['stylish'],
      };

      expect(validEmotions).toContain(mockResponse.primary);
      expect(mockResponse.intensity).toBeGreaterThan(0);
      expect(mockResponse.intensity).toBeLessThanOrEqual(10);
      expect(Array.isArray(mockResponse.additionalEmotions)).toBeTruthy();
    });

    it('should validate intensity range', () => {
      const validIntensities = [1, 5, 10];
      const invalidIntensities = [0, 11, -1];

      validIntensities.forEach(intensity => {
        expect(intensity).toBeGreaterThanOrEqual(1);
        expect(intensity).toBeLessThanOrEqual(10);
      });

      invalidIntensities.forEach(intensity => {
        expect(intensity < 1 || intensity > 10).toBeTruthy();
      });
    });
  });

  describe('ComfortRating Data Structure', () => {
    it('should have all comfort dimensions', () => {
      const mockComfort: ComfortRating = {
        physical: 4,
        emotional: 5,
        confidence: 3,
      };

      expect(mockComfort.physical).toBeDefined();
      expect(mockComfort.emotional).toBeDefined();
      expect(mockComfort.confidence).toBeDefined();

      // All ratings should be in valid range
      Object.values(mockComfort).forEach(rating => {
        expect(rating).toBeGreaterThanOrEqual(0);
        expect(rating).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('SocialFeedback Data Structure', () => {
    it('should handle social feedback data correctly', () => {
      const mockSocialFeedback: SocialFeedback = {
        complimentsReceived: 3,
        positiveReactions: ['Compliments', 'Double-takes', 'Smiles'],
        socialContext: 'Dinner with friends',
      };

      expect(mockSocialFeedback.complimentsReceived).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(mockSocialFeedback.positiveReactions)).toBeTruthy();
      expect(typeof mockSocialFeedback.socialContext).toBe('string');
    });

    it('should handle optional social feedback', () => {
      const feedbackWithoutSocial: OutfitFeedback = {
        id: 'feedback-123',
        userId: 'user-456',
        outfitRecommendationId: 'outfit-789',
        confidenceRating: 4,
        emotionalResponse: {
          primary: 'confident',
          intensity: 8,
          additionalEmotions: [],
        },
        comfort: {
          physical: 4,
          emotional: 5,
          confidence: 4,
        },
        timestamp: new Date(),
      };

      expect(feedbackWithoutSocial.socialFeedback).toBeUndefined();
      expect(feedbackWithoutSocial.occasion).toBeUndefined();
    });
  });

  describe('Feedback Validation Logic', () => {
    it('should validate complete feedback object', () => {
      const isValidFeedback = (feedback: OutfitFeedback): boolean => {
        return (
          feedback.id !== undefined &&
          feedback.userId !== undefined &&
          feedback.outfitRecommendationId !== undefined &&
          feedback.confidenceRating >= 1 &&
          feedback.confidenceRating <= 5 &&
          feedback.emotionalResponse !== undefined &&
          feedback.comfort !== undefined &&
          feedback.timestamp instanceof Date
        );
      };

      const validFeedback: OutfitFeedback = {
        id: 'feedback-123',
        userId: 'user-456',
        outfitRecommendationId: 'outfit-789',
        confidenceRating: 4,
        emotionalResponse: {
          primary: 'confident',
          intensity: 8,
          additionalEmotions: [],
        },
        comfort: {
          physical: 4,
          emotional: 5,
          confidence: 4,
        },
        timestamp: new Date(),
      };

      expect(isValidFeedback(validFeedback)).toBeTruthy();
    });

    it('should handle feedback data storage format', () => {
      const feedback: OutfitFeedback = {
        id: 'feedback-123',
        userId: 'user-456',
        outfitRecommendationId: 'outfit-789',
        confidenceRating: 4,
        emotionalResponse: {
          primary: 'confident',
          intensity: 8,
          additionalEmotions: ['stylish'],
        },
        comfort: {
          physical: 4,
          emotional: 5,
          confidence: 4,
        },
        timestamp: new Date(),
      };

      // Test serialization/deserialization
      const serialized = JSON.stringify(feedback);
      const deserialized = JSON.parse(serialized);
      
      expect(deserialized.id).toBe(feedback.id);
      expect(deserialized.confidenceRating).toBe(feedback.confidenceRating);
      expect(deserialized.emotionalResponse.primary).toBe(feedback.emotionalResponse.primary);
    });
  });

  describe('Feedback Component Props Validation', () => {
    it('should validate FeedbackCollector props structure', () => {
      interface FeedbackCollectorProps {
        outfitId: string;
        userId: string;
        onFeedbackSubmit: (feedback: OutfitFeedback) => Promise<void>;
        onClose: () => void;
        visible: boolean;
      }

      const mockProps: FeedbackCollectorProps = {
        outfitId: 'outfit-123',
        userId: 'user-456',
        onFeedbackSubmit: jest.fn().mockResolvedValue(undefined),
        onClose: jest.fn(),
        visible: true,
      };

      expect(typeof mockProps.outfitId).toBe('string');
      expect(typeof mockProps.userId).toBe('string');
      expect(typeof mockProps.onFeedbackSubmit).toBe('function');
      expect(typeof mockProps.onClose).toBe('function');
      expect(typeof mockProps.visible).toBe('boolean');
    });
  });
});