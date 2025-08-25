// App-wide constants to improve maintainability and consistency

// Animation and Timing Constants
export const ANIMATION_DURATION = {
  QUICK: 300,
  NORMAL: 500,
  SLOW: 800,
  VERY_SLOW: 1500,
} as const;

export const TIMEOUTS = {
  AUTH_CHECK: 15000,
  LOADING_SIMULATION: 1500,
  SEARCH_DEBOUNCE: 300,
  MODAL_DELAY: 300,
  API_TIMEOUT: 30000,
} as const;

// UI Dimensions
export const UI_DIMENSIONS = {
  AVATAR_SIZE: 80,
  AVATAR_SIZE_SMALL: 40,
  FAB_SIZE: 60,
  FAB_ICON_SIZE: 28,
  ICON_SIZE_SMALL: 20,
  ICON_SIZE_MEDIUM: 24,
  ICON_SIZE_LARGE: 28,
  ICON_SIZE_XLARGE: 32,
  BUTTON_HEIGHT: 50,
  INPUT_HEIGHT: 50,
  HEADER_HEIGHT: 60,
  TAB_BAR_HEIGHT: 60,
  BORDER_RADIUS_SMALL: 8,
  BORDER_RADIUS_MEDIUM: 12,
  BORDER_RADIUS_LARGE: 16,
  BORDER_RADIUS_XLARGE: 20,
  BORDER_RADIUS_ROUND: 25,
} as const;

// Spacing - Zara-inspired generous spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  huge: 80,
  massive: 120,
  editorial: 160, // For editorial layouts with lots of breathing room
} as const;

// API Endpoints and Models
export const API_CONFIG = {
  HUGGINGFACE_VQA_MODEL: 'dandelin/vilt-b32-finetuned-vqa',
  HUGGINGFACE_API_URL: 'https://api-inference.huggingface.co/models/',
  SUPABASE_STORAGE_BUCKET: 'wardrobe-images',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  AUTH_TIMEOUT: 'Authentication check timed out (15s). Check network or Supabase URL.',
  SUPABASE_MISSING: 'Supabase URL or Anon Key is missing. Please check your .env file.',
  HUGGINGFACE_MISSING: 'Hugging Face API token not configured. Please check your .env file.',
  GOOGLE_CLIENT_MISSING: 'Google Client ID is missing. Please check your .env file.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 6 characters long',
  PASSWORDS_MISMATCH: 'Passwords do not match',
  REQUIRED_FIELDS: 'Please fill in all fields',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ACCOUNT_CREATED: 'Account created successfully! Please check your email to verify your account.',
  ITEM_ADDED: 'Item added successfully! ✨',
  ITEM_DELETED: 'Item deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 100,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{4,6}$/,
} as const;

// Image Configuration
export const IMAGE_CONFIG = {
  QUALITY: 0.8,
  ASPECT_RATIO: [3, 4] as [number, number],
  MAX_WIDTH: 1000,
  MAX_HEIGHT: 1333,
  THUMBNAIL_SIZE: 150,
} as const;

// Categories
export const CATEGORIES = [
  'All',
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Accessories',
] as const;

// Colors for AI Analysis
export const COLORS = [
  'black',
  'white',
  'gray',
  'red',
  'blue',
  'green',
  'yellow',
  'pink',
  'purple',
  'orange',
  'brown',
  'beige',
  'navy',
  'teal',
  'maroon',
] as const;

// 🔤 ZARA-INSPIRED TYPOGRAPHY SYSTEM
// Clean, minimal, elegant - never distracts from product photography
// Single font family for consistency and simplicity

export const TYPOGRAPHY = {
  // Primary Font - Inter (clean, modern, highly legible)
  fontFamily: 'Inter_400Regular',

  // Font Weights
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Font Sizes - Minimal scale, generous spacing
  sizes: {
    // Display
    hero: 32, // Editorial headlines
    title: 24, // Page titles

    // Content
    heading: 20, // Section headings
    subheading: 18, // Subheadings
    body: 16, // Main body text
    bodySmall: 14, // Secondary body text

    // UI
    button: 16, // Button text
    label: 14, // Form labels
    caption: 12, // Captions, metadata
    tiny: 10, // Smallest text
  },

  // Line Heights - Generous for readability
  lineHeights: {
    hero: 36, // 1.125x
    title: 28, // 1.17x
    heading: 24, // 1.2x
    subheading: 22, // 1.22x
    body: 24, // 1.5x
    bodySmall: 20, // 1.43x
    button: 20, // 1.25x
    label: 18, // 1.29x
    caption: 16, // 1.33x
    tiny: 14, // 1.4x
  },

  // Letter Spacing - Minimal, clean
  letterSpacing: {
    tight: -0.3, // For large text
    normal: 0, // Default
    wide: 0.5, // For emphasis
    wider: 1, // For buttons/labels},
  },

  // Color harmony and seasonal preferences
  COLOR_HARMONY_RULES: {
    complementary: ['red-green', 'blue-orange', 'yellow-purple'],
    analogous: ['red-orange-yellow', 'blue-green-purple', 'yellow-green-blue'],
    triadic: ['red-blue-yellow', 'orange-green-purple'],
    neutral: ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'brown'],
  },

  SEASONAL_COLOR_PREFERENCES: {
    spring: ['pastels', 'bright', 'warm'],
    summer: ['cool', 'muted', 'soft'],
    autumn: ['warm', 'rich', 'earthy'],
    winter: ['cool', 'bold', 'dramatic'],
  },
};

// 🎨 Semantic Typography Mappings - Zara Style
export const SEMANTIC_TYPOGRAPHY = {
  // Editorial
  editorialHeadline: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -0.5,
  },

  // Product
  productTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  productPrice: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },

  // Navigation
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
  },

  // Buttons
  buttonPrimary: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  buttonSecondary: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
  },

  // Forms
  inputLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
  },
  inputText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },

  // Content
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
};

// 🌟 Minimalist Shadow System
export const SHADOWS = {
  // Subtle, clean shadows - never harsh
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  soft: {
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: 'rgba(0, 0, 0, 0.16)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};

// 🎯 Border Radius - Clean, minimal
export const BORDER_RADIUS = {
  none: 0,
  small: 4,
  medium: 8,
  large: 12,
  xl: 16,
  xxl: 24,
  round: 50,
  circle: 9999,
};

// ✨ Minimal animation system
export const ANIMATIONS = {
  // Spring animations
  gentle: {
    damping: 20,
    stiffness: 150,
    mass: 1,
  },
  smooth: {
    damping: 25,
    stiffness: 200,
    mass: 0.8,
  },
  quick: {
    damping: 30,
    stiffness: 300,
    mass: 0.6,
  },
  // Timing for non-spring animations
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

// Intelligence Service Configuration
export const INTELLIGENCE_CONFIG = {
  // Outfit Generation Limits
  OUTFIT_GENERATION: {
    DRESS_COMBINATIONS: {
      TEST: 8,
      PRODUCTION: 50,
    },
    TRIPLE_COMBINATIONS: {
      TEST: 8,
      PRODUCTION: 50,
    },
    PAIR_FALLBACK: {
      TEST: 8,
      PRODUCTION: 10,
    },
    FINAL_LIMIT: {
      TEST: 8,
      PRODUCTION: 20,
    },
  },

  // Scoring Weights
  SCORING_WEIGHTS: {
    COMPATIBILITY: 0.3,
    CONFIDENCE: 0.4,
    WEATHER: 0.2,
    OCCASION: 0.1,

    // Compatibility Sub-weights
    COLOR_HARMONY: 0.4,
    STYLE_CONSISTENCY: 0.3,
    CATEGORY_BALANCE: 0.2,
    FORMALITY_CONSISTENCY: 0.1,

    // Satisfaction Weights
    COLOR_ALIGNMENT: 0.3,
    STYLE_ALIGNMENT: 0.3,
    PATTERN_ALIGNMENT: 0.4,
  },

  // Temperature Thresholds (Celsius)
  TEMPERATURE_THRESHOLDS: {
    FREEZING: 0,
    COLD: 10,
    COOL: 20,
    MILD: 25,
    WARM: 30,
  },

  // Confidence Scores
  CONFIDENCE: {
    BASE: 0.5,
    MINIMUM: 0.1,
    MAXIMUM: 1.0,
    NEUTRAL: 0.5,
    HIGH_THRESHOLD: 0.8,
  },

  // Usage Statistics
  USAGE_STATS: {
    MAX_USAGE_BONUS: 0.25,
    REDISCOVERY_BONUS: 0.1,
    HIGH_RATING_THRESHOLD: 3.3,
    AVERAGE_WEARS_DIVISOR: 12,
    TOTAL_DAYS_ACTIVE: 30,
    REDISCOVERY_MULTIPLIER: 0.1,
    REDISCOVERY_CAP: 0.2,
  },

  // Weather Compatibility Adjustments
  WEATHER_ADJUSTMENTS: {
    RAIN_BONUS: 0.2,
    RAIN_PENALTY: 0.3,
    SNOW_BONUS: 0.3,
    SNOW_PENALTY: 0.4,
    WIND_BONUS: 0.1,
    WIND_PENALTY: 0.2,
    WATERPROOF_BONUS: 0.2,
    DELICATE_PENALTY: 0.3,
    SNOW_WATERPROOF_BONUS: 0.3,
    SNOW_NON_WATERPROOF_PENALTY: 0.4,
    WIND_RESISTANT_BONUS: 0.1,
    LOOSE_WIND_PENALTY: 0.2,
  },

  // Style Compatibility Matrix
  STYLE_COMPATIBILITY: {
    casual: { casual: 1.0, business: 0.3, formal: 0.1, athletic: 0.7 },
    business: { casual: 0.3, business: 1.0, formal: 0.8, athletic: 0.1 },
    formal: { casual: 0.1, business: 0.8, formal: 1.0, athletic: 0.0 },
    athletic: { casual: 0.7, business: 0.1, formal: 0.0, athletic: 1.0 },
  },

  // Color Harmony Rules
  COLOR_HARMONY: {
    NEUTRAL_BOOST: 0.99,
    COMPLEMENTARY_SCORE: 0.9,
    ANALOGOUS_SCORE: 0.85,
    TRIADIC_SCORE: 0.8,
    MONOCHROMATIC_SCORE: 0.92,
    CLASHING_PENALTY: 0.6,
    SINGLE_COLOR_SCORE: 0.9,
    DEFAULT_HARMONY: 0.8,
  },

  // Category Balance
  CATEGORY_BALANCE: {
    OPTIMAL_SCORE: 1.0,
    SINGLE_CATEGORY_PENALTY: 0.3,
    TOO_MANY_PENALTY: 0.6,
  },

  // Dataset Analysis Thresholds
  DATASET_THRESHOLDS: {
    SMALL_DATASET_MULTIPLIER: 0.15,
    MEDIUM_DATASET_MULTIPLIER: 0.1,
  },
} as const;

// App Metadata
export const APP_METADATA = {
  NAME: 'AYNAMODA',
  VERSION: '1.0.0',
  TAGLINE: 'Effortless Style',
  DESCRIPTION: 'Your Digital Fashion Flagship',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  GOOGLE_AUTH: true,
  APPLE_AUTH: true,
  FACEBOOK_AUTH: false,
  AI_STYLING: true,
  SOCIAL_SHARING: true,
  PREMIUM_FEATURES: false,
} as const;

// Limits
export const LIMITS = {
  MAX_WARDROBE_ITEMS_FREE: 100,
  MAX_WARDROBE_ITEMS_PREMIUM: 1000,
  MAX_UPLOAD_SIZE_MB: 10,
  MAX_FAVORITES: 50,
  MAX_COLLECTIONS: 10,
} as const;
