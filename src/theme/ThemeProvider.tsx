import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { DesignSystem, DesignSystemType } from './DesignSystem';

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

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeReady, setThemeReady] = useState(false);
  
  useEffect(() => {
    // Ensure theme is available even with network issues
    const initializeTheme = async () => {
      try {
        // Add a small delay to ensure DesignSystem is fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Validate theme structure
        if (DesignSystem && DesignSystem.colors && DesignSystem.typography) {
          setThemeReady(true);
        } else {
          // Theme not fully loaded, using fallback
          setThemeReady(true); // Still proceed with fallback
        }
      } catch (error) {
        // Theme initialization error
        setThemeReady(true); // Proceed anyway
      }
    };
    
    initializeTheme();
  }, []);
  
  if (!themeReady) {
    return null; // or a loading component
  }
  
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
}

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

// Add isDark support for components that need it
export const useThemeWithDark = () => {
  const theme = useTheme();
  return {
    ...theme,
    isDark: false // Set to false for light theme, or implement dark mode logic
  };
};

export default ThemeProvider;