// Atmospheric Home Screen - The Complete Art Installation
// Living, breathing digital art gallery where users discover their style

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ATMOSPHERIC_THEME } from '../../constants/AtmosphericTheme';

// Import atmospheric components
import LivingAtmosphere from './LivingAtmosphere';
import InteractiveTotem from './InteractiveTotem';
import EditorialBentoGallery from './EditorialBentoGallery';
import InvisibleNavigation from './InvisibleNavigation';

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
  const [currentAtmosphere, setCurrentAtmosphere] = useState<'emerald' | 'sapphire' | 'ruby' | 'amethyst'>('emerald');

  // Cycle through atmospheric variants every 45 seconds
  useEffect(() => {
    const atmosphereTimer = setInterval(() => {
      setCurrentAtmosphere(prev => {
        const variants: Array<'emerald' | 'sapphire' | 'ruby' | 'amethyst'> = 
          ['emerald', 'sapphire', 'ruby', 'amethyst'];
        const currentIndex = variants.indexOf(prev);
        return variants[(currentIndex + 1) % variants.length];
      });
    }, 45000);

    return () => clearInterval(atmosphereTimer);
  }, []);

  // Interactive Totem facets - the heart of the experience
  const totemFacets = [
    {
      id: 'outfit',
      type: 'outfit' as const,
      title: 'Today\'s Inspiration',
      content: {
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop&q=80',
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
        message: 'Your wardrobe speaks of quiet confidence and timeless elegance. Today, let your inner light shine through carefully chosen pieces that reflect your sophisticated taste.',
      },
    },
    {
      id: 'components',
      type: 'components' as const,
      title: 'Wardrobe Elements',
      content: {
        items: [
          { image: 'https://images.unsplash.com/photo-1581044777550-4cfa6ce670c0?w=120&h=120&fit=crop&q=80', label: 'Blazer' },
          { image: 'https://images.unsplash.com/photo-1594619336195-39a8f2712533?w=120&h=120&fit=crop&q=80', label: 'Dress' },
          { image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=120&h=120&fit=crop&q=80', label: 'Shoes' },
          { image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=120&h=120&fit=crop&q=80', label: 'Bag' },
        ],
      },
    },
    {
      id: 'mood',
      type: 'mood' as const,
      title: 'Today\'s Mood',
      content: {
        emoji: '✨',
        mood: 'Radiant Confidence',
        description: 'Embrace your inner glow and let it illuminate your style choices',
        gradient: [
          ATMOSPHERIC_THEME.colors.gold.glow,
          ATMOSPHERIC_THEME.colors.emerald.glow,
        ],
      },
    },
  ];

  // Editorial Bento Gallery items - high-fashion spread
  const bentoItems = [
    {
      id: 'hero-discovery',
      type: 'hero' as const,
      span: 2 as const,
      height: 'large' as const,
      title: 'Discover Your Style',
      subtitle: 'Curated collections that speak to your soul',
      content: {
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop&q=80',
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
        icon: 'shirt-outline',
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
          ATMOSPHERIC_THEME.colors.sapphire.shimmer,
          ATMOSPHERIC_THEME.colors.amethyst.shimmer,
        ],
        icon: 'sparkles',
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
          ATMOSPHERIC_THEME.colors.ruby.glow,
          ATMOSPHERIC_THEME.colors.gold.glow,
        ],
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
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop&q=80',
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
        icon: 'leaf-outline',
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
    console.log('Totem facet changed:', facetId);
    // Add any additional logic for facet changes
  };

  return (
    <LivingAtmosphere variant={currentAtmosphere} intensity="subtle">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Invisible Navigation System */}
      <InvisibleNavigation 
        items={navigationItems}
        currentRoute="home"
      />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 80 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Interactive Totem */}
        <View style={[styles.heroSection, { paddingTop: insets.top + 80 }]}>
          {/* Atmospheric Title */}
          <View style={styles.atmosphericTitle}>
            <Text style={styles.sanctuaryTitle}>Your Sanctuary</Text>
            <Text style={styles.sanctuarySubtitle}>
              Where style meets sophistication
            </Text>
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
            <Text style={styles.gallerySubtitle}>
              Curated experiences for your fashion journey
            </Text>
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
          <Text style={styles.atmosphereText}>
            Atmosphere: {currentAtmosphere}
          </Text>
          <View style={styles.atmosphereDots}>
            {['emerald', 'sapphire', 'ruby', 'amethyst'].map((variant, index) => (
              <View
                key={variant}
                style={[
                  styles.atmosphereDot,
                  variant === currentAtmosphere && styles.activeAtmosphereDot,
                  { backgroundColor: ATMOSPHERIC_THEME.colors[variant as keyof typeof ATMOSPHERIC_THEME.colors].glow }
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
    paddingHorizontal: 24,
    marginBottom: 60,
  },
  atmosphericTitle: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sanctuaryTitle: {
    ...ATMOSPHERIC_THEME.typography.scale.editorial,
    color: ATMOSPHERIC_THEME.semantic.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 48,
  },
  sanctuarySubtitle: {
    ...ATMOSPHERIC_THEME.typography.scale.whisper,
    color: ATMOSPHERIC_THEME.semantic.text.whisper,
    textAlign: 'center',
    fontSize: 18,
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
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  galleryTitle: {
    ...ATMOSPHERIC_THEME.typography.scale.statement,
    color: ATMOSPHERIC_THEME.semantic.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 32,
  },
  gallerySubtitle: {
    ...ATMOSPHERIC_THEME.typography.scale.whisper,
    color: ATMOSPHERIC_THEME.semantic.text.whisper,
    textAlign: 'center',
    fontSize: 16,
  },
  gallery: {
    flex: 1,
  },
  
  // Atmosphere Indicator
  atmosphereIndicator: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  atmosphereText: {
    ...ATMOSPHERIC_THEME.typography.scale.caption,
    color: ATMOSPHERIC_THEME.semantic.text.caption,
    marginBottom: 12,
    opacity: 0.6,
  },
  atmosphereDots: {
    flexDirection: 'row',
    gap: 8,
  },
  atmosphereDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.3,
  },
  activeAtmosphereDot: {
    opacity: 1,
    width: 24,
  },
});

export default AtmosphericHomeScreen;