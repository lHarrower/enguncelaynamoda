/**
 * AYNAMODA Brand Colors
 * Fotoğraftaki tasarıma uygun premium renk paleti
 * Terracotta, krem ve kahverengi tonları ile modern gradient'ler
 */

export const AynamodaColors = {
  // Primary Brand Colors - Fotoğraftaki ana renkler
  primary: {
    50: '#FDF8F6',
    100: '#F7E6E1',
    200: '#EFCCC3',
    300: '#E5A898',
    400: '#D4826B',
    500: '#C4654F', // Ana terracotta
    600: '#B8553F',
    700: '#9A4434',
    800: '#7F3A30',
    900: '#6A322A',
    // Ek özellikler - geriye dönük uyumluluk için
    main: '#C4654F',
    terracotta: '#C4654F',
    rust: '#B8553F',
  },

  // Secondary - Krem ve bej tonları
  secondary: {
    50: '#FEFDFB',
    100: '#FBF8F3',
    200: '#F5F1E8', // Ana krem
    300: '#EDE6D8',
    400: '#E3D5C1',
    500: '#D4C0A1',
    600: '#C4A882',
    700: '#B8956B',
    800: '#9A7A56',
    900: '#7D6347',
  },

  // Neutral - Kahverengi tonları
  neutral: {
    50: '#FAFAF9',
    100: '#F4F4F3',
    200: '#E5E5E4',
    300: '#D1D1CF',
    400: '#B3B3B1',
    500: '#8B8B89',
    600: '#6B6B69', // Koyu kahverengi
    700: '#4A4A48',
    800: '#2C2C2B',
    900: '#1A1A19',
  },

  // Accent Colors - Vurgu renkleri
  accent: {
    gold: '#D4AF37',
    rose: '#E8B4B8',
    sage: '#A8B5A0',
    cream: '#F7F3E9',
  },

  // Functional Colors
  success: {
    50: '#F0F9F0',
    500: '#22C55E',
    600: '#16A34A',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
  },
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
  },

  // Background Colors
  background: {
    primary: '#FEFDFB', // Ana arka plan
    secondary: '#F5F1E8', // İkincil arka plan
    tertiary: '#EFEBE2', // Üçüncül arka plan
    elevated: '#FFFFFF', // Yükseltilmiş kartlar
    overlay: 'rgba(44, 44, 43, 0.6)', // Modal overlay
    card: '#FFFFFF', // Kart arka planı
  },

  // Text Colors
  text: {
    primary: '#1A1A19', // Ana metin
    secondary: '#4A4A48', // İkincil metin
    tertiary: '#6B6B69', // Üçüncül metin
    inverse: '#FFFFFF', // Ters metin
    accent: '#C4654F', // Vurgu metni
    muted: '#8B8B89', // Soluk metin
  },

  // Border Colors
  border: {
    primary: '#E5E5E4',
    secondary: '#D1D1CF',
    accent: '#E3D5C1',
    focus: '#C4654F',
  },

  // Gradient Definitions - Fotoğraftaki gradient'ler
  gradients: {
    primary: ['#C4654F', '#D4826B'] as const,
    secondary: ['#F5F1E8', '#EDE6D8'] as const,
    warm: ['#FDF8F6', '#F7E6E1'] as const,
    neutral: ['#FAFAF9', '#F4F4F3'] as const,
    sunset: ['#D4826B', '#E5A898', '#F7E6E1'] as const,
    earth: ['#7D6347', '#9A7A56', '#C4A882'] as const,
    cream: ['#FEFDFB', '#F5F1E8', '#EDE6D8'] as const,
  },

  // Shadow Colors
  shadow: {
    light: 'rgba(26, 26, 25, 0.08)',
    medium: 'rgba(26, 26, 25, 0.12)',
    heavy: 'rgba(26, 26, 25, 0.16)',
    colored: 'rgba(196, 101, 79, 0.15)',
  },

  // Glass Effect Colors
  glass: {
    background: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(255, 255, 255, 0.3)',
    shadow: 'rgba(26, 26, 25, 0.1)',
  },
};

// Semantic Color Mappings
export const SemanticColors = {
  // Card Colors
  card: {
    background: AynamodaColors.background.elevated,
    border: AynamodaColors.border.primary,
    shadow: AynamodaColors.shadow.light,
  },

  // Button Colors
  button: {
    primary: {
      background: AynamodaColors.primary[500],
      text: AynamodaColors.text.inverse,
      border: AynamodaColors.primary[600],
    },
    secondary: {
      background: AynamodaColors.secondary[200],
      text: AynamodaColors.text.primary,
      border: AynamodaColors.border.accent,
    },
    ghost: {
      background: 'transparent',
      text: AynamodaColors.text.accent,
      border: AynamodaColors.border.accent,
    },
  },

  // Input Colors
  input: {
    background: AynamodaColors.background.elevated,
    border: AynamodaColors.border.secondary,
    focusBorder: AynamodaColors.border.focus,
    text: AynamodaColors.text.primary,
    placeholder: AynamodaColors.text.tertiary,
  },

  // Navigation Colors
  navigation: {
    background: AynamodaColors.background.elevated,
    border: AynamodaColors.border.primary,
    activeTab: AynamodaColors.primary[500],
    inactiveTab: AynamodaColors.text.tertiary,
  },
};

export default AynamodaColors;
