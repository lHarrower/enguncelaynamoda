/**
 * Login Screen - Calm & Elegant Authentication
 * Embodying "Digital Zen Garden" philosophy with serene confidence
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { AuthStackScreenProps } from '@/navigation/types';
import { UNIFIED_COLORS, TYPOGRAPHY, SPACING, ELEVATION } from '@/theme/DesignSystem';
import { useAuth } from '@/hooks/useAuth';

type Props = AuthStackScreenProps<'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, error } = useAuth();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    try {
      await signIn(email.trim(), password);
    } catch (err) {
      Alert.alert('Giriş Hatası', 'E-posta veya şifre hatalı.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Serene Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hoş Geldiniz</Text>
          <Text style={styles.subtitle}>
            Stilinizin huzurlu yolculuğuna devam edin
          </Text>
        </View>

        {/* Elegant Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>E-posta</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@email.com"
              placeholderTextColor={UNIFIED_COLORS.text.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Şifre</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Şifrenizi girin"
                placeholderTextColor={UNIFIED_COLORS.text.placeholder}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.passwordToggleText}>
                  {showPassword ? 'Gizle' : 'Göster'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInButton, loading && styles.signInButtonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.signInButtonText}>
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Text>
          </TouchableOpacity>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Hesabınız yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpLink}>Kayıt Olun</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UNIFIED_COLORS.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sanctuary,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.zen,
  },
  welcomeText: {
    ...TYPOGRAPHY.heading.h1,
    color: UNIFIED_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    ...TYPOGRAPHY.body.medium,
    color: UNIFIED_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    backgroundColor: UNIFIED_COLORS.background.elevated,
    borderRadius: 16,
    padding: SPACING.xl,
    ...ELEVATION.soft,
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TYPOGRAPHY.body.small,
    color: UNIFIED_COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  input: {
    ...TYPOGRAPHY.body.medium,
    backgroundColor: UNIFIED_COLORS.background.secondary,
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: UNIFIED_COLORS.text.primary,
    borderWidth: 1,
    borderColor: UNIFIED_COLORS.border.primary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UNIFIED_COLORS.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UNIFIED_COLORS.border.primary,
  },
  passwordInput: {
    ...TYPOGRAPHY.body.medium,
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: UNIFIED_COLORS.text.primary,
  },
  passwordToggle: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  passwordToggleText: {
    ...TYPOGRAPHY.body.small,
    color: UNIFIED_COLORS.terracotta[600],
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotPasswordText: {
    ...TYPOGRAPHY.body.small,
    color: UNIFIED_COLORS.terracotta[600],
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: UNIFIED_COLORS.terracotta[600],
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...ELEVATION.soft,
  },
  signInButtonDisabled: {
    backgroundColor: UNIFIED_COLORS.warmNeutral[400],
  },
  signInButtonText: {
    ...TYPOGRAPHY.button.medium,
    color: UNIFIED_COLORS.text.inverse,
  },
  errorContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: UNIFIED_COLORS.error[100],
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: UNIFIED_COLORS.error[500],
  },
  errorText: {
    ...TYPOGRAPHY.body.small,
    color: UNIFIED_COLORS.error[700],
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    ...TYPOGRAPHY.body.medium,
    color: UNIFIED_COLORS.text.secondary,
  },
  signUpLink: {
    ...TYPOGRAPHY.body.medium,
    color: UNIFIED_COLORS.terracotta[600],
    fontWeight: '600',
  },
});

export default LoginScreen;