import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';
import { styleMatchData as initialData } from '../../data/styleMatchData';
import Animated, { useAnimatedStyle, withSpring, FadeOut, Layout } from 'react-native-reanimated';
import SwipeableCard from './SwipeableCard';

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
    // TODO: Handle swipe analytics and user preferences
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
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    marginBottom: APP_THEME_V2.spacing.md,
  },
  title: {
    ...APP_THEME_V2.typography.scale.h3,
    color: APP_THEME_V2.semantic.text.primary,
  },
  seeAll: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.accent,
    fontFamily: APP_THEME_V2.typography.fonts.body,
  },
  deckContainer: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: APP_THEME_V2.spacing.md,
  },
  animatedCard: {
    position: 'absolute',
  },
  emptyContainer: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_THEME_V2.semantic.surface,
    borderRadius: APP_THEME_V2.radius.organic,
    marginHorizontal: APP_THEME_V2.spacing.xl,
    ...APP_THEME_V2.elevation.whisper,
  },
  emptyText: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.secondary,
    fontFamily: APP_THEME_V2.typography.fonts.body,
  },
});

export default StyleMatchCarousel; 