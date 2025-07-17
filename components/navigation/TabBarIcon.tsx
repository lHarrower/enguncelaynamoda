import React from 'react';
import { type ComponentProps } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TAB_ICON_SIZE } from '../../constants/Layout';
import { useTheme } from '../../context/ThemeContext';

type IconProps = Omit<ComponentProps<typeof Ionicons>, 'name'> & {
  name: ComponentProps<typeof Ionicons>['name'];
  focused?: boolean;
};

export function TabBarIcon({ style, name, focused = false, ...rest }: IconProps) {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={[styles.container, focused && styles.focusedContainer]}>
      {/* Subtle glow effect for focused state */}
      {focused && (
        <View
          style={[
            styles.glow,
            {
              backgroundColor: colors.tint,
              shadowColor: colors.tint,
            },
          ]}
        />
      )}
      
      <Ionicons
        name={name}
        size={TAB_ICON_SIZE}
        style={[
          styles.icon,
          {
            color: focused ? colors.tabIconSelected : colors.tabIconDefault,
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
              backgroundColor: colors.tint,
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