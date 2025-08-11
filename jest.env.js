// Jest environment setup for testing
// This file sets up environment variables needed for tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-for-jest-testing-purposes-only';
process.env.EXPO_PUBLIC_HUGGINGFACE_TOKEN = 'test-huggingface-token';
process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'test-google-client-id';

// Suppress console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  // Suppress specific warnings that are expected in test environment
  const message = args[0];
  if (
    typeof message === 'string' &&
    (
      message.includes('Warning: EXPO_PUBLIC_SUPABASE_ANON_KEY seems too short') ||
      message.includes('Running in development mode with invalid Supabase config') ||
      message.includes('ReactNativeFiberHostComponent')
    )
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  // Suppress specific errors that are expected in test environment
  const message = args[0];
  if (
    typeof message === 'string' &&
    (
      message.includes('Supabase configuration error') ||
      message.includes('Missing required environment variables')
    )
  ) {
    return;
  }
  originalError.apply(console, args);
};

// Mock __DEV__ global
global.__DEV__ = true;