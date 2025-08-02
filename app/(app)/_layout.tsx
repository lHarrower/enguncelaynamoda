// app/(app)/_layout.tsx

import React, { useEffect } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/context/AuthContext'; // CORRECTED PATH
import { STUDIO_THEME } from '@/constants/StudioTheme'; // CORRECTED PATH
import { View, Text } from 'react-native';
import StudioTabBar from '@/components/studio/StudioTabBar'; // CORRECTED PATH
import { featureIntegrationCoordinator } from '@/services/featureIntegrationCoordinator';
import { performanceOptimizationService } from '@/services/performanceOptimizationService';
import { transitionPolishingService } from '@/services/transitionPolishingService';

export default function AppLayout() {
  // Add error boundary for useAuth
  let authState;
  try {
    authState = useAuth();
  } catch (error) {
    console.error('AuthContext not available:', error);
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: STUDIO_THEME.colors.foundation.primary 
      }}>
        <Text style={{ 
          color: STUDIO_THEME.colors.text.primary,
          ...STUDIO_THEME.typography.scale.body
        }}>
          Loading authentication...
        </Text>
      </View>
    );
  }
  
  const { session, loading } = authState;

  // Initialize feature integration when user is authenticated
  useEffect(() => {
    if (session && !loading) {
      initializeAppServices();
    }
  }, [session, loading]);

  const initializeAppServices = async () => {
    try {
      console.log('🚀 Initializing app services...');
      
      // Initialize performance monitoring
      await performanceOptimizationService.startMonitoring();
      
      // Initialize feature integration coordinator
      await featureIntegrationCoordinator.initialize();
      
      // Check integration health
      const health = await featureIntegrationCoordinator.checkIntegrationHealth();
      console.log('🏥 App Health Status:', health.overall);
      
      console.log('✅ App services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize app services:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: STUDIO_THEME.colors.foundation.primary 
      }}>
        <Text style={{ 
          color: STUDIO_THEME.colors.text.primary,
          ...STUDIO_THEME.typography.scale.body
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/auth/sign-in" />;
  }
  
  return (
    <Tabs
      tabBar={(props) => <StudioTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="wardrobe" />
      <Tabs.Screen name="ayna-mirror" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="bag" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="product/[id]" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}