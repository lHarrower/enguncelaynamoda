// Lightweight mock for useSafeTheme to provide expected colors shape used in components
module.exports = {
  useSafeTheme: () => ({
    colors: {
      background: { primary: '#ffffff' },
      text: { primary: '#111111', secondary: '#555555' },
      semantic: { error: '#ff4d4f' },
      primary: { 500: '#6c5ce7' },
      border: { primary: '#e5e7eb' },
      neutral: { 600: '#666666' },
      sage: { 700: '#3A5F3A' },
      success: { 500: '#5C8A5C' },
    },
  }),
};
