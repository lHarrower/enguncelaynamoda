/**
 * Editorial "Weekly Color" Section
 * 
 * A premium editorial section inspired by Gucci's editorial grid and Poppi's color play.
 * Features weekly evolving visual themes with staggered grid layout and serif typography.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
  ORIGINAL_COLORS,
  ORIGINAL_TYPOGRAPHY,
  ORIGINAL_SPACING,
  ORIGINAL_BORDER_RADIUS,
} from '../auth/originalLoginStyles';

const { width: screenWidth } = Dimensions.get('window');

export interface ColorTheme {
  id: string;
  name: string;
  subtitle: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gradientColors: string[];
  description: string;
  week: string;
  heroImage: string;
  editorialImages: EditorialImage[];
}

export interface EditorialImage {
  id: string;
  url: string;
  title: string;
  subtitle?: string;
  aspectRatio: 'square' | 'portrait' | 'landscape';
  size: 'small' | 'medium' | 'large';
}

export interface EditorialColorSectionProps {
  /** Current weekly color theme */
  colorTheme: ColorTheme;
  
  /** Callback when explore color is pressed */
  onExploreColor?: (theme: ColorTheme) => void;
  
  /** Callback when editorial image is pressed */
  onImagePress?: (image: EditorialImage, theme: ColorTheme) => void;
  
  /** Whether to show animations */
  enableAnimations?: boolean;
}

export const EditorialColorSection: React.FC<EditorialColorSectionProps> = ({
  colorTheme,
  onExploreColor,
  onImagePress,
  enableAnimations = true,
}) => {
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());
  const fadeAnims = useRef<{ [key: string]: Animated.Value }>({}).current;
  const scaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Initialize animations for each image
  useEffect(() => {
    colorTheme.editorialImages.forEach((image) => {
      if (!fadeAnims[image.id]) {
        fadeAnims[image.id] = new Animated.Value(0);
      }
      if (!scaleAnims[image.id]) {
        scaleAnims[image.id] = new Animated.Value(0.95);
      }
    });
  }, [colorTheme.editorialImages]);

  const handleImageLoad = (imageId: string) => {
    setImagesLoaded(prev => new Set([...prev, imageId]));
    
    if (enableAnimations && fadeAnims[imageId]) {
      // Staggered fade-in animation
      const delay = Math.random() * 300; // Random delay for organic feel
      
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnims[imageId], {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnims[imageId], {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }, delay);
    }
  };

  const handleImagePress = (image: EditorialImage) => {
    // Micro-interaction: scale down on press
    if (enableAnimations && scaleAnims[image.id]) {
      Animated.sequence([
        Animated.timing(scaleAnims[image.id], {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnims[image.id], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onImagePress?.(image, colorTheme);
  };

  const handleExplorePress = () => {
    onExploreColor?.(colorTheme);
  };

  const renderEditorialImage = (image: EditorialImage, index: number) => {
    const isLoaded = imagesLoaded.has(image.id);
    const fadeAnim = fadeAnims[image.id] || new Animated.Value(enableAnimations ? 0 : 1);
    const scaleAnim = scaleAnims[image.id] || new Animated.Value(1);

    // Calculate image dimensions based on size and aspect ratio
    const getImageStyle = () => {
      const baseWidth = screenWidth - (ORIGINAL_SPACING.containerHorizontal * 2);
      const columnWidth = (baseWidth - 12) / 2; // 12px gap between columns

      let width = columnWidth;
      let height = columnWidth;

      if (image.size === 'large') {
        width = baseWidth;
      }

      switch (image.aspectRatio) {
        case 'portrait':
          height = width * 1.4;
          break;
        case 'landscape':
          height = width * 0.7;
          break;
        case 'square':
        default:
          height = width;
          break;
      }

      return { width, height };
    };

    const imageStyle = getImageStyle();

    return (
      <Animated.View
        key={image.id}
        style={[
          styles.editorialImageContainer,
          imageStyle,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.editorialImageTouchable}
          onPress={() => handleImagePress(image)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: image.url }}
            style={styles.editorialImage}
            onLoad={() => handleImageLoad(image.id)}
            resizeMode="cover"
          />
          
          {/* Image Loading Placeholder */}
          {!isLoaded && (
            <View style={styles.imagePlaceholder}>
              <Ionicons 
                name="image-outline" 
                size={32} 
                color={ORIGINAL_COLORS.placeholderText} 
              />
            </View>
          )}

          {/* Image Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={styles.imageOverlay}
          >
            <View style={styles.imageContent}>
              <Text style={styles.imageTitle} numberOfLines={2}>
                {image.title}
              </Text>
              {image.subtitle && (
                <Text style={styles.imageSubtitle} numberOfLines={1}>
                  {image.subtitle}
                </Text>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <LinearGradient
          colors={colorTheme.gradientColors}
          style={styles.heroGradient}
        >
          <Image
            source={{ uri: colorTheme.heroImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          
          {/* Hero Content Overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={styles.heroOverlay}
          >
            <View style={styles.heroContent}>
              {/* Week Badge */}
              <View style={styles.weekBadge}>
                <Text style={styles.weekText}>{colorTheme.week}</Text>
              </View>
              
              {/* Main Title */}
              <Text style={[styles.heroTitle, { color: colorTheme.accentColor }]}>
                {colorTheme.name}
              </Text>
              
              {/* Subtitle */}
              <Text style={styles.heroSubtitle}>
                {colorTheme.subtitle}
              </Text>
              
              {/* Description */}
              <Text style={styles.heroDescription}>
                {colorTheme.description}
              </Text>
            </View>
          </LinearGradient>
        </LinearGradient>
      </View>

      {/* Editorial Grid */}
      <View style={styles.editorialSection}>
        <Text style={styles.sectionTitle}>Rengin Hikayesi</Text>
        <Text style={styles.sectionSubtitle}>
          Bu haftanın rengini keşfet ve stiline yansıt
        </Text>

        {/* Staggered Grid Layout */}
        <View style={styles.editorialGrid}>
          <View style={styles.gridColumn}>
            {colorTheme.editorialImages
              .filter((_, index) => index % 2 === 0)
              .map((image, index) => renderEditorialImage(image, index * 2))}
          </View>
          
          <View style={[styles.gridColumn, styles.rightColumn]}>
            {colorTheme.editorialImages
              .filter((_, index) => index % 2 === 1)
              .map((image, index) => renderEditorialImage(image, index * 2 + 1))}
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={handleExplorePress}
          activeOpacity={0.9}
        >
          <BlurView intensity={30} style={styles.exploreButtonBlur}>
            <LinearGradient
              colors={[colorTheme.primaryColor + '20', colorTheme.secondaryColor + '20']}
              style={styles.exploreButtonGradient}
            >
              <Text style={[styles.exploreButtonText, { color: colorTheme.accentColor }]}>
                Bu Rengi Keşfet
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color={colorTheme.accentColor} 
              />
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ORIGINAL_COLORS.background,
  },

  // Hero Section
  heroSection: {
    height: screenWidth * 0.8, // Square-ish hero
    marginBottom: ORIGINAL_SPACING.brandSectionBottom,
  },

  heroGradient: {
    flex: 1,
    position: 'relative',
  },

  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  heroContent: {
    padding: ORIGINAL_SPACING.containerHorizontal,
    paddingBottom: 40,
  },

  weekBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },

  weekText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  heroTitle: {
    fontSize: 36,
    fontWeight: '400', // Serif feel
    lineHeight: 42,
    marginBottom: 8,
    fontFamily: 'serif', // Use serif for editorial feel
  },

  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
    fontWeight: '500',
  },

  heroDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
    maxWidth: '90%',
  },

  // Editorial Section
  editorialSection: {
    paddingHorizontal: ORIGINAL_SPACING.containerHorizontal,
    marginBottom: 40,
  },

  sectionTitle: {
    ...ORIGINAL_TYPOGRAPHY.title,
    fontSize: 28,
    marginBottom: 8,
    fontFamily: 'serif',
  },

  sectionSubtitle: {
    ...ORIGINAL_TYPOGRAPHY.subtitle,
    fontSize: 16,
    marginBottom: 32,
  },

  editorialGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  gridColumn: {
    flex: 1,
    gap: 12,
  },

  rightColumn: {
    marginTop: 40, // Stagger the right column
  },

  editorialImageContainer: {
    borderRadius: ORIGINAL_BORDER_RADIUS.input,
    overflow: 'hidden',
    backgroundColor: ORIGINAL_COLORS.inputBackground,
    shadowColor: ORIGINAL_COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  editorialImageTouchable: {
    flex: 1,
    position: 'relative',
  },

  editorialImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ORIGINAL_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
  },

  imageContent: {
    padding: 16,
  },

  imageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },

  imageSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  // CTA Section
  ctaSection: {
    paddingHorizontal: ORIGINAL_SPACING.containerHorizontal,
    paddingBottom: 40,
    alignItems: 'center',
  },

  exploreButton: {
    width: '100%',
    maxWidth: 280,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },

  exploreButtonBlur: {
    flex: 1,
  },

  exploreButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  exploreButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: ORIGINAL_TYPOGRAPHY.button.fontFamily,
  },
});

export default EditorialColorSection;