// Quick Action Button - Organic Design with Haptic Feedback
// Digital Zen Garden aesthetics with smooth animations

import React, { useMemo } from 'react';
import {
  TouchableOpacity,
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
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { APP_THEME_V2 } from '@/constants/AppThemeV2';
import { QuickAction } from '@/types/aynaMirror';

// Animation configurations
const ORGANIC_SPRING = {
  damping: 15,
  stiffness: 120,
  mass: 1,
};

const LIQUID_SPRING = {
  damping: 12,
  stiffness: 140,
  mass: 1,
};

interface QuickActionButtonProps {
  action: QuickAction;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  action,
  onPress,
  variant = 'primary',
  size = 'medium',
  style,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Animation values
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  // Responsive dimensions
  const dimensions = useMemo(() => {
    const isTablet = screenWidth > 768;
    
    const sizeConfig = {
      small: {
        padding: isTablet ? APP_THEME_V2.spacing.md : APP_THEME_V2.spacing.sm,
        iconSize: isTablet ? 18 : 16,
        fontSize: isTablet ? 13 : 12,
        minWidth: isTablet ? 80 : 70,
      },
      medium: {
        padding: isTablet ? APP_THEME_V2.spacing.lg : APP_THEME_V2.spacing.md,
        iconSize: isTablet ? 22 : 20,
        fontSize: isTablet ? 15 : 14,
        minWidth: isTablet ? 100 : 90,
      },
      large: {
        padding: isTablet ? APP_THEME_V2.spacing.xl : APP_THEME_V2.spacing.lg,
        iconSize: isTablet ? 26 : 24,
        fontSize: isTablet ? 17 : 16,
        minWidth: isTablet ? 120 : 110,
      },
    };
    
    return {
      isTablet,
      ...sizeConfig[size],
    };
  }, [screenWidth, screenHeight, size]);

  // Get variant styling
  const variantStyles = useMemo(() => {
    switch (variant) {
      case 'primary':
        return {
          gradientColors: [
            APP_THEME_V2.colors.sageGreen[400],
            APP_THEME_V2.colors.sageGreen[500],
            APP_THEME_V2.colors.sageGreen[600],
          ] as const,
          textColor: APP_THEME_V2.colors.whisperWhite,
          iconColor: APP_THEME_V2.colors.whisperWhite,
          glowColor: APP_THEME_V2.colors.sageGreen[300],
        };
      case 'secondary':
        return {
          gradientColors: [
            'rgba(255, 255, 255, 0.3)',
            'rgba(255, 255, 255, 0.2)',
            'rgba(255, 255, 255, 0.1)',
          ] as const,
          textColor: APP_THEME_V2.colors.inkGray[700],
          iconColor: APP_THEME_V2.colors.inkGray[600],
          glowColor: APP_THEME_V2.colors.moonlightSilver,
        };
      case 'accent':
        return {
          gradientColors: [
            APP_THEME_V2.colors.liquidGold[400],
            APP_THEME_V2.colors.liquidGold[500],
            APP_THEME_V2.colors.liquidGold[600],
          ] as const,
          textColor: APP_THEME_V2.colors.whisperWhite,
          iconColor: APP_THEME_V2.colors.whisperWhite,
          glowColor: APP_THEME_V2.colors.liquidGold[300],
        };
      default:
        return {
          gradientColors: [
            'rgba(255, 255, 255, 0.3)',
            'rgba(255, 255, 255, 0.2)',
            'rgba(255, 255, 255, 0.1)',
          ] as const,
          textColor: APP_THEME_V2.colors.inkGray[700],
          iconColor: APP_THEME_V2.colors.inkGray[600],
          glowColor: APP_THEME_V2.colors.moonlightSilver,
        };
    }
  }, [variant]);

  // Get action-specific styling
  const actionStyles = useMemo(() => {
    switch (action.type) {
      case 'wear':
        return {
          variant: 'primary' as const,
          hapticStyle: Haptics.ImpactFeedbackStyle.Medium,
        };
      case 'save':
        return {
          variant: 'secondary' as const,
          hapticStyle: Haptics.ImpactFeedbackStyle.Light,
        };
      case 'share':
        return {
          variant: 'accent' as const,
          hapticStyle: Haptics.ImpactFeedbackStyle.Light,
        };
      default:
        return {
          variant: 'secondary' as const,
          hapticStyle: Haptics.ImpactFeedbackStyle.Light,
        };
    }
  }, [action.type]);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, ORGANIC_SPRING);
    glowOpacity.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, LIQUID_SPRING);
    glowOpacity.value = withTiming(0, { duration: 300 });
  };

  const handlePress = () => {
    // Haptic feedback based on action type
    Haptics.impactAsync(actionStyles.hapticStyle);
    
    // Quick scale animation
    scale.value = withSpring(0.92, { ...ORGANIC_SPRING, damping: 20 });
    setTimeout(() => {
      scale.value = withSpring(1, LIQUID_SPRING);
    }, 100);
    
    onPress();
  };

  // Animated styles
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const styles = useMemo(() => createStyles(dimensions, variantStyles), [dimensions, variantStyles]);

  return (
    <Animated.View style={[styles.container, animatedButtonStyle, style]}>
      {/* Glow effect */}
      <Animated.View style={[styles.glowContainer, animatedGlowStyle]}>
        <LinearGradient
          colors={[
            `${variantStyles.glowColor}40`,
            `${variantStyles.glowColor}20`,
            'transparent',
          ]}
          style={styles.glow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={action.label}
        accessibilityHint={`Double tap to ${action.label.toLowerCase()}`}
      >
        {variant === 'secondary' ? (
          <BlurView intensity={15} tint="light" style={styles.blurBackground}>
            <LinearGradient
              colors={variantStyles.gradientColors}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name={action.icon as any} 
                size={dimensions.iconSize} 
                color={variantStyles.iconColor} 
              />
              <Text style={[styles.text, { color: variantStyles.textColor }]}>
                {action.label}
              </Text>
            </LinearGradient>
          </BlurView>
        ) : (
          <LinearGradient
            colors={variantStyles.gradientColors}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons 
              name={action.icon as any} 
              size={dimensions.iconSize} 
              color={variantStyles.iconColor} 
            />
            <Text style={[styles.text, { color: variantStyles.textColor }]}>
              {action.label}
            </Text>
          </LinearGradient>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Dynamic styles based on responsive dimensions and variant
const createStyles = (
  dimensions: { 
    isTablet: boolean; 
    padding: number;
    iconSize: number;
    fontSize: number;
    minWidth: number;
  },
  variantStyles: {
    gradientColors: readonly [string, string, string];
    textColor: string;
    iconColor: string;
    glowColor: string;
  }
) => StyleSheet.create({
  container: {
    minWidth: dimensions.minWidth,
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
  button: {
    borderRadius: APP_THEME_V2.radius.organic,
    overflow: 'hidden',
    ...APP_THEME_V2.elevation.whisper,
  },
  blurBackground: {
    flex: 1,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: dimensions.padding,
    paddingVertical: dimensions.padding * 0.75,
    gap: APP_THEME_V2.spacing.sm,
    minHeight: dimensions.isTablet ? 48 : 44,
  },
  text: {
    ...APP_THEME_V2.typography.scale.button,
    fontSize: dimensions.fontSize,
    fontWeight: '600',
    textAlign: 'center',
  },
});