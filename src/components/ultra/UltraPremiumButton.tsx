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
import { ULTRA_PREMIUM_THEME } from '../../constants/UltraPremiumTheme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface UltraPremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const UltraPremiumButton: React.FC<UltraPremiumButtonProps> = ({
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

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row',
      borderRadius: ULTRA_PREMIUM_THEME.radius.sm,
    };

    // Size variations
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.md,
        paddingVertical: ULTRA_PREMIUM_THEME.spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
        paddingVertical: ULTRA_PREMIUM_THEME.spacing.md,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.xl,
        paddingVertical: ULTRA_PREMIUM_THEME.spacing.lg,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: ULTRA_PREMIUM_THEME.semantic.interactive.primary,
        ...ULTRA_PREMIUM_THEME.elevation.subtle,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: ULTRA_PREMIUM_THEME.semantic.border.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      minimal: {
        backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.secondary,
        borderWidth: 1,
        borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
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
    const baseTextStyle = ULTRA_PREMIUM_THEME.typography.scale.button;

    const sizeTextStyles: Record<string, Partial<TextStyle>> = {
      small: { fontSize: 12, letterSpacing: 0.6 },
      medium: { fontSize: 14, letterSpacing: 0.8 },
      large: { fontSize: 16, letterSpacing: 1.0 },
    };

    const variantTextStyles: Record<string, TextStyle> = {
      primary: { color: ULTRA_PREMIUM_THEME.semantic.text.inverse },
      secondary: { color: ULTRA_PREMIUM_THEME.semantic.text.primary },
      ghost: { color: ULTRA_PREMIUM_THEME.semantic.text.secondary },
      minimal: { color: ULTRA_PREMIUM_THEME.semantic.text.primary },
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
      small: 14,
      medium: 16,
      large: 18,
    };
    return iconSizes[size];
  };

  const getIconColor = (): string => {
    const variantIconColors: Record<string, string> = {
      primary: ULTRA_PREMIUM_THEME.semantic.text.inverse,
      secondary: ULTRA_PREMIUM_THEME.semantic.text.primary,
      ghost: ULTRA_PREMIUM_THEME.semantic.text.secondary,
      minimal: ULTRA_PREMIUM_THEME.semantic.text.primary,
    };
    return variantIconColors[variant];
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          color={getIconColor()} 
          size="small"
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
      activeOpacity={0.9}
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
    marginRight: ULTRA_PREMIUM_THEME.spacing.sm,
  },
  iconRight: {
    marginLeft: ULTRA_PREMIUM_THEME.spacing.sm,
  },
});

export default UltraPremiumButton;