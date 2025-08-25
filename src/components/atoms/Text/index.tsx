/**
 * Text Atom
 *
 * The fundamental text element that ensures consistent typography
 * across the entire application following the unified design system.
 */

import React from 'react';
import { StyleSheet, Text as RNText, TextStyle } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';
import { BaseComponentProps } from '@/types/componentProps';

export interface TextProps extends Omit<BaseComponentProps, 'style'> {
  children: React.ReactNode;
  variant?: 'display' | 'headline' | 'title' | 'body' | 'label' | 'caption';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  color?:
    | 'charcoal'
    | 'slate'
    | 'light'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'success'
    | 'luxury';
  align?: 'left' | 'center' | 'right' | 'justify';
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  decoration?: 'none' | 'underline' | 'line-through';
  italic?: boolean;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  selectable?: boolean;
  style?: TextStyle;
}

const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  weight = 'regular',
  size,
  color = 'charcoal',
  align = 'left',
  transform = 'none',
  decoration = 'none',
  italic = false,
  numberOfLines,
  ellipsizeMode = 'tail',
  selectable = false,
  style,
  testID,
  accessibilityLabel,
  ...props
}) => {
  const sizeStyleKey = size === 'base' ? 'baseSize' : size;
  const textStyle = [
    styles.base,
    styles[variant],
    styles[weight],
    size && styles[sizeStyleKey as keyof typeof styles],
    getColorStyle(color),
    { textAlign: align },
    { textTransform: transform },
    getDecorationStyle(decoration),
    italic && styles.italic,
    style,
  ];

  return (
    <RNText
      style={textStyle}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      selectable={selectable}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      {...props}
    >
      {children}
    </RNText>
  );
};

const getColorStyle = (color: TextProps['color']): TextStyle => {
  switch (color) {
    case 'primary':
      return { color: DesignSystem.colors.primary[500] };
    case 'secondary':
      return { color: DesignSystem.colors.secondary[500] };
    case 'error':
      return { color: DesignSystem.colors.semantic.error };
    case 'warning':
      return { color: DesignSystem.colors.semantic.warning };
    case 'success':
      return { color: DesignSystem.colors.semantic.success };
    case 'luxury':
      return { color: DesignSystem.colors.gold[500] };
    case 'charcoal':
      return { color: DesignSystem.colors.neutral.charcoal };
    case 'slate':
      return { color: DesignSystem.colors.neutral.slate };
    case 'light':
      return { color: DesignSystem.colors.neutral[100] };
    default:
      return { color: DesignSystem.colors.neutral.charcoal };
  }
};

const getDecorationStyle = (decoration: TextProps['decoration']): TextStyle => {
  switch (decoration) {
    case 'underline':
      return { textDecorationLine: 'underline' };
    case 'line-through':
      return { textDecorationLine: 'line-through' };
    default:
      return { textDecorationLine: 'none' };
  }
};

const styles = StyleSheet.create({
  base: {
    color: DesignSystem.colors.neutral.charcoal,
    fontFamily: DesignSystem.typography.fontFamily.primary,
  },

  // Variants
  display: {
    ...DesignSystem.typography.heading.h1,
  },

  headline: {
    ...DesignSystem.typography.heading.h1,
  },

  title: {
    ...DesignSystem.typography.heading.h2,
  },

  body: {
    ...DesignSystem.typography.body.medium,
  },

  label: {
    ...DesignSystem.typography.caption.medium,
  },

  caption: {
    ...DesignSystem.typography.scale.caption,
  },

  // Weights
  light: {
    fontWeight: '300',
  },

  regular: {
    fontWeight: '400',
  },

  medium: {
    fontWeight: '500',
  },

  semibold: {
    fontWeight: '600',
  },

  bold: {
    fontWeight: '700',
  },

  // Sizes
  xs: {
    fontSize: 12,
  },

  sm: {
    fontSize: 14,
  },

  baseSize: {
    fontSize: 16,
  },

  lg: {
    fontSize: 18,
  },

  xl: {
    fontSize: 20,
  },

  '2xl': {
    fontSize: 24,
  },

  '3xl': {
    fontSize: 30,
  },

  '4xl': {
    fontSize: 36,
  },

  italic: {
    fontStyle: 'italic',
  },
});

export default Text;
