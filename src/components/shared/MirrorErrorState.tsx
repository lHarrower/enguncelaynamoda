import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// AYNAMODA Color Palette
const COLORS = {
  primary: '#8B6F47',
  secondary: '#B8A082',
  background: '#F5F1E8',
  surface: '#FFFFFF',
  text: '#2C2C2C',
  textLight: '#B8A082',
  border: '#E8DCC6',
  accent: '#D4AF37',
  error: '#E74C3C',
};

interface MirrorErrorStateProps {
  errorMessage: string;
  onRetry: () => void;
  retryButtonText?: string;
}

export const MirrorErrorState: React.FC<MirrorErrorStateProps> = ({
  errorMessage,
  onRetry,
  retryButtonText = 'Try Again',
}) => {
  return (
    <View style={styles.errorContainer}>
      <BlurView intensity={20} style={styles.errorBlur}>
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={retryButtonText}
            accessibilityHint="Retry the failed operation"
          >
            <Text style={styles.retryButtonText}>{retryButtonText}</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  errorBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  errorContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 32,
  },
  errorText: {
    color: COLORS.text,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
  },
});
