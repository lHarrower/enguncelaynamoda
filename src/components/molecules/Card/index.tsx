/**
 * Card Molecule
 *
 * A versatile container component that combines atoms to create
 * a cohesive content display unit with consistent styling.
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import Text from '@/components/atoms/Text';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { ELEVATION, SPACING, UNIFIED_COLORS } from '@/theme';
import { CardComponentProps } from '@/types/componentProps';

export interface CardProps extends Omit<CardComponentProps, 'variant'> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'luxury' | 'floating' | 'minimal';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  image?: React.ReactNode;
}

const Card: React.FC<CardProps> = React.memo(
  ({
    children,
    title,
    subtitle,
    variant = 'default',
    padding = 'medium',
    onPress,
    disabled = false,
    header,
    footer,
    image,
    style,
    testID,
    accessibilityLabel,
    ...props
  }) => {
    const { trigger } = useHapticFeedback();

    const handlePress = () => {
      if (onPress && !disabled) {
        trigger('light');
        onPress();
      }
    };

    const cardStyle = [
      styles.base,
      styles[variant as keyof typeof styles],
      styles[`${padding}Padding`],
      disabled && styles.disabled,
      style,
    ];

    const CardContainer = onPress ? TouchableOpacity : View;

    return (
      <CardContainer
        style={cardStyle}
        onPress={handlePress}
        disabled={disabled}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={onPress ? 'button' : undefined}
        {...props}
      >
        {image && <View style={styles.imageContainer}>{image}</View>}

        {header && <View style={styles.header}>{header}</View>}

        {(title || subtitle) && (
          <View style={styles.titleContainer}>
            {title && (
              <Text variant="title" weight="semibold" style={styles.title}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text variant="body" color="slate" style={styles.subtitle}>
                {subtitle}
              </Text>
            )}
          </View>
        )}

        <View style={styles.content}>{children}</View>

        {footer && <View style={styles.footer}>{footer}</View>}
      </CardContainer>
    );
  },
);

const styles = StyleSheet.create({
  base: {
    backgroundColor: UNIFIED_COLORS.neutral[50],
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Variants
  default: {
    backgroundColor: UNIFIED_COLORS.neutral[50],
    borderColor: UNIFIED_COLORS.neutral[200],
    borderWidth: 1,
  },

  elevated: {
    backgroundColor: UNIFIED_COLORS.neutral[50],
    ...ELEVATION.medium,
  },

  outlined: {
    backgroundColor: 'transparent',
    borderColor: UNIFIED_COLORS.neutral[300],
    borderWidth: 2,
  },

  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    // backdropFilter not supported in React Native; effect handled via BlurView wrappers elsewhere
  },

  luxury: {
    backgroundColor: UNIFIED_COLORS.background.primary,
    borderColor: UNIFIED_COLORS.gold[400],
    borderWidth: 1,
    ...ELEVATION.high,
  },

  // Padding variants
  nonePadding: {
    padding: 0,
  },

  smallPadding: {
    padding: SPACING.small,
  },

  mediumPadding: {
    padding: SPACING.medium,
  },

  largePadding: {
    padding: SPACING.large,
  },

  disabled: {
    opacity: 0.5,
  },

  imageContainer: {
    marginBottom: SPACING.small,
    width: '100%',
  },

  header: {
    marginBottom: SPACING.small,
  },

  titleContainer: {
    marginBottom: SPACING.medium,
  },

  title: {
    marginBottom: SPACING.xs,
  },

  subtitle: {
    // Additional subtitle styling if needed
  },

  content: {
    flex: 1,
  },

  footer: {
    borderTopColor: UNIFIED_COLORS.neutral[200],
    borderTopWidth: 1,
    marginTop: SPACING.medium,
    paddingTop: SPACING.small,
  },
});

export default Card;
