import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { TYPOGRAPHY, SPACING, SHADOWS } from '@/constants/AppConstants';
import { DIGITAL_ATELIER_PALETTE } from '@/constants/Colors';

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
  const { colors } = useTheme();
  
  // Animation values
  const progress = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      // Entrance animation
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      opacity.value = withTiming(1, { duration: 300 });
      
      // Progress animation with delay
      setTimeout(() => {
        progress.value = withTiming(percentage / 100, {
          duration: 1500,
          easing: Easing.out(Easing.cubic),
        });
      }, 200);

      // Continuous sparkle rotation
      sparkleRotation.value = withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      });
    } else {
      progress.value = percentage / 100;
      scale.value = 1;
      opacity.value = 1;
    }
  }, [percentage, animated]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedProgressStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      progress.value,
      [0, 1],
      [0, 360 * progress.value]
    );
    
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const animatedSparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const getConfidenceColor = () => {
    if (percentage >= 90) return colors.primary; // Antique Gold
    if (percentage >= 70) return colors.accent; // Dusty Rose
    return colors.text_secondary; // Taupe
  };

  const getConfidenceGradient = (): [string, string] => {
    if (percentage >= 90) return [colors.primary, DIGITAL_ATELIER_PALETTE.antique_gold_light];
    if (percentage >= 70) return [colors.accent, DIGITAL_ATELIER_PALETTE.dusty_rose_light];
    return [colors.text_secondary, DIGITAL_ATELIER_PALETTE.taupe_light];
  };

  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

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
              <Ionicons
                name="sparkles"
                size={size * 0.15}
                color={colors.background}
              />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundCircle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.gentle,
  },
  progressCircle: {
    position: 'absolute',
    borderColor: 'transparent',
    borderTopColor: DIGITAL_ATELIER_PALETTE.antique_gold,
    borderRightColor: DIGITAL_ATELIER_PALETTE.antique_gold,
  },
  gradientOverlay: {
    position: 'absolute',
    opacity: 0.9,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  percentageText: {
    ...TYPOGRAPHY.semantic.cardTitle,
    fontWeight: '700',
    textAlign: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  confidenceBadge: {
    position: 'absolute',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  confidenceText: {
    ...TYPOGRAPHY.semantic.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default StyleMatchCircle;