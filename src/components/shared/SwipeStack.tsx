// src/components/shared/SwipeStack.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import SwipeableCard from '@/components/shared/SwipeableCard';

const STACK_SIZE = 3;
const CARD_SPACING = 8;
const SCALE_FACTOR = 0.05;

interface OutfitData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  confidence: number;
  mood: string;
  occasion: string;
  weather: string;
}

// Extracted to top-level to avoid unstable nested components and keep hooks usage valid
interface AnimatedValues {
  scale: Animated.SharedValue<number>;
  translateY: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
}

type StackCardProps = {
  outfit: OutfitData;
  anim: AnimatedValues;
  zIndex: number;
  handleSwipeLeft: (id: string) => void;
  handleSwipeRight: (id: string) => void;
  onPress: (id: string) => void;
  currentIndex: number;
};

const StackCard: React.FC<StackCardProps> = ({
  outfit,
  anim,
  zIndex,
  handleSwipeLeft,
  handleSwipeRight,
  onPress,
  currentIndex,
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: anim.scale.value }, { translateY: anim.translateY.value }] as any,
    opacity: anim.opacity.value,
    zIndex,
  }));

  return (
    <Animated.View style={[styles.cardWrapper, animatedStyle]}>
      <SwipeableCard
        outfit={outfit}
        onSwipeLeft={(id) => handleSwipeLeft(id)}
        onSwipeRight={(id) => handleSwipeRight(id)}
        onPress={onPress}
      />
    </Animated.View>
  );
};

interface SwipeStackProps {
  outfits: OutfitData[];
  onSwipeLeft: (outfit: OutfitData) => void;
  onSwipeRight: (outfit: OutfitData) => void;
  onCardPress?: (outfit: OutfitData) => void;
  onStackEmpty?: () => void;
  style?: ViewStyle;
}

export const SwipeStack: React.FC<SwipeStackProps> = ({
  outfits,
  onSwipeLeft,
  onSwipeRight,
  onCardPress,
  onStackEmpty,
  style,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState<OutfitData[]>([]);

  // Animation values for each card in the stack (declare hooks at top-level, not inside callbacks)
  const scale0 = useSharedValue(1);
  const translateY0 = useSharedValue(0);
  const opacity0 = useSharedValue(1);
  const scale1 = useSharedValue(1);
  const translateY1 = useSharedValue(0);
  const opacity1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const translateY2 = useSharedValue(0);
  const opacity2 = useSharedValue(1);

  const cardAnimations: AnimatedValues[] = [
    { scale: scale0, translateY: translateY0, opacity: opacity0 },
    { scale: scale1, translateY: translateY1, opacity: opacity1 },
    { scale: scale2, translateY: translateY2, opacity: opacity2 },
  ];

  const updateVisibleCards = useCallback(() => {
    const newVisibleCards: OutfitData[] = [];
    for (let i = 0; i < STACK_SIZE && currentIndex + i < outfits.length; i++) {
      const item = outfits[currentIndex + i];
      if (item) {
        newVisibleCards.push(item);
      }
    }
    setVisibleCards(newVisibleCards);

    // Animate cards into position
    newVisibleCards.forEach((_, index) => {
      const animation = cardAnimations[index];
      if (!animation) {
        return;
      }
      animation.scale.value = withSpring(1 - index * SCALE_FACTOR);
      animation.translateY.value = withSpring(index * CARD_SPACING);
      animation.opacity.value = withSpring(1 - index * 0.2);
    });
  }, [currentIndex, outfits]);

  useEffect(() => {
    updateVisibleCards();
  }, [currentIndex, outfits, updateVisibleCards]);

  const handleSwipe = (direction: 'left' | 'right', outfitId: string) => {
    const outfit = visibleCards.find((o) => o.id === outfitId);
    if (!outfit) {
      return;
    }

    // Call the appropriate callback
    if (direction === 'left') {
      onSwipeLeft(outfit);
    } else {
      onSwipeRight(outfit);
    }

    // Animate remaining cards moving up
    for (let i = 1; i < STACK_SIZE; i++) {
      const animation = cardAnimations[i];
      if (!animation) {
        continue;
      }
      animation.scale.value = withSpring(1 - (i - 1) * SCALE_FACTOR);
      animation.translateY.value = withSpring((i - 1) * CARD_SPACING);
      animation.opacity.value = withSpring(1 - (i - 1) * 0.2);
    }

    // Update current index after animation
    setTimeout(() => {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);

      if (newIndex >= outfits.length) {
        onStackEmpty?.();
      }
    }, 300);
  };

  const handleCardPress = (outfitId: string) => {
    const outfit = visibleCards.find((o) => o.id === outfitId);
    if (outfit) {
      onCardPress?.(outfit);
    }
  };

  if (visibleCards.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {visibleCards.map((outfit, index) => {
        const animation = cardAnimations[index];
        if (!animation) {
          return null;
        }

        return (
          <StackCard
            key={`${outfit.id}-${currentIndex}`}
            outfit={outfit}
            anim={animation}
            zIndex={STACK_SIZE - index}
            handleSwipeLeft={(id) => handleSwipe('left', id)}
            handleSwipeRight={(id) => handleSwipe('right', id)}
            onPress={handleCardPress}
            currentIndex={currentIndex}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  container: {
    alignItems: 'center',
    height: 420,
    justifyContent: 'center',
  },
});

export default SwipeStack;
