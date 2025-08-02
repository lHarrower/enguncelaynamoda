// Animated Components - Pre-built components with organic motion
import React, { useEffect, forwardRef } from 'react';
import { Animated, View, Text, TouchableOpacity, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { useFadeAnimation, useScaleAnimation, useSlideAnimation, useSpringAnimation } from '@/hooks/useAnimation';
import { AnimationSystem } from '@/theme/foundations/Animation';

/**
 * Animated View with fade-in effect
 */
interface AnimatedFadeViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  duration?: number;
  autoStart?: boolean;
  onAnimationComplete?: () => void;
}

export const AnimatedFadeView = forwardRef<View, AnimatedFadeViewProps>((
  { children, style, delay = 0, autoStart = true, onAnimationComplete, ...props },
  ref
) => {
  const { opacity, fadeIn, isReducedMotionEnabled } = useFadeAnimation();
  
  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => {
        fadeIn(onAnimationComplete);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [autoStart, delay, fadeIn, onAnimationComplete]);
  
  return (
    <Animated.View
      ref={ref}
      style={[
        style,
        {
          opacity: isReducedMotionEnabled ? 1 : opacity
        }
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
});

AnimatedFadeView.displayName = 'AnimatedFadeView';

/**
 * Animated View with slide-up effect
 */
interface AnimatedSlideViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  autoStart?: boolean;
  onAnimationComplete?: () => void;
}

export const AnimatedSlideView = forwardRef<View, AnimatedSlideViewProps>((
  {
    children,
    style,
    delay = 0,
    distance = 20,
    direction = 'up',
    autoStart = true,
    onAnimationComplete,
    ...props
  },
  ref
) => {
  const { translateY, translateX, slideUp, slideDown, slideLeft, slideRight, isReducedMotionEnabled } = useSlideAnimation(distance);
  
  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => {
        switch (direction) {
          case 'up':
            slideUp(distance, onAnimationComplete);
            break;
          case 'down':
            slideDown(distance, onAnimationComplete);
            break;
          case 'left':
            slideLeft(distance, onAnimationComplete);
            break;
          case 'right':
            slideRight(distance, onAnimationComplete);
            break;
        }
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [autoStart, delay, direction, distance, slideUp, slideDown, slideLeft, slideRight, onAnimationComplete]);
  
  const getTransform = () => {
    if (isReducedMotionEnabled) {
      return [];
    }
    
    if (direction === 'left' || direction === 'right') {
      return [{ translateX }];
    }
    return [{ translateY }];
  };
  
  return (
    <Animated.View
      ref={ref}
      style={[
        style,
        {
          transform: getTransform()
        }
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
});

AnimatedSlideView.displayName = 'AnimatedSlideView';

/**
 * Animated Button with press effects
 */
interface AnimatedButtonProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  hapticFeedback?: boolean;
  scaleEffect?: boolean;
}

export const AnimatedButton = forwardRef<TouchableOpacity, AnimatedButtonProps>((
  { children, style, onPress, disabled = false, hapticFeedback = true, scaleEffect = true, ...props },
  ref
) => {
  const { scale, press, isReducedMotionEnabled } = useScaleAnimation();
  
  const handlePress = () => {
    if (disabled) return;
    
    if (scaleEffect && !isReducedMotionEnabled) {
      press(() => {
        if (onPress) onPress();
      });
    } else {
      if (onPress) onPress();
    }
    
    // Add haptic feedback if enabled
    if (hapticFeedback) {
      // Note: You might want to add react-native-haptic-feedback for this
      // HapticFeedback.impact(HapticFeedback.ImpactFeedbackStyle.Light);
    }
  };
  
  return (
    <Animated.View
      style={[
        {
          transform: isReducedMotionEnabled ? [] : [{ scale }]
        }
      ]}
    >
      <TouchableOpacity
        ref={ref}
        style={[
          style,
          disabled && { opacity: 0.6 }
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
});

AnimatedButton.displayName = 'AnimatedButton';

/**
 * Animated Text with typewriter effect
 */
interface AnimatedTextProps {
  children: string;
  style?: TextStyle;
  delay?: number;
  speed?: number;
  autoStart?: boolean;
  onAnimationComplete?: () => void;
}

export const AnimatedText = forwardRef<Text, AnimatedTextProps>((
  { children, style, delay = 0, speed = 50, autoStart = true, onAnimationComplete, ...props },
  ref
) => {
  const [displayedText, setDisplayedText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const { opacity, fadeIn, isReducedMotionEnabled } = useFadeAnimation();
  
  useEffect(() => {
    if (isReducedMotionEnabled) {
      setDisplayedText(children);
      if (onAnimationComplete) onAnimationComplete();
      return;
    }
    
    if (autoStart) {
      const timer = setTimeout(() => {
        fadeIn();
        
        const typewriterTimer = setInterval(() => {
          setCurrentIndex(prev => {
            if (prev >= children.length) {
              clearInterval(typewriterTimer);
              if (onAnimationComplete) onAnimationComplete();
              return prev;
            }
            setDisplayedText(children.slice(0, prev + 1));
            return prev + 1;
          });
        }, speed);
        
        return () => clearInterval(typewriterTimer);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [autoStart, delay, speed, children, fadeIn, isReducedMotionEnabled, onAnimationComplete]);
  
  return (
    <Animated.Text
      ref={ref}
      style={[
        style,
        {
          opacity: isReducedMotionEnabled ? 1 : opacity
        }
      ]}
      {...props}
    >
      {isReducedMotionEnabled ? children : displayedText}
    </Animated.Text>
  );
});

AnimatedText.displayName = 'AnimatedText';

/**
 * Animated Card with spring entrance
 */
interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  autoStart?: boolean;
  onPress?: () => void;
  onAnimationComplete?: () => void;
}

export const AnimatedCard = forwardRef<View, AnimatedCardProps>((
  { children, style, delay = 0, autoStart = true, onPress, onAnimationComplete, ...props },
  ref
) => {
  const { animatedValue, springTo, isReducedMotionEnabled } = useSpringAnimation(0.8);
  const { opacity, fadeIn } = useFadeAnimation();
  
  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => {
        fadeIn();
        springTo(1, AnimationSystem.spring.gentle, onAnimationComplete);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [autoStart, delay, fadeIn, springTo, onAnimationComplete]);
  
  const CardComponent = onPress ? TouchableOpacity : Animated.View;
  
  return (
    <CardComponent
      ref={ref as any}
      style={[
        style,
        {
          opacity: isReducedMotionEnabled ? 1 : opacity,
          transform: isReducedMotionEnabled ? [] : [{ scale: animatedValue }]
        }
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.95 : 1}
      {...props}
    >
      {children}
    </CardComponent>
  );
});

AnimatedCard.displayName = 'AnimatedCard';

/**
 * Animated List Item with staggered entrance
 */
interface AnimatedListItemProps {
  children: React.ReactNode;
  style?: ViewStyle;
  index: number;
  staggerDelay?: number;
  autoStart?: boolean;
  onPress?: () => void;
  onAnimationComplete?: () => void;
}

export const AnimatedListItem = forwardRef<View, AnimatedListItemProps>((
  {
    children,
    style,
    index,
    staggerDelay = 100,
    autoStart = true,
    onPress,
    onAnimationComplete,
    ...props
  },
  ref
) => {
  const delay = index * staggerDelay;
  const { opacity, fadeIn, isReducedMotionEnabled } = useFadeAnimation();
  const { translateY, slideUp } = useSlideAnimation(20);
  
  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => {
        fadeIn();
        slideUp(20, onAnimationComplete);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [autoStart, delay, fadeIn, slideUp, onAnimationComplete]);
  
  const ItemComponent = onPress ? TouchableOpacity : Animated.View;
  
  return (
    <ItemComponent
      ref={ref as any}
      style={[
        style,
        {
          opacity: isReducedMotionEnabled ? 1 : opacity,
          transform: isReducedMotionEnabled ? [] : [{ translateY }]
        }
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.95 : 1}
      {...props}
    >
      {children}
    </ItemComponent>
  );
});

AnimatedListItem.displayName = 'AnimatedListItem';

/**
 * Animated ScrollView with parallax effect
 */
interface AnimatedScrollViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  parallaxEnabled?: boolean;
  onScroll?: (event: any) => void;
}

export const AnimatedScrollView = forwardRef<ScrollView, AnimatedScrollViewProps>((
  { children, style, parallaxEnabled = false, onScroll, ...props },
  ref
) => {
  const scrollY = React.useRef(new Animated.Value(0)).current;
  
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: onScroll
    }
  );
  
  return (
    <Animated.ScrollView
      ref={ref}
      style={style}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      {...props}
    >
      {children}
    </Animated.ScrollView>
  );
});

AnimatedScrollView.displayName = 'AnimatedScrollView';

/**
 * Animated Loading Spinner
 */
interface AnimatedSpinnerProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const AnimatedSpinner = ({ size = 24, color = '#007AFF', style }: AnimatedSpinnerProps) => {
  const { animatedValue, springTo, isReducedMotionEnabled } = useSpringAnimation(0);
  
  useEffect(() => {
    if (!isReducedMotionEnabled) {
      const animate = () => {
        springTo(1, AnimationSystem.spring.bouncy, () => {
          springTo(0, AnimationSystem.spring.bouncy, animate);
        });
      };
      animate();
    }
  }, [springTo, isReducedMotionEnabled]);
  
  const rotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  if (isReducedMotionEnabled) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: color,
            borderTopColor: 'transparent'
          },
          style
        ]}
      />
    );
  }
  
  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: color,
          borderTopColor: 'transparent',
          transform: [{ rotate: rotation }]
        },
        style
      ]}
    />
  );
};

AnimatedSpinner.displayName = 'AnimatedSpinner';

/**
 * Animated Progress Bar
 */
interface AnimatedProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: ViewStyle;
  animated?: boolean;
}

export const AnimatedProgressBar = ({
  progress,
  height = 4,
  backgroundColor = '#E5E5E7',
  progressColor = '#007AFF',
  style,
  animated = true
}: AnimatedProgressBarProps) => {
  const { animatedValue, springTo, isReducedMotionEnabled } = useSpringAnimation(0);
  
  useEffect(() => {
    if (animated && !isReducedMotionEnabled) {
      springTo(progress, AnimationSystem.spring.gentle);
    }
  }, [progress, animated, springTo, isReducedMotionEnabled]);
  
  const width = (animated && !isReducedMotionEnabled)
    ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp'
      })
    : `${progress * 100}%`;
  
  return (
    <View
      style={[
        {
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: 'hidden'
        },
        style
      ]}
    >
      <Animated.View
        style={{
          height: '100%',
          width,
          backgroundColor: progressColor,
          borderRadius: height / 2
        }}
      />
    </View>
  );
};

AnimatedProgressBar.displayName = 'AnimatedProgressBar';

export {
  AnimationSystem
} from '@/theme/foundations/Animation';