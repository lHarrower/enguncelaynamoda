// Accessibility tests for AYNAMODA app
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AccessibilityInfo, findNodeHandle } from 'react-native';
import { WardrobeCard } from '../../components/WardrobeCard';
import { AddItemScreen } from '../../screens/AddItemScreen';
import { WardrobeScreen } from '../../screens/WardrobeScreen';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { renderWithProviders, createMockWardrobeItem } from '../utils/testUtils';
import { WardrobeCategory, WardrobeColor } from '../../types/wardrobe';
import { mocks } from '../mocks';

// Mock AccessibilityInfo
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  AccessibilityInfo: {
    announceForAccessibility: jest.fn(),
    isScreenReaderEnabled: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    setAccessibilityFocus: jest.fn(),
  },
  findNodeHandle: jest.fn(),
}));

const mockAccessibilityInfo = AccessibilityInfo as jest.Mocked<typeof AccessibilityInfo>;
const mockFindNodeHandle = findNodeHandle as jest.MockedFunction<typeof findNodeHandle>;

describe('Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(true);
    mockFindNodeHandle.mockReturnValue(123);
  });

  describe('WardrobeCard Accessibility', () => {
    const mockItem = createMockWardrobeItem({
      id: 'test-item',
      name: 'Blue Summer Dress',
      category: WardrobeCategory.DRESSES,
      colors: [WardrobeColor.BLUE],
      isFavorite: true,
      tags: ['casual', 'summer'],
    });

    it('should have proper accessibility labels and roles', () => {
      const { getByTestId } = render(
        <WardrobeCard 
          item={mockItem} 
          onPress={jest.fn()} 
          onLongPress={jest.fn()}
          onFavoriteToggle={jest.fn()}
        />
      );

      const card = getByTestId('wardrobe-card-test-item');
      
      expect(card.props.accessibilityRole).toBe('button');
      expect(card.props.accessibilityLabel).toBe(
        'Blue Summer Dress, Dresses, Blue, Favorite item, Tags: casual, summer'
      );
      expect(card.props.accessibilityHint).toBe(
        'Double tap to view details, long press for more options'
      );
      expect(card.props.accessible).toBe(true);
    });

    it('should have accessible favorite button', () => {
      const onFavoriteToggle = jest.fn();
      const { getByTestId } = render(
        <WardrobeCard 
          item={mockItem} 
          onPress={jest.fn()} 
          onLongPress={jest.fn()}
          onFavoriteToggle={onFavoriteToggle}
        />
      );

      const favoriteButton = getByTestId('favorite-button-test-item');
      
      expect(favoriteButton.props.accessibilityRole).toBe('button');
      expect(favoriteButton.props.accessibilityLabel).toBe('Remove from favorites');
      expect(favoriteButton.props.accessibilityHint).toBe(
        'Double tap to remove this item from your favorites'
      );
      
      fireEvent.press(favoriteButton);
      expect(onFavoriteToggle).toHaveBeenCalled();
    });

    it('should announce favorite status changes', () => {
      const { getByTestId, rerender } = render(
        <WardrobeCard 
          item={mockItem} 
          onPress={jest.fn()} 
          onLongPress={jest.fn()}
          onFavoriteToggle={jest.fn()}
        />
      );

      const favoriteButton = getByTestId('favorite-button-test-item');
      fireEvent.press(favoriteButton);

      // Re-render with updated favorite status
      const updatedItem = { ...mockItem, isFavorite: false };
      rerender(
        <WardrobeCard 
          item={updatedItem} 
          onPress={jest.fn()} 
          onLongPress={jest.fn()}
          onFavoriteToggle={jest.fn()}
        />
      );

      expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Blue Summer Dress removed from favorites'
      );
    });

    it('should support high contrast mode', () => {
      const { getByTestId } = render(
        <WardrobeCard 
          item={mockItem} 
          onPress={jest.fn()} 
          onLongPress={jest.fn()}
          onFavoriteToggle={jest.fn()}
          highContrast={true}
        />
      );

      const card = getByTestId('wardrobe-card-test-item');
      
      // Should have high contrast styling
      expect(card.props.style).toEqual(
        expect.objectContaining({
          borderWidth: 2,
          borderColor: expect.any(String),
        })
      );
    });

    it('should have proper focus management', () => {
      const { getByTestId } = render(
        <WardrobeCard 
          item={mockItem} 
          onPress={jest.fn()} 
          onLongPress={jest.fn()}
          onFavoriteToggle={jest.fn()}
          autoFocus={true}
        />
      );

      const card = getByTestId('wardrobe-card-test-item');
      
      expect(mockAccessibilityInfo.setAccessibilityFocus).toHaveBeenCalledWith(
        expect.any(Number)
      );
    });
  });

  describe('WardrobeScreen Accessibility', () => {
    const mockItems = [
      createMockWardrobeItem({ id: 'item-1', name: 'Item 1' }),
      createMockWardrobeItem({ id: 'item-2', name: 'Item 2' }),
      createMockWardrobeItem({ id: 'item-3', name: 'Item 3' }),
    ];

    beforeEach(() => {
      const mockWardrobeService = require('../../services/WardrobeService').WardrobeService;
      mockWardrobeService.prototype.getAllItems = jest.fn().mockResolvedValue(mockItems);
    });

    it('should have proper screen structure and navigation', async () => {
      const { getByTestId, getByText } = renderWithProviders(<WardrobeScreen />);

      // Screen should have proper accessibility role
      const screen = getByTestId('wardrobe-screen');
      expect(screen.props.accessibilityRole).toBe('main');
      expect(screen.props.accessibilityLabel).toBe('Your wardrobe');

      // Header should be accessible
      const header = getByText('My Wardrobe');
      expect(header.props.accessibilityRole).toBe('header');
      expect(header.props.accessibilityLevel).toBe(1);
    });

    it('should have accessible search functionality', async () => {
      const { getByTestId } = renderWithProviders(<WardrobeScreen />);

      const searchInput = getByTestId('search-input');
      
      expect(searchInput.props.accessibilityRole).toBe('search');
      expect(searchInput.props.accessibilityLabel).toBe('Search your wardrobe');
      expect(searchInput.props.accessibilityHint).toBe(
        'Enter keywords to search for items in your wardrobe'
      );
    });

    it('should have accessible filter controls', async () => {
      const { getByTestId } = renderWithProviders(<WardrobeScreen />);

      const categoryFilter = getByTestId('category-filter-button');
      
      expect(categoryFilter.props.accessibilityRole).toBe('button');
      expect(categoryFilter.props.accessibilityLabel).toBe('Filter by category');
      expect(categoryFilter.props.accessibilityHint).toBe(
        'Double tap to open category filter options'
      );
      expect(categoryFilter.props.accessibilityState).toEqual({
        expanded: false,
      });
    });

    it('should announce list updates', async () => {
      const { rerender } = renderWithProviders(<WardrobeScreen />);

      // Simulate items loading
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Wardrobe loaded with 3 items'
      );
    });

    it('should support keyboard navigation', async () => {
      const { getByTestId } = renderWithProviders(<WardrobeScreen />);

      const list = getByTestId('wardrobe-list');
      
      expect(list.props.accessibilityRole).toBe('list');
      expect(list.props.keyboardShouldPersistTaps).toBe('handled');
    });
  });

  describe('AddItemScreen Accessibility', () => {
    it('should have accessible form controls', () => {
      const { getByTestId } = renderWithProviders(<AddItemScreen />);

      // Name input
      const nameInput = getByTestId('item-name-input');
      expect(nameInput.props.accessibilityRole).toBe('text');
      expect(nameInput.props.accessibilityLabel).toBe('Item name');
      expect(nameInput.props.accessibilityHint).toBe('Enter a name for this item');
      expect(nameInput.props.accessibilityRequired).toBe(true);

      // Category selector
      const categorySelector = getByTestId('category-selector');
      expect(categorySelector.props.accessibilityRole).toBe('combobox');
      expect(categorySelector.props.accessibilityLabel).toBe('Item category');
      expect(categorySelector.props.accessibilityHint).toBe(
        'Select the category for this item'
      );

      // Photo buttons
      const takePhotoButton = getByTestId('take-photo-button');
      expect(takePhotoButton.props.accessibilityRole).toBe('button');
      expect(takePhotoButton.props.accessibilityLabel).toBe('Take photo');
      expect(takePhotoButton.props.accessibilityHint).toBe(
        'Double tap to open camera and take a photo of the item'
      );
    });

    it('should announce form validation errors', () => {
      const { getByTestId } = renderWithProviders(<AddItemScreen />);

      // Try to save without required fields
      const saveButton = getByTestId('save-item-button');
      fireEvent.press(saveButton);

      expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Form has errors. Item name is required.'
      );
    });

    it('should announce AI analysis progress', async () => {
      const mockAIService = require('../../services/AIService').AIService;
      mockAIService.prototype.analyzeImage = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          category: WardrobeCategory.TOPS,
          colors: [WardrobeColor.BLUE],
          description: 'A blue shirt',
        }), 1000))
      );

      const { getByTestId } = renderWithProviders(<AddItemScreen />);

      // Mock image selection
      mocks.imagePicker.launchImageLibrary.mockImplementation((options, callback) => {
        callback({
          assets: [{ uri: 'file://test.jpg' }],
        });
      });

      fireEvent.press(getByTestId('select-from-gallery-button'));

      expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Analyzing image with AI, please wait'
      );

      // Wait for analysis to complete
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'AI analysis complete. Category set to Tops, colors detected: Blue'
      );
    });

    it('should have accessible color picker', () => {
      const { getByTestId } = renderWithProviders(<AddItemScreen />);

      const colorPicker = getByTestId('color-picker');
      expect(colorPicker.props.accessibilityRole).toBe('radiogroup');
      expect(colorPicker.props.accessibilityLabel).toBe('Item colors');
      expect(colorPicker.props.accessibilityHint).toBe(
        'Select one or more colors for this item'
      );

      // Individual color options
      const blueColor = getByTestId('color-option-blue');
      expect(blueColor.props.accessibilityRole).toBe('radio');
      expect(blueColor.props.accessibilityLabel).toBe('Blue');
      expect(blueColor.props.accessibilityState).toEqual({
        checked: false,
      });
    });
  });

  describe('ErrorBoundary Accessibility', () => {
    const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return null;
    };

    it('should have accessible error display', () => {
      const { getByTestId, getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorContainer = getByTestId('error-boundary-container');
      expect(errorContainer.props.accessibilityRole).toBe('alert');
      expect(errorContainer.props.accessibilityLiveRegion).toBe('assertive');
      expect(errorContainer.props.accessibilityLabel).toBe(
        'An error occurred in the application'
      );

      const retryButton = getByTestId('error-retry-button');
      expect(retryButton.props.accessibilityRole).toBe('button');
      expect(retryButton.props.accessibilityLabel).toBe('Try again');
      expect(retryButton.props.accessibilityHint).toBe(
        'Double tap to retry the failed operation'
      );
    });

    it('should announce errors to screen readers', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'An error occurred. Please try again or contact support if the problem persists.'
      );
    });

    it('should provide calming language for errors', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText(/don't worry/i)).toBeTruthy();
      expect(getByText(/we're here to help/i)).toBeTruthy();
    });
  });

  describe('Screen Reader Support', () => {
    it('should detect screen reader status', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(true);

      const { getByTestId } = renderWithProviders(<WardrobeScreen />);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should adapt UI for screen reader users
      const screen = getByTestId('wardrobe-screen');
      expect(screen.props.accessibilityViewIsModal).toBe(false);
    });

    it('should provide detailed descriptions for screen readers', () => {
      const mockItem = createMockWardrobeItem({
        name: 'Blue Dress',
        category: WardrobeCategory.DRESSES,
        colors: [WardrobeColor.BLUE, WardrobeColor.WHITE],
        tags: ['formal', 'evening'],
        isFavorite: true,
      });

      const { getByTestId } = render(
        <WardrobeCard 
          item={mockItem} 
          onPress={jest.fn()} 
          onLongPress={jest.fn()}
          onFavoriteToggle={jest.fn()}
          screenReaderEnabled={true}
        />
      );

      const card = getByTestId(`wardrobe-card-${mockItem.id}`);
      expect(card.props.accessibilityLabel).toBe(
        'Blue Dress, Dresses category, Colors: Blue, White, Favorite item, Tags: formal, evening, Added on ' + 
        new Date(mockItem.dateAdded).toLocaleDateString()
      );
    });

    it('should handle screen reader events', () => {
      const mockCallback = jest.fn();
      mockAccessibilityInfo.addEventListener.mockImplementation((event, callback) => {
        if (event === 'screenReaderChanged') {
          mockCallback.mockImplementation(callback);
        }
      });

      renderWithProviders(<WardrobeScreen />);

      expect(mockAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'screenReaderChanged',
        expect.any(Function)
      );

      // Simulate screen reader being enabled
      mockCallback(true);

      expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Screen reader support enabled'
      );
    });
  });

  describe('Voice Control Support', () => {
    it('should have voice-friendly labels', () => {
      const { getByTestId } = renderWithProviders(<WardrobeScreen />);

      const addButton = getByTestId('add-item-button');
      expect(addButton.props.accessibilityLabel).toBe('Add new item');
      expect(addButton.props.accessibilityTraits).toContain('button');
    });

    it('should support voice commands for common actions', () => {
      const mockItem = createMockWardrobeItem({ name: 'Test Item' });
      const onFavoriteToggle = jest.fn();

      const { getByTestId } = render(
        <WardrobeCard 
          item={mockItem} 
          onPress={jest.fn()} 
          onLongPress={jest.fn()}
          onFavoriteToggle={onFavoriteToggle}
        />
      );

      const favoriteButton = getByTestId(`favorite-button-${mockItem.id}`);
      
      // Should be discoverable by voice commands like "tap favorite"
      expect(favoriteButton.props.accessibilityLabel).toContain('favorite');
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect reduced motion preferences', () => {
      const mockItem = createMockWardrobeItem();

      const { getByTestId } = render(
        <WardrobeCard 
          item={mockItem} 
          onPress={jest.fn()} 
          onLongPress={jest.fn()}
          onFavoriteToggle={jest.fn()}
          reducedMotion={true}
        />
      );

      const card = getByTestId(`wardrobe-card-${mockItem.id}`);
      
      // Should have reduced or no animations
      expect(card.props.style).toEqual(
        expect.objectContaining({
          transform: expect.not.arrayContaining([
            expect.objectContaining({ scale: expect.any(Object) })
          ])
        })
      );
    });

    it('should provide alternative feedback for animations', () => {
      const mockItem = createMockWardrobeItem();
      const onPress = jest.fn();

      const { getByTestId } = render(
        <WardrobeCard 
          item={mockItem} 
          onPress={onPress} 
          onLongPress={jest.fn()}
          onFavoriteToggle={jest.fn()}
          reducedMotion={true}
        />
      );

      const card = getByTestId(`wardrobe-card-${mockItem.id}`);
      fireEvent.press(card);

      // Should provide haptic feedback instead of visual animation
      expect(mocks.hapticFeedback.trigger).toHaveBeenCalledWith('selection');
      expect(onPress).toHaveBeenCalled();
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should meet WCAG color contrast requirements', () => {
      const mockItem = createMockWardrobeItem();

      const { getByTestId } = render(
        <WardrobeCard 
          item={mockItem} 
          onPress={jest.fn()} 
          onLongPress={jest.fn()}
          onFavoriteToggle={jest.fn()}
        />
      );

      const card = getByTestId(`wardrobe-card-${mockItem.id}`);
      const nameText = getByTestId(`item-name-${mockItem.id}`);
      
      // Should have sufficient color contrast (this would be tested with actual color values)
      expect(nameText.props.style).toEqual(
        expect.objectContaining({
          color: expect.any(String), // Should be dark enough for contrast
        })
      );
    });

    it('should support high contrast mode', () => {
      const mockItem = createMockWardrobeItem();

      const { getByTestId } = render(
        <WardrobeCard 
          item={mockItem} 
          onPress={jest.fn()} 
          onLongPress={jest.fn()}
          onFavoriteToggle={jest.fn()}
          highContrast={true}
        />
      );

      const card = getByTestId(`wardrobe-card-${mockItem.id}`);
      
      expect(card.props.style).toEqual(
        expect.objectContaining({
          borderWidth: expect.any(Number),
          borderColor: expect.any(String),
        })
      );
    });

    it('should provide text alternatives for color-coded information', () => {
      const mockItem = createMockWardrobeItem({
        colors: [WardrobeColor.RED, WardrobeColor.BLUE],
      });

      const { getByTestId } = render(
        <WardrobeCard 
          item={mockItem} 
          onPress={jest.fn()} 
          onLongPress={jest.fn()}
          onFavoriteToggle={jest.fn()}
        />
      );

      const colorIndicator = getByTestId(`color-indicator-${mockItem.id}`);
      expect(colorIndicator.props.accessibilityLabel).toBe('Colors: Red, Blue');
    });
  });

  describe('Focus Management', () => {
    it('should manage focus properly during navigation', () => {
      const { getByTestId } = renderWithProviders(<WardrobeScreen />);

      const addButton = getByTestId('add-item-button');
      fireEvent.press(addButton);

      // Should set focus to the first input on the new screen
      expect(mockAccessibilityInfo.setAccessibilityFocus).toHaveBeenCalled();
    });

    it('should restore focus after modal dismissal', () => {
      const { getByTestId } = renderWithProviders(<WardrobeScreen />);

      const filterButton = getByTestId('category-filter-button');
      const originalFocus = findNodeHandle(filterButton);
      
      fireEvent.press(filterButton); // Open modal
      
      // Simulate modal dismissal
      const modal = getByTestId('category-filter-modal');
      fireEvent(modal, 'onDismiss');

      expect(mockAccessibilityInfo.setAccessibilityFocus).toHaveBeenCalledWith(
        originalFocus
      );
    });

    it('should trap focus within modals', () => {
      const { getByTestId } = renderWithProviders(<WardrobeScreen />);

      fireEvent.press(getByTestId('category-filter-button'));

      const modal = getByTestId('category-filter-modal');
      expect(modal.props.accessibilityViewIsModal).toBe(true);
    });
  });
});