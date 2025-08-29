import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DesignSystem } from '@/theme/DesignSystem';
// Lazy load heavy services for better startup performance
let enhancedWardrobeService: any = null;
const getEnhancedWardrobeService = async () => {
  if (!enhancedWardrobeService) {
    const { enhancedWardrobeService: Service } = await import(
      '../../src/services/enhancedWardrobeService'
    );
    enhancedWardrobeService = Service;
  }
  return enhancedWardrobeService;
};
import { WardrobeItem } from '@/types/aynaMirror';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with margins

// Premium Wardrobe Item Card Component
interface WardrobeItemCardProps {
  item: WardrobeItem;
  onPress: () => void;
  onLongPress?: () => void;
  onFavoriteToggle?: () => void;
  isSelected?: boolean;
  isFavorite?: boolean;
}

const WardrobeItemCard: React.FC<WardrobeItemCardProps> = ({
  item,
  onPress,
  onFavoriteToggle,
  isSelected = false,
  isFavorite = false,
}) => {
  const imageUri = item.imageUri || '';
  const displayPrice = item.purchasePrice;
  const brandName = item.brand || 'AYNAMODA';
  const itemName = item.name || item.aiGeneratedName || 'Premium Item';

  // Premium gradient colors based on category
  const gradientColors = React.useMemo(() => {
    const category = item.category?.toLowerCase() || '';
    switch (category) {
      case 'dresses':
        return [
          DesignSystem.colors.background.primary,
          DesignSystem.colors.sage[50],
          DesignSystem.colors.sage[100],
        ] as const;
      case 'tops':
        return [
          DesignSystem.colors.background.primary,
          DesignSystem.colors.sage[50],
          DesignSystem.colors.sage[200],
        ] as const;
      case 'bottoms':
        return [
          DesignSystem.colors.background.primary,
          DesignSystem.colors.gold[50],
          DesignSystem.colors.gold[100],
        ] as const;
      case 'shoes':
        return [
          DesignSystem.colors.background.primary,
          DesignSystem.colors.gold[50],
          DesignSystem.colors.gold[200],
        ] as const;
      case 'accessories':
        return [
          DesignSystem.colors.background.primary,
          DesignSystem.colors.sage[100],
          DesignSystem.colors.sage[200],
        ] as const;
      case 'outerwear':
        return [
          DesignSystem.colors.background.primary,
          DesignSystem.colors.gold[100],
          DesignSystem.colors.gold[200],
        ] as const;
      default:
        return [
          DesignSystem.colors.background.primary,
          DesignSystem.colors.background.secondary,
          DesignSystem.colors.background.tertiary,
        ] as const;
    }
  }, [item.category]);

  return (
    <TouchableOpacity
      style={[styles.premiumCard, isSelected && styles.selectedCard]}
      onPress={onPress}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`${brandName} ${itemName}`}
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
              <Ionicons name="diamond-outline" size={10} color={DesignSystem.colors.gold[600]} />
            </View>
          </View>

          {onFavoriteToggle && (
            <TouchableOpacity
              onPress={onFavoriteToggle}
              style={styles.favoriteButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? DesignSystem.colors.gold[500] : DesignSystem.colors.sage[700]}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Premium Image Container */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.itemImage} resizeMode="cover" />

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
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
              <Text style={styles.currencyText}>�</Text>
            </View>
          )}
        </View>

        {/* Selection Overlay */}
        {isSelected && (
          <View style={styles.selectionOverlay}>
            <View style={styles.selectionIndicator}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
          </View>
        )}

        {/* Premium Border Accent */}
        <View style={styles.borderAccent} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Main Wardrobe Screen Component
export default function WardrobeScreen() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const loadWardrobeItems = useCallback(async () => {
    try {
      setLoading(true);
      const service = await getEnhancedWardrobeService();
      const items = await service.getUserWardrobe('user-id');
      setWardrobeItems(items);
    } catch (error) {
      Alert.alert('Error', 'Failed to load wardrobe items');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWardrobeItems();
    setRefreshing(false);
  }, [loadWardrobeItems]);

  const handleItemPress = useCallback(
    (item: WardrobeItem) => {
      if (selectionMode) {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(item.id)) {
          newSelected.delete(item.id);
        } else {
          newSelected.add(item.id);
        }
        setSelectedItems(newSelected);
      } else {
        router.push(`/item/${item.id}`);
      }
    },
    [selectionMode, selectedItems],
  );

  const handleFavoriteToggle = useCallback(
    (itemId: string) => {
      const newFavorites = new Set(favoriteItems);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      setFavoriteItems(newFavorites);
    },
    [favoriteItems],
  );

  const renderWardrobeItem = useCallback(
    ({ item }: { item: WardrobeItem }) => (
      <WardrobeItemCard
        item={item}
        onPress={() => handleItemPress(item)}
        onFavoriteToggle={() => handleFavoriteToggle(item.id)}
        isSelected={selectedItems.has(item.id)}
        isFavorite={favoriteItems.has(item.id)}
      />
    ),
    [handleItemPress, handleFavoriteToggle, selectedItems, favoriteItems],
  );

  const keyExtractor = useCallback((item: WardrobeItem) => item.id, []);

  useEffect(() => {
    loadWardrobeItems();
  }, [loadWardrobeItems]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DesignSystem.colors.gold[500]} />
        <Text style={styles.loadingText}>Loading your wardrobe...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[
          DesignSystem.colors.background.primary,
          DesignSystem.colors.background.secondary,
          DesignSystem.colors.background.tertiary,
        ]}
        style={styles.backgroundGradient}
      >
        {/* Premium Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Wardrobe</Text>
            <Text style={styles.headerSubtitle}>{wardrobeItems.length} premium pieces</Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-item')}
            accessibilityRole="button"
            accessibilityLabel="Add new item"
            accessibilityHint="Navigate to add new wardrobe item screen"
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Premium Grid */}
        <FlatList
          data={wardrobeItems}
          renderItem={renderWardrobeItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[DesignSystem.colors.gold[500]]}
              tintColor={DesignSystem.colors.gold[500]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="shirt-outline" size={64} color={DesignSystem.colors.gold[500]} />
              <Text style={styles.emptyTitle}>Your wardrobe awaits</Text>
              <Text style={styles.emptySubtitle}>Add your first premium piece to get started</Text>
            </View>
          }
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: DesignSystem.colors.gold[500],
    borderRadius: DesignSystem.borderRadius.lg,
    elevation: 6,
    padding: DesignSystem.spacing.sm,
    shadowColor: DesignSystem.colors.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backgroundGradient: {
    flex: 1,
  },
  borderAccent: {
    backgroundColor: DesignSystem.colors.gold[500],
    height: 2,
    left: 0,
    opacity: 0.3,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  brandSection: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  brandText: {
    color: DesignSystem.colors.sage[700],
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: DesignSystem.typography.weights.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  cardFooter: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardGradient: {
    flex: 1,
    padding: DesignSystem.spacing.md,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: DesignSystem.colors.overlay.dark,
    borderRadius: DesignSystem.borderRadius.md,
    bottom: DesignSystem.spacing.xs,
    left: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.xs,
    paddingVertical: DesignSystem.spacing.xxs,
    position: 'absolute',
  },
  categoryText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: DesignSystem.typography.sizes.xxs,
    fontWeight: DesignSystem.typography.weights.semiBold,
    letterSpacing: 0.5,
  },
  colorIndicator: {
    borderColor: DesignSystem.colors.border.light,
    borderRadius: DesignSystem.borderRadius.sm,
    borderWidth: 1,
    elevation: 1,
    height: 12,
    shadowColor: DesignSystem.colors.shadow.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    width: 12,
  },
  colorsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  currencyText: {
    color: DesignSystem.colors.sage[700],
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: DesignSystem.typography.weights.medium,
    opacity: 0.7,
  },
  detailsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptySubtitle: {
    color: DesignSystem.colors.sage[700],
    fontSize: DesignSystem.typography.sizes.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.bold,
    marginBottom: DesignSystem.spacing.xs,
    marginTop: DesignSystem.spacing.md,
  },
  favoriteButton: {
    backgroundColor: DesignSystem.colors.overlay.light,
    borderRadius: DesignSystem.borderRadius.md,
    elevation: 3,
    padding: DesignSystem.spacing.xs,
    shadowColor: DesignSystem.colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridContainer: {
    paddingBottom: DesignSystem.spacing.xl,
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.lg,
  },
  headerSubtitle: {
    color: DesignSystem.colors.sage[700],
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: DesignSystem.typography.weights.medium,
    marginTop: DesignSystem.spacing.xxs,
  },
  headerTitle: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.heading,
    fontSize: DesignSystem.typography.sizes.xl,
    fontWeight: DesignSystem.typography.weights.extraBold,
  },
  imageContainer: {
    backgroundColor: DesignSystem.colors.overlay.light,
    borderRadius: DesignSystem.borderRadius.lg,
    flex: 1,
    marginBottom: DesignSystem.spacing.sm,
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
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: DesignSystem.typography.weights.semiBold,
    lineHeight: 17,
    marginBottom: DesignSystem.spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: DesignSystem.colors.sage[700],
    fontSize: DesignSystem.typography.sizes.md,
    fontWeight: DesignSystem.typography.weights.medium,
    marginTop: DesignSystem.spacing.md,
  },
  moreColors: {
    color: DesignSystem.colors.sage[700],
    fontSize: DesignSystem.typography.sizes.xxs,
    fontWeight: DesignSystem.typography.weights.medium,
    marginLeft: 2,
  },
  premiumBadge: {
    backgroundColor: DesignSystem.colors.gold[100],
    borderRadius: DesignSystem.borderRadius.sm,
    marginLeft: DesignSystem.spacing.xs,
    padding: 2,
  },
  premiumCard: {
    aspectRatio: 0.75,
    backgroundColor: DesignSystem.colors.background.primary,
    borderColor: DesignSystem.colors.border.light,
    borderRadius: DesignSystem.borderRadius.xl,
    borderWidth: 1,
    elevation: 8,
    marginBottom: DesignSystem.spacing.md,
    overflow: 'hidden',
    shadowColor: DesignSystem.colors.shadow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    width: CARD_WIDTH,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceText: {
    color: DesignSystem.colors.sage[700],
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: DesignSystem.typography.sizes.md,
    fontWeight: DesignSystem.typography.weights.bold,
  },
  selectedCard: {
    borderColor: DesignSystem.colors.gold[500],
    borderWidth: 2.5,
    shadowColor: DesignSystem.colors.gold[500],
    shadowOpacity: 0.25,
    transform: [{ scale: 1.02 }],
  },
  selectionIndicator: {
    backgroundColor: DesignSystem.colors.gold[500],
    borderRadius: DesignSystem.borderRadius.lg,
    elevation: 6,
    padding: DesignSystem.spacing.xs,
    shadowColor: DesignSystem.colors.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  selectionOverlay: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.gold[200] + '33',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sizeText: {
    color: DesignSystem.colors.sage[700],
    fontSize: DesignSystem.typography.sizes.xxs,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  tagsText: {
    color: DesignSystem.colors.sage[600],
    fontSize: DesignSystem.typography.sizes.xxs,
    fontStyle: 'italic',
    fontWeight: DesignSystem.typography.weights.normal,
  },
  usageBadge: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.gold[500] + 'E6',
    borderRadius: DesignSystem.borderRadius.md,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: DesignSystem.spacing.xs,
    paddingVertical: 3,
    position: 'absolute',
    right: DesignSystem.spacing.xs,
    top: DesignSystem.spacing.xs,
  },
  usageText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: DesignSystem.typography.sizes.xxs,
    fontWeight: DesignSystem.typography.weights.semiBold,
  },
});
