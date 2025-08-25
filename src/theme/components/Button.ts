/**
 * Button Component Styles
 * Part of AYNAMODA Unified Design System
 *
 * Provides consistent button styling with primary, secondary, and luxury variants
 * Following Digital Zen Garden philosophy with premium feel
 */

import { TextStyle, ViewStyle } from 'react-native';

import { BORDER_RADIUS, ELEVATION, SPACING, TYPOGRAPHY, UNIFIED_COLORS } from '@/theme/tokens';

export const BUTTON_VARIANTS = {
  // Primary button - Main call-to-action
  primary: {
    container: {
      backgroundColor: UNIFIED_COLORS.text.primary,
      borderRadius: BORDER_RADIUS.lg,
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.xl,
      ...ELEVATION.soft,
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    text: {
      ...TYPOGRAPHY.button.medium,
      fontFamily: TYPOGRAPHY.fontFamily.body,
      color: UNIFIED_COLORS.text.inverse,
      textAlign: 'center',
    } as TextStyle,

    // Pressed state
    pressed: {
      backgroundColor: UNIFIED_COLORS.text.secondary,
      ...ELEVATION.medium,
    } as ViewStyle,

    // Disabled state
    disabled: {
      backgroundColor: UNIFIED_COLORS.text.tertiary,
      ...ELEVATION.none,
    } as ViewStyle,
  },

  // Secondary button - Alternative actions
  secondary: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: UNIFIED_COLORS.text.primary,
      borderRadius: BORDER_RADIUS.lg,
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.xl,
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    text: {
      ...TYPOGRAPHY.button.medium,
      fontFamily: TYPOGRAPHY.fontFamily.body,
      color: UNIFIED_COLORS.text.primary,
      textAlign: 'center',
    } as TextStyle,

    // Pressed state
    pressed: {
      backgroundColor: UNIFIED_COLORS.background.secondary,
      borderColor: UNIFIED_COLORS.text.secondary,
    } as ViewStyle,

    // Disabled state
    disabled: {
      borderColor: UNIFIED_COLORS.text.tertiary,
    } as ViewStyle,

    disabledText: {
      color: UNIFIED_COLORS.text.tertiary,
    } as TextStyle,
  },

  // Luxury button - Premium actions
  luxury: {
    container: {
      backgroundColor: UNIFIED_COLORS.gold[500],
      borderRadius: BORDER_RADIUS.organic,
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.xl,
      ...ELEVATION.organic,
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: UNIFIED_COLORS.gold[700],
    } as ViewStyle,

    text: {
      ...TYPOGRAPHY.button.medium,
      fontFamily: TYPOGRAPHY.fontFamily.accent,
      color: UNIFIED_COLORS.text.primary,
      textAlign: 'center',
      fontWeight: '600',
    } as TextStyle,

    // Pressed state
    pressed: {
      backgroundColor: UNIFIED_COLORS.gold[700],
      ...ELEVATION.floating,
    } as ViewStyle,

    // Disabled state
    disabled: {
      backgroundColor: UNIFIED_COLORS.gold[100],
      borderColor: UNIFIED_COLORS.gold[300],
      ...ELEVATION.none,
    } as ViewStyle,
  },

  // Ghost button - Minimal style
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderRadius: BORDER_RADIUS.lg,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      minHeight: 40,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    text: {
      ...TYPOGRAPHY.body.medium,
      fontFamily: TYPOGRAPHY.fontFamily.body,
      color: UNIFIED_COLORS.text.primary,
      textAlign: 'center',
      fontWeight: '500',
    } as TextStyle,

    // Pressed state
    pressed: {
      backgroundColor: UNIFIED_COLORS.background.secondary,
    } as ViewStyle,

    // Disabled state
    disabled: {
      opacity: 0.5,
    } as ViewStyle,
  },

  // Small button variant
  small: {
    container: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      minHeight: 32,
      borderRadius: BORDER_RADIUS.md,
    } as ViewStyle,

    text: {
      ...TYPOGRAPHY.body.small,
      fontWeight: '600',
    } as TextStyle,
  },

  // Large button variant
  large: {
    container: {
      paddingVertical: SPACING.xl,
      paddingHorizontal: SPACING.xxl,
      minHeight: 56,
      borderRadius: BORDER_RADIUS.xl,
    } as ViewStyle,

    text: {
      ...TYPOGRAPHY.scale.h3,
      fontWeight: '600',
    } as TextStyle,
  },
} as const;

// Button size modifiers
export const BUTTON_SIZES = {
  small: BUTTON_VARIANTS.small,
  medium: {}, // Default size, no modifications needed
  large: BUTTON_VARIANTS.large,
} as const;

// Export for easy access
export const ButtonStyles = BUTTON_VARIANTS;
export default BUTTON_VARIANTS;

// Type definitions
export type ButtonVariant = keyof typeof BUTTON_VARIANTS;
export type ButtonSize = keyof typeof BUTTON_SIZES;
