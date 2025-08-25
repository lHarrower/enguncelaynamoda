import React, { useCallback, useMemo } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  AnimatedStyle,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

interface ProductItem {
  id: string;
  brand: string;
  name: string;
  price: string;
  image: string;
}

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - DesignSystem.spacing.lg * 2 - (NUM_COLUMNS - 1) * 16) / NUM_COLUMNS;

const StaggeredProductCard = React.memo(
  ({ item, style }: { item: ProductItem; style?: AnimatedStyle<ViewStyle> }) => {
    const scale = useSharedValue(1);

    // Randomize aspect ratio for staggered effect
    const aspectRatio = useMemo(() => Math.random() * 0.4 + 1, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const handlePressIn = useCallback(() => {
      scale.value = withTiming(0.95, { duration: 150, easing: Easing.out(Easing.quad) });
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) });
    }, [scale]);

    return (
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`${item.brand} ${item.name}, ${item.price}`}
        accessibilityHint="Tap to view product details"
      >
        <Animated.View
          style={[styles.cardContainer, { height: CARD_WIDTH * aspectRatio }, animatedStyle, style]}
        >
          <Image source={{ uri: item.image }} style={styles.productImage} />
          <View style={styles.infoContainer}>
            <Text style={styles.brandText} numberOfLines={1}>
              {item.brand}
            </Text>
            <Text style={styles.nameText} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  brandText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    fontSize: 10,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  cardContainer: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.lg,
    marginBottom: 16,
    overflow: 'hidden',
    width: CARD_WIDTH,
    ...DesignSystem.elevation.medium,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 12,
  },
  nameText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  priceText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.sage[500],
    fontSize: 14,
    fontWeight: 'bold',
  },
  productImage: {
    borderTopLeftRadius: DesignSystem.borderRadius.lg,
    borderTopRightRadius: DesignSystem.borderRadius.lg,
    height: '65%',
    width: '100%',
  },
});

export default StaggeredProductCard;
