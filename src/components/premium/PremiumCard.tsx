import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  StyleProp,
} from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';
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
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  padding?: keyof typeof DesignSystem.spacing;
  borderRadius?: keyof typeof DesignSystem.borderRadius;
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
  scale.value = withSpring(0.98, DesignSystem.animations.spring.smooth);
      elevation.value = withTiming(1.5, { duration: 200 });
      if (variant === 'luxury') {
        glowIntensity.value = withTiming(1, { duration: 200 });
      }
    }
  };

  const handlePressOut = () => {
    if (interactive) {
      scale.value = withSpring(1, DesignSystem.animations.spring.gentle);
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
      borderRadius: DesignSystem.borderRadius[borderRadius],
      overflow: 'hidden',
    };

    const variantStyles: Record<string, ViewStyle> = {
      elevated: {
        backgroundColor: DesignSystem.colors.surface.primary,
        ...DesignSystem.elevation.medium,
      },
      glass: {
        backgroundColor: 'transparent',
        ...DesignSystem.elevation.soft,
      },
      floating: {
        backgroundColor: DesignSystem.colors.surface.secondary,
        ...DesignSystem.elevation.high,
      },
      luxury: {
        backgroundColor: DesignSystem.colors.surface.primary,
        ...DesignSystem.elevation.floating,
        shadowColor: DesignSystem.colors.gold[500],
        borderWidth: 1,
        borderColor: DesignSystem.colors.gold[200],
      },
      silk: {
        backgroundColor: DesignSystem.colors.surface.secondary,
        ...DesignSystem.elevation.soft,
        borderWidth: 0.5,
        borderColor: DesignSystem.colors.border.secondary,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getContentStyle = (): ViewStyle => {
    return {
      padding: DesignSystem.spacing[padding],
    };
  };

  const renderCard = () => {
    const cardContent = (
  <View style={[getContentStyle(), contentStyle] as any}>
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
              borderRadius: DesignSystem.borderRadius[borderRadius],
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