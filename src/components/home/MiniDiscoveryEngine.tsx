// Mini Discovery Engine - Personalized Micro-Ritual for Home Screen
// Smaller version of swipeable cards with hyper-personalized algorithm

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.65; // 2/3 screen width
const CARD_HEIGHT = CARD_WIDTH * 1.3;
const SWIPE_THRESHOLD = 80;

interface PersonalizedItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  boutique: string;
  confidence: number; // AI prediction score
}

interface MiniDiscoveryEngineProps {
  items: PersonalizedItem[];
  onLike: (item: PersonalizedItem) => void;
  onDislike: (item: PersonalizedItem) => void;
  onUndo?: () => void;
  style?: ViewStyle;
}

const MiniDiscoveryEngine: React.FC<MiniDiscoveryEngineProps> = ({
  items,
  onLike,
  onDislike,
  onUndo,
  style,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUndo, setShowUndo] = useState(false);
  const [lastAction, setLastAction] = useState<'like' | 'dislike' | null>(null);

  // Animation values
  const pan = useSharedValue({ x: 0, y: 0 });
  const undoOpacity = useSharedValue(0);
  const undoScale = useSharedValue(0.8);

  const panResponder = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      // Haptic feedback on touch
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    },
    onActive: (event) => {
      pan.value = { x: event.translationX, y: event.translationY };
    },
    onEnd: (event) => {
      const { translationX } = event;

      if (translationX > SWIPE_THRESHOLD) {
        // Swipe right - Like
        pan.value = withTiming({ x: CARD_WIDTH + 50, y: 0 }, { duration: 300 }, () => {
          runOnJS(handleSwipeRight)();
        });
      } else if (translationX < -SWIPE_THRESHOLD) {
        // Swipe left - Dislike
        pan.value = withTiming({ x: -CARD_WIDTH - 50, y: 0 }, { duration: 300 }, () => {
          runOnJS(handleSwipeLeft)();
        });
      } else {
        // Snap back
        pan.value = withSpring({ x: 0, y: 0 });
      }
    },
  });

  const handleSwipeRight = () => {
    const currentItem = items[currentIndex];
    if (currentItem) {
      onLike(currentItem);
      setLastAction('like');
      showUndoButton();
      nextCard();
    }
  };

  const handleSwipeLeft = () => {
    const currentItem = items[currentIndex];
    if (currentItem) {
      onDislike(currentItem);
      setLastAction('dislike');
      showUndoButton();
      nextCard();
    }
  };

  const nextCard = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      pan.value = { x: 0, y: 0 };
    }
  };

  const showUndoButton = () => {
    setShowUndo(true);
    undoOpacity.value = withTiming(1, { duration: 300 });
    undoScale.value = withSpring(1);

    // Auto-hide after 2.5 seconds
    setTimeout(() => {
      hideUndoButton();
    }, 2500);
  };

  const hideUndoButton = () => {
    undoOpacity.value = withTiming(0, { duration: 300 });
    undoScale.value = withTiming(0.8, { duration: 300 }, () => {
      runOnJS(setShowUndo)(false);
    });
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      pan.value = { x: 0, y: 0 };
      setLastAction(null);
      hideUndoButton();
      onUndo?.();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Animated styles
  const cardStyle = useAnimatedStyle(() => {
    const rotate = `${pan.value.x * 0.1}deg`;
    const opacity = 1 - Math.abs(pan.value.x) / (CARD_WIDTH * 0.8);

    return {
      transform: [{ translateX: pan.value.x }, { translateY: pan.value.y }, { rotate }] as any,
      opacity: Math.max(opacity, 0.3),
    };
  });

  const likeIndicatorStyle = useAnimatedStyle(() => {
    const opacity = Math.max(0, pan.value.x / SWIPE_THRESHOLD);
    return { opacity: Math.min(opacity, 1) };
  });

  const dislikeIndicatorStyle = useAnimatedStyle(() => {
    const opacity = Math.max(0, -pan.value.x / SWIPE_THRESHOLD);
    return { opacity: Math.min(opacity, 1) };
  });

  const undoStyle = useAnimatedStyle(() => {
    return {
      opacity: undoOpacity.value,
      transform: [{ scale: undoScale.value }],
    };
  });

  const currentItem = items[currentIndex];

  if (!currentItem) {
    return (
      <View style={[styles.container, styles.emptyContainer, style]}>
        <Ionicons name="heart-circle" size={48} color={DesignSystem.colors.sage[500]} />
        <Text style={styles.emptyTitle}>Perfect matches found!</Text>
        <Text style={styles.emptySubtitle}>Check Discover for more</Text>
      </View>
    );
  }

  const discountPercentage = currentItem.originalPrice
    ? Math.round(
        ((currentItem.originalPrice - currentItem.price) / currentItem.originalPrice) * 100,
      )
    : 0;

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Curated for You</Text>
        <Text style={styles.headerSubtitle}>{currentItem.confidence}% confidence match</Text>
      </View>

      {/* Card Stack */}
      <View style={styles.cardStack}>
        {/* Next Card (Background) */}
        {items.length > currentIndex + 1 && items[currentIndex + 1] && (
          <View style={[styles.card, styles.nextCard]}>
            <Image
              source={{ uri: items[currentIndex + 1]?.image }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Current Card */}
        <PanGestureHandler onGestureEvent={panResponder}>
          <Animated.View style={[styles.card, cardStyle]}>
            {/* Like Indicator */}
            <Animated.View style={[styles.likeIndicator, likeIndicatorStyle]}>
              <View style={styles.likeLabel}>
                <Ionicons name="heart" size={24} color={DesignSystem.colors.success[500]} />
                <Text style={styles.indicatorText}>LOVE</Text>
              </View>
            </Animated.View>

            {/* Dislike Indicator */}
            <Animated.View style={[styles.dislikeIndicator, dislikeIndicatorStyle]}>
              <View style={styles.dislikeLabel}>
                <Ionicons name="close" size={24} color={DesignSystem.colors.error[500]} />
                <Text style={styles.indicatorText}>PASS</Text>
              </View>
            </Animated.View>

            {/* Product Image */}
            <Image
              source={{ uri: currentItem.image }}
              style={styles.cardImage}
              resizeMode="cover"
            />

            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercentage}%</Text>
              </View>
            )}

            {/* Product Info */}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.infoGradient}>
              <View style={styles.productInfo}>
                <Text style={styles.brandName}>{currentItem.brand}</Text>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {currentItem.title}
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>${currentItem.price}</Text>
                  {currentItem.originalPrice && (
                    <Text style={styles.originalPrice}>${currentItem.originalPrice}</Text>
                  )}
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </PanGestureHandler>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            pan.value = withTiming({ x: -CARD_WIDTH - 50, y: 0 }, { duration: 300 }, () => {
              runOnJS(handleSwipeLeft)();
            });
          }}
        >
          <Ionicons name="close" size={24} color={DesignSystem.colors.error[500]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => {
            pan.value = withTiming({ x: CARD_WIDTH + 50, y: 0 }, { duration: 300 }, () => {
              runOnJS(handleSwipeRight)();
            });
          }}
        >
          <Ionicons name="heart" size={24} color={DesignSystem.colors.success[500]} />
        </TouchableOpacity>
      </View>

      {/* Undo Button */}
      {showUndo && (
        <Animated.View style={[styles.undoContainer, undoStyle]}>
          <TouchableOpacity
            style={styles.undoButton}
            onPress={handleUndo}
            accessibilityRole="button"
            accessibilityLabel="Undo last action"
            accessibilityHint="Tap to undo the last swipe action"
          >
            <Ionicons name="arrow-undo" size={16} color={DesignSystem.colors.text.inverse} />
            <Text style={styles.undoText}>Undo</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / items.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} of {items.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.lg,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  headerTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...DesignSystem.typography.small,
    color: DesignSystem.colors.sage[500],
    fontWeight: '600',
  },

  // Card Stack
  cardStack: {
    height: CARD_HEIGHT,
    marginBottom: DesignSystem.spacing.lg,
    position: 'relative',
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.borderRadius.lg,
    height: CARD_HEIGHT,
    position: 'absolute',
    width: CARD_WIDTH,
    ...DesignSystem.elevation.medium,
    overflow: 'hidden',
  },
  nextCard: {
    opacity: 0.3,
    transform: [{ scale: 0.95 }],
    zIndex: -1,
  },
  cardImage: {
    height: '75%',
    width: '100%',
  },

  // Indicators
  likeIndicator: {
    position: 'absolute',
    right: 16,
    top: 20,
    zIndex: 10,
  },
  dislikeIndicator: {
    left: 16,
    position: 'absolute',
    top: 20,
    zIndex: 10,
  },
  likeLabel: {
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dislikeLabel: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  indicatorText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },

  // Product Info
  discountBadge: {
    backgroundColor: DesignSystem.colors.error[500],
    borderRadius: 12,
    left: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    top: 16,
    zIndex: 5,
  },
  discountText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontSize: 10,
    fontWeight: '700',
  },
  infoGradient: {
    bottom: 0,
    height: '35%',
    justifyContent: 'flex-end',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  productInfo: {
    padding: 16,
  },
  brandName: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.sage[400],
    marginBottom: 2,
  },
  productTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.inverse,
    fontSize: 16,
    marginBottom: 6,
  },
  priceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  currentPrice: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.inverse,
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  originalPrice: {
    ...DesignSystem.typography.small,
    color: DesignSystem.colors.text.inverse,
    opacity: 0.7,
    textDecorationLine: 'line-through',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.xl,
    marginBottom: DesignSystem.spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
    ...DesignSystem.elevation.soft,
  },
  likeButton: {
    backgroundColor: DesignSystem.colors.sage[200],
  },

  // Undo Button
  undoContainer: {
    alignSelf: 'center',
    bottom: 80,
    position: 'absolute',
  },
  undoButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.text.primary,
    borderRadius: 20,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...DesignSystem.elevation.soft,
  },
  undoText: {
    ...DesignSystem.typography.small,
    color: DesignSystem.colors.text.inverse,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Progress
  progressContainer: {
    alignItems: 'center',
    gap: 6,
  },
  progressBar: {
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderRadius: 2,
    height: 3,
    overflow: 'hidden',
    width: CARD_WIDTH * 0.6,
  },
  progressFill: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: 2,
    height: '100%',
  },
  progressText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
  },

  // Empty State
  emptyContainer: {
    height: CARD_HEIGHT + 100,
    justifyContent: 'center',
  },
  emptyTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
    marginTop: 12,
  },
  emptySubtitle: {
    ...DesignSystem.typography.small,
    color: DesignSystem.colors.text.secondary,
  },
});

export default MiniDiscoveryEngine;
