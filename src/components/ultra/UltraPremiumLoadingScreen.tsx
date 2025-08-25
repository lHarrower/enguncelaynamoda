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

const { width: _width, height: _height } = Dimensions.get('window');

interface UltraPremiumLoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

const UltraPremiumLoadingScreen: React.FC<UltraPremiumLoadingScreenProps> = ({
  message = 'Loading...',
  showProgress = false,
  progress = 0,
}) => {
  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);
  const progressValue = useSharedValue(0);
  const dotsAnimation = useSharedValue(0);

  useEffect(() => {
    // Logo entrance animation
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withTiming(1, { duration: 1000 });

    // Dots animation
    dotsAnimation.value = withRepeat(
      withSequence(withTiming(1, { duration: 600 }), withTiming(0, { duration: 600 })),
      -1,
      false,
    );
  }, [dotsAnimation, logoOpacity, logoScale]);

  useEffect(() => {
    if (showProgress) {
      progressValue.value = withTiming(progress, { duration: 300 });
    }
  }, [progress, showProgress, progressValue]);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value }],
    };
  });

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const width = interpolate(progressValue.value, [0, 100], [0, 200]);
    return {
      width,
    };
  });

  const dotsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: dotsAnimation.value,
    };
  });

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoBackground}>
            <View style={styles.logoCircle} />
          </View>
          <Text style={styles.logoText}>AYNAMODA</Text>
          <Text style={styles.logoSubtext}>Style Intelligence</Text>
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
              <Animated.View style={[styles.dot, dotsAnimatedStyle]} />
              <Animated.View style={[styles.dot, dotsAnimatedStyle]} />
              <Animated.View style={[styles.dot, dotsAnimatedStyle]} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  dot: {
    backgroundColor: DesignSystem.colors.text.primary,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  loadingMessage: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.lg,
    textAlign: 'center',
  },
  logoBackground: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.elevated,
    borderColor: DesignSystem.colors.sage[100],
    borderRadius: 40,
    borderWidth: 1,
    height: 80,
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.lg,
    width: 80,
  },
  logoCircle: {
    backgroundColor: DesignSystem.colors.text.primary,
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xxxl,
  },
  logoSubtext: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  logoText: {
    ...DesignSystem.typography.scale.hero,
    color: DesignSystem.colors.text.primary,
    fontWeight: '300',
    letterSpacing: 3,
    marginBottom: DesignSystem.spacing.xs,
  },
  messageContainer: {
    alignItems: 'center',
  },
  progressBar: {
    backgroundColor: DesignSystem.colors.text.primary,
    borderRadius: 1,
    height: '100%',
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
    backgroundColor: DesignSystem.colors.sage[100],
    borderRadius: 1,
    height: 2,
    marginBottom: DesignSystem.spacing.sm,
    overflow: 'hidden',
    width: '100%',
  },
});

export default UltraPremiumLoadingScreen;
