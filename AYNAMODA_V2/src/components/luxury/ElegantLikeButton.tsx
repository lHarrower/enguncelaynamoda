import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LuxuryMaterials, LuxuryMotion, LuxurySpacing } from '../../theme/AppThemeV2';
import WaveOfLight from './WaveOfLight';

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
        duration: LuxuryMotion.timing.instant,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(1, {
        duration: LuxuryMotion.timing.quick,
        easing: Easing.out(Easing.cubic),
      })
    );

    heartRotation.value = withSequence(
      withTiming(15, {
        duration: LuxuryMotion.timing.instant,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(0, {
        duration: LuxuryMotion.timing.quick,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Trigger wave animation only when liking (not unliking)
    if (!isLiked) {
      setShowWave(true);
    }

    onPress();
  };

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: heartScale.value },
      { rotate: `${heartRotation.value}deg` },
    ],
  }));

  const handleWaveComplete = () => {
    setShowWave(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { width: size + 16, height: size + 16 }]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Animated.View style={heartAnimatedStyle}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={size}
            color={isLiked ? LuxuryMaterials.colors.liquidGold : LuxuryMaterials.colors.charcoal}
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
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  
  heartIcon: {
    // Thin, elegant line-art style
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
});

export default ElegantLikeButton; 