// Wardrobe Filter Component
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { DesignSystem } from '@/theme/DesignSystem';
import { WardrobeCategory, WardrobeColor } from '@/types';

export interface FilterOptions {
  categories: WardrobeCategory[];
  colors: WardrobeColor[];
  brands: string[];
  seasons: string[];
  occasions: string[];
}

export interface ActiveFilters {
  categories: WardrobeCategory[];
  colors: WardrobeColor[];
  brands: string[];
  seasons: string[];
  occasions: string[];
  isFavorite?: boolean;
}

export interface WardrobeFilterProps {
  filterOptions: FilterOptions;
  activeFilters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  onClearFilters: () => void;
  style?: ViewStyle;
}

const WardrobeFilter: React.FC<WardrobeFilterProps> = ({
  filterOptions,
  activeFilters,
  onFiltersChange,
  onClearFilters,
  style,
}) => {
  const { triggerSelection } = useHapticFeedback();

  const toggleFilter = (
    filterType: keyof ActiveFilters,
    value: WardrobeCategory | WardrobeColor | string | boolean,
  ) => {
    triggerSelection();

    if (filterType === 'isFavorite') {
      onFiltersChange({
        ...activeFilters,
        isFavorite: !activeFilters.isFavorite,
      });
      return;
    }

    const currentValues = activeFilters[filterType] as (
      | WardrobeCategory
      | WardrobeColor
      | string
    )[];
    const isSelected = (currentValues as any).includes(value);

    const newValues = isSelected
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    onFiltersChange({
      ...activeFilters,
      [filterType]: newValues,
    });
  };

  const hasActiveFilters = Object.values(activeFilters).some((filter) =>
    Array.isArray(filter) ? filter.length > 0 : filter,
  );

  const renderFilterSection = <T extends string | boolean>(
    title: string,
    items: T[],
    activeItems: T[],
    filterType: keyof ActiveFilters,
    getLabel: (item: T) => string,
    getColor?: (item: T) => string,
  ) => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterItems}>
          {items.map((item, index) => {
            const isActive = activeItems.includes(item);
            const label = getLabel(item);
            const color = getColor?.(item);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterItem,
                  isActive && styles.activeFilterItem,
                  color && styles.colorFilterItem,
                ]}
                onPress={() => toggleFilter(filterType as keyof ActiveFilters, item)}
                accessibilityRole="button"
                accessibilityLabel={`${title} filter: ${label}`}
                accessibilityState={{ selected: isActive }}
                accessibilityHint={
                  isActive ? `${label} filter is active` : `Tap to apply ${label} filter`
                }
              >
                {color && <View style={[styles.colorIndicator, { backgroundColor: color }]} />}
                <Text style={[styles.filterItemText, isActive && styles.activeFilterItemText]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        {hasActiveFilters && (
          <TouchableOpacity
            onPress={onClearFilters}
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
            accessibilityHint="Tap to remove all active filters"
          >
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Favorites Filter */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={[styles.favoriteFilter, activeFilters.isFavorite && styles.activeFavoriteFilter]}
            onPress={() => toggleFilter('isFavorite', true)}
            accessibilityRole="button"
            accessibilityLabel="Favorites filter"
            accessibilityState={{ selected: activeFilters.isFavorite }}
            accessibilityHint={
              activeFilters.isFavorite
                ? 'Favorites filter is active'
                : 'Tap to show only favorite items'
            }
          >
            <Text
              style={[
                styles.favoriteFilterText,
                activeFilters.isFavorite && styles.activeFavoriteFilterText,
              ]}
            >
              ♥ Favorites Only
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        {renderFilterSection(
          'Categories',
          filterOptions.categories,
          activeFilters.categories,
          'categories',
          (category) => category,
        )}

        {/* Colors */}
        {renderFilterSection(
          'Colors',
          filterOptions.colors,
          activeFilters.colors,
          'colors',
          (color) => String(color),
          (color) => String(color),
        )}

        {/* Brands */}
        {renderFilterSection(
          'Brands',
          filterOptions.brands,
          activeFilters.brands,
          'brands',
          (brand) => brand,
        )}

        {/* Seasons */}
        {renderFilterSection(
          'Seasons',
          filterOptions.seasons,
          activeFilters.seasons,
          'seasons',
          (season) => season,
        )}

        {/* Occasions */}
        {renderFilterSection(
          'Occasions',
          filterOptions.occasions,
          activeFilters.occasions,
          'occasions',
          (occasion) => occasion,
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  activeFavoriteFilter: {
    backgroundColor: DesignSystem.colors.error[50],
    borderColor: DesignSystem.colors.error[500],
  },
  activeFavoriteFilterText: {
    color: DesignSystem.colors.error[500],
  },
  activeFilterItem: {
    backgroundColor: DesignSystem.colors.sage[50],
    borderColor: DesignSystem.colors.sage[500],
  },
  activeFilterItemText: {
    color: DesignSystem.colors.sage[500],
  },
  clearButton: {
    color: DesignSystem.colors.sage[500],
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: '500',
  },
  colorFilterItem: {
    paddingLeft: DesignSystem.spacing.xs,
  },
  colorIndicator: {
    borderColor: DesignSystem.colors.border.secondary,
    borderRadius: DesignSystem.radius.sm,
    borderWidth: 1,
    height: DesignSystem.spacing.sm,
    marginRight: DesignSystem.spacing.xs,
    width: DesignSystem.spacing.sm,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.radius.sm,
    marginBottom: DesignSystem.spacing.md,
    padding: DesignSystem.spacing.md,
  },
  favoriteFilter: {
    alignSelf: 'flex-start',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: 'transparent',
    borderRadius: DesignSystem.radius.lg,
    borderWidth: 1,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
  },
  favoriteFilterText: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: '500',
  },
  filterItem: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: 'transparent',
    borderRadius: DesignSystem.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  filterItemText: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: '500',
  },
  filterItems: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
  },
  filterSection: {
    marginBottom: DesignSystem.spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.md,
  },
  sectionTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: DesignSystem.spacing.xs,
  },
  title: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: '600',
  },
});

export default WardrobeFilter;
