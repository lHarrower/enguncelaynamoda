import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';
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
    borderRadius: APP_THEME_V2.radius.organic,
    backgroundColor: APP_THEME_V2.semantic.surface,
    ...APP_THEME_V2.elevation.lift,
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
    padding: APP_THEME_V2.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomLeftRadius: APP_THEME_V2.radius.organic,
    borderBottomRightRadius: APP_THEME_V2.radius.organic,
  },
  infoContainer: {
    // Content is aligned via the overlay's padding
  },
  brandText: {
    ...APP_THEME_V2.typography.scale.caption,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    color: APP_THEME_V2.colors.whisperWhite,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  nameText: {
    ...APP_THEME_V2.typography.scale.h3,
    fontFamily: APP_THEME_V2.typography.fonts.display,
    color: '#FFFFFF',
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  priceText: {
    ...APP_THEME_V2.typography.scale.body1,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default LuxuryDiscoverCard; 