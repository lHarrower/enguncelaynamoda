// Wardrobe Search Component
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { DesignSystem } from '@/theme/DesignSystem';

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
        placeholderTextColor={DesignSystem.colors.text.tertiary}
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
    marginLeft: DesignSystem.spacing.xs,
    padding: DesignSystem.spacing.xs,
  },
  clearButtonText: {
    color: DesignSystem.colors.text.tertiary,
    fontSize: DesignSystem.typography.fontSize.sm,
  },
  container: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: 'transparent',
    borderRadius: DesignSystem.radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  focusedContainer: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderColor: DesignSystem.colors.sage[500],
    elevation: 2,
    shadowColor: DesignSystem.colors.sage[500],
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    color: DesignSystem.colors.text.primary,
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.md,
    paddingVertical: DesignSystem.spacing.xs,
  },
  searchIcon: {
    marginRight: DesignSystem.spacing.xs,
  },
  searchIconText: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.fontSize.md,
  },
});

export default WardrobeSearch;
