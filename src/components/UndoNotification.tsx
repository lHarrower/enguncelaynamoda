import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { DesignSystem } from '@/theme/DesignSystem';
import { TAB_BAR_CONTENT_HEIGHT } from '@/constants/Layout';

export type UndoNotificationProps = {
  visible: boolean;
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
};

export default function UndoNotification({ visible, message, onUndo, onDismiss }: UndoNotificationProps) {
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
  }, [visible, onDismiss]);

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
    <Animated.View style={[styles.container, { bottom: tabBarHeight + 10, backgroundColor: DesignSystem.colors.background.elevated }, animatedStyle]}>
      <Text style={[styles.message, { color: DesignSystem.colors.text.primary }]}>{message}</Text>
      <TouchableOpacity onPress={onUndo}>
        <Text style={[styles.undoText, { color: DesignSystem.colors.primary[500] }]}>Undo</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  message: {
    fontSize: 14,
  },
  undoText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});