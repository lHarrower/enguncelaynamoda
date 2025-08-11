/**
 * CONSOLIDATED DESIGN SYSTEM
 * Single source of truth for all design tokens
 * OPERATION: PHOENIX - Architectural Rebuild
 */

import { SPRING, TIMING } from './foundations/Animation';
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
    200: '#F2EDE4',
    300: '#FFE599',
    400: '#F0D666',
    500: '#D4AF37',          // Elegant gold accent
    600: '#B8993F',
    700: '#9C7A0F',
    800: '#5A4235',
    900: '#3A2B23'
  },
  
  liquidGold: {
    100: '#FDF8F0',
    200: '#FAF0E1',
    300: '#FFE599',
    400: '#F0D666',
    500: '#D4AF37',
    600: '#B8993F',
    700: '#9C7A0F',
    800: '#9A8239',
    900: '#7A652B'
  },
  
  inkGray: {
    100: '#F8F9FA',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#212529'
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
    100: '#FFF5F5',
    200: '#FED7D7',
    300: '#FEB2B2',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#C53030',
    800: '#9B2C2C',
    900: '#742A2A'
  },
  
  amber: {
    100: '#FFFBEB',
    200: '#FDE68A',
    300: '#FDE68A',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12'
  },
  
  charcoal: {
    100: '#F7F8F9',
    200: '#E1E5E9',
    300: '#C7CDD3',
    400: '#6B7280',
    500: '#4B5563',
    600: '#374151',
    700: '#1F2937',
    800: '#111827',
    900: '#111827'
  },
  
  sageGreen: {
    100: '#E8F0E8',
    200: '#D1E1D1',
    300: '#A8C8A8',
    400: '#7FA87F',
    500: '#5C8A5C',
    600: '#4A7A4A',
    700: '#3A5F3A',
    800: '#203020',
    900: '#101810'
  },
  
  neutral: {
    50: '#F9FAFB',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#404040',
    800: '#1F2937',
    900: '#171717'
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
  
  primary: {
    100: '#F5F2EF',
    200: '#EBE4DE',
    300: '#D6C7B8',
    400: '#C1AA92',
    500: '#B8A082',
    600: '#9A8A6E',
    700: '#7C745A',
    800: '#5E5E46',
    900: '#404832'
  },
  
  secondary: {
    100: '#F9F7F4',
    200: '#F2EDE4',
    300: '#E8DCC6',
    400: '#D4C5A0',
    500: '#B8A082',
    600: '#9A7B5F',
    700: '#7A5D47',
    800: '#5A4235',
    900: '#3A2B23'
  },
  
  // Functional Colors with scales
  success: {
    100: '#F0F9F0',
    200: '#D4F4D4',
    300: '#A8E8A8',
    400: '#7FA87F',
    500: '#5C8A5C',
    600: '#4A7A4A',
    700: '#307030',
    800: '#204020',
    900: '#101010'
  },
  
  warning: {
    100: '#FFF8E1',
    200: '#FFECB3',
    300: '#FFE082',
    400: '#F0D666',
    500: '#D4AF37',
    600: '#B8993F',
    700: '#FF8F00',
    800: '#FF6F00',
    900: '#E65100'
  },
  
  error: {
    100: '#FFEBEE',
    200: '#FFCDD2',
    300: '#EF9A9A',
    400: '#F87171',
    500: '#E57373',
    600: '#DC2626',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C'
  },
  
  info: {
    400: '#93C5FD',
    500: '#74C0FC',
    600: '#3B82F6'
  },
  
  lavender: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
} as const;

// TYPOGRAPHY SYSTEM - Elegant serif headlines with clean sans-serif body
export const TYPOGRAPHY = {
  fontFamily: {
    headline: 'Playfair Display',  // Elegant serif for headlines
    body: 'Inter',                 // Clean sans-serif for body
    accent: 'Playfair Display',    // Serif for special elements
    serif: 'Playfair Display',     // Serif font family
    sans: 'Inter',                 // Sans-serif font family
    primary: 'Inter_400Regular',
    secondary: 'PlayfairDisplay_400Regular'
  },

  scale: {
    hero: { fontSize: 36, lineHeight: 44, fontWeight: '700' as const },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
    h2: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
    h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
    h4: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
    h5: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
    h6: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
    caption: { fontSize: 12, fontFamily: 'Inter_400Regular' }
  },

  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24
  },

  heading: {
    h1: { fontSize: 32, fontFamily: 'PlayfairDisplay_400Regular', fontWeight: '700' },
    h2: { fontSize: 28, fontFamily: 'PlayfairDisplay_400Regular', fontWeight: '600' },
    h3: { fontSize: 24, fontFamily: 'PlayfairDisplay_400Regular', fontWeight: '600' },
    h4: { fontSize: 20, fontFamily: 'Inter_400Regular', fontWeight: '600' },
    h5: { fontSize: 18, fontFamily: 'Inter_400Regular', fontWeight: '600' },
    h6: { fontSize: 16, fontFamily: 'Inter_400Regular', fontWeight: '600' }
  },

  body: {
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
      fontFamily: 'Inter'
    },
    medium: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
      fontFamily: 'Inter'
    },
    large: {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: '400' as const,
      fontFamily: 'Inter'
    },
    // Legacy aliases for backward compatibility
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    fontFamily: 'Inter'
  },

  // Legacy body variants for backward compatibility
  body1: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    fontFamily: 'Inter'
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    fontFamily: 'Inter'
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    fontFamily: 'Inter'
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    fontFamily: 'Inter'
  },

  button: {
    small: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '600' as const,
      fontFamily: 'Inter'
    },
    medium: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '600' as const,
      fontFamily: 'Inter'
    },
    large: {
      fontSize: 18,
      lineHeight: 22,
      fontWeight: '600' as const,
      fontFamily: 'Inter'
    }
  },

  caption: {
    small: {
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '500' as const,
      fontFamily: 'Inter'
    },
    medium: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as const,
      fontFamily: 'Inter'
    },
    large: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '500' as const,
      fontFamily: 'Inter'
    }
  },

  overline: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    fontFamily: 'Inter',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2
  },

  family: {
    primary: 'Inter_400Regular',
    secondary: 'PlayfairDisplay_400Regular'
  },

  // Font sizes for backward compatibility
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24
  },

  // Font weights for backward compatibility
  weights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const
  }
} as const;

// SPACING & LAYOUT SYSTEM - Harmonious proportions
export const SPACING = {
  xs: 4, 
  sm: 8, 
  md: 12, 
  lg: 16, 
  xl: 24, 
  xxl: 32, 
  xxxl: 48,
  zen: 64,        // Special zen spacing for breathing room
  sanctuary: 96,   // Maximum breathing space
  // Aliases for legacy usages
  small: 8,
  medium: 12,
  large: 16
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
  } as ViewStyle,
  // Legacy aliases
  subtle: undefined as unknown as ViewStyle, // filled later via DesignSystem.elevation
  md: undefined as unknown as ViewStyle // filled later via DesignSystem.elevation
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
  pill: 999,        // Fully rounded pill shape
  // Alias used in some components for fully rounded chips/buttons
  full: 999,
  // Legacy alias
  large: 12
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

export const DesignSystem = {
  colors: {
    ...UNIFIED_COLORS,
    // Explicitly ensure primary is available (fix for TypeError)
    primary: UNIFIED_COLORS.primary[500], // Use primary color scale value
    // Provide common palette aliases used throughout UI
    success: {
      ...UNIFIED_COLORS.success,
      main: UNIFIED_COLORS.success[500],
      light: UNIFIED_COLORS.success[100],
      contrast: UNIFIED_COLORS.text.inverse
    },
    warning: {
      ...UNIFIED_COLORS.warning,
      main: UNIFIED_COLORS.warning[500],
      light: UNIFIED_COLORS.warning[100],
      contrast: UNIFIED_COLORS.text.primary
    },
    error: {
      ...UNIFIED_COLORS.error,
      main: UNIFIED_COLORS.error[600],
      light: UNIFIED_COLORS.error[100],
      contrast: UNIFIED_COLORS.text.inverse
    },
    info: {
      ...UNIFIED_COLORS.info,
      main: UNIFIED_COLORS.info[600],
      light: UNIFIED_COLORS.info[400],
      contrast: UNIFIED_COLORS.text.inverse
    },
    border: {
      primary: UNIFIED_COLORS.neutral[300],
      secondary: UNIFIED_COLORS.neutral[200],
      accent: UNIFIED_COLORS.gold[400],
      // Back-compat for glass borders referenced in some components
      glass: UNIFIED_COLORS.border.glass
    },
    surface: {
      primary: UNIFIED_COLORS.background.primary,
      secondary: UNIFIED_COLORS.background.secondary,
      tertiary: UNIFIED_COLORS.background.tertiary,
      elevated: UNIFIED_COLORS.background.elevated
    },
    // Neutral aliases used in components
    neutral: {
      ...UNIFIED_COLORS.neutral,
      charcoal: UNIFIED_COLORS.neutral[800],
      slate: UNIFIED_COLORS.neutral[500],
      mist: UNIFIED_COLORS.neutral[100],
      pearl: UNIFIED_COLORS.neutral[50]
    },
    // Accent shortcuts referenced across the app
    accent: {
      mint: UNIFIED_COLORS.sage[300],
      lavender: UNIFIED_COLORS.lavender[400],
      coral: UNIFIED_COLORS.coral[400],
      gold: UNIFIED_COLORS.gold[400]
    },
    // Semantic/status helpers used by some components
    semantic: {
      success: UNIFIED_COLORS.success[500],
      warning: UNIFIED_COLORS.warning[500],
      error: UNIFIED_COLORS.error[600]
    },
    status: {
      success: UNIFIED_COLORS.success[500],
      warning: UNIFIED_COLORS.warning[500],
      error: UNIFIED_COLORS.error[600]
    },
    shadow: {
      primary: UNIFIED_COLORS.text.primary
    }
  },
  typography: {
    ...TYPOGRAPHY,
    // Legacy alias used by a few components
    display: TYPOGRAPHY.heading.h2,
    // Back-compat: some components use typography.scale.button
    scale: {
      ...TYPOGRAPHY.scale,
      button: TYPOGRAPHY.button.medium,
      // Back-compat body variants referenced as scale.body1/body2
      body1: TYPOGRAPHY.body1,
      body2: TYPOGRAPHY.body2
    },
    // Common shorthand aliases used in components
    small: TYPOGRAPHY.body.small,
    // Extend fontFamily with legacy keys
    fontFamily: {
      ...TYPOGRAPHY.fontFamily,
      heading: TYPOGRAPHY.fontFamily.headline,
      button: TYPOGRAPHY.fontFamily.body
    }
  },
  spacing: SPACING,
  // Add common spacing aliases used in some components
  get spacingAliases() { return undefined; },
  // Note: expose aliases directly on spacing for convenience
  // Typescript can't reflect getters on const, so spread into an object below
  // Extend layout with common card shortcut used in legacy components
  layout: {
    ...LAYOUT,
    card: {
      borderRadius: 12,
      padding: SPACING.lg,
      backgroundColor: UNIFIED_COLORS.background.elevated
    } as ViewStyle
  },
  elevation: {
    ...ELEVATION,
    // Back-compat aliases used by legacy components
    subtle: ELEVATION.soft,
    large: ELEVATION.high,
  md: ELEVATION.medium,
  lift: ELEVATION.high,
  // Additional alias sometimes referenced
  gentle: ELEVATION.soft
  },
  shadows: ELEVATION, // Alias for backward compatibility
  effects: {
    elevation: ELEVATION,
    // Simple shadow alias used by some components
    shadow: ELEVATION.soft
  },
  borderRadius: BORDER_RADIUS,
  radius: BORDER_RADIUS, // Alias for backward compatibility
  animations: {
    spring: {
      ...SPRING,
      // Alias used by some components
      confident: SPRING.smooth
    }
  },
  // Motion alias used by some components
  motion: {
    spring: SPRING,
    duration: {
      quick: TIMING.quick,
      smooth: TIMING.comfortable,
      graceful: TIMING.deliberate
    },
    // Back-compat timing alias
    timing: {
      instant: TIMING.instant,
      quick: TIMING.quick,
      standard: TIMING.standard,
      comfortable: TIMING.comfortable,
      deliberate: TIMING.deliberate,
      cinematic: TIMING.deliberate
    }
  },
  glassmorphism: GLASSMORPHISM,
  components: {
    card: {
      borderRadius: BORDER_RADIUS.xl
    } as ViewStyle
  },
  layouts: {}
} as const;

export type DesignSystemType = typeof DesignSystem;

// Add @shopify/restyle compatible theme structure
export const RestyleTheme = {
  colors: {
    // Keep nested structure for direct access first
    ...UNIFIED_COLORS,
    
    // Ensure primary is always available as both nested and flat
    primary: {
      ...UNIFIED_COLORS.primary,
      // Add toString method for compatibility
      toString: () => UNIFIED_COLORS.primary[500],
      // Add default value property for fallback
      valueOf: () => UNIFIED_COLORS.primary[500],
      // Add default property for direct access
      default: UNIFIED_COLORS.primary[500]
    },
    
    // Flat structure for @shopify/restyle compatibility
    primaryFlat: UNIFIED_COLORS.primary[500], // Use primary color scale value
    background: UNIFIED_COLORS.background.primary,
    surface: UNIFIED_COLORS.background.elevated,
    card: UNIFIED_COLORS.background.secondary,
    border: UNIFIED_COLORS.border.primary,
    notification: UNIFIED_COLORS.coral[500],
    tint: UNIFIED_COLORS.sage[500], // Primary brand color
    text: UNIFIED_COLORS.text.primary
  },
  spacing: SPACING,
  borderRadii: BORDER_RADIUS,
  textVariants: {
    header: {
      fontFamily: TYPOGRAPHY.family.secondary,
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: '600',
      color: 'text'
    },
    body: {
      fontFamily: TYPOGRAPHY.family.primary,
      fontSize: TYPOGRAPHY.fontSize.md,
      color: 'text'
    },
    caption: {
      fontFamily: TYPOGRAPHY.family.primary,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: 'text'
    }
  },
  cardVariants: {
    defaults: {
      backgroundColor: 'surface',
      borderRadius: 'md',
      padding: 'lg'
    }
  }
};

export type RestyleThemeType = typeof RestyleTheme;

export default DesignSystem;