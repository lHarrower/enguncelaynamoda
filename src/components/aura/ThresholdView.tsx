import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, ScrollView, Dimensions, Easing } from 'react-native';

interface ThresholdViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  animation?: 'fadeInUp' | 'fadeInDown' | 'scaleIn' | 'unfold';
  delay?: number;
  threshold?: number;
  scrollY?: Animated.Value;
}

const { height: screenHeight } = Dimensions.get('window');

/**
 * ThresholdView
 * Gentle Confidence principle - elements elegantly transition into view
 * as they cross a visual threshold
 */
const ThresholdView: React.FC<ThresholdViewProps> = ({
  children,
  style,
  animation = 'fadeInUp',
  delay = 0,
  threshold = 0.8,
  scrollY,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const scaleY = useRef(new Animated.Value(0.95)).current;
  const viewRef = useRef<any>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const checkVisibility = () => {
      if (viewRef.current && !hasAnimated.current) {
        viewRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
          const viewThreshold = screenHeight * threshold;
          const isVisible = y < viewThreshold && y + height > 0;
          
          if (isVisible && !hasAnimated.current) {
            hasAnimated.current = true;
            animateIn();
          }
        });
      }
    };

    // Initial check
    const timer = setTimeout(checkVisibility, 100);

    // Listen to scroll if scrollY is provided
    let scrollListener: any;
    if (scrollY) {
      scrollListener = scrollY.addListener(() => {
        checkVisibility();
      });
    }

    return () => {
      clearTimeout(timer);
      if (scrollListener && scrollY) {
        scrollY.removeListener(scrollListener);
      }
    };
  }, [scrollY]);

  const animateIn = () => {
    const animations: Animated.CompositeAnimation[] = [];

    // Base fade animation
    animations.push(
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1), // confidence curve
      })
    );

    // Additional animations based on type
    switch (animation) {
      case 'fadeInUp':
        animations.push(
          Animated.timing(translateY, {
            toValue: 0,
            duration: 600,
            delay,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          })
        );
        break;
      
      case 'fadeInDown':
        translateY.setValue(-20);
        animations.push(
          Animated.timing(translateY, {
            toValue: 0,
            duration: 600,
            delay,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          })
        );
        break;
      
      case 'scaleIn':
        animations.push(
          Animated.spring(scale, {
            toValue: 1,
            friction: 8,
            tension: 40,
            delay,
            useNativeDriver: true,
          })
        );
        break;
      
      case 'unfold':
        animations.push(
          Animated.spring(scaleY, {
            toValue: 1,
            friction: 8,
            tension: 40,
            delay,
            useNativeDriver: true,
          })
        );
        break;
    }

    Animated.parallel(animations).start();
  };

  const getAnimatedStyle = () => {
    const baseStyle = {
      opacity: fadeAnim,
    };

    switch (animation) {
      case 'fadeInUp':
      case 'fadeInDown':
        return {
          ...baseStyle,
          transform: [{ translateY }],
        };
      
      case 'scaleIn':
        return {
          ...baseStyle,
          transform: [{ scale }],
        };
      
      case 'unfold':
        return {
          ...baseStyle,
          transform: [{ scaleY }],
        };
      
      default:
        return baseStyle;
    }
  };

  return (
    <Animated.View
      ref={viewRef}
      style={[getAnimatedStyle(), style]}
    >
      {children}
    </Animated.View>
  );
};

export default ThresholdView;