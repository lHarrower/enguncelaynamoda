// AYNAMODA Studio Theme - Bright, Airy, Confident Personal Styling Studio
// Inspired by Spotify Design clarity with Gucci polish and Poppi motion

import { TextStyle, ViewStyle } from 'react-native';

// BRIGHT & CONFIDENT COLOR PALETTE
export const STUDIO_PALETTE = {
  // Foundation - Warm, textured off-white like sunlit artist's studio
  foundation: {
    primary: '#F8F7F4',      // Warm textured off-white
    secondary: '#FEFEFE',     // Pure white for cards
    tertiary: '#F5F4F1',     // Subtle variation
    elevated: '#FFFFFF',     // Elevated surfaces
  },
  
  // Text - Clean and readable
  text: {
    primary: '#2C2C2E',      // Ink gray for primary text
    secondary: '#48484A',     // Lighter gray for secondary
    tertiary: '#8E8E93',     // Light gray for captions
    inverse: '#FFFFFF',      // White text on dark backgrounds
  },
  
  // Accent Colors - Sophisticated & Joyful (used sparingly)
  accent: {
    jade: '#7A9E9F',         // Polished Jade - primary accent
    gold: '#D4AF37',         // Soft Gold - secondary accent
    jadeLight: '#A8C5C6',    // Lighter jade for backgrounds
    goldLight: '#E8D078',    // Lighter gold for backgrounds
    jadeGlow: 'rgba(122, 158, 159, 0.15)',  // Jade with transparency
    goldGlow: 'rgba(212, 175, 55, 0.15)',   // Gold with transparency
  },
  
  // Semantic Colors
  semantic: {
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
  },
  
  // Shadows - Multi-layered like designer cards
  shadow: {
    soft: 'rgba(0, 0, 0, 0.04)',
    medium: 'rgba(0, 0, 0, 0.08)',
    strong: 'rgba(0, 0, 0, 0.12)',
  },
};

// CLEAN TYPOGRAPHY SYSTEM - Spotify-inspired clarity
export const STUDIO_TYPOGRAPHY = {
  fonts: {
    primary: 'Inter',           // Clean, modern sans-serif
    display: 'Playfair Display', // Elegant serif for special moments
  },
  
  scale: {
    // Display - For hero moments
    hero: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '700' as TextStyle['fontWeight'],
      letterSpacing: -0.8,
      fontFamily: 'Inter',
    },
    
    // Headlines - Clear and confident
    h1: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: -0.4,
      fontFamily: 'Inter',
    },
    
    h2: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: -0.2,
      fontFamily: 'Inter',
    },
    
    h3: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: 0,
      fontFamily: 'Inter',
    },
    
    // Body text - Readable and clean
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 0,
      fontFamily: 'Inter',
    },
    
    bodyMedium: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '500' as TextStyle['fontWeight'],
      letterSpacing: 0,
      fontFamily: 'Inter',
    },
    
    // Small text
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 0.1,
      fontFamily: 'Inter',
    },
    
    // Captions
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as TextStyle['fontWeight'],
      letterSpacing: 0.5,
      fontFamily: 'Inter',
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
    
    // Elegant moments - Playfair Display
    elegant: {
      fontSize: 18,
      lineHeight: 28,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 0.2,
      fontFamily: 'Playfair Display',
      fontStyle: 'italic' as TextStyle['fontStyle'],
    },
  },
};

// SUBTLE GLASSMORPHISM - Like high-quality translucent vellum paper
export const STUDIO_GLASS = {
  // Subtle card effect
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  } as ViewStyle,
  
  // Very subtle overlay
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(30px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  } as ViewStyle,
};

// PREMIUM SHADOWS - Multi-layered like designer cards
export const STUDIO_SHADOWS = {
  // Soft elevation
  soft: {
    shadowColor: STUDIO_PALETTE.shadow.soft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
  
  // Medium elevation
  medium: {
    shadowColor: STUDIO_PALETTE.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle,
  
  // Strong elevation - for floating elements
  strong: {
    shadowColor: STUDIO_PALETTE.shadow.strong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  } as ViewStyle,
};

// SPACING SYSTEM - Generous whitespace for clean feel
export const STUDIO_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

// BORDER RADIUS - Clean and modern
export const STUDIO_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
};

// POPPI-INSPIRED ANIMATIONS - Fast, joyful, polished
export const STUDIO_ANIMATIONS = {
  // Fast and joyful entrance
  entrance: {
    duration: 400,
    damping: 20,
    stiffness: 300,
  },
  
  // Quick response for interactions
  interaction: {
    duration: 200,
    damping: 15,
    stiffness: 400,
  },
  
  // Smooth transitions
  transition: {
    duration: 300,
    damping: 18,
    stiffness: 350,
  },
  
  // Gentle hover/press
  hover: {
    duration: 150,
    damping: 12,
    stiffness: 500,
  },
};

// COMPLETE STUDIO THEME
export const STUDIO_THEME = {
  colors: STUDIO_PALETTE,
  typography: STUDIO_TYPOGRAPHY,
  glass: STUDIO_GLASS,
  shadows: STUDIO_SHADOWS,
  spacing: STUDIO_SPACING,
  radius: STUDIO_RADIUS,
  animations: STUDIO_ANIMATIONS,
  
  // Component Variants - Pre-designed elements
  components: {
    // Premium outfit cards
    outfitCard: {
      backgroundColor: STUDIO_PALETTE.foundation.elevated,
      borderRadius: STUDIO_RADIUS.lg,
      ...STUDIO_SHADOWS.medium,
      padding: STUDIO_SPACING.lg,
    },
    
    // Bento box items
    bentoItem: {
      backgroundColor: STUDIO_PALETTE.foundation.secondary,
      borderRadius: STUDIO_RADIUS.md,
      ...STUDIO_SHADOWS.soft,
      padding: STUDIO_SPACING.md,
    },
    
    // Accent buttons
    primaryButton: {
      backgroundColor: STUDIO_PALETTE.accent.jade,
      borderRadius: STUDIO_RADIUS.md,
      paddingHorizontal: STUDIO_SPACING.xl,
      paddingVertical: STUDIO_SPACING.md,
      ...STUDIO_SHADOWS.soft,
    },
    
    secondaryButton: {
      backgroundColor: STUDIO_PALETTE.foundation.elevated,
      borderRadius: STUDIO_RADIUS.md,
      paddingHorizontal: STUDIO_SPACING.xl,
      paddingVertical: STUDIO_SPACING.md,
      borderWidth: 1,
      borderColor: STUDIO_PALETTE.accent.jade,
    },
  },
};

export default STUDIO_THEME;