/**
 * AYNAMODA Vision Theme System
 * "Confidence as a Service" - A Serene Styling Sanctuary
 *
 * Inspired by: Spotify's clarity, Gucci's premium polish,
 * Poppi's fluid motion, Sonos' confident minimalism
 */

export const AYNAMODA_VISION_THEME = {
  // CORE PHILOSOPHY: Bright, Airy, Confident, Effortlessly Luxurious
  colors: {
    // Primary Palette: Serene Confidence
    primary: {
      cream: '#FFF8F0', // Warm sunlit base
      sage: '#E8F4E6', // Calming green accent
      pearl: '#F7F7F7', // Pure clarity
      champagne: '#F5F1E8', // Luxurious warmth
    },

    // Accent Palette: Vibrant Life
    accent: {
      coral: '#FF6B6B', // Confident energy
      lavender: '#B794F6', // Creative inspiration
      mint: '#68D391', // Fresh discovery
      gold: '#F6E05E', // Premium highlight
    },

    // Neutral Palette: Sophisticated Foundation
    neutral: {
      charcoal: '#2D3748', // Deep elegance
      slate: '#4A5568', // Refined text
      mist: '#E2E8F0', // Gentle boundaries
      whisper: '#F7FAFC', // Subtle backgrounds
    },

    // Semantic Colors
    success: '#48BB78',
    warning: '#ED8936',
    error: '#F56565',
    info: '#4299E1',
  },

  // TYPOGRAPHY: Confident Hierarchy
  typography: {
    // Display: For hero moments
    display: {
      fontFamily: 'PlayfairDisplay_700Bold',
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: -0.5,
    },

    // Headlines: Clear communication
    h1: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: -0.3,
    },

    h2: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 20,
      lineHeight: 28,
      letterSpacing: -0.2,
    },

    h3: {
      fontFamily: 'Inter_500Medium',
      fontSize: 18,
      lineHeight: 24,
      letterSpacing: -0.1,
    },

    // Body: Readable elegance
    body: {
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0,
    },

    bodySmall: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
    },

    // Labels: Precise communication
    label: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
  },

  // SPACING: Breathing Room Philosophy
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  // LAYOUT: Bento Box Grid System
  layout: {
    // Bento Grid Ratios
    bento: {
      small: { width: 1, height: 1 }, // 1:1 square
      medium: { width: 2, height: 1 }, // 2:1 rectangle
      large: { width: 2, height: 2 }, // 2:2 large square
      hero: { width: 3, height: 2 }, // 3:2 hero banner
    },

    // Container Sizes
    container: {
      padding: 20,
      maxWidth: 400,
    },

    // Card System
    card: {
      borderRadius: 16,
      padding: 20,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
  },

  // MOTION: Physics-Based Poetry
  motion: {
    // Timing Functions: Natural Ease
    easing: {
      gentle: [0.25, 0.46, 0.45, 0.94], // Gentle entrance
      confident: [0.68, -0.55, 0.265, 1.55], // Confident bounce
      fluid: [0.4, 0, 0.2, 1], // Fluid transition
      instant: [0, 0, 1, 1], // Immediate response
    },

    // Duration Scale
    duration: {
      instant: 150,
      quick: 250,
      smooth: 400,
      graceful: 600,
      dramatic: 1000,
    },

    // Spring Physics
    spring: {
      gentle: { damping: 20, stiffness: 300 },
      bouncy: { damping: 15, stiffness: 400 },
      snappy: { damping: 25, stiffness: 500 },
    },
  },

  // GLASSMORPHISM: Ethereal Depth
  glass: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      backdropFilter: 'blur(20px)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.18)',
    },

    dark: {
      backgroundColor: 'rgba(45, 55, 72, 0.25)',
      backdropFilter: 'blur(20px)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
  },

  // SIGNATURE INTERACTIONS: The X-Factor
  signature: {
    // Magnetic Attraction: Cards that subtly pull toward touch
    magneticRadius: 60,
    magneticStrength: 0.3,

    // Ripple Physics: Touch creates expanding energy
    rippleScale: 2.5,
    rippleDuration: 800,

    // Parallax Depth: Layers that respond to device motion
    parallaxLayers: [0.1, 0.3, 0.5, 0.8],

    // Morphing Transitions: Elements that fluidly transform
    morphDuration: 600,
    morphEasing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // COMPONENT VARIANTS
  variants: {
    button: {
      primary: {
        backgroundColor: '#FF6B6B',
        color: '#FFFFFF',
        shadow: 'coral',
      },
      secondary: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        color: '#FF6B6B',
        border: '#FF6B6B',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#2D3748',
        border: 'transparent',
      },
    },

    card: {
      elevated: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
      },
      floating: {
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 32,
        elevation: 16,
      },
    },
  },
} as const;

// THEME UTILITIES
export const getSpacing = (size: keyof typeof AYNAMODA_VISION_THEME.spacing) =>
  AYNAMODA_VISION_THEME.spacing[size];

export const getColor = (category: string, shade?: string) => {
  const colors = AYNAMODA_VISION_THEME.colors as any;
  return shade ? colors[category]?.[shade] : colors[category];
};

export const getTypography = (variant: keyof typeof AYNAMODA_VISION_THEME.typography) =>
  AYNAMODA_VISION_THEME.typography[variant];

// MOTION PRESETS
export const getSpring = (type: keyof typeof AYNAMODA_VISION_THEME.motion.spring) =>
  AYNAMODA_VISION_THEME.motion.spring[type];

export const getTransition = (duration: keyof typeof AYNAMODA_VISION_THEME.motion.duration) => ({
  duration: AYNAMODA_VISION_THEME.motion.duration[duration],
  easing: AYNAMODA_VISION_THEME.motion.easing.fluid,
});
