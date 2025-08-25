import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Outfit } from '@/data/sanctuaryModels';
import { DesignSystem } from '@/theme/DesignSystem';

import { errorInDev, warnInDev } from '../../utils/consoleSuppress';

// Animation configurations for React Native Reanimated
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

const LIQUID_SPRING_CONFIG = {
  damping: 12,
  stiffness: 120,
  mass: 1,
};

interface AynaOutfitCardV2Props {
  outfit: Outfit;
  onPress: () => void;
  onFavorite?: () => void;
  showFavoriteButton?: boolean;
}

export const AynaOutfitCardV2: React.FC<AynaOutfitCardV2Props> = React.memo(
  ({ outfit, onPress, onFavorite, showFavoriteButton = true }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const pressScale = useSharedValue(1);
    const imageOpacity = useSharedValue(0);
    const overlayOpacity = useSharedValue(0);

    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    // Responsive dimensions with breakpoints
    const dimensions = useMemo(() => {
      const isTablet = screenWidth > 768;
      const isLandscape = screenWidth > screenHeight;

      // Adaptive card width with maximum constraints
      const maxCardWidth = isTablet ? 400 : 350;
      const cardWidth = Math.min(screenWidth - DesignSystem.spacing.xl * 2, maxCardWidth);

      // Adaptive aspect ratio for different devices
      const aspectRatio = isTablet ? (isLandscape ? 1.1 : 1.2) : 1.3;
      const cardHeight = cardWidth * aspectRatio;

      return {
        cardWidth,
        cardHeight,
        isTablet,
        isLandscape,
      };
    }, [screenWidth, screenHeight]);

    const mainImage = outfit.items[0]?.imageUrl;

    // Memoized styles for performance
    const styles = useMemo(() => createStyles(dimensions), [dimensions]);

    // Animation for card press
    const animatedCardStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pressScale.value }],
    }));

    // Animation for image fade-in
    const animatedImageStyle = useAnimatedStyle(() => ({
      opacity: imageOpacity.value,
    }));

    // Animation for overlay fade-in
    const animatedOverlayStyle = useAnimatedStyle(() => ({
      opacity: overlayOpacity.value,
    }));

    const handlePressIn = () => {
      pressScale.value = withSpring(0.98, SPRING_CONFIG);
    };

    const handlePressOut = () => {
      pressScale.value = withSpring(1, SPRING_CONFIG);
    };

    const handleImageLoad = () => {
      setImageLoaded(true);
      setImageError(false);
      imageOpacity.value = withTiming(1, { duration: 800 });
      overlayOpacity.value = withTiming(1, { duration: 1000 });
    };

    const handleImageError = () => {
      setImageError(true);
      setImageLoaded(false);
      // Still show overlay for fallback state
      overlayOpacity.value = withTiming(1, { duration: 500 });
    };

    const handlePress = () => {
      try {
        pressScale.value = withSpring(0.95, LIQUID_SPRING_CONFIG);
        setTimeout(() => {
          pressScale.value = withSpring(1, LIQUID_SPRING_CONFIG);
        }, 150);
        onPress();
      } catch (error) {
        errorInDev('Error in outfit card press:', error instanceof Error ? error : String(error));
      }
    };

    const handleFavoritePress = () => {
      try {
        onFavorite?.();
      } catch (error) {
        errorInDev('Error in favorite press:', error instanceof Error ? error : String(error));
      }
    };

    return (
      <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
        <TouchableOpacity
          style={styles.card}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Outfit: ${outfit.name}`}
          accessibilityHint={`Double tap to view details for ${outfit.name} outfit`}
        >
          {/* Base Layer - Subtle gradient background */}
          <LinearGradient
            colors={[
              DesignSystem.colors.sage[50],
              DesignSystem.colors.sage[100],
              DesignSystem.colors.sage[200],
            ]}
            style={styles.backgroundGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* Image Layer */}
          <View style={styles.imageContainer}>
            {!imageError && mainImage ? (
              <Animated.View style={[styles.imageWrapper, animatedImageStyle]}>
                <Image
                  source={{ uri: mainImage }}
                  style={styles.mainImage}
                  resizeMode="cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  accessible={true}
                  accessibilityLabel={`Main image for ${outfit.name} outfit`}
                />
              </Animated.View>
            ) : (
              // Elegant Fallback UI
              <View style={styles.imageFallback}>
                <LinearGradient
                  colors={[DesignSystem.colors.sage[200], DesignSystem.colors.sage[100]]}
                  style={styles.fallbackGradient}
                >
                  <View style={styles.fallbackIconContainer}>
                    <Ionicons
                      name="shirt-outline"
                      size={dimensions.isTablet ? 64 : 48}
                      color={DesignSystem.colors.sage[400]}
                    />
                    <Text style={styles.fallbackText}>{outfit.items.length} parça</Text>
                  </View>
                </LinearGradient>
              </View>
            )}

            {/* Favorite Button - Floating with glassmorphism */}
            {showFavoriteButton && (
              <View style={styles.favoriteContainer}>
                <BlurView intensity={20} tint="light" style={styles.favoriteBlur}>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={handleFavoritePress}
                    activeOpacity={0.8}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={
                      outfit.isFavorite ? 'Remove from favorites' : 'Add to favorites'
                    }
                    accessibilityHint="Double tap to toggle favorite status"
                  >
                    <Ionicons
                      name={outfit.isFavorite ? 'heart' : 'heart-outline'}
                      size={dimensions.isTablet ? 24 : 20}
                      color={
                        outfit.isFavorite
                          ? DesignSystem.colors.gold[500]
                          : DesignSystem.colors.sage[600]
                      }
                    />
                  </TouchableOpacity>
                </BlurView>
              </View>
            )}

            {/* Mood Tag - Organic pill with glassmorphism */}
            <Animated.View style={[styles.moodTagContainer, animatedOverlayStyle]}>
              <BlurView intensity={15} tint="light" style={styles.moodTagBlur}>
                <View style={styles.moodTag}>
                  <Text style={styles.moodTagText}>{outfit.moodTag}</Text>
                </View>
              </BlurView>
            </Animated.View>
          </View>

          {/* Whisper Overlay - Frosted glass with poetic text */}
          <Animated.View style={[styles.whisperOverlay, animatedOverlayStyle]}>
            <BlurView intensity={25} tint="light" style={styles.whisperBlur}>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.1)',
                  'rgba(255, 255, 255, 0.2)',
                  'rgba(255, 255, 255, 0.3)',
                ]}
                style={styles.whisperGradient}
              >
                <View style={styles.whisperContent}>
                  <Text style={styles.outfitName}>{outfit.name}</Text>
                  <Text style={styles.whisperText}>{`"${outfit.whisper}"`}</Text>

                  {/* Items Preview - Subtle circles */}
                  <View style={styles.itemsPreview}>
                    {outfit.items.slice(0, 4).map((item, index) => (
                      <View key={item.id} style={styles.itemDot}>
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={styles.itemDotImage}
                          onError={() => {
                            // Silent fallback for item dots
                            warnInDev('Item dot image failed to load:', item.id);
                          }}
                        />
                      </View>
                    ))}
                    {outfit.items.length > 4 && (
                      <View style={[styles.itemDot, styles.moreItemsDot]}>
                        <Text style={styles.moreItemsText}>+{outfit.items.length - 4}</Text>
                      </View>
                    )}
                  </View>

                  {/* Confidence Indicator - Zen-like visualization */}
                  <View style={styles.confidenceContainer}>
                    <View style={styles.confidenceBar}>
                      <LinearGradient
                        colors={[DesignSystem.colors.sage[300], DesignSystem.colors.gold[400]]}
                        style={[
                          styles.confidenceFill,
                          {
                            width: `${Math.min(100, Math.max(0, (outfit.confidenceScore / 10) * 100))}%`,
                          },
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                    <Text style={styles.confidenceText}>
                      {Math.round(outfit.confidenceScore || 0)}/10 güven
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

// Dynamic styles based on responsive dimensions
const createStyles = (dimensions: {
  cardWidth: number;
  cardHeight: number;
  isTablet: boolean;
  isLandscape: boolean;
}) =>
  StyleSheet.create({
    backgroundGradient: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    card: {
      borderRadius: DesignSystem.radius.lg,
      flex: 1,
      overflow: 'hidden',
      ...DesignSystem.elevation.high,
    },
    cardContainer: {
      alignSelf: 'center',
      height: dimensions.cardHeight,
      marginBottom: DesignSystem.spacing.xl,
      width: dimensions.cardWidth,
    },
    confidenceBar: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: DesignSystem.radius.sm,
      flex: 1,
      height: dimensions.isTablet ? 4 : 3,
      overflow: 'hidden',
    },
    confidenceContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: DesignSystem.spacing.sm,
    },
    confidenceFill: {
      borderRadius: DesignSystem.radius.sm,
      height: '100%',
    },
    confidenceText: {
      ...DesignSystem.typography.scale.caption,
      color: DesignSystem.colors.text.secondary,
      fontSize: dimensions.isTablet ? 11 : 10,
    },
    fallbackGradient: {
      alignItems: 'center',
      height: '100%',
      justifyContent: 'center',
      width: '100%',
    },
    fallbackIconContainer: {
      alignItems: 'center',
      opacity: 0.6,
    },
    fallbackText: {
      ...DesignSystem.typography.scale.caption,
      color: DesignSystem.colors.text.secondary,
      fontSize: dimensions.isTablet ? 14 : 12,
      marginTop: DesignSystem.spacing.sm,
    },
    favoriteBlur: {
      borderRadius: DesignSystem.radius.full,
      overflow: 'hidden',
    },
    favoriteButton: {
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      height: dimensions.isTablet ? 52 : 44,
      justifyContent: 'center',
      width: dimensions.isTablet ? 52 : 44,
    },
    favoriteContainer: {
      position: 'absolute',
      right: dimensions.isTablet ? DesignSystem.spacing.xl : DesignSystem.spacing.lg,
      top: dimensions.isTablet ? DesignSystem.spacing.xl : DesignSystem.spacing.lg,
    },
    imageContainer: {
      flex: 1,
      position: 'relative',
    },
    imageFallback: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    imageWrapper: {
      flex: 1,
    },
    itemDot: {
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: dimensions.isTablet ? 14 : 12,
      borderWidth: 1,
      height: dimensions.isTablet ? 28 : 24,
      overflow: 'hidden',
      width: dimensions.isTablet ? 28 : 24,
    },
    itemDotImage: {
      height: '100%',
      width: '100%',
    },
    itemsPreview: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: DesignSystem.spacing.xs,
      marginBottom: DesignSystem.spacing.md,
    },
    mainImage: {
      height: '100%',
      width: '100%',
    },
    moodTag: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      paddingHorizontal: dimensions.isTablet ? DesignSystem.spacing.lg : DesignSystem.spacing.md,
      paddingVertical: dimensions.isTablet ? DesignSystem.spacing.md : DesignSystem.spacing.sm,
    },
    moodTagBlur: {
      borderRadius: DesignSystem.radius.lg,
      overflow: 'hidden',
    },
    moodTagContainer: {
      left: dimensions.isTablet ? DesignSystem.spacing.xl : DesignSystem.spacing.lg,
      position: 'absolute',
      top: dimensions.isTablet ? DesignSystem.spacing.xl : DesignSystem.spacing.lg,
    },
    moodTagText: {
      ...DesignSystem.typography.scale.caption,
      color: DesignSystem.colors.text.primary,
      fontSize: dimensions.isTablet ? 13 : 12,
      textTransform: 'uppercase',
    },
    moreItemsDot: {
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
    },
    moreItemsText: {
      ...DesignSystem.typography.scale.caption,
      color: DesignSystem.colors.text.secondary,
      fontSize: dimensions.isTablet ? 10 : 9,
    },
    outfitName: {
      ...DesignSystem.typography.heading.h3,
      color: DesignSystem.colors.text.primary,
      fontSize: dimensions.isTablet ? 22 : 20,
      marginBottom: DesignSystem.spacing.sm,
    },
    whisperBlur: {
      flex: 1,
    },
    whisperContent: {
      padding: dimensions.isTablet ? DesignSystem.spacing.xxl : DesignSystem.spacing.xl,
      paddingBottom: dimensions.isTablet ? DesignSystem.spacing.xxxl : DesignSystem.spacing.xxl,
    },
    whisperGradient: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    whisperOverlay: {
      bottom: 0,
      height: dimensions.isLandscape ? '50%' : '45%',
      left: 0,
      position: 'absolute',
      right: 0,
    },
    whisperText: {
      ...DesignSystem.typography.scale.caption,
      color: DesignSystem.colors.text.primary,
      fontSize: dimensions.isTablet ? 16 : 15,
      lineHeight: dimensions.isTablet ? 26 : 24,
      marginBottom: DesignSystem.spacing.lg,
    },
  });
