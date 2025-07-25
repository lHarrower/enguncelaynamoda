// FILE: components/luxury/LuxuryOutfitCard.tsx

import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';
import { Outfit } from '../../data/sanctuaryModels';
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
    ...APP_THEME_V2.elevation.lift,
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: APP_THEME_V2.spacing.lg,
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  image: {
    width: '100%',
    aspectRatio: 0.9,
    justifyContent: 'flex-end',
  },
  glassmorphismContainer: {
    padding: APP_THEME_V2.spacing.lg,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  moodTag: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.colors.linen.base,
    backgroundColor: APP_THEME_V2.colors.liquidGold[500],
    alignSelf: 'flex-start',
    paddingHorizontal: APP_THEME_V2.spacing.md,
    paddingVertical: APP_THEME_V2.spacing.xs,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: APP_THEME_V2.spacing.md,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    fontWeight: '600',
  },
  whisper: {
    ...APP_THEME_V2.typography.scale.h3,
    fontSize: 20,
    color: APP_THEME_V2.colors.linen.base,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  itemCount: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.colors.linen.base,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    opacity: 0.8,
    marginTop: APP_THEME_V2.spacing.sm,
  },
});