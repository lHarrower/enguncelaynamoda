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
          action={{ type: 'wear', label: 'Wear This', icon: 'checkmark-circle' } as any}
          onPress={() => onQuickAction('wear', selectedRecommendation)}
          variant="primary"
        />
        <QuickActionButton
          action={{ type: 'save', label: 'Save for Later', icon: 'bookmark' } as any}
          onPress={() => onQuickAction('save', selectedRecommendation)}
          variant="secondary"
        />
        <QuickActionButton
          action={{ type: 'share', label: 'Share', icon: 'share' } as any}
          onPress={() => onQuickAction('share', selectedRecommendation)}
          variant="accent"
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
    ...DesignSystem.typography.heading.h3,
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