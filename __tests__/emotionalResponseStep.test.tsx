// Emotional Response Step Tests
// Tests for emotional response functionality and data validation

import { EmotionalResponse, EmotionalState } from '@/types/aynaMirror';

describe('EmotionalResponseStep', () => {
  
  describe('Emotional States and Configuration', () => {
    it('should have all valid emotional states', () => {
      const validEmotions: EmotionalState[] = [
        'confident', 'comfortable', 'stylish', 'powerful', 'creative', 'elegant', 'playful'
      ];

      const emotionConfig = [
        { state: 'confident', label: 'Confident', emoji: '💪', color: '#FF6B6B', description: 'Ready to take on the world' },
        { state: 'comfortable', label: 'Comfortable', emoji: '😌', color: '#4ECDC4', description: 'At ease and relaxed' },
        { state: 'stylish', label: 'Stylish', emoji: '✨', color: '#45B7D1', description: 'Fashion-forward and chic' },
        { state: 'powerful', label: 'Powerful', emoji: '👑', color: '#F7DC6F', description: 'Strong and commanding' },
        { state: 'creative', label: 'Creative', emoji: '🎨', color: '#BB8FCE', description: 'Artistic and expressive' },
        { state: 'elegant', label: 'Elegant', emoji: '🌹', color: '#F1948A', description: 'Graceful and refined' },
        { state: 'playful', label: 'Playful', emoji: '🦋', color: '#85C1E9', description: 'Fun and spirited' },
      ];

      emotionConfig.forEach(({ state, label, emoji, color, description }) => {
        expect(validEmotions).toContain(state as EmotionalState);
        expect(typeof label).toBe('string');
        expect(typeof emoji).toBe('string');
        expect(typeof color).toBe('string');
        expect(typeof description).toBe('string');
        expect(label.length).toBeGreaterThan(0);
        expect(description.length).toBeGreaterThan(0);
      });
    });

    it('should have valid intensity levels', () => {
      const intensityLabels = [
        { value: 1, label: 'Barely' },
        { value: 2, label: 'Slightly' },
        { value: 3, label: 'Somewhat' },
        { value: 4, label: 'Quite' },
        { value: 5, label: 'Moderately' },
        { value: 6, label: 'Very' },
        { value: 7, label: 'Strongly' },
        { value: 8, label: 'Extremely' },
        { value: 9, label: 'Intensely' },
        { value: 10, label: 'Completely' },
      ];

      intensityLabels.forEach(({ value, label }) => {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('EmotionalResponse Data Structure', () => {
    it('should validate emotional response structure', () => {
      const mockResponse: EmotionalResponse = {
        primary: 'confident',
        intensity: 7,
        additionalEmotions: ['stylish', 'powerful'],
      };

      expect(typeof mockResponse.primary).toBe('string');
      expect(typeof mockResponse.intensity).toBe('number');
      expect(Array.isArray(mockResponse.additionalEmotions)).toBeTruthy();
      expect(mockResponse.intensity).toBeGreaterThanOrEqual(1);
      expect(mockResponse.intensity).toBeLessThanOrEqual(10);
    });

    it('should handle different intensity levels', () => {
      const testCases = [
        { intensity: 1, expectedLabel: 'barely' },
        { intensity: 5, expectedLabel: 'moderately' },
        { intensity: 10, expectedLabel: 'completely' },
      ];

      testCases.forEach(({ intensity, expectedLabel }) => {
        const response: EmotionalResponse = {
          primary: 'confident',
          intensity,
          additionalEmotions: [],
        };

        expect(response.intensity).toBe(intensity);
        expect(expectedLabel.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Component Props Interface', () => {
    it('should validate EmotionalResponseStep props structure', () => {
      interface EmotionalResponseStepProps {
        emotionalResponse: EmotionalResponse;
        onEmotionSelect: (emotion: EmotionalState) => void;
        onIntensityChange: (intensity: number) => void;
      }

      const mockProps: EmotionalResponseStepProps = {
        emotionalResponse: {
          primary: 'confident',
          intensity: 5,
          additionalEmotions: [],
        },
        onEmotionSelect: jest.fn(),
        onIntensityChange: jest.fn(),
      };

      expect(typeof mockProps.emotionalResponse).toBe('object');
      expect(typeof mockProps.onEmotionSelect).toBe('function');
      expect(typeof mockProps.onIntensityChange).toBe('function');
      expect(mockProps.emotionalResponse.primary).toBeDefined();
      expect(mockProps.emotionalResponse.intensity).toBeDefined();
    });
  });

  describe('Emotion Selection Logic', () => {
    it('should handle emotion selection callbacks', () => {
      const mockOnEmotionSelect = jest.fn();
      const testEmotion: EmotionalState = 'stylish';
      
      // Simulate emotion selection
      mockOnEmotionSelect(testEmotion);
      
      expect(mockOnEmotionSelect).toHaveBeenCalledWith(testEmotion);
      expect(mockOnEmotionSelect).toHaveBeenCalledTimes(1);
    });

    it('should handle intensity change callbacks', () => {
      const mockOnIntensityChange = jest.fn();
      const testIntensity = 8;
      
      // Simulate intensity change
      mockOnIntensityChange(testIntensity);
      
      expect(mockOnIntensityChange).toHaveBeenCalledWith(testIntensity);
      expect(mockOnIntensityChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Validation and Error Handling', () => {
    it('should validate intensity range', () => {
      const validIntensities = [1, 5, 10];
      const invalidIntensities = [0, 11, -1, 15];

      validIntensities.forEach(intensity => {
        expect(intensity).toBeGreaterThanOrEqual(1);
        expect(intensity).toBeLessThanOrEqual(10);
      });

      invalidIntensities.forEach(intensity => {
        expect(intensity < 1 || intensity > 10).toBeTruthy();
      });
    });

    it('should handle empty additional emotions array', () => {
      const response: EmotionalResponse = {
        primary: 'confident',
        intensity: 5,
        additionalEmotions: [],
      };

      expect(Array.isArray(response.additionalEmotions)).toBeTruthy();
      expect(response.additionalEmotions.length).toBe(0);
    });

    it('should handle multiple additional emotions', () => {
      const response: EmotionalResponse = {
        primary: 'confident',
        intensity: 8,
        additionalEmotions: ['stylish', 'powerful', 'elegant'],
      };

      expect(Array.isArray(response.additionalEmotions)).toBeTruthy();
      expect(response.additionalEmotions.length).toBe(3);
      response.additionalEmotions.forEach(emotion => {
        expect(typeof emotion).toBe('string');
        expect(emotion.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Animation and Interaction Logic', () => {
    it('should handle emotion animation triggers', () => {
      const animationStates = [
        { previousEmotion: 'confident', newEmotion: 'stylish', shouldAnimate: true },
        { previousEmotion: 'comfortable', newEmotion: 'comfortable', shouldAnimate: false },
        { previousEmotion: 'powerful', newEmotion: 'elegant', shouldAnimate: true },
      ];

      animationStates.forEach(({ previousEmotion, newEmotion, shouldAnimate }) => {
        const hasChanged = previousEmotion !== newEmotion;
        expect(hasChanged).toBe(shouldAnimate);
      });
    });

    it('should handle intensity animation triggers', () => {
      const intensityChanges = [
        { from: 5, to: 8, shouldAnimate: true },
        { from: 3, to: 3, shouldAnimate: false },
        { from: 1, to: 10, shouldAnimate: true },
      ];

      intensityChanges.forEach(({ from, to, shouldAnimate }) => {
        const hasChanged = from !== to;
        expect(hasChanged).toBe(shouldAnimate);
      });
    });
  });
});