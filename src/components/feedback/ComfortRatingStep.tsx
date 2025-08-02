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
import { DesignSystem } from '@/theme/DesignSystem';
import { ComfortRating } from '../../types/aynaMirror';

interface ComfortRatingStepProps {
  comfort: ComfortRating;
  onComfortRating: (type: keyof ComfortRating, rating: number) => void;
}

const COMFORT_CATEGORIES = [
  {
    key: 'physical' as keyof ComfortRating,
    title: 'Physical Comfort',
    subtitle: 'How did the clothes feel on your body?',
    icon: 'body-outline',
    color: '#4ECDC4',
    descriptions: [
      'Very uncomfortable',
      'Somewhat uncomfortable', 
      'Neutral',
      'Quite comfortable',
      'Extremely comfortable',
    ],
  },
  {
    key: 'emotional' as keyof ComfortRating,
    title: 'Emotional Comfort',
    subtitle: 'How at ease did you feel emotionally?',
    icon: 'heart-outline',
    color: '#FF6B6B',
    descriptions: [
      'Very anxious',
      'Somewhat anxious',
      'Neutral',
      'Quite at ease',
      'Completely at ease',
    ],
  },
  {
    key: 'confidence' as keyof ComfortRating,
    title: 'Confidence Level',
    subtitle: 'How confident did you feel in this outfit?',
    icon: 'star-outline',
    color: '#F7DC6F',
    descriptions: [
      'Not confident at all',
      'Slightly confident',
      'Moderately confident',
      'Very confident',
      'Extremely confident',
    ],
  },
];

export const ComfortRatingStep: React.FC<ComfortRatingStepProps> = ({
  comfort,
  onComfortRating,
}) => {
  const categoryAnimations = useRef(
    COMFORT_CATEGORIES.reduce((acc, category) => {
      acc[category.key] = new Animated.Value(1);
      return acc;
    }, {} as Record<keyof ComfortRating, Animated.Value>)
  ).current;

  useEffect(() => {
    // Animate when ratings change
    Object.entries(comfort).forEach(([key, rating]) => {
      if (rating > 0 && categoryAnimations[key as keyof ComfortRating]) {
        Animated.sequence([
          Animated.timing(categoryAnimations[key as keyof ComfortRating], {
            toValue: 1.05,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(categoryAnimations[key as keyof ComfortRating], {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  }, [comfort]);

  const handleRatingPress = (category: keyof ComfortRating, rating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComfortRating(category, rating);
  };

  const renderStarRating = (category: keyof ComfortRating, currentRating: number, color: string) => {
    return (
      <View style={styles.starsContainer}>
        {Array.from({ length: 5 }, (_, index) => {
          const starNumber = index + 1;
          const isSelected = starNumber <= currentRating;
          
          return (
            <TouchableOpacity
              key={starNumber}
              onPress={() => handleRatingPress(category, starNumber)}
              style={styles.starButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isSelected ? 'star' : 'star-outline'}
                size={28}
                color={isSelected ? color : DesignSystem.colors.neutral[400]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const getOverallComfortLevel = () => {
    const total = comfort.physical + comfort.emotional + comfort.confidence;
    const average = total / 3;
    
    if (average === 0) return null;
    if (average <= 2) return { level: 'Needs improvement', emoji: '😔', color: '#FF6B6B' };
    if (average <= 3) return { level: 'Getting there', emoji: '😐', color: '#F7DC6F' };
    if (average <= 4) return { level: 'Feeling good', emoji: '😊', color: '#4ECDC4' };
    return { level: 'Amazing!', emoji: '🤩', color: '#45B7D1' };
  };

  const overallComfort = getOverallComfortLevel();

  return (
    <View style={styles.container}>
      {COMFORT_CATEGORIES.map((category) => {
        const currentRating = comfort[category.key];
        const description = currentRating > 0 ? category.descriptions[currentRating - 1] : '';
        
        return (
          <Animated.View
            key={category.key}
            style={[
              styles.categoryContainer,
              {
                transform: [{ scale: categoryAnimations[category.key] }],
              },
            ]}
          >
            <View style={styles.categoryHeader}>
              <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                <Ionicons name={category.icon as any} size={24} color={category.color} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
              </View>
            </View>

            {renderStarRating(category.key, currentRating, category.color)}

            {currentRating > 0 && (
              <View style={[styles.descriptionContainer, { backgroundColor: category.color + '10' }]}>
                <Text style={[styles.descriptionText, { color: category.color }]}>
                  {description}
                </Text>
              </View>
            )}
          </Animated.View>
        );
      })}

      {/* Overall Comfort Summary */}
      {overallComfort && (
        <View style={[styles.overallContainer, { backgroundColor: overallComfort.color + '20' }]}>
          <Text style={styles.overallEmoji}>{overallComfort.emoji}</Text>
          <Text style={[styles.overallTitle, { color: overallComfort.color }]}>
            Overall: {overallComfort.level}
          </Text>
          <Text style={styles.overallSubtitle}>
            Based on your comfort ratings across all categories
          </Text>
        </View>
      )}

      {/* Instructions */}
      {Object.values(comfort).every(rating => rating === 0) && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Rate each aspect of comfort by tapping the stars
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  categoryContainer: {
    backgroundColor: DesignSystem.colors.neutral[50],
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    ...DesignSystem.typography.scale.body1,
    color: DesignSystem.colors.neutral[900],
    fontWeight: '600',
    marginBottom: 2,
  },
  categorySubtitle: {
    ...DesignSystem.typography.scale.body2,
    color: DesignSystem.colors.neutral[600],
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  starButton: {
    padding: 8,
  },
  descriptionContainer: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  descriptionText: {
    ...DesignSystem.typography.scale.body2,
    fontWeight: '500',
    textAlign: 'center',
  },
  overallContainer: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  overallEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  overallTitle: {
    ...DesignSystem.typography.scale.h3,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  overallSubtitle: {
    ...DesignSystem.typography.scale.body2,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  instructionsText: {
    ...DesignSystem.typography.scale.body2,
    color: DesignSystem.colors.neutral[400],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});