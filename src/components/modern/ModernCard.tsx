/**
 * Modern Card Component
 * Versatile card component with multiple variants and animations
 */

import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ModernDesignSystem } from '@/theme/ModernDesignSystem';

interface ModernCardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: ViewStyle;
  animated?: boolean;
  borderRadius?: 'small' | 'medium' | 'large' | 'xl';
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ModernCard: React.FC<ModernCardProps> = memo(
  ({
    children,
    variant = 'elevated',
    padding = 'medium',
    onPress,
    style,
    animated = true,
    borderRadius = 'medium',
  }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const handlePressIn = () => {
      if (animated && onPress) {
        scale.value = withSpring(0.98, {
          damping: 15,
          stiffness: 300,
        });
        opacity.value = withTiming(0.9, {
          duration: ModernDesignSystem.animations.duration.fast,
        });
      }
    };

    const handlePressOut = () => {
      if (animated && onPress) {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 300,
        });
        opacity.value = withTiming(1, {
          duration: ModernDesignSystem.animations.duration.fast,
        });
      }
    };

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
      };
    });

    const getCardStyle = (): ViewStyle => {
      const baseStyle = styles.card;
      const variantStyle = styles[`${variant}Card` as keyof typeof styles] as ViewStyle;
      const paddingStyle = styles[`${padding}Padding` as keyof typeof styles] as ViewStyle;
      const radiusStyle = styles[`${borderRadius}Radius` as keyof typeof styles] as ViewStyle;

      return {
        ...baseStyle,
        ...variantStyle,
        ...paddingStyle,
        ...radiusStyle,
        ...style,
      };
    };

    const CardComponent = onPress ? AnimatedTouchableOpacity : AnimatedView;

    return (
      <CardComponent
        style={[getCardStyle(), animated && animatedStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        {...(onPress && {
          accessibilityRole: 'button',
          accessibilityLabel: 'Card',
          accessibilityHint: 'Tap to interact with this card',
        })}
      >
        {children}
      </CardComponent>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: ModernDesignSystem.colors.tokens.surface.primary,
    overflow: 'hidden',
  },

  // Variant Styles
  elevatedCard: {
    ...ModernDesignSystem.elevation.semantic.card,
  },
  outlinedCard: {
    borderColor: ModernDesignSystem.colors.tokens.border.primary,
    borderWidth: 1,
  },
  filledCard: {
    backgroundColor: ModernDesignSystem.colors.tokens.surface.secondary,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },

  // Padding Variants
  nonePadding: {
    padding: 0,
  },
  smallPadding: {
    padding: ModernDesignSystem.spacing.semantic.component.sm,
  },
  mediumPadding: {
    padding: ModernDesignSystem.spacing.semantic.component.md,
  },
  largePadding: {
    padding: ModernDesignSystem.spacing.semantic.component.lg,
  },

  // Border Radius Variants
  smallRadius: {
    borderRadius: ModernDesignSystem.borderRadius.scale.sm,
  },
  mediumRadius: {
    borderRadius: ModernDesignSystem.borderRadius.scale.md,
  },
  largeRadius: {
    borderRadius: ModernDesignSystem.borderRadius.scale.lg,
  },
  xlRadius: {
    borderRadius: ModernDesignSystem.borderRadius.scale.xl,
  },
});

export default ModernCard;
