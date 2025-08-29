// Mock for secureStorage utility
const mockSecureStorage = {
  initialize: jest.fn().mockResolvedValue(undefined),
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
  getAllKeys: jest.fn().mockResolvedValue([]),
  clearSecureData: jest.fn().mockResolvedValue(undefined),
  getLastError: jest.fn().mockReturnValue(null),
};

// Mock'ları resetleme fonksiyonu
mockSecureStorage.mockClear = () => {
  mockSecureStorage.initialize.mockClear();
  mockSecureStorage.setItem.mockClear();
  mockSecureStorage.getItem.mockClear();
  mockSecureStorage.removeItem.mockClear();
  mockSecureStorage.getAllKeys.mockClear();
  mockSecureStorage.clearSecureData.mockClear();
  mockSecureStorage.getLastError.mockClear();
};

// Export as default and named exports to match the original module
module.exports = {
  secureStorage: mockSecureStorage,
  SecureStorageManager: {
    initialize: mockSecureStorage.initialize,
    setItem: mockSecureStorage.setItem,
    getItem: mockSecureStorage.getItem,
    removeItem: mockSecureStorage.removeItem,
    getAllKeys: mockSecureStorage.getAllKeys,
    clearSecureData: mockSecureStorage.clearSecureData,
    getLastError: mockSecureStorage.getLastError,
  },
};

// Also export secureStorage as default for ES6 imports
module.exports.default = mockSecureStorage;
