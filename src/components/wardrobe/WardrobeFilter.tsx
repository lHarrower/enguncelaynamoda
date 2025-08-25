// Wardrobe Filter Component
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';
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

  const toggleFilter = (filterType: keyof ActiveFilters, value: any) => {
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
    const isSelected = currentValues.includes(value);

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

  const renderFilterSection = <T,>(
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
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  activeFavoriteFilterText: {
    color: '#EF4444',
  },
  activeFilterItem: {
    backgroundColor: '#EBF4FF',
    borderColor: '#3B82F6',
  },
  activeFilterItemText: {
    color: '#3B82F6',
  },
  clearButton: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  colorFilterItem: {
    paddingLeft: 8,
  },
  colorIndicator: {
    borderColor: '#E5E7EB',
    borderRadius: 6,
    borderWidth: 1,
    height: 12,
    marginRight: 6,
    width: 12,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  favoriteFilter: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  favoriteFilterText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  filterItem: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterItemText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  filterItems: {
    flexDirection: 'row',
    gap: 8,
  },
  filterSection: {
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  title: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default WardrobeFilter;
