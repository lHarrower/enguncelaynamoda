import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// PILLAR 1: MATERIALS & TEXTURES - AN ORGANIC REALITY
export const LuxuryMaterials = {
  // The Textured Linen Canvas
  linen: {
    base: '#F8F7F4', // Warm, off-white base
    textureOpacity: 0.05, // Subtle noise overlay
  },
  
  // Glassmorphism & Layered Depth
  glass: {
    primary: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(25px)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderWidth: 1,
    },
    subtle: {
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(15px)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 0.5,
    },
    dark: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(20px)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 0.5,
    },
  },
  
  // Organic Color Palette
  colors: {
    inkGray: '#333333', // Headlines
    charcoal: '#555555', // Body text
    whisper: '#888888', // Captions
    liquidGold: '#D4AF37', // Accent
    sage: '#9CAF88', // Secondary
    pearl: '#F5F5F0', // Light accents
    shadow: 'rgba(0, 0, 0, 0.08)', // Subtle shadows
  },
};

// PILLAR 2: TYPOGRAPHY - THE EDITORIAL STANDARD
export const LuxuryTypography = {
  // Headlines - Elegant Serif
  headline: {
    fontFamily: Platform.select({
      ios: 'Playfair Display',
      android: 'PlayfairDisplay-Regular',
      default: 'serif',
    }),
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '400' as const,
    color: LuxuryMaterials.colors.inkGray,
    letterSpacing: -0.5,
  },
  
  subheadline: {
    fontFamily: Platform.select({
      ios: 'Playfair Display',
      android: 'PlayfairDisplay-Regular',
      default: 'serif',
    }),
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400' as const,
    color: LuxuryMaterials.colors.inkGray,
    letterSpacing: -0.3,
  },
  
  // Body & UI Text - Premium Sans-serif
  body: {
    fontFamily: Platform.select({
      ios: 'Inter',
      android: 'Inter-Regular',
      default: 'sans-serif',
    }),
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    color: LuxuryMaterials.colors.charcoal,
    letterSpacing: 0,
  },
  
  bodySmall: {
    fontFamily: Platform.select({
      ios: 'Inter',
      android: 'Inter-Regular',
      default: 'sans-serif',
    }),
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: LuxuryMaterials.colors.charcoal,
    letterSpacing: 0.1,
  },
  
  // Whispers & Captions
  whisper: {
    fontFamily: Platform.select({
      ios: 'Inter',
      android: 'Inter-Italic',
      default: 'sans-serif',
    }),
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    fontStyle: 'italic' as const,
    color: LuxuryMaterials.colors.whisper,
    letterSpacing: 0.2,
  },
  
  // UI Elements
  button: {
    fontFamily: Platform.select({
      ios: 'Inter',
      android: 'Inter-Medium',
      default: 'sans-serif',
    }),
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500' as const,
    color: LuxuryMaterials.colors.charcoal,
    letterSpacing: 0.1,
  },
  
  tab: {
    fontFamily: Platform.select({
      ios: 'Inter',
      android: 'Inter-Medium',
      default: 'sans-serif',
    }),
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500' as const,
    color: LuxuryMaterials.colors.charcoal,
    letterSpacing: 0.3,
  },
};

// PILLAR 3: MOTION - A FLUID CHOREOGRAPHY
export const LuxuryMotion = {
  // Physics-Based Curves
  curves: {
    elegant: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth ease-in-out
    gentle: 'cubic-bezier(0.23, 1, 0.32, 1)', // Gentle spring
    dramatic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Dramatic bounce
  },
  
  // Timing Constants
  timing: {
    instant: 150,
    quick: 250,
    smooth: 400,
    cinematic: 600,
    dramatic: 800,
  },
  
  // Cinematic Transitions
  transitions: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 400,
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: 300,
    },
    dissolve: {
      duration: 700, // 300ms fade out + 400ms fade in
    },
    float: {
      from: { transform: [{ translateY: 20 }, { scale: 0.95 }] },
      to: { transform: [{ translateY: 0 }, { scale: 1 }] },
      duration: 500,
    },
  },
  
  // Micro-interactions
  interactions: {
    tap: {
      scale: 0.98,
      duration: 150,
    },
    like: {
      scale: 1.1,
      duration: 200,
    },
    waveOfLight: {
      circles: 3,
      duration: 600,
      stagger: 100,
    },
  },
};

// PILLAR 4: LIGHT, SHADOW & SPACE - INTENTIONAL AWARENESS
export const LuxuryShadows = {
  // Multi-Layered Shadow System
  whisper: {
    shadowColor: LuxuryMaterials.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  lift: {
    shadowColor: LuxuryMaterials.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  
  float: {
    shadowColor: LuxuryMaterials.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  
  dramatic: {
    shadowColor: LuxuryMaterials.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // Multi-layered card shadows (ambient occlusion)
  card: [
    {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 4,
    },
  ],
};

// The Breathable Interface - 8px Grid System
export const LuxurySpacing = {
  xs: 4,   // 0.5 grid units
  sm: 8,   // 1 grid unit
  md: 16,  // 2 grid units
  lg: 24,  // 3 grid units
  xl: 32,  // 4 grid units
  xxl: 48, // 6 grid units
  xxxl: 64, // 8 grid units
  
  // Semantic spacing
  hairline: 1,
  border: 2,
  padding: 16,
  margin: 24,
  section: 32,
  screen: 48,
};

// Responsive Design
export const LuxuryLayout = {
  screen: {
    width: screenWidth,
    height: screenHeight,
    isTablet: screenWidth >= 768,
    isLandscape: screenWidth > screenHeight,
  },
  
  // Golden Ratio Proportions
  golden: {
    ratio: 1.618,
    small: screenWidth * 0.382, // 1/φ
    large: screenWidth * 0.618, // φ-1
  },
  
  // Component Dimensions
  card: {
    minHeight: 200,
    borderRadius: 16,
    padding: LuxurySpacing.padding,
  },
  
  button: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: LuxurySpacing.lg,
  },
  
  input: {
    height: 56,
    borderRadius: 8,
    paddingHorizontal: LuxurySpacing.padding,
  },
};

// Luxury Component Styles
export const LuxuryComponents = {
  // Textured Linen Canvas
  linenCanvas: {
    flex: 1,
    backgroundColor: LuxuryMaterials.linen.base,
    // Note: Texture overlay will be added via ImageBackground
  },
  
  // Glassmorphism Card
  glassCard: {
    ...LuxuryMaterials.glass.primary,
    borderRadius: LuxuryLayout.card.borderRadius,
    padding: LuxuryLayout.card.padding,
    ...LuxuryShadows.float,
  },
  
  // Elegant Tab
  elegantTab: {
    paddingVertical: LuxurySpacing.sm,
    paddingHorizontal: LuxurySpacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  
  elegantTabActive: {
    borderBottomColor: LuxuryMaterials.colors.liquidGold,
  },
  
  // Floating Action Button
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: LuxuryMaterials.colors.liquidGold,
    justifyContent: 'center',
    alignItems: 'center',
    ...LuxuryShadows.dramatic,
  },
  
  // Wave of Light Container
  waveContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
};

export default {
  LuxuryMaterials,
  LuxuryTypography,
  LuxuryMotion,
  LuxuryShadows,
  LuxurySpacing,
  LuxuryLayout,
  LuxuryComponents,
}; 