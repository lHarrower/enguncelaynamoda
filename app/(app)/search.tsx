import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@shopify/restyle';
import { DesignSystemType } from '@/theme/DesignSystem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SEMANTIC_TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/AppConstants';

// Sample data for search/discovery
const TRENDING_SEARCHES = [
  'Blazers',
  'Silk blouses',
  'Wide-leg trousers',
  'Minimalist jewelry',
  'Cashmere sweaters',
];

const CATEGORIES = [
  { id: '1', name: 'New In', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=300&fit=crop' },
  { id: '2', name: 'Dresses', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=300&fit=crop' },
  { id: '3', name: 'Blazers', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=300&fit=crop' },
  { id: '4', name: 'Accessories', image: 'https://images.unsplash.com/photo-1506629905607-c7a8b3bb0aa3?w=400&h=300&fit=crop' },
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
  const theme = useTheme<DesignSystemType>();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.categoryCard} activeOpacity={0.9}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.categoryImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.6)']}
          style={styles.categoryOverlay}
        >
            <Text style={[styles.categoryName, { color: colors.background?.primary || '#FAF9F6' }]}>
            {item.name}
          </Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderCollection = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.collectionCard} activeOpacity={0.9}>
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
            <Text style={[styles.collectionTitle, { color: colors.background?.primary || '#FAF9F6' }]}>
              {item.title}
            </Text>
            <Text style={[styles.collectionSubtitle, { color: colors.background?.primary || '#FAF9F6' }]}>
              {item.subtitle}
            </Text>
            <Text style={[styles.collectionCount, { color: colors.background?.primary || '#FAF9F6' }]}>
              {item.itemCount} items
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.9}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
  <Text style={[styles.productTitle, { color: (colors as any).text?.primary || '#212529' }]}>
          {item.title}
        </Text>
  <Text style={[styles.productPrice, { color: (colors as any).text?.secondary || '#495057' }]}>
          {item.price}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for items, brands, styles..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666666" />
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
              <Text style={styles.sectionTitle}>
                Trending
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.trendingContainer}>
                  {TRENDING_SEARCHES.map((term, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.trendingTag, { backgroundColor: (colors as any).surface?.primary || '#FEFEFE', borderColor: (colors as any).border || '#D1D5DB' }]}
                      onPress={() => setSearchQuery(term)}
                    >
                      <Text style={[styles.trendingText, { color: (colors as any).text?.primary || '#212529' }]}>
                        {term}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: (colors as any).text?.primary || '#212529' }]}> 
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
              <Text style={[styles.sectionTitle, { color: (colors as any).text?.primary || '#212529' }]}> 
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
          <Text style={[styles.sectionTitle, { color: (colors as any).text?.primary || '#212529' }]}> 
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
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    ...SEMANTIC_TYPOGRAPHY.inputText,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.large,
    borderWidth: 1,
  },
  trendingText: {
    ...SEMANTIC_TYPOGRAPHY.caption,
  },
  
  // Categories
  categoriesContainer: {
    paddingRight: SPACING.lg,
  },
  categoryCard: {
    width: 120,
    height: 80,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
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
    fontSize: 12,
  },
  
  // Collections
  collectionsContainer: {
    paddingRight: SPACING.lg,
  },
  collectionCard: {
    width: 280,
    height: 160,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
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
    fontSize: 18,
    marginBottom: SPACING.xs,
  },
  collectionSubtitle: {
    ...SEMANTIC_TYPOGRAPHY.caption,
    opacity: 0.9,
    marginBottom: SPACING.xs,
  },
  collectionCount: {
    ...SEMANTIC_TYPOGRAPHY.caption,
    fontSize: 11,
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
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.small,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
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