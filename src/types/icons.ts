// Icon type definitions for Ionicons
import { Ionicons } from '@expo/vector-icons';

// Extract the valid icon names from Ionicons
export type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// Common icon mappings used throughout the app
export const COMMON_ICONS = {
  // Efficiency & Analytics
  utilization: 'shirt-outline' as IoniconsName,
  cost_efficiency: 'cash-outline' as IoniconsName,
  sustainability: 'leaf-outline' as IoniconsName,
  versatility: 'shuffle-outline' as IoniconsName,
  curation: 'star-outline' as IoniconsName,
  trend_up: 'trending-up-outline' as IoniconsName,
  trend_down: 'trending-down-outline' as IoniconsName,
  warning: 'warning-outline' as IoniconsName,
  success: 'checkmark-circle-outline' as IoniconsName,
  info: 'information-circle-outline' as IoniconsName,

  // Navigation & Actions
  close: 'close' as IoniconsName,
  heart: 'heart' as IoniconsName,
  star: 'star' as IoniconsName,
  settings: 'settings' as IoniconsName,
  back: 'arrow-back' as IoniconsName,

  // Wardrobe & Fashion
  shirt: 'shirt' as IoniconsName,
  body: 'body' as IoniconsName,
  footsteps: 'footsteps' as IoniconsName,
  diamond: 'diamond' as IoniconsName,

  // UI States
  checkmark: 'checkmark-circle' as IoniconsName,
  error: 'close-circle' as IoniconsName,
  loading: 'refresh' as IoniconsName,

  // Camera & Media
  camera: 'camera-outline' as IoniconsName,
  flash: 'flash' as IoniconsName,
  flash_outline: 'flash-outline' as IoniconsName,
  flash_off: 'flash-off' as IoniconsName,

  // Time & Notifications
  time: 'time' as IoniconsName,

  // Social & Feedback
  bulb: 'bulb' as IoniconsName,
  arrow_up_circle: 'arrow-up-circle' as IoniconsName,
} as const;

// Helper function to get icon name with type safety
export const getIconName = (iconKey: keyof typeof COMMON_ICONS): IoniconsName => {
  return COMMON_ICONS[iconKey];
};

// Helper function for insight icons with fallback
export const getInsightIcon = (type: string): IoniconsName => {
  switch (type) {
    case 'utilization':
      return 'shirt-outline';
    case 'cost_efficiency':
      return 'cash-outline';
    case 'sustainability':
      return 'leaf-outline';
    case 'versatility':
      return 'shuffle-outline';
    case 'curation':
      return 'star-outline';
    case 'trend_up':
      return 'trending-up-outline';
    case 'trend_down':
      return 'trending-down-outline';
    case 'warning':
      return 'warning-outline';
    case 'success':
      return 'checkmark-circle-outline';
    default:
      return 'information-circle-outline';
  }
};

// Helper function for trend icons
export const getTrendIcon = (trajectory: 'improving' | 'stable' | 'declining'): IoniconsName => {
  switch (trajectory) {
    case 'improving':
      return 'trending-up';
    case 'declining':
      return 'trending-down';
    case 'stable':
    default:
      return 'remove';
  }
};
