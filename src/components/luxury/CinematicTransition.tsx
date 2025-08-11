import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { DesignSystem } from '@/theme/DesignSystem';

interface CinematicTransitionProps {
  isVisible: boolean;
  children: React.ReactNode;
  delay?: number;
  onTransitionComplete?: () => void;
}

export const CinematicTransition: React.FC<CinematicTransitionProps> = ({
  isVisible,
  children,
  delay = 0,
  onTransitionComplete,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    if (isVisible) {
      // Cinematic fade-in with floating motion
      opacity.value = withDelay(
        delay,
        withTiming(1, {
          duration: DesignSystem.motion.duration.smooth,
          easing: Easing.out(Easing.cubic),
        })
      );

      translateY.value = withDelay(
        delay,
        withTiming(0, {
          duration: DesignSystem.motion.duration.smooth,
          easing: Easing.out(Easing.cubic),
        })
      );

      scale.value = withDelay(
        delay,
        withTiming(1, {
          duration: DesignSystem.motion.duration.smooth,
          easing: Easing.out(Easing.cubic),
        })
      );

      // Call completion callback
      if (onTransitionComplete) {
        setTimeout(() => {
          onTransitionComplete();
        }, delay + DesignSystem.motion.duration.smooth);
      }
    } else {
      // Cinematic fade-out
      opacity.value = withTiming(0, {
        duration: DesignSystem.motion.duration.quick,
        easing: Easing.in(Easing.cubic),
      });

      translateY.value = withTiming(-10, {
        duration: DesignSystem.motion.duration.quick,
        easing: Easing.in(Easing.cubic),
      });

      scale.value = withTiming(0.98, {
        duration: DesignSystem.motion.duration.quick,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [isVisible, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CinematicTransition;