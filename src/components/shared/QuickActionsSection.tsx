import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { QuickActionButton } from '@/components/aynaMirror/QuickActionButton';
import { DesignSystem } from '@/theme/DesignSystem';
import { OutfitRecommendation } from '@/types/aynaMirror';
import { IoniconsName } from '@/types/icons';

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
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <QuickActionButton
          action={{ type: 'wear', label: 'Wear This', icon: 'checkmark-circle' as IoniconsName }}
          onPress={() => onQuickAction('wear', selectedRecommendation)}
          variant="primary"
        />
        <QuickActionButton
          action={{ type: 'save', label: 'Save for Later', icon: 'bookmark' as IoniconsName }}
          onPress={() => onQuickAction('save', selectedRecommendation)}
          variant="secondary"
        />
        <QuickActionButton
          action={{ type: 'share', label: 'Share', icon: 'share' as IoniconsName }}
          onPress={() => onQuickAction('share', selectedRecommendation)}
          variant="accent"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
    justifyContent: 'space-around',
  },
  quickActionsContainer: {
    marginTop: 24,
  },
  quickActionsTitle: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.primary,
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    marginBottom: DesignSystem.spacing.lg,
    textAlign: 'center',
  },
});
