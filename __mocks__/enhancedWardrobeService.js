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
};

// Default implementations
enhancedWardrobeService.getUserWardrobe.mockResolvedValue([]);
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

module.exports = { enhancedWardrobeService };