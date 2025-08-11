/**
 * Card Component Styles
 * Part of AYNAMODA Unified Design System
 * 
 * Provides consistent card styling with base, glass, and luxury variants
 * Following Digital Zen Garden philosophy with premium feel
 */

import { ViewStyle } from 'react-native';
import { UNIFIED_COLORS, BORDER_RADIUS, ELEVATION, SPACING, GLASSMORPHISM, LAYOUT } from '@/theme/tokens';

export const CARD_VARIANTS = {
  // Base card - Standard content containers
  base: {
    container: {
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.xl,
      padding: LAYOUT.cardPadding,
      ...ELEVATION.soft,
    } as ViewStyle,
    
    // Pressed state for interactive cards
    pressed: {
      ...ELEVATION.medium,
      transform: [{ scale: 0.98 }],
    } as ViewStyle
  },
  
  // Glass card - Glassmorphism effect for overlays
  glass: {
    container: {
      ...GLASSMORPHISM.medium,
      borderRadius: BORDER_RADIUS.xl,
      padding: LAYOUT.cardPadding,
    } as ViewStyle,
    
    // Light glass variant
    light: {
      ...GLASSMORPHISM.light,
      borderRadius: BORDER_RADIUS.xl,
      padding: LAYOUT.cardPadding,
    } as ViewStyle,
    
    // Strong glass variant
    strong: {
      ...GLASSMORPHISM.strong,
      borderRadius: BORDER_RADIUS.xl,
      padding: LAYOUT.cardPadding,
    } as ViewStyle,
    
    // Dark glass variant
    dark: {
      ...GLASSMORPHISM.dark,
      borderRadius: BORDER_RADIUS.xl,
      padding: LAYOUT.cardPadding,
    } as ViewStyle
  },
  
  // Luxury card - Premium styling with gold accents
  luxury: {
    container: {
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.organic,
      padding: SPACING.xl,
      ...ELEVATION.organic,
      borderWidth: 1,
      borderColor: UNIFIED_COLORS.gold[100],
    } as ViewStyle,
    
    // Pressed state
    pressed: {
      ...ELEVATION.floating,
      borderColor: UNIFIED_COLORS.gold[300],
      transform: [{ scale: 0.98 }],
    } as ViewStyle,
    
    // Premium variant with gold background
    premium: {
      backgroundColor: UNIFIED_COLORS.gold[100],
      borderColor: UNIFIED_COLORS.gold[300],
      ...ELEVATION.floating,
    } as ViewStyle
  },
  
  // Floating card - Elevated appearance
  floating: {
    container: {
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.organic,
      padding: LAYOUT.cardPadding,
      ...ELEVATION.floating,
    } as ViewStyle,
    
    // Pressed state
    pressed: {
      ...ELEVATION.high,
      transform: [{ scale: 0.98 }],
    } as ViewStyle
  },
  
  // Minimal card - Clean, borderless design
  minimal: {
    container: {
      backgroundColor: UNIFIED_COLORS.background.primary,
      borderRadius: BORDER_RADIUS.lg,
      padding: LAYOUT.cardPadding,
    } as ViewStyle,
    
    // Pressed state
    pressed: {
      backgroundColor: UNIFIED_COLORS.background.secondary,
    } as ViewStyle
  },
  
  // Outlined card - Border-only design
  outlined: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: UNIFIED_COLORS.text.tertiary,
      borderRadius: BORDER_RADIUS.xl,
      padding: LAYOUT.cardPadding,
    } as ViewStyle,
    
    // Pressed state
    pressed: {
      borderColor: UNIFIED_COLORS.text.secondary,
      backgroundColor: UNIFIED_COLORS.background.secondary,
    } as ViewStyle
  }
} as const;

// Card size modifiers
export const CARD_SIZES = {
  small: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  } as ViewStyle,
  
  medium: {
    padding: LAYOUT.cardPadding,
    borderRadius: BORDER_RADIUS.xl,
  } as ViewStyle,
  
  large: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xxl,
  } as ViewStyle,
  
  hero: {
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.organic,
  } as ViewStyle
} as const;

// Card spacing modifiers
export const CARD_SPACING = {
  tight: SPACING.xs,
  normal: SPACING.md,
  loose: SPACING.lg,
  spacious: SPACING.xl
} as const;

// Header and content area styles
export const CARD_SECTIONS = {
  header: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: UNIFIED_COLORS.background.secondary,
  } as ViewStyle,
  
  content: {
    flex: 1,
  } as ViewStyle,
  
  footer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: UNIFIED_COLORS.background.secondary,
  } as ViewStyle,
  
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  } as ViewStyle
} as const;

// Export for easy access
export const CardStyles = CARD_VARIANTS;
export default CARD_VARIANTS;

// Type definitions
export type CardVariant = keyof typeof CARD_VARIANTS;
export type CardSize = keyof typeof CARD_SIZES;
export type CardSpacing = keyof typeof CARD_SPACING;