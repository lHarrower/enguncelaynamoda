import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';
import { TIMING } from '@/theme/foundations/Animation';
import { logInDev } from '@/utils/consoleSuppress';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  icon: string;
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
    icon: 'pants',
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
    icon: 'jacket',
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

const MorphingGallery: React.FC<MorphingGalleryProps> = ({ items, viewMode, onItemPress }) => {
  const morphProgress = useSharedValue(viewMode === 'grid' ? 0 : 1);

  useEffect(() => {
    morphProgress.value = withSpring(
      viewMode === 'grid' ? 0 : 1,
      DesignSystem.animations.spring.bouncy
    );
  }, [viewMode]);

  const renderItem = ({ item, index }: { item: WardrobeItem; index: number }) => {
    const animatedStyle = useAnimatedStyle(() => {
  const gridWidth = (SCREEN_WIDTH - DesignSystem.spacing.lg * 3) / 2;
  const listWidth = SCREEN_WIDTH - DesignSystem.spacing.lg * 2;
      
      const width = interpolate(
        morphProgress.value,
        [0, 1],
        [gridWidth, listWidth],
        Extrapolate.CLAMP
      );
      
      const height = interpolate(
        morphProgress.value,
        [0, 1],
        [gridWidth * 1.2, 80],
        Extrapolate.CLAMP
      );
      
      return {
        width,
        height,
        marginBottom: DesignSystem.spacing.md,
      };
    });

    const contentStyle = useAnimatedStyle(() => {
      const flexDirection = morphProgress.value > 0.5 ? 'row' : 'column';
      
      return {
        flexDirection: flexDirection as any,
        alignItems: morphProgress.value > 0.5 ? 'center' : 'flex-start',
        padding: interpolate(
          morphProgress.value,
          [0, 1],
          [DesignSystem.spacing.lg, DesignSystem.spacing.md],
          Extrapolate.CLAMP
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
                    <Ionicons 
                      name="shirt"
                      size={24} 
                      color={DesignSystem.colors.neutral[800]} 
                    />
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
                      <View 
                        style={[
                          styles.confidenceFill, 
                          { width: `${item.confidence}%` }
                        ]} 
                      />
                    </View>
                    <Text style={[DesignSystem.typography.body.small, styles.confidenceText]}>
                      {item.confidence}%
                    </Text>
                  </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons 
                      name="heart-outline" 
                      size={16} 
                      color={DesignSystem.colors.coral[400]} 
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </BlurView>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={viewMode === 'grid' ? 2 : 1}
      key={viewMode} // Force re-render when view mode changes
      contentContainerStyle={styles.galleryContainer}
      showsVerticalScrollIndicator={false}
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
  }, [isSelected]);

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
        <LinearGradient
          colors={category.gradient}
          style={styles.categoryGradient}
        >
          <BlurView intensity={25} style={styles.categoryContent}>
            <Ionicons 
              name={category.icon as any} 
              size={32} 
                      color={DesignSystem.colors.neutral[800]} 
            />
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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = SAMPLE_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleItemPress = (item: WardrobeItem) => {
    logInDev('Item pressed:', item.name);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
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
            <TouchableOpacity style={styles.headerButton} onPress={toggleViewMode}>
              <Ionicons 
                name={viewMode === 'grid' ? 'list' : 'grid'} 
                size={24} 
                color={DesignSystem.colors.neutral[800]} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons 
                name="search" 
                size={24} 
                color={DesignSystem.colors.neutral[800]} 
              />
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
          
          {SAMPLE_CATEGORIES.map(category => (
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
    <TouchableOpacity style={styles.addButton}>
          <LinearGradient
      colors={[DesignSystem.colors.coral[400], DesignSystem.colors.lavender[400]]}
            style={styles.addButtonGradient}
          >
            <Ionicons 
              name="add" 
              size={28} 
              color="white" 
            />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  backgroundGradient: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.xxxl,
    paddingBottom: DesignSystem.spacing.lg,
  },
  
  headerTitle: {
  color: DesignSystem.colors.neutral[800],
  },
  
  headerSubtitle: {
  color: DesignSystem.colors.neutral[500],
    marginTop: DesignSystem.spacing.xs,
  },
  
  headerActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  categoriesContainer: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.md,
  },
  
  categoryCard: {
    width: 120,
    height: 100,
  borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
  },
  
  categoryGradient: {
    flex: 1,
  },
  
  categoryContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: DesignSystem.spacing.md,
  },
  
  categoryName: {
  color: DesignSystem.colors.neutral[800],
    marginTop: DesignSystem.spacing.xs,
    textAlign: 'center',
  },
  
  categoryCount: {
  color: DesignSystem.colors.neutral[500],
    marginTop: DesignSystem.spacing.xs,
    textAlign: 'center',
  },
  
  gallerySection: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  
  galleryContainer: {
    paddingBottom: DesignSystem.spacing.xxxl,
  },
  
  wardrobeItem: {
  borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
    marginRight: DesignSystem.spacing.md,
  },
  
  itemTouchable: {
    flex: 1,
  },
  
  itemGradient: {
    flex: 1,
  },
  
  itemBlur: {
    flex: 1,
  },
  
  itemVisual: {
    marginBottom: DesignSystem.spacing.md,
  },
  
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  itemInfo: {
    flex: 1,
    marginLeft: DesignSystem.spacing.md,
  },
  
  itemName: {
  color: DesignSystem.colors.neutral[800],
    marginBottom: DesignSystem.spacing.xs,
  },
  
  itemDetails: {
  color: DesignSystem.colors.neutral[500],
    marginBottom: DesignSystem.spacing.sm,
  },
  
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
  },
  
  confidenceBar: {
    flex: 1,
    height: 4,
  backgroundColor: DesignSystem.colors.neutral[100],
    borderRadius: 2,
    overflow: 'hidden',
  },
  
  confidenceFill: {
    height: '100%',
  backgroundColor: DesignSystem.colors.sage[400],
    borderRadius: 2,
  },
  
  confidenceText: {
  color: DesignSystem.colors.neutral[500],
    minWidth: 35,
  },
  
  itemActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  addButton: {
    position: 'absolute',
    bottom: DesignSystem.spacing.xxxl,
    right: DesignSystem.spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  backgroundColor: 'transparent',
  },
  
  addButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VisionWardrobeScreen;