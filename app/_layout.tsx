import { Stack, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PermissionManager from '../components/PermissionManager';

function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#B8918F', // Matte rose
        tabBarInactiveTintColor: '#B5A3BC', // Matte lavender
        tabBarStyle: {
          backgroundColor: '#FDFCFB', // Soft off-white
          borderTopColor: '#F0E6E3', // Matte pink background
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8), // Ensure space above phone buttons
          height: 70 + Math.max(insets.bottom - 8, 0), // Adjust height based on safe area
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarHideOnKeyboard: true, // Better UX
        tabBarAllowFontScaling: false, // Consistent sizing
        tabBarButton: (props) => (
          <Pressable
            onPress={props.onPress}
            onLongPress={props.onLongPress}
            testID={props.testID}
            accessibilityLabel={props.accessibilityLabel}
            accessibilityRole={props.accessibilityRole}
            accessibilityState={props.accessibilityState}
            style={[props.style, { opacity: 1 }]} // No press effect
            android_ripple={null}
          >
            {props.children}
          </Pressable>
        ),
      }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="wardrobe"
            options={{
              title: 'Wardrobe',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="shirt" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="discover"
            options={{
              title: 'Discover',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="search" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="favorites"
            options={{
              title: 'Favorites',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="heart" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <PermissionManager>
        <TabLayout />
      </PermissionManager>
    </SafeAreaProvider>
  );
} 
