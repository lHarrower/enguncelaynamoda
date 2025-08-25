// Navigation Container Component
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

export interface NavigationContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const NavigationContainer: React.FC<NavigationContainerProps> = ({ children, style }) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
});

export default NavigationContainer;
