/**
 * Standardized Button Component
 *
 * A reusable button component that follows AYNAMODA's design system
 * and implements the standardized ButtonComponentProps interface.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';
import { ButtonComponentProps, DEFAULT_PROPS } from '@/types/componentProps';
import { warnInDev } from '@/utils/consoleSuppress';

export interface StandardButtonProps extends ButtonComponentProps {
  /** Button gradient colors for luxury variants */
  gradientColors?: readonly [string, string, ...string[]];
  /** Shadow configuration */
  shadow?: boolean;
}

const StandardButton: React.FC<StandardButtonProps> = ({
  title,
  children,
  onPress,
  variant = DEFAULT_PROPS.variant,
  size = DEFAULT_PROPS.size,
  icon,
  iconPosition = 'left',
  disabled = DEFAULT_PROPS.disabled,
  loading = DEFAULT_PROPS.loading,
  hapticFeedback = DEFAULT_PROPS.hapticFeedback,
  fullWidth = DEFAULT_PROPS.fullWidth,
  style,
  textStyle,
  testID,
  accessibilityLabel,
  gradientColors,
  shadow = true,
  ...props
}) => {
  // Validate required props
  React.useEffect(() => {
    if (!title && !children) {
      warnInDev('StandardButton: Either title or children prop is required');
    }
  }, [title, children]);

  const handlePress = () => {
    if (disabled || loading) {
      return;
    }

    // Provide haptic feedback
    if (hapticFeedback !== 'none') {
      switch (hapticFeedback) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    }

    onPress?.();
  };

  const getButtonStyles = (): ViewStyle => {
    const baseStyle = {
      ...styles.button,
      ...styles[`button_${size}`],
      ...(fullWidth && styles.fullWidth),
      ...(disabled && styles.disabled),
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, ...styles.primary };
      case 'secondary':
        return { ...baseStyle, ...styles.secondary };
      case 'ghost':
        return { ...baseStyle, ...styles.ghost };
      case 'glass':
        return { ...baseStyle, ...styles.glass };
      case 'luxury':
        return { ...baseStyle, ...styles.luxury };
      case 'minimal':
        return { ...baseStyle, ...styles.minimal };
      default:
        return baseStyle;
    }
  };

  const getTextStyles = (): TextStyle => {
    const baseStyle = {
      ...styles.text,
      ...styles[`text_${size}`],
      ...(disabled && styles.textDisabled),
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, ...styles.textPrimary };
      case 'secondary':
        return { ...baseStyle, ...styles.textSecondary };
      case 'ghost':
        return { ...baseStyle, ...styles.textGhost };
      case 'glass':
        return { ...baseStyle, ...styles.textGlass };
      case 'luxury':
        return { ...baseStyle, ...styles.textLuxury };
      case 'minimal':
        return { ...baseStyle, ...styles.textMinimal };
      default:
        return baseStyle;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size={size === 'small' ? 'small' : 'large'}
            color={variant === 'primary' ? '#FFFFFF' : DesignSystem.colors.sage[500]}
          />
          {title && <Text style={[getTextStyles(), textStyle, styles.loadingText]}>{title}</Text>}
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <Ionicons
            name={icon}
            size={size === 'small' ? 16 : size === 'medium' ? 20 : 24}
            color={getTextStyles().color}
            style={styles.iconLeft}
          />
        )}

        {children || <Text style={[getTextStyles(), textStyle]}>{title}</Text>}

        {icon && iconPosition === 'right' && (
          <Ionicons
            name={icon}
            size={size === 'small' ? 16 : size === 'medium' ? 20 : 24}
            color={getTextStyles().color}
            style={styles.iconRight}
          />
        )}
      </View>
    );
  };

  const buttonStyle = [getButtonStyles(), style];
  const shouldUseGradient = variant === 'luxury' || gradientColors;
  const finalGradientColors = gradientColors ?? [
    DesignSystem.colors.sage[500],
    DesignSystem.colors.sage[600],
  ];

  if (shouldUseGradient) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        style={[buttonStyle, shadow && styles.shadow]}
        testID={testID}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
        {...props}
      >
        <LinearGradient colors={finalGradientColors} style={styles.gradientContainer}>
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={[buttonStyle, shadow && styles.shadow]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: DesignSystem.radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button_large: {
    minHeight: 52,
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.lg,
  },
  button_medium: {
    minHeight: 44,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  button_small: {
    minHeight: 36,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  contentContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: DesignSystem.colors.sage[500],
    borderWidth: 1,
  },
  glass: {
    backgroundColor: DesignSystem.colors.background.glass,
    borderColor: DesignSystem.colors.border.glass,
    borderWidth: 1,
  },
  gradientContainer: {
    alignItems: 'center',
    borderRadius: DesignSystem.radius.md,
    flex: 1,
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: DesignSystem.spacing.sm,
  },
  iconRight: {
    marginLeft: DesignSystem.spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: DesignSystem.spacing.sm,
  },
  luxury: {
    backgroundColor: 'transparent',
  },
  minimal: {
    backgroundColor: 'transparent',
  },
  primary: {
    backgroundColor: DesignSystem.colors.sage[500],
  },
  secondary: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: DesignSystem.colors.border.primary,
    borderWidth: 1,
  },
  shadow: {
    ...DesignSystem.elevation.soft,
  },
  text: {
    ...DesignSystem.typography.button.medium,
    textAlign: 'center',
  },
  textDisabled: {
    opacity: 0.6,
  },
  textGhost: {
    color: DesignSystem.colors.sage[500],
  },
  textGlass: {
    color: DesignSystem.colors.text.primary,
  },
  textLuxury: {
    color: DesignSystem.colors.text.inverse,
  },
  textMinimal: {
    color: DesignSystem.colors.text.primary,
  },
  textPrimary: {
    color: DesignSystem.colors.text.inverse,
  },
  textSecondary: {
    color: DesignSystem.colors.text.primary,
  },
  text_large: {
    ...DesignSystem.typography.button.large,
  },
  text_medium: {
    ...DesignSystem.typography.button.medium,
  },
  text_small: {
    ...DesignSystem.typography.button.small,
  },
});

// Defaults via parameter defaults are already applied at usage sites

export default StandardButton;
