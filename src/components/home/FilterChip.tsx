import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const FilterChip = ({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => {
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        isActive ? DesignSystem.colors.sage[500] : 'rgba(255, 255, 255, 0.5)',
      ),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(
        isActive ? DesignSystem.colors.text.inverse : DesignSystem.colors.text.secondary,
      ),
    };
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filter: ${label}`}
      accessibilityHint="Tap to toggle this filter"
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View style={[styles.categoryChip, animatedContainerStyle]}>
        <Animated.Text style={[styles.categoryText, animatedTextStyle]}>{label}</Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryChip: {
    borderRadius: 22,
    marginRight: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
    ...DesignSystem.elevation.soft,
  },
  categoryText: {
    ...DesignSystem.typography.scale.caption,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontWeight: 'bold',
  },
});

export default FilterChip;
