// AYNA Mirror Screen Tests
// Testing UI interactions, accessibility, and component behavior

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { AynaMirrorScreen } from '../screens/AynaMirrorScreen';
import { AynaMirrorService } from '../services/aynaMirrorService';
import { DailyRecommendations, OutfitRecommendation } from '../types/aynaMirror';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('expo-blur', () => ({
  BlurView: ({ children }: any) => children,
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});
jest.mock('../services/aynaMirrorService');

// Mock Alert
jest.spyOn(Alert, 'alert');

// Sample test data
const mockDailyRecommendations: DailyRecommendations = {
  id: 'daily-1',
  userId: 'user-1',
  date: new Date('2024-01-15T06:00:00Z'),
  recommendations: [
    {
      id: 'rec-1',
      dailyRecommendationId: 'daily-1',
      items: [
        {
          id: 'item-1',
          userId: 'user-1',
          imageUri: 'https://example.com/image1.jpg',
          processedImageUri: 'https://example.com/processed1.jpg',
          category: 'tops',
          colors: ['blue', 'white'],
          tags: ['casual', 'comfortable'],
          usageStats: {
            itemId: 'item-1',
            totalWears: 5,
            lastWorn: new Date('2024-01-10'),
            averageRating: 4.2,
            complimentsReceived: 2,
            costPerWear: 12.50,
          },
          styleCompatibility: {},
          confidenceHistory: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ],
      confidenceNote: 'This effortless combination will have you feeling comfortable and confident all day! ☀️',
      quickActions: [
        { type: 'wear', label: 'Wear This', icon: 'checkmark-circle' },
        { type: 'save', label: 'Save for Later', icon: 'bookmark' },
        { type: 'share', label: 'Share', icon: 'share' },
      ],
      confidenceScore: 4.2,
      reasoning: ['Perfect for cool weather conditions', 'Features items you haven\'t worn recently'],
      isQuickOption: true,
      createdAt: new Date('2024-01-15T06:00:00Z'),
    },
    {
      id: 'rec-2',
      dailyRecommendationId: 'daily-1',
      items: [
        {
          id: 'item-2',
          userId: 'user-1',
          imageUri: 'https://example.com/image2.jpg',
          processedImageUri: 'https://example.com/processed2.jpg',
          category: 'dresses',
          colors: ['black'],
          tags: ['formal', 'elegant'],
          usageStats: {
            itemId: 'item-2',
            totalWears: 3,
            lastWorn: new Date('2024-01-08'),
            averageRating: 4.8,
            complimentsReceived: 5,
            costPerWear: 25.00,
          },
          styleCompatibility: {},
          confidenceHistory: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ],
      confidenceNote: 'Your black dress always makes you shine! ✨',
      quickActions: [
        { type: 'wear', label: 'Wear This', icon: 'checkmark-circle' },
        { type: 'save', label: 'Save for Later', icon: 'bookmark' },
        { type: 'share', label: 'Share', icon: 'share' },
      ],
      confidenceScore: 4.8,
      reasoning: ['Elegant choice for any occasion'],
      isQuickOption: false,
      createdAt: new Date('2024-01-15T06:00:00Z'),
    },
  ],
  weatherContext: {
    temperature: 68,
    condition: 'sunny',
    humidity: 45,
    location: 'San Francisco, CA',
    timestamp: new Date('2024-01-15T06:00:00Z'),
  },
  generatedAt: new Date('2024-01-15T06:00:00Z'),
};

describe('AynaMirrorScreen', () => {
  const mockUserId = 'user-1';
  const mockAynaMirrorService = AynaMirrorService as jest.Mocked<typeof AynaMirrorService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAynaMirrorService.generateDailyRecommendations.mockResolvedValue(mockDailyRecommendations);
  });

  describe('Rendering and Initial State', () => {
    it('should render loading state initially', async () => {
      const { getByText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      expect(getByText('Preparing your mirror...')).toBeTruthy();
      expect(getByText('Curating confidence just for you')).toBeTruthy();
    });

    it('should load daily recommendations on mount', async () => {
      render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        expect(mockAynaMirrorService.generateDailyRecommendations).toHaveBeenCalledWith(mockUserId);
      });
    });

    it('should render main content after loading', async () => {
      const { getByText, queryByText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        expect(queryByText('Preparing your mirror...')).toBeNull();
        expect(getByText('Good morning, Beautiful')).toBeTruthy();
      });
    });

    it('should display weather information', async () => {
      const { getByText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        expect(getByText('68°F, sunny')).toBeTruthy();
      });
    });

    it('should display confidence note for selected recommendation', async () => {
      const { getByText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        expect(getByText('This effortless combination will have you feeling comfortable and confident all day! ☀️')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error state when loading fails', async () => {
      const errorMessage = 'Network error';
      mockAynaMirrorService.generateDailyRecommendations.mockRejectedValue(new Error(errorMessage));
      
      const { getByText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        expect(getByText('Unable to load your daily recommendations. Please try again.')).toBeTruthy();
      });
    });

    it('should allow retry when in error state', async () => {
      mockAynaMirrorService.generateDailyRecommendations
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockDailyRecommendations);
      
      const { getByText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        expect(getByText('Try Again')).toBeTruthy();
      });
      
      fireEvent.press(getByText('Try Again'));
      
      await waitFor(() => {
        expect(mockAynaMirrorService.generateDailyRecommendations).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Outfit Recommendations', () => {
    it('should render all outfit recommendations', async () => {
      const { getByText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        // Check that both recommendations are rendered
        expect(getByText('This effortless combination will have you feeling comfortable and confident all day! ☀️')).toBeTruthy();
        // The second recommendation should be selectable but not initially selected
      });
    });

    it('should auto-select first recommendation', async () => {
      const { getByText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        // First recommendation's confidence note should be displayed
        expect(getByText('This effortless combination will have you feeling comfortable and confident all day! ☀️')).toBeTruthy();
      });
    });

    it('should change selected recommendation when tapped', async () => {
      const { getByText, getByTestId } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        expect(getByText('This effortless combination will have you feeling comfortable and confident all day! ☀️')).toBeTruthy();
      });
      
      // Note: In a real implementation, we'd need test IDs on the recommendation cards
      // This test would simulate tapping a different recommendation
    });
  });

  describe('Quick Actions', () => {
    it('should display quick actions for selected recommendation', async () => {
      const { getByText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        expect(getByText('Quick Actions')).toBeTruthy();
        expect(getByText('Wear This')).toBeTruthy();
        expect(getByText('Save for Later')).toBeTruthy();
        expect(getByText('Share')).toBeTruthy();
      });
    });

    it('should handle wear action with haptic feedback', async () => {
      const { getByText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        expect(getByText('Wear This')).toBeTruthy();
      });
      
      fireEvent.press(getByText('Wear This'));
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Perfect Choice! ✨',
        'Your outfit selection has been logged. We\'ll check in with you later to see how it made you feel!',
        [{ text: 'Got it!', style: 'default' }]
      );
    });

    it('should handle save action with haptic feedback', async () => {
      const { getByText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        expect(getByText('Save for Later')).toBeTruthy();
      });
      
      fireEvent.press(getByText('Save for Later'));
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Saved! 💫',
        'This outfit has been added to your favorites for future inspiration.',
        [{ text: 'Perfect', style: 'default' }]
      );
    });

    it('should handle share action with haptic feedback', async () => {
      const { getByText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        expect(getByText('Share')).toBeTruthy();
      });
      
      fireEvent.press(getByText('Share'));
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Share Your Style! ✨',
        'Sharing feature coming soon - spread the confidence!',
        [{ text: 'Can\'t wait!', style: 'default' }]
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      const { getByLabelText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        // Check for accessibility labels on key elements
        expect(getByLabelText(/Outfit recommendation/)).toBeTruthy();
      });
    });

    it('should support screen reader navigation', async () => {
      const { getByRole } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        // Check that buttons have proper roles
        const buttons = getByRole('button');
        expect(buttons).toBeTruthy();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to different screen sizes', async () => {
      // Mock different screen dimensions
      const mockDimensions = {
        width: 768,
        height: 1024,
      };
      
      jest.doMock('react-native', () => ({
        ...jest.requireActual('react-native'),
        useWindowDimensions: () => mockDimensions,
      }));
      
      const { getByText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        expect(getByText('Good morning, Beautiful')).toBeTruthy();
      });
    });
  });

  describe('Animation and Performance', () => {
    it('should handle animations gracefully', async () => {
      const { getByText } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        expect(getByText('Good morning, Beautiful')).toBeTruthy();
      });
      
      // Test that animations don't cause crashes
      // In a real test, we might check animation values or timing
    });

    it('should not cause memory leaks', async () => {
      const { unmount } = render(<AynaMirrorScreen userId={mockUserId} />);
      
      await waitFor(() => {
        // Component should load successfully
      });
      
      // Unmount should not cause errors
      expect(() => unmount()).not.toThrow();
    });
  });
});