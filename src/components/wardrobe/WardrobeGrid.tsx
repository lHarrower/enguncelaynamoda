// Wardrobe Grid Component
import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { WardrobeItem as WardrobeItemType } from '@/types';
import WardrobeItem from './WardrobeItem';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_MARGIN = 8;
const GRID_PADDING = 16;
const ITEMS_PER_ROW = 2;
const ITEM_WIDTH = (screenWidth - GRID_PADDING * 2 - ITEM_MARGIN * (ITEMS_PER_ROW - 1)) / ITEMS_PER_ROW;

export interface WardrobeGridProps {
  items: WardrobeItemType[];
  onItemPress?: (item: WardrobeItemType) => void;
  onItemLongPress?: (item: WardrobeItemType) => void;
  onFavoritePress?: (item: WardrobeItemType) => void;
  numColumns?: number;
  style?: any;
  contentContainerStyle?: any;
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
  const renderItem = ({ item, index }: { item: WardrobeItemType; index: number }) => {
    const marginRight = (index + 1) % numColumns === 0 ? 0 : ITEM_MARGIN;
    
    return (
      <View style={[styles.itemContainer, { marginRight, width: ITEM_WIDTH }]}>
        <WardrobeItem
          item={item}
          onPress={() => onItemPress?.(item)}
          onLongPress={() => onItemLongPress?.(item)}
          onFavoritePress={() => onFavoritePress?.(item)}
        />
      </View>
    );
  };

  const keyExtractor = (item: WardrobeItemType) => item.id;

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      style={[styles.container, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: GRID_PADDING,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    marginBottom: ITEM_MARGIN,
  },
});

export default WardrobeGrid;