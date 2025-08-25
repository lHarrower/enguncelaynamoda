// Back Button Component
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface BackButtonProps {
  onPress: () => void;
  title?: string;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  title = 'Back',
  icon = '←',
  style,
  textStyle,
  disabled = false,
}) => {
  const { triggerSelection } = useHapticFeedback();

  const handlePress = () => {
    if (!disabled) {
      triggerSelection();
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled, style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint="Navigate back to the previous screen"
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.icon, disabled && styles.disabledText]}>{icon}</Text>
      <Text style={[styles.title, disabled && styles.disabledText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 6,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  icon: {
    color: '#3B82F6',
    fontSize: 18,
    marginRight: 4,
  },
  title: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BackButton;
