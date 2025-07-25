// Confidence Note Component - Poetic and Encouraging
// Digital Zen Garden aesthetics with glassmorphism and organic animations

import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import { APP_THEME_V2 } from '../../constants/AppThemeV2';

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
  style?: any;
}

export const ConfidenceNote: React.FC<ConfidenceNoteProps> = ({
  note,
  confidenceScore,
  style,
}) => {
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
      padding: isTablet ? APP_THEME_V2.spacing.xxl : APP_THEME_V2.spacing.xl,
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
        withTiming(0.7, { duration: 1200 })
      );
      sparkleRotation.value = withTiming(360, { duration: 2000 });
    }, 200);

    return () => clearTimeout(timer);
  }, [note]);

  // Get confidence level and corresponding styling
  const confidenceLevel = useMemo(() => {
    if (confidenceScore >= 4.5) return 'exceptional';
    if (confidenceScore >= 4.0) return 'high';
    if (confidenceScore >= 3.5) return 'good';
    if (confidenceScore >= 3.0) return 'moderate';
    return 'building';
  }, [confidenceScore]);

  const confidenceColors = useMemo(() => {
    switch (confidenceLevel) {
      case 'exceptional':
        return {
          primary: APP_THEME_V2.colors.liquidGold[500],
          secondary: APP_THEME_V2.colors.liquidGold[300],
          accent: APP_THEME_V2.colors.liquidGold[600],
        };
      case 'high':
        return {
          primary: APP_THEME_V2.colors.sageGreen[500],
          secondary: APP_THEME_V2.colors.sageGreen[300],
          accent: APP_THEME_V2.colors.sageGreen[600],
        };
      case 'good':
        return {
          primary: APP_THEME_V2.colors.sageGreen[400],
          secondary: APP_THEME_V2.colors.sageGreen[200],
          accent: APP_THEME_V2.colors.sageGreen[500],
        };
      case 'moderate':
        return {
          primary: APP_THEME_V2.colors.inkGray[500],
          secondary: APP_THEME_V2.colors.inkGray[300],
          accent: APP_THEME_V2.colors.inkGray[600],
        };
      default:
        return {
          primary: APP_THEME_V2.colors.inkGray[400],
          secondary: APP_THEME_V2.colors.inkGray[200],
          accent: APP_THEME_V2.colors.inkGray[500],
        };
    }
  }, [confidenceLevel]);

  const confidenceIcon = useMemo(() => {
    switch (confidenceLevel) {
      case 'exceptional':
        return 'star';
      case 'high':
        return 'heart';
      case 'good':
        return 'happy';
      case 'moderate':
        return 'thumbs-up';
      default:
        return 'leaf';
    }
  }, [confidenceLevel]);

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const animatedSparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
    opacity: sparkleOpacity.value,
  }));

  const styles = useMemo(() => createStyles(dimensions, confidenceColors), [dimensions, confidenceColors]);

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
                  name={confidenceIcon as any} 
                  size={dimensions.isTablet ? 24 : 20} 
                  color={confidenceColors.primary} 
                />
                <View style={styles.confidenceBar}>
                  <LinearGradient
                    colors={[confidenceColors.secondary, confidenceColors.primary]}
                    style={[
                      styles.confidenceFill,
                      { width: `${Math.min(100, Math.max(0, confidenceScore * 20))}%` }
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
  }
) => StyleSheet.create({
  container: {
    marginBottom: APP_THEME_V2.spacing.xl,
    marginHorizontal: APP_THEME_V2.spacing.md,
  },
  blur: {
    borderRadius: APP_THEME_V2.radius.organic,
    overflow: 'hidden',
    ...APP_THEME_V2.elevation.whisper,
  },
  gradient: {
    padding: dimensions.padding,
  },
  content: {
    alignItems: 'center',
  },
  header: {
    marginBottom: APP_THEME_V2.spacing.lg,
  },
  confidenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: APP_THEME_V2.spacing.md,
  },
  sparkle: {
    position: 'absolute',
    left: -30,
  },
  confidenceBar: {
    width: dimensions.isTablet ? 80 : 60,
    height: dimensions.isTablet ? 6 : 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: APP_THEME_V2.radius.sm,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: APP_THEME_V2.radius.sm,
  },
  noteContainer: {
    marginBottom: APP_THEME_V2.spacing.lg,
  },
  noteText: {
    ...APP_THEME_V2.typography.scale.whisper,
    color: APP_THEME_V2.colors.inkGray[800],
    textAlign: 'center',
    lineHeight: dimensions.isTablet ? 28 : 24,
    fontSize: dimensions.fontSize,
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
  },
  confidenceLevelContainer: {
    alignItems: 'center',
    gap: APP_THEME_V2.spacing.xs,
  },
  confidenceLevelText: {
    ...APP_THEME_V2.typography.scale.caption,
    color: colors.accent,
    fontSize: dimensions.isTablet ? 13 : 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  confidenceScoreText: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.colors.inkGray[600],
    fontSize: dimensions.isTablet ? 11 : 10,
  },
  glowContainer: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: APP_THEME_V2.radius.organic + 4,
    zIndex: -1,
  },
  glow: {
    flex: 1,
    borderRadius: APP_THEME_V2.radius.organic + 4,
  },
});