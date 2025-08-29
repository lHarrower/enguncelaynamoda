// src/components/vision/VisionDiscoverScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VisionHeader } from '@/components/shared/VisionHeader';
import DiscoverStats from '@/components/vision/shared/DiscoverStats';
import { OutfitCard, SwipeStack } from '@/components/vision/shared/SwipeStack';
import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SAMPLE_OUTFITS: OutfitCard[] = [
  {
    id: '1',
    name: 'Serene Sunday',
    description: 'Effortless elegance for a peaceful day',
    category: 'Casual',
    colors: ['#E8F4E6', '#F5F1E8', '#FFF8F0'],
    tags: ['Calm & Confident'],
    style: 'Elegant',
  },
  {
    id: '2',
    name: 'Creative Energy',
    description: 'Bold choices for inspired moments',
    category: 'Creative',
    colors: ['#FF6B6B', '#B794F6', '#68D391'],
    tags: ['Vibrant & Artistic'],
    style: 'Bold',
  },
  {
    id: '3',
    name: 'Minimalist Grace',
    description: 'Pure sophistication in simplicity',
    category: 'Minimalist',
    colors: ['#F7F7F7', '#E2E8F0', '#4A5568'],
    tags: ['Refined & Timeless'],
    style: 'Classic',
  },
];

const VisionDiscoverScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedOutfits, setLikedOutfits] = useState<Set<string>>(new Set());
  const [passedOutfits, setPassedOutfits] = useState<Set<string>>(new Set());
  const [showStats, setShowStats] = useState(false);
  const [streakDays, setStreakDays] = useState(7); // Example streak

  const totalSeen = likedOutfits.size + passedOutfits.size;
  const availableOutfits = SAMPLE_OUTFITS.slice(currentIndex);

  const handleSwipeLeft = (outfit: OutfitCard) => {
    setPassedOutfits((prev) => new Set([...prev, outfit.id]));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSwipeRight = (outfit: OutfitCard) => {
    setLikedOutfits((prev) => new Set([...prev, outfit.id]));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleCardPress = (outfit: OutfitCard) => {
    Alert.alert(outfit.name || 'Outfit', outfit.description, [
      { text: 'Pass', onPress: () => handleSwipeLeft(outfit), style: 'destructive' },
      { text: 'Love', onPress: () => handleSwipeRight(outfit) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleStackEmpty = () => {
    Alert.alert(
      'All Done!',
      "You've seen all available outfits. Check back later for more recommendations!",
      [{ text: 'View Stats', onPress: () => setShowStats(true) }],
    );
  };

  const handleSwipe = (direction: 'left' | 'right', outfit: OutfitCard) => {
    if (direction === 'left') {
      handleSwipeLeft(outfit);
    } else {
      handleSwipeRight(outfit);
    }
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          DesignSystem.colors.linen.base,
          DesignSystem.colors.sage[50],
          DesignSystem.colors.linen.base,
        ]}
        style={styles.backgroundGradient}
      />

      <VisionHeader
        title="Vision Discover"
        subtitle="Swipe to curate your style"
        onSettingsPress={() => setShowStats(!showStats)}
      />

      <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
        {showStats ? (
          <DiscoverStats
            totalOutfits={SAMPLE_OUTFITS.length}
            lovedOutfits={likedOutfits.size}
            passedOutfits={passedOutfits.size}
            todayViewed={totalSeen}
          />
        ) : (
          <View style={styles.cardStack}>
            {availableOutfits.length > 0 ? (
              <SwipeStack outfits={availableOutfits} onSwipe={handleSwipe} />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle" size={64} color={DesignSystem.colors.sage[500]} />
                <Text style={styles.emptyTitle}>All Caught Up!</Text>
                <Text style={styles.emptySubtitle}>{"You've seen all available outfits"}</Text>
                <TouchableOpacity
                  style={styles.viewStatsButton}
                  onPress={() => setShowStats(true)}
                  accessibilityRole="button"
                  accessibilityLabel="View Your Stats"
                  accessibilityHint="Opens your outfit discovery statistics"
                >
                  <Text style={styles.viewStatsText}>View Your Stats</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {!showStats && availableOutfits.length > 0 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={() => {
              const currentOutfit = availableOutfits[0];
              if (currentOutfit) {
                handleSwipeLeft(currentOutfit);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Pass outfit"
            accessibilityHint="Tap to skip this outfit recommendation"
          >
            <Ionicons name="close" size={28} color={DesignSystem.colors.coral[500]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.loveButton]}
            onPress={() => {
              const currentOutfit = availableOutfits[0];
              if (currentOutfit) {
                handleSwipeRight(currentOutfit);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Love outfit"
            accessibilityHint="Tap to save this outfit to your favorites"
          >
            <Ionicons name="heart" size={28} color={DesignSystem.colors.sage[600]} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.elevated + 'E6',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
    ...DesignSystem.elevation.medium,
  },

  actionButtons: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: DesignSystem.spacing.xl,
    justifyContent: 'center',
    paddingBottom: DesignSystem.spacing.xxxl,
    paddingHorizontal: DesignSystem.spacing.xl,
  },

  backgroundGradient: {
    flex: 1,
  },

  cardStack: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
  },

  container: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: DesignSystem.spacing.xl,
  },

  emptySubtitle: {
    color: DesignSystem.colors.charcoal[500],
    marginBottom: DesignSystem.spacing.xl,
    textAlign: 'center',
  },

  emptyTitle: {
    color: DesignSystem.colors.charcoal[800],
    marginBottom: DesignSystem.spacing.sm,
    marginTop: DesignSystem.spacing.lg,
  },

  loveButton: {
    backgroundColor: DesignSystem.colors.sage[500] + '1A',
  },

  passButton: {
    backgroundColor: DesignSystem.colors.coral[500] + '1A',
  },

  viewStatsButton: {
    backgroundColor: DesignSystem.colors.coral[500],
    borderRadius: 25,
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.md,
  },

  viewStatsText: {
    color: DesignSystem.colors.text.inverse,
    fontWeight: '600',
  },
});

export default VisionDiscoverScreen;
