import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_ASPECT_RATIO = 0.75; // Portrait orientation
const CARD_HEIGHT = CARD_WIDTH / CARD_ASPECT_RATIO;

export interface Product {
  id: string;
  brand: string;
  name: string;
  price: string;
  image: string;
}

interface LuxuryDiscoverCardProps {
  product: Product;
}

const LuxuryDiscoverCard: React.FC<LuxuryDiscoverCardProps> = ({ product }) => {
  return (
    <Animated.View style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <View style={styles.overlay}>
        <View style={styles.infoContainer}>
          <Text style={styles.brandText}>{product.brand}</Text>
          <Text style={styles.nameText} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.priceText}>{product.price}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  brandText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    letterSpacing: 1,
    marginBottom: DesignSystem.spacing.sm,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.radius.lg,
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    ...DesignSystem.elevation.medium,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  infoContainer: {
    // Content is aligned via the overlay's padding
  },
  nameText: {
    ...DesignSystem.typography.heading.h3,
    color: '#FFFFFF',
    marginBottom: DesignSystem.spacing.sm,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomLeftRadius: DesignSystem.radius.lg,
    borderBottomRightRadius: DesignSystem.radius.lg,
    bottom: 0,
    left: 0,
    padding: DesignSystem.spacing.md,
    position: 'absolute',
    right: 0,
  },
  priceText: {
    ...DesignSystem.typography.body.medium,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  productImage: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
  },
});

export default LuxuryDiscoverCard;
