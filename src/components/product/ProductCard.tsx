/**
 * Unified Product Card Component
 *
 * A comprehensive product card system that supports multiple variants:
 * - Standard product cards for general use
 * - Premium product cards for luxury items
 * - Compact cards for grid layouts
 * - Featured cards for highlights
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

const { width } = Dimensions.get('window');

export interface ProductCardData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  brand: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  category: string;
  tags?: string[];
  colors?: string[];
  isLiked?: boolean;
  isNew?: boolean;
  discount?: number;
  rating?: number;
  reviewCount?: number;
}

export interface ProductCardProps {
  /** Product data to display */
  product: ProductCardData;

  /** Card variant */
  variant?: 'standard' | 'premium' | 'compact' | 'featured';

  /** Card size */
  size?: 'small' | 'medium' | 'large';

  /** Whether to show like button */
  showLikeButton?: boolean;

  /** Whether to show price */
  showPrice?: boolean;

  /** Whether to show brand */
  showBrand?: boolean;

  /** Whether to show category badge */
  showCategory?: boolean;

  /** Whether to show discount badge */
  showDiscount?: boolean;

  /** Callback when card is pressed */
  onPress?: (product: ProductCardData) => void;

  /** Callback when like button is pressed */
  onLike?: (product: ProductCardData) => void;

  /** Custom style */
  style?: any;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'standard',
  size = 'medium',
  showLikeButton = true,
  showPrice = true,
  showBrand = true,
  showCategory = true,
  showDiscount = true,
  onPress,
  onLike,
  style,
}) => {
  const cardWidth = getCardWidth(size, variant);
  const cardHeight = getCardHeight(size, variant);

  const handlePress = () => {
    onPress?.(product);
  };

  const handleLike = () => {
    onLike?.(product);
  };

  const renderStandardCard = () => (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { width: cardWidth, height: cardHeight },
        variant === 'premium' && styles.premiumCard,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`${product.brand} ${product.title}, ${product.price}`}
      accessibilityHint="Tap to view product details"
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={`${product.title} product image`}
        />

        {/* Overlay Gradient */}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.3)']} style={styles.imageOverlay} />

        {/* Like Button */}
        {showLikeButton && (
          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLike}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={product.isLiked ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityHint={
              product.isLiked
                ? 'Tap to remove this product from your favorites'
                : 'Tap to add this product to your favorites'
            }
            accessibilityState={{ selected: product.isLiked }}
          >
            <View style={styles.likeButtonBackground}>
              <Ionicons
                name={product.isLiked ? 'heart' : 'heart-outline'}
                size={18}
                color={product.isLiked ? '#FF6B6B' : '#666'}
              />
            </View>
          </TouchableOpacity>
        )}

        {/* Category Badge */}
        {showCategory && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{(product.category || '').toUpperCase()}</Text>
          </View>
        )}

        {/* New Badge */}
        {product.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>YENİ</Text>
          </View>
        )}

        {/* Discount Badge */}
        {showDiscount && product.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>%{product.discount}</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        {showBrand && <Text style={styles.brandName}>{product.brand}</Text>}

        <Text style={styles.productName} numberOfLines={2}>
          {product.title}
        </Text>

        {product.subtitle && (
          <Text style={styles.productSubtitle} numberOfLines={1}>
            {product.subtitle}
          </Text>
        )}

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <View style={styles.colorsContainer}>
            {product.colors.slice(0, 4).map((color, index) => (
              <View
                key={index}
                style={[styles.colorDot, { backgroundColor: color.toLowerCase() }]}
              />
            ))}
            {product.colors.length > 4 && (
              <Text style={styles.moreColors}>+{product.colors.length - 4}</Text>
            )}
          </View>
        )}

        {/* Price */}
        {showPrice && (
          <View style={styles.priceContainer}>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>{product.originalPrice}</Text>
            )}
            <Text style={styles.currentPrice}>{product.price}</Text>
          </View>
        )}

        {/* Rating */}
        {product.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            {product.reviewCount && <Text style={styles.reviewCount}>({product.reviewCount})</Text>}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPremiumCard = () => (
    <TouchableOpacity
      style={[styles.premiumCardContainer, { width: cardWidth, height: cardHeight }, style]}
      onPress={handlePress}
      activeOpacity={0.95}
      accessibilityRole="button"
      accessibilityLabel={`Premium ${product.brand} ${product.title}, ${product.price}`}
      accessibilityHint="Tap to view premium product details"
    >
      <ImageBackground
        source={{ uri: product.imageUrl }}
        style={styles.premiumImageBackground}
        resizeMode="cover"
        accessibilityRole="image"
        accessibilityLabel={`${product.title} premium product image`}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.premiumOverlay}
        >
          {/* Top Section */}
          <View style={styles.premiumTopSection}>
            {showLikeButton && (
              <TouchableOpacity
                style={styles.premiumLikeButton}
                onPress={handleLike}
                accessibilityRole="button"
                accessibilityLabel={product.isLiked ? 'Remove from favorites' : 'Add to favorites'}
                accessibilityHint={
                  product.isLiked
                    ? 'Tap to remove this premium product from your favorites'
                    : 'Tap to add this premium product to your favorites'
                }
                accessibilityState={{ selected: product.isLiked }}
              >
                <BlurView intensity={20} style={styles.likeBlurBackground}>
                  <Ionicons
                    name={product.isLiked ? 'heart' : 'heart-outline'}
                    size={20}
                    color={product.isLiked ? '#FF6B6B' : '#FFFFFF'}
                  />
                </BlurView>
              </TouchableOpacity>
            )}

            {product.isNew && (
              <View style={styles.premiumNewBadge}>
                <Text style={styles.premiumNewText}>YENİ</Text>
              </View>
            )}
          </View>

          {/* Bottom Section */}
          <View style={styles.premiumBottomSection}>
            {showBrand && <Text style={styles.premiumBrandName}>{product.brand}</Text>}

            <Text style={styles.premiumProductName} numberOfLines={2}>
              {product.title}
            </Text>

            {product.subtitle && (
              <Text style={styles.premiumProductSubtitle}>{product.subtitle}</Text>
            )}

            {showPrice && (
              <View style={styles.premiumPriceContainer}>
                {product.originalPrice && (
                  <Text style={styles.premiumOriginalPrice}>{product.originalPrice}</Text>
                )}
                <Text style={styles.premiumCurrentPrice}>{product.price}</Text>
                {product.discount && (
                  <View style={styles.premiumDiscountBadge}>
                    <Text style={styles.premiumDiscountText}>%{product.discount}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderCompactCard = () => (
    <TouchableOpacity
      style={[styles.compactCardContainer, { width: cardWidth, height: cardHeight }, style]}
      onPress={handlePress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`${product.brand} ${product.title}, ${product.price}`}
      accessibilityHint="Tap to view compact product details"
    >
      <View style={styles.compactImageContainer}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.compactImage}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={`${product.title} compact product image`}
        />

        {showLikeButton && (
          <TouchableOpacity
            style={styles.compactLikeButton}
            onPress={handleLike}
            accessibilityRole="button"
            accessibilityLabel={product.isLiked ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityHint={
              product.isLiked
                ? 'Tap to remove this compact product from your favorites'
                : 'Tap to add this compact product to your favorites'
            }
            accessibilityState={{ selected: product.isLiked }}
          >
            <Ionicons
              name={product.isLiked ? 'heart' : 'heart-outline'}
              size={16}
              color={product.isLiked ? '#FF6B6B' : '#666'}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.compactInfo}>
        {showBrand && (
          <Text style={styles.compactBrand} numberOfLines={1}>
            {product.brand}
          </Text>
        )}
        <Text style={styles.compactName} numberOfLines={1}>
          {product.title}
        </Text>
        {showPrice && <Text style={styles.compactPrice}>{product.price}</Text>}
      </View>
    </TouchableOpacity>
  );

  switch (variant) {
    case 'premium':
      return renderPremiumCard();
    case 'compact':
      return renderCompactCard();
    case 'featured':
      return renderPremiumCard(); // Featured uses premium styling
    default:
      return renderStandardCard();
  }
};

// Helper functions
const getCardWidth = (size: string, variant: string) => {
  const baseWidth = width * 0.45;

  switch (size) {
    case 'small':
      return variant === 'compact' ? baseWidth * 0.8 : baseWidth * 0.9;
    case 'large':
      return variant === 'premium' ? width * 0.9 : baseWidth * 1.2;
    default:
      return baseWidth;
  }
};

const getCardHeight = (size: string, variant: string) => {
  const baseHeight = 280;

  switch (size) {
    case 'small':
      return variant === 'compact' ? 200 : baseHeight * 0.9;
    case 'large':
      return variant === 'premium' ? 400 : baseHeight * 1.2;
    default:
      return variant === 'compact' ? 220 : baseHeight;
  }
};

const styles = StyleSheet.create({
  // Standard Card Styles
  cardContainer: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    ...DesignSystem.elevation.medium,
    marginBottom: DesignSystem.spacing.md,
  },
  premiumCard: {
    ...DesignSystem.elevation.high,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  productImage: {
    height: '100%',
    width: '100%',
  },
  imageOverlay: {
    bottom: 0,
    height: '30%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  likeButton: {
    position: 'absolute',
    right: DesignSystem.spacing.sm,
    top: DesignSystem.spacing.sm,
    zIndex: 2,
  },
  likeButtonBackground: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
    ...DesignSystem.elevation.soft,
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
    fontWeight: '600',
  },
  newBadge: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: DesignSystem.borderRadius.sm,
    left: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    position: 'absolute',
    top: DesignSystem.spacing.sm + 30,
  },
  newText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontSize: 9,
    fontWeight: '700',
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: DesignSystem.borderRadius.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    position: 'absolute',
    right: DesignSystem.spacing.sm + 40,
    top: DesignSystem.spacing.sm,
  },
  discountText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontSize: 10,
    fontWeight: '700',
  },
  productInfo: {
    padding: DesignSystem.spacing.md,
  },
  brandName: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.gold[600],
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.xs,
    textTransform: 'uppercase',
  },
  productName: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: DesignSystem.spacing.xs,
  },
  productSubtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: DesignSystem.spacing.sm,
  },
  colorsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: DesignSystem.spacing.sm,
  },
  colorDot: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    height: 12,
    width: 12,
  },
  moreColors: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    fontSize: 10,
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: DesignSystem.spacing.xs,
  },
  originalPrice: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginRight: DesignSystem.spacing.sm,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.sage[600],
    fontWeight: '700',
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  ratingText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  reviewCount: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
  },

  // Premium Card Styles
  premiumCardContainer: {
    borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
    ...DesignSystem.elevation.high,
    marginBottom: DesignSystem.spacing.lg,
  },
  premiumImageBackground: {
    height: '100%',
    width: '100%',
  },
  premiumOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.lg,
  },
  premiumTopSection: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  premiumLikeButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  likeBlurBackground: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  premiumNewBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  premiumNewText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.sage[600],
    fontSize: 11,
    fontWeight: '700',
  },
  premiumBottomSection: {
    alignItems: 'flex-start',
  },
  premiumBrandName: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.xs,
    opacity: 0.9,
    textTransform: 'uppercase',
  },
  premiumProductName: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.inverse,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: DesignSystem.spacing.xs,
  },
  premiumProductSubtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.inverse,
    fontStyle: 'italic',
    marginBottom: DesignSystem.spacing.md,
    opacity: 0.9,
  },
  premiumPriceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  premiumOriginalPrice: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.inverse,
    opacity: 0.7,
    textDecorationLine: 'line-through',
  },
  premiumCurrentPrice: {
    ...DesignSystem.typography.heading.h4,
    color: DesignSystem.colors.text.inverse,
    fontWeight: '700',
  },
  premiumDiscountBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: DesignSystem.borderRadius.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  premiumDiscountText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontSize: 10,
    fontWeight: '700',
  },

  // Compact Card Styles
  compactCardContainer: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.md,
    overflow: 'hidden',
    ...DesignSystem.elevation.soft,
  },
  compactImageContainer: {
    flex: 1,
    position: 'relative',
  },
  compactImage: {
    height: '100%',
    width: '100%',
  },
  compactLikeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
    position: 'absolute',
    right: DesignSystem.spacing.xs,
    top: DesignSystem.spacing.xs,
  },
  compactInfo: {
    padding: DesignSystem.spacing.sm,
  },
  compactBrand: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    fontSize: 10,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  compactName: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  compactPrice: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.sage[600],
    fontWeight: '700',
  },
});

export default ProductCard;
export { ProductCard };
