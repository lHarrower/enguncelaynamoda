/**
 * Input Atom
 * 
 * The fundamental text input element in the design system.
 * Supports various input types and follows unified styling.
 */

import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { InputComponentProps } from '@/types/componentProps';
import { DesignSystem } from '@/theme/DesignSystem';

export interface InputProps extends Omit<InputComponentProps, 'leftIcon' | 'rightIcon' | 'variant'>, Omit<TextInputProps, 'style'> {
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
    marginBottom: DesignSystem.spacing.sm,
  },
  
  label: {
    fontSize: 14,
    fontFamily: DesignSystem.typography.fontFamily.primary,
    fontWeight: '500',
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.xs,
  },
  
  requiredLabel: {
    // Additional styles for required labels can be added here
  },
  
  asterisk: {
    color: DesignSystem.colors.semantic.error,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    backgroundColor: DesignSystem.colors.background.secondary,
  },
  
  // Variants
  default: {
    borderColor: DesignSystem.colors.border.primary,
    backgroundColor: DesignSystem.colors.background.secondary,
  },
  glass: {
    borderColor: DesignSystem.colors.border.glass,
    backgroundColor: 'transparent',
  },
  minimal: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  
  outlined: {
    borderColor: DesignSystem.colors.border.primary,
    backgroundColor: 'transparent',
  },
  
  
  luxury: {
  borderColor: DesignSystem.colors.gold[500],
  backgroundColor: DesignSystem.colors.gold[100],
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
    opacity: 0.5,
  backgroundColor: DesignSystem.colors.neutral[100],
  },
  
  input: {
    flex: 1,
    fontFamily: DesignSystem.typography.fontFamily.primary,
    fontSize: 16,
    color: DesignSystem.colors.text.primary,
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
    fontSize: 12,
    fontFamily: DesignSystem.typography.fontFamily.primary,
    color: DesignSystem.colors.semantic.error,
    marginTop: DesignSystem.spacing.xs,
  },
  
  hint: {
    fontSize: 12,
    fontFamily: DesignSystem.typography.fontFamily.primary,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
  },
});

export default Input;