import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

interface StyleMatchCardProps {
  item: {
    id: string;
    brand: string;
    product: string;
    price: string;
    discount: string;
    image: string;
  };
  style: any;
  likeOpacity: any;
  dislikeOpacity: any;
}

const StyleMatchCard: React.FC<StyleMatchCardProps> = ({ 
  item, 
  style,
  likeOpacity,
  dislikeOpacity 
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - (APP_THEME_V2.spacing.xl * 2);

  return (
    <Animated.View style={[styles.cardContainer, { width: cardWidth }, style]}>
      <Image source={{ uri: item.image }} style={styles.image} />
      
      <Animated.View style={[styles.iconOverlay, styles.likeIcon, likeOpacity]}>
        <Ionicons name="heart" size={48} color={APP_THEME_V2.colors.whisperWhite} />
      </Animated.View>
      <Animated.View style={[styles.iconOverlay, styles.dislikeIcon, dislikeOpacity]}>
        <Ionicons name="close-outline" size={60} color={APP_THEME_V2.colors.whisperWhite} />
      </Animated.View>
      
      <View style={styles.textContainer}>
        <Text style={styles.brandText}>{item.brand}</Text>
        <Text style={styles.productText} numberOfLines={1}>{item.product}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{item.price}</Text>
          <View style={styles.discountChip}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 240,
    backgroundColor: APP_THEME_V2.semantic.surface,
    borderRadius: APP_THEME_V2.radius.organic,
    ...APP_THEME_V2.elevation.lift,
    borderWidth: 1,
    borderColor: APP_THEME_V2.colors.moonlightSilver,
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: APP_THEME_V2.radius.organic,
    borderTopRightRadius: APP_THEME_V2.radius.organic,
  },
  iconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 90, // Match text container's space
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: APP_THEME_V2.radius.organic,
  },
  likeIcon: {
    backgroundColor: 'rgba(92, 138, 92, 0.9)', // Sage green with transparency
  },
  dislikeIcon: {
    backgroundColor: 'rgba(44, 44, 46, 0.9)', // Shadow charcoal with transparency
  },
  textContainer: {
    padding: APP_THEME_V2.spacing.md,
    height: 90, // Fixed height for consistency
    justifyContent: 'center',
  },
  brandText: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.semantic.text.secondary,
    marginBottom: APP_THEME_V2.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  productText: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.primary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.sm,
    fontFamily: APP_THEME_V2.typography.fonts.body,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: APP_THEME_V2.spacing.sm,
  },
  priceText: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.secondary,
    fontFamily: APP_THEME_V2.typography.fonts.body,
  },
  discountChip: {
    backgroundColor: APP_THEME_V2.semantic.accent,
    paddingHorizontal: APP_THEME_V2.spacing.sm,
    paddingVertical: 2,
    borderRadius: APP_THEME_V2.radius.sm,
  },
  discountText: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.colors.whisperWhite,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default StyleMatchCard; 