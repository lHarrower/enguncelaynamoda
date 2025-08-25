import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useSafeTheme } from '@/hooks/useSafeTheme';
import { DesignSystem } from '@/theme/DesignSystem';

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
  delay = 0,
}: GoldShimmerProps) {
  const theme = useSafeTheme();
  const { colors: _colors } = theme;
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    const startAnimation = () => {
      shimmerPosition.value = withRepeat(
        withTiming(1, {
          duration: intensity === 'subtle' ? 3000 : intensity === 'medium' ? 2500 : 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        false,
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
      Extrapolate.CLAMP,
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
          colors={
            [
              'transparent',
              'transparent',
              `${DesignSystem.colors.primary[500]}${Math.round(baseOpacity * 0.3 * 255)
                .toString(16)
                .padStart(2, '0')}`,
              `${DesignSystem.colors.primary[500]}${Math.round(baseOpacity * 0.7 * 255)
                .toString(16)
                .padStart(2, '0')}`,
              `${DesignSystem.colors.primary[500]}${Math.round(baseOpacity * 0.5 * 255)
                .toString(16)
                .padStart(2, '0')}`,
              `${DesignSystem.colors.primary[500]}${Math.round(baseOpacity * 0.7 * 255)
                .toString(16)
                .padStart(2, '0')}`,
              `${DesignSystem.colors.primary[500]}${Math.round(baseOpacity * 0.3 * 255)
                .toString(16)
                .padStart(2, '0')}`,
              'transparent',
              'transparent',
            ] as const
          }
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
    borderRadius: 8,
    overflow: 'hidden',
    position: 'absolute',
  },
  gradient: {
    flex: 1,
  },
  shimmer: {
    height: '100%',
  },
});
