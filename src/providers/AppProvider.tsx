// src/providers/AppProvider.tsx

import { ThemeProvider } from '@shopify/restyle';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { RestyleTheme } from '@/theme/DesignSystem';
import { warnInDev } from '@/utils/consoleSuppress';

// Create a safe theme that ensures compatibility with expo-router's ContextNavigator
const safeTheme = {
  ...RestyleTheme,
  colors: {
    ...RestyleTheme.colors,
    // Hardcoded values for Android compatibility
    primary: '#5C8A5C',
    background: '#FAF9F6',
    text: '#212529',
    card: '#F8F7F4',
    border: '#E5E7EB',
    notification: '#EF4444',
    error: '#EF4444',
    tint: '#5C8A5C',
    surface: '#FEFEFE',
  },
};

// Use expo-google-fonts hook correctly at the top level
import { Inter_400Regular, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NetworkErrorBoundary } from '@/components/error/NetworkErrorBoundary';
import { AuthProvider } from '@/context/AuthContext';
import { KVKKProvider } from '@/contexts/KVKKContext';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [appIsReady, setAppIsReady] = useState(false);
  // Load fonts using the hook (must be called unconditionally at top level)
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  useEffect(() => {
    if (fontError) {
      warnInDev('Font loading error:', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();

        // Reduced delay for better performance
        await new Promise((resolve) => setTimeout(resolve, 500));
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
  const content = !appIsReady ? (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Minimal loading state for better performance */}
    </View>
  ) : (
    <NetworkErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <KVKKProvider>
            <StatusBar style="dark" />
            {children}
          </KVKKProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </NetworkErrorBoundary>
  );

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider theme={safeTheme}>{content}</ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
