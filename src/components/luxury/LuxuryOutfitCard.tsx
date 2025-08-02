// FILE: components/luxury/LuxuryOutfitCard.tsx

import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';
import { Outfit } from '@/data/sanctuaryModels';
import { BlurView } from 'expo-blur'; // Bu paketi eklemeniz gerekebilir: npx expo install expo-blur

interface LuxuryOutfitCardProps {
  outfit: Outfit;
  onPress: () => void;
}

export const LuxuryOutfitCard = ({ outfit, onPress }: LuxuryOutfitCardProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.container}>
        <ImageBackground source={{ uri: outfit.items[0].imageUrl }} style={styles.image}>
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
    overflow: 'hidden',
    marginHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.xl,
  },
  image: {
    width: '100%',
    aspectRatio: 0.9,
    justifyContent: 'flex-end',
  },
  glassmorphismContainer: {
    padding: DesignSystem.spacing.lg,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  moodTag: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text.inverse,
    backgroundColor: DesignSystem.colors.sage[500],
    alignSelf: 'flex-start',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.radius.md,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing.md,
    fontWeight: '600',
  },
  whisper: {
    ...DesignSystem.typography.h3,
    fontSize: 20,
    color: DesignSystem.colors.text.inverse,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  itemCount: {
    ...DesignSystem.typography.body1,
    color: DesignSystem.colors.text.inverse,
    opacity: 0.8,
    marginTop: DesignSystem.spacing.sm,
  },
});