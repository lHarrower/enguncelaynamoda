import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';

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
          <Text style={styles.nameText} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.priceText}>{product.price}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    // The card itself has shadow, so container shouldn't have it
  },
  card: {
    backgroundColor: APP_THEME_V2.semantic.surface,
    borderRadius: APP_THEME_V2.radius.organic,
    padding: APP_THEME_V2.spacing.lg,
    ...APP_THEME_V2.elevation.lift,
    borderWidth: 1,
    borderColor: APP_THEME_V2.colors.moonlightSilver,
    width: '100%',
    overflow: 'hidden', // Ensures the image respects the card's border radius
  },
  productImage: {
    width: '100%',
    height: width - (APP_THEME_V2.spacing.xl * 2) - (APP_THEME_V2.spacing.lg * 2),
    aspectRatio: 0.8, // Editorial-style portrait aspect ratio
    borderRadius: APP_THEME_V2.radius.md,
    marginBottom: APP_THEME_V2.spacing.md,
    backgroundColor: APP_THEME_V2.colors.cloudGray,
  },
  infoContainer: {
    paddingHorizontal: 4, // Slight inner padding for text
  },
  brandText: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.semantic.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  nameText: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.primary,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 8,
  },
  priceText: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.primary,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ProductCard; 