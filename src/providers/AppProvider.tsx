// src/providers/AppProvider.tsx

import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ThemeProvider } from '@shopify/restyle';
import { ThemeProvider as NavigationThemeProvider, DefaultTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RestyleTheme, UNIFIED_COLORS } from '@/theme/DesignSystem';

// Create a safe theme that ensures compatibility with expo-router's ContextNavigator
const safeTheme = {
  ...RestyleTheme,
  colors: {
    ...RestyleTheme.colors,
    // Provide primary as simple string for expo-router compatibility
    primary: UNIFIED_COLORS.primary[500],
    // Keep indexed structure for other components
    primaryIndexed: UNIFIED_COLORS.primary,
    // Ensure all required color properties exist
    background: RestyleTheme.colors?.background || UNIFIED_COLORS.background.primary,
    text: RestyleTheme.colors?.text || UNIFIED_COLORS.text.primary,
    card: RestyleTheme.colors?.card || UNIFIED_COLORS.background.secondary,
    border: RestyleTheme.colors?.border || UNIFIED_COLORS.border.primary,
    notification: RestyleTheme.colors?.notification || UNIFIED_COLORS.primary[500]
  }
};

// Create React Navigation compatible theme for expo-router with static values
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#B8A082',
    background: '#FAF9F6',
    card: '#F8F7F4',
    text: '#212529',
    border: '#E5E7EB',
    notification: '#B8A082',
  },
};
import { AuthProvider } from '@/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NetworkErrorBoundary } from '@/components/error/NetworkErrorBoundary';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();
        
        // Pre-load fonts, make any API calls you need to do here
        // Artificially delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        // Warning suppressed
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  // Always provide the theme, even during loading
  const content = !fontsLoaded || !appIsReady ? (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Loading state */}
    </View>
  ) : (
    <NetworkErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <StatusBar style="dark" backgroundColor={safeTheme.colors.background} />
          {children}
        </AuthProvider>
      </GestureHandlerRootView>
    </NetworkErrorBoundary>
  );

  return (
    <ErrorBoundary>
      <NavigationThemeProvider value={navigationTheme}>
        <ThemeProvider theme={safeTheme}>
          {content}
        </ThemeProvider>
      </NavigationThemeProvider>
    </ErrorBoundary>
  );
}