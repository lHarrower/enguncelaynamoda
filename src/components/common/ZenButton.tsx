import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

interface ZenButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function ZenButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  accessibilityLabel,
  accessibilityHint,
}: ZenButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withTiming(0.97, { duration: 150 });
      opacity.value = withTiming(0.9, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withTiming(1, { duration: 150 });
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle = [
      styles.button,
      styles[size],
      fullWidth ? styles.fullWidth : null,
      disabled ? styles.disabled : null,
    ].filter(Boolean) as ViewStyle[];

    switch (variant) {
      case 'secondary':
        return [...baseStyle, styles.secondary];
      case 'ghost':
        return [...baseStyle, styles.ghost];
      case 'outline':
        return [...baseStyle, styles.outline];
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle = [styles.text, styles[`${size}Text` as keyof typeof styles]] as TextStyle[];

    switch (variant) {
      case 'secondary':
        return [...baseStyle, styles.secondaryText];
      case 'ghost':
        return [...baseStyle, styles.ghostText];
      case 'outline':
        return [...baseStyle, styles.outlineText];
      default:
        return [...baseStyle, styles.primaryText];
    }
  };

  const getIconColor = () => {
    if (disabled) {
      return DesignSystem.colors.neutral[300];
    }

    switch (variant) {
      case 'primary':
        return DesignSystem.colors.text.inverse;
      case 'secondary':
        return DesignSystem.colors.text.primary;
      case 'outline':
        return DesignSystem.colors.sage[500];
      case 'ghost':
        return DesignSystem.colors.text.secondary;
      default:
        return DesignSystem.colors.text.inverse;
    }
  };

  const renderContent = () => (
    <>
      {icon && iconPosition === 'left' && (
        <Ionicons
          name={icon}
          size={size === 'small' ? 16 : size === 'large' ? 20 : 18}
          color={getIconColor()}
          style={styles.iconLeft}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
      {icon && iconPosition === 'right' && (
        <Ionicons
          name={icon}
          size={size === 'small' ? 16 : size === 'large' ? 20 : 18}
          color={getIconColor()}
          style={styles.iconRight}
        />
      )}
    </>
  );

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
      >
        {variant === 'primary' && !disabled ? (
          <LinearGradient
            colors={[DesignSystem.colors.sage[400], DesignSystem.colors.sage[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {renderContent()}
          </LinearGradient>
        ) : (
          renderContent()
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: DesignSystem.borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden',
    ...DesignSystem.elevation.medium,
  },
  gradient: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },

  // Sizes
  small: {
    minHeight: 36,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  medium: {
    minHeight: 44,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  large: {
    minHeight: 52,
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.lg,
  },

  // Variants
  secondary: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: DesignSystem.colors.sage[200],
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
    ...DesignSystem.elevation.soft,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: DesignSystem.colors.sage[500],
    borderWidth: 2,
  },

  // States
  disabled: {
    backgroundColor: DesignSystem.colors.sage[100],
    opacity: 0.6,
    ...DesignSystem.elevation.soft,
  },
  fullWidth: {
    width: '100%',
  },

  // Text styles
  text: {
    fontFamily: DesignSystem.typography.fontFamily.body,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  smallText: {
    ...DesignSystem.typography.caption.medium,
    fontWeight: '600',
  },
  mediumText: {
    ...DesignSystem.typography.body.small,
    fontWeight: '600',
  },
  largeText: {
    ...DesignSystem.typography.body.medium,
    fontWeight: '600',
  },

  // Text colors
  primaryText: {
    color: DesignSystem.colors.text.inverse,
  },
  secondaryText: {
    color: DesignSystem.colors.text.primary,
  },
  ghostText: {
    color: DesignSystem.colors.text.secondary,
  },
  outlineText: {
    color: DesignSystem.colors.sage[500],
  },

  // Icon spacing
  iconLeft: {
    marginRight: DesignSystem.spacing.sm,
  },
  iconRight: {
    marginLeft: DesignSystem.spacing.sm,
  },
});
