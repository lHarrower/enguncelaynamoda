// src/components/shared/SwipeableCard.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
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
  style?: any;
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
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
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
        >
          <BlurView intensity={20} style={styles.cardBlur}>
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.9)',
                'rgba(255, 255, 255, 0.7)',
              ]}
              style={styles.cardGradient}
            >
              {/* Swipe Indicators */}
              <Animated.View style={[styles.swipeIndicator, styles.leftIndicator, leftIndicatorStyle]}>
                <Ionicons name="heart" size={32} color={DesignSystem.colors.sage[600]} />
                <Text style={[styles.indicatorText, { color: DesignSystem.colors.sage[600] }]}>Love</Text>
              </Animated.View>
              
              <Animated.View style={[styles.swipeIndicator, styles.rightIndicator, rightIndicatorStyle]}>
                <Ionicons name="close" size={32} color={DesignSystem.colors.coral[500]} />
                <Text style={[styles.indicatorText, { color: DesignSystem.colors.coral[500] }]}>Pass</Text>
              </Animated.View>

              {/* Card Content */}
              <View style={styles.cardContent}>
                <View style={styles.header}>
                  <Text style={styles.title}>{outfit.title}</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>{Math.round(outfit.confidence * 100)}%</Text>
                  </View>
                </View>
                
                <Text style={styles.description}>{outfit.description}</Text>
                
                <View style={styles.metadata}>
                  <View style={styles.metadataItem}>
                    <Ionicons name="sunny" size={16} color={DesignSystem.colors.text.secondary} />
                    <Text style={styles.metadataText}>{outfit.weather}</Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Ionicons name="calendar" size={16} color={DesignSystem.colors.text.secondary} />
                    <Text style={styles.metadataText}>{outfit.occasion}</Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Ionicons name="happy" size={16} color={DesignSystem.colors.text.secondary} />
                    <Text style={styles.metadataText}>{outfit.mood}</Text>
                  </View>
                </View>
                
                <View style={styles.tags}>
                  {outfit.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.tag}>
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
  cardContainer: {
    width: CARD_WIDTH,
    height: 400,
    alignSelf: 'center',
  },
  card: {
    flex: 1,
    borderRadius: DesignSystem.radius.xl,
    overflow: 'hidden',
    ...DesignSystem.elevation.high,
  },
  cardBlur: {
    flex: 1,
  },
  cardGradient: {
    flex: 1,
    position: 'relative',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    zIndex: 10,
  },
  leftIndicator: {
    left: 30,
    transform: [{ translateY: -30 }],
  },
  rightIndicator: {
    right: 30,
    transform: [{ translateY: -30 }],
  },
  indicatorText: {
    ...DesignSystem.typography.scale.caption,
    fontWeight: '600',
    marginTop: 4,
  },
  cardContent: {
    flex: 1,
    padding: DesignSystem.spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing.md,
  },
  title: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.primary,
    flex: 1,
    marginRight: DesignSystem.spacing.md,
  },
  confidenceBadge: {
    backgroundColor: DesignSystem.colors.sage[100],
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.radius.full,
  },
  confidenceText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.sage[700],
    fontWeight: '600',
  },
  description: {
  ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 22,
    marginBottom: DesignSystem.spacing.lg,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.lg,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
  },
  metadataText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.xs,
  },
  tag: {
    backgroundColor: DesignSystem.colors.background.elevated,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.radius.sm,
    borderWidth: 1,
  borderColor: DesignSystem.colors.border.secondary,
  },
  tagText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    fontSize: 11,
  },
});

export default SwipeableCard;