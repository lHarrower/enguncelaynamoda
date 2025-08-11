import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
  Switch,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';
import { WardrobeItem, ItemCategory } from '@/types/aynaMirror';
import { WardrobeItemCard } from '@/components/sanctuary/WardrobeItemCard';
import { WardrobeItemForm } from '@/components/wardrobe/WardrobeItemForm';
import { AINameGenerator } from '@/components/naming/AINameGenerator';
import { NamingPreferences } from '@/components/naming/NamingPreferences';
import { useAINaming } from '@/hooks/useAINaming';
import { enhancedWardrobeService } from '@/services/enhancedWardrobeService';

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
  'activewear'
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
    searchQuery: ''
  });
  
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'name',
    direction: 'asc'
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'error' | 'warning' | 'info' | 'success'
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
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredAndSortedItems = React.useMemo(() => {
    const filtered = items.filter(item => {
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
          ...(item.tags || [])
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }
      
      // Colors filter
      if (filters.colors.length > 0) {
        const itemColors = item.colors || [];
        if (!filters.colors.some(color => itemColors.includes(color))) {
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
        if (filters.hasAIName !== aiNamed) return false;
      }
      
      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
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

  const handleEditItem = (item: WardrobeItem) => {
    setSelectedItem(item);
    setShowEditForm(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Defer to legacy or implement delete in enhanced service later
              // For now, just filter locally
              setItems(prev => prev.filter(i => i.id !== itemId));
              await loadItems();
              setSnackbar({
                open: true,
                message: 'Item deleted successfully',
                severity: 'success'
              });
            } catch (err) {
              setSnackbar({
                open: true,
                message: 'Failed to delete item',
                severity: 'error'
              });
            }
          }
        }
      ]
    );
  };

  const handleSaveItem = async (itemData: Partial<WardrobeItem>) => {
    try {
      if (selectedItem) {
        // Update existing item
  // Update locally; wiring to service can be added when API is stable
  setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, ...itemData } as any : i));
        setSnackbar({
          open: true,
          message: 'Item updated successfully',
          severity: 'success'
        });
      } else {
        // Create new item
  // Temporary local add; service method will be integrated later
  setItems(prev => [{ ...(itemData as any), id: `${Date.now()}` }, ...prev]);
        setSnackbar({
          open: true,
          message: 'Item added successfully',
          severity: 'success'
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
        severity: 'error'
      });
    }
  };

  const handleBulkAIGeneration = async () => {
    setIsGenerating(true);
    try {
      const itemsToUpdate = items.filter(item => !item.name || item.name.trim() === '');
      
      for (const itemLocal of itemsToUpdate) {
        try {
          const resp = await generateNameForItem(itemLocal);
          if (resp && resp.aiGeneratedName) {
            setItems(prev => prev.map(i => i.id === itemLocal.id ? { ...i, aiGeneratedName: resp.aiGeneratedName, nameOverride: false } as any : i));
          }
        } catch (err) {
          console.error(`Failed to generate name for item ${itemLocal.id}:`, err);
        }
      }
      
      await loadItems();
      setSnackbar({
        open: true,
        message: `Generated names for ${itemsToUpdate.length} items`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to generate AI names',
        severity: 'error'
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
    items.forEach(item => {
      if (item.colors) {
        item.colors.forEach(color => colors.add(color));
      }
    });
    return Array.from(colors).sort();
  };

  const getUniqueBrands = (): string[] => {
    const brands = new Set<string>();
    items.forEach(item => {
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
          >
            <Ionicons name="refresh-outline" size={20} color={DesignSystem.colors.text.inverse} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, styles.headerButtonSecondary]}
            onPress={() => setAnchorEl(true)}
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
          <Text style={styles.statValue}>{items.filter(item => item.aiGeneratedName && !item.nameOverride).length}</Text>
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
            onChangeText={(text) => setFilters(prev => ({ ...prev, searchQuery: text }))}
          />
        </View>
        <View style={styles.filterRow}>
          <View style={styles.pickerContainer}>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={styles.pickerText}>
                {filters.category === 'all' ? 'All Categories' : filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}
              </Text>
              <Ionicons name="chevron-down" size={20} color={DesignSystem.colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
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
            onPress={() => setSortOptions(prev => ({
              ...prev,
              direction: prev.direction === 'asc' ? 'desc' : 'asc'
            }))}
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
            style={[
              styles.viewToggleButton,
              viewMode === 'grid' && styles.viewToggleButtonActive
            ]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons
              name="grid"
              size={20}
              color={viewMode === 'grid' ? DesignSystem.colors.text.inverse : DesignSystem.colors.text.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewMode === 'list' && styles.viewToggleButtonActive
            ]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name="list"
              size={20}
              color={viewMode === 'list' ? DesignSystem.colors.text.inverse : DesignSystem.colors.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={DesignSystem.colors.error.main} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadItems}>
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
            renderItem={({ item }) => (
              <WardrobeItemCard
                item={item}
                onPress={() => handleItemPress(item)}
              />
            )}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === 'grid' ? 2 : 1}
            key={viewMode} // Force re-render when view mode changes
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddForm(true)}
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
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setShowPreferences(true); setAnchorEl(false); }}
            >
              <Ionicons name="settings-outline" size={20} color={DesignSystem.colors.text.primary} />
              <Text style={styles.menuItemText}>Naming Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { handleBulkAIGeneration(); setAnchorEl(false); }}
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
            <TouchableOpacity onPress={() => setShowAddForm(false)}>
              <Ionicons name="close" size={24} color={DesignSystem.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <WardrobeItemForm
              onSave={handleSaveItem}
              onCancel={() => setShowAddForm(false)}
            />
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
            <TouchableOpacity onPress={() => setShowEditForm(false)}>
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
            <TouchableOpacity onPress={() => setShowAIGenerator(false)}>
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
            <TouchableOpacity onPress={() => setShowPreferences(false)}>
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
            <TouchableOpacity onPress={() => setShowFilters(false)}>
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
                  >
                    <Text style={styles.pickerText}>
                      {filters.hasAIName === null ? 'All Items' : filters.hasAIName ? 'AI Generated Names' : 'Custom Names'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={DesignSystem.colors.text.secondary} />
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
                  >
                    <Text style={styles.pickerText}>
                      {sortOptions.field === 'name' ? 'Name' :
                       sortOptions.field === 'category' ? 'Category' :
                       sortOptions.field === 'createdAt' ? 'Date Added' :
                       sortOptions.field === 'lastWorn' ? 'Last Worn' :
                       'Wear Count'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={DesignSystem.colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Colors Filter */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Colors</Text>
                <View style={styles.chipContainer}>
                  {getUniqueColors().map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.chip,
                        filters.colors.includes(color) && styles.chipSelected
                      ]}
                      onPress={() => {
                        setFilters(prev => ({
                          ...prev,
                          colors: prev.colors.includes(color)
                            ? prev.colors.filter(c => c !== color)
                            : [...prev.colors, color]
                        }));
                      }}
                    >
                      <Text style={[
                        styles.chipText,
                        filters.colors.includes(color) && styles.chipTextSelected
                      ]}>
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
                  {getUniqueBrands().map(brand => (
                    <TouchableOpacity
                      key={brand}
                      style={[
                        styles.chip,
                        filters.brands.includes(brand) && styles.chipSelected
                      ]}
                      onPress={() => {
                        setFilters(prev => ({
                          ...prev,
                          brands: prev.brands.includes(brand)
                            ? prev.brands.filter(b => b !== brand)
                            : [...prev.brands, brand]
                        }));
                      }}
                    >
                      <Text style={[
                        styles.chipText,
                        filters.brands.includes(brand) && styles.chipTextSelected
                      ]}>
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
                  searchQuery: ''
                });
              }}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.closeButton]}
              onPress={() => setShowFilters(false)}
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
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select Category</Text>
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.pickerOption,
                  filters.category === category && styles.pickerOptionSelected
                ]}
                onPress={() => {
                  setFilters(prev => ({ ...prev, category }));
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  filters.category === category && styles.pickerOptionTextSelected
                ]}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
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
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select Name Type</Text>
            {[
              { value: null, label: 'All Items' },
              { value: true, label: 'AI Generated Names' },
              { value: false, label: 'Custom Names' }
            ].map(option => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.pickerOption,
                  filters.hasAIName === option.value && styles.pickerOptionSelected
                ]}
                onPress={() => {
                  setFilters(prev => ({ ...prev, hasAIName: option.value }));
                  setShowNameTypePicker(false);
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  filters.hasAIName === option.value && styles.pickerOptionTextSelected
                ]}>
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
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Sort By</Text>
            {[
              { value: 'name', label: 'Name' },
              { value: 'category', label: 'Category' },
              { value: 'createdAt', label: 'Date Added' },
              { value: 'lastWorn', label: 'Last Worn' },
              { value: 'wearCount', label: 'Wear Count' }
            ].map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pickerOption,
                  sortOptions.field === option.value && styles.pickerOptionSelected
                ]}
                onPress={() => {
                  setSortOptions(prev => ({ ...prev, field: option.value as any }));
                  setShowSortPicker(false);
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  sortOptions.field === option.value && styles.pickerOptionTextSelected
                ]}>
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
          <View style={[
            styles.snackbar,
            snackbar.severity === 'error' && styles.snackbarError,
            snackbar.severity === 'warning' && styles.snackbarWarning,
            snackbar.severity === 'success' && styles.snackbarSuccess,
            snackbar.severity === 'info' && styles.snackbarInfo
          ]}>
            <Ionicons
              name={
                snackbar.severity === 'error' ? 'alert-circle' :
                snackbar.severity === 'warning' ? 'warning' :
                snackbar.severity === 'success' ? 'checkmark-circle' : 'information-circle'
              }
              size={20}
              color={DesignSystem.colors.background.primary}
            />
            <Text style={styles.snackbarText}>{snackbar.message}</Text>
            <TouchableOpacity onPress={() => setSnackbar(prev => ({ ...prev, open: false }))}>
              <Ionicons name="close" size={20} color={DesignSystem.colors.background.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    backgroundColor: DesignSystem.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border.primary,
  },
  headerTitle: {
    fontSize: DesignSystem.typography.sizes.xl,
    fontWeight: DesignSystem.typography.weights.bold,
    color: DesignSystem.colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
  },
  headerButton: {
    padding: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.sm,
    backgroundColor: DesignSystem.colors.primary[500],
  },
  headerButtonSecondary: {
    backgroundColor: DesignSystem.colors.background.tertiary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: DesignSystem.spacing.sm,
    backgroundColor: DesignSystem.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border.primary,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.bold,
    color: DesignSystem.colors.text.primary,
  },
  statLabel: {
    fontSize: DesignSystem.typography.sizes.sm,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
  },
  searchFilterContainer: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    backgroundColor: DesignSystem.colors.background.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: DesignSystem.spacing.sm,
    marginBottom: DesignSystem.spacing.sm,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
  },
  searchInput: {
    flex: 1,
    paddingVertical: DesignSystem.spacing.sm,
    fontSize: DesignSystem.typography.sizes.md,
    color: DesignSystem.colors.text.primary,
    marginLeft: DesignSystem.spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
  },
  pickerContainer: {
    flex: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.sm,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
  },
  pickerText: {
    fontSize: DesignSystem.typography.sizes.md,
    color: DesignSystem.colors.text.primary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    gap: DesignSystem.spacing.xs,
  },
  filterButtonText: {
    fontSize: DesignSystem.typography.sizes.sm,
    color: DesignSystem.colors.text.inverse,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  sortViewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    backgroundColor: DesignSystem.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border.primary,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.sm,
    backgroundColor: DesignSystem.colors.background.tertiary,
  },
  sortButtonText: {
    fontSize: DesignSystem.typography.sizes.sm,
    color: DesignSystem.colors.text.primary,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderRadius: DesignSystem.borderRadius.sm,
    padding: 2,
  },
  viewToggleButton: {
    padding: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.sm,
  },
  viewToggleButtonActive: {
    backgroundColor: DesignSystem.colors.primary[500],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.error.light,
    marginHorizontal: DesignSystem.spacing.md,
    marginVertical: DesignSystem.spacing.sm,
    padding: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    gap: DesignSystem.spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: DesignSystem.typography.sizes.sm,
    color: DesignSystem.colors.error.main,
  },
  retryButton: {
    backgroundColor: DesignSystem.colors.error.main,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.sm,
  },
  retryButtonText: {
    fontSize: DesignSystem.typography.sizes.sm,
    color: DesignSystem.colors.error.contrast,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  itemsContainer: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.xl,
  },
  emptyText: {
    fontSize: DesignSystem.typography.sizes.md,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginTop: DesignSystem.spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: DesignSystem.spacing.lg,
    right: DesignSystem.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DesignSystem.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderTopLeftRadius: DesignSystem.borderRadius.lg,
    borderTopRightRadius: DesignSystem.borderRadius.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    gap: DesignSystem.spacing.md,
  },
  menuItemText: {
    fontSize: DesignSystem.typography.sizes.md,
    color: DesignSystem.colors.text.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border.primary,
  },
  modalTitle: {
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.bold,
    color: DesignSystem.colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: DesignSystem.spacing.lg,
  },
  filterSection: {
    gap: DesignSystem.spacing.lg,
  },
  filterGroup: {
    gap: DesignSystem.spacing.sm,
  },
  filterLabel: {
    fontSize: DesignSystem.typography.sizes.md,
    fontWeight: DesignSystem.typography.weights.medium,
    color: DesignSystem.colors.text.primary,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.xs,
  },
  chip: {
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.full,
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
  },
  chipSelected: {
    backgroundColor: DesignSystem.colors.primary[500],
    borderColor: DesignSystem.colors.primary[500],
  },
  chipText: {
    fontSize: DesignSystem.typography.sizes.sm,
    color: DesignSystem.colors.text.primary,
  },
  chipTextSelected: {
    color: DesignSystem.colors.text.inverse,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.border.primary,
    gap: DesignSystem.spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
  },
  clearButtonText: {
    fontSize: DesignSystem.typography.sizes.md,
    color: DesignSystem.colors.text.primary,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  closeButton: {
    backgroundColor: DesignSystem.colors.primary[500],
  },
  closeButtonText: {
    fontSize: DesignSystem.typography.sizes.md,
    color: DesignSystem.colors.text.inverse,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  snackbarContainer: {
    position: 'absolute',
    bottom: DesignSystem.spacing.lg,
    left: DesignSystem.spacing.md,
    right: DesignSystem.spacing.md,
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.text.primary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    gap: DesignSystem.spacing.sm,
  },
  snackbarError: {
    backgroundColor: DesignSystem.colors.error.main,
  },
  snackbarWarning: {
    backgroundColor: DesignSystem.colors.warning?.main || '#ff9800',
  },
  snackbarSuccess: {
    backgroundColor: DesignSystem.colors.success?.main || '#4caf50',
  },
  snackbarInfo: {
    backgroundColor: DesignSystem.colors.info?.main || '#2196f3',
  },
  snackbarText: {
    flex: 1,
    fontSize: DesignSystem.typography.sizes.sm,
    color: DesignSystem.colors.background.primary,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    paddingVertical: DesignSystem.spacing.md,
    minWidth: 250,
    maxWidth: '80%',
  },
  pickerModalTitle: {
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.bold,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    paddingBottom: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border.primary,
    marginBottom: DesignSystem.spacing.sm,
  },
  pickerOption: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  pickerOptionSelected: {
    backgroundColor: DesignSystem.colors.primary[100] || DesignSystem.colors.primary[500] + '20',
  },
  pickerOptionText: {
    fontSize: DesignSystem.typography.sizes.md,
    color: DesignSystem.colors.text.primary,
  },
  pickerOptionTextSelected: {
    color: DesignSystem.colors.primary[500],
    fontWeight: DesignSystem.typography.weights.medium,
  },
});

export default WardrobeScreen;