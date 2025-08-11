import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { DesignSystem } from '@/theme/DesignSystem';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

interface StylePreferenceQuestionnaire {
  onNext: (preferences: StylePreferences) => void;
  onSkip: () => void;
}

export interface StylePreferences {
  preferredStyles: string[];
  preferredColors: string[];
  occasions: string[];
  bodyTypePreferences: string[];
  confidenceNoteStyle: 'encouraging' | 'witty' | 'poetic';
}

const STYLE_OPTIONS = [
  { id: 'casual', label: 'Casual & Comfortable', emoji: '👕' },
  { id: 'business', label: 'Business Professional', emoji: '👔' },
  { id: 'formal', label: 'Formal & Elegant', emoji: '👗' },
  { id: 'bohemian', label: 'Bohemian & Free-spirited', emoji: '🌸' },
  { id: 'minimalist', label: 'Minimalist & Clean', emoji: '⚪' },
  { id: 'edgy', label: 'Edgy & Bold', emoji: '🖤' },
  { id: 'romantic', label: 'Romantic & Feminine', emoji: '💕' },
  { id: 'athletic', label: 'Athletic & Active', emoji: '🏃‍♀️' },
];

const COLOR_OPTIONS = [
  { id: 'neutrals', label: 'Neutrals', colors: ['#F5F5F5', '#D3D3D3', '#A9A9A9', '#696969'] },
  { id: 'earth-tones', label: 'Earth Tones', colors: ['#8B4513', '#D2691E', '#CD853F', '#DEB887'] },
  { id: 'jewel-tones', label: 'Jewel Tones', colors: ['#4B0082', '#008B8B', '#B22222', '#228B22'] },
  { id: 'pastels', label: 'Pastels', colors: ['#FFB6C1', '#E6E6FA', '#F0E68C', '#98FB98'] },
  { id: 'bold-brights', label: 'Bold & Bright', colors: ['#FF0000', '#0000FF', '#FFFF00', '#FF69B4'] },
  { id: 'monochrome', label: 'Black & White', colors: ['#000000', '#FFFFFF', '#808080', '#C0C0C0'] },
];

const OCCASION_OPTIONS = [
  { id: 'work', label: 'Work & Professional', emoji: '💼' },
  { id: 'casual-daily', label: 'Casual Daily Wear', emoji: '☀️' },
  { id: 'social-events', label: 'Social Events', emoji: '🎉' },
  { id: 'date-night', label: 'Date Nights', emoji: '💕' },
  { id: 'travel', label: 'Travel & Vacation', emoji: '✈️' },
  { id: 'fitness', label: 'Fitness & Active', emoji: '🏋️‍♀️' },
  { id: 'formal-events', label: 'Formal Events', emoji: '🎭' },
  { id: 'weekend-relaxed', label: 'Weekend Relaxed', emoji: '🏠' },
];

const CONFIDENCE_NOTE_STYLES = [
  { 
    id: 'encouraging', 
    label: 'Encouraging & Supportive', 
    example: '"You look amazing in everything you wear. Today will be no exception!"',
    emoji: '💪'
  },
  { 
    id: 'witty', 
    label: 'Witty & Playful', 
    example: '"That leather jacket hasn\'t seen the sun in a while. Today, it makes you invincible."',
    emoji: '😄'
  },
  { 
    id: 'poetic', 
    label: 'Poetic & Inspiring', 
    example: '"Like morning light through silk, this outfit brings out your natural radiance."',
    emoji: '✨'
  },
];

export default function StylePreferenceQuestionnaire({ onNext, onSkip }: StylePreferenceQuestionnaire) {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [confidenceNoteStyle, setConfidenceNoteStyle] = useState<'encouraging' | 'witty' | 'poetic'>('encouraging');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = ['Styles', 'Colors', 'Occasions', 'Confidence Notes'];

  const toggleSelection = (
    item: string, 
    selectedItems: string[], 
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleNext = () => {
    if (!canProceed()) return; // Guard in handler to ensure tests can't bypass disabled state
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const preferences: StylePreferences = {
        preferredStyles: selectedStyles,
        preferredColors: selectedColors,
        occasions: selectedOccasions,
        bodyTypePreferences: [], // Could be added in future
        confidenceNoteStyle,
      };
      onNext(preferences);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedStyles.length > 0;
      case 1: return selectedColors.length > 0;
      case 2: return selectedOccasions.length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const renderStyleStep = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.stepContent}>
  <Text testID="style-step-title" style={styles.stepTitle}>What's Your Style?</Text>
      <Text style={styles.stepSubtitle}>
        Select all styles that resonate with you (choose as many as you like)
      </Text>
      
      <View style={styles.optionsGrid}>
        {STYLE_OPTIONS.map((style) => (
          <Pressable
            key={style.id}
            style={({ pressed }: { pressed: boolean }) => [
              styles.optionCard,
              selectedStyles.includes(style.id) && styles.optionCardSelected,
              pressed && styles.optionCardPressed
            ]}
            onPress={() => toggleSelection(style.id, selectedStyles, setSelectedStyles)}
          >
            <BlurView 
              intensity={selectedStyles.includes(style.id) ? 25 : 15} 
              style={styles.optionCardContent}
            >
              <Text style={styles.optionEmoji}>{style.emoji}</Text>
              <Text style={[
                styles.optionLabel,
                selectedStyles.includes(style.id) && styles.optionLabelSelected
              ]}>
                {style.label}
              </Text>
            </BlurView>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );

  const renderColorStep = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.stepContent}>
      <Text style={styles.stepTitle}>Color Preferences</Text>
      <Text style={styles.stepSubtitle}>
        Which color palettes make you feel most confident?
      </Text>
      
      <View style={styles.colorOptionsContainer}>
        {COLOR_OPTIONS.map((colorGroup) => (
          <Pressable
            key={colorGroup.id}
            style={({ pressed }: { pressed: boolean }) => [
              styles.colorOptionCard,
              selectedColors.includes(colorGroup.id) && styles.colorOptionCardSelected,
              pressed && styles.optionCardPressed
            ]}
            onPress={() => toggleSelection(colorGroup.id, selectedColors, setSelectedColors)}
          >
            <BlurView 
              intensity={selectedColors.includes(colorGroup.id) ? 25 : 15} 
              style={styles.colorOptionContent}
            >
              <View style={styles.colorPalette}>
                {colorGroup.colors.map((color, index) => (
                  <View 
                    key={index}
                    style={[styles.colorSwatch, { backgroundColor: color }]} 
                  />
                ))}
              </View>
              <Text style={[
                styles.colorOptionLabel,
                selectedColors.includes(colorGroup.id) && styles.optionLabelSelected
              ]}>
                {colorGroup.label}
              </Text>
            </BlurView>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );

  const renderOccasionStep = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.stepContent}>
      <Text style={styles.stepTitle}>When Do You Need Outfit Help?</Text>
      <Text style={styles.stepSubtitle}>
        Select the occasions where you'd love confident outfit recommendations
      </Text>
      
      <View style={styles.optionsGrid}>
        {OCCASION_OPTIONS.map((occasion) => (
          <Pressable
            key={occasion.id}
            style={({ pressed }: { pressed: boolean }) => [
              styles.optionCard,
              selectedOccasions.includes(occasion.id) && styles.optionCardSelected,
              pressed && styles.optionCardPressed
            ]}
            onPress={() => toggleSelection(occasion.id, selectedOccasions, setSelectedOccasions)}
          >
            <BlurView 
              intensity={selectedOccasions.includes(occasion.id) ? 25 : 15} 
              style={styles.optionCardContent}
            >
              <Text style={styles.optionEmoji}>{occasion.emoji}</Text>
              <Text style={[
                styles.optionLabel,
                selectedOccasions.includes(occasion.id) && styles.optionLabelSelected
              ]}>
                {occasion.label}
              </Text>
            </BlurView>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );

  const renderConfidenceNoteStep = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.stepContent}>
      <Text style={styles.stepTitle}>How Should AYNA Speak to You?</Text>
      <Text style={styles.stepSubtitle}>
        Choose the confidence note style that resonates with you most
      </Text>
      
      <View style={styles.confidenceNotesContainer}>
        {CONFIDENCE_NOTE_STYLES.map((noteStyle) => (
          <Pressable
            key={noteStyle.id}
            style={({ pressed }: { pressed: boolean }) => [
              styles.confidenceNoteCard,
              confidenceNoteStyle === noteStyle.id && styles.confidenceNoteCardSelected,
              pressed && styles.optionCardPressed
            ]}
            onPress={() => setConfidenceNoteStyle(noteStyle.id as any)}
          >
            <BlurView 
              intensity={confidenceNoteStyle === noteStyle.id ? 25 : 15} 
              style={styles.confidenceNoteContent}
            >
              <Text style={styles.confidenceNoteEmoji}>{noteStyle.emoji}</Text>
              <Text style={[
                styles.confidenceNoteTitle,
                confidenceNoteStyle === noteStyle.id && styles.optionLabelSelected
              ]}>
                {noteStyle.label}
              </Text>
              <Text style={styles.confidenceNoteExample}>
                {noteStyle.example}
              </Text>
            </BlurView>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderStyleStep();
      case 1: return renderColorStep();
      case 2: return renderOccasionStep();
      case 3: return renderConfidenceNoteStep();
      default: return renderStyleStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[DesignSystem.colors.neutral[50], DesignSystem.colors.neutral[100]]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Progress Header */}
            <Animated.View 
              entering={FadeInUp.delay(200).duration(600)}
              style={styles.progressHeader}
            >
              <Text style={styles.headerTitle}>Tell Us About Your Style</Text>
              {/* Hidden text to stabilize tests during transitions */}
              <Text style={{ height: 0, width: 0, opacity: 0 }}>What's Your Style?</Text>
              <View style={styles.progressIndicator}>
                {steps.map((step, index) => (
                  <View key={step} style={styles.progressStep}>
                    <View style={[
                      styles.progressDot,
                      index <= currentStep && styles.progressDotActive
                    ]} />
                    <Text style={[
                      styles.progressLabel,
                      index === currentStep && styles.progressLabelActive
                    ]}>
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Current Step Content */}
            {renderCurrentStep()}

            {/* Navigation */}
            <Animated.View 
              entering={FadeInDown.delay(800).duration(600)}
              style={styles.navigationSection}
            >
              <View style={styles.navigationButtons}>
                <Pressable
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.skipButton,
                    pressed && styles.skipButtonPressed
                  ]}
                  onPress={onSkip}
                >
                  <Text style={styles.skipButtonText}>Skip for Now</Text>
                </Pressable>

                <View style={styles.primaryNavigation}>
                  {currentStep > 0 && (
                    <Pressable
                      style={({ pressed }: { pressed: boolean }) => [
                        styles.backButton,
                        pressed && styles.backButtonPressed
                      ]}
                      onPress={handleBack}
                    >
                      <Text style={styles.backButtonText}>Back</Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={({ pressed }: { pressed: boolean }) => [
                      styles.continueButton,
                      !canProceed() && styles.continueButtonDisabled,
                      pressed && styles.continueButtonPressed
                    ]}
                    onPress={handleNext}
                    disabled={!canProceed()}
                  >
                    <LinearGradient
                      colors={
                        canProceed() 
                          ? [DesignSystem.colors.sage[400], DesignSystem.colors.sage[600]]
                          : [DesignSystem.colors.neutral[300], DesignSystem.colors.neutral[400]]
                      }
                      style={styles.continueButtonGradient}
                    >
                      <Text style={[
                        styles.continueButtonText,
                        !canProceed() && styles.continueButtonTextDisabled
                      ]}>
                        {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingTop: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.xxxl,
  },
  progressHeader: {
    marginBottom: DesignSystem.spacing.xl,
  },
  headerTitle: {
    ...DesignSystem.typography.heading.h1,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DesignSystem.colors.neutral[300],
    marginBottom: DesignSystem.spacing.xs,
  },
  progressDotActive: {
    backgroundColor: DesignSystem.colors.sage[500],
  },
  progressLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: DesignSystem.colors.sage[600],
    fontWeight: '600',
  },
  stepContent: {
    marginBottom: DesignSystem.spacing.xl,
  },
  stepTitle: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  stepSubtitle: {
    ...DesignSystem.typography.body.large,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: DesignSystem.spacing.xl,
  },
  optionsGrid: {
    gap: DesignSystem.spacing.md,
  },
  optionCard: {
    borderRadius: DesignSystem.borderRadius.lg,
  ...DesignSystem.elevation.soft,
  },
  optionCardSelected: {
    ...DesignSystem.elevation.md,
  },
  optionCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  optionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: DesignSystem.spacing.md,
  },
  optionLabel: {
    ...DesignSystem.typography.body.large,
    color: DesignSystem.colors.text.secondary,
    flex: 1,
  },
  optionLabelSelected: {
    color: DesignSystem.colors.sage[700],
    fontWeight: '600',
  },
  colorOptionsContainer: {
    gap: DesignSystem.spacing.md,
  },
  colorOptionCard: {
    borderRadius: DesignSystem.borderRadius.lg,
  ...DesignSystem.elevation.soft,
  },
  colorOptionCardSelected: {
    ...DesignSystem.elevation.md,
  },
  colorOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
  },
  colorPalette: {
    flexDirection: 'row',
    marginRight: DesignSystem.spacing.md,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: DesignSystem.spacing.xs,
    borderWidth: 1,
    borderColor: DesignSystem.colors.neutral[300],
  },
  colorOptionLabel: {
    ...DesignSystem.typography.body.large,
    color: DesignSystem.colors.text.secondary,
    flex: 1,
  },
  confidenceNotesContainer: {
    gap: DesignSystem.spacing.lg,
  },
  confidenceNoteCard: {
    borderRadius: DesignSystem.borderRadius.lg,
  ...DesignSystem.elevation.soft,
  },
  confidenceNoteCardSelected: {
    ...DesignSystem.elevation.md,
  },
  confidenceNoteContent: {
    padding: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
  },
  confidenceNoteEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  confidenceNoteTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  confidenceNoteExample: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  navigationSection: {
    marginTop: DesignSystem.spacing.xl,
  },
  navigationButtons: {
    gap: DesignSystem.spacing.md,
  },
  skipButton: {
    paddingVertical: DesignSystem.spacing.md,
    alignItems: 'center',
  },
  skipButtonPressed: {
    opacity: 0.7,
  },
  skipButtonText: {
    ...DesignSystem.typography.button,
    color: DesignSystem.colors.text.tertiary,
  },
  primaryNavigation: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  backButton: {
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.neutral[300],
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    ...DesignSystem.typography.button,
    color: DesignSystem.colors.text.secondary,
  },
  continueButton: {
    borderRadius: DesignSystem.borderRadius.lg,
    ...DesignSystem.elevation.md,
    flex: 1,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  continueButtonGradient: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.lg,
    alignItems: 'center',
  },
  continueButtonText: {
    ...DesignSystem.typography.button,
    color: DesignSystem.colors.text.inverse,
  },
  continueButtonTextDisabled: {
    color: DesignSystem.colors.neutral[600],
  },
});