import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';
import { TIMING } from '@/theme/foundations/Animation';
import { IoniconsName } from '@/types/icons';
import { logInDev } from '@/utils/consoleSuppress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  season: string;
  wearCount: number;
  lastWorn: string;
  confidence: number;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  icon: IoniconsName;
  count: number;
  gradient: [string, string];
}

const SAMPLE_CATEGORIES: Category[] = [
  {
    id: 'tops',
    name: 'Tops',
    icon: 'shirt',
    count: 24,
    gradient: [DesignSystem.colors.coral[400], DesignSystem.colors.lavender[400]],
  },
  {
    id: 'bottoms',
    name: 'Bottoms',
    icon: 'shirt',
    count: 18,
    gradient: [DesignSystem.colors.sage[300], DesignSystem.colors.sage[500]],
  },
  {
    id: 'dresses',
    name: 'Dresses',
    icon: 'woman',
    count: 12,
    gradient: [DesignSystem.colors.gold[400], DesignSystem.colors.neutral[200]],
  },
  {
    id: 'outerwear',
    name: 'Outerwear',
    icon: 'shirt',
    count: 8,
    gradient: [DesignSystem.colors.lavender[400], DesignSystem.colors.neutral[50]],
  },
];

const SAMPLE_ITEMS: WardrobeItem[] = [
  {
    id: '1',
    name: 'Silk Blouse',
    category: 'tops',
    color: 'Cream',
    season: 'All Season',
    wearCount: 12,
    lastWorn: '3 days ago',
    confidence: 95,
    tags: ['elegant', 'versatile', 'work'],
  },
  {
    id: '2',
    name: 'High-Waisted Trousers',
    category: 'bottoms',
    color: 'Navy',
    season: 'Fall/Winter',
    wearCount: 8,
    lastWorn: '1 week ago',
    confidence: 88,
    tags: ['professional', 'comfortable', 'classic'],
  },
  // Add more items as needed
];

interface MorphingGalleryProps {
  items: WardrobeItem[];
  viewMode: 'grid' | 'list';
  onItemPress: (item: WardrobeItem) => void;
}

interface WardrobeItemCardProps {
  item: WardrobeItem;
  onItemPress: (item: WardrobeItem) => void;
  morphProgress: Animated.SharedValue<number>;
}

const WardrobeItemCard: React.FC<WardrobeItemCardProps> = ({
  item,
  onItemPress,
  morphProgress,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const gridWidth = (SCREEN_WIDTH - DesignSystem.spacing.lg * 3) / 2;
    const listWidth = SCREEN_WIDTH - DesignSystem.spacing.lg * 2;

    const width = interpolate(
      morphProgress.value,
      [0, 1],
      [gridWidth, listWidth],
      Extrapolate.CLAMP,
    );

    const height = interpolate(
      morphProgress.value,
      [0, 1],
      [gridWidth * 1.2, 80],
      Extrapolate.CLAMP,
    );

    return {
      width,
      height,
      marginBottom: DesignSystem.spacing.md,
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    const flexDirection: 'row' | 'column' = morphProgress.value > 0.5 ? 'row' : 'column';

    return {
      flexDirection,
      alignItems: morphProgress.value > 0.5 ? 'center' : 'flex-start',
      padding: interpolate(
        morphProgress.value,
        [0, 1],
        [DesignSystem.spacing.lg, DesignSystem.spacing.md],
        Extrapolate.CLAMP,
      ),
    };
  });

  return (
    <Animated.View style={[styles.wardrobeItem, animatedStyle]}>
      <TouchableOpacity
        style={styles.itemTouchable}
        onPress={() => onItemPress(item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[DesignSystem.colors.neutral[100], DesignSystem.colors.neutral[50]]}
          style={styles.itemGradient}
        >
          <BlurView intensity={20} style={styles.itemBlur}>
            <Animated.View style={contentStyle}>
              {/* Item Visual */}
              <View style={styles.itemVisual}>
                <LinearGradient
                  colors={[DesignSystem.colors.sage[300], DesignSystem.colors.lavender[400]]}
                  style={styles.itemImage}
                >
                  <Ionicons name="shirt" size={24} color={DesignSystem.colors.neutral[800]} />
                </LinearGradient>
              </View>

              {/* Item Info */}
              <View style={styles.itemInfo}>
                <Text style={[DesignSystem.typography.heading.h3, styles.itemName]}>
                  {item.name}
                </Text>
                <Text style={[DesignSystem.typography.body.small, styles.itemDetails]}>
                  {item.color} • {item.lastWorn}
                </Text>

                {/* Confidence Score */}
                <View style={styles.confidenceRow}>
                  <View style={styles.confidenceBar}>
                    <View style={[styles.confidenceFill, { width: `${item.confidence}%` }]} />
                  </View>
                  <Text style={[DesignSystem.typography.body.small, styles.confidenceText]}>
                    {item.confidence}%
                  </Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  accessibilityRole="button"
                  accessibilityLabel="Like item"
                  accessibilityHint="Tap to add this item to your favorites"
                >
                  <Ionicons name="heart-outline" size={16} color={DesignSystem.colors.coral[400]} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </BlurView>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MorphingGallery: React.FC<MorphingGalleryProps> = ({ items, viewMode, onItemPress }) => {
  const morphProgress = useSharedValue(viewMode === 'grid' ? 0 : 1);

  useEffect(() => {
    morphProgress.value = withSpring(
      viewMode === 'grid' ? 0 : 1,
      DesignSystem.animations.spring.bouncy,
    );
  }, [viewMode, morphProgress]);

  // Removed nested ItemCard to comply with react/no-unstable-nested-components

  const renderItem = ({ item }: { item: WardrobeItem }) => (
    <WardrobeItemCard item={item} onItemPress={onItemPress} morphProgress={morphProgress} />
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={viewMode === 'grid' ? 2 : 1}
      key={viewMode} // Force re-render when view mode changes
      contentContainerStyle={styles.galleryContainer}
      showsVerticalScrollIndicator={false}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={6}
      updateCellsBatchingPeriod={50}
      getItemLayout={
        viewMode === 'grid'
          ? undefined
          : (data, index) => ({
              length: 120, // Estimated item height
              offset: 120 * index,
              index,
            })
      }
      // Prevent nested VirtualizedList warnings
      nestedScrollEnabled={true}
      scrollEnabled={true}
    />
  );
};

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  isSelected: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress, isSelected }) => {
  const scaleAnim = useSharedValue(1);
  const glowAnim = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    glowAnim.value = withTiming(isSelected ? 1 : 0, {
      duration: TIMING.deliberate,
    });
  }, [isSelected, glowAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    shadowOpacity: interpolate(glowAnim.value, [0, 1], [0.1, 0.3]),
    shadowRadius: interpolate(glowAnim.value, [0, 1], [8, 16]),
  }));

  const handlePressIn = () => {
    scaleAnim.value = withSpring(0.95, DesignSystem.animations.spring.bouncy);
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1, DesignSystem.animations.spring.gentle);
  };

  return (
    <Animated.View style={[styles.categoryCard, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <LinearGradient colors={category.gradient} style={styles.categoryGradient}>
          <BlurView intensity={25} style={styles.categoryContent}>
            <Ionicons name={category.icon} size={32} color={DesignSystem.colors.neutral[800]} />
            <Text style={[DesignSystem.typography.heading.h3, styles.categoryName]}>
              {category.name}
            </Text>
            <Text style={[DesignSystem.typography.body.small, styles.categoryCount]}>
              {category.count} items
            </Text>
          </BlurView>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const VisionWardrobeScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, _setSearchQuery] = useState('');

  const filteredItems = SAMPLE_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleItemPress = (item: WardrobeItem) => {
    logInDev('Item pressed:', item.name);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          DesignSystem.colors.neutral[50],
          DesignSystem.colors.neutral[100],
          DesignSystem.colors.sage[500],
        ]}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[DesignSystem.typography.heading.h2, styles.headerTitle]}>
              Your Treasure Chest
            </Text>
            <Text style={[DesignSystem.typography.body.medium, styles.headerSubtitle]}>
              {filteredItems.length} pieces of confidence
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={toggleViewMode}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              accessibilityHint={`Change the layout to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              <Ionicons
                name={viewMode === 'grid' ? 'list' : 'grid'}
                size={24}
                color={DesignSystem.colors.neutral[800]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButton}
              accessibilityRole="button"
              accessibilityLabel="Search wardrobe"
              accessibilityHint="Tap to search through your wardrobe items"
            >
              <Ionicons name="search" size={24} color={DesignSystem.colors.neutral[800]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <CategoryCard
            category={{
              id: 'all',
              name: 'All',
              icon: 'apps',
              count: SAMPLE_ITEMS.length,
              gradient: [DesignSystem.colors.neutral[100], DesignSystem.colors.neutral[50]],
            }}
            onPress={() => setSelectedCategory('all')}
            isSelected={selectedCategory === 'all'}
          />

          {SAMPLE_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onPress={() => setSelectedCategory(category.id)}
              isSelected={selectedCategory === category.id}
            />
          ))}
        </ScrollView>

        {/* Wardrobe Gallery */}
        <View style={styles.gallerySection}>
          <MorphingGallery
            items={filteredItems}
            viewMode={viewMode}
            onItemPress={handleItemPress}
          />
        </View>

        {/* Floating Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          accessibilityRole="button"
          accessibilityLabel="Add new item"
          accessibilityHint="Tap to add a new item to your wardrobe"
        >
          <LinearGradient
            colors={[DesignSystem.colors.coral[400], DesignSystem.colors.lavender[400]]}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={28} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },

  addButton: {
    backgroundColor: 'transparent',
    borderRadius: 32,
    bottom: DesignSystem.spacing.xxxl,
    height: 64,
    overflow: 'hidden',
    position: 'absolute',
    right: DesignSystem.spacing.lg,
    width: 64,
  },

  addButtonGradient: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  backgroundGradient: {
    flex: 1,
  },

  categoriesContainer: {
    gap: DesignSystem.spacing.md,
    paddingBottom: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.lg,
  },

  categoryCard: {
    borderRadius: DesignSystem.borderRadius.xl,
    height: 100,
    overflow: 'hidden',
    width: 120,
  },

  categoryContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: DesignSystem.spacing.md,
  },

  categoryCount: {
    color: DesignSystem.colors.neutral[500],
    marginTop: DesignSystem.spacing.xs,
    textAlign: 'center',
  },

  categoryGradient: {
    flex: 1,
  },

  categoryName: {
    color: DesignSystem.colors.neutral[800],
    marginTop: DesignSystem.spacing.xs,
    textAlign: 'center',
  },

  confidenceBar: {
    backgroundColor: DesignSystem.colors.neutral[100],
    borderRadius: 2,
    flex: 1,
    height: 4,
    overflow: 'hidden',
  },

  confidenceFill: {
    backgroundColor: DesignSystem.colors.sage[400],
    borderRadius: 2,
    height: '100%',
  },

  confidenceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },

  confidenceText: {
    color: DesignSystem.colors.neutral[500],
    minWidth: 35,
  },

  container: {
    flex: 1,
  },

  galleryContainer: {
    paddingBottom: DesignSystem.spacing.xxxl,
  },

  gallerySection: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.lg,
  },

  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.xxxl,
  },

  headerActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },

  headerButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.elevated + '4D',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },

  headerSubtitle: {
    color: DesignSystem.colors.neutral[500],
    marginTop: DesignSystem.spacing.xs,
  },

  headerTitle: {
    color: DesignSystem.colors.neutral[800],
  },

  itemActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemBlur: {
    flex: 1,
  },

  itemDetails: {
    color: DesignSystem.colors.neutral[500],
    marginBottom: DesignSystem.spacing.sm,
  },

  itemGradient: {
    flex: 1,
  },

  itemImage: {
    alignItems: 'center',
    borderRadius: 12,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },

  itemInfo: {
    flex: 1,
    marginLeft: DesignSystem.spacing.md,
  },

  itemName: {
    color: DesignSystem.colors.neutral[800],
    marginBottom: DesignSystem.spacing.xs,
  },

  itemTouchable: {
    flex: 1,
  },

  itemVisual: {
    marginBottom: DesignSystem.spacing.md,
  },

  wardrobeItem: {
    borderRadius: DesignSystem.borderRadius.xl,
    marginRight: DesignSystem.spacing.md,
    overflow: 'hidden',
  },
});

export default VisionWardrobeScreen;
