// Navigation Container Component
import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

export interface NavigationContainerProps {
  children: React.ReactNode;
  style?: any;
}

const NavigationContainer: React.FC<NavigationContainerProps> = ({
  children,
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

export default NavigationContainer;