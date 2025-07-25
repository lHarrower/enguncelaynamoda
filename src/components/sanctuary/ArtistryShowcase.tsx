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

import { APP_THEME_V2 } from '../../constants/AppThemeV2';
import { AynaOutfitCardV2 } from './AynaOutfitCardV2';
import { LikeButton } from './LikeButton';
import { FluidTabNavigator } from '../navigation/FluidTabNavigator';
import { SAMPLE_SAVED_OUTFITS } from '../../data/sanctuarySampleData';

// Demo screens for the FluidTabNavigator
const DemoScreen1 = () => (
  <View style={styles.demoScreen}>
    <Text style={[APP_THEME_V2.typography.scale.h1, { color: APP_THEME_V2.colors.inkGray[800] }]}>
      Sanctuary
    </Text>
    <Text style={[APP_THEME_V2.typography.scale.whisper, { color: APP_THEME_V2.colors.inkGray[600] }]}>
      "Your style journey begins with self-discovery"
    </Text>
  </View>
);

const DemoScreen2 = () => (
  <View style={styles.demoScreen}>
    <Text style={[APP_THEME_V2.typography.scale.h1, { color: APP_THEME_V2.colors.inkGray[800] }]}>
      Wardrobe
    </Text>
    <Text style={[APP_THEME_V2.typography.scale.whisper, { color: APP_THEME_V2.colors.inkGray[600] }]}>
      "Every piece tells a story of confidence"
    </Text>
  </View>
);

const DemoScreen3 = () => (
  <View style={styles.demoScreen}>
    <Text style={[APP_THEME_V2.typography.scale.h1, { color: APP_THEME_V2.colors.inkGray[800] }]}>
      Favorites
    </Text>
    <Text style={[APP_THEME_V2.typography.scale.whisper, { color: APP_THEME_V2.colors.inkGray[600] }]}>
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
            <View style={[styles.colorSwatch, { backgroundColor: APP_THEME_V2.colors.linen.base }]}>
              <Text style={styles.colorLabel}>Linen</Text>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: APP_THEME_V2.colors.sageGreen[500] }]}>
              <Text style={[styles.colorLabel, { color: 'white' }]}>Sage Green</Text>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: APP_THEME_V2.colors.liquidGold[500] }]}>
              <Text style={[styles.colorLabel, { color: 'white' }]}>Liquid Gold</Text>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: APP_THEME_V2.colors.inkGray[800] }]}>
              <Text style={[styles.colorLabel, { color: 'white' }]}>Ink Gray</Text>
            </View>
          </View>
        </View>

        {/* Typography Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Typography Hierarchy</Text>
          <View style={styles.typographyDemo}>
            <Text style={[APP_THEME_V2.typography.scale.hero, { color: APP_THEME_V2.colors.inkGray[800] }]}>
              Hero Text
            </Text>
            <Text style={[APP_THEME_V2.typography.scale.h1, { color: APP_THEME_V2.colors.inkGray[800] }]}>
              Heading 1
            </Text>
            <Text style={[APP_THEME_V2.typography.scale.body1, { color: APP_THEME_V2.colors.inkGray[600] }]}>
              Body text with perfect readability and harmonious spacing
            </Text>
            <Text style={[APP_THEME_V2.typography.scale.whisper, { color: APP_THEME_V2.colors.inkGray[600] }]}>
              "Whisper text for gentle, poetic moments"
            </Text>
          </View>
        </View>

        {/* Glassmorphism Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Glassmorphism Effects</Text>
          <View style={styles.glassContainer}>
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <View style={[styles.glassCardContent, APP_THEME_V2.glassmorphism.primary]}>
                <Text style={[APP_THEME_V2.typography.scale.h3, { color: APP_THEME_V2.colors.inkGray[800] }]}>
                  Primary Glass
                </Text>
                <Text style={[APP_THEME_V2.typography.scale.body2, { color: APP_THEME_V2.colors.inkGray[600] }]}>
                  Frosted glass effect with subtle transparency
                </Text>
              </View>
            </BlurView>
            
            <BlurView intensity={15} tint="light" style={styles.glassCard}>
              <View style={[styles.glassCardContent, APP_THEME_V2.glassmorphism.gold]}>
                <Text style={[APP_THEME_V2.typography.scale.h3, { color: APP_THEME_V2.colors.inkGray[800] }]}>
                  Liquid Gold Glass
                </Text>
                <Text style={[APP_THEME_V2.typography.scale.body2, { color: APP_THEME_V2.colors.inkGray[600] }]}>
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
            <Text style={[APP_THEME_V2.typography.scale.body1, { color: APP_THEME_V2.colors.inkGray[600], marginBottom: 16 }]}>
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
          <Text style={[APP_THEME_V2.typography.scale.body2, { color: APP_THEME_V2.colors.inkGray[600], marginBottom: 20 }]}>
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
          <Text style={[APP_THEME_V2.typography.scale.body2, { color: APP_THEME_V2.colors.inkGray[600], marginBottom: 20 }]}>
            Cross-fade transitions with zen-like choreography
          </Text>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => setShowFluidNav(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[APP_THEME_V2.colors.sageGreen[500], APP_THEME_V2.colors.liquidGold[500]]}
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
            <View style={[styles.elevationCard, APP_THEME_V2.elevation.whisper]}>
              <Text style={[APP_THEME_V2.typography.scale.caption, { color: APP_THEME_V2.colors.inkGray[600] }]}>
                Whisper
              </Text>
            </View>
            <View style={[styles.elevationCard, APP_THEME_V2.elevation.lift]}>
              <Text style={[APP_THEME_V2.typography.scale.caption, { color: APP_THEME_V2.colors.inkGray[600] }]}>
                Lift
              </Text>
            </View>
            <View style={[styles.elevationCard, APP_THEME_V2.elevation.float]}>
              <Text style={[APP_THEME_V2.typography.scale.caption, { color: APP_THEME_V2.colors.inkGray[600] }]}>
                Float
              </Text>
            </View>
            <View style={[styles.elevationCard, APP_THEME_V2.elevation.dramatic]}>
              <Text style={[APP_THEME_V2.typography.scale.caption, { color: APP_THEME_V2.colors.inkGray[600] }]}>
                Dramatic
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[APP_THEME_V2.typography.scale.whisper, { color: APP_THEME_V2.colors.inkGray[500] }]}>
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
    backgroundColor: APP_THEME_V2.colors.linen.base,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: APP_THEME_V2.spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...APP_THEME_V2.typography.scale.hero,
    color: APP_THEME_V2.colors.inkGray[800],
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  subtitle: {
    ...APP_THEME_V2.typography.scale.whisper,
    color: APP_THEME_V2.colors.inkGray[600],
    textAlign: 'center',
  },
  section: {
    padding: APP_THEME_V2.spacing.xl,
    marginBottom: APP_THEME_V2.spacing.md,
  },
  sectionTitle: {
    ...APP_THEME_V2.typography.scale.h2,
    color: APP_THEME_V2.colors.inkGray[800],
    marginBottom: APP_THEME_V2.spacing.lg,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: APP_THEME_V2.spacing.md,
  },
  colorSwatch: {
    width: 80,
    height: 80,
    borderRadius: APP_THEME_V2.radius.organic,
    justifyContent: 'center',
    alignItems: 'center',
    ...APP_THEME_V2.elevation.lift,
  },
  colorLabel: {
    ...APP_THEME_V2.typography.scale.caption,
    fontWeight: '600',
  },
  typographyDemo: {
    gap: APP_THEME_V2.spacing.md,
  },
  glassContainer: {
    gap: APP_THEME_V2.spacing.lg,
  },
  glassCard: {
    borderRadius: APP_THEME_V2.radius.organic,
    overflow: 'hidden',
  },
  glassCardContent: {
    padding: APP_THEME_V2.spacing.xl,
    borderRadius: APP_THEME_V2.radius.organic,
  },
  interactionDemo: {
    alignItems: 'center',
  },
  likeButtonGrid: {
    flexDirection: 'row',
    gap: APP_THEME_V2.spacing.xl,
  },
  demoButton: {
    borderRadius: APP_THEME_V2.radius.organic,
    overflow: 'hidden',
    ...APP_THEME_V2.elevation.lift,
  },
  demoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: APP_THEME_V2.spacing.lg,
    gap: APP_THEME_V2.spacing.sm,
  },
  demoButtonText: {
    ...APP_THEME_V2.typography.scale.button,
    color: 'white',
  },
  elevationDemo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: APP_THEME_V2.spacing.lg,
  },
  elevationCard: {
    width: 80,
    height: 60,
    backgroundColor: APP_THEME_V2.colors.whisperWhite,
    borderRadius: APP_THEME_V2.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: APP_THEME_V2.spacing.xl,
  },
  footer: {
    padding: APP_THEME_V2.spacing.xl,
    alignItems: 'center',
    marginTop: APP_THEME_V2.spacing.xxxl,
  },
}); 