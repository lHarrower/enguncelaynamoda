import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

const { width: _screenWidth } = Dimensions.get('window');

interface Button {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive' | 'primary';
  icon?: keyof typeof Ionicons.glyphMap;
}

interface CustomModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: Button[];
  onClose: () => void;
  type?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export default function CustomModal({
  visible,
  title,
  message,
  buttons = [],
  onClose,
  type = 'default',
}: CustomModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
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
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      case 'info':
        return 'information-circle';
      default:
        return 'chatbubble-ellipses';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return DesignSystem.colors.success[500];
      case 'warning':
        return DesignSystem.colors.warning[500];
      case 'error':
        return DesignSystem.colors.error[600];
      case 'info':
        return DesignSystem.colors.info[600];
      default:
        return DesignSystem.colors.sage[500];
    }
  };

  return (
    <Modal animationType="none" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          {/* Header with Icon */}
          <View style={[styles.modalHeader, { borderBottomColor: getTypeColor() + '20' }]}>
            <View style={[styles.iconContainer, { backgroundColor: getTypeColor() + '15' }]}>
              <Ionicons name={getTypeIcon()} size={28} color={getTypeColor()} />
            </View>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>

          {/* Body */}
          <View style={styles.modalBody}>
            <Text style={styles.modalMessage}>{message}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.modalButtons}>
            {(buttons || []).length <= 2 ? (
              // Horizontal layout for 1-2 buttons
              <View style={styles.horizontalButtons}>
                {(buttons || []).map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modernButton,
                      button.style === 'primary' && styles.primaryButton,
                      button.style === 'destructive' && styles.destructiveButton,
                      button.style === 'cancel' && styles.cancelButton,
                      styles.flexButton,
                      index > 0 && styles.buttonMarginLeft,
                    ]}
                    onPress={button.onPress || onClose}
                    activeOpacity={0.8}
                  >
                    {button.icon && (
                      <Ionicons
                        name={button.icon}
                        size={16}
                        color={
                          button.style === 'primary'
                            ? '#FFFFFF'
                            : button.style === 'destructive'
                              ? '#FFFFFF'
                              : '#B8918F'
                        }
                        style={styles.buttonIcon}
                      />
                    )}
                    <Text
                      style={[
                        styles.buttonText,
                        button.style === 'primary' && styles.primaryButtonText,
                        button.style === 'destructive' && styles.destructiveButtonText,
                        button.style === 'cancel' && styles.cancelButtonText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              // Vertical layout for 3+ buttons
              <View style={styles.verticalButtons}>
                {(buttons || []).map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modernButton,
                      styles.verticalButton,
                      button.style === 'primary' && styles.primaryButton,
                      button.style === 'destructive' && styles.destructiveButton,
                      button.style === 'cancel' && styles.cancelButton,
                      index < (buttons || []).length - 1 && styles.verticalButtonMargin,
                    ]}
                    onPress={button.onPress || onClose}
                    activeOpacity={0.8}
                  >
                    {button.icon && (
                      <Ionicons
                        name={button.icon}
                        size={16}
                        color={
                          button.style === 'primary'
                            ? '#FFFFFF'
                            : button.style === 'destructive'
                              ? '#FFFFFF'
                              : '#B8918F'
                        }
                        style={styles.buttonIcon}
                      />
                    )}
                    <Text
                      style={[
                        styles.buttonText,
                        button.style === 'primary' && styles.primaryButtonText,
                        button.style === 'destructive' && styles.destructiveButtonText,
                        button.style === 'cancel' && styles.cancelButtonText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonIcon: {
    marginRight: 8,
  },
  buttonMarginLeft: {
    marginLeft: 12,
  },
  buttonText: {
    color: DesignSystem.colors.text.inverse,
    fontFamily: 'Karla_700Bold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: DesignSystem.colors.border.primary,
  },
  cancelButtonText: {
    color: DesignSystem.colors.text.primary,
  },
  destructiveButton: {
    backgroundColor: DesignSystem.colors.error[600],
    borderColor: DesignSystem.colors.error[600],
    elevation: 6,
    shadowColor: DesignSystem.colors.error[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  destructiveButtonText: {
    color: DesignSystem.colors.text.inverse,
  },
  flexButton: {
    flex: 1,
  },
  horizontalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 32,
    elevation: 4,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: DesignSystem.colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: 64,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalButtons: {
    padding: 24,
    paddingTop: 16,
  },
  modalContainer: {
    backgroundColor: DesignSystem.colors.surface.elevated, // Elevated surface
    borderRadius: 20, // Luxury rounded corners
    width: '100%',
    maxWidth: 360,
    shadowColor: DesignSystem.colors.neutral.charcoal, // Ink Blue shadow
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 20,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary, // Subtle border
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    padding: 24,
    paddingBottom: 20,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: DesignSystem.colors.neutral.charcoal, // Ink Blue
    textAlign: 'center',
    letterSpacing: 0.2,
    fontFamily: 'Karla_400Regular',
    opacity: 0.8,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.overlay,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_700Bold', // Serif for luxury
    color: DesignSystem.colors.neutral.charcoal, // Ink Blue on Ivory Grey
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modernButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.neutral.mist,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: DesignSystem.colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButton: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderColor: DesignSystem.colors.sage[500],
    elevation: 6,
    shadowColor: DesignSystem.colors.sage[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: DesignSystem.colors.text.inverse,
  },
  verticalButton: {
    width: '100%',
  },
  verticalButtonMargin: {
    marginBottom: 12,
  },
  verticalButtons: {
    flexDirection: 'column',
  },
});
