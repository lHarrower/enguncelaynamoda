/**
 * Product Card Showcase
 * 
 * A showcase component demonstrating the vertical product cards
 * with swipe functionality and premium styling.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { VerticalProductCard, ProductCardData } from './VerticalProductCard';
import {
  ORIGINAL_COLORS,
  ORIGINAL_TYPOGRAPHY,
  ORIGINAL_SPACING,
} from '../auth/originalLoginStyles';

const { width: screenWidth } = Dimensions.get('window');

// Sample product data inspired by premium fashion
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
    isLiked: false,
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
    isLiked: true,
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
    tags: ['Structured', 'Professional'],
    isLiked: false,
  },
];

export const ProductCardShowcase: React.FC = () => {
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);

  const handleCardPress = (product: ProductCardData) => {
    Alert.alert(
      'Ürün Detayı',
      `${product.title} detaylarını görüntüle?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Görüntüle', onPress: () => console.log('Navigate to product:', product.id) },
      ]
    );
  };

  const handleLike = (product: ProductCardData) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === product.id ? { ...p, isLiked: product.isLiked } : p
      )
    );
  };

  const handleSwipe = (direction: 'left' | 'right', product: ProductCardData) => {
    const action = direction === 'right' ? 'beğenildi' : 'geçildi';
    Alert.alert(
      'Kaydırma Aksiyonu',
      `${product.title} ${action}!`,
      [{ text: 'Tamam' }]
    );
    
    // In a real app, you might remove the card or load new ones
    console.log(`Product ${product.id} swiped ${direction}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bugünün Seçkileri</Text>
        <Text style={styles.headerSubtitle}>Size özel küratörlük</Text>
      </View>

      {/* Horizontal Scroll of Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        snapToInterval={screenWidth * 0.85} // Card width + margin
        decelerationRate="fast"
        pagingEnabled={false}
      >
        {products.map((product, index) => (
          <VerticalProductCard
            key={product.id}
            product={product}
            onPress={handleCardPress}
            onLike={handleLike}
            onSwipe={handleSwipe}
            style={[
              styles.card,
              index === 0 && styles.firstCard,
              index === products.length - 1 && styles.lastCard,
            ]}
          />
        ))}
      </ScrollView>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Kartları sağa kaydırarak beğen, sola kaydırarak geç
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ORIGINAL_COLORS.background,
  },
  
  header: {
    paddingHorizontal: ORIGINAL_SPACING.containerHorizontal,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  
  headerTitle: {
    ...ORIGINAL_TYPOGRAPHY.title,
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  headerSubtitle: {
    ...ORIGINAL_TYPOGRAPHY.subtitle,
    fontSize: 16,
    textAlign: 'center',
  },
  
  scrollContainer: {
    paddingVertical: 20,
  },
  
  card: {
    marginHorizontal: 12,
  },
  
  firstCard: {
    marginLeft: ORIGINAL_SPACING.containerHorizontal,
  },
  
  lastCard: {
    marginRight: ORIGINAL_SPACING.containerHorizontal,
  },
  
  footer: {
    paddingHorizontal: ORIGINAL_SPACING.containerHorizontal,
    paddingVertical: 20,
    alignItems: 'center',
  },
  
  footerText: {
    ...ORIGINAL_TYPOGRAPHY.secondary,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ProductCardShowcase;