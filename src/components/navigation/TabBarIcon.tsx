import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';

interface TabBarIconProps {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  focused?: boolean;
  style?: any;
  [key: string]: any;
}

export function TabBarIcon({ name, color, focused = false, style, ...rest }: TabBarIconProps) {
  
  return (
    <View style={[styles.container, focused && styles.focusedContainer]}>
      {/* Subtle glow effect for focused state */}
      {focused && (
        <View
          style={[
            styles.glow,
            {
              backgroundColor: DesignSystem.colors.primary[500],
              shadowColor: DesignSystem.colors.primary[500],
            },
          ]}
        />
      )}
      
      <Ionicons
        name={name}
        size={24}
        style={[
          styles.icon,
          {
            color: focused ? DesignSystem.colors.primary[500] : color,
          },
          style,
        ]}
        {...rest}
      />
      
      {/* Parisian luxury indicator dot */}
      {focused && (
        <View
          style={[
            styles.indicator,
            {
              backgroundColor: DesignSystem.colors.primary[500],
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  focusedContainer: {
    transform: [{ scale: 1.1 }],
  },
  glow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    opacity: 0.15,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    marginBottom: -3,
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
});