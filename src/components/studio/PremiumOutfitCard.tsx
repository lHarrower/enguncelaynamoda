// Premium Outfit Card - Beautiful 2D Cards Like Designer Printed Cards
// Clean, elegant, instantly understandable with perfect typography

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const { width } = Dimensions.get('window');

interface OutfitData {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  confidence: number;
  tags?: string[];
  mood?: string;
  season?: string;
}

interface PremiumOutfitCardProps {
  outfit: OutfitData;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
  style?: any;
}

const PremiumOutfitCard: React.FC<PremiumOutfitCardProps> = ({
  outfit,
  size = 'medium',
  onPress,
  onLike,
  isLiked = false,
  style,
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const likeScale = useSharedValue(1);

  const getCardDimensions = () => {
    const spacing = DesignSystem.spacing.xl;
    const availableWidth = width - spacing * 2;

    switch (size) {
      case 'small':
        return { width: availableWidth * 0.45, height: 200 };
      case 'medium':
        return { width: availableWidth * 0.48, height: 240 };
      case 'large':
        return { width: availableWidth, height: 280 };
      default:
        return { width: availableWidth * 0.48, height: 240 };
    }
  };

  const dimensions = getCardDimensions();

  // Handle press animation
  const handlePressIn = () => {
    scale.value = withSpring(0.98, DesignSystem.animations.spring.smooth);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, DesignSystem.animations.spring.gentle);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    likeScale.value = withSpring(1.2, { damping: 10, stiffness: 400 }, () => {
      likeScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });
    onLike?.();
  };

  // Animated styles
  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const likeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: likeScale.value }],
    };
  });

  return (
    <Animated.View style={[cardStyle, style]}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: DesignSystem.colors.background.elevated,
            ...DesignSystem.elevation.medium,
            width: dimensions.width,
            height: dimensions.height,
          },
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`${outfit.title} outfit with ${outfit.confidence}% style match`}
        accessibilityHint="Tap to view outfit details"
      >
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: outfit.image }} style={styles.outfitImage} resizeMode="cover" />

          {/* Like Button */}
          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLike}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityHint={
              isLiked
                ? 'Tap to remove this outfit from your favorites'
                : 'Tap to add this outfit to your favorites'
            }
            accessibilityState={{ selected: isLiked }}
          >
            <Animated.View style={likeStyle}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={
                  isLiked ? DesignSystem.colors.error[500] : DesignSystem.colors.text.secondary
                }
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Confidence Badge */}
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{outfit.confidence}%</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <View style={styles.titleSection}>
            <Text style={styles.outfitTitle} numberOfLines={1}>
              {outfit.title}
            </Text>
            {outfit.subtitle && (
              <Text style={styles.outfitSubtitle} numberOfLines={1}>
                {outfit.subtitle}
              </Text>
            )}
          </View>

          {/* Tags */}
          {outfit.tags && outfit.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {outfit.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Confidence Bar */}
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceBar}>
              <LinearGradient
                colors={[DesignSystem.colors.sage[500], DesignSystem.colors.amber[500]]}
                style={[styles.confidenceFill, { width: `${outfit.confidence}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.confidenceLabel}>Style Match</Text>
          </View>

          {/* Mood & Season */}
          {(outfit.mood || outfit.season) && (
            <View style={styles.metaContainer}>
              {outfit.mood && (
                <View style={styles.metaItem}>
                  <Ionicons
                    name="happy-outline"
                    size={14}
                    color={DesignSystem.colors.text.tertiary}
                  />
                  <Text style={styles.metaText}>{outfit.mood}</Text>
                </View>
              )}
              {outfit.season && (
                <View style={styles.metaItem}>
                  <Ionicons
                    name="leaf-outline"
                    size={14}
                    color={DesignSystem.colors.text.tertiary}
                  />
                  <Text style={styles.metaText}>{outfit.season}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
  },

  // Image Section
  imageContainer: {
    height: '60%',
    position: 'relative',
  },
  outfitImage: {
    height: '100%',
    width: '100%',
  },
  likeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    ...DesignSystem.elevation.soft,
  },
  confidenceBadge: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    top: 12,
    ...DesignSystem.elevation.soft,
  },
  confidenceText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontSize: 11,
    fontWeight: '600',
  },

  // Content Section
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.md,
  },
  titleSection: {
    marginBottom: 8,
  },
  outfitTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    marginBottom: 2,
  },
  outfitSubtitle: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: DesignSystem.colors.sage[100],
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.sage[600],
    fontSize: 10,
  },

  // Confidence Bar
  confidenceContainer: {
    marginBottom: 8,
  },
  confidenceBar: {
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderRadius: 2,
    height: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    borderRadius: 2,
    height: '100%',
  },
  confidenceLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    fontSize: 10,
  },

  // Meta Information
  metaContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  metaText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    fontSize: 10,
  },
});

export default PremiumOutfitCard;
