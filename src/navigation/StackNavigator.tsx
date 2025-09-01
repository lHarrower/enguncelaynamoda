/**
 * Stack Navigator
 * Stack navigation for nested screens within tabs
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { screenTransitions } from './config';

// Generic Stack Navigator Component
interface StackNavigatorProps {
  screens: Array<{
    name: string;
    component: React.ComponentType<any>;
    options?: object;
  }>;
  initialRouteName?: string;
  screenOptions?: object;
}

const Stack = createStackNavigator();

const StackNavigator: React.FC<StackNavigatorProps> = ({
  screens,
  initialRouteName,
  screenOptions = {
    headerShown: false,
    ...screenTransitions.slideFromRight,
  },
}) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={screenOptions}
    >
      {screens.map(({ name, component, options }) => (
        <Stack.Screen
          key={name}
          name={name}
          component={component}
          options={options}
        />
      ))}
    </Stack.Navigator>
  );
};

export default StackNavigator;