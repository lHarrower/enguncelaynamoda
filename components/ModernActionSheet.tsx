import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  PanResponder,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

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
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.backdrop, { opacity: fadeAnim }]}
        />
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
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
            { (options || []).map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  option.style === 'destructive' && styles.destructiveOption,
                  option.style === 'primary' && styles.primaryOption,
                ]}
                onPress={() => handleOptionPress(option.onPress)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  {option.icon && (
                    <View style={[
                      styles.optionIcon,
                      option.style === 'destructive' && styles.destructiveIconContainer,
                      option.style === 'primary' && styles.primaryIconContainer,
                    ]}>
                      <Ionicons
                        name={option.icon}
                        size={20}
                        color={
                          option.style === 'destructive' ? '#D32F2F' :
                          option.style === 'primary' ? '#B8918F' : '#7A6B56'
                        }
                      />
                    </View>
                  )}
                  <View style={styles.textContainer}>
                    <Text style={[
                      styles.optionText,
                      option.style === 'destructive' && styles.destructiveText,
                      option.style === 'primary' && styles.primaryText,
                    ]}>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 34, 48, 0.85)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(122, 107, 86, 0.6)',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 34,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    shadowColor: Colors.dark.background,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
    opacity: 0.6,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: Colors.light.onSurface,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.onSurface,
    textAlign: 'center',
    opacity: 0.7,
    fontFamily: 'Karla_400Regular',
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: Colors.dark.background,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: Colors.dark.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  destructiveOption: {
    backgroundColor: Colors.dark.highlight,
    borderColor: Colors.dark.highlight,
    shadowColor: Colors.dark.highlight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryOption: {
    backgroundColor: '#F0E6E3',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  destructiveIconContainer: {
    backgroundColor: '#FFE8E8',
  },
  primaryIconContainer: {
    backgroundColor: Colors.light.card,
  },
  textContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: Colors.dark.text,
    fontFamily: 'Karla_700Bold',
    flex: 1,
    letterSpacing: 0.3,
  },
  destructiveText: {
    color: Colors.dark.text,
  },
  primaryText: {
    color: Colors.light.tint,
  },
  optionSubtitle: {
    fontSize: 13,
    color: Colors.light.text_secondary,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  cancelContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: Colors.light.onSurface,
    fontFamily: 'Karla_700Bold',
    letterSpacing: 0.3,
  },
}); 