// Animation Provider - Global animation context and settings
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, AppState, AppStateStatus, Platform } from 'react-native';

import { AnimationConfig, AnimationSystem } from '@/theme/foundations/Animation';
import { logInDev } from '@/utils/consoleSuppress';

/**
 * Animation Context Interface
 */
interface AnimationContextType {
  // Accessibility settings
  isReducedMotionEnabled: boolean;
  isHighContrastEnabled: boolean;

  // Performance settings
  isLowPowerModeEnabled: boolean;
  shouldUseNativeDriver: boolean;

  // Global animation controls
  globalAnimationsEnabled: boolean;
  animationSpeed: number; // 0.5 = half speed, 1 = normal, 2 = double speed

  // Animation preferences
  preferredTransitionType: 'fade' | 'slide' | 'scale' | 'push';
  enableHapticFeedback: boolean;
  enableSoundEffects: boolean;

  // Methods
  setGlobalAnimationsEnabled: (enabled: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setPreferredTransitionType: (type: 'fade' | 'slide' | 'scale' | 'push') => void;
  setEnableHapticFeedback: (enabled: boolean) => void;
  setEnableSoundEffects: (enabled: boolean) => void;

  // Animation utilities
  getEffectiveDuration: (baseDuration: number) => number;
  shouldAnimate: () => boolean;
  getAccessibleAnimation: (animation: AnimationConfig) => AnimationConfig;

  // Back-compat settings shape referenced elsewhere
  settings?: {
    accessibility: {
      reduceMotion: boolean;
      highContrast?: boolean;
    };
  };
}

/**
 * Default context values
 */
const defaultContext: AnimationContextType = {
  isReducedMotionEnabled: false,
  isHighContrastEnabled: false,
  isLowPowerModeEnabled: false,
  shouldUseNativeDriver: true,
  globalAnimationsEnabled: true,
  animationSpeed: 1,
  preferredTransitionType: 'slide',
  enableHapticFeedback: true,
  enableSoundEffects: false,
  setGlobalAnimationsEnabled: () => {},
  setAnimationSpeed: () => {},
  setPreferredTransitionType: () => {},
  setEnableHapticFeedback: () => {},
  setEnableSoundEffects: () => {},
  getEffectiveDuration: (duration) => duration,
  shouldAnimate: () => true,
  getAccessibleAnimation: (animation) => animation,
  settings: {
    accessibility: {
      reduceMotion: false,
      highContrast: false,
    },
  },
};

/**
 * Animation Context
 */
export const AnimationContext = createContext<AnimationContextType>(defaultContext);

/**
 * Animation Provider Props
 */
interface AnimationProviderProps {
  children: ReactNode;
  initialSettings?: Partial<{
    globalAnimationsEnabled: boolean;
    animationSpeed: number;
    preferredTransitionType: 'fade' | 'slide' | 'scale' | 'push';
    enableHapticFeedback: boolean;
    enableSoundEffects: boolean;
  }>;
}

/**
 * Animation Provider Component
 */
export const AnimationProvider: React.FC<AnimationProviderProps> = ({
  children,
  initialSettings = {},
}) => {
  // Accessibility states
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);
  const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(false);

  // Performance states
  const [isLowPowerModeEnabled, setIsLowPowerModeEnabled] = useState(false);
  const [shouldUseNativeDriver, setShouldUseNativeDriver] = useState(true);

  // User preference states
  const [globalAnimationsEnabled, setGlobalAnimationsEnabled] = useState(
    initialSettings.globalAnimationsEnabled ?? true,
  );
  const [animationSpeed, setAnimationSpeed] = useState(initialSettings.animationSpeed ?? 1);
  const [preferredTransitionType, setPreferredTransitionType] = useState<
    'fade' | 'slide' | 'scale' | 'push'
  >(initialSettings.preferredTransitionType ?? 'slide');
  const [enableHapticFeedback, setEnableHapticFeedback] = useState(
    initialSettings.enableHapticFeedback ?? true,
  );
  const [enableSoundEffects, setEnableSoundEffects] = useState(
    initialSettings.enableSoundEffects ?? false,
  );

  /**
   * Check accessibility settings on mount and when they change
   */
  useEffect(() => {
    const checkAccessibilitySettings = async () => {
      try {
        // Check reduced motion
        if (Platform.OS === 'ios') {
          const reducedMotion = await AccessibilityInfo.isReduceMotionEnabled();
          setIsReducedMotionEnabled(reducedMotion);
        } else {
          // Android doesn't have direct reduced motion API
          // We can infer from screen reader usage
          const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
          setIsReducedMotionEnabled(screenReaderEnabled);
        }

        // Check high contrast (iOS only)
        if (Platform.OS === 'ios') {
          try {
            // Note: This API might not be available in all RN versions
            // const highContrast = await AccessibilityInfo.isHighContrastEnabled();
            // setIsHighContrastEnabled(highContrast);
          } catch (error) {
            logInDev(
              'High contrast detection not available:',
              error instanceof Error ? error : String(error),
            );
          }
        }
      } catch (error) {
        logInDev(
          'Error checking accessibility settings:',
          error instanceof Error ? error : String(error),
        );
      }
    };

    checkAccessibilitySettings();

    // Listen for accessibility changes
    const reducedMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReducedMotionEnabled,
    );

    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        if (Platform.OS === 'android') {
          setIsReducedMotionEnabled(enabled);
        }
      },
    );

    return () => {
      reducedMotionSubscription?.remove();
      screenReaderSubscription?.remove();
    };
  }, []);

  /**
   * Monitor app state for performance optimization
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // Disable animations when app is in background
        setShouldUseNativeDriver(false);
      } else if (nextAppState === 'active') {
        // Re-enable animations when app becomes active
        setShouldUseNativeDriver(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  /**
   * Get effective duration based on speed and accessibility settings
   */
  const getEffectiveDuration = (baseDuration: number): number => {
    if (isReducedMotionEnabled) {
      return 0; // Instant for reduced motion
    }

    if (isLowPowerModeEnabled) {
      return baseDuration * 0.5; // Faster for low power mode
    }

    return baseDuration / animationSpeed;
  };

  /**
   * Determine if animations should run
   */
  const shouldAnimate = (): boolean => {
    return globalAnimationsEnabled && !isReducedMotionEnabled && shouldUseNativeDriver;
  };

  /**
   * Get accessible version of animation config
   */
  const getAccessibleAnimation = (animation: AnimationConfig): AnimationConfig => {
    if (!shouldAnimate()) {
      return {
        ...animation,
        duration: 0,
        useNativeDriver: false,
      };
    }

    return {
      ...animation,
      duration: getEffectiveDuration(animation.duration || 300),
      useNativeDriver: shouldUseNativeDriver,
    };
  };

  /**
   * Context value
   */
  const contextValue: AnimationContextType = {
    // Accessibility settings
    isReducedMotionEnabled,
    isHighContrastEnabled,

    // Performance settings
    isLowPowerModeEnabled,
    shouldUseNativeDriver,

    // Global animation controls
    globalAnimationsEnabled,
    animationSpeed,

    // Animation preferences
    preferredTransitionType,
    enableHapticFeedback,
    enableSoundEffects,

    // Methods
    setGlobalAnimationsEnabled,
    setAnimationSpeed,
    setPreferredTransitionType,
    setEnableHapticFeedback,
    setEnableSoundEffects,

    // Animation utilities
    getEffectiveDuration,
    shouldAnimate,
    getAccessibleAnimation,
    settings: {
      accessibility: {
        reduceMotion: isReducedMotionEnabled,
        highContrast: isHighContrastEnabled,
      },
    },
  };

  return <AnimationContext.Provider value={contextValue}>{children}</AnimationContext.Provider>;
};

/**
 * Hook to use animation context
 */
export const useAnimationContext = (): AnimationContextType => {
  const context = useContext(AnimationContext);

  if (!context) {
    throw new Error('useAnimationContext must be used within an AnimationProvider');
  }

  return context;
};

/**
 * Hook for accessible animations
 */
export const useAccessibleAnimation = () => {
  const { shouldAnimate, getAccessibleAnimation, getEffectiveDuration, isReducedMotionEnabled } =
    useAnimationContext();

  return {
    shouldAnimate,
    getAccessibleAnimation,
    getEffectiveDuration,
    isReducedMotionEnabled,

    // Convenience methods
    createTiming: (config: Partial<AnimationConfig>) =>
      getAccessibleAnimation({
        ...AnimationSystem.animations.fade.in,
        ...config,
      }),

    createSpring: (config: Partial<AnimationConfig>) =>
      getAccessibleAnimation({
        ...AnimationSystem.spring.gentle,
        ...config,
      }),

    createSequence: (animations: AnimationConfig[]) => {
      if (!shouldAnimate()) {
        return { start: (callback?: () => void) => callback?.() };
      }

      return {
        start: (callback?: () => void) => {
          const accessibleAnimations = animations.map(getAccessibleAnimation);
          // Implementation would depend on your animation library
          callback?.();
        },
      };
    },
  };
};

/**
 * Hook for performance-aware animations
 */
export const usePerformantAnimation = () => {
  const { shouldUseNativeDriver, isLowPowerModeEnabled, getEffectiveDuration } =
    useAnimationContext();

  return {
    shouldUseNativeDriver,
    isLowPowerModeEnabled,

    // Optimized animation configs
    getOptimizedConfig: (baseConfig: AnimationConfig) => ({
      ...baseConfig,
      useNativeDriver: shouldUseNativeDriver,
      duration: getEffectiveDuration(baseConfig.duration || 300),
      // Reduce complexity for low power mode
      ...(isLowPowerModeEnabled && {
        easing: AnimationSystem.easing.standard, // Use simpler easing
        iterations: 1, // Disable loops
      }),
    }),

    // Memory-efficient animation creation
    createOptimizedAnimation: (type: 'timing' | 'spring', config: AnimationConfig) => {
      const optimizedConfig = {
        ...config,
        useNativeDriver: shouldUseNativeDriver,
        duration: getEffectiveDuration(config.duration || 300),
      };

      // Return animation factory instead of instance to save memory
      return () => {
        if (type === 'spring') {
          return AnimationSystem.createOrganicSpring(1, AnimationSystem.spring.gentle);
        }
        return AnimationSystem.createLuxuryTiming(
          1,
          (optimizedConfig.duration ||
            AnimationSystem.timing.standard) as typeof AnimationSystem.timing.standard,
          optimizedConfig.easing || AnimationSystem.easing.luxury.elegant,
        );
      };
    },
  };
};

/**
 * Animation Settings Component for user preferences
 */
interface AnimationSettingsProps {
  children: (settings: {
    globalAnimationsEnabled: boolean;
    animationSpeed: number;
    preferredTransitionType: string;
    enableHapticFeedback: boolean;
    enableSoundEffects: boolean;
    onToggleAnimations: () => void;
    onSpeedChange: (speed: number) => void;
    onTransitionTypeChange: (type: 'fade' | 'slide' | 'scale' | 'push') => void;
    onToggleHaptic: () => void;
    onToggleSounds: () => void;
  }) => ReactNode;
}

export const AnimationSettings: React.FC<AnimationSettingsProps> = ({ children }) => {
  const {
    globalAnimationsEnabled,
    animationSpeed,
    preferredTransitionType,
    enableHapticFeedback,
    enableSoundEffects,
    setGlobalAnimationsEnabled,
    setAnimationSpeed,
    setPreferredTransitionType,
    setEnableHapticFeedback,
    setEnableSoundEffects,
  } = useAnimationContext();

  const settings = {
    globalAnimationsEnabled,
    animationSpeed,
    preferredTransitionType,
    enableHapticFeedback,
    enableSoundEffects,
    onToggleAnimations: () => setGlobalAnimationsEnabled(!globalAnimationsEnabled),
    onSpeedChange: setAnimationSpeed,
    onTransitionTypeChange: setPreferredTransitionType,
    onToggleHaptic: () => setEnableHapticFeedback(!enableHapticFeedback),
    onToggleSounds: () => setEnableSoundEffects(!enableSoundEffects),
  };

  return <>{children(settings)}</>;
};

export default AnimationProvider;
