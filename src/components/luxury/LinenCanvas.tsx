import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ColorValue, StyleSheet, View, ViewStyle } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

interface LinenCanvasProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'subtle' | 'warm';
}

const LinenCanvas: React.FC<LinenCanvasProps> = ({ children, style, variant = 'default' }) => {
  const getGradientColors = (): readonly [ColorValue, ColorValue, ...ColorValue[]] => {
    switch (variant) {
      case 'subtle':
        return [
          DesignSystem.colors.background.secondary,
          DesignSystem.colors.sage[100],
          DesignSystem.colors.background.secondary,
        ];
      case 'warm':
        return [
          DesignSystem.colors.background.secondary,
          `${DesignSystem.colors.sage[200]}10`, // 10% opacity
          DesignSystem.colors.background.secondary,
        ];
      default:
        return [
          DesignSystem.colors.background.secondary,
          `${DesignSystem.colors.background.primary}20`, // 20% opacity
          DesignSystem.colors.background.secondary,
        ];
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Base Linen Background */}
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Subtle Texture Overlay */}
      <View style={styles.textureOverlay} />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  gradient: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  textureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    // Subtle noise pattern - simulating linen texture
    opacity: 0.1,
    // Note: In a real implementation, you might use a pattern image here
    // backgroundImage: 'url("data:image/svg+xml,...")', // SVG noise pattern
  },
});

export default LinenCanvas;
