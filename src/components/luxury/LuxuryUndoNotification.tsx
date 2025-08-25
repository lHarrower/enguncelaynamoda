import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

interface LuxuryUndoNotificationProps {
  isVisible: boolean;
  onUndo: () => void;
  onTimeout: () => void;
}

const NOTIFICATION_DURATION = 3000;

const LuxuryUndoNotification: React.FC<LuxuryUndoNotificationProps> = ({
  isVisible,
  onUndo,
  onTimeout,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (isVisible) {
      progress.value = withTiming(1, { duration: 300 });
      timeoutId = setTimeout(() => {
        runOnJS(onTimeout)();
      }, NOTIFICATION_DURATION);
    } else {
      progress.value = withTiming(0, { duration: 300 });
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isVisible, onTimeout, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [
        {
          translateY: interpolate(progress.value, [0, 1], [100, 0]),
        },
      ],
    };
  });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUndo();
  };

  if (progress.value === 0 && !isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Undo action"
        accessibilityHint="Tap to undo the last action"
      >
        <Text style={styles.text}>Undo</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: DesignSystem.colors.charcoal[800],
    borderRadius: DesignSystem.radius.full,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    ...DesignSystem.elevation.medium,
    alignItems: 'center',
    flexDirection: 'row',
  },
  container: {
    alignItems: 'center',
    bottom: 100,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 1000,
  },
  text: {
    ...DesignSystem.typography.scale.body1,
    color: DesignSystem.colors.background.elevated,
  },
});

export default LuxuryUndoNotification;
