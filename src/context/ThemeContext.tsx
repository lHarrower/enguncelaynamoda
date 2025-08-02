import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DesignSystem, { UNIFIED_COLORS, type DesignSystemType } from '@/theme/DesignSystem';

export type Theme = 'light' | 'dark';

// Create theme-specific color variations
const createThemeColors = (isDark: boolean) => ({
  ...UNIFIED_COLORS,
  background: {
    primary: isDark ? '#1A1A1A' : UNIFIED_COLORS.background.primary,
    secondary: isDark ? '#2A2A2A' : UNIFIED_COLORS.background.secondary,
    elevated: isDark ? '#3A3A3A' : UNIFIED_COLORS.background.elevated,
    overlay: isDark ? 'rgba(0,0,0,0.8)' : UNIFIED_COLORS.background.overlay
  },
  text: {
    primary: isDark ? '#FFFFFF' : UNIFIED_COLORS.text.primary,
    secondary: isDark ? '#E0E0E0' : UNIFIED_COLORS.text.secondary,
    tertiary: isDark ? '#B0B0B0' : UNIFIED_COLORS.text.tertiary,
    inverse: isDark ? '#212529' : UNIFIED_COLORS.text.inverse
  }
});

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  designSystem: DesignSystemType;
  colors: ReturnType<typeof createThemeColors>;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@aynamoda_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to light mode for white luxury styling as user prefers
  const [theme, setThemeState] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  const isDark = theme === 'dark';
  const colors = useMemo(() => createThemeColors(isDark), [isDark]);
  const designSystem = useMemo(() => ({
    ...DesignSystem,
    colors
  }), [colors]);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeState(savedTheme);
      } else {
        // Default to light mode for white luxury experience
        setThemeState('light');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      // Fallback to light mode for white luxury styling
      setThemeState('light');
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = React.useCallback(async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  const value = useMemo(() => ({
    theme,
    isDark,
    designSystem,
    colors,
    setTheme,
    toggleTheme,
  }), [theme, isDark, designSystem, colors, setTheme, toggleTheme]);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}