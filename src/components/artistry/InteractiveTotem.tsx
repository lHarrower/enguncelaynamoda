// Interactive Totem - The Heart of AYNAMODA's Artistic Vision
// A 3D interactive object that transforms outfit discovery into art

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { DesignSystem } from '../../theme/DesignSystem';

const { width, height } = Dimensions.get('window');

interface TotemFacetContent {
  items?: Array<{ image: string; label: string }>;
  outfit?: { image: string; title: string; description: string };
  whisper?: { text: string; author: string };
  mood?: { color: string; emotion: string; description: string };
  // Additional properties used in the component
  image?: string;
  title?: string;
  subtitle?: string;
  confidence?: number;
  message?: string;
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
  // State for current facet
  const [currentFacetIndex, setCurrentFacetIndex] = useState(0);

  // Animation values
  const scale = useSharedValue(1);
  const breathing = useSharedValue(1);
  const shimmer = useSharedValue(0);

  // Handle facet change
  const handleFacetChange = (index: number) => {
    if (!facets || index < 0 || index >= facets.length) {
      return;
    }
    setCurrentFacetIndex(index);
    const facet = facets[index];
    if (facet) {
      onFacetChange?.(facet.id);
    }

    // Add a little scale animation for feedback
    scale.value = withSequence(
      withTiming(1.05, { duration: 100 }),
      withTiming(1, { duration: 200 }),
    );
  };

  // Start breathing animation
  useEffect(() => {
    breathing.value = withRepeat(
      withSequence(withTiming(1.02, { duration: 3000 }), withTiming(1, { duration: 3000 })),
      -1,
      true,
    );

    shimmer.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }, [breathing, shimmer]);

  // Animated styles
  const totemStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value * breathing.value }],
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.8]),
    };
  });

  const renderOutfitFacet = (facet: TotemFacet) => {
    const imageUri = facet.content.image;
    const title = facet.content.title;
    const subtitle = facet.content.subtitle;
    const confidence = facet.content.confidence;

    if (!imageUri) {
      return null;
    }

    return (
      <View style={styles.facetContent}>
        <ImageBackground
          source={{ uri: imageUri }}
          style={styles.outfitImage}
          imageStyle={styles.outfitImageStyle}
        >
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.outfitGradient}>
            <View style={styles.outfitInfo}>
              {title && <Text style={styles.outfitTitle}>{title}</Text>}
              {subtitle && <Text style={styles.outfitSubtitle}>{subtitle}</Text>}
              {typeof confidence === 'number' && (
                <View style={styles.confidenceIndicator}>
                  <Ionicons name="sparkles" size={16} color={DesignSystem.colors.sage[600]} />
                  <Text style={styles.confidenceText}>{confidence}% Match</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  };

  const renderWhisperFacet = (facet: TotemFacet) => {
    const message = facet.content.message;

    return (
      <BlurView intensity={40} style={styles.facetContent}>
        <View style={styles.whisperContent}>
          <Ionicons
            name="leaf-outline"
            size={32}
            color={DesignSystem.colors.text.accent}
            style={styles.whisperIcon}
          />
          <Text style={styles.whisperTitle}>{facet.title}</Text>
          {message && <Text style={styles.whisperText}>{message}</Text>}
          <Text style={styles.whisperSignature}>— Your Style AI</Text>
        </View>
      </BlurView>
    );
  };

  const renderComponentsFacet = (facet: TotemFacet) => (
    <View style={styles.facetContent}>
      <View style={styles.componentsGrid}>
        {facet.content.items?.map((item: { image: string; label: string }, index: number) => (
          <View key={index} style={styles.componentItem}>
            <Image source={{ uri: item.image }} style={styles.componentImage} />
            <Text style={styles.componentLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMoodFacet = (facet: TotemFacet) => {
    const gradient = Array.isArray(facet.content.gradient)
      ? (facet.content.gradient as readonly [string, string, ...string[]])
      : (['#000000', '#333333'] as const);
    const emoji = facet.content.emoji;
    const mood = facet.content.mood;
    const description = facet.content.description;

    return (
      <View style={styles.facetContent}>
        <LinearGradient colors={gradient} style={styles.moodGradient}>
          <View style={styles.moodContent}>
            {emoji && <Text style={styles.moodEmoji}>{emoji}</Text>}
            {mood && (
              <Text style={styles.moodTitle}>{typeof mood === 'string' ? mood : mood.emotion}</Text>
            )}
            {description && <Text style={styles.moodDescription}>{description}</Text>}
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderFacet = (facet: TotemFacet) => {
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
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          const nextIndex = (currentFacetIndex + 1) % facets.length;
          handleFacetChange(nextIndex);
        }}
      >
        <Animated.View style={[styles.totem, totemStyle]}>
          {/* Shimmer Effect */}
          <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />

          {/* Current Facet */}
          <View style={styles.facetContainer}>
            {facets.length > 0 &&
              facets[currentFacetIndex] &&
              renderFacet(facets[currentFacetIndex])}
          </View>

          {/* Interaction Hint */}
          <View style={styles.interactionHint}>
            <Ionicons name="refresh-outline" size={20} color={DesignSystem.colors.text.tertiary} />
            <Text style={styles.hintText}>Tap to explore</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Facet Indicators */}
      <View style={styles.indicators}>
        {facets.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.indicator, index === currentFacetIndex && styles.activeIndicator]}
            onPress={() => handleFacetChange(index)}
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
    paddingVertical: DesignSystem.spacing.lg,
  },
  totem: {
    borderRadius: DesignSystem.radius.lg,
    height: width * 0.8,
    width: width * 0.8,
    ...DesignSystem.elevation.medium,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerOverlay: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: DesignSystem.radius.lg,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  facetContainer: {
    borderRadius: DesignSystem.radius.lg,
    flex: 1,
    overflow: 'hidden',
  },
  facetContent: {
    borderRadius: DesignSystem.radius.lg,
    flex: 1,
  },

  // Outfit Facet Styles
  outfitImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  outfitImageStyle: {
    borderRadius: DesignSystem.radius.lg,
  },
  outfitGradient: {
    padding: DesignSystem.spacing.lg,
  },
  outfitInfo: {
    alignItems: 'flex-start',
  },
  outfitTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  outfitSubtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.tertiary,
    marginBottom: DesignSystem.spacing.md,
  },
  confidenceIndicator: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: DesignSystem.radius.xs,
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
  },
  confidenceText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.accent,
    marginLeft: DesignSystem.spacing.xs,
  },

  // Whisper Facet Styles
  whisperContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: DesignSystem.spacing.lg,
  },
  whisperIcon: {
    marginBottom: DesignSystem.spacing.md,
  },
  whisperTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.accent,
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  whisperText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  whisperSignature: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'center',
  },

  // Components Facet Styles
  componentsGrid: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: DesignSystem.spacing.md,
  },
  componentItem: {
    alignItems: 'center',
    margin: DesignSystem.spacing.xs,
  },
  componentImage: {
    borderRadius: DesignSystem.radius.md,
    height: 60,
    marginBottom: DesignSystem.spacing.xs,
    width: 60,
  },
  componentLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },

  // Mood Facet Styles
  moodGradient: {
    alignItems: 'center',
    borderRadius: DesignSystem.radius.lg,
    flex: 1,
    justifyContent: 'center',
  },
  moodContent: {
    alignItems: 'center',
    padding: DesignSystem.spacing.lg,
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: DesignSystem.spacing.md,
  },
  moodTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
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
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: DesignSystem.radius.xs,
    bottom: DesignSystem.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    left: 0,
    marginHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.xs,
    position: 'absolute',
    right: 0,
  },
  hintText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.accent,
    marginLeft: DesignSystem.spacing.xs,
  },

  // Indicators
  indicators: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
    marginTop: DesignSystem.spacing.lg,
  },
  indicator: {
    backgroundColor: DesignSystem.colors.text.tertiary,
    borderRadius: 4,
    height: 8,
    opacity: 0.3,
    width: 8,
  },
  activeIndicator: {
    backgroundColor: DesignSystem.colors.sage[600],
    opacity: 1,
  },
});

export default InteractiveTotem;
