import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext'; // Import useTheme

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
  title = "Processing Your Photo",
  subtitle = "Creating magic with AI..."
}) => {
  const { colors, isDark } = useTheme(); // Use the theme
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
        })
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
        ])
      );
      pulseAnimation.start();

      return () => {
        rotateAnimation.stop();
        pulseAnimation.stop();
      };
    }
  }, [isVisible]);

  // Update progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const getStatusInfo = (): { icon: IconName; message: string; color: string } => {
    switch (status) {
      case 'uploading':
        return {
          icon: 'cloud-upload-outline',
          message: 'Uploading your photo...',
          color: colors.highlight,
        };
      case 'removing_background':
        return {
          icon: 'cut-outline',
          message: 'Removing background with AI...',
          color: colors.tint,
        };
      case 'analyzing':
        return {
          icon: 'eye-outline',
          message: 'Analyzing colors and style...',
          color: colors.text_secondary,
        };
      case 'processing':
        return {
          icon: 'cog-outline',
          message: 'Processing item details...',
          color: colors.text,
        };
      case 'complete':
        return {
          icon: 'checkmark-circle',
          message: 'Complete! ✨',
          color: colors.highlight,
        };
      default:
        return {
          icon: 'hourglass-outline',
          message: 'Processing...',
          color: colors.tint,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const progressPercentage = Math.round(progress * 100);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.overlay} />
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              backgroundColor: colors.card,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Animated Background Circles */}
          <View style={styles.backgroundCircles}>
            <Animated.View 
              style={[
                styles.circle,
                styles.circle1,
                { backgroundColor: colors.tint, transform: [{ rotate: spin }, { scale: pulseAnim }] }
              ]}
            />
            <Animated.View 
              style={[
                styles.circle,
                styles.circle2,
                { backgroundColor: colors.success, transform: [{ rotate: spin }] }
              ]}
            />
            <Animated.View 
              style={[
                styles.circle,
                styles.circle3,
                { backgroundColor: colors.highlight, transform: [{ scale: pulseAnim }] }
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
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <Ionicons 
                name={statusInfo.icon} 
                size={40} 
                color={statusInfo.color} 
              />
            </Animated.View>

            {/* Title and Subtitle */}
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.text_secondary }]}>{subtitle}</Text>

            {/* Progress Circle */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressCircle, { backgroundColor: colors.border }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.tint,
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
                <View style={[styles.progressInner, { backgroundColor: colors.card }]}>
                  <Text style={[styles.progressText, { color: colors.text }]}>{progressPercentage}%</Text>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
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
                const stepProgress = Math.max(0, Math.min(1, (progress * 4) - index));
                const isActive = stepProgress > 0;
                const isComplete = stepProgress >= 1;
                
                return (
                  <View key={step} style={styles.step}>
                    <View 
                      style={[
                        styles.stepIndicator,
                        { backgroundColor: colors.border },
                        isActive && { backgroundColor: colors.tint },
                        isComplete && { backgroundColor: colors.success },
                      ]}
                    >
                      {isComplete ? (
                        <Ionicons name="checkmark" size={12} color={colors.card} />
                      ) : (
                        <View style={[styles.stepDot, { backgroundColor: colors.card }]} />
                      )}
                    </View>
                    <Text 
                      style={[
                        styles.stepText,
                        { color: colors.text_secondary },
                        isActive && { color: colors.text, fontWeight: '600' },
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
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: screenWidth - 60,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundCircles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -30,
    left: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    top: '50%',
    left: -20,
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    width: '50%',
    height: '100%',
    position: 'absolute',
    left: '50%',
    transformOrigin: 'left center',
  },
  progressInner: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusMessage: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepIndicatorActive: {},
  stepIndicatorComplete: {},
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepText: {
    fontSize: 12,
    textAlign: 'center',
  },
  stepTextActive: {
    fontWeight: '600',
  },
});

export default PhotoProcessingLoader; 