/**
 * Premium Brand Card Component
 *
 * Implements ARUOM, FIRED, and AYNAMODA premium brand cards
 * with sophisticated design and luxury aesthetics
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

const { width } = Dimensions.get('window');

export type BrandType = 'ARUOM' | 'FIRED' | 'AYNAMODA';

export interface PremiumBrandCardData {
  id: string;
  title: string;
  subtitle?: string;
  brand: BrandType;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  category: string;
  tags?: string[];
  isLiked?: boolean;
  isNew?: boolean;
  discount?: number;
}

interface PremiumBrandCardProps {
  item: PremiumBrandCardData;
  onPress?: () => void;
  onLongPress?: () => void;
  onLikeToggle?: () => void;
  variant?: 'standard' | 'featured' | 'compact';
  showBrandBadge?: boolean;
}

const PremiumBrandCard: React.FC<PremiumBrandCardProps> = ({
  item,
  onPress,
  onLikeToggle,
  variant = 'standard',
  showBrandBadge = true,
}) => {
  // Brand-specific styling
  const getBrandTheme = (brand: BrandType) => {
    switch (brand) {
      case 'ARUOM':
        return {
          primary: '#1A1A1A',
          secondary: '#F5F5F5',
          accent: '#D4AF37',
          gradient: ['#1A1A1A', '#2D2D2D', '#404040'] as const,
          textColor: '#FFFFFF',
          badgeColor: '#D4AF37',
          philosophy: 'Minimalist Luxury',
        };
      case 'FIRED':
        return {
          primary: '#8B0000',
          secondary: '#FFE4E1',
          accent: '#FF6B35',
          gradient: ['#8B0000', '#A52A2A', '#CD5C5C'] as const,
          textColor: '#FFFFFF',
          badgeColor: '#FF6B35',
          philosophy: 'Bold Expression',
        };
      case 'AYNAMODA':
        return {
          primary: '#2C3E50',
          secondary: '#ECF0F1',
          accent: '#E67E22',
          gradient: ['#2C3E50', '#34495E', '#5D6D7E'] as const,
          textColor: '#FFFFFF',
          badgeColor: '#E67E22',
          philosophy: 'Confident Elegance',
        };
      default:
        return {
          primary: DesignSystem.colors.neutral[900],
          secondary: DesignSystem.colors.neutral[50],
          accent: DesignSystem.colors.primary[500],
          gradient: [DesignSystem.colors.neutral[800], DesignSystem.colors.neutral[700]] as const,
          textColor: DesignSystem.colors.neutral[50],
          badgeColor: DesignSystem.colors.primary[500],
          philosophy: 'Premium Fashion',
        };
    }
  };

  const brandTheme = getBrandTheme(item.brand);
  const cardWidth = variant === 'compact' ? (width - 48) / 2 : width - 32;

  return (
    <TouchableOpacity
      style={[
        styles.premiumCard,
        { width: cardWidth },
        variant === 'featured' && styles.featuredCard,
      ]}
      onPress={onPress}
      activeOpacity={0.95}
      accessibilityRole="button"
      accessibilityLabel={`${item.brand} ${item.title}`}
    >
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.backgroundImage}
      >
        <LinearGradient
          colors={[...brandTheme.gradient, 'transparent']}
          style={styles.gradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Header Section */}
          <View style={styles.cardHeader}>
            {showBrandBadge && (
              <View style={[styles.brandBadge, { backgroundColor: brandTheme.badgeColor }]}>
                <Text style={styles.brandText}>{item.brand}</Text>
              </View>
            )}

            {item.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newText}>YENİ</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.likeButton}
              onPress={onLikeToggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={item.isLiked ? 'Remove from favorites' : 'Add to favorites'}
              accessibilityHint={
                item.isLiked
                  ? 'Tap to remove this item from your favorites'
                  : 'Tap to add this item to your favorites'
              }
              accessibilityState={{ selected: item.isLiked }}
            >
              <Ionicons
                name={item.isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={item.isLiked ? '#FF6B6B' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>

          {/* Content Section */}
          <View style={styles.cardContent}>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{(item.category || '').toUpperCase()}</Text>
            </View>

            <Text style={styles.titleText} numberOfLines={2}>
              {item.title}
            </Text>

            {item.subtitle && (
              <Text style={styles.subtitleText} numberOfLines={1}>
                {item.subtitle}
              </Text>
            )}

            <Text style={styles.philosophyText}>{brandTheme.philosophy}</Text>
          </View>

          {/* Footer Section */}
          <View style={styles.cardFooter}>
            <View style={styles.priceContainer}>
              {item.originalPrice && <Text style={styles.originalPrice}>{item.originalPrice}</Text>}
              <Text style={styles.currentPrice}>{item.price}</Text>
              {item.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>%{item.discount}</Text>
                </View>
              )}
            </View>

            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 2).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    borderRadius: DesignSystem.borderRadius.xl,
  },
  brandBadge: {
    borderRadius: DesignSystem.borderRadius.md,
    elevation: 4,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    shadowColor: DesignSystem.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  brandText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.neutral[50],
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardFooter: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryContainer: {
    marginBottom: DesignSystem.spacing.sm,
  },
  categoryText: {
    ...DesignSystem.typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  currentPrice: {
    ...DesignSystem.typography.heading.h4,
    color: DesignSystem.colors.neutral[50],
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: DesignSystem.borderRadius.sm,
    marginLeft: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: 2,
  },
  discountText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.neutral[50],
    fontSize: 10,
    fontWeight: '700',
  },
  featuredCard: {
    elevation: 16,
    height: 400,
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.lg,
  },
  imageBackground: {
    flex: 1,
  },
  likeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: DesignSystem.spacing.sm,
  },
  newBadge: {
    backgroundColor: '#00C851',
    borderRadius: DesignSystem.borderRadius.md,
    marginLeft: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  newText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.neutral[50],
    fontSize: 10,
    fontWeight: '700',
  },
  originalPrice: {
    ...DesignSystem.typography.body,
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: DesignSystem.spacing.sm,
    textDecorationLine: 'line-through',
  },
  philosophyText: {
    ...DesignSystem.typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  premiumCard: {
    borderRadius: DesignSystem.borderRadius.xl,
    elevation: 12,
    height: 320,
    marginBottom: DesignSystem.spacing.lg,
    overflow: 'hidden',
    shadowColor: DesignSystem.colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  priceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  subtitleText: {
    ...DesignSystem.typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: DesignSystem.spacing.sm,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: DesignSystem.borderRadius.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.neutral[50],
    fontSize: 10,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
  },
  titleText: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.neutral[50],
    fontWeight: '700',
    marginBottom: DesignSystem.spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default PremiumBrandCard;
export { PremiumBrandCard };
