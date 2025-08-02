// src/components/vision/VisionDiscoverScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignSystem } from '@/theme/DesignSystem';
import { VisionHeader } from '@/components/vision/shared/VisionHeader';
import { SwipeStack, OutfitCard } from '@/components/vision/shared/SwipeStack';
import DiscoverStats from '@/components/vision/shared/DiscoverStats';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SAMPLE_OUTFITS: OutfitCard[] = [
  {
    id: '1',
    title: 'Serene Sunday',
    description: 'Effortless elegance for a peaceful day',
    mood: 'Calm & Confident',
    colors: ['#E8F4E6', '#F5F1E8', '#FFF8F0'],
    confidence: 95,
    pieces: ['Cream silk blouse', 'High-waisted trousers', 'Gold accessories'],
  },
  {
    id: '2',
    title: 'Creative Energy',
    description: 'Bold choices for inspired moments',
    mood: 'Vibrant & Artistic',
    colors: ['#FF6B6B', '#B794F6', '#68D391'],
    confidence: 88,
    pieces: ['Statement blazer', 'Wide-leg jeans', 'Colorful scarf'],
  },
  {
    id: '3',
    title: 'Minimalist Grace',
    description: 'Pure sophistication in simplicity',
    mood: 'Refined & Timeless',
    colors: ['#F7F7F7', '#E2E8F0', '#4A5568'],
    confidence: 92,
    pieces: ['White button-down', 'Tailored pants', 'Classic pumps'],
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
    setPassedOutfits(prev => new Set([...prev, outfit.id]));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSwipeRight = (outfit: OutfitCard) => {
    setLikedOutfits(prev => new Set([...prev, outfit.id]));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleCardPress = (outfit: OutfitCard) => {
    Alert.alert(
      outfit.title,
      outfit.description,
      [
        { text: 'Pass', onPress: () => handleSwipeLeft(outfit), style: 'destructive' },
        { text: 'Love', onPress: () => handleSwipeRight(outfit) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleStackEmpty = () => {
    Alert.alert(
      'All Done!',
      'You\'ve seen all available outfits. Check back later for more recommendations!',
      [{ text: 'View Stats', onPress: () => setShowStats(true) }]
    );
  };

  const handleSwipe = (direction: 'left' | 'right', outfit: OutfitCard) => {
    if (direction === 'left') {
      handleSwipeLeft(outfit);
    } else {
      handleSwipeRight(outfit);
    }
    setCurrentIndex(prev => prev + 1);
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
              <SwipeStack
                outfits={availableOutfits}
                onSwipe={handleSwipe}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle" size={64} color={DesignSystem.colors.sage[500]} />
                <Text style={styles.emptyTitle}>All Caught Up!</Text>
                <Text style={styles.emptySubtitle}>You've seen all available outfits</Text>
                <TouchableOpacity 
                  style={styles.viewStatsButton}
                  onPress={() => setShowStats(true)}
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
              if (currentOutfit) handleSwipeLeft(currentOutfit);
            }}
          >
            <Ionicons name="close" size={28} color={DesignSystem.colors.coral[500]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.loveButton]}
            onPress={() => {
              const currentOutfit = availableOutfits[0];
              if (currentOutfit) handleSwipeRight(currentOutfit);
            }}
          >
            <Ionicons name="heart" size={28} color={DesignSystem.colors.sage[600]} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  backgroundGradient: {
    flex: 1,
  },
  
  content: {
    flex: 1,
  },
  
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingBottom: DesignSystem.spacing.xxxl,
    gap: DesignSystem.spacing.xl,
  },
  
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...DesignSystem.elevation.medium,
  },
  
  passButton: {
    backgroundColor: 'rgba(245, 101, 101, 0.1)',
  },
  
  loveButton: {
    backgroundColor: 'rgba(104, 211, 145, 0.1)',
  },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: DesignSystem.spacing.xl,
  },
  
  emptyTitle: {
    color: DesignSystem.colors.charcoal[800],
    marginTop: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.sm,
  },
  
  emptySubtitle: {
    color: DesignSystem.colors.charcoal[500],
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xl,
  },
  
  viewStatsButton: {
    backgroundColor: DesignSystem.colors.coral[500],
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: 25,
  },
  
  viewStatsText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default VisionDiscoverScreen;