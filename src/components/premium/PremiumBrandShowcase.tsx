/**
 * Premium Brand Showcase Component
 *
 * Displays ARUOM, FIRED, and AYNAMODA premium brand cards
 * in an elegant showcase layout
 */

import React, { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

import { BrandType, PremiumBrandCard, PremiumBrandCardData } from './PremiumBrandCard';

const { width: screenWidth } = Dimensions.get('window');

// Sample premium brand data
const PREMIUM_BRAND_DATA: PremiumBrandCardData[] = [
  {
    id: '1',
    title: 'Minimalist Cashmere Coat',
    subtitle: 'Timeless Elegance',
    brand: 'ARUOM',
    price: '₺4,850',
    originalPrice: '₺5,200',
    imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=600&fit=crop',
    category: 'Outerwear',
    tags: ['Cashmere', 'Minimalist'],
    isLiked: false,
    isNew: true,
    discount: 7,
  },
  {
    id: '2',
    title: 'Bold Statement Dress',
    subtitle: 'Fierce Confidence',
    brand: 'FIRED',
    price: '₺2,650',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
    category: 'Dresses',
    tags: ['Bold', 'Evening'],
    isLiked: true,
    isNew: false,
  },
  {
    id: '3',
    title: 'Elegant Silk Blouse',
    subtitle: 'Sophisticated Grace',
    brand: 'AYNAMODA',
    price: '₺1,850',
    originalPrice: '₺2,100',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop',
    category: 'Tops',
    tags: ['Silk', 'Professional'],
    isLiked: false,
    isNew: false,
    discount: 12,
  },
  {
    id: '4',
    title: 'Structured Blazer',
    subtitle: 'Power Dressing',
    brand: 'ARUOM',
    price: '₺3,200',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
    category: 'Blazers',
    tags: ['Structured', 'Professional'],
    isLiked: false,
    isNew: true,
  },
  {
    id: '5',
    title: 'Vibrant Midi Skirt',
    subtitle: 'Expressive Style',
    brand: 'FIRED',
    price: '₺1,450',
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a13d44?w=400&h=600&fit=crop',
    category: 'Skirts',
    tags: ['Vibrant', 'Midi'],
    isLiked: true,
    isNew: false,
  },
  {
    id: '6',
    title: 'Classic Trench Coat',
    subtitle: 'Timeless Appeal',
    brand: 'AYNAMODA',
    price: '₺2,950',
    originalPrice: '₺3,300',
    imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=600&fit=crop',
    category: 'Outerwear',
    tags: ['Classic', 'Trench'],
    isLiked: false,
    isNew: false,
    discount: 11,
  },
];

interface PremiumBrandShowcaseProps {
  onItemPress?: (item: PremiumBrandCardData) => void;
  showFeatured?: boolean;
}

const PremiumBrandShowcase: React.FC<PremiumBrandShowcaseProps> = ({
  onItemPress,
  showFeatured = true,
}) => {
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const handleItemPress = (item: PremiumBrandCardData) => {
    if (onItemPress) {
      onItemPress(item);
    } else {
      Alert.alert(
        `${item.brand} - ${item.title}`,
        `Fiyat: ${item.price}\nKategori: ${item.category}`,
        [{ text: 'Tamam', style: 'default' }],
      );
    }
  };

  const handleLikeToggle = (itemId: string) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getBrandItems = (brand: BrandType) => {
    return PREMIUM_BRAND_DATA.filter((item) => item.brand === brand);
  };

  const renderBrandSection = (brand: BrandType, title: string) => {
    const brandItems = getBrandItems(brand);

    return (
      <View key={brand} style={styles.brandSection}>
        <Text style={styles.brandSectionTitle}>{title}</Text>
        <Text style={styles.brandSectionSubtitle}>
          {brand === 'ARUOM' && 'Minimalist Luxury'}
          {brand === 'FIRED' && 'Bold Expression'}
          {brand === 'AYNAMODA' && 'Confident Elegance'}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
          style={styles.horizontalScroll}
        >
          {brandItems.map((item, index) => (
            <View key={item.id} style={styles.cardContainer}>
              <PremiumBrandCard
                item={{
                  ...item,
                  isLiked: likedItems.has(item.id),
                }}
                onPress={() => handleItemPress(item)}
                onLikeToggle={() => handleLikeToggle(item.id)}
                variant={index === 0 && showFeatured ? 'featured' : 'standard'}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Premium Koleksiyonlar</Text>
        <Text style={styles.headerSubtitle}>Lüks markaların en seçkin parçaları</Text>
      </View>

      {/* Brand Sections */}
      {renderBrandSection('ARUOM', 'ARUOM Collection')}
      {renderBrandSection('FIRED', 'FIRED Collection')}
      {renderBrandSection('AYNAMODA', 'AYNAMODA Collection')}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Her marka kendine özgü tasarım felsefesi ile özenle seçilmiştir
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  brandSection: {
    marginBottom: DesignSystem.spacing.xl,
  },
  brandSectionSubtitle: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  brandSectionTitle: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  cardContainer: {
    marginRight: DesignSystem.spacing.md,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.xl,
  },
  footerText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text.secondary,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    paddingBottom: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.xl,
  },
  headerSubtitle: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    opacity: 0.8,
    textAlign: 'center',
  },
  headerTitle: {
    ...DesignSystem.typography.heading.h1,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
  horizontalScroll: {
    paddingLeft: DesignSystem.spacing.lg,
  },
  horizontalScrollContent: {
    paddingRight: DesignSystem.spacing.lg,
  },
  scrollContent: {
    paddingBottom: DesignSystem.spacing.xl,
  },
});

export default PremiumBrandShowcase;
export { PremiumBrandShowcase };
