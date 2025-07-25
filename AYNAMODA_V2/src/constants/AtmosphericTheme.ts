// AYNAMODA Atmospheric Theme - The Living Art Installation
// Deep, immersive space with jewel-tone gradients moving like light behind silk

import { TextStyle, ViewStyle } from 'react-native';

// THE LIVING ATMOSPHERE - Deep, immersive color palette
export const ATMOSPHERIC_PALETTE = {
  // The Canvas - Deep, alive darkness
  void: '#0B0B0D',           // Near-black charcoal, but alive
  charcoal: '#1A1A1E',      // Deep charcoal with warmth
  obsidian: '#2A2A30',      // Rich obsidian depths
  shadow: '#3A3A42',        // Soft shadow layers
  
  // Jewel Tone Gradients - Moving light behind silk
  emerald: {
    deep: '#0D4F3C',
    medium: '#1A6B47',
    light: '#2D8659',
    glow: 'rgba(26, 107, 71, 0.15)',
    shimmer: 'rgba(26, 107, 71, 0.08)',
  },
  
  sapphire: {
    deep: '#1E3A8A',
    medium: '#3B82F6',
    light: '#60A5FA',
    glow: 'rgba(59, 130, 246, 0.15)',
    shimmer: 'rgba(59, 130, 246, 0.08)',
  },
  
  ruby: {
    deep: '#7F1D1D',
    medium: '#DC2626',
    light: '#EF4444',
    glow: 'rgba(220, 38, 38, 0.15)',
    shimmer: 'rgba(220, 38, 38, 0.08)',
  },
  
  amethyst: {
    deep: '#581C87',
    medium: '#9333EA',
    light: '#A855F7',
    glow: 'rgba(147, 51, 234, 0.15)',
    shimmer: 'rgba(147, 51, 234, 0.08)',
  },
  
  // Liquid Gold - Premium accents
  gold: {
    pure: '#D4AF37',
    rich: '#B8941F',
    deep: '#9C7A0F',
    glow: 'rgba(212, 175, 55, 0.25)',
    shimmer: 'rgba(212, 175, 55, 0.12)',
    whisper: 'rgba(212, 175, 55, 0.06)',
  },
  
  // Ethereal Whites - Floating text
  ethereal: {
    pure: '#FFFFFF',
    silk: '#FEFEFE',
    mist: '#FBFBFB',
    whisper: '#F8F8F8',
    ghost: 'rgba(255, 255, 255, 0.95)',
    spirit: 'rgba(255, 255, 255, 0.85)',
    dream: 'rgba(255, 255, 255, 0.75)',
    breath: 'rgba(255, 255, 255, 0.65)',
  },
};

// EDITORIAL TYPOGRAPHY - Fashion magazine quality
export const ATMOSPHERIC_TYPOGRAPHY = {
  fonts: {
    display: 'Playfair Display',  // Elegant serif for headlines
    body: 'Inter',               // Clean sans for readability
  },
  
  // Typography as Art - Large, confident, overlapping
  scale: {
    // Editorial Headlines - Overlapping with images
    editorial: {
      fontSize: 64,
      lineHeight: 72,
      fontWeight: '300' as TextStyle['fontWeight'],
      letterSpacing: -2.0,
      fontFamily: 'Playfair Display',
    },
    
    // Confident Statements
    statement: {
      fontSize: 48,
      lineHeight: 56,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: -1.5,
      fontFamily: 'Playfair Display',
    },
    
    // Whispers - Intimate, personal
    whisper: {
      fontSize: 20,
      lineHeight: 32,
      fontWeight: '300' as TextStyle['fontWeight'],
      letterSpacing: 0.5,
      fontFamily: 'Playfair Display',
      fontStyle: 'italic' as TextStyle['fontStyle'],
    },
    
    // Body - Elegant readability
    body: {
      fontSize: 16,
      lineHeight: 26,
      fontWeight: '400' as TextStyle['fontWeight'],
      letterSpacing: 0.2,
      fontFamily: 'Inter',
    },
    
    // Captions - Floating labels
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as TextStyle['fontWeight'],
      letterSpacing: 1.5,
      fontFamily: 'Inter',
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
  },
};

// GLASSMORPHISM - Frosted glass layers
export const ATMOSPHERIC_GLASS = {
  // Confidence Whisper Glass
  whisper: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(40px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 8,
  } as ViewStyle,
  
  // Totem Glass - Interactive 3D surface
  totem: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(60px)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: ATMOSPHERIC_PALETTE.gold.pure,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 48,
    elevation: 16,
  } as ViewStyle,
  
  // Navigation Overlay Glass
  navigation: {
    backgroundColor: 'rgba(11, 11, 13, 0.85)',
    backdropFilter: 'blur(80px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  } as ViewStyle,
};

// PHYSICS-BASED ANIMATIONS - World-class motion
export const ATMOSPHERIC_PHYSICS = {
  // Cinematic Transitions
  cinematic: {
    tension: 120,
    friction: 14,
    duration: 800,
  },
  
  // Liquid Gold Shimmer
  shimmer: {
    tension: 200,
    friction: 12,
    duration: 600,
  },
  
  // Totem Rotation Physics
  totem: {
    tension: 180,
    friction: 16,
    duration: 1200,
  },
  
  // Atmospheric Breathing
  breathing: {
    tension: 80,
    friction: 20,
    duration: 4000,
  },
  
  // Micro-interaction Response
  micro: {
    tension: 300,
    friction: 10,
    duration: 200,
  },
};

// BENTO GRID SYSTEM - Editorial layout
export const ATMOSPHERIC_BENTO = {
  // Dynamic, asymmetrical layouts
  editorial: [
    { id: 'hero', span: 2, height: 'large', type: 'totem' },
    { id: 'whisper', span: 1, height: 'medium', type: 'glass' },
    { id: 'discovery', span: 1, height: 'medium', type: 'image' },
    { id: 'statement', span: 2, height: 'small', type: 'typography' },
  ],
  
  wardrobe: [
    { id: 'featured', span: 1, height: 'large', type: 'image' },
    { id: 'recent', span: 1, height: 'medium', type: 'grid' },
    { id: 'categories', span: 1, height: 'medium', type: 'list' },
    { id: 'stats', span: 2, height: 'small', type: 'metrics' },
  ],
};

// COMPLETE ATMOSPHERIC THEME
export const ATMOSPHERIC_THEME = {
  colors: ATMOSPHERIC_PALETTE,
  typography: ATMOSPHERIC_TYPOGRAPHY,
  glass: ATMOSPHERIC_GLASS,
  physics: ATMOSPHERIC_PHYSICS,
  bento: ATMOSPHERIC_BENTO,
  
  // Semantic Mappings
  semantic: {
    canvas: {
      void: ATMOSPHERIC_PALETTE.void,
      primary: ATMOSPHERIC_PALETTE.charcoal,
      secondary: ATMOSPHERIC_PALETTE.obsidian,
      elevated: ATMOSPHERIC_PALETTE.shadow,
    },
    
    text: {
      primary: ATMOSPHERIC_PALETTE.ethereal.pure,
      secondary: ATMOSPHERIC_PALETTE.ethereal.silk,
      whisper: ATMOSPHERIC_PALETTE.ethereal.ghost,
      caption: ATMOSPHERIC_PALETTE.ethereal.spirit,
      accent: ATMOSPHERIC_PALETTE.gold.pure,
    },
    
    atmosphere: {
      emerald: ATMOSPHERIC_PALETTE.emerald.glow,
      sapphire: ATMOSPHERIC_PALETTE.sapphire.glow,
      ruby: ATMOSPHERIC_PALETTE.ruby.glow,
      amethyst: ATMOSPHERIC_PALETTE.amethyst.glow,
      gold: ATMOSPHERIC_PALETTE.gold.glow,
    },
  },
};

export default ATMOSPHERIC_THEME;