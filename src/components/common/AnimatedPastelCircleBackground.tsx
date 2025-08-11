import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { DesignSystem } from '../../theme/DesignSystem';

const { width, height } = Dimensions.get('window');

const Circle = ({ style, delay, size, initialX, initialY }: any) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 25000, easing: Easing.linear }),
      -1,
      true
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [0, width / 4 - Math.random() * (width / 2)]);
    const translateY = interpolate(progress.value, [0, 1], [0, height / 4 - Math.random() * (height / 2)]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [1, 1.2, 1]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0.4, 0.6, 0.4]);

    return {
      transform: [{ translateX }, { translateY }, { scale }],
      opacity: opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top: initialY,
          left: initialX,
        },
        style,
        animatedStyle,
      ]}
    />
  );
};

const AnimatedPastelCircleBackground = () => {
  return (
    <View style={[StyleSheet.absoluteFill, styles.background]}>
      <Circle style={{ backgroundColor: DesignSystem.colors.neutral[300] + '20' }} size={width * 1.6} initialX={-width * 0.3} initialY={-width * 0.8} />
      <Circle style={{ backgroundColor: DesignSystem.colors.gold[300] + '15' }} size={width * 1.2} initialX={width * 0.1} initialY={height * 0.5} />
      <Circle style={{ backgroundColor: DesignSystem.colors.sage[300] + '10' }} size={width} initialX={-width * 0.5} initialY={height * 0.2} />
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: DesignSystem.colors.background.primary,
  },
  circle: {
    position: 'absolute',
  },
});

export default AnimatedPastelCircleBackground;