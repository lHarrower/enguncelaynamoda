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
import { EDITORIAL_THEME } from '../../constants/EditorialTheme';
import { EditorialStory } from '../../data/editorialContent';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.8;

interface EditorialStoryCardProps {
  story: EditorialStory;
  onPress?: () => void;
}

const getCategoryColor = (category: EditorialStory['category']) => {
  switch (category) {
    case 'trend':
      return EDITORIAL_THEME.colors.lilac[500];
    case 'styling':
      return EDITORIAL_THEME.colors.gold[500];
    case 'interview':
      return EDITORIAL_THEME.colors.grey[600];
    case 'guide':
      return EDITORIAL_THEME.colors.lilac[600];
    default:
      return EDITORIAL_THEME.colors.grey[500];
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
    backgroundColor: EDITORIAL_THEME.colors.white,
    borderRadius: EDITORIAL_THEME.borderRadius.lg,
    overflow: 'hidden',
    ...EDITORIAL_THEME.shadows.soft,
    marginBottom: EDITORIAL_THEME.spacing.md,
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
    backgroundColor: EDITORIAL_THEME.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: EDITORIAL_THEME.borderRadius.full,
    ...EDITORIAL_THEME.shadows.soft,
  },
  categoryText: {
    fontSize: EDITORIAL_THEME.typography.sans.sizes.xs,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  content: {
    padding: EDITORIAL_THEME.spacing.lg,
  },
  subtitle: {
    fontSize: EDITORIAL_THEME.typography.sans.sizes.sm,
    fontFamily: EDITORIAL_THEME.typography.sans.family,
    color: EDITORIAL_THEME.colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: EDITORIAL_THEME.typography.serif.sizes['2xl'],
    fontFamily: EDITORIAL_THEME.typography.serif.family,
    color: EDITORIAL_THEME.colors.text.primary,
    marginBottom: 12,
    lineHeight: 32,
  },
  excerpt: {
    fontSize: EDITORIAL_THEME.typography.sans.sizes.base,
    fontFamily: EDITORIAL_THEME.typography.sans.family,
    color: EDITORIAL_THEME.colors.text.secondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: EDITORIAL_THEME.typography.sans.sizes.sm,
    fontFamily: 'Inter_500Medium',
    color: EDITORIAL_THEME.colors.text.primary,
  },
  readTime: {
    fontSize: EDITORIAL_THEME.typography.sans.sizes.sm,
    fontFamily: EDITORIAL_THEME.typography.sans.family,
    color: EDITORIAL_THEME.colors.text.muted,
  },
});