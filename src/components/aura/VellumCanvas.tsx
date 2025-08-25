import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { DesignSystem } from '../../theme/DesignSystem';

interface VellumCanvasProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'warm' | 'cool';
}

/**
 * VellumCanvas
 * The foundation of Material Honesty - a premium, textured surface
 * that feels like high-quality vellum paper
 */
const VellumCanvas: React.FC<VellumCanvasProps> = ({ children, style, variant = 'default' }) => {
  // Subtle gradient variations for different moods
  const getGradientColors = (): readonly [string, string, string] => {
    switch (variant) {
      case 'warm':
        return [
          DesignSystem.colors.background.elevated,
          '#FAF9F7', // Slightly warmer
          DesignSystem.colors.sage[100],
        ];
      case 'cool':
        return [
          DesignSystem.colors.sage[100],
          '#F6F7F8', // Slightly cooler
          DesignSystem.colors.background.elevated,
        ];
      default:
        return [
          DesignSystem.colors.background.elevated,
          DesignSystem.colors.sage[100],
          DesignSystem.colors.background.elevated,
        ];
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Base gradient for subtle depth */}
      <LinearGradient
        colors={getGradientColors()}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />

      {/* Subtle texture overlay using CSS-like approach */}
      <View style={styles.textureOverlay} pointerEvents="none" />

      {/* Vignette for depth */}
      <LinearGradient
        colors={['transparent', DesignSystem.colors.neutral[300] + '20']}
        locations={[0.7, 1]}
        style={styles.vignette}
        pointerEvents="none"
      />

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
    backgroundColor: DesignSystem.colors.sage[100],
    bottom: 0,
    left: 0,
    opacity: 0.15,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  vignette: {
    bottom: 0,
    left: 0,
    opacity: 0.03,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default VellumCanvas;
