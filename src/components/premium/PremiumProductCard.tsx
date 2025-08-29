import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  Image,
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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import PremiumCard from '@/components/premium/PremiumCard';
import { DesignSystem } from '@/theme/DesignSystem';

const { width } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  category?: string;
  isLiked?: boolean;
  confidence?: number;
  tags?: string[];
}

interface PremiumProductCardProps {
  product: Product;
  onPress: () => void;
  onLike?: () => void;
  variant?: 'default' | 'featured' | 'compact';
  style?: ViewStyle;
}

const PremiumProductCard: React.FC<PremiumProductCardProps> = ({
  product,
  onPress,
  onLike,
  variant = 'default',
  style,
}) => {
  const scale = useSharedValue(1);
  const likeScale = useSharedValue(1);
  const confidenceOpacity = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, DesignSystem.animations.spring.confident);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, DesignSystem.animations.spring.gentle);
  };

  const handleLike = () => {
    likeScale.value = withSequence(
      withSpring(1.3, DesignSystem.animations.spring.confident),
      withSpring(1, DesignSystem.animations.spring.gentle),
    );
    onLike?.();
  };

  React.useEffect(() => {
    if (product.confidence) {
      confidenceOpacity.value = withTiming(1, { duration: 800 });
    }
  }, [product.confidence, confidenceOpacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const likeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: likeScale.value }],
    };
  });

  const confidenceAnimatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      confidenceOpacity.value,
      [0, 1],
      [0, (product.confidence || 0) * 0.01 * 100],
    );

    return {
      width: `${width}%`,
      opacity: confidenceOpacity.value,
    };
  });

  const getCardDimensions = () => {
    switch (variant) {
      case 'featured':
        return { width: width * 0.8, height: 400 };
      case 'compact':
        return { width: width * 0.45, height: 280 };
      default:
        return { width: width * 0.48, height: 320 };
    }
  };

  const renderConfidenceBar = () => {
    if (!product.confidence) {
      return null;
    }

    return (
      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>Style Match</Text>
        <View style={styles.confidenceTrack}>
          <Animated.View style={[styles.confidenceBar, confidenceAnimatedStyle]} />
        </View>
        <Text style={styles.confidenceValue}>{product.confidence}%</Text>
      </View>
    );
  };

  const renderTags = () => {
    if (!product.tags || product.tags.length === 0) {
      return null;
    }

    return (
      <View style={styles.tagsContainer}>
        {product.tags.slice(0, 2).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    );
  };

  const cardDimensions = getCardDimensions();

  return (
    <AnimatedTouchableOpacity
      style={[animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.95}
    >
      <PremiumCard variant="floating" style={[styles.card, cardDimensions]} padding="sm">
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />

          {/* Image Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />

          {/* Like Button */}
          <AnimatedTouchableOpacity
            style={[styles.likeButton, likeAnimatedStyle]}
            onPress={handleLike}
          >
            <View style={styles.likeButtonBackground}>
              <Ionicons
                name={product.isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={
                  product.isLiked
                    ? DesignSystem.colors.status.error
                    : DesignSystem.colors.text.primary
                }
              />
            </View>
          </AnimatedTouchableOpacity>

          {/* Category Badge */}
          {product.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.brandName}>{product.brand}</Text>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productPrice}>{product.price}</Text>

          {renderConfidenceBar()}
          {renderTags()}
        </View>
      </PremiumCard>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  brandName: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.gold[600],
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.xs,
  },
  card: {
    overflow: 'hidden',
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: DesignSystem.borderRadius.sm,
    left: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    position: 'absolute',
    top: DesignSystem.spacing.sm,
  },
  categoryText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontSize: 10,
  },
  confidenceBar: {
    backgroundColor: DesignSystem.colors.gold[500],
    borderRadius: 1.5,
    height: '100%',
  },
  confidenceContainer: {
    marginBottom: DesignSystem.spacing.sm,
  },
  confidenceLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    fontSize: 10,
    marginBottom: DesignSystem.spacing.xs,
  },
  confidenceTrack: {
    backgroundColor: DesignSystem.colors.border.secondary,
    borderRadius: 1.5,
    height: 3,
    marginBottom: DesignSystem.spacing.xs,
    overflow: 'hidden',
  },
  confidenceValue: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.gold[600],
    fontSize: 10,
    fontWeight: '600',
  },
  imageContainer: {
    borderRadius: DesignSystem.borderRadius.lg,
    flex: 1,
    marginBottom: DesignSystem.spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  likeButton: {
    position: 'absolute',
    right: DesignSystem.spacing.sm,
    top: DesignSystem.spacing.sm,
  },
  likeButtonBackground: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
    ...DesignSystem.elevation.soft,
  },
  productImage: {
    height: '100%',
    width: '100%',
  },
  productInfo: {
    paddingHorizontal: DesignSystem.spacing.xs,
  },
  productName: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: DesignSystem.spacing.xs,
  },
  productPrice: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '700',
    marginBottom: DesignSystem.spacing.sm,
  },
  tag: {
    backgroundColor: DesignSystem.colors.surface.secondary,
    borderColor: DesignSystem.colors.border.secondary,
    borderRadius: DesignSystem.borderRadius.sm,
    borderWidth: 0.5,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  tagText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    fontSize: 9,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.xs,
  },
});

export default PremiumProductCard;
