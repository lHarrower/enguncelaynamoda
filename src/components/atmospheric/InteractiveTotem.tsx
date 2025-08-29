// Interactive Totem - The Heart of AYNAMODA
// A 3D-like floating object that users swipe to rotate, revealing different facets
// Inspired by Gucci Hunt experience - playful, tactile, rewarding

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import type { ViewStyle } from 'react-native';
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const { width, height } = Dimensions.get('window');
const TOTEM_SIZE = width * 0.85;

interface ComponentItem {
  image: string;
  label: string;
}

interface TotemFacetContent {
  items?: ComponentItem[];
  message?: string;
  outfit?: { image: string; title: string; description: string };
  mood?: { color: string; emotion: string; description: string };
  image?: string;
  title?: string;
  subtitle?: string;
  confidence?: number;
  gradient?: readonly [string, string, ...string[]];
  emoji?: string;
  description?: string;
}

export interface TotemFacet {
  id: string;
  type: 'outfit' | 'whisper' | 'components' | 'mood';
  title: string;
  content: TotemFacetContent;
}

interface InteractiveTotemProps {
  facets: TotemFacet[];
  onFacetChange?: (facetId: string) => void;
  style?: ViewStyle;
}

const InteractiveTotem: React.FC<InteractiveTotemProps> = ({ facets, onFacetChange, style }) => {
  const [currentFacetIndex, setCurrentFacetIndex] = useState(0);

  // Animation values for 3D-like rotation and floating
  const rotationY = useSharedValue(0);
  const rotationX = useSharedValue(0);
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);
  const atmosphericFloat = useSharedValue(1);
  const liquidGoldShimmer = useSharedValue(0);
  const glassOpacity = useSharedValue(0.06);

  // Helper functions for gesture handling
  const settleTotem = () => {
    scale.value = withTiming(1, { duration: 400 });
    elevation.value = withTiming(8, { duration: 400 });
    glassOpacity.value = withTiming(0.06, { duration: 400 });
  };

  const calculateNextFacetIndex = (translationX: number) => {
    const swipeThreshold = 80;
    if (Math.abs(translationX) <= swipeThreshold) {
      return currentFacetIndex;
    }

    if (translationX > 0) {
      // Swipe right - next facet
      return facets.length > 0 ? (currentFacetIndex + 1) % facets.length : 0;
    } else {
      // Swipe left - previous facet
      return facets.length === 0
        ? 0
        : currentFacetIndex === 0
          ? facets.length - 1
          : currentFacetIndex - 1;
    }
  };

  const handleFacetSwipe = (translationX: number) => {
    const newFacetIndex = calculateNextFacetIndex(translationX);

    if (newFacetIndex !== currentFacetIndex) {
      // Haptic feedback for facet change
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      runOnJS(setCurrentFacetIndex)(newFacetIndex);

      if (onFacetChange && facets[newFacetIndex]) {
        const facet = facets[newFacetIndex];
        if (facet) {
          runOnJS(onFacetChange)(facet.id);
        }
      }
    }
  };

  const resetRotation = () => {
    rotationY.value = withTiming(0, { duration: 800 });
    rotationX.value = withTiming(0, { duration: 800 });
  };

  // Gesture handler for swipe-to-rotate
  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      // Haptic feedback on touch start
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);

      // Lift the totem
      scale.value = withTiming(1.05, { duration: 200 });
      elevation.value = withTiming(24, { duration: 200 });
      glassOpacity.value = withTiming(0.12, { duration: 200 });
    },
    onActive: (event) => {
      // 3D rotation based on gesture
      rotationY.value = event.translationX * 0.3;
      rotationX.value = -event.translationY * 0.15;
    },
    onEnd: (event) => {
      settleTotem();
      handleFacetSwipe(event.translationX);
      resetRotation();
    },
  });

  // Start atmospheric animations
  useEffect(() => {
    // Floating animation - like the totem is levitating
    atmosphericFloat.value = withRepeat(
      withSequence(withTiming(1.02, { duration: 4000 }), withTiming(0.98, { duration: 4000 })),
      -1,
      true,
    );

    // Liquid gold shimmer effect
    liquidGoldShimmer.value = withRepeat(
      withSequence(withTiming(1, { duration: 3000 }), withTiming(0, { duration: 3000 })),
      -1,
      true,
    );
  }, [atmosphericFloat, liquidGoldShimmer]);

  // Animated styles
  const totemStyle = useAnimatedStyle((): ViewStyle => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotationY.value}deg` },
        { rotateX: `${rotationX.value}deg` },
        { scale: scale.value * atmosphericFloat.value },
        { translateY: interpolate(atmosphericFloat.value, [0.98, 1.02], [4, -4]) },
      ],
      shadowOpacity: interpolate(elevation.value, [0, 24], [0.15, 0.35]),
      shadowRadius: interpolate(elevation.value, [0, 24], [16, 48]),
    };
  });

  const shimmerStyle = useAnimatedStyle((): ViewStyle => {
    return {
      opacity: interpolate(liquidGoldShimmer.value, [0, 1], [0, 0.3]),
    };
  });

  const glassStyle = useAnimatedStyle((): ViewStyle => {
    return {
      backgroundColor: `rgba(255, 255, 255, ${glassOpacity.value})`,
    };
  });

  // Render different facet types
  const renderOutfitFacet = (facet: TotemFacet) => (
    <ImageBackground
      source={{ uri: facet.content.image }}
      style={styles.facetContent}
      imageStyle={styles.facetImage}
    >
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.facetGradient}>
        <View style={styles.outfitInfo}>
          <Text style={styles.outfitTitle}>{facet.content.title}</Text>
          <Text style={styles.outfitSubtitle}>{facet.content.subtitle}</Text>
          <View style={styles.confidenceIndicator}>
            <View style={styles.confidenceBar}>
              <View
                style={[styles.confidenceFill, { width: `${facet.content.confidence ?? 0}%` }]}
              />
            </View>
            <Text style={styles.confidenceText}>{facet.content.confidence}% Confidence Match</Text>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );

  const renderWhisperFacet = (facet: TotemFacet) => (
    <BlurView intensity={60} style={styles.facetContent}>
      <Animated.View style={[styles.whisperGlass, glassStyle]}>
        <View style={styles.whisperContent}>
          <Ionicons
            name="sparkles"
            size={32}
            color={DesignSystem.colors.text.accent}
            style={styles.whisperIcon}
          />
          <Text style={styles.whisperTitle}>Confidence Whisper</Text>
          <Text style={styles.whisperText}>{facet.content.message}</Text>
          <Text style={styles.whisperSignature}>— Your Style AI</Text>
        </View>
      </Animated.View>
    </BlurView>
  );

  const renderComponentsFacet = (facet: TotemFacet) => (
    <View style={styles.facetContent}>
      <BlurView intensity={40} style={styles.componentsBlur}>
        <View style={styles.componentsGrid}>
          {facet.content.items?.map((item: ComponentItem, index: number) => (
            <View key={index} style={styles.componentItem}>
              <Image source={{ uri: item.image }} style={styles.componentImage} />
              <Text style={styles.componentLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </BlurView>
    </View>
  );

  const renderMoodFacet = (facet: TotemFacet) => (
    <LinearGradient
      colors={
        (facet.content.gradient as readonly [string, string, ...string[]]) ||
        (['#000', '#333'] as const)
      }
      style={styles.facetContent}
    >
      <View style={styles.moodContent}>
        <Text style={styles.moodEmoji}>{facet.content.emoji}</Text>
        <Text style={styles.moodTitle}>{facet.content.mood?.emotion || facet.title}</Text>
        <Text style={styles.moodDescription}>
          {facet.content.description || facet.content.mood?.description}
        </Text>
      </View>
    </LinearGradient>
  );

  const renderCurrentFacet = () => {
    const facet = facets[currentFacetIndex];
    if (!facet) {
      return null;
    }

    switch (facet.type) {
      case 'outfit':
        return renderOutfitFacet(facet);
      case 'whisper':
        return renderWhisperFacet(facet);
      case 'components':
        return renderComponentsFacet(facet);
      case 'mood':
        return renderMoodFacet(facet);
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.totem, totemStyle]}>
          {/* Liquid Gold Shimmer Overlay */}
          <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
            <LinearGradient
              colors={[
                'transparent',
                DesignSystem.colors.sage[300],
                DesignSystem.colors.sage[400],
                DesignSystem.colors.sage[300],
                'transparent',
              ]}
              style={styles.shimmerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          {/* Current Facet Content */}
          {renderCurrentFacet()}

          {/* Interaction Hint */}
          <View style={styles.interactionHint}>
            <Ionicons
              name="swap-horizontal-outline"
              size={16}
              color={DesignSystem.colors.text.tertiary}
            />
            <Text style={styles.hintText}>Swipe to explore facets</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* Facet Indicators */}
      <View style={styles.indicators}>
        {facets.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.indicator, index === currentFacetIndex && styles.activeIndicator]}
            onPress={() => {
              if (facets[index]) {
                setCurrentFacetIndex(index);
                onFacetChange?.(facets[index].id);
              }
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  totem: {
    borderRadius: 32,
    height: TOTEM_SIZE,
    width: TOTEM_SIZE,
    ...DesignSystem.elevation.high,
    backgroundColor: DesignSystem.colors.background.glass,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  shimmerGradient: {
    borderRadius: 32,
    flex: 1,
  },
  facetContent: {
    borderRadius: 32,
    flex: 1,
  },
  facetImage: {
    borderRadius: 32,
  },
  facetGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },

  // Outfit Facet Styles
  outfitInfo: {
    alignItems: 'flex-start',
  },
  outfitTitle: {
    ...DesignSystem.typography.heading.h1,
    color: DesignSystem.colors.text.primary,
    fontSize: 32,
    marginBottom: 8,
  },
  outfitSubtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    marginBottom: 16,
  },
  confidenceIndicator: {
    width: '100%',
  },
  confidenceBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    height: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  confidenceFill: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: 2,
    height: '100%',
  },
  confidenceText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.accent,
  },

  // Whisper Facet Styles
  whisperGlass: {
    borderRadius: 32,
    flex: 1,
    ...DesignSystem.elevation.soft,
    backgroundColor: DesignSystem.colors.background.glass,
  },
  whisperContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  whisperIcon: {
    marginBottom: 16,
  },
  whisperTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.accent,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  whisperText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  whisperSignature: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },

  // Components Facet Styles
  componentsBlur: {
    borderRadius: 32,
    flex: 1,
  },
  componentsGrid: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 24,
  },
  componentItem: {
    alignItems: 'center',
    margin: 12,
  },
  componentImage: {
    borderRadius: 12,
    height: 60,
    marginBottom: 8,
    width: 60,
  },
  componentLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },

  // Mood Facet Styles
  moodContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  moodEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  moodTitle: {
    ...DesignSystem.typography.heading.h1,
    color: DesignSystem.colors.text.primary,
    fontSize: 28,
    marginBottom: 12,
    textAlign: 'center',
  },
  moodDescription: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'center',
  },

  // Interaction Elements
  interactionHint: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    left: 0,
    marginHorizontal: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    right: 0,
  },
  hintText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    fontSize: 10,
    marginLeft: 6,
  },

  // Indicators
  indicators: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  indicator: {
    backgroundColor: DesignSystem.colors.text.tertiary,
    borderRadius: 4,
    height: 8,
    opacity: 0.3,
    width: 8,
  },
  activeIndicator: {
    backgroundColor: DesignSystem.colors.text.accent,
    opacity: 1,
    width: 24,
  },
});

export default InteractiveTotem;
