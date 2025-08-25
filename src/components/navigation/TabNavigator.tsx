// Tab Navigator Component
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

export interface TabNavigatorProps {
  children: React.ReactNode;
  initialTab?: string;
  style?: ViewStyle;
}

const TabNavigator: React.FC<TabNavigatorProps> = ({ children, initialTab, style }) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
});

export default TabNavigator;
