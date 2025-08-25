/**
 * Original Input Component
 *
 * A reusable input component that matches the original AynaModa login design.
 * Features clean styling, icon support, and proper focus states.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useState } from 'react';
import {
  Animated,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputFocusEventData,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import {
  ACCESSIBILITY_LABELS,
  ORIGINAL_ANIMATIONS,
  ORIGINAL_COLORS,
  ORIGINAL_DIMENSIONS,
  originalLoginStyles,
} from '@/components/auth/originalLoginStyles';
import { DEFAULT_PROPS, InputComponentProps } from '@/types/componentProps';

export interface OriginalInputProps extends Omit<InputComponentProps, 'variant' | 'size'> {
  /** Custom container style */
  containerStyle?: ViewStyle;

  /** Whether the input is currently focused (controlled) */
  focused?: boolean;

  /** Callback when focus state changes */
  onFocusChange?: (focused: boolean) => void;

  /** Original theme variant */
  variant?: 'default' | 'focused' | 'error';
}

export const OriginalInput = forwardRef<TextInput, OriginalInputProps>(
  (
    {
      leftIcon,
      isPassword = DEFAULT_PROPS.disabled,
      error,
      label,
      hint,
      required = DEFAULT_PROPS.required,
      containerStyle,
      focused: controlledFocused,
      onFocusChange,
      onFocus,
      onBlur,
      style,
      inputStyle,
      labelStyle,
      errorStyle,
      testID,
      accessibilityLabel,
      disabled = DEFAULT_PROPS.disabled,
      variant = 'default',
      ...textInputProps
    },
    ref,
  ) => {
    const [internalFocused, setInternalFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusAnimation] = useState(new Animated.Value(0));

    const isFocused = controlledFocused !== undefined ? controlledFocused : internalFocused;

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (controlledFocused === undefined) {
        setInternalFocused(true);
      }
      onFocusChange?.(true);
      onFocus?.(e);

      // Animate border color on focus
      Animated.timing(focusAnimation, {
        toValue: 1,
        duration: ORIGINAL_ANIMATIONS.inputFocus.duration,
        useNativeDriver: false,
      }).start();
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (controlledFocused === undefined) {
        setInternalFocused(false);
      }
      onFocusChange?.(false);
      onBlur?.(e);

      // Animate border color on blur
      Animated.timing(focusAnimation, {
        toValue: 0,
        duration: ORIGINAL_ANIMATIONS.inputFocus.duration,
        useNativeDriver: false,
      }).start();
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const animatedBorderColor = focusAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [ORIGINAL_COLORS.inputBorder, ORIGINAL_COLORS.inputBorderFocused],
    });

    return (
      <View style={containerStyle}>
        {/* Label */}
        {label && (
          <Text style={[originalLoginStyles.subtitle, { marginBottom: 8, textAlign: 'left' }]}>
            {label}
          </Text>
        )}

        {/* Input Container */}
        <Animated.View
          style={[
            originalLoginStyles.inputContainer,
            {
              borderColor: animatedBorderColor,
            },
            error && { borderColor: ORIGINAL_COLORS.errorColor },
          ]}
        >
          {/* Left Icon */}
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={ORIGINAL_DIMENSIONS.inputIconSize}
              style={originalLoginStyles.inputIcon}
            />
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            style={originalLoginStyles.input}
            placeholderTextColor={ORIGINAL_COLORS.placeholderText}
            secureTextEntry={isPassword && !showPassword}
            onFocus={handleFocus}
            onBlur={handleBlur}
            accessibilityLabel={
              isPassword ? ACCESSIBILITY_LABELS.passwordInput : ACCESSIBILITY_LABELS.emailInput
            }
            {...textInputProps}
          />

          {/* Password Toggle */}
          {isPassword && (
            <TouchableOpacity
              style={originalLoginStyles.passwordToggle}
              onPress={togglePasswordVisibility}
              accessibilityLabel={ACCESSIBILITY_LABELS.passwordToggle}
              accessibilityRole="button"
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={ORIGINAL_DIMENSIONS.inputIconSize}
                color={ORIGINAL_COLORS.placeholderText}
              />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Error Message */}
        {error && (
          <Animated.View style={styles.errorContainer}>
            <Text style={originalLoginStyles.errorText}>{error}</Text>
          </Animated.View>
        )}
      </View>
    );
  },
);

OriginalInput.displayName = 'OriginalInput';

const styles = StyleSheet.create({
  errorContainer: {
    opacity: 1,
  },
});

export default OriginalInput;
