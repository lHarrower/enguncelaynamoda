// Premium UI Component System - Industry-Leading Design Components
// Export all premium components for easy access throughout the app

export { default as PremiumButton } from './PremiumButton';
export { default as PremiumCard } from './PremiumCard';
export { default as PremiumHomeScreen } from './PremiumHomeScreen';
export { default as PremiumInput } from './PremiumInput';
export { default as PremiumLoadingScreen } from './PremiumLoadingScreen';
export { default as PremiumTabBar } from './PremiumTabBar';

// Premium Brand Components - ARUOM, FIRED, AYNAMODA
export { default as PremiumBrandCard } from './PremiumBrandCard';
export { default as PremiumBrandShowcase } from './PremiumBrandShowcase';

// Re-export types
export type { BrandType, PremiumBrandCardData } from './PremiumBrandCard';

// Re-export the premium theme system
export { DesignSystem } from '@/theme/DesignSystem';

// Premium brand constants
export const PREMIUM_BRANDS = {
  ARUOM: {
    name: 'ARUOM',
    philosophy: 'Minimalist Luxury',
    colors: {
      primary: '#1A1A1A',
      secondary: '#F5F5F5',
      accent: '#D4AF37',
    },
  },
  FIRED: {
    name: 'FIRED',
    philosophy: 'Bold Expression',
    colors: {
      primary: '#8B0000',
      secondary: '#FFE4E1',
      accent: '#FF6B35',
    },
  },
  AYNAMODA: {
    name: 'AYNAMODA',
    philosophy: 'Confident Elegance',
    colors: {
      primary: '#2C3E50',
      secondary: '#ECF0F1',
      accent: '#E67E22',
    },
  },
} as const;
