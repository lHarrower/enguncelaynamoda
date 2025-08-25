import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AINameGenerator } from '@/components/naming/AINameGenerator';
import { NamingPreferences } from '@/components/naming/NamingPreferences';
import { WardrobeItemCard } from '@/components/sanctuary/WardrobeItemCard';
import { WardrobeItemForm } from '@/components/wardrobe/WardrobeItemForm';
import { useAINaming } from '@/hooks/useAINaming';
import { enhancedWardrobeService } from '@/services/enhancedWardrobeService';
import { DesignSystem } from '@/theme/DesignSystem';
import { ItemCategory, WardrobeItem } from '@/types/aynaMirror';
import { errorInDev } from '@/utils/consoleSuppress';

interface FilterOptions {
  category: ItemCategory | 'all';
  colors: string[];
  brands: string[];
  hasAIName: boolean | null;
  searchQuery: string;
}

interface SortOptions {
  field: 'name' | 'category' | 'createdAt' | 'lastWorn' | 'wearCount';
  direction: 'asc' | 'desc';
}

const CATEGORIES: (ItemCategory | 'all')[] = [
  'all',
  'tops',
  'bottoms',
  'dresses',
  'shoes',
  'accessories',
  'outerwear',
  'activewear',
];

export const WardrobeScreen: React.FC = () => {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [anchorEl, setAnchorEl] = useState<boolean>(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showNameTypePicker, setShowNameTypePicker] = useState(false);
  const [showSortPicker, setShowSortPicker] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isGenerating, setIsGenerating] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    colors: [],
    brands: [],
    hasAIName: null,
    searchQuery: '',
  });

  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'name',
    direction: 'asc',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'error' | 'warning' | 'info' | 'success',
  });

  const { generateNameForItem } = useAINaming();

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Use enhanced service method to load user wardrobe; fallback to empty for unauthenticated
      const userId = 'local-user';
      const wardrobeItems = await enhancedWardrobeService.getUserWardrobe(userId);
      setItems(wardrobeItems);
    } catch (err) {
      setError('Failed to load wardrobe items');
      errorInDev('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredAndSortedItems = React.useMemo(() => {
    const filtered = items.filter((item) => {
      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = [
          item.name,
          item.brand,
          item.category,
          ...(item.colors || []),
          ...(item.tags || []),
        ]
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // Colors filter
      if (filters.colors.length > 0) {
        const itemColors = item.colors || [];
        if (!filters.colors.some((color) => itemColors.includes(color))) {
          return false;
        }
      }

      // Brands filter
      if (filters.brands.length > 0) {
        if (!item.brand || !filters.brands.includes(item.brand)) {
          return false;
        }
      }

      // AI name filter
      if (filters.hasAIName !== null) {
        const aiNamed = !!(item.aiGeneratedName && !item.nameOverride);
        if (filters.hasAIName !== aiNamed) {
          return false;
        }
      }

      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortOptions.field) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        case 'lastWorn':
          aValue = new Date(a.lastWorn || 0).getTime();
          bValue = new Date(b.lastWorn || 0).getTime();
          break;
        case 'wearCount':
          aValue = a.usageStats?.totalWears || 0;
          bValue = b.usageStats?.totalWears || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortOptions.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOptions.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [items, filters, sortOptions]);

  const handleItemPress = (item: WardrobeItem) => {
    setSelectedItem(item);
    // Navigate to item detail or open modal
  };

  // Memoized render item for better performance
  const renderItem = React.useCallback(
    ({ item }: { item: WardrobeItem }) => (
      <WardrobeItemCard
        item={item}
        onPress={() => handleItemPress(item)}
        onAnalysisApplied={(
          id: string,
          update: { processedImageUri?: string; aiAnalysisData?: WardrobeItem['aiAnalysisData'] },
        ) => {
          setItems((prev) =>
            prev.map((i) =>
              i.id === id
                ? ({
                    ...i,
                    ...('processedImageUri' in update
                      ? { processedImageUri: update.processedImageUri }
                      : {}),
                    ...('aiAnalysisData' in update
                      ? { aiAnalysisData: update.aiAnalysisData }
                      : {}),
                  } as any)
                : i,
            ),
          );
        }}
      />
    ),
    [handleItemPress],
  );

  // Optimized keyExtractor
  const keyExtractor = React.useCallback((item: WardrobeItem) => item.id, []);

  // Optimized getItemLayout for both grid and list modes
  const getItemLayout = React.useCallback(
    (data: ArrayLike<WardrobeItem> | null | undefined, index: number) => {
      const ITEM_HEIGHT = viewMode === 'grid' ? 200 : 140;
      const ITEM_SPACING = 8;
      const itemsPerRow = viewMode === 'grid' ? 2 : 1;
      const rowIndex = Math.floor(index / itemsPerRow);

      return {
        length: ITEM_HEIGHT,
        offset: (ITEM_HEIGHT + ITEM_SPACING) * rowIndex,
        index,
      };
    },
    [viewMode],
  );

  const handleEditItem = (item: WardrobeItem) => {
    setSelectedItem(item);
    setShowEditForm(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Defer to legacy or implement delete in enhanced service later
            // For now, just filter locally
            setItems((prev) => prev.filter((i) => i.id !== itemId));
            await loadItems();
            setSnackbar({
              open: true,
              message: 'Item deleted successfully',
              severity: 'success',
            });
          } catch (err) {
            setSnackbar({
              open: true,
              message: 'Failed to delete item',
              severity: 'error',
            });
          }
        },
      },
    ]);
  };

  const handleSaveItem = async (itemData: Partial<WardrobeItem>) => {
    try {
      if (selectedItem) {
        // Update existing item
        // Update locally; wiring to service can be added when API is stable
        setItems((prev) =>
          prev.map((i) => (i.id === selectedItem.id ? ({ ...i, ...itemData } as any) : i)),
        );
        setSnackbar({
          open: true,
          message: 'Item updated successfully',
          severity: 'success',
        });
      } else {
        // Create new item
        // Temporary local add; service method will be integrated later
        setItems((prev) => [{ ...(itemData as any), id: `${Date.now()}` }, ...prev]);
        setSnackbar({
          open: true,
          message: 'Item added successfully',
          severity: 'success',
        });
      }

      await loadItems();
      setShowAddForm(false);
      setShowEditForm(false);
      setSelectedItem(null);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to save item',
        severity: 'error',
      });
    }
  };

  const handleBulkAIGeneration = async () => {
    setIsGenerating(true);
    try {
      const itemsToUpdate = items.filter((item) => !item.name || item.name.trim() === '');

      for (const itemLocal of itemsToUpdate) {
        try {
          const resp = await generateNameForItem(itemLocal);
          if (resp && resp.aiGeneratedName) {
            setItems((prev) =>
              prev.map((i) =>
                i.id === itemLocal.id
                  ? ({ ...i, aiGeneratedName: resp.aiGeneratedName, nameOverride: false } as any)
                  : i,
              ),
            );
          }
        } catch (err) {
          errorInDev(`Failed to generate name for item ${itemLocal.id}:`, err);
        }
      }

      await loadItems();
      setSnackbar({
        open: true,
        message: `Generated names for ${itemsToUpdate.length} items`,
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to generate AI names',
        severity: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getItemDisplayName = (item: WardrobeItem): string => {
    if (item.name && item.name.trim()) {
      return item.name;
    }
    return item.name || 'Unnamed Item';
  };

  const getUniqueColors = (): string[] => {
    const colors = new Set<string>();
    items.forEach((item) => {
      if (item.colors) {
        item.colors.forEach((color) => colors.add(color));
      }
    });
    return Array.from(colors).sort();
  };

  const getUniqueBrands = (): string[] => {
    const brands = new Set<string>();
    items.forEach((item) => {
      if (item.brand) {
        brands.add(item.brand);
      }
    });
    return Array.from(brands).sort();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wardrobe</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleBulkAIGeneration}
            disabled={isGenerating}
            accessibilityRole="button"
            accessibilityLabel="Bulk AI name generation"
            accessibilityHint="Generates AI names for all items in wardrobe"
            accessibilityState={{ disabled: isGenerating }}
          >
            <Ionicons name="refresh-outline" size={20} color={DesignSystem.colors.text.inverse} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, styles.headerButtonSecondary]}
            onPress={() => setAnchorEl(true)}
            accessibilityRole="button"
            accessibilityLabel="Settings menu"
            accessibilityHint="Opens wardrobe settings and options"
          >
            <Ionicons name="settings-outline" size={20} color={DesignSystem.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{items.length}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {items.filter((item) => item.aiGeneratedName && !item.nameOverride).length}
          </Text>
          <Text style={styles.statLabel}>AI Named</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{CATEGORIES.length - 1}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={DesignSystem.colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor={DesignSystem.colors.text.secondary}
            value={filters.searchQuery}
            onChangeText={(text) => setFilters((prev) => ({ ...prev, searchQuery: text }))}
          />
        </View>
        <View style={styles.filterRow}>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(true)}
              accessibilityRole="button"
              accessibilityLabel="Category filter"
              accessibilityHint="Opens category picker to filter items"
            >
              <Text style={styles.pickerText}>
                {filters.category === 'all'
                  ? 'All Categories'
                  : filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}
              </Text>
              <Ionicons name="chevron-down" size={20} color={DesignSystem.colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
            accessibilityRole="button"
            accessibilityLabel="Advanced filters"
            accessibilityHint="Opens advanced filtering options"
          >
            <Ionicons name="filter" size={16} color={DesignSystem.colors.text.inverse} />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort and View Toggle */}
      <View style={styles.sortViewContainer}>
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() =>
              setSortOptions((prev) => ({
                ...prev,
                direction: prev.direction === 'asc' ? 'desc' : 'asc',
              }))
            }
            accessibilityRole="button"
            accessibilityLabel={`Sort ${sortOptions.direction === 'asc' ? 'descending' : 'ascending'}`}
            accessibilityHint="Toggles sort direction between ascending and descending"
          >
            <Text style={styles.sortButtonText}>Sort</Text>
            <Ionicons
              name={sortOptions.direction === 'asc' ? 'arrow-up' : 'arrow-down'}
              size={16}
              color={DesignSystem.colors.text.primary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[styles.viewToggleButton, viewMode === 'grid' && styles.viewToggleButtonActive]}
            onPress={() => setViewMode('grid')}
            accessibilityRole="button"
            accessibilityLabel="Grid view"
            accessibilityHint="Switch to grid view layout"
            accessibilityState={{ selected: viewMode === 'grid' }}
          >
            <Ionicons
              name="grid"
              size={20}
              color={
                viewMode === 'grid'
                  ? DesignSystem.colors.text.inverse
                  : DesignSystem.colors.text.primary
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
            onPress={() => setViewMode('list')}
            accessibilityRole="button"
            accessibilityLabel="List view"
            accessibilityHint="Switch to list view layout"
            accessibilityState={{ selected: viewMode === 'list' }}
          >
            <Ionicons
              name="list"
              size={20}
              color={
                viewMode === 'list'
                  ? DesignSystem.colors.text.inverse
                  : DesignSystem.colors.text.primary
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={DesignSystem.colors.error.main} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadItems}
            accessibilityRole="button"
            accessibilityLabel="Retry loading items"
            accessibilityHint="Tap to retry loading wardrobe items"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Items Grid/List */}
      <View style={styles.itemsContainer}>
        {filteredAndSortedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="shirt-outline" size={64} color={DesignSystem.colors.text.secondary} />
            <Text style={styles.emptyText}>
              {items.length === 0 ? 'No items in your wardrobe yet' : 'No items match your filters'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredAndSortedItems}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={viewMode === 'grid' ? 2 : 1}
            key={viewMode} // Force re-render when view mode changes
            contentContainerStyle={{ paddingBottom: 100 }}
            // Enhanced performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={viewMode === 'grid' ? 8 : 10}
            windowSize={viewMode === 'grid' ? 8 : 10}
            initialNumToRender={viewMode === 'grid' ? 6 : 8}
            updateCellsBatchingPeriod={50}
            getItemLayout={getItemLayout}
            // Additional performance props
            disableVirtualization={false}
            legacyImplementation={false}
            scrollEventThrottle={16}
            // Memory optimization
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              // Future: implement pagination for large wardrobes
            }}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddForm(true)}
        accessibilityRole="button"
        accessibilityLabel="Add new wardrobe item"
        accessibilityHint="Opens form to add a new clothing item to your wardrobe"
      >
        <Ionicons name="add" size={24} color={DesignSystem.colors.text.inverse} />
      </TouchableOpacity>

      {/* Settings Menu */}
      <Modal
        visible={!!anchorEl}
        transparent
        animationType="fade"
        onRequestClose={() => setAnchorEl(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setAnchorEl(false)}
          accessibilityRole="button"
          accessibilityLabel="Close settings menu"
          accessibilityHint="Tap to close the settings menu overlay"
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowPreferences(true);
                setAnchorEl(false);
              }}
              accessibilityRole="button"
              accessibilityLabel="Naming Preferences"
              accessibilityHint="Opens naming preferences settings"
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={DesignSystem.colors.text.primary}
              />
              <Text style={styles.menuItemText}>Naming Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleBulkAIGeneration();
                setAnchorEl(false);
              }}
              accessibilityRole="button"
              accessibilityLabel="Regenerate All AI Names"
              accessibilityHint="Regenerates AI-generated names for all wardrobe items"
            >
              <Ionicons name="refresh-outline" size={20} color={DesignSystem.colors.text.primary} />
              <Text style={styles.menuItemText}>Regenerate All AI Names</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Item Dialog */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddForm(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Item</Text>
            <TouchableOpacity
              onPress={() => setShowAddForm(false)}
              accessibilityRole="button"
              accessibilityLabel="Close add item form"
              accessibilityHint="Tap to close the add new item form"
            >
              <Ionicons name="close" size={24} color={DesignSystem.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <WardrobeItemForm onSave={handleSaveItem} onCancel={() => setShowAddForm(false)} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Edit Item Dialog */}
      <Modal
        visible={showEditForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditForm(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Item</Text>
            <TouchableOpacity
              onPress={() => setShowEditForm(false)}
              accessibilityRole="button"
              accessibilityLabel="Close edit item form"
              accessibilityHint="Tap to close the edit item form"
            >
              <Ionicons name="close" size={24} color={DesignSystem.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {selectedItem && (
              <WardrobeItemForm
                item={selectedItem}
                onSave={handleSaveItem}
                onCancel={() => setShowEditForm(false)}
                isEditing
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* AI Name Generator Dialog */}
      <Modal
        visible={showAIGenerator}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAIGenerator(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Generate AI Name</Text>
            <TouchableOpacity
              onPress={() => setShowAIGenerator(false)}
              accessibilityRole="button"
              accessibilityLabel="Close AI name generator"
              accessibilityHint="Tap to close the AI name generator"
            >
              <Ionicons name="close" size={24} color={DesignSystem.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {selectedItem && (
              <AINameGenerator
                item={selectedItem}
                onNameSelected={(name, isAI) => {
                  // Handle name selection
                  setShowAIGenerator(false);
                }}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Naming Preferences Dialog */}
      <Modal
        visible={showPreferences}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPreferences(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Naming Preferences</Text>
            <TouchableOpacity
              onPress={() => setShowPreferences(false)}
              accessibilityRole="button"
              accessibilityLabel="Close naming preferences"
              accessibilityHint="Closes the naming preferences dialog"
            >
              <Ionicons name="close" size={24} color={DesignSystem.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <NamingPreferences onPreferencesChange={() => setShowPreferences(false)} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Advanced Filters Dialog */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Advanced Filters</Text>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              accessibilityRole="button"
              accessibilityLabel="Close advanced filters"
              accessibilityHint="Closes the advanced filters dialog"
            >
              <Ionicons name="close" size={24} color={DesignSystem.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.filterSection}>
              {/* AI Name Filter */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Name Type</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowNameTypePicker(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Name type filter"
                    accessibilityHint="Opens picker to filter items by name type"
                  >
                    <Text style={styles.pickerText}>
                      {filters.hasAIName === null
                        ? 'All Items'
                        : filters.hasAIName
                          ? 'AI Generated Names'
                          : 'Custom Names'}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={DesignSystem.colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sort Field */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Sort By</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowSortPicker(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Sort options"
                    accessibilityHint="Opens picker to change sort order"
                  >
                    <Text style={styles.pickerText}>
                      {sortOptions.field === 'name'
                        ? 'Name'
                        : sortOptions.field === 'category'
                          ? 'Category'
                          : sortOptions.field === 'createdAt'
                            ? 'Date Added'
                            : sortOptions.field === 'lastWorn'
                              ? 'Last Worn'
                              : 'Wear Count'}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={DesignSystem.colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Colors Filter */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Colors</Text>
                <View style={styles.chipContainer}>
                  {getUniqueColors().map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[styles.chip, filters.colors.includes(color) && styles.chipSelected]}
                      onPress={() => {
                        setFilters((prev) => ({
                          ...prev,
                          colors: prev.colors.includes(color)
                            ? prev.colors.filter((c) => c !== color)
                            : [...prev.colors, color],
                        }));
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`${color} color filter`}
                      accessibilityHint={`${filters.colors.includes(color) ? 'Remove' : 'Add'} ${color} color filter`}
                      accessibilityState={{ selected: filters.colors.includes(color) }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.colors.includes(color) && styles.chipTextSelected,
                        ]}
                      >
                        {color}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Brands Filter */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Brands</Text>
                <View style={styles.chipContainer}>
                  {getUniqueBrands().map((brand) => (
                    <TouchableOpacity
                      key={brand}
                      style={[styles.chip, filters.brands.includes(brand) && styles.chipSelected]}
                      onPress={() => {
                        setFilters((prev) => ({
                          ...prev,
                          brands: prev.brands.includes(brand)
                            ? prev.brands.filter((b) => b !== brand)
                            : [...prev.brands, brand],
                        }));
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`${brand} brand filter`}
                      accessibilityHint={`${filters.brands.includes(brand) ? 'Remove' : 'Add'} ${brand} brand filter`}
                      accessibilityState={{ selected: filters.brands.includes(brand) }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.brands.includes(brand) && styles.chipTextSelected,
                        ]}
                      >
                        {brand}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={() => {
                setFilters({
                  category: 'all',
                  colors: [],
                  brands: [],
                  hasAIName: null,
                  searchQuery: '',
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear all filters"
              accessibilityHint="Removes all applied filters and shows all items"
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.closeButton]}
              onPress={() => setShowFilters(false)}
              accessibilityRole="button"
              accessibilityLabel="Close filters"
              accessibilityHint="Closes the filter dialog"
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
          accessibilityRole="button"
          accessibilityLabel="Close category picker"
          accessibilityHint="Tap to close the category selection dialog"
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select Category</Text>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.pickerOption,
                  filters.category === category && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  setFilters((prev) => ({ ...prev, category }));
                  setShowCategoryPicker(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)} category`}
                accessibilityHint={`Filter items by ${category === 'all' ? 'all categories' : category} category`}
                accessibilityState={{ selected: filters.category === category }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    filters.category === category && styles.pickerOptionTextSelected,
                  ]}
                >
                  {category === 'all'
                    ? 'All Categories'
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Name Type Picker Modal */}
      <Modal
        visible={showNameTypePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameTypePicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowNameTypePicker(false)}
          accessibilityRole="button"
          accessibilityLabel="Close name type picker"
          accessibilityHint="Tap to close the name type selection dialog"
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select Name Type</Text>
            {[
              { value: null, label: 'All Items' },
              { value: true, label: 'AI Generated Names' },
              { value: false, label: 'Custom Names' },
            ].map((option) => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.pickerOption,
                  filters.hasAIName === option.value && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  setFilters((prev) => ({ ...prev, hasAIName: option.value }));
                  setShowNameTypePicker(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select ${option.label}`}
                accessibilityHint={`Tap to filter items by ${option.label.toLowerCase()}`}
                accessibilityState={{ selected: filters.hasAIName === option.value }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    filters.hasAIName === option.value && styles.pickerOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sort Field Picker Modal */}
      <Modal
        visible={showSortPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortPicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowSortPicker(false)}
          accessibilityRole="button"
          accessibilityLabel="Close sort picker"
          accessibilityHint="Tap to close the sort options dialog"
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Sort By</Text>
            {[
              { value: 'name', label: 'Name' },
              { value: 'category', label: 'Category' },
              { value: 'createdAt', label: 'Date Added' },
              { value: 'lastWorn', label: 'Last Worn' },
              { value: 'wearCount', label: 'Wear Count' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pickerOption,
                  sortOptions.field === option.value && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  setSortOptions((prev) => ({ ...prev, field: option.value as any }));
                  setShowSortPicker(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Sort by ${option.label}`}
                accessibilityHint={`Tap to sort wardrobe items by ${option.label.toLowerCase()}`}
                accessibilityState={{ selected: sortOptions.field === option.value }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    sortOptions.field === option.value && styles.pickerOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Snackbar */}
      {snackbar.open && (
        <View style={styles.snackbarContainer}>
          <View
            style={[
              styles.snackbar,
              snackbar.severity === 'error' && styles.snackbarError,
              snackbar.severity === 'warning' && styles.snackbarWarning,
              snackbar.severity === 'success' && styles.snackbarSuccess,
              snackbar.severity === 'info' && styles.snackbarInfo,
            ]}
          >
            <Ionicons
              name={
                snackbar.severity === 'error'
                  ? 'alert-circle'
                  : snackbar.severity === 'warning'
                    ? 'warning'
                    : snackbar.severity === 'success'
                      ? 'checkmark-circle'
                      : 'information-circle'
              }
              size={20}
              color={DesignSystem.colors.background.primary}
            />
            <Text style={styles.snackbarText}>{snackbar.message}</Text>
            <TouchableOpacity
              onPress={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              accessibilityRole="button"
              accessibilityLabel="Close notification"
              accessibilityHint="Tap to dismiss this notification"
            >
              <Ionicons name="close" size={20} color={DesignSystem.colors.background.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: DesignSystem.borderRadius.md,
    flex: 1,
    paddingVertical: DesignSystem.spacing.md,
  },
  chip: {
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: DesignSystem.borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.xs,
  },
  chipSelected: {
    backgroundColor: DesignSystem.colors.primary[500],
    borderColor: DesignSystem.colors.primary[500],
  },
  chipText: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.sm,
  },
  chipTextSelected: {
    color: DesignSystem.colors.text.inverse,
  },
  clearButton: {
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderColor: DesignSystem.colors.border.primary,
    borderWidth: 1,
  },
  clearButtonText: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.md,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  closeButton: {
    backgroundColor: DesignSystem.colors.primary[500],
  },
  closeButtonText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: DesignSystem.typography.sizes.md,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.xl,
  },
  emptyText: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.sizes.md,
    marginTop: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.error.light,
    borderRadius: DesignSystem.borderRadius.md,
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
    marginHorizontal: DesignSystem.spacing.md,
    marginVertical: DesignSystem.spacing.sm,
    padding: DesignSystem.spacing.md,
  },
  errorText: {
    color: DesignSystem.colors.error.main,
    flex: 1,
    fontSize: DesignSystem.typography.sizes.sm,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: 28,
    bottom: DesignSystem.spacing.lg,
    elevation: 8,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: DesignSystem.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 56,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: DesignSystem.borderRadius.md,
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  filterButtonText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  filterGroup: {
    gap: DesignSystem.spacing.sm,
  },
  filterLabel: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.md,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  filterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  filterSection: {
    gap: DesignSystem.spacing.lg,
  },
  header: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  headerButton: {
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: DesignSystem.borderRadius.sm,
    padding: DesignSystem.spacing.xs,
  },
  headerButtonSecondary: {
    backgroundColor: DesignSystem.colors.background.tertiary,
  },
  headerTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.xl,
    fontWeight: DesignSystem.typography.weights.bold,
  },
  itemsContainer: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  menuContainer: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderTopLeftRadius: DesignSystem.borderRadius.lg,
    borderTopRightRadius: DesignSystem.borderRadius.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  menuItemText: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.md,
  },
  menuOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalActions: {
    borderTopColor: DesignSystem.colors.border.primary,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  modalContainer: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: DesignSystem.spacing.lg,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  modalTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.bold,
  },
  pickerButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.sm,
  },
  pickerContainer: {
    flex: 1,
  },
  pickerModal: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    maxWidth: '80%',
    minWidth: 250,
    paddingVertical: DesignSystem.spacing.md,
  },
  pickerModalTitle: {
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.bold,
    marginBottom: DesignSystem.spacing.sm,
    paddingBottom: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  pickerOption: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  pickerOptionSelected: {
    backgroundColor: DesignSystem.colors.primary[100] || DesignSystem.colors.primary[500] + '20',
  },
  pickerOptionText: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.md,
  },
  pickerOptionTextSelected: {
    color: DesignSystem.colors.primary[500],
    fontWeight: DesignSystem.typography.weights.medium,
  },
  pickerOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  pickerText: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.md,
  },
  retryButton: {
    backgroundColor: DesignSystem.colors.error.main,
    borderRadius: DesignSystem.borderRadius.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  retryButtonText: {
    color: DesignSystem.colors.error.contrast,
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
  },
  searchFilterContainer: {
    backgroundColor: DesignSystem.colors.background.secondary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  searchInput: {
    color: DesignSystem.colors.text.primary,
    flex: 1,
    fontSize: DesignSystem.typography.sizes.md,
    marginLeft: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.sm,
  },
  snackbar: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.text.primary,
    borderRadius: DesignSystem.borderRadius.md,
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  snackbarContainer: {
    bottom: DesignSystem.spacing.lg,
    left: DesignSystem.spacing.md,
    position: 'absolute',
    right: DesignSystem.spacing.md,
  },
  snackbarError: {
    backgroundColor: DesignSystem.colors.error.main,
  },
  snackbarInfo: {
    backgroundColor: DesignSystem.colors.info?.main || '#2196f3',
  },
  snackbarSuccess: {
    backgroundColor: DesignSystem.colors.success?.main || '#4caf50',
  },
  snackbarText: {
    color: DesignSystem.colors.background.primary,
    flex: 1,
    fontSize: DesignSystem.typography.sizes.sm,
  },
  snackbarWarning: {
    backgroundColor: DesignSystem.colors.warning?.main || '#ff9800',
  },
  sortButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderRadius: DesignSystem.borderRadius.sm,
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  sortButtonText: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  sortContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  sortViewContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.sizes.sm,
    marginTop: DesignSystem.spacing.xs,
  },
  statValue: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.bold,
  },
  statsContainer: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: DesignSystem.spacing.sm,
  },
  viewToggleButton: {
    borderRadius: DesignSystem.borderRadius.sm,
    padding: DesignSystem.spacing.xs,
  },
  viewToggleButtonActive: {
    backgroundColor: DesignSystem.colors.primary[500],
  },
  viewToggleContainer: {
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderRadius: DesignSystem.borderRadius.sm,
    flexDirection: 'row',
    padding: 2,
  },
});

export default WardrobeScreen;
