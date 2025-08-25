import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

import { DesignSystem } from '../../theme/DesignSystem';

const { width } = Dimensions.get('window');

// Define the types for the props to ensure type safety
export interface Product {
  id: string;
  brand: string;
  name: string;
  price: string;
  image: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.infoContainer}>
          <Text style={styles.brandText}>{product.brand}</Text>
          <Text style={styles.nameText} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.priceText}>{product.price}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  brandText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.lg,
    ...DesignSystem.elevation.medium,
    borderColor: DesignSystem.colors.sage[200],
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%', // Ensures the image respects the card's border radius
  },
  cardContainer: {
    paddingHorizontal: DesignSystem.spacing.xl,
    // The card itself has shadow, so container shouldn't have it
  },
  infoContainer: {
    paddingHorizontal: 4, // Slight inner padding for text
  },
  nameText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 8,
  },
  priceText: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 16,
    fontWeight: '600',
  },
  productImage: {
    width: '100%',
    height: width - DesignSystem.spacing.xl * 2 - DesignSystem.spacing.lg * 2,
    aspectRatio: 0.8, // Editorial-style portrait aspect ratio
    borderRadius: DesignSystem.borderRadius.md,
    marginBottom: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.sage[100],
  },
});

export default ProductCard;
