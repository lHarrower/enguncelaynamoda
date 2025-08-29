// Enhanced Wardrobe Item Form with AI Naming
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AINameGenerator } from '@/components/naming/AINameGenerator';
import { supabase } from '@/config/supabaseClient';
import { useAINaming } from '@/hooks/useAINaming';
import { enhancedWardrobeService } from '@/services/enhancedWardrobeService';
import { DesignSystem } from '@/theme/DesignSystem';
import { ItemCategory, WardrobeItem } from '@/types/aynaMirror';
import { errorInDev } from '@/utils/consoleSuppress';

interface WardrobeItemFormProps {
  item?: Partial<WardrobeItem>;
  onSave: (item: WardrobeItem) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const CATEGORIES: ItemCategory[] = [
  'tops',
  'bottoms',
  'dresses',
  'shoes',
  'accessories',
  'outerwear',
  'activewear',
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12'];

export const WardrobeItemForm: React.FC<WardrobeItemFormProps> = ({
  item,
  onSave,
  onCancel,
  isEditing = false,
}) => {
  const { getEffectiveName } = useAINaming();

  const [formData, setFormData] = useState({
    name: item?.name || '',
    aiGeneratedName: item?.aiGeneratedName || '',
    nameOverride: item?.nameOverride || false,
    category: item?.category || ('tops' as ItemCategory),
    subcategory: item?.subcategory || '',
    colors: item?.colors || [],
    brand: item?.brand || '',
    size: item?.size || '',
    purchaseDate: item?.purchaseDate ? new Date(item.purchaseDate).toISOString().slice(0, 10) : '',
    purchasePrice: typeof item?.purchasePrice === 'number' ? item?.purchasePrice : 0,
    tags: item?.tags || [],
    notes: item?.notes || '',
    imageUri: item?.imageUri || '',
  });

  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAINaming, setShowAINaming] = useState(false);
  const [useAIName, setUseAIName] = useState(!item?.name && !item?.nameOverride);

  // Auto-open AI naming for new items with images
  useEffect(() => {
    if (!isEditing && formData.imageUri && !formData.name && !formData.aiGeneratedName) {
      setShowAINaming(true);
    }
  }, [isEditing, formData.imageUri, formData.name, formData.aiGeneratedName]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // If user manually enters a name, mark as override
    if (field === 'name' && value.trim()) {
      setFormData((prev) => ({ ...prev, nameOverride: true }));
      setUseAIName(false);
    }
  };

  const handleSelectChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor.trim()],
      }));
      setNewColor('');
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color !== colorToRemove),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAINameSelected = (name: string, isAIGenerated: boolean) => {
    setFormData((prev) => ({
      ...prev,
      name: isAIGenerated ? '' : name,
      aiGeneratedName: isAIGenerated ? name : prev.aiGeneratedName,
      nameOverride: !isAIGenerated,
    }));
    setUseAIName(isAIGenerated);
    setShowAINaming(false);
  };

  // Helper function to validate form data
  const validateFormData = () => {
    if (!formData.imageUri) {
      throw new Error('Image is required');
    }
    if (!formData.name && !formData.aiGeneratedName) {
      throw new Error('Item name is required');
    }
  };

  // Helper function to prepare item data
  const prepareItemData = (): Partial<WardrobeItem> => {
    return {
      ...item,
      name: formData.name,
      aiGeneratedName: formData.aiGeneratedName,
      nameOverride: formData.nameOverride,
      category: formData.category,
      subcategory: formData.subcategory || undefined,
      colors: formData.colors,
      brand: formData.brand || undefined,
      size: formData.size || undefined,
      purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
      purchasePrice:
        typeof formData.purchasePrice === 'number'
          ? formData.purchasePrice
          : parseFloat(String(formData.purchasePrice)) || undefined,
      tags: formData.tags,
      notes: formData.notes || undefined,
      imageUri: formData.imageUri,
    };
  };

  // Helper function to update existing item
  const updateExistingItem = async (itemData: Partial<WardrobeItem>) => {
    const { error: updateError } = await supabase
      .from('wardrobe_items')
      .update({
        name: itemData.name,
        ai_generated_name: itemData.aiGeneratedName,
        name_override: itemData.nameOverride,
        category: itemData.category,
        subcategory: itemData.subcategory,
        colors: itemData.colors,
        brand: itemData.brand,
        size: itemData.size,
        purchase_date: itemData.purchaseDate
          ? itemData.purchaseDate.toISOString().slice(0, 10)
          : undefined,
        purchase_price: itemData.purchasePrice,
        tags: itemData.tags,
        notes: itemData.notes,
      })
      .eq('id', item!.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    onSave(itemData as WardrobeItem);
  };

  // Helper function to create new item
  const createNewItem = async (itemData: Partial<WardrobeItem>) => {
    const newItemData = await enhancedWardrobeService.saveClothingItem(
      {
        image_uri: itemData.imageUri!,
        processed_image_uri: itemData.imageUri!,
        category: itemData.category!,
        subcategory: itemData.subcategory,
        colors: itemData.colors!,
        brand: itemData.brand,
        size: itemData.size,
        purchase_date: itemData.purchaseDate
          ? itemData.purchaseDate.toISOString().slice(0, 10)
          : undefined,
        purchase_price: itemData.purchasePrice,
        tags: itemData.tags,
        notes: itemData.notes,
        name: itemData.name,
        ai_generated_name: itemData.aiGeneratedName,
        name_override: itemData.nameOverride,
      },
      false,
    );

    onSave({
      ...itemData,
      id: newItemData.id,
      userId: newItemData.user_id,
      createdAt: new Date(newItemData.created_at),
      updatedAt: new Date(newItemData.updated_at),
    } as WardrobeItem);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      validateFormData();
      const itemData = prepareItemData();

      if (isEditing && item?.id) {
        await updateExistingItem(itemData);
      } else {
        await createNewItem(itemData);
      }
    } catch (err) {
      errorInDev('Error saving item:', err instanceof Error ? err : String(err));
      setError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const getDisplayName = () => {
    if (formData.name && formData.nameOverride) {
      return formData.name;
    }
    if (formData.aiGeneratedName) {
      return formData.aiGeneratedName;
    }
    return 'Unnamed Item';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{isEditing ? 'Edit Item' : 'Add New Item'}</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Item Image */}
        {formData.imageUri && (
          <View style={styles.imageContainer}>
            <View style={styles.imagePaper}>
              <Text>Image Preview</Text>
              {/* Note: Image component would need proper implementation */}
            </View>
          </View>
        )}

        {/* Item Name Section */}
        <View style={styles.nameSection}>
          <View style={styles.nameHeader}>
            <Text style={styles.sectionTitle}>Item Name</Text>
            {formData.imageUri && (
              <TouchableOpacity
                style={styles.aiButton}
                onPress={() => setShowAINaming(true)}
                accessibilityRole="button"
                accessibilityLabel="Generate AI name"
                accessibilityHint="Tap to generate an AI-powered name for this item"
              >
                <Ionicons name="sparkles" size={20} color={DesignSystem.colors.primary[500]} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.currentNameContainer}>
            <Text style={styles.currentNameLabel}>Current Name:</Text>
            <Text style={styles.currentName}>{getDisplayName()}</Text>
            {formData.aiGeneratedName && !formData.nameOverride && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>AI Generated</Text>
              </View>
            )}
            {formData.nameOverride && (
              <View style={[styles.chip, styles.chipSecondary]}>
                <Text style={styles.chipText}>Custom Name</Text>
              </View>
            )}
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="Enter a custom name or use AI suggestion"
            value={formData.name}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
            accessibilityLabel="Item name"
            accessibilityHint="Enter the name of your wardrobe item"
          />
        </View>

        <View style={styles.divider} />

        {/* Basic Information */}
        <View style={styles.formSection}>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.picker}
                accessibilityRole="button"
                accessibilityLabel={`Category: ${formData.category ? (formData.category || '').charAt(0).toUpperCase() + (formData.category || '').slice(1) : 'Select category'}`}
                accessibilityHint="Tap to select a category for this item"
              >
                <Text style={styles.pickerText}>
                  {formData.category
                    ? (formData.category || '').charAt(0).toUpperCase() +
                      (formData.category || '').slice(1)
                    : 'Select Category'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={DesignSystem.colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Subcategory</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., T-shirt, Jeans, Sneakers"
                value={formData.subcategory}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, subcategory: text }))}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Brand</Text>
              <TextInput
                style={styles.textInput}
                value={formData.brand}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, brand: text }))}
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Size</Text>
              <TouchableOpacity
                style={styles.picker}
                accessibilityRole="button"
                accessibilityLabel={`Size selector: ${formData.size || 'No size selected'}`}
                accessibilityHint="Tap to select a size for this item"
              >
                <Text style={styles.pickerText}>{formData.size || 'Select Size'}</Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={DesignSystem.colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Purchase Date</Text>
              <TextInput
                style={styles.textInput}
                value={formData.purchaseDate}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, purchaseDate: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Purchase Price</Text>
              <TextInput
                style={styles.textInput}
                value={String(formData.purchasePrice)}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, purchasePrice: parseFloat(text) || 0 }))
                }
                placeholder="$0.00"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Colors */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Colors</Text>
            <View style={styles.chipContainer}>
              {formData.colors.map((color, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{color}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveColor(color)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${color} color`}
                    accessibilityHint="Tap to remove this color from the item"
                  >
                    <Ionicons name="close" size={16} color={DesignSystem.colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput
                style={[styles.textInput, styles.addInput]}
                placeholder="Add Color"
                value={newColor}
                onChangeText={setNewColor}
                onSubmitEditing={handleAddColor}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddColor}
                accessibilityRole="button"
                accessibilityLabel="Add color"
                accessibilityHint="Tap to add the entered color to the item"
              >
                <Ionicons name="add" size={20} color={DesignSystem.colors.primary[500]} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.chipContainer}>
              {formData.tags.map((tag, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{tag}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveTag(tag)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${tag} tag`}
                    accessibilityHint="Tap to remove this tag from the item"
                  >
                    <Ionicons name="close" size={16} color={DesignSystem.colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput
                style={[styles.textInput, styles.addInput]}
                placeholder="Add Tag"
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddTag}
                accessibilityRole="button"
                accessibilityLabel="Add tag"
                accessibilityHint="Tap to add the entered tag to the item"
              >
                <Ionicons name="add" size={20} color={DesignSystem.colors.primary[500]} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, notes: text }))}
              placeholder="Any additional notes about this item..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            accessibilityHint="Tap to cancel and discard changes"
          >
            <Ionicons name="close" size={20} color={DesignSystem.colors.text.secondary} />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel={isSaving ? 'Saving...' : isEditing ? 'Update Item' : 'Save Item'}
            accessibilityHint={
              isSaving
                ? 'Please wait while saving'
                : isEditing
                  ? 'Tap to update the wardrobe item'
                  : 'Tap to save the new wardrobe item'
            }
            accessibilityState={{ disabled: isSaving }}
          >
            <Ionicons name="save" size={20} color="white" />
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : isEditing ? 'Update Item' : 'Save Item'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Naming Modal */}
      <Modal
        visible={showAINaming}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAINaming(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Generate AI Name</Text>
            <TouchableOpacity
              onPress={() => setShowAINaming(false)}
              accessibilityRole="button"
              accessibilityLabel="Close AI naming modal"
              accessibilityHint="Tap to close the AI name generator modal"
            >
              <Ionicons name="close" size={24} color={DesignSystem.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <AINameGenerator
            item={{
              imageUri: formData.imageUri,
              category: formData.category,
              colors: formData.colors,
              brand: formData.brand,
            }}
            onNameSelected={handleAINameSelected}
            initialName={formData.name}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
    justifyContent: 'flex-end',
    marginTop: DesignSystem.spacing.lg,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500] + '20',
    borderRadius: DesignSystem.borderRadius.md,
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  addButtonText: {
    color: DesignSystem.colors.primary[500],
    fontWeight: '500',
  },
  addInput: {
    flex: 1,
  },
  addRow: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  aiButton: {
    backgroundColor: DesignSystem.colors.primary[500] + '20',
    borderRadius: DesignSystem.borderRadius.full,
    padding: DesignSystem.spacing.sm,
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  cancelButtonText: {
    color: DesignSystem.colors.text.secondary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.lg,
    margin: DesignSystem.spacing.md,
    padding: DesignSystem.spacing.lg,
    ...DesignSystem.shadows.soft,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: DesignSystem.borderRadius.full,
    flexDirection: 'row',
    margin: 2,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: DesignSystem.spacing.md,
  },
  chipSecondary: {
    backgroundColor: DesignSystem.colors.secondary[500],
  },
  chipText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: '500',
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  currentName: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.md,
    fontWeight: '500',
    marginRight: DesignSystem.spacing.sm,
  },
  currentNameContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: DesignSystem.spacing.md,
  },
  currentNameLabel: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.sizes.sm,
    marginRight: DesignSystem.spacing.sm,
  },
  divider: {
    backgroundColor: DesignSystem.colors.border.primary,
    height: 1,
    marginVertical: DesignSystem.spacing.lg,
  },
  errorContainer: {
    backgroundColor: DesignSystem.colors.error.main + '20',
    borderRadius: DesignSystem.borderRadius.md,
    marginBottom: DesignSystem.spacing.md,
    padding: DesignSystem.spacing.md,
  },
  errorText: {
    color: DesignSystem.colors.error.main,
    fontSize: DesignSystem.typography.sizes.sm,
  },
  formSection: {
    marginBottom: DesignSystem.spacing.lg,
  },
  halfWidth: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  imagePaper: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderRadius: DesignSystem.borderRadius.md,
    height: 200,
    justifyContent: 'center',
    width: 200,
  },
  label: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.md,
    fontWeight: '500',
    marginBottom: DesignSystem.spacing.xs,
  },
  modalContainer: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.lg,
  },
  modalTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: 'bold',
  },
  nameHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.md,
  },
  nameSection: {
    marginBottom: DesignSystem.spacing.lg,
  },
  picker: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.md,
  },
  pickerText: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.md,
  },
  row: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.md,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: DesignSystem.borderRadius.md,
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: DesignSystem.colors.text.inverse,
    fontWeight: '500',
  },
  section: {
    marginBottom: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: '600',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  textInput: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.md,
    padding: DesignSystem.spacing.md,
  },
  title: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.xl,
    fontWeight: 'bold',
    marginBottom: DesignSystem.spacing.lg,
  },
  modal: {
    backgroundColor: DesignSystem.colors.background.overlay,
    padding: DesignSystem.spacing.large,
  },
});
