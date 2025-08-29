import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Dimensions,
  findNodeHandle,
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { DesignSystem } from '@/theme/DesignSystem';

const { width } = Dimensions.get('window');

// Premium card item interface extended for compatibility with full WardrobeItem from aynamirror types
export interface WardrobeCardItem {
  id: string;
  imageUrl?: string; // optional to accept items using imageUri naming
  imageUri?: string; // accept upstream naming
  category: string;
  name?: string;
  brand?: string;
  colors?: string[];
  tags?: string[];
  purchasePrice?: number;
  price?: number;
}

interface WardrobeCardProps {
  item: WardrobeCardItem;
  onPress?: () => void;
  onLongPress?: () => void;
  onFavoriteToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelectionToggle?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  showActions?: boolean;
  variant?: 'compact' | 'detailed' | 'grid' | 'premium';
  highContrast?: boolean;
  reducedMotion?: boolean;
  autoFocus?: boolean;
  screenReaderEnabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const WardrobeCard: React.FC<WardrobeCardProps> = ({
  item,
  onPress,
  style,
  variant = 'premium',
  onFavoriteToggle,
  isSelected = false,
  highContrast = false,
  autoFocus = false,
  reducedMotion = false,
}) => {
  const cardRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const { trigger } = useHapticFeedback();

  // Animation values
  const scale = useSharedValue(1);

  // Animated style that respects reducedMotion
  const animatedStyle = useAnimatedStyle(() => {
    if (reducedMotion) {
      return {}; // No animations when reducedMotion is true
    }
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Handle auto focus
  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        if (cardRef.current) {
          const reactTag = findNodeHandle(cardRef.current);
          if (reactTag) {
            AccessibilityInfo.setAccessibilityFocus(reactTag);
          }
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [autoFocus]);
  const imageUri = item.imageUrl || item.imageUri || '';
  const displayPrice = item.purchasePrice || item.price;
  const brandName = item.brand || 'AYNAMODA';

  // Check if item is favorite (assuming isFavorite property exists)
  const isFavorite = (item as any).isFavorite || false;

  // Create comprehensive accessibility label
  const createAccessibilityLabel = () => {
    const parts = [];
    if (item.name) parts.push(item.name);
    if (item.category) {
      // Capitalize category name for accessibility
      const capitalizedCategory =
        (item.category || '').charAt(0).toUpperCase() +
        (item.category || '').slice(1).toLowerCase();
      parts.push(capitalizedCategory);
    }
    if (item.colors && item.colors.length > 0) {
      // Capitalize color names for accessibility
      const capitalizedColors = item.colors.map(
        (color) => color.charAt(0).toUpperCase() + color.slice(1).toLowerCase(),
      );
      parts.push(capitalizedColors.join(', '));
    }
    if (isFavorite) parts.push('Favorite item');
    if (item.tags && item.tags.length > 0) {
      parts.push(`Tags: ${item.tags.join(', ')}`);
    }
    return parts.join(', ');
  };

  // Create color accessibility label
  const createColorAccessibilityLabel = () => {
    if (item.colors && item.colors.length > 0) {
      const capitalizedColors = item.colors.map(
        (color) => color.charAt(0).toUpperCase() + color.slice(1).toLowerCase(),
      );
      return `Colors: ${capitalizedColors.join(', ')}`;
    }
    return 'No colors specified';
  };

  // Premium gradient colors based on category
  const gradientColors = React.useMemo(() => {
    const category = item.category?.toLowerCase() || '';
    switch (category) {
      case 'dresses':
        return ['#F8E8E8', '#F0D0D0', '#E8B8B8'] as const;
      case 'tops':
        return ['#E8F0F8', '#D0E0F0', '#B8D0E8'] as const;
      case 'bottoms':
        return ['#F0F8E8', '#E0F0D0', '#D0E8B8'] as const;
      case 'shoes':
        return ['#F8F0E8', '#F0E0D0', '#E8D0B8'] as const;
      case 'accessories':
        return ['#F0E8F8', '#E0D0F0', '#D0B8E8'] as const;
      default:
        return ['#F5F5F5', '#EEEEEE', '#E0E0E0'] as const;
    }
  }, [item.category]);

  const handlePress = () => {
    trigger('selection');
    onPress?.();
  };

  const handlePressIn = () => {
    if (!reducedMotion) {
      scale.value = withSpring(0.95);
    }
  };

  const handlePressOut = () => {
    if (!reducedMotion) {
      scale.value = withSpring(1);
    }
  };

  const CardContent = (
    <TouchableOpacity
      ref={cardRef}
      style={[
        styles.card,
        style,
        isSelected && styles.selectedCard,
        highContrast && styles.highContrastCard,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.95}
      accessibilityRole="button"
      accessibilityLabel={createAccessibilityLabel()}
      accessibilityHint="Double tap to view details, long press for options"
      accessibilityActions={[
        { name: 'activate', label: 'View details' },
        { name: 'longpress', label: 'Show options' },
        { name: 'magicTap', label: 'Toggle favorite' },
      ]}
      accessible={true}
      testID={`wardrobe-card-${item.id}`}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Premium Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandText}>{brandName}</Text>
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond-outline" size={12} color={DesignSystem.colors.primary[700]} />
            </View>
          </View>
          {onFavoriteToggle && (
            <TouchableOpacity
              onPress={onFavoriteToggle}
              style={styles.favoriteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              accessibilityHint={
                isFavorite
                  ? 'Double tap to remove this item from your favorites'
                  : 'Double tap to add this item to your favorites'
              }
              accessibilityState={{ selected: isFavorite }}
              testID={`wardrobe-card-${item.id}-favorite`}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={
                  isFavorite ? DesignSystem.colors.gold[500] : DesignSystem.colors.primary[700]
                }
                testID="favorite-icon"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Premium Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
            testID="wardrobe-card-image"
          />

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{(item.category || '').toUpperCase()}</Text>
          </View>
        </View>

        {/* Premium Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2} testID={`item-name-${item.id}`}>
              {item.name || 'Elegant Piece'}
            </Text>

            {/* Color Indicators */}
            {item.colors && item.colors.length > 0 && (
              <View
                style={styles.colorsContainer}
                testID={`color-indicator-${item.id}`}
                accessibilityLabel={createColorAccessibilityLabel()}
              >
                {item.colors.slice(0, 3).map((color, index) => (
                  <View
                    key={index}
                    style={[styles.colorDot, { backgroundColor: color.toLowerCase() }]}
                  />
                ))}
                {item.colors.length > 3 && (
                  <Text style={styles.moreColors}>+{item.colors.length - 3}</Text>
                )}
              </View>
            )}
          </View>

          {/* Price Display */}
          {displayPrice && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>${displayPrice.toFixed(0)}</Text>
              <Text style={styles.currencySymbol}>�</Text>
            </View>
          )}
        </View>

        {/* Premium Selection Indicator */}
        {isSelected && (
          <View style={styles.selectionOverlay}>
            <View style={styles.selectionIndicator} testID="selection-indicator">
              <Ionicons name="checkmark" size={16} color={DesignSystem.colors.text.inverse} />
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  // Conditionally wrap with Animated.View only when animations are enabled
  return reducedMotion ? (
    CardContent
  ) : (
    <Animated.View style={[animatedStyle]}>{CardContent}</Animated.View>
  );
};

const styles = StyleSheet.create({
  brandContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  brandText: {
    color: DesignSystem.colors.primary[700],
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  card: {
    aspectRatio: 0.75,
    backgroundColor: DesignSystem.colors.background.primary,
    borderColor: DesignSystem.colors.terracotta[500] + '1A',
    borderRadius: DesignSystem.spacing.xl,
    borderWidth: 1,
    elevation: 8,
    overflow: 'hidden',
    shadowColor: DesignSystem.colors.terracotta[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
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
    marginBottom: 12,
    minHeight: 32,
  },
  categoryBadge: {
    backgroundColor: DesignSystem.colors.text.primary + 'B3',
    borderRadius: DesignSystem.spacing.sm,
    bottom: DesignSystem.spacing.xs,
    left: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.xs,
    paddingVertical: DesignSystem.spacing.xs,
    position: 'absolute',
  },
  categoryText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  colorDot: {
    borderColor: DesignSystem.colors.background.elevated + 'CC',
    borderRadius: DesignSystem.spacing.xs,
    borderWidth: 1,
    height: DesignSystem.spacing.sm,
    width: DesignSystem.spacing.sm,
  },
  colorsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
  },
  currencySymbol: {
    color: DesignSystem.colors.primary[700],
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: '500',
    opacity: 0.7,
  },
  favoriteButton: {
    backgroundColor: DesignSystem.colors.background.elevated + 'E6',
    borderRadius: DesignSystem.spacing.sm,
    padding: DesignSystem.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  gradientBackground: {
    flex: 1,
    padding: DesignSystem.spacing.md,
  },
  image: {
    backgroundColor: DesignSystem.colors.background.elevated + '80',
    height: '100%',
    width: '100%',
  },
  imageContainer: {
    borderRadius: DesignSystem.spacing.md,
    flex: 1,
    marginBottom: DesignSystem.spacing.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: DesignSystem.spacing.xs,
  },
  moreColors: {
    color: DesignSystem.colors.terracotta[500],
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: '500',
    marginLeft: 2,
  },
  premiumBadge: {
    backgroundColor: DesignSystem.colors.terracotta[500] + '1A',
    borderRadius: DesignSystem.spacing.xs,
    marginLeft: DesignSystem.spacing.xs,
    padding: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    color: DesignSystem.colors.terracotta[500],
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: DesignSystem.typography.sizes.md,
    fontWeight: '700',
  },
  selectedCard: {
    borderColor: DesignSystem.colors.sage[400],
    borderWidth: 2,
    shadowColor: DesignSystem.colors.sage[400],
    shadowOpacity: 0.25,
  },
  highContrastCard: {
    borderWidth: 3,
    borderColor: '#000000',
  },
  selectionIndicator: {
    backgroundColor: DesignSystem.colors.sage[400],
    borderRadius: 20,
    padding: DesignSystem.spacing.xs,
  },
  selectionOverlay: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.sage[400] + '33',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default WardrobeCard;
// Named export for legacy tests expecting { WardrobeCard }
export { WardrobeCard };
