// Tab Navigator Component
import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

export interface TabNavigatorProps {
  children: React.ReactNode;
  initialTab?: string;
  style?: any;
}

const TabNavigator: React.FC<TabNavigatorProps> = ({
  children,
  initialTab,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default TabNavigator;