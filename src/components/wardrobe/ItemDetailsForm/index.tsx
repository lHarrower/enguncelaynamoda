import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';
import { logInDev, errorInDev } from '@/utils/consoleSuppress';

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
  'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Activewear', 'Underwear'
];

const SUBCATEGORIES: { [key: string]: string[] } = {
  'Tops': ['T-Shirt', 'Blouse', 'Sweater', 'Hoodie', 'Tank Top', 'Crop Top', 'Shirt'],
  'Bottoms': ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Leggings', 'Sweatpants'],
  'Dresses': ['Casual Dress', 'Formal Dress', 'Maxi Dress', 'Mini Dress', 'Midi Dress'],
  'Outerwear': ['Jacket', 'Coat', 'Blazer', 'Cardigan', 'Vest', 'Trench Coat'],
  'Shoes': ['Sneakers', 'Heels', 'Flats', 'Boots', 'Sandals', 'Loafers'],
  'Accessories': ['Bag', 'Hat', 'Scarf', 'Belt', 'Jewelry', 'Sunglasses'],
  'Activewear': ['Sports Bra', 'Yoga Pants', 'Athletic Shorts', 'Running Shirt'],
  'Underwear': ['Bra', 'Underwear', 'Shapewear', 'Socks', 'Tights']
};

const AVAILABLE_COLORS = [
  'Black', 'White', 'Gray', 'Navy', 'Blue', 'Red', 'Pink', 'Purple', 'Green', 
  'Yellow', 'Orange', 'Brown', 'Beige', 'Cream', 'Gold', 'Silver', 'Multicolor'
];

const COLOR_HEX_MAP: { [key: string]: string } = {
  'Black': '#000000', 'White': '#FFFFFF', 'Gray': '#808080', 'Navy': '#000080',
  'Blue': '#0066CC', 'Red': '#FF0000', 'Pink': '#FF69B4', 'Purple': '#800080',
  'Green': '#008000', 'Yellow': '#FFD700', 'Orange': '#FFA500', 'Brown': '#8B4513',
  'Beige': '#F5F5DC', 'Cream': '#FFFDD0', 'Gold': '#DAA520', 'Silver': '#C0C0C0',
  'Multicolor': '#FF6B6B'
};

const SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '0', '2', '4', '6', '8', '10', '12', '14', '16'];

const ItemDetailsForm: React.FC<ItemDetailsFormProps> = ({
  processedImageUri,
  suggestedCategory,
  suggestedColors = [],
  onSave,
  onCancel
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
      errors: newErrors
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = category.trim() && selectedColors.length > 0;

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const handleSave = () => {
    logInDev('[ItemDetailsForm] handleSave function called');
    logInDev('[ItemDetailsForm] Form state:', {
      category: category.trim(),
      selectedColors,
      isFormValid,
      categoryLength: category.trim().length,
      colorsLength: selectedColors.length
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
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color="#B8918F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Item Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Processed Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: processedImageUri }} style={styles.processedImage} />
          <View style={styles.imageOverlay}>
            <Ionicons name="checkmark-circle" size={24} color="#9AA493" />
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
            >
              <Text style={[styles.dropdownText, !category && styles.placeholder]}>
                {category || 'Select category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#B8918F" />
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
                        setErrors(prev => ({ ...prev, category: '' }));
                      }
                    }}
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
              >
                <Text style={[styles.dropdownText, !subcategory && styles.placeholder]}>
                  {subcategory || 'Select subcategory (optional)'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#B8918F" />
              </TouchableOpacity>
              
              {showSubcategoryDropdown && (
                <View style={styles.dropdownList}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSubcategory('');
                      setShowSubcategoryDropdown(false);
                    }}
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
                      isSuggested && !isSelected && styles.colorTagSuggested
                    ]}
                    onPress={() => {
                      handleColorToggle(color);
                      // Clear colors error when selection is made
                      if (errors.colors && selectedColors.length === 0) {
                        setErrors(prev => ({ ...prev, colors: '' }));
                      }
                    }}
                  >
                    <View 
                      style={[
                        styles.colorDot, 
                        { backgroundColor: COLOR_HEX_MAP[color] },
                        color === 'White' && styles.whiteBorder
                      ]} 
                    />
                    <Text style={[
                      styles.colorTagText,
                      isSelected && styles.colorTagTextSelected
                    ]}>
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
              placeholderTextColor="#999999"
            />
          </View>

          {/* Size Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Size</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowSizeDropdown(!showSizeDropdown)}
            >
              <Text style={[styles.dropdownText, !size && styles.placeholder]}>
                {size || 'Select size (optional)'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#B8918F" />
            </TouchableOpacity>
            
            {showSizeDropdown && (
              <View style={styles.dropdownList}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSize('');
                    setShowSizeDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, styles.clearOption]}>
                    Clear selection
                  </Text>
                </TouchableOpacity>
                {SIZES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSize(s);
                      setShowSizeDropdown(false);
                    }}
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
              placeholderTextColor="#999999"
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
          >
            <Text style={styles.cancelActionButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.saveButton,
              !isFormValid && styles.saveButtonDisabled
            ]}
            onPress={() => {
              logInDev('[ItemDetailsForm] Save button pressed, isFormValid:', isFormValid);
              handleSave();
            }}
            disabled={!isFormValid}
          >
            <Ionicons 
              name="checkmark" 
              size={20} 
              color={isFormValid ? "#FFFFFF" : "#CCCCCC"} 
            />
            <Text style={[
              styles.saveButtonText,
              !isFormValid && styles.saveButtonTextDisabled
            ]}>
              Save Item
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2EFE9',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cancelButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7A6B56',
  },
  headerSpacer: {
    width: 40,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    position: 'relative',
  },
  processedImage: {
    width: screenWidth * 0.4,
    height: screenWidth * 0.5,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(242, 239, 233, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageStatus: {
    marginLeft: 6,
    fontSize: 12,
    color: '#9AA493',
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7A6B56',
    marginBottom: 8,
  },
  required: {
    color: '#FF6B6B',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  textAreaInput: {
    height: 80,
    paddingTop: 14,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: DesignSystem.colors.background.elevated,
  },
  dropdownText: {
    fontSize: 16,
    color: DesignSystem.colors.charcoal[700],
  },
  placeholder: {
    color: DesignSystem.colors.neutral[500],
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: DesignSystem.colors.charcoal[800],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border.secondary,
  },
  dropdownItemText: {
    fontSize: 16,
    color: DesignSystem.colors.charcoal[700],
  },
  clearOption: {
    color: DesignSystem.colors.neutral[500],
    fontStyle: 'italic',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
    backgroundColor: DesignSystem.colors.background.elevated,
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
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  whiteBorder: {
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
  },
  colorTagText: {
    fontSize: 14,
    color: DesignSystem.colors.charcoal[700],
  },
  colorTagTextSelected: {
    color: DesignSystem.colors.background.elevated,
  },
  suggestedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#9AA493',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestedBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  fieldError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cancelActionButton: {
    flex: 1,
    paddingVertical: 16,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8918F',
    alignItems: 'center',
  },
  cancelActionButtonText: {
    fontSize: 16,
    color: '#B8918F',
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#B8918F',
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  saveButtonTextDisabled: {
    color: '#CCCCCC',
  },
});

export default ItemDetailsForm;