// Premium Wardrobe Grid Component
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';
import { WardrobeItem as WardrobeItemType } from '@/types';

import WardrobeItem from './WardrobeItem';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_MARGIN = DesignSystem.spacing.md;
const GRID_PADDING = DesignSystem.spacing.xl;
const ITEMS_PER_ROW = 2;
const ITEM_WIDTH =
  (screenWidth - GRID_PADDING * 2 - ITEM_MARGIN * (ITEMS_PER_ROW - 1)) / ITEMS_PER_ROW;

export interface WardrobeGridProps {
  items: WardrobeItemType[];
  onItemPress?: (item: WardrobeItemType) => void;
  onItemLongPress?: (item: WardrobeItemType) => void;
  onFavoritePress?: (item: WardrobeItemType) => void;
  numColumns?: number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
}

const WardrobeGrid: React.FC<WardrobeGridProps> = ({
  items,
  onItemPress,
  onItemLongPress,
  onFavoritePress,
  numColumns = ITEMS_PER_ROW,
  style,
  contentContainerStyle,
  refreshing = false,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.1,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const isMountedRef = useRef(true);
  const itemRefs = useRef<Map<string, React.ElementRef<typeof TouchableOpacity> | null>>(new Map());

  // Enhanced cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Clear all item references
      itemRefs.current.clear();
      // Clear FlatList reference
      if (flatListRef.current) {
        flatListRef.current = null;
      }
    };
  }, []);

  // Clear item references when items change to prevent stale references
  useEffect(() => {
    const currentItemIds = new Set(items.map((item) => item.id));
    const refsToDelete: string[] = [];

    itemRefs.current.forEach((_, itemId) => {
      if (!currentItemIds.has(itemId)) {
        refsToDelete.push(itemId);
      }
    });

    refsToDelete.forEach((itemId) => {
      itemRefs.current.delete(itemId);
    });
  }, [items]);

  // Enhanced memoized renderItem with memory leak prevention
  const renderItem = useCallback(
    ({ item, index }: { item: WardrobeItemType; index: number }) => {
      const marginRight = (index + 1) % numColumns === 0 ? 0 : ITEM_MARGIN;

      return (
        <View style={[styles.itemContainer, { marginRight, width: ITEM_WIDTH }]}>
          <WardrobeItem
            key={item.id}
            item={item}
            onPress={() => {
              if (isMountedRef.current && onItemPress) {
                onItemPress(item);
              }
            }}
            onLongPress={() => {
              if (isMountedRef.current && onItemLongPress) {
                onItemLongPress(item);
              }
            }}
            onFavoritePress={() => {
              if (isMountedRef.current && onFavoritePress) {
                onFavoritePress(item);
              }
            }}
            ref={(ref) => {
              if (ref) {
                itemRefs.current.set(item.id, ref);
              } else {
                itemRefs.current.delete(item.id);
              }
            }}
          />
        </View>
      );
    },
    [numColumns, onItemPress, onItemLongPress, onFavoritePress],
  );

  // Memoized keyExtractor
  const keyExtractor = useCallback((item: WardrobeItemType) => item.id, []);

  // Memoized getItemLayout for better performance
  const getItemLayout = useCallback(
    (data: ArrayLike<WardrobeItemType> | null | undefined, index: number) => {
      const itemHeight = ITEM_WIDTH * 1.4 + ITEM_MARGIN; // Approximate item height
      const rowIndex = Math.floor(index / numColumns);
      return {
        length: itemHeight,
        offset: itemHeight * rowIndex,
        index,
      };
    },
    [numColumns],
  );

  // Memoized onEndReached handler
  const handleEndReached = useCallback(() => {
    if (isMountedRef.current && onEndReached) {
      onEndReached();
    }
  }, [onEndReached]);

  // Memoized onRefresh handler
  const handleRefresh = useCallback(() => {
    if (isMountedRef.current && onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // Memoized styles
  const containerStyle = useMemo(() => [styles.container, style], [style]);
  const contentStyle = useMemo(
    () => [styles.contentContainer, contentContainerStyle],
    [contentContainerStyle],
  );

  return (
    <FlatList
      ref={flatListRef}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      style={containerStyle}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onEndReached={handleEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      // Enhanced performance optimizations for memory management
      removeClippedSubviews={true}
      maxToRenderPerBatch={numColumns * 2} // Reduced for better memory usage
      windowSize={8} // Reduced window size
      initialNumToRender={numColumns * 3} // Reduced initial render
      updateCellsBatchingPeriod={100} // Increased batching period
      getItemLayout={getItemLayout}
      // Enhanced memory optimization
      disableVirtualization={false}
      legacyImplementation={false}
      scrollEventThrottle={32} // Reduced scroll event frequency
      // Additional memory optimizations
      maintainVisibleContentPosition={undefined}
      inverted={false}
      extraData={items.length} // Force re-render only when item count changes
      // Prevent nested VirtualizedList warnings
      nestedScrollEnabled={true}
      scrollEnabled={true}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  contentContainer: {
    padding: GRID_PADDING,
    paddingBottom: DesignSystem.spacing.xxxl, // Extra bottom padding for better scrolling
  },
  itemContainer: {
    marginBottom: ITEM_MARGIN,
    // Add subtle elevation for premium feel
    shadowColor: DesignSystem.colors.terracotta[200],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.sm,
  },
});

export default WardrobeGrid;
