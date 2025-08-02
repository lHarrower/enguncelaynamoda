import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LuxuryMaterials, LuxuryMotion } from '@/theme/AppThemeV2';

interface WaveOfLightProps {
  isActive: boolean;
  size?: number;
  onAnimationComplete?: () => void;
}

export const WaveOfLight: React.FC<WaveOfLightProps> = ({
  isActive,
  size = 60,
  onAnimationComplete,
}) => {
  const wave1Scale = useSharedValue(0);
  const wave1Opacity = useSharedValue(0);
  const wave2Scale = useSharedValue(0);
  const wave2Opacity = useSharedValue(0);
  const wave3Scale = useSharedValue(0);
  const wave3Opacity = useSharedValue(0);

  const animationConfig = {
    duration: LuxuryMotion.timing.cinematic,
    easing: Easing.out(Easing.cubic),
  };

  const createWaveAnimation = (delay: number) => {
    return withDelay(
      delay,
      withSequence(
        withTiming(1, {
          duration: animationConfig.duration * 0.6,
          easing: animationConfig.easing,
        }),
        withTiming(0, {
          duration: animationConfig.duration * 0.4,
          easing: Easing.in(Easing.cubic),
        })
      )
    );
  };

  const createScaleAnimation = (delay: number) => {
    return withDelay(
      delay,
      withSequence(
        withTiming(2.5, {
          duration: animationConfig.duration,
          easing: animationConfig.easing,
        }),
        withTiming(0, { duration: 0 })
      )
    );
  };

  useEffect(() => {
    if (isActive) {
      // Reset all values
      wave1Scale.value = 0;
      wave1Opacity.value = 0;
      wave2Scale.value = 0;
      wave2Opacity.value = 0;
      wave3Scale.value = 0;
      wave3Opacity.value = 0;

      // Start animations with staggered delays
      const stagger = LuxuryMotion.interactions.waveOfLight.stagger;

      // First wave
      wave1Opacity.value = createWaveAnimation(0);
      wave1Scale.value = createScaleAnimation(0);

      // Second wave
      wave2Opacity.value = createWaveAnimation(stagger);
      wave2Scale.value = createScaleAnimation(stagger);

      // Third wave
      wave3Opacity.value = createWaveAnimation(stagger * 2);
      wave3Scale.value = createScaleAnimation(stagger * 2);

      // Call completion callback
      if (onAnimationComplete) {
        setTimeout(() => {
          onAnimationComplete();
        }, LuxuryMotion.interactions.waveOfLight.duration);
      }
    }
  }, [isActive]);

  const wave1Style = useAnimatedStyle(() => ({
    transform: [{ scale: wave1Scale.value }],
    opacity: wave1Opacity.value,
  }));

  const wave2Style = useAnimatedStyle(() => ({
    transform: [{ scale: wave2Scale.value }],
    opacity: wave2Opacity.value,
  }));

  const wave3Style = useAnimatedStyle(() => ({
    transform: [{ scale: wave3Scale.value }],
    opacity: wave3Opacity.value,
  }));

  if (!isActive) return null;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.wave, styles.wave1, wave1Style, { width: size, height: size }]} />
      <Animated.View style={[styles.wave, styles.wave2, wave2Style, { width: size, height: size }]} />
      <Animated.View style={[styles.wave, styles.wave3, wave3Style, { width: size, height: size }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  
  wave: {
    position: 'absolute',
    borderRadius: 1000, // Large value for perfect circle
    borderWidth: 2,
  },
  
  wave1: {
    borderColor: `${LuxuryMaterials.colors.liquidGold}40`, // 25% opacity
  },
  
  wave2: {
    borderColor: `${LuxuryMaterials.colors.liquidGold}60`, // 37.5% opacity
  },
  
  wave3: {
    borderColor: `${LuxuryMaterials.colors.liquidGold}80`, // 50% opacity
  },
});

export default WaveOfLight;