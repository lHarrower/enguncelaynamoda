import React from 'react';
import { useWindowDimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
  withTiming,
} from 'react-native-reanimated';
import StyleMatchCard from './StyleMatchCard';

interface SwipeableCardProps {
  item: any;
  onSwipe: (item: any, direction: 'left' | 'right') => void;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({ item, onSwipe }) => {
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const longPress = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      scale.value = withSpring(1.05);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
    });

  const pan = Gesture.Pan()
    .activeOffsetX([-20, 20]) // Lower sensitivity
    .onChange((event) => {
      translateX.value = event.translationX;
      rotation.value = interpolate(
        event.translationX,
        [-screenWidth / 2, 0, screenWidth / 2],
        [-10, 0, 10],
        Extrapolate.CLAMP,
      );
    })
    .onEnd((event) => {
      const swipeThreshold = screenWidth * 0.3;
      if (Math.abs(event.translationX) > swipeThreshold) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        
        translateY.value = withTiming(-800, { duration: 400 });
        rotation.value = withTiming(direction === 'right' ? 15 : -15, { duration: 400 });
        translateX.value = withTiming(event.translationX * 1.2, { duration: 400 });

        runOnJS(onSwipe)(item, direction);
      } else {
        translateX.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    });

  const gesture = Gesture.Simultaneous(pan, longPress);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [20, screenWidth / 4], [0, 1], Extrapolate.CLAMP),
  }));

  const dislikeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-screenWidth / 4, -20], [1, 0], Extrapolate.CLAMP),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={styles.container}>
        <StyleMatchCard
          item={item}
          style={animatedStyle}
          likeOpacity={likeOpacity}
          dislikeOpacity={dislikeOpacity}
        />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SwipeableCard; 