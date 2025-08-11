import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import PremiumCard from '@/components/premium/PremiumCard';

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
  style?: any;
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
      withSpring(1, DesignSystem.animations.spring.gentle)
    );
    onLike?.();
  };

  React.useEffect(() => {
    if (product.confidence) {
      confidenceOpacity.value = withTiming(1, { duration: 800 });
    }
  }, [product.confidence]);

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
      [0, (product.confidence || 0) * 0.01 * 100]
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
    if (!product.confidence) return null;

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
    if (!product.tags || product.tags.length === 0) return null;

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
      <PremiumCard
        variant="floating"
        style={[styles.card, cardDimensions]}
        padding="sm"
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          
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
                color={product.isLiked ? DesignSystem.colors.status.error : DesignSystem.colors.text.primary}
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
  card: {
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: DesignSystem.spacing.md,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  likeButton: {
    position: 'absolute',
    top: DesignSystem.spacing.sm,
    right: DesignSystem.spacing.sm,
  },
  likeButtonBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignSystem.elevation.soft,
  },
  categoryBadge: {
    position: 'absolute',
    top: DesignSystem.spacing.sm,
    left: DesignSystem.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.sm,
  },
  categoryText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontSize: 10,
  },
  productInfo: {
    paddingHorizontal: DesignSystem.spacing.xs,
  },
  brandName: {
    ...DesignSystem.typography.scale.caption,
  color: DesignSystem.colors.gold[600],
    marginBottom: DesignSystem.spacing.xs,
    fontWeight: '600',
  },
  productName: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '500',
    marginBottom: DesignSystem.spacing.xs,
    lineHeight: 20,
  },
  productPrice: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '700',
    marginBottom: DesignSystem.spacing.sm,
  },
  confidenceContainer: {
    marginBottom: DesignSystem.spacing.sm,
  },
  confidenceLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.xs,
    fontSize: 10,
  },
  confidenceTrack: {
    height: 3,
    backgroundColor: DesignSystem.colors.border.secondary,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing.xs,
  },
  confidenceBar: {
    height: '100%',
    backgroundColor: DesignSystem.colors.gold[500],
    borderRadius: 1.5,
  },
  confidenceValue: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.gold[600],
    fontSize: 10,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.xs,
  },
  tag: {
    backgroundColor: DesignSystem.colors.surface.secondary,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.sm,
    borderWidth: 0.5,
    borderColor: DesignSystem.colors.border.secondary,
  },
  tagText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    fontSize: 9,
  },
});

export default PremiumProductCard;