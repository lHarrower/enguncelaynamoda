// Stack Navigator Component
import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

export interface StackNavigatorProps {
  children: React.ReactNode;
  initialRoute?: string;
  style?: any;
}

const StackNavigator: React.FC<StackNavigatorProps> = ({
  children,
  initialRoute,
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

export default StackNavigator;