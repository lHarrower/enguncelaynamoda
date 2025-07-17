// Atmospheric Background - The Living Canvas
// Deep, immersive space with slow-moving gradients like light behind silk

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
import { ARTISTRY_THEME } from '../../constants/ArtistryTheme';

const { width, height } = Dimensions.get('window');

interface AtmosphericBackgroundProps {
  variant?: 'emerald' | 'sapphire' | 'ruby' | 'gold';
  intensity?: 'subtle' | 'medium' | 'dramatic';
  children?: React.ReactNode;
}

const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({
  variant = 'emerald',
  intensity = 'subtle',
  children,
}) => {
  // Animation values for the moving gradients
  const gradientPosition1 = useSharedValue(0);
  const gradientPosition2 = useSharedValue(0.3);
  const gradientPosition3 = useSharedValue(0.7);
  const opacity1 = useSharedValue(0.1);
  const opacity2 = useSharedValue(0.08);
  const opacity3 = useSharedValue(0.06);

  // Get colors based on variant
  const getGradientColors = () => {
    switch (variant) {
      case 'emerald':
        return {
          primary: ARTISTRY_THEME.colors.emerald.deep,
          secondary: ARTISTRY_THEME.colors.emerald.rich,
          glow: ARTISTRY_THEME.colors.emerald.glow,
        };
      case 'sapphire':
        return {
          primary: ARTISTRY_THEME.colors.sapphire.deep,
          secondary: ARTISTRY_THEME.colors.sapphire.rich,
          glow: ARTISTRY_THEME.colors.sapphire.glow,
        };
      case 'ruby':
        return {
          primary: ARTISTRY_THEME.colors.ruby.deep,
          secondary: ARTISTRY_THEME.colors.ruby.rich,
          glow: ARTISTRY_THEME.colors.ruby.glow,
        };
      case 'gold':
        return {
          primary: ARTISTRY_THEME.colors.liquidGold[800],
          secondary: ARTISTRY_THEME.colors.liquidGold[600],
          glow: ARTISTRY_THEME.colors.liquidGold.glow,
        };
      default:
        return {
          primary: ARTISTRY_THEME.colors.emerald.deep,
          secondary: ARTISTRY_THEME.colors.emerald.rich,
          glow: ARTISTRY_THEME.colors.emerald.glow,
        };
    }
  };

  const colors = getGradientColors();

  // Get intensity multipliers
  const getIntensityValues = () => {
    switch (intensity) {
      case 'subtle':
        return { opacity: 0.08, blur: 60, movement: 0.3 };
      case 'medium':
        return { opacity: 0.15, blur: 80, movement: 0.5 };
      case 'dramatic':
        return { opacity: 0.25, blur: 100, movement: 0.8 };
      default:
        return { opacity: 0.08, blur: 60, movement: 0.3 };
    }
  };

  const intensityValues = getIntensityValues();

  useEffect(() => {
    // Start the atmospheric animations
    const startAtmosphericMotion = () => {
      // Gradient 1 - Slow horizontal drift
      gradientPosition1.value = withRepeat(
        withSequence(
          withTiming(intensityValues.movement, {
            duration: 15000,
          }),
          withTiming(-intensityValues.movement, {
            duration: 15000,
          })
        ),
        -1,
        true
      );

      // Gradient 2 - Diagonal drift
      gradientPosition2.value = withRepeat(
        withSequence(
          withTiming(0.7 + intensityValues.movement, {
            duration: 20000,
          }),
          withTiming(0.3 - intensityValues.movement, {
            duration: 20000,
          })
        ),
        -1,
        true
      );

      // Gradient 3 - Vertical drift
      gradientPosition3.value = withRepeat(
        withSequence(
          withTiming(1 - intensityValues.movement, {
            duration: 25000,
          }),
          withTiming(intensityValues.movement, {
            duration: 25000,
          })
        ),
        -1,
        true
      );

      // Opacity breathing
      opacity1.value = withRepeat(
        withSequence(
          withTiming(intensityValues.opacity * 1.5, {
            duration: 8000,
          }),
          withTiming(intensityValues.opacity * 0.5, {
            duration: 8000,
          })
        ),
        -1,
        true
      );

      opacity2.value = withRepeat(
        withSequence(
          withTiming(intensityValues.opacity * 1.2, {
            duration: 12000,
          }),
          withTiming(intensityValues.opacity * 0.7, {
            duration: 12000,
          })
        ),
        -1,
        true
      );

      opacity3.value = withRepeat(
        withSequence(
          withTiming(intensityValues.opacity, {
            duration: 10000,
          }),
          withTiming(intensityValues.opacity * 0.3, {
            duration: 10000,
          })
        ),
        -1,
        true
      );
    };

    startAtmosphericMotion();
  }, [variant, intensity]);

  // Animated styles for each gradient layer
  const gradient1Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: gradientPosition1.value * width },
        { translateY: gradientPosition1.value * height * 0.3 },
      ],
      opacity: opacity1.value,
    };
  });

  const gradient2Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: gradientPosition2.value * width * 0.7 },
        { translateY: gradientPosition2.value * height * 0.5 },
      ],
      opacity: opacity2.value,
    };
  });

  const gradient3Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: gradientPosition3.value * width * 0.5 },
        { translateY: gradientPosition3.value * height * 0.7 },
      ],
      opacity: opacity3.value,
    };
  });

  return (
    <View style={styles.container}>
      {/* Base Canvas - Deep charcoal */}
      <View style={styles.baseCanvas} />
      
      {/* Atmospheric Gradient Layers */}
      <Animated.View style={[styles.gradientLayer, gradient1Style]}>
        <LinearGradient
          colors={[colors.glow, 'transparent', colors.glow]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.gradientLayer, gradient2Style]}>
        <LinearGradient
          colors={['transparent', colors.glow, 'transparent']}
          style={styles.gradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.gradientLayer, gradient3Style]}>
        <LinearGradient
          colors={[colors.glow, 'transparent', colors.glow, 'transparent']}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Content Layer */}
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
  baseCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ARTISTRY_THEME.semantic.canvas.void,
  },
  gradientLayer: {
    position: 'absolute',
    width: width * 2,
    height: height * 2,
    top: -height * 0.5,
    left: -width * 0.5,
  },
  gradient: {
    flex: 1,
    borderRadius: width,
  },
  contentLayer: {
    flex: 1,
    zIndex: 10,
  },
});

export default AtmosphericBackground;