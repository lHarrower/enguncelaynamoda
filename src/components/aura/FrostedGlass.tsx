import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface FrostedGlassProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'light' | 'heavy' | 'subtle';
  intensity?: number;
}

/**
 * FrostedGlass
 * Material Honesty principle - creates believable depth and focus
 * through premium glass-like overlays
 */
const FrostedGlass: React.FC<FrostedGlassProps> = ({
  children,
  style,
  variant = 'light',
  intensity,
}) => {
  const getIntensity = () => {
    if (intensity !== undefined) {
      return intensity;
    }

    switch (variant) {
      case 'heavy':
        return 80;
      case 'subtle':
        return 40;
      default:
        return 60;
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'heavy':
        return 'rgba(255, 255, 255, 0.3)';
      case 'subtle':
        return 'rgba(255, 255, 255, 0.1)';
      default:
        return 'rgba(255, 255, 255, 0.2)';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={getIntensity()} tint="light" style={StyleSheet.absoluteFillObject} />
      <View style={[styles.overlay, { backgroundColor: getBackgroundColor() }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default FrostedGlass;
