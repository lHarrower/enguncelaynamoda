// Animation System - Organic, Natural Motion Language
import { Easing } from 'react-native';

/**
 * AYNAMODA Animation System
 * 
 * Philosophy: "Digital Zen Garden" - Movements should feel organic, natural, and purposeful.
 * Every animation should enhance user understanding, not distract from it.
 * 
 * Inspired by:
 * - Natural phenomena (water flow, wind, organic growth)
 * - Luxury brand motion (smooth, confident, refined)
 * - Wellness apps (calm, soothing, mindful)
 */

// Fallback easing functions for test environment
const createFallbackEasing = () => ({
  bezier: (x1: number, y1: number, x2: number, y2: number) => (t: number) => t,
  linear: (t: number) => t,
  ease: (t: number) => t,
  in: (easing: any) => (t: number) => t,
  out: (easing: any) => (t: number) => t,
  inOut: (easing: any) => (t: number) => t,
});

// Use actual Easing or fallback for tests
const EasingAPI = Easing || createFallbackEasing();

// ============================================================================
// TIMING & DURATION
// ============================================================================

export const TIMING = {
  // Micro-interactions (buttons, toggles, small UI elements)
  instant: 150,
  quick: 200,
  
  // Standard transitions (screen changes, modal appearances)
  standard: 300,
  comfortable: 400,
  
  // Complex animations (onboarding, major state changes)
  deliberate: 500,
  thoughtful: 700,
  
  // Zen moments (loading states, meditation-like pauses)
  zen: 1000,
  sanctuary: 1500
} as const;

// ============================================================================
// EASING CURVES - Natural & Organic
// ============================================================================

export const EASING = {
  // Standard easing - smooth and natural
  standard: EasingAPI.bezier(0.4, 0.0, 0.2, 1),
  
  // Entrance animations - confident arrival
  enter: EasingAPI.bezier(0.0, 0.0, 0.2, 1),
  
  // Exit animations - graceful departure
  exit: EasingAPI.bezier(0.4, 0.0, 1, 1),
  
  // Organic curves - inspired by nature
  organic: {
    gentle: EasingAPI.bezier(0.25, 0.46, 0.45, 0.94),    // Like a gentle breeze
    flowing: EasingAPI.bezier(0.23, 1, 0.32, 1),          // Like water flowing
    bouncy: EasingAPI.bezier(0.68, -0.55, 0.265, 1.55),   // Like a soft bounce
    elastic: EasingAPI.bezier(0.175, 0.885, 0.32, 1.275)  // Like elastic material
  },
  
  // Luxury curves - refined and sophisticated
  luxury: {
    smooth: EasingAPI.bezier(0.645, 0.045, 0.355, 1),     // Ultra-smooth luxury
    confident: EasingAPI.bezier(0.23, 1, 0.320, 1),       // Confident and assured
    elegant: EasingAPI.bezier(0.165, 0.84, 0.44, 1)       // Elegant and refined
  },
  
  // Wellness curves - calm and soothing
  wellness: {
    calm: EasingAPI.bezier(0.25, 0.1, 0.25, 1),          // Calm and steady
    soothing: EasingAPI.bezier(0.4, 0.0, 0.6, 1),         // Soothing transition
    mindful: EasingAPI.bezier(0.0, 0.0, 0.58, 1)          // Mindful and present
  }
} as const;

// ============================================================================
// SPRING CONFIGURATIONS
// ============================================================================

export const SPRING = {
  // Gentle springs for UI elements
  gentle: {
    damping: 20,
    stiffness: 300,
    mass: 1
  },
  
  // Bouncy springs for playful interactions
  bouncy: {
    damping: 15,
    stiffness: 400,
    mass: 1
  },
  
  // Smooth springs for luxury feel
  smooth: {
    damping: 25,
    stiffness: 200,
    mass: 1
  },
  
  // Quick springs for responsive feedback
  quick: {
    damping: 18,
    stiffness: 500,
    mass: 0.8
  }
} as const;

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

export const ANIMATIONS = {
  // Fade animations
  fade: {
    in: {
      duration: TIMING.standard,
      easing: EASING.enter,
      useNativeDriver: true
    },
    out: {
      duration: TIMING.quick,
      easing: EASING.exit,
      useNativeDriver: true
    }
  },
  
  // Scale animations
  scale: {
    in: {
      duration: TIMING.standard,
      easing: EASING.organic.gentle,
      useNativeDriver: true
    },
    out: {
      duration: TIMING.quick,
      easing: EASING.exit,
      useNativeDriver: true
    },
    press: {
      duration: TIMING.instant,
      easing: EASING.standard,
      useNativeDriver: true
    }
  },
  
  // Slide animations
  slide: {
    up: {
      duration: TIMING.comfortable,
      easing: EASING.luxury.elegant,
      useNativeDriver: true
    },
    down: {
      duration: TIMING.standard,
      easing: EASING.exit,
      useNativeDriver: true
    },
    left: {
      duration: TIMING.standard,
      easing: EASING.organic.flowing,
      useNativeDriver: true
    },
    right: {
      duration: TIMING.standard,
      easing: EASING.organic.flowing,
      useNativeDriver: true
    }
  },
  
  // Rotation animations
  rotate: {
    gentle: {
      duration: TIMING.deliberate,
      easing: EASING.wellness.calm,
      useNativeDriver: true
    },
    quick: {
      duration: TIMING.standard,
      easing: EASING.standard,
      useNativeDriver: true
    }
  },
  
  // Loading animations
  loading: {
    pulse: {
      duration: TIMING.zen,
      easing: EASING.wellness.soothing,
      useNativeDriver: true
    },
    shimmer: {
      duration: TIMING.thoughtful,
      easing: EASING.luxury.smooth,
      useNativeDriver: true
    }
  },
  
  // Gesture animations
  gesture: {
    swipe: {
      duration: TIMING.standard,
      easing: EASING.organic.flowing,
      useNativeDriver: true
    },
    drag: {
      duration: TIMING.quick,
      easing: EASING.standard,
      useNativeDriver: true
    }
  }
} as const;

// ============================================================================
// STAGGER CONFIGURATIONS
// ============================================================================

export const STAGGER = {
  // List item animations
  list: {
    delay: 50,
    maxDelay: 300
  },
  
  // Grid item animations
  grid: {
    delay: 75,
    maxDelay: 400
  },
  
  // Card animations
  cards: {
    delay: 100,
    maxDelay: 500
  },
  
  // Onboarding step animations
  onboarding: {
    delay: 200,
    maxDelay: 800
  }
} as const;

// ============================================================================
// ACCESSIBILITY SUPPORT
// ============================================================================

export const ACCESSIBILITY = {
  // Reduced motion preferences
  reducedMotion: {
    duration: TIMING.instant,
    easing: EasingAPI.linear,
    useNativeDriver: true
  },
  
  // High contrast mode adjustments
  highContrast: {
    // Disable subtle animations that might be hard to see
    disableSubtle: true,
    // Increase animation contrast
    enhanceVisibility: true
  }
} as const;

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

export const PERFORMANCE = {
  // Native driver usage guidelines
  nativeDriver: {
    // Properties that can use native driver
    supported: ['opacity', 'transform'],
    // Properties that cannot use native driver
    unsupported: ['backgroundColor', 'width', 'height']
  },
  
  // 60fps optimization settings
  optimization: {
    // Use layout animations sparingly
    layoutAnimations: false,
    // Prefer transform over layout changes
    preferTransform: true,
    // Batch animations when possible
    batchAnimations: true
  }
} as const;

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

/**
 * Creates a staggered animation sequence
 */
export const createStaggeredAnimation = (
  items: number,
  baseAnimation: any,
  staggerConfig = STAGGER.list
) => {
  const count = Math.max(0, Math.floor(items));
  return Array.from({ length: count }).map((_, index) => ({
    ...baseAnimation,
    delay: Math.min(index * staggerConfig.delay, staggerConfig.maxDelay)
  }));
};

/**
 * Creates a spring animation with organic feel
 */
export const createOrganicSpring = (
  toValue: number,
  config = SPRING.gentle
) => ({
  toValue,
  ...config,
  useNativeDriver: true
});

/**
 * Creates a timing animation with luxury easing
 */
export const createLuxuryTiming = (
  toValue: number,
  duration = TIMING.standard,
  easing = EASING.luxury.elegant
) => ({
  toValue,
  duration,
  easing,
  useNativeDriver: true
});

/**
 * Checks if reduced motion is preferred and returns appropriate animation
 */
export const getAccessibleAnimation = (
  normalAnimation: any,
  reducedMotionPreferred: boolean = false
) => {
  if (reducedMotionPreferred) {
    return {
      ...normalAnimation,
      ...ACCESSIBILITY.reducedMotion
    };
  }
  return normalAnimation;
};

// ============================================================================
// ANIMATION SEQUENCES
// ============================================================================

export const SEQUENCES = {
  // Screen entrance sequence
  screenEnter: [
    { property: 'opacity', from: 0, to: 1, ...ANIMATIONS.fade.in },
    { property: 'translateY', from: 20, to: 0, ...ANIMATIONS.slide.up }
  ],
  
  // Screen exit sequence
  screenExit: [
    { property: 'opacity', from: 1, to: 0, ...ANIMATIONS.fade.out },
    { property: 'translateY', from: 0, to: -20, ...ANIMATIONS.slide.up }
  ],
  
  // Modal appearance sequence
  modalEnter: [
    { property: 'opacity', from: 0, to: 1, ...ANIMATIONS.fade.in },
    { property: 'scale', from: 0.9, to: 1, ...ANIMATIONS.scale.in }
  ],
  
  // Modal dismissal sequence
  modalExit: [
    { property: 'opacity', from: 1, to: 0, ...ANIMATIONS.fade.out },
    { property: 'scale', from: 1, to: 0.9, ...ANIMATIONS.scale.out }
  ],
  
  // Button press feedback
  buttonPress: [
    { property: 'scale', from: 1, to: 0.95, ...ANIMATIONS.scale.press }
  ],
  
  // Card hover/focus effect
  cardHover: [
    { property: 'scale', from: 1, to: 1.02, ...ANIMATIONS.scale.in },
    { property: 'translateY', from: 0, to: -2, duration: TIMING.standard }
  ]
} as const;

// ============================================================================
// EXPORT DEFAULT ANIMATION SYSTEM
// ============================================================================

export const AnimationSystem = {
  timing: TIMING,
  easing: EASING,
  spring: SPRING,
  animations: ANIMATIONS,
  stagger: STAGGER,
  accessibility: ACCESSIBILITY,
  performance: PERFORMANCE,
  sequences: SEQUENCES,
  
  // Utility functions
  createStaggeredAnimation,
  createOrganicSpring,
  createLuxuryTiming,
  getAccessibleAnimation
} as const;

export default AnimationSystem;