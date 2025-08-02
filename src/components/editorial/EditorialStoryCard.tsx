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
import { EditorialStory } from '@/data/editorialContent';

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

export const EditorialStoryCard: React.FC<EditorialStoryCardProps> = ({
  story,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
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
            <Text
              style={[
                styles.categoryText,
                { color: getCategoryColor(story.category) },
              ]}
            >
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
  container: {
    width: cardWidth,
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
    ...DesignSystem.elevation.soft,
    marginBottom: DesignSystem.spacing.md,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
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
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: DesignSystem.colors.background.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DesignSystem.radius.full,
    ...DesignSystem.elevation.soft,
  },
  categoryText: {
    ...DesignSystem.typography.scale.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  content: {
    padding: DesignSystem.spacing.lg,
  },
  subtitle: {
    ...DesignSystem.typography.scale.body2,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: 12,
    lineHeight: 32,
  },
  excerpt: {
    ...DesignSystem.typography.scale.body1,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    ...DesignSystem.typography.scale.body2,
    fontWeight: '500',
    color: DesignSystem.colors.text.primary,
  },
  readTime: {
    ...DesignSystem.typography.scale.body2,
    color: DesignSystem.colors.text.tertiary,
  },
});