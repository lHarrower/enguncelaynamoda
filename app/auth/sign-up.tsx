import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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

const { width, height } = Dimensions.get('window');

const SignUpScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const [isAppleLoading, setAppleLoading] = useState(false);

  const { signUp, signInWithGoogle, signInWithApple } = useAuth();

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (password !== confirmPassword) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Şifreler Eşleşmiyor', 'Girdiğiniz şifreler birbiriyle uyuşmuyor.');
      return;
    }

    setIsLoading(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await signUp(email, password, firstName, lastName);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Hoş Geldiniz!', 'Hesabınız başarıyla oluşturuldu. Lütfen giriş yapın.');
      router.replace('/auth/sign-in');
    } catch (error: unknown) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Kayıt Başarısız', error instanceof Error ? error.message : 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      // Assuming signInWithGoogle also handles sign-up flows
      await signInWithGoogle();
    } catch (error: unknown) {
      Alert.alert(
        'Google ile Kayıt Başarısız',
        error instanceof Error ? error.message : 'Bir hata oluştu.',
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    setAppleLoading(true);
    try {
      // Assuming signInWithApple also handles sign-up flows
      await signInWithApple();
    } catch (error: unknown) {
      Alert.alert(
        'Apple ile Kayıt Başarısız',
        error instanceof Error ? error.message : 'Bir hata oluştu.',
      );
    } finally {
      setAppleLoading(false);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={[StyleSheet.absoluteFill, styles.background]}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={[
              styles.contentContainer,
              { paddingBottom: insets.bottom > 0 ? insets.bottom : 24 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.appName}>AYNAMODA</Text>
              <Text style={styles.welcomeText}>Hesabınızı Oluşturun</Text>
              <Text style={styles.tagline}>Ayrıcalıklı moda dünyasına katılın.</Text>
            </View>

            {/* Form */}
            <BlurView intensity={70} tint="light" style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={22}
                  color="#6E7191"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ad"
                  placeholderTextColor="#6E7191"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={22}
                  color="#6E7191"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Soyad"
                  placeholderTextColor="#6E7191"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={22} color="#6E7191" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta"
                  placeholderTextColor="#6E7191"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#6E7191"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Şifre"
                  placeholderTextColor="#6E7191"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#6E7191"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#6E7191"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Şifreyi Onayla"
                  placeholderTextColor="#6E7191"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={() => void handleSignUp()}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#6E7191"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => void handleSignUp()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.signUpButtonText}>KAYIT OL</Text>
                )}
              </TouchableOpacity>
            </BlurView>

            {/* Social Logins */}
            <View style={styles.socialLoginContainer}>
              <Text style={styles.socialLoginText}>veya şununla devam et</Text>
              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => void handleGoogleSignUp()}
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
                  onPress={() => void handleAppleSignUp()}
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

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Zaten hesabın var mı? </Text>
              <TouchableOpacity
                onPress={() => router.replace('/auth/sign-in')}
                accessibilityRole="button"
                accessibilityLabel="Go to sign in"
                accessibilityHint="Navigate to the sign in screen"
              >
                <Text style={styles.signInLink}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  appName: {
    color: '#14142B',
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 48,
    letterSpacing: 2,
  },
  background: {
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  circle1: {
    backgroundColor: 'rgba(233, 213, 255, 0.4)',
    borderRadius: width * 0.8,
    height: width * 1.6,
    left: -width * 0.3,
    position: 'absolute',
    top: -width * 0.8,
    width: width * 1.6,
  },
  circle2: {
    backgroundColor: 'rgba(255, 224, 230, 0.4)',
    borderRadius: width * 0.6,
    bottom: -width * 0.6,
    height: width * 1.2,
    position: 'absolute',
    right: -width * 0.3,
    width: width * 1.2,
  },
  circle3: {
    backgroundColor: 'rgba(212, 230, 255, 0.4)',
    borderRadius: width * 0.5,
    bottom: width * 0.05,
    height: width,
    left: -width * 0.4,
    opacity: 0.8,
    position: 'absolute',
    width: width,
  },
  container: {
    backgroundColor: '#F7F7F7',
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  formContainer: {
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    padding: 24,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  input: {
    color: '#14142B',
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    height: '100%',
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    flexDirection: 'row',
    height: 56,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  passwordToggle: {
    padding: 4,
  },
  safeArea: {
    flex: 1,
  },
  signInContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signInLink: {
    color: '#14142B',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  signInText: {
    color: '#4E4B66',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  signUpButton: {
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 12,
    elevation: 5,
    height: 56,
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    elevation: 3,
    height: 64,
    justifyContent: 'center',
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: 64,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialLoginContainer: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  socialLoginText: {
    color: '#6E7191',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    marginBottom: 20,
  },
  tagline: {
    color: '#6E7191',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  welcomeText: {
    color: '#4E4B66',
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 22,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default SignUpScreen;
