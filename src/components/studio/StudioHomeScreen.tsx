// src/components/studio/StudioHomeScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';
import * as Haptics from 'expo-haptics';
import { logInDev } from '@/utils/consoleSuppress';

// Import components
import { StudioHeader } from '@/components/shared/StudioHeader';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OutfitCarousel } from '@/components/shared/OutfitCarousel';
import BentoBoxGallery from './BentoBoxGallery';
import PremiumOutfitCard from './PremiumOutfitCard';
import MiniDiscoveryEngine from '@/components/home/MiniDiscoveryEngine';

const { width, height } = Dimensions.get('window');

interface StudioHomeScreenProps {
  onNavigateToWardrobe?: () => void;
  onNavigateToDiscover?: () => void;
  onNavigateToMirror?: () => void;
  onNavigateToProfile?: () => void;
}

const StudioHomeScreen: React.FC<StudioHomeScreenProps> = ({
  onNavigateToWardrobe,
  onNavigateToDiscover,
  onNavigateToMirror,
  onNavigateToProfile,
}) => {
  const [likedOutfits, setLikedOutfits] = useState<Set<string>>(new Set());
  const [messageOfTheDay, setMessageOfTheDay] = useState('');

  const dailyMessages = [
    "Style is a way to say who you are without having to speak.",
    "Fashion is about dressing according to what's fashionable. Style is more about being yourself.",
    "Elegance is the only beauty that never fades.",
    "You can have anything you want in life if you dress for it.",
    "Fashion fades, but style is eternal.",
    "Dress like you're already famous.",
    "Style is knowing who you are, what you want to say, and not giving a damn.",
    "Fashion is what you buy. Style is what you do with it.",
  ];

  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const messageIndex = dayOfYear % dailyMessages.length;
    setMessageOfTheDay(dailyMessages[messageIndex]);
  }, []);

  const personalizedItems = [
    {
      id: 'p1',
      title: 'Silk Blouse with Pearl Details',
      brand: 'Elegant Essentials',
      price: 89,
      originalPrice: 120,
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop&q=80',
      boutique: 'Madison Avenue',
      confidence: 96,
    },
    {
      id: 'p2',
      title: 'Tailored Wool Blazer',
      brand: 'Professional Plus',
      price: 145,
      originalPrice: 195,
      image: 'https://images.unsplash.com/photo-1581044777550-4cfa6ce670c0?w=400&h=600&fit=crop&q=80',
      boutique: 'Executive Style',
      confidence: 92,
    },
    {
      id: 'p3',
      title: 'Cashmere Wrap Dress',
      brand: 'Luxury Lane',
      price: 210,
      originalPrice: 280,
      image: 'https://images.unsplash.com/photo-1594619336195-39a8f2712533?w=400&h=600&fit=crop&q=80',
      boutique: 'Boutique Bella',
      confidence: 94,
    },
  ];

  const todaysOutfits = [
    {
      id: '1',
      title: 'Confident Professional',
      subtitle: 'Perfect for meetings',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop&q=80',
      confidence: 94,
      tags: ['Professional', 'Elegant'],
      mood: 'Confident',
      season: 'All Season',
    },
    {
      id: '2',
      title: 'Casual Chic',
      subtitle: 'Weekend vibes',
      image: 'https://images.unsplash.com/photo-1581044777550-4cfa6ce670c0?w=400&h=600&fit=crop&q=80',
      confidence: 87,
      tags: ['Casual', 'Comfortable'],
      mood: 'Relaxed',
      season: 'Spring',
    },
  ];

  const bentoItems = [
    {
      id: 'daily-inspiration',
      type: 'mood' as const,
      size: 'medium' as const,
      span: 2 as const,
      title: 'Today\'s Inspiration',
      subtitle: 'Confident & Radiant',
      content: {
        emoji: '✨',
        gradient: [
          DesignSystem.colors.sage[200],
          DesignSystem.colors.amber[200],
        ],
      },
    },
    {
      id: 'style-confidence',
      type: 'metric' as const,
      size: 'medium' as const,
      span: 1 as const,
      title: 'Style Confidence',
      content: {
        value: '94%',
        trend: 8,
      },
    },
    {
      id: 'wardrobe-items',
      type: 'metric' as const,
      size: 'medium' as const,
      span: 1 as const,
      title: 'Wardrobe Items',
      content: {
        value: '127',
        trend: 12,
      },
    },
    {
      id: 'wardrobe-access',
      type: 'action' as const,
      size: 'medium' as const,
      span: 1 as const,
      title: 'Your Wardrobe',
      subtitle: 'Explore your collection',
      content: {
        icon: 'shirt-outline',
      },
      onPress: onNavigateToWardrobe,
    },
    {
      id: 'discover-new',
      type: 'action' as const,
      size: 'medium' as const,
      span: 1 as const,
      title: 'Discover',
      subtitle: 'Find new styles',
      content: {
        icon: 'sparkles-outline',
      },
      onPress: onNavigateToDiscover,
    },
    {
      id: 'style-tip',
      type: 'insight' as const,
      size: 'medium' as const,
      span: 2 as const,
      title: 'Style Tip of the Day',
      subtitle: 'Confidence comes from within',
      content: {
        icon: 'bulb-outline',
        description: 'Mix textures to add visual interest to your outfit. Try pairing smooth silk with structured cotton.',
      },
    },
    {
      id: 'mirror-experience',
      type: 'image' as const,
      size: 'large' as const,
      span: 1 as const,
      title: 'Ayna Mirror',
      subtitle: 'Virtual styling',
      content: {
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop&q=80',
      },
      onPress: onNavigateToMirror,
    },
    {
      id: 'style-score',
      type: 'metric' as const,
      size: 'small' as const,
      span: 1 as const,
      title: 'Style Score',
      content: {
        value: '8.7',
        trend: 5,
      },
    },
  ];

  const handleLikeOutfit = (outfitId: string) => {
    setLikedOutfits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(outfitId)) {
        newSet.delete(outfitId);
      } else {
        newSet.add(outfitId);
      }
      return newSet;
    });
  };

  const handleOutfitPress = (outfitId: string) => {
    logInDev('Outfit pressed:', outfitId);
    // Navigate to outfit details
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <StudioHeader
          userName="Ayna"
          messageOfTheDay={messageOfTheDay}
          onProfilePress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onNavigateToProfile?.();
          }}
        />

        <View style={styles.section}>
          <SectionHeader
            title="Style Discovery"
            subtitle="AI-powered recommendations"
            showArrow={false}
          />
          
          <MiniDiscoveryEngine
            items={personalizedItems}
            onLike={(item) => {
              logInDev('Liked personalized item:', item.title);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onDislike={(item) => {
              logInDev('Disliked personalized item:', item.title);
            }}
            onUndo={() => {
              logInDev('Undo last action');
            }}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Today's Curated"
            subtitle="Handpicked for your style"
            actionText="See All"
            onActionPress={onNavigateToDiscover}
          />
          
          <OutfitCarousel>
            {todaysOutfits.map((outfit, index) => (
              <PremiumOutfitCard
                key={outfit.id}
                outfit={outfit}
                size="medium"
                isLiked={likedOutfits.has(outfit.id)}
                onPress={() => handleOutfitPress(outfit.id)}
                onLike={() => handleLikeOutfit(outfit.id)}
                style={styles.outfitCard}
              />
            ))}
          </OutfitCarousel>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Your Style Journey"
            subtitle="Explore your fashion evolution"
            actionText="Open Wardrobe"
            onActionPress={onNavigateToWardrobe}
          />
          
          <BentoBoxGallery
            items={bentoItems}
            columns={2}
            style={styles.bentoGallery}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: DesignSystem.spacing.sanctuary,
  },
  section: {
    marginBottom: DesignSystem.spacing.sanctuary,
  },
  outfitCard: {
    marginRight: DesignSystem.spacing.lg,
  },
  bentoGallery: {
    marginTop: -DesignSystem.spacing.xl,
  },
});

export default StudioHomeScreen;