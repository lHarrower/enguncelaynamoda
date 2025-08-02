import React, { useRef, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  StyleSheet, 
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const { width: screenWidth } = Dimensions.get('window');

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
  type = 'default'
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
        })
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
        })
      ]).start();
    }
  }, [visible]);

  const getTypeIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'error': return 'close-circle';
      case 'info': return 'information-circle';
      default: return 'chatbubble-ellipses';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'success': return Colors.light.highlight;
      case 'warning': return '#D2691E';
      case 'error': return '#D32F2F';
      case 'info': return Colors.light.tint;
      default: return Colors.light.tint;
    }
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContainer, 
            { 
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          {/* Header with Icon */}
          <View style={[styles.modalHeader, { borderBottomColor: getTypeColor() + '20' }]}>
            <View style={[styles.iconContainer, { backgroundColor: getTypeColor() + '15' }]}>
              <Ionicons 
                name={getTypeIcon()} 
                size={28} 
                color={getTypeColor()} 
              />
            </View>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>
          
          {/* Body */}
          <View style={styles.modalBody}>
            <Text style={styles.modalMessage}>{message}</Text>
          </View>
          
          {/* Buttons */}
          <View style={styles.modalButtons}>
            { (buttons || []).length <= 2 ? (
              // Horizontal layout for 1-2 buttons
              <View style={styles.horizontalButtons}>
                { (buttons || []).map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modernButton,
                      button.style === 'primary' && styles.primaryButton,
                      button.style === 'destructive' && styles.destructiveButton,
                      button.style === 'cancel' && styles.cancelButton,
                      { flex: 1, marginLeft: index > 0 ? 12 : 0 }
                    ]}
                    onPress={button.onPress || onClose}
                    activeOpacity={0.8}
                  >
                    {button.icon && (
                      <Ionicons 
                        name={button.icon} 
                        size={16} 
                        color={button.style === 'primary' ? '#FFFFFF' : 
                               button.style === 'destructive' ? '#FFFFFF' : '#B8918F'} 
                        style={styles.buttonIcon}
                      />
                    )}
                    <Text style={[
                      styles.buttonText,
                      button.style === 'primary' && styles.primaryButtonText,
                      button.style === 'destructive' && styles.destructiveButtonText,
                      button.style === 'cancel' && styles.cancelButtonText
                    ]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              // Vertical layout for 3+ buttons
              <View style={styles.verticalButtons}>
                { (buttons || []).map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modernButton,
                      styles.verticalButton,
                      button.style === 'primary' && styles.primaryButton,
                      button.style === 'destructive' && styles.destructiveButton,
                      button.style === 'cancel' && styles.cancelButton,
                      index < (buttons || []).length - 1 && styles.verticalButtonMargin
                    ]}
                    onPress={button.onPress || onClose}
                    activeOpacity={0.8}
                  >
                    {button.icon && (
                      <Ionicons 
                        name={button.icon} 
                        size={16} 
                        color={button.style === 'primary' ? '#FFFFFF' : 
                               button.style === 'destructive' ? '#FFFFFF' : '#B8918F'} 
                        style={styles.buttonIcon}
                      />
                    )}
                    <Text style={[
                      styles.buttonText,
                      button.style === 'primary' && styles.primaryButtonText,
                      button.style === 'destructive' && styles.destructiveButtonText,
                      button.style === 'cancel' && styles.cancelButtonText
                    ]}>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 34, 48, 0.85)', // Ink Blue overlay with higher opacity
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: Colors.light.card, // Ivory Grey for contrast
    borderRadius: 20, // Luxury rounded corners
    width: '100%',
    maxWidth: 360,
    shadowColor: Colors.dark.background, // Ink Blue shadow
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border, // Deep Aubergine border
  },
  modalHeader: {
    padding: 24,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.dark.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_700Bold', // Serif for luxury
    color: Colors.light.onSurface, // Ink Blue on Ivory Grey
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.onSurface, // Ink Blue
    textAlign: 'center',
    letterSpacing: 0.2,
    fontFamily: 'Karla_400Regular',
    opacity: 0.8,
  },
  modalButtons: {
    padding: 24,
    paddingTop: 16,
  },
  horizontalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  verticalButtons: {
    flexDirection: 'column',
  },
  modernButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.dark.background, // Ink Blue
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minHeight: 52,
    shadowColor: Colors.dark.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verticalButton: {
    width: '100%',
  },
  verticalButtonMargin: {
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: Colors.dark.tint, // Bronze Gold
    borderColor: Colors.dark.tint,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  destructiveButton: {
    backgroundColor: Colors.dark.highlight, // Deep Aubergine
    borderColor: Colors.dark.highlight,
    shadowColor: Colors.dark.highlight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.dark.border,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Karla_700Bold',
    color: Colors.dark.text, // Warm Ivory
    letterSpacing: 0.3,
  },
  primaryButtonText: {
    color: Colors.dark.text, // Warm Ivory
  },
  destructiveButtonText: {
    color: Colors.dark.text, // Warm Ivory
  },
  cancelButtonText: {
    color: Colors.light.onSurface, // Ink Blue
  },
});