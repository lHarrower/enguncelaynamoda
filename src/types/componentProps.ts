/**
 * Standardized Component Prop Interfaces
 * 
 * This file defines consistent prop interface patterns and base types
 * that should be used across all components in the AYNAMODA application.
 */

import { ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Base prop interfaces that can be extended
export interface BaseComponentProps {
  /** Custom styles for the component container */
  style?: ViewStyle;
  /** Test ID for automated testing */
  testID?: string;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  /** Callback function when component is pressed */
  onPress?: () => void;
  /** Whether the component is in a loading state */
  loading?: boolean;
  /** Haptic feedback type on press */
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'none';
}

export interface FormComponentProps extends BaseComponentProps {
  /** Label text for the form field */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text or hint */
  hint?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom label styles */
  labelStyle?: TextStyle;
  /** Custom error text styles */
  errorStyle?: TextStyle;
}

export interface InputComponentProps extends FormComponentProps, Omit<TextInputProps, 'style'> {
  /** Icon to display on the left side */
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** Icon to display on the right side */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  /** Callback when right icon is pressed */
  onRightIconPress?: () => void;
  /** Input variant/theme */
  variant?: 'default' | 'glass' | 'luxury' | 'minimal';
  /** Input size */
  size?: 'small' | 'medium' | 'large';
  /** Custom input field styles */
  inputStyle?: TextStyle;
  /** Whether this is a password field */
  isPassword?: boolean;
}

export interface ButtonComponentProps extends InteractiveComponentProps {
  /** Button text or title */
  title?: string;
  /** Children to render inside button */
  children?: React.ReactNode;
  /** Button variant/theme */
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'luxury' | 'minimal';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Icon to display */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Icon position relative to text */
  iconPosition?: 'left' | 'right';
  /** Custom text styles */
  textStyle?: TextStyle;
  /** Full width button */
  fullWidth?: boolean;
}

export interface CardComponentProps extends InteractiveComponentProps {
  /** Content to render inside the card */
  children: React.ReactNode;
  /** Card variant/theme */
  variant?: 'elevated' | 'glass' | 'floating' | 'luxury' | 'silk' | 'minimal';
  /** Whether the card is interactive/pressable */
  interactive?: boolean;
  /** Custom content container styles */
  contentStyle?: ViewStyle;
  /** Padding size */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** Border radius size */
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
}

export interface ModalComponentProps extends BaseComponentProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal should be closed */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Modal title */
  title?: string;
  /** Whether modal can be dismissed by tapping backdrop */
  dismissible?: boolean;
  /** Animation type */
  animationType?: 'slide' | 'fade' | 'none';
  /** Modal size */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

export interface FeedbackComponentProps extends BaseComponentProps {
  /** Unique identifier for the feedback target */
  targetId: string;
  /** User ID providing feedback */
  userId: string;
  /** Callback when feedback is submitted */
  onFeedbackSubmit: (feedback: any) => Promise<void>;
  /** Callback when feedback collection is cancelled */
  onCancel?: () => void;
}

export interface NavigationComponentProps extends BaseComponentProps {
  /** Navigation object from React Navigation */
  navigation?: any;
  /** Route object from React Navigation */
  route?: any;
  /** Callback for navigation actions */
  onNavigate?: (screen: string, params?: any) => void;
}

export interface ListComponentProps<T = any> extends BaseComponentProps {
  /** Array of data items to render */
  data: T[];
  /** Function to render each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Key extractor function */
  keyExtractor?: (item: T, index: number) => string;
  /** Loading state */
  loading?: boolean;
  /** Empty state component */
  emptyComponent?: React.ReactNode;
  /** Error state */
  error?: string;
  /** Refresh callback */
  onRefresh?: () => void;
  /** Load more callback */
  onLoadMore?: () => void;
}

export interface SearchComponentProps extends InputComponentProps {
  /** Search query value */
  query: string;
  /** Callback when query changes */
  onQueryChange: (query: string) => void;
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Search suggestions */
  suggestions?: string[];
  /** Callback when suggestion is selected */
  onSuggestionSelect?: (suggestion: string) => void;
  /** Whether to show recent searches */
  showRecentSearches?: boolean;
  /** Recent searches data */
  recentSearches?: string[];
}

export interface MediaComponentProps extends BaseComponentProps {
  /** Media source URI */
  source: string;
  /** Alternative text for accessibility */
  alt?: string;
  /** Aspect ratio */
  aspectRatio?: number;
  /** Resize mode */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  /** Loading placeholder */
  placeholder?: React.ReactNode;
  /** Error placeholder */
  errorPlaceholder?: React.ReactNode;
  /** Callback when media loads */
  onLoad?: () => void;
  /** Callback when media fails to load */
  onError?: (error: any) => void;
}

// Utility types for common prop patterns
export type ComponentVariant = 'primary' | 'secondary' | 'ghost' | 'glass' | 'luxury' | 'minimal';
export type ComponentSize = 'small' | 'medium' | 'large';
export type ComponentState = 'default' | 'loading' | 'error' | 'success' | 'disabled';
export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'none';
export type AnimationType = 'slide' | 'fade' | 'scale' | 'bounce' | 'none';

// Default prop values that components should use
export const DEFAULT_PROPS = {
  variant: 'primary' as ComponentVariant,
  size: 'medium' as ComponentSize,
  hapticFeedback: 'light' as HapticFeedbackType,
  animationType: 'fade' as AnimationType,
  disabled: false,
  loading: false,
  required: false,
  interactive: true,
  dismissible: true,
  fullWidth: false,
} as const;

// Validation helpers
export const validateRequiredProps = (props: any, requiredProps: string[]): void => {
  requiredProps.forEach(prop => {
    if (props[prop] === undefined || props[prop] === null) {
      console.warn(`Missing required prop: ${prop}`);
    }
  });
};

export const validatePropTypes = (props: any, propTypes: Record<string, string>): void => {
  Object.entries(propTypes).forEach(([prop, expectedType]) => {
    if (props[prop] !== undefined && typeof props[prop] !== expectedType) {
      console.warn(`Invalid prop type for ${prop}: expected ${expectedType}, got ${typeof props[prop]}`);
    }
  });
};