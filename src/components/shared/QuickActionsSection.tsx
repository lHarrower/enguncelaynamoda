import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
};
import { QuickActionButton } from '@/components/aynaMirror/QuickActionButton';
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
    gap: 12,
    justifyContent: 'space-around',
  },
  quickActionsContainer: {
    marginTop: 24,
  },
  quickActionsTitle: {
    color: COLORS.text,
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
});
