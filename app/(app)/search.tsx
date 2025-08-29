import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BORDER_RADIUS, SEMANTIC_TYPOGRAPHY, SPACING } from '@/constants/AppConstants';
import { DesignSystem } from '@/theme/DesignSystem';

// Sample data for search/discovery
const TRENDING_SEARCHES = [
  'Blazers',
  'Silk blouses',
  'Wide-leg trousers',
  'Minimalist jewelry',
  'Cashmere sweaters',
];

const CATEGORIES = [
  {
    id: '1',
    name: 'New In',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    name: 'Dresses',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'Blazers',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=300&fit=crop',
  },
  {
    id: '4',
    name: 'Accessories',
    image: 'https://images.unsplash.com/photo-1506629905607-c7a8b3bb0aa3?w=400&h=300&fit=crop',
  },
];

const CURATED_COLLECTIONS = [
  {
    id: '1',
    title: 'Workwear Essentials',
    subtitle: 'Professional pieces for the modern woman',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=400&fit=crop',
    itemCount: 24,
  },
  {
    id: '2',
    title: 'Weekend Comfort',
    subtitle: 'Relaxed yet refined pieces',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=400&fit=crop',
    itemCount: 18,
  },
  {
    id: '3',
    title: 'Statement Pieces',
    subtitle: 'Bold choices for special occasions',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=400&fit=crop',
    itemCount: 12,
  },
];

const FEATURED_PRODUCTS = [
  {
    id: '1',
    title: 'Structured Blazer',
    price: '€129.00',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
  },
  {
    id: '2',
    title: 'Silk Camisole',
    price: '€79.00',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop',
  },
  {
    id: '3',
    title: 'Wide-leg Trousers',
    price: '€89.00',
    image: 'https://images.unsplash.com/photo-1506629905607-c7a8b3bb0aa3?w=300&h=400&fit=crop',
  },
  {
    id: '4',
    title: 'Cashmere Sweater',
    price: '€159.00',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&h=400&fit=crop',
  },
];

export default function SearchScreen() {
  const colors = DesignSystem.colors;
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [_activeFilter, _setActiveFilter] = useState('All');

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        // Import wardrobeService dynamically to avoid circular dependencies
        const { wardrobeService } = await import('@/services/wardrobeService');
        const searchResults = await wardrobeService.searchItems(query);
        // TODO: Update UI to show search results
      } catch (error) {
        // Search failed - handle silently in production
      }
    }
  }, []);

  const handleCategoryPress = useCallback((categoryId: string) => {
    // Implement category filtering logic here
  }, []);

  const handleCollectionPress = useCallback((collectionId: string) => {
    // Implement collection navigation logic here
  }, []);

  const handleProductPress = useCallback((productId: string) => {
    // Implement product navigation logic here
  }, []);

  const renderCategory = useCallback(
    ({ item }: { item: { image: string; name: string; id: string } }) => (
      <TouchableOpacity
        style={styles.categoryCard}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} category`}
        accessibilityHint={`Browse ${item.name} items`}
        onPress={() => handleCategoryPress(item.id)}
      >
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.categoryImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.6)']}
            style={styles.categoryOverlay}
          >
            <Text style={[styles.categoryName, { color: colors.text.inverse }]}>{item.name}</Text>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    ),
    [handleCategoryPress, colors.text.inverse],
  );

  const renderCollection = useCallback(
    ({
      item,
    }: {
      item: { image: string; title: string; subtitle: string; itemCount: number; id: string };
    }) => (
      <TouchableOpacity
        style={styles.collectionCard}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`${item.title} collection`}
        accessibilityHint={`View ${item.title} collection with ${item.itemCount} items`}
        onPress={() => handleCollectionPress(item.id)}
      >
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.collectionImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
            style={styles.collectionOverlay}
          >
            <View style={styles.collectionContent}>
              <Text style={[styles.collectionTitle, { color: colors.text.inverse }]}>
                {item.title}
              </Text>
              <Text style={[styles.collectionSubtitle, { color: colors.text.inverse }]}>
                {item.subtitle}
              </Text>
              <Text style={[styles.collectionCount, { color: colors.text.inverse }]}>
                {item.itemCount} items
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    ),
    [handleCollectionPress, colors.text.inverse],
  );

  const renderProduct = useCallback(
    ({ item }: { item: { image: string; title: string; price: string; id: string } }) => (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`${item.title} product`}
        accessibilityHint={`View ${item.title} details, priced at ${item.price}`}
        onPress={() => handleProductPress(item.id)}
      >
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={[styles.productTitle, { color: colors.text.primary }]}>{item.title}</Text>
          <Text style={[styles.productPrice, { color: colors.text.secondary }]}>{item.price}</Text>
        </View>
      </TouchableOpacity>
    ),
    [handleProductPress, colors.text?.primary, colors.text?.secondary],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={DesignSystem.colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for items, brands, styles..."
            placeholderTextColor={DesignSystem.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search input"
            accessibilityHint="Enter text to search for items, brands, or styles"
            accessibilityRole="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              accessibilityHint="Clear the search input"
            >
              <Ionicons name="close-circle" size={20} color={DesignSystem.colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 70 + insets.bottom }}
      >
        {/* Trending Searches */}
        {searchQuery.length === 0 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.trendingContainer}>
                  {TRENDING_SEARCHES.map((term, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.trendingTag,
                        {
                          backgroundColor: colors.background.elevated,
                          borderColor: colors.border.primary,
                        },
                      ]}
                      onPress={() => handleSearch(term)}
                      accessibilityRole="button"
                      accessibilityLabel={`Search for ${term}`}
                      accessibilityHint={`Tap to search for ${term} items`}
                    >
                      <Text style={[styles.trendingText, { color: colors.text.primary }]}>
                        {term}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Shop by Category
              </Text>
              <FlatList
                data={CATEGORIES}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              />
            </View>

            {/* Curated Collections */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Curated Collections
              </Text>
              <FlatList
                data={CURATED_COLLECTIONS}
                renderItem={renderCollection}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.collectionsContainer}
              />
            </View>
          </>
        )}

        {/* Search Results or Featured Products */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {searchQuery.length > 0 ? `Results for "${searchQuery}"` : 'Featured'}
          </Text>
          <FlatList
            data={FEATURED_PRODUCTS}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  searchHeader: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    ...SEMANTIC_TYPOGRAPHY.inputText,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    ...SEMANTIC_TYPOGRAPHY.sectionTitle,
    marginBottom: SPACING.lg,
  },

  // Trending
  trendingContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  trendingTag: {
    borderRadius: BORDER_RADIUS.large,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  trendingText: {
    ...SEMANTIC_TYPOGRAPHY.caption,
  },

  // Categories
  categoriesContainer: {
    paddingRight: SPACING.lg,
  },
  categoryCard: {
    borderRadius: BORDER_RADIUS.medium,
    height: 80,
    marginRight: SPACING.md,
    overflow: 'hidden',
    width: 120,
  },
  categoryImage: {
    flex: 1,
  },
  categoryOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: SPACING.sm,
  },
  categoryName: {
    ...SEMANTIC_TYPOGRAPHY.buttonSecondary,
    fontSize: DesignSystem.typography.sizes.xs,
  },

  // Collections
  collectionsContainer: {
    paddingRight: SPACING.lg,
  },
  collectionCard: {
    borderRadius: BORDER_RADIUS.medium,
    height: 160,
    marginRight: SPACING.md,
    overflow: 'hidden',
    width: 280,
  },
  collectionImage: {
    flex: 1,
  },
  collectionOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  collectionContent: {
    padding: SPACING.md,
  },
  collectionTitle: {
    ...SEMANTIC_TYPOGRAPHY.sectionTitle,
    fontSize: DesignSystem.typography.sizes.lg,
    marginBottom: SPACING.xs,
  },
  collectionSubtitle: {
    ...SEMANTIC_TYPOGRAPHY.caption,
    marginBottom: SPACING.xs,
    opacity: 0.9,
  },
  collectionCount: {
    ...SEMANTIC_TYPOGRAPHY.caption,
    fontSize: DesignSystem.typography.sizes.xs,
    opacity: 0.8,
  },

  // Products
  productRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  productCard: {
    width: '48%',
  },
  productImage: {
    borderRadius: BORDER_RADIUS.small,
    height: 200,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    width: '100%',
  },
  productInfo: {
    gap: SPACING.xs,
  },
  productTitle: {
    ...SEMANTIC_TYPOGRAPHY.productTitle,
  },
  productPrice: {
    ...SEMANTIC_TYPOGRAPHY.productPrice,
  },
});
