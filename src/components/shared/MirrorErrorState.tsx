import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

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
          <Ionicons name="alert-circle-outline" size={48} color={DesignSystem.colors.coral[500]} />
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
    padding: DesignSystem.spacing.xl,
  },
  errorContent: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.elevated + '1A',
    padding: DesignSystem.spacing.xxl,
  },
  errorText: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.primary,
    fontSize: DesignSystem.typography.fontSize.md,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    marginVertical: DesignSystem.spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: DesignSystem.radius.md,
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.sm,
  },
  retryButtonText: {
    color: DesignSystem.colors.text.inverse,
    fontFamily: DesignSystem.typography.fontFamily.primary,
    fontSize: DesignSystem.typography.fontSize.md,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
});
