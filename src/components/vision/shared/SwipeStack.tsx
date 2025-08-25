import React, { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import SwipeableCard, { OutfitCard } from './SwipeableCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// OutfitCard interface imported from SwipeableCard

interface SwipeStackProps {
  outfits: OutfitCard[];
  onSwipe: (direction: 'left' | 'right', outfit: OutfitCard) => void;
  maxVisibleCards?: number;
}

const SwipeStack: React.FC<SwipeStackProps> = ({ outfits, onSwipe, maxVisibleCards = 3 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right', outfit: OutfitCard) => {
      onSwipe(direction, outfit);
      setCurrentIndex((prev) => prev + 1);
    },
    [onSwipe],
  );

  const visibleOutfits = outfits.slice(currentIndex, currentIndex + maxVisibleCards);

  return (
    <View style={styles.container}>
      {visibleOutfits
        .map((outfit, index) => (
          <SwipeableCard
            key={`${outfit.id}-${currentIndex + index}`}
            card={outfit}
            index={index}
            totalCards={visibleOutfits.length}
            onSwipeLeft={(card) => handleSwipe('left', card)}
            onSwipeRight={(card) => handleSwipe('right', card)}
            isActive={index === 0}
          />
        ))
        .reverse()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});

export { SwipeStack };
export type { OutfitCard };
