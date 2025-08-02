/**
 * Design Tokens
 * Core design constants that can be imported without circular dependencies
 */

import { TextStyle, ViewStyle } from 'react-native';

// UNIFIED COLOR PALETTE - Digital Zen Garden
export const UNIFIED_COLORS = {
  // Primary Palette - Warm, Premium Base
  background: {
    primary: '#FAF9F6',      // Warm off-white/cream base
    secondary: '#F8F7F4',    // Subtle variation
    tertiary: '#F3F4F6',     // Even lighter variation
    elevated: '#FEFEFE',     // Pure white for cards
    glass: 'rgba(255, 255, 255, 0.15)', // Glass morphism background
    overlay: 'rgba(0,0,0,0.4)' // Modal overlays
  },
  
  // Accent Colors - Sophisticated & Natural
  sage: {
    50: '#F6F8F6',
    75: '#F2F6F2',
    100: '#E8F0E8', 
    200: '#D1E1D1',
    300: '#A8C8A8',
    400: '#7FA87F',
    500: '#5C8A5C',          // Primary sage green
    600: '#4A7A4A',
    700: '#3A5F3A',
    800: '#2A4F2A',
    900: '#1A3F1A'
  },
  
  gold: {
    100: '#FFF9E6',
    300: '#FFE599',
    400: '#F0D666',
    500: '#D4AF37',          // Elegant gold accent
    600: '#B8993F',
    700: '#9C7A0F'
  },
  
  // Linen Color Palette
  linen: {
    light: '#FAF9F6',
    base: '#F8F7F4',
    dark: '#F3F4F6'
  },
  
  // Additional Color Palettes
  lilac: {
    50: '#F8F6FF',
    100: '#F3EFFF',
    600: '#8B5CF6'
  },
  
  coral: {
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626'
  },
  
  amber: {
    200: '#FDE68A',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706'
  },
  
  charcoal: {
    400: '#6B7280',
    500: '#4B5563',
    600: '#374151',
    700: '#1F2937',
    800: '#111827'
  },
  
  sageGreen: {
    100: '#E8F0E8',
    200: '#D1E1D1',
    300: '#A8C8A8',
    400: '#7FA87F',
    500: '#5C8A5C',
    600: '#4A7A4A',
    700: '#3A5F3A'
  },
  
  liquidGold: {
    300: '#FFE599',
    400: '#F0D666',
    500: '#D4AF37',
    600: '#B8993F',
    700: '#9C7A0F'
  },
  
  inkGray: {
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937'
  },
  
  neutral: {
    50: '#F9FAFB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    800: '#1F2937'
  },
  
  // Border Colors
  border: {
    primary: '#E5E7EB',
    secondary: '#D1D5DB',
    tertiary: '#F3F4F6',
    subtle: '#F9FAFB',
    glass: 'rgba(255, 255, 255, 0.2)'
  },
  
  // Text Hierarchy - High Contrast
  text: {
    primary: '#212529',      // Dark ink gray
    secondary: '#495057',    // Medium gray
    tertiary: '#6C757D',     // Light gray
    inverse: '#FFFFFF',      // White text on dark
    accent: '#D4AF37',       // Gold accent for highlights
    disabled: '#9CA3AF',     // Disabled text color
    placeholder: '#9CA3AF'   // Placeholder text color
  },
  
  // Functional Colors with scales
  success: {
    400: '#7FA87F',
    500: '#5C8A5C',
    600: '#4A7A4A'
  },
  warning: {
    400: '#F0D666',
    500: '#D4AF37',
    600: '#B8993F'
  },
  error: {
    400: '#F87171',
    500: '#E57373',
    600: '#DC2626'
  },
  info: {
    400: '#93C5FD',
    500: '#74C0FC',
    600: '#3B82F6'
  }
} as const;

// TYPOGRAPHY SYSTEM - Elegant serif headlines with clean sans-serif body
export const TYPOGRAPHY = {
  fonts: {
    headline: 'Playfair Display',  // Elegant serif for headlines
    body: 'Inter',                 // Clean sans-serif for body
    accent: 'Playfair Display'     // Serif for special elements
  },
  
  scale: {
    hero: { fontSize: 36, lineHeight: 44, fontWeight: '700' as const },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
    h2: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
    h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
    body1: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    body2: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
    button: { fontSize: 16, lineHeight: 20, fontWeight: '600' as const }
  }
} as const;

// SPACING & LAYOUT SYSTEM - Harmonious proportions
export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48,
  zen: 64,        // Special zen spacing for breathing room
  sanctuary: 96   // Maximum breathing space
} as const;

export const LAYOUT = {
  screenPadding: 24,
  cardPadding: 20,
  sectionSpacing: 32,
  componentSpacing: 16,
  maxContentWidth: 400
} as const;

// ELEVATION SYSTEM - Organic shadow patterns
export const ELEVATION = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
  
  soft: {
    shadowColor: UNIFIED_COLORS.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
  
  medium: {
    shadowColor: UNIFIED_COLORS.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  
  high: {
    shadowColor: UNIFIED_COLORS.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  } as ViewStyle,
  
  // Organic shadow patterns for premium feel
  organic: {
    shadowColor: UNIFIED_COLORS.text.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  } as ViewStyle,
  
  floating: {
    shadowColor: UNIFIED_COLORS.text.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  } as ViewStyle
} as const;

// BORDER RADIUS SYSTEM - Soft, organic corners
export const BORDER_RADIUS = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  organic: 28,     // Soft, organic feel
  round: 50,
  pill: 999        // Fully rounded pill shape
} as const;

// GLASSMORPHISM SYSTEM - For overlay components
export const GLASSMORPHISM = {
  // Light glassmorphism for subtle overlays
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  } as ViewStyle,
  
  // Medium glassmorphism for modals and cards
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  } as ViewStyle,
  
  // Strong glassmorphism for prominent overlays
  strong: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    backdropFilter: 'blur(30px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  } as ViewStyle,
  
  // Dark glassmorphism for dark backgrounds
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  } as ViewStyle,
  
  // Navigation bar glassmorphism
  navigation: {
    backgroundColor: 'rgba(250, 249, 246, 0.85)',
    backdropFilter: 'blur(20px)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  } as ViewStyle
} as const;