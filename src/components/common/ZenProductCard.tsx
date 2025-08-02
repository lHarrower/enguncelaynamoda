import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';
import ZenCard from '@/components/common/ZenCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - (DesignSystem.spacing.xl * 3)) / 2;

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
    <ZenCard
      onPress={onPress}
      style={styles.card}
      variant="elevated"
    >
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
            <Ionicons 
              name="image-outline" 
              size={32} 
              color={APP_THEME_V2.colors.moonlightSilver} 
            />
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
          >
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={20}
                color={isLiked ? APP_THEME_V2.semantic.accent : APP_THEME_V2.colors.whisperWhite}
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
        <Text style={styles.price}>
          {product.price}
        </Text>
      </View>
    </ZenCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    padding: 0,
    marginBottom: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    height: CARD_WIDTH * 1.3,
    backgroundColor: DesignSystem.colors.sage[100],
    borderTopLeftRadius: DesignSystem.borderRadius.lg,
    borderTopRightRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignSystem.colors.sage[100],
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DesignSystem.colors.sage[100],
  },
  shimmer: {
    flex: 1,
    backgroundColor: DesignSystem.colors.sage[50],
    opacity: 0.6,
  },
  likeButton: {
    position: 'absolute',
    top: DesignSystem.spacing.sm,
    right: DesignSystem.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignSystem.elevation.soft,
  },
  content: {
    padding: DesignSystem.spacing.md,
  },
  brand: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: DesignSystem.spacing.xs,
  },
  name: {
    ...DesignSystem.typography.scale.body2,
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fonts.body,
    lineHeight: 18,
    marginBottom: DesignSystem.spacing.xs,
  },
  price: {
    ...DesignSystem.typography.scale.body2,
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fonts.body,
    fontWeight: '600',
  },
});