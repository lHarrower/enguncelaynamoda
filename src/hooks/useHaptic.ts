// Haptic Hook - React hook for haptic feedback integration
import { useCallback, useContext, useEffect, useRef } from 'react';
import { AccessibilityInfo } from 'react-native';
import hapticService, { HapticType, HapticIntensity, HapticFeedback } from '../services/HapticService';
import { AnimationContext } from '../providers/AnimationProvider';

/**
 * Haptic hook options
 */
interface UseHapticOptions {
  enabled?: boolean;
  intensity?: number;
  respectReducedMotion?: boolean;
  throttleMs?: number;
}

/**
 * Haptic hook return type
 */
interface UseHapticReturn {
  // Basic haptic triggers
  trigger: (type: HapticType, customIntensity?: number) => Promise<void>;
  triggerSequence: (types: HapticType[], delay?: number) => Promise<void>;
  
  // Convenience methods for common patterns
  gentleTap: () => Promise<void>;
  softPulse: () => Promise<void>;
  lightImpact: () => Promise<void>;
  mediumImpact: () => Promise<void>;
  selection: () => Promise<void>;
  confirmation: () => Promise<void>;
  success: () => Promise<void>;
  error: () => Promise<void>;
  luxuryTouch: () => Promise<void>;
  
  // State and configuration
  isEnabled: boolean;
  isAvailable: boolean;
  setEnabled: (enabled: boolean) => void;
  setIntensity: (intensity: number) => void;
}

/**
 * Main haptic hook
 */
export const useHaptic = (options: UseHapticOptions = {}): UseHapticReturn => {
  const {
    enabled = true,
    intensity = 1.0,
    respectReducedMotion = true,
    throttleMs = 50
  } = options;
  
  const animationContext = useContext(AnimationContext);
  const lastTriggerTime = useRef<number>(0);
  const isEnabledRef = useRef<boolean>(enabled);
  const intensityRef = useRef<number>(intensity);
  
  // Check if haptics should be disabled due to accessibility settings
  const shouldRespectReducedMotion = respectReducedMotion && 
    animationContext?.settings.accessibility.reduceMotion;
  
  /**
   * Check if haptic should be triggered based on throttling and settings
   */
  const shouldTrigger = useCallback((): boolean => {
    if (!isEnabledRef.current || !hapticService.isHapticAvailable()) {
      return false;
    }
    
    if (shouldRespectReducedMotion) {
      return false;
    }
    
    // Throttle haptic feedback
    const now = Date.now();
    if (now - lastTriggerTime.current < throttleMs) {
      return false;
    }
    
    lastTriggerTime.current = now;
    return true;
  }, [shouldRespectReducedMotion, throttleMs]);
  
  /**
   * Trigger haptic feedback
   */
  const trigger = useCallback(async (
    type: HapticType, 
    customIntensity?: number
  ): Promise<void> => {
    if (!shouldTrigger()) {
      return;
    }
    
    const effectiveIntensity = customIntensity ?? intensityRef.current;
    await hapticService.trigger(type, effectiveIntensity);
  }, [shouldTrigger]);
  
  /**
   * Trigger haptic sequence
   */
  const triggerSequence = useCallback(async (
    types: HapticType[], 
    delay: number = 100
  ): Promise<void> => {
    if (!shouldTrigger()) {
      return;
    }
    
    await hapticService.triggerSequence(types, delay);
  }, [shouldTrigger]);
  
  /**
   * Convenience methods for common haptic patterns
   */
  const gentleTap = useCallback(() => trigger(HapticType.GENTLE_TAP), [trigger]);
  const softPulse = useCallback(() => trigger(HapticType.SOFT_PULSE), [trigger]);
  const lightImpact = useCallback(() => trigger(HapticType.LIGHT_IMPACT), [trigger]);
  const mediumImpact = useCallback(() => trigger(HapticType.MEDIUM_IMPACT), [trigger]);
  const selection = useCallback(() => trigger(HapticType.SELECTION), [trigger]);
  const confirmation = useCallback(() => trigger(HapticType.CONFIRMATION), [trigger]);
  const success = useCallback(() => trigger(HapticType.SUCCESS), [trigger]);
  const error = useCallback(() => trigger(HapticType.ERROR), [trigger]);
  const luxuryTouch = useCallback(() => trigger(HapticType.LUXURY_TOUCH), [trigger]);
  
  /**
   * Set enabled state
   */
  const setEnabled = useCallback((newEnabled: boolean) => {
    isEnabledRef.current = newEnabled;
    hapticService.setEnabled(newEnabled);
  }, []);
  
  /**
   * Set intensity
   */
  const setIntensity = useCallback((newIntensity: number) => {
    intensityRef.current = Math.max(0, Math.min(1, newIntensity));
    hapticService.setGlobalIntensity(intensityRef.current);
  }, []);
  
  // Initialize haptic service settings
  useEffect(() => {
    hapticService.setEnabled(isEnabledRef.current);
    hapticService.setGlobalIntensity(intensityRef.current);
  }, []);
  
  // Update accessibility mode based on animation context
  useEffect(() => {
    if (animationContext?.settings.accessibility) {
      hapticService.setAccessibilityMode(
        animationContext.settings.accessibility.highContrast ||
        animationContext.settings.accessibility.reduceMotion
      );
    }
  }, [animationContext?.settings.accessibility]);
  
  return {
    trigger,
    triggerSequence,
    gentleTap,
    softPulse,
    lightImpact,
    mediumImpact,
    selection,
    confirmation,
    success,
    error,
    luxuryTouch,
    isEnabled: isEnabledRef.current,
    isAvailable: hapticService.isHapticAvailable(),
    setEnabled,
    setIntensity
  };
};

/**
 * Hook for button haptic feedback
 */
export const useButtonHaptic = (type: 'gentle' | 'standard' | 'luxury' = 'standard') => {
  const { trigger } = useHaptic();
  
  const onPress = useCallback(() => {
    switch (type) {
      case 'gentle':
        return trigger(HapticType.GENTLE_TAP);
      case 'luxury':
        return trigger(HapticType.LUXURY_TOUCH);
      default:
        return trigger(HapticType.LIGHT_IMPACT);
    }
  }, [trigger, type]);
  
  const onLongPress = useCallback(() => {
    return trigger(HapticType.MEDIUM_IMPACT);
  }, [trigger]);
  
  return { onPress, onLongPress };
};

/**
 * Hook for navigation haptic feedback
 */
export const useNavigationHaptic = () => {
  const { trigger } = useHaptic();
  
  const onTabPress = useCallback(() => {
    return trigger(HapticType.SELECTION);
  }, [trigger]);
  
  const onScreenTransition = useCallback(() => {
    return trigger(HapticType.NAVIGATION);
  }, [trigger]);
  
  const onBackNavigation = useCallback(() => {
    return trigger(HapticType.GENTLE_TAP);
  }, [trigger]);
  
  return {
    onTabPress,
    onScreenTransition,
    onBackNavigation
  };
};

/**
 * Hook for form haptic feedback
 */
export const useFormHaptic = () => {
  const { trigger } = useHaptic();
  
  const onFieldFocus = useCallback(() => {
    return trigger(HapticType.GENTLE_TAP);
  }, [trigger]);
  
  const onFieldError = useCallback(() => {
    return trigger(HapticType.ERROR);
  }, [trigger]);
  
  const onFormSubmit = useCallback(() => {
    return trigger(HapticType.CONFIRMATION);
  }, [trigger]);
  
  const onFormSuccess = useCallback(() => {
    return trigger(HapticType.SUCCESS);
  }, [trigger]);
  
  return {
    onFieldFocus,
    onFieldError,
    onFormSubmit,
    onFormSuccess
  };
};

/**
 * Hook for gesture haptic feedback
 */
export const useGestureHaptic = () => {
  const { trigger } = useHaptic();
  
  const onSwipeStart = useCallback(() => {
    return trigger(HapticType.GENTLE_TAP);
  }, [trigger]);
  
  const onSwipeEnd = useCallback(() => {
    return trigger(HapticType.SOFT_PULSE);
  }, [trigger]);
  
  const onPinchStart = useCallback(() => {
    return trigger(HapticType.LIGHT_IMPACT);
  }, [trigger]);
  
  const onPinchEnd = useCallback(() => {
    return trigger(HapticType.MEDIUM_IMPACT);
  }, [trigger]);
  
  const onLongPressStart = useCallback(() => {
    return trigger(HapticType.MEDIUM_IMPACT);
  }, [trigger]);
  
  return {
    onSwipeStart,
    onSwipeEnd,
    onPinchStart,
    onPinchEnd,
    onLongPressStart
  };
};

/**
 * Hook for wardrobe-specific haptic feedback
 */
export const useWardrobeHaptic = () => {
  const { trigger, triggerSequence } = useHaptic();
  
  const onItemSelect = useCallback(() => {
    return trigger(HapticType.SELECTION);
  }, [trigger]);
  
  const onItemAdd = useCallback(() => {
    return trigger(HapticType.SUCCESS);
  }, [trigger]);
  
  const onItemDelete = useCallback(() => {
    return triggerSequence([HapticType.WARNING, HapticType.CONFIRMATION], 150);
  }, [triggerSequence]);
  
  const onOutfitCreate = useCallback(() => {
    return triggerSequence([
      HapticType.GENTLE_TAP,
      HapticType.SOFT_PULSE,
      HapticType.SUCCESS
    ], 100);
  }, [triggerSequence]);
  
  const onAINameGenerated = useCallback(() => {
    return trigger(HapticType.ELEGANT_PULSE);
  }, [trigger]);
  
  const onLuxuryInteraction = useCallback(() => {
    return trigger(HapticType.PREMIUM_FEEDBACK);
  }, [trigger]);
  
  return {
    onItemSelect,
    onItemAdd,
    onItemDelete,
    onOutfitCreate,
    onAINameGenerated,
    onLuxuryInteraction
  };
};

/**
 * Hook for accessibility-enhanced haptic feedback
 */
export const useAccessibleHaptic = () => {
  const { trigger } = useHaptic({ respectReducedMotion: false }); // Override for accessibility
  
  const announceSuccess = useCallback(() => {
    return trigger(HapticType.SUCCESS, HapticIntensity.STRONG);
  }, [trigger]);
  
  const announceError = useCallback(() => {
    return trigger(HapticType.ERROR, HapticIntensity.STRONG);
  }, [trigger]);
  
  const announceNavigation = useCallback(() => {
    return trigger(HapticType.NAVIGATION, HapticIntensity.MODERATE);
  }, [trigger]);
  
  const announceSelection = useCallback(() => {
    return trigger(HapticType.SELECTION, HapticIntensity.MODERATE);
  }, [trigger]);
  
  return {
    announceSuccess,
    announceError,
    announceNavigation,
    announceSelection
  };
};

export default useHaptic;