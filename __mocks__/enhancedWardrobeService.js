const enhancedWardrobeService = {
  getUserWardrobe: jest.fn(),
  saveClothingItem: jest.fn(),
  trackItemUsage: jest.fn(),
  getItemUsageStats: jest.fn(),
  getNeglectedItems: jest.fn(),
  categorizeItemAutomatically: jest.fn(),
  extractItemColors: jest.fn(),
  suggestItemTags: jest.fn(),
  calculateCostPerWear: jest.fn(),
  getWardrobeUtilizationStats: jest.fn(),
  updateItemConfidenceScore: jest.fn(),
  deleteClothingItem: jest.fn(),
  updateItemName: jest.fn(),
};

// Default implementations
const defaultMockItems = [
  {
    id: 'sync-item-1',
    name: 'Blue Summer Dress',
    category: 'dresses',
    colors: ['blue'],
    brand: 'Zara',
    price: 89.99,
    purchaseDate: '2024-01-15',
    lastWorn: null,
    wearCount: 0,
    rating: 0,
    tags: ['summer', 'casual'],
    imageUrl: 'https://example.com/blue-dress.jpg',
    isAIGenerated: false,
    confidenceScore: 0.95,
    userId: 'local-user',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

enhancedWardrobeService.saveClothingItem.mockResolvedValue({ id: 'mock-item-id' });
enhancedWardrobeService.trackItemUsage.mockResolvedValue();
enhancedWardrobeService.getItemUsageStats.mockResolvedValue({
  itemId: 'mock-item',
  totalWears: 0,
  lastWorn: null,
  averageRating: 0,
  complimentsReceived: 0,
  costPerWear: 0,
});
enhancedWardrobeService.getNeglectedItems.mockResolvedValue([]);
enhancedWardrobeService.categorizeItemAutomatically.mockResolvedValue('tops');
enhancedWardrobeService.extractItemColors.mockResolvedValue(['#000000']);
enhancedWardrobeService.suggestItemTags.mockResolvedValue(['casual']);
enhancedWardrobeService.calculateCostPerWear.mockResolvedValue(0);
enhancedWardrobeService.getWardrobeUtilizationStats.mockResolvedValue({
  totalItems: 0,
  activeItems: 0,
  neglectedItems: 0,
  averageCostPerWear: 0,
  utilizationPercentage: 0,
});
enhancedWardrobeService.updateItemConfidenceScore.mockResolvedValue();
enhancedWardrobeService.deleteClothingItem.mockResolvedValue();

// Export the mock instance as a named export to match the original service
module.exports = {
  enhancedWardrobeService,
};
