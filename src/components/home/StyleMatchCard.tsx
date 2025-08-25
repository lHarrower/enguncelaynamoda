import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View, ViewStyle } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

interface StyleMatchCardProps {
  item: {
    id: string;
    brand: string;
    product: string;
    price: string;
    discount: string;
    image: string;
  };
  style?: AnimatedStyle<ViewStyle>;
  likeOpacity?: AnimatedStyle<ViewStyle>;
  dislikeOpacity?: AnimatedStyle<ViewStyle>;
}

const StyleMatchCard: React.FC<StyleMatchCardProps> = ({
  item,
  style,
  likeOpacity,
  dislikeOpacity,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - DesignSystem.spacing.xl * 2;

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
        <Text style={styles.productText} numberOfLines={1}>
          {item.product}
        </Text>
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
  brandText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    letterSpacing: 0.8,
    marginBottom: DesignSystem.spacing.xs,
    textTransform: 'uppercase',
  },
  cardContainer: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.radius.lg,
    height: 240,
    ...DesignSystem.elevation.medium,
    borderColor: DesignSystem.colors.sage[100],
    borderWidth: 1,
  },
  discountChip: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: DesignSystem.radius.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: 2,
  },
  discountText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dislikeIcon: {
    backgroundColor: 'rgba(44, 44, 46, 0.9)', // Shadow charcoal with transparency
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
  image: {
    borderTopLeftRadius: DesignSystem.radius.lg,
    borderTopRightRadius: DesignSystem.radius.lg,
    height: 150,
    width: '100%',
  },
  likeIcon: {
    backgroundColor: 'rgba(92, 138, 92, 0.9)', // Sage green with transparency
  },
  priceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
    justifyContent: 'center',
  },
  priceText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
  },
  productText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    marginBottom: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
  textContainer: {
    padding: DesignSystem.spacing.md,
    height: 90, // Fixed height for consistency
    justifyContent: 'center',
  },
});

export default StyleMatchCard;
