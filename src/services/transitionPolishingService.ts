// Transition Polishing Service - Smooth Animation & Transition Management
// Provides consistent, high-quality transitions throughout the app

import { Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/theme/DesignSystem';
import { logInDev, errorInDev } from '@/utils/consoleSuppress';

export interface TransitionConfig {
  duration: number;
  easing: any;
  useNativeDriver: boolean;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'selection';
  delay?: number;
}

export interface AnimationSequence {
  animations: {
    property: string;
    toValue: number;
    config: TransitionConfig;
  }[];
  parallel?: boolean;
}

export interface TransitionPreset {
  name: string;
  config: TransitionConfig;
  description: string;
}

class TransitionPolishingService {
  private activeAnimations: Map<string, Animated.CompositeAnimation> = new Map();
  private transitionPresets: Map<string, TransitionPreset> = new Map();

  constructor() {
    this.initializePresets();
  }

  // Initialize common transition presets
  private initializePresets(): void {
    // Quick and snappy transitions
    this.transitionPresets.set('quick', {
      name: 'Quick',
      config: {
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
        hapticFeedback: 'light'
      },
      description: 'Fast, responsive transitions for immediate feedback'
    });

    // Smooth and elegant transitions
    this.transitionPresets.set('smooth', {
      name: 'Smooth',
      config: {
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
        hapticFeedback: 'medium'
      },
      description: 'Smooth, polished transitions for general use'
    });

    // Bouncy and playful transitions
    this.transitionPresets.set('bouncy', {
      name: 'Bouncy',
      config: {
        duration: 400,
        easing: Easing.bounce,
        useNativeDriver: true,
        hapticFeedback: 'medium'
      },
      description: 'Playful bounce effect for engaging interactions'
    });

    // Gentle and subtle transitions
    this.transitionPresets.set('gentle', {
      name: 'Gentle',
      config: {
        duration: 500,
        easing: Easing.out(Easing.sin),
        useNativeDriver: true,
        hapticFeedback: 'light'
      },
      description: 'Subtle, gentle transitions for background changes'
    });

    // Spring-based transitions
    this.transitionPresets.set('spring', {
      name: 'Spring',
      config: {
        duration: 350,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
        hapticFeedback: 'medium'
      },
      description: 'Spring-like motion for natural feel'
    });

    // Navigation transitions
    this.transitionPresets.set('navigation', {
      name: 'Navigation',
      config: {
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
        hapticFeedback: 'selection'
      },
      description: 'Optimized for screen transitions and navigation'
    });

    // Modal transitions
    this.transitionPresets.set('modal', {
      name: 'Modal',
      config: {
        duration: 300,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
        hapticFeedback: 'medium'
      },
      description: 'Elegant modal appearance and dismissal'
    });

    // Loading transitions
    this.transitionPresets.set('loading', {
      name: 'Loading',
      config: {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      },
      description: 'Smooth loading state transitions'
    });
  }

  // Animate a single property with preset or custom config
  animateProperty(
    animatedValue: Animated.Value,
    toValue: number,
    preset: string = 'smooth',
    customConfig?: Partial<TransitionConfig>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const presetConfig = this.transitionPresets.get(preset)?.config;
      if (!presetConfig && !customConfig) {
        reject(new Error(`Unknown preset: ${preset}`));
        return;
      }

      const config = { ...presetConfig, ...customConfig };
      
      // Trigger haptic feedback if specified
      if (config.hapticFeedback) {
        this.triggerHapticFeedback(config.hapticFeedback);
      }

      const animation = Animated.timing(animatedValue, {
        toValue,
        duration: config.duration,
        easing: config.easing,
  useNativeDriver: config.useNativeDriver ?? false,
        delay: config.delay || 0
      });

      animation.start((finished) => {
        if (finished) {
          resolve();
        } else {
          reject(new Error('Animation was interrupted'));
        }
      });
    });
  }

  // Animate multiple properties in sequence
  animateSequence(
    sequence: AnimationSequence,
    animationId?: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const animations = sequence.animations.map(({ property, toValue, config }) => {
        // This would need to be adapted based on how you pass animated values
        // For now, we'll create a generic timing animation
        return Animated.timing(new Animated.Value(0), {
          toValue,
          duration: config.duration,
          easing: config.easing,
          useNativeDriver: config.useNativeDriver,
          delay: config.delay || 0
        });
      });

      const compositeAnimation = sequence.parallel
        ? Animated.parallel(animations)
        : Animated.sequence(animations);

      if (animationId) {
        this.activeAnimations.set(animationId, compositeAnimation);
      }

      compositeAnimation.start((finished) => {
        if (animationId) {
          this.activeAnimations.delete(animationId);
        }
        
        if (finished) {
          resolve();
        } else {
          reject(new Error('Animation sequence was interrupted'));
        }
      });
    });
  }

  // Create fade transition
  createFadeTransition(
    animatedValue: Animated.Value,
    fadeIn: boolean = true,
    preset: string = 'smooth'
  ): Promise<void> {
    return this.animateProperty(
      animatedValue,
      fadeIn ? 1 : 0,
      preset
    );
  }

  // Create scale transition
  createScaleTransition(
    animatedValue: Animated.Value,
    scaleUp: boolean = true,
    preset: string = 'spring'
  ): Promise<void> {
    return this.animateProperty(
      animatedValue,
      scaleUp ? 1 : 0.8,
      preset
    );
  }

  // Create slide transition
  createSlideTransition(
    animatedValue: Animated.Value,
    direction: 'up' | 'down' | 'left' | 'right',
    distance: number = 100,
    preset: string = 'smooth'
  ): Promise<void> {
    const toValue = direction === 'up' || direction === 'left' ? -distance : distance;
    return this.animateProperty(animatedValue, toValue, preset);
  }

  // Create rotation transition
  createRotationTransition(
    animatedValue: Animated.Value,
    degrees: number = 360,
    preset: string = 'smooth'
  ): Promise<void> {
    return this.animateProperty(animatedValue, degrees, preset);
  }

  // Create stagger animation for multiple elements
  createStaggerAnimation(
    animatedValues: Animated.Value[],
    toValue: number,
    staggerDelay: number = 100,
    preset: string = 'smooth'
  ): Promise<void[]> {
    const animations = animatedValues.map((value, index) => {
      return this.animateProperty(
        value,
        toValue,
        preset,
        { delay: index * staggerDelay }
      );
    });

    return Promise.all(animations);
  }

  // Create entrance animation for components
  createEntranceAnimation(
    opacity: Animated.Value,
    scale: Animated.Value,
    translateY: Animated.Value
  ): Promise<void> {
    // Reset values
    opacity.setValue(0);
    scale.setValue(0.8);
    translateY.setValue(20);

    const animations = [
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ];

    return new Promise((resolve, reject) => {
      Animated.parallel(animations).start((finished) => {
        if (finished) {
          resolve();
        } else {
          reject(new Error('Entrance animation was interrupted'));
        }
      });
    });
  }

  // Create exit animation for components
  createExitAnimation(
    opacity: Animated.Value,
    scale: Animated.Value,
    translateY: Animated.Value
  ): Promise<void> {
    const animations = [
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 200,
        easing: Easing.in(Easing.back(1.1)),
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      })
    ];

    return new Promise((resolve, reject) => {
      Animated.parallel(animations).start((finished) => {
        if (finished) {
          resolve();
        } else {
          reject(new Error('Exit animation was interrupted'));
        }
      });
    });
  }

  // Create loading animation (continuous)
  createLoadingAnimation(
    animatedValue: Animated.Value,
    animationId: string = 'loading'
  ): void {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );

    this.activeAnimations.set(animationId, animation);
    animation.start();
  }

  // Create pulse animation
  createPulseAnimation(
    animatedValue: Animated.Value,
    minValue: number = 0.8,
    maxValue: number = 1.2,
    duration: number = 1000
  ): void {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: maxValue,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(animatedValue, {
          toValue: minValue,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );

    animation.start();
  }

  // Create shake animation for error states
  createShakeAnimation(
    animatedValue: Animated.Value,
    intensity: number = 10
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const shakeAnimation = Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: intensity,
          duration: 50,
          useNativeDriver: true
        }),
        Animated.timing(animatedValue, {
          toValue: -intensity,
          duration: 50,
          useNativeDriver: true
        }),
        Animated.timing(animatedValue, {
          toValue: intensity,
          duration: 50,
          useNativeDriver: true
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true
        })
      ]);

      // Trigger error haptic feedback
      this.triggerHapticFeedback('heavy');

      shakeAnimation.start((finished) => {
        if (finished) {
          resolve();
        } else {
          reject(new Error('Shake animation was interrupted'));
        }
      });
    });
  }

  // Create success animation
  createSuccessAnimation(
    scale: Animated.Value,
    opacity: Animated.Value
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Trigger success haptic feedback
      this.triggerHapticFeedback('medium');

      const successAnimation = Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 150,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true
          })
        ]),
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]);

      successAnimation.start((finished) => {
        if (finished) {
          resolve();
        } else {
          reject(new Error('Success animation was interrupted'));
        }
      });
    });
  }

  // Create card flip animation
  createCardFlipAnimation(
    animatedValue: Animated.Value,
    flipToBack: boolean = true
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const flipAnimation = Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 90,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(animatedValue, {
          toValue: flipToBack ? 180 : 0,
          duration: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        })
      ]);

      flipAnimation.start((finished) => {
        if (finished) {
          resolve();
        } else {
          reject(new Error('Card flip animation was interrupted'));
        }
      });
    });
  }

  // Trigger haptic feedback
  private triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'selection'): void {
    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'selection':
          Haptics.selectionAsync();
          break;
      }
    } catch (error) {
      errorInDev('Haptic feedback not available:', error);
    }
  }

  // Stop specific animation
  stopAnimation(animationId: string): void {
    const animation = this.activeAnimations.get(animationId);
    if (animation) {
      animation.stop();
      this.activeAnimations.delete(animationId);
    }
  }

  // Stop all animations
  stopAllAnimations(): void {
    this.activeAnimations.forEach((animation, id) => {
      animation.stop();
    });
    this.activeAnimations.clear();
  }

  // Get available presets
  getAvailablePresets(): TransitionPreset[] {
    return Array.from(this.transitionPresets.values());
  }

  // Add custom preset
  addCustomPreset(name: string, config: TransitionConfig, description: string): void {
    this.transitionPresets.set(name, {
      name,
      config,
      description
    });
  }

  // Create theme-aware transition
  createThemeTransition(
    animatedValue: Animated.Value,
    isDarkMode: boolean
  ): Promise<void> {
    // Smooth transition for theme changes
    return this.animateProperty(
      animatedValue,
      isDarkMode ? 1 : 0,
      'gentle',
      { duration: 400 }
    );
  }

  // Create navigation transition with direction
  createNavigationTransition(
    animatedValue: Animated.Value,
    direction: 'forward' | 'backward',
    distance: number = 100
  ): Promise<void> {
    const toValue = direction === 'forward' ? distance : -distance;
    return this.animateProperty(
      animatedValue,
      toValue,
      'navigation'
    );
  }

  // Create modal presentation transition
  createModalTransition(
    opacity: Animated.Value,
    scale: Animated.Value,
    translateY: Animated.Value,
    isPresenting: boolean = true
  ): Promise<void> {
    if (isPresenting) {
      // Reset values for presentation
      opacity.setValue(0);
      scale.setValue(0.9);
      translateY.setValue(50);

      const presentAnimation = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]);

      return new Promise((resolve, reject) => {
        presentAnimation.start((finished) => {
          if (finished) {
            resolve();
          } else {
            reject(new Error('Modal presentation was interrupted'));
          }
        });
      });
    } else {
      // Dismissal animation
      const dismissAnimation = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: 50,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true
        })
      ]);

      return new Promise((resolve, reject) => {
        dismissAnimation.start((finished) => {
          if (finished) {
            resolve();
          } else {
            reject(new Error('Modal dismissal was interrupted'));
          }
        });
      });
    }
  }
}

export const transitionPolishingService = new TransitionPolishingService();
export default transitionPolishingService;