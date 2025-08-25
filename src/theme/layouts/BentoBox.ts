/**
 * BentoBox Layout System
 * Part of AYNAMODA Unified Design System
 *
 * Provides responsive grid layouts for dashboard-style interfaces
 * Inspired by Bento box compartmentalization with varying card heights
 * Following Digital Zen Garden philosophy with harmonious proportions
 */

import { Dimensions, ViewStyle } from 'react-native';

import { BORDER_RADIUS, ELEVATION, SPACING, UNIFIED_COLORS } from '@/theme/tokens';

const { width: screenWidth } = Dimensions.get('window');
const GRID_PADDING = SPACING.xl; // 24px screen padding
const CARD_SPACING = SPACING.lg; // 16px card spacing
const AVAILABLE_WIDTH = screenWidth - GRID_PADDING * 2;
const CARD_WIDTH = (AVAILABLE_WIDTH - CARD_SPACING) / 2;

export const BENTO_LAYOUTS = {
  // 2-column responsive grid with varying heights
  dashboard: {
    container: {
      flex: 1,
      paddingHorizontal: GRID_PADDING,
      paddingVertical: SPACING.lg,
    } as ViewStyle,

    // Grid row container
    row: {
      flexDirection: 'row',
      marginBottom: CARD_SPACING,
      gap: CARD_SPACING,
    } as ViewStyle,

    // Column container
    column: {
      flex: 1,
      gap: CARD_SPACING,
    } as ViewStyle,
  },

  // Card size variants for bento layout
  cardSizes: {
    // Small card - 1x1 grid unit
    small: {
      width: CARD_WIDTH,
      height: CARD_WIDTH * 0.8, // 4:5 aspect ratio
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.lg,
      ...ELEVATION.soft,
    } as ViewStyle,

    // Medium card - 1x1.5 grid units
    medium: {
      width: CARD_WIDTH,
      height: CARD_WIDTH * 1.2, // 5:6 aspect ratio
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.lg,
      ...ELEVATION.soft,
    } as ViewStyle,

    // Large card - 1x2 grid units
    large: {
      width: CARD_WIDTH,
      height: CARD_WIDTH * 1.6, // 5:8 aspect ratio
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.lg,
      ...ELEVATION.soft,
    } as ViewStyle,

    // Wide card - 2x1 grid units (spans full width)
    wide: {
      width: AVAILABLE_WIDTH,
      height: CARD_WIDTH * 0.6, // Wide aspect ratio
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.lg,
      ...ELEVATION.soft,
      marginBottom: CARD_SPACING,
    } as ViewStyle,

    // Hero card - 2x1.5 grid units (spans full width, taller)
    hero: {
      width: AVAILABLE_WIDTH,
      height: CARD_WIDTH * 0.9,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.xxl,
      padding: SPACING.xl,
      ...ELEVATION.organic,
      marginBottom: CARD_SPACING,
    } as ViewStyle,
  },

  // Special card variants for different content types
  contentTypes: {
    // Inspiration card
    inspiration: {
      backgroundColor: UNIFIED_COLORS.sage[100],
      borderWidth: 1,
      borderColor: UNIFIED_COLORS.sage[200],
    } as ViewStyle,

    // Style tips card
    styleTips: {
      backgroundColor: UNIFIED_COLORS.gold[100],
      borderWidth: 1,
      borderColor: UNIFIED_COLORS.gold[300],
    } as ViewStyle,

    // AI-curated outfit card
    aiCurated: {
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderWidth: 2,
      borderColor: UNIFIED_COLORS.sage[300],
      ...ELEVATION.medium,
    } as ViewStyle,

    // Statistics card
    stats: {
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderWidth: 1,
      borderColor: UNIFIED_COLORS.background.secondary,
    } as ViewStyle,

    // Quick action card
    quickAction: {
      backgroundColor: UNIFIED_COLORS.text.primary,
      borderRadius: BORDER_RADIUS.organic,
    } as ViewStyle,
  },
} as const;

// Predefined bento grid patterns
export const BENTO_PATTERNS = {
  // Pattern 1: Hero + 2x2 grid
  heroGrid: [
    { type: 'hero', span: 'full' },
    { type: 'small', span: 'half' },
    { type: 'small', span: 'half' },
    { type: 'medium', span: 'half' },
    { type: 'medium', span: 'half' },
  ],

  // Pattern 2: Wide + mixed sizes
  mixedSizes: [
    { type: 'wide', span: 'full' },
    { type: 'large', span: 'half' },
    { type: 'small', span: 'half' },
    { type: 'small', span: 'half' },
    { type: 'medium', span: 'half' },
  ],

  // Pattern 3: Balanced grid
  balanced: [
    { type: 'medium', span: 'half' },
    { type: 'medium', span: 'half' },
    { type: 'small', span: 'half' },
    { type: 'large', span: 'half' },
    { type: 'wide', span: 'full' },
  ],

  // Pattern 4: Content-focused
  contentFocus: [
    { type: 'hero', span: 'full' },
    { type: 'wide', span: 'full' },
    { type: 'small', span: 'half' },
    { type: 'small', span: 'half' },
  ],
} as const;

// Animation configurations for staggered card appearances
export const BENTO_ANIMATIONS = {
  // Gentle fade-in with staggered timing
  staggeredFadeIn: {
    duration: 600,
    staggerDelay: 100, // 100ms delay between each card
    easing: 'easeOutCubic',
    initialOpacity: 0,
    initialTransform: [{ translateY: 20 }, { scale: 0.95 }],
  },

  // Slide up animation
  slideUp: {
    duration: 500,
    staggerDelay: 80,
    easing: 'easeOutQuart',
    initialTransform: [{ translateY: 40 }],
  },

  // Scale in animation
  scaleIn: {
    duration: 400,
    staggerDelay: 60,
    easing: 'easeOutBack',
    initialTransform: [{ scale: 0.8 }],
  },
} as const;

// Responsive breakpoints for different screen sizes
export const BENTO_BREAKPOINTS = {
  small: {
    screenWidth: 320,
    columns: 1,
    cardSpacing: SPACING.md,
    screenPadding: SPACING.lg,
  },

  medium: {
    screenWidth: 375,
    columns: 2,
    cardSpacing: SPACING.lg,
    screenPadding: SPACING.xl,
  },

  large: {
    screenWidth: 414,
    columns: 2,
    cardSpacing: SPACING.lg,
    screenPadding: SPACING.xl,
  },

  tablet: {
    screenWidth: 768,
    columns: 3,
    cardSpacing: SPACING.xl,
    screenPadding: SPACING.xxl,
  },
} as const;

// Helper function to get responsive card width
export const getResponsiveCardWidth = (viewportWidth: number, columns: number = 2): number => {
  const padding = SPACING.xl * 2;
  const spacing = SPACING.lg * (columns - 1);
  return (viewportWidth - padding - spacing) / columns;
};

// Helper function to get bento pattern based on content
export const getBentoPattern = (contentType: 'dashboard' | 'discovery' | 'minimal' | 'content') => {
  switch (contentType) {
    case 'dashboard':
      return BENTO_PATTERNS.heroGrid;
    case 'discovery':
      return BENTO_PATTERNS.mixedSizes;
    case 'minimal':
      return BENTO_PATTERNS.balanced;
    case 'content':
      return BENTO_PATTERNS.contentFocus;
    default:
      return BENTO_PATTERNS.balanced;
  }
};

// Export for easy access
export const BentoBoxLayouts = BENTO_LAYOUTS;
export default BENTO_LAYOUTS;

// Type definitions
export type BentoCardSize = keyof typeof BENTO_LAYOUTS.cardSizes;
export type BentoContentType = keyof typeof BENTO_LAYOUTS.contentTypes;
export type BentoPattern = keyof typeof BENTO_PATTERNS;
export type BentoBreakpoint = keyof typeof BENTO_BREAKPOINTS;
