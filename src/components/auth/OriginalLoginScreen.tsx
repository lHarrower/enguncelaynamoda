import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';

// Turkish text constants - exactly as specified
const TURKISH_TEXT = {
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

interface OriginalLoginScreenProps {
  onLogin?: (email: string, password: string) => void;
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
  onForgotPassword?: () => void;
  onSignup?: () => void;
  loading?: boolean;
  error?: string;
}

const OriginalLoginScreen: React.FC<OriginalLoginScreenProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const [isAppleLoading, setAppleLoading] = useState(false);
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();

  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const insets = useSafeAreaInsets();

  // Form validation
  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return 'E-posta adresi gerekli';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Geçerli bir e-posta adresi girin';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Şifre gerekli';
    }
    if (password.length < 6) {
      return 'Şifre en az 6 karakter olmalı';
    }
    return undefined;
  };

  const handleSignIn = async () => {
    // Clear previous errors
    setEmailError(undefined);
    setPasswordError(undefined);

    // Validate form
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    if (emailErr || passwordErr) {
      setEmailError(emailErr);
      setPasswordError(passwordErr);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setIsLoading(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await signIn(email, password);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: unknown) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Giriş Başarısız', error instanceof Error ? error.message : 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: unknown) {
      Alert.alert(
        'Google Giriş Başarısız',
        error instanceof Error ? error.message : 'Bir hata oluştu.',
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      await signInWithApple();
    } catch (error: unknown) {
      Alert.alert(
        'Apple Giriş Başarısız',
        error instanceof Error ? error.message : 'Bir hata oluştu.',
      );
    } finally {
      setAppleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Şifremi Unuttum', 'Bu özellik yakında gelecek!');
  };

  const handleSignup = () => {
    router.push('/auth/sign-up');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Brand Section */}
            <View style={styles.brandSection}>
              <Text style={styles.title}>{TURKISH_TEXT.title}</Text>
              <Text style={styles.welcome}>{TURKISH_TEXT.welcome}</Text>
              <Text style={styles.subtitle}>{TURKISH_TEXT.subtitle}</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#999999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={TURKISH_TEXT.emailLabel}
                  placeholderTextColor="#999999"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) {
                      setEmailError(undefined);
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>
              {emailError && <Text style={styles.errorText}>{emailError}</Text>}

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#999999"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={TURKISH_TEXT.passwordLabel}
                  placeholderTextColor="#999999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) {
                      setPasswordError(undefined);
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={() => void handleSignIn()}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#999999"
                  />
                </TouchableOpacity>
              </View>
              {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => void handleForgotPassword()}
              >
                <Text style={styles.forgotPasswordText}>{TURKISH_TEXT.forgotPassword}</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={() => void handleSignIn()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>{TURKISH_TEXT.loginButton}</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Social Login Section */}
            <View style={styles.socialSection}>
              <Text style={styles.dividerText}>{TURKISH_TEXT.continueWith}</Text>
              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => void handleGoogleSignIn()}
                  disabled={isGoogleLoading || isAppleLoading}
                >
                  {isGoogleLoading ? (
                    <ActivityIndicator color="#DB4437" />
                  ) : (
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => void handleAppleSignIn()}
                  disabled={isGoogleLoading || isAppleLoading}
                >
                  {isAppleLoading ? (
                    <ActivityIndicator color="#000000" />
                  ) : (
                    <Ionicons name="logo-apple" size={28} color="#000000" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Registration Section */}
            <View style={[styles.registrationSection, { marginBottom: insets.bottom || 24 }]}>
              <Text style={styles.signupPrompt}>
                {TURKISH_TEXT.noAccount}{' '}
                <TouchableOpacity
                  onPress={handleSignup}
                  accessibilityRole="button"
                  accessibilityLabel="Kayıt Ol"
                  accessibilityHint="Kayıt olma ekranına git"
                >
                  <Text style={styles.signupLink}>{TURKISH_TEXT.signup}</Text>
                </TouchableOpacity>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  brandSection: {
    alignItems: 'center',
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#FAFAFA',
    flex: 1, // Light gray-white background
  },
  contentContainer: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  dividerText: {
    color: '#999999',
    fontFamily: 'System',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF4444',
    fontFamily: 'System',
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 4,
    marginTop: -12,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#666666',
    fontFamily: 'System',
    fontSize: 14,
  },
  formSection: {
    maxWidth: 400,
    width: '100%',
  },
  input: {
    color: '#1A1A1A',
    flex: 1,
    fontFamily: 'System',
    fontSize: 16,
    height: '100%',
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    height: 56,
    marginBottom: 16,
    paddingHorizontal: 16,
    position: 'relative',
    width: '100%',
  },
  inputIcon: {
    marginRight: 12,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    marginBottom: 32,
    width: '100%',
  },
  loginButtonDisabled: {
    backgroundColor: '#999999',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  passwordToggle: {
    padding: 4,
  },
  registrationSection: {
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  signupLink: {
    color: '#1A1A1A',
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
  },
  signupPrompt: {
    color: '#666666',
    fontFamily: 'System',
    fontSize: 14,
    textAlign: 'center',
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderRadius: 28,
    borderWidth: 1,
    elevation: 2,
    height: 56,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 56,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  socialSection: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  subtitle: {
    color: '#666666',
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  title: {
    color: '#1A1A1A',
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 24,
    textAlign: 'center',
  },
  welcome: {
    color: '#1A1A1A',
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default OriginalLoginScreen;
