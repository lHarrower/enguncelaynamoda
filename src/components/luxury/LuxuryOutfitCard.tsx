// FILE: components/luxury/LuxuryOutfitCard.tsx

import { BlurView } from 'expo-blur'; // Bu paketi eklemeniz gerekebilir: npx expo install expo-blur
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Outfit } from '@/data/sanctuaryModels';
import { DesignSystem } from '@/theme/DesignSystem';

interface LuxuryOutfitCardProps {
  outfit: Outfit;
  onPress: () => void;
}

export const LuxuryOutfitCard = ({ outfit, onPress }: LuxuryOutfitCardProps) => {
  const firstImage =
    Array.isArray(outfit.items) && outfit.items.length > 0 ? outfit.items[0]?.imageUrl : undefined;
  if (!firstImage) {
    // Graceful fallback (could render placeholder)
    return null;
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`${outfit.moodTag} outfit with ${outfit.items.length} pieces`}
      accessibilityHint="Tap to view luxury outfit details"
    >
      <View style={styles.container}>
        <ImageBackground source={{ uri: firstImage }} style={styles.image}>
          <BlurView intensity={80} tint="light" style={styles.glassmorphismContainer}>
            <Text style={styles.moodTag}>{outfit.moodTag}</Text>
            <Text style={styles.whisper}>{outfit.whisper}</Text>
            <Text style={styles.itemCount}>{outfit.items.length} pieces from your wardrobe</Text>
          </BlurView>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...DesignSystem.elevation.medium,
    borderRadius: DesignSystem.radius.lg,
    marginBottom: DesignSystem.spacing.xl,
    marginHorizontal: DesignSystem.spacing.lg,
    overflow: 'hidden',
  },
  glassmorphismContainer: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopWidth: 1,
    padding: DesignSystem.spacing.lg,
  },
  image: {
    aspectRatio: 0.9,
    justifyContent: 'flex-end',
    width: '100%',
  },
  itemCount: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.inverse,
    marginTop: DesignSystem.spacing.sm,
    opacity: 0.8,
  },
  moodTag: {
    ...DesignSystem.typography.scale.caption,
    alignSelf: 'flex-start',
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: DesignSystem.radius.md,
    color: DesignSystem.colors.text.inverse,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.md,
    overflow: 'hidden',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
  },
  whisper: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.inverse,
    fontSize: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
