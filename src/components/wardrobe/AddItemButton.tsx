// Add Item Button Component
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface AddItemButtonProps {
  onPress: () => void;
  title?: string;
  icon?: string;
  style?: any;
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
        style={[
          getButtonStyle(),
          disabled && styles.disabledButton,
          style,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={[styles.floatingButtonIcon, disabled && styles.disabledText]}>
          {icon}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <Text style={[styles.buttonIcon, getTextStyle(), disabled && styles.disabledText]}>
          {icon}
        </Text>
        <Text style={[getTextStyle(), disabled && styles.disabledText]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  floatingButtonIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#D1D5DB',
  },
});

export default AddItemButton;