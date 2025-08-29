// Swipeable Card - The Core Discovery Interaction
// Tinder-style swipe mechanism with intelligent learning

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from 'react-native-reanimated';

import { OptimizedImage } from '@/components/shared/OptimizedImage';
import { DesignSystem } from '@/theme/DesignSystem';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

interface ProductItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  boutique: string;
  category: string;
  colors: string[];
  style: string[];
}

interface SwipeableCardProps {
  item: ProductItem;
  onSwipeLeft: (item: ProductItem) => void;
  onSwipeRight: (item: ProductItem) => void;
  onLongPress: (item: ProductItem) => void;
  style?: object;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  item,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  style,
}) => {
  // Reanimated shared values for graceful arc physics
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Arc physics constants
  const ARC_COEFFICIENT = 0.0008; // Controls the depth of the arc
  const MAX_ROTATION = 7; // Maximum rotation in degrees (reduced from 10)

  // Gesture handler for precise control
  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      // Start long press detection on JS thread
      runOnJS(() => {
        longPressTimer.current = setTimeout(() => {
          setIsLongPressing(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onLongPress(item);
        }, 500);
      })();
    },

    onActive: (event) => {
      // Clear long press if user starts moving significantly
      if (Math.abs(event.translationX) > 10 || Math.abs(event.translationY) > 10) {
        runOnJS(() => {
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
            setIsLongPressing(false);
          }
        })();
      }

      if (!isLongPressing) {
        // Primary X-axis control
        translateX.value = event.translationX;

        // Graceful arc: Y follows inverse parabolic curve based on X
        // translateY = -a * (translationX)^2 creates upward arc
        translateY.value = -ARC_COEFFICIENT * Math.pow(event.translationX, 2);
      }
    },

    onEnd: (event) => {
      // Clear long press timer
      runOnJS(() => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        if (isLongPressing) {
          setIsLongPressing(false);
          return;
        }
      })();

      const { translationX, velocityX } = event;

      if (translationX > SWIPE_THRESHOLD) {
        // Swipe right - Like with physics-based flick
        runOnJS(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        })();

        translateX.value = withDecay(
          {
            velocity: Math.max(velocityX, 800), // Minimum velocity for satisfying flick
            clamp: [translationX, width + 200],
          },
          () => {
            runOnJS(() => {
              onSwipeRight(item);
            })();
            translateX.value = 0;
            translateY.value = 0;
          },
        );

        // Y continues the arc trajectory
        translateY.value = withDecay({
          velocity: -Math.abs(velocityX) * 0.3, // Upward trajectory
          clamp: [-200, translateY.value],
        });
      } else if (translationX < -SWIPE_THRESHOLD) {
        // Swipe left - Dislike with physics-based flick
        runOnJS(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        })();

        translateX.value = withDecay(
          {
            velocity: Math.min(velocityX, -800), // Minimum velocity for satisfying flick
            clamp: [-width - 200, translationX],
          },
          () => {
            runOnJS(() => {
              onSwipeLeft(item);
            })();
            translateX.value = 0;
            translateY.value = 0;
          },
        );

        // Y continues the arc trajectory
        translateY.value = withDecay({
          velocity: -Math.abs(velocityX) * 0.3, // Upward trajectory
          clamp: [-200, translateY.value],
        });
      } else {
        // Snap back with synchronized spring
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
          mass: 1,
        });
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
          mass: 1,
        });
      }
    },
  });

  // Animated styles with refined interpolations
  const animatedStyle = useAnimatedStyle(() => {
    // Subtle, proportional rotation capped at MAX_ROTATION
    const rotation = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [-MAX_ROTATION, 0, MAX_ROTATION],
      Extrapolate.CLAMP,
    );

    // Smooth opacity transition
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, width / 3],
      [1, 0.7],
      Extrapolate.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ] as any,
      opacity,
    };
  });

  // Like/Dislike indicator animations
  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolate.CLAMP),
  }));

  const dislikeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolate.CLAMP),
  }));

  const discountPercentage = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, animatedStyle, style]}>
        {/* Like Indicator */}
        <Animated.View style={[styles.likeIndicator, likeStyle]}>
          <View style={styles.likeLabel}>
            <Ionicons name="heart" size={32} color={DesignSystem.colors.success[500]} />
            <Text style={styles.likeText}>LOVE</Text>
          </View>
        </Animated.View>

        {/* Dislike Indicator */}
        <Animated.View style={[styles.dislikeIndicator, dislikeStyle]}>
          <View style={styles.dislikeLabel}>
            <Ionicons name="close" size={32} color={DesignSystem.colors.error[500]} />
            <Text style={styles.dislikeText}>PASS</Text>
          </View>
        </Animated.View>

        {/* Product Image */}
        <OptimizedImage
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
          enableLazyLoading={false}
          enableProgressiveLoading={true}
          enableCaching={true}
          priority={5}
          quality={85}
          maxWidth={400}
          maxHeight={600}
          format="webp"
          placeholder="Loading..."
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
            <Text style={styles.brandName}>{item.brand}</Text>
            <Text style={styles.productTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>${item.price}</Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>${item.originalPrice}</Text>
              )}
            </View>
            <Text style={styles.boutiqueName}>at {item.boutique}</Text>
          </View>
        </LinearGradient>

        {/* Long Press Hint */}
        <View style={styles.longPressHint}>
          <Ionicons name="hand-left-outline" size={16} color={DesignSystem.colors.text.inverse} />
          <Text style={styles.hintText}>Hold to explore similar</Text>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.radius.xl,
    height: height * 0.75,
    width: width - 40,
    ...DesignSystem.elevation.medium,
    overflow: 'hidden',
    position: 'relative',
  },

  // Swipe Indicators
  likeIndicator: {
    position: 'absolute',
    right: 20,
    top: 60,
    zIndex: 10,
  },
  dislikeIndicator: {
    left: 20,
    position: 'absolute',
    top: 60,
    zIndex: 10,
  },
  likeLabel: {
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dislikeLabel: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  likeText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontWeight: '700',
    marginTop: 4,
  },
  dislikeText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontWeight: '700',
    marginTop: 4,
  },

  // Product Content
  productImage: {
    height: '70%',
    width: '100%',
  },
  discountBadge: {
    backgroundColor: DesignSystem.colors.error[500],
    borderRadius: 16,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    top: 20,
    zIndex: 5,
  },
  discountText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontWeight: '700',
  },
  infoGradient: {
    bottom: 0,
    height: '40%',
    justifyContent: 'flex-end',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  productInfo: {
    padding: 24,
  },
  brandName: {
    ...DesignSystem.typography.card.brand,
    color: DesignSystem.colors.gold[500],
    marginBottom: 4,
  },
  productTitle: {
    ...DesignSystem.typography.card.title,
    color: DesignSystem.colors.text.inverse,
    marginBottom: 8,
  },
  priceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  currentPrice: {
    ...DesignSystem.typography.card.price,
    color: DesignSystem.colors.text.inverse,
    fontSize: 20,
    marginRight: 8,
  },
  originalPrice: {
    ...DesignSystem.typography.scale.body2,
    color: DesignSystem.colors.text.inverse,
    opacity: 0.7,
    textDecorationLine: 'line-through',
  },
  boutiqueName: {
    ...DesignSystem.typography.scale.body2,
    color: DesignSystem.colors.text.inverse,
    opacity: 0.8,
  },

  // Long Press Hint
  longPressHint: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    bottom: 100,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    right: 20,
  },
  hintText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontSize: 10,
    marginLeft: 6,
  },
});

export default SwipeableCard;
