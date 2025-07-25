// AYNAMODA Premium Theme System - Industry-Leading UI Design
// Elevating fashion app interfaces to luxury standards with meditative, confidence-building experiences

import { TextStyle, ViewStyle } from 'react-native';

// PREMIUM COLOR PALETTE - Inspired by haute couture and luxury fashion houses
export const PREMIUM_PALETTE = {
  // Primary Brand Colors - Sophisticated and timeless
  obsidian: {
    50: '#F8F9FA',
    100: '#F1F3F4',
    200: '#E8EAED',
    300: '#DADCE0',
    400: '#BDC1C6',
    500: '#9AA0A6',
    600: '#80868B',
    700: '#5F6368',
    800: '#3C4043',
    900: '#202124', // Primary obsidian - deep, confident black
  },
  
  // Accent Colors - Liquid luxury metals
  champagne: {
    50: '#FFFEF7',
    100: '#FFFAEB',
    200: '#FFF4D6',
    300: '#FFEBAD',
    400: '#FFDD75',
    500: '#F4C430', // Primary champagne gold
    600: '#E6B800',
    700: '#CC9900',
    800: '#B38600',
    900: '#996600',
  },
  
  platinum: {
    50: '#FAFBFC',
    100: '#F1F3F4',
    200: '#E8EAED',
    300: '#DADCE0',
    400: '#BDC1C6',
    500: '#9AA0A6', // Primary platinum silver
    600: '#80868B',
    700: '#5F6368',
    800: '#3C4043',
    900: '#202124',
  },
  
  // Emotional Colors - Confidence and serenity
  confidence: {
    50: '#FFF8F5',
    100: '#FFEDE5',
    200: '#FFD6C2',
    300: '#FFB894',
    400: '#FF9466',
    500: '#E67E22', // Warm confidence orange
    600: '#D35400',
    700: '#BA4A00',
    800: '#A04000',
    900: '#873600',
  },
  
  serenity: {
    50: '#F0F8FF',
    100: '#E6F3FF',
    200: '#CCE7FF',
    300: '#99D6FF',
    400: '#66C2FF',
    500: '#3498DB', // Calm serenity blue
    600: '#2980B9',
    700: '#21618C',
    800: '#1B4F72',
    900: '#154360',
  },
  
  // Neutral Foundation - Premium whites and grays
  pearl: '#FEFEFE',
  silk: '#FDFDFD',
  cashmere: '#FBFBFB',
  linen: '#F9F9F9',
  dove: '#F5F5F5',
  mist: '#F0F0F0',
  stone: '#E5E5E5',
  charcoal: '#2C2C2C',
  midnight: '#1A1A1A',
};

// LUXURY TYPOGRAPHY SYSTEM - Fashion magazine quality
export const LUXURY_TYPOGRAPHY = {
  // Font Families - Premium typefaces
  fonts: {
    display: 'Playfair Display', // Elegant serif for headlines
    body: 'Inter', // Clean sans-serif for readability
    accent: 'Karla', // Geometric sans for UI elements
    script: 'Playfair Display', // Italic script for poetry
  },
  
  // Typography Scale - Harmonious proportions
  scale: {
    // Display Typography - Magazine-style headlines
    hero: {
      fontSize: 42,
      lineHeight: 52,
      fontWeight: '700' as TextStyle['fontWeight'],
      letterSpacing: -0.8,
      fontFamily: 'Playfair Display',
    },
    
    display: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '700' as TextStyle['fontWeight'],
      letterSpacing: -0.6,
      fontFamily: 'Playfair Display',
    },
    
    headline1: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: -0.4,
      fontFamily: 'Playfair Display',
    },
    
    headline2: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: -0.3,
      fontFamily: 'Inter',
    },
    
    headline3: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: -0.2,
      fontFamily: 'Inter',
    },
    
    // Body Typography - Readable and elegant
    body1: {
      fontSize: 18,
      lineHeight: 28,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 0,
      fontFamily: 'Inter',
    },
    
    body2: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 0.1,
      fontFamily: 'Inter',
    },
    
    body3: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 0.15,
      fontFamily: 'Inter',
    },
    
    // UI Typography - Interface elements
    button: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: 0.8,
      fontFamily: 'Inter',
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
    
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as TextStyle['fontWeight'],
      letterSpacing: 1.2,
      fontFamily: 'Inter',
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
    
    // Poetic Typography - Emotional moments
    poetry: {
      fontSize: 20,
      lineHeight: 30,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 0.3,
      fontFamily: 'Playfair Display',
      fontStyle: 'italic' as TextStyle['fontStyle'],
    },
    
    whisper: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '300' as TextStyle['fontWeight'],
      letterSpacing: 0.5,
      fontFamily: 'Playfair Display',
      fontStyle: 'italic' as TextStyle['fontStyle'],
    },
  },
};

// ADVANCED GLASSMORPHISM - Next-generation frosted glass effects
export const PREMIUM_GLASSMORPHISM = {
  // Luxury Glass Effects
  couture: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(40px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  } as ViewStyle,
  
  // Subtle Elegance
  silk: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle,
  
  // Dark Luxury
  obsidian: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(30px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  } as ViewStyle,
  
  // Champagne Glow
  champagne: {
    backgroundColor: 'rgba(244, 196, 48, 0.12)',
    backdropFilter: 'blur(25px)',
    borderWidth: 1,
    borderColor: 'rgba(244, 196, 48, 0.25)',
    shadowColor: '#F4C430',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  } as ViewStyle,
};

// PREMIUM ELEVATION SYSTEM - Sophisticated depth and shadows
export const LUXURY_ELEVATION = {
  // Floating Elements
  levitate: {
    shadowColor: PREMIUM_PALETTE.midnight,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 16,
  } as ViewStyle,
  
  // Elevated Cards
  elevate: {
    shadowColor: PREMIUM_PALETTE.midnight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  } as ViewStyle,
  
  // Gentle Lift
  lift: {
    shadowColor: PREMIUM_PALETTE.midnight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle,
  
  // Subtle Presence
  hover: {
    shadowColor: PREMIUM_PALETTE.midnight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
  
  // Dramatic Depth
  dramatic: {
    shadowColor: PREMIUM_PALETTE.midnight,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.25,
    shadowRadius: 48,
    elevation: 24,
  } as ViewStyle,
};

// PREMIUM SPACING SYSTEM - Golden ratio based proportions
export const LUXURY_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  zen: 64,
  sanctuary: 96,
  cathedral: 128, // Maximum breathing space for hero sections
};

// PREMIUM BORDER RADIUS - Organic, sophisticated curves
export const LUXURY_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  organic: 28, // Natural, pleasing curves
  flowing: 32, // Liquid-like smoothness
  infinite: 9999, // Perfect circles
};

// ANIMATION CURVES - Luxury motion design
export const PREMIUM_ANIMATIONS = {
  // Silk-smooth transitions
  silk: {
    tension: 120,
    friction: 14,
    duration: 400,
  },
  
  // Confident, decisive motion
  confident: {
    tension: 180,
    friction: 12,
    duration: 300,
  },
  
  // Gentle, meditative flow
  meditative: {
    tension: 80,
    friction: 16,
    duration: 600,
  },
  
  // Luxury bounce
  luxury: {
    tension: 200,
    friction: 10,
    duration: 500,
  },
};

// COMPLETE PREMIUM THEME SYSTEM
export const PREMIUM_THEME = {
  colors: PREMIUM_PALETTE,
  typography: LUXURY_TYPOGRAPHY,
  glassmorphism: PREMIUM_GLASSMORPHISM,
  elevation: LUXURY_ELEVATION,
  spacing: LUXURY_SPACING,
  radius: LUXURY_RADIUS,
  animation: PREMIUM_ANIMATIONS,
  
  // Semantic Mappings - Context-aware color system
  semantic: {
    // Backgrounds
    background: {
      primary: PREMIUM_PALETTE.pearl,
      secondary: PREMIUM_PALETTE.silk,
      tertiary: PREMIUM_PALETTE.cashmere,
      elevated: PREMIUM_PALETTE.pearl,
    },
    
    // Surfaces
    surface: {
      primary: PREMIUM_PALETTE.pearl,
      secondary: PREMIUM_PALETTE.silk,
      elevated: PREMIUM_PALETTE.pearl,
      glass: 'rgba(255, 255, 255, 0.15)',
    },
    
    // Text Colors
    text: {
      primary: PREMIUM_PALETTE.obsidian[900],
      secondary: PREMIUM_PALETTE.obsidian[700],
      tertiary: PREMIUM_PALETTE.obsidian[500],
      inverse: PREMIUM_PALETTE.pearl,
      accent: PREMIUM_PALETTE.champagne[500],
      confidence: PREMIUM_PALETTE.confidence[500],
      serenity: PREMIUM_PALETTE.serenity[500],
    },
    
    // Interactive Elements
    interactive: {
      primary: PREMIUM_PALETTE.obsidian[900],
      secondary: PREMIUM_PALETTE.champagne[500],
      tertiary: PREMIUM_PALETTE.platinum[500],
      disabled: PREMIUM_PALETTE.obsidian[300],
    },
    
    // Borders and Dividers
    border: {
      primary: PREMIUM_PALETTE.stone,
      secondary: PREMIUM_PALETTE.mist,
      accent: PREMIUM_PALETTE.champagne[200],
      glass: 'rgba(255, 255, 255, 0.2)',
    },
    
    // Status Colors
    status: {
      success: '#27AE60',
      warning: PREMIUM_PALETTE.champagne[500],
      error: '#E74C3C',
      info: PREMIUM_PALETTE.serenity[500],
    },
  },
  
  // Component Variants - Pre-designed component styles
  components: {
    // Button Variants
    button: {
      primary: {
        backgroundColor: PREMIUM_PALETTE.obsidian[900],
        color: PREMIUM_PALETTE.pearl,
        borderRadius: LUXURY_RADIUS.lg,
        ...LUXURY_ELEVATION.lift,
      },
      secondary: {
        backgroundColor: PREMIUM_PALETTE.champagne[500],
        color: PREMIUM_PALETTE.obsidian[900],
        borderRadius: LUXURY_RADIUS.lg,
        ...LUXURY_ELEVATION.hover,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: PREMIUM_PALETTE.obsidian[700],
        borderWidth: 1,
        borderColor: PREMIUM_PALETTE.stone,
        borderRadius: LUXURY_RADIUS.lg,
      },
      glass: {
        ...PREMIUM_GLASSMORPHISM.silk,
        borderRadius: LUXURY_RADIUS.lg,
        color: PREMIUM_PALETTE.obsidian[900],
      },
    },
    
    // Card Variants
    card: {
      elevated: {
        backgroundColor: PREMIUM_PALETTE.pearl,
        borderRadius: LUXURY_RADIUS.organic,
        ...LUXURY_ELEVATION.elevate,
      },
      glass: {
        ...PREMIUM_GLASSMORPHISM.couture,
        borderRadius: LUXURY_RADIUS.organic,
      },
      floating: {
        backgroundColor: PREMIUM_PALETTE.silk,
        borderRadius: LUXURY_RADIUS.flowing,
        ...LUXURY_ELEVATION.levitate,
      },
    },
    
    // Input Variants
    input: {
      default: {
        backgroundColor: PREMIUM_PALETTE.silk,
        borderWidth: 1,
        borderColor: PREMIUM_PALETTE.stone,
        borderRadius: LUXURY_RADIUS.lg,
        color: PREMIUM_PALETTE.obsidian[900],
      },
      focused: {
        backgroundColor: PREMIUM_PALETTE.pearl,
        borderWidth: 2,
        borderColor: PREMIUM_PALETTE.champagne[500],
        borderRadius: LUXURY_RADIUS.lg,
        ...LUXURY_ELEVATION.hover,
      },
      glass: {
        ...PREMIUM_GLASSMORPHISM.silk,
        borderRadius: LUXURY_RADIUS.lg,
        color: PREMIUM_PALETTE.obsidian[900],
      },
    },
  },
};

export default PREMIUM_THEME;