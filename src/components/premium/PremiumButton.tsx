import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'luxury';
  size?: 'small' | 'medium' | 'large' | 'hero';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
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
  const glowIntensity = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, DesignSystem.animations.spring.smooth);
    opacity.value = withTiming(0.8, { duration: 150 });
    if (variant === 'luxury') {
      glowIntensity.value = withTiming(1, { duration: 200 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, DesignSystem.animations.spring.gentle);
    opacity.value = withTiming(1, { duration: 150 });
    if (variant === 'luxury') {
      glowIntensity.value = withTiming(0, { duration: 300 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(glowIntensity.value, [0, 1], [0.1, 0.3]);

    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      shadowOpacity: variant === 'luxury' ? shadowOpacity : undefined,
    };
  });

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row',
      borderRadius: DesignSystem.borderRadius.lg,
      ...DesignSystem.elevation.medium,
    };

    // Size variations
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: DesignSystem.spacing.md,
        paddingVertical: DesignSystem.spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: DesignSystem.spacing.xl,
        paddingVertical: DesignSystem.spacing.md,
        minHeight: 48,
      },
      large: {
        paddingHorizontal: DesignSystem.spacing.xxl,
        paddingVertical: DesignSystem.spacing.lg,
        minHeight: 56,
      },
      hero: {
        paddingHorizontal: DesignSystem.spacing.xxxl,
        paddingVertical: DesignSystem.spacing.xl,
        minHeight: 64,
        borderRadius: DesignSystem.borderRadius.organic,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: DesignSystem.colors.sage[500],
        ...DesignSystem.elevation.medium,
      },
      secondary: {
        backgroundColor: DesignSystem.colors.background.elevated,
        ...DesignSystem.elevation.soft,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: DesignSystem.colors.border.primary,
        ...DesignSystem.elevation.soft,
      },
      glass: {
        ...DesignSystem.glassmorphism.medium,
        borderRadius: DesignSystem.borderRadius.lg,
      },
      luxury: {
        backgroundColor: DesignSystem.colors.gold[500],
        ...DesignSystem.elevation.high,
        shadowColor: DesignSystem.colors.gold[500],
        borderRadius: DesignSystem.borderRadius.organic,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : undefined,
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = DesignSystem.typography.button.medium;

    const sizeTextStyles: Record<string, Partial<TextStyle>> = {
      small: { fontSize: 14, letterSpacing: 0.6 },
      medium: { fontSize: 16, letterSpacing: 0.8 },
      large: { fontSize: 18, letterSpacing: 1.0 },
      hero: { fontSize: 20, letterSpacing: 1.2 },
    };

    const variantTextStyles: Record<string, TextStyle> = {
      primary: { color: DesignSystem.colors.text.inverse },
      secondary: { color: DesignSystem.colors.text.primary },
      ghost: { color: DesignSystem.colors.text.primary },
      glass: { color: DesignSystem.colors.text.primary },
      luxury: { color: DesignSystem.colors.text.primary },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  const getIconSize = (): number => {
    const iconSizes: Record<string, number> = {
      small: 16,
      medium: 20,
      large: 24,
      hero: 28,
    };
    return iconSizes[size] ?? 20;
  };

  const getIconColor = (): string => {
    const variantIconColors: Record<string, string> = {
      primary: DesignSystem.colors.text.inverse,
      secondary: DesignSystem.colors.text.primary,
      ghost: DesignSystem.colors.text.primary,
      glass: DesignSystem.colors.text.primary,
      luxury: DesignSystem.colors.text.primary,
    };
    return variantIconColors[variant] ?? DesignSystem.colors.text.primary;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator color={getIconColor()} size={size === 'small' ? 'small' : 'small'} />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <Ionicons
            name={icon}
            size={getIconSize()}
            color={getIconColor()}
            style={styles.iconLeft}
          />
        )}
        <Text style={getTextStyle()}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <Ionicons
            name={icon}
            size={getIconSize()}
            color={getIconColor()}
            style={styles.iconRight}
          />
        )}
      </View>
    );
  };

  return (
    <AnimatedTouchableOpacity
      style={[getButtonStyle(), animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={`Premium ${variant} button${loading ? ', loading' : ''}${disabled ? ', disabled' : ''}`}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {renderContent()}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: DesignSystem.spacing.sm,
  },
  iconRight: {
    marginLeft: DesignSystem.spacing.sm,
  },
});

export default PremiumButton;
