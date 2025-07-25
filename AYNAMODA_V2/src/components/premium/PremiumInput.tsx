import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { PREMIUM_THEME } from '../../constants/PremiumThemeSystem';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedView = Animated.createAnimatedComponent(View);

interface PremiumInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'glass' | 'luxury';
  size?: 'medium' | 'large';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

const PremiumInput: React.FC<PremiumInputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  size = 'medium',
  style,
  inputStyle,
  labelStyle,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  const focusAnimation = useSharedValue(0);
  const errorAnimation = useSharedValue(0);

  React.useEffect(() => {
    focusAnimation.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  React.useEffect(() => {
    errorAnimation.value = withTiming(error ? 1 : 0, { duration: 200 });
  }, [error]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [PREMIUM_THEME.semantic.border.primary, PREMIUM_THEME.colors.champagne[500]]
    );

    const errorBorderColor = interpolateColor(
      errorAnimation.value,
      [0, 1],
      [borderColor, PREMIUM_THEME.semantic.status.error]
    );

    const shadowOpacity = interpolate(
      focusAnimation.value,
      [0, 1],
      [0.05, 0.15]
    );

    return {
      borderColor: errorBorderColor,
      shadowOpacity,
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    const labelColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [PREMIUM_THEME.semantic.text.secondary, PREMIUM_THEME.colors.champagne[600]]
    );

    const errorLabelColor = interpolateColor(
      errorAnimation.value,
      [0, 1],
      [labelColor, PREMIUM_THEME.semantic.status.error]
    );

    return {
      color: errorLabelColor,
    };
  });

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderWidth: 1.5,
      borderRadius: PREMIUM_THEME.radius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: PREMIUM_THEME.semantic.surface.secondary,
      ...PREMIUM_THEME.elevation.hover,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      medium: {
        paddingHorizontal: PREMIUM_THEME.spacing.lg,
        paddingVertical: PREMIUM_THEME.spacing.md,
        minHeight: 56,
      },
      large: {
        paddingHorizontal: PREMIUM_THEME.spacing.xl,
        paddingVertical: PREMIUM_THEME.spacing.lg,
        minHeight: 64,
      },
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: PREMIUM_THEME.semantic.surface.secondary,
      },
      glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
      },
      luxury: {
        backgroundColor: PREMIUM_THEME.semantic.surface.primary,
        borderColor: PREMIUM_THEME.colors.champagne[200],
        ...PREMIUM_THEME.elevation.elevate,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle = {
      ...PREMIUM_THEME.typography.scale.body1,
      color: PREMIUM_THEME.semantic.text.primary,
      flex: 1,
      paddingVertical: 0, // Remove default padding
    };

    return {
      ...baseStyle,
      ...inputStyle,
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      ...PREMIUM_THEME.typography.scale.caption,
      color: PREMIUM_THEME.semantic.text.secondary,
      marginBottom: PREMIUM_THEME.spacing.sm,
      ...labelStyle,
    };
  };

  const getIconSize = (): number => {
    return size === 'large' ? 24 : 20;
  };

  const getIconColor = (): string => {
    if (error) return PREMIUM_THEME.semantic.status.error;
    if (isFocused) return PREMIUM_THEME.colors.champagne[500];
    return PREMIUM_THEME.semantic.text.tertiary;
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    textInputProps.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    textInputProps.onBlur?.(e);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Animated.Text style={[getLabelStyle(), animatedLabelStyle]}>
          {label}
        </Animated.Text>
      )}
      
      <AnimatedView style={[getContainerStyle(), animatedContainerStyle]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={getIconSize()}
            color={getIconColor()}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          ref={inputRef}
          style={getInputStyle()}
          placeholderTextColor={PREMIUM_THEME.semantic.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
          >
            <Ionicons
              name={rightIcon}
              size={getIconSize()}
              color={getIconColor()}
            />
          </TouchableOpacity>
        )}
      </AnimatedView>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {hint && !error && (
        <Text style={styles.hintText}>{hint}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: PREMIUM_THEME.spacing.md,
  },
  leftIcon: {
    marginRight: PREMIUM_THEME.spacing.md,
  },
  rightIconContainer: {
    marginLeft: PREMIUM_THEME.spacing.md,
    padding: PREMIUM_THEME.spacing.xs,
  },
  errorText: {
    ...PREMIUM_THEME.typography.scale.body3,
    color: PREMIUM_THEME.semantic.status.error,
    marginTop: PREMIUM_THEME.spacing.xs,
    marginLeft: PREMIUM_THEME.spacing.sm,
  },
  hintText: {
    ...PREMIUM_THEME.typography.scale.body3,
    color: PREMIUM_THEME.semantic.text.tertiary,
    marginTop: PREMIUM_THEME.spacing.xs,
    marginLeft: PREMIUM_THEME.spacing.sm,
  },
});

export default PremiumInput;