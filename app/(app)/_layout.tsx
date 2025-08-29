import '@/ignore-warnings';

import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
// app/(app)/_layout.tsx - Optimized Premium Layout
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider } from '@/providers/AppProvider';
import { DesignSystem } from '@/theme/DesignSystem';

// ContextNavigator primary color hatası için özel navigasyon teması
const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: DesignSystem.colors.sage[600],
    background: DesignSystem.colors.surface.primary,
    card: DesignSystem.colors.surface.secondary,
    text: DesignSystem.colors.text.primary,
    border: DesignSystem.colors.border.primary,
    notification: DesignSystem.colors.coral[500],
  },
};

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationThemeProvider value={customTheme}>
          <Stack screenOptions={{ headerShown: false }} />
        </NavigationThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
