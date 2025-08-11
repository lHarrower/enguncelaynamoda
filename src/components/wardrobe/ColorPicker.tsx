import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { UNIFIED_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../theme/DesignSystem';

export interface ColorPickerProps {
  colors: string[];
  selectedColors?: string[];
  onColorSelect: (color: string) => void;
  onColorDeselect?: (color: string) => void;
  multiSelect?: boolean;
  style?: any;
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
  title = 'Colors'
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
      {title && (
        <Text style={styles.title}>{title}</Text>
      )}
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
                isSelected && styles.selectedColorButton
              ]}
              onPress={() => handleColorPress(color)}
              activeOpacity={0.8}
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
  container: {
    paddingVertical: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.md,
  fontWeight: TYPOGRAPHY.weights.semibold,
    color: UNIFIED_COLORS.charcoal[800],
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: UNIFIED_COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: UNIFIED_COLORS.charcoal[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedColorButton: {
    borderColor: UNIFIED_COLORS.charcoal[800],
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: UNIFIED_COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 12,
  fontWeight: TYPOGRAPHY.weights.bold,
    color: UNIFIED_COLORS.charcoal[800],
  },
});

// Type already exported above
export default ColorPicker;