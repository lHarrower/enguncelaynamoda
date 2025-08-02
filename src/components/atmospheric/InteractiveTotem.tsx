// Interactive Totem - The Heart of AYNAMODA
// A 3D-like floating object that users swipe to rotate, revealing different facets
// Inspired by Gucci Hunt experience - playful, tactile, rewarding

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { DesignSystem } from '@/theme/DesignSystem';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const TOTEM_SIZE = width * 0.85;

interface TotemFacet {
  id: string;
  type: 'outfit' | 'whisper' | 'components' | 'mood';
  title: string;
  content: any;
}

interface InteractiveTotemProps {
  facets: TotemFacet[];
  onFacetChange?: (facetId: string) => void;
  style?: any;
}

const InteractiveTotem: React.FC<InteractiveTotemProps> = ({
  facets,
  onFacetChange,
  style,
}) => {
  const [currentFacetIndex, setCurrentFacetIndex] = useState(0);
  
  // Animation values for 3D-like rotation and floating
  const rotationY = useSharedValue(0);
  const rotationX = useSharedValue(0);
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);
  const atmosphericFloat = useSharedValue(1);
  const liquidGoldShimmer = useSharedValue(0);
  const glassOpacity = useSharedValue(0.06);

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
      // Settle the totem
      scale.value = withTiming(1, { duration: 400 });
      elevation.value = withTiming(8, { duration: 400 });
      glassOpacity.value = withTiming(0.06, { duration: 400 });
      
      // Determine facet change based on swipe direction
      const swipeThreshold = 80;
      let newFacetIndex = currentFacetIndex;
      
      if (Math.abs(event.translationX) > swipeThreshold) {
        if (event.translationX > 0) {
          // Swipe right - next facet
          newFacetIndex = (currentFacetIndex + 1) % facets.length;
        } else {
          // Swipe left - previous facet
          newFacetIndex = currentFacetIndex === 0 ? facets.length - 1 : currentFacetIndex - 1;
        }
        
        // Haptic feedback for facet change
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        runOnJS(setCurrentFacetIndex)(newFacetIndex);
        if (onFacetChange) {
          runOnJS(onFacetChange)(facets[newFacetIndex].id);
        }
      }
      
      // Smooth rotation back to center
      rotationY.value = withTiming(0, { duration: 800 });
      rotationX.value = withTiming(0, { duration: 800 });
    },
  });

  // Start atmospheric animations
  useEffect(() => {
    // Floating animation - like the totem is levitating
    atmosphericFloat.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 4000 }),
        withTiming(0.98, { duration: 4000 })
      ),
      -1,
      true
    );
    
    // Liquid gold shimmer effect
    liquidGoldShimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000 }),
        withTiming(0, { duration: 3000 })
      ),
      -1,
      true
    );
  }, []);

  // Animated styles
  const totemStyle = useAnimatedStyle(() => {
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

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(liquidGoldShimmer.value, [0, 1], [0, 0.3]),
    };
  });

  const glassStyle = useAnimatedStyle(() => {
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
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.facetGradient}
      >
        <View style={styles.outfitInfo}>
          <Text style={styles.outfitTitle}>{facet.content.title}</Text>
          <Text style={styles.outfitSubtitle}>{facet.content.subtitle}</Text>
          <View style={styles.confidenceIndicator}>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { width: `${facet.content.confidence}%` }
                ]} 
              />
            </View>
            <Text style={styles.confidenceText}>
              {facet.content.confidence}% Confidence Match
            </Text>
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
          {facet.content.items.map((item: any, index: number) => (
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
      colors={facet.content.gradient}
      style={styles.facetContent}
    >
      <View style={styles.moodContent}>
        <Text style={styles.moodEmoji}>{facet.content.emoji}</Text>
        <Text style={styles.moodTitle}>{facet.content.mood}</Text>
        <Text style={styles.moodDescription}>{facet.content.description}</Text>
      </View>
    </LinearGradient>
  );

  const renderCurrentFacet = () => {
    const facet = facets[currentFacetIndex];
    if (!facet) return null;

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
            style={[
              styles.indicator,
              index === currentFacetIndex && styles.activeIndicator
            ]}
            onPress={() => {
              setCurrentFacetIndex(index);
              onFacetChange?.(facets[index].id);
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
    width: TOTEM_SIZE,
    height: TOTEM_SIZE,
    borderRadius: 32,
    ...DesignSystem.elevation.high,
    backgroundColor: DesignSystem.colors.background.glass,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  shimmerGradient: {
    flex: 1,
    borderRadius: 32,
  },
  facetContent: {
    flex: 1,
    borderRadius: 32,
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
    ...DesignSystem.typography.h1,
    color: DesignSystem.colors.text.primary,
    marginBottom: 8,
    fontSize: 32,
  },
  outfitSubtitle: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text.tertiary,
    marginBottom: 16,
  },
  confidenceIndicator: {
    width: '100%',
  },
  confidenceBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: 2,
  },
  confidenceText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text.accent,
  },
  
  // Whisper Facet Styles
  whisperGlass: {
    flex: 1,
    borderRadius: 32,
    ...DesignSystem.elevation.soft,
    backgroundColor: DesignSystem.colors.background.glass,
  },
  whisperContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  whisperIcon: {
    marginBottom: 16,
  },
  whisperTitle: {
    ...DesignSystem.typography.h3,
    color: DesignSystem.colors.text.accent,
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 18,
  },
  whisperText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  whisperSignature: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  
  // Components Facet Styles
  componentsBlur: {
    flex: 1,
    borderRadius: 32,
  },
  componentsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 24,
  },
  componentItem: {
    alignItems: 'center',
    margin: 12,
  },
  componentImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 8,
  },
  componentLabel: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  
  // Mood Facet Styles
  moodContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  moodEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  moodTitle: {
    ...DesignSystem.typography.h1,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 28,
  },
  moodDescription: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'center',
  },
  
  // Interaction Elements
  interactionHint: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginHorizontal: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  hintText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text.tertiary,
    marginLeft: 6,
    fontSize: 10,
  },
  
  // Indicators
  indicators: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DesignSystem.colors.text.tertiary,
    opacity: 0.3,
  },
  activeIndicator: {
    backgroundColor: DesignSystem.colors.text.accent,
    opacity: 1,
    width: 24,
  },
});

export default InteractiveTotem;