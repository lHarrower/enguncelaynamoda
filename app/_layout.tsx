// Suppress known non-critical warnings in development - MUST BE FIRST
try {
  require('@/utils/consoleSuppress');
} catch (error) {
  console.warn('Console suppress utility not available:', error);
}

// File: app/_layout.tsx (Correct and Final Version)
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect, useState, useCallback } from 'react';
import { Platform, View, Text } from 'react-native';
import { useFonts, Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Karla_400Regular } from '@expo-google-fonts/karla';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PerformanceOptimizationService } from '@/services/performanceOptimizationService';
import UltraPremiumLoadingScreen from '@/components/ultra/UltraPremiumLoadingScreen';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Notification handler temporarily disabled to avoid native module errors
// Will be re-enabled once ExpoPushTokenManager is properly configured
const notificationHandler = null;


// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// This inner component can safely use the useTheme hook because it's inside ThemeProvider.
function ThemedRootLayout() {
  const { isDark, colors } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  
  const [fontsLoaded, fontError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Karla_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setInitProgress(10);
        
        // Initialize performance optimization service
        await PerformanceOptimizationService.initialize().catch(error => {
          console.warn('Failed to initialize performance optimization service:', error);
        });
        setInitProgress(40);

        // Initialize notification handler for deep linking (optional)
        if (notificationHandler) {
          try {
            await notificationHandler.initialize();
          } catch (error) {
            console.warn('Failed to initialize notification handler (this is optional):', error);
            // Continue without notification handler - app will still work
          }
        }
        setInitProgress(70);

        // Style the native navigation bar only on Android based on the theme
        if (Platform.OS === 'android') {
          try {
            NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
          } catch (error) {
            console.warn('Failed to set navigation bar style:', error);
          }
        }
        setInitProgress(90);

        // Add a small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 500));
        setInitProgress(100);

        // Mark app as ready
        setTimeout(() => setIsReady(true), 300);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Still mark as ready to prevent infinite loading
        setIsReady(true);
      }
    };

    if (fontsLoaded || fontError) {
      initializeApp();
    }
  }, [isDark, colors, fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <UltraPremiumLoadingScreen 
        message="Loading premium fonts..."
        showProgress={false}
      />
    );
  }

  if (!isReady) {
    return (
      <UltraPremiumLoadingScreen 
        message="Preparing your style sanctuary..."
        showProgress={true}
        progress={initProgress}
      />
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Slot />
    </View>
  );
}

// This is the main root layout that sets up all providers in the correct order.
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <ErrorBoundary>
              <ThemedRootLayout />
            </ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}