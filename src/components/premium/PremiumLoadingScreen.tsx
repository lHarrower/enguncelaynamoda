import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const { width, height } = Dimensions.get('window');

interface PremiumLoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

const PremiumLoadingScreen: React.FC<PremiumLoadingScreenProps> = ({
  message = 'Crafting your experience...',
  showProgress = false,
  progress = 0,
}) => {
  // Animation values
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const shimmerPosition = useSharedValue(-width);
  const progressValue = useSharedValue(0);
  const breathingScale = useSharedValue(1);
  const particleOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo entrance animation
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withTiming(1, { duration: 1000 });

    // Breathing animation for logo
    breathingScale.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 2000 }), withTiming(1, { duration: 2000 })),
      -1,
      false,
    );

    // Shimmer effect
    shimmerPosition.value = withRepeat(withTiming(width, { duration: 2000 }), -1, false);

    // Particle animation
    particleOpacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 1500 }), withTiming(0, { duration: 1500 })),
      -1,
      false,
    );
  }, [breathingScale, logoOpacity, logoScale, particleOpacity, shimmerPosition]);

  useEffect(() => {
    if (showProgress) {
      progressValue.value = withTiming(progress, {
        duration: 500,
      });
    }
  }, [progress, showProgress, progressValue]);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value * breathingScale.value }],
    };
  });

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerPosition.value }],
    };
  });

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const width = interpolate(progressValue.value, [0, 100], [0, 200]);
    return {
      width,
    };
  });

  const particleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: particleOpacity.value,
    };
  });

  const renderFloatingParticles = () => {
    const particles = Array.from({ length: 12 }, (_, index) => (
      <Animated.View
        key={index}
        style={[
          styles.particle,
          particleAnimatedStyle,
          {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          },
        ]}
      />
    ));
    return particles;
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[
          DesignSystem.colors.background.primary,
          DesignSystem.colors.background.secondary,
          DesignSystem.colors.background.tertiary,
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Particles */}
      <View style={styles.particlesContainer}>{renderFloatingParticles()}</View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoBackground}>
            <LinearGradient
              colors={[
                DesignSystem.colors.gold[400],
                DesignSystem.colors.gold[500],
                DesignSystem.colors.gold[600],
              ]}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            {/* Shimmer Effect */}
            <Animated.View style={[styles.shimmer, shimmerAnimatedStyle]}>
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                style={styles.shimmerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>

          <Text style={styles.logoText}>AYNAMODA</Text>
          <Text style={styles.logoSubtext}>Style Sanctuary</Text>
        </Animated.View>

        {/* Loading Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.loadingMessage}>{message}</Text>

          {/* Progress Bar */}
          {showProgress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressBar, progressAnimatedStyle]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          )}

          {/* Loading Dots */}
          {!showProgress && (
            <View style={styles.dotsContainer}>
              {[0, 1, 2].map((index) => (
                <Animated.View key={index} style={styles.dot} />
              ))}
            </View>
          )}
        </View>

        {/* Inspirational Quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quote}>
            &quot;Style is a way to say who you are without having to speak&quot;
          </Text>
          <Text style={styles.quoteAuthor}>— Rachel Zoe</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  dot: {
    backgroundColor: DesignSystem.colors.gold[500],
    borderRadius: 4,
    height: 8,
    opacity: 0.3,
    width: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  loadingMessage: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.xl,
    textAlign: 'center',
  },
  logoBackground: {
    borderRadius: 60,
    height: 120,
    marginBottom: DesignSystem.spacing.xl,
    overflow: 'hidden',
    width: 120,
    ...DesignSystem.elevation.floating,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xxxl,
  },
  logoGradient: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoSubtext: {
    ...DesignSystem.typography.caption.medium,
    color: DesignSystem.colors.text.secondary,
  },
  logoText: {
    ...DesignSystem.typography.heading.h1,
    color: DesignSystem.colors.text.primary,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: DesignSystem.spacing.xs,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xxxl,
  },
  particle: {
    backgroundColor: DesignSystem.colors.gold[300],
    borderRadius: 2,
    height: 4,
    position: 'absolute',
    width: 4,
    ...DesignSystem.elevation.soft,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  progressBar: {
    backgroundColor: DesignSystem.colors.gold[500],
    borderRadius: 2,
    height: '100%',
    ...DesignSystem.elevation.soft,
  },
  progressContainer: {
    alignItems: 'center',
    width: 200,
  },
  progressText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
  },
  progressTrack: {
    backgroundColor: DesignSystem.colors.border.secondary,
    borderRadius: 2,
    height: 4,
    marginBottom: DesignSystem.spacing.sm,
    overflow: 'hidden',
    width: '100%',
  },
  quote: {
    ...DesignSystem.typography.body.large,
    color: DesignSystem.colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
  quoteAuthor: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    opacity: 0.7,
  },
  quoteContainer: {
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  shimmer: {
    height: '100%',
    left: -50,
    position: 'absolute',
    top: 0,
    width: 50,
  },
  shimmerGradient: {
    flex: 1,
  },
});

export default PremiumLoadingScreen;
