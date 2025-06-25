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
  options,
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
          <View style={styles.dragIndicator} />
          
          {/* Header */}
          {(title || subtitle) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          )}
          
          {/* Options */}
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            {options.map((option, index) => (
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
                      styles.iconContainer,
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
                      styles.optionTitle,
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
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
    backgroundColor: '#FDFCFB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.8,
    shadowColor: '#7A6B56',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#D4C4B8',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6E3',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7A6B56',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#B8918F',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: -0.2,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  destructiveOption: {
    backgroundColor: '#FFE8E8',
  },
  primaryOption: {
    backgroundColor: '#F0E6E3',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2EFE9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  destructiveIconContainer: {
    backgroundColor: '#FFE8E8',
  },
  primaryIconContainer: {
    backgroundColor: '#F0E6E3',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7A6B56',
    letterSpacing: -0.2,
  },
  destructiveText: {
    color: '#D32F2F',
  },
  primaryText: {
    color: '#B8918F',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#B8918F',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  cancelContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0E6E3',
  },
  cancelButton: {
    paddingVertical: 16,
    backgroundColor: '#F2EFE9',
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9AA493',
    letterSpacing: -0.2,
  },
}); 