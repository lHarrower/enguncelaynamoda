import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DesignSystem } from '@/theme/DesignSystem';
import { logInDev } from '@/utils/consoleSuppress';

const { width: screenWidth } = Dimensions.get('window');

// Updated interface to match the NewClothingItem interface from the service
interface ClothingItemSubmission {
  image_uri: string;
  processed_image_uri: string;
  category: string;
  subcategory?: string;
  colors: string[];
  brand?: string;
  size?: string;
  notes?: string;
}

interface ItemDetailsFormProps {
  processedImageUri: string;
  suggestedCategory?: string;
  suggestedColors?: string[];
  onSave: (itemData: ClothingItemSubmission) => void;
  onCancel: () => void;
}

// Predefined options for better UX
const CATEGORIES = [
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Accessories',
  'Activewear',
  'Underwear',
];

const SUBCATEGORIES: { [key: string]: string[] } = {
  Tops: ['T-Shirt', 'Blouse', 'Sweater', 'Hoodie', 'Tank Top', 'Crop Top', 'Shirt'],
  Bottoms: ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Leggings', 'Sweatpants'],
  Dresses: ['Casual Dress', 'Formal Dress', 'Maxi Dress', 'Mini Dress', 'Midi Dress'],
  Outerwear: ['Jacket', 'Coat', 'Blazer', 'Cardigan', 'Vest', 'Trench Coat'],
  Shoes: ['Sneakers', 'Heels', 'Flats', 'Boots', 'Sandals', 'Loafers'],
  Accessories: ['Bag', 'Hat', 'Scarf', 'Belt', 'Jewelry', 'Sunglasses'],
  Activewear: ['Sports Bra', 'Yoga Pants', 'Athletic Shorts', 'Running Shirt'],
  Underwear: ['Bra', 'Underwear', 'Shapewear', 'Socks', 'Tights'],
};

const AVAILABLE_COLORS = [
  'Black',
  'White',
  'Gray',
  'Navy',
  'Blue',
  'Red',
  'Pink',
  'Purple',
  'Green',
  'Yellow',
  'Orange',
  'Brown',
  'Beige',
  'Cream',
  'Gold',
  'Silver',
  'Multicolor',
];

const COLOR_HEX_MAP: { [key: string]: string } = {
  Black: '#000000',
  White: '#FFFFFF',
  Gray: '#808080',
  Navy: '#000080',
  Blue: '#0066CC',
  Red: '#FF0000',
  Pink: '#FF69B4',
  Purple: '#800080',
  Green: '#008000',
  Yellow: '#FFD700',
  Orange: '#FFA500',
  Brown: '#8B4513',
  Beige: '#F5F5DC',
  Cream: '#FFFDD0',
  Gold: '#DAA520',
  Silver: '#C0C0C0',
  Multicolor: '#FF6B6B',
};

const SIZES = [
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '0',
  '2',
  '4',
  '6',
  '8',
  '10',
  '12',
  '14',
  '16',
];

const ItemDetailsForm: React.FC<ItemDetailsFormProps> = ({
  processedImageUri,
  suggestedCategory,
  suggestedColors = [],
  onSave,
  onCancel,
}) => {
  // Form state
  const [category, setCategory] = useState(suggestedCategory || '');
  const [subcategory, setSubcategory] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>(suggestedColors);
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (selectedColors.length === 0) {
      newErrors.colors = 'Please select at least one color';
    }

    logInDev('[ItemDetailsForm] Validation check:', {
      category: category.trim(),
      categoryValid: !!category.trim(),
      selectedColors,
      colorsValid: selectedColors.length > 0,
      errors: newErrors,
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = category.trim() && selectedColors.length > 0;

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const handleSave = () => {
    logInDev('[ItemDetailsForm] handleSave function called');
    logInDev('[ItemDetailsForm] Form state:', {
      category: category.trim(),
      selectedColors,
      isFormValid,
      categoryLength: category.trim().length,
      colorsLength: selectedColors.length,
    });

    if (!validateForm()) {
      logInDev('[ItemDetailsForm] Validation failed, showing alert');
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    logInDev('[ItemDetailsForm] Validation passed, preparing item data');

    // Updated to use snake_case keys matching the NewClothingItem interface
    const itemData: ClothingItemSubmission = {
      image_uri: processedImageUri, // Changed from imageUri
      processed_image_uri: processedImageUri, // Changed from processedImageUri
      category: category.trim(),
      subcategory: subcategory.trim() || undefined,
      colors: selectedColors,
      brand: brand.trim() || undefined,
      size: size.trim() || undefined,
      notes: notes.trim() || undefined,
      // Removed id and dateAdded as they're handled by Supabase automatically
    };

    logInDev('[ItemDetailsForm] Calling onSave with data:', itemData);
    onSave(itemData);
    logInDev('[ItemDetailsForm] onSave called successfully');
  };

  const availableSubcategories = SUBCATEGORIES[category] || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            accessibilityHint="Tap to cancel and go back"
          >
            <Ionicons name="close" size={24} color={DesignSystem.colors.terracotta[400]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Item Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Processed Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: processedImageUri }} style={styles.processedImage} />
          <View style={styles.imageOverlay}>
            <Ionicons name="checkmark-circle" size={24} color={DesignSystem.colors.sage[400]} />
            <Text style={styles.imageStatus}>Background Removed ✨</Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Category Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.dropdown, errors.category && styles.fieldError]}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              accessibilityRole="button"
              accessibilityLabel={category ? `Selected category: ${category}` : 'Select category'}
              accessibilityHint="Tap to open category selection dropdown"
              accessibilityState={{ expanded: showCategoryDropdown }}
            >
              <Text style={[styles.dropdownText, !category && styles.placeholder]}>
                {category || 'Select category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={DesignSystem.colors.terracotta[400]} />
            </TouchableOpacity>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

            {showCategoryDropdown && (
              <View style={styles.dropdownList}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCategory(cat);
                      setSubcategory(''); // Reset subcategory when category changes
                      setShowCategoryDropdown(false);
                      // Clear category error when selection is made
                      if (errors.category) {
                        setErrors((prev) => ({ ...prev, category: '' }));
                      }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${cat} category`}
                    accessibilityHint="Tap to select this category"
                  >
                    <Text style={styles.dropdownItemText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Subcategory Field */}
          {availableSubcategories.length > 0 && (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Subcategory</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowSubcategoryDropdown(!showSubcategoryDropdown)}
                accessibilityRole="button"
                accessibilityLabel={
                  subcategory
                    ? `Selected subcategory: ${subcategory}`
                    : 'Select subcategory (optional)'
                }
                accessibilityHint="Tap to open subcategory selection dropdown"
                accessibilityState={{ expanded: showSubcategoryDropdown }}
              >
                <Text style={[styles.dropdownText, !subcategory && styles.placeholder]}>
                  {subcategory || 'Select subcategory (optional)'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={DesignSystem.colors.terracotta[400]}
                />
              </TouchableOpacity>

              {showSubcategoryDropdown && (
                <View style={styles.dropdownList}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSubcategory('');
                      setShowSubcategoryDropdown(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Clear subcategory selection"
                    accessibilityHint="Tap to clear the selected subcategory"
                  >
                    <Text style={[styles.dropdownItemText, styles.clearOption]}>
                      Clear selection
                    </Text>
                  </TouchableOpacity>
                  {(availableSubcategories || []).map((subcat) => (
                    <TouchableOpacity
                      key={subcat}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSubcategory(subcat);
                        setShowSubcategoryDropdown(false);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${subcat} subcategory`}
                      accessibilityHint="Tap to select this subcategory"
                    >
                      <Text style={styles.dropdownItemText}>{subcat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Colors Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Colors <Text style={styles.required}>*</Text>
            </Text>
            {errors.colors && <Text style={styles.errorText}>{errors.colors}</Text>}
            <View style={styles.colorGrid}>
              {AVAILABLE_COLORS.map((color) => {
                const isSelected = selectedColors.includes(color);
                const isSuggested = suggestedColors.includes(color);

                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorTag,
                      isSelected && styles.colorTagSelected,
                      isSuggested && !isSelected && styles.colorTagSuggested,
                    ]}
                    onPress={() => {
                      handleColorToggle(color);
                      // Clear colors error when selection is made
                      if (errors.colors && selectedColors.length === 0) {
                        setErrors((prev) => ({ ...prev, colors: '' }));
                      }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${color} color ${isSelected ? 'selected' : 'not selected'}${isSuggested ? ', AI suggested' : ''}`}
                    accessibilityHint={`Tap to ${isSelected ? 'deselect' : 'select'} ${color} color`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: COLOR_HEX_MAP[color] },
                        color === 'White' && styles.whiteBorder,
                      ]}
                    />
                    <Text style={[styles.colorTagText, isSelected && styles.colorTagTextSelected]}>
                      {color}
                    </Text>
                    {isSuggested && !isSelected && (
                      <View style={styles.suggestedBadge}>
                        <Text style={styles.suggestedBadgeText}>AI</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Brand Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Brand</Text>
            <TextInput
              style={styles.textInput}
              value={brand}
              onChangeText={setBrand}
              placeholder="e.g., Zara, H&M, Nike (optional)"
              placeholderTextColor={DesignSystem.colors.text.secondary}
            />
          </View>

          {/* Size Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Size</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowSizeDropdown(!showSizeDropdown)}
              accessibilityRole="button"
              accessibilityLabel={size ? `Selected size: ${size}` : 'Select size (optional)'}
              accessibilityHint="Tap to open size selection dropdown"
              accessibilityState={{ expanded: showSizeDropdown }}
            >
              <Text style={[styles.dropdownText, !size && styles.placeholder]}>
                {size || 'Select size (optional)'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={DesignSystem.colors.terracotta[400]} />
            </TouchableOpacity>

            {showSizeDropdown && (
              <View style={styles.dropdownList}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSize('');
                    setShowSizeDropdown(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Clear size selection"
                  accessibilityHint="Tap to clear the selected size"
                >
                  <Text style={[styles.dropdownItemText, styles.clearOption]}>Clear selection</Text>
                </TouchableOpacity>
                {SIZES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSize(s);
                      setShowSizeDropdown(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select size ${s}`}
                    accessibilityHint="Tap to select this size"
                  >
                    <Text style={styles.dropdownItemText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Notes Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional details... (optional)"
              placeholderTextColor={DesignSystem.colors.text.secondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.cancelActionButton}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            accessibilityHint="Tap to cancel and discard changes"
          >
            <Text style={styles.cancelActionButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
            onPress={() => {
              logInDev('[ItemDetailsForm] Save button pressed, isFormValid:', isFormValid);
              handleSave();
            }}
            disabled={!isFormValid}
            accessibilityRole="button"
            accessibilityLabel="Save Item"
            accessibilityHint={
              isFormValid
                ? 'Tap to save the item to your wardrobe'
                : 'Complete required fields to enable saving'
            }
            accessibilityState={{ disabled: !isFormValid }}
          >
            <Ionicons
              name="checkmark"
              size={20}
              color={
                isFormValid ? DesignSystem.colors.text.inverse : DesignSystem.colors.neutral[400]
              }
            />
            <Text style={[styles.saveButtonText, !isFormValid && styles.saveButtonTextDisabled]}>
              Save Item
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cancelActionButton: {
    alignItems: 'center',
    borderColor: DesignSystem.colors.terracotta[400],
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    marginRight: 12,
    paddingVertical: 16,
  },
  cancelActionButtonText: {
    color: DesignSystem.colors.terracotta[400],
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 8,
  },
  clearOption: {
    color: DesignSystem.colors.neutral[500],
    fontStyle: 'italic',
  },
  colorDot: {
    borderRadius: 6,
    height: 12,
    marginRight: 6,
    width: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorTag: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.elevated,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    margin: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'relative',
  },
  colorTagSelected: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderColor: DesignSystem.colors.sage[500],
  },
  colorTagSuggested: {
    borderColor: DesignSystem.colors.gold[500],
    borderWidth: 2,
  },
  colorTagText: {
    color: DesignSystem.colors.charcoal[700],
    fontSize: 14,
  },
  colorTagTextSelected: {
    color: DesignSystem.colors.background.elevated,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.secondary,
    flex: 1,
  },
  dropdown: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.elevated,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownItem: {
    borderBottomColor: DesignSystem.colors.border.secondary,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    color: DesignSystem.colors.charcoal[700],
    fontSize: 16,
  },
  dropdownList: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 5,
    left: 0,
    maxHeight: 200,
    position: 'absolute',
    right: 0,
    shadowColor: DesignSystem.colors.charcoal[800],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    top: '100%',
    zIndex: 1000,
  },
  dropdownText: {
    color: DesignSystem.colors.charcoal[700],
    fontSize: 16,
  },
  errorText: {
    color: DesignSystem.colors.error.main,
    fontSize: 12,
    marginTop: 4,
  },
  fieldContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  fieldError: {
    borderColor: DesignSystem.colors.error.main,
  },
  fieldLabel: {
    color: DesignSystem.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    color: '#7A6B56',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    position: 'relative',
  },
  imageOverlay: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary + 'F2',
    borderRadius: 20,
    bottom: 10,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
  },
  imageStatus: {
    color: DesignSystem.colors.sage[400],
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  placeholder: {
    color: DesignSystem.colors.neutral[500],
  },
  processedImage: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: 12,
    height: screenWidth * 0.5,
    width: screenWidth * 0.4,
  },
  required: {
    color: DesignSystem.colors.error.main,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.terracotta[400],
    borderRadius: 12,
    elevation: 6,
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    shadowColor: DesignSystem.colors.terracotta[400],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: DesignSystem.colors.neutral[300],
    elevation: 0,
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  saveButtonTextDisabled: {
    color: DesignSystem.colors.neutral[400],
  },
  scrollContent: {
    paddingBottom: 100,
  },
  suggestedBadge: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.sage[400],
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    top: -4,
    width: 16,
  },
  suggestedBadgeText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: 10,
    fontWeight: 'bold',
  },
  textAreaInput: {
    height: 80,
    paddingTop: 14,
  },
  textInput: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: 12,
    borderWidth: 1,
    color: DesignSystem.colors.text.primary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  whiteBorder: {
    borderColor: DesignSystem.colors.border.primary,
    borderWidth: 1,
  },
});

export default ItemDetailsForm;
