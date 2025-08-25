import { TextStyle, ViewStyle } from 'react-native';

/**
 * AURA THEME
 * A design system that transforms the digital into the transcendent
 * Built on the principles of Sensory Stillness, Gentle Confidence, and Material Honesty
 */

// PRINCIPLE I: SENSORY STILLNESS
// The Muted, Cohesive Palette
export const AuraColors = {
  // Primary: The Foundation
  vellum: '#F8F7F4', // Warm, textured off-white - the paper of luxury
  inkGray: '#333333', // Deep, confident text - the weight of words

  // Accent: Used Intentionally and Sparingly
  polishedJade: '#7A9E9F', // Primary accent - moments of serenity
  softGold: '#D4AF37', // Secondary accent - moments of celebration

  // Supporting Tones
  whisper: '#F5F4F2', // Lighter than vellum - for subtle layers
  shadow: '#1A1A1A', // Deeper than ink - for emphasis
  mist: 'rgba(51, 51, 51, 0.05)', // Softest gray - for boundaries

  // Material Overlays
  frostedGlass: 'rgba(248, 247, 244, 0.85)',
  deepFrost: 'rgba(248, 247, 244, 0.95)',
  veil: 'rgba(248, 247, 244, 0.4)',

  // Interaction States
  touchRipple: 'rgba(122, 158, 159, 0.1)',
  goldShimmer: 'rgba(212, 175, 55, 0.15)',
} as const;

// The Power of a Single, Elegant Font
export const AuraTypography = {
  // Editorial Hierarchy - Playfair Display
  hero: {
    fontFamily: 'Playfair Display',
    fontSize: 42,
    fontWeight: '300' as const,
    lineHeight: 52,
    letterSpacing: -1,
    color: AuraColors.inkGray,
  } as TextStyle,

  title: {
    fontFamily: 'Playfair Display',
    fontSize: 32,
    fontWeight: '400' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: AuraColors.inkGray,
  } as TextStyle,

  subtitle: {
    fontFamily: 'Playfair Display',
    fontSize: 24,
    fontWeight: '400' as const,
    lineHeight: 32,
    letterSpacing: 0,
    color: AuraColors.inkGray,
  } as TextStyle,

  // Body Hierarchy - Manrope
  body: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 26,
    letterSpacing: 0.2,
    color: AuraColors.inkGray,
  } as TextStyle,

  bodyLight: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '300' as const,
    lineHeight: 26,
    letterSpacing: 0.3,
    color: AuraColors.inkGray,
  } as TextStyle,

  caption: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: 0.3,
    color: AuraColors.inkGray,
    opacity: 0.8,
  } as TextStyle,

  whisper: {
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '300' as const,
    lineHeight: 18,
    letterSpacing: 0.4,
    color: AuraColors.inkGray,
    opacity: 0.6,
  } as TextStyle,

  // Special Purpose
  button: {
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  } as TextStyle,
} as const;

// Atmosphere of Breathable Space
export const AuraSpacing = {
  // Micro Spaces
  atom: 4, // Smallest unit
  molecule: 8, // Base unit

  // Component Spaces
  xs: 12, // Tight grouping
  sm: 16, // Standard spacing
  md: 24, // Comfortable spacing
  lg: 32, // Generous spacing
  xl: 48, // Luxurious spacing
  xxl: 64, // Statement spacing
  xxxl: 96, // Dramatic spacing

  // Semantic Spaces
  breathe: 40, // Standard breathing room
  exhale: 80, // Generous breathing room
  pause: 120, // Dramatic pause
  screenPadding: 24, // Consistent screen margins
} as const;

// PRINCIPLE II: GENTLE CONFIDENCE
// The Physics of Motion
export const AuraMotion = {
  // Timing - All Non-Linear
  timing: {
    instant: 150,
    quick: 250,
    smooth: 350,
    gentle: 500,
    considered: 700,
    cinematic: 1000,
  },

  // Custom Curves - Real-World Physics
  curves: {
    // Standard ease with subtle acceleration
    confidence: 'cubic-bezier(0.4, 0.0, 0.2, 1)',

    // Gentle overshoot for modals and important elements
    overshoot: 'cubic-bezier(0.34, 1.56, 0.64, 1)',

    // Smooth deceleration for dismissals
    settle: 'cubic-bezier(0.0, 0.0, 0.2, 1)',

    // Elastic bounce for delightful moments
    delight: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Threshold Transitions
  threshold: {
    fadeInUp: {
      from: { opacity: 0, transform: [{ translateY: 20 }] },
      to: { opacity: 1, transform: [{ translateY: 0 }] },
    },
    fadeInDown: {
      from: { opacity: 0, transform: [{ translateY: -20 }] },
      to: { opacity: 1, transform: [{ translateY: 0 }] },
    },
    scaleIn: {
      from: { opacity: 0, transform: [{ scale: 0.95 }] },
      to: { opacity: 1, transform: [{ scale: 1 }] },
    },
    unfold: {
      from: { opacity: 0, transform: [{ scaleY: 0.95 }] },
      to: { opacity: 1, transform: [{ scaleY: 1 }] },
    },
  },
} as const;

// PRINCIPLE III: MATERIAL HONESTY
// Premium Surfaces and Textures
export const AuraMaterials = {
  // The Vellum Paper Background
  vellumPaper: {
    backgroundColor: AuraColors.vellum,
    // Subtle texture will be added via noise overlay
  } as ViewStyle,

  // The Frosted Glass Layers
  frostedGlass: {
    light: {
      backgroundColor: AuraColors.frostedGlass,
      backdropFilter: 'blur(20px)',
      '-webkit-backdrop-filter': 'blur(20px)',
    } as ViewStyle,

    heavy: {
      backgroundColor: AuraColors.deepFrost,
      backdropFilter: 'blur(30px)',
      '-webkit-backdrop-filter': 'blur(30px)',
    } as ViewStyle,

    subtle: {
      backgroundColor: AuraColors.veil,
      backdropFilter: 'blur(10px)',
      '-webkit-backdrop-filter': 'blur(10px)',
    } as ViewStyle,
  },

  // Elevation System - Subtle and Refined
  elevation: {
    rest: {
      shadowColor: AuraColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    } as ViewStyle,

    hover: {
      shadowColor: AuraColors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    } as ViewStyle,

    lifted: {
      shadowColor: AuraColors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    } as ViewStyle,

    floating: {
      shadowColor: AuraColors.shadow,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
      elevation: 12,
    } as ViewStyle,
  },

  // Border Radii - Soft and Organic
  borderRadius: {
    subtle: 8,
    soft: 12,
    gentle: 16,
    organic: 20,
    round: 24,
  },
} as const;

export const AuraBorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50,
} as const;

// Haptic Feedback Patterns
export const AuraHaptics = {
  // Light interactions
  whisper: 'impactLight',

  // Standard interactions
  touch: 'impactMedium',

  // Important moments
  confirm: 'impactHeavy',

  // Success states
  success: 'notificationSuccess',

  // Warning states
  warning: 'notificationWarning',

  // Selection
  selection: 'selection',
} as const;

// Component Presets
export const AuraComponents = {
  // The Sacred Container
  screen: {
    flex: 1,
    backgroundColor: AuraColors.vellum,
  } as ViewStyle,

  // The Breathing Card
  card: {
    backgroundColor: AuraColors.whisper,
    borderRadius: AuraMaterials.borderRadius.gentle,
    padding: AuraSpacing.lg,
    ...AuraMaterials.elevation.rest,
  } as ViewStyle,

  // The Gentle Button
  button: {
    primary: {
      backgroundColor: AuraColors.polishedJade,
      borderRadius: AuraMaterials.borderRadius.soft,
      paddingVertical: AuraSpacing.sm,
      paddingHorizontal: AuraSpacing.lg,
      ...AuraMaterials.elevation.hover,
    } as ViewStyle,

    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: AuraColors.polishedJade,
      borderRadius: AuraMaterials.borderRadius.soft,
      paddingVertical: AuraSpacing.sm,
      paddingHorizontal: AuraSpacing.lg,
    } as ViewStyle,

    ghost: {
      backgroundColor: 'transparent',
      paddingVertical: AuraSpacing.sm,
      paddingHorizontal: AuraSpacing.lg,
    } as ViewStyle,
  },

  // The Liquid Metal Accent
  accent: {
    backgroundColor: AuraColors.softGold,
    borderRadius: AuraMaterials.borderRadius.round,
    ...AuraMaterials.elevation.lifted,
  } as ViewStyle,
} as const;

// The Complete Aura Theme
export const AuraTheme = {
  colors: AuraColors,
  typography: AuraTypography,
  spacing: AuraSpacing,
  motion: AuraMotion,
  materials: AuraMaterials,
  borderRadius: AuraBorderRadius,
  haptics: AuraHaptics,
  components: AuraComponents,
};

export default AuraTheme;

// Legacy compatibility - prevent undefined errors
export const LuxuryTheme = AuraTheme;

// Type Exports
export type AuraThemeType = typeof AuraTheme;
export type AuraColorKeys = keyof typeof AuraColors;
export type AuraTypographyKeys = keyof typeof AuraTypography;
