// Outfit Recommendation Card - Digital Zen Garden Design
// Glassmorphism effects with organic animations and haptic feedback

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { APP_THEME_V2 } from '@/constants/AppThemeV2';
import { OutfitRecommendation, QuickAction } from '@/types/aynaMirror';

// Animation configurations
const ORGANIC_SPRING = {
  damping: 15,
  stiffness: 100,
  mass: 1,
};

const LIQUID_SPRING = {
  damping: 12,
  stiffness: 120,
  mass: 1,
};

interface OutfitRecommendationCardProps {
  recommendation: OutfitRecommendation;
  isSelected: boolean;
  onSelect: () => void;
  onQuickAction: (action: 'wear' | 'save' | 'share') => void;
  animationDelay?: number;
}

export const OutfitRecommendationCard: React.FC<OutfitRecommendationCardProps> = ({
  recommendation,
  isSelected,
  onSelect,
  onQuickAction,
  animationDelay = 0,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Animation values
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const pressScale = useSharedValue(1);
  const selectionScale = useSharedValue(isSelected ? 1.02 : 1);
  const glowOpacity = useSharedValue(isSelected ? 1 : 0);

  // Responsive dimensions
  const dimensions = useMemo(() => {
    const isTablet = screenWidth > 768;
    const isLandscape = screenWidth > screenHeight;
    
    const maxCardWidth = isTablet ? 400 : 350;
    const cardWidth = Math.min(screenWidth - (APP_THEME_V2.spacing.xl * 2), maxCardWidth);
    const cardHeight = cardWidth * (isTablet ? 1.1 : 1.2);
    
    return {
      cardWidth,
      cardHeight,
      isTablet,
      isLandscape,
    };
  }, [screenWidth, screenHeight]);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, ORGANIC_SPRING);
      opacity.value = withTiming(1, { duration: 800 });
      translateY.value = withSpring(0, ORGANIC_SPRING);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [animationDelay]);

  // Selection animation
  useEffect(() => {
    selectionScale.value = withSpring(isSelected ? 1.02 : 1, LIQUID_SPRING);
    glowOpacity.value = withTiming(isSelected ? 1 : 0, { duration: 300 });
  }, [isSelected]);

  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Press animation
    pressScale.value = withSpring(0.98, ORGANIC_SPRING);
    setTimeout(() => {
      pressScale.value = withSpring(1, ORGANIC_SPRING);
    }, 150);
    
    onSelect();
  };

  const handleQuickActionPress = (action: 'wear' | 'save' | 'share') => {
    // Stronger haptic feedback for actions
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onQuickAction(action);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // Get primary item image
  const primaryImage = recommendation.items[0]?.imageUri || recommendation.items[0]?.processedImageUri;

  // Animated styles
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pressScale.value * selectionScale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const styles = useMemo(() => createStyles(dimensions), [dimensions]);

  return (
    <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
      {/* Selection glow effect */}
      <Animated.View style={[styles.glowContainer, animatedGlowStyle]}>
        <LinearGradient
          colors={[
            `${APP_THEME_V2.colors.liquidGold[400]}40`,
            `${APP_THEME_V2.colors.sageGreen[400]}20`,
            'transparent',
          ]}
          style={styles.glow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={1}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Outfit recommendation with ${recommendation.items.length} items`}
        accessibilityHint="Double tap to select this outfit recommendation"
      >
        {/* Base gradient background */}
        <LinearGradient
          colors={[
            APP_THEME_V2.colors.linen.light,
            APP_THEME_V2.colors.linen.base,
            APP_THEME_V2.colors.cloudGray,
          ]}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Main image container */}
        <View style={styles.imageContainer}>
          {!imageError && primaryImage ? (
            <Image
              source={{ uri: primaryImage }}
              style={styles.mainImage}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              accessible={true}
              accessibilityLabel="Main outfit item"
            />
          ) : (
            // Elegant fallback
            <View style={styles.imageFallback}>
              <LinearGradient
                colors={[
                  APP_THEME_V2.colors.moonlightSilver,
                  APP_THEME_V2.colors.cloudGray,
                ]}
                style={styles.fallbackGradient}
              >
                <Ionicons 
                  name="shirt-outline" 
                  size={dimensions.isTablet ? 64 : 48} 
                  color={APP_THEME_V2.colors.inkGray[400]} 
                />
                <Text style={styles.fallbackText}>
                  {recommendation.items.length} pieces
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Quick option badge */}
          {recommendation.isQuickOption && (
            <View style={styles.quickBadgeContainer}>
              <BlurView intensity={20} tint="light" style={styles.quickBadgeBlur}>
                <View style={styles.quickBadge}>
                  <Ionicons 
                    name="flash" 
                    size={12} 
                    color={APP_THEME_V2.colors.liquidGold[600]} 
                  />
                  <Text style={styles.quickBadgeText}>Quick</Text>
                </View>
              </BlurView>
            </View>
          )}

          {/* Confidence score indicator */}
          <View style={styles.confidenceContainer}>
            <BlurView intensity={15} tint="light" style={styles.confidenceBlur}>
              <View style={styles.confidenceIndicator}>
                <View style={styles.confidenceBar}>
                  <LinearGradient
                    colors={[
                      APP_THEME_V2.colors.sageGreen[400],
                      APP_THEME_V2.colors.liquidGold[400],
                    ]}
                    style={[
                      styles.confidenceFill,
                      { width: `${Math.min(100, Math.max(0, recommendation.confidenceScore * 20))}%` }
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.confidenceText}>
                  {Math.round(recommendation.confidenceScore * 10)}/10
                </Text>
              </View>
            </BlurView>
          </View>
        </View>

        {/* Content overlay with glassmorphism */}
        <View style={styles.contentOverlay}>
          <BlurView intensity={25} tint="light" style={styles.contentBlur}>
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.1)',
                'rgba(255, 255, 255, 0.2)',
                'rgba(255, 255, 255, 0.3)',
              ]}
              style={styles.contentGradient}
            >
              <View style={styles.content}>
                {/* Items preview */}
                <View style={styles.itemsPreview}>
                  {recommendation.items.slice(0, 4).map((item, index) => (
                    <View key={item.id} style={styles.itemDot}>
                      {item.imageUri || item.processedImageUri ? (
                        <Image
                          source={{ uri: item.imageUri || item.processedImageUri }}
                          style={styles.itemDotImage}
                          onError={() => console.log('Item dot image failed:', item.id)}
                        />
                      ) : (
                        <View style={styles.itemDotFallback}>
                          <Ionicons 
                            name="shirt-outline" 
                            size={12} 
                            color={APP_THEME_V2.colors.inkGray[500]} 
                          />
                        </View>
                      )}
                    </View>
                  ))}
                  {recommendation.items.length > 4 && (
                    <View style={[styles.itemDot, styles.moreItemsDot]}>
                      <Text style={styles.moreItemsText}>
                        +{recommendation.items.length - 4}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Reasoning preview */}
                {recommendation.reasoning.length > 0 && (
                  <Text style={styles.reasoningText}>
                    {recommendation.reasoning[0]}
                  </Text>
                )}

                {/* Quick actions */}
                <View style={styles.quickActions}>
                  {recommendation.quickActions.slice(0, 3).map((action) => (
                    <TouchableOpacity
                      key={action.type}
                      style={styles.quickActionButton}
                      onPress={() => handleQuickActionPress(action.type)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={action.label}
                    >
                      <Ionicons 
                        name={action.icon as any} 
                        size={16} 
                        color={APP_THEME_V2.colors.inkGray[600]} 
                      />
                      <Text style={styles.quickActionText}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Dynamic styles based on responsive dimensions
const createStyles = (dimensions: { 
  cardWidth: number; 
  cardHeight: number; 
  isTablet: boolean; 
  isLandscape: boolean; 
}) => StyleSheet.create({
  cardContainer: {
    width: dimensions.cardWidth,
    height: dimensions.cardHeight,
    alignSelf: 'center',
  },
  glowContainer: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: APP_THEME_V2.radius.organic + 8,
  },
  glow: {
    flex: 1,
    borderRadius: APP_THEME_V2.radius.organic + 8,
  },
  card: {
    flex: 1,
    borderRadius: APP_THEME_V2.radius.organic,
    overflow: 'hidden',
    ...APP_THEME_V2.elevation.float,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.colors.inkGray[500],
    marginTop: APP_THEME_V2.spacing.sm,
    fontSize: dimensions.isTablet ? 14 : 12,
  },
  quickBadgeContainer: {
    position: 'absolute',
    top: APP_THEME_V2.spacing.lg,
    left: APP_THEME_V2.spacing.lg,
  },
  quickBadgeBlur: {
    borderRadius: APP_THEME_V2.radius.liquid,
    overflow: 'hidden',
  },
  quickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: APP_THEME_V2.spacing.md,
    paddingVertical: APP_THEME_V2.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: APP_THEME_V2.spacing.xs,
  },
  quickBadgeText: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.colors.liquidGold[700],
    fontSize: dimensions.isTablet ? 11 : 10,
    fontWeight: '600',
  },
  confidenceContainer: {
    position: 'absolute',
    top: APP_THEME_V2.spacing.lg,
    right: APP_THEME_V2.spacing.lg,
  },
  confidenceBlur: {
    borderRadius: APP_THEME_V2.radius.organic,
    overflow: 'hidden',
  },
  confidenceIndicator: {
    padding: APP_THEME_V2.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    minWidth: 60,
  },
  confidenceBar: {
    width: 40,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: APP_THEME_V2.radius.xs,
    overflow: 'hidden',
    marginBottom: APP_THEME_V2.spacing.xs,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: APP_THEME_V2.radius.xs,
  },
  confidenceText: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.colors.inkGray[700],
    fontSize: dimensions.isTablet ? 10 : 9,
    fontWeight: '600',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  contentBlur: {
    flex: 1,
  },
  contentGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    padding: dimensions.isTablet ? APP_THEME_V2.spacing.xl : APP_THEME_V2.spacing.lg,
  },
  itemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: APP_THEME_V2.spacing.md,
    gap: APP_THEME_V2.spacing.xs,
  },
  itemDot: {
    width: dimensions.isTablet ? 24 : 20,
    height: dimensions.isTablet ? 24 : 20,
    borderRadius: dimensions.isTablet ? 12 : 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  itemDotImage: {
    width: '100%',
    height: '100%',
  },
  itemDotFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  moreItemsDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.colors.inkGray[600],
    fontSize: dimensions.isTablet ? 9 : 8,
    fontWeight: '600',
  },
  reasoningText: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.colors.inkGray[700],
    marginBottom: APP_THEME_V2.spacing.md,
    fontSize: dimensions.isTablet ? 14 : 13,
    lineHeight: dimensions.isTablet ? 20 : 18,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: APP_THEME_V2.spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: APP_THEME_V2.spacing.sm,
    paddingHorizontal: APP_THEME_V2.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: APP_THEME_V2.radius.md,
    gap: APP_THEME_V2.spacing.xs,
  },
  quickActionText: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.colors.inkGray[700],
    fontSize: dimensions.isTablet ? 11 : 10,
    fontWeight: '500',
  },
});