import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';
import { styleMatchData as initialData } from '@/data/styleMatchData';
import Animated, { useAnimatedStyle, withSpring, FadeOut, Layout } from 'react-native-reanimated';
import SwipeableCard from '@/components/home/SwipeableCard';
import { analyticsService } from '@/services/analyticsService';

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
      price: item.price
    };
    
    // Track the swipe with analytics service
    analyticsService.trackSwipe(swipeData);
    
    // Track additional events for detailed analytics
    if (direction === 'right') {
      analyticsService.trackEvent('style_match_liked', {
        item_id: item.id,
        brand: item.brand,
        product: item.product,
        price: item.price
      });
    } else {
      analyticsService.trackEvent('style_match_disliked', {
        item_id: item.id,
        brand: item.brand,
        product: item.product,
        price: item.price
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

    return data.map((item, index) => {
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

const AnimatedStackItem = ({ isCurrent, ...props }: { isCurrent: boolean; item: StyleMatchItem; onSwipe: (item: StyleMatchItem, direction: 'left' | 'right') => void; }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(isCurrent ? 1 : 0.9) },
      { translateY: withSpring(isCurrent ? 0 : 30) },
    ],
    opacity: withSpring(isCurrent ? 1 : 0),
  }));

  return (
    <Animated.View style={[styles.animatedCard, animatedStyle]} layout={Layout.springify()}>
      <SwipeableCard {...props} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignSystem.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.xl,
    marginBottom: DesignSystem.spacing.md,
  },
  title: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
  },
  seeAll: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.sage[500],
  },
  deckContainer: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  animatedCard: {
    position: 'absolute',
  },
  emptyContainer: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.lg,
    marginHorizontal: DesignSystem.spacing.xl,
    ...DesignSystem.elevation.medium,
  },
  emptyText: {
    ...DesignSystem.typography.body.large,
    color: DesignSystem.colors.text.secondary,
  },
});

export default StyleMatchCarousel;