// Page Transitions - Screen-to-screen animation system
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, ViewStyle } from 'react-native';
import { useFadeAnimation, useSlideAnimation, useSpringAnimation } from '@/hooks/useAnimation';
import { AnimationSystem, TIMING, EASING } from '@/theme/foundations/Animation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Base Page Transition Container
 */
interface PageTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  transitionType?: 'fade' | 'slide' | 'scale' | 'push' | 'modal';
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  style?: ViewStyle;
  onTransitionComplete?: () => void;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isActive,
  transitionType = 'slide',
  direction = 'right',
  duration = TIMING.standard,
  style,
  onTransitionComplete
}) => {
  const { opacity, fadeIn, fadeOut, isReducedMotionEnabled } = useFadeAnimation();
  const slideAnim = useRef(new Animated.Value(isActive ? 0 : getInitialSlideValue(direction))).current;
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.8)).current;
  
  function getInitialSlideValue(dir: string): number {
    switch (dir) {
      case 'left': return -SCREEN_WIDTH;
      case 'right': return SCREEN_WIDTH;
      case 'up': return -SCREEN_HEIGHT;
      case 'down': return SCREEN_HEIGHT;
      default: return SCREEN_WIDTH;
    }
  }
  
  function getSlideTransform() {
    if (direction === 'left' || direction === 'right') {
      return { translateX: slideAnim };
    }
    return { translateY: slideAnim };
  }
  
  useEffect(() => {
    if (isReducedMotionEnabled) {
      // Skip animations for accessibility
      if (onTransitionComplete) onTransitionComplete();
      return;
    }
    
    const animations: Animated.CompositeAnimation[] = [];
    
    if (isActive) {
      // Entering animations
      switch (transitionType) {
        case 'fade':
          fadeIn(onTransitionComplete);
          break;
          
        case 'slide':
          animations.push(
            Animated.timing(slideAnim, {
              toValue: 0,
              duration,
              easing: EASING.organic.gentle,
              useNativeDriver: true
            })
          );
          break;
          
        case 'scale':
          animations.push(
            Animated.spring(scaleAnim, {
              toValue: 1,
              ...AnimationSystem.spring.gentle,
              useNativeDriver: true
            })
          );
          fadeIn();
          break;
          
        case 'push':
          animations.push(
            Animated.timing(slideAnim, {
              toValue: 0,
              duration,
              easing: EASING.enter,
              useNativeDriver: true
            })
          );
          break;
          
        case 'modal':
          animations.push(
            Animated.spring(slideAnim, {
              toValue: 0,
              ...AnimationSystem.spring.bouncy,
              useNativeDriver: true
            })
          );
          fadeIn();
          break;
      }
    } else {
      // Exiting animations
      switch (transitionType) {
        case 'fade':
          fadeOut(onTransitionComplete);
          break;
          
        case 'slide':
          animations.push(
            Animated.timing(slideAnim, {
              toValue: getInitialSlideValue(direction),
              duration,
              easing: EASING.organic.gentle,
              useNativeDriver: true
            })
          );
          break;
          
        case 'scale':
          animations.push(
            Animated.spring(scaleAnim, {
              toValue: 0.8,
              ...AnimationSystem.spring.gentle,
              useNativeDriver: true
            })
          );
          fadeOut();
          break;
          
        case 'push':
          animations.push(
            Animated.timing(slideAnim, {
              toValue: -getInitialSlideValue(direction),
              duration,
              easing: EASING.exit,
              useNativeDriver: true
            })
          );
          break;
          
        case 'modal':
          animations.push(
            Animated.timing(slideAnim, {
              toValue: SCREEN_HEIGHT,
              duration: TIMING.quick,
              easing: EASING.exit,
              useNativeDriver: true
            })
          );
          fadeOut();
          break;
      }
    }
    
    if (animations.length > 0) {
      Animated.parallel(animations).start((finished) => {
        if (finished && onTransitionComplete) {
          onTransitionComplete();
        }
      });
    }
  }, [isActive, transitionType, direction, duration, isReducedMotionEnabled]);
  
  const getAnimatedStyle = (): ViewStyle => {
    if (isReducedMotionEnabled) {
      return { opacity: isActive ? 1 : 0 };
    }
    
    const baseStyle: ViewStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    };
    
    switch (transitionType) {
      case 'fade':
        return {
          ...baseStyle,
          opacity
        };
        
      case 'slide':
      case 'push':
        return {
          ...baseStyle,
          transform: [getSlideTransform()]
        };
        
      case 'scale':
        return {
          ...baseStyle,
          opacity,
          transform: [{ scale: scaleAnim }]
        };
        
      case 'modal':
        return {
          ...baseStyle,
          opacity,
          transform: [{ translateY: slideAnim }]
        };
        
      default:
        return baseStyle;
    }
  };
  
  return (
    <Animated.View style={[getAnimatedStyle(), style]}>
      {children}
    </Animated.View>
  );
};

/**
 * Stack Navigator Transition
 */
interface StackTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  index: number;
  direction?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

export const StackTransition: React.FC<StackTransitionProps> = ({
  children,
  isActive,
  index,
  direction = 'horizontal',
  style
}) => {
  const translateAnim = useRef(new Animated.Value(isActive ? 0 : SCREEN_WIDTH)).current;
  const { isReducedMotionEnabled } = useFadeAnimation();
  
  useEffect(() => {
    if (isReducedMotionEnabled) return;
    
    Animated.timing(translateAnim, {
      toValue: isActive ? 0 : (direction === 'horizontal' ? SCREEN_WIDTH : SCREEN_HEIGHT),
      duration: TIMING.standard,
      easing: EASING.organic.gentle,
      useNativeDriver: true
    }).start();
  }, [isActive, direction, isReducedMotionEnabled]);
  
  const transform = direction === 'horizontal'
    ? { translateX: translateAnim }
    : { translateY: translateAnim };
  
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: isReducedMotionEnabled ? [] : [transform]
        },
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Tab Navigator Transition
 */
interface TabTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  tabIndex: number;
  style?: ViewStyle;
}

export const TabTransition: React.FC<TabTransitionProps> = ({
  children,
  isActive,
  tabIndex,
  style
}) => {
  const { opacity, fadeIn, fadeOut, isReducedMotionEnabled } = useFadeAnimation();
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.95)).current;
  
  useEffect(() => {
    if (isReducedMotionEnabled) return;
    
    if (isActive) {
      fadeIn();
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...AnimationSystem.spring.gentle,
        useNativeDriver: true
      }).start();
    } else {
      fadeOut();
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        ...AnimationSystem.spring.gentle,
        useNativeDriver: true
      }).start();
    }
  }, [isActive, isReducedMotionEnabled]);
  
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: isReducedMotionEnabled ? (isActive ? 1 : 0) : opacity,
          transform: isReducedMotionEnabled ? [] : [{ scale: scaleAnim }]
        },
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Modal Transition
 */
interface ModalTransitionProps {
  children: React.ReactNode;
  visible: boolean;
  animationType?: 'slide' | 'fade' | 'scale';
  onAnimationComplete?: () => void;
  style?: ViewStyle;
}

export const ModalTransition: React.FC<ModalTransitionProps> = ({
  children,
  visible,
  animationType = 'slide',
  onAnimationComplete,
  style
}) => {
  const { opacity, fadeIn, fadeOut, isReducedMotionEnabled } = useFadeAnimation();
  const slideAnim = useRef(new Animated.Value(visible ? 0 : SCREEN_HEIGHT)).current;
  const scaleAnim = useRef(new Animated.Value(visible ? 1 : 0.8)).current;
  
  useEffect(() => {
    if (isReducedMotionEnabled) {
      if (onAnimationComplete) onAnimationComplete();
      return;
    }
    
    const animations: Animated.CompositeAnimation[] = [];
    
    if (visible) {
      switch (animationType) {
        case 'fade':
          fadeIn(onAnimationComplete);
          break;
          
        case 'slide':
          animations.push(
            Animated.spring(slideAnim, {
              toValue: 0,
              ...AnimationSystem.spring.bouncy,
              useNativeDriver: true
            })
          );
          fadeIn();
          break;
          
        case 'scale':
          animations.push(
            Animated.spring(scaleAnim, {
              toValue: 1,
              ...AnimationSystem.spring.gentle,
              useNativeDriver: true
            })
          );
          fadeIn();
          break;
      }
    } else {
      switch (animationType) {
        case 'fade':
          fadeOut(onAnimationComplete);
          break;
          
        case 'slide':
          animations.push(
            Animated.timing(slideAnim, {
              toValue: SCREEN_HEIGHT,
              duration: TIMING.quick,
              easing: EASING.exit,
              useNativeDriver: true
            })
          );
          fadeOut();
          break;
          
        case 'scale':
          animations.push(
            Animated.timing(scaleAnim, {
              toValue: 0.8,
              duration: TIMING.quick,
              easing: EASING.exit,
              useNativeDriver: true
            })
          );
          fadeOut();
          break;
      }
    }
    
    if (animations.length > 0) {
      Animated.parallel(animations).start((finished) => {
        if (finished && onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }
  }, [visible, animationType, isReducedMotionEnabled]);
  
  const getAnimatedStyle = (): ViewStyle => {
    if (isReducedMotionEnabled) {
      return { opacity: visible ? 1 : 0 };
    }
    
    const baseStyle: ViewStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    };
    
    switch (animationType) {
      case 'fade':
        return {
          ...baseStyle,
          opacity
        };
        
      case 'slide':
        return {
          ...baseStyle,
          opacity,
          transform: [{ translateY: slideAnim }]
        };
        
      case 'scale':
        return {
          ...baseStyle,
          opacity,
          transform: [{ scale: scaleAnim }]
        };
        
      default:
        return baseStyle;
    }
  };
  
  if (!visible && isReducedMotionEnabled) {
    return null;
  }
  
  return (
    <Animated.View style={[getAnimatedStyle(), style]}>
      {children}
    </Animated.View>
  );
};

/**
 * Shared Element Transition (for hero animations)
 */
interface SharedElementTransitionProps {
  children: React.ReactNode;
  sharedElementId: string;
  isSource: boolean;
  style?: ViewStyle;
}

export const SharedElementTransition: React.FC<SharedElementTransitionProps> = ({
  children,
  sharedElementId,
  isSource,
  style
}) => {
  const { animatedValue, springTo, isReducedMotionEnabled } = useSpringAnimation(isSource ? 1 : 0);
  const { opacity, fadeIn, fadeOut } = useFadeAnimation();
  
  useEffect(() => {
    if (isReducedMotionEnabled) return;
    
    if (isSource) {
      fadeIn();
      springTo(1, AnimationSystem.spring.gentle);
    } else {
      fadeOut();
      springTo(0, AnimationSystem.spring.gentle);
    }
  }, [isSource, isReducedMotionEnabled]);
  
  return (
    <Animated.View
      style={[
        {
          opacity: isReducedMotionEnabled ? (isSource ? 1 : 0) : opacity,
          transform: isReducedMotionEnabled ? [] : [{ scale: animatedValue }]
        },
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Page Transition Manager - Handles multiple page states
 */
interface PageTransitionManagerProps {
  pages: React.ReactNode[];
  activeIndex: number;
  transitionType?: 'fade' | 'slide' | 'scale' | 'push' | 'modal';
  direction?: 'left' | 'right' | 'up' | 'down';
  style?: ViewStyle;
}

export const PageTransitionManager: React.FC<PageTransitionManagerProps> = ({
  pages,
  activeIndex,
  transitionType = 'slide',
  direction = 'right',
  style
}) => {
  return (
    <Animated.View style={[{ flex: 1 }, style]}>
      {pages.map((page, index) => (
        <PageTransition
          key={index}
          isActive={index === activeIndex}
          transitionType={transitionType}
          direction={direction}
        >
          {page}
        </PageTransition>
      ))}
    </Animated.View>
  );
};

/**
 * Gesture-based Page Transition
 */
interface GesturePageTransitionProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  style?: ViewStyle;
}

export const GesturePageTransition: React.FC<GesturePageTransitionProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  style
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const { isReducedMotionEnabled } = useFadeAnimation();
  
  // Note: In a real implementation, you would use react-native-gesture-handler
  // for proper gesture recognition. This is a simplified version.
  
  const resetPosition = () => {
    if (isReducedMotionEnabled) return;
    
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        ...AnimationSystem.spring.gentle,
        useNativeDriver: true
      }),
      Animated.spring(translateY, {
        toValue: 0,
        ...AnimationSystem.spring.gentle,
        useNativeDriver: true
      })
    ]).start();
  };
  
  return (
    <Animated.View
      style={[
        {
          flex: 1,
          transform: isReducedMotionEnabled ? [] : [
            { translateX },
            { translateY }
          ]
        },
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default PageTransition;