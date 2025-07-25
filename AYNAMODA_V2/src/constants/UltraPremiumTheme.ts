// AYNAMODA Ultra Premium Theme System - World-Class Fashion App Design
// Inspired by luxury fashion houses: Chanel, Hermès, Louis Vuitton, Dior

import { TextStyle, ViewStyle } from 'react-native';

// ULTRA LUXURY COLOR PALETTE - Inspired by haute couture and luxury fashion
export const ULTRA_LUXURY_PALETTE = {
  // Primary Colors - Timeless Elegance
  noir: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121', // Pure sophisticated black
    pure: '#000000', // Absolute black for maximum contrast
  },
  
  // Accent Colors - Luxury Metals
  platinum: {
    50: '#FEFEFE',
    100: '#FDFDFD',
    200: '#FBFBFB',
    300: '#F8F8F8',
    400: '#F5F5F5',
    500: '#F0F0F0', // Primary platinum
    600: '#E8E8E8',
    700: '#E0E0E0',
    800: '#D8D8D8',
    900: '#D0D0D0',
  },
  
  champagne: {
    50: '#FFFEF9',
    100: '#FFFCF0',
    200: '#FFF8E1',
    300: '#FFF3C4',
    400: '#FFECB3',
    500: '#D4AF37', // Luxury champagne gold
    600: '#B8941F',
    700: '#9C7A0F',
    800: '#806108',
    900: '#644904',
  },
  
  // Neutral Foundation - Pure Minimalism
  white: '#FFFFFF',
  offWhite: '#FEFEFE',
  pearl: '#FDFDFD',
  cream: '#FBFBFB',
  ivory: '#F9F9F9',
  silver: '#F7F7F7',
  lightGray: '#F5F5F5',
  mediumGray: '#E8E8E8',
  darkGray: '#CCCCCC',
  charcoal: '#666666',
  
  // Semantic Colors
  success: '#2E7D32',
  warning: '#F57C00',
  error: '#C62828',
  info: '#1976D2',
};

// ULTRA PREMIUM TYPOGRAPHY - Fashion Magazine Quality
export const ULTRA_LUXURY_TYPOGRAPHY = {
  // Font Families - Professional Grade
  fonts: {
    primary: 'Inter', // Clean, modern sans-serif
    display: 'Playfair Display', // Elegant serif for headlines
    accent: 'Inter', // Consistent with primary
  },
  
  // Typography Scale - Perfect Hierarchy
  scale: {
    // Display Typography
    hero: {
      fontSize: 48,
      lineHeight: 56,
      fontWeight: '300' as TextStyle['fontWeight'], // Light weight for elegance
      letterSpacing: -1.2,
      fontFamily: 'Playfair Display',
    },
    
    display: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '300' as TextStyle['fontWeight'],
      letterSpacing: -0.8,
      fontFamily: 'Playfair Display',
    },
    
    h1: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: -0.6,
      fontFamily: 'Inter',
    },
    
    h2: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: -0.4,
      fontFamily: 'Inter',
    },
    
    h3: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '500' as TextStyle['fontWeight'],
      letterSpacing: -0.2,
      fontFamily: 'Inter',
    },
    
    // Body Typography
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
    
    // UI Typography
    button: {
      fontSize: 14,
      lineHeight: 16,
      fontWeight: '500' as TextStyle['fontWeight'],
      letterSpacing: 0.8,
      fontFamily: 'Inter',
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
    
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 0.4,
      fontFamily: 'Inter',
    },
    
    overline: {
      fontSize: 10,
      lineHeight: 12,
      fontWeight: '500' as TextStyle['fontWeight'],
      letterSpacing: 1.5,
      fontFamily: 'Inter',
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
  },
};

// ULTRA PREMIUM SPACING - Golden Ratio Based
export const ULTRA_LUXURY_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  massive: 96,
};

// ULTRA PREMIUM ELEVATION - Subtle Sophistication
export const ULTRA_LUXURY_ELEVATION = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
  
  subtle: {
    shadowColor: ULTRA_LUXURY_PALETTE.noir[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,
  
  soft: {
    shadowColor: ULTRA_LUXURY_PALETTE.noir[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
  
  medium: {
    shadowColor: ULTRA_LUXURY_PALETTE.noir[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  
  high: {
    shadowColor: ULTRA_LUXURY_PALETTE.noir[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,
};

// ULTRA PREMIUM BORDER RADIUS - Minimal and Clean
export const ULTRA_LUXURY_RADIUS = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

// COMPLETE ULTRA PREMIUM THEME
export const ULTRA_PREMIUM_THEME = {
  colors: ULTRA_LUXURY_PALETTE,
  typography: ULTRA_LUXURY_TYPOGRAPHY,
  spacing: ULTRA_LUXURY_SPACING,
  elevation: ULTRA_LUXURY_ELEVATION,
  radius: ULTRA_LUXURY_RADIUS,
  
  // Semantic Color Mappings
  semantic: {
    // Backgrounds
    background: {
      primary: ULTRA_LUXURY_PALETTE.white,
      secondary: ULTRA_LUXURY_PALETTE.offWhite,
      tertiary: ULTRA_LUXURY_PALETTE.pearl,
    },
    
    // Surfaces
    surface: {
      primary: ULTRA_LUXURY_PALETTE.white,
      secondary: ULTRA_LUXURY_PALETTE.pearl,
      tertiary: ULTRA_LUXURY_PALETTE.cream,
    },
    
    // Text
    text: {
      primary: ULTRA_LUXURY_PALETTE.noir[900],
      secondary: ULTRA_LUXURY_PALETTE.noir[700],
      tertiary: ULTRA_LUXURY_PALETTE.noir[500],
      quaternary: ULTRA_LUXURY_PALETTE.noir[400],
      inverse: ULTRA_LUXURY_PALETTE.white,
      accent: ULTRA_LUXURY_PALETTE.champagne[500],
    },
    
    // Borders
    border: {
      primary: ULTRA_LUXURY_PALETTE.noir[200],
      secondary: ULTRA_LUXURY_PALETTE.noir[100],
      tertiary: ULTRA_LUXURY_PALETTE.noir[50],
    },
    
    // Interactive
    interactive: {
      primary: ULTRA_LUXURY_PALETTE.noir[900],
      secondary: ULTRA_LUXURY_PALETTE.champagne[500],
      tertiary: ULTRA_LUXURY_PALETTE.platinum[500],
    },
    
    // Status
    status: {
      success: ULTRA_LUXURY_PALETTE.success,
      warning: ULTRA_LUXURY_PALETTE.warning,
      error: ULTRA_LUXURY_PALETTE.error,
      info: ULTRA_LUXURY_PALETTE.info,
    },
  },
  
  // Component Variants
  components: {
    button: {
      primary: {
        backgroundColor: ULTRA_LUXURY_PALETTE.noir[900],
        color: ULTRA_LUXURY_PALETTE.white,
        borderRadius: ULTRA_LUXURY_RADIUS.sm,
        paddingHorizontal: ULTRA_LUXURY_SPACING.lg,
        paddingVertical: ULTRA_LUXURY_SPACING.md,
        ...ULTRA_LUXURY_ELEVATION.subtle,
      },
      secondary: {
        backgroundColor: 'transparent',
        color: ULTRA_LUXURY_PALETTE.noir[900],
        borderWidth: 1,
        borderColor: ULTRA_LUXURY_PALETTE.noir[200],
        borderRadius: ULTRA_LUXURY_RADIUS.sm,
        paddingHorizontal: ULTRA_LUXURY_SPACING.lg,
        paddingVertical: ULTRA_LUXURY_SPACING.md,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: ULTRA_LUXURY_PALETTE.noir[700],
        borderRadius: ULTRA_LUXURY_RADIUS.sm,
        paddingHorizontal: ULTRA_LUXURY_SPACING.lg,
        paddingVertical: ULTRA_LUXURY_SPACING.md,
      },
    },
    
    card: {
      default: {
        backgroundColor: ULTRA_LUXURY_PALETTE.white,
        borderRadius: ULTRA_LUXURY_RADIUS.lg,
        padding: ULTRA_LUXURY_SPACING.lg,
        ...ULTRA_LUXURY_ELEVATION.soft,
      },
      minimal: {
        backgroundColor: ULTRA_LUXURY_PALETTE.white,
        borderWidth: 1,
        borderColor: ULTRA_LUXURY_PALETTE.noir[100],
        borderRadius: ULTRA_LUXURY_RADIUS.lg,
        padding: ULTRA_LUXURY_SPACING.lg,
      },
    },
    
    input: {
      default: {
        backgroundColor: ULTRA_LUXURY_PALETTE.white,
        borderWidth: 1,
        borderColor: ULTRA_LUXURY_PALETTE.noir[200],
        borderRadius: ULTRA_LUXURY_RADIUS.sm,
        paddingHorizontal: ULTRA_LUXURY_SPACING.md,
        paddingVertical: ULTRA_LUXURY_SPACING.md,
        color: ULTRA_LUXURY_PALETTE.noir[900],
      },
      focused: {
        borderColor: ULTRA_LUXURY_PALETTE.noir[400],
        ...ULTRA_LUXURY_ELEVATION.subtle,
      },
    },
  },
};

export default ULTRA_PREMIUM_THEME;