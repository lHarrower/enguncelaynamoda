import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { DailyStylePick } from '@/data/editorialContent';
import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.8;

interface StylePickCardProps {
  pick: DailyStylePick;
  onPress?: () => void;
}

export const StylePickCard: React.FC<StylePickCardProps> = ({ pick, onPress }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const imageScale = useSharedValue(1);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateY: translateY.value }] as any,
    };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: imageScale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    translateY.value = withSpring(-2);
    imageScale.value = withTiming(1.05, { duration: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    translateY.value = withSpring(0);
    imageScale.value = withTiming(1, { duration: 300 });
  };

  const formatPrice = (price: number) => `$${price}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.container, cardAnimatedStyle]}>
        <View style={styles.imageContainer}>
          <Animated.View style={[styles.imageWrapper, imageAnimatedStyle]}>
            <Image source={{ uri: pick.image }} style={styles.image} />
          </Animated.View>
          {pick.originalPrice && (
            <View style={styles.saleTag}>
              <Text style={styles.saleText}>SALE</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.brand}>{pick.brand}</Text>
            <Text style={styles.category}>{pick.category}</Text>
          </View>

          <Text style={styles.title}>{pick.title}</Text>
          <Text style={styles.description}>{pick.description}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(pick.price)}</Text>
            {pick.originalPrice && (
              <Text style={styles.originalPrice}>{formatPrice(pick.originalPrice)}</Text>
            )}
          </View>

          <View style={styles.tagsContainer}>
            {pick.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  brand: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.primary,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  category: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    width: cardWidth,
    ...DesignSystem.elevation.soft,
    marginBottom: DesignSystem.spacing.md,
  },
  content: {
    padding: DesignSystem.spacing.lg,
  },
  description: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  image: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  imageContainer: {
    height: 320,
    overflow: 'hidden',
    position: 'relative',
  },
  imageWrapper: {
    height: '100%',
    width: '100%',
  },
  originalPrice: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.tertiary,
    marginLeft: 8,
    textDecorationLine: 'line-through',
  },
  price: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  priceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  saleTag: {
    backgroundColor: DesignSystem.colors.gold[500],
    borderRadius: DesignSystem.borderRadius.sm,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    top: 12,
  },
  saleText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  tag: {
    backgroundColor: DesignSystem.colors.sage[50],
    borderColor: DesignSystem.colors.sage[200],
    borderRadius: DesignSystem.borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.sage[700],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.serif,
    lineHeight: 28,
    marginBottom: 8,
  },
});
