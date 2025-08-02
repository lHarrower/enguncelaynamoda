/**
 * Standardized Card Component
 * 
 * A reusable card component that follows AYNAMODA's design system
 * and implements the standardized CardComponentProps interface.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { CardComponentProps, DEFAULT_PROPS } from '@/types/componentProps';
import { DesignSystem } from '@/theme/DesignSystem';

export interface StandardCardProps extends CardComponentProps {
  /** Card header content */
  header?: React.ReactNode;
  /** Card footer content */
  footer?: React.ReactNode;
  /** Card body content */
  children?: React.ReactNode;
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Card description */
  description?: string;
  /** Left icon */
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** Right icon */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  /** Right icon press handler */
  onRightIconPress?: () => void;
  /** Whether card has border */
  bordered?: boolean;
  /** Custom header style */
  headerStyle?: ViewStyle;
  /** Custom body style */
  bodyStyle?: ViewStyle;
  /** Custom footer style */
  footerStyle?: ViewStyle;
  /** Custom title style */
  titleStyle?: TextStyle;
  /** Custom subtitle style */
  subtitleStyle?: TextStyle;
  /** Custom description style */
  descriptionStyle?: TextStyle;
  /** Gradient colors for luxury variant */
  gradientColors?: string[];
  /** Blur intensity for glass variant */
  blurIntensity?: number;
}

const StandardCard: React.FC<StandardCardProps> = ({
  header,
  footer,
  children,
  title,
  subtitle,
  description,
  leftIcon,
  rightIcon,
  onRightIconPress,
  onPress,
  variant = DEFAULT_PROPS.variant,
  size = DEFAULT_PROPS.size,
  elevation = 'soft',
  bordered = false,
  disabled = DEFAULT_PROPS.disabled,
  loading = DEFAULT_PROPS.loading,
  hapticFeedback = DEFAULT_PROPS.hapticFeedback,
  style,
  headerStyle,
  bodyStyle,
  footerStyle,
  titleStyle,
  subtitleStyle,
  descriptionStyle,
  testID,
  accessibilityLabel,
  gradientColors,
  blurIntensity = 10,
  ...props
}) => {
  const handlePress = () => {
    if (disabled || loading || !onPress) return;
    
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
    
    onPress();
  };

  const getCardStyles = (): ViewStyle => {
    const baseStyle = {
      ...styles.card,
      ...styles[`card_${size}`],
      ...(bordered && styles.bordered),
      ...(disabled && styles.disabled),
      ...DesignSystem.elevation[elevation],
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
        return { ...baseStyle, ...styles.default };
    }
  };

  const renderHeader = () => {
    if (!header && !title && !subtitle && !leftIcon && !rightIcon) return null;

    return (
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerLeft}>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={size === 'small' ? 16 : size === 'medium' ? 20 : 24}
              color={DesignSystem.colors.text.primary}
              style={styles.leftIcon}
            />
          )}
          
          <View style={styles.headerText}>
            {title && (
              <Text style={[styles.title, styles[`title_${size}`], titleStyle]}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, styles[`subtitle_${size}`], subtitleStyle]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            disabled={disabled}
          >
            <Ionicons
              name={rightIcon}
              size={size === 'small' ? 16 : size === 'medium' ? 20 : 24}
              color={DesignSystem.colors.text.secondary}
            />
          </TouchableOpacity>
        )}
        
        {header}
      </View>
    );
  };

  const renderBody = () => {
    if (!children && !description) return null;

    return (
      <View style={[styles.body, bodyStyle]}>
        {description && (
          <Text style={[styles.description, styles[`description_${size}`], descriptionStyle]}>
            {description}
          </Text>
        )}
        {children}
      </View>
    );
  };

  const renderFooter = () => {
    if (!footer) return null;

    return (
      <View style={[styles.footer, footerStyle]}>
        {footer}
      </View>
    );
  };

  const cardStyle = [getCardStyles(), style];
  const shouldUseGradient = variant === 'luxury' || gradientColors;
  const shouldUseBlur = variant === 'glass';
  const finalGradientColors = gradientColors || [
    DesignSystem.colors.sage[500],
    DesignSystem.colors.sage[600],
  ];

  const cardContent = (
    <>
      {renderHeader()}
      {renderBody()}
      {renderFooter()}
    </>
  );

  if (shouldUseBlur) {
    const CardWrapper = onPress ? TouchableOpacity : View;
    return (
      <CardWrapper
        onPress={onPress ? handlePress : undefined}
        disabled={disabled || loading}
        style={cardStyle}
        testID={testID}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityState={{ disabled: disabled || loading }}
        {...props}
      >
        <BlurView intensity={blurIntensity} style={styles.blurContainer}>
          {cardContent}
        </BlurView>
      </CardWrapper>
    );
  }

  if (shouldUseGradient) {
    const CardWrapper = onPress ? TouchableOpacity : View;
    return (
      <CardWrapper
        onPress={onPress ? handlePress : undefined}
        disabled={disabled || loading}
        style={cardStyle}
        testID={testID}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityState={{ disabled: disabled || loading }}
        {...props}
      >
        <LinearGradient
          colors={finalGradientColors}
          style={styles.gradientContainer}
        >
          {cardContent}
        </LinearGradient>
      </CardWrapper>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        style={cardStyle}
        testID={testID}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
        {...props}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={cardStyle}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      {...props}
    >
      {cardContent}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
  },
  card_small: {
    padding: DesignSystem.spacing.sm,
  },
  card_medium: {
    padding: DesignSystem.spacing.md,
  },
  card_large: {
    padding: DesignSystem.spacing.lg,
  },
  bordered: {
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  default: {
    backgroundColor: DesignSystem.colors.background.primary,
  },
  primary: {
    backgroundColor: DesignSystem.colors.sage[500],
  },
  secondary: {
    backgroundColor: DesignSystem.colors.background.secondary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
  },
  glass: {
    backgroundColor: 'transparent',
  },
  luxury: {
    backgroundColor: 'transparent',
  },
  minimal: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  leftIcon: {
    marginRight: DesignSystem.spacing.sm,
  },
  rightIconContainer: {
    padding: DesignSystem.spacing.xs,
  },
  title: {
    ...DesignSystem.typography.heading.h4,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  title_small: {
    ...DesignSystem.typography.heading.h5,
  },
  title_medium: {
    ...DesignSystem.typography.heading.h4,
  },
  title_large: {
    ...DesignSystem.typography.heading.h3,
  },
  subtitle: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
  },
  subtitle_small: {
    ...DesignSystem.typography.caption,
  },
  subtitle_medium: {
    ...DesignSystem.typography.body.small,
  },
  subtitle_large: {
    ...DesignSystem.typography.body.medium,
  },
  body: {
    flex: 1,
  },
  description: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    lineHeight: 20,
  },
  description_small: {
    ...DesignSystem.typography.body.small,
    lineHeight: 18,
  },
  description_medium: {
    ...DesignSystem.typography.body.medium,
    lineHeight: 20,
  },
  description_large: {
    ...DesignSystem.typography.body.large,
    lineHeight: 24,
  },
  footer: {
    marginTop: DesignSystem.spacing.md,
    paddingTop: DesignSystem.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.border.secondary,
  },
  blurContainer: {
    flex: 1,
    borderRadius: DesignSystem.radius.lg,
  },
  gradientContainer: {
    flex: 1,
    borderRadius: DesignSystem.radius.lg,
  },
});

// Default props
StandardCard.defaultProps = {
  variant: DEFAULT_PROPS.variant,
  size: DEFAULT_PROPS.size,
  elevation: 'soft',
  bordered: false,
  disabled: DEFAULT_PROPS.disabled,
  loading: DEFAULT_PROPS.loading,
  hapticFeedback: DEFAULT_PROPS.hapticFeedback,
  blurIntensity: 10,
};

StandardCard.displayName = 'StandardCard';

export default StandardCard;