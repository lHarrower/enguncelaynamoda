import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LuxuryMotion } from '@/theme/AppThemeV2';

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
          duration: LuxuryMotion.transitions.fadeIn.duration,
          easing: Easing.out(Easing.cubic),
        })
      );

      translateY.value = withDelay(
        delay,
        withTiming(0, {
          duration: LuxuryMotion.transitions.float.duration,
          easing: Easing.out(Easing.cubic),
        })
      );

      scale.value = withDelay(
        delay,
        withTiming(1, {
          duration: LuxuryMotion.transitions.float.duration,
          easing: Easing.out(Easing.cubic),
        })
      );

      // Call completion callback
      if (onTransitionComplete) {
        setTimeout(() => {
          onTransitionComplete();
        }, delay + LuxuryMotion.transitions.float.duration);
      }
    } else {
      // Cinematic fade-out
      opacity.value = withTiming(0, {
        duration: LuxuryMotion.transitions.fadeOut.duration,
        easing: Easing.in(Easing.cubic),
      });

      translateY.value = withTiming(-10, {
        duration: LuxuryMotion.transitions.fadeOut.duration,
        easing: Easing.in(Easing.cubic),
      });

      scale.value = withTiming(0.98, {
        duration: LuxuryMotion.transitions.fadeOut.duration,
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