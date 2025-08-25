/**
 * Standardized Card Component
 *
 * A reusable card component that follows AYNAMODA's design system
 * and implements the standardized CardComponentProps interface.
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';
import { CardComponentProps, DEFAULT_PROPS } from '@/types/componentProps';

export interface StandardCardProps extends Omit<CardComponentProps, 'children'> {
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
  gradientColors?: readonly [string, string, ...string[]];
  /** Blur intensity for glass variant */
  blurIntensity?: number;
  /** Size preset */
  size?: 'small' | 'medium' | 'large';
  /** Elevation level */
  elevation?: 'none' | 'soft' | 'medium' | 'high' | 'organic' | 'floating' | 'subtle' | 'large';
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
    if (disabled || loading || !onPress) {
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

    onPress();
  };

  const getCardStyles = (): ViewStyle => {
    const baseStyle = {
      ...styles.card,
      ...styles[`card_${size}`],
      ...(bordered && styles.bordered),
      ...(disabled && styles.disabled),
      ...(DesignSystem.elevation[elevation as keyof typeof DesignSystem.elevation] || {}),
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
    if (!header && !title && !subtitle && !leftIcon && !rightIcon) {
      return null;
    }

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
              <Text
                style={[
                  styles.title,
                  size === 'small'
                    ? styles.title_small
                    : size === 'medium'
                      ? styles.title_medium
                      : styles.title_large,
                  titleStyle,
                ]}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  size === 'small'
                    ? styles.subtitle_small
                    : size === 'medium'
                      ? styles.subtitle_medium
                      : styles.subtitle_large,
                  subtitleStyle,
                ]}
              >
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
    if (!children && !description) {
      return null;
    }

    return (
      <View style={[styles.body, bodyStyle]}>
        {description && (
          <Text
            style={[
              styles.description,
              styles[`description_${size}` as keyof typeof styles] as TextStyle,
              descriptionStyle,
            ]}
          >
            {description}
          </Text>
        )}
        {children}
      </View>
    );
  };

  const renderFooter = () => {
    if (!footer) {
      return null;
    }

    return <View style={[styles.footer, footerStyle]}>{footer}</View>;
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
        accessibilityRole={onPress ? 'button' : undefined}
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
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityState={{ disabled: disabled || loading }}
        {...props}
      >
        <LinearGradient colors={finalGradientColors} style={styles.gradientContainer}>
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
  blurContainer: {
    borderRadius: DesignSystem.radius.lg,
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bordered: {
    borderColor: DesignSystem.colors.border.primary,
    borderWidth: 1,
  },
  card: {
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
  },
  card_large: {
    padding: DesignSystem.spacing.lg,
  },
  card_medium: {
    padding: DesignSystem.spacing.md,
  },
  card_small: {
    padding: DesignSystem.spacing.sm,
  },
  default: {
    backgroundColor: DesignSystem.colors.background.primary,
  },
  description: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    lineHeight: 20,
  },
  description_large: {
    ...DesignSystem.typography.body.large,
    lineHeight: 24,
  },
  description_medium: {
    ...DesignSystem.typography.body.medium,
    lineHeight: 20,
  },
  description_small: {
    ...DesignSystem.typography.body.small,
    lineHeight: 18,
  },
  disabled: {
    opacity: 0.6,
  },
  footer: {
    borderTopColor: DesignSystem.colors.border.secondary,
    borderTopWidth: 1,
    marginTop: DesignSystem.spacing.md,
    paddingTop: DesignSystem.spacing.sm,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: DesignSystem.colors.border.primary,
    borderWidth: 1,
  },
  glass: {
    backgroundColor: 'transparent',
  },
  gradientContainer: {
    borderRadius: DesignSystem.radius.lg,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.sm,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  leftIcon: {
    marginRight: DesignSystem.spacing.sm,
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
  rightIconContainer: {
    padding: DesignSystem.spacing.xs,
  },
  secondary: {
    backgroundColor: DesignSystem.colors.background.secondary,
  },
  subtitle: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
  },
  subtitle_large: {
    ...DesignSystem.typography.body.medium,
  },
  subtitle_medium: {
    ...DesignSystem.typography.body.small,
  },
  subtitle_small: {
    ...DesignSystem.typography.scale.caption,
  },
  title: {
    ...DesignSystem.typography.heading.h4,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  title_large: {
    ...DesignSystem.typography.heading.h3,
  },
  title_medium: {
    ...DesignSystem.typography.heading.h4,
  },
  title_small: {
    ...DesignSystem.typography.heading.h5,
  },
});

StandardCard.displayName = 'StandardCard';

export default StandardCard;
