/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  coverageProvider: 'v8',

  // Test dosyaları
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Babel (expo preset) ile dönüştür
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Kurulum dosyaları
  setupFiles: ['<rootDir>/jest.env.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Expo/RN ESM paketleri için transpile istisnaları
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo-location|expo-modules-core|@expo|expo|expo-haptics|expo-notifications|expo-image-picker|expo-web-browser|expo-auth-session|expo-apple-authentication|@testing-library|react-native-reanimated|expo-linear-gradient|expo-blur|expo-device)/)',
  ],

  // Modül eşleştirmeleri (mocks ve aliaslar)
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^react-native-reanimated$': '<rootDir>/__mocks__/react-native-reanimated.js',
    '^react-native-reanimated/(.*)$': '<rootDir>/__mocks__/react-native-reanimated.js',

    '^@/config/supabaseClient$': '<rootDir>/__mocks__/supabaseClient.js',
    '^@/hooks/useSafeTheme$': '<rootDir>/__mocks__/useSafeTheme.js',
    '^react-native-url-polyfill/auto$': '<rootDir>/__mocks__/react-native-url-polyfill.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/async-storage.js',

    '^expo-location$': '<rootDir>/__mocks__/expo-location.js',
    '^expo-linear-gradient$': '<rootDir>/__mocks__/expo-linear-gradient.js',
    '^expo-blur$': '<rootDir>/__mocks__/expo-blur.js',
    '^expo-device$': '<rootDir>/__mocks__/expo-device.js',
    '^expo-haptics$': '<rootDir>/__mocks__/expo-haptics.js',
    '^expo-application$': '<rootDir>/__mocks__/expo-application.js',
    '^expo-notifications$': '<rootDir>/__mocks__/expo-notifications.js',
    '^expo-image-picker$': '<rootDir>/__mocks__/expo-image-picker.js',
    '^expo-camera$': '<rootDir>/__mocks__/expo-camera.js',
    '^expo-web-browser$': '<rootDir>/__mocks__/expo-web-browser.js',
    '^expo-auth-session/providers/google$': '<rootDir>/__mocks__/expo-auth-session-google.js',
    '^expo-apple-authentication$': '<rootDir>/__mocks__/expo-apple-authentication.js',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/expo-vector-icons.js',

    '^@/theme/DesignSystem$': '<rootDir>/__mocks__/DesignSystem.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
  ],

  // Kapsam (coverage) ayarları
  collectCoverageFrom: [
    'src/services/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    '!src/services/**/*.d.ts',
    '!src/components/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Jest varsayılanları
  resetMocks: false,
  clearMocks: false,
};
