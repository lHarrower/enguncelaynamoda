import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { STUDIO_THEME } from '../../constants/StudioTheme';
import { View, Text } from 'react-native';
import StudioTabBar from '../../components/studio/StudioTabBar';

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