import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';

interface ConfidenceRatingStepProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const CONFIDENCE_LABELS = [
  { rating: 1, label: 'Not confident', emoji: '😔', description: 'I felt unsure about this outfit' },
  { rating: 2, label: 'Slightly confident', emoji: '😐', description: 'It was okay, but not my best' },
  { rating: 3, label: 'Moderately confident', emoji: '🙂', description: 'I felt good wearing this' },
  { rating: 4, label: 'Very confident', emoji: '😊', description: 'I felt great and stylish' },
  { rating: 5, label: 'Extremely confident', emoji: '🤩', description: 'I felt absolutely amazing!' },
];

export const ConfidenceRatingStep: React.FC<ConfidenceRatingStepProps> = ({
  rating,
  onRatingChange,
}) => {
  const starAnimations = useRef(Array.from({ length: 5 }, () => new Animated.Value(1))).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate stars when rating changes
    starAnimations.forEach((anim, index) => {
      if (index < rating) {
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
    if (rating > 0) {
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
  }, [rating]);

  const handleStarPress = (starRating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRatingChange(starRating);
  };

  const selectedLabel = CONFIDENCE_LABELS.find(label => label.rating === rating);

  return (
    <View style={styles.container}>
      {/* Star Rating */}
      <View style={styles.starsContainer}>
        {Array.from({ length: 5 }, (_, index) => {
          const starNumber = index + 1;
          const isSelected = starNumber <= rating;
          
          return (
            <TouchableOpacity
              key={starNumber}
              onPress={() => handleStarPress(starNumber)}
              style={styles.starButton}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.starWrapper,
                  {
                    transform: [{ scale: starAnimations[index] }],
                  },
                ]}
              >
                <Ionicons
                  name={isSelected ? 'star' : 'star-outline'}
                  size={40}
                  color={isSelected ? APP_THEME_V2.semantic.secondary : APP_THEME_V2.semantic.text.tertiary}
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Rating Feedback */}
      {rating > 0 && selectedLabel && (
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
      {rating >= 4 && (
        <View style={styles.affirmationContainer}>
          <Text style={styles.affirmationText}>
            {rating === 5 
              ? "You're absolutely radiant! ✨" 
              : "You're looking fantastic! 💫"
            }
          </Text>
        </View>
      )}

      {/* Encouragement for lower ratings */}
      {rating > 0 && rating <= 2 && (
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>
            Every outfit is a learning experience. Your style journey continues! 🌱
          </Text>
        </View>
      )}

      {/* Instructions */}
      {rating === 0 && (
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
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  starButton: {
    padding: 8,
  },
  starWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackContainer: {
    alignItems: 'center',
    backgroundColor: APP_THEME_V2.semantic.surface,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 24,
    minWidth: 280,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  ratingLabel: {
    ...APP_THEME_V2.typography.scale.h3,
    color: APP_THEME_V2.semantic.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  ratingDescription: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  affirmationContainer: {
    backgroundColor: APP_THEME_V2.semantic.accent + '20',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  affirmationText: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.accent,
    textAlign: 'center',
    fontWeight: '600',
  },
  encouragementContainer: {
    backgroundColor: APP_THEME_V2.semantic.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  encouragementText: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  instructionsContainer: {
    paddingHorizontal: 20,
  },
  instructionsText: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});