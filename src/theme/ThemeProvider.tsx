/**
 * AYNAMODA Theme Provider
 * Provides unified design system context throughout the application
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { DesignSystem, DesignSystemType } from '@/theme/DesignSystem';

// Theme Context
interface ThemeContextType {
  theme: DesignSystemType;
  colors: typeof DesignSystem.colors;
  typography: typeof DesignSystem.typography;
  spacing: typeof DesignSystem.spacing;
  layout: typeof DesignSystem.layout;
  elevation: typeof DesignSystem.elevation;
  borderRadius: typeof DesignSystem.borderRadius;
  components: typeof DesignSystem.components;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider Component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeValue: ThemeContextType = {
    theme: DesignSystem,
    colors: DesignSystem.colors,
    typography: DesignSystem.typography,
    spacing: DesignSystem.spacing,
    layout: DesignSystem.layout,
    elevation: DesignSystem.elevation,
    borderRadius: DesignSystem.borderRadius,
    components: DesignSystem.components
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Convenience hooks for specific theme parts
export const useColors = () => useTheme().colors;
export const useTypography = () => useTheme().typography;
export const useSpacing = () => useTheme().spacing;
export const useLayout = () => useTheme().layout;
export const useElevation = () => useTheme().elevation;
export const useBorderRadius = () => useTheme().borderRadius;
export const useComponents = () => useTheme().components;

export default ThemeProvider;