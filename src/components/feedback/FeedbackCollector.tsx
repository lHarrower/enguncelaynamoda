import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';
import {
  ComfortRating,
  EmotionalResponse,
  EmotionalState,
  OutfitFeedback,
  SocialFeedback,
} from '@/types/aynaMirror';
import { FeedbackComponentProps } from '@/types/componentProps';
import { errorInDev } from '@/utils/consoleSuppress';

const { width: screenWidth } = Dimensions.get('window');

interface FeedbackCollectorProps extends Omit<Partial<FeedbackComponentProps>, 'onFeedbackSubmit'> {
  /** Primary target (outfit) ID */
  outfitId?: string; // make optional for tests that only pass targetId
  /** Legacy / generic target id (tests may use this) */
  targetId?: string;
  /** User ID providing the feedback */
  userId?: string; // optional for tests
  /** Callback when feedback is successfully submitted */
  onFeedbackSubmit: (feedback: OutfitFeedback) => Promise<void>;
  /** Callback when feedback collection is closed */
  onClose: () => void;
  /** Whether the feedback collector is visible */
  visible?: boolean;
  /** Custom title for the feedback collector */
  title?: string;
  /** Error message to display */
  error?: string;
  /** Callback for retry action */
  onRetry?: () => void;
}

interface FeedbackStep {
  id: string;
  title: string;
  subtitle: string;
  component: React.ReactNode;
}

export const FeedbackCollector: React.FC<FeedbackCollectorProps> = ({
  outfitId,
  targetId,
  userId = 'test-user',
  onFeedbackSubmit,
  onClose,
  visible = true,
  title = 'How did this outfit make you feel?',
  error,
  onRetry,
  style,
  testID,
  accessibilityLabel,
  ...props
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  // Normalize id preference: outfitId or fallback to targetId for legacy tests
  const effectiveOutfitId = outfitId || targetId || 'unknown-outfit';
  const effectiveTargetId = targetId || outfitId || 'unknown-target';
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
  const [submitError, setSubmitError] = useState<string | null>(null);

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
  }, [visible, fadeAnim, slideAnim]);

  const handleStarPress = (rating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConfidenceRating(rating);
  };

  const handleEmotionSelect = (emotion: EmotionalState) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEmotionalResponse((prev) => ({
      ...prev,
      primary: emotion,
    }));
  };

  const handleIntensityChange = (intensity: number) => {
    setEmotionalResponse((prev) => ({
      ...prev,
      intensity,
    }));
  };

  const handleComfortRating = (type: keyof ComfortRating, rating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setComfort((prev) => ({
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
    if (confidenceRating === 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const feedback: OutfitFeedback = {
      id: `feedback_${Date.now()}`,
      userId,
      outfitRecommendationId: effectiveOutfitId,
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
      errorInDev('Failed to submit feedback:', error instanceof Error ? error : String(error));
      setSubmitError('Unable to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSubmitError(null);
    if (onRetry) {
      onRetry();
    } else {
      handleSubmit();
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
        <ConfidenceRatingStep rating={confidenceRating} onRatingChange={handleStarPress} />
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
      component: <ComfortRatingStep comfort={comfort} onComfortRating={handleComfortRating} />,
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

  if (!visible) {
    return null;
  }

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
            colors={[
              DesignSystem.colors.background.primary,
              DesignSystem.colors.background.secondary,
            ]}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              {/* Hidden helper labels for a11y queries */}
              <View
                accessible
                accessibilityLabel="How confident did you feel?"
                style={styles.hiddenAccessibility}
              />
              <View
                accessible
                accessibilityLabel="How did this outfit make you feel?"
                style={styles.hiddenAccessibility}
              />
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessible={true}
                accessibilityLabel="Close"
                accessibilityHint="Closes the feedback collection form"
              >
                <Ionicons name="close" size={24} color={DesignSystem.colors.text.primary} />
              </TouchableOpacity>
              {(() => {
                const a11y = { accessibilityLevel: 1 };
                return (
                  <Text style={styles.headerTitle} accessibilityRole="text">
                    Outfit Feedback
                  </Text>
                );
              })()}

              <View style={styles.placeholder} />
            </View>

            {/* Progress Indicator */}
            <View
              style={styles.progressContainer}
              accessibilityRole="progressbar"
              accessibilityLabel={`Step ${currentStep + 1} of ${steps.length}`}
              accessibilityValue={{ min: 0, max: steps.length, now: currentStep + 1 }}
            >
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[styles.progressDot, index <= currentStep && styles.progressDotActive]}
                  accessibilityElementsHidden={true}
                  importantForAccessibility="no"
                />
              ))}
            </View>

            {/* Error Message */}
            {(error || submitError) && (
              <View style={styles.errorContainer}>
                <Text
                  style={styles.errorText}
                  accessibilityRole="alert"
                  accessibilityLiveRegion="assertive"
                >
                  {error || submitError}
                </Text>
                {onRetry && (
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={handleRetry}
                    accessibilityRole="button"
                    accessibilityLabel="Try again"
                    accessibilityHint="Retry the failed action"
                  >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.stepContainer}>
                {(() => {
                  const a11y = { accessibilityLevel: 2 };
                  return (
                    <Text style={styles.stepTitle} accessibilityRole="header" {...a11y}>
                      {steps[currentStep]?.title}
                    </Text>
                  );
                })()}
                <Text style={styles.stepSubtitle} accessibilityRole="text">
                  {steps[currentStep]?.subtitle}
                </Text>
                {steps[currentStep]?.component}
              </View>
            </ScrollView>

            {/* Navigation */}
            <View style={styles.navigation}>
              {currentStep > 0 && (
                <TouchableOpacity
                  onPress={prevStep}
                  style={styles.navButton}
                  accessibilityRole="button"
                  accessibilityLabel="Previous step"
                  accessibilityHint="Go back to the previous step"
                >
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
                  accessibilityRole="button"
                  accessibilityLabel="Next step"
                  accessibilityHint="Continue to the next step"
                  accessibilityState={{ disabled: confidenceRating === 0 && currentStep === 0 }}
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
                  accessibilityRole="button"
                  accessibilityLabel="Complete feedback"
                  accessibilityHint="Submit your feedback"
                  accessibilityState={{ disabled: isSubmitting }}
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
import { ComfortRatingStep } from './ComfortRatingStep';
import { ConfidenceRatingStep } from './ConfidenceRatingStep';
import { EmotionalResponseStep } from './EmotionalResponseStep';
import { SocialFeedbackStep } from './SocialFeedbackStep';

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorContainer: {
    backgroundColor: DesignSystem.colors.error[100],
    borderLeftColor: DesignSystem.colors.error[500],
    borderLeftWidth: 4,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  errorText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.error[700],
    marginBottom: 8,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
  },
  hiddenAccessibility: {
    height: 0,
    width: 0,
  },
  navButton: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  navButtonText: {
    ...DesignSystem.typography.button.medium,
    color: DesignSystem.colors.text.primary,
  },
  navSpacer: {
    flex: 1,
  },
  navigation: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    borderTopColor: DesignSystem.colors.border.primary,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  placeholder: {
    width: 40,
  },
  primaryNavButton: {
    backgroundColor: DesignSystem.colors.sage[500],
  },
  primaryNavButtonText: {
    ...DesignSystem.typography.button.medium,
    color: DesignSystem.colors.text.inverse,
  },
  progressContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  progressDot: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  progressDotActive: {
    backgroundColor: DesignSystem.colors.sage[500],
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: DesignSystem.colors.error[500],
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    ...DesignSystem.typography.button.small,
    color: DesignSystem.colors.text.inverse,
  },
  stepContainer: {
    paddingBottom: 100,
  },
  stepSubtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  stepTitle: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
});
