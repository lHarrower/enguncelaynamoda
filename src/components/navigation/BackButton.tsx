// Back Button Component
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface BackButtonProps {
  onPress: () => void;
  title?: string;
  icon?: string;
  style?: any;
  textStyle?: any;
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
    >
      <Text style={[styles.icon, disabled && styles.disabledText]}>
        {icon}
      </Text>
      <Text style={[styles.title, disabled && styles.disabledText, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 18,
    color: '#3B82F6',
    marginRight: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B82F6',
  },
  disabledText: {
    color: '#9CA3AF',
  },
});

export default BackButton;