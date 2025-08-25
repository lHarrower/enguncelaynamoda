// Wardrobe Search Component
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface WardrobeSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  style?: ViewStyle;
  autoFocus?: boolean;
}

const WardrobeSearch: React.FC<WardrobeSearchProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search your wardrobe...',
  style,
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { triggerSelection } = useHapticFeedback();

  const handleClear = () => {
    triggerSelection();
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={[styles.container, isFocused && styles.focusedContainer, style]}>
      <View style={styles.searchIcon}>
        <Text style={styles.searchIconText}>🔍</Text>
      </View>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityLabel="Search wardrobe"
        accessibilityHint="Enter text to search through your wardrobe items"
        accessibilityRole="search"
      />

      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          accessibilityHint="Clear the search input"
        >
          <Text style={styles.clearButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  focusedContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#3B82F6',
    elevation: 2,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    color: '#1F2937',
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchIconText: {
    color: '#6B7280',
    fontSize: 16,
  },
});

export default WardrobeSearch;
