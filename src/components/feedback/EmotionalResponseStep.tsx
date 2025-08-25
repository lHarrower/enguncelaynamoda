import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DesignSystem } from '../../theme/DesignSystem';
import { EmotionalResponse, EmotionalState } from '../../types/aynaMirror';

interface EmotionalResponseStepProps {
  emotionalResponse: EmotionalResponse;
  onEmotionSelect: (emotion: EmotionalState) => void;
  onIntensityChange: (intensity: number) => void;
}

const EMOTIONS = [
  {
    state: 'confident' as EmotionalState,
    label: 'Confident',
    emoji: '💪',
    color: '#FF6B6B',
    description: 'Ready to take on the world',
  },
  {
    state: 'comfortable' as EmotionalState,
    label: 'Comfortable',
    emoji: '😌',
    color: '#4ECDC4',
    description: 'At ease and relaxed',
  },
  {
    state: 'stylish' as EmotionalState,
    label: 'Stylish',
    emoji: '✨',
    color: '#45B7D1',
    description: 'Fashion-forward and chic',
  },
  {
    state: 'powerful' as EmotionalState,
    label: 'Powerful',
    emoji: '👑',
    color: '#F7DC6F',
    description: 'Strong and commanding',
  },
  {
    state: 'creative' as EmotionalState,
    label: 'Creative',
    emoji: '🎨',
    color: '#BB8FCE',
    description: 'Artistic and expressive',
  },
  {
    state: 'elegant' as EmotionalState,
    label: 'Elegant',
    emoji: '🌹',
    color: '#F1948A',
    description: 'Graceful and refined',
  },
  {
    state: 'playful' as EmotionalState,
    label: 'Playful',
    emoji: '🦋',
    color: '#85C1E9',
    description: 'Fun and spirited',
  },
];

const INTENSITY_LABELS = [
  { value: 1, label: 'Barely' },
  { value: 2, label: 'Slightly' },
  { value: 3, label: 'Somewhat' },
  { value: 4, label: 'Quite' },
  { value: 5, label: 'Moderately' },
  { value: 6, label: 'Very' },
  { value: 7, label: 'Strongly' },
  { value: 8, label: 'Extremely' },
  { value: 9, label: 'Intensely' },
  { value: 10, label: 'Completely' },
];

export const EmotionalResponseStep: React.FC<EmotionalResponseStepProps> = ({
  emotionalResponse,
  onEmotionSelect,
  onIntensityChange,
}) => {
  const emotionAnimations = useRef(
    EMOTIONS.reduce(
      (acc, emotion) => {
        acc[emotion.state] = new Animated.Value(1);
        return acc;
      },
      {} as Record<EmotionalState, Animated.Value>,
    ),
  ).current;

  const intensityAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate selected emotion
    Object.entries(emotionAnimations).forEach(([state, anim]) => {
      if (state === emotionalResponse.primary) {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  }, [emotionalResponse.primary, emotionAnimations]);

  useEffect(() => {
    // Animate intensity change
    Animated.sequence([
      Animated.timing(intensityAnimation, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(intensityAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [emotionalResponse.intensity, intensityAnimation]);

  const handleEmotionPress = (emotion: EmotionalState) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEmotionSelect(emotion);
  };

  const handleIntensityPress = (intensity: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onIntensityChange(intensity);
  };

  const selectedEmotion = EMOTIONS.find((e) => e.state === emotionalResponse.primary);
  const selectedIntensityLabel = INTENSITY_LABELS.find(
    (i) => i.value === emotionalResponse.intensity,
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Primary Emotion Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Primary Emotion</Text>
        <View style={styles.emotionsGrid}>
          {EMOTIONS.map((emotion) => {
            const isSelected = emotion.state === emotionalResponse.primary;

            return (
              <TouchableOpacity
                key={emotion.state}
                onPress={() => handleEmotionPress(emotion.state)}
                style={styles.emotionButton}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={[
                    styles.emotionCard,
                    isSelected && [styles.emotionCardSelected, { borderColor: emotion.color }],
                    {
                      transform: [{ scale: emotionAnimations[emotion.state] }],
                    },
                  ]}
                >
                  <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                  <Text style={[styles.emotionLabel, isSelected && { color: emotion.color }]}>
                    {emotion.label}
                  </Text>
                  {isSelected && (
                    <Text style={styles.emotionDescription}>{emotion.description}</Text>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Intensity Slider */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          How {selectedIntensityLabel?.label.toLowerCase()} {selectedEmotion?.label.toLowerCase()}?
        </Text>

        <Animated.View
          style={[
            styles.intensityContainer,
            {
              transform: [{ scale: intensityAnimation }],
            },
          ]}
        >
          <View style={styles.intensitySlider}>
            {INTENSITY_LABELS.map((item) => {
              const isSelected = item.value === emotionalResponse.intensity;
              const progress = item.value / 10;

              return (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => handleIntensityPress(item.value)}
                  style={[
                    styles.intensityDot,
                    isSelected && styles.intensityDotSelected,
                    {
                      backgroundColor: isSelected
                        ? selectedEmotion?.color || DesignSystem.colors.accent.gold
                        : DesignSystem.colors.surface.primary,
                    },
                  ]}
                >
                  <View style={styles.intensityDotInner} />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.intensityLabels}>
            <Text style={styles.intensityLabelText}>Not at all</Text>
            <Text style={[styles.intensityLabelText, styles.intensityLabelCenter]}>
              {selectedIntensityLabel?.label}
            </Text>
            <Text style={styles.intensityLabelText}>Completely</Text>
          </View>
        </Animated.View>
      </View>

      {/* Selected Summary */}
      {selectedEmotion && (
        <View style={[styles.summaryContainer, { backgroundColor: selectedEmotion.color + '20' }]}>
          <Text style={styles.summaryEmoji}>{selectedEmotion.emoji}</Text>
          <Text style={[styles.summaryText, { color: selectedEmotion.color }]}>
            {selectedIntensityLabel?.label} {selectedEmotion.label.toLowerCase()}
          </Text>
          <Text style={styles.summaryDescription}>{`"${selectedEmotion.description}"`}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emotionButton: {
    minWidth: 140,
    width: '45%',
  },
  emotionCard: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.surface.primary,
    borderColor: 'transparent',
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  emotionCardSelected: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderWidth: 2,
  },
  emotionDescription: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emotionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  emotionLabel: {
    ...DesignSystem.typography.body.large,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  intensityContainer: {
    alignItems: 'center',
  },
  intensityDot: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  intensityDotInner: {
    backgroundColor: 'transparent',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  intensityDotSelected: {
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  intensityLabelCenter: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  intensityLabelText: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.tertiary,
  },
  intensityLabels: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
  },
  intensitySlider: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 20,
    width: '100%',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryContainer: {
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  summaryDescription: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  summaryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  summaryText: {
    ...DesignSystem.typography.heading.h3,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
});
