import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

interface ConfidenceRatingStepProps {
  rating?: number; // keep backward compat
  currentRating?: number; // some tests use currentRating
  onRatingChange: (rating: number) => void;
}

const CONFIDENCE_LABELS = [
  {
    rating: 1,
    label: 'Not confident',
    emoji: '😔',
    description: 'I felt unsure about this outfit',
  },
  {
    rating: 2,
    label: 'Slightly confident',
    emoji: '😐',
    description: 'It was okay, but not my best',
  },
  {
    rating: 3,
    label: 'Moderately confident',
    emoji: '🙂',
    description: 'I felt good wearing this',
  },
  { rating: 4, label: 'Very confident', emoji: '😊', description: 'I felt great and stylish' },
  {
    rating: 5,
    label: 'Extremely confident',
    emoji: '🤩',
    description: 'I felt absolutely amazing!',
  },
];

export const ConfidenceRatingStep: React.FC<ConfidenceRatingStepProps> = ({
  rating,
  currentRating,
  onRatingChange,
}) => {
  const effectiveRating = typeof rating === 'number' ? rating : currentRating || 0;
  const starAnimations = useRef(Array.from({ length: 5 }, () => new Animated.Value(1))).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate stars when rating changes
    starAnimations.forEach((anim, index) => {
      if (index < effectiveRating) {
        Animated.spring(anim, {
          toValue: 1.2,
          useNativeDriver: true,
          tension: 150,
          friction: 4,
        }).start(() => {
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 4,
          }).start();
        });
      }
    });

    // Pulse animation for selected rating
    if (effectiveRating > 0) {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [effectiveRating, pulseAnimation, starAnimations]);

  const handleStarPress = (starRating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRatingChange(starRating);
  };

  const selectedLabel = CONFIDENCE_LABELS.find((label) => label.rating === effectiveRating);

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel="Confidence rating"
      accessibilityRole="adjustable"
      accessibilityValue={{ min: 0, max: 5, now: effectiveRating }}
      accessibilityActions={[
        { name: 'increment', label: 'Increase rating' },
        { name: 'decrement', label: 'Decrease rating' },
      ]}
      onAccessibilityAction={(event) => {
        switch (event.nativeEvent.actionName) {
          case 'increment':
            onRatingChange(Math.min(5, (effectiveRating || 0) + 1));
            break;
          case 'decrement':
            onRatingChange(Math.max(0, (effectiveRating || 0) - 1));
            break;
        }
      }}
    >
      {/* Star Rating */}
      <View style={styles.starsContainer}>
        {Array.from({ length: 5 }, (_, index) => {
          const starNumber = index + 1;
          const isSelected = starNumber <= effectiveRating;

          return (
            <TouchableOpacity
              key={starNumber}
              onPress={() => handleStarPress(starNumber)}
              style={styles.starButton}
              activeOpacity={0.7}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`${starNumber} out of 5 stars${isSelected ? ', selected' : ''}`}
            >
              <Animated.View
                style={[
                  styles.starWrapper,
                  starAnimations[index] && {
                    transform: [{ scale: starAnimations[index] }],
                  },
                ]}
              >
                <Ionicons
                  name={isSelected ? 'star' : 'star-outline'}
                  size={40}
                  color={
                    isSelected
                      ? DesignSystem.colors.sage?.[500] || DesignSystem.colors.neutral[700]
                      : DesignSystem.colors.neutral[400]
                  }
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Rating Feedback */}
      {effectiveRating > 0 && selectedLabel && (
        <Animated.View
          style={[
            styles.feedbackContainer,
            {
              transform: [{ scale: pulseAnimation }],
            },
          ]}
        >
          <Text style={styles.emoji}>{selectedLabel.emoji}</Text>
          <Text style={styles.ratingLabel}>{selectedLabel.label}</Text>
          <Text style={styles.ratingDescription}>{selectedLabel.description}</Text>
        </Animated.View>
      )}

      {/* Confidence Affirmations */}
      {effectiveRating >= 4 && (
        <View style={styles.affirmationContainer}>
          <Text style={styles.affirmationText}>
            {effectiveRating === 5
              ? "You're absolutely radiant! ✨"
              : "You're looking fantastic! 💫"}
          </Text>
        </View>
      )}

      {/* Encouragement for lower ratings */}
      {effectiveRating > 0 && effectiveRating <= 2 && (
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>
            Every outfit is a learning experience. Your style journey continues! 🌱
          </Text>
        </View>
      )}

      {/* Instructions */}
      {effectiveRating === 0 && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Tap the stars to rate how confident you felt in this outfit
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  affirmationContainer: {
    backgroundColor: DesignSystem.colors.primary[500] + '20',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  affirmationText: {
    ...DesignSystem.typography.body1,
    color: DesignSystem.colors.primary[500],
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  encouragementContainer: {
    backgroundColor: DesignSystem.colors.neutral[50],
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  encouragementText: {
    ...DesignSystem.typography.body2,
    color: DesignSystem.colors.neutral[600],
    fontStyle: 'italic',
    textAlign: 'center',
  },
  feedbackContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.neutral[50],
    borderRadius: 16,
    marginBottom: 24,
    minWidth: 280,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
  },
  instructionsText: {
    ...DesignSystem.typography.body2,
    color: DesignSystem.colors.neutral[400],
    fontStyle: 'italic',
    textAlign: 'center',
  },
  ratingDescription: {
    ...DesignSystem.typography.body2,
    color: DesignSystem.colors.neutral[600],
    fontStyle: 'italic',
    textAlign: 'center',
  },
  ratingLabel: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.neutral[900],
    marginBottom: 4,
    textAlign: 'center',
  },
  starButton: {
    padding: 8,
  },
  starWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 32,
  },
});
