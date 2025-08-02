import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';

interface MirrorErrorStateProps {
  errorMessage: string;
  onRetry: () => void;
  retryButtonText?: string;
}

export const MirrorErrorState: React.FC<MirrorErrorStateProps> = ({
  errorMessage,
  onRetry,
  retryButtonText = "Try Again",
}) => {
  return (
    <View style={styles.errorContainer}>
      <BlurView intensity={20} style={styles.errorBlur}>
        <View style={styles.errorContent}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={DesignSystem.colors.coral[500]}
          />
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>
              {retryButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing.xl,
  },
  errorBlur: {
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
  },
  errorContent: {
    padding: DesignSystem.spacing.xxl,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  errorText: {
    ...DesignSystem.typography.body1,
    color: DesignSystem.colors.inkGray[700],
    textAlign: 'center',
    marginVertical: DesignSystem.spacing.lg,
  },
  retryButton: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.sageGreen[500],
    borderRadius: DesignSystem.radius.lg,
  },
  retryButtonText: {
    ...DesignSystem.typography.button,
    color: DesignSystem.colors.background.elevated,
  },
});