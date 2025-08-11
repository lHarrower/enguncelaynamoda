import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { DesignSystem } from '@/theme/DesignSystem';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - DesignSystem.spacing.lg * 2 - (NUM_COLUMNS - 1) * 16) / NUM_COLUMNS;

const StaggeredProductCard = ({ item, style }: { item: any, style?: any }) => {
  const scale = useSharedValue(1);

  // Randomize aspect ratio for staggered effect
  const aspectRatio = useMemo(() => Math.random() * 0.4 + 1, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 150, easing: Easing.out(Easing.quad) });
  };
  
  const handlePressOut = () => {
      scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) });
  };

  return (
    <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={0.9}>
        <Animated.View style={[styles.cardContainer, { height: CARD_WIDTH * aspectRatio }, animatedStyle, style]}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.infoContainer}>
                <Text style={styles.brandText} numberOfLines={1}>{item.brand}</Text>
                <Text style={styles.nameText} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.priceText}>{item.price}</Text>
            </View>
        </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        borderRadius: DesignSystem.borderRadius.lg,
        backgroundColor: DesignSystem.colors.background.secondary,
        overflow: 'hidden',
        marginBottom: 16,
        ...DesignSystem.elevation.medium,
    },
    productImage: {
        width: '100%',
        height: '65%',
        borderTopLeftRadius: DesignSystem.borderRadius.lg,
        borderTopRightRadius: DesignSystem.borderRadius.lg,
    },
    infoContainer: {
        padding: 12,
        flex: 1,
        justifyContent: 'center',
    },
    brandText: {
        ...DesignSystem.typography.scale.caption,
        color: DesignSystem.colors.text.secondary,
        textTransform: 'uppercase',
        fontSize: 10,
        marginBottom: 2,
    },
    nameText: {
        ...DesignSystem.typography.body.medium,
        fontSize: 14,
        lineHeight: 18,
        color: DesignSystem.colors.text.primary,
        fontWeight: '600',
        marginBottom: 4,
    },
    priceText: {
        ...DesignSystem.typography.body.medium,
        fontSize: 14,
        fontWeight: 'bold',
        color: DesignSystem.colors.sage[500],
    },
});

export default StaggeredProductCard;