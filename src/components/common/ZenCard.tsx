import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';

interface ZenCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'surface' | 'glass' | 'elevated' | 'subtle';
  interactive?: boolean;
  blurIntensity?: number;
}

export default function ZenCard({
  children,
  onPress,
  style,
  variant = 'surface',
  interactive = false,
  blurIntensity = 20,
}: ZenCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (interactive || onPress) {
      scale.value = withTiming(0.98, { duration: 150 });
      opacity.value = withTiming(0.9, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (interactive || onPress) {
      scale.value = withTiming(1, { duration: 150 });
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getCardStyle = (): ViewStyle[] => {
    const baseStyle = [styles.card];
    
    switch (variant) {
      case 'glass':
        return [...baseStyle, styles.glass];
      case 'elevated':
        return [...baseStyle, styles.elevated];
      case 'subtle':
        return [...baseStyle, styles.subtle];
      default:
        return [...baseStyle, styles.surface];
    }
  };

  const CardContent = () => (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );

  const GlassCardContent = () => (
    <View style={[styles.card, styles.glassContainer, style]}>
      <BlurView intensity={blurIntensity} tint="light" style={styles.blurView}>
        <View style={styles.glassOverlay}>
          {children}
        </View>
      </BlurView>
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {variant === 'glass' ? <GlassCardContent /> : <CardContent />}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, interactive && { transform: [{ scale: scale.value }] }]}>
      {variant === 'glass' ? <GlassCardContent /> : <CardContent />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: APP_THEME_V2.radius.organic,
    padding: APP_THEME_V2.spacing.lg,
    borderWidth: 1,
    borderColor: APP_THEME_V2.colors.moonlightSilver,
  },
  
  // Variants
  surface: {
    backgroundColor: APP_THEME_V2.semantic.surface,
    ...APP_THEME_V2.elevation.whisper,
  },
  elevated: {
    backgroundColor: APP_THEME_V2.semantic.surface,
    ...APP_THEME_V2.elevation.lift,
  },
  subtle: {
    backgroundColor: APP_THEME_V2.colors.linen.light,
    ...APP_THEME_V2.elevation.whisper,
    borderColor: APP_THEME_V2.colors.linen.dark,
  },
  
  // Glass variant
  glassContainer: {
    backgroundColor: 'transparent',
    padding: 0,
    borderWidth: 0,
    overflow: 'hidden',
  },
  blurView: {
    flex: 1,
    borderRadius: APP_THEME_V2.radius.organic,
  },
  glassOverlay: {
    flex: 1,
    padding: APP_THEME_V2.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: APP_THEME_V2.radius.organic,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...APP_THEME_V2.elevation.float,
  },
});