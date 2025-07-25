import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { PREMIUM_THEME } from '../../constants/PremiumThemeSystem';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'luxury';
  size?: 'small' | 'medium' | 'large' | 'hero';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowIntensity = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, PREMIUM_THEME.animation.confident);
    opacity.value = withTiming(0.8, { duration: 150 });
    if (variant === 'luxury') {
      glowIntensity.value = withTiming(1, { duration: 200 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, PREMIUM_THEME.animation.silk);
    opacity.value = withTiming(1, { duration: 150 });
    if (variant === 'luxury') {
      glowIntensity.value = withTiming(0, { duration: 300 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      glowIntensity.value,
      [0, 1],
      [0.1, 0.3]
    );

    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      shadowOpacity: variant === 'luxury' ? shadowOpacity : undefined,
    };
  });

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row',
      borderRadius: PREMIUM_THEME.radius.lg,
      ...PREMIUM_THEME.elevation.lift,
    };

    // Size variations
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: PREMIUM_THEME.spacing.md,
        paddingVertical: PREMIUM_THEME.spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: PREMIUM_THEME.spacing.xl,
        paddingVertical: PREMIUM_THEME.spacing.md,
        minHeight: 48,
      },
      large: {
        paddingHorizontal: PREMIUM_THEME.spacing.xxl,
        paddingVertical: PREMIUM_THEME.spacing.lg,
        minHeight: 56,
      },
      hero: {
        paddingHorizontal: PREMIUM_THEME.spacing.xxxl,
        paddingVertical: PREMIUM_THEME.spacing.xl,
        minHeight: 64,
        borderRadius: PREMIUM_THEME.radius.organic,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: PREMIUM_THEME.semantic.interactive.primary,
        ...PREMIUM_THEME.elevation.elevate,
      },
      secondary: {
        backgroundColor: PREMIUM_THEME.semantic.interactive.secondary,
        ...PREMIUM_THEME.elevation.hover,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: PREMIUM_THEME.semantic.border.primary,
        ...PREMIUM_THEME.elevation.hover,
      },
      glass: {
        ...PREMIUM_THEME.glassmorphism.silk,
        borderRadius: PREMIUM_THEME.radius.lg,
      },
      luxury: {
        backgroundColor: PREMIUM_THEME.colors.champagne[500],
        ...PREMIUM_THEME.elevation.dramatic,
        shadowColor: PREMIUM_THEME.colors.champagne[500],
        borderRadius: PREMIUM_THEME.radius.organic,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : undefined,
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = PREMIUM_THEME.typography.scale.button;

    const sizeTextStyles: Record<string, Partial<TextStyle>> = {
      small: { fontSize: 14, letterSpacing: 0.6 },
      medium: { fontSize: 16, letterSpacing: 0.8 },
      large: { fontSize: 18, letterSpacing: 1.0 },
      hero: { fontSize: 20, letterSpacing: 1.2 },
    };

    const variantTextStyles: Record<string, TextStyle> = {
      primary: { color: PREMIUM_THEME.semantic.text.inverse },
      secondary: { color: PREMIUM_THEME.semantic.text.primary },
      ghost: { color: PREMIUM_THEME.semantic.text.primary },
      glass: { color: PREMIUM_THEME.semantic.text.primary },
      luxury: { color: PREMIUM_THEME.semantic.text.primary },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  const getIconSize = (): number => {
    const iconSizes: Record<string, number> = {
      small: 16,
      medium: 20,
      large: 24,
      hero: 28,
    };
    return iconSizes[size];
  };

  const getIconColor = (): string => {
    const variantIconColors: Record<string, string> = {
      primary: PREMIUM_THEME.semantic.text.inverse,
      secondary: PREMIUM_THEME.semantic.text.primary,
      ghost: PREMIUM_THEME.semantic.text.primary,
      glass: PREMIUM_THEME.semantic.text.primary,
      luxury: PREMIUM_THEME.semantic.text.primary,
    };
    return variantIconColors[variant];
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          color={getIconColor()} 
          size={size === 'small' ? 'small' : 'small'} 
        />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <Ionicons 
            name={icon} 
            size={getIconSize()} 
            color={getIconColor()} 
            style={styles.iconLeft}
          />
        )}
        <Text style={getTextStyle()}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <Ionicons 
            name={icon} 
            size={getIconSize()} 
            color={getIconColor()} 
            style={styles.iconRight}
          />
        )}
      </View>
    );
  };

  return (
    <AnimatedTouchableOpacity
      style={[getButtonStyle(), animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: PREMIUM_THEME.spacing.sm,
  },
  iconRight: {
    marginLeft: PREMIUM_THEME.spacing.sm,
  },
});

export default PremiumButton;