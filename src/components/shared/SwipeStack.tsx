// src/components/shared/SwipeStack.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { SwipeableCard } from '@/components/shared/SwipeableCard';
import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
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

interface SwipeStackProps {
  outfits: OutfitData[];
  onSwipeLeft: (outfit: OutfitData) => void;
  onSwipeRight: (outfit: OutfitData) => void;
  onCardPress?: (outfit: OutfitData) => void;
  onStackEmpty?: () => void;
  style?: any;
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

  // Animation values for each card in the stack
  const cardAnimations = Array.from({ length: STACK_SIZE }, () => ({
    scale: useSharedValue(1),
    translateY: useSharedValue(0),
    opacity: useSharedValue(1),
  }));

  useEffect(() => {
    updateVisibleCards();
  }, [currentIndex, outfits]);

  const updateVisibleCards = () => {
    const newVisibleCards = [];
    for (let i = 0; i < STACK_SIZE && currentIndex + i < outfits.length; i++) {
      newVisibleCards.push(outfits[currentIndex + i]);
    }
    setVisibleCards(newVisibleCards);
    
    // Animate cards into position
    newVisibleCards.forEach((_, index) => {
      const animation = cardAnimations[index];
      animation.scale.value = withSpring(1 - (index * SCALE_FACTOR));
      animation.translateY.value = withSpring(index * CARD_SPACING);
      animation.opacity.value = withSpring(1 - (index * 0.2));
    });
  };

  const handleSwipe = (direction: 'left' | 'right', outfitId: string) => {
    const outfit = visibleCards.find(o => o.id === outfitId);
    if (!outfit) return;

    // Call the appropriate callback
    if (direction === 'left') {
      onSwipeLeft(outfit);
    } else {
      onSwipeRight(outfit);
    }

    // Animate remaining cards moving up
    for (let i = 1; i < STACK_SIZE; i++) {
      const animation = cardAnimations[i];
      animation.scale.value = withSpring(1 - ((i - 1) * SCALE_FACTOR));
      animation.translateY.value = withSpring((i - 1) * CARD_SPACING);
      animation.opacity.value = withSpring(1 - ((i - 1) * 0.2));
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
    const outfit = visibleCards.find(o => o.id === outfitId);
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
        
        const animatedStyle = useAnimatedStyle(() => ({
          transform: [
            { scale: animation.scale.value },
            { translateY: animation.translateY.value },
          ],
          opacity: animation.opacity.value,
          zIndex: STACK_SIZE - index,
        }));

        return (
          <Animated.View
            key={`${outfit.id}-${currentIndex}`}
            style={[styles.cardWrapper, animatedStyle]}
          >
            <SwipeableCard
              outfit={outfit}
              onSwipeLeft={(id) => handleSwipe('left', id)}
              onSwipeRight={(id) => handleSwipe('right', id)}
              onPress={handleCardPress}
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 420,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export default SwipeStack;