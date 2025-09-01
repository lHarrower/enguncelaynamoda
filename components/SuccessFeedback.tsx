import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SuccessFeedbackProps {
  visible: boolean;
  title?: string;
  message?: string;
  onComplete?: () => void;
}

const SuccessFeedback: React.FC<SuccessFeedbackProps> = ({
  visible,
  title = 'Başarılı!',
  message = 'İşlem başarıyla tamamlandı',
  onComplete,
}) => {
  // Animation values
  const overlayOpacity = useSharedValue(0);
  const containerScale = useSharedValue(0.3);
  const containerOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const checkRotation = useSharedValue(-180);
  const sparkleScale = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Start animation sequence
      overlayOpacity.value = withTiming(1, { duration: 300 });
      
      // Container entrance
      containerScale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      containerOpacity.value = withTiming(1, { duration: 400 });
      
      // Check mark animation with delay
      setTimeout(() => {
        checkScale.value = withSequence(
          withSpring(1.2, { damping: 10, stiffness: 200 }),
          withSpring(1, { damping: 15, stiffness: 300 })
        );
        checkRotation.value = withSpring(0, {
          damping: 12,
          stiffness: 150,
        });
      }, 200);
      
      // Sparkle effects
      setTimeout(() => {
        sparkleScale.value = withSequence(
          withSpring(1, { damping: 8, stiffness: 200 }),
          withDelay(800, withSpring(0, { damping: 10, stiffness: 150 }))
        );
        sparkleOpacity.value = withSequence(
          withTiming(1, { duration: 300 }),
          withDelay(500, withTiming(0, { duration: 500 }))
        );
      }, 400);
      
      // Text animation
      setTimeout(() => {
        textTranslateY.value = withSpring(0, {
          damping: 15,
          stiffness: 200,
        });
        textOpacity.value = withTiming(1, { duration: 600 });
      }, 600);
      
      // Auto dismiss after animation completes
      setTimeout(() => {
        overlayOpacity.value = withTiming(0, { duration: 400 });
        containerScale.value = withTiming(0.8, { duration: 400 });
        containerOpacity.value = withTiming(0, { duration: 400 });
        
        setTimeout(() => {
          if (onComplete) {
            runOnJS(onComplete)();
          }
        }, 400);
      }, 2500);
    } else {
      // Reset values
      overlayOpacity.value = 0;
      containerScale.value = 0.3;
      containerOpacity.value = 0;
      checkScale.value = 0;
      checkRotation.value = -180;
      sparkleScale.value = 0;
      sparkleOpacity.value = 0;
      textTranslateY.value = 30;
      textOpacity.value = 0;
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
    opacity: containerOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: checkScale.value },
      { rotate: `${checkRotation.value}deg` },
    ],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale.value }],
    opacity: sparkleOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textTranslateY.value }],
    opacity: textOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Animated.View style={[styles.container, containerStyle]}>
        <LinearGradient
          colors={[
            DesignSystem.colors.success[50],
            DesignSystem.colors.success[100],
            DesignSystem.colors.success[200],
          ]}
          style={styles.gradient}
        >
          {/* Sparkle effects */}
          <Animated.View style={[styles.sparkle, styles.sparkle1, sparkleStyle]}>
            <Ionicons name="sparkles" size={16} color={DesignSystem.colors.gold[400]} />
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkle2, sparkleStyle]}>
            <Ionicons name="star" size={12} color={DesignSystem.colors.gold[500]} />
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkle3, sparkleStyle]}>
            <Ionicons name="diamond" size={10} color={DesignSystem.colors.gold[600]} />
          </Animated.View>
          
          {/* Check mark */}
          <View style={styles.checkContainer}>
            <Animated.View style={[styles.checkBackground, checkStyle]}>
              <LinearGradient
                colors={[
                  DesignSystem.colors.success[400],
                  DesignSystem.colors.success[500],
                  DesignSystem.colors.success[600],
                ]}
                style={styles.checkGradient}
              >
                <Ionicons name="checkmark" size={32} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
          </View>
          
          {/* Text content */}
          <Animated.View style={[styles.textContainer, textStyle]}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 320,
    borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  gradient: {
    paddingVertical: DesignSystem.spacing.xl * 2,
    paddingHorizontal: DesignSystem.spacing.xl,
    alignItems: 'center',
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 20,
    right: 30,
  },
  sparkle2: {
    top: 40,
    left: 25,
  },
  sparkle3: {
    bottom: 60,
    right: 20,
  },
  checkContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  checkBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: DesignSystem.colors.success[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: DesignSystem.colors.success[700],
    fontFamily: DesignSystem.typography.fontFamily.bold,
    marginBottom: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: DesignSystem.colors.success[600],
    fontFamily: DesignSystem.typography.fontFamily.medium,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SuccessFeedback;