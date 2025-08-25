/**
 * Vertical Swipeable Product Card
 *
 * A premium vertical product card inspired by The Row, Poppi, and Gucci designs.
 * Features edge-to-edge imagery, minimal chrome, and elegant overlays.
 * This component defines the first impression on the homepage.
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';

import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface ProductCardData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  price?: string;
  originalPrice?: string;
  brand?: string;
  category?: string;
  isLiked?: boolean;
  tags?: string[];
}

export interface VerticalProductCardProps {
  /** Product data to display */
  product: ProductCardData;

  /** Card width as percentage of screen width (default: 0.8) */
  widthPercentage?: number;

  /** Card height as percentage of screen height (default: 0.6) */
  heightPercentage?: number;

  /** Whether to show the like button */
  showLikeButton?: boolean;

  /** Whether to show price information */
  showPrice?: boolean;

  /** Callback when card is pressed */
  onPress?: (product: ProductCardData) => void;

  /** Callback when like button is pressed */
  onLike?: (product: ProductCardData) => void;

  /** Callback when card is swiped */
  onSwipe?: (direction: 'left' | 'right', product: ProductCardData) => void;

  /** Custom style for the card container */
  style?: ViewStyle;
}

export const VerticalProductCard: React.FC<VerticalProductCardProps> = ({
  product,
  widthPercentage = 0.8,
  heightPercentage = 0.6,
  showLikeButton = true,
  showPrice = true,
  onPress,
  onLike,
  onSwipe,
  style,
}) => {
  const [isLiked, setIsLiked] = useState(product.isLiked || false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const likeScale = useRef(new Animated.Value(1)).current;

  const cardWidth = screenWidth * widthPercentage;
  const cardHeight = screenHeight * heightPercentage;

  const handlePress = () => {
    // Micro-interaction: scale down slightly on press
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.(product);
  };

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    // Heart animation
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    onLike?.({ ...product, isLiked: newLikedState });
  };

  const onGestureEvent = Animated.event([{ nativeEvent: { translationX: translateX } }], {
    useNativeDriver: true,
  });

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX: tx } = event.nativeEvent;
      const swipeThreshold = cardWidth * 0.3;

      if (Math.abs(tx) > swipeThreshold) {
        // Swipe detected
        const direction = tx > 0 ? 'right' : 'left';

        // Animate card out
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: tx > 0 ? screenWidth : -screenWidth,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onSwipe?.(direction, product);
          // Reset animations
          translateX.setValue(0);
          opacity.setValue(1);
        });
      } else {
        // Snap back
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            width: cardWidth,
            height: cardHeight,
            transform: [{ translateX }, { scale }],
            opacity,
          },
          style,
        ]}
      >
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={handlePress}
          activeOpacity={0.95}
          accessibilityRole="button"
          accessibilityLabel={`${product.brand ? product.brand + ' ' : ''}${product.title}${product.price ? ', ' + product.price : ''}`}
          accessibilityHint="Tap to view product details"
        >
          {/* Background Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.image}
              onLoad={() => setImageLoaded(true)}
              resizeMode="cover"
            />

            {/* Image Loading Placeholder */}
            {!imageLoaded && (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={48}
                  color={DesignSystem.colors.text.secondary}
                />
              </View>
            )}
          </View>

          {/* Like Button */}
          {showLikeButton && (
            <TouchableOpacity
              style={styles.likeButton}
              onPress={handleLike}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={isLiked ? 'Unlike product' : 'Like product'}
              accessibilityHint={`Tap to ${isLiked ? 'remove from' : 'add to'} favorites`}
              accessibilityState={{ selected: isLiked }}
            >
              <BlurView intensity={20} style={styles.likeButtonBlur}>
                <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={24}
                    color={
                      isLiked
                        ? DesignSystem.colors.semantic.error
                        : DesignSystem.colors.text.primary
                    }
                  />
                </Animated.View>
              </BlurView>
            </TouchableOpacity>
          )}

          {/* Content Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)'] as const}
            style={styles.contentOverlay}
          >
            <View style={styles.contentContainer}>
              {/* Brand */}
              {product.brand && <Text style={styles.brandText}>{product.brand.toUpperCase()}</Text>}

              {/* Title */}
              <Text style={styles.titleText} numberOfLines={2}>
                {product.title}
              </Text>

              {/* Subtitle */}
              {product.subtitle && (
                <Text style={styles.subtitleText} numberOfLines={1}>
                  {product.subtitle}
                </Text>
              )}

              {/* Price Section */}
              {showPrice && product.price && (
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>{product.price}</Text>
                  {product.originalPrice && (
                    <Text style={styles.originalPriceText}>{product.originalPrice}</Text>
                  )}
                </View>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {product.tags.slice(0, 2).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </LinearGradient>

          {/* Frosted Glass CTA */}
          <BlurView intensity={30} style={styles.ctaContainer}>
            <Text style={styles.ctaText}>Keşfet</Text>
            <Ionicons name="arrow-forward" size={16} color={DesignSystem.colors.text.primary} />
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  brandText: {
    // fontSize comes from typography body.medium
    fontFamily: DesignSystem.typography.fontFamily.body,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 4,
  },

  cardContainer: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.borderRadius.large,
    elevation: 8,
    overflow: 'hidden',
    shadowColor: DesignSystem.colors.shadow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },

  cardTouchable: {
    flex: 1,
    position: 'relative',
  },

  contentContainer: {
    padding: DesignSystem.spacing.large,
    paddingBottom: 80, // Space for CTA
  },

  contentOverlay: {
    bottom: 0,
    height: '50%',
    justifyContent: 'flex-end',
    left: 0,
    position: 'absolute',
    right: 0,
  },

  ctaContainer: {
    alignItems: 'center',
    borderRadius: 24,
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
    left: DesignSystem.spacing.large,
    position: 'absolute',
    right: DesignSystem.spacing.large,
  },

  ctaText: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.button,
    fontSize: 16,
    fontWeight: '600',
  },

  image: {
    height: '100%',
    width: '100%',
  },

  imageContainer: {
    flex: 1,
    position: 'relative',
  },

  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  likeButton: {
    borderRadius: 22,
    height: 44,
    overflow: 'hidden',
    position: 'absolute',
    right: 16,
    top: 16,
    width: 44,
  },

  likeButtonBlur: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  originalPriceText: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 16,
    textDecorationLine: 'line-through',
  },

  priceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },

  priceText: {
    color: '#FFFFFF',
    fontFamily: DesignSystem.typography.fontFamily.heading,
    fontSize: 20,
    fontWeight: '700',
    marginRight: 8,
  },

  subtitleText: {
    // fontSize comes from typography body.medium
    fontFamily: DesignSystem.typography.fontFamily.body,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 12,
  },

  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  tagText: {
    color: '#FFFFFF',
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 12,
    fontWeight: '500',
  },

  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  titleText: {
    color: '#FFFFFF',
    fontFamily: DesignSystem.typography.fontFamily.heading,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 4,
  },
});

export default VerticalProductCard;
