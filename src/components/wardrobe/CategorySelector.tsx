import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY, UNIFIED_COLORS } from '../../theme/DesignSystem';

export interface CategorySelectorProps {
  categories: string[];
  selectedCategory?: string;
  onCategorySelect: (category: string) => void;
  style?: ViewStyle;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  style,
}) => {
  const { triggerSelection } = useHapticFeedback();

  const handleCategoryPress = (category: string) => {
    triggerSelection();
    onCategorySelect(category);
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, isSelected && styles.selectedCategoryButton]}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Category ${category}`}
              accessibilityState={{ selected: isSelected }}
              accessibilityHint={
                isSelected
                  ? `${category} category is selected`
                  : `Tap to select ${category} category`
              }
            >
              <Text style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryButton: {
    backgroundColor: UNIFIED_COLORS.background.secondary,
    borderColor: UNIFIED_COLORS.sage[200],
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  categoryText: {
    color: UNIFIED_COLORS.charcoal[600],
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  container: {
    paddingVertical: SPACING.sm,
  },
  scrollContent: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  selectedCategoryButton: {
    backgroundColor: UNIFIED_COLORS.sage[500],
    borderColor: UNIFIED_COLORS.sage[600],
  },
  selectedCategoryText: {
    color: UNIFIED_COLORS.background.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

// Type already exported above
export default CategorySelector;
