/**
 * Input Component Styles
 * Part of AYNAMODA Unified Design System
 *
 * Provides consistent input styling for forms and user interactions
 * Following Digital Zen Garden philosophy with premium feel
 */

import { TextStyle, ViewStyle } from 'react-native';

import { BORDER_RADIUS, ELEVATION, SPACING, TYPOGRAPHY, UNIFIED_COLORS } from '@/theme/tokens';

export const INPUT_VARIANTS = {
  // Default input - Standard text input
  default: {
    container: {
      borderWidth: 1,
      borderColor: UNIFIED_COLORS.text.tertiary,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      minHeight: 48,
    } as ViewStyle,

    input: {
      ...TYPOGRAPHY.body.medium,
      fontFamily: TYPOGRAPHY.fontFamily.body,
      color: UNIFIED_COLORS.text.primary,
      flex: 1,
    } as TextStyle,

    // Focused state
    focused: {
      borderColor: UNIFIED_COLORS.sage[500],
      borderWidth: 2,
      ...ELEVATION.soft,
    } as ViewStyle,

    // Error state
    error: {
      borderColor: UNIFIED_COLORS.error[500],
      borderWidth: 2,
    } as ViewStyle,

    // Disabled state
    disabled: {
      backgroundColor: UNIFIED_COLORS.background.secondary,
      borderColor: UNIFIED_COLORS.text.tertiary,
      opacity: 0.6,
    } as ViewStyle,
  },

  // Luxury input - Premium styling
  luxury: {
    container: {
      borderWidth: 1,
      borderColor: UNIFIED_COLORS.gold[300],
      borderRadius: BORDER_RADIUS.organic,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.lg,
      minHeight: 52,
      ...ELEVATION.soft,
    } as ViewStyle,

    input: {
      ...TYPOGRAPHY.body.medium,
      fontFamily: TYPOGRAPHY.fontFamily.body,
      color: UNIFIED_COLORS.text.primary,
      flex: 1,
    } as TextStyle,

    // Focused state
    focused: {
      borderColor: UNIFIED_COLORS.gold[500],
      borderWidth: 2,
      ...ELEVATION.organic,
    } as ViewStyle,

    // Error state
    error: {
      borderColor: UNIFIED_COLORS.error[500],
      borderWidth: 2,
    } as ViewStyle,
  },

  // Search input - Optimized for search functionality
  search: {
    container: {
      borderWidth: 1,
      borderColor: UNIFIED_COLORS.background.secondary,
      borderRadius: BORDER_RADIUS.pill,
      backgroundColor: UNIFIED_COLORS.background.secondary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    input: {
      ...TYPOGRAPHY.body.small,
      fontFamily: TYPOGRAPHY.fontFamily.body,
      color: UNIFIED_COLORS.text.primary,
      flex: 1,
      marginLeft: SPACING.sm,
    } as TextStyle,

    // Focused state
    focused: {
      borderColor: UNIFIED_COLORS.sage[300],
      backgroundColor: UNIFIED_COLORS.background.elevated,
      ...ELEVATION.soft,
    } as ViewStyle,
  },

  // Minimal input - Clean, borderless design
  minimal: {
    container: {
      borderBottomWidth: 1,
      borderBottomColor: UNIFIED_COLORS.text.tertiary,
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
      paddingVertical: SPACING.md,
      minHeight: 44,
    } as ViewStyle,

    input: {
      ...TYPOGRAPHY.body.medium,
      fontFamily: TYPOGRAPHY.fontFamily.body,
      color: UNIFIED_COLORS.text.primary,
      flex: 1,
    } as TextStyle,

    // Focused state
    focused: {
      borderBottomColor: UNIFIED_COLORS.sage[500],
      borderBottomWidth: 2,
    } as ViewStyle,

    // Error state
    error: {
      borderBottomColor: UNIFIED_COLORS.error[500],
      borderBottomWidth: 2,
    } as ViewStyle,
  },

  // Textarea - Multi-line input
  textarea: {
    container: {
      borderWidth: 1,
      borderColor: UNIFIED_COLORS.text.tertiary,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.lg,
      minHeight: 100,
      alignItems: 'flex-start',
    } as ViewStyle,

    input: {
      ...TYPOGRAPHY.body.medium,
      fontFamily: TYPOGRAPHY.fontFamily.body,
      color: UNIFIED_COLORS.text.primary,
      flex: 1,
      textAlignVertical: 'top',
      width: '100%',
    } as TextStyle,

    // Focused state
    focused: {
      borderColor: UNIFIED_COLORS.sage[500],
      borderWidth: 2,
      ...ELEVATION.soft,
    } as ViewStyle,
  },
} as const;

// Input size modifiers
export const INPUT_SIZES = {
  small: {
    container: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      minHeight: 36,
      borderRadius: BORDER_RADIUS.md,
    } as ViewStyle,

    input: {
      ...TYPOGRAPHY.body.small,
    } as TextStyle,
  },

  medium: {
    container: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      minHeight: 48,
      borderRadius: BORDER_RADIUS.lg,
    } as ViewStyle,

    input: {
      ...TYPOGRAPHY.body.medium,
    } as TextStyle,
  },

  large: {
    container: {
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.lg,
      minHeight: 56,
      borderRadius: BORDER_RADIUS.xl,
    } as ViewStyle,

    input: {
      ...TYPOGRAPHY.scale.h3,
    } as TextStyle,
  },
} as const;

// Label and helper text styles
export const INPUT_LABELS = {
  label: {
    ...TYPOGRAPHY.body.small,
    fontFamily: TYPOGRAPHY.fontFamily.body,
    color: UNIFIED_COLORS.text.secondary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  } as TextStyle,

  required: {
    color: UNIFIED_COLORS.error[500],
  } as TextStyle,

  helperText: {
    ...TYPOGRAPHY.caption.medium,
    fontFamily: TYPOGRAPHY.fontFamily.body,
    color: UNIFIED_COLORS.text.tertiary,
    marginTop: SPACING.xs,
  } as TextStyle,

  errorText: {
    ...TYPOGRAPHY.caption.medium,
    fontFamily: TYPOGRAPHY.fontFamily.body,
    color: UNIFIED_COLORS.error[500],
    marginTop: SPACING.xs,
  } as TextStyle,
} as const;

// Placeholder styles
export const PLACEHOLDER_STYLES = {
  default: {
    color: UNIFIED_COLORS.text.tertiary,
  },

  luxury: {
    color: UNIFIED_COLORS.gold[300],
  },

  minimal: {
    color: UNIFIED_COLORS.text.tertiary,
  },
} as const;

// Export for easy access
export const InputStyles = INPUT_VARIANTS;
export default INPUT_VARIANTS;

// Type definitions
export type InputVariant = keyof typeof INPUT_VARIANTS;
export type InputSize = keyof typeof INPUT_SIZES;
