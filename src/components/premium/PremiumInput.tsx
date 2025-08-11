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
import { DesignSystem } from '@/theme/DesignSystem';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedView = Animated.createAnimatedComponent(View);

type BaseTextInputProps = Omit<TextInputProps, 'style'>;

interface PremiumInputProps extends BaseTextInputProps {
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
      [DesignSystem.colors.border.primary, DesignSystem.colors.gold[500]]
    );

    const errorBorderColor = interpolateColor(
      errorAnimation.value,
      [0, 1],
      [borderColor, DesignSystem.colors.error[500]]
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
      [DesignSystem.colors.text.secondary, DesignSystem.colors.gold[600]]
    );

    const errorLabelColor = interpolateColor(
      errorAnimation.value,
      [0, 1],
      [labelColor, DesignSystem.colors.error[500]]
    );

    return {
      color: errorLabelColor,
    };
  });

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderWidth: 1.5,
      borderRadius: DesignSystem.borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: DesignSystem.colors.surface.secondary,
      ...DesignSystem.elevation.soft,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      medium: {
        paddingHorizontal: DesignSystem.spacing.lg,
        paddingVertical: DesignSystem.spacing.md,
        minHeight: 56,
      },
      large: {
        paddingHorizontal: DesignSystem.spacing.xl,
        paddingVertical: DesignSystem.spacing.lg,
        minHeight: 64,
      },
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: DesignSystem.colors.surface.secondary,
      },
      glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
      },
      luxury: {
        backgroundColor: DesignSystem.colors.surface.primary,
        borderColor: DesignSystem.colors.gold[200],
        ...DesignSystem.elevation.medium,
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
      ...DesignSystem.typography.body.medium,
      color: DesignSystem.colors.text.primary,
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
      ...DesignSystem.typography.scale.caption,
      color: DesignSystem.colors.text.secondary,
      marginBottom: DesignSystem.spacing.sm,
      ...labelStyle,
    };
  };

  const getIconSize = (): number => {
    return size === 'large' ? 24 : 20;
  };

  const getIconColor = (): string => {
    if (error) return DesignSystem.colors.error[500];
    if (isFocused) return DesignSystem.colors.gold[500];
    return DesignSystem.colors.text.tertiary;
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
          placeholderTextColor={DesignSystem.colors.text.tertiary}
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
    marginBottom: DesignSystem.spacing.md,
  },
  leftIcon: {
    marginRight: DesignSystem.spacing.md,
  },
  rightIconContainer: {
    marginLeft: DesignSystem.spacing.md,
    padding: DesignSystem.spacing.xs,
  },
  errorText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.error[500],
    marginTop: DesignSystem.spacing.xs,
    marginLeft: DesignSystem.spacing.sm,
  },
  hintText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    marginTop: DesignSystem.spacing.xs,
    marginLeft: DesignSystem.spacing.sm,
  },
  generateButtonText: {
    // placeholder to satisfy style references if any
  }
});

export default PremiumInput;