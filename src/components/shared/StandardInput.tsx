/**
 * Standardized Input Component
 *
 * A reusable input component that follows AYNAMODA's design system
 * and implements the standardized InputComponentProps interface.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  Animated,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';
import { DEFAULT_PROPS, InputComponentProps } from '@/types/componentProps';

export interface StandardInputProps
  extends Omit<InputComponentProps, 'variant'>,
    Omit<TextInputProps, 'style'> {
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
    ref,
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

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (controlledFocused === undefined) {
        setInternalFocused(true);
      }
      onFocusChange?.(true);
      onFocus?.(e);

      if (hapticFeedback === 'light') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
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
            <Ionicons name={leftIcon} size={iconSize} color={iconColor} style={styles.leftIcon} />
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
              accessibilityRole="button"
              accessibilityLabel={
                isPassword ? (showPassword ? 'Hide password' : 'Show password') : 'Action button'
              }
              accessibilityHint={isPassword ? 'Toggles password visibility' : 'Performs action'}
            >
              <Ionicons
                name={isPassword ? (showPassword ? 'eye-off' : 'eye') : rightIcon!}
                size={iconSize}
                color={iconColor}
              />
            </TouchableOpacity>
          )}
        </Animated.View>

        {hint && !error && <Text style={[styles.hint, hintStyle]}>{hint}</Text>}

        {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containerDisabled: {
    opacity: 0.6,
  },
  containerError: {},
  containerFocused: {},
  container_large: {
    marginBottom: DesignSystem.spacing.lg,
  },
  container_medium: {
    marginBottom: DesignSystem.spacing.md,
  },
  container_small: {
    marginBottom: DesignSystem.spacing.sm,
  },
  error: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.error[500],
    marginTop: DesignSystem.spacing.xs,
  },
  hint: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
  },
  input: {
    flex: 1,
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
  },
  inputDisabled: {
    color: DesignSystem.colors.text.disabled,
  },
  inputWrapper: {
    alignItems: 'center',
    borderRadius: DesignSystem.radius.md,
    flexDirection: 'row',
  },
  inputWrapper_default: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: DesignSystem.colors.border.primary,
    borderWidth: 1,
  },
  inputWrapper_filled: {
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderWidth: 0,
  },
  inputWrapper_glass: {
    backgroundColor: DesignSystem.colors.background.glass,
    borderColor: DesignSystem.colors.border.glass,
    borderWidth: 1,
  },
  inputWrapper_minimal: {
    backgroundColor: 'transparent',
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    borderRadius: 0,
    borderWidth: 0,
  },
  inputWrapper_outlined: {
    backgroundColor: 'transparent',
    borderColor: DesignSystem.colors.border.primary,
    borderWidth: 2,
  },
  input_large: {
    ...DesignSystem.typography.body.large,
    minHeight: 52,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  input_medium: {
    ...DesignSystem.typography.body.medium,
    minHeight: 44,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  input_small: {
    ...DesignSystem.typography.body.small,
    minHeight: 36,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  label: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '500',
  },
  labelContainer: {
    marginBottom: DesignSystem.spacing.xs,
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
  label_large: {
    ...DesignSystem.typography.body.large,
  },
  label_medium: {
    ...DesignSystem.typography.body.medium,
  },
  label_small: {
    ...DesignSystem.typography.body.small,
  },
  leftIcon: {
    marginLeft: DesignSystem.spacing.sm,
    marginRight: DesignSystem.spacing.xs,
  },
  required: {
    color: DesignSystem.colors.error[500],
  },
  rightIconContainer: {
    marginRight: DesignSystem.spacing.xs,
    padding: DesignSystem.spacing.xs,
  },
});

StandardInput.displayName = 'StandardInput';

export default StandardInput;
