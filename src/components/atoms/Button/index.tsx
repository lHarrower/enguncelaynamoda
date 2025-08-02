/**
 * Button Atom
 * 
 * The most fundamental interactive element in the design system.
 * Follows the unified design system and supports all button variants.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ButtonComponentProps } from '@/types/componentProps';
import { UNIFIED_COLORS, TYPOGRAPHY, SPACING, BUTTON_STYLES } from '@/theme';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface ButtonProps extends ButtonComponentProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'luxury';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
  ...props
}) => {
  const { triggerHaptic } = useHapticFeedback();

  const handlePress = () => {
    if (!disabled && !loading) {
      triggerHaptic('light');
      onPress();
    }
  };

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      {...props}
    >
      {leftIcon && <Text style={styles.icon}>{leftIcon}</Text>}
      <Text style={textStyle}>
        {loading ? 'Loading...' : title}
      </Text>
      {rightIcon && <Text style={styles.icon}>{rightIcon}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SPACING.radius.medium,
    paddingHorizontal: SPACING.padding.medium,
    paddingVertical: SPACING.padding.small,
    minHeight: 44, // Accessibility minimum touch target
  },
  
  // Variants
  primary: {
    backgroundColor: UNIFIED_COLORS.primary[500],
    ...BUTTON_STYLES.primary.container,
  },
  secondary: {
    backgroundColor: UNIFIED_COLORS.neutral[100],
    borderWidth: 1,
    borderColor: UNIFIED_COLORS.neutral[300],
    ...BUTTON_STYLES.secondary.container,
  },
  tertiary: {
    backgroundColor: 'transparent',
    ...BUTTON_STYLES.tertiary.container,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: UNIFIED_COLORS.primary[500],
  },
  danger: {
    backgroundColor: UNIFIED_COLORS.semantic.error,
  },
  luxury: {
    backgroundColor: UNIFIED_COLORS.luxury.gold,
    ...BUTTON_STYLES.luxury.container,
  },
  
  // Sizes
  small: {
    paddingHorizontal: SPACING.padding.small,
    paddingVertical: SPACING.padding.xs,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: SPACING.padding.medium,
    paddingVertical: SPACING.padding.small,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: SPACING.padding.large,
    paddingVertical: SPACING.padding.medium,
    minHeight: 52,
  },
  
  fullWidth: {
    width: '100%',
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontFamily: TYPOGRAPHY.fontFamily.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
  },
  
  primaryText: {
    color: UNIFIED_COLORS.neutral[50],
    ...BUTTON_STYLES.primary.text,
  },
  secondaryText: {
    color: UNIFIED_COLORS.neutral[900],
    ...BUTTON_STYLES.secondary.text,
  },
  tertiaryText: {
    color: UNIFIED_COLORS.primary[500],
    ...BUTTON_STYLES.tertiary.text,
  },
  ghostText: {
    color: UNIFIED_COLORS.primary[500],
  },
  dangerText: {
    color: UNIFIED_COLORS.neutral[50],
  },
  luxuryText: {
    color: UNIFIED_COLORS.neutral[900],
    ...BUTTON_STYLES.luxury.text,
  },
  
  smallText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  mediumText: {
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  largeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  
  disabledText: {
    opacity: 0.7,
  },
  
  icon: {
    marginHorizontal: SPACING.margin.xs,
  },
});

export default Button;
export type { ButtonProps };