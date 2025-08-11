import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { DesignSystem } from '@/theme/DesignSystem';
import { AynaOutfitCardV2 } from '@/components/sanctuary/AynaOutfitCardV2';
import { LikeButton } from '@/components/sanctuary/LikeButton';
import { FluidTabNavigator } from '@/components/navigation/FluidTabNavigator';
import { SAMPLE_SAVED_OUTFITS } from '@/data/sanctuarySampleData';

// Demo screens for the FluidTabNavigator
const DemoScreen1 = () => (
  <View style={styles.demoScreen}>
    <Text style={[DesignSystem.typography.heading.h1, { color: DesignSystem.colors.text.primary }]}>
      Sanctuary
    </Text>
    <Text style={[DesignSystem.typography.body.small, { color: DesignSystem.colors.text.secondary }]}>
      "Your style journey begins with self-discovery"
    </Text>
  </View>
);

const DemoScreen2 = () => (
  <View style={styles.demoScreen}>
    <Text style={[DesignSystem.typography.heading.h1, { color: DesignSystem.colors.text.primary }]}>
      Wardrobe
    </Text>
    <Text style={[DesignSystem.typography.body.small, { color: DesignSystem.colors.text.secondary }]}>
      "Every piece tells a story of confidence"
    </Text>
  </View>
);

const DemoScreen3 = () => (
  <View style={styles.demoScreen}>
    <Text style={[DesignSystem.typography.heading.h1, { color: DesignSystem.colors.text.primary }]}>
      Favorites
    </Text>
    <Text style={[DesignSystem.typography.body.small, { color: DesignSystem.colors.text.secondary }]}>
      "Curated moments of pure inspiration"
    </Text>
  </View>
);

export const ArtistryShowcase: React.FC = () => {
  const [showFluidNav, setShowFluidNav] = useState(false);
  const [likedItems, setLikedItems] = useState<{ [key: string]: boolean }>({});

  const handleLikeToggle = (id: string) => {
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tabConfig = [
    {
      id: 'sanctuary',
      title: 'Sanctuary',
      icon: 'home-outline' as const,
      activeIcon: 'home' as const,
      component: DemoScreen1,
    },
    {
      id: 'wardrobe',
      title: 'Wardrobe',
      icon: 'shirt-outline' as const,
      activeIcon: 'shirt' as const,
      component: DemoScreen2,
    },
    {
      id: 'favorites',
      title: 'Favorites',
      icon: 'heart-outline' as const,
      activeIcon: 'heart' as const,
      component: DemoScreen3,
    },
  ];

  if (showFluidNav) {
    return (
      <FluidTabNavigator
        tabs={tabConfig}
        initialTab="sanctuary"
        onTabChange={(tabId) => console.log('Tab changed to:', tabId)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AYNAMODA Artistry</Text>
          <Text style={styles.subtitle}>Digital Zen Garden Philosophy</Text>
        </View>

        {/* Theme Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organic Palette</Text>
          <View style={styles.colorGrid}>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.background.primary }]}>
              <Text style={styles.colorLabel}>Linen</Text>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.sage[500] }]}>
              <Text style={[styles.colorLabel, { color: 'white' }]}>Sage Green</Text>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.gold[500] }]}>
              <Text style={[styles.colorLabel, { color: 'white' }]}>Liquid Gold</Text>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.neutral[800] }]}>
              <Text style={[styles.colorLabel, { color: 'white' }]}>Ink Gray</Text>
            </View>
          </View>
        </View>

        {/* Typography Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Typography Hierarchy</Text>
          <View style={styles.typographyDemo}>
            <Text style={[DesignSystem.typography.heading.h1, { color: DesignSystem.colors.text.primary }]}>
              Hero Text
            </Text>
            <Text style={[DesignSystem.typography.heading.h1, { color: DesignSystem.colors.text.primary }]}>
              Heading 1
            </Text>
            <Text style={[DesignSystem.typography.body.medium, { color: DesignSystem.colors.text.secondary }]}>
              Body text with perfect readability and harmonious spacing
            </Text>
            <Text style={[DesignSystem.typography.body.small, { color: DesignSystem.colors.text.secondary }]}>
              "Whisper text for gentle, poetic moments"
            </Text>
          </View>
        </View>

        {/* Glassmorphism Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Glassmorphism Effects</Text>
          <View style={styles.glassContainer}>
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <View style={[styles.glassCardContent, DesignSystem.glassmorphism.light]}>
                <Text style={[DesignSystem.typography.heading.h3, { color: DesignSystem.colors.text.primary }]}>
                  Primary Glass
                </Text>
                <Text style={[DesignSystem.typography.body.medium, { color: DesignSystem.colors.text.secondary }]}>
                  Frosted glass effect with subtle transparency
                </Text>
              </View>
            </BlurView>
            
            <BlurView intensity={15} tint="light" style={styles.glassCard}>
              <View style={[styles.glassCardContent, DesignSystem.glassmorphism.medium]}>
                <Text style={[DesignSystem.typography.heading.h3, { color: DesignSystem.colors.text.primary }]}>
                  Liquid Gold Glass
                </Text>
                <Text style={[DesignSystem.typography.body.medium, { color: DesignSystem.colors.text.secondary }]}>
                  Warm, golden glass with premium feel
                </Text>
              </View>
            </BlurView>
          </View>
        </View>

        {/* Micro-interactions Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meaningful Micro-interactions</Text>
          <View style={styles.interactionDemo}>
            <Text style={[DesignSystem.typography.body.medium, { color: DesignSystem.colors.text.secondary, marginBottom: 16 }]}>
              Tap the hearts to see the "wave of light" animation
            </Text>
            <View style={styles.likeButtonGrid}>
              {[1, 2, 3, 4].map((id) => (
                <LikeButton
                  key={id}
                  isLiked={likedItems[id.toString()] || false}
                  onPress={() => handleLikeToggle(id.toString())}
                  size={28}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Outfit Card Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Artistic Outfit Cards</Text>
          <Text style={[DesignSystem.typography.body.medium, { color: DesignSystem.colors.text.secondary, marginBottom: 20 }]}>
            Layered depth with glassmorphism overlays and organic animations
          </Text>
          {SAMPLE_SAVED_OUTFITS.slice(0, 2).map((outfit) => (
            <AynaOutfitCardV2
              key={outfit.id}
              outfit={outfit}
              onPress={() => console.log('Outfit pressed:', outfit.name)}
              onFavorite={() => console.log('Outfit favorited:', outfit.name)}
              showFavoriteButton={true}
            />
          ))}
        </View>

        {/* Fluid Navigation Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fluid Navigation</Text>
          <Text style={[DesignSystem.typography.body.medium, { color: DesignSystem.colors.text.secondary, marginBottom: 20 }]}>
            Cross-fade transitions with zen-like choreography
          </Text>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => setShowFluidNav(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[DesignSystem.colors.sage[500], DesignSystem.colors.gold[500]]}
              style={styles.demoButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.demoButtonText}>Experience Fluid Navigation</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Elevation System Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Elevation System</Text>
          <View style={styles.elevationDemo}>
            <View style={[styles.elevationCard, DesignSystem.effects.elevation.soft]}>
              <Text style={[DesignSystem.typography.body.small, { color: DesignSystem.colors.text.secondary }]}>
                Whisper
              </Text>
            </View>
            <View style={[styles.elevationCard, DesignSystem.effects.elevation.medium]}>
              <Text style={[DesignSystem.typography.body.small, { color: DesignSystem.colors.text.secondary }]}>
                Lift
              </Text>
            </View>
            <View style={[styles.elevationCard, DesignSystem.effects.elevation.high]}>
              <Text style={[DesignSystem.typography.body.small, { color: DesignSystem.colors.text.secondary }]}>
                Float
              </Text>
            </View>
            <View style={[styles.elevationCard, DesignSystem.effects.elevation.high]}>
              <Text style={[DesignSystem.typography.body.small, { color: DesignSystem.colors.text.secondary }]}>
                Dramatic
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[DesignSystem.typography.body.small, { color: DesignSystem.colors.text.tertiary }]}>
            "Where technology meets artistry, confidence blooms"
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    padding: DesignSystem.spacing.xl,
    alignItems: 'center',
  },
  title: {
  ...DesignSystem.typography.heading.h1,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  subtitle: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    padding: DesignSystem.spacing.xl,
    marginBottom: DesignSystem.spacing.md,
  },
  sectionTitle: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.lg,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.md,
  },
  colorSwatch: {
    width: 80,
    height: 80,
  borderRadius: DesignSystem.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignSystem.effects.elevation.medium,
  },
  colorLabel: {
    ...DesignSystem.typography.body.small,
    fontWeight: '600',
  },
  typographyDemo: {
    gap: DesignSystem.spacing.md,
  },
  glassContainer: {
    gap: DesignSystem.spacing.lg,
  },
  glassCard: {
  borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
  },
  glassCardContent: {
    padding: DesignSystem.spacing.xl,
  borderRadius: DesignSystem.borderRadius.lg,
  },
  interactionDemo: {
    alignItems: 'center',
  },
  likeButtonGrid: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.xl,
  },
  demoButton: {
  borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    ...DesignSystem.effects.elevation.medium,
  },
  demoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.sm,
  },
  demoButtonText: {
    ...DesignSystem.typography.button.medium,
    color: 'white',
  },
  elevationDemo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.lg,
  },
  elevationCard: {
    width: 80,
    height: 60,
    backgroundColor: DesignSystem.colors.background.elevated,
  borderRadius: DesignSystem.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing.xl,
  },
  footer: {
    padding: DesignSystem.spacing.xl,
    alignItems: 'center',
    marginTop: DesignSystem.spacing.xxxl,
  },
});