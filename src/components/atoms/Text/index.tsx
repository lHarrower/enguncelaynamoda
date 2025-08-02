/**
 * Text Atom
 * 
 * The fundamental text element that ensures consistent typography
 * across the entire application following the unified design system.
 */

import React from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { BaseComponentProps } from '@/types/componentProps';
import { UNIFIED_COLORS, TYPOGRAPHY } from '@/theme';

export interface TextProps extends BaseComponentProps {
  children: React.ReactNode;
  variant?: 'display' | 'headline' | 'title' | 'body' | 'label' | 'caption';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  color?: keyof typeof UNIFIED_COLORS.neutral | 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'luxury';
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
  color = '900',
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
  const textStyle = [
    styles.base,
    styles[variant],
    styles[weight],
    size && styles[size],
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
      return { color: UNIFIED_COLORS.primary[500] };
    case 'secondary':
      return { color: UNIFIED_COLORS.secondary[500] };
    case 'error':
      return { color: UNIFIED_COLORS.semantic.error };
    case 'warning':
      return { color: UNIFIED_COLORS.semantic.warning };
    case 'success':
      return { color: UNIFIED_COLORS.semantic.success };
    case 'luxury':
      return { color: UNIFIED_COLORS.luxury.gold };
    default:
      return { color: UNIFIED_COLORS.neutral[color as keyof typeof UNIFIED_COLORS.neutral] };
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
    fontFamily: TYPOGRAPHY.fontFamily.primary,
    color: UNIFIED_COLORS.neutral[900],
  },
  
  // Variants
  display: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  },
  
  headline: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  },
  
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    lineHeight: TYPOGRAPHY.lineHeight.snug,
  },
  
  body: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  
  caption: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  
  // Weights
  light: {
    fontWeight: TYPOGRAPHY.fontWeight.light,
  },
  
  regular: {
    fontWeight: TYPOGRAPHY.fontWeight.regular,
  },
  
  medium: {
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  
  semibold: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  
  bold: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  
  // Sizes
  xs: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  
  sm: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  
  base: {
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  
  lg: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  
  xl: {
    fontSize: TYPOGRAPHY.fontSize.xl,
  },
  
  '2xl': {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
  },
  
  '3xl': {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
  },
  
  '4xl': {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
  },
  
  italic: {
    fontStyle: 'italic',
  },
});

export default Text;
export type { TextProps };