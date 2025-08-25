import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

interface GlassmorphismCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'primary' | 'subtle' | 'dark';
  intensity?: number;
}

export const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
  children,
  style,
  variant = 'primary',
  intensity = 25,
}) => {
  const GLASS_MAP: Record<string, ViewStyle> = {
    primary: DesignSystem.glassmorphism.medium,
    subtle: DesignSystem.glassmorphism.light,
    dark: DesignSystem.glassmorphism.dark,
  };
  const glassStyle = GLASS_MAP[variant] || DesignSystem.glassmorphism.medium;

  return (
    <View style={[styles.container, style]}>
      {/* Backdrop blur effect */}
      <BlurView intensity={intensity} style={styles.blurView} tint="light" />

      {/* Glass overlay with border */}
      <View
        style={[
          styles.glassOverlay,
          {
            backgroundColor: glassStyle.backgroundColor,
            borderColor: glassStyle.borderColor,
            borderWidth: glassStyle.borderWidth,
          },
        ]}
      >
        {/* Subtle noise texture overlay */}
        <View style={styles.textureOverlay} />

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },

  container: {
    borderRadius: DesignSystem.layout.card.borderRadius,
    overflow: 'hidden',
    ...DesignSystem.elevation.floating,
  },

  content: {
    flex: 1,
    padding: DesignSystem.layout.card.padding,
    zIndex: 1,
  },

  glassOverlay: {
    flex: 1,
    borderRadius: DesignSystem.layout.card.borderRadius,
    // Inner border to catch light
    borderStyle: 'solid',
  },

  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.02,
    // Subtle noise pattern
    borderRadius: DesignSystem.layout.card.borderRadius,
  },
});

export default GlassmorphismCard;
