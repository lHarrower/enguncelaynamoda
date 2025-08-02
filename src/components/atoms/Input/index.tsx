/**
 * Input Atom
 * 
 * The fundamental text input element in the design system.
 * Supports various input types and follows unified styling.
 */

import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { InputComponentProps } from '@/types/componentProps';
import { UNIFIED_COLORS, TYPOGRAPHY, SPACING } from '@/theme';

export interface InputProps extends InputComponentProps, Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'outlined' | 'filled' | 'luxury';
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

  const containerStyle = [
    styles.container,
    style,
  ];

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

  const labelTextStyle = [
    styles.label,
    required && styles.requiredLabel,
    labelStyle,
  ];

  const errorTextStyle = [
    styles.errorText,
    errorStyle,
  ];

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={labelTextStyle}>
          {label}
          {required && <Text style={styles.asterisk}> *</Text>}
        </Text>
      )}
      
      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={textInputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={UNIFIED_COLORS.neutral[400]}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          testID={testID}
          accessibilityLabel={accessibilityLabel || label}
          {...props}
        />
        
        {rightIcon && (
          <View style={styles.iconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={errorTextStyle}>
          {error}
        </Text>
      )}
      
      {hint && !error && (
        <Text style={styles.hint}>
          {hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.margin.small,
  },
  
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: UNIFIED_COLORS.neutral[700],
    marginBottom: SPACING.margin.xs,
  },
  
  requiredLabel: {
    // Additional styling for required fields if needed
  },
  
  asterisk: {
    color: UNIFIED_COLORS.semantic.error,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SPACING.radius.medium,
    borderWidth: 1,
    backgroundColor: UNIFIED_COLORS.neutral[50],
  },
  
  // Variants
  default: {
    borderColor: UNIFIED_COLORS.neutral[300],
    backgroundColor: UNIFIED_COLORS.neutral[50],
  },
  
  outlined: {
    borderColor: UNIFIED_COLORS.neutral[300],
    backgroundColor: 'transparent',
  },
  
  filled: {
    borderColor: 'transparent',
    backgroundColor: UNIFIED_COLORS.neutral[100],
  },
  
  luxury: {
    borderColor: UNIFIED_COLORS.luxury.gold,
    backgroundColor: UNIFIED_COLORS.luxury.cream,
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
  
  // States
  focused: {
    borderColor: UNIFIED_COLORS.primary[500],
    borderWidth: 2,
  },
  
  error: {
    borderColor: UNIFIED_COLORS.semantic.error,
    borderWidth: 2,
  },
  
  disabled: {
    opacity: 0.5,
    backgroundColor: UNIFIED_COLORS.neutral[100],
  },
  
  input: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fontFamily.primary,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: UNIFIED_COLORS.neutral[900],
    padding: 0, // Remove default padding
  },
  
  smallInput: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  
  mediumInput: {
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  
  largeInput: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  
  iconContainer: {
    marginHorizontal: SPACING.margin.xs,
  },
  
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.primary,
    color: UNIFIED_COLORS.semantic.error,
    marginTop: SPACING.margin.xs,
  },
  
  hint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.primary,
    color: UNIFIED_COLORS.neutral[500],
    marginTop: SPACING.margin.xs,
  },
});

export default Input;
export type { InputProps };