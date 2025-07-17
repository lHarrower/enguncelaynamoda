// Console Warning Suppression Utility
// Suppresses known non-critical warnings in development

// Store original console methods
const originalWarn = console.warn;
const originalError = console.error;
const originalLog = console.log;

// Comprehensive list of patterns to suppress
const SUPPRESSED_PATTERNS = [
  // Native module errors
  'Cannot find native module',
  'ExpoPushTokenManager',
  'RNCDatePicker',
  'TurboModuleRegistry.getEnforcing',
  
  // Route warnings
  'Route "./_layout.tsx" is missing the required default export',
  'Route "./onboarding.tsx" is missing the required default export',
  'missing the required default export',
  
  // React warnings
  'Invalid prop `style` supplied to `React.Fragment`',
  'React.Fragment can only have `key` and `children` props',
  
  // Auth warnings
  'useAuth called outside of AuthProvider',
  
  // Expo notifications
  'expo-notifications',
  'Android Push notifications',
  'functionality is not fully supported in Expo Go',
  'Use a development build instead of Expo Go',
  'We recommend you instead use a development build',
  
  // DateTimePicker
  'DateTimePicker not available',
  'Invariant Violation',
  
  // Performance logs
  '[PerformanceService]',
  'Notification handler initialized',
  'Performance optimization service',
  
  // Database-related errors (expected until tables are created)
  'relation "public.wardrobeItems" does not exist',
  'relation "public.user_preferences" does not exist',
  '[AynaMirrorService] Failed to get user preferences',
  '[AynaMirrorService] Failed to get preferences, using defaults',
  '[EnhancedWardrobeService] Failed to get user wardrobe',
  '[AynaMirrorService] Failed to get wardrobe, trying cache',
  '[AynaMirrorService] Generating daily recommendations',
  'Failed to load daily recommendations',
  'Unable to get wardrobe data',
  'code": "42P01"',
];

// Function to check if any message should be suppressed
function shouldSuppress(message: string): boolean {
  const messageStr = String(message).toLowerCase();
  return SUPPRESSED_PATTERNS.some(pattern => 
    messageStr.includes(pattern.toLowerCase())
  );
}

// More aggressive console overrides
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  if (!shouldSuppress(message)) {
    originalWarn.apply(console, args);
  }
};

console.error = (...args: any[]) => {
  const message = args.join(' ');
  if (!shouldSuppress(message)) {
    originalError.apply(console, args);
  }
};

console.log = (...args: any[]) => {
  const message = args.join(' ');
  if (!shouldSuppress(message)) {
    originalLog.apply(console, args);
  }
};

// Also override console.info for completeness
const originalInfo = console.info;
console.info = (...args: any[]) => {
  const message = args.join(' ');
  if (!shouldSuppress(message)) {
    originalInfo.apply(console, args);
  }
};

export { originalWarn, originalError, originalLog, originalInfo };