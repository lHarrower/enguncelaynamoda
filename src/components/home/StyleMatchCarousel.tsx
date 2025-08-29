import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Layout, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import SwipeableCard from '@/components/home/SwipeableCard';
import { styleMatchData as initialData } from '@/data/styleMatchData';
import { analyticsService } from '@/services/analyticsService';
import { DesignSystem } from '@/theme/DesignSystem';
import { WardrobeItem } from '@/types';

interface StyleMatchItem {
  id: string;
  brand: string;
  product: string;
  price: string;
  discount: string;
  image: string;
}

const StyleMatchCarousel = () => {
  const [data, setData] = useState<StyleMatchItem[]>(initialData);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = useCallback((item: StyleMatchItem, direction: 'left' | 'right') => {
    // Track swipe analytics
    const swipeData = {
      itemId: item.id,
      brand: item.brand,
      product: item.product,
      direction,
      timestamp: new Date().toISOString(),
      price: item.price,
    };

    // Track the swipe with analytics service
    analyticsService.trackSwipe(swipeData);

    // Track additional events for detailed analytics
    if (direction === 'right') {
      analyticsService.trackEvent('style_match_liked', {
        item_id: item.id,
        brand: item.brand,
        product: item.product,
        price: item.price,
      });
    } else {
      analyticsService.trackEvent('style_match_disliked', {
        item_id: item.id,
        brand: item.brand,
        product: item.product,
        price: item.price,
      });
    }

    setCurrentIndex((prevIndex) => prevIndex + 1);
  }, []);

  // Memoize the rendered cards to prevent re-renders on state change
  const renderedCards = React.useMemo(() => {
    if (currentIndex >= data.length) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Come back tomorrow for new picks!</Text>
        </View>
      );
    }

    return data
      .map((item, index) => {
        if (index < currentIndex) {
          return null;
        }

        const isCurrent = index === currentIndex;

        return (
          <AnimatedStackItem
            key={item.id}
            isCurrent={isCurrent}
            onSwipe={handleSwipe}
            item={item}
          />
        );
      })
      .reverse();
  }, [currentIndex, data, handleSwipe]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Daily Picks</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See History</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.deckContainer}>{renderedCards}</View>
    </View>
  );
};

const AnimatedStackItem = ({
  isCurrent,
  ...props
}: {
  isCurrent: boolean;
  item: StyleMatchItem;
  onSwipe: (item: StyleMatchItem, direction: 'left' | 'right') => void;
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(isCurrent ? 1 : 0.9) },
      { translateY: withSpring(isCurrent ? 0 : 30) },
    ] as any,
    opacity: withSpring(isCurrent ? 1 : 0),
  }));

  const transformedItem = {
    id: props.item.id,
    imageUri: props.item.image,
    category: 'clothing',
    colors: [],
    brand: props.item.brand,
    name: props.item.product,
    purchasePrice: parseFloat(props.item.price.replace('$', '')) || 0,
    tags: [],
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    usageStats: {
      itemId: props.item.id,
      totalWears: 0,
      lastWorn: null,
      averageRating: 0,
      complimentsReceived: 0,
      costPerWear: 0,
    },
  };

  const transformedOnSwipe = (item: WardrobeItem, direction: 'left' | 'right') => {
    props.onSwipe(props.item, direction);
  };

  return (
    <Animated.View style={styles.animatedCard} layout={Layout.springify()}>
      <Animated.View style={animatedStyle}>
        <SwipeableCard item={transformedItem} onSwipe={transformedOnSwipe} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedCard: {
    position: 'absolute',
  },
  container: {
    marginBottom: DesignSystem.spacing.xl,
  },
  deckContainer: {
    alignItems: 'center',
    height: 260,
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.lg,
    height: 260,
    justifyContent: 'center',
    marginHorizontal: DesignSystem.spacing.xl,
    ...DesignSystem.elevation.medium,
  },
  emptyText: {
    ...DesignSystem.typography.body.large,
    color: DesignSystem.colors.text.secondary,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  seeAll: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.sage[500],
  },
  title: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
  },
});

export default StyleMatchCarousel;
