import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { WardrobeItem } from '../../types/aynaMirror';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with margins

// Premium Wardrobe Item Card Component
interface WardrobeItemCardProps {
  item: WardrobeItem;
  onPress: (item: WardrobeItem) => void;
  onLongPress?: (item: WardrobeItem) => void;
  onFavoriteToggle?: (itemId: string, isFavorite: boolean) => void;
  onSelectionToggle?: (itemId: string, isSelected: boolean) => void;
  onEdit?: (item: WardrobeItem) => void;
  onDelete?: (itemId: string) => void;
  isSelected?: boolean;
  isFavorite?: boolean;
  testID?: string;
  variant?: 'compact' | 'detailed' | 'grid' | 'premium';
  showActions?: boolean;
  selectionMode?: boolean; // Add selectionMode prop to WardrobeItemCardProps
}

export const WardrobeItemCard: React.FC<WardrobeItemCardProps> = ({
  item,
  onPress,
  onLongPress,
  onFavoriteToggle,
  onSelectionToggle,
  onEdit,
  onDelete,
  isSelected = false,
  isFavorite = false,
  testID = `wardrobe-card-${item.id}`,
  variant = 'premium',
  showActions = false,
}) => {
  const { trigger } = useHapticFeedback();

  const imageUri = item.imageUri || '';
  const displayPrice = item.purchasePrice;
  const brandName = item.brand || 'AYNAMODA';
  const itemName = item.name || item.aiGeneratedName || 'Premium Item';

  // Premium gradient colors based on category
  const gradientColors = React.useMemo(() => {
    const category = item.category?.toLowerCase() || '';
    switch (category) {
      case 'dresses':
        return ['#FDF8F5', '#F5E8DD', '#EDD0B8'] as const;
      case 'tops':
        return ['#F5F8FD', '#DDE8F5', '#B8D0ED'] as const;
      case 'bottoms':
        return ['#F8F5FD', '#E8DDF5', '#D0B8ED'] as const;
      case 'shoes':
        return ['#FDF5F8', '#F5DDE8', '#EDB8D0'] as const;
      case 'accessories':
        return ['#F5FDF8', '#DDF5E8', '#B8EDD0'] as const;
      case 'outerwear':
        return ['#F8FDF5', '#E8F5DD', '#D0EDB8'] as const;
      default:
        return ['#FDFCFA', '#F5F3F0', '#EDEBE8'] as const;
    }
  }, [item.category]);

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'grid':
        return { aspectRatio: 1 };
      case 'compact':
        return { height: 120 };
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      style={[styles.premiumCard, isSelected && styles.selectedCard, getVariantStyles()]}
      onPress={() => {
        trigger('selection');
        onPress(item);
      }}
      onLongPress={() => {
        trigger('medium');
        onLongPress?.(item);
      }}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`${itemName}, ${(item.category || '').charAt(0).toUpperCase() + (item.category || '').slice(1).toLowerCase()}`}
      accessibilityHint="Double tap to view details, long press for options"
      accessibilityActions={[
        { name: 'activate', label: 'View details' },
        { name: 'longpress', label: 'Show options' },
        { name: 'magicTap', label: 'Toggle favorite' }
      ]}
      testID={testID}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Premium Header */}
        <View style={styles.cardHeader}>
          <View style={styles.brandSection}>
            <Text style={styles.brandText}>{brandName}</Text>
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond-outline" size={10} color="#B8860B" />
            </View>
          </View>

          <View style={styles.actionButtons}>
            {onFavoriteToggle && (
              <TouchableOpacity
                onPress={() => {
                  trigger('light');
                  onFavoriteToggle?.(item.id, !isFavorite);
                }}
                style={styles.favoriteButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                testID={`${testID}-favorite`}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isFavorite ? '#D4A574' : '#8B5A3C'}
                />
              </TouchableOpacity>
            )}
            {showActions && onEdit && (
              <TouchableOpacity
                onPress={() => onEdit?.(item)}
                style={styles.actionButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                testID={`${testID}-edit`}
              >
                <Ionicons name="pencil-outline" size={16} color="#8B5A3C" />
              </TouchableOpacity>
            )}
            {showActions && onDelete && (
              <TouchableOpacity
                onPress={() => onDelete?.(item.id)}
                style={styles.actionButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                testID={`${testID}-delete`}
              >
                <Ionicons name="trash-outline" size={16} color="#8B5A3C" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Premium Image Container */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.itemImage} resizeMode="cover" />

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{(item.category || '').toUpperCase()}</Text>
          </View>

          {/* Usage Stats Badge */}
          {item.usageStats && (
            <View style={styles.usageBadge}>
              <Ionicons name="refresh-outline" size={10} color="#FFFFFF" />
              <Text style={styles.usageText}>{item.usageStats.totalWears}</Text>
            </View>
          )}
        </View>

        {/* Premium Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
              {itemName}
            </Text>

            {/* Color Indicators */}
            {item.colors && item.colors.length > 0 && (
              <View style={styles.colorsRow}>
                {item.colors.slice(0, 4).map((color, index) => (
                  <View
                    key={index}
                    style={[styles.colorIndicator, { backgroundColor: color.toLowerCase() }]}
                  />
                ))}
                {item.colors.length > 4 && (
                  <Text style={styles.moreColors}>+{item.colors.length - 4}</Text>
                )}
              </View>
            )}

            {/* Size and Tags */}
            <View style={styles.detailsRow}>
              {item.size && <Text style={styles.sizeText}>Size {item.size}</Text>}
              {item.tags && item.tags.length > 0 && (
                <Text style={styles.tagsText}>{item.tags.slice(0, 2).join(', ')}</Text>
              )}
            </View>
          </View>

          {/* Premium Price Display */}
          {displayPrice && (
            <View style={styles.priceSection}>
              <Text style={styles.priceText}>${displayPrice.toFixed(0)}</Text>
              <Text style={styles.currencyText}>₺</Text>
            </View>
          )}
        </View>

        {/* Selection Overlay */}
        {isSelected && (
          <TouchableOpacity
            style={styles.selectionOverlay}
            testID={`${testID}-selection-indicator`}
            onPress={() => onSelectionToggle?.(item.id, true)}
          >
            <View style={styles.selectionIndicator}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Premium Border Accent */}
        <View style={styles.borderAccent} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  borderAccent: {
    backgroundColor: 'rgba(212, 165, 116, 0.3)',
    bottom: 0,
    height: 2,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  brandSection: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  brandText: {
    color: '#8B5A3C',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardFooter: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cardGradient: {
    flex: 1,
    padding: 8,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  categoryBadge: {
    backgroundColor: 'rgba(139, 90, 60, 0.9)',
    borderRadius: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
    top: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  colorIndicator: {
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 6,
    borderWidth: 1,
    height: 12,
    marginRight: 3,
    width: 12,
  },
  colorsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  currencyText: {
    color: '#8B5A3C',
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.7,
  },
  detailsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    elevation: 3,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    elevation: 2,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    flex: 1,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  itemImage: {
    height: '100%',
    width: '100%',
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    color: '#2D2D2D',
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    marginBottom: 6,
  },
  moreColors: {
    color: '#8B5A3C',
    fontSize: 9,
    fontWeight: '500',
    marginLeft: 2,
  },
  premiumBadge: {
    backgroundColor: 'rgba(184, 134, 11, 0.15)',
    borderRadius: 8,
    marginLeft: 6,
    padding: 2,
  },
  premiumCard: {
    aspectRatio: 0.75,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(139, 90, 60, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#8B5A3C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    width: CARD_WIDTH,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceText: {
    color: '#8B5A3C',
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '700',
  },
  selectedCard: {
    borderColor: '#D4A574',
    borderWidth: 2.5,
    shadowColor: '#D4A574',
    shadowOpacity: 0.25,
    transform: [{ scale: 1.02 }],
  },
  selectionIndicator: {
    backgroundColor: '#D4A574',
    borderRadius: 20,
    elevation: 6,
    padding: 8,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  selectionOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sizeText: {
    color: '#8B5A3C',
    fontSize: 9,
    fontWeight: '500',
  },
  tagsText: {
    color: '#A67C52',
    fontSize: 8,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  usageBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(212, 165, 116, 0.9)',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    position: 'absolute',
    right: 8,
    top: 8,
  },
  usageText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
});
