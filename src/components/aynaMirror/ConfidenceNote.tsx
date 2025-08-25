// Confidence Note Component - Poetic and Encouraging
// Digital Zen Garden aesthetics with glassmorphism and organic animations

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { SPACING_V2 } from '../../constants/AppThemeV2';

// AYNAMODA Color Palette
const COLORS = {
  primary: '#8B6F47',
  secondary: '#B8A082',
  background: '#F5F1E8',
  surface: '#FFFFFF',
  text: '#2C2C2C',
  textLight: '#B8A082',
  border: '#E8DCC6',
  accent: '#D4AF37',
};

// Animation configurations
const ORGANIC_SPRING = {
  damping: 15,
  stiffness: 100,
  mass: 1,
};

const ZEN_SPRING = {
  damping: 20,
  stiffness: 80,
  mass: 1,
};

interface ConfidenceNoteProps {
  note: string;
  confidenceScore: number;
  style?: object;
}

export const ConfidenceNote: React.FC<ConfidenceNoteProps> = ({ note, confidenceScore, style }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Animation values
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const sparkleRotation = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);

  // Responsive dimensions
  const dimensions = useMemo(() => {
    const isTablet = screenWidth > 768;
    const isLandscape = screenWidth > screenHeight;

    return {
      isTablet,
      isLandscape,
      padding: isTablet ? SPACING_V2.xxl : SPACING_V2.xl,
      fontSize: isTablet ? 18 : 16,
    };
  }, [screenWidth, screenHeight]);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, ORGANIC_SPRING);
      opacity.value = withTiming(1, { duration: 1000 });
      translateY.value = withSpring(0, ZEN_SPRING);

      // Sparkle animation
      sparkleOpacity.value = withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.7, { duration: 1200 }),
      );
      sparkleRotation.value = withTiming(360, { duration: 2000 });
    }, 200);

    return () => clearTimeout(timer);
  }, [note, opacity, scale, sparkleOpacity, sparkleRotation, translateY]);

  // Get confidence level and corresponding styling
  const confidenceLevel = useMemo(() => {
    // Thresholds aligned with tests expecting:
    // 4.8 => Exceptional, 4.2 => Good, 3.2 => Moderate, 2.5 => Building
    if (confidenceScore >= 4.7) {
      return 'exceptional';
    }
    if (confidenceScore >= 4.0) {
      return 'good';
    }
    if (confidenceScore >= 3.0) {
      return 'moderate';
    }
    return 'building';
  }, [confidenceScore]);

  const confidenceColors = useMemo(() => {
    switch (confidenceLevel) {
      case 'exceptional':
        return {
          primary: COLORS.accent,
          secondary: COLORS.secondary,
          accent: COLORS.primary,
        };
      case 'good':
        return {
          primary: COLORS.primary,
          secondary: COLORS.secondary,
          accent: COLORS.accent,
        };
      case 'moderate':
        return {
          primary: COLORS.textLight,
          secondary: COLORS.border,
          accent: COLORS.text,
        };
      default:
        return {
          primary: COLORS.textLight,
          secondary: COLORS.border,
          accent: COLORS.text,
        };
    }
  }, [confidenceLevel]);

  const confidenceIcon = useMemo(() => {
    switch (confidenceLevel) {
      case 'exceptional':
        return 'star';
      case 'good':
        return 'heart';
      case 'moderate':
        return 'thumbs-up';
      default:
        return 'leaf';
    }
  }, [confidenceLevel]);

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }] as any,
    opacity: opacity.value,
  }));

  const animatedSparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }] as any,
    opacity: sparkleOpacity.value,
  }));

  const styles = useMemo(
    () => createStyles(dimensions, confidenceColors),
    [dimensions, confidenceColors],
  );

  return (
    <Animated.View style={[styles.container, animatedContainerStyle, style]}>
      <BlurView intensity={20} tint="light" style={styles.blur}>
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.3)',
            'rgba(255, 255, 255, 0.2)',
            'rgba(255, 255, 255, 0.1)',
          ]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>
            {/* Confidence indicator with sparkle */}
            <View style={styles.header}>
              <View style={styles.confidenceIndicator}>
                <Animated.View style={[styles.sparkle, animatedSparkleStyle]}>
                  <Ionicons
                    name="sparkles"
                    size={dimensions.isTablet ? 20 : 16}
                    color={confidenceColors.secondary}
                  />
                </Animated.View>
                <Ionicons
                  name={confidenceIcon as keyof typeof Ionicons.glyphMap}
                  size={dimensions.isTablet ? 24 : 20}
                  color={confidenceColors.primary}
                />
                <View style={styles.confidenceBar}>
                  <LinearGradient
                    colors={[confidenceColors.secondary, confidenceColors.primary]}
                    style={[
                      styles.confidenceFill,
                      { width: `${Math.min(100, Math.max(0, confidenceScore * 20))}%` },
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
              </View>
            </View>

            {/* Main confidence note */}
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>{note}</Text>
            </View>

            {/* Confidence level label */}
            <View style={styles.footer}>
              <View style={styles.confidenceLevelContainer}>
                <Text style={styles.confidenceLevelText}>
                  {confidenceLevel.charAt(0).toUpperCase() + confidenceLevel.slice(1)} Confidence
                </Text>
                <Text style={styles.confidenceScoreText}>
                  {Math.round(confidenceScore * 10)}/50
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </BlurView>

      {/* Subtle glow effect for high confidence */}
      {confidenceLevel === 'exceptional' && (
        <View style={styles.glowContainer}>
          <LinearGradient
            colors={[
              `${confidenceColors.primary}20`,
              `${confidenceColors.secondary}10`,
              'transparent',
            ]}
            style={styles.glow}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
      )}
    </Animated.View>
  );
};

// Dynamic styles based on responsive dimensions and confidence colors
const createStyles = (
  dimensions: {
    isTablet: boolean;
    isLandscape: boolean;
    padding: number;
    fontSize: number;
  },
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  },
) =>
  StyleSheet.create({
    blur: {
      borderRadius: 20,
      elevation: 3,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    confidenceBar: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 8,
      height: dimensions.isTablet ? 6 : 4,
      overflow: 'hidden',
      width: dimensions.isTablet ? 80 : 60,
    },
    confidenceFill: {
      borderRadius: 8,
      height: '100%',
    },
    confidenceIndicator: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
    },
    confidenceLevelContainer: {
      alignItems: 'center',
      gap: 4,
    },
    confidenceLevelText: {
      color: COLORS.accent,
      fontFamily: 'Inter',
      fontSize: dimensions.isTablet ? 13 : 12,
      fontWeight: '600',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    confidenceScoreText: {
      color: COLORS.textLight,
      fontFamily: 'Inter',
      fontSize: dimensions.isTablet ? 11 : 10,
    },
    container: {
      marginBottom: SPACING_V2.xl,
      marginHorizontal: SPACING_V2.md,
    },
    content: {
      alignItems: 'center',
    },
    footer: {
      alignItems: 'center',
    },
    glow: {
      borderRadius: 24,
      flex: 1,
    },
    glowContainer: {
      borderRadius: 24,
      bottom: -4,
      left: -4,
      position: 'absolute',
      right: -4,
      top: -4,
      zIndex: -1,
    },
    gradient: {
      padding: dimensions.padding,
    },
    header: {
      marginBottom: 20,
    },
    noteContainer: {
      marginBottom: 20,
    },
    noteText: {
      color: COLORS.text,
      fontFamily: 'Inter',
      fontSize: dimensions.fontSize,
      fontStyle: 'italic',
      lineHeight: dimensions.isTablet ? 28 : 24,
      textAlign: 'center',
    },
    sparkle: {
      left: -30,
      position: 'absolute',
    },
  });
