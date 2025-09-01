/**
 * Navigation Configuration
 * Central configuration for navigation system
 */

import { NavigationConfig } from './types';

// Stack Navigator Configurations
export const rootStackConfig: NavigationConfig = {
  initialRouteName: 'Main',
  screenOptions: {
    headerShown: false,
    gestureEnabled: true,
    cardStyleInterpolator: ({ current, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  },
  headerShown: false,
};

export const authStackConfig: NavigationConfig = {
  initialRouteName: 'Login',
  screenOptions: {
    headerShown: false,
    gestureEnabled: true,
  },
  headerShown: false,
};

export const mainTabConfig = {
  initialRouteName: 'Home',
  screenOptions: {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 0,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      height: 80,
      paddingBottom: 20,
      paddingTop: 10,
    },
    tabBarActiveTintColor: '#C08A6B',
    tabBarInactiveTintColor: '#9CA3AF',
  },
};

// Animation Configurations
export const screenTransitions = {
  slideFromRight: {
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  },
  fadeIn: {
    cardStyleInterpolator: ({ current }: any) => {
      return {
        cardStyle: {
          opacity: current.progress,
        },
      };
    },
  },
};