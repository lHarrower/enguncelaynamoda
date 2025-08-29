import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { OptimizedImage } from '@/components/shared/OptimizedImage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const CARD_HEIGHT = screenHeight * 0.7;
const SWIPE_THRESHOLD = screenWidth * 0.25;

// Premium Outfit Card Interface
export interface OutfitCard {
  id: string;
  name?: string;
  brand?: string;
  category: string;
  imageUri?: string;
  imageUrl?: string;
  price?: number;
  colors?: string[];
  tags?: string[];
  description?: string;
  style?: string;
  occasion?: string;
  season?: string;
}

interface SwipeableCardProps {
  card: OutfitCard;
  index: number;
  totalCards: number;
  onSwipeLeft?: (card: OutfitCard) => void;
  onSwipeRight?: (card: OutfitCard) => void;
  onSwipeUp?: (card: OutfitCard) => void;
  onPress?: (card: OutfitCard) => void;
  isActive?: boolean;
  zIndex?: number;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  card,
  index,
  totalCards,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onPress,
  isActive = false,
  zIndex = 0,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const [isPressed, setIsPressed] = useState(false);

  const imageUri = card.imageUri || card.imageUrl || '';
  const brandName = card.brand || 'AYNAMODA';
  const itemName = card.name || 'Premium Piece';
  const displayPrice = card.price;

  // Premium gradient colors based on category
  const gradientColors = React.useMemo(() => {
    const category = card.category?.toLowerCase() || '';
    switch (category) {
      case 'dresses':
        return ['#FDF8F5', '#F5E8DD', '#EDD0B8'] as [string, string, ...string[]];
      case 'tops':
        return ['#F5F8FD', '#DDE8F5', '#B8D0ED'] as [string, string, ...string[]];
      case 'bottoms':
        return ['#F8F5FD', '#E8DDF5', '#D0B8ED'] as [string, string, ...string[]];
      case 'shoes':
        return ['#FDF5F8', '#F5DDE8', '#EDB8D0'] as [string, string, ...string[]];
      case 'accessories':
        return ['#F5FDF8', '#DDF5E8', '#B8EDD0'] as [string, string, ...string[]];
      case 'outerwear':
        return ['#F8FDF5', '#E8F5DD', '#D0EDB8'] as [string, string, ...string[]];
      default:
        return ['#FDFCFA', '#F5F3F0', '#EDEBE8'] as [string, string, ...string[]];
    }
  }, [card.category]);

  const resetCard = useCallback(() => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    rotate.value = withSpring(0);
    scale.value = withSpring(1);
    opacity.value = withSpring(1);
  }, []);

  const removeCard = useCallback(
    (direction: 'left' | 'right' | 'up') => {
      const exitX =
        direction === 'left' ? -screenWidth * 1.5 : direction === 'right' ? screenWidth * 1.5 : 0;
      const exitY = direction === 'up' ? -screenHeight * 1.5 : 0;

      translateX.value = withTiming(exitX, { duration: 300 });
      translateY.value = withTiming(exitY, { duration: 300 });
      rotate.value = withTiming(direction === 'left' ? -30 : direction === 'right' ? 30 : 0, {
        duration: 300,
      });
      opacity.value = withTiming(0, { duration: 300 });

      setTimeout(() => {
        if (direction === 'left' && onSwipeLeft) {
          onSwipeLeft(card);
        } else if (direction === 'right' && onSwipeRight) {
          onSwipeRight(card);
        } else if (direction === 'up' && onSwipeUp) {
          onSwipeUp(card);
        }
      }, 300);
    },
    [card, onSwipeLeft, onSwipeRight, onSwipeUp],
  );

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(setIsPressed)(true);
      scale.value = withSpring(0.95);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      // Rotation based on horizontal movement
      rotate.value = interpolate(
        event.translationX,
        [-screenWidth, 0, screenWidth],
        [-30, 0, 30],
        Extrapolate.CLAMP,
      );

      // Opacity based on distance
      const distance = Math.sqrt(event.translationX ** 2 + event.translationY ** 2);
      opacity.value = interpolate(distance, [0, SWIPE_THRESHOLD * 2], [1, 0.3], Extrapolate.CLAMP);
    },
    onEnd: (event) => {
      runOnJS(setIsPressed)(false);
      scale.value = withSpring(1);

      const { translationX, translationY, velocityX, velocityY } = event;
      const distance = Math.sqrt(translationX ** 2 + translationY ** 2);

      // Determine swipe direction and threshold
      if (Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 1000) {
        if (translationX > 0) {
          runOnJS(removeCard)('right');
        } else {
          runOnJS(removeCard)('left');
        }
      } else if (translationY < -SWIPE_THRESHOLD || velocityY < -1000) {
        runOnJS(removeCard)('up');
      } else {
        // Reset to center
        runOnJS(resetCard)();
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const stackOffset = (totalCards - index - 1) * 8;
    const stackScale = 1 - (totalCards - index - 1) * 0.05;
    const stackOpacity = 1 - (totalCards - index - 1) * 0.1;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value - stackOffset },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value * stackScale },
      ] as any,
      opacity: opacity.value * stackOpacity,
      zIndex: zIndex,
    };
  });

  const handlePress = useCallback(() => {
    if (onPress && isActive) {
      onPress(card);
    }
  }, [card, onPress, isActive]);

  return (
    <PanGestureHandler onGestureEvent={gestureHandler} enabled={isActive}>
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        <TouchableOpacity
          style={styles.touchableCard}
          onPress={handlePress}
          activeOpacity={0.95}
          disabled={!isActive}
          accessibilityRole="button"
          accessibilityLabel={`${card.name || card.category} outfit card`}
          accessibilityHint="Tap to view outfit details or swipe to interact"
          accessibilityState={{ disabled: !isActive }}
        >
          <LinearGradient
            colors={gradientColors}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Premium Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.brandSection}>
                <Text style={styles.brandText}>{brandName}</Text>
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={12} color="#B8860B" />
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  accessibilityRole="button"
                  accessibilityLabel="Like outfit"
                  accessibilityHint="Tap to like this outfit"
                >
                  <Ionicons name="heart-outline" size={20} color="#8B5A3C" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  accessibilityRole="button"
                  accessibilityLabel="Save outfit"
                  accessibilityHint="Tap to save this outfit to your collection"
                >
                  <Ionicons name="bookmark-outline" size={20} color="#8B5A3C" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Premium Image Section */}
            <View style={styles.imageContainer}>
              <OptimizedImage
                source={{ uri: imageUri }}
                style={styles.cardImage}
                resizeMode="cover"
                enableLazyLoading={!isActive}
                enableProgressiveLoading={true}
                enableCaching={true}
                priority={isActive ? 10 : 3}
                quality={90}
                maxWidth={500}
                maxHeight={700}
                format="webp"
                placeholder="Loading premium image..."
              />

              {/* Category Overlay */}
              <View style={styles.categoryOverlay}>
                <Text style={styles.categoryText}>{(card.category || '').toUpperCase()}</Text>
              </View>

              {/* Style Tags */}
              {card.style && (
                <View style={styles.styleTag}>
                  <Text style={styles.styleText}>{card.style}</Text>
                </View>
              )}
            </View>

            {/* Premium Card Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {itemName}
                </Text>

                {card.description && (
                  <Text style={styles.itemDescription} numberOfLines={3}>
                    {card.description}
                  </Text>
                )}

                {/* Color Palette */}
                {card.colors && card.colors.length > 0 && (
                  <View style={styles.colorsContainer}>
                    {card.colors.slice(0, 5).map((color, colorIndex) => (
                      <View
                        key={colorIndex}
                        style={[styles.colorDot, { backgroundColor: color.toLowerCase() }]}
                      />
                    ))}
                    {card.colors.length > 5 && (
                      <Text style={styles.moreColors}>+{card.colors.length - 5}</Text>
                    )}
                  </View>
                )}

                {/* Occasion and Season */}
                <View style={styles.metaInfo}>
                  {card.occasion && (
                    <View style={styles.metaTag}>
                      <Ionicons name="calendar-outline" size={12} color="#8B5A3C" />
                      <Text style={styles.metaText}>{card.occasion}</Text>
                    </View>
                  )}
                  {card.season && (
                    <View style={styles.metaTag}>
                      <Ionicons name="leaf-outline" size={12} color="#8B5A3C" />
                      <Text style={styles.metaText}>{card.season}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Premium Price Display */}
              {displayPrice && (
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>${displayPrice.toFixed(0)}</Text>
                  <Text style={styles.currencyText}>�</Text>
                </View>
              )}
            </View>

            {/* Swipe Indicators */}
            <View style={styles.swipeIndicators}>
              <View style={[styles.swipeIndicator, styles.leftIndicator]}>
                <Ionicons name="close" size={24} color="#FF6B6B" />
              </View>
              <View style={[styles.swipeIndicator, styles.upIndicator]}>
                <Ionicons name="heart" size={24} color="#4ECDC4" />
              </View>
              <View style={[styles.swipeIndicator, styles.rightIndicator]}>
                <Ionicons name="checkmark" size={24} color="#45B7D1" />
              </View>
            </View>

            {/* Premium Border Accent */}
            <View style={styles.borderAccent} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    elevation: 3,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  borderAccent: {
    backgroundColor: '#D4A574',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: 4,
    left: 0,
    opacity: 0.6,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  brandSection: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  brandText: {
    color: '#8B5A3C',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  card: {
    borderColor: 'rgba(139, 90, 60, 0.1)',
    borderRadius: 32,
    borderWidth: 1,
    elevation: 16,
    flex: 1,
    padding: 24,
    shadowColor: '#8B5A3C',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
  },
  cardContainer: {
    alignSelf: 'center',
    height: CARD_HEIGHT,
    position: 'absolute',
    width: CARD_WIDTH,
  },
  cardFooter: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardImage: {
    height: '100%',
    width: '100%',
  },
  categoryOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    top: 16,
  },
  categoryText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  colorDot: {
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    elevation: 3,
    height: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: 16,
  },
  colorsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  currencyText: {
    color: '#8B5A3C',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  imageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    flex: 1,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  itemDescription: {
    color: '#666666',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    letterSpacing: 0.1,
    lineHeight: 20,
    marginBottom: 12,
  },
  itemDetails: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    color: '#2D2D2D',
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 24,
    marginBottom: 8,
  },
  leftIndicator: {
    left: 32,
    position: 'absolute',
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  metaTag: {
    alignItems: 'center',
    backgroundColor: 'rgba(139, 90, 60, 0.1)',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaText: {
    color: '#8B5A3C',
    fontSize: 11,
    fontWeight: '500',
  },
  moreColors: {
    color: '#8B5A3C',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  premiumBadge: {
    backgroundColor: 'rgba(184, 134, 11, 0.15)',
    borderRadius: 12,
    marginLeft: 8,
    padding: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    color: '#8B5A3C',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0,
  },
  rightIndicator: {
    position: 'absolute',
    right: 32,
  },
  styleTag: {
    backgroundColor: 'rgba(212, 165, 116, 0.9)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: 'absolute',
    right: 16,
    top: 16,
  },
  styleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  swipeIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    elevation: 6,
    opacity: 0,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  swipeIndicators: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: 32,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    top: '50%',
  },
  touchableCard: {
    flex: 1,
  },
  upIndicator: {
    alignSelf: 'center',
    position: 'absolute',
    top: -100,
  },
});

export default SwipeableCard;
export { SwipeableCard };
