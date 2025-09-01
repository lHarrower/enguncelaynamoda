/**
 * Sign Up Screen - Serene Registration Experience
 * Embodying "Digital Zen Garden" philosophy with confident onboarding
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

type Props = AuthStackScreenProps<'SignUp'>;

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, loading, error } = useAuth();

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Şifre Hatası', 'Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Şifre Hatası', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    try {
      await signUp(email.trim(), password, {
        name: name.trim(),
      });
    } catch (err) {
      Alert.alert('Kayıt Hatası', 'Kayıt işlemi sırasında bir hata oluştu.');
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
          <Text style={styles.welcomeText}>Stilinize Hoş Geldiniz</Text>
          <Text style={styles.subtitle}>
            AYNAMODA ailesine katılın ve kendi tarzınızı keşfedin
          </Text>
        </View>

        {/* Elegant Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Adınız ve soyadınız"
              placeholderTextColor={UNIFIED_COLORS.text.placeholder}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

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
                placeholder="En az 6 karakter"
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

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Şifre Tekrar</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Şifrenizi tekrar girin"
                placeholderTextColor={UNIFIED_COLORS.text.placeholder}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.passwordToggleText}>
                  {showConfirmPassword ? 'Gizle' : 'Göster'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms Notice */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              Kayıt olarak{' '}
              <Text style={styles.termsLink}>Kullanım Koşulları</Text>
              {' '}ve{' '}
              <Text style={styles.termsLink}>Gizlilik Politikası</Text>
              'nı kabul etmiş olursunuz.
            </Text>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.signUpButtonText}>
              {loading ? 'Kayıt Oluşturuluyor...' : 'Kayıt Ol'}
            </Text>
          </TouchableOpacity>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Zaten hesabınız var mı? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInLink}>Giriş Yapın</Text>
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
    paddingTop: SPACING.zen,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
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
  termsContainer: {
    marginBottom: SPACING.xl,
  },
  termsText: {
    ...TYPOGRAPHY.body.small,
    color: UNIFIED_COLORS.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: UNIFIED_COLORS.terracotta[600],
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: UNIFIED_COLORS.terracotta[600],
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...ELEVATION.soft,
  },
  signUpButtonDisabled: {
    backgroundColor: UNIFIED_COLORS.warmNeutral[400],
  },
  signUpButtonText: {
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    ...TYPOGRAPHY.body.medium,
    color: UNIFIED_COLORS.text.secondary,
  },
  signInLink: {
    ...TYPOGRAPHY.body.medium,
    color: UNIFIED_COLORS.terracotta[600],
    fontWeight: '600',
  },
});

export default SignUpScreen;