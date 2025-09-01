/**
 * AYNAMODA Styles Index
 * Merkezi stil sistemi export dosyası
 */

// Ana tema objesi
export { default as theme } from './theme';

// Theme provider ve utilities
export {
  ThemeProvider,
  useTheme,
  createStyles,
  getColor,
  getSpacing,
  getFontSize,
  getBorderRadius,
} from './ThemeProvider';

// Tema bileşenleri
export {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
} from './theme';

// Tip tanımları
export type Theme = typeof import('./theme').default;
export type Colors = typeof import('./theme').colors;
export type Spacing = typeof import('./theme').spacing;
export type FontSizes = typeof import('./theme').fontSizes;
export type BorderRadius = typeof import('./theme').borderRadius;