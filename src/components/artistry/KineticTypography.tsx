// Kinetic Typography - Text as Performance Art
// Typography that glides, settles, and shimmers with liquid gold accents

import React, { useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ARTISTRY_THEME } from '../../constants/ArtistryTheme';

interface KineticTypographyProps {
  children: string;
  variant?: 'poetry' | 'gallery' | 'whisper' | 'statement' | 'elegant' | 'kinetic';
  animation?: 'glide' | 'shimmer' | 'breathe' | 'float' | 'pulse' | 'none';
  delay?: number;
  style?: any;
  shimmerWords?: string[]; // Words to highlight with shimmer effect
  onAnimationComplete?: () => void;
}

const KineticTypography: React.FC<KineticTypographyProps> = ({
  children,
  variant = 'elegant',
  animation = 'glide',
  delay = 0,
  style,
  shimmerWords = [],
  onAnimationComplete,
}) => {
  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const blur = useSharedValue(10);
  const shimmer = useSharedValue(0);
  const breathe = useSharedValue(1);

  // Get typography style based on variant
  const getTypographyStyle = () => {
    switch (variant) {
      case 'poetry':
        return ARTISTRY_THEME.typography.scale.poetry;
      case 'gallery':
        return ARTISTRY_THEME.typography.scale.gallery;
      case 'whisper':
        return ARTISTRY_THEME.typography.scale.whisper;
      case 'statement':
        return ARTISTRY_THEME.typography.scale.statement;
      case 'elegant':
        return ARTISTRY_THEME.typography.scale.elegant;
      case 'kinetic':
        return ARTISTRY_THEME.typography.scale.kinetic;
      default:
        return ARTISTRY_THEME.typography.scale.elegant;
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'poetry':
        return ARTISTRY_THEME.semantic.text.poetry;
      case 'gallery':
        return ARTISTRY_THEME.semantic.text.primary;
      case 'whisper':
        return ARTISTRY_THEME.semantic.text.whisper;
      case 'statement':
        return ARTISTRY_THEME.semantic.text.primary;
      case 'elegant':
        return ARTISTRY_THEME.semantic.text.primary;
      case 'kinetic':
        return ARTISTRY_THEME.semantic.text.accent;
      default:
        return ARTISTRY_THEME.semantic.text.primary;
    }
  };

  useEffect(() => {
    const startAnimation = () => {
      switch (animation) {
        case 'glide':
          // Glide in with blur effect
          opacity.value = withDelay(
            delay,
            withTiming(1, {
              duration: 800,
            })
          );
          
          translateY.value = withDelay(
            delay,
            withTiming(0, {
              duration: 800,
            })
          );
          
          blur.value = withDelay(
            delay,
            withTiming(0, {
              duration: 600,
            })
          );
          break;

        case 'shimmer':
          // Initial appearance
          opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
          translateY.value = withDelay(delay, withTiming(0, { duration: 400 }));
          
          // Continuous shimmer effect
          shimmer.value = withDelay(
            delay + 400,
            withRepeat(
              withSequence(
                withTiming(1, { duration: 1500 }),
                withTiming(0, { duration: 1500 })
              ),
              -1,
              true
            )
          );
          break;

        case 'breathe':
          opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
          translateY.value = withDelay(delay, withTiming(0, { duration: 600 }));
          
          // Breathing animation
          breathe.value = withDelay(
            delay + 600,
            withRepeat(
              withSequence(
                withTiming(1.02, { duration: 3000 }),
                withTiming(1, { duration: 3000 })
              ),
              -1,
              true
            )
          );
          break;

        case 'float':
          opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
          scale.value = withDelay(delay, withTiming(1, { duration: 600 }));
          
          // Floating animation
          translateY.value = withDelay(
            delay + 600,
            withRepeat(
              withSequence(
                withTiming(-8, { duration: 4000 }),
                withTiming(0, { duration: 4000 })
              ),
              -1,
              true
            )
          );
          break;

        case 'pulse':
          opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
          
          // Pulsing animation
          scale.value = withDelay(
            delay + 400,
            withRepeat(
              withSequence(
                withTiming(1.05, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
              ),
              -1,
              true
            )
          );
          break;

        case 'none':
          opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
          break;

        default:
          opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
          translateY.value = withDelay(delay, withTiming(0, { duration: 600 }));
      }
    };

    startAnimation();
  }, [animation, delay]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value * breathe.value },
      ],
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(shimmer.value, [0, 1], [0, 0.8]),
    };
  });

  // Render text with shimmer highlights
  const renderTextWithShimmer = () => {
    if (shimmerWords.length === 0) {
      return (
        <Text style={[getTypographyStyle(), { color: getTextColor() }, style]}>
          {children}
        </Text>
      );
    }

    const words = children.split(' ');
    return (
      <Text style={[getTypographyStyle(), { color: getTextColor() }, style]}>
        {words.map((word, index) => {
          const isShimmerWord = shimmerWords.some(shimmerWord => 
            word.toLowerCase().includes(shimmerWord.toLowerCase())
          );
          
          if (isShimmerWord) {
            return (
              <Text key={index}>
                <Text style={{ position: 'relative' }}>
                  {word}
                  <Animated.View
                    style={[
                      {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      },
                      shimmerStyle,
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        'transparent',
                        ARTISTRY_THEME.colors.liquidGold.glow,
                        'transparent',
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>
                </Text>
                {index < words.length - 1 ? ' ' : ''}
              </Text>
            );
          }
          
          return (
            <Text key={index}>
              {word}
              {index < words.length - 1 ? ' ' : ''}
            </Text>
          );
        })}
      </Text>
    );
  };

  return (
    <Animated.View style={animatedStyle}>
      {renderTextWithShimmer()}
    </Animated.View>
  );
};

// Preset components for common use cases
export const PoetryText: React.FC<Omit<KineticTypographyProps, 'variant'>> = (props) => (
  <KineticTypography {...props} variant="poetry" />
);

export const GalleryTitle: React.FC<Omit<KineticTypographyProps, 'variant'>> = (props) => (
  <KineticTypography {...props} variant="gallery" />
);

export const WhisperText: React.FC<Omit<KineticTypographyProps, 'variant'>> = (props) => (
  <KineticTypography {...props} variant="whisper" />
);

export const StatementText: React.FC<Omit<KineticTypographyProps, 'variant'>> = (props) => (
  <KineticTypography {...props} variant="statement" />
);

export const ElegantText: React.FC<Omit<KineticTypographyProps, 'variant'>> = (props) => (
  <KineticTypography {...props} variant="elegant" />
);

export const KineticText: React.FC<Omit<KineticTypographyProps, 'variant'>> = (props) => (
  <KineticTypography {...props} variant="kinetic" />
);

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});

export default KineticTypography;