// src/components/shared/OutfitCarousel.tsx

import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

interface OutfitCarouselProps {
  children: React.ReactNode;
  showsHorizontalScrollIndicator?: boolean;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
}

export const OutfitCarousel: React.FC<OutfitCarouselProps> = ({
  children,
  showsHorizontalScrollIndicator = false,
  contentContainerStyle,
  style,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      style={[styles.container, style]}
      decelerationRate="fast"
      snapToInterval={280} // Approximate card width + margin
      snapToAlignment="start"
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  contentContainer: {
    gap: DesignSystem.spacing.lg,
    paddingLeft: DesignSystem.spacing.xl,
    paddingRight: DesignSystem.spacing.xl,
  },
});

export default OutfitCarousel;
