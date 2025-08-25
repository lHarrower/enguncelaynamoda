import React, { useState } from 'react';
import { AccessibilityInfo, Button, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const AddItemScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<string | null>(null);
  const handleSave = () => {
    if (!name.trim()) {
      const msg = 'Item name is required.';
      setErrors(msg);
      AccessibilityInfo.announceForAccessibility?.(`Form has errors. ${msg}`);
    } else {
      setErrors(null);
    }
  };
  return (
    <View>
      <TextInput
        testID="item-name-input"
        accessibilityRole="text"
        accessibilityLabel="Item name"
        accessibilityHint="Enter a name for this item"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity
        testID="category-selector"
        accessibilityRole="combobox"
        accessibilityLabel="Item category"
        accessibilityHint="Select the category for this item"
      >
        <Text>Category</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="take-photo-button"
        accessibilityRole="button"
        accessibilityLabel="Take photo"
        accessibilityHint="Double tap to open camera and take a photo of the item"
      >
        <Text>Take Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="select-from-gallery-button"
        accessibilityRole="button"
        accessibilityLabel="Select from gallery"
        accessibilityHint="Double tap to open photo gallery and select an image"
      >
        <Text>Select From Gallery</Text>
      </TouchableOpacity>
      <View
        testID="color-picker"
        accessibilityRole="radiogroup"
        accessibilityLabel="Item colors"
        accessibilityHint="Select one or more colors for this item"
      >
        <TouchableOpacity
          testID="color-option-blue"
          accessibilityRole="radio"
          accessibilityLabel="Blue"
        >
          <Text>Blue</Text>
        </TouchableOpacity>
      </View>
      <Button
        title="Save"
        onPress={handleSave}
        testID="save-item-button"
        accessibilityLabel="Save item"
      />
      {errors && <Text accessibilityLiveRegion="polite">Form has errors. {errors}</Text>}
    </View>
  );
};
export default AddItemScreen;
