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
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface UltraPremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const UltraPremiumButton: React.FC<UltraPremiumButtonProps> = React.memo(
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

    const handlePressIn = () => {
      scale.value = withTiming(0.98, { duration: 100 });
      opacity.value = withTiming(0.8, { duration: 100 });
    };

    const handlePressOut = () => {
      scale.value = withTiming(1, { duration: 150 });
      opacity.value = withTiming(1, { duration: 150 });
    };

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
      };
    });

    const getButtonStyle = (): ViewStyle => {
      const baseStyle: ViewStyle = {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row',
        borderRadius: DesignSystem.radius.sm,
      };

      // Size variations
      const sizeStyles: Record<string, ViewStyle> = {
        small: {
          paddingHorizontal: DesignSystem.spacing.md,
          paddingVertical: DesignSystem.spacing.sm,
          minHeight: 36,
        },
        medium: {
          paddingHorizontal: DesignSystem.spacing.lg,
          paddingVertical: DesignSystem.spacing.md,
          minHeight: 44,
        },
        large: {
          paddingHorizontal: DesignSystem.spacing.xl,
          paddingVertical: DesignSystem.spacing.lg,
          minHeight: 52,
        },
      };

      // Variant styles
      const variantStyles: Record<string, ViewStyle> = {
        primary: {
          backgroundColor: DesignSystem.colors.primary[500],
          ...DesignSystem.elevation.subtle,
        },
        secondary: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: DesignSystem.colors.primary[500],
        },
        ghost: {
          backgroundColor: 'transparent',
        },
        minimal: {
          backgroundColor: DesignSystem.colors.neutral[100],
          borderWidth: 1,
          borderColor: DesignSystem.colors.neutral[300],
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
      const baseTextStyle = DesignSystem.typography.scale.button;

      const sizeTextStyles: Record<string, Partial<TextStyle>> = {
        small: { fontSize: 12, letterSpacing: 0.6 },
        medium: { fontSize: 14, letterSpacing: 0.8 },
        large: { fontSize: 16, letterSpacing: 1.0 },
      };

      const variantTextStyles: Record<string, TextStyle> = {
        primary: { color: DesignSystem.colors.neutral[50] },
        secondary: { color: DesignSystem.colors.neutral[900] },
        ghost: { color: DesignSystem.colors.neutral[600] },
        minimal: { color: DesignSystem.colors.neutral[900] },
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
        return <ActivityIndicator color={getIconColor()} size="small" />;
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
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={`Ultra premium ${variant} button${loading ? ', loading' : ''}${disabled ? ', disabled' : ''}`}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
      >
        {renderContent()}
      </AnimatedTouchableOpacity>
    );
  },
);

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

export default UltraPremiumButton;
