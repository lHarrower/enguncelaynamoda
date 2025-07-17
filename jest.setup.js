// Jest setup file for AYNA Mirror tests

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock React Native modules (removed problematic NativeAnimatedHelper mock)

// Mock React Native components
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
}));

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        supabaseUrl: 'mock-url',
        supabaseAnonKey: 'mock-key',
      },
    },
  },
}));

// Mock Expo vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock Expo notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: {
    HIGH: 'high',
    DEFAULT: 'default',
    LOW: 'low',
  },
  AndroidNotificationPriority: {
    HIGH: 'high',
  },
}));

// Mock Expo image picker
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock Expo camera
jest.mock('expo-camera', () => ({
  requestCameraPermissionsAsync: jest.fn(),
}));

// Mock Expo router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
    push: jest.fn(),
  })),
  useSegments: jest.fn(() => []),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));

// Global test timeout
jest.setTimeout(10000);