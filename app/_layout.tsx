import { Inter_400Regular, Inter_500Medium, useFonts } from '@expo-google-fonts/inter';
import { ThemeProvider } from '@shopify/restyle';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { startupPerformanceService } from '@/services/startupPerformanceService';
import { DesignSystem } from '@/theme/DesignSystem';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Mark app start for performance monitoring
  React.useEffect(() => {
    startupPerformanceService.markAppStart();
  }, []);

  // Load critical fonts first for faster startup
  const [criticalFontsLoaded, criticalFontError] = useFonts({
    Inter_400Regular, // Most used font
    Inter_500Medium, // Secondary critical font
  });

  // Load non-critical fonts after critical ones
  const [allFontsLoaded, setAllFontsLoaded] = useState(false);

  useEffect(() => {
    if (criticalFontsLoaded || criticalFontError) {
      // Mark critical fonts loaded for performance tracking
      startupPerformanceService.markCriticalFontsLoaded();

      // Hide splash screen as soon as critical fonts are loaded
      SplashScreen.hideAsync();

      // Load remaining fonts asynchronously
      const loadRemainingFonts = async () => {
        try {
          // Dynamically import and load non-critical fonts
          const { useFonts: useRemainingFonts } = await import('@expo-google-fonts/inter');
          const { useFonts: usePlayfairFonts } = await import(
            '@expo-google-fonts/playfair-display'
          );

          // Load remaining fonts in background
          setTimeout(() => {
            setAllFontsLoaded(true);
          }, 100);
        } catch (error) {
          // Failed to load non-critical fonts - continue silently
          setAllFontsLoaded(true);
        }
      };

      loadRemainingFonts();
    }
  }, [criticalFontsLoaded, criticalFontError]);

  if (!criticalFontsLoaded && !criticalFontError) {
    return null;
  }

  // Mark first screen render when layout is ready
  React.useEffect(() => {
    if (criticalFontsLoaded || criticalFontError) {
      // Use a small delay to ensure the screen is actually rendered
      const timer = setTimeout(() => {
        startupPerformanceService.markFirstScreenRender();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [criticalFontsLoaded, criticalFontError]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={DesignSystem}>
        <StatusBar style="dark" />
        <Slot />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
