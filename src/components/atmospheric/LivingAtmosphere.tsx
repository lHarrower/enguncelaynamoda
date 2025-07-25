// Living Atmosphere - The Deep, Immersive Canvas
// Jewel-tone gradients moving like soft light behind heavy silk curtain

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ATMOSPHERIC_THEME } from '../../constants/AtmosphericTheme';

const { width, height } = Dimensions.get('window');

interface LivingAtmosphereProps {
  variant?: 'emerald' | 'sapphire' | 'ruby' | 'amethyst';
  intensity?: 'subtle' | 'medium' | 'dramatic';
  children?: React.ReactNode;
}

const LivingAtmosphere: React.FC<LivingAtmosphereProps> = ({
  variant = 'emerald',
  intensity = 'subtle',
  children,
}) => {
  // Animation values for the living gradients
  const gradient1Position = useSharedValue(0);
  const gradient2Position = useSharedValue(0.3);
  const gradient3Position = useSharedValue(0.7);
  const gradient1Opacity = useSharedValue(0.08);
  const gradient2Opacity = useSharedValue(0.06);
  const gradient3Opacity = useSharedValue(0.04);
  const atmosphericPulse = useSharedValue(1);

  // Get jewel tone colors based on variant
  const getJewelColors = () => {
    switch (variant) {
      case 'emerald':
        return ATMOSPHERIC_THEME.colors.emerald;
      case 'sapphire':
        return ATMOSPHERIC_THEME.colors.sapphire;
      case 'ruby':
        return ATMOSPHERIC_THEME.colors.ruby;
      case 'amethyst':
        return ATMOSPHERIC_THEME.colors.amethyst;
      default:
        return ATMOSPHERIC_THEME.colors.emerald;
    }
  };

  const jewels = getJewelColors();

  // Get intensity multipliers
  const getIntensityValues = () => {
    switch (intensity) {
      case 'subtle':
        return { opacity: 0.08, movement: 0.2, pulse: 0.02 };
      case 'medium':
        return { opacity: 0.12, movement: 0.35, pulse: 0.04 };
      case 'dramatic':
        return { opacity: 0.18, movement: 0.5, pulse: 0.06 };
      default:
        return { opacity: 0.08, movement: 0.2, pulse: 0.02 };
    }
  };

  const intensityValues = getIntensityValues();

  useEffect(() => {
    // Start the living atmospheric motion - extremely slow, like breathing
    
    // Gradient 1 - Horizontal drift like wind
    gradient1Position.value = withRepeat(
      withSequence(
        withTiming(intensityValues.movement, { duration: 25000 }),
        withTiming(-intensityValues.movement, { duration: 25000 })
      ),
      -1,
      true
    );

    // Gradient 2 - Diagonal drift like floating silk
    gradient2Position.value = withRepeat(
      withSequence(
        withTiming(0.7 + intensityValues.movement, { duration: 35000 }),
        withTiming(0.3 - intensityValues.movement, { duration: 35000 })
      ),
      -1,
      true
    );

    // Gradient 3 - Vertical drift like rising mist
    gradient3Position.value = withRepeat(
      withSequence(
        withTiming(1 - intensityValues.movement, { duration: 45000 }),
        withTiming(intensityValues.movement, { duration: 45000 })
      ),
      -1,
      true
    );

    // Opacity breathing - like candlelight flickering
    gradient1Opacity.value = withRepeat(
      withSequence(
        withTiming(intensityValues.opacity * 1.5, { duration: 12000 }),
        withTiming(intensityValues.opacity * 0.5, { duration: 12000 })
      ),
      -1,
      true
    );

    gradient2Opacity.value = withRepeat(
      withSequence(
        withTiming(intensityValues.opacity * 1.2, { duration: 18000 }),
        withTiming(intensityValues.opacity * 0.7, { duration: 18000 })
      ),
      -1,
      true
    );

    gradient3Opacity.value = withRepeat(
      withSequence(
        withTiming(intensityValues.opacity, { duration: 15000 }),
        withTiming(intensityValues.opacity * 0.3, { duration: 15000 })
      ),
      -1,
      true
    );

    // Atmospheric pulse - the entire space breathing
    atmosphericPulse.value = withRepeat(
      withSequence(
        withTiming(1 + intensityValues.pulse, { duration: 8000 }),
        withTiming(1 - intensityValues.pulse, { duration: 8000 })
      ),
      -1,
      true
    );
  }, [variant, intensity]);

  // Animated styles for each gradient layer
  const gradient1Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: gradient1Position.value * width },
        { translateY: gradient1Position.value * height * 0.2 },
        { scale: atmosphericPulse.value },
      ],
      opacity: gradient1Opacity.value,
    };
  });

  const gradient2Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: gradient2Position.value * width * 0.8 },
        { translateY: gradient2Position.value * height * 0.6 },
        { scale: atmosphericPulse.value * 1.1 },
      ],
      opacity: gradient2Opacity.value,
    };
  });

  const gradient3Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: gradient3Position.value * width * 0.6 },
        { translateY: gradient3Position.value * height * 0.8 },
        { scale: atmosphericPulse.value * 0.9 },
      ],
      opacity: gradient3Opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      {/* Base Canvas - Deep charcoal void */}
      <View style={styles.voidCanvas} />
      
      {/* Living Gradient Layers - Like light behind silk */}
      <Animated.View style={[styles.gradientLayer, gradient1Style]}>
        <LinearGradient
          colors={[
            jewels.glow,
            'transparent',
            jewels.shimmer,
            'transparent',
            jewels.glow,
          ]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.gradientLayer, gradient2Style]}>
        <LinearGradient
          colors={[
            'transparent',
            jewels.shimmer,
            jewels.glow,
            jewels.shimmer,
            'transparent',
          ]}
          style={styles.gradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.gradientLayer, gradient3Style]}>
        <LinearGradient
          colors={[
            jewels.shimmer,
            'transparent',
            jewels.glow,
            'transparent',
            jewels.shimmer,
          ]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Content Layer - Floating above the atmosphere */}
      <View style={styles.contentLayer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  voidCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ATMOSPHERIC_THEME.semantic.canvas.void,
  },
  gradientLayer: {
    position: 'absolute',
    width: width * 3,
    height: height * 3,
    top: -height,
    left: -width,
  },
  gradient: {
    flex: 1,
    borderRadius: width * 2,
  },
  contentLayer: {
    flex: 1,
    zIndex: 10,
  },
});

export default LivingAtmosphere;