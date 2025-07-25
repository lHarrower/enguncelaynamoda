import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';

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
    let timeoutId: any;
    if (isVisible) {
      progress.value = withTiming(1, { duration: 300 });
      timeoutId = setTimeout(() => {
        runOnJS(onTimeout)();
      }, NOTIFICATION_DURATION);
    } else {
      progress.value = withTiming(0, { duration: 300 });
    }
    return () => clearTimeout(timeoutId);
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
      <TouchableOpacity onPress={handlePress} style={styles.button}>
        <Text style={styles.text}>Undo</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  button: {
    backgroundColor: APP_THEME_V2.colors.charcoalGray,
    paddingVertical: APP_THEME_V2.spacing.md,
    paddingHorizontal: APP_THEME_V2.spacing.lg,
    borderRadius: APP_THEME_V2.radius.round,
    ...APP_THEME_V2.elevation.lift,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    ...APP_THEME_V2.typography.scale.body1,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    color: APP_THEME_V2.colors.whisperWhite,
  },
});

export default LuxuryUndoNotification; 