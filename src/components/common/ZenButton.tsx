import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';

interface ZenButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
}

export default function ZenButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
}: ZenButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withTiming(0.97, { duration: 150 });
      opacity.value = withTiming(0.9, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withTiming(1, { duration: 150 });
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle = [
      styles.button,
      styles[size],
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
    ];

    switch (variant) {
      case 'secondary':
        return [...baseStyle, styles.secondary];
      case 'ghost':
        return [...baseStyle, styles.ghost];
      case 'outline':
        return [...baseStyle, styles.outline];
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle = [styles.text, styles[`${size}Text` as keyof typeof styles]];

    switch (variant) {
      case 'secondary':
        return [...baseStyle, styles.secondaryText];
      case 'ghost':
        return [...baseStyle, styles.ghostText];
      case 'outline':
        return [...baseStyle, styles.outlineText];
      default:
        return [...baseStyle, styles.primaryText];
    }
  };

  const getIconColor = () => {
    if (disabled) return APP_THEME_V2.colors.moonlightSilver;
    
    switch (variant) {
      case 'primary':
        return APP_THEME_V2.colors.whisperWhite;
      case 'secondary':
        return APP_THEME_V2.semantic.text.primary;
      case 'outline':
        return APP_THEME_V2.semantic.accent;
      case 'ghost':
        return APP_THEME_V2.semantic.text.secondary;
      default:
        return APP_THEME_V2.colors.whisperWhite;
    }
  };

  const renderContent = () => (
    <>
      {icon && iconPosition === 'left' && (
        <Ionicons 
          name={icon} 
          size={size === 'small' ? 16 : size === 'large' ? 20 : 18} 
          color={getIconColor()} 
          style={styles.iconLeft} 
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
      {icon && iconPosition === 'right' && (
        <Ionicons 
          name={icon} 
          size={size === 'small' ? 16 : size === 'large' ? 20 : 18} 
          color={getIconColor()} 
          style={styles.iconRight} 
        />
      )}
    </>
  );

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        {variant === 'primary' && !disabled ? (
          <LinearGradient
            colors={[APP_THEME_V2.colors.sageGreen[400], APP_THEME_V2.colors.sageGreen[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {renderContent()}
          </LinearGradient>
        ) : (
          renderContent()
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: DesignSystem.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
    ...DesignSystem.elevation.medium,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  
  // Sizes
  small: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.lg,
    minHeight: 52,
  },
  
  // Variants
  secondary: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderWidth: 1,
    borderColor: DesignSystem.colors.sage[200],
  },
  ghost: {
    backgroundColor: 'transparent',
    ...DesignSystem.elevation.soft,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: DesignSystem.colors.sage[500],
  },
  
  // States
  disabled: {
    backgroundColor: DesignSystem.colors.sage[100],
    opacity: 0.6,
    ...DesignSystem.elevation.soft,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    textAlign: 'center',
    fontFamily: DesignSystem.typography.fonts.body,
    letterSpacing: 0.3,
  },
  smallText: {
    ...DesignSystem.typography.scale.caption,
    fontWeight: '600',
  },
  mediumText: {
    ...DesignSystem.typography.scale.body2,
    fontWeight: '600',
  },
  largeText: {
    ...DesignSystem.typography.scale.body1,
    fontWeight: '600',
  },
  
  // Text colors
  primaryText: {
    color: DesignSystem.colors.text.inverse,
  },
  secondaryText: {
    color: DesignSystem.colors.text.primary,
  },
  ghostText: {
    color: DesignSystem.colors.text.secondary,
  },
  outlineText: {
    color: DesignSystem.colors.sage[500],
  },
  
  // Icon spacing
  iconLeft: {
    marginRight: DesignSystem.spacing.sm,
  },
  iconRight: {
    marginLeft: DesignSystem.spacing.sm,
  },
});