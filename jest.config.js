module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['module:metro-react-native-babel-preset'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo-location|expo-modules-core|@expo|expo|@testing-library|react-native-reanimated|expo-linear-gradient|expo-blur|expo-device)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native-url-polyfill/auto$': '<rootDir>/__mocks__/react-native-url-polyfill.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/async-storage.js',
    '^../config/supabaseClient$': '<rootDir>/__mocks__/supabaseClient.js',
    '^expo-location$': '<rootDir>/__mocks__/expo-location.js',
    '^expo-linear-gradient$': '<rootDir>/__mocks__/expo-linear-gradient.js',
    '^expo-blur$': '<rootDir>/__mocks__/expo-blur.js',
    '^expo-device$': '<rootDir>/__mocks__/expo-device.js',
    '^react-native-reanimated$': '<rootDir>/__mocks__/react-native-reanimated.js',
  },
  collectCoverageFrom: [
    'services/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!services/**/*.d.ts',
    '!components/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};