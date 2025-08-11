// src/hooks/useSafeTheme.ts

import { useTheme } from '@shopify/restyle';
import { DesignSystemType, DesignSystem } from '@/theme/DesignSystem';

/**
 * Safe theme hook that provides fallback values to prevent undefined errors
 */
export function useSafeTheme() {
  const theme = useTheme<DesignSystemType>();
  
  // Ensure colors.primary is always available as simple string
  const safeTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      // Ensure primary exists as string; fallback to our palette mid-tone
      primary: (theme as any)?.colors?.primary || DesignSystem.colors.primary,
      // Provide an indexed primary scale for components that expect it
      primaryIndexed: (theme as any)?.colors?.primaryIndexed || (DesignSystem as any).colors.primary
    }
  } as any;
  
  return safeTheme;
}

/**
 * Hook specifically for accessing primary colors safely
 */
export function usePrimaryColors() {
  const theme = useSafeTheme();
  return theme.colors.primaryIndexed || theme.colors.primary;
}