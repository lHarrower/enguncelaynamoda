import { TextStyle, ViewStyle } from 'react-native';

/**
 * AYNAMODA Unified Design System
 * Consolidating all theme systems into one coherent foundation
 * 
 * Sources:
 * - APP_THEME_V2 (primary foundation - most adopted)
 * - AuraTheme (enhanced typography and materials)
 * - ArtistryTheme (glassmorphism and animations)
 * - LuxuryTheme (motion curves and spacing)
 */

// UNIFIED COLOR PALETTE - Based on APP_THEME_V2's Organic Palette
export const ORGANIC_PALETTE = {
  // Primary Foundation (from APP_THEME_V2)
  linen: '#FAF7F2',           // Soft, warm base
  inkGray: '#2C2C2C',         // Deep, sophisticated text
  sageGreen: '#A8B5A0',       // Calming, natural accent
  liquidGold: '#D4AF37',      // Luxury highlight
  
  // Secondary Palette
  dustyRose: '#D4A5A5',       // Gentle feminine touch
  charcoal: '#36454F',        // Strong contrast
  cream: '#F5F5DC',           // Soft alternative to white
  pearl: '#E8E8E8',           // Subtle borders and dividers
  
  // Enhanced from AuraTheme
  vellum: '#F8F7F4',          // Warm, textured off-white
  polishedJade: '#7A9E9F',    // Primary accent - moments of serenity
  whisper: '#F5F4F2',         // Lighter than vellum
  shadow: '#1A1A1A',          // Deeper than ink
  
  // Functional Colors
  success: '#7A9A7A',         // Muted green for success states
  warning: '#D4A574',         // Warm amber for warnings
  error: '#C4848C',           // Soft red for errors
  
  // Transparency Layers
  linenOpacity: 'rgba(250, 247, 242, 0.95)',
  inkOpacity: 'rgba(44, 44, 44, 0.8)',
  goldOpacity: 'rgba(212, 175, 55, 0.2)',
  
  // Glassmorphism Support (from ArtistryTheme)
  frostedGlass: 'rgba(248, 247, 244, 0.85)',
  deepFrost: 'rgba(248, 247, 244, 0.95)',
  veil: 'rgba(248, 247, 244, 0.4)',
} as const;

// ENHANCED TYPOGRAPHY - Combining APP_THEME_V2 + AuraTheme
export const EnhancedTypography = {
  // Editorial Hierarchy - Playfair Display (from AuraTheme)
  hero: {
    fontFamily: 'Playfair Display',
    fontSize: 42,
    fontWeight: '300' as const,
    lineHeight: 52,
    letterSpacing: -1,
    color: ORGANIC_PALETTE.inkGray,
  } as TextStyle,
  
  // Headlines (from APP_THEME_V2)
  headline: {
    fontFamily: 'Playfair Display',
    fontSize: 32,
    fontWeight: '600' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: ORGANIC_PALETTE.inkGray,
  } as TextStyle,
  
  title: {
    fontFamily: 'Playfair Display',
    fontSize: 24,
    fontWeight: '500' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
    color: ORGANIC_PALETTE.inkGray,
  } as TextStyle,
  
  subtitle: {
    fontFamily: 'Playfair Display',
    fontSize: 20,
    fontWeight: '400' as const,
    lineHeight: 28,
    letterSpacing: 0,
    color: ORGANIC_PALETTE.charcoal,
  } as TextStyle,
  
  // Body Text - Manrope (from APP_THEME_V2)
  body: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: ORGANIC_PALETTE.inkGray,
  } as TextStyle,
  
  bodyMedium: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: ORGANIC_PALETTE.inkGray,
  } as TextStyle,
  
  bodyLight: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '300' as const,
    lineHeight: 26,
    letterSpacing: 0.3,
    color: ORGANIC_PALETTE.inkGray,
  } as TextStyle,
  
  // Captions and Small Text
  caption: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: ORGANIC_PALETTE.charcoal,
  } as TextStyle,
  
  captionMedium: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: ORGANIC_PALETTE.charcoal,
  } as TextStyle,
  
  small: {
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: ORGANIC_PALETTE.charcoal,
  } as TextStyle,
  
  whisper: {
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '300' as const,
    lineHeight: 18,
    letterSpacing: 0.4,
    color: ORGANIC_PALETTE.inkGray,
    opacity: 0.6,
  } as TextStyle,
  
  // Special Styles
  luxury: {
    fontFamily: 'Playfair Display',
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    letterSpacing: -0.4,
    color: ORGANIC_PALETTE.liquidGold,
  } as TextStyle,
  
  accent: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: ORGANIC_PALETTE.sageGreen,
    textTransform: 'uppercase' as const,
  } as TextStyle,
  
  button: {
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  } as TextStyle,
} as const;

// UNIFIED MATERIALS - Combining glassmorphism from ArtistryTheme + AuraTheme
export const UnifiedMaterials = {
  // Glass Effects (from ArtistryTheme + AuraTheme)
  glass: {
    subtle: {
      backgroundColor: 'rgba(248, 247, 244, 0.4)',
      backdropFilter: 'blur(10px)',
      '-webkit-backdrop-filter': 'blur(10px)',
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    } as ViewStyle,
    
    medium: {
      backgroundColor: 'rgba(248, 247, 244, 0.85)',
      backdropFilter: 'blur(20px)',
      '-webkit-backdrop-filter': 'blur(20px)',
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    } as ViewStyle,
    
    heavy: {
      backgroundColor: 'rgba(248, 247, 244, 0.95)',
      backdropFilter: 'blur(30px)',
      '-webkit-backdrop-filter': 'blur(30px)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    } as ViewStyle,
    
    goldAura: {
      backgroundColor: 'rgba(212, 175, 55, 0.08)',
      backdropFilter: 'blur(35px)',
      '-webkit-backdrop-filter': 'blur(35px)',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.2)',
    } as ViewStyle,
  },
  
  // Elevation System (from APP_THEME_V2 + AuraTheme)
  elevation: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    } as ViewStyle,
    
    subtle: {
      shadowColor: ORGANIC_PALETTE.inkGray,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    } as ViewStyle,
    
    soft: {
      shadowColor: ORGANIC_PALETTE.inkGray,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    } as ViewStyle,
    
    medium: {
      shadowColor: ORGANIC_PALETTE.inkGray,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
      elevation: 8,
    } as ViewStyle,
    
    high: {
      shadowColor: ORGANIC_PALETTE.inkGray,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    } as ViewStyle,
    
    floating: {
      shadowColor: ORGANIC_PALETTE.shadow,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
      elevation: 12,
    } as ViewStyle,
  },
  
  // Border Radius (consolidated)
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 50,
    // Semantic names
    card: 12,
    button: 8,
    input: 6,
    modal: 16,
    // From ArtistryTheme
    gentle: 12,
    organic: 20,
    liquid: 32,
  },
} as const;

// UNIFIED MOTION - Combining timing from AuraTheme + curves from LuxuryTheme
export const UnifiedMotion = {
  // Timing (from AuraTheme)
  timing: {
    instant: 150,
    quick: 250,
    smooth: 350,
    gentle: 500,
    considered: 700,
    cinematic: 1000,
    // From APP_THEME_V2
    fast: 200,
    medium: 300,
    slow: 500,
    luxury: 800,
  },
  
  // Easing Curves (enhanced)
  curves: {
    // From AuraTheme
    confidence: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    overshoot: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    settle: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    delight: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    // From APP_THEME_V2
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
  },
  
  // Animation Presets (from ArtistryTheme)
  presets: {
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
    shimmer: {
      duration: 2000,
      easing: 'linear',
      opacity: { from: 0.3, to: 1 },
      scale: { from: 1, to: 1.05 },
    },
  },
} as const;

// UNIFIED SPACING - Consolidating all spacing systems
export const UnifiedSpacing = {
  // Base units (from APP_THEME_V2)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // From AuraTheme
  atom: 4,
  molecule: 8,
  breathe: 40,
  exhale: 80,
  pause: 120,
  
  // From ArtistryTheme
  breath: 4,
  whisper: 8,
  gentle: 12,
  flow: 16,
  dance: 24,
  float: 32,
  soar: 48,
  infinite: 64,
  cosmic: 96,
  universe: 128,
  
  // Semantic spacing (from APP_THEME_V2)
  cardPadding: 20,
  screenPadding: 24,
  sectionSpacing: 32,
  componentSpacing: 16,
} as const;

// UNIFIED COMPONENTS - Consolidated component styles
export const UnifiedComponents = {
  // Screen Base
  screen: {
    flex: 1,
    backgroundColor: ORGANIC_PALETTE.linen,
  } as ViewStyle,
  
  // Cards
  card: {
    default: {
      backgroundColor: ORGANIC_PALETTE.cream,
      borderRadius: UnifiedMaterials.borderRadius.card,
      padding: UnifiedSpacing.cardPadding,
      ...UnifiedMaterials.elevation.soft,
    } as ViewStyle,
    
    glass: {
      ...UnifiedMaterials.glass.medium,
      borderRadius: UnifiedMaterials.borderRadius.card,
      padding: UnifiedSpacing.cardPadding,
      ...UnifiedMaterials.elevation.soft,
    } as ViewStyle,
    
    luxury: {
      backgroundColor: ORGANIC_PALETTE.whisper,
      borderRadius: UnifiedMaterials.borderRadius.organic,
      padding: UnifiedSpacing.lg,
      ...UnifiedMaterials.elevation.high,
      borderWidth: 1,
      borderColor: ORGANIC_PALETTE.goldOpacity,
    } as ViewStyle,
  },
  
  // Buttons
  button: {
    primary: {
      backgroundColor: ORGANIC_PALETTE.sageGreen,
      borderRadius: UnifiedMaterials.borderRadius.button,
      paddingVertical: UnifiedSpacing.sm,
      paddingHorizontal: UnifiedSpacing.lg,
      ...UnifiedMaterials.elevation.soft,
    } as ViewStyle,
    
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: ORGANIC_PALETTE.sageGreen,
      borderRadius: UnifiedMaterials.borderRadius.button,
      paddingVertical: UnifiedSpacing.sm,
      paddingHorizontal: UnifiedSpacing.lg,
    } as ViewStyle,
    
    luxury: {
      backgroundColor: ORGANIC_PALETTE.liquidGold,
      borderRadius: UnifiedMaterials.borderRadius.button,
      paddingVertical: UnifiedSpacing.sm,
      paddingHorizontal: UnifiedSpacing.lg,
      ...UnifiedMaterials.elevation.medium,
    } as ViewStyle,
    
    ghost: {
      backgroundColor: 'transparent',
      paddingVertical: UnifiedSpacing.sm,
      paddingHorizontal: UnifiedSpacing.lg,
    } as ViewStyle,
  },
  
  // Input Fields
  input: {
    default: {
      backgroundColor: ORGANIC_PALETTE.cream,
      borderRadius: UnifiedMaterials.borderRadius.input,
      paddingHorizontal: UnifiedSpacing.md,
      paddingVertical: UnifiedSpacing.sm,
      borderWidth: 1,
      borderColor: ORGANIC_PALETTE.pearl,
      minHeight: 52,
    } as ViewStyle,
    
    focused: {
      borderColor: ORGANIC_PALETTE.sageGreen,
      ...UnifiedMaterials.elevation.subtle,
    } as ViewStyle,
  },
} as const;

// UNIFIED THEME - The complete design system
export const UnifiedTheme = {
  // Foundation
  colors: ORGANIC_PALETTE,
  typography: EnhancedTypography,
  materials: UnifiedMaterials,
  motion: UnifiedMotion,
  spacing: UnifiedSpacing,
  components: UnifiedComponents,
  
  // Legacy compatibility
  borderRadius: UnifiedMaterials.borderRadius,
  elevation: UnifiedMaterials.elevation,
  animation: UnifiedMotion,
  layout: {
    screenWidth: '100%',
    screenHeight: '100%',
    headerHeight: 60,
    tabBarHeight: 80,
    maxContentWidth: 400,
    cardWidth: '100%',
    buttonHeight: 48,
    inputHeight: 52,
  },
  
  // Semantic colors for easy migration
  semantic: {
    background: {
      primary: ORGANIC_PALETTE.linen,
      secondary: ORGANIC_PALETTE.cream,
      elevated: ORGANIC_PALETTE.whisper,
    },
    text: {
      primary: ORGANIC_PALETTE.inkGray,
      secondary: ORGANIC_PALETTE.charcoal,
      accent: ORGANIC_PALETTE.sageGreen,
      luxury: ORGANIC_PALETTE.liquidGold,
    },
    interactive: {
      primary: ORGANIC_PALETTE.sageGreen,
      secondary: ORGANIC_PALETTE.polishedJade,
      accent: ORGANIC_PALETTE.liquidGold,
    },
    status: {
      success: ORGANIC_PALETTE.success,
      warning: ORGANIC_PALETTE.warning,
      error: ORGANIC_PALETTE.error,
    },
  },
} as const;

// Type exports for TypeScript support
export type UnifiedThemeType = typeof UnifiedTheme;
export type ColorKeys = keyof typeof ORGANIC_PALETTE;
export type TypographyKeys = keyof typeof EnhancedTypography;
export type SpacingKeys = keyof typeof UnifiedSpacing;
export type ComponentKeys = keyof typeof UnifiedComponents;

// Default export
export default UnifiedTheme;

// Legacy exports for backward compatibility
export { UnifiedTheme as APP_THEME_V2 };
export { UnifiedTheme as AuraTheme };
export { UnifiedTheme as LuxuryTheme };
export const Colors = ORGANIC_PALETTE;
export const Typography = EnhancedTypography;
export const Spacing = UnifiedSpacing;