import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

const { height: screenHeight, width: _screenWidth } = Dimensions.get('window');

interface ActionSheetOption {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'primary';
  subtitle?: string;
}

interface ModernActionSheetProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  options: ActionSheetOption[];
  onClose: () => void;
  showCancel?: boolean;
}

export default function ModernActionSheet({
  visible,
  title,
  subtitle,
  options = [],
  onClose,
  showCancel = true,
}: ModernActionSheetProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        onClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleOptionPress = (onPress: () => void) => {
    onPress();
    onClose();
  };

  return (
    <Modal animationType="none" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close action sheet"
          accessibilityHint="Tap to close the action sheet"
        />

        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Drag Indicator */}
          <View style={styles.handle} />

          {/* Header */}
          {(title || subtitle) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          )}

          {/* Options */}
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            {(options || []).map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  option.style === 'destructive' && styles.destructiveOption,
                  option.style === 'primary' && styles.primaryOption,
                ]}
                onPress={() => handleOptionPress(option.onPress)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={option.title}
                accessibilityHint={option.subtitle || `Tap to ${option.title.toLowerCase()}`}
              >
                <View style={styles.optionContent}>
                  {option.icon && (
                    <View
                      style={[
                        styles.optionIcon,
                        option.style === 'destructive' && styles.destructiveIconContainer,
                        option.style === 'primary' && styles.primaryIconContainer,
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={20}
                        color={
                          option.style === 'destructive'
                            ? '#D32F2F'
                            : option.style === 'primary'
                              ? '#B8918F'
                              : '#7A6B56'
                        }
                      />
                    </View>
                  )}
                  <View style={styles.textContainer}>
                    <Text
                      style={[
                        styles.optionText,
                        option.style === 'destructive' && styles.destructiveText,
                        option.style === 'primary' && styles.primaryText,
                      ]}
                    >
                      {option.title}
                    </Text>
                    {option.subtitle && (
                      <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#B5A3BC" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Cancel Button */}
          {showCancel && (
            <View style={styles.cancelContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                accessibilityHint="Tap to cancel and close the action sheet"
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DesignSystem.colors.background.overlay,
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
  },
  cancelContainer: {
    borderTopColor: DesignSystem.colors.border.primary,
    borderTopWidth: 1,
    padding: 16,
  },
  cancelText: {
    color: DesignSystem.colors.neutral.charcoal,
    fontFamily: 'Karla_700Bold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  container: {
    backgroundColor: DesignSystem.colors.surface.elevated,
    borderTopColor: DesignSystem.colors.border.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    elevation: 20,
    maxHeight: '80%',
    paddingBottom: 34,
    paddingTop: 20,
    shadowColor: DesignSystem.colors.neutral.charcoal,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  destructiveIconContainer: {
    backgroundColor: DesignSystem.colors.error[100],
  },
  destructiveOption: {
    backgroundColor: DesignSystem.colors.gold[100],
    borderColor: DesignSystem.colors.gold[400],
    elevation: 6,
    shadowColor: DesignSystem.colors.gold[400],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  destructiveText: {
    color: DesignSystem.colors.neutral.charcoal,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: DesignSystem.colors.border.secondary,
    borderRadius: 2,
    height: 4,
    marginBottom: 20,
    opacity: 0.6,
    width: 40,
  },
  header: {
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  option: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.neutral.mist,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: DesignSystem.colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionContent: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  optionIcon: {
    alignItems: 'center',
    marginRight: 12,
    width: 24,
  },
  optionSubtitle: {
    color: DesignSystem.colors.neutral.slate,
    fontSize: 13,
    letterSpacing: -0.1,
    marginTop: 2,
  },
  optionText: {
    color: DesignSystem.colors.neutral.charcoal,
    flex: 1,
    fontFamily: 'Karla_700Bold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  overlay: {
    backgroundColor: DesignSystem.colors.background.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  primaryIconContainer: {
    backgroundColor: DesignSystem.colors.surface.elevated,
  },
  primaryOption: {
    backgroundColor: DesignSystem.colors.surface.primary,
  },
  primaryText: {
    color: DesignSystem.colors.sage[500],
  },
  subtitle: {
    color: DesignSystem.colors.neutral.charcoal,
    fontFamily: 'Karla_400Regular',
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: DesignSystem.colors.neutral.charcoal,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
});
