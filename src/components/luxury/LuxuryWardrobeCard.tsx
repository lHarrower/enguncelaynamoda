import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { AiAnalysisResult } from '@/services/api/aiAnalysisClient';

const { width } = Dimensions.get('window');

// Extended WardrobeItem interface for luxury cards
export interface WardrobeItem {
  id: string;
  userId?: string;
  imageUri?: string;
  imageUrl?: string;
  category: string;
  colors?: string[];
  brand?: string;
  size?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  price?: number;
  tags?: string[];
  notes?: string;
  name?: string;
  aiGeneratedName?: string;
  aiAnalysisData?: AiAnalysisResult['analysis'];
  usageStats?: {
    timesWorn: number;
    lastWorn?: string;
  };
  lastWorn?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LuxuryWardrobeCardProps {
  item: WardrobeItem;
  onPress?: () => void;
  onLongPress?: () => void;
  onFavoriteToggle?: () => void;
  isSelected?: boolean;
  isFavorite?: boolean;
  showPremiumBadge?: boolean;
  variant?: 'luxury' | 'premium' | 'elegant';
}

const LuxuryWardrobeCard: React.FC<LuxuryWardrobeCardProps> = ({
  item,
  onPress,
  onFavoriteToggle,
  isSelected = false,
  isFavorite = false,
  showPremiumBadge = true,
  variant = 'luxury',
}) => {
  const imageUri = item.imageUri || item.imageUrl || '';
  const displayPrice = item.purchasePrice || item.price;
  const brandName = item.brand || 'AYNAMODA';
  const itemName = item.name || item.aiGeneratedName || 'Luxury Item';

  // Luxury gradient colors with sophisticated palette
  const getLuxuryGradient = (): readonly [string, string, ...string[]] => {
    switch ((item.category || '').toLowerCase()) {
      case 'dresses':
        return ['#FDF7F0', '#F4E4D6', '#E8C5A0'] as const;
      case 'tops':
        return ['#F0F4F8', '#E1E8ED', '#C7D2DD'] as const;
      case 'bottoms':
        return ['#F8F6F0', '#EDE8E0', '#D4C4B0'] as const;
      case 'shoes':
        return ['#F5F0E8', '#E8DDD0', '#D4C4A8'] as const;
      case 'accessories':
        return ['#F8F0F5', '#E8D8E0', '#D4B8C4'] as const;
      case 'outerwear':
        return ['#F0F8F5', '#D8E8E0', '#B8D4C4'] as const;
      default:
        return ['#FAFAFA', '#F0F0F0', '#E0E0E0'] as const;
    }
  };

  const gradientColors = getLuxuryGradient();
  const cardWidth = (width - 48) / 2; // 2 columns with margins

  return (
    <TouchableOpacity
      style={[styles.luxuryCard, { width: cardWidth }, isSelected && styles.selectedCard]}
      onPress={onPress}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`${brandName} ${itemName}`}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradientContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Luxury Header */}
        <View style={styles.luxuryHeader}>
          <View style={styles.brandSection}>
            <Text style={styles.luxuryBrandText}>{brandName}</Text>
            {showPremiumBadge && (
              <View style={styles.luxuryBadge}>
                <Ionicons name="diamond" size={10} color="#B8860B" />
              </View>
            )}
          </View>

          {onFavoriteToggle && (
            <TouchableOpacity
              onPress={onFavoriteToggle}
              style={styles.luxuryFavoriteButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              accessibilityHint={
                isFavorite
                  ? 'Tap to remove this item from your favorites'
                  : 'Tap to add this item to your favorites'
              }
              accessibilityState={{ selected: isFavorite }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? '#D4A574' : '#8B5A3C'}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Luxury Image Section */}
        <View style={styles.luxuryImageContainer}>
          <Image source={{ uri: imageUri }} style={styles.luxuryImage} resizeMode="cover" />

          {/* Elegant Category Label */}
          <View style={styles.luxuryCategoryLabel}>
            <Text style={styles.luxuryCategoryText}>
              {(item.category || '').charAt(0).toUpperCase() + (item.category || '').slice(1)}
            </Text>
          </View>

          {/* Usage Stats Overlay */}
          {item.usageStats && (
            <View style={styles.usageStatsOverlay}>
              <Text style={styles.usageStatsText}>{item.usageStats.timesWorn}x</Text>
            </View>
          )}
        </View>

        {/* Luxury Footer */}
        <View style={styles.luxuryFooter}>
          <View style={styles.itemDetails}>
            <Text style={styles.luxuryItemName} numberOfLines={2}>
              {itemName}
            </Text>

            {/* Sophisticated Color Palette */}
            {item.colors && item.colors.length > 0 && (
              <View style={styles.luxuryColorsContainer}>
                {item.colors.slice(0, 4).map((color, index) => (
                  <View
                    key={index}
                    style={[styles.luxuryColorDot, { backgroundColor: color.toLowerCase() }]}
                  />
                ))}
                {item.colors.length > 4 && (
                  <Text style={styles.moreColorsText}>+{item.colors.length - 4}</Text>
                )}
              </View>
            )}

            {/* Size Information */}
            {item.size && <Text style={styles.sizeText}>Size {item.size}</Text>}
          </View>

          {/* Luxury Price Display */}
          {displayPrice && (
            <View style={styles.luxuryPriceContainer}>
              <Text style={styles.luxuryPriceText}>${displayPrice.toFixed(0)}</Text>
              <Text style={styles.luxuryCurrencySymbol}>�</Text>
            </View>
          )}
        </View>

        {/* Premium Selection Indicator */}
        {isSelected && (
          <View style={styles.luxurySelectionOverlay}>
            <View style={styles.luxurySelectionIndicator}>
              <Ionicons name="checkmark-circle" size={24} color="#D4A574" />
            </View>
          </View>
        )}

        {/* Luxury Border Accent */}
        <View style={styles.luxuryBorderAccent} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  brandSection: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  gradientContainer: {
    flex: 1,
    padding: 18,
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  luxuryBadge: {
    backgroundColor: 'rgba(184, 134, 11, 0.15)',
    borderRadius: 10,
    marginLeft: 6,
    padding: 3,
  },
  luxuryBorderAccent: {
    backgroundColor: 'linear-gradient(90deg, #D4A574, #B8860B)',
    height: 3,
    left: 0,
    opacity: 0.6,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  luxuryBrandText: {
    color: '#8B5A3C',
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  luxuryCard: {
    aspectRatio: 0.72,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(139, 90, 60, 0.15)',
    borderRadius: 28,
    borderWidth: 0.5,
    elevation: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#8B5A3C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  luxuryCategoryLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  luxuryCategoryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  luxuryColorDot: {
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 7,
    borderWidth: 1.5,
    elevation: 2,
    height: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: 14,
  },
  luxuryColorsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginBottom: 4,
  },
  luxuryCurrencySymbol: {
    color: '#8B5A3C',
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.7,
  },
  luxuryFavoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    elevation: 3,
    padding: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  luxuryFooter: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  luxuryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  luxuryImage: {
    height: '100%',
    width: '100%',
  },
  luxuryImageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    flex: 1,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  luxuryItemName: {
    color: '#2D2D2D',
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    marginBottom: 8,
  },
  luxuryPriceContainer: {
    alignItems: 'flex-end',
  },
  luxuryPriceText: {
    color: '#8B5A3C',
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '800',
  },
  luxurySelectionIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    elevation: 6,
    padding: 8,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  luxurySelectionOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(212, 165, 116, 0.25)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  moreColorsText: {
    color: '#8B5A3C',
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 3,
  },
  selectedCard: {
    borderColor: '#D4A574',
    borderWidth: 2.5,
    shadowColor: '#D4A574',
    shadowOpacity: 0.3,
    transform: [{ scale: 1.02 }],
  },
  sizeText: {
    color: '#8B5A3C',
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.8,
  },
  usageStatsOverlay: {
    backgroundColor: 'rgba(212, 165, 116, 0.9)',
    borderRadius: 12,
    bottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 12,
  },
  usageStatsText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default LuxuryWardrobeCard;
export { LuxuryWardrobeCard };
