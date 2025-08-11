import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { DesignSystem } from '@/theme/DesignSystem';
import { DailyStylePick } from '@/data/editorialContent';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.8;

interface StylePickCardProps {
  pick: DailyStylePick;
  onPress?: () => void;
}

export const StylePickCard: React.FC<StylePickCardProps> = ({
  pick,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const imageScale = useSharedValue(1);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
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
              <Text style={styles.originalPrice}>
                {formatPrice(pick.originalPrice)}
              </Text>
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
  container: {
    width: cardWidth,
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
  ...DesignSystem.elevation.soft,
    marginBottom: DesignSystem.spacing.md,
  },
  imageContainer: {
    position: 'relative',
    height: 320,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  saleTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: DesignSystem.colors.gold[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DesignSystem.borderRadius.sm,
  },
  saleText: {
    ...DesignSystem.typography.scale.caption,
    fontFamily: 'Inter_600SemiBold',
    color: DesignSystem.colors.text.inverse,
    letterSpacing: 0.5,
  },
  content: {
    padding: DesignSystem.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brand: {
  ...DesignSystem.typography.body.small,
    fontFamily: 'Inter_500Medium',
    color: DesignSystem.colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  category: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...DesignSystem.typography.scale.h2,
  fontFamily: DesignSystem.typography.fontFamily.serif,
    color: DesignSystem.colors.text.primary,
    marginBottom: 8,
    lineHeight: 28,
  },
  description: {
  ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    ...DesignSystem.typography.scale.h3,
    fontFamily: 'Inter_600SemiBold',
    color: DesignSystem.colors.text.primary,
  },
  originalPrice: {
  ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.tertiary,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: DesignSystem.colors.sage[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DesignSystem.borderRadius.full,
    borderWidth: 1,
    borderColor: DesignSystem.colors.sage[200],
  },
  tagText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.sage[700],
  },
});