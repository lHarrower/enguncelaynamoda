// Artistry Home Screen - The Living Digital Art Gallery
// Where style meets sophistication in an interactive masterpiece

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DesignSystem } from '../../theme/DesignSystem';
import { Ionicons } from '@expo/vector-icons';
import { logInDev } from '../../utils/consoleSuppress';

// Import artistry components
import AtmosphericBackground from './AtmosphericBackground';
import InteractiveTotem from './InteractiveTotem';
import BentoGallery from './BentoGallery';
import KineticTypography, { 
  PoetryText, 
  GalleryTitle, 
  WhisperText,
  StatementText 
} from './KineticTypography';

const { width, height } = Dimensions.get('window');

interface ArtistryHomeScreenProps {
  onNavigateToWardrobe?: () => void;
  onNavigateToDiscover?: () => void;
  onNavigateToMirror?: () => void;
  onNavigateToProfile?: () => void;
}

const ArtistryHomeScreen: React.FC<ArtistryHomeScreenProps> = ({
  onNavigateToWardrobe,
  onNavigateToDiscover,
  onNavigateToMirror,
  onNavigateToProfile,
}) => {
  const insets = useSafeAreaInsets();
  const [currentAtmosphere, setCurrentAtmosphere] = useState<'emerald' | 'sapphire' | 'ruby' | 'gold'>('emerald');
  const [isReady, setIsReady] = useState(false);

  // Initialize the component
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Cycle through atmospheric variants - MUST be before conditional rendering
  useEffect(() => {
    const atmosphereTimer = setInterval(() => {
      setCurrentAtmosphere(prev => {
        const variants: Array<'emerald' | 'sapphire' | 'ruby' | 'gold'> = ['emerald', 'sapphire', 'ruby', 'gold'];
        const currentIndex = variants.indexOf(prev);
        return variants[(currentIndex + 1) % variants.length];
      });
    }, 30000); // Change every 30 seconds

    return () => clearInterval(atmosphereTimer);
  }, []);

  // Show loading state while initializing
  if (!isReady) {
    return (
      <AtmosphericBackground variant="emerald" intensity="subtle">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Preparing your gallery...</Text>
        </View>
      </AtmosphericBackground>
    );
  }

  // Sample totem facets for daily ritual
  const totemFacets = [
    {
      id: 'outfit',
      type: 'outfit' as const,
      title: 'Today\'s Inspiration',
      content: {
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop&q=80',
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
        message: 'Your wardrobe speaks of quiet confidence and timeless elegance. Today, let your inner light shine through carefully chosen pieces.',
      },
    },
    {
      id: 'components',
      type: 'components' as const,
      title: 'Wardrobe Elements',
      content: {
        items: [
          { image: 'https://images.unsplash.com/photo-1581044777550-4cfa6ce670c0?w=100&h=100&fit=crop&q=80', label: 'Blazer' },
          { image: 'https://images.unsplash.com/photo-1594619336195-39a8f2712533?w=100&h=100&fit=crop&q=80', label: 'Dress' },
          { image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&h=100&fit=crop&q=80', label: 'Shoes' },
          { image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=100&h=100&fit=crop&q=80', label: 'Bag' },
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
        description: 'Embrace your inner glow',
        gradient: [
          DesignSystem.colors.sage[400],
        DesignSystem.colors.sage[500],
        ],
      },
    },
  ];

  // Bento gallery items
  const bentoItems = [
    {
      id: 'hero-totem',
      type: 'interactive' as const,
      span: 2 as const,
      height: 'large' as const,
      title: 'Daily Ritual',
      subtitle: 'Your personalized style journey',
      content: {
        icon: 'sparkles',
        gradient: [
          DesignSystem.colors.sage[400],
          'transparent',
          DesignSystem.colors.sage[500],
        ],
      },
      onPress: () => {
        // Navigate to daily ritual screen
        logInDev('Navigate to daily ritual');
      },
    },
    {
      id: 'style-confidence',
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
      id: 'wardrobe-items',
      type: 'metric' as const,
      span: 1 as const,
      height: 'medium' as const,
      content: {
        value: '127',
        label: 'Wardrobe Items',
        trend: 12,
      },
    },
    {
      id: 'style-whisper',
      type: 'text' as const,
      span: 2 as const,
      height: 'small' as const,
      title: 'Today\'s Whisper',
      content: {
        icon: 'leaf-outline',
        message: 'Your style is a reflection of your inner confidence. Let it shine.',
      },
    },
    {
      id: 'featured-look',
      type: 'image' as const,
      span: 1 as const,
      height: 'large' as const,
      title: 'Featured Look',
      subtitle: 'Curated for you',
      content: {
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop&q=80',
      },
      onPress: onNavigateToDiscover,
    },
    {
      id: 'wardrobe-access',
      type: 'interactive' as const,
      span: 1 as const,
      height: 'medium' as const,
      title: 'Wardrobe',
      subtitle: 'Your collection',
      content: {
        icon: 'shirt-outline',
        gradient: [
          DesignSystem.colors.sage[600],
          'transparent',
        ],
      },
      onPress: onNavigateToWardrobe,
    },
    {
      id: 'mirror-access',
      type: 'interactive' as const,
      span: 1 as const,
      height: 'medium' as const,
      title: 'Ayna Mirror',
      subtitle: 'Virtual styling',
      content: {
        icon: 'glasses-outline',
        gradient: [
          DesignSystem.colors.sage[700],
          'transparent',
        ],
      },
      onPress: onNavigateToMirror,
    },
    {
      id: 'kinetic-element',
      type: 'kinetic' as const,
      span: 1 as const,
      height: 'small' as const,
      title: 'Style Score',
      content: {
        symbol: '8.7',
      },
    },
    {
      id: 'profile-access',
      type: 'interactive' as const,
      span: 1 as const,
      height: 'small' as const,
      title: 'Profile',
      subtitle: 'Your style DNA',
      content: {
        icon: 'person-outline',
        gradient: [
          DesignSystem.colors.sage[400],
          'transparent',
        ],
      },
      onPress: onNavigateToProfile,
    },
  ];



  const handleTotemFacetChange = (facetId: string) => {
    logInDev('Totem facet changed:', facetId);
    // You can add haptic feedback or other interactions here
  };

  return (
    <AtmosphericBackground variant={currentAtmosphere} intensity="subtle">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + DesignSystem.spacing.xxl }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Floating Header */}
        <View style={[styles.header, { paddingTop: insets.top + DesignSystem.spacing.lg }]}>
          <PoetryText animation="glide" delay={0}>
            AYNAMODA
          </PoetryText>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons 
                name="search-outline" 
                size={20} 
                color={DesignSystem.colors.text.tertiary} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons 
                name="notifications-outline" 
                size={20} 
                color={DesignSystem.colors.text.tertiary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section with Interactive Totem */}
        <View style={styles.heroSection}>
          <GalleryTitle 
            animation="glide" 
            delay={300}
            style={styles.heroTitle}
          >
            Your Daily Ritual
          </GalleryTitle>
          
          <WhisperText 
            animation="glide" 
            delay={600}
            style={styles.heroSubtitle}
          >
            Where style meets sophistication
          </WhisperText>

          <InteractiveTotem
            facets={totemFacets}
            onFacetChange={handleTotemFacetChange}
            style={styles.totem}
          />
        </View>

        {/* Gallery Section Title */}
        <View style={styles.galleryHeader}>
          <StatementText 
            animation="glide" 
            delay={900}
            shimmerWords={['Gallery']}
          >
            Your Style Gallery
          </StatementText>
          
          <WhisperText 
            animation="glide" 
            delay={1200}
          >
            Curated experiences for your fashion journey
          </WhisperText>
        </View>

        {/* Bento Gallery */}
        <BentoGallery
          items={bentoItems}
          columns={2}
          spacing={DesignSystem.spacing.md}
          style={styles.gallery}
        />

        {/* Atmospheric Indicator */}
        <View style={styles.atmosphereIndicator}>
          <WhisperText animation="shimmer">
            {`Atmosphere: ${currentAtmosphere}`}
          </WhisperText>
        </View>
      </ScrollView>
    </AtmosphericBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.radius.md,
    ...DesignSystem.elevation.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Hero Section Styles
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.xxl,
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  heroSubtitle: {
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  totem: {
    marginTop: DesignSystem.spacing.lg,
  },
  
  // Gallery Styles
  galleryHeader: {
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
  },
  gallery: {
    flex: 1,
  },
  
  // Atmosphere Indicator
  atmosphereIndicator: {
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.lg,
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
  },
  loadingText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.tertiary,
  },
});

export default ArtistryHomeScreen;