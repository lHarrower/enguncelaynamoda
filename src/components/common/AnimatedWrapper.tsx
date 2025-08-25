/**
 * AnimatedWrapper Component
 * Reanimated transform property uyarılarını düzeltmek için wrapper component
 * Layout animasyonları ile transform özelliklerini güvenli şekilde kullanır
 */
import React from 'react';
import { TextStyle, View, ViewStyle } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';

interface AnimatedWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle | AnimatedStyle<ViewStyle>;
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

interface AnimatedTextWrapperProps {
  children: React.ReactNode;
  style?: TextStyle | AnimatedStyle<TextStyle>;
  animatedStyle?: AnimatedStyle<TextStyle>;
}

// Animated View Wrapper - Transform uyarılarını önler
const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({ children, style, animatedStyle }) => {
  return (
    <View style={style}>
      <Animated.View style={animatedStyle || {}}>{children}</Animated.View>
    </View>
  );
};

// Animated Text Wrapper - Transform uyarılarını önler
const AnimatedTextWrapper: React.FC<AnimatedTextWrapperProps> = ({
  children,
  style,
  animatedStyle,
}) => {
  return (
    <View>
      <Animated.Text style={[style, animatedStyle]}>{children}</Animated.Text>
    </View>
  );
};

// Safe Animated View - Layout animasyonları için güvenli
const SafeAnimatedView: React.FC<AnimatedWrapperProps> = ({ children, style, animatedStyle }) => {
  return (
    <Animated.View style={style}>
      <View style={animatedStyle || {}}>{children}</View>
    </Animated.View>
  );
};

export { AnimatedTextWrapper, AnimatedWrapper, SafeAnimatedView };
