/**
 * Modern Input Component
 * Enhanced input field with validation, animations, and multiple variants
 */

import React, { memo, useCallback, useRef, useState } from 'react';
import {
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
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ModernDesignSystem } from '@/theme/ModernDesignSystem';

interface ModernInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'outlined' | 'filled' | 'underlined';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  required?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const ModernInput: React.FC<ModernInputProps> = memo(
  ({
    label,
    error,
    hint,
    variant = 'outlined',
    size = 'medium',
    leftIcon,
    rightIcon,
    onRightIconPress,
    required = false,
    disabled = false,
    style,
    inputStyle,
    labelStyle,
    value,
    onFocus,
    onBlur,
    ...textInputProps
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const focusAnimation = useSharedValue(0);
    const labelAnimation = useSharedValue(value ? 1 : 0);
    const errorAnimation = useSharedValue(error ? 1 : 0);

    const handleFocus = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(true);
        focusAnimation.value = withTiming(1, {
          duration: ModernDesignSystem.animations.duration.normal,
        });
        labelAnimation.value = withTiming(1, {
          duration: ModernDesignSystem.animations.duration.normal,
        });
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(false);
        focusAnimation.value = withTiming(0, {
          duration: ModernDesignSystem.animations.duration.normal,
        });
        if (!value) {
          labelAnimation.value = withTiming(0, {
            duration: ModernDesignSystem.animations.duration.normal,
          });
        }
        onBlur?.(e);
      },
      [onBlur, value],
    );

    React.useEffect(() => {
      errorAnimation.value = withSpring(error ? 1 : 0, {
        damping: 15,
        stiffness: 300,
      });
    }, [error]);

    React.useEffect(() => {
      labelAnimation.value = withTiming(value ? 1 : 0, {
        duration: ModernDesignSystem.animations.duration.normal,
      });
    }, [value]);

    const containerAnimatedStyle = useAnimatedStyle(() => {
      const borderColor = interpolateColor(
        focusAnimation.value,
        [0, 1],
        [
          error
            ? ModernDesignSystem.colors.semantic.feedback.error
            : ModernDesignSystem.colors.tokens.border.primary,
          error
            ? ModernDesignSystem.colors.semantic.feedback.error
            : ModernDesignSystem.colors.semantic.brand.primary,
        ],
      );

      return {
        borderColor,
        borderWidth: interpolate(focusAnimation.value, [0, 1], [1, 2]),
      };
    });

    const labelAnimatedStyle = useAnimatedStyle(() => {
      const translateY = interpolate(labelAnimation.value, [0, 1], [0, -24]);

      const scale = interpolate(labelAnimation.value, [0, 1], [1, 0.85]);

      const color = interpolateColor(
        focusAnimation.value,
        [0, 1],
        [
          error
            ? ModernDesignSystem.colors.semantic.feedback.error
            : ModernDesignSystem.colors.tokens.content.secondary,
          error
            ? ModernDesignSystem.colors.semantic.feedback.error
            : ModernDesignSystem.colors.semantic.brand.primary,
        ],
      );

      return {
        transform: [{ translateY }, { scale }] as any,
        color,
      };
    });

    const errorAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: errorAnimation.value,
        transform: [
          {
            translateY: interpolate(errorAnimation.value, [0, 1], [-10, 0]),
          },
        ] as any,
      };
    });

    const getContainerStyle = (): ViewStyle => {
      const baseStyle = styles.container;
      const variantStyle = styles[`${variant}Container` as keyof typeof styles] as ViewStyle;
      const sizeStyle = styles[`${size}Container` as keyof typeof styles] as ViewStyle;

      return {
        ...baseStyle,
        ...variantStyle,
        ...sizeStyle,
        ...(disabled && styles.disabledContainer),
        ...style,
      };
    };

    const getInputStyle = (): TextStyle => {
      const baseStyle = styles.input;
      const sizeStyle = styles[`${size}Input` as keyof typeof styles] as TextStyle;

      return {
        ...baseStyle,
        ...sizeStyle,
        ...(disabled && styles.disabledInput),
        ...inputStyle,
      };
    };

    return (
      <View style={styles.wrapper}>
        {label && (
          <Animated.Text style={[styles.label, labelStyle, labelAnimatedStyle]}>
            {label}
            {required && ' *'}
          </Animated.Text>
        )}

        <Animated.View
          style={[getContainerStyle(), variant === 'outlined' && containerAnimatedStyle]}
        >
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

          <AnimatedTextInput
            ref={inputRef}
            style={getInputStyle()}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            placeholderTextColor={ModernDesignSystem.colors.tokens.content.tertiary}
            {...textInputProps}
          />

          {rightIcon && (
            <TouchableOpacity
              style={styles.rightIconContainer}
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              accessibilityRole="button"
              accessibilityLabel="Input action"
              accessibilityHint="Tap to perform action on this input field"
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </Animated.View>

        {(error || hint) && (
          <View style={styles.helperContainer}>
            {error ? (
              <Animated.Text style={[styles.errorText, errorAnimatedStyle]}>{error}</Animated.Text>
            ) : (
              <Text style={styles.hintText}>{hint}</Text>
            )}
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: ModernDesignSystem.spacing.semantic.component.md,
  },

  label: {
    backgroundColor: ModernDesignSystem.colors.tokens.surface.primary,
    fontFamily: ModernDesignSystem.typography.fontStacks.body[0],
    left: ModernDesignSystem.spacing.semantic.component.md,
    paddingHorizontal: 4,
    position: 'absolute',
    top: ModernDesignSystem.spacing.semantic.component.md,
    zIndex: 1,
    ...ModernDesignSystem.typography.scale.label.medium,
  },

  container: {
    alignItems: 'center',
    backgroundColor: ModernDesignSystem.colors.tokens.surface.primary,
    flexDirection: 'row',
  },

  // Variant Styles
  outlinedContainer: {
    borderColor: ModernDesignSystem.colors.tokens.border.primary,
    borderRadius: ModernDesignSystem.borderRadius.semantic.input,
    borderWidth: 1,
  },
  filledContainer: {
    backgroundColor: ModernDesignSystem.colors.tokens.surface.secondary,
    borderBottomColor: ModernDesignSystem.colors.tokens.border.primary,
    borderBottomWidth: 2,
    borderRadius: ModernDesignSystem.borderRadius.semantic.input,
  },
  underlinedContainer: {
    borderBottomColor: ModernDesignSystem.colors.tokens.border.primary,
    borderBottomWidth: 1,
  },

  // Size Variants
  smallContainer: {
    minHeight: 36,
  },
  mediumContainer: {
    minHeight: 44,
  },
  largeContainer: {
    minHeight: 52,
  },

  input: {
    color: ModernDesignSystem.colors.tokens.content.primary,
    flex: 1,
    fontFamily: ModernDesignSystem.typography.fontStacks.body[0],
    paddingHorizontal: ModernDesignSystem.spacing.semantic.component.md,
  },

  // Input Size Variants
  smallInput: {
    ...ModernDesignSystem.typography.scale.body.small,
    paddingVertical: ModernDesignSystem.spacing.semantic.component.xs,
  },
  mediumInput: {
    ...ModernDesignSystem.typography.scale.body.medium,
    paddingVertical: ModernDesignSystem.spacing.semantic.component.sm,
  },
  largeInput: {
    ...ModernDesignSystem.typography.scale.body.large,
    paddingVertical: ModernDesignSystem.spacing.semantic.component.md,
  },

  leftIconContainer: {
    paddingLeft: ModernDesignSystem.spacing.semantic.component.md,
    paddingRight: ModernDesignSystem.spacing.semantic.component.xs,
  },

  rightIconContainer: {
    paddingLeft: ModernDesignSystem.spacing.semantic.component.xs,
    paddingRight: ModernDesignSystem.spacing.semantic.component.md,
  },

  helperContainer: {
    marginTop: ModernDesignSystem.spacing.semantic.component.xs,
    paddingHorizontal: ModernDesignSystem.spacing.semantic.component.md,
  },

  errorText: {
    color: ModernDesignSystem.colors.semantic.feedback.error,
    fontFamily: ModernDesignSystem.typography.fontStacks.body[0],
    ...ModernDesignSystem.typography.scale.label.small,
  },

  hintText: {
    color: ModernDesignSystem.colors.tokens.content.secondary,
    fontFamily: ModernDesignSystem.typography.fontStacks.body[0],
    ...ModernDesignSystem.typography.scale.label.small,
  },

  disabledContainer: {
    opacity: 0.6,
  },

  disabledInput: {
    color: ModernDesignSystem.colors.tokens.content.disabled,
  },
});

export default ModernInput;
