// Interactive Totem - The Heart of AYNAMODA's Artistic Vision
// A 3D interactive object that transforms outfit discovery into art

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
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ARTISTRY_THEME } from '../../constants/ArtistryTheme';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

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
  // State for current facet
  const [currentFacetIndex, setCurrentFacetIndex] = useState(0);
  
  // Animation values
  const scale = useSharedValue(1);
  const breathing = useSharedValue(1);
  const shimmer = useSharedValue(0);
  
  // Handle facet change
  const handleFacetChange = (index: number) => {
    setCurrentFacetIndex(index);
    onFacetChange?.(facets[index].id);
    
    // Add a little scale animation for feedback
    scale.value = withSequence(
      withTiming(1.05, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );
  };

  // Start breathing animation
  useEffect(() => {
    breathing.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 3000 }),
        withTiming(1, { duration: 3000 })
      ),
      -1,
      true
    );
    
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  // Animated styles
  const totemStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value * breathing.value },
      ],
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.8]),
    };
  });

  const renderOutfitFacet = (facet: TotemFacet) => (
    <View style={styles.facetContent}>
      <ImageBackground
        source={{ uri: facet.content.image }}
        style={styles.outfitImage}
        imageStyle={styles.outfitImageStyle}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.outfitGradient}
        >
          <View style={styles.outfitInfo}>
            <Text style={styles.outfitTitle}>{facet.content.title}</Text>
            <Text style={styles.outfitSubtitle}>{facet.content.subtitle}</Text>
            <View style={styles.confidenceIndicator}>
              <Ionicons 
                name="sparkles" 
                size={16} 
                color={ARTISTRY_THEME.semantic.interactive.primary} 
              />
              <Text style={styles.confidenceText}>
                {facet.content.confidence}% Match
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );

  const renderWhisperFacet = (facet: TotemFacet) => (
    <BlurView intensity={40} style={styles.facetContent}>
      <View style={styles.whisperContent}>
        <Ionicons 
          name="leaf-outline" 
          size={32} 
          color={ARTISTRY_THEME.semantic.text.accent} 
          style={styles.whisperIcon}
        />
        <Text style={styles.whisperTitle}>{facet.title}</Text>
        <Text style={styles.whisperText}>{facet.content.message}</Text>
        <Text style={styles.whisperSignature}>— Your Style AI</Text>
      </View>
    </BlurView>
  );

  const renderComponentsFacet = (facet: TotemFacet) => (
    <View style={styles.facetContent}>
      <View style={styles.componentsGrid}>
        {facet.content.items.map((item: any, index: number) => (
          <View key={index} style={styles.componentItem}>
            <Image source={{ uri: item.image }} style={styles.componentImage} />
            <Text style={styles.componentLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMoodFacet = (facet: TotemFacet) => (
    <View style={styles.facetContent}>
      <LinearGradient
        colors={facet.content.gradient}
        style={styles.moodGradient}
      >
        <View style={styles.moodContent}>
          <Text style={styles.moodEmoji}>{facet.content.emoji}</Text>
          <Text style={styles.moodTitle}>{facet.content.mood}</Text>
          <Text style={styles.moodDescription}>{facet.content.description}</Text>
        </View>
      </LinearGradient>
    </View>
  );

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
            {facets.length > 0 && renderFacet(facets[currentFacetIndex])}
          </View>
          
          {/* Interaction Hint */}
          <View style={styles.interactionHint}>
            <Ionicons 
              name="refresh-outline" 
              size={20} 
              color={ARTISTRY_THEME.semantic.text.whisper} 
            />
            <Text style={styles.hintText}>Tap to explore</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
      
      {/* Facet Indicators */}
      <View style={styles.indicators}>
        {facets.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.indicator,
              index === currentFacetIndex && styles.activeIndicator
            ]}
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
    paddingVertical: ARTISTRY_THEME.spacing.float,
  },
  totem: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: ARTISTRY_THEME.radius.organic,
    ...ARTISTRY_THEME.components.totem.primary,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ARTISTRY_THEME.semantic.atmosphere.goldShimmer,
    borderRadius: ARTISTRY_THEME.radius.organic,
  },
  facetContainer: {
    flex: 1,
    borderRadius: ARTISTRY_THEME.radius.organic,
    overflow: 'hidden',
  },
  facetContent: {
    flex: 1,
    borderRadius: ARTISTRY_THEME.radius.organic,
  },
  
  // Outfit Facet Styles
  outfitImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  outfitImageStyle: {
    borderRadius: ARTISTRY_THEME.radius.organic,
  },
  outfitGradient: {
    padding: ARTISTRY_THEME.spacing.dance,
  },
  outfitInfo: {
    alignItems: 'flex-start',
  },
  outfitTitle: {
    ...ARTISTRY_THEME.typography.scale.statement,
    color: ARTISTRY_THEME.semantic.text.poetry,
    marginBottom: ARTISTRY_THEME.spacing.whisper,
  },
  outfitSubtitle: {
    ...ARTISTRY_THEME.typography.scale.elegant,
    color: ARTISTRY_THEME.semantic.text.whisper,
    marginBottom: ARTISTRY_THEME.spacing.flow,
  },
  confidenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ARTISTRY_THEME.semantic.atmosphere.goldShimmer,
    paddingHorizontal: ARTISTRY_THEME.spacing.gentle,
    paddingVertical: ARTISTRY_THEME.spacing.whisper,
    borderRadius: ARTISTRY_THEME.radius.whisper,
  },
  confidenceText: {
    ...ARTISTRY_THEME.typography.scale.kinetic,
    color: ARTISTRY_THEME.semantic.text.accent,
    marginLeft: ARTISTRY_THEME.spacing.whisper,
  },
  
  // Whisper Facet Styles
  whisperContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ARTISTRY_THEME.spacing.dance,
  },
  whisperIcon: {
    marginBottom: ARTISTRY_THEME.spacing.flow,
  },
  whisperTitle: {
    ...ARTISTRY_THEME.typography.scale.whisper,
    color: ARTISTRY_THEME.semantic.text.accent,
    textAlign: 'center',
    marginBottom: ARTISTRY_THEME.spacing.flow,
  },
  whisperText: {
    ...ARTISTRY_THEME.typography.scale.elegant,
    color: ARTISTRY_THEME.semantic.text.primary,
    textAlign: 'center',
    marginBottom: ARTISTRY_THEME.spacing.flow,
  },
  whisperSignature: {
    ...ARTISTRY_THEME.typography.scale.floating,
    color: ARTISTRY_THEME.semantic.text.whisper,
    textAlign: 'center',
  },
  
  // Components Facet Styles
  componentsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: ARTISTRY_THEME.spacing.flow,
  },
  componentItem: {
    alignItems: 'center',
    margin: ARTISTRY_THEME.spacing.whisper,
  },
  componentImage: {
    width: 60,
    height: 60,
    borderRadius: ARTISTRY_THEME.radius.gentle,
    marginBottom: ARTISTRY_THEME.spacing.whisper,
  },
  componentLabel: {
    ...ARTISTRY_THEME.typography.scale.floating,
    color: ARTISTRY_THEME.semantic.text.secondary,
    textAlign: 'center',
  },
  
  // Mood Facet Styles
  moodGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ARTISTRY_THEME.radius.organic,
  },
  moodContent: {
    alignItems: 'center',
    padding: ARTISTRY_THEME.spacing.dance,
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: ARTISTRY_THEME.spacing.flow,
  },
  moodTitle: {
    ...ARTISTRY_THEME.typography.scale.statement,
    color: ARTISTRY_THEME.semantic.text.poetry,
    textAlign: 'center',
    marginBottom: ARTISTRY_THEME.spacing.gentle,
  },
  moodDescription: {
    ...ARTISTRY_THEME.typography.scale.elegant,
    color: ARTISTRY_THEME.semantic.text.whisper,
    textAlign: 'center',
  },
  
  // Interaction Elements
  interactionHint: {
    position: 'absolute',
    bottom: ARTISTRY_THEME.spacing.flow,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ARTISTRY_THEME.semantic.atmosphere.goldShimmer,
    marginHorizontal: ARTISTRY_THEME.spacing.dance,
    paddingVertical: ARTISTRY_THEME.spacing.whisper,
    borderRadius: ARTISTRY_THEME.radius.whisper,
  },
  hintText: {
    ...ARTISTRY_THEME.typography.scale.floating,
    color: ARTISTRY_THEME.semantic.text.accent,
    marginLeft: ARTISTRY_THEME.spacing.whisper,
  },
  
  // Indicators
  indicators: {
    flexDirection: 'row',
    marginTop: ARTISTRY_THEME.spacing.dance,
    gap: ARTISTRY_THEME.spacing.gentle,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ARTISTRY_THEME.semantic.text.whisper,
    opacity: 0.3,
  },
  activeIndicator: {
    backgroundColor: ARTISTRY_THEME.semantic.interactive.primary,
    opacity: 1,
  },
});

export default InteractiveTotem;