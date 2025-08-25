/**
 * Input Atom
 *
 * The fundamental text input element in the design system.
 * Supports various input types and follows unified styling.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';
import { InputComponentProps } from '@/types/componentProps';

export interface InputProps
  extends Omit<InputComponentProps, 'leftIcon' | 'rightIcon' | 'variant'>,
    Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'glass' | 'luxury' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  multiline?: boolean;
  secureTextEntry?: boolean;
  disabled?: boolean;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  hint,
  variant = 'default',
  size = 'medium',
  leftIcon,
  rightIcon,
  multiline = false,
  secureTextEntry = false,
  disabled = false,
  required = false,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  testID,
  accessibilityLabel,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = [styles.container, style];

  const inputContainerStyle = [
    styles.inputContainer,
    styles[variant],
    styles[size],
    isFocused && styles.focused,
    error && styles.error,
    disabled && styles.disabled,
  ];

  const textInputStyle = [
    styles.input,
    styles[`${size}Input`],
    multiline && styles.multiline,
    inputStyle,
  ];

  const labelTextStyle = [styles.label, required && styles.requiredLabel, labelStyle];

  const errorTextStyle = [styles.errorText, errorStyle];

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={labelTextStyle}>
          {label}
          {required && <Text style={styles.asterisk}> *</Text>}
        </Text>
      )}

      <View style={inputContainerStyle}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        <TextInput
          style={textInputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={DesignSystem.colors.neutral.slate}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          testID={testID}
          accessibilityLabel={accessibilityLabel || label}
          {...props}
        />

        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>

      {error && <Text style={errorTextStyle}>{error}</Text>}

      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignSystem.spacing.sm,
  },

  label: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.primary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: DesignSystem.spacing.xs,
  },

  requiredLabel: {
    // Additional styles for required labels can be added here
  },

  asterisk: {
    color: DesignSystem.colors.semantic.error,
  },

  inputContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
  },

  // Variants
  default: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: DesignSystem.colors.border.primary,
  },
  glass: {
    backgroundColor: 'transparent',
    borderColor: DesignSystem.colors.border.glass,
  },
  minimal: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },

  outlined: {
    backgroundColor: 'transparent',
    borderColor: DesignSystem.colors.border.primary,
  },

  luxury: {
    backgroundColor: DesignSystem.colors.gold[100],
    borderColor: DesignSystem.colors.gold[500],
  },

  // Sizes
  small: {
    minHeight: 36,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },

  medium: {
    minHeight: 44,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },

  large: {
    minHeight: 52,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },

  // States
  focused: {
    borderColor: DesignSystem.colors.primary[500],
    borderWidth: 2,
  },

  error: {
    borderColor: DesignSystem.colors.semantic.error,
    borderWidth: 2,
  },

  disabled: {
    backgroundColor: DesignSystem.colors.neutral[100],
    opacity: 0.5,
  },

  input: {
    color: DesignSystem.colors.text.primary,
    flex: 1,
    fontFamily: DesignSystem.typography.fontFamily.primary,
    fontSize: 16,
    padding: 0, // Remove default padding
  },

  smallInput: {
    fontSize: 14,
  },

  mediumInput: {
    fontSize: 16,
  },

  largeInput: {
    fontSize: 18,
  },

  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  iconContainer: {
    marginHorizontal: DesignSystem.spacing.xs,
  },

  errorText: {
    color: DesignSystem.colors.semantic.error,
    fontFamily: DesignSystem.typography.fontFamily.primary,
    fontSize: 12,
    marginTop: DesignSystem.spacing.xs,
  },

  hint: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.primary,
    fontSize: 12,
    marginTop: DesignSystem.spacing.xs,
  },
});

export default Input;
