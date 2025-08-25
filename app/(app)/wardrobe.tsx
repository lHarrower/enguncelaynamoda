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

import { enhancedWardrobeService } from '../../src/services/enhancedWardrobeService';
import { WardrobeItem } from '../../src/types/aynaMirror';

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
              <Ionicons name="diamond-outline" size={10} color="#B8860B" />
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
                color={isFavorite ? '#D4A574' : '#8B5A3C'}
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
      const items = await enhancedWardrobeService.getUserWardrobe('user-id');
      setWardrobeItems(items);
    } catch (error) {
      console.error('Error loading wardrobe items:', error);
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
        <ActivityIndicator size="large" color="#D4A574" />
        <Text style={styles.loadingText}>Loading your wardrobe...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FDFCFA', '#F8F6F2', '#F0EDE8']} style={styles.backgroundGradient}>
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
              colors={['#D4A574']}
              tintColor="#D4A574"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="shirt-outline" size={64} color="#D4A574" />
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
    backgroundColor: '#D4A574',
    borderRadius: 20,
    elevation: 6,
    padding: 12,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backgroundGradient: {
    flex: 1,
  },
  borderAccent: {
    backgroundColor: '#D4A574',
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
    color: '#8B5A3C',
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '700',
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
    padding: 16,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  colorIndicator: {
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
  colorsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  container: {
    backgroundColor: '#FDFCFA',
    flex: 1,
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
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptySubtitle: {
    color: '#8B5A3C',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#2D2D2D',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
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
  gridContainer: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerSubtitle: {
    color: '#8B5A3C',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  headerTitle: {
    color: '#2D2D2D',
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '800',
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
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#FDFCFA',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8B5A3C',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
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
