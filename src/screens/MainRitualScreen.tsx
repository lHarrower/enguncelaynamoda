// FILE: screens/MainRitualScreen.tsx

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModernCard } from '../components';
import LinenCanvas from '../components/luxury/LinenCanvas';
import { AynaOutfitCard } from '../components/sanctuary/AynaOutfitCard';
import { ClothingItem, Outfit } from '../data/sanctuaryModels';
import { ModernDesignSystem } from '../theme/ModernDesignSystem';
import { logInDev } from '../utils/consoleSuppress';

// Sample outfit data with correct types
const createClothingItem = (
  id: string,
  name: string,
  category: any,
  imageUrl: string,
): ClothingItem => ({
  id,
  name,
  category,
  imageUrl,
  colors: ['neutral'],
  dateAdded: new Date(),
  wearCount: 0,
  confidenceScore: 8,
});

const DUMMY_OUTFITS: Outfit[] = [
  {
    id: 'o1',
    name: 'Huzurlu Sabah',
    moodTag: 'Serene & Grounded',
    whisper: 'Yumuşak kaşmir seni konforla sarıyor, huzurlu bir gün için mükemmel.',
    items: [
      createClothingItem(
        '1',
        'Cashmere Sweater',
        'tops',
        'https://images.unsplash.com/photo-1506629905607-c7a8b3bb0aa3?w=800&h=1000&fit=crop',
      ),
    ],
    confidenceScore: 8,
  },
  {
    id: 'o2',
    name: 'Güvenli Lider',
    moodTag: 'Luminous & Confident',
    whisper: 'Klasik blazerın bugün senin nazik zırhın olmaya hazır.',
    items: [
      createClothingItem(
        '2',
        'Tailored Blazer',
        'outerwear',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop',
      ),
    ],
    confidenceScore: 9,
  },
  {
    id: 'o3',
    name: 'Neşeli Ruh',
    moodTag: 'Joyful & Playful',
    whisper: 'Bu akışkan elbise güneşli sabahları hayal ediyordu. Güneşi yanında taşı.',
    items: [
      createClothingItem(
        '3',
        'Midi Dress',
        'dresses',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=1000&fit=crop',
      ),
    ],
    confidenceScore: 8,
  },
];

export const MainRitualScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinenCanvas>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <ModernCard variant="glass" padding="large" style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Günaydın, Güzelim</Text>
            <Text style={styles.subtitleText}>Senin sığınağın seni bekliyor</Text>
          </ModernCard>

          <View style={styles.outfitsContainer}>
            {DUMMY_OUTFITS.map((outfit) => (
              <AynaOutfitCard
                key={outfit.id}
                outfit={outfit}
                onPress={() => logInDev('Outfit selected:', outfit.id)}
              />
            ))}
          </View>
        </ScrollView>
      </LinenCanvas>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: ModernDesignSystem.spacing.semantic.layout.lg,
    paddingHorizontal: ModernDesignSystem.spacing.semantic.layout.md,
    paddingTop: ModernDesignSystem.spacing.semantic.layout.lg,
  },
  outfitsContainer: {
    gap: ModernDesignSystem.spacing.semantic.component.md,
  },
  safeArea: {
    backgroundColor: ModernDesignSystem.colors.tokens.surface.primary,
    flex: 1,
  },
  subtitleText: {
    ...ModernDesignSystem.typography.scale.body.large,
    color: ModernDesignSystem.colors.tokens.content.secondary,
    fontFamily: ModernDesignSystem.typography.fontStacks.body[0],
    fontStyle: 'italic',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: ModernDesignSystem.spacing.semantic.layout.lg,
    marginHorizontal: ModernDesignSystem.spacing.semantic.component.xs,
  },
  welcomeText: {
    ...ModernDesignSystem.typography.scale.display.medium,
    color: ModernDesignSystem.colors.semantic.brand.primary,
    fontFamily: ModernDesignSystem.typography.fontStacks.display[0],
    letterSpacing: 0.5,
    marginBottom: ModernDesignSystem.spacing.semantic.component.md,
    textAlign: 'center',
  },
});

export default MainRitualScreen;
