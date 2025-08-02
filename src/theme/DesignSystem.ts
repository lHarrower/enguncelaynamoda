/**
 * AYNAMODA Unified Design System
 * Digital Zen Garden Philosophy - "Confidence as a Service"
 * 
 * Consolidates all theme systems into one coherent foundation
 * Target aesthetic: Spotify's clean structure + Gucci's polished luxury + calm, premium wellness
 * 
 * Emotion targets: "Huzur" (Serenity) + "Neşeli Lüks" (Joyful Luxury)
 */

import { TextStyle, ViewStyle } from 'react-native';
import {
  UNIFIED_COLORS,
  TYPOGRAPHY,
  SPACING,
  LAYOUT,
  ELEVATION,
  BORDER_RADIUS,
  GLASSMORPHISM
} from '@/theme/tokens';

// Re-export tokens for backward compatibility
export {
  UNIFIED_COLORS,
  TYPOGRAPHY,
  SPACING,
  LAYOUT,
  ELEVATION,
  BORDER_RADIUS,
  GLASSMORPHISM
} from '@/theme/tokens';

// COMPONENT STYLES
export const BUTTON_STYLES = {
  primary: {
    backgroundColor: UNIFIED_COLORS.text.primary,
    color: UNIFIED_COLORS.text.inverse,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    ...ELEVATION.soft
  } as ViewStyle,
  
  secondary: {
    backgroundColor: 'transparent',
    color: UNIFIED_COLORS.text.primary,
    borderWidth: 1,
    borderColor: UNIFIED_COLORS.text.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 16,
    paddingHorizontal: 24
  } as ViewStyle,
  
  luxury: {
    backgroundColor: UNIFIED_COLORS.gold[500],
    color: UNIFIED_COLORS.text.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    ...ELEVATION.soft
  } as ViewStyle
} as const;

export const CARD_STYLES = {
  base: {
    backgroundColor: UNIFIED_COLORS.background.elevated,
    borderRadius: BORDER_RADIUS.xl,
    padding: LAYOUT.cardPadding,
    ...ELEVATION.soft
  } as ViewStyle,
  
  glass: {
    ...GLASSMORPHISM.medium,
    borderRadius: BORDER_RADIUS.xl,
    padding: LAYOUT.cardPadding
  } as ViewStyle,
  
  luxury: {
    backgroundColor: UNIFIED_COLORS.background.elevated,
    borderRadius: BORDER_RADIUS.organic,
    padding: SPACING.xl,
    ...ELEVATION.organic,
    borderWidth: 1,
    borderColor: UNIFIED_COLORS.gold[100]
  } as ViewStyle,
  
  floating: {
    backgroundColor: UNIFIED_COLORS.background.elevated,
    borderRadius: BORDER_RADIUS.organic,
    padding: LAYOUT.cardPadding,
    ...ELEVATION.floating
  } as ViewStyle
} as const;

// Import layout systems
import { LayoutSystems } from '@/theme/layouts';

// MAIN DESIGN SYSTEM EXPORT
export const DesignSystem = {
  colors: {
    ...UNIFIED_COLORS,
    // Backward compatibility aliases for nested color access
    text: UNIFIED_COLORS.text,
    background: UNIFIED_COLORS.background,
    border: UNIFIED_COLORS.border,
    surface: {
      primary: UNIFIED_COLORS.background.elevated,
      secondary: UNIFIED_COLORS.background.secondary
    },
    // Additional aliases for common patterns
    primary: UNIFIED_COLORS.sage,
    secondary: UNIFIED_COLORS.neutral,
    linen: { base: UNIFIED_COLORS.background.primary }
  },
  typography: {
    ...TYPOGRAPHY,
    // Backward compatibility aliases
    body: {
      small: TYPOGRAPHY.scale.body2,
      medium: TYPOGRAPHY.scale.body1,
      large: TYPOGRAPHY.scale.h3,
      fontFamily: TYPOGRAPHY.fonts.body
    },
    button: {
      small: { ...TYPOGRAPHY.scale.button, fontSize: 14 },
      medium: TYPOGRAPHY.scale.button,
      large: { ...TYPOGRAPHY.scale.button, fontSize: 18 }
    },
    caption: {
      small: { ...TYPOGRAPHY.scale.caption, fontSize: 10 },
      medium: TYPOGRAPHY.scale.caption,
      large: { ...TYPOGRAPHY.scale.caption, fontSize: 14 }
    },
    heading: {
      h1: TYPOGRAPHY.scale.h1,
      h2: TYPOGRAPHY.scale.h2,
      h3: TYPOGRAPHY.scale.h3,
      h4: TYPOGRAPHY.scale.body1,
      h5: TYPOGRAPHY.scale.body2,
      large: TYPOGRAPHY.scale.hero
    },
    display: {
      large: TYPOGRAPHY.scale.hero
    },
    // Direct aliases for common typography access patterns
    h1: TYPOGRAPHY.scale.h1,
    h2: TYPOGRAPHY.scale.h2,
    h3: TYPOGRAPHY.scale.h3,
    body: TYPOGRAPHY.scale.body1,
    caption: TYPOGRAPHY.scale.caption
  },
  spacing: {
    ...SPACING,
    // Additional spacing aliases that components expect
    massive: 80
  },
  layout: LAYOUT,
  elevation: ELEVATION,
  borderRadius: BORDER_RADIUS,
  radius: BORDER_RADIUS, // Alias for backward compatibility
  glassmorphism: GLASSMORPHISM,
  // Animation configurations
  animations: {
    spring: {
      damping: 15,
      stiffness: 150,
      mass: 1
    }
  },
  components: {
    button: BUTTON_STYLES,
    card: CARD_STYLES
  },
  layouts: LayoutSystems
} as const;

// Re-export component styles for easy access
export { default as ButtonStyles } from '@/theme/components/Button';
export { default as CardStyles } from '@/theme/components/Card';
export { default as InputStyles } from '@/theme/components/Input';
export { default as NavigationStyles } from '@/theme/components/Navigation';

// Re-export component types
export type { ButtonVariant, ButtonSize } from '@/theme/components/Button';
export type { CardVariant, CardSize, CardSpacing } from '@/theme/components/Card';
export type { InputVariant, InputSize } from '@/theme/components/Input';
export type { NavigationVariant, NavButtonType } from '@/theme/components/Navigation';

// Export layout systems
export { LayoutSystems } from '@/theme/layouts';
export type {
  BentoCardSize,
  BentoContentType,
  BentoPattern,
  CollageLayoutType,
  GridLayoutType,
  StackLayoutType
} from '@/theme/layouts';

// Type definitions
export type DesignSystemType = typeof DesignSystem;
export type ColorKeys = keyof typeof UNIFIED_COLORS;
export type TypographyKeys = keyof typeof TYPOGRAPHY.scale;
export type SpacingKeys = keyof typeof SPACING;

export default DesignSystem;