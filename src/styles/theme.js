/**
 * AYNAMODA Design System Theme
 * Merkezi tasarım sistemi - tüm renkler, fontlar ve spacing değerleri
 * Bu dosya manifestomuzla uyumlu olarak tasarlanmıştır
 */

// Ana Renk Paleti - Premium Terracotta & Cream Base
export const colors = {
  // Ana Renkler
  primary: '#C08A6B',        // Ana terracotta rengi
  secondary: '#5C8A5C',      // İkincil sage yeşili
  accent: '#D4AF37',         // Altın vurgu rengi
  
  // Arka Plan Renkleri
  background: {
    primary: '#F8F6F4',     // Ana krem arka plan
    secondary: '#F5F3F1',   // İkincil krem varyasyonu
    tertiary: '#F2F0EE',    // Açık krem
    elevated: '#FFFFFF',    // Kartlar için beyaz
    overlay: 'rgba(0,0,0,0.4)', // Modal overlay
  },
  
  // Terracotta Paleti
  terracotta: {
    50: '#FDF8F6',
    100: '#F9F0EC',
    200: '#F2DDD4',
    300: '#E8C4B5',
    400: '#D4A084',
    500: '#C08A6B',   // Ana terracotta
    600: '#A67152',
    700: '#8B5A3C',
    800: '#6B4429',
    900: '#4A2F1C',
  },
  
  // Sage Yeşil Paleti
  sage: {
    50: '#F6F8F6',
    100: '#E8F0E8',
    200: '#D1E1D1',
    300: '#A8C8A8',
    400: '#7FA87F',
    500: '#5C8A5C',   // Ana sage
    600: '#4A7A4A',
    700: '#3A5F3A',
    800: '#2A4F2A',
    900: '#1A3F1A',
  },
  
  // Sıcak Nötr Renkler
  warmNeutral: {
    50: '#FDFCFB',
    100: '#F8F6F4',
    200: '#F0EDE9',
    300: '#E6E1DB',
    400: '#D4CCC2',
    500: '#B8ADA0',
    600: '#9A8B7A',
    700: '#7A6B5A',
    800: '#5A4D3F',
    900: '#3D332A',
  },
  
  // Altın Paleti
  gold: {
    100: '#FFF9E6',
    200: '#F2EDE4',
    300: '#FFE599',
    400: '#F0D666',
    500: '#D4AF37',   // Ana altın
    600: '#B8993F',
    700: '#9C7A0F',
    800: '#5A4235',
    900: '#3A2B23',
  },
  
  // Sistem Renkleri
  success: '#5C8A5C',
  warning: '#D4AF37',
  error: '#D32F2F',
  info: '#1976D2',
  
  // Metin Renkleri
  text: {
    primary: '#3D332A',      // Ana metin
    secondary: '#7A6B5A',    // İkincil metin
    tertiary: '#B8ADA0',     // Üçüncül metin
    inverse: '#FFFFFF',      // Ters metin (koyu arka plan üzerinde)
    disabled: '#D4CCC2',     // Devre dışı metin
  },
  
  // Kenarlık Renkleri
  border: {
    light: '#F0EDE9',
    medium: '#E6E1DB',
    dark: '#D4CCC2',
  },
};

// Font Aileleri
export const fonts = {
  primary: 'System',           // Ana font ailesi
  secondary: 'System',         // İkincil font ailesi
  mono: 'Courier New',         // Monospace font
};

// Font Büyüklükleri
export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
  '6xl': 48,
};

// Font Ağırlıkları
export const fontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

// Satır Yükseklikleri
export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
};

// Boşluk Değerleri (4px tabanlı sistem)
export const spacing = {
  0: 0,
  1: 4,     // 4px
  2: 8,     // 8px
  3: 12,    // 12px
  4: 16,    // 16px
  5: 20,    // 20px
  6: 24,    // 24px
  8: 32,    // 32px
  10: 40,   // 40px
  12: 48,   // 48px
  16: 64,   // 64px
  20: 80,   // 80px
  24: 96,   // 96px
  32: 128,  // 128px
};

// Kenarlık Yarıçapları
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Gölge Değerleri
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Animasyon Süreleri
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Breakpoint'ler (responsive tasarım için)
export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Tam tema objesi
export const theme = {
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
};

// Default export
export default theme;