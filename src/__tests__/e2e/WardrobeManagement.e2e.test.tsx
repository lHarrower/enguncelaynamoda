// End-to-end tests for wardrobe management workflows
import React from 'react';
import { fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { WardrobeScreen } from '../../screens/WardrobeScreen';
// import { AddItemScreen } from '../../screens/AddItemScreen'; // TODO: Create AddItemScreen
// import { ItemDetailScreen } from '../../screens/ItemDetailScreen'; // TODO: Create ItemDetailScreen
import { renderWithProviders, createMockWardrobeItem, flushPromises } from '../utils/testUtils';
import { WardrobeCategory, WardrobeColor } from '../../types/wardrobe';
import { mocks } from '../mocks';

jest.mock('../../services/wardrobeService');
jest.mock('../../services/AIService');

// Mock missing elements and dependencies
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  View: jest.fn(() => null),
  Text: jest.fn(() => null),
}));

const Stack = createStackNavigator();

const TestNavigator = ({ initialRouteName = 'Wardrobe' }: { initialRouteName?: string }) => (
  <NavigationContainer>
    <Stack.Navigator id={undefined} initialRouteName={initialRouteName}>
      <Stack.Screen name="Wardrobe" component={WardrobeScreen} />
      {/* <Stack.Screen name="AddItem" component={AddItemScreen} /> */}
      {/* <Stack.Screen name="ItemDetail" component={ItemDetailScreen} /> */}
    </Stack.Navigator>
  </NavigationContainer>
);

// Ensure global mocks are initialized
if (!global.mocks) {
  global.mocks = {
    asyncStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    },
    hapticFeedback: jest.fn(),
    imagePicker: jest.fn(),
    location: jest.fn(),
  };
}

// Update netInfo mock to include isInternetReachable
mocks.netInfo = {
  fetch: jest.fn(() => Promise.resolve({
    isConnected: true,
  })),
};

describe('Gardırop Yönetimi E2E', () => {
  const mockWardrobeService = require('../../services/wardrobeService').WardrobeService;
  const mockAIService = require('../../services/AIService').AIService;

  const mockItems = [
    createMockWardrobeItem({
      id: 'item-1',
      name: 'Blue Summer Dress',
      category: WardrobeCategory.DRESSES,
      colors: [WardrobeColor.BLUE],
      isFavorite: false,
    }),
    createMockWardrobeItem({
      id: 'item-2',
      name: 'Black Leather Jacket',
      category: WardrobeCategory.OUTERWEAR,
      colors: [WardrobeColor.BLACK],
      isFavorite: true,
    }),
    createMockWardrobeItem({
      id: 'item-3',
      name: 'White Cotton T-Shirt',
      category: WardrobeCategory.TOPS,
      colors: [WardrobeColor.WHITE],
      isFavorite: false,
    }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup WardrobeService mocks
    mockWardrobeService.prototype.getAllItems = jest.fn().mockResolvedValue(mockItems);
    mockWardrobeService.prototype.getItemById = jest
      .fn()
      .mockImplementation((userId, itemId) =>
        Promise.resolve(mockItems.find((item) => item.id === itemId)),
      );
    mockWardrobeService.prototype.addItem = jest.fn().mockResolvedValue(createMockWardrobeItem());
    mockWardrobeService.prototype.updateItem = jest
      .fn()
      .mockResolvedValue(createMockWardrobeItem());
    mockWardrobeService.prototype.deleteItem = jest.fn().mockResolvedValue(true);
    mockWardrobeService.prototype.searchItems = jest.fn().mockResolvedValue([]);
    mockWardrobeService.prototype.getFavorites = jest
      .fn()
      .mockResolvedValue(mockItems.filter((item) => (item as any).isFavorite));

    // Setup AIService mocks
    mockAIService.prototype.analyzeImage = jest.fn().mockResolvedValue({
      category: WardrobeCategory.TOPS,
      colors: [WardrobeColor.BLUE],
      description: 'A blue cotton t-shirt',
      confidence: 0.95,
    });

    // Setup ImagePicker mock
    mocks.imagePicker.launchImageLibrary.mockImplementation(
      (options: Record<string, unknown>, callback: (response: Record<string, unknown>) => void) => {
        const response = {
          didCancel: false,
          errorMessage: null,
          assets: [
            {
              uri: 'file://test-image.jpg',
              type: 'image/jpeg',
              fileName: 'test-image.jpg',
              fileSize: 1024,
              width: 100,
              height: 100,
            },
          ],
        };
        callback(response);
        return Promise.resolve(response);
      },
    );
  });

  describe('gardırop görüntüleme ve navigasyon', () => {
    it('gardırop öğelerini göstermeli ve detaylara navigasyona izin vermeli', async () => {
      const { getByTestId, getByText } = renderWithProviders(<TestNavigator />);

      // Wait for items to load
      await waitFor(() => {
        expect(getByText('Blue Summer Dress')).toBeTruthy();
        expect(getByTestId('wardrobe-item-item-1')).toBeTruthy();
      });

      // Tap on an item to view details
      fireEvent.press(getByText('Blue Summer Dress'));

      await waitFor(() => {
        expect(getByTestId('item-detail-screen')).toBeTruthy();
      });
    });

    it('öğeleri kategoriye göre filtrelemeli', async () => {
      const { getByText, getByTestId, queryByText } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByText('Blue Summer Dress')).toBeTruthy();
      });

      // Open category filter
      fireEvent.press(getByTestId('category-filter-button'));

      // Select dresses category
      fireEvent.press(getByText('Dresses'));

      await waitFor(() => {
        expect(getByText('Blue Summer Dress')).toBeTruthy();
        expect(queryByText('Black Leather Jacket')).toBeNull();
        expect(queryByText('White Cotton T-Shirt')).toBeNull();
      });
    });

    it('öğeleri isme göre aramalı', async () => {
      mockWardrobeService.prototype.searchItems.mockResolvedValue([
        mockItems.find((item) => (item.name || '').includes('Blue')),
      ]);

      const { getByTestId, getByText } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByText('Blue Summer Dress')).toBeTruthy();
      });

      // Enter search query
      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'Blue');
      fireEvent(searchInput, 'onSubmitEditing');

      await waitFor(() => {
        expect(mockWardrobeService.prototype.searchItems).toHaveBeenCalledWith(
          expect.any(String),
          'Blue',
        );
      });
    });

    it('favori durumunu değiştirmeli', async () => {
      const { getByTestId } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId('wardrobe-item-item-1')).toBeTruthy();
      });

      // Toggle favorite on first item
      const favoriteButton = getByTestId('favorite-button-item-1');
      fireEvent.press(favoriteButton);

      await waitFor(() => {
        expect(mockWardrobeService.prototype.updateItem).toHaveBeenCalledWith(
          expect.any(String),
          'item-1',
          expect.objectContaining({ isFavorite: true }),
        );
      });
    });
  });

  describe('yeni öğe ekleme', () => {
    it('tam öğe ekleme iş akışını tamamlamalı', async () => {
      const { getByTestId, getByText } = renderWithProviders(<TestNavigator />);

      // Navigate to add item screen
      fireEvent.press(getByTestId('add-item-button'));

      await waitFor(() => {
        expect(getByTestId('add-item-screen')).toBeTruthy();
      });

      // Take photo
      fireEvent.press(getByTestId('take-photo-button'));

      await waitFor(() => {
        expect(mocks.imagePicker.launchImageLibrary).toHaveBeenCalled();
      });

      // Wait for AI analysis
      await waitFor(() => {
        expect(mockAIService.prototype.analyzeImage).toHaveBeenCalled();
      });

      // Fill in item details
      const nameInput = getByTestId('item-name-input');
      fireEvent.changeText(nameInput, 'New Blue Shirt');

      // Select category (should be pre-filled from AI)
      expect(getByText('Tops')).toBeTruthy();

      // Add tags
      const tagInput = getByTestId('tag-input');
      fireEvent.changeText(tagInput, 'casual');
      fireEvent.press(getByTestId('add-tag-button'));

      // Save item
      fireEvent.press(getByTestId('save-item-button'));

      await waitFor(() => {
        expect(mockWardrobeService.prototype.addItem).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            name: 'New Blue Shirt',
            category: WardrobeCategory.TOPS,
            tags: expect.arrayContaining(['casual']),
          }),
        );
      });

      // Should navigate back to wardrobe
      await waitFor(() => {
        expect(getByTestId('wardrobe-screen')).toBeTruthy();
      });
    });

    it('galeriden fotoğraf seçimini işlemeli', async () => {
      const { getByTestId } = renderWithProviders(<TestNavigator initialRouteName="AddItem" />);

      // Select from gallery
      fireEvent.press(getByTestId('select-from-gallery-button'));

      await waitFor(() => {
        expect(mocks.imagePicker.launchImageLibrary).toHaveBeenCalledWith(
          expect.objectContaining({
            mediaType: 'photo',
            quality: 0.8,
          }),
          expect.any(Function),
        );
      });

      // Should trigger AI analysis
      await waitFor(() => {
        expect(mockAIService.prototype.analyzeImage).toHaveBeenCalledWith('file://test-image.jpg');
      });
    });

    it('kaydetmeden önce gerekli alanları doğrulamalı', async () => {
      const { getByTestId } = renderWithProviders(<TestNavigator initialRouteName="AddItem" />);

      // Try to save without required fields
      fireEvent.press(getByTestId('save-item-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Validation Error',
          expect.stringContaining('required'),
        );
      });

      expect(mockWardrobeService.prototype.addItem).not.toHaveBeenCalled();
    });

    it('AI analiz hatalarını zarif şekilde işlemeli', async () => {
      mockAIService.prototype.analyzeImage.mockRejectedValue(new Error('AI service unavailable'));

      const { getByTestId, getByText } = renderWithProviders(
        <TestNavigator initialRouteName="AddItem" />,
      );

      fireEvent.press(getByTestId('take-photo-button'));

      await waitFor(() => {
        expect(getByText(/AI analysis failed/i)).toBeTruthy();
      });

      // Should still allow manual entry
      const nameInput = getByTestId('item-name-input');
      expect(nameInput.props.editable).toBe(true);
    });
  });

  describe('öğe detayları ve düzenleme', () => {
    it('öğe detaylarını göstermeli ve düzenlemeye izin vermeli', async () => {
      const { getByText, getByTestId } = renderWithProviders(<TestNavigator />);

      // Navigate to item details
      await waitFor(() => {
        expect(getByText('Blue Summer Dress')).toBeTruthy();
      });

      fireEvent.press(getByText('Blue Summer Dress'));

      await waitFor(() => {
        expect(getByTestId('item-detail-screen')).toBeTruthy();
        expect(getByText('Blue Summer Dress')).toBeTruthy();
        expect(getByText('Dresses')).toBeTruthy();
      });

      // Enter edit mode
      fireEvent.press(getByTestId('edit-item-button'));

      await waitFor(() => {
        expect(getByTestId('edit-mode-container')).toBeTruthy();
      });

      // Edit item name
      const nameInput = getByTestId('edit-name-input');
      fireEvent.changeText(nameInput, 'Updated Blue Dress');

      // Save changes
      fireEvent.press(getByTestId('save-changes-button'));

      await waitFor(() => {
        expect(mockWardrobeService.prototype.updateItem).toHaveBeenCalledWith(
          expect.any(String),
          'item-1',
          expect.objectContaining({
            name: 'Updated Blue Dress',
          }),
        );
      });
    });

    it('onaylamayla öğe silmeye izin vermeli', async () => {
      const { getByText, getByTestId } = renderWithProviders(<TestNavigator />);

      // Navigate to item details
      await waitFor(() => {
        expect(getByText('Blue Summer Dress')).toBeTruthy();
      });

      fireEvent.press(getByText('Blue Summer Dress'));

      await waitFor(() => {
        expect(getByTestId('item-detail-screen')).toBeTruthy();
      });

      // Delete item
      fireEvent.press(getByTestId('delete-item-button'));

      // Confirm deletion
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Delete Item',
          expect.stringContaining('Are you sure'),
          expect.arrayContaining([
            expect.objectContaining({ text: 'Cancel' }),
            expect.objectContaining({ text: 'Delete' }),
          ]),
        );
      });

      // Simulate user confirming deletion
      const deleteCallback = (Alert.alert as jest.Mock).mock.calls[0][2][1].onPress;
      deleteCallback();

      await waitFor(() => {
        expect(mockWardrobeService.prototype.deleteItem).toHaveBeenCalledWith(
          expect.any(String),
          'item-1',
        );
      });
    });

    it('kıyafet önerilerini göstermeli', async () => {
      mockAIService.prototype.generateOutfitSuggestions.mockResolvedValue([
        {
          items: [mockItems[0], mockItems[2]],
          occasion: 'casual',
          confidence: 0.9,
        },
      ]);

      const { getByText, getByTestId } = renderWithProviders(<TestNavigator />);

      // Navigate to item details
      await waitFor(() => {
        expect(getByText('Blue Summer Dress')).toBeTruthy();
      });

      fireEvent.press(getByText('Blue Summer Dress'));

      await waitFor(() => {
        expect(getByTestId('item-detail-screen')).toBeTruthy();
      });

      // View outfit suggestions
      fireEvent.press(getByTestId('outfit-suggestions-button'));

      await waitFor(() => {
        expect(mockAIService.prototype.generateOutfitSuggestions).toHaveBeenCalled();
        expect(getByTestId('outfit-suggestions-container')).toBeTruthy();
      });
    });
  });

  describe('hata işleme ve kurtarma', () => {
    it('ağ hatalarını zarif şekilde işlemeli', async () => {
      mockWardrobeService.prototype.getAllItems.mockRejectedValue(new Error('Network error'));

      const { getByText, getByTestId } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId('error-state-container')).toBeTruthy();
        expect(getByText(/network/i)).toBeTruthy();
      });

      // Should show retry button
      expect(getByTestId('retry-button')).toBeTruthy();
    });

    it('başarısız işlemleri yeniden denemeli', async () => {
      mockWardrobeService.prototype.getAllItems
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce(mockItems);

      const { getByTestId, getByText } = renderWithProviders(<TestNavigator />);

      // Should show error initially
      await waitFor(() => {
        expect(getByTestId('error-state-container')).toBeTruthy();
      });

      // Retry operation
      fireEvent.press(getByTestId('retry-button'));

      // Should succeed on retry
      await waitFor(() => {
        expect(getByText('Blue Summer Dress')).toBeTruthy();
      });
    });

    it('çevrimdışı senaryoları işlemeli', async () => {
      // Mock network info to indicate offline
      mocks.netInfo.fetch.mockResolvedValue({
        isConnected: false,
      });

      const { getByTestId, getByText } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId('offline-indicator')).toBeTruthy();
        expect(getByText(/offline/i)).toBeTruthy();
      });
    });
  });

  describe('erişilebilirlik ve kullanıcı deneyimi', () => {
    it('ekran okuyucu navigasyonunu desteklemeli', async () => {
      const { getByTestId } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId('wardrobe-screen')).toBeTruthy();
      });

      // Check accessibility properties
      const wardrobeList = getByTestId('wardrobe-list');
      expect(wardrobeList.props.accessibilityRole).toBe('list');
      expect(wardrobeList.props.accessibilityLabel).toBeTruthy();
    });

    it('etkileşimler için dokunsal geri bildirim sağlamalı', async () => {
      const { getByText } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByText('Blue Summer Dress')).toBeTruthy();
      });

      fireEvent.press(getByText('Blue Summer Dress'));

      expect(mocks.hapticFeedback.trigger).toHaveBeenCalledWith('selection');
    });

    it('yükleme durumlarını uygun şekilde işlemeli', async () => {
      // Delay the service response
      mockWardrobeService.prototype.getAllItems.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockItems), 1000)),
      );

      const { getByTestId } = renderWithProviders(<TestNavigator />);

      // Should show loading indicator
      expect(getByTestId('loading-indicator')).toBeTruthy();

      // Wait for data to load
      await act(async () => {
        await flushPromises();
      });

      await waitFor(() => {
        expect(getByTestId('wardrobe-list')).toBeTruthy();
      });
    });
  });

  describe('performans ve optimizasyon', () => {
    it('büyük gardıropları verimli şekilde işlemeli', async () => {
      const largeWardrobe = Array.from({ length: 1000 }, (_, index) =>
        createMockWardrobeItem({
          id: `item-${index}`,
          name: `Item ${index}`,
        }),
      );

      mockWardrobeService.prototype.getAllItems.mockResolvedValue(largeWardrobe);

      const startTime = performance.now();

      const { getByTestId } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId('wardrobe-list')).toBeTruthy();
      });

      const endTime = performance.now();

      // Should render within reasonable time
      expect(endTime - startTime).toBeLessThan(3000);
    });

    it('büyük listeler için sanal kaydırma uygulamalı', async () => {
      const largeWardrobe = Array.from({ length: 500 }, (_, index) =>
        createMockWardrobeItem({ id: `item-${index}` }),
      );

      mockWardrobeService.prototype.getAllItems.mockResolvedValue(largeWardrobe);

      const { getByTestId } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId('wardrobe-list')).toBeTruthy();
      });

      const list = getByTestId('wardrobe-list');

      // Should use FlatList with performance optimizations
      expect(list.props.removeClippedSubviews).toBe(true);
      expect(list.props.maxToRenderPerBatch).toBeDefined();
      expect(list.props.windowSize).toBeDefined();
    });
  });

  describe('veri kalıcılığı ve senkronizasyon', () => {
    it('veriyi yerel olarak saklamalı ve çevrimiçi olduğunda senkronize etmeli', async () => {
      const { getByTestId } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId('wardrobe-screen')).toBeTruthy();
      });

      // Should load from cache first
      expect(mocks.asyncStorage.getItem).toHaveBeenCalled();

      // Then sync with server
      expect(mockWardrobeService.prototype.getAllItems).toHaveBeenCalled();
    });

    it('senkronizasyon çakışmalarını uygun şekilde işlemeli', async () => {
      // Mock a sync conflict scenario
      mockWardrobeService.prototype.updateItem.mockRejectedValue(
        new Error('Conflict: Item was modified by another device'),
      );

      const { getByText, getByTestId } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByText('Blue Summer Dress')).toBeTruthy();
      });

      fireEvent.press(getByText('Blue Summer Dress'));
      fireEvent.press(getByTestId('edit-item-button'));

      const nameInput = getByTestId('edit-name-input');
      fireEvent.changeText(nameInput, 'Conflicted Name');
      fireEvent.press(getByTestId('save-changes-button'));

      await waitFor(() => {
        expect(getByTestId('sync-conflict-dialog')).toBeTruthy();
      });
    });
  });
});
