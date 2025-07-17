import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { EDITORIAL_THEME } from '../../constants/EditorialTheme';
import { StylePickCard } from './StylePickCard';
import { DailyStylePick } from '../../data/editorialContent';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const cardWidth = screenWidth * 0.8;

interface SwipeableCardStackProps {
  items: DailyStylePick[];
  onSwipeLeft?: (item: DailyStylePick) => void;
  onSwipeRight?: (item: DailyStylePick) => void;
}

export const SwipeableCardStack: React.FC<SwipeableCardStackProps> = ({
  items,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(0.95);
    },
    onActive: (event) => {
      // Only allow horizontal movement
      translateX.value = event.translationX;
      
      // Create curved motion by adding subtle vertical offset based on horizontal position
      const curveIntensity = 0.0008; // Adjust this to control curve intensity
      translateY.value = -Math.abs(event.translationX) * curveIntensity * event.translationX;
      
      // Counter-clockwise rotation based on horizontal movement
      rotate.value = interpolate(
        event.translationX,
        [-screenWidth / 2, screenWidth / 2],
        [15, -15],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      const shouldSwipe = Math.abs(event.translationX) > screenWidth * 0.25;
      
      if (shouldSwipe && currentIndex < items.length) {
        const direction = event.translationX > 0 ? 1 : -1;
        
        // Animate card off screen with curved motion
        translateX.value = withTiming(direction * screenWidth * 1.2, {
          duration: 300,
        });
        translateY.value = withTiming(-100, { duration: 300 });
        rotate.value = withTiming(direction * 30, { duration: 300 });
        scale.value = withTiming(0.8, { duration: 300 });
        
        // Safely trigger callback and reset for next card
        const currentItem = items[currentIndex];
        if (currentItem) {
          runOnJS(() => {
            try {
              if (direction > 0 && onSwipeRight) {
                onSwipeRight(currentItem);
              } else if (direction < 0 && onSwipeLeft) {
                onSwipeLeft(currentItem);
              }
            } catch (error) {
              console.warn('Error in swipe callback:', error);
            }
          })();
        }
        
        // Reset for next card after animation
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % items.length);
          translateX.value = 0;
          translateY.value = 0;
          rotate.value = 0;
          scale.value = 1;
        }, 350);
      } else {
        // Spring back to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
        scale.value = withSpring(1);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  const backgroundCardStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, screenWidth * 0.3],
      [0.5, 0.8],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, screenWidth * 0.3],
      [0.9, 0.95],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];
  const nextItem = items[(currentIndex + 1) % items.length];

  return (
    <View style={styles.container}>
      {/* Background card */}
      {nextItem && (
        <Animated.View style={[styles.backgroundCard, backgroundCardStyle]}>
          <StylePickCard pick={nextItem} />
        </Animated.View>
      )}
      
      {/* Active card */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.activeCard, animatedStyle]}>
          <StylePickCard pick={currentItem} />
        </Animated.View>
      </PanGestureHandler>
      
      {/* Swipe indicators */}
      <Animated.View
        style={[
          styles.swipeIndicator,
          styles.leftIndicator,
          {
            opacity: interpolate(
              translateX.value,
              [-100, 0],
              [1, 0],
              Extrapolate.CLAMP
            ),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.swipeIndicator,
          styles.rightIndicator,
          {
            opacity: interpolate(
              translateX.value,
              [0, 100],
              [0, 1],
              Extrapolate.CLAMP
            ),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 450,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeCard: {
    position: 'absolute',
    zIndex: 2,
  },
  backgroundCard: {
    position: 'absolute',
    zIndex: 1,
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftIndicator: {
    left: 20,
    backgroundColor: EDITORIAL_THEME.colors.lilac[100],
    borderWidth: 2,
    borderColor: EDITORIAL_THEME.colors.lilac[300],
  },
  rightIndicator: {
    right: 20,
    backgroundColor: EDITORIAL_THEME.colors.gold[100],
    borderWidth: 2,
    borderColor: EDITORIAL_THEME.colors.gold[300],
  },
});