import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { warnInDev } from '@/utils/consoleSuppress';

const { width, height } = Dimensions.get('window');

interface ConfidenceLoopProps {
  visible: boolean;
  outfit: object;
  feedback: string;
  onClose: () => void;
  onContinue: () => void;
}

export default function ConfidenceLoop({
  visible,
  outfit,
  feedback,
  onClose,
  onContinue,
}: ConfidenceLoopProps) {
  const [currentPhase, setCurrentPhase] = useState<'celebration' | 'feedback' | 'promise'>(
    'celebration',
  );

  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const promiseAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startCelebrationSequence = useCallback(() => {
    // Haptic feedback for celebration
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Start sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Celebration phase
    Animated.timing(celebrationAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        setCurrentPhase('feedback');
        showFeedback();
      }, 2000);
    });
  }, [sparkleAnim, pulseAnim, celebrationAnim, feedbackAnim, promiseAnim]);

  const showFeedback = () => {
    Animated.timing(feedbackAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        setCurrentPhase('promise');
        showPromise();
      }, 3000);
    });
  };

  const showPromise = () => {
    Animated.timing(promiseAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (visible) {
      startCelebrationSequence();
    }
  }, [visible, startCelebrationSequence]);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onContinue();
  };

  const renderCelebrationPhase = () => (
    <Animated.View
      style={[
        styles.phaseContainer,
        {
          opacity: celebrationAnim,
          transform: [
            {
              scale: celebrationAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.celebrationContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </View>

        <Animated.View
          style={[
            styles.sparkleOverlay,
            {
              opacity: sparkleAnim,
            },
          ]}
        >
          <Text style={[styles.sparkle, styles.sparkle1]}>✨</Text>
          <Text style={[styles.sparkle, styles.sparkle2]}>⭐</Text>
          <Text style={[styles.sparkle, styles.sparkle3]}>✨</Text>
          <Text style={[styles.sparkle, styles.sparkle4]}>⭐</Text>
        </Animated.View>

        <Text style={styles.celebrationTitle}>Excellent Choice!</Text>
        <Text style={styles.celebrationSubtitle}>Your style intuition is remarkable</Text>
      </Animated.View>
    </Animated.View>
  );

  const renderFeedbackPhase = () => (
    <Animated.View
      style={[
        styles.phaseContainer,
        {
          opacity: feedbackAnim,
          transform: [
            {
              translateY: feedbackAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.feedbackContainer}>
        <View style={styles.aiIcon}>
          <LinearGradient colors={['#D4A574', '#B8956A']} style={styles.aiIconGradient}>
            <Ionicons name="sparkles" size={32} color="#FFFFFF" />
          </LinearGradient>
        </View>

        <Text style={styles.feedbackTitle}>AI Style Analysis</Text>

        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>

        <View style={styles.learningIndicator}>
          <View style={styles.learningDots}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={[styles.dot, styles.activeDot]} />
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.learningText}>Learning your preferences...</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderPromisePhase = () => (
    <Animated.View
      style={[
        styles.phaseContainer,
        {
          opacity: promiseAnim,
          transform: [
            {
              translateY: promiseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.promiseContainer}>
        <View style={styles.promiseIcon}>
          <Ionicons name="heart" size={48} color="#E91E63" />
        </View>

        <Text style={styles.promiseTitle}>Your Style Journey Begins</Text>

        <Text style={styles.promiseText}>
          Every choice you make teaches us more about your unique style. Tomorrow&apos;s recommendations
          will be even more perfectly tailored to you.
        </Text>

        <View style={styles.promiseFeatures}>
          <View style={styles.featureItem}>
            <Ionicons name="trending-up" size={20} color="#D4A574" />
            <Text style={styles.featureText}>Smarter recommendations daily</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="heart-outline" size={20} color="#D4A574" />
            <Text style={styles.featureText}>Curated just for your taste</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="star-outline" size={20} color="#D4A574" />
            <Text style={styles.featureText}>Confidence in every choice</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient colors={['#D4A574', '#B8956A']} style={styles.continueGradient}>
            <Text style={styles.continueText}>Start My Style Journey</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['rgba(248, 246, 240, 0.95)', 'rgba(255, 255, 255, 0.95)']}
          style={styles.modalContent}
        >
          {currentPhase === 'celebration' && renderCelebrationPhase()}
          {currentPhase === 'feedback' && renderFeedbackPhase()}
          {currentPhase === 'promise' && renderPromisePhase()}

          {/* Background Decoration */}
          <View style={styles.backgroundDecoration}>
            <View style={[styles.decorativeCircle, styles.topLeft]} />
            <View style={[styles.decorativeCircle, styles.bottomRight]} />
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const createStyles = (styleObj: Record<string, ViewStyle | TextStyle | ImageStyle>) => {
  try {
    return StyleSheet.create(styleObj);
  } catch (error) {
    warnInDev('StyleSheet.create failed, using fallback styles:', error);
    // Return a safe fallback with basic styles
    return {
      container: { flex: 1 },
      gradient: { flex: 1 },
      scrollView: { flex: 1 },
      content: { padding: 20 },
      ...styleObj,
    };
  }
};

const styles = createStyles({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  phaseContainer: {
    width: '100%',
    alignItems: 'center',
  },
  celebrationContainer: {
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  sparkleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 24,
  },
  sparkle1: {
    top: 20,
    left: 40,
  },
  sparkle2: {
    top: 40,
    right: 30,
  },
  sparkle3: {
    bottom: 60,
    left: 20,
  },
  sparkle4: {
    bottom: 40,
    right: 50,
  },
  celebrationTitle: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8B7355',
    textAlign: 'center',
  },
  feedbackContainer: {
    width: '100%',
    alignItems: 'center',
  },
  aiIcon: {
    marginBottom: 20,
  },
  aiIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  feedbackCard: {
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.2)',
  },
  feedbackText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 24,
  },
  learningIndicator: {
    alignItems: 'center',
  },
  learningDots: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(212, 165, 116, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#D4A574',
  },
  learningText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8B7355',
  },
  promiseContainer: {
    width: '100%',
    alignItems: 'center',
  },
  promiseIcon: {
    marginBottom: 20,
  },
  promiseTitle: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
  },
  promiseText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  promiseFeatures: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#2C3E50',
    marginLeft: 12,
  },
  continueButton: {
    width: '100%',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  continueText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: DesignSystem.colors.text.inverse,
    marginRight: 8,
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: DesignSystem.colors.background.overlay,
  },
  topLeft: {
    top: -50,
    left: -50,
  },
  bottomRight: {
    bottom: -50,
    right: -50,
  },
});
