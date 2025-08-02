import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import SwipeableCard from './SwipeableCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OutfitCard {
  id: string;
  title: string;
  description: string;
  mood: string;
  colors: string[];
  confidence: number;
  pieces: string[];
}

interface SwipeStackProps {
  outfits: OutfitCard[];
  onSwipe: (direction: 'left' | 'right', outfit: OutfitCard) => void;
  maxVisibleCards?: number;
}

const SwipeStack: React.FC<SwipeStackProps> = ({
  outfits,
  onSwipe,
  maxVisibleCards = 3,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = useCallback((direction: 'left' | 'right', outfit: OutfitCard) => {
    onSwipe(direction, outfit);
    setCurrentIndex(prev => prev + 1);
  }, [onSwipe]);

  const visibleOutfits = outfits.slice(currentIndex, currentIndex + maxVisibleCards);

  return (
    <View style={styles.container}>
      {visibleOutfits.map((outfit, index) => (
        <SwipeableCard
          key={`${outfit.id}-${currentIndex + index}`}
          outfit={outfit}
          index={index}
          totalCards={visibleOutfits.length}
          onSwipe={handleSwipe}
          isActive={index === 0}
        />
      )).reverse()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});

export { SwipeStack };
export type { OutfitCard };