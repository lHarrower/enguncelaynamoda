import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, StatusBar, StyleSheet, Text, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface PhotoProcessingLoaderProps {
  isVisible: boolean;
  progress: number; // 0 to 1
  status: 'uploading' | 'removing_background' | 'analyzing' | 'processing' | 'complete';
  title?: string;
  subtitle?: string;
}

const PhotoProcessingLoader: React.FC<PhotoProcessingLoaderProps> = ({
  isVisible,
  progress,
  status,
  title = 'Processing Your Photo',
  subtitle = 'Creating magic with AI...',
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Entry animation
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

      // Continuous rotation animation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      );
      rotateAnimation.start();

      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();

      return () => {
        rotateAnimation.stop();
        pulseAnimation.stop();
      };
    }
  }, [isVisible, fadeAnim, pulseAnim, rotateAnim, scaleAnim]);

  // Update progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const getStatusInfo = (): { icon: IconName; message: string; color: string } => {
    const primary500 = DesignSystem.colors?.primaryIndexed?.[500] || '#007AFF';
    const textPrimary = DesignSystem.colors?.text?.primary || '#FFFFFF';
    const textSecondary = DesignSystem.colors?.text?.secondary || '#999999';
    switch (status) {
      case 'uploading':
        return {
          icon: 'cloud-upload-outline',
          message: 'Uploading your photo...',
          color: primary500,
        };
      case 'removing_background':
        return {
          icon: 'cut-outline',
          message: 'Removing background with AI...',
          color: primary500,
        };
      case 'analyzing':
        return {
          icon: 'eye-outline',
          message: 'Analyzing colors and style...',
          color: textSecondary,
        };
      case 'processing':
        return {
          icon: 'cog-outline',
          message: 'Processing item details...',
          color: textPrimary,
        };
      case 'complete':
        return {
          icon: 'checkmark-circle',
          message: 'Complete! ✨',
          color: primary500,
        };
      default:
        return {
          icon: 'hourglass-outline',
          message: 'Processing...',
          color: primary500,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const progressPercentage = Math.round(progress * 100);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!isVisible) {
    return null;
  }

  return (
    <Modal visible={isVisible} transparent animationType="none" statusBarTranslucent>
      <StatusBar
        barStyle="light-content"
        backgroundColor={DesignSystem.colors?.background?.overlay || 'rgba(0,0,0,0.85)'}
      />
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            backgroundColor: 'rgba(0,0,0,0.9)',
          },
        ]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: DesignSystem.colors?.background?.elevated || '#111111',
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Animated Background Circles */}
          <View style={styles.backgroundCircles}>
            <Animated.View
              style={[
                styles.circle,
                styles.circle1,
                {
                  backgroundColor: DesignSystem.colors.primary[500],
                  transform: [{ rotate: spin }, { scale: pulseAnim }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.circle,
                styles.circle2,
                {
                  backgroundColor: DesignSystem.colors?.success?.main || '#2ECC71',
                  transform: [{ rotate: spin }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.circle,
                styles.circle3,
                {
                  backgroundColor: DesignSystem.colors?.primaryIndexed?.[500] || '#007AFF',
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            {/* Status Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                { backgroundColor: statusInfo.color + '20' },
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Ionicons name={statusInfo.icon} size={40} color={statusInfo.color} />
            </Animated.View>

            {/* Title and Subtitle */}
            <Text
              style={[styles.title, { color: DesignSystem.colors?.text?.primary || '#FFFFFF' }]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: DesignSystem.colors?.text?.secondary || '#999999' },
              ]}
            >
              {subtitle}
            </Text>

            {/* Progress Circle */}
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressCircle,
                  { backgroundColor: DesignSystem.colors?.border?.primary || '#333333' },
                ]}
              >
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: DesignSystem.colors.primary[500],
                      transform: [
                        {
                          rotate: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <View
                  style={[
                    styles.progressInner,
                    { backgroundColor: DesignSystem.colors?.background?.elevated || '#111111' },
                  ]}
                >
                  <Text style={[styles.progressText, { color: DesignSystem.colors.text.primary }]}>
                    {progressPercentage}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View
              style={[
                styles.progressBar,
                { backgroundColor: DesignSystem.colors?.border?.primary || '#333333' },
              ]}
            >
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: statusInfo.color,
                  },
                ]}
              />
            </View>

            {/* Status Message */}
            <Text style={[styles.statusMessage, { color: statusInfo.color }]}>
              {statusInfo.message}
            </Text>

            {/* Processing Steps */}
            <View style={styles.stepsContainer}>
              {['Upload', 'Remove BG', 'Analyze', 'Complete'].map((step, index) => {
                const stepProgress = Math.max(0, Math.min(1, progress * 4 - index));
                const isActive = stepProgress > 0;
                const isComplete = stepProgress >= 1;

                return (
                  <View key={step} style={styles.step}>
                    <View
                      style={[
                        styles.stepIndicator,
                        { backgroundColor: DesignSystem.colors?.border?.primary || '#333333' },
                        isActive && {
                          backgroundColor: DesignSystem.colors?.primaryIndexed?.[500] || '#007AFF',
                        },
                        isComplete && {
                          backgroundColor: DesignSystem.colors?.success?.main || '#2ECC71',
                        },
                      ]}
                    >
                      {isComplete ? (
                        <Ionicons
                          name="checkmark"
                          size={12}
                          color={DesignSystem.colors?.background?.elevated || '#111111'}
                        />
                      ) : (
                        <View
                          style={[
                            styles.stepDot,
                            {
                              backgroundColor:
                                DesignSystem.colors?.background?.elevated || '#111111',
                            },
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepText,
                        { color: DesignSystem.colors?.text?.secondary || '#999999' },
                        isActive && {
                          color: DesignSystem.colors?.text?.primary || '#FFFFFF',
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {step}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backgroundCircles: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  circle: {
    borderRadius: 1000,
    opacity: 0.1,
    position: 'absolute',
  },
  circle1: {
    height: 200,
    right: -50,
    top: -50,
    width: 200,
  },
  circle2: {
    bottom: -30,
    height: 150,
    left: -30,
    width: 150,
  },
  circle3: {
    height: 100,
    left: -20,
    top: '50%',
    width: 100,
  },
  container: {
    alignItems: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    padding: 40,
    position: 'relative',
    width: screenWidth - 60,
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 20,
    width: 80,
  },
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  progressBar: {
    borderRadius: 3,
    height: 6,
    marginBottom: 20,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    borderRadius: 3,
    height: '100%',
  },
  progressCircle: {
    borderRadius: 50,
    height: 100,
    overflow: 'hidden',
    position: 'relative',
    width: 100,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    left: '50%',
    position: 'absolute',
    transformOrigin: 'left center',
    width: '50%',
  },
  progressInner: {
    alignItems: 'center',
    borderRadius: 35,
    bottom: 15,
    justifyContent: 'center',
    left: 15,
    position: 'absolute',
    right: 15,
    top: 15,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusMessage: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  stepIndicator: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    marginBottom: 8,
    width: 24,
  },
  stepIndicatorActive: {},
  stepIndicatorComplete: {},
  stepText: {
    fontSize: 12,
    textAlign: 'center',
  },
  stepTextActive: {
    fontWeight: '600',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default PhotoProcessingLoader;
