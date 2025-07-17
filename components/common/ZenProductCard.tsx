import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';
import ZenCard from './ZenCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - (APP_THEME_V2.spacing.xl * 3)) / 2;

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
    marginBottom: APP_THEME_V2.spacing.md,
    backgroundColor: APP_THEME_V2.semantic.surface,
    borderRadius: APP_THEME_V2.radius.organic,
    overflow: 'hidden',
  },
  imageContainer: {
    height: CARD_WIDTH * 1.3,
    backgroundColor: APP_THEME_V2.colors.cloudGray,
    borderTopLeftRadius: APP_THEME_V2.radius.organic,
    borderTopRightRadius: APP_THEME_V2.radius.organic,
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
    backgroundColor: APP_THEME_V2.colors.cloudGray,
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: APP_THEME_V2.colors.cloudGray,
  },
  shimmer: {
    flex: 1,
    backgroundColor: APP_THEME_V2.colors.linen.light,
    opacity: 0.6,
  },
  likeButton: {
    position: 'absolute',
    top: APP_THEME_V2.spacing.sm,
    right: APP_THEME_V2.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    ...APP_THEME_V2.elevation.whisper,
  },
  content: {
    padding: APP_THEME_V2.spacing.md,
  },
  brand: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.semantic.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: APP_THEME_V2.spacing.xs,
  },
  name: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.primary,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    lineHeight: 18,
    marginBottom: APP_THEME_V2.spacing.xs,
  },
  price: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.primary,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    fontWeight: '600',
  },
});