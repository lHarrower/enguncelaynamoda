import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

interface UndoNotificationProps {
  isVisible: boolean;
  onUndo: () => void;
  onTimeout: () => void;
}

const UndoNotification: React.FC<UndoNotificationProps> = ({ isVisible, onUndo, onTimeout }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const styles = createStyles(fadeAnim);

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
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUndo();
  };

  // Check visibility state instead of accessing private properties
  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, styles.fadeOpacity]}>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Undo"
        accessibilityHint="Undo the last action"
      >
        <Text style={styles.text}>Undo</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (fadeAnim: Animated.Value) =>
  StyleSheet.create({
    button: {
      // Add button styles if needed
    },
    container: {
      position: 'absolute',
      bottom: 100, // Positioned above the tab bar
      alignSelf: 'center',
      backgroundColor: 'rgba(44, 44, 46, 0.95)',
      borderRadius: DesignSystem.borderRadius.xl,
      paddingVertical: DesignSystem.spacing.md,
      paddingHorizontal: DesignSystem.spacing.xl,
      ...DesignSystem.elevation.high,
    } as ViewStyle,
    fadeOpacity: {
      opacity: fadeAnim,
    },
    text: {
      ...DesignSystem.typography.button,
      fontSize: 14,
      color: DesignSystem.colors.text.inverse,
      fontFamily: DesignSystem.typography.fontFamily.body,
    } as TextStyle,
  });

export default UndoNotification;
