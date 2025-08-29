import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { SPACING } from '@/constants/AppConstants';
import { DesignSystem } from '@/theme/DesignSystem';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  disabled?: boolean;
}

export default function FloatingActionButton({
  onPress,
  icon = 'add',
  size = 56,
  disabled = false,
}: FloatingActionButtonProps) {
  const handlePress = () => {
    if (!disabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        disabled && styles.disabled,
        DesignSystem.elevation.soft,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Floating action button"
      accessibilityHint="Tap to perform the primary action"
      accessibilityState={{ disabled }}
    >
      <LinearGradient
        colors={
          [
            DesignSystem.colors.primaryIndexed[500] || '#007AFF',
            DesignSystem.colors.gold[500] || '#C9A227',
          ] as const
        }
        style={[
          styles.gradient,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon} size={size * 0.4} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    bottom: SPACING.xl,
    overflow: 'hidden',
    position: 'absolute',
    right: SPACING.xl,
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
