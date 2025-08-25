import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import WaveOfLight from '@/components/luxury/WaveOfLight';
import { DesignSystem } from '@/theme/DesignSystem';

interface ElegantLikeButtonProps {
  isLiked: boolean;
  onPress: () => void;
  size?: number;
}

export const ElegantLikeButton: React.FC<ElegantLikeButtonProps> = ({
  isLiked,
  onPress,
  size = 24,
}) => {
  const [showWave, setShowWave] = useState(false);
  const heartScale = useSharedValue(1);
  const heartRotation = useSharedValue(0);

  const handlePress = () => {
    // Trigger heart animation
    heartScale.value = withSequence(
      withTiming(1.2, {
        duration: DesignSystem.motion.duration.quick,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(1, {
        duration: DesignSystem.motion.duration.smooth,
        easing: Easing.out(Easing.cubic),
      }),
    );

    heartRotation.value = withSequence(
      withTiming(15, {
        duration: DesignSystem.motion.duration.quick,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(0, {
        duration: DesignSystem.motion.duration.smooth,
        easing: Easing.out(Easing.cubic),
      }),
    );

    // Trigger wave animation only when liking (not unliking)
    if (!isLiked) {
      setShowWave(true);
    }

    onPress();
  };

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }, { rotate: `${heartRotation.value}deg` }] as any,
  }));

  const handleWaveComplete = () => {
    setShowWave(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { height: size + 16, width: size + 16 }]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Animated.View style={heartAnimatedStyle}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={size}
            color={isLiked ? DesignSystem.colors.gold[500] : DesignSystem.colors.neutral.charcoal}
            style={styles.heartIcon}
          />
        </Animated.View>
      </TouchableOpacity>

      {showWave && (
        <WaveOfLight
          isActive={showWave}
          size={size * 2.5}
          onAnimationComplete={handleWaveComplete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
    justifyContent: 'center',
  },

  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heartIcon: {
    // Thin, elegant line-art style
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
});

export default ElegantLikeButton;
