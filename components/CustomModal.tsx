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
  buttons, 
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
      case 'success': return '#9AA493';
      case 'warning': return '#D2691E';
      case 'error': return '#D32F2F';
      case 'info': return '#B8918F';
      default: return '#B8918F';
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
            {buttons.length <= 2 ? (
              // Horizontal layout for 1-2 buttons
              <View style={styles.horizontalButtons}>
                {buttons.map((button, index) => (
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
                      styles.modernButtonText,
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
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modernButton,
                      styles.verticalButton,
                      button.style === 'primary' && styles.primaryButton,
                      button.style === 'destructive' && styles.destructiveButton,
                      button.style === 'cancel' && styles.cancelButton,
                      index < buttons.length - 1 && styles.verticalButtonMargin
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
                      styles.modernButtonText,
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
    backgroundColor: 'rgba(122, 107, 86, 0.6)', // Matte taupe overlay
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#FDFCFB', // Soft off-white
    borderRadius: 24,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#7A6B56',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 15,
  },
  modalHeader: {
    padding: 24,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#7A6B56', // Matte taupe
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: '#B8918F', // Matte rose
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  modalButtons: {
    padding: 24,
    paddingTop: 16,
  },
  horizontalButtons: {
    flexDirection: 'row',
  },
  verticalButtons: {
    flexDirection: 'column',
  },
  modernButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#F2EFE9', // Matte cream
    borderWidth: 1,
    borderColor: '#E8DDD4',
    minHeight: 52,
  },
  verticalButton: {
    width: '100%',
  },
  verticalButtonMargin: {
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#B8918F', // Matte rose
    borderColor: '#B8918F',
  },
  destructiveButton: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: '#D4C4B8',
  },
  buttonIcon: {
    marginRight: 8,
  },
  modernButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B8918F',
    letterSpacing: -0.2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  destructiveButtonText: {
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#9AA493', // Matte sage
  },
}); 