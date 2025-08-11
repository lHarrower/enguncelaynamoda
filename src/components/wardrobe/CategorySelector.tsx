import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { UNIFIED_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../theme/DesignSystem';

export interface CategorySelectorProps {
  categories: string[];
  selectedCategory?: string;
  onCategorySelect: (category: string) => void;
  style?: any;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  style
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
              style={[
                styles.categoryButton,
                isSelected && styles.selectedCategoryButton
              ]}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryText,
                isSelected && styles.selectedCategoryText
              ]}>
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
  container: {
    paddingVertical: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: UNIFIED_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: UNIFIED_COLORS.sage[200],
  },
  selectedCategoryButton: {
    backgroundColor: UNIFIED_COLORS.sage[500],
    borderColor: UNIFIED_COLORS.sage[600],
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  fontWeight: TYPOGRAPHY.weights.medium,
    color: UNIFIED_COLORS.charcoal[600],
  },
  selectedCategoryText: {
    color: UNIFIED_COLORS.background.primary,
  fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

// Type already exported above
export default CategorySelector;