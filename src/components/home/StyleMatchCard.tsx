import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';
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
  const cardWidth = screenWidth - (DesignSystem.spacing.xl * 2);

  return (
    <Animated.View style={[styles.cardContainer, { width: cardWidth }, style]}>
      <Image source={{ uri: item.image }} style={styles.image} />
      
      <Animated.View style={[styles.iconOverlay, styles.likeIcon, likeOpacity]}>
        <Ionicons name="heart" size={48} color={DesignSystem.colors.text.inverse} />
      </Animated.View>
      <Animated.View style={[styles.iconOverlay, styles.dislikeIcon, dislikeOpacity]}>
        <Ionicons name="close-outline" size={60} color={DesignSystem.colors.text.inverse} />
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
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.radius.lg,
    ...DesignSystem.elevation.medium,
    borderWidth: 1,
    borderColor: DesignSystem.colors.sage[100],
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: DesignSystem.radius.lg,
    borderTopRightRadius: DesignSystem.radius.lg,
  },
  iconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 90, // Match text container's space
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DesignSystem.radius.lg,
  },
  likeIcon: {
    backgroundColor: 'rgba(92, 138, 92, 0.9)', // Sage green with transparency
  },
  dislikeIcon: {
    backgroundColor: 'rgba(44, 44, 46, 0.9)', // Shadow charcoal with transparency
  },
  textContainer: {
    padding: DesignSystem.spacing.md,
    height: 90, // Fixed height for consistency
    justifyContent: 'center',
  },
  brandText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  productText: {
    ...DesignSystem.typography.body2,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
    fontFamily: DesignSystem.typography.fonts.body,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.sm,
  },
  priceText: {
    ...DesignSystem.typography.body2,
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fonts.body,
  },
  discountChip: {
    backgroundColor: DesignSystem.colors.sage[500],
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: 2,
    borderRadius: DesignSystem.radius.sm,
  },
  discountText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text.inverse,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default StyleMatchCard;