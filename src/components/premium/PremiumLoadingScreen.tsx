import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { PREMIUM_THEME } from '@/constants/PremiumThemeSystem';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      false
    );

    // Shimmer effect
    shimmerPosition.value = withRepeat(
      withTiming(width, { duration: 2000 }),
      -1,
      false
    );

    // Particle animation
    particleOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (showProgress) {
      progressValue.value = withTiming(progress, { 
        duration: 500
      });
    }
  }, [progress, showProgress]);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [
        { scale: logoScale.value * breathingScale.value },
      ],
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
            animationDelay: `${index * 200}ms`,
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
          PREMIUM_THEME.semantic.background.primary,
          PREMIUM_THEME.semantic.background.secondary,
          PREMIUM_THEME.semantic.background.tertiary,
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Particles */}
      <View style={styles.particlesContainer}>
        {renderFloatingParticles()}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoBackground}>
            <LinearGradient
              colors={[
                PREMIUM_THEME.colors.champagne[400],
                PREMIUM_THEME.colors.champagne[500],
                PREMIUM_THEME.colors.champagne[600],
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
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      animationDelay: `${index * 200}ms`,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Inspirational Quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quote}>
            "Style is a way to say who you are without having to speak"
          </Text>
          <Text style={styles.quoteAuthor}>— Rachel Zoe</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PREMIUM_THEME.colors.champagne[300],
    ...PREMIUM_THEME.elevation.hover,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: PREMIUM_THEME.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: PREMIUM_THEME.spacing.xxxl,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: PREMIUM_THEME.spacing.xl,
    overflow: 'hidden',
    ...PREMIUM_THEME.elevation.dramatic,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: -50,
    width: 50,
    height: '100%',
  },
  shimmerGradient: {
    flex: 1,
  },
  logoText: {
    ...PREMIUM_THEME.typography.scale.display,
    color: PREMIUM_THEME.semantic.text.primary,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: PREMIUM_THEME.spacing.xs,
  },
  logoSubtext: {
    ...PREMIUM_THEME.typography.scale.whisper,
    color: PREMIUM_THEME.semantic.text.secondary,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: PREMIUM_THEME.spacing.xxxl,
  },
  loadingMessage: {
    ...PREMIUM_THEME.typography.scale.body1,
    color: PREMIUM_THEME.semantic.text.secondary,
    textAlign: 'center',
    marginBottom: PREMIUM_THEME.spacing.xl,
  },
  progressContainer: {
    alignItems: 'center',
    width: 200,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: PREMIUM_THEME.semantic.border.secondary,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: PREMIUM_THEME.spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: PREMIUM_THEME.colors.champagne[500],
    borderRadius: 2,
    ...PREMIUM_THEME.elevation.hover,
  },
  progressText: {
    ...PREMIUM_THEME.typography.scale.caption,
    color: PREMIUM_THEME.semantic.text.tertiary,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: PREMIUM_THEME.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PREMIUM_THEME.colors.champagne[500],
    opacity: 0.3,
  },
  quoteContainer: {
    alignItems: 'center',
    paddingHorizontal: PREMIUM_THEME.spacing.lg,
  },
  quote: {
    ...PREMIUM_THEME.typography.scale.poetry,
    color: PREMIUM_THEME.semantic.text.tertiary,
    textAlign: 'center',
    marginBottom: PREMIUM_THEME.spacing.sm,
  },
  quoteAuthor: {
    ...PREMIUM_THEME.typography.scale.caption,
    color: PREMIUM_THEME.semantic.text.tertiary,
    opacity: 0.7,
  },
});

export default PremiumLoadingScreen;