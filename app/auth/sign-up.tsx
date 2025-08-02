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
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (password !== confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Şifreler Eşleşmiyor', 'Girdiğiniz şifreler birbiriyle uyuşmuyor.');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await signUp(email, password, firstName, lastName);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Hoş Geldiniz!', 'Hesabınız başarıyla oluşturuldu. Lütfen giriş yapın.');
      router.replace('/auth/sign-in');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Kayıt Başarısız', error.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      // Assuming signInWithGoogle also handles sign-up flows
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Google ile Kayıt Başarısız', error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    setAppleLoading(true);
    try {
      // Assuming signInWithApple also handles sign-up flows
      await signInWithApple();
    } catch (error: any) {
      Alert.alert('Apple ile Kayıt Başarısız', error.message);
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
            contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 24 }]}
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
                <Ionicons name="person-outline" size={22} color="#6E7191" style={styles.inputIcon} />
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
                <Ionicons name="person-outline" size={22} color="#6E7191" style={styles.inputIcon} />
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
                <Ionicons name="lock-closed-outline" size={22} color="#6E7191" style={styles.inputIcon} />
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
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#6E7191" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={22} color="#6E7191" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifreyi Onayla"
                  placeholderTextColor="#6E7191"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#6E7191" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={isLoading}>
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
                <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignUp} disabled={isGoogleLoading || isAppleLoading}>
                  {isGoogleLoading ? (
                    <ActivityIndicator color="#DB4437" />
                  ) : (
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignUp} disabled={isGoogleLoading || isAppleLoading}>
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
              <TouchableOpacity onPress={() => router.replace('/auth/sign-in')}>
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
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  background: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: width * 1.6,
    height: width * 1.6,
    borderRadius: width * 0.8,
    backgroundColor: 'rgba(233, 213, 255, 0.4)',
    top: -width * 0.8,
    left: -width * 0.3,
  },
  circle2: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(255, 224, 230, 0.4)',
    bottom: -width * 0.6,
    right: -width * 0.3,
  },
  circle3: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: 'rgba(212, 230, 255, 0.4)',
    bottom: width * 0.05,
    left: -width * 0.4,
    opacity: 0.8,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  appName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 48,
    color: '#14142B',
    letterSpacing: 2,
  },
  welcomeText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 22,
    color: '#4E4B66',
    marginTop: 12,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#6E7191',
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#14142B',
    height: '100%',
  },
  passwordToggle: {
    padding: 4,
  },
  signUpButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 10,
  },
  signUpButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  socialLoginContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  socialLoginText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#6E7191',
    marginBottom: 20,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  signInText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#4E4B66',
  },
  signInLink: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#14142B',
  },
});

export default SignUpScreen;