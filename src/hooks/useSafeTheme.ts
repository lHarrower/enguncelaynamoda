// src/hooks/useSafeTheme.ts

import { useTheme } from '@shopify/restyle';

import { DesignSystem, DesignSystemType } from '../theme/DesignSystem';

/**
 * Safe theme hook that provides fallback values to prevent undefined errors
 * and ensures all color values are properly resolved to strings
 */
export function useSafeTheme() {
  const theme = useTheme<DesignSystemType>();

  // Ensure colors are always available as simple strings
  const safeTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      // Ensure primary is a string
      primary: typeof theme.colors.primary === 'object' && theme.colors.primary !== null
        ? (theme.colors.primary as any)[500] || (theme.colors.primary as any).main || '#5C8A5C'
        : theme.colors.primary || '#5C8A5C',      
      // Ensure primaryIndexed is available for components that need color scales
      primaryIndexed: theme.colors.primaryIndexed || theme.colors.sage || {
        500: '#5C8A5C',
        400: '#7FA87F',
        300: '#A8C8A8',
        200: '#D1E1D1',
        100: '#E8F0E8',
        600: '#4A7A4A',
        700: '#3A5F3A',
        800: '#2A4F2A',
        900: '#1A3F1A',
      },
      
      // Ensure text colors are strings - use the correct nested structure
      text: typeof theme.colors.text === 'object'
        ? theme.colors.text.primary || '#2D2A26'
        : theme.colors.text || '#2D2A26',
        
      textSecondary: theme.colors.text?.secondary || '#5A4D3F',
      textTertiary: theme.colors.text?.tertiary || '#7A6B5A',
        
      // Ensure border is a string - use the correct nested structure
      border: typeof theme.colors.border === 'object'
        ? theme.colors.border.primary || '#E5E7EB'
        : theme.colors.border || '#E5E7EB',
        
      // Ensure background is a string - use the correct nested structure
      background: typeof theme.colors.background === 'object'
        ? theme.colors.background.primary || '#FAF9F6'
        : theme.colors.background || '#FAF9F6',
        
      // Ensure surface is a string - use the correct nested structure
      surface: typeof theme.colors.surface === 'object'
        ? theme.colors.surface.primary || '#FEFEFE'
        : theme.colors.surface || '#FEFEFE',
    },
  };

  return safeTheme;
}

/**
 * Hook specifically for accessing primary colors safely
 */
export function usePrimaryColors() {
  const theme = useSafeTheme();
  return theme.colors.primaryIndexed || theme.colors.primary;
}
