// Animation Hook - Organic Motion with Accessibility Support
import { useRef, useCallback, useEffect, useState } from 'react';
import { Animated, AccessibilityInfo, Platform } from 'react-native';
import { AnimationSystem, TIMING, EASING, SPRING } from '@/theme/foundations/Animation';

/**
 * Custom hook for managing animations with accessibility support
 * 
 * Features:
 * - Automatic reduced motion detection
 * - 60fps performance optimization
 * - Organic easing curves
 * - Accessibility compliance
 * - Memory leak prevention
 */

interface UseAnimationOptions {
  reducedMotion?: boolean;
  autoStart?: boolean;
  loop?: boolean;
  resetOnUnmount?: boolean;
}

interface AnimationControls {
  start: (callback?: () => void) => void;
  stop: () => void;
  reset: () => void;
  reverse: () => void;
}

export const useAnimation = (
  initialValue: number = 0,
  options: UseAnimationOptions = {}
) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);
  
  // Check for reduced motion preference
  useEffect(() => {
    const checkReducedMotion = async () => {
      try {
        if (Platform.OS === 'ios') {
          const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
          setIsReducedMotionEnabled(isEnabled);
        } else {
          // Android doesn't have a direct equivalent, but we can check for other accessibility features
          const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
          setIsReducedMotionEnabled(isScreenReaderEnabled);
        }
      } catch (error) {
        console.warn('Could not check reduced motion preference:', error);
      }
    };
    
    checkReducedMotion();
    
    // Listen for accessibility changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReducedMotionEnabled
    );
    
    return () => {
      subscription?.remove();
    };
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentAnimation.current) {
        currentAnimation.current.stop();
      }
      if (options.resetOnUnmount) {
        animatedValue.setValue(initialValue);
      }
    };
  }, [animatedValue, initialValue, options.resetOnUnmount]);
  
  // Create animation with accessibility support
  const createAnimation = useCallback(
    (toValue: number, config: any) => {
      const shouldUseReducedMotion = options.reducedMotion ?? isReducedMotionEnabled;
      
      if (shouldUseReducedMotion) {
        return Animated.timing(animatedValue, {
          toValue,
          duration: TIMING.instant,
          easing: EASING.standard,
          useNativeDriver: true
        });
      }
      
      return Animated.timing(animatedValue, {
        toValue,
        useNativeDriver: true,
        ...config
      });
    },
    [animatedValue, isReducedMotionEnabled, options.reducedMotion]
  );
  
  // Animation control functions
  const start = useCallback(
    (toValue: number, config: any, callback?: () => void) => {
      if (currentAnimation.current) {
        currentAnimation.current.stop();
      }
      
      setIsAnimating(true);
      currentAnimation.current = createAnimation(toValue, config);
      
      currentAnimation.current.start((finished) => {
        setIsAnimating(false);
        if (finished && callback) {
          callback();
        }
        
        if (options.loop && finished) {
          // Restart animation for looping
          start(toValue, config, callback);
        }
      });
    },
    [createAnimation, options.loop]
  );
  
  const stop = useCallback(() => {
    if (currentAnimation.current) {
      currentAnimation.current.stop();
      setIsAnimating(false);
    }
  }, []);
  
  const reset = useCallback(() => {
    stop();
    animatedValue.setValue(initialValue);
  }, [animatedValue, initialValue, stop]);
  
  const reverse = useCallback(() => {
    if (currentAnimation.current) {
      // Get current value and animate back to initial
      const currentValue = (animatedValue as any)._value;
      start(initialValue, { duration: TIMING.standard, easing: EASING.exit });
    }
  }, [animatedValue, initialValue, start]);
  
  return {
    animatedValue,
    isAnimating,
    isReducedMotionEnabled,
    start,
    stop,
    reset,
    reverse
  };
};

/**
 * Hook for fade animations
 */
export const useFadeAnimation = (options: UseAnimationOptions = {}) => {
  const { animatedValue, start, stop, reset, isAnimating, isReducedMotionEnabled } = useAnimation(0, options);
  
  const fadeIn = useCallback(
    (callback?: () => void) => {
      start(1, AnimationSystem.animations.fade.in, callback);
    },
    [start]
  );
  
  const fadeOut = useCallback(
    (callback?: () => void) => {
      start(0, AnimationSystem.animations.fade.out, callback);
    },
    [start]
  );
  
  return {
    opacity: animatedValue,
    fadeIn,
    fadeOut,
    stop,
    reset,
    isAnimating,
    isReducedMotionEnabled
  };
};

/**
 * Hook for scale animations
 */
export const useScaleAnimation = (initialScale: number = 1, options: UseAnimationOptions = {}) => {
  const { animatedValue, start, stop, reset, isAnimating, isReducedMotionEnabled } = useAnimation(initialScale, options);
  
  const scaleIn = useCallback(
    (callback?: () => void) => {
      start(1, AnimationSystem.animations.scale.in, callback);
    },
    [start]
  );
  
  const scaleOut = useCallback(
    (callback?: () => void) => {
      start(0, AnimationSystem.animations.scale.out, callback);
    },
    [start]
  );
  
  const press = useCallback(
    (callback?: () => void) => {
      start(0.95, AnimationSystem.animations.scale.press, () => {
        start(1, AnimationSystem.animations.scale.press, callback);
      });
    },
    [start]
  );
  
  return {
    scale: animatedValue,
    scaleIn,
    scaleOut,
    press,
    stop,
    reset,
    isAnimating,
    isReducedMotionEnabled
  };
};

/**
 * Hook for slide animations
 */
export const useSlideAnimation = (initialPosition: number = 0, options: UseAnimationOptions = {}) => {
  const { animatedValue, start, stop, reset, isAnimating, isReducedMotionEnabled } = useAnimation(initialPosition, options);
  
  const slideUp = useCallback(
    (distance: number = 20, callback?: () => void) => {
      start(-distance, AnimationSystem.animations.slide.up, callback);
    },
    [start]
  );
  
  const slideDown = useCallback(
    (distance: number = 20, callback?: () => void) => {
      start(distance, AnimationSystem.animations.slide.down, callback);
    },
    [start]
  );
  
  const slideLeft = useCallback(
    (distance: number = 20, callback?: () => void) => {
      start(-distance, AnimationSystem.animations.slide.left, callback);
    },
    [start]
  );
  
  const slideRight = useCallback(
    (distance: number = 20, callback?: () => void) => {
      start(distance, AnimationSystem.animations.slide.right, callback);
    },
    [start]
  );
  
  const slideToPosition = useCallback(
    (position: number, callback?: () => void) => {
      start(position, AnimationSystem.animations.slide.up, callback);
    },
    [start]
  );
  
  return {
    translateY: animatedValue,
    translateX: animatedValue,
    slideUp,
    slideDown,
    slideLeft,
    slideRight,
    slideToPosition,
    stop,
    reset,
    isAnimating,
    isReducedMotionEnabled
  };
};

/**
 * Hook for spring animations with organic feel
 */
export const useSpringAnimation = (initialValue: number = 0, options: UseAnimationOptions = {}) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);
  
  // Check for reduced motion preference
  useEffect(() => {
    const checkReducedMotion = async () => {
      try {
        if (Platform.OS === 'ios') {
          const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
          setIsReducedMotionEnabled(isEnabled);
        }
      } catch (error) {
        console.warn('Could not check reduced motion preference:', error);
      }
    };
    
    checkReducedMotion();
  }, []);
  
  const springTo = useCallback(
    (toValue: number, config = SPRING.gentle, callback?: () => void) => {
      if (currentAnimation.current) {
        currentAnimation.current.stop();
      }
      
      setIsAnimating(true);
      
      if (isReducedMotionEnabled) {
        currentAnimation.current = Animated.timing(animatedValue, {
          toValue,
          duration: TIMING.instant,
          useNativeDriver: true
        });
      } else {
        currentAnimation.current = Animated.spring(animatedValue, {
          toValue,
          ...config,
          useNativeDriver: true
        });
      }
      
      currentAnimation.current.start((finished) => {
        setIsAnimating(false);
        if (finished && callback) {
          callback();
        }
      });
    },
    [animatedValue, isReducedMotionEnabled]
  );
  
  const stop = useCallback(() => {
    if (currentAnimation.current) {
      currentAnimation.current.stop();
      setIsAnimating(false);
    }
  }, []);
  
  const reset = useCallback(() => {
    stop();
    animatedValue.setValue(initialValue);
  }, [animatedValue, initialValue, stop]);
  
  return {
    animatedValue,
    springTo,
    stop,
    reset,
    isAnimating,
    isReducedMotionEnabled
  };
};

/**
 * Hook for staggered list animations
 */
export const useStaggeredAnimation = (
  itemCount: number,
  staggerDelay: number = 50,
  options: UseAnimationOptions = {}
) => {
  const animations = useRef(
    Array.from({ length: itemCount }, () => new Animated.Value(0))
  ).current;
  
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Check for reduced motion preference
  useEffect(() => {
    const checkReducedMotion = async () => {
      try {
        if (Platform.OS === 'ios') {
          const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
          setIsReducedMotionEnabled(isEnabled);
        }
      } catch (error) {
        console.warn('Could not check reduced motion preference:', error);
      }
    };
    
    checkReducedMotion();
  }, []);
  
  const startStaggered = useCallback(
    (callback?: () => void) => {
      setIsAnimating(true);
      
      if (isReducedMotionEnabled) {
        // No stagger for reduced motion
        const parallelAnimations = animations.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: TIMING.instant,
            useNativeDriver: true
          })
        );
        
        Animated.parallel(parallelAnimations).start((finished) => {
          setIsAnimating(false);
          if (finished && callback) callback();
        });
      } else {
        const staggeredAnimations = animations.map((anim, index) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: TIMING.standard,
            delay: index * staggerDelay,
            easing: EASING.organic.gentle,
            useNativeDriver: true
          })
        );
        
        Animated.parallel(staggeredAnimations).start((finished) => {
          setIsAnimating(false);
          if (finished && callback) callback();
        });
      }
    },
    [animations, staggerDelay, isReducedMotionEnabled]
  );
  
  const reset = useCallback(() => {
    animations.forEach(anim => anim.setValue(0));
    setIsAnimating(false);
  }, [animations]);
  
  return {
    animations,
    startStaggered,
    reset,
    isAnimating,
    isReducedMotionEnabled
  };
};

export default useAnimation;