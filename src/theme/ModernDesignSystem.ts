/**
 * MODERN UI/UX DESIGN SYSTEM
 * Next-generation design tokens and components
 * Enhanced for premium fashion applications
 */

import { ViewStyle } from 'react-native';

import { BORDER_RADIUS, ELEVATION, SPACING, TYPOGRAPHY, UNIFIED_COLORS } from './DesignSystem';

// MODERN COLOR EXTENSIONS
export const MODERN_COLORS = {
  // Gradient Collections
  gradients: {
    primary: {
      luxury: ['#D4AF37', '#F0D666', '#FFE599'],
      sage: ['#5C8A5C', '#7FA87F', '#A8C8A8'],
      sunset: ['#FF8F00', '#FFB74D', '#FFCC80'],
      ocean: ['#0277BD', '#0288D1', '#03A9F4'],
      lavender: ['#7B1FA2', '#8E24AA', '#9C27B0'],
    },
    backgrounds: {
      warm: ['#FAF9F6', '#F8F7F4', '#F3F4F6'],
      cool: ['#F8FAFC', '#F1F5F9', '#E2E8F0'],
      neutral: ['#FAFAFA', '#F5F5F5', '#EEEEEE'],
    },
  },

  // Semantic Color System
  semantic: {
    brand: {
      primary: '#5C8A5C',
      secondary: '#D4AF37',
      tertiary: '#B8A082',
    },
    feedback: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    interactive: {
      primary: '#5C8A5C',
      secondary: '#D4AF37',
      tertiary: '#9CA3AF',
      disabled: '#D1D5DB',
    },
  },

  // Advanced Color Tokens
  tokens: {
    surface: {
      primary: '#FFFFFF',
      secondary: '#FAF9F6',
      tertiary: '#F8F7F4',
      elevated: '#FEFEFE',
      overlay: 'rgba(0, 0, 0, 0.4)',
      glass: 'rgba(255, 255, 255, 0.15)',
    },
    content: {
      primary: '#212529',
      secondary: '#495057',
      tertiary: '#6C757D',
      inverse: '#FFFFFF',
      disabled: '#9CA3AF',
    },
    border: {
      primary: '#E5E7EB',
      secondary: '#D1D5DB',
      focus: '#5C8A5C',
      error: '#EF4444',
      success: '#10B981',
    },
  },
} as const;

// MODERN TYPOGRAPHY SYSTEM
export const MODERN_TYPOGRAPHY = {
  // Font Stacks
  fontStacks: {
    display: ['Playfair Display', 'Georgia', 'serif'],
    body: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['SF Mono', 'Monaco', 'monospace'],
  },

  // Type Scale
  scale: {
    display: {
      large: { fontSize: 48, lineHeight: 56, fontWeight: '700', letterSpacing: -0.02 },
      medium: { fontSize: 36, lineHeight: 44, fontWeight: '700', letterSpacing: -0.02 },
      small: { fontSize: 28, lineHeight: 36, fontWeight: '700', letterSpacing: -0.01 },
    },
    headline: {
      large: { fontSize: 24, lineHeight: 32, fontWeight: '600', letterSpacing: 0 },
      medium: { fontSize: 20, lineHeight: 28, fontWeight: '600', letterSpacing: 0 },
      small: { fontSize: 18, lineHeight: 26, fontWeight: '600', letterSpacing: 0 },
    },
    title: {
      large: { fontSize: 16, lineHeight: 24, fontWeight: '600', letterSpacing: 0.01 },
      medium: { fontSize: 14, lineHeight: 20, fontWeight: '600', letterSpacing: 0.01 },
      small: { fontSize: 12, lineHeight: 18, fontWeight: '600', letterSpacing: 0.01 },
    },
    body: {
      large: { fontSize: 16, lineHeight: 24, fontWeight: '400', letterSpacing: 0 },
      medium: { fontSize: 14, lineHeight: 20, fontWeight: '400', letterSpacing: 0 },
      small: { fontSize: 12, lineHeight: 16, fontWeight: '400', letterSpacing: 0 },
    },
    label: {
      large: { fontSize: 14, lineHeight: 18, fontWeight: '500', letterSpacing: 0.01 },
      medium: { fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 0.01 },
      small: { fontSize: 10, lineHeight: 14, fontWeight: '500', letterSpacing: 0.02 },
    },
  },

  // Responsive Typography
  responsive: {
    hero: {
      mobile: { fontSize: 28, lineHeight: 36 },
      tablet: { fontSize: 36, lineHeight: 44 },
      desktop: { fontSize: 48, lineHeight: 56 },
    },
    heading: {
      mobile: { fontSize: 20, lineHeight: 28 },
      tablet: { fontSize: 24, lineHeight: 32 },
      desktop: { fontSize: 28, lineHeight: 36 },
    },
  },
} as const;

// MODERN SPACING SYSTEM
export const MODERN_SPACING = {
  // Base Scale (4px)
  scale: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    32: 128,
  },

  // Semantic Spacing
  semantic: {
    component: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
    },
    layout: {
      xs: 8,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 48,
      xxl: 64,
    },
    content: {
      xs: 12,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 48,
    },
  },

  // Responsive Spacing
  responsive: {
    container: {
      mobile: 16,
      tablet: 24,
      desktop: 32,
    },
    section: {
      mobile: 24,
      tablet: 32,
      desktop: 48,
    },
  },
} as const;

// MODERN ELEVATION SYSTEM
export const MODERN_ELEVATION = {
  // Elevation Levels
  levels: {
    0: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    1: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    2: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    3: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    4: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
      elevation: 8,
    },
    5: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 16,
    },
  },

  // Semantic Shadows
  semantic: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    modal: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
      elevation: 8,
    },
    floating: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
  },
} as const;

// MODERN BORDER RADIUS SYSTEM
export const MODERN_RADIUS = {
  // Scale
  scale: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },

  // Semantic Radius
  semantic: {
    button: 8,
    card: 12,
    input: 8,
    modal: 16,
    image: 8,
    avatar: 9999,
  },
} as const;

// MODERN ANIMATION SYSTEM
export const MODERN_ANIMATIONS = {
  // Duration
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  // Easing
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Presets
  presets: {
    fadeIn: {
      duration: 250,
      easing: 'ease-out',
    },
    slideUp: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    bounce: {
      duration: 400,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
} as const;

// MODERN COMPONENT TOKENS
export const MODERN_COMPONENTS = {
  button: {
    primary: {
      backgroundColor: MODERN_COLORS.semantic.brand.primary,
      borderRadius: MODERN_RADIUS.semantic.button,
      paddingVertical: MODERN_SPACING.semantic.component.md,
      paddingHorizontal: MODERN_SPACING.semantic.component.lg,
      ...MODERN_ELEVATION.semantic.floating,
    } as ViewStyle,
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: MODERN_COLORS.tokens.border.primary,
      borderRadius: MODERN_RADIUS.semantic.button,
      paddingVertical: MODERN_SPACING.semantic.component.md,
      paddingHorizontal: MODERN_SPACING.semantic.component.lg,
    } as ViewStyle,
  },

  card: {
    default: {
      backgroundColor: MODERN_COLORS.tokens.surface.primary,
      borderRadius: MODERN_RADIUS.semantic.card,
      padding: MODERN_SPACING.semantic.content.md,
      ...MODERN_ELEVATION.semantic.card,
    } as ViewStyle,
    elevated: {
      backgroundColor: MODERN_COLORS.tokens.surface.elevated,
      borderRadius: MODERN_RADIUS.semantic.card,
      padding: MODERN_SPACING.semantic.content.lg,
      ...MODERN_ELEVATION.semantic.modal,
    } as ViewStyle,
  },

  input: {
    default: {
      backgroundColor: MODERN_COLORS.tokens.surface.secondary,
      borderWidth: 1,
      borderColor: MODERN_COLORS.tokens.border.primary,
      borderRadius: MODERN_RADIUS.semantic.input,
      paddingVertical: MODERN_SPACING.semantic.component.md,
      paddingHorizontal: MODERN_SPACING.semantic.component.lg,
    } as ViewStyle,
    focused: {
      borderColor: MODERN_COLORS.tokens.border.focus,
      ...MODERN_ELEVATION.levels[1],
    } as ViewStyle,
  },
} as const;

// CONSOLIDATED MODERN DESIGN SYSTEM
export const ModernDesignSystem = {
  colors: {
    ...UNIFIED_COLORS,
    ...MODERN_COLORS,
  },
  typography: {
    ...TYPOGRAPHY,
    ...MODERN_TYPOGRAPHY,
  },
  spacing: {
    ...SPACING,
    ...MODERN_SPACING,
  },
  elevation: {
    ...ELEVATION,
    ...MODERN_ELEVATION,
  },
  borderRadius: {
    ...BORDER_RADIUS,
    ...MODERN_RADIUS,
  },
  animations: MODERN_ANIMATIONS,
  components: MODERN_COMPONENTS,
} as const;

export type ModernDesignSystemType = typeof ModernDesignSystem;
export default ModernDesignSystem;
