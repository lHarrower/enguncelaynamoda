// src/components/shared/SwipeableCard.tsx

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const SWIPE_THRESHOLD = screenWidth * 0.25;

interface SwipeableCardProps {
  outfit: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    confidence: number;
    mood: string;
    occasion: string;
    weather: string;
  };
  onSwipeLeft: (id: string) => void;
  onSwipeRight: (id: string) => void;
  onPress?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  outfit,
  onSwipeLeft,
  onSwipeRight,
  onPress,
  style,
}) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      scale.value = withSpring(0.95);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      opacity.value = 1 - Math.abs(event.translationX) / (screenWidth * 0.8);
    },
    onEnd: (event) => {
      scale.value = withSpring(1);

      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withSpring(direction * screenWidth);
        opacity.value = withSpring(0);

        runOnJS(direction > 0 ? onSwipeRight : onSwipeLeft)(outfit.id);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        translateX.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }] as any,
    opacity: opacity.value,
  }));

  const leftIndicatorStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, translateX.value / SWIPE_THRESHOLD),
  }));

  const rightIndicatorStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, -translateX.value / SWIPE_THRESHOLD),
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.cardContainer, animatedStyle, style]}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => onPress?.(outfit.id)}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={`Outfit: ${outfit.title}`}
          accessibilityHint="Tap to view outfit details, swipe left to love, swipe right to pass"
        >
          <BlurView intensity={20} style={styles.cardBlur}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
              style={styles.cardGradient}
            >
              {/* Swipe Indicators */}
              <Animated.View
                style={[styles.swipeIndicator, styles.leftIndicator, leftIndicatorStyle]}
              >
                <Ionicons name="heart" size={32} color={DesignSystem.colors.sage[600]} />
                <Text style={[styles.indicatorText, { color: DesignSystem.colors.sage[600] }]}>
                  Love
                </Text>
              </Animated.View>

              <Animated.View
                style={[styles.swipeIndicator, styles.rightIndicator, rightIndicatorStyle]}
              >
                <Ionicons name="close" size={32} color={DesignSystem.colors.coral[500]} />
                <Text style={[styles.indicatorText, { color: DesignSystem.colors.coral[500] }]}>
                  Pass
                </Text>
              </Animated.View>

              {/* Card Content */}
              <View style={styles.cardContent}>
                <View style={styles.header}>
                  <Text style={styles.title}>{outfit.title}</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      {Math.round(outfit.confidence * 100)}%
                    </Text>
                  </View>
                </View>

                <Text style={styles.description}>{outfit.description}</Text>

                <View style={styles.metadata}>
                  <View style={styles.metadataItem}>
                    <Ionicons name="sunny" size={16} color={DesignSystem.colors.text.secondary} />
                    <Text style={styles.metadataText}>{outfit.weather}</Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Ionicons
                      name="calendar"
                      size={16}
                      color={DesignSystem.colors.text.secondary}
                    />
                    <Text style={styles.metadataText}>{outfit.occasion}</Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Ionicons name="happy" size={16} color={DesignSystem.colors.text.secondary} />
                    <Text style={styles.metadataText}>{outfit.mood}</Text>
                  </View>
                </View>

                <View style={styles.tags}>
                  {outfit.tags.slice(0, 3).map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignSystem.radius.xl,
    flex: 1,
    overflow: 'hidden',
    ...DesignSystem.elevation.high,
  },
  cardBlur: {
    flex: 1,
  },
  cardContainer: {
    alignSelf: 'center',
    height: 400,
    width: CARD_WIDTH,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.xl,
  },
  cardGradient: {
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: DesignSystem.colors.terracotta[50],
    borderRadius: DesignSystem.radius.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: 4,
  },
  confidenceText: {
    color: DesignSystem.colors.terracotta[600],
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 14,
    marginTop: DesignSystem.spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  indicatorText: {
    fontSize: 12,
    marginTop: 4,
  },
  leftIndicator: {
    left: 16,
    transform: [{ rotate: '-15deg' }],
  },
  metadata: {
    flexDirection: 'row',
    gap: 12,
    marginTop: DesignSystem.spacing.md,
  },
  metadataItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  metadataText: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 12,
  },
  rightIndicator: {
    right: 16,
    transform: [{ rotate: '15deg' }],
  },
  swipeIndicator: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 8,
    padding: 8,
    position: 'absolute',
    top: 16,
  },
  tag: {
    backgroundColor: DesignSystem.colors.sage[50],
    borderRadius: DesignSystem.radius.full,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: 6,
  },
  tagText: {
    color: DesignSystem.colors.sage[700],
    fontSize: 12,
    fontWeight: '600',
  },
  tags: {
    columnGap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: DesignSystem.spacing.md,
    rowGap: 8,
  },
  title: {
    color: DesignSystem.colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default SwipeableCard;
