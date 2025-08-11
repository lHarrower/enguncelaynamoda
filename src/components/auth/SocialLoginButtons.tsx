// Social Login Buttons Component
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
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
    triggerSelection();
    if (callback) {
      callback();
    } else {
      Alert.alert(
        'Coming Soon',
        `${provider} login will be available in a future update.`
      );
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
  container: {
    marginVertical: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  socialButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});

export default SocialLoginButtons;