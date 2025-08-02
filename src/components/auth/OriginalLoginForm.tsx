/**
 * Original Login Form Component
 * 
 * A complete login form that matches the original AynaModa design.
 * Combines email and password inputs with proper validation and Turkish error messages.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { OriginalInput } from '@/components/auth/OriginalInput';
import {
  originalLoginStyles,
  TURKISH_TEXT,
  VALIDATION_MESSAGES,
  ORIGINAL_COLORS,
  ACCESSIBILITY_LABELS,
} from '@/components/auth/originalLoginStyles';

export interface OriginalLoginFormProps {
  /** Callback when login is attempted */
  onLogin: (email: string, password: string) => Promise<void>;
  
  /** Whether the form is currently loading */
  loading?: boolean;
  
  /** Error message to display */
  error?: string;
  
  /** Callback when forgot password is pressed */
  onForgotPassword?: () => void;
}

export const OriginalLoginForm: React.FC<OriginalLoginFormProps> = ({
  onLogin,
  loading = false,
  error,
  onForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return VALIDATION_MESSAGES.emailRequired;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return VALIDATION_MESSAGES.emailInvalid;
    }
    
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return VALIDATION_MESSAGES.passwordRequired;
    }
    
    if (password.length < 6) {
      return VALIDATION_MESSAGES.passwordTooShort;
    }
    
    return undefined;
  };

  const validateForm = (): boolean => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    return !emailErr && !passwordErr;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Clear email error when user starts typing
    if (emailError) {
      setEmailError(undefined);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    // Clear password error when user starts typing
    if (passwordError) {
      setPasswordError(undefined);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onLogin(email.trim(), password);
    } catch (err: any) {
      // Error handling is done by parent component
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      Alert.alert(
        'Şifremi Unuttum',
        'Şifre sıfırlama özelliği yakında gelecek!',
        [{ text: 'Tamam' }]
      );
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <View style={styles.container}>
      {/* Global Error Message */}
      {error && (
        <View style={styles.globalErrorContainer}>
          <Text style={styles.globalErrorText}>{error}</Text>
        </View>
      )}

      {/* Email Input */}
      <OriginalInput
        leftIcon="mail-outline"
        placeholder={TURKISH_TEXT.emailLabel}
        value={email}
        onChangeText={handleEmailChange}
        error={emailError}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="next"
        editable={!isLoading}
        accessibilityLabel={ACCESSIBILITY_LABELS.emailInput}
      />

      {/* Password Input */}
      <OriginalInput
        leftIcon="lock-closed-outline"
        placeholder={TURKISH_TEXT.passwordLabel}
        value={password}
        onChangeText={handlePasswordChange}
        error={passwordError}
        isPassword
        autoComplete="password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        editable={!isLoading}
        accessibilityLabel={ACCESSIBILITY_LABELS.passwordInput}
      />

      {/* Forgot Password Link */}
      <TouchableOpacity
        style={styles.forgotPasswordButton}
        onPress={handleForgotPassword}
        disabled={isLoading}
        accessibilityLabel={ACCESSIBILITY_LABELS.forgotPassword}
        accessibilityRole="button"
      >
        <Text style={[
          styles.forgotPasswordText,
          isLoading && styles.disabledText
        ]}>
          {TURKISH_TEXT.forgotPassword}
        </Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={[
          styles.loginButton,
          isLoading && styles.loginButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={isLoading}
        accessibilityLabel={ACCESSIBILITY_LABELS.loginButton}
        accessibilityRole="button"
      >
        {isLoading ? (
          <ActivityIndicator 
            color={ORIGINAL_COLORS.primaryButtonText} 
            size="small"
          />
        ) : (
          <Text style={styles.loginButtonText}>
            {TURKISH_TEXT.loginButton}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
  },

  globalErrorContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: ORIGINAL_COLORS.errorColor,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  globalErrorText: {
    color: ORIGINAL_COLORS.errorColor,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },

  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  forgotPasswordText: {
    ...originalLoginStyles.forgotPasswordText,
  },

  disabledText: {
    opacity: 0.5,
  },

  loginButton: {
    ...originalLoginStyles.loginButton,
  },

  loginButtonDisabled: {
    ...originalLoginStyles.loginButtonDisabled,
  },

  loginButtonText: {
    ...originalLoginStyles.loginButtonText,
  },
});

export default OriginalLoginForm;