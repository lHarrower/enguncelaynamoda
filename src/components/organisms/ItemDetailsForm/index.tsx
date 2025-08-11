/**
 * ItemDetailsForm Organism
 * 
 * A complex form component that combines multiple molecules and atoms
 * to create a complete clothing item details input interface.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { BaseComponentProps } from '@/types/componentProps';
import { DesignSystem } from '@/theme/DesignSystem';
import FormField from '@/components/molecules/FormField';
import Card from '@/components/molecules/Card';
import Button from '@/components/atoms/Button';
import Text from '@/components/atoms/Text';

export interface ClothingItemSubmission {
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  color: string;
  size: string;
  price: string;
  purchaseDate: string;
  notes: string;
}

export interface ItemDetailsFormProps extends BaseComponentProps {
  initialValues?: Partial<ClothingItemSubmission>;
  onSubmit: (values: ClothingItemSubmission) => void;
  onCancel?: () => void;
  loading?: boolean;
  categories?: string[];
  subcategories?: Record<string, string[]>;
  colors?: string[];
  sizes?: string[];
}

const ItemDetailsForm: React.FC<ItemDetailsFormProps> = ({
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false,
  categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'],
  subcategories = {
    'Tops': ['T-Shirt', 'Blouse', 'Sweater', 'Tank Top'],
    'Bottoms': ['Jeans', 'Trousers', 'Skirt', 'Shorts'],
    'Dresses': ['Casual', 'Formal', 'Cocktail', 'Maxi'],
    'Outerwear': ['Jacket', 'Coat', 'Blazer', 'Cardigan'],
    'Shoes': ['Sneakers', 'Heels', 'Flats', 'Boots'],
    'Accessories': ['Bag', 'Jewelry', 'Scarf', 'Hat']
  },
  colors = ['Black', 'White', 'Gray', 'Navy', 'Brown', 'Beige', 'Red', 'Blue', 'Green', 'Pink'],
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  style,
  testID,
  ...props
}) => {
  const [formData, setFormData] = useState<ClothingItemSubmission>({
    name: initialValues.name || '',
    category: initialValues.category || '',
    subcategory: initialValues.subcategory || '',
    brand: initialValues.brand || '',
    color: initialValues.color || '',
    size: initialValues.size || '',
    price: initialValues.price || '',
    purchaseDate: initialValues.purchaseDate || '',
    notes: initialValues.notes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ClothingItemSubmission, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ClothingItemSubmission, boolean>>>({});

  const updateField = (field: keyof ClothingItemSubmission, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const markFieldTouched = (field: keyof ClothingItemSubmission) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClothingItemSubmission, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.color) {
      newErrors.color = 'Color is required';
    }

    if (!formData.size) {
      newErrors.size = 'Size is required';
    }

    if (formData.price && isNaN(parseFloat(formData.price))) {
      newErrors.price = 'Please enter a valid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    // Mark all fields as touched
    const allFields = Object.keys(formData) as (keyof ClothingItemSubmission)[];
    const touchedState = allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(touchedState);

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const availableSubcategories = formData.category ? subcategories[formData.category] || [] : [];

  return (
    <Card variant="default" padding="large" style={StyleSheet.flatten([styles.container, style])} testID={testID} {...props}>
      <Text variant="headline" weight="bold" style={styles.title}>
        Add Clothing Item
      </Text>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <FormField
          label="Item Name"
          value={formData.name}
          onChangeText={(value) => updateField('name', value)}
          onBlur={() => markFieldTouched('name')}
          placeholder="e.g., Blue Cotton T-Shirt"
          error={errors.name}
          touched={touched.name}
          required
        />

        <FormField
          label="Brand"
          value={formData.brand}
          onChangeText={(value) => updateField('brand', value)}
          onBlur={() => markFieldTouched('brand')}
          placeholder="e.g., Nike, Zara, H&M"
          error={errors.brand}
          touched={touched.brand}
        />

        <FormField
          label="Category"
          value={formData.category}
          onChangeText={(value) => {
            updateField('category', value);
            // Reset subcategory when category changes
            if (formData.subcategory && !subcategories[value]?.includes(formData.subcategory)) {
              updateField('subcategory', '');
            }
          }}
          onBlur={() => markFieldTouched('category')}
          placeholder="Select category"
          error={errors.category}
          touched={touched.category}
          required
        />

        {availableSubcategories.length > 0 && (
          <FormField
            label="Subcategory"
            value={formData.subcategory}
            onChangeText={(value) => updateField('subcategory', value)}
            onBlur={() => markFieldTouched('subcategory')}
            placeholder="Select subcategory"
            error={errors.subcategory}
            touched={touched.subcategory}
          />
        )}

        <FormField
          label="Color"
          value={formData.color}
          onChangeText={(value) => updateField('color', value)}
          onBlur={() => markFieldTouched('color')}
          placeholder="Select or enter color"
          error={errors.color}
          touched={touched.color}
          required
        />

        <FormField
          label="Size"
          value={formData.size}
          onChangeText={(value) => updateField('size', value)}
          onBlur={() => markFieldTouched('size')}
          placeholder="Select size"
          error={errors.size}
          touched={touched.size}
          required
        />

        <FormField
          label="Price"
          value={formData.price}
          onChangeText={(value) => updateField('price', value)}
          onBlur={() => markFieldTouched('price')}
          placeholder="0.00"
          keyboardType="numeric"
          error={errors.price}
          touched={touched.price}
          hint="Optional: Enter purchase price"
        />

        <FormField
          label="Purchase Date"
          value={formData.purchaseDate}
          onChangeText={(value) => updateField('purchaseDate', value)}
          onBlur={() => markFieldTouched('purchaseDate')}
          placeholder="MM/DD/YYYY"
          error={errors.purchaseDate}
          touched={touched.purchaseDate}
          hint="Optional: When did you buy this item?"
        />

        <FormField
          label="Notes"
          value={formData.notes}
          onChangeText={(value) => updateField('notes', value)}
          onBlur={() => markFieldTouched('notes')}
          placeholder="Any additional notes about this item..."
          multiline
          error={errors.notes}
          touched={touched.notes}
          hint="Optional: Care instructions, styling notes, etc."
        />
      </ScrollView>

      <View style={styles.buttonContainer}>
        {onCancel && (
          <Button
            title="Cancel"
            variant="secondary"
            onPress={onCancel}
            style={styles.cancelButton}
            disabled={loading}
          />
        )}
        
        <Button
          title="Add Item"
          variant="primary"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
          disabled={loading}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: '90%',
  },
  
  title: {
    marginBottom: DesignSystem.spacing.lg,
    textAlign: 'center',
  },
  
  scrollView: {
    flex: 1,
    marginBottom: DesignSystem.spacing.md,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: DesignSystem.spacing.md,
    borderTopWidth: 1,
  borderTopColor: DesignSystem.colors.neutral[200],
  },
  
  cancelButton: {
    flex: 1,
    marginRight: DesignSystem.spacing.sm,
  },
  
  submitButton: {
    flex: 1,
    marginLeft: DesignSystem.spacing.sm,
  },
});

export default ItemDetailsForm;