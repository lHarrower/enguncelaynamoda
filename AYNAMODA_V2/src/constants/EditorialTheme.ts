import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const EDITORIAL_THEME = {
  colors: {
    // Base colors
    white: '#FFFFFF',
    black: '#000000',
    
    // Pastel lilac palette
    lilac: {
      50: '#FAF8FF',
      100: '#F3EFFF',
      200: '#E9E0FF',
      300: '#D4C2FF',
      400: '#B794FF',
      500: '#9B66FF',
      600: '#8B5CF6',
      700: '#7C3AED',
      800: '#6D28D9',
      900: '#5B21B6',
    },
    
    // Soft gold palette
    gold: {
      50: '#FFFEF7',
      100: '#FFFBEB',
      200: '#FEF3C7',
      300: '#FDE68A',
      400: '#FCD34D',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    
    // Neutral greys
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    
    // Semantic colors
    background: '#FFFFFF',
    surface: '#FAF8FF',
    accent: '#B794FF',
    secondary: '#FCD34D',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      muted: '#9CA3AF',
    },
  },
  
  typography: {
    // Serif for headings
    serif: {
      family: 'PlayfairDisplay_400Regular',
      sizes: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
      },
      weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    
    // Thin sans-serif for body
    sans: {
      family: 'Inter_300Light',
      sizes: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
      },
      weights: {
        thin: '100',
        light: '300',
        normal: '400',
        medium: '500',
      },
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  layout: {
    screenWidth,
    screenHeight,
    cardWidth: screenWidth * 0.8,
    containerPadding: 20,
    sectionSpacing: 32,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    strong: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
};

export type EditorialTheme = typeof EDITORIAL_THEME;