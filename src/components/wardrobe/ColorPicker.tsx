import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { DesignSystem } from '@/theme/DesignSystem';

export interface ColorPickerProps {
  colors: string[];
  selectedColors?: string[];
  onColorSelect: (color: string) => void;
  onColorDeselect?: (color: string) => void;
  multiSelect?: boolean;
  style?: ViewStyle;
  title?: string;
}

const DEFAULT_COLORS = [
  DesignSystem.colors.error[500], // Red
  DesignSystem.colors.sage[400], // Teal
  DesignSystem.colors.sage[500], // Blue
  DesignSystem.colors.sage[300], // Green
  DesignSystem.colors.terracotta[200], // Yellow
  DesignSystem.colors.primary[300], // Plum
  DesignSystem.colors.sage[200], // Mint
  DesignSystem.colors.terracotta[300], // Gold
  DesignSystem.colors.primary[200], // Lavender
  DesignSystem.colors.sage[200], // Sky Blue
  DesignSystem.colors.terracotta[400], // Orange
  DesignSystem.colors.sage[100], // Light Green
];

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors = DEFAULT_COLORS,
  selectedColors = [],
  onColorSelect,
  onColorDeselect,
  multiSelect = false,
  style,
  title = 'Colors',
}) => {
  const { triggerSelection } = useHapticFeedback();

  const handleColorPress = (color: string) => {
    triggerSelection();

    const isSelected = selectedColors.includes(color);

    if (isSelected && onColorDeselect) {
      onColorDeselect(color);
    } else if (!isSelected) {
      onColorSelect(color);
    }
  };

  const isColorSelected = (color: string) => {
    return selectedColors.includes(color);
  };

  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {colors.map((color, index) => {
          const isSelected = isColorSelected(color);
          return (
            <TouchableOpacity
              key={`${color}-${index}`}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                isSelected && styles.selectedColorButton,
              ]}
              onPress={() => handleColorPress(color)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Color ${color}`}
              accessibilityState={{ selected: isSelected }}
              accessibilityHint={isSelected ? 'Color is selected' : 'Tap to select this color'}
            >
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  checkmark: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.radius.round,
    height: DesignSystem.spacing.lg,
    justifyContent: 'center',
    width: DesignSystem.spacing.lg,
  },
  checkmarkText: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.bold,
  },
  colorButton: {
    alignItems: 'center',
    borderColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.radius.round,
    borderWidth: 2,
    elevation: 3,
    height: DesignSystem.spacing.xl,
    justifyContent: 'center',
    shadowColor: DesignSystem.colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: DesignSystem.spacing.xl,
  },
  container: {
    paddingVertical: DesignSystem.spacing.sm,
  },
  scrollContent: {
    gap: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  selectedColorButton: {
    borderColor: DesignSystem.colors.text.primary,
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  title: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.fontSize.md,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    marginBottom: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.md,
  },
});

// Type already exported above
export default ColorPicker;
