// Haptic Provider - Global haptic feedback management
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { AccessibilityInfo, AppState, AppStateStatus } from 'react-native';
import hapticService, { HapticType, HapticIntensity } from '../services/HapticService';
import { AnimationContext } from './AnimationProvider';
import { logInDev, errorInDev } from '@/utils/consoleSuppress';

/**
 * Haptic settings interface
 */
interface HapticSettings {
  enabled: boolean;
  globalIntensity: number;
  accessibilityMode: boolean;
  respectSystemSettings: boolean;
  respectReducedMotion: boolean;
  enableSoundEffects: boolean;
  enableVibrationFallback: boolean;
  customPatterns: Record<string, number[]>;
}

/**
 * Haptic context interface
 */
interface HapticContextType {
  settings: HapticSettings;
  updateSettings: (newSettings: Partial<HapticSettings>) => void;
  isAvailable: boolean;
  isEnabled: boolean;
  
  // Quick settings
  toggleHaptics: () => void;
  setIntensity: (intensity: number) => void;
  enableAccessibilityMode: (enabled: boolean) => void;
  
  // Haptic triggers
  trigger: (type: HapticType, customIntensity?: number) => Promise<void>;
  triggerSequence: (types: HapticType[], delay?: number) => Promise<void>;
  triggerCustomPattern: (pattern: number[], intensity?: number) => Promise<void>;
  
  // Convenience methods
  success: () => Promise<void>;
  error: () => Promise<void>;
  warning: () => Promise<void>;
  selection: () => Promise<void>;
  confirmation: () => Promise<void>;
  gentleTouch: () => Promise<void>;
  luxuryTouch: () => Promise<void>;
}

/**
 * Default haptic settings
 */
const DEFAULT_HAPTIC_SETTINGS: HapticSettings = {
  enabled: true,
  globalIntensity: 0.8,
  accessibilityMode: false,
  respectSystemSettings: true,
  respectReducedMotion: true,
  enableSoundEffects: false,
  enableVibrationFallback: true,
  customPatterns: {
    welcome: [100, 50, 100, 50, 200],
    goodbye: [200, 100, 100],
    notification: [50, 30, 50, 30, 50],
    achievement: [100, 50, 150, 50, 100, 50, 200]
  }
};

/**
 * Haptic Context
 */
export const HapticContext = createContext<HapticContextType | null>(null);

/**
 * Haptic Provider Props
 */
interface HapticProviderProps {
  children: ReactNode;
  initialSettings?: Partial<HapticSettings>;
}

/**
 * Haptic Provider Component
 */
export const HapticProvider: React.FC<HapticProviderProps> = ({
  children,
  initialSettings = {}
}) => {
  const [settings, setSettings] = useState<HapticSettings>({
    ...DEFAULT_HAPTIC_SETTINGS,
    ...initialSettings
  });
  
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState<boolean>(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  
  const animationContext = useContext(AnimationContext);
  
  /**
   * Initialize haptic service and accessibility settings
   */
  useEffect(() => {
    const initializeHaptics = async () => {
      try {
        // Check if haptics are available
        const available = hapticService.isHapticAvailable();
        setIsAvailable(available);
        
        // Check for reduced motion preference
        const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
        setReduceMotionEnabled(reduceMotion);
        
        // Update haptic service configuration
        hapticService.updateConfig({
          enabled: settings.enabled,
          globalIntensity: settings.globalIntensity,
          accessibilityMode: settings.accessibilityMode,
          respectSystemSettings: settings.respectSystemSettings
        });
        
        logInDev('Haptic Provider initialized:', {
          available,
          reduceMotion,
          settings
        });
      } catch (error) {
        errorInDev('Failed to initialize haptic provider:', error);
      }
    };
    
    initializeHaptics();
  }, []);
  
  /**
   * Listen for accessibility changes
   */
  useEffect(() => {
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotionEnabled
    );
    
    return () => subscription?.remove();
  }, []);
  
  /**
   * Listen for app state changes
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
      
      // Disable haptics when app is in background
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        hapticService.setEnabled(false);
      } else if (nextAppState === 'active' && settings.enabled) {
        hapticService.setEnabled(true);
      }
    });
    
    return () => subscription?.remove();
  }, [settings.enabled]);
  
  /**
   * Sync with animation context for reduced motion
   */
  useEffect(() => {
    if (animationContext?.settings?.accessibility?.reduceMotion !== undefined) {
      setReduceMotionEnabled(!!animationContext.settings?.accessibility?.reduceMotion);
    }
  }, [animationContext?.settings?.accessibility?.reduceMotion]);
  
  /**
   * Update haptic service when settings change
   */
  useEffect(() => {
    hapticService.updateConfig({
      enabled: settings.enabled && appState === 'active',
      globalIntensity: settings.globalIntensity,
      accessibilityMode: settings.accessibilityMode,
      respectSystemSettings: settings.respectSystemSettings
    });
  }, [settings, appState]);
  
  /**
   * Check if haptics should be enabled
   */
  const isEnabled = settings.enabled && 
    isAvailable && 
    appState === 'active' && 
    (!settings.respectReducedMotion || !reduceMotionEnabled);
  
  /**
   * Update settings
   */
  const updateSettings = useCallback((newSettings: Partial<HapticSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  /**
   * Toggle haptics on/off
   */
  const toggleHaptics = useCallback(() => {
    updateSettings({ enabled: !settings.enabled });
  }, [settings.enabled, updateSettings]);
  
  /**
   * Set global intensity
   */
  const setIntensity = useCallback((intensity: number) => {
    const clampedIntensity = Math.max(0, Math.min(1, intensity));
    updateSettings({ globalIntensity: clampedIntensity });
  }, [updateSettings]);
  
  /**
   * Enable/disable accessibility mode
   */
  const enableAccessibilityMode = useCallback((enabled: boolean) => {
    updateSettings({ 
      accessibilityMode: enabled,
      globalIntensity: enabled ? Math.max(0.7, settings.globalIntensity) : settings.globalIntensity
    });
  }, [settings.globalIntensity, updateSettings]);
  
  /**
   * Trigger haptic feedback
   */
  const trigger = useCallback(async (
    type: HapticType, 
    customIntensity?: number
  ): Promise<void> => {
    if (!isEnabled) return;
    
    try {
      await hapticService.trigger(type, customIntensity);
    } catch (error) {
      errorInDev('Failed to trigger haptic:', error);
    }
  }, [isEnabled]);
  
  /**
   * Trigger haptic sequence
   */
  const triggerSequence = useCallback(async (
    types: HapticType[], 
    delay: number = 100
  ): Promise<void> => {
    if (!isEnabled) return;
    
    try {
      await hapticService.triggerSequence(types, delay);
    } catch (error) {
      errorInDev('Failed to trigger haptic sequence:', error);
    }
  }, [isEnabled]);
  
  /**
   * Trigger custom pattern
   */
  const triggerCustomPattern = useCallback(async (
    pattern: number[], 
    intensity: number = HapticIntensity.MODERATE
  ): Promise<void> => {
    if (!isEnabled) return;
    
    try {
      const customPattern = hapticService.createCustomPattern(pattern, intensity);
      await hapticService.triggerCustom(customPattern);
    } catch (error) {
      errorInDev('Failed to trigger custom haptic pattern:', error);
    }
  }, [isEnabled]);
  
  /**
   * Convenience methods for common haptic patterns
   */
  const success = useCallback(() => trigger(HapticType.SUCCESS), [trigger]);
  const error = useCallback(() => trigger(HapticType.ERROR), [trigger]);
  const warning = useCallback(() => trigger(HapticType.WARNING), [trigger]);
  const selection = useCallback(() => trigger(HapticType.SELECTION), [trigger]);
  const confirmation = useCallback(() => trigger(HapticType.CONFIRMATION), [trigger]);
  const gentleTouch = useCallback(() => trigger(HapticType.GENTLE_TAP), [trigger]);
  const luxuryTouch = useCallback(() => trigger(HapticType.LUXURY_TOUCH), [trigger]);
  
  /**
   * Context value
   */
  const contextValue: HapticContextType = {
    settings,
    updateSettings,
    isAvailable,
    isEnabled,
    toggleHaptics,
    setIntensity,
    enableAccessibilityMode,
    trigger,
    triggerSequence,
    triggerCustomPattern,
    success,
    error,
    warning,
    selection,
    confirmation,
    gentleTouch,
    luxuryTouch
  };
  
  return (
    <HapticContext.Provider value={contextValue}>
      {children}
    </HapticContext.Provider>
  );
};

/**
 * Hook to use haptic context
 */
export const useHapticContext = (): HapticContextType => {
  const context = useContext(HapticContext);
  
  if (!context) {
    throw new Error('useHapticContext must be used within a HapticProvider');
  }
  
  return context;
};

/**
 * Hook for haptic settings management
 */
export const useHapticSettings = () => {
  const { settings, updateSettings, toggleHaptics, setIntensity, enableAccessibilityMode } = useHapticContext();
  
  const updateSetting = useCallback(<K extends keyof HapticSettings>(
    key: K, 
    value: HapticSettings[K]
  ) => {
    updateSettings({ [key]: value });
  }, [updateSettings]);
  
  const resetToDefaults = useCallback(() => {
    updateSettings(DEFAULT_HAPTIC_SETTINGS);
  }, [updateSettings]);
  
  const createPreset = useCallback((name: string, preset: Partial<HapticSettings>) => {
    // In a real app, you might save this to AsyncStorage
    logInDev(`Haptic preset '${name}' created:`, preset);
  }, []);
  
  return {
    settings,
    updateSetting,
    updateSettings,
    toggleHaptics,
    setIntensity,
    enableAccessibilityMode,
    resetToDefaults,
    createPreset
  };
};

/**
 * Hook for haptic status
 */
export const useHapticStatus = () => {
  const { isAvailable, isEnabled, settings } = useHapticContext();
  
  return {
    isAvailable,
    isEnabled,
    canVibrate: isAvailable && settings.enableVibrationFallback,
    hasCustomPatterns: Object.keys(settings.customPatterns).length > 0,
    accessibilityMode: settings.accessibilityMode,
    globalIntensity: settings.globalIntensity
  };
};

export default HapticProvider;