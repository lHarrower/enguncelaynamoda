/**
 * Modern Loading Component
 * Advanced loading indicators with multiple variants and animations
 */

import React, { memo, useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ModernDesignSystem } from '@/theme/ModernDesignSystem';

interface ModernLoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'wave';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const { width: screenWidth } = Dimensions.get('window');

const ModernLoading: React.FC<ModernLoadingProps> = memo(
  ({
    variant = 'spinner',
    size = 'medium',
    color = ModernDesignSystem.colors.semantic.brand.primary,
    text,
    overlay = false,
    style,
    textStyle,
  }) => {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const translateX = useSharedValue(0);
    const shimmerAnimation = useSharedValue(0);

    // Dot animations
    const dotAnimation1 = useSharedValue(0);
    const dotAnimation2 = useSharedValue(0);
    const dotAnimation3 = useSharedValue(0);

    useEffect(() => {
      switch (variant) {
        case 'spinner':
          rotation.value = withRepeat(
            withTiming(360, {
              duration: 1000,
              easing: Easing.linear,
            }),
            -1,
          );
          break;

        case 'dots':
          // Initialize dot animations
          dotAnimation1.value = withRepeat(
            withDelay(
              0,
              withSequence(withTiming(1, { duration: 400 }), withTiming(0, { duration: 400 })),
            ),
            -1,
          );
          dotAnimation2.value = withRepeat(
            withDelay(
              200,
              withSequence(withTiming(1, { duration: 400 }), withTiming(0, { duration: 400 })),
            ),
            -1,
          );
          dotAnimation3.value = withRepeat(
            withDelay(
              400,
              withSequence(withTiming(1, { duration: 400 }), withTiming(0, { duration: 400 })),
            ),
            -1,
          );
          break;
        case 'pulse':
          scale.value = withRepeat(
            withSequence(withTiming(1.2, { duration: 800 }), withTiming(1, { duration: 800 })),
            -1,
          );
          break;
        case 'skeleton':
          shimmerAnimation.value = withRepeat(
            withTiming(1, {
              duration: 1500,
              easing: Easing.linear,
            }),
            -1,
          );
          break;

        case 'wave':
          translateX.value = withRepeat(
            withSequence(
              withTiming(screenWidth, {
                duration: 1500,
                easing: Easing.inOut(Easing.ease),
              }),
              withTiming(-100, {
                duration: 0,
              }),
            ),
            -1,
          );
          break;
      }
    }, [
      variant,
      rotation,
      scale,
      opacity,
      translateX,
      shimmerAnimation,
      dotAnimation1,
      dotAnimation2,
      dotAnimation3,
    ]);

    // Animated styles at component level - prevent transform conflicts
    const spinnerAnimatedStyle = useAnimatedStyle(
      () => ({
        transform: [{ rotate: `${rotation.value}deg` }],
      }),
      [rotation],
    );

    const pulseAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: interpolate(scale.value, [1, 1.2], [1, 0.7]),
    }));

    const shimmerAnimatedStyle = useAnimatedStyle(() => {
      const shimmerTranslateX = interpolate(shimmerAnimation.value, [0, 1], [-100, 300]);
      return {
        transform: [{ translateX: shimmerTranslateX }],
      };
    });

    // Add wave animated style at component scope to comply with hooks rules
    const waveAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    const dot1AnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(dotAnimation1.value, [0, 1], [0.3, 1]),
      transform: [{ scale: interpolate(dotAnimation1.value, [0, 1], [0.8, 1.2]) }],
    }));

    const dot2AnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(dotAnimation2.value, [0, 1], [0.3, 1]),
      transform: [{ scale: interpolate(dotAnimation2.value, [0, 1], [0.8, 1.2]) }],
    }));

    const dot3AnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(dotAnimation3.value, [0, 1], [0.3, 1]),
      transform: [{ scale: interpolate(dotAnimation3.value, [0, 1], [0.8, 1.2]) }],
    }));

    const getSizeValue = () => {
      switch (size) {
        case 'small':
          return 24;
        case 'medium':
          return 40;
        case 'large':
          return 56;
        default:
          return 40;
      }
    };

    const renderSpinner = () => {
      const sizeValue = getSizeValue();

      return (
        <Animated.View
          style={[
            styles.spinner,
            {
              width: sizeValue,
              height: sizeValue,
              borderColor: `${color}20`,
              borderTopColor: color,
              borderWidth: sizeValue / 8,
            },
            spinnerAnimatedStyle,
          ]}
        />
      );
    };

    const renderDots = () => {
      const dotSize = getSizeValue() / 3;
      const animatedStyles = [dot1AnimatedStyle, dot2AnimatedStyle, dot3AnimatedStyle];

      const dots = [0, 1, 2].map((index) => {
        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                backgroundColor: color,
                marginHorizontal: dotSize / 4,
              },
              animatedStyles[index],
            ]}
          />
        );
      });

      return <View style={styles.dotsContainer}>{dots}</View>;
    };

    const renderPulse = () => {
      const sizeValue = getSizeValue();

      return (
        <Animated.View
          style={[
            styles.pulse,
            {
              width: sizeValue,
              height: sizeValue,
              backgroundColor: color,
            },
            pulseAnimatedStyle,
          ]}
        />
      );
    };

    const renderSkeleton = () => {
      return (
        <View style={styles.skeletonContainer}>
          <View style={[styles.skeletonLine, { width: '80%' }]} />
          <View style={[styles.skeletonLine, { width: '60%' }]} />
          <View style={[styles.skeletonLine, { width: '90%' }]} />
          <Animated.View style={[styles.shimmer, shimmerAnimatedStyle]} />
        </View>
      );
    };

    const renderWave = () => {
      return (
        <View style={styles.waveContainer}>
          <Animated.View style={[styles.wave, { backgroundColor: color }, waveAnimatedStyle]} />
        </View>
      );
    };

    const renderLoadingIndicator = () => {
      switch (variant) {
        case 'spinner':
          return renderSpinner();
        case 'dots':
          return renderDots();
        case 'pulse':
          return renderPulse();
        case 'skeleton':
          return renderSkeleton();
        case 'wave':
          return renderWave();
        default:
          return renderSpinner();
      }
    };

    const containerStyle = [styles.container, overlay && styles.overlay, style];

    return (
      <View style={containerStyle}>
        {renderLoadingIndicator()}
        {text && <Text style={[styles.text, { color }, textStyle]}>{text}</Text>}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  dot: {
    borderRadius: 1000,
  },

  dotsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },

  pulse: {
    borderRadius: 1000,
  },

  shimmer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 100,
  },

  skeletonContainer: {
    overflow: 'hidden',
    position: 'relative',
    width: 200,
  },

  skeletonLine: {
    backgroundColor: ModernDesignSystem.colors.tokens.surface.secondary,
    borderRadius: 6,
    height: 12,
    marginVertical: 4,
  },

  spinner: {
    borderRadius: 1000,
  },

  text: {
    fontFamily: ModernDesignSystem.typography.fontStacks.body[0],
    marginTop: ModernDesignSystem.spacing.semantic.component.md,
    ...ModernDesignSystem.typography.scale.body.medium,
    textAlign: 'center',
  },

  wave: {
    borderRadius: 2,
    height: '100%',
    width: 100,
  },

  waveContainer: {
    backgroundColor: ModernDesignSystem.colors.tokens.surface.secondary,
    borderRadius: 2,
    height: 4,
    overflow: 'hidden',
    width: '100%',
  },
});

export default ModernLoading;
