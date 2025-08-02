// Unit tests for WardrobeCard component
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { WardrobeCard } from '../../components/wardrobe/WardrobeCard';
import { createMockWardrobeItem, renderWithProviders } from '../utils/testUtils';
import { WardrobeCategory, WardrobeColor } from '../../types/wardrobe';
import { mocks } from '../mocks';

// Mock dependencies
jest.mock('react-native-haptic-feedback', () => mocks.hapticFeedback);
jest.mock('react-native-reanimated', () => mocks.reanimated);

describe('WardrobeCard', () => {
  const mockItem = createMockWardrobeItem({
    name: 'Blue Summer Dress',
    category: WardrobeCategory.DRESSES,
    colors: [WardrobeColor.BLUE],
    isFavorite: false,
  });

  const defaultProps = {
    item: mockItem,
    onPress: jest.fn(),
    onLongPress: jest.fn(),
    onFavoriteToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render item information correctly', () => {
      const { getByText, getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      expect(getByText('Blue Summer Dress')).toBeTruthy();
      expect(getByText('Dresses')).toBeTruthy();
      expect(getByTestId('wardrobe-card-image')).toBeTruthy();
    });

    it('should display favorite status correctly', () => {
      const favoriteItem = { ...mockItem, isFavorite: true };
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} item={favoriteItem} />
      );

      const favoriteIcon = getByTestId('favorite-icon');
      expect(favoriteIcon.props.name).toBe('heart');
    });

    it('should display non-favorite status correctly', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      const favoriteIcon = getByTestId('favorite-icon');
      expect(favoriteIcon.props.name).toBe('heart-outline');
    });

    it('should display color indicators', () => {
      const multiColorItem = {
        ...mockItem,
        colors: [WardrobeColor.BLUE, WardrobeColor.WHITE, WardrobeColor.BLACK],
      };
      
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} item={multiColorItem} />
      );

      expect(getByTestId('color-indicators')).toBeTruthy();
    });

    it('should display tags when present', () => {
      const taggedItem = {
        ...mockItem,
        tags: ['casual', 'summer', 'comfortable'],
      };
      
      const { getByText } = renderWithProviders(
        <WardrobeCard {...defaultProps} item={taggedItem} />
      );

      expect(getByText('casual')).toBeTruthy();
      expect(getByText('summer')).toBeTruthy();
    });

    it('should show archived indicator when item is archived', () => {
      const archivedItem = { ...mockItem, isArchived: true };
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} item={archivedItem} />
      );

      expect(getByTestId('archived-indicator')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onPress when card is pressed', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      fireEvent.press(getByTestId('wardrobe-card'));
      expect(defaultProps.onPress).toHaveBeenCalledWith(mockItem);
    });

    it('should call onLongPress when card is long pressed', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      fireEvent(getByTestId('wardrobe-card'), 'onLongPress');
      expect(defaultProps.onLongPress).toHaveBeenCalledWith(mockItem);
    });

    it('should toggle favorite when favorite button is pressed', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      fireEvent.press(getByTestId('favorite-button'));
      expect(defaultProps.onFavoriteToggle).toHaveBeenCalledWith(mockItem.id, true);
    });

    it('should call onEdit when edit button is pressed', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} showActions={true} />
      );

      fireEvent.press(getByTestId('edit-button'));
      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockItem);
    });

    it('should call onDelete when delete button is pressed', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} showActions={true} />
      );

      fireEvent.press(getByTestId('delete-button'));
      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockItem.id);
    });
  });

  describe('haptic feedback', () => {
    it('should trigger haptic feedback on press', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      fireEvent.press(getByTestId('wardrobe-card'));
      expect(mocks.hapticFeedback.trigger).toHaveBeenCalledWith('selection');
    });

    it('should trigger haptic feedback on favorite toggle', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      fireEvent.press(getByTestId('favorite-button'));
      expect(mocks.hapticFeedback.trigger).toHaveBeenCalledWith('impactLight');
    });

    it('should trigger haptic feedback on long press', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      fireEvent(getByTestId('wardrobe-card'), 'onLongPress');
      expect(mocks.hapticFeedback.trigger).toHaveBeenCalledWith('impactMedium');
    });
  });

  describe('animations', () => {
    it('should animate on mount', async () => {
      renderWithProviders(<WardrobeCard {...defaultProps} />);

      await waitFor(() => {
        expect(mocks.reanimated.withTiming).toHaveBeenCalled();
      });
    });

    it('should animate on press', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      fireEvent.pressIn(getByTestId('wardrobe-card'));
      expect(mocks.reanimated.withSpring).toHaveBeenCalledWith(0.95);

      fireEvent.pressOut(getByTestId('wardrobe-card'));
      expect(mocks.reanimated.withSpring).toHaveBeenCalledWith(1);
    });

    it('should animate favorite toggle', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      fireEvent.press(getByTestId('favorite-button'));
      expect(mocks.reanimated.withSpring).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      const card = getByTestId('wardrobe-card');
      expect(card.props.accessibilityLabel).toBe('Blue Summer Dress, Dresses');
      expect(card.props.accessibilityRole).toBe('button');
    });

    it('should have accessibility hint for actions', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      const card = getByTestId('wardrobe-card');
      expect(card.props.accessibilityHint).toBe('Double tap to view details, long press for options');
    });

    it('should announce favorite status to screen readers', () => {
      const favoriteItem = { ...mockItem, isFavorite: true };
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} item={favoriteItem} />
      );

      const favoriteButton = getByTestId('favorite-button');
      expect(favoriteButton.props.accessibilityLabel).toBe('Remove from favorites');
    });

    it('should support accessibility actions', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      const card = getByTestId('wardrobe-card');
      expect(card.props.accessibilityActions).toEqual([
        { name: 'activate', label: 'View details' },
        { name: 'longpress', label: 'Show options' },
        { name: 'magicTap', label: 'Toggle favorite' },
      ]);
    });
  });

  describe('error handling', () => {
    it('should handle missing image gracefully', () => {
      const itemWithoutImage = { ...mockItem, imageUri: '' };
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} item={itemWithoutImage} />
      );

      expect(getByTestId('placeholder-image')).toBeTruthy();
    });

    it('should handle image load errors', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      const image = getByTestId('wardrobe-card-image');
      fireEvent(image, 'onError');
      
      expect(getByTestId('placeholder-image')).toBeTruthy();
    });

    it('should handle missing item data gracefully', () => {
      const incompleteItem = {
        id: 'test-id',
        name: 'Test Item',
        // Missing other required fields
      } as any;

      const { getByText } = renderWithProviders(
        <WardrobeCard {...defaultProps} item={incompleteItem} />
      );

      expect(getByText('Test Item')).toBeTruthy();
    });
  });

  describe('performance', () => {
    it('should memoize expensive calculations', () => {
      const { rerender } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      // Re-render with same props
      rerender(<WardrobeCard {...defaultProps} />);

      // Component should not re-render unnecessarily
      expect(mocks.reanimated.useSharedValue).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid interactions gracefully', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} />
      );

      const card = getByTestId('wardrobe-card');
      
      // Rapid fire events
      for (let i = 0; i < 10; i++) {
        fireEvent.press(card);
      }

      // Should only call onPress once due to throttling
      expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('different card variants', () => {
    it('should render compact variant correctly', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} variant="compact" />
      );

      const card = getByTestId('wardrobe-card');
      expect(card.props.style).toMatchObject({
        height: expect.any(Number),
      });
    });

    it('should render detailed variant correctly', () => {
      const { getByText } = renderWithProviders(
        <WardrobeCard {...defaultProps} variant="detailed" />
      );

      expect(getByText(mockItem.brand || 'Unknown Brand')).toBeTruthy();
      expect(getByText(mockItem.size || 'Unknown Size')).toBeTruthy();
    });

    it('should render grid variant correctly', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} variant="grid" />
      );

      const card = getByTestId('wardrobe-card');
      expect(card.props.style).toMatchObject({
        aspectRatio: 1,
      });
    });
  });

  describe('selection mode', () => {
    it('should show selection indicator when in selection mode', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} selectionMode={true} isSelected={false} />
      );

      expect(getByTestId('selection-indicator')).toBeTruthy();
    });

    it('should show selected state correctly', () => {
      const { getByTestId } = renderWithProviders(
        <WardrobeCard {...defaultProps} selectionMode={true} isSelected={true} />
      );

      const indicator = getByTestId('selection-indicator');
      expect(indicator.props.style).toMatchObject({
        backgroundColor: expect.any(String),
      });
    });

    it('should call onSelectionToggle when selection indicator is pressed', () => {
      const onSelectionToggle = jest.fn();
      const { getByTestId } = renderWithProviders(
        <WardrobeCard 
          {...defaultProps} 
          selectionMode={true} 
          isSelected={false}
          onSelectionToggle={onSelectionToggle}
        />
      );

      fireEvent.press(getByTestId('selection-indicator'));
      expect(onSelectionToggle).toHaveBeenCalledWith(mockItem.id, true);
    });
  });
});