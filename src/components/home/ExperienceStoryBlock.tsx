/**
 * Experience Story Block
 * 
 * A cinematic scrollable story section inspired by Moments Epic and Obys Agency.
 * Features layered scroll reveals, parallax effects, and narrative storytelling
 * with Turkish content and premium styling.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
  ORIGINAL_COLORS,
  ORIGINAL_TYPOGRAPHY,
  ORIGINAL_SPACING,
  ORIGINAL_BORDER_RADIUS,
} from '@/components/auth/originalLoginStyles';

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
  }, [story.items]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    
    if (index !== currentIndex && index >= 0 && index < story.items.length) {
      setCurrentIndex(index);
      
      // Animate current item in, others out
      story.items.forEach((item, i) => {
        const isActive = i === index;
        
        Animated.parallel([
          Animated.timing(fadeAnims[item.id], {
            toValue: isActive ? 1 : 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnims[item.id], {
            toValue: isActive ? 1 : 0.9,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
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
    setImagesLoaded(prev => new Set([...prev, itemId]));
  };

  const renderStoryItem = (item: StoryItem, index: number) => {
    const isActive = index === currentIndex;
    const fadeAnim = fadeAnims[item.id] || new Animated.Value(0);
    const scaleAnim = scaleAnims[item.id] || new Animated.Value(0.9);
    const isLoaded = imagesLoaded.has(item.id);

    // Parallax effect for background
    const parallaxOffset = enableParallax ? scrollX.interpolate({
      inputRange: [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ],
      outputRange: [50, 0, -50],
      extrapolate: 'clamp',
    }) : 0;

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
                color={ORIGINAL_COLORS.placeholderText} 
              />
            </View>
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={[
              'transparent',
              'rgba(0,0,0,0.3)',
              'rgba(0,0,0,0.7)',
            ]}
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
            <View style={[styles.momentBadge, { backgroundColor: item.color || story.accentColor }]}>
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
              <Text style={[styles.ctaText, { color: story.accentColor }]}>
                Keşfet
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={16} 
                color={story.accentColor} 
              />
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
        colors={story.gradientColors}
        style={styles.headerSection}
      >
        <Image
          source={{ uri: story.backgroundImage }}
          style={styles.headerBackground}
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent']}
          style={styles.headerOverlay}
        >
          <View style={styles.headerContent}>
            <Text style={styles.themeText}>{story.theme}</Text>
            <Text style={[styles.storyTitle, { color: story.accentColor }]}>
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { 
            useNativeDriver: false,
            listener: handleScroll,
          }
        )}
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
                backgroundColor: index === currentIndex 
                  ? story.accentColor 
                  : 'rgba(255,255,255,0.3)',
                transform: [{ 
                  scale: index === currentIndex ? 1.2 : 1 
                }],
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
    backgroundColor: ORIGINAL_COLORS.background,
  },

  // Header Section
  headerSection: {
    height: screenHeight * 0.3,
    position: 'relative',
  },

  headerBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
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
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  storyTitle: {
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 38,
    marginBottom: 8,
    fontFamily: 'serif',
  },

  storySubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
  },

  // Story Items
  storyItem: {
    width: screenWidth,
    height: screenHeight * 0.7,
    position: 'relative',
  },

  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: -25, // Extend for parallax
    right: -25,
    bottom: 0,
  },

  backgroundImage: {
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

  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
    alignSelf: 'flex-start',
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
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 34,
    marginBottom: 8,
    fontFamily: ORIGINAL_TYPOGRAPHY.title.fontFamily,
  },

  itemSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
    marginBottom: 12,
  },

  itemDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
    marginBottom: 16,
  },

  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },

  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  tagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    alignSelf: 'flex-start',
  },

  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: ORIGINAL_TYPOGRAPHY.button.fontFamily,
  },

  // Progress Indicator
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },

  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Counter
  counterContainer: {
    position: 'absolute',
    top: 60,
    right: ORIGINAL_SPACING.containerHorizontal,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  counterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ExperienceStoryBlock;