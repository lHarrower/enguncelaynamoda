/**
 * Modern Button Component
 * Enhanced button with multiple variants and states
 */

import React, { memo, useCallback } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ModernDesignSystem } from '@/theme/ModernDesignSystem';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ModernButton: React.FC<ModernButtonProps> = memo(
  ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    style,
    textStyle,
  }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.95, {
        damping: 15,
        stiffness: 300,
      });
      opacity.value = withTiming(0.8, {
        duration: ModernDesignSystem.animations.duration.fast,
      });
    }, []);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
      opacity.value = withTiming(1, {
        duration: ModernDesignSystem.animations.duration.fast,
      });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
        opacity: disabled ? 0.5 : opacity.value,
      };
    });

    const getButtonStyle = (): ViewStyle => {
      const baseStyle = styles.button;
      const sizeStyle = styles[`${size}Button` as keyof typeof styles] as ViewStyle;
      const variantStyle = styles[`${variant}Button` as keyof typeof styles] as ViewStyle;

      return {
        ...baseStyle,
        ...sizeStyle,
        ...variantStyle,
        ...(fullWidth && { width: '100%' }),
        ...style,
      };
    };

    const getTextStyle = (): TextStyle => {
      const baseStyle = styles.text;
      const sizeStyle = styles[`${size}Text` as keyof typeof styles] as TextStyle;
      const variantStyle = styles[`${variant}Text` as keyof typeof styles] as TextStyle;

      return {
        ...baseStyle,
        ...sizeStyle,
        ...variantStyle,
        ...textStyle,
      };
    };

    const renderContent = () => {
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color={
                variant === 'primary' ? '#FFFFFF' : ModernDesignSystem.colors.semantic.brand.primary
              }
            />
            <Text style={[getTextStyle(), { marginLeft: 8 }]}>Loading...</Text>
          </View>
        );
      }

      return (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      );
    };

    return (
      <AnimatedTouchableOpacity
        style={[getButtonStyle(), animatedStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={loading ? 'Button is loading' : 'Tap to activate'}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
      >
        {renderContent()}
      </AnimatedTouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: ModernDesignSystem.borderRadius.semantic.button,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  // Size Variants
  smallButton: {
    minHeight: 32,
    paddingHorizontal: ModernDesignSystem.spacing.semantic.component.sm,
    paddingVertical: ModernDesignSystem.spacing.semantic.component.xs,
  },
  mediumButton: {
    minHeight: 44,
    paddingHorizontal: ModernDesignSystem.spacing.semantic.component.lg,
    paddingVertical: ModernDesignSystem.spacing.semantic.component.md,
  },
  largeButton: {
    minHeight: 52,
    paddingHorizontal: ModernDesignSystem.spacing.semantic.component.xl,
    paddingVertical: ModernDesignSystem.spacing.semantic.component.lg,
  },

  // Variant Styles
  primaryButton: {
    backgroundColor: ModernDesignSystem.colors.semantic.brand.primary,
    ...ModernDesignSystem.elevation.semantic.floating,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: ModernDesignSystem.colors.tokens.border.primary,
    borderWidth: 1,
  },
  tertiaryButton: {
    backgroundColor: ModernDesignSystem.colors.tokens.surface.secondary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },

  // Text Styles
  text: {
    fontFamily: ModernDesignSystem.typography.fontStacks.body[0],
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    ...ModernDesignSystem.typography.scale.label.medium,
  },
  mediumText: {
    ...ModernDesignSystem.typography.scale.body.medium,
  },
  largeText: {
    ...ModernDesignSystem.typography.scale.body.large,
  },

  // Text Color Variants
  primaryText: {
    color: ModernDesignSystem.colors.tokens.content.inverse,
  },
  secondaryText: {
    color: ModernDesignSystem.colors.semantic.brand.primary,
  },
  tertiaryText: {
    color: ModernDesignSystem.colors.tokens.content.primary,
  },
  ghostText: {
    color: ModernDesignSystem.colors.semantic.brand.primary,
  },

  // Content Layout
  contentContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: ModernDesignSystem.spacing.semantic.component.xs,
  },
  iconRight: {
    marginLeft: ModernDesignSystem.spacing.semantic.component.xs,
  },
});

export default ModernButton;
