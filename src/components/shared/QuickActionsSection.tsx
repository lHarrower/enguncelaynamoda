import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';
import { OutfitRecommendation } from '@/types/aynaMirror';
import { QuickActionButton } from '@/components/aynaMirror/QuickActionButton';

interface QuickActionsSectionProps {
  selectedRecommendation: OutfitRecommendation | null;
  onQuickAction: (action: 'wear' | 'save' | 'share', recommendation: OutfitRecommendation) => void;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  selectedRecommendation,
  onQuickAction,
}) => {
  if (!selectedRecommendation) {
    return null;
  }

  return (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>
        Quick Actions
      </Text>
      <View style={styles.quickActions}>
        <QuickActionButton
          icon="checkmark-circle"
          label="Wear Today"
          onPress={() => onQuickAction('wear', selectedRecommendation)}
          variant="primary"
        />
        <QuickActionButton
          icon="heart"
          label="Save"
          onPress={() => onQuickAction('save', selectedRecommendation)}
          variant="secondary"
        />
        <QuickActionButton
          icon="share"
          label="Share"
          onPress={() => onQuickAction('share', selectedRecommendation)}
          variant="tertiary"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  quickActionsContainer: {
    marginTop: DesignSystem.spacing.xl,
  },
  quickActionsTitle: {
    ...DesignSystem.typography.h3,
    color: DesignSystem.colors.inkGray[700],
    marginBottom: DesignSystem.spacing.lg,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: DesignSystem.spacing.md,
  },
});