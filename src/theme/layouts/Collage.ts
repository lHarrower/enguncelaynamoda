/**
 * Collage Layout System
 * Part of AYNAMODA Unified Design System
 * 
 * Provides overlapping card layouts for discovery screens
 * Inspired by fashion magazine collages with dynamic, organic arrangements
 * Following Digital Zen Garden philosophy with intentional asymmetry
 */

import { ViewStyle, Dimensions } from 'react-native';
import { SPACING, BORDER_RADIUS, ELEVATION, UNIFIED_COLORS } from '@/theme/tokens';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const COLLAGE_PADDING = SPACING.lg;
const AVAILABLE_WIDTH = screenWidth - (COLLAGE_PADDING * 2);
const AVAILABLE_HEIGHT = screenHeight - 200; // Account for navigation and status bar

export const COLLAGE_LAYOUTS = {
  // Tinder-style swipe interface
  swipeStack: {
    container: {
      flex: 1,
      paddingHorizontal: COLLAGE_PADDING,
      paddingVertical: SPACING.xl,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    
    // Main card container
    cardStack: {
      width: AVAILABLE_WIDTH,
      height: AVAILABLE_HEIGHT * 0.8,
      position: 'relative',
    } as ViewStyle,
    
    // Individual card in stack
    card: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.xxl,
      ...ELEVATION.floating,
      overflow: 'hidden',
    } as ViewStyle,
    
    // Card positions in stack (for layering effect)
    cardPositions: {
      top: {
        zIndex: 3,
        transform: [{ scale: 1 }, { translateY: 0 }],
      } as ViewStyle,
      
      middle: {
        zIndex: 2,
        transform: [{ scale: 0.95 }, { translateY: 8 }],
        opacity: 0.8,
      } as ViewStyle,
      
      bottom: {
        zIndex: 1,
        transform: [{ scale: 0.9 }, { translateY: 16 }],
        opacity: 0.6,
      } as ViewStyle
    }
  },
  
  // Overlapping grid for discovery
  overlappingGrid: {
    container: {
      flex: 1,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.lg,
    } as ViewStyle,
    
    // Grid item with overlap
    gridItem: {
      position: 'absolute',
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.xl,
      ...ELEVATION.medium,
      overflow: 'hidden',
    } as ViewStyle,
    
    // Predefined positions for organic layout
    positions: {
      primary: {
        width: AVAILABLE_WIDTH * 0.6,
        height: AVAILABLE_WIDTH * 0.8,
        top: SPACING.xl,
        left: SPACING.lg,
        zIndex: 3,
      } as ViewStyle,
      
      secondary: {
        width: AVAILABLE_WIDTH * 0.5,
        height: AVAILABLE_WIDTH * 0.7,
        top: SPACING.xl + 40,
        right: SPACING.lg,
        zIndex: 2,
      } as ViewStyle,
      
      tertiary: {
        width: AVAILABLE_WIDTH * 0.45,
        height: AVAILABLE_WIDTH * 0.6,
        bottom: SPACING.xl + 60,
        left: SPACING.xl,
        zIndex: 1,
      } as ViewStyle,
      
      quaternary: {
        width: AVAILABLE_WIDTH * 0.4,
        height: AVAILABLE_WIDTH * 0.55,
        bottom: SPACING.xl,
        right: SPACING.xl + 20,
        zIndex: 1,
      } as ViewStyle
    }
  },
  
  // Magazine-style collage
  magazineCollage: {
    container: {
      flex: 1,
      paddingHorizontal: SPACING.sm,
    } as ViewStyle,
    
    // Large feature card
    featureCard: {
      width: AVAILABLE_WIDTH * 0.7,
      height: AVAILABLE_WIDTH * 0.9,
      position: 'absolute',
      top: SPACING.xxl,
      left: SPACING.lg,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.organic,
      ...ELEVATION.organic,
      zIndex: 3,
      transform: [{ rotate: '-2deg' }],
    } as ViewStyle,
    
    // Small accent cards
    accentCard1: {
      width: AVAILABLE_WIDTH * 0.4,
      height: AVAILABLE_WIDTH * 0.5,
      position: 'absolute',
      top: SPACING.xl + 20,
      right: SPACING.md,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.xl,
      ...ELEVATION.soft,
      zIndex: 2,
      transform: [{ rotate: '3deg' }],
    } as ViewStyle,
    
    accentCard2: {
      width: AVAILABLE_WIDTH * 0.35,
      height: AVAILABLE_WIDTH * 0.45,
      position: 'absolute',
      bottom: SPACING.xxl + 40,
      right: SPACING.xl,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.lg,
      ...ELEVATION.medium,
      zIndex: 2,
      transform: [{ rotate: '-1deg' }],
    } as ViewStyle,
    
    accentCard3: {
      width: AVAILABLE_WIDTH * 0.3,
      height: AVAILABLE_WIDTH * 0.4,
      position: 'absolute',
      bottom: SPACING.xl,
      left: SPACING.lg + 10,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.lg,
      ...ELEVATION.soft,
      zIndex: 1,
      transform: [{ rotate: '2deg' }],
    } as ViewStyle
  }
} as const;

// Card interaction states
export const COLLAGE_INTERACTIONS = {
  // Swipe gestures
  swipe: {
    // Card being swiped
    active: {
      ...ELEVATION.high,
      transform: [{ scale: 1.02 }],
    } as ViewStyle,
    
    // Swipe right (like)
    swipeRight: {
      borderWidth: 3,
      borderColor: UNIFIED_COLORS.success[500],
      backgroundColor: UNIFIED_COLORS.sage[100],
    } as ViewStyle,
    
    // Swipe left (pass)
    swipeLeft: {
      borderWidth: 3,
      borderColor: UNIFIED_COLORS.error[500],
      backgroundColor: UNIFIED_COLORS.background.secondary,
    } as ViewStyle,
    
    // Swipe up (super like)
    swipeUp: {
      borderWidth: 3,
      borderColor: UNIFIED_COLORS.gold[500],
      backgroundColor: UNIFIED_COLORS.gold[100],
    } as ViewStyle
  },
  
  // Tap interactions
  tap: {
    // Card being tapped
    pressed: {
      transform: [{ scale: 0.98 }],
      ...ELEVATION.medium,
    } as ViewStyle,
    
    // Card details overlay
    detailsOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.xl,
      borderBottomLeftRadius: BORDER_RADIUS.xxl,
      borderBottomRightRadius: BORDER_RADIUS.xxl,
    } as ViewStyle
  },
  
  // Long press interactions
  longPress: {
    // Card being long pressed
    active: {
      transform: [{ scale: 1.05 }],
      ...ELEVATION.floating,
      borderWidth: 2,
      borderColor: UNIFIED_COLORS.sage[300],
    } as ViewStyle
  }
} as const;

// Efficiency score indicator overlay
export const EFFICIENCY_INDICATOR = {
  container: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: UNIFIED_COLORS.background.elevated,
    ...ELEVATION.soft,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  } as ViewStyle,
  
  // Different efficiency levels
  levels: {
    high: {
      borderWidth: 3,
      borderColor: UNIFIED_COLORS.success[500],
      backgroundColor: UNIFIED_COLORS.sage[100],
    } as ViewStyle,
    
    medium: {
      borderWidth: 3,
      borderColor: UNIFIED_COLORS.gold[500],
      backgroundColor: UNIFIED_COLORS.gold[100],
    } as ViewStyle,
    
    low: {
      borderWidth: 3,
      borderColor: UNIFIED_COLORS.error[500],
      backgroundColor: UNIFIED_COLORS.background.secondary,
    } as ViewStyle
  }
} as const;

// Animation configurations for collage layouts
export const COLLAGE_ANIMATIONS = {
  // Card entrance animations
  entrance: {
    fadeInScale: {
      duration: 500,
      easing: 'easeOutBack',
      initialOpacity: 0,
      initialTransform: [{ scale: 0.8 }, { translateY: 50 }],
    },
    
    slideInRotate: {
      duration: 600,
      easing: 'easeOutCubic',
      initialTransform: [{ translateX: 100 }, { rotate: '10deg' }],
    },
    
    organicFloat: {
      duration: 800,
      easing: 'easeOutQuart',
      initialOpacity: 0,
      initialTransform: [{ translateY: 30 }, { scale: 0.9 }],
    }
  },
  
  // Swipe animations
  swipe: {
    duration: 300,
    easing: 'easeOutQuart',
    exitTransform: {
      right: [{ translateX: screenWidth }, { rotate: '15deg' }],
      left: [{ translateX: -screenWidth }, { rotate: '-15deg' }],
      up: [{ translateY: -screenHeight }, { scale: 1.1 }],
    },
  },
  
  // Hover/focus animations
  hover: {
    duration: 200,
    easing: 'easeOutCubic',
    transform: [{ scale: 1.02 }],
    elevation: ELEVATION.high,
  }
} as const;

// Responsive configurations for different screen sizes
export const COLLAGE_RESPONSIVE = {
  small: {
    cardSpacing: SPACING.sm,
    overlapRatio: 0.15,
    rotationRange: 2, // degrees
  },
  
  medium: {
    cardSpacing: SPACING.md,
    overlapRatio: 0.2,
    rotationRange: 3,
  },
  
  large: {
    cardSpacing: SPACING.lg,
    overlapRatio: 0.25,
    rotationRange: 4,
  }
} as const;

// Helper functions
export const getCollageCardPosition = (index: number, total: number, layoutType: 'stack' | 'grid' | 'magazine') => {
  switch (layoutType) {
    case 'stack':
      return {
        zIndex: total - index,
        transform: [
          { scale: 1 - (index * 0.05) },
          { translateY: index * 8 }
        ],
        opacity: 1 - (index * 0.2)
      };
    
    case 'grid':
      const positions = Object.values(COLLAGE_LAYOUTS.overlappingGrid.positions);
      return positions[index % positions.length];
    
    case 'magazine':
      const rotations = [-2, 3, -1, 2, -3];
      return {
        transform: [{ rotate: `${rotations[index % rotations.length]}deg` }]
      };
    
    default:
      return {};
  }
};

// Export for easy access
export const CollageLayouts = COLLAGE_LAYOUTS;
export default COLLAGE_LAYOUTS;

// Type definitions
export type CollageLayoutType = keyof typeof COLLAGE_LAYOUTS;
export type CollageInteraction = keyof typeof COLLAGE_INTERACTIONS;
export type EfficiencyLevel = keyof typeof EFFICIENCY_INDICATOR.levels;
export type CollageAnimation = keyof typeof COLLAGE_ANIMATIONS;