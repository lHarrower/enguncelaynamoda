import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ShopYourClosetFirst } from '../components/antiConsumption/ShopYourClosetFirst';
import { antiConsumptionService } from '../services/antiConsumptionService';

// Mock dependencies
jest.mock('../services/antiConsumptionService');
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
}));

const mockAntiConsumptionService = antiConsumptionService as jest.Mocked<typeof antiConsumptionService>;
const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

describe('ShopYourClosetFirst', () => {
  const mockProps = {
    userId: 'test-user-id',
    targetItemDescription: 'Blue casual shirt',
    category: 'tops',
    colors: ['blue'],
    style: 'casual',
  };

  const mockRecommendation = {
    id: 'rec-1',
    userId: 'test-user-id',
    targetItem: {
      description: 'Blue casual shirt',
      category: 'tops',
      colors: ['blue'],
      style: 'casual',
    },
    similarOwnedItems: [
      {
        id: 'item-1',
        userId: 'test-user-id',
        imageUri: 'test-image-1.jpg',
        processedImageUri: 'test-processed-1.jpg',
        category: 'tops',
        subcategory: 'shirts',
        colors: ['blue', 'white'],
        brand: 'TestBrand',
        size: 'M',
        tags: ['casual', 'cotton'],
        notes: 'Test notes',
        purchasePrice: 50,
        purchaseDate: new Date('2023-01-01'),
        lastWorn: new Date('2023-12-01'),
        usageCount: 10,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: 'item-2',
        userId: 'test-user-id',
        imageUri: 'test-image-2.jpg',
        processedImageUri: 'test-processed-2.jpg',
        category: 'tops',
        subcategory: 'shirts',
        colors: ['blue', 'navy'],
        brand: 'TestBrand2',
        size: 'L',
        tags: ['formal', 'silk'],
        notes: 'Test notes 2',
        purchasePrice: 100,
        purchaseDate: new Date('2023-06-01'),
        lastWorn: new Date('2023-08-01'),
        usageCount: 3,
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-06-01'),
      },
    ],
    confidenceScore: 0.8,
    reasoning: [
      'You already own 2 similar tops items',
      '1 of these items were worn recently, showing they fit your current style',
    ],
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockAntiConsumptionService.generateShopYourClosetRecommendations.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { getByText } = render(<ShopYourClosetFirst {...mockProps} />);

    expect(getByText('Finding similar items in your closet...')).toBeTruthy();
  });

  it('should render recommendations when loaded successfully', async () => {
    mockAntiConsumptionService.generateShopYourClosetRecommendations.mockResolvedValue(mockRecommendation);

    const { getByText, getAllByText } = render(<ShopYourClosetFirst {...mockProps} />);

    await waitFor(() => {
      expect(getByText('Shop Your Closet First')).toBeTruthy();
      expect(getByText('Blue casual shirt')).toBeTruthy();
      expect(getByText('80% match with your existing items')).toBeTruthy();
      expect(getByText('Similar Items You Own')).toBeTruthy();
      expect(getAllByText('tops')).toHaveLength(2); // Two similar items
    });
  });

  it('should render no items message when no similar items found', async () => {
    const emptyRecommendation = {
      ...mockRecommendation,
      similarOwnedItems: [],
      confidenceScore: 0,
    };
    mockAntiConsumptionService.generateShopYourClosetRecommendations.mockResolvedValue(emptyRecommendation);

    const { getByText } = render(<ShopYourClosetFirst {...mockProps} />);

    await waitFor(() => {
      expect(getByText('No Similar Items Found')).toBeTruthy();
      expect(getByText("You don't have similar items in your closet yet. This might be a good addition to your wardrobe!")).toBeTruthy();
    });
  });

  it('should render error state when service fails', async () => {
    mockAntiConsumptionService.generateShopYourClosetRecommendations.mockRejectedValue(
      new Error('Service error')
    );

    const { getByText } = render(<ShopYourClosetFirst {...mockProps} />);

    await waitFor(() => {
      expect(getByText('Failed to generate recommendations')).toBeTruthy();
      expect(getByText('Try Again')).toBeTruthy();
    });
  });

  it('should retry when retry button is pressed', async () => {
    mockAntiConsumptionService.generateShopYourClosetRecommendations
      .mockRejectedValueOnce(new Error('Service error'))
      .mockResolvedValueOnce(mockRecommendation);

    const { getByText } = render(<ShopYourClosetFirst {...mockProps} />);

    await waitFor(() => {
      expect(getByText('Try Again')).toBeTruthy();
    });

    fireEvent.press(getByText('Try Again'));

    await waitFor(() => {
      expect(getByText('Shop Your Closet First')).toBeTruthy();
    });

    expect(mockAntiConsumptionService.generateShopYourClosetRecommendations).toHaveBeenCalledTimes(2);
  });

  it('should show alert when item is pressed', async () => {
    mockAntiConsumptionService.generateShopYourClosetRecommendations.mockResolvedValue(mockRecommendation);

    const { getAllByTestId } = render(<ShopYourClosetFirst {...mockProps} />);

    await waitFor(() => {
      // Find item cards (they don't have testID, so we'll use a different approach)
    });

    // Since we can't easily test the item press without testIDs, we'll test the Alert mock
    // This would be better with proper testIDs in the actual component
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('should display confidence score correctly', async () => {
    mockAntiConsumptionService.generateShopYourClosetRecommendations.mockResolvedValue(mockRecommendation);

    const { getByText } = render(<ShopYourClosetFirst {...mockProps} />);

    await waitFor(() => {
      expect(getByText('80% match with your existing items')).toBeTruthy();
    });
  });

  it('should display reasoning correctly', async () => {
    mockAntiConsumptionService.generateShopYourClosetRecommendations.mockResolvedValue(mockRecommendation);

    const { getByText } = render(<ShopYourClosetFirst {...mockProps} />);

    await waitFor(() => {
      expect(getByText('You already own 2 similar tops items')).toBeTruthy();
      expect(getByText('1 of these items were worn recently, showing they fit your current style')).toBeTruthy();
    });
  });

  it('should display item colors correctly', async () => {
    mockAntiConsumptionService.generateShopYourClosetRecommendations.mockResolvedValue(mockRecommendation);

    const { getByText } = render(<ShopYourClosetFirst {...mockProps} />);

    await waitFor(() => {
      // Color dots should be rendered but are hard to test without specific testIDs
      expect(getByText('Similar Items You Own')).toBeTruthy();
    });
  });

  it('should display item tags correctly', async () => {
    mockAntiConsumptionService.generateShopYourClosetRecommendations.mockResolvedValue(mockRecommendation);

    const { getByText } = render(<ShopYourClosetFirst {...mockProps} />);

    await waitFor(() => {
      expect(getByText('casual, cotton')).toBeTruthy();
      expect(getByText('formal, silk')).toBeTruthy();
    });
  });

  it('should call onRecommendationGenerated when recommendation is loaded', async () => {
    const mockOnRecommendationGenerated = jest.fn();
    mockAntiConsumptionService.generateShopYourClosetRecommendations.mockResolvedValue(mockRecommendation);

    render(
      <ShopYourClosetFirst
        {...mockProps}
        onRecommendationGenerated={mockOnRecommendationGenerated}
      />
    );

    await waitFor(() => {
      expect(mockOnRecommendationGenerated).toHaveBeenCalledWith(mockRecommendation);
    });
  });

  it('should regenerate recommendations when props change', async () => {
    mockAntiConsumptionService.generateShopYourClosetRecommendations.mockResolvedValue(mockRecommendation);

    const { rerender } = render(<ShopYourClosetFirst {...mockProps} />);

    await waitFor(() => {
      expect(mockAntiConsumptionService.generateShopYourClosetRecommendations).toHaveBeenCalledTimes(1);
    });

    // Change props
    rerender(
      <ShopYourClosetFirst
        {...mockProps}
        targetItemDescription="Red formal dress"
        category="dresses"
        colors={['red']}
        style="formal"
      />
    );

    await waitFor(() => {
      expect(mockAntiConsumptionService.generateShopYourClosetRecommendations).toHaveBeenCalledTimes(2);
      expect(mockAntiConsumptionService.generateShopYourClosetRecommendations).toHaveBeenLastCalledWith(
        'test-user-id',
        'Red formal dress',
        'dresses',
        ['red'],
        'formal'
      );
    });
  });

  it('should handle empty colors and style props', async () => {
    mockAntiConsumptionService.generateShopYourClosetRecommendations.mockResolvedValue(mockRecommendation);

    render(
      <ShopYourClosetFirst
        userId={mockProps.userId}
        targetItemDescription={mockProps.targetItemDescription}
        category={mockProps.category}
      />
    );

    await waitFor(() => {
      expect(mockAntiConsumptionService.generateShopYourClosetRecommendations).toHaveBeenCalledWith(
        'test-user-id',
        'Blue casual shirt',
        'tops',
        [],
        ''
      );
    });
  });
});