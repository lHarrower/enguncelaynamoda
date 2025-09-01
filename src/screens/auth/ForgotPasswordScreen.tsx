/**
 * Forgot Password Screen
 * Password recovery screen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthStackScreenProps } from '@/navigation/types';
import { UNIFIED_COLORS } from '@/theme/DesignSystem';

type Props = AuthStackScreenProps<'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Şifremi Unuttum</Text>
      <Text style={styles.subtitle}>
        E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UNIFIED_COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: UNIFIED_COLORS.terracotta[600],
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: UNIFIED_COLORS.warmNeutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ForgotPasswordScreen;