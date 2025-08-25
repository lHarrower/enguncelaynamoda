import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { DesignSystem } from '../../theme/DesignSystem';

interface ZenCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'surface' | 'glass' | 'elevated' | 'subtle';
  interactive?: boolean;
  blurIntensity?: number;
}

export default function ZenCard({
  children,
  onPress,
  style,
  variant = 'surface',
  interactive = false,
  blurIntensity = 20,
}: ZenCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (interactive || onPress) {
      scale.value = withTiming(0.98, { duration: 150 });
      opacity.value = withTiming(0.9, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (interactive || onPress) {
      scale.value = withTiming(1, { duration: 150 });
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getCardStyle = (): ViewStyle[] => {
    const baseStyle = [styles.card];

    switch (variant) {
      case 'glass':
        return [...baseStyle, styles.glass];
      case 'elevated':
        return [...baseStyle, styles.elevated];
      case 'subtle':
        return [...baseStyle, styles.subtle];
      default:
        return [...baseStyle, styles.surface];
    }
  };

  const CardContent = () => <View style={[getCardStyle(), style]}>{children}</View>;

  const GlassCardContent = () => (
    <View style={[styles.card, styles.glassContainer, style]}>
      <BlurView intensity={blurIntensity} tint="light" style={styles.blurView}>
        <View style={styles.glassOverlay}>{children}</View>
      </BlurView>
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {variant === 'glass' ? <GlassCardContent /> : <CardContent />}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, interactive && { transform: [{ scale: scale.value }] }]}>
      {variant === 'glass' ? <GlassCardContent /> : <CardContent />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: DesignSystem.colors.sage[200],
    borderRadius: DesignSystem.borderRadius.lg,
    borderWidth: 1,
    padding: DesignSystem.spacing.lg,
  },
  // Variants
  surface: {
    backgroundColor: DesignSystem.colors.background.secondary,
    ...DesignSystem.elevation.soft,
  },
  elevated: {
    backgroundColor: DesignSystem.colors.background.secondary,
    ...DesignSystem.elevation.medium,
  },
  subtle: {
    backgroundColor: DesignSystem.colors.sage[50],
    ...DesignSystem.elevation.soft,
    borderColor: DesignSystem.colors.sage[300],
  },

  // Glass variant styles
  glassContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'hidden',
    padding: 0,
  },
  blurView: {
    borderRadius: DesignSystem.borderRadius.lg,
    flex: 1,
  },
  glassOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: DesignSystem.borderRadius.lg,
    borderWidth: 1,
    flex: 1,
    padding: DesignSystem.spacing.lg,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...DesignSystem.elevation.high,
  },
});
