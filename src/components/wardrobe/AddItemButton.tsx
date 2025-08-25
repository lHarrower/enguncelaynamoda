// Add Item Button Component
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface AddItemButtonProps {
  onPress: () => void;
  title?: string;
  icon?: string;
  style?: ViewStyle;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'floating';
}

const AddItemButton: React.FC<AddItemButtonProps> = ({
  onPress,
  title = 'Add Item',
  icon = '+',
  style,
  disabled = false,
  variant = 'primary',
}) => {
  const { triggerSelection } = useHapticFeedback();

  const handlePress = () => {
    if (!disabled) {
      triggerSelection();
      onPress();
    }
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'floating':
        return styles.floatingButton;
      case 'secondary':
        return styles.secondaryButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  if (variant === 'floating') {
    return (
      <TouchableOpacity
        style={[getButtonStyle(), disabled && styles.disabledButton, style]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={title || 'Add item'}
        accessibilityHint="Tap to add a new item to your wardrobe"
        accessibilityState={{ disabled }}
      >
        <Text style={[styles.floatingButtonIcon, disabled && styles.disabledText]}>{icon}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[getButtonStyle(), disabled && styles.disabledButton, style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title || 'Add item'}
      accessibilityHint="Tap to add a new item to your wardrobe"
      accessibilityState={{ disabled }}
    >
      <View style={styles.buttonContent}>
        <Text style={[styles.buttonIcon, getTextStyle(), disabled && styles.disabledText]}>
          {icon}
        </Text>
        <Text style={[getTextStyle(), disabled && styles.disabledText]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledText: {
    color: '#D1D5DB',
  },
  floatingButton: {
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 28,
    bottom: 24,
    elevation: 8,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 56,
  },
  floatingButtonIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    elevation: 8,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: '#3B82F6',
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddItemButton;
