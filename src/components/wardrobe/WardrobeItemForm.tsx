// Enhanced Wardrobe Item Form with AI Naming
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';
import { supabase } from '@/config/supabaseClient';
import { WardrobeItem, ItemCategory } from '@/types/aynaMirror';
import { AINameGenerator } from '../naming/AINameGenerator';
import { useAINaming } from '@/hooks/useAINaming';
import { enhancedWardrobeService } from '@/services/enhancedWardrobeService';
import { logInDev, errorInDev } from '@/utils/consoleSuppress';

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
  'activewear'
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12'];

export const WardrobeItemForm: React.FC<WardrobeItemFormProps> = ({
  item,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const { getEffectiveName } = useAINaming();
  
  const [formData, setFormData] = useState({
    name: item?.name || '',
    aiGeneratedName: item?.aiGeneratedName || '',
    nameOverride: item?.nameOverride || false,
    category: item?.category || 'tops' as ItemCategory,
    subcategory: item?.subcategory || '',
    colors: item?.colors || [],
    brand: item?.brand || '',
    size: item?.size || '',
  purchaseDate: item?.purchaseDate ? new Date((item as any).purchaseDate).toISOString().slice(0, 10) : '',
  purchasePrice: typeof item?.purchasePrice === 'number' ? (item?.purchasePrice as number) : 0,
    tags: item?.tags || [],
    notes: item?.notes || '',
    imageUri: item?.imageUri || ''
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
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If user manually enters a name, mark as override
    if (field === 'name' && value.trim()) {
      setFormData(prev => ({ ...prev, nameOverride: true }));
      setUseAIName(false);
    }
  };

  const handleSelectChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor.trim()]
      }));
      setNewColor('');
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color !== colorToRemove)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAINameSelected = (name: string, isAIGenerated: boolean) => {
    setFormData(prev => ({
      ...prev,
      name: isAIGenerated ? '' : name,
      aiGeneratedName: isAIGenerated ? name : prev.aiGeneratedName,
      nameOverride: !isAIGenerated
    }));
    setUseAIName(isAIGenerated);
    setShowAINaming(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.imageUri) {
        throw new Error('Image is required');
      }

      if (!formData.name && !formData.aiGeneratedName) {
        throw new Error('Item name is required');
      }

      // Prepare item data
      const itemData: Partial<WardrobeItem> = {
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
        purchasePrice: typeof formData.purchasePrice === 'number' ? formData.purchasePrice : parseFloat(String(formData.purchasePrice)) || undefined,
        tags: formData.tags,
        notes: formData.notes || undefined,
        imageUri: formData.imageUri
      };

      if (isEditing && item?.id) {
        // Update existing item
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
            purchase_date: itemData.purchaseDate ? (itemData.purchaseDate as Date).toISOString().slice(0, 10) : undefined,
            purchase_price: itemData.purchasePrice,
            tags: itemData.tags,
            notes: itemData.notes
          })
          .eq('id', item.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        onSave(itemData as WardrobeItem);
      } else {
        // Create new item
        const newItemData = await enhancedWardrobeService.saveClothingItem({
          image_uri: itemData.imageUri!,
          processed_image_uri: itemData.imageUri!, // Assuming same for now
          category: itemData.category!,
          subcategory: itemData.subcategory,
          colors: itemData.colors!,
          brand: itemData.brand,
          size: itemData.size,
          purchase_date: itemData.purchaseDate ? (itemData.purchaseDate as Date).toISOString().slice(0, 10) : undefined,
          purchase_price: itemData.purchasePrice,
          tags: itemData.tags,
          notes: itemData.notes,
          name: itemData.name,
          ai_generated_name: itemData.aiGeneratedName,
          name_override: itemData.nameOverride
        }, false); // Don't auto-generate AI name since we handle it manually

        onSave({
          ...itemData,
          id: newItemData.id,
          userId: newItemData.user_id,
          createdAt: new Date(newItemData.created_at),
          updatedAt: new Date(newItemData.updated_at)
        } as WardrobeItem);
      }
    } catch (err) {
      errorInDev('Error saving item:', err);
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
        <Text style={styles.title}>
          {isEditing ? 'Edit Item' : 'Add New Item'}
        </Text>

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
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          />
        </View>

        <View style={styles.divider} />

        {/* Basic Information */}
        <View style={styles.formSection}>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity style={styles.picker}>
                <Text style={styles.pickerText}>
                  {formData.category ? formData.category.charAt(0).toUpperCase() + formData.category.slice(1) : 'Select Category'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={DesignSystem.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Subcategory</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., T-shirt, Jeans, Sneakers"
                value={formData.subcategory}
                onChangeText={(text) => setFormData(prev => ({ ...prev, subcategory: text }))}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Brand</Text>
              <TextInput
                style={styles.textInput}
                value={formData.brand}
                onChangeText={(text) => setFormData(prev => ({ ...prev, brand: text }))}
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Size</Text>
              <TouchableOpacity style={styles.picker}>
                <Text style={styles.pickerText}>
                  {formData.size || 'Select Size'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={DesignSystem.colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Purchase Date</Text>
              <TextInput
                style={styles.textInput}
                value={formData.purchaseDate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, purchaseDate: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Purchase Price</Text>
              <TextInput
                style={styles.textInput}
                value={String(formData.purchasePrice)}
                onChangeText={(text) => setFormData(prev => ({ ...prev, purchasePrice: parseFloat(text) || 0 }))}
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
                  <TouchableOpacity onPress={() => handleRemoveColor(color)}>
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
              <TouchableOpacity style={styles.addButton} onPress={handleAddColor}>
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
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
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
              <TouchableOpacity style={styles.addButton} onPress={handleAddTag}>
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
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              placeholder="Any additional notes about this item..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Ionicons name="close" size={20} color={DesignSystem.colors.text.secondary} />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            <Ionicons name="save" size={20} color="white" />
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : (isEditing ? 'Update Item' : 'Save Item')}
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
            <TouchableOpacity onPress={() => setShowAINaming(false)}>
              <Ionicons name="close" size={24} color={DesignSystem.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <AINameGenerator
            item={{
              imageUri: formData.imageUri,
              category: formData.category,
              colors: formData.colors,
              brand: formData.brand
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
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  card: {
    backgroundColor: DesignSystem.colors.background.secondary,
    margin: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.lg,
  ...DesignSystem.shadows.soft,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.lg,
  },
  errorContainer: {
    backgroundColor: DesignSystem.colors.error.main + '20',
    padding: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    marginBottom: DesignSystem.spacing.md,
  },
  errorText: {
    color: DesignSystem.colors.error.main,
    fontSize: 14,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  imagePaper: {
    width: 200,
    height: 200,
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderRadius: DesignSystem.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameSection: {
    marginBottom: DesignSystem.spacing.lg,
  },
  nameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
  },
  aiButton: {
    padding: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.full,
  backgroundColor: DesignSystem.colors.primary[500] + '20',
  },
  currentNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
    flexWrap: 'wrap',
  },
  currentNameLabel: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
    marginRight: DesignSystem.spacing.sm,
  },
  currentName: {
    fontSize: 16,
    fontWeight: '500',
    color: DesignSystem.colors.text.primary,
    marginRight: DesignSystem.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500],
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.full,
    margin: 2,
  },
  chipSecondary: {
    backgroundColor: DesignSystem.colors.secondary[500],
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
  backgroundColor: DesignSystem.colors.border.primary,
    marginVertical: DesignSystem.spacing.lg,
  },
  formSection: {
    marginBottom: DesignSystem.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    marginBottom: DesignSystem.spacing.md,
    gap: DesignSystem.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  textInput: {
    borderWidth: 1,
  borderColor: DesignSystem.colors.border.primary,
    borderRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.md,
    fontSize: 16,
    color: DesignSystem.colors.text.primary,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  borderColor: DesignSystem.colors.border.primary,
    borderRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  pickerText: {
    fontSize: 16,
    color: DesignSystem.colors.text.primary,
  },
  section: {
    marginBottom: DesignSystem.spacing.lg,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: DesignSystem.spacing.md,
  },
  addRow: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  addInput: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500] + '20',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    gap: DesignSystem.spacing.xs,
  },
  addButtonText: {
    color: DesignSystem.colors.primary[500],
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: DesignSystem.spacing.md,
    marginTop: DesignSystem.spacing.lg,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
  borderColor: DesignSystem.colors.border.primary,
    gap: DesignSystem.spacing.xs,
  },
  cancelButtonText: {
    color: DesignSystem.colors.text.secondary,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500],
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    gap: DesignSystem.spacing.xs,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DesignSystem.spacing.lg,
    borderBottomWidth: 1,
  borderBottomColor: DesignSystem.colors.border.primary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DesignSystem.colors.text.primary,
  },
}) as any;