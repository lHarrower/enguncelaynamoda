/**
 * Product Card Showcase Component
 *
 * Displays different product card variants in an elegant showcase layout
 * Supports filtering by category, brand, and price range
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

import { ProductCard, ProductCardData } from './ProductCard';

const { width: screenWidth } = Dimensions.get('window');

interface ProductCardShowcaseProps {
  /** Products to display */
  products?: ProductCardData[];

  /** Title for the showcase */
  title?: string;

  /** Subtitle for the showcase */
  subtitle?: string;

  /** Card variant to use */
  variant?: 'standard' | 'premium' | 'compact' | 'featured';

  /** Card size */
  size?: 'small' | 'medium' | 'large';

  /** Number of columns for grid layout */
  numColumns?: number;

  /** Whether to show filters */
  showFilters?: boolean;

  /** Whether to show sort options */
  showSort?: boolean;

  /** Layout type */
  layout?: 'grid' | 'list' | 'carousel';

  /** Callback when product is pressed */
  onProductPress?: (product: ProductCardData) => void;

  /** Callback when product is liked */
  onProductLike?: (product: ProductCardData) => void;
}

// Sample product data
const SAMPLE_PRODUCTS: ProductCardData[] = [
  {
    id: '1',
    title: 'Minimalist Cashmere Coat',
    subtitle: 'Timeless Elegance',
    brand: 'AYNAMODA',
    price: '₺2,850',
    originalPrice: '₺3,200',
    imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=600&fit=crop',
    category: 'Outerwear',
    tags: ['Cashmere', 'Minimalist'],
    colors: ['#F5F5DC', '#8B4513', '#2F4F4F'],
    isLiked: false,
    isNew: true,
    discount: 11,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: '2',
    title: 'Silk Midi Dress',
    subtitle: 'Evening Grace',
    brand: 'AYNAMODA',
    price: '₺1,650',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
    category: 'Dresses',
    tags: ['Silk', 'Evening'],
    colors: ['#000000', '#8B0000'],
    isLiked: true,
    rating: 4.6,
    reviewCount: 89,
  },
  {
    id: '3',
    title: 'Structured Blazer',
    subtitle: 'Power Dressing',
    brand: 'AYNAMODA',
    price: '₺2,100',
    originalPrice: '₺2,400',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
    category: 'Blazers',
    tags: ['Professional', 'Structured'],
    colors: ['#000000', '#FFFFFF', '#808080'],
    isLiked: false,
    discount: 13,
    rating: 4.7,
    reviewCount: 156,
  },
  {
    id: '4',
    title: 'Luxury Handbag',
    subtitle: 'Artisan Crafted',
    brand: 'ARUOM',
    price: '₺3,500',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=600&fit=crop',
    category: 'Accessories',
    tags: ['Leather', 'Luxury'],
    colors: ['#8B4513', '#000000'],
    isLiked: true,
    isNew: true,
    rating: 4.9,
    reviewCount: 67,
  },
  {
    id: '5',
    title: 'Statement Earrings',
    subtitle: 'Bold Expression',
    brand: 'FIRED',
    price: '₺850',
    originalPrice: '₺1,000',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=600&fit=crop',
    category: 'Jewelry',
    tags: ['Statement', 'Gold'],
    colors: ['#FFD700', '#FF6B6B'],
    isLiked: false,
    discount: 15,
    rating: 4.5,
    reviewCount: 43,
  },
  {
    id: '6',
    title: 'Cashmere Scarf',
    subtitle: 'Soft Luxury',
    brand: 'AYNAMODA',
    price: '₺750',
    imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=600&fit=crop',
    category: 'Accessories',
    tags: ['Cashmere', 'Soft'],
    colors: ['#F5F5DC', '#D2B48C', '#8B4513'],
    isLiked: true,
    rating: 4.4,
    reviewCount: 78,
  },
];

const CATEGORIES = ['Tümü', 'Outerwear', 'Dresses', 'Blazers', 'Accessories', 'Jewelry'];
const BRANDS = ['Tümü', 'AYNAMODA', 'ARUOM', 'FIRED'];
const SORT_OPTIONS = [
  { label: 'Önerilen', value: 'recommended' },
  { label: 'Fiyat: Düşük-Yüksek', value: 'price_asc' },
  { label: 'Fiyat: Yüksek-Düşük', value: 'price_desc' },
  { label: 'Yeni Ürünler', value: 'newest' },
  { label: 'En Çok Beğenilen', value: 'rating' },
];

const ProductCardShowcase: React.FC<ProductCardShowcaseProps> = ({
  products = SAMPLE_PRODUCTS,
  title = 'Ürün Koleksiyonu',
  subtitle,
  variant = 'standard',
  size = 'medium',
  numColumns = 2,
  showFilters = true,
  showSort = true,
  layout = 'grid',
  onProductPress,
  onProductLike,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedBrand, setSelectedBrand] = useState('Tümü');
  const [sortBy, setSortBy] = useState('recommended');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'Tümü') {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Filter by brand
    if (selectedBrand !== 'Tümü') {
      filtered = filtered.filter((product) => product.brand === selectedBrand);
    }

    // Sort products
    switch (sortBy) {
      case 'price_asc':
        return filtered.sort((a, b) => {
          const priceA = parseFloat(a.price.replace('₺', '').replace(',', ''));
          const priceB = parseFloat(b.price.replace('₺', '').replace(',', ''));
          return priceA - priceB;
        });
      case 'price_desc':
        return filtered.sort((a, b) => {
          const priceA = parseFloat(a.price.replace('₺', '').replace(',', ''));
          const priceB = parseFloat(b.price.replace('₺', '').replace(',', ''));
          return priceB - priceA;
        });
      case 'newest':
        return filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case 'rating':
        return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return filtered;
    }
  }, [products, selectedCategory, selectedBrand, sortBy]);

  const handleProductPress = (product: ProductCardData) => {
    onProductPress?.(product);
  };

  const handleProductLike = (product: ProductCardData) => {
    onProductLike?.(product);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {(showFilters || showSort) && (
        <View style={styles.controlsContainer}>
          {showFilters && (
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFiltersPanel(!showFiltersPanel)}
            >
              <Ionicons name="options-outline" size={20} color={DesignSystem.colors.text.primary} />
              <Text style={styles.filterButtonText}>Filtrele</Text>
            </TouchableOpacity>
          )}

          {showSort && (
            <TouchableOpacity style={styles.sortButton}>
              <Ionicons
                name="swap-vertical-outline"
                size={20}
                color={DesignSystem.colors.text.primary}
              />
              <Text style={styles.sortButtonText}>Sırala</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderFiltersPanel = () => {
    if (!showFiltersPanel) {
      return null;
    }

    return (
      <View style={styles.filtersPanel}>
        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Kategori</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterOptions}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    selectedCategory === category && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedCategory === category && styles.filterOptionTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Brand Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Marka</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterOptions}>
              {BRANDS.map((brand) => (
                <TouchableOpacity
                  key={brand}
                  style={[
                    styles.filterOption,
                    selectedBrand === brand && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedBrand(brand)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${brand}`}
                  accessibilityHint={`Tap to filter products by ${brand} brand`}
                  accessibilityState={{ selected: selectedBrand === brand }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedBrand === brand && styles.filterOptionTextActive,
                    ]}
                  >
                    {brand}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderProductGrid = () => {
    if (layout === 'carousel') {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {filteredAndSortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant={variant}
              size={size}
              onPress={handleProductPress}
              onLike={handleProductLike}
              style={styles.carouselCard}
            />
          ))}
        </ScrollView>
      );
    }

    return (
      <FlatList
        data={filteredAndSortedProducts}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            variant={variant}
            size={size}
            onPress={handleProductPress}
            onLike={handleProductLike}
            style={layout === 'list' ? styles.listCard : styles.gridCard}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={layout === 'list' ? 1 : numColumns}
        contentContainerStyle={styles.productGrid}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        nestedScrollEnabled={true}
        scrollEnabled={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderFiltersPanel()}

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>{filteredAndSortedProducts.length} ürün bulundu</Text>
      </View>

      {renderProductGrid()}
    </View>
  );
};

const styles = StyleSheet.create({
  carouselCard: {
    marginRight: DesignSystem.spacing.md,
  },
  carouselContainer: {
    paddingBottom: DesignSystem.spacing.xl,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  controlsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.md,
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  filterButtonText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
  },
  filterOption: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  filterOptionActive: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderColor: DesignSystem.colors.sage[500],
  },
  filterOptionText: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.primary,
  },
  filterOptionTextActive: {
    color: DesignSystem.colors.text.inverse,
    fontWeight: '600',
  },
  filterOptions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  filterSection: {
    marginBottom: DesignSystem.spacing.md,
  },
  filterSectionTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  filtersPanel: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    paddingVertical: DesignSystem.spacing.md,
  },
  gridCard: {
    flex: 1,
    marginHorizontal: DesignSystem.spacing.xs,
  },
  header: {
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  listCard: {
    marginBottom: DesignSystem.spacing.md,
  },
  productGrid: {
    paddingBottom: DesignSystem.spacing.xl,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  resultsContainer: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  resultsText: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
  },
  separator: {
    height: DesignSystem.spacing.md,
  },
  sortButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.md,
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  sortButtonText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
  },
  subtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
  },
  title: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  titleContainer: {
    marginBottom: DesignSystem.spacing.md,
  },
});

export default ProductCardShowcase;
export { ProductCardShowcase };
