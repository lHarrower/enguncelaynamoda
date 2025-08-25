import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useSafeTheme } from '@/hooks/useSafeTheme';
import { DesignSystem } from '@/theme/DesignSystem';

interface StyleMatchCircleProps {
  percentage: number;
  size?: number;
  showLabel?: boolean;
  animated?: boolean;
  confidence?: 'high' | 'medium' | 'low';
}

const StyleMatchCircle: React.FC<StyleMatchCircleProps> = ({
  percentage,
  size = 48,
  showLabel = true,
  animated = true,
  confidence = 'high',
}) => {
  const theme = useSafeTheme();
  const { colors } = theme;

  // Animation values
  const progress = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progress.value = withTiming(percentage / 100, {
        duration: 1000,
      });

      scale.value = withSpring(1.1, {}, () => {
        scale.value = withSpring(1);
      });

      opacity.value = withTiming(1, {
        duration: 800,
      });

      sparkleRotation.value = withTiming(
        1,
        {
          duration: 2000,
          easing: Easing.linear,
        },
        () => {
          sparkleRotation.value = 0;
          sparkleRotation.value = withTiming(1, {
            duration: 2000,
            easing: Easing.linear,
          });
        },
      );
    }
  }, [percentage, animated, opacity, progress, scale, sparkleRotation]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedProgressStyle = useAnimatedStyle(() => {
    const rotation = interpolate(progress.value, [0, 1], [0, 360 * progress.value]);

    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const animatedSparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const getConfidenceColor = () => {
    if (percentage >= 90) {
      return DesignSystem.colors.primary;
    } // Antique Gold
    if (percentage >= 70) {
      return colors.accent.coral;
    } // Dusty Rose
    return colors.textSecondary; // Taupe
  };

  const getConfidenceGradient = (): readonly [string, string] => {
    if (percentage >= 90) {
      return [
        DesignSystem.colors.primary || '#007AFF',
        DesignSystem.colors.gold[300] || '#C9A227',
      ] as const;
    }
    if (percentage >= 70) {
      return [colors.accent.coral, DesignSystem.colors.sage[100]] as const;
    }
    return [colors.textSecondary, DesignSystem.colors.neutral.mist] as const;
  };

  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const _circumference = 2 * Math.PI * radius;

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {/* Background Circle */}
      <View
        style={[
          styles.backgroundCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.surface,
          },
        ]}
      >
        {/* Progress Circle */}
        <Animated.View
          style={[
            styles.progressCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: getConfidenceColor(),
            },
            animatedProgressStyle,
          ]}
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={getConfidenceGradient()}
          style={[
            styles.gradientOverlay,
            {
              width: size - strokeWidth * 2,
              height: size - strokeWidth * 2,
              borderRadius: (size - strokeWidth * 2) / 2,
            },
          ]}
        />

        {/* Content */}
        <View style={styles.content}>
          {/* Percentage Text */}
          <Text
            style={[
              styles.percentageText,
              {
                color: colors.background,
                fontSize: size * 0.25,
                lineHeight: size * 0.28,
              },
            ]}
          >
            {Math.round(percentage)}
          </Text>

          {/* Sparkle Icon for High Confidence */}
          {percentage >= 90 && (
            <Animated.View style={[styles.sparkle, animatedSparkleStyle]}>
              <Ionicons name="sparkles" size={size * 0.15} color={colors.background} />
            </Animated.View>
          )}
        </View>

        {/* Confidence Badge */}
        {showLabel && (
          <View
            style={[
              styles.confidenceBadge,
              {
                backgroundColor: getConfidenceColor(),
                bottom: -size * 0.15,
              },
            ]}
          >
            <Text
              style={[
                styles.confidenceText,
                {
                  color: colors.background,
                  fontSize: size * 0.12,
                },
              ]}
            >
              {percentage >= 90 ? 'PERFECT' : percentage >= 70 ? 'GREAT' : 'GOOD'} MATCH
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    padding: DesignSystem.spacing.medium,
  },
  backgroundCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...DesignSystem.elevation.soft,
  },
  confidenceBadge: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    position: 'absolute',
    ...DesignSystem.elevation.subtle,
  },
  confidenceText: {
    ...DesignSystem.typography.scale.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  gradientOverlay: {
    opacity: 0.9,
    position: 'absolute',
  },
  percentageText: {
    ...DesignSystem.typography.heading.h3,
    fontWeight: '700',
    textAlign: 'center',
  },
  progressCircle: {
    borderColor: 'transparent',
    borderRightColor: DesignSystem.colors.gold[400],
    borderTopColor: DesignSystem.colors.gold[400],
    position: 'absolute',
  },
  sparkle: {
    position: 'absolute',
    right: -8,
    top: -8,
  },
});

export default StyleMatchCircle;
