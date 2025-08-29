// Haptic Feedback Hook
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

import { logInDev } from '@/utils/consoleSuppress';

export type HapticFeedbackType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error'
  | 'impact';

export interface UseHapticFeedbackReturn {
  trigger: (type: HapticFeedbackType) => Promise<void>;
  triggerLight: () => Promise<void>;
  triggerMedium: () => Promise<void>;
  triggerHeavy: () => Promise<void>;
  triggerSelection: () => Promise<void>;
  triggerSuccess: () => Promise<void>;
  triggerWarning: () => Promise<void>;
  triggerError: () => Promise<void>;
}

export function useHapticFeedback(): UseHapticFeedbackReturn {
  const trigger = useCallback(async (type: HapticFeedbackType) => {
    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'selection':
          await Haptics.selectionAsync();
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'impact':
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
      }
    } catch (error) {
      logInDev('Haptic feedback failed:', error instanceof Error ? error : String(error));
    }
  }, []);

  const triggerLight = useCallback(() => trigger('light'), [trigger]);
  const triggerMedium = useCallback(() => trigger('medium'), [trigger]);
  const triggerHeavy = useCallback(() => trigger('heavy'), [trigger]);
  const triggerSelection = useCallback(() => trigger('selection'), [trigger]);
  const triggerSuccess = useCallback(() => trigger('success'), [trigger]);
  const triggerWarning = useCallback(() => trigger('warning'), [trigger]);
  const triggerError = useCallback(() => trigger('error'), [trigger]);

  return {
    trigger,
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSelection,
    triggerSuccess,
    triggerWarning,
    triggerError,
  };
}

export default useHapticFeedback;
