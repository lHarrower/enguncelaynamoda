/**
 * AYNAMODA Theme Provider
 * Merkezi tema sağlayıcısı - tüm uygulama boyunca tema erişimi
 */

import React, { createContext, useContext, ReactNode } from 'react';
import theme from './theme';

// Theme context'i oluştur
const ThemeContext = createContext(theme);

// Theme Provider bileşeni
interface ThemeProviderProps {
  children: ReactNode;
  customTheme?: typeof theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  customTheme = theme 
}) => {
  return (
    <ThemeContext.Provider value={customTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme hook'u
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Styled component helper'ları
export const createStyles = (styleFunction: (theme: typeof theme) => any) => {
  return (currentTheme: typeof theme = theme) => styleFunction(currentTheme);
};

// Theme utilities
export const getColor = (colorPath: string, fallback: string = '#000000') => {
  const pathArray = colorPath.split('.');
  let current: any = theme.colors;
  
  for (const key of pathArray) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return fallback;
    }
  }
  
  return typeof current === 'string' ? current : fallback;
};

export const getSpacing = (size: keyof typeof theme.spacing) => {
  return theme.spacing[size] || 0;
};

export const getFontSize = (size: keyof typeof theme.fontSizes) => {
  return theme.fontSizes[size] || theme.fontSizes.base;
};

export const getBorderRadius = (size: keyof typeof theme.borderRadius) => {
  return theme.borderRadius[size] || 0;
};

// Export theme as default
export { theme };
export default ThemeProvider;