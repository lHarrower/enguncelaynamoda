// Stack Navigator Component
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

export interface StackNavigatorProps {
  children: React.ReactNode;
  initialRoute?: string;
  style?: ViewStyle;
}

const StackNavigator: React.FC<StackNavigatorProps> = ({ children, initialRoute, style }) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
});

export default StackNavigator;
