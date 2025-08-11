// Minimal DesignSystem mock for tests that directly import it
module.exports = {
  DesignSystem: {
    colors: {
      background: { primary: '#ffffff', secondary: '#f7f7f7', elevated: '#fafafa' },
      text: { primary: '#111111', secondary: '#555555', tertiary: '#888888', inverse: '#ffffff' },
      semantic: { error: '#ff4d4f' },
      error: { 500: '#ff4d4f' },
      primary: { 500: '#6c5ce7' },
      neutral: { 50: '#fafafa', 100: '#f5f5f5', 300: '#cccccc', 400: '#b3b3b3', 500: '#999999', 600: '#666666', 700: '#333333', 900: '#111111' },
      // Additional palettes referenced across components
      inkGray: { 600: '#2C2C2C', 800: '#1F1F1F' },
      sage: { 50: '#F1F6F2', 100: '#E3EFE5', 400: '#7FB77E', 500: '#5F9E60', 600: '#4A8650', 700: '#3A5F3A' },
      sageGreen: { 500: '#5F9E60', 600: '#4A8650' },
      gold: { 300: '#F7D774', 400: '#F2C94C', 500: '#E5B33A', 600: '#C89F2B' },
      liquidGold: { 600: '#C89F2B' },
      linen: { light: '#FAF3E0', base: '#F5EBD6' },
      border: { primary: '#e5e7eb' },
      success: { 500: '#5C8A5C' },
    },
    typography: {
      fonts: {
        body: 'System',
        heading: 'System-Bold',
      },
      hero: { fontSize: 32, lineHeight: 40, fontFamily: 'System-Bold' },
      heading: {
        h1: { fontSize: 28, lineHeight: 36, fontFamily: 'System-Bold' },
        h2: { fontSize: 22, lineHeight: 30, fontFamily: 'System-Bold' },
        h3: { fontSize: 18, lineHeight: 24, fontFamily: 'System-Bold' },
      },
      body: {
        small: { fontSize: 12, lineHeight: 16, fontFamily: 'System' },
        medium: { fontSize: 14, lineHeight: 20, fontFamily: 'System' },
        large: { fontSize: 16, lineHeight: 24, fontFamily: 'System' },
      },
      caption: {
        small: { fontSize: 10, lineHeight: 14, fontFamily: 'System' },
        medium: { fontSize: 12, lineHeight: 16, fontFamily: 'System' },
        large: { fontSize: 14, lineHeight: 18, fontFamily: 'System' },
      },
      button: {
        medium: { fontSize: 16, lineHeight: 20, fontFamily: 'System-Bold' },
      },
      scale: {
        h1: { fontSize: 28, lineHeight: 36, fontFamily: 'System-Bold' },
        h2: { fontSize: 22, lineHeight: 30, fontFamily: 'System-Bold' },
        h3: { fontSize: 18, lineHeight: 24, fontFamily: 'System-Bold' },
        body1: { fontSize: 16, lineHeight: 24, fontFamily: 'System' },
        body2: { fontSize: 14, lineHeight: 20, fontFamily: 'System' },
        caption: { fontSize: 12, lineHeight: 16, fontFamily: 'System' },
        button: { fontSize: 16, lineHeight: 20, fontFamily: 'System-Bold' },
      },
      fontFamily: {
        heading: 'System-Bold',
        body: 'System',
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
      xxxl: 40,
    },
    shadows: {
      small: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
      medium: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
      large: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      medium: 10,
      large: 20,
      full: 9999,
    },
    // Alias often used by components
    radius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      organic: 18,
    },
    elevation: {
      soft: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
      whisper: { shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
      medium: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 6 },
      lift: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 7 },
      strong: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 14, elevation: 8 },
      sm: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
      md: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 6 },
    },
    effects: {
      glassmorphism: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
      },
      elevation: {
        low: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
        medium: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 6 },
      },
    },
    // Some components reference this at the root
    glassmorphism: {
      subtle: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)'
      }
    },
  },
};
