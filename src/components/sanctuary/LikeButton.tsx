import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');

interface LikeButtonProps {
  isLiked: boolean;
  onPress: () => void;
  size?: number;
  disabled?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  onPress,
  size = 24,
  disabled = false
}) => {
  // Animation values for the heart
  const heartScale = useSharedValue(1);
  const heartRotation = useSharedValue(0);
  
  // Animation values for the wave circles
  const wave1Scale = useSharedValue(0);
  const wave1Opacity = useSharedValue(0);
  const wave2Scale = useSharedValue(0);
  const wave2Opacity = useSharedValue(0);
  const wave3Scale = useSharedValue(0);
  const wave3Opacity = useSharedValue(0);

  // Cleanup animation values on unmount
  useEffect(() => {
    return () => {
      // Reset all animation values to prevent memory leaks
      heartScale.value = 1;
      heartRotation.value = 0;
      wave1Scale.value = 0;
      wave1Opacity.value = 0;
      wave2Scale.value = 0;
      wave2Opacity.value = 0;
      wave3Scale.value = 0;
      wave3Opacity.value = 0;
    };
  }, [
    heartScale,
    heartRotation,
    wave1Scale,
    wave1Opacity,
    wave2Scale,
    wave2Opacity,
    wave3Scale,
    wave3Opacity,
  ]);

  // Heart animation styles
  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: heartScale.value },
      { rotate: `${heartRotation.value}deg` }
    ],
  }));

  // Wave animation styles
  const wave1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wave1Scale.value }],
    opacity: wave1Opacity.value,
  }));

  const wave2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wave2Scale.value }],
    opacity: wave2Opacity.value,
  }));

  const wave3AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wave3Scale.value }],
    opacity: wave3Opacity.value,
  }));

  const triggerHaptics = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  const resetWaves = () => {
    wave1Scale.value = 0;
    wave1Opacity.value = 0;
    wave2Scale.value = 0;
    wave2Opacity.value = 0;
    wave3Scale.value = 0;
    wave3Opacity.value = 0;
  };

  const handlePress = () => {
    if (disabled) return;

    try {
      // Trigger haptic feedback
      runOnJS(triggerHaptics)();

      // Heart animation - gentle pop with rotation
      heartScale.value = withSequence(
        withTiming(1.3, { duration: 150 }),
        withTiming(1, { duration: 200 })
      );
      
      heartRotation.value = withSequence(
        withTiming(isLiked ? -15 : 15, { duration: 100 }),
        withTiming(0, { duration: 150 })
      );

      // Reset waves before starting new animation
      runOnJS(resetWaves)();

      // Wave 1 - First concentric circle
      wave1Scale.value = withTiming(3, { duration: 600 });
      wave1Opacity.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withDelay(200, withTiming(0, { duration: 300 }))
      );

      // Wave 2 - Second concentric circle (delayed)
      wave2Scale.value = withDelay(150, withTiming(3.5, { duration: 600 }));
      wave2Opacity.value = withDelay(150, withSequence(
        withTiming(0.6, { duration: 100 }),
        withDelay(200, withTiming(0, { duration: 300 }))
      ));

      // Wave 3 - Third concentric circle (more delayed)
      wave3Scale.value = withDelay(300, withTiming(4, { duration: 600 }));
      wave3Opacity.value = withDelay(300, withSequence(
        withTiming(0.4, { duration: 100 }),
        withDelay(200, withTiming(0, { duration: 300 }))
      ));

      // Call the actual onPress handler
      onPress();
    } catch (error) {
      console.error('Error in LikeButton press:', error);
      // Still call onPress even if animations fail
      onPress();
    }
  };

  const buttonSize = size + 20; // Add padding around the icon
  const waveSize = buttonSize * 4; // Waves extend beyond the button

  return (
    <View 
      style={[styles.container, { width: buttonSize, height: buttonSize }]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={isLiked ? "Remove from favorites" : "Add to favorites"}
      accessibilityHint="Double tap to toggle favorite status with wave animation"
    >
      {/* Wave circles - positioned behind the button */}
      <View style={[styles.wavesContainer, { width: waveSize, height: waveSize }]}>
        <Animated.View 
          style={[
            styles.wave,
            { 
              width: waveSize, 
              height: waveSize,
              borderRadius: waveSize / 2,
              backgroundColor: DesignSystem.colors.sage[400],
            },
            wave1AnimatedStyle
          ]} 
        />
        <Animated.View 
          style={[
            styles.wave,
            { 
              width: waveSize, 
              height: waveSize,
              borderRadius: waveSize / 2,
              backgroundColor: DesignSystem.colors.sage[300],
            },
            wave2AnimatedStyle
          ]} 
        />
        <Animated.View 
          style={[
            styles.wave,
            { 
              width: waveSize, 
              height: waveSize,
              borderRadius: waveSize / 2,
              backgroundColor: DesignSystem.colors.sage[200],
            },
            wave3AnimatedStyle
          ]} 
        />
      </View>

      {/* Heart button */}
      <TouchableOpacity
        style={[
          styles.button,
          { 
            width: buttonSize, 
            height: buttonSize,
            opacity: disabled ? 0.5 : 1,
          }
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Animated.View style={heartAnimatedStyle}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={size}
            color={isLiked ? DesignSystem.colors.sage[500] : DesignSystem.colors.text.tertiary}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wavesContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  wave: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DesignSystem.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...DesignSystem.elevation.soft,
    zIndex: 1,
  },
});