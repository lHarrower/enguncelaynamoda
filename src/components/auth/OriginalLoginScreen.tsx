import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  signup: 'Kayıt Ol'
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
    if (!email) return 'E-posta adresi gerekli';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Geçerli bir e-posta adresi girin';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Şifre gerekli';
    if (password.length < 6) return 'Şifre en az 6 karakter olmalı';
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await signIn(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Giriş Başarısız', error.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Google Giriş Başarısız', error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      await signInWithApple();
    } catch (error: any) {
      Alert.alert('Apple Giriş Başarısız', error.message);
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
                    if (emailError) setEmailError(undefined);
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
                <Ionicons name="lock-closed-outline" size={20} color="#999999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={TURKISH_TEXT.passwordLabel}
                  placeholderTextColor="#999999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError(undefined);
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
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
              <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>{TURKISH_TEXT.forgotPassword}</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                onPress={handleSignIn} 
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
                  onPress={handleGoogleSignIn} 
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
                  onPress={handleAppleSignIn} 
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
                <TouchableOpacity onPress={handleSignup}>
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
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Light gray-white background
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'System',
  },
  welcome: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'System',
  },
  formSection: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    position: 'relative',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'System',
    height: '100%',
  },
  passwordToggle: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
    fontFamily: 'System',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'System',
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  loginButtonDisabled: {
    backgroundColor: '#999999',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: 'System',
  },
  socialSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  dividerText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'System',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  registrationSection: {
    alignItems: 'center',
  },
  signupPrompt: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'System',
  },
  signupLink: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default OriginalLoginScreen;