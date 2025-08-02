/**
 * Standardized Button Component
 * 
 * A reusable button component that follows AYNAMODA's design system
 * and implements the standardized ButtonComponentProps interface.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ButtonComponentProps, DEFAULT_PROPS, validateRequiredProps } from '@/types/componentProps';
import { DesignSystem } from '@/theme/DesignSystem';

export interface StandardButtonProps extends ButtonComponentProps {
  /** Button gradient colors for luxury variants */
  gradientColors?: string[];
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
      console.warn('StandardButton: Either title or children prop is required');
    }
  }, [title, children]);

  const handlePress = () => {
    if (disabled || loading) return;
    
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
          {title && (
            <Text style={[getTextStyles(), textStyle, styles.loadingText]}>
              {title}
            </Text>
          )}
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
        
        {children || (
          <Text style={[getTextStyles(), textStyle]}>
            {title}
          </Text>
        )}
        
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
  const finalGradientColors = gradientColors || [
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
        <LinearGradient
          colors={finalGradientColors}
          style={styles.gradientContainer}
        >
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
    borderRadius: DesignSystem.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  button_small: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    minHeight: 36,
  },
  button_medium: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    minHeight: 44,
  },
  button_large: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.lg,
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  primary: {
    backgroundColor: DesignSystem.colors.sage[500],
  },
  secondary: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DesignSystem.colors.sage[500],
  },
  glass: {
    backgroundColor: DesignSystem.colors.background.glass,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.glass,
  },
  luxury: {
    backgroundColor: 'transparent',
  },
  minimal: {
    backgroundColor: 'transparent',
  },
  shadow: {
    ...DesignSystem.elevation.soft,
  },
  text: {
    ...DesignSystem.typography.button.medium,
    textAlign: 'center',
  },
  text_small: {
    ...DesignSystem.typography.button.small,
  },
  text_medium: {
    ...DesignSystem.typography.button.medium,
  },
  text_large: {
    ...DesignSystem.typography.button.large,
  },
  textDisabled: {
    opacity: 0.6,
  },
  textPrimary: {
    color: DesignSystem.colors.text.inverse,
  },
  textSecondary: {
    color: DesignSystem.colors.text.primary,
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
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: DesignSystem.spacing.sm,
  },
  iconLeft: {
    marginRight: DesignSystem.spacing.sm,
  },
  iconRight: {
    marginLeft: DesignSystem.spacing.sm,
  },
  gradientContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: DesignSystem.radius.md,
  },
});

// Default props
StandardButton.defaultProps = {
  variant: DEFAULT_PROPS.variant,
  size: DEFAULT_PROPS.size,
  disabled: DEFAULT_PROPS.disabled,
  loading: DEFAULT_PROPS.loading,
  hapticFeedback: DEFAULT_PROPS.hapticFeedback,
  fullWidth: DEFAULT_PROPS.fullWidth,
  iconPosition: 'left',
  shadow: true,
};

export default StandardButton;