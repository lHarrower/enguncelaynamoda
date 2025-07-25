// AYNAMODA Artistry Theme System - Living Digital Art Gallery
// "Where style meets sophistication" - A breathing, interactive masterpiece
// Inspired by Spotify Design + Gucci Digital Experiences

import { TextStyle, ViewStyle } from 'react-native';

// ARTISTRY COLOR PALETTE - Deep, Atmospheric, Living Colors
export const ARTISTRY_PALETTE = {
  // The Canvas - Deep, immersive space
  canvas: {
    void: '#0A0A0B',        // Almost black, but alive
    charcoal: '#1A1A1C',   // Deep charcoal with warmth
    obsidian: '#2A2A2E',   // Rich obsidian depths
    shadow: '#3A3A3F',     // Soft shadow tones
    mist: '#4A4A50',       // Atmospheric mist
  },
  
  // Liquid Metals - Premium accents that shimmer
  liquidGold: {
    50: '#FFF9E6',
    100: '#FFF0B3',
    200: '#FFE680',
    300: '#FFDC4D',
    400: '#FFD21A',
    500: '#E6B800',        // Primary liquid gold
    600: '#CC9900',
    700: '#B37A00',
    800: '#995C00',
    900: '#804D00',
    glow: 'rgba(230, 184, 0, 0.3)', // Glowing aura
  },
  
  // Jewel Tones - Deep, rich, moving gradients
  emerald: {
    deep: '#0D4F3C',
    rich: '#1A6B47',
    glow: 'rgba(26, 107, 71, 0.2)',
  },
  
  sapphire: {
    deep: '#1E3A8A',
    rich: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.2)',
  },
  
  ruby: {
    deep: '#7F1D1D',
    rich: '#DC2626',
    glow: 'rgba(220, 38, 38, 0.2)',
  },
  
  // Atmospheric Whites - Ethereal, floating
  ethereal: {
    pure: '#FFFFFF',
    silk: '#FEFEFE',
    pearl: '#FDFDFD',
    mist: '#FBFBFB',
    whisper: '#F9F9F9',
    ghost: 'rgba(255, 255, 255, 0.95)',
    spirit: 'rgba(255, 255, 255, 0.85)',
    dream: 'rgba(255, 255, 255, 0.75)',
  },
  
  // Interactive States - Confidence and energy
  confidence: {
    primary: '#FF6B35',     // Warm confidence orange
    secondary: '#FF8C42',   // Lighter confidence
    glow: 'rgba(255, 107, 53, 0.3)',
  },
  
  serenity: {
    primary: '#4A90E2',     // Calm blue
    secondary: '#7BB3F0',   // Lighter serenity
    glow: 'rgba(74, 144, 226, 0.3)',
  },
};

// ARTISTRY TYPOGRAPHY - Choreographed Text Performance
export const ARTISTRY_TYPOGRAPHY = {
  fonts: {
    display: 'Playfair Display',  // Elegant serif for poetry
    body: 'Inter',               // Clean sans for readability
    accent: 'Inter',             // Geometric precision
  },
  
  // Typography that moves and breathes
  scale: {
    // Poetic Headlines - Text as art
    poetry: {
      fontSize: 52,
      lineHeight: 64,
      fontWeight: '300' as TextStyle['fontWeight'],
      letterSpacing: -1.5,
      fontFamily: 'Playfair Display',
      fontStyle: 'italic' as TextStyle['fontStyle'],
    },
    
    // Gallery Titles - Museum quality
    gallery: {
      fontSize: 42,
      lineHeight: 52,
      fontWeight: '200' as TextStyle['fontWeight'],
      letterSpacing: -1.2,
      fontFamily: 'Playfair Display',
    },
    
    // Whispers - Intimate, personal
    whisper: {
      fontSize: 18,
      lineHeight: 28,
      fontWeight: '300' as TextStyle['fontWeight'],
      letterSpacing: 0.8,
      fontFamily: 'Playfair Display',
      fontStyle: 'italic' as TextStyle['fontStyle'],
    },
    
    // Confident Statements
    statement: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '500' as TextStyle['fontWeight'],
      letterSpacing: -0.8,
      fontFamily: 'Inter',
    },
    
    // Elegant Body
    elegant: {
      fontSize: 16,
      lineHeight: 26,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 0.2,
      fontFamily: 'Inter',
    },
    
    // Kinetic UI - Text that dances
    kinetic: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '500' as TextStyle['fontWeight'],
      letterSpacing: 1.2,
      fontFamily: 'Inter',
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
    
    // Floating Labels
    floating: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 1.5,
      fontFamily: 'Inter',
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
  },
};

// ATMOSPHERIC GLASSMORPHISM - Living glass effects
export const ARTISTRY_GLASSMORPHISM = {
  // Totem Glass - For interactive 3D objects
  totem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(40px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: ARTISTRY_PALETTE.liquidGold[500],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12,
  } as ViewStyle,
  
  // Gallery Panel - For bento grid elements
  panel: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(30px)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  } as ViewStyle,
  
  // Floating Whisper - For AI suggestions
  whisper: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(20px)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: ARTISTRY_PALETTE.serenity.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  } as ViewStyle,
  
  // Liquid Gold Aura
  goldAura: {
    backgroundColor: 'rgba(230, 184, 0, 0.08)',
    backdropFilter: 'blur(35px)',
    borderWidth: 1,
    borderColor: 'rgba(230, 184, 0, 0.2)',
    shadowColor: ARTISTRY_PALETTE.liquidGold[500],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 10,
  } as ViewStyle,
};

// ARTISTRY SPACING - Organic, breathing space
export const ARTISTRY_SPACING = {
  breath: 4,      // Minimal breathing
  whisper: 8,     // Soft whisper
  gentle: 12,     // Gentle touch
  flow: 16,       // Natural flow
  dance: 24,      // Dancing space
  float: 32,      // Floating elements
  soar: 48,       // Soaring heights
  infinite: 64,   // Infinite space
  cosmic: 96,     // Cosmic distances
  universe: 128,  // Universal scale
};

// ARTISTRY RADIUS - Organic, flowing curves
export const ARTISTRY_RADIUS = {
  whisper: 6,     // Subtle curves
  gentle: 12,     // Gentle rounding
  flow: 18,       // Flowing edges
  organic: 24,    // Organic shapes
  liquid: 32,     // Liquid forms
  infinite: 9999, // Perfect circles
};

// ARTISTRY ANIMATIONS - Choreographed motion
export const ARTISTRY_ANIMATIONS = {
  // Breathing - Subtle life
  breathing: {
    duration: 3000,
    easing: 'easeInOut',
    scale: { from: 1, to: 1.02 },
    opacity: { from: 0.8, to: 1 },
  },
  
  // Floating - Gentle levitation
  floating: {
    duration: 4000,
    easing: 'easeInOut',
    translateY: { from: 0, to: -8 },
  },
  
  // Shimmer - Liquid gold effect
  shimmer: {
    duration: 2000,
    easing: 'linear',
    opacity: { from: 0.3, to: 1 },
    scale: { from: 1, to: 1.05 },
  },
  
  // Whisper Entry - Gentle appearance
  whisperEntry: {
    duration: 800,
    easing: 'easeOut',
    opacity: { from: 0, to: 1 },
    translateY: { from: 20, to: 0 },
    blur: { from: 10, to: 0 },
  },
  
  // Totem Rotation - 3D object spinning
  totemRotation: {
    duration: 8000,
    easing: 'linear',
    rotateY: { from: '0deg', to: '360deg' },
  },
  
  // Confidence Pulse - Interactive feedback
  confidencePulse: {
    duration: 600,
    easing: 'easeOut',
    scale: { from: 1, to: 1.1, back: 1 },
    shadowOpacity: { from: 0.1, to: 0.3, back: 0.1 },
  },
};

// BENTO GRID SYSTEM - Curated gallery layouts
export const ARTISTRY_BENTO = {
  // Grid configurations for different screen sections
  homeGrid: [
    { id: 'hero', span: 2, height: 'large', type: 'totem' },
    { id: 'whisper', span: 1, height: 'medium', type: 'text' },
    { id: 'insight', span: 1, height: 'medium', type: 'metric' },
    { id: 'collection', span: 2, height: 'small', type: 'gallery' },
  ],
  
  discoverGrid: [
    { id: 'featured', span: 1, height: 'large', type: 'image' },
    { id: 'trending', span: 1, height: 'medium', type: 'list' },
    { id: 'personal', span: 1, height: 'medium', type: 'totem' },
    { id: 'brands', span: 2, height: 'small', type: 'carousel' },
  ],
};

// COMPLETE ARTISTRY THEME SYSTEM
export const ARTISTRY_THEME = {
  colors: ARTISTRY_PALETTE,
  typography: ARTISTRY_TYPOGRAPHY,
  glassmorphism: ARTISTRY_GLASSMORPHISM,
  spacing: ARTISTRY_SPACING,
  radius: ARTISTRY_RADIUS,
  animations: ARTISTRY_ANIMATIONS,
  bento: ARTISTRY_BENTO,
  
  // Semantic Mappings - Context-aware artistry
  semantic: {
    // Canvas Backgrounds - The stage
    canvas: {
      void: ARTISTRY_PALETTE.canvas.void,
      primary: ARTISTRY_PALETTE.canvas.charcoal,
      secondary: ARTISTRY_PALETTE.canvas.obsidian,
      elevated: ARTISTRY_PALETTE.canvas.shadow,
    },
    
    // Text Colors - Choreographed typography
    text: {
      poetry: ARTISTRY_PALETTE.ethereal.pure,
      primary: ARTISTRY_PALETTE.ethereal.silk,
      secondary: ARTISTRY_PALETTE.ethereal.mist,
      whisper: ARTISTRY_PALETTE.ethereal.ghost,
      accent: ARTISTRY_PALETTE.liquidGold[500],
      confidence: ARTISTRY_PALETTE.confidence.primary,
      serenity: ARTISTRY_PALETTE.serenity.primary,
    },
    
    // Interactive Elements - Living responses
    interactive: {
      primary: ARTISTRY_PALETTE.liquidGold[500],
      secondary: ARTISTRY_PALETTE.confidence.primary,
      tertiary: ARTISTRY_PALETTE.serenity.primary,
      hover: ARTISTRY_PALETTE.liquidGold.glow,
      active: ARTISTRY_PALETTE.confidence.glow,
    },
    
    // Atmospheric Effects
    atmosphere: {
      emeraldGlow: ARTISTRY_PALETTE.emerald.glow,
      sapphireGlow: ARTISTRY_PALETTE.sapphire.glow,
      rubyGlow: ARTISTRY_PALETTE.ruby.glow,
      goldShimmer: ARTISTRY_PALETTE.liquidGold.glow,
    },
  },
  
  // Component Variants - Artistic elements
  components: {
    // Totem - Interactive 3D objects
    totem: {
      primary: {
        ...ARTISTRY_GLASSMORPHISM.totem,
        borderRadius: ARTISTRY_RADIUS.organic,
        minHeight: 200,
        minWidth: 200,
      },
      floating: {
        ...ARTISTRY_GLASSMORPHISM.totem,
        borderRadius: ARTISTRY_RADIUS.liquid,
        transform: [{ translateY: -8 }],
      },
    },
    
    // Gallery Panel - Bento grid elements
    panel: {
      default: {
        ...ARTISTRY_GLASSMORPHISM.panel,
        borderRadius: ARTISTRY_RADIUS.flow,
        padding: ARTISTRY_SPACING.dance,
      },
      featured: {
        ...ARTISTRY_GLASSMORPHISM.goldAura,
        borderRadius: ARTISTRY_RADIUS.organic,
        padding: ARTISTRY_SPACING.float,
      },
    },
    
    // Whisper - AI suggestions
    whisper: {
      default: {
        ...ARTISTRY_GLASSMORPHISM.whisper,
        borderRadius: ARTISTRY_RADIUS.gentle,
        padding: ARTISTRY_SPACING.flow,
      },
    },
    
    // Kinetic Button - Interactive elements
    kineticButton: {
      primary: {
        backgroundColor: ARTISTRY_PALETTE.liquidGold[500],
        borderRadius: ARTISTRY_RADIUS.gentle,
        paddingHorizontal: ARTISTRY_SPACING.dance,
        paddingVertical: ARTISTRY_SPACING.flow,
        shadowColor: ARTISTRY_PALETTE.liquidGold[500],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: ARTISTRY_PALETTE.ethereal.ghost,
        borderRadius: ARTISTRY_RADIUS.gentle,
        paddingHorizontal: ARTISTRY_SPACING.dance,
        paddingVertical: ARTISTRY_SPACING.flow,
      },
    },
  },
};

export default ARTISTRY_THEME;