import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';
import { OutfitFeedback, EmotionalResponse, SocialFeedback, ComfortRating, EmotionalState } from '../../types/aynaMirror';

const { width: screenWidth } = Dimensions.get('window');

interface FeedbackCollectorProps {
  outfitId: string;
  userId: string;
  onFeedbackSubmit: (feedback: OutfitFeedback) => Promise<void>;
  onClose: () => void;
  visible: boolean;
}

interface FeedbackStep {
  id: string;
  title: string;
  subtitle: string;
  component: React.ReactNode;
}

export const FeedbackCollector: React.FC<FeedbackCollectorProps> = ({
  outfitId,
  userId,
  onFeedbackSubmit,
  onClose,
  visible,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [confidenceRating, setConfidenceRating] = useState<number>(0);
  const [emotionalResponse, setEmotionalResponse] = useState<EmotionalResponse>({
    primary: 'confident',
    intensity: 5,
    additionalEmotions: [],
  });
  const [socialFeedback, setSocialFeedback] = useState<SocialFeedback | undefined>();
  const [occasion, setOccasion] = useState<string>('');
  const [comfort, setComfort] = useState<ComfortRating>({
    physical: 0,
    emotional: 0,
    confidence: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleStarPress = (rating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConfidenceRating(rating);
  };

  const handleEmotionSelect = (emotion: EmotionalState) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEmotionalResponse(prev => ({
      ...prev,
      primary: emotion,
    }));
  };

  const handleIntensityChange = (intensity: number) => {
    setEmotionalResponse(prev => ({
      ...prev,
      intensity,
    }));
  };

  const handleComfortRating = (type: keyof ComfortRating, rating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setComfort(prev => ({
      ...prev,
      [type]: rating,
    }));
  };

  const handleSocialFeedback = (compliments: number, reactions: string[], context: string) => {
    setSocialFeedback({
      complimentsReceived: compliments,
      positiveReactions: reactions,
      socialContext: context,
    });
  };

  const handleSubmit = async () => {
    if (confidenceRating === 0) return;

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const feedback: OutfitFeedback = {
      id: `feedback_${Date.now()}`,
      userId,
      outfitRecommendationId: outfitId,
      confidenceRating,
      emotionalResponse,
      socialFeedback,
      occasion: occasion || undefined,
      comfort,
      timestamp: new Date(),
    };

    try {
      await onFeedbackSubmit(feedback);
      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const steps: FeedbackStep[] = [
    {
      id: 'confidence',
      title: 'How confident did you feel?',
      subtitle: 'Rate your overall confidence in this outfit',
      component: (
        <ConfidenceRatingStep
          rating={confidenceRating}
          onRatingChange={handleStarPress}
        />
      ),
    },
    {
      id: 'emotion',
      title: 'How did this outfit make you feel?',
      subtitle: 'Choose your primary emotion and intensity',
      component: (
        <EmotionalResponseStep
          emotionalResponse={emotionalResponse}
          onEmotionSelect={handleEmotionSelect}
          onIntensityChange={handleIntensityChange}
        />
      ),
    },
    {
      id: 'comfort',
      title: 'How comfortable were you?',
      subtitle: 'Rate different aspects of comfort',
      component: (
        <ComfortRatingStep
          comfort={comfort}
          onComfortRating={handleComfortRating}
        />
      ),
    },
    {
      id: 'social',
      title: 'Any compliments or reactions?',
      subtitle: 'Optional: Share positive social feedback',
      component: (
        <SocialFeedbackStep
          socialFeedback={socialFeedback}
          onSocialFeedback={handleSocialFeedback}
          occasion={occasion}
          onOccasionChange={setOccasion}
        />
      ),
    },
  ];

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <BlurView intensity={20} style={styles.blurContainer}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenWidth, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[APP_THEME_V2.semantic.background, APP_THEME_V2.semantic.surface]}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={APP_THEME_V2.semantic.text.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Outfit Feedback</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index <= currentStep && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
                <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>
                {steps[currentStep].component}
              </View>
            </ScrollView>

            {/* Navigation */}
            <View style={styles.navigation}>
              {currentStep > 0 && (
                <TouchableOpacity onPress={prevStep} style={styles.navButton}>
                  <Text style={styles.navButtonText}>Previous</Text>
                </TouchableOpacity>
              )}
              
              <View style={styles.navSpacer} />
              
              {currentStep < steps.length - 1 ? (
                <TouchableOpacity
                  onPress={nextStep}
                  style={[
                    styles.navButton,
                    styles.primaryNavButton,
                    confidenceRating === 0 && currentStep === 0 && styles.disabledButton,
                  ]}
                  disabled={confidenceRating === 0 && currentStep === 0}
                >
                  <Text style={styles.primaryNavButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[
                    styles.navButton,
                    styles.primaryNavButton,
                    isSubmitting && styles.disabledButton,
                  ]}
                  disabled={isSubmitting}
                >
                  <Text style={styles.primaryNavButtonText}>
                    {isSubmitting ? 'Submitting...' : 'Complete'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
};

// Individual step components will be defined in separate files
import { ConfidenceRatingStep } from './ConfidenceRatingStep';
import { EmotionalResponseStep } from './EmotionalResponseStep';
import { ComfortRatingStep } from './ComfortRatingStep';
import { SocialFeedbackStep } from './SocialFeedbackStep';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: APP_THEME_V2.semantic.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...APP_THEME_V2.typography.scale.h3,
    color: APP_THEME_V2.semantic.text.primary,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: APP_THEME_V2.semantic.surface,
  },
  progressDotActive: {
    backgroundColor: APP_THEME_V2.semantic.accent,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingBottom: 100,
  },
  stepTitle: {
    ...APP_THEME_V2.typography.scale.h2,
    color: APP_THEME_V2.semantic.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: APP_THEME_V2.semantic.background,
    borderTopWidth: 1,
    borderTopColor: APP_THEME_V2.semantic.border,
  },
  navSpacer: {
    flex: 1,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: APP_THEME_V2.semantic.surface,
  },
  primaryNavButton: {
    backgroundColor: APP_THEME_V2.semantic.accent,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    ...APP_THEME_V2.typography.scale.button,
    color: APP_THEME_V2.semantic.text.primary,
  },
  primaryNavButtonText: {
    ...APP_THEME_V2.typography.scale.button,
    color: APP_THEME_V2.semantic.text.inverse,
  },
});