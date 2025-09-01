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
import { WardrobeItem } from '@/types/aynaMirror';
import { useWardrobeStore, useWardrobeItems, useWardrobeLoading, useWardrobeError, useWardrobeActions } from '@/store/wardrobeStore';
import SuccessFeedback from '@/components/SuccessFeedback';

const { width } = Dimensions.get('window');
const CARD_MARGIN = DesignSystem.spacing.lg; // 16px
const GRID_PADDING = DesignSystem.spacing.xl; // 24px
const CARD_GAP = DesignSystem.spacing.md; // 12px
const CARD_WIDTH = (width - (GRID_PADDING * 2) - CARD_GAP) / 2; // 2 columns with proper spacing

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
  // Zustand store hooks
  const wardrobeItems = useWardrobeItems();
  const loading = useWardrobeLoading();
  const error = useWardrobeError();
  const { fetchItems, clearError } = useWardrobeActions();
  
  // Local state for UI interactions
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showFavoriteFeedback, setShowFavoriteFeedback] = useState(false);
  const [favoriteAction, setFavoriteAction] = useState<'added' | 'removed'>('added');

  const loadWardrobeItems = useCallback(async () => {
    try {
      await fetchItems();
    } catch (error) {
      // Error is already handled in the store
      console.error('Failed to load wardrobe items:', error);
    }
  }, [fetchItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWardrobeItems();
    setRefreshing(false);
  }, [loadWardrobeItems]);

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error, [
        { text: 'Tamam', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

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
      const wasAlreadyFavorite = newFavorites.has(itemId);
      
      if (wasAlreadyFavorite) {
        newFavorites.delete(itemId);
        setFavoriteAction('removed');
      } else {
        newFavorites.add(itemId);
        setFavoriteAction('added');
      }
      
      setFavoriteItems(newFavorites);
      setShowFavoriteFeedback(true);
    },
    [favoriteItems],
  );

  const handleFavoriteFeedbackComplete = useCallback(() => {
    setShowFavoriteFeedback(false);
  }, []);

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

  // Show error state if there's an error and no items
  if (error && wardrobeItems.length === 0) {
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
          <View style={styles.loadingContainer}>
            <Ionicons name="warning-outline" size={48} color={DesignSystem.colors.gold[500]} />
            <Text style={styles.loadingText}>Gardırop yüklenirken hata oluştu</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={loadWardrobeItems}
              accessibilityRole="button"
              accessibilityLabel="Tekrar dene"
            >
              <Ionicons name="refresh" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          getItemLayout={(data, index) => ({
            length: CARD_WIDTH * 1.25 + CARD_MARGIN, // Approximate item height
            offset: (CARD_WIDTH * 1.25 + CARD_MARGIN) * Math.floor(index / 2),
            index,
          })}
          removeClippedSubviews={true}
          maxToRenderPerBatch={6}
          windowSize={10}
          initialNumToRender={4}
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
              {/* İlham Veren Tuval */}
              <LinearGradient
                colors={[
                  DesignSystem.colors.sage[50] + '40',
                  DesignSystem.colors.gold[50] + '60',
                  DesignSystem.colors.sage[100] + '30',
                ]}
                style={styles.emptyCanvas}
              >
                <View style={styles.emptyIconContainer}>
                  <Ionicons 
                    name="diamond-outline" 
                    size={48} 
                    color={DesignSystem.colors.gold[400]} 
                  />
                  <View style={styles.sparkleContainer}>
                    <Ionicons 
                      name="sparkles" 
                      size={16} 
                      color={DesignSystem.colors.sage[400]} 
                      style={styles.sparkle1} 
                    />
                    <Ionicons 
                      name="sparkles" 
                      size={12} 
                      color={DesignSystem.colors.gold[300]} 
                      style={styles.sparkle2} 
                    />
                  </View>
                </View>
                
                <Text style={styles.emptyTitle}>Koleksiyonunuz Sizi Bekliyor</Text>
                <Text style={styles.emptySubtitle}>
                  Her parça bir hikaye, her seçim bir sanat eseri.
                  {"\n"}İlk hazinenizi keşfetmeye başlayın.
                </Text>
                
                {/* Zarif "İlk Parçanı Ekle" Butonu */}
                <TouchableOpacity
                  style={styles.addFirstItemButton}
                  onPress={() => router.push('/add-item')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[
                      DesignSystem.colors.gold[400],
                      DesignSystem.colors.gold[500],
                      DesignSystem.colors.gold[600],
                    ]}
                    style={styles.addFirstItemGradient}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.addFirstItemText}>İlk Parçanı Ekle</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                {/* Yönlendirici İpuçları */}
                <View style={styles.hintContainer}>
                  <View style={styles.hintItem}>
                    <Ionicons name="camera" size={16} color={DesignSystem.colors.sage[500]} />
                    <Text style={styles.hintText}>Fotoğraf çek</Text>
                  </View>
                  <View style={styles.hintDivider} />
                  <View style={styles.hintItem}>
                    <Ionicons name="images" size={16} color={DesignSystem.colors.sage[500]} />
                    <Text style={styles.hintText}>Galeriden seç</Text>
                  </View>
                  <View style={styles.hintDivider} />
                  <View style={styles.hintItem}>
                    <Ionicons name="heart" size={16} color={DesignSystem.colors.sage[500]} />
                    <Text style={styles.hintText}>Kürasyon yap</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          }
        />
      </LinearGradient>
      
      {/* Success Feedback */}
      <SuccessFeedback
        visible={showFavoriteFeedback}
        title={favoriteAction === 'added' ? 'Favorilere Eklendi!' : 'Favorilerden Çıkarıldı!'}
        message={favoriteAction === 'added' ? 'Parça favorilerinize başarıyla eklendi.' : 'Parça favorilerinizden çıkarıldı.'}
        onComplete={handleFavoriteFeedbackComplete}
      />
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
    paddingVertical: 60,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  emptyCanvas: {
    alignItems: 'center',
    borderRadius: DesignSystem.borderRadius.xxl,
    paddingVertical: DesignSystem.spacing.xxl,
    paddingHorizontal: DesignSystem.spacing.xl,
    width: '100%',
    maxWidth: 320,
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: DesignSystem.spacing.lg,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    left: -8,
    bottom: -8,
  },
  sparkle1: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  emptySubtitle: {
    color: DesignSystem.colors.sage[600],
    fontSize: DesignSystem.typography.sizes.sm,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xl,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  emptyTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.xl,
    fontWeight: DesignSystem.typography.weights.bold,
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center',
    fontFamily: DesignSystem.typography.fontFamily.heading,
  },
  addFirstItemButton: {
    marginBottom: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.xl,
    elevation: 8,
    shadowColor: DesignSystem.colors.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  addFirstItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.xl,
    borderRadius: DesignSystem.borderRadius.xl,
    gap: DesignSystem.spacing.sm,
  },
  addFirstItemText: {
    color: '#FFFFFF',
    fontSize: DesignSystem.typography.sizes.md,
    fontWeight: DesignSystem.typography.weights.semiBold,
    fontFamily: DesignSystem.typography.fontFamily.body,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.sm,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
  },
  hintText: {
    color: DesignSystem.colors.sage[500],
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: DesignSystem.typography.weights.medium,
  },
  hintDivider: {
    width: 1,
    height: 16,
    backgroundColor: DesignSystem.colors.sage[300],
    opacity: 0.5,
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
    paddingBottom: DesignSystem.spacing.xxl,
    paddingHorizontal: GRID_PADDING,
    paddingTop: DesignSystem.spacing.md,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: CARD_MARGIN,
  },
  itemSeparator: {
    height: CARD_MARGIN,
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
    aspectRatio: 0.8, // Slightly taller for better proportions
    backgroundColor: DesignSystem.colors.background.primary,
    borderColor: DesignSystem.colors.border.light,
    borderRadius: DesignSystem.borderRadius.xl,
    borderWidth: 1,
    elevation: 12,
    marginBottom: 0, // Remove margin as we handle spacing in gridRow
    overflow: 'hidden',
    shadowColor: DesignSystem.colors.shadow.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    width: CARD_WIDTH,
    // Add subtle breathing room
    transform: [{ scale: 0.98 }],
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
