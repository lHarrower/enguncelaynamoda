import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { EditorialStory } from '@/data/editorialContent';
import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.8;

interface EditorialStoryCardProps {
  story: EditorialStory;
  onPress?: () => void;
}

const getCategoryColor = (category: EditorialStory['category']) => {
  switch (category) {
    case 'trend':
      return DesignSystem.colors.sage[500];
    case 'styling':
      return DesignSystem.colors.gold[500];
    case 'interview':
      return DesignSystem.colors.neutral[600];
    case 'guide':
      return DesignSystem.colors.sage[600];
    default:
      return DesignSystem.colors.neutral[500];
  }
};

export const EditorialStoryCard: React.FC<EditorialStoryCardProps> = ({ story, onPress }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateY: translateY.value }] as any,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    translateY.value = withSpring(-4);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    translateY.value = withSpring(0);
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
          <View style={styles.categoryBadge}>
            <Text style={[styles.categoryText, { color: getCategoryColor(story.category) }]}>
              {story.category.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>{story.subtitle}</Text>
          <Text style={styles.title}>{story.title}</Text>
          <Text style={styles.excerpt}>{story.excerpt}</Text>

          <View style={styles.meta}>
            <Text style={styles.author}>By {story.author}</Text>
            <Text style={styles.readTime}>{story.readTime}</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  author: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.primary,
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.radius.full,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    top: 12,
    ...DesignSystem.elevation.soft,
  },
  categoryText: {
    ...DesignSystem.typography.scale.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
    width: cardWidth,
    ...DesignSystem.elevation.soft,
    marginBottom: DesignSystem.spacing.md,
  },
  content: {
    padding: DesignSystem.spacing.lg,
  },
  excerpt: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  image: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  readTime: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.tertiary,
  },
  subtitle: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.text.primary,
    lineHeight: 32,
    marginBottom: 12,
  },
});
