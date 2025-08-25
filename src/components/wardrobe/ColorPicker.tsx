import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY, UNIFIED_COLORS } from '../../theme/DesignSystem';

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
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Lavender
  '#85C1E9', // Sky Blue
  '#F8C471', // Orange
  '#82E0AA', // Light Green
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
    backgroundColor: UNIFIED_COLORS.background.primary,
    borderRadius: BORDER_RADIUS.full,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkmarkText: {
    color: UNIFIED_COLORS.charcoal[800],
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  colorButton: {
    alignItems: 'center',
    borderColor: UNIFIED_COLORS.background.primary,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    elevation: 3,
    height: 40,
    justifyContent: 'center',
    shadowColor: UNIFIED_COLORS.charcoal[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: 40,
  },
  container: {
    paddingVertical: SPACING.sm,
  },
  scrollContent: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  selectedColorButton: {
    borderColor: UNIFIED_COLORS.charcoal[800],
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  title: {
    color: UNIFIED_COLORS.charcoal[800],
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
});

// Type already exported above
export default ColorPicker;
