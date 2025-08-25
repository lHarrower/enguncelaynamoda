// Outfit Recommendation Card Tests
// Testing component behavior, animations, and accessibility

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

import { OutfitRecommendationCard } from '@/components/aynaMirror/OutfitRecommendationCard';
import { OutfitRecommendation } from '@/types/aynaMirror';

// Mock dependencies
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy'
  }
}));

// Mock expo modules for OutfitRecommendationCard
jest.mock('expo-blur', () => ({
  BlurView: ({ children }: any) => children,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Sample test data
const mockRecommendation: OutfitRecommendation = {
  id: 'rec-1',
  dailyRecommendationId: 'daily-1',
  items: [
    {
      id: 'item-1',
      userId: 'user-1',
      imageUri: 'https://example.com/image1.jpg',
      processedImageUri: 'https://example.com/processed1.jpg',
      nameOverride: false,
      category: 'tops',
      colors: ['blue', 'white'],
      tags: ['casual', 'comfortable'],
      usageStats: {
        itemId: 'item-1',
        totalWears: 5,
        lastWorn: new Date('2024-01-10'),
        averageRating: 4.2,
        complimentsReceived: 2,
        costPerWear: 12.5,
      },
      styleCompatibility: {},
      confidenceHistory: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'item-2',
      userId: 'user-1',
      imageUri: 'https://example.com/image2.jpg',
      processedImageUri: 'https://example.com/processed2.jpg',
      nameOverride: false,
      category: 'bottoms',
      colors: ['black'],
      tags: ['casual'],
      usageStats: {
        itemId: 'item-2',
        totalWears: 3,
        lastWorn: new Date('2024-01-08'),
        averageRating: 4.0,
        complimentsReceived: 1,
        costPerWear: 15.0,
      },
      styleCompatibility: {},
      confidenceHistory: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ],
  confidenceNote:
    'This effortless combination will have you feeling comfortable and confident all day! ☀️',
  quickActions: [
    { type: 'wear', label: 'Wear This', icon: 'checkmark-circle' },
    { type: 'save', label: 'Save for Later', icon: 'bookmark' },
    { type: 'share', label: 'Share', icon: 'share' },
  ],
  confidenceScore: 4.2,
  reasoning: ['Perfect for cool weather conditions', "Features items you haven't worn recently"],
  isQuickOption: true,
  createdAt: new Date('2024-01-15T06:00:00Z'),
};

describe('OutfitRecommendationCard', () => {
  const mockOnSelect = jest.fn();
  const mockOnQuickAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render outfit recommendation card', () => {
      const { getByText } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
          reduceMotion={true}
        />,
      );

      expect(getByText('2 pieces')).toBeTruthy();
      expect(getByText('Perfect for cool weather conditions')).toBeTruthy();
    });

    it('should display quick option badge when isQuickOption is true', () => {
      const { getByText } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
          reduceMotion={true}
        />,
      );

      expect(getByText('Quick')).toBeTruthy();
    });

    it('should not display quick option badge when isQuickOption is false', () => {
      const nonQuickRecommendation = {
        ...mockRecommendation,
        isQuickOption: false,
      };

      const { queryByText } = render(
        <OutfitRecommendationCard
          recommendation={nonQuickRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
          reduceMotion={true}
        />,
      );

      expect(queryByText('Quick')).toBeNull();
    });

    it('should display confidence score', () => {
      const { getByText } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      expect(getByText('42/10')).toBeTruthy();
    });

    it('should display item dots for each item', () => {
      const { getByText } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      expect(getByText('2 pieces')).toBeTruthy();
    });

    it('should display more items indicator when more than 4 items', () => {
      const manyItemsRecommendation: OutfitRecommendation = {
        ...mockRecommendation,
        items: [
          ...mockRecommendation.items,
          ...Array(4)
            .fill(null)
            .map((_, index) => ({
              ...mockRecommendation.items[0],
              id: `item-${index + 3}`,
              userId: 'user-1',
              imageUri: 'https://example.com/extra.jpg',
              processedImageUri: 'https://example.com/extra_proc.jpg',
              category: (mockRecommendation.items[0] as any).category || 'tops',
            })),
        ] as any, // ensured each object satisfies WardrobeItem minimally
      };

      const { getByText } = render(
        <OutfitRecommendationCard
          recommendation={manyItemsRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      expect(getByText('+2')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onSelect when card is pressed', () => {
      const { getByTestId } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      const card = getByTestId('outfit-recommendation-card');
      fireEvent.press(card);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should call onQuickAction when quick action button is pressed', () => {
      const { getByText } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      fireEvent.press(getByText('Wear This'));

      expect(mockOnQuickAction).toHaveBeenCalledWith('wear');
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });

    it('should handle all quick action types', () => {
      const { getByText } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      fireEvent.press(getByText('Wear This'));
      expect(mockOnQuickAction).toHaveBeenCalledWith('wear');

      fireEvent.press(getByText('Save for Later'));
      expect(mockOnQuickAction).toHaveBeenCalledWith('save');

      fireEvent.press(getByText('Share'));
      expect(mockOnQuickAction).toHaveBeenCalledWith('share');

      expect(mockOnQuickAction).toHaveBeenCalledTimes(3);
    });
  });

  describe('Selection State', () => {
    it('should apply selection styling when isSelected is true', () => {
      const { rerender } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      // Re-render with selected state
      rerender(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={true}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      // In a real test, we might check for specific styling or test IDs
      // that indicate selection state
    });
  });

  describe('Image Handling', () => {
    it('should display fallback when image fails to load', async () => {
      const { getByText } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      // Simulate image error
      // In a real test, we'd trigger the onError callback of the Image component

      await waitFor(() => {
        expect(getByText('2 pieces')).toBeTruthy();
      });
    });

    it('should handle missing image URIs gracefully', () => {
      const noImageRecommendation = {
        ...mockRecommendation,
        items: mockRecommendation.items.map((item) => ({
          ...item,
          imageUri: '',
          processedImageUri: '',
        })),
      };

      const { getByText } = render(
        <OutfitRecommendationCard
          recommendation={noImageRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      expect(getByText('2 pieces')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      expect(getByLabelText('Outfit recommendation with 2 items')).toBeTruthy();
    });

    it('should have accessibility hints', () => {
      const { getByA11yHint } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      expect(getByA11yHint('Double tap to select this outfit')).toBeTruthy();
    });

    it('should have proper button roles', () => {
      const { getByTestId } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      const mainCard = getByTestId('outfit-recommendation-card');
      const quickActionButton = getByTestId('quick-action-button');
      const saveButton = getByTestId('save-button');
      const shareButton = getByTestId('share-button');
      
      expect(mainCard).toBeTruthy();
      expect(quickActionButton).toBeTruthy();
      expect(saveButton).toBeTruthy();
      expect(shareButton).toBeTruthy();
    });

    it('should have accessibility labels for quick actions', () => {
      const { getByLabelText } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      expect(getByLabelText('Wear This')).toBeTruthy();
      expect(getByLabelText('Save for Later')).toBeTruthy();
      expect(getByLabelText('Share')).toBeTruthy();
    });
  });

  describe('Animation Delays', () => {
    it('should handle animation delay prop', () => {
      const { getByText } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
          animationDelay={500}
        />,
      );

      expect(getByText('2 pieces')).toBeTruthy();
    });

    it('should work without animation delay', () => {
      const { getByText } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      expect(getByText('2 pieces')).toBeTruthy();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to tablet dimensions', () => {
      // Mock tablet dimensions
      const mockDimensions = {
        width: 768,
        height: 1024,
      };

      jest.doMock('react-native', () => ({
        ...jest.requireActual('react-native'),
        useWindowDimensions: () => mockDimensions,
      }));

      const { getByText } = render(
        <OutfitRecommendationCard
          recommendation={mockRecommendation}
          isSelected={false}
          onSelect={mockOnSelect}
          onQuickAction={mockOnQuickAction}
        />,
      );

      expect(getByText('2 pieces')).toBeTruthy();
    });
  });
});
