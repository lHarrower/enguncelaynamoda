import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';
import Animated from 'react-native-reanimated';

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
                <Text style={styles.nameText} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.priceText}>{product.price}</Text>
            </View>
        </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: DesignSystem.radius.lg,
    backgroundColor: DesignSystem.colors.background.secondary,
    ...DesignSystem.elevation.medium,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  productImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: DesignSystem.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomLeftRadius: DesignSystem.radius.lg,
    borderBottomRightRadius: DesignSystem.radius.lg,
  },
  infoContainer: {
    // Content is aligned via the overlay's padding
  },
  brandText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: DesignSystem.spacing.sm,
  },
  nameText: {
    ...DesignSystem.typography.h3,
    color: '#FFFFFF',
    marginBottom: DesignSystem.spacing.sm,
  },
  priceText: {
    ...DesignSystem.typography.body1,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default LuxuryDiscoverCard;