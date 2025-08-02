/**
 * Card Molecule
 * 
 * A versatile container component that combines atoms to create
 * a cohesive content display unit with consistent styling.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { CardComponentProps } from '@/types/componentProps';
import { UNIFIED_COLORS, SPACING, ELEVATION } from '@/theme';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import Text from '@/components/atoms/Text';

export interface CardProps extends CardComponentProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'luxury';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  image?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
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
  const { triggerHaptic } = useHapticFeedback();

  const handlePress = () => {
    if (onPress && !disabled) {
      triggerHaptic('light');
      onPress();
    }
  };

  const cardStyle = [
    styles.base,
    styles[variant],
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
      {image && (
        <View style={styles.imageContainer}>
          {image}
        </View>
      )}
      
      {header && (
        <View style={styles.header}>
          {header}
        </View>
      )}
      
      {(title || subtitle) && (
        <View style={styles.titleContainer}>
          {title && (
            <Text variant="title" weight="semibold" style={styles.title}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text variant="body" color="600" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.content}>
        {children}
      </View>
      
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: SPACING.radius.large,
    backgroundColor: UNIFIED_COLORS.neutral[50],
    overflow: 'hidden',
  },
  
  // Variants
  default: {
    backgroundColor: UNIFIED_COLORS.neutral[50],
    borderWidth: 1,
    borderColor: UNIFIED_COLORS.neutral[200],
  },
  
  elevated: {
    backgroundColor: UNIFIED_COLORS.neutral[50],
    ...ELEVATION.medium,
  },
  
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: UNIFIED_COLORS.neutral[300],
  },
  
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  
  luxury: {
    backgroundColor: UNIFIED_COLORS.luxury.cream,
    borderWidth: 1,
    borderColor: UNIFIED_COLORS.luxury.gold,
    ...ELEVATION.high,
  },
  
  // Padding variants
  nonePadding: {
    padding: 0,
  },
  
  smallPadding: {
    padding: SPACING.padding.small,
  },
  
  mediumPadding: {
    padding: SPACING.padding.medium,
  },
  
  largePadding: {
    padding: SPACING.padding.large,
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  imageContainer: {
    width: '100%',
    marginBottom: SPACING.margin.small,
  },
  
  header: {
    marginBottom: SPACING.margin.small,
  },
  
  titleContainer: {
    marginBottom: SPACING.margin.medium,
  },
  
  title: {
    marginBottom: SPACING.margin.xs,
  },
  
  subtitle: {
    // Additional subtitle styling if needed
  },
  
  content: {
    flex: 1,
  },
  
  footer: {
    marginTop: SPACING.margin.medium,
    paddingTop: SPACING.padding.small,
    borderTopWidth: 1,
    borderTopColor: UNIFIED_COLORS.neutral[200],
  },
});

export default Card;
export type { CardProps };