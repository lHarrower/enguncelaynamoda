// AYNAMODA AppThemeV2 - Digital Zen Garden Philosophy
// Advanced visual system with organic palette, sophisticated typography, and glassmorphism

import { TextStyle, ViewStyle } from 'react-native';

// ORGANIC PALETTE - Inspired by nature's subtle harmonies
export const ORGANIC_PALETTE = {
  // Primary Background - Linen with subtle variations
  linen: {
    base: '#FAF9F6',
    light: '#FCFBF8',
    dark: '#F7F6F3',
    texture: '#F9F8F5', // For noise overlay effect
  },
  
  // Accent Colors - Liquid metals and natural tones
  sageGreen: {
    50: '#F6F8F6',
    100: '#E8F0E8',
    200: '#D1E1D1',
    300: '#A8C8A8',
    400: '#7FA87F',
    500: '#5C8A5C', // Primary sage
    600: '#4A7A4A',
    700: '#3A5F3A',
    800: '#2D4A2D',
    900: '#1F341F',
  },
  
  liquidGold: {
    50: '#FFFEF7',
    100: '#FFF9E6',
    200: '#FFF2CC',
    300: '#FFE599',
    400: '#FFD666',
    500: '#D4AF37', // Primary liquid gold
    600: '#B8941F',
    700: '#9C7A0F',
    800: '#806108',
    900: '#644904',
  },
  
  inkGray: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#212529', // Primary ink gray
    900: '#1A1D20',
  },
  
  // Emotional accent colors
  whisperWhite: '#FEFEFE',
  cloudGray: '#F5F5F7',
  moonlightSilver: '#E8E8EA',
  shadowCharcoal: '#2C2C2E',
};

// ADVANCED TYPOGRAPHY SYSTEM
export const TYPOGRAPHY_V2 = {
  // Font Families - Professional grade
  fonts: {
    headline: 'Playfair Display', // Butler alternative for React Native
    body: 'Inter', // Satoshi alternative - clean, modern
    accent: 'Playfair Display',
  },
  
  // Typographic Hierarchy with precise scales
  scale: {
    // Headlines - Expressive and commanding
    hero: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '700' as TextStyle['fontWeight'],
      letterSpacing: -0.5,
      fontFamily: 'Playfair Display',
    },
    
    h1: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '700' as TextStyle['fontWeight'],
      letterSpacing: -0.3,
      fontFamily: 'Playfair Display',
    },
    
    h2: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: -0.2,
      fontFamily: 'Playfair Display',
    },
    
    h3: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: -0.1,
      fontFamily: 'Inter',
    },
    
    // Body Text - Readable and harmonious
    body1: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 0,
      fontFamily: 'Inter',
    },
    
    body2: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 0.1,
      fontFamily: 'Inter',
    },
    
    // Whispers - Gentle, poetic text
    whisper: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 0.2,
      fontFamily: 'Playfair Display',
      fontStyle: 'italic' as TextStyle['fontStyle'],
    },
    
    // UI Elements
    button: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: 0.5,
      fontFamily: 'Inter',
    },
    
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as TextStyle['fontWeight'],
      letterSpacing: 0.8,
      fontFamily: 'Inter',
    },
  },
};

// GLASSMORPHISM SYSTEM - Frosted glass effects
export const GLASSMORPHISM = {
  // Primary glass effect for overlays
  primary: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  } as ViewStyle,
  
  // Subtle glass for cards
  subtle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  } as ViewStyle,
  
  // Dark glass for contrast
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(15px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  } as ViewStyle,
  
  // Liquid gold glass
  gold: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    backdropFilter: 'blur(12px)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  } as ViewStyle,
};

// ELEVATION SYSTEM - Sophisticated shadows and depth
export const ELEVATION_V2 = {
  // Floating elements
  float: {
    shadowColor: ORGANIC_PALETTE.shadowCharcoal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  } as ViewStyle,
  
  // Gentle lift
  lift: {
    shadowColor: ORGANIC_PALETTE.shadowCharcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  } as ViewStyle,
  
  // Subtle presence
  whisper: {
    shadowColor: ORGANIC_PALETTE.shadowCharcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
  
  // Dramatic depth
  dramatic: {
    shadowColor: ORGANIC_PALETTE.shadowCharcoal,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 16,
  } as ViewStyle,
};

// ANIMATION CURVES - Natural, organic motion
export const ANIMATION_CURVES = {
  // Gentle, organic easing
  organic: {
    tension: 100,
    friction: 8,
  },
  
  // Liquid, flowing motion
  liquid: {
    tension: 120,
    friction: 10,
  },
  
  // Zen-like, peaceful transitions
  zen: {
    tension: 80,
    friction: 12,
  },
  
  // Whisper-soft animations
  whisper: {
    tension: 60,
    friction: 15,
  },
};

// SPACING SYSTEM - Harmonious proportions based on golden ratio
export const SPACING_V2 = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  zen: 64, // Special zen spacing for breathing room
  sanctuary: 96, // Maximum breathing space
};

// BORDER RADIUS SYSTEM - Organic, soft corners
export const RADIUS_V2 = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  organic: 20, // Naturally pleasing radius
  liquid: 28, // Flowing, liquid-like corners
  zen: 32, // Maximum softness
  circle: 9999, // Perfect circles
};

// COMPLETE THEME OBJECT
export const APP_THEME_V2 = {
  colors: ORGANIC_PALETTE,
  typography: TYPOGRAPHY_V2,
  glassmorphism: GLASSMORPHISM,
  elevation: ELEVATION_V2,
  animation: ANIMATION_CURVES,
  spacing: SPACING_V2,
  radius: RADIUS_V2,
  
  // Semantic color mappings for consistent usage
  semantic: {
    background: {
      primary: ORGANIC_PALETTE.linen.base,
      secondary: ORGANIC_PALETTE.linen.light,
      tertiary: ORGANIC_PALETTE.linen.dark,
      elevated: ORGANIC_PALETTE.whisperWhite,
      overlay: 'rgba(0, 0, 0, 0.05)',
    },
    surface: {
      primary: ORGANIC_PALETTE.whisperWhite,
      secondary: ORGANIC_PALETTE.cloudGray,
    },
    primary: ORGANIC_PALETTE.sageGreen[500],
    secondary: ORGANIC_PALETTE.liquidGold[500],
    accent: ORGANIC_PALETTE.liquidGold[400],
    text: {
      primary: ORGANIC_PALETTE.inkGray[800],
      secondary: ORGANIC_PALETTE.inkGray[600],
      tertiary: ORGANIC_PALETTE.inkGray[400],
      inverse: ORGANIC_PALETTE.whisperWhite,
    },
    border: {
      primary: ORGANIC_PALETTE.moonlightSilver,
      secondary: ORGANIC_PALETTE.inkGray[200],
    },
    success: ORGANIC_PALETTE.sageGreen[500],
    warning: ORGANIC_PALETTE.liquidGold[500],
    error: '#E57373',
  },
};

export default APP_THEME_V2;