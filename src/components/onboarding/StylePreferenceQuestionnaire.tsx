import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { APP_THEME_V2 } from '@/constants/AppThemeV2';
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
      <Text style={styles.stepTitle}>What's Your Style?</Text>
      <Text style={styles.stepSubtitle}>
        Select all styles that resonate with you (choose as many as you like)
      </Text>
      
      <View style={styles.optionsGrid}>
        {STYLE_OPTIONS.map((style) => (
          <Animated.Pressable
            key={style.id}
            style={({ pressed }) => [
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
          </Animated.Pressable>
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
          <Animated.Pressable
            key={colorGroup.id}
            style={({ pressed }) => [
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
          </Animated.Pressable>
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
          <Animated.Pressable
            key={occasion.id}
            style={({ pressed }) => [
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
          </Animated.Pressable>
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
          <Animated.Pressable
            key={noteStyle.id}
            style={({ pressed }) => [
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
          </Animated.Pressable>
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
        colors={[APP_THEME_V2.colors.linen.light, APP_THEME_V2.colors.linen.base]}
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
                <Animated.Pressable
                  style={({ pressed }) => [
                    styles.skipButton,
                    pressed && styles.skipButtonPressed
                  ]}
                  onPress={onSkip}
                >
                  <Text style={styles.skipButtonText}>Skip for Now</Text>
                </Animated.Pressable>

                <View style={styles.primaryNavigation}>
                  {currentStep > 0 && (
                    <Animated.Pressable
                      style={({ pressed }) => [
                        styles.backButton,
                        pressed && styles.backButtonPressed
                      ]}
                      onPress={handleBack}
                    >
                      <Text style={styles.backButtonText}>Back</Text>
                    </Animated.Pressable>
                  )}

                  <Animated.Pressable
                    style={({ pressed }) => [
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
                          ? [APP_THEME_V2.colors.sageGreen[400], APP_THEME_V2.colors.sageGreen[600]]
                          : [APP_THEME_V2.colors.inkGray[300], APP_THEME_V2.colors.inkGray[400]]
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
                  </Animated.Pressable>
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
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    paddingTop: APP_THEME_V2.spacing.lg,
    paddingBottom: APP_THEME_V2.spacing.xxxl,
  },
  progressHeader: {
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  headerTitle: {
    ...APP_THEME_V2.typography.scale.h1,
    color: APP_THEME_V2.semantic.text.primary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.lg,
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
    backgroundColor: APP_THEME_V2.colors.moonlightSilver,
    marginBottom: APP_THEME_V2.spacing.xs,
  },
  progressDotActive: {
    backgroundColor: APP_THEME_V2.colors.sageGreen[500],
  },
  progressLabel: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.semantic.text.tertiary,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: APP_THEME_V2.colors.sageGreen[600],
    fontWeight: '600',
  },
  stepContent: {
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  stepTitle: {
    ...APP_THEME_V2.typography.scale.h2,
    color: APP_THEME_V2.semantic.text.primary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  stepSubtitle: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  optionsGrid: {
    gap: APP_THEME_V2.spacing.md,
  },
  optionCard: {
    borderRadius: APP_THEME_V2.radius.organic,
    ...APP_THEME_V2.elevation.whisper,
  },
  optionCardSelected: {
    ...APP_THEME_V2.elevation.lift,
  },
  optionCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  optionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: APP_THEME_V2.spacing.lg,
    borderRadius: APP_THEME_V2.radius.organic,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: APP_THEME_V2.spacing.md,
  },
  optionLabel: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.secondary,
    flex: 1,
  },
  optionLabelSelected: {
    color: APP_THEME_V2.colors.sageGreen[700],
    fontWeight: '600',
  },
  colorOptionsContainer: {
    gap: APP_THEME_V2.spacing.md,
  },
  colorOptionCard: {
    borderRadius: APP_THEME_V2.radius.organic,
    ...APP_THEME_V2.elevation.whisper,
  },
  colorOptionCardSelected: {
    ...APP_THEME_V2.elevation.lift,
  },
  colorOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: APP_THEME_V2.spacing.lg,
    borderRadius: APP_THEME_V2.radius.organic,
  },
  colorPalette: {
    flexDirection: 'row',
    marginRight: APP_THEME_V2.spacing.md,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: APP_THEME_V2.spacing.xs,
    borderWidth: 1,
    borderColor: APP_THEME_V2.colors.moonlightSilver,
  },
  colorOptionLabel: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.secondary,
    flex: 1,
  },
  confidenceNotesContainer: {
    gap: APP_THEME_V2.spacing.lg,
  },
  confidenceNoteCard: {
    borderRadius: APP_THEME_V2.radius.organic,
    ...APP_THEME_V2.elevation.whisper,
  },
  confidenceNoteCardSelected: {
    ...APP_THEME_V2.elevation.lift,
  },
  confidenceNoteContent: {
    padding: APP_THEME_V2.spacing.lg,
    borderRadius: APP_THEME_V2.radius.organic,
  },
  confidenceNoteEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  confidenceNoteTitle: {
    ...APP_THEME_V2.typography.scale.h3,
    color: APP_THEME_V2.semantic.text.secondary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  confidenceNoteExample: {
    ...APP_THEME_V2.typography.scale.whisper,
    color: APP_THEME_V2.semantic.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  navigationSection: {
    marginTop: APP_THEME_V2.spacing.xl,
  },
  navigationButtons: {
    gap: APP_THEME_V2.spacing.md,
  },
  skipButton: {
    paddingVertical: APP_THEME_V2.spacing.md,
    alignItems: 'center',
  },
  skipButtonPressed: {
    opacity: 0.7,
  },
  skipButtonText: {
    ...APP_THEME_V2.typography.scale.button,
    color: APP_THEME_V2.semantic.text.tertiary,
  },
  primaryNavigation: {
    flexDirection: 'row',
    gap: APP_THEME_V2.spacing.md,
  },
  backButton: {
    paddingVertical: APP_THEME_V2.spacing.md,
    paddingHorizontal: APP_THEME_V2.spacing.lg,
    borderRadius: APP_THEME_V2.radius.md,
    borderWidth: 1,
    borderColor: APP_THEME_V2.colors.moonlightSilver,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    ...APP_THEME_V2.typography.scale.button,
    color: APP_THEME_V2.semantic.text.secondary,
  },
  continueButton: {
    borderRadius: APP_THEME_V2.radius.organic,
    ...APP_THEME_V2.elevation.lift,
    flex: 1,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  continueButtonGradient: {
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    paddingVertical: APP_THEME_V2.spacing.md,
    borderRadius: APP_THEME_V2.radius.organic,
    alignItems: 'center',
  },
  continueButtonText: {
    ...APP_THEME_V2.typography.scale.button,
    color: APP_THEME_V2.semantic.text.inverse,
  },
  continueButtonTextDisabled: {
    color: APP_THEME_V2.colors.inkGray[600],
  },
});