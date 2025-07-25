// Debug version of _layout.tsx with minimal services
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback } from 'react';
import { Platform, View, Text } from 'react-native';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function ThemedRootLayout() {
  const { isDark } = useTheme();
  const [isReady, setIsReady] = useState(false);
  
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Debug mode: Minimal initialization');
        
        // Just wait a moment and mark as ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Debug mode: App ready');
        setIsReady(true);
      } catch (error) {
        console.error('Debug mode: Failed to initialize app:', error);
        setIsReady(true);
      }
    };

    if (fontsLoaded || fontError) {
      initializeApp();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#000' 
      }}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Loading fonts...</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#000' 
      }}>
        <Text style={{ color: '#fff', fontSize: 16 }}>DEBUG MODE: Starting app...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Slot />
    </View>
  );
}

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
