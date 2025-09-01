/**
 * Tab Navigator
 * Bottom tab navigation for main app screens
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { MainTabParamList } from './types';
import { mainTabConfig } from './config';
import HomeScreen from '../screens/HomeScreen';
import WardrobeScreen from '../screens/WardrobeScreen';
import AynaMirrorScreen from '../screens/AynaMirrorScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BagScreen from '../screens/BagScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName={mainTabConfig.initialRouteName as keyof MainTabParamList}
      screenOptions={({ route }) => ({
        ...mainTabConfig.screenOptions,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Wardrobe':
              iconName = focused ? 'shirt' : 'shirt-outline';
              break;
            case 'AynaMirror':
              iconName = focused ? 'mirror' : 'mirror-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Bag':
              iconName = focused ? 'bag' : 'bag-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Ana Sayfa' }}
      />
      <Tab.Screen 
        name="Wardrobe" 
        component={WardrobeScreen}
        options={{ tabBarLabel: 'Gardırop' }}
      />
      <Tab.Screen 
        name="AynaMirror" 
        component={AynaMirrorScreen}
        options={{ tabBarLabel: 'Ayna' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
      <Tab.Screen 
        name="Bag" 
        component={BagScreen}
        options={{ tabBarLabel: 'Çanta' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;