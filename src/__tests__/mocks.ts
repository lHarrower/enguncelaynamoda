// Centralized mocks for tests

export const mocks = {
  asyncStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  hapticFeedback: {
    trigger: jest.fn(),
  },
  imagePicker: {
    launchCamera: jest.fn(),
    launchImageLibrary: jest.fn(),
  },
  location: {
    getCurrentPositionAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
  },
  reanimated: {
    withTiming: jest.fn(),
    withSpring: jest.fn(),
  },
  netInfo: {
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  },
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        mockResolvedValueOnce: jest.fn(),
        mockRejectedValueOnce: jest.fn(),
      })),
      insert: jest.fn(() => ({
        mockResolvedValueOnce: jest.fn(),
      })),
      update: jest.fn(() => ({
        mockResolvedValueOnce: jest.fn(),
      })),
      delete: jest.fn(() => ({
        mockResolvedValueOnce: jest.fn(),
      })),
    })),
  },
};
