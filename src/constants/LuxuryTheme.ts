/**
 * Legacy Luxury Theme Constants
 * Backward compatibility exports for existing components
 */

import { UNIFIED_COLORS } from '../theme/DesignSystem';

// Legacy luxury materials
export const LuxuryMaterials = {
  glass: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  metal: {
    gold: UNIFIED_COLORS.gold[500],
    silver: '#C0C0C0',
    bronze: '#CD7F32',
  },
  fabric: {
    silk: UNIFIED_COLORS.background.primary,
    velvet: UNIFIED_COLORS.charcoal[800],
    linen: UNIFIED_COLORS.background.secondary,
  },
};

// Legacy luxury motion
export const LuxuryMotion = {
  spring: {
    tension: 300,
    friction: 30,
  },
  timing: {
    fast: 200,
    medium: 400,
    slow: 600,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Legacy luxury shadows
export const LuxuryShadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Legacy luxury layout
export const LuxuryLayout = {
  container: {
    padding: 20,
    maxWidth: 400,
  },
  grid: {
    columns: 2,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
};

// Legacy luxury spacing
export const LuxurySpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Legacy luxury typography
export const LuxuryTypography = {
  fontFamily: {
    primary: 'Inter',
    secondary: 'Playfair Display',
    mono: 'SF Mono',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};
