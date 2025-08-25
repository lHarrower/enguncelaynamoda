// Bento Box Gallery - Clean, Organized Grid Inspired by Spotify Design
// Dynamic presentation with generous whitespace and strict grid

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import {
  ColorValue,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// Animated bento item wrapper at module scope to comply with Rules of Hooks
interface AnimatedBentoItemProps {
  index: number;
  galleryAnimation: SharedValue<number>;
  children: React.ReactNode;
}

const AnimatedBentoItem: React.FC<AnimatedBentoItemProps> = ({
  index,
  galleryAnimation,
  children,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const delay = index * 0.05;
    const progress = Math.max(0, Math.min(1, galleryAnimation.value - delay));

    return {
      opacity: interpolate(progress, [0, 1], [0, 1]),
      transform: [
        {
          translateY: interpolate(progress, [0, 1], [20, 0]),
        },
        {
          scale: interpolate(progress, [0, 1], [0.98, 1]),
        },
      ] as any,
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

import { DesignSystem } from '@/theme/DesignSystem';
import { IoniconsName } from '@/types/icons';

const { width } = Dimensions.get('window');

type BentoItemContent =
  | { image: string; confidence?: number } // outfit type
  | { emoji: string; gradient?: readonly [ColorValue, ColorValue, ...ColorValue[]] } // mood type
  | { icon: IoniconsName; description: string } // insight type
  | { value: string; trend?: number } // metric type
  | { icon: IoniconsName; backgroundColor: string; value?: string } // action type
  | { image: string; overlay?: boolean }; // image type

export interface BentoItem {
  id: string;
  type: 'outfit' | 'mood' | 'insight' | 'metric' | 'action' | 'image';
  size: 'small' | 'medium' | 'large';
  span: 1 | 2; // Grid columns
  title: string;
  subtitle?: string;
  content: BentoItemContent;
  onPress?: () => void;
}

interface BentoBoxGalleryProps {
  items: BentoItem[];
  columns?: number;
  style?: ViewStyle;
}

const BentoBoxGallery: React.FC<BentoBoxGalleryProps> = ({ items, columns = 2, style }) => {
  // Animation for entrance
  const galleryAnimation = useSharedValue(0);

  useEffect(() => {
    // Fast, joyful entrance animation
    galleryAnimation.value = withSpring(1, DesignSystem.animations.spring.smooth);
  }, [galleryAnimation]);

  const getItemHeight = (size: string) => {
    switch (size) {
      case 'small':
        return 120;
      case 'medium':
        return 160;
      case 'large':
        return 200;
      default:
        return 160;
    }
  };

  const getItemWidth = (span: number) => {
    const spacing = DesignSystem.spacing.lg;
    const totalSpacing = (columns - 1) * spacing;
    const availableWidth = width - DesignSystem.spacing.xl * 2 - totalSpacing;
    return span === 2 ? availableWidth : availableWidth / columns;
  };

  // Render Outfit Card - Premium 2D cards
  const renderOutfitItem = (item: BentoItem, index: number) => {
    const outfitContent = item.content as { image: string; confidence?: number };
    return (
      <TouchableOpacity
        style={[
          styles.bentoItem,
          DesignSystem.components.card,
          {
            width: getItemWidth(item.span),
            height: getItemHeight(item.size),
          },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          item.onPress?.();
        }}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Outfit: ${item.title}`}
        accessibilityHint={`Tap to view details for ${item.title} outfit`}
      >
        <Image
          source={{ uri: outfitContent.image }}
          style={styles.outfitImage}
          resizeMode="cover"
        />
        <View style={styles.outfitContent}>
          <Text style={styles.outfitTitle}>{item.title}</Text>
          {item.subtitle && <Text style={styles.outfitSubtitle}>{item.subtitle}</Text>}
          {outfitContent.confidence && (
            <View style={styles.confidenceContainer}>
              <View style={styles.confidenceBar}>
                <View style={[styles.confidenceFill, { width: `${outfitContent.confidence}%` }]} />
              </View>
              <Text style={styles.confidenceText}>{outfitContent.confidence}% match</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render Mood Item - Colorful and joyful
  const renderMoodItem = (item: BentoItem, index: number) => {
    const moodContent = item.content as {
      emoji: string;
      gradient?: readonly [ColorValue, ColorValue, ...ColorValue[]];
    };
    return (
      <TouchableOpacity
        style={[
          styles.bentoItem,
          {
            width: getItemWidth(item.span),
            height: getItemHeight(item.size),
          },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          item.onPress?.();
        }}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Mood: ${item.title}`}
        accessibilityHint={`Tap to explore ${item.title} mood`}
      >
        <LinearGradient
          colors={
            (moodContent.gradient as any) ||
            ([DesignSystem.colors.sage[200], DesignSystem.colors.amber[200]] as const)
          }
          style={[styles.moodGradient, { borderRadius: DesignSystem.borderRadius.lg }]}
        >
          <View style={styles.moodContent}>
            <Text style={styles.moodEmoji}>{moodContent.emoji}</Text>
            <Text style={styles.moodTitle}>{item.title}</Text>
            {item.subtitle && <Text style={styles.moodSubtitle}>{item.subtitle}</Text>}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Render Insight Item - Clean information display
  const renderInsightItem = (item: BentoItem, index: number) => {
    const insightContent = item.content as { icon: string; description: string };
    return (
      <TouchableOpacity
        style={[
          styles.bentoItem,
          {
            backgroundColor: DesignSystem.colors.background.elevated,
            ...DesignSystem.elevation.medium,
            width: getItemWidth(item.span),
            height: getItemHeight(item.size),
          },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          item.onPress?.();
        }}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Insight: ${item.title}`}
        accessibilityHint={`Tap to view details about ${item.title}`}
      >
        <View style={styles.insightContent}>
          {insightContent.icon && (
            <View style={styles.insightIcon}>
              <Ionicons
                name={insightContent.icon as IoniconsName}
                size={24}
                color={DesignSystem.colors.sage[500]}
              />
            </View>
          )}
          <Text style={styles.insightTitle}>{item.title}</Text>
          {item.subtitle && <Text style={styles.insightSubtitle}>{item.subtitle}</Text>}
          {insightContent.description && (
            <Text style={styles.insightDescription}>{insightContent.description}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render Metric Item - Data visualization
  const renderMetricItem = (item: BentoItem, index: number) => {
    const metricContent = item.content as { value: string; trend?: number };
    return (
      <TouchableOpacity
        style={[
          styles.bentoItem,
          {
            backgroundColor: DesignSystem.colors.background.elevated,
            ...DesignSystem.elevation.medium,
            width: getItemWidth(item.span),
            height: getItemHeight(item.size),
          },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          item.onPress?.();
        }}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Metric: ${item.title} - ${metricContent.value}`}
        accessibilityHint={`Tap to view detailed metrics for ${item.title}`}
      >
        <View style={styles.metricContent}>
          <Text style={styles.metricValue}>{metricContent.value}</Text>
          <Text style={styles.metricLabel}>{item.title}</Text>
          {metricContent.trend && (
            <View style={styles.metricTrend}>
              <Ionicons
                name={metricContent.trend > 0 ? 'trending-up' : 'trending-down'}
                size={16}
                color={
                  metricContent.trend > 0
                    ? DesignSystem.colors.success[500]
                    : DesignSystem.colors.error[500]
                }
              />
              <Text style={styles.metricTrendText}>{Math.abs(metricContent.trend)}%</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render Action Item - Call-to-action buttons
  const renderActionItem = (item: BentoItem, index: number) => {
    const actionContent = item.content as { icon: IoniconsName; backgroundColor: string };
    return (
      <TouchableOpacity
        style={[
          styles.bentoItem,
          {
            width: getItemWidth(item.span),
            height: getItemHeight(item.size),
            backgroundColor: DesignSystem.colors.sage[500],
            ...DesignSystem.elevation.medium,
          },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          item.onPress?.();
        }}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Action: ${item.title}`}
        accessibilityHint={`Tap to ${item.title.toLowerCase()}`}
      >
        <View style={styles.actionContent}>
          {actionContent.icon && (
            <Ionicons
              name={actionContent.icon as IoniconsName}
              size={28}
              color={DesignSystem.colors.text.inverse}
              style={styles.actionIcon}
            />
          )}
          <Text style={styles.actionTitle}>{item.title}</Text>
          {item.subtitle && <Text style={styles.actionSubtitle}>{item.subtitle}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  // Render Image Item - Clean image display
  const renderImageItem = (item: BentoItem, index: number) => {
    const imageContent = item.content as { image: string; overlay?: boolean };
    return (
      <TouchableOpacity
        style={[
          styles.bentoItem,
          {
            width: getItemWidth(item.span),
            height: getItemHeight(item.size),
          },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          item.onPress?.();
        }}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Image: ${item.title || 'Gallery item'}`}
        accessibilityHint={`Tap to view ${item.title || 'this image'} in detail`}
      >
        <Image
          source={{ uri: imageContent.image }}
          style={[styles.imageContent, { borderRadius: DesignSystem.borderRadius.lg }]}
          resizeMode="cover"
        />
        {(item.title || item.subtitle) && (
          <View style={styles.imageOverlay}>
            {item.title && <Text style={styles.imageTitle}>{item.title}</Text>}
            {item.subtitle && <Text style={styles.imageSubtitle}>{item.subtitle}</Text>}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderItem = (item: BentoItem, index: number) => {
    // Use top-level AnimatedBentoItem to comply with hooks rules
    let itemComponent;
    switch (item.type) {
      case 'outfit':
        itemComponent = renderOutfitItem(item, index);
        break;
      case 'mood':
        itemComponent = renderMoodItem(item, index);
        break;
      case 'insight':
        itemComponent = renderInsightItem(item, index);
        break;
      case 'metric':
        itemComponent = renderMetricItem(item, index);
        break;
      case 'action':
        itemComponent = renderActionItem(item, index);
        break;
      case 'image':
        itemComponent = renderImageItem(item, index);
        break;
      default:
        itemComponent = renderInsightItem(item, index);
    }

    return (
      <AnimatedBentoItem index={index} galleryAnimation={galleryAnimation} key={item.id}>
        {itemComponent}
      </AnimatedBentoItem>
    );
  };

  const arrangeItems = () => {
    const rows: BentoItem[][] = [];
    let currentRow: BentoItem[] = [];
    let currentRowSpan = 0;

    items.forEach((item) => {
      if (currentRowSpan + item.span > columns) {
        rows.push(currentRow);
        currentRow = [item];
        currentRowSpan = item.span;
      } else {
        currentRow.push(item);
        currentRowSpan += item.span;
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  };

  const rows = arrangeItems();

  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item, itemIndex) => renderItem(item, rowIndex * columns + itemIndex))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  contentContainer: {
    padding: DesignSystem.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
  },
  bentoItem: {
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
  },

  // Outfit Item Styles
  outfitImage: {
    borderTopLeftRadius: DesignSystem.borderRadius.lg,
    borderTopRightRadius: DesignSystem.borderRadius.lg,
    height: '60%',
    width: '100%',
  },
  outfitContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.md,
  },
  outfitTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
  },
  outfitSubtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 8,
  },
  confidenceContainer: {
    marginTop: 'auto',
  },
  confidenceBar: {
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderRadius: 2,
    height: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: 2,
    height: '100%',
  },
  confidenceText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
  },

  // Mood Item Styles
  moodGradient: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  moodContent: {
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  moodSubtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },

  // Insight Item Styles
  insightContent: {
    flex: 1,
    padding: DesignSystem.spacing.md,
  },
  insightIcon: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.sage[100],
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginBottom: 12,
    width: 40,
  },
  insightTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
  },
  insightSubtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 8,
  },
  insightDescription: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    lineHeight: 18,
  },

  // Metric Item Styles
  metricContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: DesignSystem.spacing.md,
  },
  metricValue: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.sage[500],
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  metricTrend: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  metricTrendText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    marginLeft: 4,
  },

  // Action Item Styles
  actionContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: DesignSystem.spacing.md,
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.inverse,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
  },

  // Image Item Styles
  imageContent: {
    height: '100%',
    width: '100%',
  },
  imageOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderBottomLeftRadius: DesignSystem.borderRadius.lg,
    borderBottomRightRadius: DesignSystem.borderRadius.lg,
    bottom: 0,
    left: 0,
    padding: DesignSystem.spacing.md,
    position: 'absolute',
    right: 0,
  },
  imageTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.inverse,
    marginBottom: 2,
  },
  imageSubtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    opacity: 0.9,
  },
});

export default BentoBoxGallery;
