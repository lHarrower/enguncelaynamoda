import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { WeeklyColorStory } from '@/data/editorialContent';
import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.8;

interface WeeklyColorCardProps {
  story: WeeklyColorStory;
  onPress?: () => void;
}

export const WeeklyColorCard: React.FC<WeeklyColorCardProps> = ({ story, onPress }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    opacity.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withSpring(1);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: story.image }} style={styles.image} />
          <View style={styles.overlay} />
          <View style={styles.colorSwatch}>
            <View style={[styles.colorCircle, { backgroundColor: story.color }]} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>{story.subtitle}</Text>
          <Text style={styles.title}>{story.title}</Text>
          <Text style={styles.colorName}>{story.colorName}</Text>
          <Text style={styles.description}>{story.description}</Text>

          <View style={styles.moodContainer}>
            <Text style={styles.moodLabel}>Mood</Text>
            <Text style={styles.mood}>{story.mood}</Text>
          </View>

          <View style={styles.stylingContainer}>
            <Text style={styles.stylingLabel}>Styling Tips</Text>
            {story.styling.map((tip, index) => (
              <Text key={index} style={styles.stylingTip}>
                • {tip}
              </Text>
            ))}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  colorCircle: {
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  colorName: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.sage[500],
    marginBottom: 12,
  },
  colorSwatch: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.radius.full,
    padding: 8,
    position: 'absolute',
    right: 16,
    top: 16,
    ...DesignSystem.elevation.soft,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
    width: cardWidth,
    ...DesignSystem.elevation.soft,
    marginBottom: DesignSystem.spacing.lg,
  },
  content: {
    padding: DesignSystem.spacing.lg,
  },
  description: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 20,
  },
  image: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  mood: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.gold[500],
  },
  moodContainer: {
    marginBottom: 16,
  },
  moodLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.primary,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  stylingContainer: {
    marginTop: 8,
  },
  stylingLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.primary,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  stylingTip: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 4,
  },
  subtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: 8,
  },
});
