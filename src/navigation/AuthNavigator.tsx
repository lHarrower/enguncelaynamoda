/**
 * Auth Navigator
 * Navigation for authentication screens
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthStackParamList } from './types';
import { authStackConfig } from './config';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName={authStackConfig.initialRouteName as keyof AuthStackParamList}
      screenOptions={authStackConfig.screenOptions}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;