import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import ZenCard from '@/components/common/ZenCard';
import { DesignSystem } from '@/theme/DesignSystem';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - DesignSystem.spacing.xl * 3) / 2;

interface Product {
  id: string;
  brand: string;
  name: string;
  price: string;
  image: string;
}

interface ZenProductCardProps {
  product: Product;
  onPress: () => void;
  onLike?: () => void;
  isLiked?: boolean;
  showLikeButton?: boolean;
}

export default function ZenProductCard({
  product,
  onPress,
  onLike,
  isLiked = false,
  showLikeButton = false,
}: ZenProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <ZenCard onPress={onPress} style={styles.card} variant="elevated">
      <View style={styles.imageContainer}>
        {!imageError ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            onLoad={handleImageLoad}
            onError={handleImageError}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={DesignSystem.colors.neutral[300]} />
          </View>
        )}

        {!imageLoaded && !imageError && (
          <View style={styles.imageLoader}>
            <View style={styles.shimmer} />
          </View>
        )}

        {showLikeButton && (
          <TouchableOpacity
            style={styles.likeButton}
            onPress={onLike}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isLiked ? 'Unlike product' : 'Like product'}
            accessibilityHint={`Tap to ${isLiked ? 'remove from' : 'add to'} favorites`}
            accessibilityState={{ selected: isLiked }}
          >
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={isLiked ? DesignSystem.colors.sage[500] : DesignSystem.colors.text.inverse}
              />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>{product.price}</Text>
      </View>
    </ZenCard>
  );
}

const styles = StyleSheet.create({
  brand: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    letterSpacing: 0.8,
    marginBottom: DesignSystem.spacing.xs,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.lg,
    marginBottom: DesignSystem.spacing.md,
    overflow: 'hidden',
    padding: 0,
    width: CARD_WIDTH,
  },
  content: {
    padding: DesignSystem.spacing.md,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageContainer: {
    backgroundColor: DesignSystem.colors.sage[100],
    borderTopLeftRadius: DesignSystem.borderRadius.lg,
    borderTopRightRadius: DesignSystem.borderRadius.lg,
    height: CARD_WIDTH * 1.3,
    overflow: 'hidden',
    position: 'relative',
  },
  imageLoader: {
    backgroundColor: DesignSystem.colors.sage[100],
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.sage[100],
    flex: 1,
    justifyContent: 'center',
  },
  likeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: DesignSystem.spacing.sm,
    top: DesignSystem.spacing.sm,
    width: 32,
    ...DesignSystem.elevation.soft,
  },
  name: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    lineHeight: 18,
    marginBottom: DesignSystem.spacing.xs,
  },
  price: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontWeight: '600',
  },
  shimmer: {
    backgroundColor: DesignSystem.colors.sage[50],
    flex: 1,
    opacity: 0.6,
  },
});
