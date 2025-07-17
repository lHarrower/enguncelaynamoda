// Studio Home Screen - Bright, Airy, Confident Personal Styling Studio
// Enhanced with Mini Discovery Engine and Message of the Day

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STUDIO_THEME } from '../../constants/StudioTheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Import studio components
import BentoBoxGallery from './BentoBoxGallery';
import PremiumOutfitCard from './PremiumOutfitCard';
import MiniDiscoveryEngine from '../home/MiniDiscoveryEngine';

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
  const insets = useSafeAreaInsets();
  const [likedOutfits, setLikedOutfits] = useState<Set<string>>(new Set());
  const [messageOfTheDay, setMessageOfTheDay] = useState('');

  // Messages of the Day - Inspirational fashion quotes
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

  // Set message of the day based on current date
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const messageIndex = dayOfYear % dailyMessages.length;
    setMessageOfTheDay(dailyMessages[messageIndex]);
  }, []);

  // Hyper-personalized items for mini discovery engine
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

  // Sample outfit data
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

  // Bento box items for the gallery
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
          STUDIO_THEME.colors.accent.jadeLight,
          STUDIO_THEME.colors.accent.goldLight,
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
    console.log('Outfit pressed:', outfitId);
    // Navigate to outfit details
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={STUDIO_THEME.colors.foundation.primary} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Good morning</Text>
              <Text style={styles.userName}>Sarah</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onNavigateToProfile?.();
              }}
            >
              <Ionicons
                name="person-circle-outline"
                size={32}
                color={STUDIO_THEME.colors.accent.jade}
              />
            </TouchableOpacity>
          </View>
          
          {/* Message of the Day */}
          {messageOfTheDay && (
            <View style={styles.messageOfTheDay}>
              <Text style={styles.messageText}>{messageOfTheDay}</Text>
            </View>
          )}
        </View>

        {/* Mini Discovery Engine - Personalized Micro-Ritual */}
        <View style={styles.section}>
          <MiniDiscoveryEngine
            items={personalizedItems}
            onLike={(item) => {
              console.log('Liked personalized item:', item.title);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onDislike={(item) => {
              console.log('Disliked personalized item:', item.title);
            }}
            onUndo={() => {
              console.log('Undo last action');
            }}
          />
        </View>

        {/* Today's Outfits Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Outfits</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Navigate to all outfits
              }}
            >
              <Text style={styles.sectionAction}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.outfitsContainer}
          >
            {todaysOutfits.map((outfit, index) => (
              <PremiumOutfitCard
                key={outfit.id}
                outfit={outfit}
                size="medium"
                isLiked={likedOutfits.has(outfit.id)}
                onPress={() => handleOutfitPress(outfit.id)}
                onLike={() => handleLikeOutfit(outfit.id)}
                style={[
                  styles.outfitCard,
                  index === 0 && styles.firstOutfitCard,
                  index === todaysOutfits.length - 1 && styles.lastOutfitCard,
                ]}
              />
            ))}
          </ScrollView>
        </View>

        {/* Your Style Universe Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Style Universe</Text>
            <Text style={styles.sectionSubtitle}>
              Personalized insights and recommendations
            </Text>
          </View>
          
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
    backgroundColor: STUDIO_THEME.colors.foundation.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  
  // Header Styles
  header: {
    paddingHorizontal: STUDIO_THEME.spacing.xl,
    marginBottom: STUDIO_THEME.spacing.xxxl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...STUDIO_THEME.typography.scale.small,
    color: STUDIO_THEME.colors.text.secondary,
    marginBottom: 4,
  },
  userName: {
    ...STUDIO_THEME.typography.scale.hero,
    color: STUDIO_THEME.colors.text.primary,
    fontSize: 32,
  },
  profileButton: {
    padding: 4,
  },
  
  // Message of the Day
  messageOfTheDay: {
    marginTop: STUDIO_THEME.spacing.lg,
    paddingHorizontal: STUDIO_THEME.spacing.md,
    paddingVertical: STUDIO_THEME.spacing.md,
    backgroundColor: STUDIO_THEME.colors.accent.jadeGlow,
    borderRadius: STUDIO_THEME.radius.md,
    borderLeftWidth: 3,
    borderLeftColor: STUDIO_THEME.colors.accent.jade,
  },
  messageText: {
    ...STUDIO_THEME.typography.scale.elegant,
    color: STUDIO_THEME.colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Section Styles
  section: {
    marginBottom: STUDIO_THEME.spacing.massive,
  },
  sectionHeader: {
    paddingHorizontal: STUDIO_THEME.spacing.xl,
    marginBottom: STUDIO_THEME.spacing.lg,
  },
  sectionTitle: {
    ...STUDIO_THEME.typography.scale.h2,
    color: STUDIO_THEME.colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...STUDIO_THEME.typography.scale.small,
    color: STUDIO_THEME.colors.text.secondary,
  },
  sectionAction: {
    ...STUDIO_THEME.typography.scale.bodyMedium,
    color: STUDIO_THEME.colors.accent.jade,
  },
  
  // Outfits Section
  outfitsContainer: {
    paddingLeft: STUDIO_THEME.spacing.xl,
  },
  outfitCard: {
    marginRight: STUDIO_THEME.spacing.lg,
  },
  firstOutfitCard: {
    marginLeft: 0,
  },
  lastOutfitCard: {
    marginRight: STUDIO_THEME.spacing.xl,
  },
  
  // Bento Gallery
  bentoGallery: {
    marginTop: -STUDIO_THEME.spacing.xl, // Adjust for gallery's internal padding
  },
});

export default StudioHomeScreen;