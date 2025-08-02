import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

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
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 600 })
      ),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (showProgress) {
      progressValue.value = withTiming(progress, { duration: 300 });
    }
  }, [progress, showProgress]);

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
              <Animated.View style={[styles.dot, dotsAnimatedStyle, { animationDelay: '200ms' }]} />
              <Animated.View style={[styles.dot, dotsAnimatedStyle, { animationDelay: '400ms' }]} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xxxl,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DesignSystem.colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.sage[100],
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignSystem.colors.text.primary,
  },
  logoText: {
    ...DesignSystem.typography.scale.hero,
    color: DesignSystem.colors.text.primary,
    fontWeight: '300',
    letterSpacing: 3,
    marginBottom: DesignSystem.spacing.xs,
  },
  logoSubtext: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  messageContainer: {
    alignItems: 'center',
  },
  loadingMessage: {
    ...DesignSystem.typography.scale.body1,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  progressContainer: {
    alignItems: 'center',
    width: 200,
  },
  progressTrack: {
    width: '100%',
    height: 2,
    backgroundColor: DesignSystem.colors.sage[100],
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: DesignSystem.colors.text.primary,
    borderRadius: 1,
  },
  progressText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DesignSystem.colors.text.primary,
  },
});

export default UltraPremiumLoadingScreen;