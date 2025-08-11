/**
 * Button Atom
 * 
 * The most fundamental interactive element in the design system.
 * Follows the unified design system and supports all button variants.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ButtonComponentProps } from '@/types/componentProps';
import { DesignSystem } from '@/theme/DesignSystem';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface ButtonProps extends Omit<ButtonComponentProps, 'variant'> {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'luxury';
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
  const { trigger } = useHapticFeedback();

  const handlePress = () => {
    if (!disabled && !loading) {
  trigger('light');
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
    variant === 'primary' && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'ghost' && styles.ghostText,
    variant === 'luxury' && styles.luxuryText,
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
  borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    minHeight: 44, // Accessibility minimum touch target
  },
  
  // Variants
  primary: {
    backgroundColor: DesignSystem.colors.secondary[500],
  },
  secondary: {
    backgroundColor: DesignSystem.colors.surface.elevated,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DesignSystem.colors.secondary[500],
  },
  luxury: {
    backgroundColor: DesignSystem.colors.gold[500],
  },
  
  // Sizes
  small: {
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
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
    fontFamily: DesignSystem.typography.fontFamily.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  primaryText: {
    color: DesignSystem.colors.text.inverse,
  },
  secondaryText: {
    color: DesignSystem.colors.text.primary,
  },
  ghostText: {
  color: DesignSystem.colors.secondary[500],
  },
  dangerText: {
    color: DesignSystem.colors.text.inverse,
  },
  luxuryText: {
    color: DesignSystem.colors.text.primary,
  },
  
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  disabledText: {
    opacity: 0.7,
  },
  
  icon: {
    marginHorizontal: DesignSystem.spacing.xs,
  },
});

export default Button;