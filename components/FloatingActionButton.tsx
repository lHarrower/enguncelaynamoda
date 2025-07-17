import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { SHADOWS, SPACING } from '../constants/AppConstants';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  disabled?: boolean;
}

export default function FloatingActionButton({
  onPress,
  icon = 'add',
  size = 56,
  disabled = false,
}: FloatingActionButtonProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: disabled ? 0.5 : 1,
        },
        SHADOWS.gentle,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        style={[
          styles.gradient,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons 
          name={icon} 
          size={size * 0.4} 
          color="#FFFFFF" 
        />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    overflow: 'hidden',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 