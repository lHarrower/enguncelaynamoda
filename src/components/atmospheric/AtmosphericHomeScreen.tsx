// Atmospheric Home Screen - The Complete Art Installation
// Living, breathing digital art gallery where users discover their style

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesignSystem } from '../../theme/DesignSystem';
import { logInDev } from '../../utils/consoleSuppress';
import EditorialBentoGallery, { type BentoItem } from './EditorialBentoGallery';
import InteractiveTotem, { type TotemFacet } from './InteractiveTotem';
import InvisibleNavigation from './InvisibleNavigation';
// Import atmospheric components
import LivingAtmosphere from './LivingAtmosphere';

const { width, height } = Dimensions.get('window');

interface AtmosphericHomeScreenProps {
  onNavigateToWardrobe?: () => void;
  onNavigateToDiscover?: () => void;
  onNavigateToMirror?: () => void;
  onNavigateToProfile?: () => void;
}

const AtmosphericHomeScreen: React.FC<AtmosphericHomeScreenProps> = ({
  onNavigateToWardrobe,
  onNavigateToDiscover,
  onNavigateToMirror,
  onNavigateToProfile,
}) => {
  const insets = useSafeAreaInsets();
  const ATMOSPHERE_VARIANTS = useMemo(
    () => ['emerald', 'sapphire', 'ruby', 'amethyst'] as const,
    [],
  );
  type AtmosphereVariant = (typeof ATMOSPHERE_VARIANTS)[number];
  const [currentAtmosphere, setCurrentAtmosphere] = useState<AtmosphereVariant>('emerald');

  // Helper function to get variant colors
  const getVariantColor = (variant: string) => {
    const colorMap: Record<string, string> = {
      emerald: DesignSystem.colors.sage[400],
      sapphire: DesignSystem.colors.sage[500],
      ruby: DesignSystem.colors.sage[600],
      amethyst: DesignSystem.colors.sage[300],
    };
    return colorMap[variant] || DesignSystem.colors.sage[400];
  };

  // Cycle through atmospheric variants every 45 seconds
  useEffect(() => {
    const atmosphereTimer = setInterval(() => {
      setCurrentAtmosphere((prev: AtmosphereVariant) => {
        const currentIndex = ATMOSPHERE_VARIANTS.indexOf(prev);
        const nextIndex = (currentIndex + 1) % ATMOSPHERE_VARIANTS.length;
        const next = ATMOSPHERE_VARIANTS[nextIndex];
        return next ?? 'emerald';
      });
    }, 45000);

    return () => clearInterval(atmosphereTimer);
  }, [ATMOSPHERE_VARIANTS]);

  // Interactive Totem facets - the heart of the experience
  const totemFacets: TotemFacet[] = [
    {
      id: 'outfit',
      type: 'outfit' as const,
      title: "Today's Inspiration",
      content: {
        image:
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop&q=80',
        title: 'Confident Elegance',
        subtitle: 'Sophisticated & Timeless',
        confidence: 94,
      },
    },
    {
      id: 'whisper',
      type: 'whisper' as const,
      title: 'Style Whisper',
      content: {
        message:
          'Your wardrobe speaks of quiet confidence and timeless elegance. Today, let your inner light shine through carefully chosen pieces that reflect your sophisticated taste.',
      },
    },
    {
      id: 'components',
      type: 'components' as const,
      title: 'Wardrobe Elements',
      content: {
        items: [
          {
            image:
              'https://images.unsplash.com/photo-1581044777550-4cfa6ce670c0?w=120&h=120&fit=crop&q=80',
            label: 'Blazer',
          },
          {
            image:
              'https://images.unsplash.com/photo-1594619336195-39a8f2712533?w=120&h=120&fit=crop&q=80',
            label: 'Dress',
          },
          {
            image:
              'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=120&h=120&fit=crop&q=80',
            label: 'Shoes',
          },
          {
            image:
              'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=120&h=120&fit=crop&q=80',
            label: 'Bag',
          },
        ],
      },
    },
    {
      id: 'mood',
      type: 'mood' as const,
      title: "Today's Mood",
      content: {
        emoji: '✨',
        mood: {
          color: DesignSystem.colors.sage[400],
          emotion: 'Radiant Confidence',
          description: 'Embrace your inner glow',
        },
        description: 'Embrace your inner glow and let it illuminate your style choices',
        gradient: [
          DesignSystem.colors.sage[300],
          DesignSystem.colors.sage[400],
          DesignSystem.colors.sage[500],
        ] as const,
      },
    },
  ];

  // Editorial Bento Gallery items - high-fashion spread
  const bentoItems: BentoItem[] = [
    {
      id: 'hero-discovery',
      type: 'hero' as const,
      span: 2 as const,
      height: 'large' as const,
      title: 'Discover Your Style',
      subtitle: 'Curated collections that speak to your soul',
      content: {
        image:
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop&q=80',
      },
      onPress: onNavigateToDiscover,
    },
    {
      id: 'confidence-metric',
      type: 'metric' as const,
      span: 1 as const,
      height: 'medium' as const,
      content: {
        value: '94%',
        label: 'Style Confidence',
        trend: 8,
      },
    },
    {
      id: 'wardrobe-glass',
      type: 'glass' as const,
      span: 1 as const,
      height: 'medium' as const,
      title: 'Your Wardrobe',
      subtitle: '127 curated pieces',
      content: {
        icon: 'shirt-outline' as keyof typeof Ionicons.glyphMap,
      },
      onPress: onNavigateToWardrobe,
    },
    {
      id: 'style-statement',
      type: 'typography' as const,
      span: 2 as const,
      height: 'small' as const,
      title: 'Style is a way to say who you are without having to speak',
      subtitle: '— Rachel Zoe',
      content: {
        gradient: [
          DesignSystem.colors.sage[400],
          DesignSystem.colors.sage[500],
          DesignSystem.colors.sage[600],
        ] as const,
        icon: 'sparkles' as keyof typeof Ionicons.glyphMap,
      },
    },
    {
      id: 'mirror-experience',
      type: 'gradient' as const,
      span: 1 as const,
      height: 'medium' as const,
      title: 'Ayna Mirror',
      subtitle: 'Virtual styling experience',
      content: {
        gradient: [
          DesignSystem.colors.sage[500],
          DesignSystem.colors.sage[400],
          DesignSystem.colors.sage[300],
        ] as const,
      },
      onPress: onNavigateToMirror,
    },
    {
      id: 'style-score',
      type: 'metric' as const,
      span: 1 as const,
      height: 'medium' as const,
      content: {
        value: '8.7',
        label: 'Style Score',
        trend: 12,
      },
    },
    {
      id: 'profile-journey',
      type: 'image' as const,
      span: 1 as const,
      height: 'small' as const,
      title: 'Your Journey',
      subtitle: 'Style evolution',
      content: {
        image:
          'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop&q=80',
      },
      onPress: onNavigateToProfile,
    },
    {
      id: 'inspiration-quote',
      type: 'glass' as const,
      span: 1 as const,
      height: 'small' as const,
      title: 'Daily Inspiration',
      subtitle: 'Confidence whisper',
      content: {
        icon: 'leaf-outline' as keyof typeof Ionicons.glyphMap,
      },
    },
  ];

  // Navigation items for invisible navigation
  const navigationItems = [
    {
      id: 'home',
      title: 'Sanctuary',
      subtitle: 'Your personal style sanctuary',
      icon: 'home-outline' as const,
      onPress: () => {},
    },
    {
      id: 'wardrobe',
      title: 'Wardrobe',
      subtitle: 'Your curated collection',
      icon: 'shirt-outline' as const,
      onPress: onNavigateToWardrobe || (() => {}),
    },
    {
      id: 'mirror',
      title: 'Ayna Mirror',
      subtitle: 'Virtual styling experience',
      icon: 'glasses-outline' as const,
      onPress: onNavigateToMirror || (() => {}),
    },
    {
      id: 'discover',
      title: 'Discover',
      subtitle: 'Explore new possibilities',
      icon: 'sparkles-outline' as const,
      onPress: onNavigateToDiscover || (() => {}),
    },
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Your style DNA',
      icon: 'person-outline' as const,
      onPress: onNavigateToProfile || (() => {}),
    },
  ];

  const handleTotemFacetChange = (facetId: string) => {
    logInDev('Totem facet changed:', facetId);
    // Add any additional logic for facet changes
  };

  return (
    <LivingAtmosphere variant={currentAtmosphere} intensity="subtle">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Invisible Navigation System */}
      <InvisibleNavigation items={navigationItems} currentRoute="home" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Interactive Totem */}
        <View style={[styles.heroSection, { paddingTop: insets.top + 80 }]}>
          {/* Atmospheric Title */}
          <View style={styles.atmosphericTitle}>
            <Text style={styles.sanctuaryTitle}>Your Sanctuary</Text>
            <Text style={styles.sanctuarySubtitle}>Where style meets sophistication</Text>
          </View>

          {/* Interactive Totem - The Heart */}
          <InteractiveTotem
            facets={totemFacets}
            onFacetChange={handleTotemFacetChange}
            style={styles.totem}
          />
        </View>

        {/* Editorial Gallery Section */}
        <View style={styles.gallerySection}>
          {/* Gallery Header */}
          <View style={styles.galleryHeader}>
            <Text style={styles.galleryTitle}>Your Style Universe</Text>
            <Text style={styles.gallerySubtitle}>Curated experiences for your fashion journey</Text>
          </View>

          {/* Editorial Bento Gallery */}
          <EditorialBentoGallery
            items={bentoItems}
            columns={2}
            spacing={16}
            style={styles.gallery}
          />
        </View>

        {/* Atmospheric Indicator */}
        <View style={styles.atmosphereIndicator}>
          <Text style={styles.atmosphereText}>Atmosphere: {currentAtmosphere}</Text>
          <View style={styles.atmosphereDots}>
            {['emerald', 'sapphire', 'ruby', 'amethyst'].map((variant, index) => (
              <View
                key={variant}
                style={[
                  styles.atmosphereDot,
                  variant === currentAtmosphere && styles.activeAtmosphereDot,
                  { backgroundColor: getVariantColor(variant) },
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </LivingAtmosphere>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },

  // Hero Section Styles
  heroSection: {
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: 24,
  },
  atmosphericTitle: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sanctuaryTitle: {
    ...DesignSystem.typography.scale.h1,
    color: DesignSystem.colors.text.primary,
    fontSize: 48,
    marginBottom: 12,
    textAlign: 'center',
  },
  sanctuarySubtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    fontSize: 18,
    textAlign: 'center',
  },
  totem: {
    marginTop: 20,
  },

  // Gallery Section Styles
  gallerySection: {
    flex: 1,
  },
  galleryHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  galleryTitle: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.text.primary,
    fontSize: 32,
    marginBottom: 12,
    textAlign: 'center',
  },
  gallerySubtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    fontSize: 16,
    textAlign: 'center',
  },
  gallery: {
    flex: 1,
  },

  // Atmosphere Indicator
  atmosphereIndicator: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  atmosphereText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    marginBottom: 12,
    opacity: 0.6,
  },
  atmosphereDots: {
    flexDirection: 'row',
    gap: 8,
  },
  atmosphereDot: {
    borderRadius: 4,
    height: 8,
    opacity: 0.3,
    width: 8,
  },
  activeAtmosphereDot: {
    opacity: 1,
    width: 24,
  },
});

export default AtmosphericHomeScreen;
