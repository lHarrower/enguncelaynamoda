// Wardrobe Filter Component
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { WardrobeCategory, WardrobeColor } from '@/types';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

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
  style?: any;
}

const WardrobeFilter: React.FC<WardrobeFilterProps> = ({
  filterOptions,
  activeFilters,
  onFiltersChange,
  onClearFilters,
  style,
}) => {
  const { triggerSelection } = useHapticFeedback();

  const toggleFilter = <T extends keyof ActiveFilters>(
    filterType: T,
    value: ActiveFilters[T] extends (infer U)[] ? U : boolean
  ) => {
    triggerSelection();
    
    if (filterType === 'isFavorite') {
      onFiltersChange({
        ...activeFilters,
        isFavorite: !activeFilters.isFavorite,
      });
      return;
    }

    const currentValues = activeFilters[filterType] as any[];
    const isSelected = currentValues.includes(value);
    
    const newValues = isSelected
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...activeFilters,
      [filterType]: newValues,
    });
  };

  const hasActiveFilters = Object.values(activeFilters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : filter
  );

  const renderFilterSection = <T,>(
    title: string,
    items: T[],
    activeItems: T[],
    filterType: keyof ActiveFilters,
    getLabel: (item: T) => string,
    getColor?: (item: T) => string
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
                onPress={() => toggleFilter(filterType, item as any)}
              >
                {color && (
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: color },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.filterItemText,
                    isActive && styles.activeFilterItemText,
                  ]}
                >
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
          <TouchableOpacity onPress={onClearFilters}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Favorites Filter */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={[
              styles.favoriteFilter,
              activeFilters.isFavorite && styles.activeFavoriteFilter,
            ]}
            onPress={() => toggleFilter('isFavorite', true)}
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
          (category) => category
        )}
        
        {/* Colors */}
        {renderFilterSection(
          'Colors',
          filterOptions.colors,
          activeFilters.colors,
          'colors',
          (color) => String(color),
          (color) => String(color)
        )}
        
        {/* Brands */}
        {renderFilterSection(
          'Brands',
          filterOptions.brands,
          activeFilters.brands,
          'brands',
          (brand) => brand
        )}
        
        {/* Seasons */}
        {renderFilterSection(
          'Seasons',
          filterOptions.seasons,
          activeFilters.seasons,
          'seasons',
          (season) => season
        )}
        
        {/* Occasions */}
        {renderFilterSection(
          'Occasions',
          filterOptions.occasions,
          activeFilters.occasions,
          'occasions',
          (occasion) => occasion
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  clearButton: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  filterItems: {
    flexDirection: 'row',
    gap: 8,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFilterItem: {
    backgroundColor: '#EBF4FF',
    borderColor: '#3B82F6',
  },
  colorFilterItem: {
    paddingLeft: 8,
  },
  filterItemText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterItemText: {
    color: '#3B82F6',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  favoriteFilter: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFavoriteFilter: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  favoriteFilterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFavoriteFilterText: {
    color: '#EF4444',
  },
});

export default WardrobeFilter;