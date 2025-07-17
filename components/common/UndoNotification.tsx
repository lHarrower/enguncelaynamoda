import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';

interface UndoNotificationProps {
  isVisible: boolean;
  onUndo: () => void;
  onTimeout: () => void;
}

const UndoNotification: React.FC<UndoNotificationProps> = ({ isVisible, onUndo, onTimeout }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (isVisible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Set timeout to hide the notification
      timeoutId = setTimeout(() => {
        onTimeout();
      }, 3000);

    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => clearTimeout(timeoutId);
  }, [isVisible, onTimeout, fadeAnim]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUndo();
  };

  // Using a private property, which is safe here but not officially supported.
  // A better solution would involve state management to track animation completion.
  if (!isVisible && (fadeAnim as any)._value === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity onPress={handlePress} style={styles.button}>
        <Text style={styles.text}>Undo</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Positioned above the tab bar
    alignSelf: 'center',
    backgroundColor: 'rgba(44, 44, 46, 0.95)',
    borderRadius: APP_THEME_V2.radius.liquid,
    paddingVertical: APP_THEME_V2.spacing.md,
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    ...APP_THEME_V2.elevation.float,
  } as ViewStyle,
  button: {
    // The container already has all the styles from the theme
  },
  text: {
    ...APP_THEME_V2.typography.scale.button,
    fontSize: 14,
    color: APP_THEME_V2.colors.whisperWhite,
    fontFamily: APP_THEME_V2.typography.fonts.body,
  } as TextStyle,
});

export default UndoNotification; 