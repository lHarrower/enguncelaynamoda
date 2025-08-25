/**
 * Original Login Screen Styling System
 *
 * This file contains the exact styling constants for the original AynaModa login screen
 * based on the user's beloved design. These styles are independent of the current
 * theme system and maintain the clean, minimalist aesthetic from the original design.
 */

import { Platform, StyleSheet } from 'react-native';

// Turkish text constants - exactly as specified in the original design
export const TURKISH_TEXT = {
  title: 'AYNAMODA',
  welcome: 'Kişisel Sığınağınıza Hoş Geldiniz',
  subtitle: 'Stilin kesinlikle buluştuğu yer.',
  emailLabel: 'E-posta',
  passwordLabel: 'Şifre',
  loginButton: 'GİRİŞ YAP',
  forgotPassword: 'Şifrenizi mi unuttunuz?',
  continueWith: 'veya şununla devam et',
  noAccount: 'Hesabın yok mu?',
  signup: 'Kayıt Ol',
} as const;

// Color palette matching the original design
export const ORIGINAL_COLORS = {
  // Background colors
  background: '#FAFAFA', // Light gray-white main background
  backgroundGradientStart: '#FAFAFA',
  backgroundGradientEnd: '#F5F5F5',

  // Text colors
  primaryText: '#1A1A1A', // Main text color (black)
  secondaryText: '#666666', // Subtitle and secondary text (gray)
  placeholderText: '#999999', // Input placeholder and icons

  // Input and form colors
  inputBackground: '#FFFFFF', // White input background
  inputBorder: '#E0E0E0', // Light gray border
  inputBorderFocused: '#CCCCCC', // Slightly darker border on focus

  // Button colors
  primaryButton: '#1A1A1A', // Black login button
  primaryButtonText: '#FFFFFF', // White button text
  disabledButton: '#999999', // Disabled button state

  // Social button colors
  socialButtonBackground: '#FFFFFF',
  socialButtonBorder: '#E0E0E0',
  googleColor: '#DB4437', // Google red
  appleColor: '#000000', // Apple black

  // Error and validation
  errorColor: '#FF4444', // Error text color

  // Shadow colors
  shadowColor: '#000000',
} as const;

// Typography system matching the original design
export const ORIGINAL_TYPOGRAPHY = {
  // Brand title
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: ORIGINAL_COLORS.primaryText,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Welcome message
  welcome: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: ORIGINAL_COLORS.primaryText,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Subtitle
  subtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: ORIGINAL_COLORS.secondaryText,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Input text
  input: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: ORIGINAL_COLORS.primaryText,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Button text
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: ORIGINAL_COLORS.primaryButtonText,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Secondary text (forgot password, divider, etc.)
  secondary: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: ORIGINAL_COLORS.secondaryText,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Link text
  link: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: ORIGINAL_COLORS.primaryText,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Error text
  error: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: ORIGINAL_COLORS.errorColor,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
} as const;

// Spacing system for consistent layout
export const ORIGINAL_SPACING = {
  // Container padding
  containerHorizontal: 24,
  containerVertical: 60,

  // Section spacing
  brandSectionBottom: 48,
  formSectionBottom: 32,
  socialSectionBottom: 32,

  // Element spacing
  titleBottom: 24,
  welcomeBottom: 8,
  inputBottom: 16,
  errorTop: -12,
  errorBottom: 16,
  forgotPasswordBottom: 24,
  loginButtonBottom: 32,
  dividerBottom: 24,

  // Icon spacing
  iconRight: 12,

  // Social button spacing
  socialButtonGap: 16,
} as const;

// Border radius system
export const ORIGINAL_BORDER_RADIUS = {
  input: 12,
  button: 12,
  socialButton: 28, // Circular (56/2)
} as const;

// Shadow system for depth
export const ORIGINAL_SHADOWS = {
  socialButton: {
    shadowColor: ORIGINAL_COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
} as const;

// Component dimensions
export const ORIGINAL_DIMENSIONS = {
  // Input dimensions
  inputHeight: 56,
  inputMaxWidth: 400,

  // Button dimensions
  buttonHeight: 56,
  socialButtonSize: 56,

  // Icon sizes
  inputIconSize: 20,
  socialIconSize: 24,
  appleIconSize: 28, // Slightly larger for Apple icon

  // Touch targets
  passwordTogglePadding: 4,
} as const;

// Main stylesheet combining all design tokens
export const originalLoginStyles = StyleSheet.create({
  // Container styles
  container: {
    backgroundColor: ORIGINAL_COLORS.background,
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  keyboardAvoidingView: {
    flex: 1,
  },

  contentContainer: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: ORIGINAL_SPACING.containerHorizontal,
    paddingVertical: ORIGINAL_SPACING.containerVertical,
  },

  // Brand section styles
  brandSection: {
    alignItems: 'center',
    marginBottom: ORIGINAL_SPACING.brandSectionBottom,
    paddingHorizontal: 20,
  },

  title: {
    ...ORIGINAL_TYPOGRAPHY.title,
    marginBottom: ORIGINAL_SPACING.titleBottom,
    textAlign: 'center',
  },

  welcome: {
    ...ORIGINAL_TYPOGRAPHY.welcome,
    marginBottom: ORIGINAL_SPACING.welcomeBottom,
    textAlign: 'center',
  },

  subtitle: {
    ...ORIGINAL_TYPOGRAPHY.subtitle,
    textAlign: 'center',
  },

  // Form section styles
  formSection: {
    maxWidth: ORIGINAL_DIMENSIONS.inputMaxWidth,
    width: '100%',
  },

  inputContainer: {
    alignItems: 'center',
    backgroundColor: ORIGINAL_COLORS.inputBackground,
    borderColor: ORIGINAL_COLORS.inputBorder,
    borderRadius: ORIGINAL_BORDER_RADIUS.input,
    borderWidth: 1,
    flexDirection: 'row',
    height: ORIGINAL_DIMENSIONS.inputHeight,
    marginBottom: ORIGINAL_SPACING.inputBottom,
    paddingHorizontal: 16,
    position: 'relative',
    width: '100%',
  },

  inputContainerFocused: {
    borderColor: ORIGINAL_COLORS.inputBorderFocused,
  },

  inputIcon: {
    color: ORIGINAL_COLORS.placeholderText,
    marginRight: ORIGINAL_SPACING.iconRight,
  },

  input: {
    flex: 1,
    ...ORIGINAL_TYPOGRAPHY.input,
    height: '100%',
  },

  passwordToggle: {
    padding: ORIGINAL_DIMENSIONS.passwordTogglePadding,
  },

  errorText: {
    ...ORIGINAL_TYPOGRAPHY.error,
    marginBottom: ORIGINAL_SPACING.errorBottom,
    marginLeft: 4,
    marginTop: ORIGINAL_SPACING.errorTop,
  },

  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: ORIGINAL_SPACING.forgotPasswordBottom,
  },

  forgotPasswordText: {
    ...ORIGINAL_TYPOGRAPHY.secondary,
  },

  loginButton: {
    alignItems: 'center',
    backgroundColor: ORIGINAL_COLORS.primaryButton,
    borderRadius: ORIGINAL_BORDER_RADIUS.button,
    height: ORIGINAL_DIMENSIONS.buttonHeight,
    justifyContent: 'center',
    marginBottom: ORIGINAL_SPACING.loginButtonBottom,
    width: '100%',
  },

  loginButtonDisabled: {
    backgroundColor: ORIGINAL_COLORS.disabledButton,
  },

  loginButtonText: {
    ...ORIGINAL_TYPOGRAPHY.button,
  },

  // Social section styles
  socialSection: {
    alignItems: 'center',
    marginBottom: ORIGINAL_SPACING.socialSectionBottom,
    width: '100%',
  },

  dividerText: {
    ...ORIGINAL_TYPOGRAPHY.secondary,
    marginBottom: ORIGINAL_SPACING.dividerBottom,
    textAlign: 'center',
  },

  socialButtonsContainer: {
    flexDirection: 'row',
    gap: ORIGINAL_SPACING.socialButtonGap,
    justifyContent: 'center',
  },

  socialButton: {
    alignItems: 'center',
    backgroundColor: ORIGINAL_COLORS.socialButtonBackground,
    borderColor: ORIGINAL_COLORS.socialButtonBorder,
    borderRadius: ORIGINAL_BORDER_RADIUS.socialButton,
    borderWidth: 1,
    height: ORIGINAL_DIMENSIONS.socialButtonSize,
    justifyContent: 'center',
    width: ORIGINAL_DIMENSIONS.socialButtonSize,
    ...ORIGINAL_SHADOWS.socialButton,
  },

  // Registration section styles
  registrationSection: {
    alignItems: 'center',
  },

  signupPrompt: {
    ...ORIGINAL_TYPOGRAPHY.secondary,
    textAlign: 'center',
  },

  signupLink: {
    ...ORIGINAL_TYPOGRAPHY.link,
  },
});

// Validation error messages in Turkish
export const VALIDATION_MESSAGES = {
  emailRequired: 'E-posta adresi gerekli',
  emailInvalid: 'Geçerli bir e-posta adresi girin',
  passwordRequired: 'Şifre gerekli',
  passwordTooShort: 'Şifre en az 6 karakter olmalı',
} as const;

// Animation configurations for smooth interactions
export const ORIGINAL_ANIMATIONS = {
  // Button press feedback
  buttonPress: {
    scale: 0.98,
    duration: 100,
  },

  // Input focus animation
  inputFocus: {
    duration: 200,
  },

  // Error message fade in
  errorFadeIn: {
    duration: 300,
  },
} as const;

// Accessibility labels in Turkish
export const ACCESSIBILITY_LABELS = {
  emailInput: 'E-posta adresi girin',
  passwordInput: 'Şifre girin',
  passwordToggle: 'Şifreyi göster/gizle',
  loginButton: 'Giriş yap',
  googleButton: 'Google ile giriş yap',
  appleButton: 'Apple ile giriş yap',
  forgotPassword: 'Şifremi unuttum',
  signupLink: 'Kayıt ol',
} as const;
