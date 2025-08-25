// Haptic Components - UI components with integrated haptic feedback
import React, { useCallback } from 'react';
import {
  GestureResponderEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  PressableProps,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  Switch,
  SwitchProps,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from 'react-native';

import {
  useButtonHaptic,
  useFormHaptic,
  useGestureHaptic,
  useHaptic,
  useNavigationHaptic,
  useWardrobeHaptic,
} from '../../hooks/useHaptic';
import { HapticType } from '../../services/HapticService';

/**
 * Haptic Button Component
 */
interface HapticButtonProps extends TouchableOpacityProps {
  hapticType?: 'gentle' | 'standard' | 'luxury';
  hapticOnPress?: boolean;
  hapticOnLongPress?: boolean;
  customHapticType?: HapticType;
}

export const HapticButton: React.FC<HapticButtonProps> = ({
  hapticType = 'standard',
  hapticOnPress = true,
  hapticOnLongPress = true,
  customHapticType,
  onPress,
  onLongPress,
  children,
  ...props
}) => {
  const { trigger } = useHaptic();
  const buttonHaptic = useButtonHaptic(hapticType);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (hapticOnPress) {
        if (customHapticType) {
          trigger(customHapticType);
        } else {
          buttonHaptic.onPress();
        }
      }
      onPress?.(event);
    },
    [hapticOnPress, customHapticType, trigger, buttonHaptic, onPress],
  );

  const handleLongPress = useCallback(
    (event: GestureResponderEvent) => {
      if (hapticOnLongPress) {
        buttonHaptic.onLongPress();
      }
      onLongPress?.(event);
    },
    [hapticOnLongPress, buttonHaptic, onLongPress],
  );

  return (
    <TouchableOpacity
      {...props}
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel || 'Haptic button'}
      accessibilityHint={props.accessibilityHint || 'Button with haptic feedback'}
      accessibilityState={{ disabled: props.disabled }}
    >
      {children}
    </TouchableOpacity>
  );
};

/**
 * Haptic Pressable Component
 */
interface HapticPressableProps extends PressableProps {
  hapticType?: 'gentle' | 'standard' | 'luxury';
  hapticOnPress?: boolean;
  hapticOnLongPress?: boolean;
  hapticOnPressIn?: boolean;
  customHapticType?: HapticType;
}

export const HapticPressable: React.FC<HapticPressableProps> = ({
  hapticType = 'standard',
  hapticOnPress = true,
  hapticOnLongPress = true,
  hapticOnPressIn = false,
  customHapticType,
  onPress,
  onLongPress,
  onPressIn,
  children,
  ...props
}) => {
  const { trigger } = useHaptic();
  const buttonHaptic = useButtonHaptic(hapticType);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (hapticOnPress) {
        if (customHapticType) {
          trigger(customHapticType);
        } else {
          buttonHaptic.onPress();
        }
      }
      onPress?.(event);
    },
    [hapticOnPress, customHapticType, trigger, buttonHaptic, onPress],
  );

  const handleLongPress = useCallback(
    (event: GestureResponderEvent) => {
      if (hapticOnLongPress) {
        buttonHaptic.onLongPress();
      }
      onLongPress?.(event);
    },
    [hapticOnLongPress, buttonHaptic, onLongPress],
  );

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (hapticOnPressIn) {
        trigger(HapticType.GENTLE_TAP);
      }
      onPressIn?.(event);
    },
    [hapticOnPressIn, trigger, onPressIn],
  );

  return (
    <Pressable
      {...props}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
    >
      {children}
    </Pressable>
  );
};

/**
 * Haptic Switch Component
 */
interface HapticSwitchProps extends SwitchProps {
  hapticOnToggle?: boolean;
  hapticType?: HapticType;
}

export const HapticSwitch: React.FC<HapticSwitchProps> = ({
  hapticOnToggle = true,
  hapticType = HapticType.SELECTION,
  onValueChange,
  ...props
}) => {
  const { trigger } = useHaptic();

  const handleValueChange = useCallback(
    (value: boolean) => {
      if (hapticOnToggle) {
        trigger(hapticType);
      }
      onValueChange?.(value);
    },
    [hapticOnToggle, hapticType, trigger, onValueChange],
  );

  return <Switch {...props} onValueChange={handleValueChange} />;
};

/**
 * Haptic Text Input Component
 */
interface HapticTextInputProps extends TextInputProps {
  hapticOnFocus?: boolean;
  hapticOnError?: boolean;
  hasError?: boolean;
}

export const HapticTextInput: React.FC<HapticTextInputProps> = ({
  hapticOnFocus = true,
  hapticOnError = true,
  hasError = false,
  onFocus,
  ...props
}) => {
  const { onFieldFocus, onFieldError } = useFormHaptic();

  const handleFocus = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (hapticOnFocus) {
        onFieldFocus();
      }
      onFocus?.(event);
    },
    [hapticOnFocus, onFieldFocus, onFocus],
  );

  // Trigger error haptic when hasError changes to true
  React.useEffect(() => {
    if (hasError && hapticOnError) {
      onFieldError();
    }
  }, [hasError, hapticOnError, onFieldError]);

  return <TextInput {...props} onFocus={handleFocus} />;
};

/**
 * Haptic Navigation Button
 */
interface HapticNavButtonProps extends TouchableOpacityProps {
  navigationType?: 'tab' | 'screen' | 'back';
}

export const HapticNavButton: React.FC<HapticNavButtonProps> = ({
  navigationType = 'screen',
  onPress,
  children,
  ...props
}) => {
  const { onTabPress, onScreenTransition, onBackNavigation } = useNavigationHaptic();

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      switch (navigationType) {
        case 'tab':
          onTabPress();
          break;
        case 'back':
          onBackNavigation();
          break;
        default:
          onScreenTransition();
          break;
      }
      onPress?.(event);
    },
    [navigationType, onTabPress, onScreenTransition, onBackNavigation, onPress],
  );

  return (
    <TouchableOpacity
      {...props}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel || `Navigation ${navigationType} button`}
      accessibilityHint={props.accessibilityHint || `Navigate using ${navigationType} action`}
      accessibilityState={{ disabled: props.disabled }}
    >
      {children}
    </TouchableOpacity>
  );
};

/**
 * Haptic Wardrobe Item Component
 */
interface HapticWardrobeItemProps extends TouchableOpacityProps {
  itemAction?: 'select' | 'add' | 'delete' | 'luxury';
}

export const HapticWardrobeItem: React.FC<HapticWardrobeItemProps> = ({
  itemAction = 'select',
  onPress,
  children,
  ...props
}) => {
  const { onItemSelect, onItemAdd, onItemDelete, onLuxuryInteraction } = useWardrobeHaptic();

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      switch (itemAction) {
        case 'add':
          onItemAdd();
          break;
        case 'delete':
          onItemDelete();
          break;
        case 'luxury':
          onLuxuryInteraction();
          break;
        default:
          onItemSelect();
          break;
      }
      onPress?.(event);
    },
    [itemAction, onItemSelect, onItemAdd, onItemDelete, onLuxuryInteraction, onPress],
  );

  return (
    <TouchableOpacity
      {...props}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel || `Wardrobe ${itemAction} item`}
      accessibilityHint={props.accessibilityHint || `Perform ${itemAction} action on wardrobe item`}
      accessibilityState={{ disabled: props.disabled }}
    >
      {children}
    </TouchableOpacity>
  );
};

/**
 * Haptic Gesture View Component
 */
interface HapticGestureViewProps extends ViewProps {
  enableSwipeHaptic?: boolean;
  enablePinchHaptic?: boolean;
  enableLongPressHaptic?: boolean;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  onPinchStart?: () => void;
  onPinchEnd?: () => void;
  onLongPressStart?: () => void;
}

export const HapticGestureView: React.FC<HapticGestureViewProps> = ({
  enableSwipeHaptic = true,
  enablePinchHaptic = true,
  enableLongPressHaptic = true,
  onSwipeStart,
  onSwipeEnd,
  onPinchStart,
  onPinchEnd,
  onLongPressStart,
  children,
  ...props
}) => {
  const gestureHaptic = useGestureHaptic();

  const handleSwipeStart = useCallback(() => {
    if (enableSwipeHaptic) {
      gestureHaptic.onSwipeStart();
    }
    onSwipeStart?.();
  }, [enableSwipeHaptic, gestureHaptic, onSwipeStart]);

  const handleSwipeEnd = useCallback(() => {
    if (enableSwipeHaptic) {
      gestureHaptic.onSwipeEnd();
    }
    onSwipeEnd?.();
  }, [enableSwipeHaptic, gestureHaptic, onSwipeEnd]);

  const handlePinchStart = useCallback(() => {
    if (enablePinchHaptic) {
      gestureHaptic.onPinchStart();
    }
    onPinchStart?.();
  }, [enablePinchHaptic, gestureHaptic, onPinchStart]);

  const handlePinchEnd = useCallback(() => {
    if (enablePinchHaptic) {
      gestureHaptic.onPinchEnd();
    }
    onPinchEnd?.();
  }, [enablePinchHaptic, gestureHaptic, onPinchEnd]);

  const handleLongPressStart = useCallback(() => {
    if (enableLongPressHaptic) {
      gestureHaptic.onLongPressStart();
    }
    onLongPressStart?.();
  }, [enableLongPressHaptic, gestureHaptic, onLongPressStart]);

  return (
    <View
      {...props}
      // Note: In a real implementation, you would integrate with
      // react-native-gesture-handler for proper gesture detection
    >
      {children}
    </View>
  );
};

/**
 * Haptic Scroll View Component
 */
interface HapticScrollViewProps extends ScrollViewProps {
  hapticOnScroll?: boolean;
  hapticOnScrollEnd?: boolean;
  scrollHapticThreshold?: number;
}

export const HapticScrollView: React.FC<HapticScrollViewProps> = ({
  hapticOnScroll = false,
  hapticOnScrollEnd = true,
  scrollHapticThreshold = 100,
  onScroll,
  onScrollEndDrag,
  children,
  ...props
}) => {
  const { trigger } = useHaptic();
  const lastScrollY = React.useRef(0);
  const scrollDistance = React.useRef(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const deltaY = Math.abs(currentY - lastScrollY.current);

      scrollDistance.current += deltaY;
      lastScrollY.current = currentY;

      if (hapticOnScroll && scrollDistance.current >= scrollHapticThreshold) {
        trigger(HapticType.GENTLE_TAP);
        scrollDistance.current = 0;
      }

      onScroll?.(event);
    },
    [hapticOnScroll, scrollHapticThreshold, trigger, onScroll],
  );

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (hapticOnScrollEnd) {
        trigger(HapticType.SOFT_PULSE);
      }
      onScrollEndDrag?.(event);
    },
    [hapticOnScrollEnd, trigger, onScrollEndDrag],
  );

  return (
    <ScrollView
      {...props}
      onScroll={handleScroll}
      onScrollEndDrag={handleScrollEndDrag}
      scrollEventThrottle={16}
    >
      {children}
    </ScrollView>
  );
};

/**
 * Haptic Card Component
 */
interface HapticCardProps extends TouchableOpacityProps {
  cardType?: 'standard' | 'luxury' | 'wardrobe';
  hapticOnPress?: boolean;
  hapticOnLongPress?: boolean;
}

export const HapticCard: React.FC<HapticCardProps> = ({
  cardType = 'standard',
  hapticOnPress = true,
  hapticOnLongPress = true,
  onPress,
  onLongPress,
  children,
  style,
  ...props
}) => {
  const { trigger } = useHaptic();

  const getHapticType = useCallback(() => {
    switch (cardType) {
      case 'luxury':
        return HapticType.LUXURY_TOUCH;
      case 'wardrobe':
        return HapticType.SELECTION;
      default:
        return HapticType.LIGHT_IMPACT;
    }
  }, [cardType]);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (hapticOnPress) {
        trigger(getHapticType());
      }
      onPress?.(event);
    },
    [hapticOnPress, trigger, getHapticType, onPress],
  );

  const handleLongPress = useCallback(
    (event: GestureResponderEvent) => {
      if (hapticOnLongPress) {
        trigger(HapticType.MEDIUM_IMPACT);
      }
      onLongPress?.(event);
    },
    [hapticOnLongPress, trigger, onLongPress],
  );

  return (
    <TouchableOpacity
      {...props}
      style={[styles.card, style]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel || `${cardType} card`}
      accessibilityHint={props.accessibilityHint || `Tap to interact with ${cardType} card`}
      accessibilityState={{ disabled: props.disabled }}
    >
      {children}
    </TouchableOpacity>
  );
};

/**
 * Haptic List Item Component
 */
interface HapticListItemProps extends TouchableOpacityProps {
  isSelected?: boolean;
  hapticOnSelect?: boolean;
}

export const HapticListItem: React.FC<HapticListItemProps> = ({
  isSelected = false,
  hapticOnSelect = true,
  onPress,
  children,
  style,
  ...props
}) => {
  const { trigger } = useHaptic();

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (hapticOnSelect) {
        trigger(isSelected ? HapticType.CONFIRMATION : HapticType.SELECTION);
      }
      onPress?.(event);
    },
    [hapticOnSelect, isSelected, trigger, onPress],
  );

  return (
    <TouchableOpacity
      {...props}
      style={[styles.listItem, isSelected && styles.selectedListItem, style]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel || 'List item'}
      accessibilityHint={props.accessibilityHint || 'Tap to select this item'}
      accessibilityState={{ disabled: props.disabled, selected: isSelected }}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 3,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listItem: {
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
    padding: 16,
  },
  selectedListItem: {
    backgroundColor: '#F8F9FA',
  },
});

export default {
  HapticButton,
  HapticPressable,
  HapticSwitch,
  HapticTextInput,
  HapticNavButton,
  HapticWardrobeItem,
  HapticGestureView,
  HapticScrollView,
  HapticCard,
  HapticListItem,
};
