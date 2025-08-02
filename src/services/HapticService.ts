// Haptic Service - Tactile feedback system with accessibility support
import { Platform, Vibration } from 'react-native';

/**
 * Haptic feedback types aligned with AYNAMODA's wellness philosophy
 */
export enum HapticType {
  // Gentle feedback for wellness interactions
  GENTLE_TAP = 'gentle_tap',
  SOFT_PULSE = 'soft_pulse',
  CALM_NOTIFICATION = 'calm_notification',
  
  // Standard UI feedback
  LIGHT_IMPACT = 'light_impact',
  MEDIUM_IMPACT = 'medium_impact',
  HEAVY_IMPACT = 'heavy_impact',
  
  // Selection and navigation
  SELECTION = 'selection',
  NAVIGATION = 'navigation',
  CONFIRMATION = 'confirmation',
  
  // Success and error states
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  
  // Luxury interactions
  LUXURY_TOUCH = 'luxury_touch',
  PREMIUM_FEEDBACK = 'premium_feedback',
  ELEGANT_PULSE = 'elegant_pulse'
}

/**
 * Haptic intensity levels
 */
export enum HapticIntensity {
  SUBTLE = 0.3,
  GENTLE = 0.5,
  MODERATE = 0.7,
  STRONG = 1.0
}

/**
 * Haptic pattern interface
 */
interface HapticPattern {
  type: HapticType;
  intensity: HapticIntensity;
  duration: number;
  pattern?: number[]; // For custom vibration patterns
  delay?: number;
}

/**
 * Haptic configuration
 */
interface HapticConfig {
  enabled: boolean;
  globalIntensity: number; // 0-1 multiplier
  accessibilityMode: boolean;
  respectSystemSettings: boolean;
}

/**
 * Predefined haptic patterns for AYNAMODA
 */
const HAPTIC_PATTERNS: Record<HapticType, HapticPattern> = {
  // Gentle wellness patterns
  [HapticType.GENTLE_TAP]: {
    type: HapticType.GENTLE_TAP,
    intensity: HapticIntensity.SUBTLE,
    duration: 50,
    pattern: [50]
  },
  
  [HapticType.SOFT_PULSE]: {
    type: HapticType.SOFT_PULSE,
    intensity: HapticIntensity.GENTLE,
    duration: 100,
    pattern: [50, 30, 50]
  },
  
  [HapticType.CALM_NOTIFICATION]: {
    type: HapticType.CALM_NOTIFICATION,
    intensity: HapticIntensity.GENTLE,
    duration: 200,
    pattern: [100, 50, 100]
  },
  
  // Standard UI patterns
  [HapticType.LIGHT_IMPACT]: {
    type: HapticType.LIGHT_IMPACT,
    intensity: HapticIntensity.SUBTLE,
    duration: 30,
    pattern: [30]
  },
  
  [HapticType.MEDIUM_IMPACT]: {
    type: HapticType.MEDIUM_IMPACT,
    intensity: HapticIntensity.MODERATE,
    duration: 50,
    pattern: [50]
  },
  
  [HapticType.HEAVY_IMPACT]: {
    type: HapticType.HEAVY_IMPACT,
    intensity: HapticIntensity.STRONG,
    duration: 80,
    pattern: [80]
  },
  
  // Selection and navigation patterns
  [HapticType.SELECTION]: {
    type: HapticType.SELECTION,
    intensity: HapticIntensity.SUBTLE,
    duration: 20,
    pattern: [20]
  },
  
  [HapticType.NAVIGATION]: {
    type: HapticType.NAVIGATION,
    intensity: HapticIntensity.GENTLE,
    duration: 40,
    pattern: [40]
  },
  
  [HapticType.CONFIRMATION]: {
    type: HapticType.CONFIRMATION,
    intensity: HapticIntensity.MODERATE,
    duration: 60,
    pattern: [30, 20, 30]
  },
  
  // Success and error patterns
  [HapticType.SUCCESS]: {
    type: HapticType.SUCCESS,
    intensity: HapticIntensity.GENTLE,
    duration: 150,
    pattern: [50, 30, 50, 30, 50]
  },
  
  [HapticType.WARNING]: {
    type: HapticType.WARNING,
    intensity: HapticIntensity.MODERATE,
    duration: 200,
    pattern: [100, 50, 100]
  },
  
  [HapticType.ERROR]: {
    type: HapticType.ERROR,
    intensity: HapticIntensity.STRONG,
    duration: 300,
    pattern: [100, 50, 100, 50, 100]
  },
  
  // Luxury patterns
  [HapticType.LUXURY_TOUCH]: {
    type: HapticType.LUXURY_TOUCH,
    intensity: HapticIntensity.GENTLE,
    duration: 80,
    pattern: [20, 10, 30, 10, 20]
  },
  
  [HapticType.PREMIUM_FEEDBACK]: {
    type: HapticType.PREMIUM_FEEDBACK,
    intensity: HapticIntensity.MODERATE,
    duration: 120,
    pattern: [40, 20, 60, 20, 40]
  },
  
  [HapticType.ELEGANT_PULSE]: {
    type: HapticType.ELEGANT_PULSE,
    intensity: HapticIntensity.GENTLE,
    duration: 180,
    pattern: [60, 30, 90, 30, 60]
  }
};

/**
 * Haptic Service Class
 */
class HapticService {
  private config: HapticConfig = {
    enabled: true,
    globalIntensity: 1.0,
    accessibilityMode: false,
    respectSystemSettings: true
  };
  
  private isAvailable: boolean = false;
  private lastHapticTime: number = 0;
  private readonly HAPTIC_THROTTLE_MS = 50; // Prevent haptic spam
  
  constructor() {
    this.initialize();
  }
  
  /**
   * Initialize haptic service
   */
  private async initialize(): Promise<void> {
    try {
      // Check if haptics are available
      this.isAvailable = Platform.OS === 'ios' || Platform.OS === 'android';
      
      // On iOS, we could check for Haptic Engine availability
      // On Android, vibration is generally available
      
      console.log('Haptic Service initialized:', {
        available: this.isAvailable,
        platform: Platform.OS
      });
    } catch (error) {
      console.warn('Failed to initialize haptic service:', error);
      this.isAvailable = false;
    }
  }
  
  /**
   * Update haptic configuration
   */
  public updateConfig(newConfig: Partial<HapticConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * Get current configuration
   */
  public getConfig(): HapticConfig {
    return { ...this.config };
  }
  
  /**
   * Check if haptics should be triggered
   */
  private shouldTriggerHaptic(): boolean {
    if (!this.isAvailable || !this.config.enabled) {
      return false;
    }
    
    // Throttle haptic feedback to prevent spam
    const now = Date.now();
    if (now - this.lastHapticTime < this.HAPTIC_THROTTLE_MS) {
      return false;
    }
    
    this.lastHapticTime = now;
    return true;
  }
  
  /**
   * Trigger haptic feedback
   */
  public async trigger(type: HapticType, customIntensity?: number): Promise<void> {
    if (!this.shouldTriggerHaptic()) {
      return;
    }
    
    try {
      const pattern = HAPTIC_PATTERNS[type];
      if (!pattern) {
        console.warn(`Unknown haptic type: ${type}`);
        return;
      }
      
      const effectiveIntensity = customIntensity ?? pattern.intensity;
      const adjustedIntensity = effectiveIntensity * this.config.globalIntensity;
      
      if (Platform.OS === 'ios') {
        await this.triggerIOSHaptic(pattern, adjustedIntensity);
      } else if (Platform.OS === 'android') {
        await this.triggerAndroidHaptic(pattern, adjustedIntensity);
      }
    } catch (error) {
      console.warn('Failed to trigger haptic feedback:', error);
    }
  }
  
  /**
   * Trigger iOS haptic feedback
   */
  private async triggerIOSHaptic(pattern: HapticPattern, intensity: number): Promise<void> {
    // Note: In a real implementation, you would use react-native-haptic-feedback
    // or @react-native-community/react-native-haptic-feedback
    
    try {
      // For now, we'll use the basic Vibration API
      if (pattern.pattern) {
        Vibration.vibrate(pattern.pattern);
      } else {
        Vibration.vibrate(pattern.duration);
      }
      
      // In a real implementation with haptic feedback library:
      // import HapticFeedback from 'react-native-haptic-feedback';
      // 
      // const options = {
      //   enableVibrateFallback: true,
      //   ignoreAndroidSystemSettings: !this.config.respectSystemSettings
      // };
      // 
      // switch (pattern.type) {
      //   case HapticType.LIGHT_IMPACT:
      //     HapticFeedback.impact(HapticFeedback.ImpactFeedbackStyle.Light, options);
      //     break;
      //   case HapticType.MEDIUM_IMPACT:
      //     HapticFeedback.impact(HapticFeedback.ImpactFeedbackStyle.Medium, options);
      //     break;
      //   case HapticType.HEAVY_IMPACT:
      //     HapticFeedback.impact(HapticFeedback.ImpactFeedbackStyle.Heavy, options);
      //     break;
      //   case HapticType.SELECTION:
      //     HapticFeedback.selection(options);
      //     break;
      //   case HapticType.SUCCESS:
      //     HapticFeedback.notification(HapticFeedback.NotificationFeedbackType.Success, options);
      //     break;
      //   case HapticType.WARNING:
      //     HapticFeedback.notification(HapticFeedback.NotificationFeedbackType.Warning, options);
      //     break;
      //   case HapticType.ERROR:
      //     HapticFeedback.notification(HapticFeedback.NotificationFeedbackType.Error, options);
      //     break;
      //   default:
      //     HapticFeedback.impact(HapticFeedback.ImpactFeedbackStyle.Light, options);
      // }
    } catch (error) {
      console.warn('iOS haptic feedback failed:', error);
    }
  }
  
  /**
   * Trigger Android haptic feedback
   */
  private async triggerAndroidHaptic(pattern: HapticPattern, intensity: number): Promise<void> {
    try {
      if (pattern.pattern) {
        // Scale pattern based on intensity
        const scaledPattern = pattern.pattern.map(duration => 
          Math.round(duration * intensity)
        );
        Vibration.vibrate(scaledPattern);
      } else {
        const scaledDuration = Math.round(pattern.duration * intensity);
        Vibration.vibrate(scaledDuration);
      }
    } catch (error) {
      console.warn('Android haptic feedback failed:', error);
    }
  }
  
  /**
   * Trigger haptic sequence
   */
  public async triggerSequence(types: HapticType[], delay: number = 100): Promise<void> {
    for (let i = 0; i < types.length; i++) {
      await this.trigger(types[i]);
      
      if (i < types.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  /**
   * Create custom haptic pattern
   */
  public createCustomPattern(
    pattern: number[],
    intensity: HapticIntensity = HapticIntensity.MODERATE
  ): HapticPattern {
    return {
      type: HapticType.MEDIUM_IMPACT, // Default type for custom patterns
      intensity,
      duration: pattern.reduce((sum, duration) => sum + duration, 0),
      pattern
    };
  }
  
  /**
   * Trigger custom haptic pattern
   */
  public async triggerCustom(pattern: HapticPattern): Promise<void> {
    if (!this.shouldTriggerHaptic()) {
      return;
    }
    
    try {
      const adjustedIntensity = pattern.intensity * this.config.globalIntensity;
      
      if (Platform.OS === 'ios') {
        await this.triggerIOSHaptic(pattern, adjustedIntensity);
      } else if (Platform.OS === 'android') {
        await this.triggerAndroidHaptic(pattern, adjustedIntensity);
      }
    } catch (error) {
      console.warn('Failed to trigger custom haptic:', error);
    }
  }
  
  /**
   * Enable/disable haptic feedback
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }
  
  /**
   * Set global intensity multiplier
   */
  public setGlobalIntensity(intensity: number): void {
    this.config.globalIntensity = Math.max(0, Math.min(1, intensity));
  }
  
  /**
   * Enable/disable accessibility mode
   */
  public setAccessibilityMode(enabled: boolean): void {
    this.config.accessibilityMode = enabled;
    
    if (enabled) {
      // In accessibility mode, use stronger, more distinct patterns
      this.config.globalIntensity = Math.max(0.7, this.config.globalIntensity);
    }
  }
  
  /**
   * Check if haptics are available
   */
  public isHapticAvailable(): boolean {
    return this.isAvailable;
  }
  
  /**
   * Stop all haptic feedback
   */
  public stop(): void {
    try {
      Vibration.cancel();
    } catch (error) {
      console.warn('Failed to stop haptic feedback:', error);
    }
  }
}

// Create singleton instance
const hapticService = new HapticService();

/**
 * Convenience functions for common haptic patterns
 */
export const HapticFeedback = {
  // Wellness-focused gentle feedback
  gentleTap: () => hapticService.trigger(HapticType.GENTLE_TAP),
  softPulse: () => hapticService.trigger(HapticType.SOFT_PULSE),
  calmNotification: () => hapticService.trigger(HapticType.CALM_NOTIFICATION),
  
  // Standard UI feedback
  lightImpact: () => hapticService.trigger(HapticType.LIGHT_IMPACT),
  mediumImpact: () => hapticService.trigger(HapticType.MEDIUM_IMPACT),
  heavyImpact: () => hapticService.trigger(HapticType.HEAVY_IMPACT),
  
  // Selection and navigation
  selection: () => hapticService.trigger(HapticType.SELECTION),
  navigation: () => hapticService.trigger(HapticType.NAVIGATION),
  confirmation: () => hapticService.trigger(HapticType.CONFIRMATION),
  
  // Success and error states
  success: () => hapticService.trigger(HapticType.SUCCESS),
  warning: () => hapticService.trigger(HapticType.WARNING),
  error: () => hapticService.trigger(HapticType.ERROR),
  
  // Luxury interactions
  luxuryTouch: () => hapticService.trigger(HapticType.LUXURY_TOUCH),
  premiumFeedback: () => hapticService.trigger(HapticType.PREMIUM_FEEDBACK),
  elegantPulse: () => hapticService.trigger(HapticType.ELEGANT_PULSE)
};

export { hapticService };
export default hapticService;