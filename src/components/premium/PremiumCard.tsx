import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { PREMIUM_THEME } from '@/constants/PremiumThemeSystem';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface PremiumCardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'glass' | 'floating' | 'luxury' | 'silk';
  interactive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  padding?: keyof typeof PREMIUM_THEME.spacing;
  borderRadius?: keyof typeof PREMIUM_THEME.radius;
}

const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  variant = 'elevated',
  interactive = false,
  onPress,
  style,
  contentStyle,
  padding = 'lg',
  borderRadius = 'organic',
}) => {
  const scale = useSharedValue(1);
  const elevation = useSharedValue(1);
  const glowIntensity = useSharedValue(0);

  const handlePressIn = () => {
    if (interactive) {
      scale.value = withSpring(0.98, PREMIUM_THEME.animation.confident);
      elevation.value = withTiming(1.5, { duration: 200 });
      if (variant === 'luxury') {
        glowIntensity.value = withTiming(1, { duration: 200 });
      }
    }
  };

  const handlePressOut = () => {
    if (interactive) {
      scale.value = withSpring(1, PREMIUM_THEME.animation.silk);
      elevation.value = withTiming(1, { duration: 300 });
      if (variant === 'luxury') {
        glowIntensity.value = withTiming(0, { duration: 400 });
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      elevation.value,
      [1, 1.5],
      [0.1, 0.2]
    );

    const luxuryGlow = interpolate(
      glowIntensity.value,
      [0, 1],
      [0, 0.3]
    );

    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: variant === 'luxury' ? luxuryGlow : shadowOpacity,
    };
  });

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: PREMIUM_THEME.radius[borderRadius],
      overflow: 'hidden',
    };

    const variantStyles: Record<string, ViewStyle> = {
      elevated: {
        backgroundColor: PREMIUM_THEME.semantic.surface.primary,
        ...PREMIUM_THEME.elevation.elevate,
      },
      glass: {
        backgroundColor: 'transparent',
        ...PREMIUM_THEME.elevation.hover,
      },
      floating: {
        backgroundColor: PREMIUM_THEME.semantic.surface.secondary,
        ...PREMIUM_THEME.elevation.levitate,
      },
      luxury: {
        backgroundColor: PREMIUM_THEME.semantic.surface.primary,
        ...PREMIUM_THEME.elevation.dramatic,
        shadowColor: PREMIUM_THEME.colors.champagne[500],
        borderWidth: 1,
        borderColor: PREMIUM_THEME.colors.champagne[200],
      },
      silk: {
        backgroundColor: PREMIUM_THEME.semantic.surface.secondary,
        ...PREMIUM_THEME.elevation.hover,
        borderWidth: 0.5,
        borderColor: PREMIUM_THEME.semantic.border.secondary,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getContentStyle = (): ViewStyle => {
    return {
      padding: PREMIUM_THEME.spacing[padding],
      ...contentStyle,
    };
  };

  const renderCard = () => {
    const cardContent = (
      <View style={getContentStyle()}>
        {children}
      </View>
    );

    if (variant === 'glass') {
      return (
        <BlurView
          intensity={80}
          tint="light"
          style={[getCardStyle(), style]}
        >
          <View style={[
            StyleSheet.absoluteFill,
            { 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: PREMIUM_THEME.radius[borderRadius],
            }
          ]} />
          {cardContent}
        </BlurView>
      );
    }

    return (
      <View style={[getCardStyle(), style]}>
        {cardContent}
      </View>
    );
  };

  if (interactive && onPress) {
    return (
      <AnimatedTouchableOpacity
        style={animatedStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        {renderCard()}
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <AnimatedView style={animatedStyle}>
      {renderCard()}
    </AnimatedView>
  );
};

export default PremiumCard;