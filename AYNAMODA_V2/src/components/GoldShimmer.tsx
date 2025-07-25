import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface GoldShimmerProps {
  width: number;
  height: number;
  intensity?: 'subtle' | 'medium' | 'strong';
  delay?: number;
}

export default function GoldShimmer({ 
  width, 
  height, 
  intensity = 'subtle',
  delay = 0 
}: GoldShimmerProps) {
  const { colors } = useTheme();
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    const startAnimation = () => {
      shimmerPosition.value = withRepeat(
        withTiming(1, { 
          duration: intensity === 'subtle' ? 3000 : intensity === 'medium' ? 2500 : 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        false
      );
    };

    if (delay > 0) {
      setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }
  }, [intensity, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [0, 1],
      [-width * 1.5, width * 2.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  const opacityMap = {
    subtle: 0.2,
    medium: 0.4,
    strong: 0.6,
  };

  const baseOpacity = opacityMap[intensity];

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      <Animated.View style={[styles.shimmer, { width: width * 3 }, animatedStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            'transparent',
            `${colors.primary}${Math.round(baseOpacity * 0.3 * 255).toString(16).padStart(2, '0')}`,
            `${colors.primary}${Math.round(baseOpacity * 0.7 * 255).toString(16).padStart(2, '0')}`,
            colors.accent + Math.round(baseOpacity * 255).toString(16).padStart(2, '0'),
            `${colors.primary}${Math.round(baseOpacity * 0.7 * 255).toString(16).padStart(2, '0')}`,
            `${colors.primary}${Math.round(baseOpacity * 0.3 * 255).toString(16).padStart(2, '0')}`,
            'transparent',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 8,
  },
  shimmer: {
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
}); 