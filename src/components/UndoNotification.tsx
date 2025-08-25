import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_CONTENT_HEIGHT } from '@/constants/Layout';
import { DesignSystem } from '@/theme/DesignSystem';

export type UndoNotificationProps = {
  visible: boolean;
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
};

export default function UndoNotification({
  visible,
  message,
  onUndo,
  onDismiss,
}: UndoNotificationProps) {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + insets.bottom;

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });

      // Automatically dismiss after 5 seconds
      const timer = setTimeout(() => {
        runOnJS(onDismiss)();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(50, { duration: 300 });
    }
  }, [visible, onDismiss, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: tabBarHeight + 10, backgroundColor: DesignSystem.colors.background.elevated },
        animatedStyle,
      ]}
    >
      <Text style={[styles.message, { color: DesignSystem.colors.text.primary }]}>{message}</Text>
      <TouchableOpacity
        onPress={onUndo}
        accessibilityRole="button"
        accessibilityLabel="Undo"
        accessibilityHint="Undo the last action"
      >
        <Text style={[styles.undoText, { color: DesignSystem.colors.primary[500] }]}>Undo</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 20,
    padding: 16,
    position: 'absolute',
    right: 20,
    shadowColor: DesignSystem.colors.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  message: {
    fontSize: 14,
  },
  undoText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
