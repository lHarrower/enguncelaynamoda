/**
 * Standardized Input Component
 * 
 * A reusable input component that follows AYNAMODA's design system
 * and implements the standardized InputComponentProps interface.
 */

import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { InputComponentProps, DEFAULT_PROPS } from '@/types/componentProps';
import { DesignSystem } from '@/theme/DesignSystem';

export interface StandardInputProps extends Omit<InputComponentProps, 'variant'>, Omit<TextInputProps, 'style'> {
  /** Input variant style */
  variant?: 'default' | 'outlined' | 'filled' | 'glass' | 'minimal';
  /** Left icon name */
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** Right icon name */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  /** Right icon press handler */
  onRightIconPress?: () => void;
  /** Whether this is a password input */
  isPassword?: boolean;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom input wrapper style */
  inputWrapperStyle?: ViewStyle;
  /** Custom label style */
  labelStyle?: TextStyle;
  /** Custom hint style */
  hintStyle?: TextStyle;
  /** Custom error style */
  errorStyle?: TextStyle;
  /** Focus change handler */
  onFocusChange?: (focused: boolean) => void;
  /** Controlled focus state */
  focused?: boolean;
  /** Haptic feedback intensity for interactions */
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'none';
}

export interface StandardInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
}

const StandardInput = forwardRef<StandardInputRef, StandardInputProps>(
  (
    {
      label,
      hint,
      error,
      required = DEFAULT_PROPS.required,
      disabled = DEFAULT_PROPS.disabled,
      variant = 'default',
      size = DEFAULT_PROPS.size,
      leftIcon,
      rightIcon,
      onRightIconPress,
      isPassword = false,
      containerStyle,
      inputWrapperStyle,
      style,
      inputStyle,
      labelStyle,
      hintStyle,
      errorStyle,
      testID,
      accessibilityLabel,
      hapticFeedback = DEFAULT_PROPS.hapticFeedback,
      onFocusChange,
      focused: controlledFocused,
      onFocus,
      onBlur,
      ...textInputProps
    },
    ref
  ) => {
    const [internalFocused, setInternalFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const focusAnimation = useRef(new Animated.Value(0)).current;
    
    const focused = controlledFocused !== undefined ? controlledFocused : internalFocused;

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => inputRef.current?.clear(),
      isFocused: () => inputRef.current?.isFocused() || false,
    }));

    // Animate focus state
    React.useEffect(() => {
      Animated.timing(focusAnimation, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [focused, focusAnimation]);

    const handleFocus = (e: any) => {
      if (controlledFocused === undefined) {
        setInternalFocused(true);
      }
      onFocusChange?.(true);
      onFocus?.(e);
      
      if (hapticFeedback === 'light') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    const handleBlur = (e: any) => {
      if (controlledFocused === undefined) {
        setInternalFocused(false);
      }
      onFocusChange?.(false);
      onBlur?.(e);
    };

    const handlePasswordToggle = () => {
      setShowPassword(!showPassword);
      if (hapticFeedback === 'light') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    const handleRightIconPress = () => {
      if (isPassword) {
        handlePasswordToggle();
      } else {
        onRightIconPress?.();
      }
    };

    const getContainerStyles = (): ViewStyle => {
      const baseStyle = {
        ...styles.container,
        ...styles[`container_${size}`],
      };

      if (disabled) {
        return { ...baseStyle, ...styles.containerDisabled };
      }

      if (error) {
        return { ...baseStyle, ...styles.containerError };
      }

      if (focused) {
        return { ...baseStyle, ...styles.containerFocused };
      }

      return baseStyle;
    };

    const getInputWrapperStyles = (): ViewStyle => {
      const baseStyle = {
        ...styles.inputWrapper,
        ...styles[`inputWrapper_${variant}`],
      };

      return baseStyle;
    };

    const getInputStyles = (): TextStyle => {
      const baseStyle = {
        ...styles.input,
        ...styles[`input_${size}`],
        ...(disabled && styles.inputDisabled),
      };

      return baseStyle;
    };

    const getLabelStyles = (): TextStyle => {
      const baseStyle = {
        ...styles.label,
        ...styles[`label_${size}`],
        ...(disabled && styles.labelDisabled),
        ...(error && styles.labelError),
        ...(focused && styles.labelFocused),
      };

      return baseStyle;
    };

    const animatedBorderColor = focusAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [DesignSystem.colors.border.primary, DesignSystem.colors.sage[500]],
    });

    const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
    const iconColor = disabled 
      ? DesignSystem.colors.text.disabled 
      : focused 
      ? DesignSystem.colors.sage[500] 
      : DesignSystem.colors.text.secondary;

    return (
      <View style={[getContainerStyles(), containerStyle]} testID={testID}>
        {label && (
          <View style={styles.labelContainer}>
            <Text style={[getLabelStyles(), labelStyle]}>
              {label}
              {required && <Text style={styles.required}> *</Text>}
            </Text>
          </View>
        )}
        
        <Animated.View 
          style={[
            getInputWrapperStyles(),
            inputWrapperStyle,
            variant === 'outlined' && { borderColor: animatedBorderColor },
          ]}
        >
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={iconSize}
              color={iconColor}
              style={styles.leftIcon}
            />
          )}
          
          <TextInput
            ref={inputRef}
            style={[getInputStyles(), inputStyle]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            secureTextEntry={isPassword && !showPassword}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityState={{ disabled }}
            placeholderTextColor={DesignSystem.colors.text.placeholder}
            {...textInputProps}
          />
          
          {(rightIcon || isPassword) && (
            <TouchableOpacity
              onPress={handleRightIconPress}
              style={styles.rightIconContainer}
              disabled={disabled}
            >
              <Ionicons
                name={
                  isPassword 
                    ? (showPassword ? 'eye-off' : 'eye')
                    : rightIcon!
                }
                size={iconSize}
                color={iconColor}
              />
            </TouchableOpacity>
          )}
        </Animated.View>
        
        {hint && !error && (
          <Text style={[styles.hint, hintStyle]}>
            {hint}
          </Text>
        )}
        
        {error && (
          <Text style={[styles.error, errorStyle]}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  container_small: {
    marginBottom: DesignSystem.spacing.sm,
  },
  container_medium: {
    marginBottom: DesignSystem.spacing.md,
  },
  container_large: {
    marginBottom: DesignSystem.spacing.lg,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  containerError: {},
  containerFocused: {},
  labelContainer: {
    marginBottom: DesignSystem.spacing.xs,
  },
  label: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '500',
  },
  label_small: {
    ...DesignSystem.typography.body.small,
  },
  label_medium: {
    ...DesignSystem.typography.body.medium,
  },
  label_large: {
    ...DesignSystem.typography.body.large,
  },
  labelDisabled: {
    color: DesignSystem.colors.text.disabled,
  },
  labelError: {
    color: DesignSystem.colors.error[500],
  },
  labelFocused: {
    color: DesignSystem.colors.sage[500],
  },
  required: {
    color: DesignSystem.colors.error[500],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: DesignSystem.radius.md,
  },
  inputWrapper_default: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
  },
  inputWrapper_outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: DesignSystem.colors.border.primary,
  },
  inputWrapper_filled: {
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderWidth: 0,
  },
  inputWrapper_glass: {
    backgroundColor: DesignSystem.colors.background.glass,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.glass,
  },
  inputWrapper_minimal: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border.primary,
    borderRadius: 0,
  },
  input: {
    flex: 1,
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
  },
  input_small: {
    ...DesignSystem.typography.body.small,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    minHeight: 36,
  },
  input_medium: {
    ...DesignSystem.typography.body.medium,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    minHeight: 44,
  },
  input_large: {
    ...DesignSystem.typography.body.large,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    minHeight: 52,
  },
  inputDisabled: {
    color: DesignSystem.colors.text.disabled,
  },
  leftIcon: {
    marginLeft: DesignSystem.spacing.sm,
    marginRight: DesignSystem.spacing.xs,
  },
  rightIconContainer: {
    padding: DesignSystem.spacing.xs,
    marginRight: DesignSystem.spacing.xs,
  },
  hint: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
  },
  error: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.error[500],
    marginTop: DesignSystem.spacing.xs,
  },
});

StandardInput.displayName = 'StandardInput';

export default StandardInput;