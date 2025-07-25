import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../constants/Colors';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: typeof lightTheme;
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
  const colors = useMemo(() => isDark ? darkTheme : lightTheme, [isDark]);

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
    colors,
    setTheme,
    toggleTheme,
  }), [theme, isDark, colors, setTheme, toggleTheme]);

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