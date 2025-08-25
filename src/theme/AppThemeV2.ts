import { TextStyle } from 'react-native';

// ORGANIC PALETTE - The Visual Constitution
export const Colors = {
  // Primary Palette
  linen: '#FAF7F2', // Soft, warm base
  inkGray: '#2C2C2C', // Deep, sophisticated text
  sageGreen: '#A8B5A0', // Calming, natural accent
  liquidGold: '#D4AF37', // Luxury highlight

  // Secondary Palette
  dustyRose: '#D4A5A5', // Gentle feminine touch
  charcoal: '#36454F', // Strong contrast
  cream: '#F5F5DC', // Soft alternative to white
  pearl: '#E8E8E8', // Subtle borders and dividers

  // Functional Colors
  success: '#7A9A7A', // Muted green for success states
  warning: '#D4A574', // Warm amber for warnings
  error: '#C4848C', // Soft red for errors

  // Transparency Layers
  linenOpacity: 'rgba(250, 247, 242, 0.95)',
  inkOpacity: 'rgba(44, 44, 44, 0.8)',
  goldOpacity: 'rgba(212, 175, 55, 0.2)',
} as const;

// EDITORIAL QUALITY TYPOGRAPHY
export const Typography = {
  // Headlines - Playfair Display
  headline: {
    fontFamily: 'Playfair Display',
    fontSize: 32,
    fontWeight: '600' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: Colors.inkGray,
  } as TextStyle,

  title: {
    fontFamily: 'Playfair Display',
    fontSize: 24,
    fontWeight: '500' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
    color: Colors.inkGray,
  } as TextStyle,

  subtitle: {
    fontFamily: 'Playfair Display',
    fontSize: 20,
    fontWeight: '400' as const,
    lineHeight: 28,
    letterSpacing: 0,
    color: Colors.charcoal,
  } as TextStyle,

  // Body Text - Manrope
  body: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: Colors.inkGray,
  } as TextStyle,

  bodyMedium: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: Colors.inkGray,
  } as TextStyle,

  caption: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: Colors.charcoal,
  } as TextStyle,

  captionMedium: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: Colors.charcoal,
  } as TextStyle,

  small: {
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: Colors.charcoal,
  } as TextStyle,

  // Special Typography
  luxury: {
    fontFamily: 'Playfair Display',
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    letterSpacing: -0.4,
    color: Colors.liquidGold,
  } as TextStyle,

  accent: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: Colors.sageGreen,
    textTransform: 'uppercase' as const,
  } as TextStyle,
} as const;

// SPACING SYSTEM - Harmonious Proportions
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Semantic Spacing
  cardPadding: 20,
  screenPadding: 24,
  sectionSpacing: 32,
  componentSpacing: 16,
} as const;

// ELEVATION SYSTEM - Subtle Depth
export const Elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  subtle: {
    shadowColor: Colors.inkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  soft: {
    shadowColor: Colors.inkGray,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  medium: {
    shadowColor: Colors.inkGray,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },

  high: {
    shadowColor: Colors.inkGray,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

// BORDER RADIUS SYSTEM
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 50,

  // Semantic Radius
  card: 12,
  button: 8,
  input: 6,
  modal: 16,
} as const;

// OPACITY SYSTEM
export const Opacity = {
  transparent: 0,
  subtle: 0.05,
  light: 0.1,
  medium: 0.2,
  strong: 0.4,
  heavy: 0.6,
  opaque: 0.8,
  solid: 1,
} as const;

// ANIMATION TIMINGS
export const Animation = {
  fast: 200,
  medium: 300,
  slow: 500,
  luxury: 800,

  // Easing
  easeInOut: 'ease-in-out',
  easeOut: 'ease-out',
  easeIn: 'ease-in',
} as const;

// LAYOUT CONSTANTS
export const Layout = {
  screenWidth: '100%',
  screenHeight: '100%',
  headerHeight: 60,
  tabBarHeight: 80,

  // Content Widths
  maxContentWidth: 400,
  cardWidth: '100%',
  buttonHeight: 48,
  inputHeight: 52,
} as const;

// LUXURY THEME OBJECT
export const LuxuryTheme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  elevation: Elevation,
  borderRadius: BorderRadius,
  opacity: Opacity,
  animation: Animation,
  layout: Layout,
} as const;

// Re-export legacy luxury design tokens for backward compatibility
export {
  LuxuryLayout,
  LuxuryMaterials,
  LuxuryMotion,
  LuxuryShadows,
  LuxurySpacing,
  LuxuryTypography,
} from '@/constants/LuxuryTheme';

// TYPE EXPORTS
export type LuxuryThemeType = typeof LuxuryTheme;
export type ColorKeys = keyof typeof Colors;
export type TypographyKeys = keyof typeof Typography;
export type SpacingKeys = keyof typeof Spacing;

export default LuxuryTheme;
