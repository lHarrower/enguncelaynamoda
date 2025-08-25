/**
 * Standartlaştırılmış Bileşen Prop Arayüzleri
 *
 * Bu dosya AYNAMODA uygulamasındaki tüm bileşenlerde kullanılması gereken
 * tutarlı prop arayüz kalıplarını ve temel tipleri tanımlar.
 */

import { Ionicons } from '@expo/vector-icons';
import { TextInputProps, TextStyle, ViewStyle } from 'react-native';

import { warnInDev } from '@/utils/consoleSuppress';

// Genişletilebilir temel prop arayüzleri
export interface BaseComponentProps {
  /** Bileşen konteyneri için özel stiller */
  style?: ViewStyle;
  /** Otomatik test için test kimliği */
  testID?: string;
  /** Ekran okuyucular için erişilebilirlik etiketi */
  accessibilityLabel?: string;
  /** Bileşenin devre dışı olup olmadığı */
  disabled?: boolean;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  /** Bileşene basıldığında çağrılan geri çağırma fonksiyonu */
  onPress?: () => void;
  /** Bileşenin yükleme durumunda olup olmadığı */
  loading?: boolean;
  /** Basma sırasında dokunsal geri bildirim türü */
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'none';
}

export interface FormComponentProps extends BaseComponentProps {
  /** Form alanı için etiket metni */
  label?: string;
  /** Gösterilecek hata mesajı */
  error?: string;
  /** Yardımcı metin veya ipucu */
  hint?: string;
  /** Alanın gerekli olup olmadığı */
  required?: boolean;
  /** Özel etiket stilleri */
  labelStyle?: TextStyle;
  /** Özel hata metni stilleri */
  errorStyle?: TextStyle;
}

export interface InputComponentProps extends FormComponentProps, Omit<TextInputProps, 'style'> {
  /** Sol tarafta gösterilecek ikon */
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** Sağ tarafta gösterilecek ikon */
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
  onFeedbackSubmit: (feedback: Record<string, unknown>) => Promise<void>;
  /** Callback when feedback collection is cancelled */
  onCancel?: () => void;
}

export interface NavigationComponentProps extends BaseComponentProps {
  /** Navigation object from React Navigation */
  navigation?: Record<string, unknown>;
  /** Route object from React Navigation */
  route?: Record<string, unknown>;
  /** Callback for navigation actions */
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

export interface ListComponentProps<T = Record<string, unknown>> extends BaseComponentProps {
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
  onError?: (error: Error) => void;
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
export const validateRequiredProps = (
  props: Record<string, unknown>,
  requiredProps: string[],
): void => {
  requiredProps.forEach((prop) => {
    if (props[prop] === undefined || props[prop] === null) {
      warnInDev(`Missing required prop: ${prop}`);
    }
  });
};

export const validatePropTypes = (
  props: Record<string, unknown>,
  propTypes: Record<string, string>,
): void => {
  Object.entries(propTypes).forEach(([prop, expectedType]) => {
    if (props[prop] !== undefined && typeof props[prop] !== expectedType) {
      warnInDev(
        `Invalid prop type for ${prop}: expected ${expectedType}, got ${typeof props[prop]}`,
      );
    }
  });
};
