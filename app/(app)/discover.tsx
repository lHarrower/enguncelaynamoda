// Discover Screen - The New Paradigm for Interaction
// Complete Discovery Engine with Tinder-style swipe mechanism

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STUDIO_THEME } from '../../constants/StudioTheme';
import DiscoveryEngine from '../../components/discovery/DiscoveryEngine';

interface ProductItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  boutique: string;
  category: string;
  colors: string[];
  style: string[];
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [likedItems, setLikedItems] = useState<ProductItem[]>([]);
  const [dislikedItems, setDislikedItems] = useState<ProductItem[]>([]);
  const [favoriteBoutiques, setFavoriteBoutiques] = useState<string[]>([]);

  // Sample discovery items - discounted products from various boutiques
  const discoveryItems: ProductItem[] = [
    {
      id: 'd1',
      title: 'Designer Silk Scarf with Abstract Print',
      brand: 'Luxury Atelier',
      price: 89,
      originalPrice: 145,
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop&q=80',
      boutique: 'Madison Avenue Boutique',
      category: 'accessories',
      colors: ['blue', 'gold', 'white'],
      style: ['elegant', 'sophisticated'],
    },
    {
      id: 'd2',
      title: 'Tailored Wool Coat with Belt',
      brand: 'Urban Elegance',
      price: 245,
      originalPrice: 380,
      image: 'https://images.unsplash.com/photo-1581044777550-4cfa6ce670c0?w=400&h=600&fit=crop&q=80',
      boutique: 'Executive Style Co.',
      category: 'outerwear',
      colors: ['navy', 'black'],
      style: ['professional', 'classic'],
    },
    {
      id: 'd3',
      title: 'Flowing Midi Dress with Floral Pattern',
      brand: 'Bohemian Dreams',
      price: 125,
      originalPrice: 195,
      image: 'https://images.unsplash.com/photo-1594619336195-39a8f2712533?w=400&h=600&fit=crop&q=80',
      boutique: 'Boutique Bella',
      category: 'dresses',
      colors: ['pink', 'green', 'cream'],
      style: ['romantic', 'feminine'],
    },
    {
      id: 'd4',
      title: 'Leather Ankle Boots with Block Heel',
      brand: 'Artisan Footwear',
      price: 165,
      originalPrice: 220,
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop&q=80',
      boutique: 'Sole Society',
      category: 'shoes',
      colors: ['brown', 'black'],
      style: ['casual', 'versatile'],
    },
    {
      id: 'd5',
      title: 'Cashmere Blend Sweater',
      brand: 'Cozy Luxe',
      price: 98,
      originalPrice: 140,
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop&q=80',
      boutique: 'Madison Avenue Boutique',
      category: 'knitwear',
      colors: ['cream', 'beige'],
      style: ['comfortable', 'elegant'],
    },
    {
      id: 'd6',
      title: 'Statement Gold Necklace',
      brand: 'Jewelry Atelier',
      price: 75,
      originalPrice: 120,
      image: 'https://images.unsplash.com/photo-1581044777550-4cfa6ce670c0?w=400&h=600&fit=crop&q=80',
      boutique: 'Gilded Gallery',
      category: 'jewelry',
      colors: ['gold'],
      style: ['bold', 'statement'],
    },
    {
      id: 'd7',
      title: 'High-Waisted Trousers',
      brand: 'Modern Minimalist',
      price: 110,
      originalPrice: 160,
      image: 'https://images.unsplash.com/photo-1594619336195-39a8f2712533?w=400&h=600&fit=crop&q=80',
      boutique: 'Executive Style Co.',
      category: 'bottoms',
      colors: ['black', 'navy'],
      style: ['professional', 'modern'],
    },
    {
      id: 'd8',
      title: 'Vintage-Inspired Handbag',
      brand: 'Heritage Collection',
      price: 185,
      originalPrice: 275,
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop&q=80',
      boutique: 'Boutique Bella',
      category: 'bags',
      colors: ['burgundy', 'brown'],
      style: ['vintage', 'classic'],
    },
  ];

  // Handle like action - learn user preferences
  const handleLike = (item: ProductItem) => {
    setLikedItems(prev => [...prev, item]);
    
    // In a real app, this would update the ML algorithm
    console.log('Learning from liked item:', {
      brand: item.brand,
      category: item.category,
      colors: item.colors,
      style: item.style,
      boutique: item.boutique,
    });
  };

  // Handle dislike action - suppress similar items
  const handleDislike = (item: ProductItem) => {
    setDislikedItems(prev => [...prev, item]);
    
    // In a real app, this would update the ML algorithm to show fewer similar items
    console.log('Learning from disliked item:', {
      brand: item.brand,
      category: item.category,
      colors: item.colors,
      style: item.style,
    });
  };

  // Handle boutique favorite
  const handleBoutiqueFavorite = (boutique: string) => {
    setFavoriteBoutiques(prev => [...prev, boutique]);
    console.log('Added favorite boutique:', boutique);
    
    // In a real app, this would:
    // 1. Save to user preferences
    // 2. Show more items from this boutique
    // 3. Send notifications when new items arrive
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={STUDIO_THEME.colors.foundation.primary} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>
          Swipe right to love, left to pass
        </Text>
      </View>

      {/* Discovery Engine */}
      <DiscoveryEngine
        items={discoveryItems}
        onLike={handleLike}
        onDislike={handleDislike}
        onBoutiqueFavorite={handleBoutiqueFavorite}
        style={styles.discoveryEngine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: STUDIO_THEME.colors.foundation.primary,
  },
  header: {
    paddingHorizontal: STUDIO_THEME.spacing.xl,
    marginBottom: STUDIO_THEME.spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    ...STUDIO_THEME.typography.scale.hero,
    color: STUDIO_THEME.colors.text.primary,
    fontSize: 32,
    marginBottom: 8,
  },
  headerSubtitle: {
    ...STUDIO_THEME.typography.scale.body,
    color: STUDIO_THEME.colors.text.secondary,
    textAlign: 'center',
  },
  discoveryEngine: {
    flex: 1,
  },
});