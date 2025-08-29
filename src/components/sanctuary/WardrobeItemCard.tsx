import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

import { DesignSystem } from '@/theme/DesignSystem';
import { WardrobeItem } from '@/types/aynaMirror';

interface WardrobeItemCardProps {
  item: WardrobeItem;
  onPress?: () => void;
  onLongPress?: () => void;
  onFavoriteToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
  isFavorite?: boolean;
  showAIAnalysis?: boolean;
  showUsageStats?: boolean;
  variant?: 'sanctuary' | 'zen' | 'mindful';
  onAnalysisApplied?: (
    id: string,
    update: { processedImageUri?: string; aiAnalysisData?: WardrobeItem['aiAnalysisData'] },
  ) => void;
}

const WardrobeItemCard: React.FC<WardrobeItemCardProps> = ({
  item,
  onPress,
  onFavoriteToggle,
  isSelected = false,
  isFavorite = false,
  showAIAnalysis = true,
  showUsageStats = true,
  variant = 'sanctuary',
}) => {
  const imageUri = item.processedImageUri ?? item.imageUri ?? '';
  const displayPrice = item.purchasePrice;
  const brandName = item.brand || 'AYNAMODA';
  const itemName =
    item.name || ('aiGeneratedName' in item ? item.aiGeneratedName : null) || 'Mindful Piece';

  // Sanctuary-inspired gradient colors with calming palette
  const getSanctuaryGradient = () => {
    switch (item.category.toLowerCase()) {
      case 'dresses':
        return ['#FDF9F7', '#F7EDE7', '#EDD5C7'] as const;
      case 'tops':
        return ['#F7F9FD', '#E7EDF7', '#C7D5ED'] as const;
      case 'bottoms':
        return ['#F9F7FD', '#EDE7F7', '#D5C7ED'] as const;
      case 'shoes':
        return ['#FDF7F9', '#F7E7ED', '#EDC7D5'] as const;
      case 'accessories':
        return ['#F7FDF9', '#E7F7ED', '#C7EDD5'] as const;
      case 'outerwear':
        return ['#F9FDF7', '#EDF7E7', '#D5EDC7'] as const;
      default:
        return ['#FDFDFB', '#F7F7F5', '#EDEDEB'] as const;
    }
  };

  const gradientColors = getSanctuaryGradient();
  const cardWidth = (width - 48) / 2;

  // Format last worn date
  const formatLastWorn = (lastWorn?: Date | string | null) => {
    if (!lastWorn) {
      return 'Never worn';
    }
    const date = typeof lastWorn === 'string' ? new Date(lastWorn) : lastWorn;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    if (diffDays < 30) {
      return `${Math.ceil(diffDays / 7)} weeks ago`;
    }
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <TouchableOpacity
      style={[styles.sanctuaryCard, { width: cardWidth }, isSelected && styles.selectedCard]}
      onPress={onPress}
      activeOpacity={0.94}
      accessibilityRole="button"
      accessibilityLabel={`${brandName} ${itemName}`}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradientContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Sanctuary Header */}
        <View style={styles.sanctuaryHeader}>
          <View style={styles.brandSection}>
            <Text style={styles.sanctuaryBrandText}>{brandName}</Text>
            <View style={styles.mindfulBadge}>
              <Ionicons name="leaf-outline" size={10} color={DesignSystem.colors.primary[700]} />
            </View>
          </View>

          {onFavoriteToggle && (
            <TouchableOpacity
              onPress={onFavoriteToggle}
              style={styles.sanctuaryFavoriteButton}
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
                size={16}
                color={
                  isFavorite ? DesignSystem.colors.primary[600] : DesignSystem.colors.primary[700]
                }
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Sanctuary Image Section */}
        <View style={styles.sanctuaryImageContainer}>
          <Image source={{ uri: imageUri }} style={styles.sanctuaryImage} resizeMode="cover" />

          {/* Mindful Category Label */}
          <View style={styles.sanctuaryCategoryLabel}>
            <Text style={styles.sanctuaryCategoryText}>{item.category}</Text>
          </View>

          {/* AI Analysis Indicator */}
          {showAIAnalysis && item.aiAnalysisData && (
            <View style={styles.aiAnalysisIndicator}>
              <Ionicons name="sparkles" size={12} color={DesignSystem.colors.primary[600]} />
              <Text style={styles.aiConfidenceText}>
                {Math.round((item.aiAnalysisData.confidence || 0) * 100)}%
              </Text>
            </View>
          )}
        </View>

        {/* Sanctuary Footer */}
        <View style={styles.sanctuaryFooter}>
          <View style={styles.itemDetails}>
            <Text style={styles.sanctuaryItemName} numberOfLines={2}>
              {itemName}
            </Text>

            {/* AI Analysis Data */}
            {showAIAnalysis && item.aiAnalysisData && (
              <View style={styles.aiAnalysisContainer}>
                {(item.aiAnalysisData as any).style && (
                  <Text style={styles.aiAnalysisText}>{(item.aiAnalysisData as any).style}</Text>
                )}
                {(item.aiAnalysisData as any).occasion && (
                  <Text style={styles.aiOccasionText}>{(item.aiAnalysisData as any).occasion}</Text>
                )}
              </View>
            )}

            {/* Mindful Color Palette */}
            {item.colors && item.colors.length > 0 && (
              <View style={styles.sanctuaryColorsContainer}>
                {item.colors.slice(0, 3).map((color: string, index: number) => (
                  <View
                    key={index}
                    style={[styles.sanctuaryColorDot, { backgroundColor: color.toLowerCase() }]}
                  />
                ))}
                {item.colors.length > 3 && (
                  <Text style={styles.moreColorsText}>+{item.colors.length - 3}</Text>
                )}
              </View>
            )}
          </View>

          {/* Sanctuary Price Display */}
          {typeof displayPrice === 'number' && (
            <View style={styles.sanctuaryPriceContainer}>
              <Text style={styles.sanctuaryPriceText}>${displayPrice.toFixed(0)}</Text>
            </View>
          )}
        </View>

        {/* Usage Stats Section */}
        {showUsageStats && item.usageStats && (
          <View style={styles.usageStatsSection}>
            <View style={styles.usageStatItem}>
              <Ionicons name="refresh-outline" size={12} color={DesignSystem.colors.primary[700]} />
              <Text style={styles.usageStatText}>{item.usageStats.totalWears} times</Text>
            </View>
            <View style={styles.usageStatItem}>
              <Ionicons name="time-outline" size={12} color={DesignSystem.colors.primary[700]} />
              <Text style={styles.usageStatText}>
                {formatLastWorn(item.lastWorn || item.usageStats.lastWorn)}
              </Text>
            </View>
          </View>
        )}

        {/* Mindful Selection Indicator */}
        {isSelected && (
          <View style={styles.sanctuarySelectionOverlay}>
            <View style={styles.sanctuarySelectionIndicator}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={DesignSystem.colors.primary[600]}
              />
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  aiAnalysisContainer: {
    marginBottom: 6,
  },
  aiAnalysisIndicator: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  aiAnalysisText: {
    color: DesignSystem.colors.primary[700],
    fontSize: DesignSystem.typography.sizes.xs,
    fontStyle: 'italic',
    fontWeight: DesignSystem.typography.weights.medium,
  },
  aiConfidenceText: {
    color: DesignSystem.colors.primary[600],
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: DesignSystem.typography.weights.semiBold,
  },
  aiOccasionText: {
    color: DesignSystem.colors.primary[600],
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: DesignSystem.typography.weights.normal,
    marginTop: 1,
  },
  brandSection: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  gradientContainer: {
    flex: 1,
    padding: 16,
  },
  itemDetails: {
    flex: 1,
    marginRight: 8,
  },
  mindfulBadge: {
    backgroundColor: DesignSystem.colors.primary[100],
    borderRadius: DesignSystem.borderRadius.sm,
    marginLeft: DesignSystem.spacing.xs,
    padding: DesignSystem.spacing.xs,
  },
  moreColorsText: {
    color: DesignSystem.colors.primary[700],
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: DesignSystem.typography.weights.medium,
    marginLeft: DesignSystem.spacing.xs,
  },
  sanctuaryBrandText: {
    color: DesignSystem.colors.primary[700],
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: DesignSystem.typography.weights.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sanctuaryCard: {
    aspectRatio: 0.75,
    backgroundColor: DesignSystem.colors.background.primary,
    borderColor: DesignSystem.colors.primary[100],
    borderRadius: DesignSystem.borderRadius.xl,
    borderWidth: 0.5,
    elevation: 8,
    marginBottom: DesignSystem.spacing.md,
    overflow: 'hidden',
    shadowColor: DesignSystem.colors.shadow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  sanctuaryCategoryLabel: {
    backgroundColor: DesignSystem.colors.primary[700] + 'D9',
    borderRadius: DesignSystem.borderRadius.md,
    left: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    position: 'absolute',
    top: DesignSystem.spacing.sm,
  },
  sanctuaryCategoryText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: DesignSystem.typography.weights.semiBold,
    letterSpacing: 0.5,
    textTransform: 'capitalize',
  },
  sanctuaryColorDot: {
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 6,
    borderWidth: 1,
    elevation: 1,
    height: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    width: 12,
  },
  sanctuaryColorsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  sanctuaryFavoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    elevation: 2,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  sanctuaryFooter: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sanctuaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sanctuaryImage: {
    height: '100%',
    width: '100%',
  },
  sanctuaryImageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    flex: 1,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  sanctuaryItemName: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: DesignSystem.typography.weights.semiBold,
    lineHeight: 16,
    marginBottom: DesignSystem.spacing.xs,
  },
  sanctuaryPriceContainer: {
    alignItems: 'flex-end',
  },
  sanctuaryPriceText: {
    color: DesignSystem.colors.primary[700],
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: DesignSystem.typography.sizes.md,
    fontWeight: DesignSystem.typography.weights.bold,
  },
  sanctuarySelectionIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    elevation: 4,
    padding: 6,
    shadowColor: '#A67C52',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sanctuarySelectionOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(166, 124, 82, 0.2)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  selectedCard: {
    borderColor: DesignSystem.colors.primary[600],
    borderWidth: 2,
    shadowColor: DesignSystem.colors.primary[600],
    shadowOpacity: 0.2,
    transform: [{ scale: 1.01 }],
  },
  usageStatItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  usageStatText: {
    color: DesignSystem.colors.primary[700],
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  usageStatsSection: {
    borderTopColor: DesignSystem.colors.primary[200],
    borderTopWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: DesignSystem.spacing.sm,
  },
});

export default WardrobeItemCard;
export { WardrobeItemCard };
