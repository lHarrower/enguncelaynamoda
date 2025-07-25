// 🖤 LUXURY BRIGHT MINIMALIST COLOR SYSTEM
// Premium Sophistication - Bright, clean palette with luxurious depth

const LuxuryColors = {
  // Core Bright Whites & Deep Blacks
  pristine: '#FFFFFF',           // Pristine white - ultra clean backgrounds
  ivory: '#FEFEFE',             // Ivory white - softer backgrounds
  pearl: '#FDFDFD',             // Pearl white - card backgrounds
  ink: '#000000',               // Pure black - primary text, emphasis
  charcoal: '#1A1A1A',          // Deep charcoal - secondary text
  graphite: '#2A2A2A',          // Medium dark - borders, dividers
  
  // Bright Neutral Spectrum
  cloud: '#FCFCFC',             // Cloud white - elevated surfaces
  mist: '#F9F9F9',              // Light mist - subtle backgrounds
  silver: '#F5F5F5',            // Bright silver - borders, lines
  platinum: '#F0F0F0',          // Platinum - dividers
  steel: '#E8E8E8',             // Steel - subtle borders
  slate: '#CCCCCC',             // Medium gray - secondary text
  granite: '#999999',           // Dark gray - labels, captions
  
  // Luxury Accents
  gold: '#D4AF37',              // Luxury gold - premium highlights
  rose: '#E8B4B8',              // Rose gold - feminine touches
  crimson: '#DC143C',           // Bright crimson - alerts, sales
  emerald: '#50C878',           // Emerald - success states
  sapphire: '#0F52BA',          // Sapphire - info states
  
  // Functional Bright Colors
  error: '#FF4444',             // Bright error states
  success: '#00C851',           // Bright success states
  warning: '#FFB347',           // Bright warning states
  info: '#33B5E5',              // Bright info states
  
  // Overlay & Glass Effects
  overlay: 'rgba(0, 0, 0, 0.4)',
  glass: 'rgba(255, 255, 255, 0.95)',
  frost: 'rgba(255, 255, 255, 0.85)',
  shimmer: 'rgba(212, 175, 55, 0.1)',
};

// 🌓 Bright Luxury Theme Definitions
export const lightTheme = {
  // Bright Backgrounds
  background: LuxuryColors.pristine,
  surface: LuxuryColors.cloud,
  card: LuxuryColors.pearl,
  elevated: LuxuryColors.mist,
  
  // High Contrast Text
  text: LuxuryColors.ink,
  textSecondary: LuxuryColors.charcoal,
  textTertiary: LuxuryColors.granite,
  textDisabled: LuxuryColors.slate,
  
  // Interactive Elements
  primary: LuxuryColors.ink,
  primaryVariant: LuxuryColors.charcoal,
  accent: LuxuryColors.gold,
  
  // Clean Borders & Dividers
  border: LuxuryColors.platinum,
  divider: LuxuryColors.silver,
  
  // Bright Status Colors
  error: LuxuryColors.error,
  success: LuxuryColors.success,
  warning: LuxuryColors.warning,
  info: LuxuryColors.info,
  
  // Premium Overlay
  overlay: LuxuryColors.overlay,
  glass: LuxuryColors.glass,
  
  // Luxury Effects
  shadow: 'rgba(0, 0, 0, 0.06)',
  backdrop: 'rgba(0, 0, 0, 0.25)',
  shimmer: LuxuryColors.shimmer,
};

export const darkTheme = {
  // Dark Luxury Backgrounds
  background: LuxuryColors.ink,
  surface: LuxuryColors.charcoal,
  card: LuxuryColors.graphite,
  elevated: '#3A3A3A',
  
  // Bright Text on Dark
  text: LuxuryColors.pristine,
  textSecondary: LuxuryColors.pearl,
  textTertiary: LuxuryColors.silver,
  textDisabled: LuxuryColors.slate,
  
  // Interactive Elements
  primary: LuxuryColors.pristine,
  primaryVariant: LuxuryColors.pearl,
  accent: LuxuryColors.gold,
  
  // Borders & Dividers
  border: LuxuryColors.graphite,
  divider: LuxuryColors.charcoal,
  
  // Status Colors
  error: '#FF6B6B',
  success: '#51CF66',
  warning: '#FFD93D',
  info: '#74C0FC',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.8)',
  glass: 'rgba(255, 255, 255, 0.08)',
  
  // Effects
  shadow: 'rgba(0, 0, 0, 0.4)',
  backdrop: 'rgba(0, 0, 0, 0.7)',
  shimmer: 'rgba(212, 175, 55, 0.15)',
};

// 🎨 Semantic Luxury Color Mappings
export const semanticColors = {
  // Editorial Luxury
  editorial: {
    background: LuxuryColors.pristine,
    text: LuxuryColors.ink,
    accent: LuxuryColors.gold,
    highlight: LuxuryColors.rose,
  },
  
  // Premium Product Cards
  product: {
    background: LuxuryColors.pearl,
    border: LuxuryColors.platinum,
    text: LuxuryColors.ink,
    price: LuxuryColors.charcoal,
    sale: LuxuryColors.crimson,
    luxury: LuxuryColors.gold,
  },
  
  // Bright Navigation
  navigation: {
    background: LuxuryColors.pristine,
    active: LuxuryColors.ink,
    inactive: LuxuryColors.granite,
    border: LuxuryColors.platinum,
    shadow: 'rgba(0, 0, 0, 0.05)',
  },
  
  // Premium Authentication
  auth: {
    background: LuxuryColors.pristine,
    input: LuxuryColors.mist,
    button: LuxuryColors.ink,
    buttonText: LuxuryColors.pristine,
    link: LuxuryColors.charcoal,
    accent: LuxuryColors.gold,
  },
};

// 🌈 Luxury Gradient Definitions
export const gradients = {
  // Premium overlays for editorial images
  editorial: ['transparent', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.5)'],
  luxury: ['rgba(212, 175, 55, 0.1)', 'rgba(212, 175, 55, 0.05)'],
  card: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)'],
  glass: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)'],
  shimmer: ['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.1)', 'rgba(212, 175, 55, 0.3)'],
};

// Export the bright luxury theme
export const colors = lightTheme;
export default { lightTheme, darkTheme, semanticColors, gradients }; 