import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { DesignSystem } from '@/theme/DesignSystem';
import { WeeklyColorStory } from '@/data/editorialContent';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.8;

interface WeeklyColorCardProps {
  story: WeeklyColorStory;
  onPress?: () => void;
}

export const WeeklyColorCard: React.FC<WeeklyColorCardProps> = ({
  story,
  onPress,
}) => {
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
            <View
              style={[styles.colorCircle, { backgroundColor: story.color }]}
            />
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
  container: {
    width: cardWidth,
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
    ...DesignSystem.elevation.soft,
    marginBottom: DesignSystem.spacing.lg,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  colorSwatch: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.radius.full,
    padding: 8,
    ...DesignSystem.elevation.soft,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  content: {
    padding: DesignSystem.spacing.lg,
  },
  subtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: 8,
  },
  colorName: {
  ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.sage[500],
    marginBottom: 12,
  },
  description: {
  ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 20,
  },
  moodContainer: {
    marginBottom: 16,
  },
  moodLabel: {
    ...DesignSystem.typography.scale.caption,
    fontWeight: '500',
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mood: {
  ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.gold[500],
  },
  stylingContainer: {
    marginTop: 8,
  },
  stylingLabel: {
    ...DesignSystem.typography.scale.caption,
    fontWeight: '500',
    color: DesignSystem.colors.text.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stylingTip: {
  ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 4,
  },
});