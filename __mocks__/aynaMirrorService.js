// Manual mock for aynaMirrorService to ensure generateDailyRecommendations is tracked in tests
export const AynaMirrorService = {
  generateDailyRecommendations: jest.fn((userId) => Promise.resolve({
    id: 'mock-rec',
    userId,
    date: new Date(),
    recommendations: [],
    weatherContext: { temperature: 20, condition: 'sunny', humidity: 50, location: 'Test City', timestamp: new Date() },
    generatedAt: new Date()
  }))
};

// Some tests might import a singleton instance name
export const aynaMirrorService = AynaMirrorService;

export default AynaMirrorService;
