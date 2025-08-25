/**
 * Experience Story Block
 *
 * A cinematic scrollable story section inspired by Moments Epic and Obys Agency.
 * Features layered scroll reveals, parallax effects, and narrative storytelling
 * with Turkish content and premium styling.
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ORIGINAL_SPACING, ORIGINAL_TYPOGRAPHY } from '@/components/auth/originalLoginStyles';
import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface StoryItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  tags?: string[];
  moment: string; // e.g., "Sabah Kahvesi İçin"
  color?: string;
}

export interface ExperienceStory {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  backgroundImage: string;
  backgroundVideo?: string;
  accentColor: string;
  gradientColors: string[];
  items: StoryItem[];
}

export interface ExperienceStoryBlockProps {
  /** Story data to display */
  story: ExperienceStory;

  /** Callback when story item is pressed */
  onItemPress?: (item: StoryItem, story: ExperienceStory) => void;

  /** Callback when story is completed */
  onStoryComplete?: (story: ExperienceStory) => void;

  /** Whether to enable parallax effects */
  enableParallax?: boolean;

  /** Whether to enable scroll snapping */
  enableSnapping?: boolean;
}

export const ExperienceStoryBlock: React.FC<ExperienceStoryBlockProps> = ({
  story,
  onItemPress,
  onStoryComplete,
  enableParallax = true,
  enableSnapping = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnims = useRef<{ [key: string]: Animated.Value }>({}).current;
  const scaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Initialize animations for each story item
  useEffect(() => {
    story.items.forEach((item, index) => {
      if (!fadeAnims[item.id]) {
        fadeAnims[item.id] = new Animated.Value(index === 0 ? 1 : 0);
      }
      if (!scaleAnims[item.id]) {
        scaleAnims[item.id] = new Animated.Value(index === 0 ? 1 : 0.9);
      }
    });
  }, [story.items, fadeAnims, scaleAnims]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);

    if (index !== currentIndex && index >= 0 && index < story.items.length) {
      setCurrentIndex(index);

      // Animate current item in, others out
      story.items.forEach((item, i) => {
        const isActive = i === index;
        const fade = fadeAnims[item.id];
        const scale = scaleAnims[item.id];
        if (fade && scale) {
          Animated.parallel([
            Animated.timing(fade, {
              toValue: isActive ? 1 : 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: isActive ? 1 : 0.9,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
        }
      });
    }

    // Check if story is completed
    if (index === story.items.length - 1) {
      setTimeout(() => {
        onStoryComplete?.(story);
      }, 1000);
    }
  };

  const handleItemPress = (item: StoryItem) => {
    onItemPress?.(item, story);
  };

  const handleImageLoad = (itemId: string) => {
    setImagesLoaded((prev) => new Set([...prev, itemId]));
  };

  const renderStoryItem = (item: StoryItem, index: number) => {
    const isActive = index === currentIndex;
    const fadeAnim = fadeAnims[item.id] || new Animated.Value(0);
    const scaleAnim = scaleAnims[item.id] || new Animated.Value(0.9);
    const isLoaded = imagesLoaded.has(item.id);

    // Parallax effect for background
    const parallaxOffset = enableParallax
      ? scrollX.interpolate({
          inputRange: [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth],
          outputRange: [50, 0, -50],
          extrapolate: 'clamp',
        })
      : 0;

    return (
      <View key={item.id} style={styles.storyItem}>
        {/* Background Image with Parallax */}
        <Animated.View
          style={[
            styles.backgroundContainer,
            enableParallax && {
              transform: [{ translateX: parallaxOffset }],
            },
          ]}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.backgroundImage}
            onLoad={() => handleImageLoad(item.id)}
            resizeMode="cover"
          />

          {/* Loading Placeholder */}
          {!isLoaded && (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="image-outline"
                size={48}
                color={DesignSystem.colors.text.placeholder}
              />
            </View>
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.gradientOverlay}
          />
        </Animated.View>

        {/* Floating Content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.contentTouchable}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.9}
          >
            {/* Moment Badge */}
            <View
              style={[
                styles.momentBadge,
                { backgroundColor: item.color || story.accentColor || '#444444' },
              ]}
            >
              <Text style={styles.momentText}>{item.moment}</Text>
            </View>

            {/* Main Content */}
            <View style={styles.textContent}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {item.tags.slice(0, 3).map((tag, tagIndex) => (
                    <View key={tagIndex} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* CTA */}
            <BlurView intensity={30} style={styles.ctaButton}>
              <Text style={[styles.ctaText, { color: story.accentColor || '#FFFFFF' }]}>
                Keşfet
              </Text>
              <Ionicons name="arrow-forward" size={16} color={story.accentColor || '#FFFFFF'} />
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <LinearGradient
        colors={
          story.gradientColors && story.gradientColors.length > 0
            ? (story.gradientColors as unknown as readonly [string, string, ...string[]])
            : ['#111111', '#000000']
        }
        style={styles.headerSection}
      >
        <Image
          source={{ uri: story.backgroundImage }}
          style={styles.headerBackground}
          resizeMode="cover"
        />

        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent'] as const}
          style={styles.headerOverlay}
        >
          <View style={styles.headerContent}>
            <Text style={styles.themeText}>{story.theme}</Text>
            <Text style={[styles.storyTitle, { color: story.accentColor || '#FFFFFF' }]}>
              {story.title}
            </Text>
            <Text style={styles.storySubtitle}>{story.subtitle}</Text>
          </View>
        </LinearGradient>
      </LinearGradient>

      {/* Story Items Scroll */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={enableSnapping}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
          listener: handleScroll,
        })}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={enableSnapping ? screenWidth : undefined}
        snapToAlignment="start"
      >
        {story.items.map((item, index) => renderStoryItem(item, index))}
      </ScrollView>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {story.items.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  index === currentIndex ? story.accentColor || '#FFFFFF' : 'rgba(255,255,255,0.3)',
                transform: [
                  {
                    scale: index === currentIndex ? 1.2 : 1,
                  },
                ],
              },
            ]}
          />
        ))}
      </View>

      {/* Story Counter */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {story.items.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
  },

  // Header Section
  headerSection: {
    height: screenHeight * 0.3,
    position: 'relative',
  },

  headerBackground: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },

  headerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  headerContent: {
    padding: ORIGINAL_SPACING.containerHorizontal,
    paddingBottom: 32,
  },

  themeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  storyTitle: {
    fontFamily: 'serif',
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 38,
    marginBottom: 8,
  },

  storySubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    lineHeight: 24,
  },

  // Story Items
  storyItem: {
    height: screenHeight * 0.7,
    position: 'relative',
    width: screenWidth,
  },

  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: -25, // Extend for parallax
    right: -25,
    bottom: 0,
  },

  backgroundImage: {
    height: '100%',
    width: '100%',
  },

  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.surface.primary,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  gradientOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: ORIGINAL_SPACING.containerHorizontal,
    paddingBottom: 60,
  },

  contentTouchable: {
    alignItems: 'flex-start',
  },

  momentBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  momentText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  textContent: {
    marginBottom: 24,
  },

  itemTitle: {
    color: '#FFFFFF',
    fontFamily: ORIGINAL_TYPOGRAPHY.title.fontFamily,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 34,
    marginBottom: 8,
  },

  itemSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 12,
  },

  itemDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },

  ctaButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  ctaText: {
    fontFamily: ORIGINAL_TYPOGRAPHY.button.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },

  // Progress Indicator
  progressContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 20,
  },

  progressDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },

  // Counter
  counterContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    right: ORIGINAL_SPACING.containerHorizontal,
    top: 60,
  },

  counterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ExperienceStoryBlock;
