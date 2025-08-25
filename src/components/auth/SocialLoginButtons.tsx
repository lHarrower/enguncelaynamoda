// Social Login Buttons Component
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface SocialLoginButtonsProps {
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
  onFacebookLogin?: () => void;
  disabled?: boolean;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGoogleLogin,
  onAppleLogin,
  onFacebookLogin,
  disabled = false,
}) => {
  const { triggerSelection } = useHapticFeedback();

  const handleSocialLogin = (provider: string, callback?: () => void) => {
    void triggerSelection();
    if (callback) {
      callback();
    } else {
      Alert.alert('Coming Soon', `${provider} login will be available in a future update.`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.socialButton, disabled && styles.socialButtonDisabled]}
          onPress={() => handleSocialLogin('Google', onGoogleLogin)}
          disabled={disabled}
        >
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, disabled && styles.socialButtonDisabled]}
          onPress={() => handleSocialLogin('Apple', onAppleLogin)}
          disabled={disabled}
        >
          <Text style={styles.socialButtonText}>Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, disabled && styles.socialButtonDisabled]}
          onPress={() => handleSocialLogin('Facebook', onFacebookLogin)}
          disabled={disabled}
        >
          <Text style={styles.socialButtonText}>Facebook</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  container: {
    marginVertical: 24,
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 24,
  },
  dividerLine: {
    backgroundColor: '#E5E7EB',
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 14,
    marginHorizontal: 16,
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  socialButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  socialButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SocialLoginButtons;
