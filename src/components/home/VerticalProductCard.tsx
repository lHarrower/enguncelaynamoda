/**
 * Vertical Swipeable Product Card
 * 
 * A premium vertical product card inspired by The Row, Poppi, and Gucci designs.
 * Features edge-to-edge imagery, minimal chrome, and elegant overlays.
 * This component defines the first impression on the homepage.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import {
  ORIGINAL_COLORS,
  ORIGINAL_TYPOGRAPHY,
  ORIGINAL_SPACING,
  ORIGINAL_BORDER_RADIUS,
} from '@/components/auth/originalLoginStyles';

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
  style?: any;
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

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
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
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.cardContainer,
          {
            width: cardWidth,
            height: cardHeight,
            transform: [
              { translateX },
              { scale },
            ],
            opacity,
          },
          style,
        ]}
      >
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={handlePress}
          activeOpacity={0.95}
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
                  color={ORIGINAL_COLORS.placeholderText} 
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
            >
              <BlurView intensity={20} style={styles.likeButtonBlur}>
                <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isLiked ? '#FF6B6B' : ORIGINAL_COLORS.primaryText}
                  />
                </Animated.View>
              </BlurView>
            </TouchableOpacity>
          )}

          {/* Content Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.contentOverlay}
          >
            <View style={styles.contentContainer}>
              {/* Brand */}
              {product.brand && (
                <Text style={styles.brandText}>{product.brand.toUpperCase()}</Text>
              )}
              
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
            <Ionicons 
              name="arrow-forward" 
              size={16} 
              color={ORIGINAL_COLORS.primaryText} 
            />
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: ORIGINAL_BORDER_RADIUS.input * 1.5, // 18px for larger cards
    overflow: 'hidden',
    backgroundColor: ORIGINAL_COLORS.inputBackground,
    shadowColor: ORIGINAL_COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  
  cardTouchable: {
    flex: 1,
    position: 'relative',
  },
  
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  
  image: {
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
  
  likeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  
  likeButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
  },
  
  contentContainer: {
    padding: ORIGINAL_SPACING.containerHorizontal,
    paddingBottom: 80, // Space for CTA
  },
  
  brandText: {
    ...ORIGINAL_TYPOGRAPHY.secondary,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 4,
  },
  
  titleText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 4,
    fontFamily: ORIGINAL_TYPOGRAPHY.title.fontFamily,
  },
  
  subtitleText: {
    ...ORIGINAL_TYPOGRAPHY.secondary,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 12,
  },
  
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
    fontFamily: ORIGINAL_TYPOGRAPHY.title.fontFamily,
  },
  
  originalPriceText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
    fontFamily: ORIGINAL_TYPOGRAPHY.secondary.fontFamily,
  },
  
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
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
    fontFamily: ORIGINAL_TYPOGRAPHY.secondary.fontFamily,
  },
  
  ctaContainer: {
    position: 'absolute',
    bottom: 16,
    left: ORIGINAL_SPACING.containerHorizontal,
    right: ORIGINAL_SPACING.containerHorizontal,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: ORIGINAL_COLORS.primaryText,
    fontFamily: ORIGINAL_TYPOGRAPHY.button.fontFamily,
  },
});

export default VerticalProductCard;