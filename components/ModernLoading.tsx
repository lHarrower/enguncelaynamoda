import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Animated,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ModernLoadingProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  type?: 'default' | 'success' | 'error';
  showIcon?: boolean;
}

export default function ModernLoading({
  visible,
  title = 'Loading...',
  subtitle,
  type = 'default',
  showIcon = true,
}: ModernLoadingProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous rotation for loading icon
      if (type === 'default') {
        const rotateAnimation = Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        );
        rotateAnimation.start();
        return () => rotateAnimation.stop();
      }
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, type]);

  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      default: return 'refresh';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return '#9AA493';
      case 'error': return '#D32F2F';
      default: return '#B8918F';
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icon or Spinner */}
          <View style={styles.iconContainer}>
            {type === 'default' ? (
              showIcon ? (
                <Animated.View
                  style={{
                    transform: [{ rotate: rotation }],
                  }}
                >
                  <Ionicons
                    name="refresh"
                    size={32}
                    color="#B8918F"
                  />
                </Animated.View>
              ) : (
                <ActivityIndicator
                  size="large"
                  color="#B8918F"
                />
              )
            ) : (
              <Ionicons
                name={getIcon()}
                size={32}
                color={getIconColor()}
              />
            )}
          </View>

          {/* Text */}
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(122, 107, 86, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  container: {
    backgroundColor: '#FDFCFB',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    minWidth: 160,
    shadowColor: '#7A6B56',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7A6B56',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
    color: '#B8918F',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: -0.1,
  },
}); 