// Bento Box Gallery - Clean, Organized Grid Inspired by Spotify Design
// Dynamic presentation with generous whitespace and strict grid

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { STUDIO_THEME } from '../../constants/StudioTheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface BentoItem {
  id: string;
  type: 'outfit' | 'mood' | 'insight' | 'metric' | 'action' | 'image';
  size: 'small' | 'medium' | 'large';
  span: 1 | 2; // Grid columns
  title: string;
  subtitle?: string;
  content: any;
  onPress?: () => void;
}

interface BentoBoxGalleryProps {
  items: BentoItem[];
  columns?: number;
  style?: any;
}

const BentoBoxGallery: React.FC<BentoBoxGalleryProps> = ({
  items,
  columns = 2,
  style,
}) => {
  // Animation for entrance
  const galleryAnimation = useSharedValue(0);

  useEffect(() => {
    // Fast, joyful entrance animation
    galleryAnimation.value = withSpring(1, STUDIO_THEME.animations.entrance);
  }, []);

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
    const spacing = STUDIO_THEME.spacing.lg;
    const totalSpacing = (columns - 1) * spacing;
    const availableWidth = width - (STUDIO_THEME.spacing.xl * 2) - totalSpacing;
    return span === 2 ? availableWidth : availableWidth / columns;
  };

  // Render Outfit Card - Premium 2D cards
  const renderOutfitItem = (item: BentoItem, index: number) => (
    <TouchableOpacity
      style={[
        styles.bentoItem,
        STUDIO_THEME.components.outfitCard,
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
    >
      <Image
        source={{ uri: item.content.image }}
        style={styles.outfitImage}
        resizeMode="cover"
      />
      <View style={styles.outfitContent}>
        <Text style={styles.outfitTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.outfitSubtitle}>{item.subtitle}</Text>
        )}
        {item.content.confidence && (
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { width: `${item.content.confidence}%` }
                ]} 
              />
            </View>
            <Text style={styles.confidenceText}>
              {item.content.confidence}% match
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render Mood Item - Colorful and joyful
  const renderMoodItem = (item: BentoItem, index: number) => (
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
    >
      <LinearGradient
        colors={item.content.gradient || [
          STUDIO_THEME.colors.accent.jadeLight,
          STUDIO_THEME.colors.accent.goldLight,
        ]}
        style={[styles.moodGradient, { borderRadius: STUDIO_THEME.radius.lg }]}
      >
        <View style={styles.moodContent}>
          <Text style={styles.moodEmoji}>{item.content.emoji}</Text>
          <Text style={styles.moodTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.moodSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Render Insight Item - Clean information display
  const renderInsightItem = (item: BentoItem, index: number) => (
    <TouchableOpacity
      style={[
        styles.bentoItem,
        STUDIO_THEME.components.bentoItem,
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
    >
      <View style={styles.insightContent}>
        {item.content.icon && (
          <View style={styles.insightIcon}>
            <Ionicons
              name={item.content.icon}
              size={24}
              color={STUDIO_THEME.colors.accent.jade}
            />
          </View>
        )}
        <Text style={styles.insightTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.insightSubtitle}>{item.subtitle}</Text>
        )}
        {item.content.description && (
          <Text style={styles.insightDescription}>{item.content.description}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render Metric Item - Data visualization
  const renderMetricItem = (item: BentoItem, index: number) => (
    <TouchableOpacity
      style={[
        styles.bentoItem,
        STUDIO_THEME.components.bentoItem,
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
    >
      <View style={styles.metricContent}>
        <Text style={styles.metricValue}>{item.content.value}</Text>
        <Text style={styles.metricLabel}>{item.title}</Text>
        {item.content.trend && (
          <View style={styles.metricTrend}>
            <Ionicons
              name={item.content.trend > 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={
                item.content.trend > 0
                  ? STUDIO_THEME.colors.semantic.success
                  : STUDIO_THEME.colors.semantic.error
              }
            />
            <Text style={styles.metricTrendText}>
              {Math.abs(item.content.trend)}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render Action Item - Call-to-action buttons
  const renderActionItem = (item: BentoItem, index: number) => (
    <TouchableOpacity
      style={[
        styles.bentoItem,
        {
          width: getItemWidth(item.span),
          height: getItemHeight(item.size),
          backgroundColor: STUDIO_THEME.colors.accent.jade,
          ...STUDIO_THEME.shadows.medium,
        },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        item.onPress?.();
      }}
      activeOpacity={0.9}
    >
      <View style={styles.actionContent}>
        {item.content.icon && (
          <Ionicons
            name={item.content.icon}
            size={28}
            color={STUDIO_THEME.colors.text.inverse}
            style={styles.actionIcon}
          />
        )}
        <Text style={styles.actionTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render Image Item - Clean image display
  const renderImageItem = (item: BentoItem, index: number) => (
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
    >
      <Image
        source={{ uri: item.content.image }}
        style={[styles.imageContent, { borderRadius: STUDIO_THEME.radius.lg }]}
        resizeMode="cover"
      />
      {(item.title || item.subtitle) && (
        <View style={styles.imageOverlay}>
          {item.title && (
            <Text style={styles.imageTitle}>{item.title}</Text>
          )}
          {item.subtitle && (
            <Text style={styles.imageSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderItem = (item: BentoItem, index: number) => {
    const animatedStyle = useAnimatedStyle(() => {
      const delay = index * 0.05; // Faster stagger for joyful feel
      const progress = Math.max(0, Math.min(1, galleryAnimation.value - delay));
      
      return {
        opacity: interpolate(progress, [0, 1], [0, 1]),
        transform: [
          { 
            translateY: interpolate(progress, [0, 1], [20, 0]) 
          },
          { 
            scale: interpolate(progress, [0, 1], [0.98, 1]) 
          },
        ],
      };
    });

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
      <Animated.View key={item.id} style={animatedStyle}>
        {itemComponent}
      </Animated.View>
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
    flex: 1,
    backgroundColor: STUDIO_THEME.colors.foundation.primary,
  },
  contentContainer: {
    padding: STUDIO_THEME.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    marginBottom: STUDIO_THEME.spacing.lg,
    gap: STUDIO_THEME.spacing.lg,
  },
  bentoItem: {
    borderRadius: STUDIO_THEME.radius.lg,
    overflow: 'hidden',
  },
  
  // Outfit Item Styles
  outfitImage: {
    width: '100%',
    height: '60%',
    borderTopLeftRadius: STUDIO_THEME.radius.lg,
    borderTopRightRadius: STUDIO_THEME.radius.lg,
  },
  outfitContent: {
    flex: 1,
    padding: STUDIO_THEME.spacing.md,
    justifyContent: 'space-between',
  },
  outfitTitle: {
    ...STUDIO_THEME.typography.scale.bodyMedium,
    color: STUDIO_THEME.colors.text.primary,
    marginBottom: 4,
  },
  outfitSubtitle: {
    ...STUDIO_THEME.typography.scale.small,
    color: STUDIO_THEME.colors.text.secondary,
    marginBottom: 8,
  },
  confidenceContainer: {
    marginTop: 'auto',
  },
  confidenceBar: {
    height: 3,
    backgroundColor: STUDIO_THEME.colors.foundation.tertiary,
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: STUDIO_THEME.colors.accent.jade,
    borderRadius: 2,
  },
  confidenceText: {
    ...STUDIO_THEME.typography.scale.caption,
    color: STUDIO_THEME.colors.text.tertiary,
  },
  
  // Mood Item Styles
  moodGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodContent: {
    alignItems: 'center',
    padding: STUDIO_THEME.spacing.md,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodTitle: {
    ...STUDIO_THEME.typography.scale.bodyMedium,
    color: STUDIO_THEME.colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  moodSubtitle: {
    ...STUDIO_THEME.typography.scale.small,
    color: STUDIO_THEME.colors.text.secondary,
    textAlign: 'center',
  },
  
  // Insight Item Styles
  insightContent: {
    flex: 1,
    padding: STUDIO_THEME.spacing.md,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: STUDIO_THEME.colors.accent.jadeGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    ...STUDIO_THEME.typography.scale.bodyMedium,
    color: STUDIO_THEME.colors.text.primary,
    marginBottom: 4,
  },
  insightSubtitle: {
    ...STUDIO_THEME.typography.scale.small,
    color: STUDIO_THEME.colors.text.secondary,
    marginBottom: 8,
  },
  insightDescription: {
    ...STUDIO_THEME.typography.scale.small,
    color: STUDIO_THEME.colors.text.tertiary,
    lineHeight: 18,
  },
  
  // Metric Item Styles
  metricContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: STUDIO_THEME.spacing.md,
  },
  metricValue: {
    ...STUDIO_THEME.typography.scale.hero,
    color: STUDIO_THEME.colors.accent.jade,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    ...STUDIO_THEME.typography.scale.small,
    color: STUDIO_THEME.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricTrendText: {
    ...STUDIO_THEME.typography.scale.caption,
    color: STUDIO_THEME.colors.text.tertiary,
    marginLeft: 4,
  },
  
  // Action Item Styles
  actionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: STUDIO_THEME.spacing.md,
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionTitle: {
    ...STUDIO_THEME.typography.scale.bodyMedium,
    color: STUDIO_THEME.colors.text.inverse,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    ...STUDIO_THEME.typography.scale.small,
    color: STUDIO_THEME.colors.text.inverse,
    textAlign: 'center',
    opacity: 0.9,
  },
  
  // Image Item Styles
  imageContent: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: STUDIO_THEME.spacing.md,
    borderBottomLeftRadius: STUDIO_THEME.radius.lg,
    borderBottomRightRadius: STUDIO_THEME.radius.lg,
  },
  imageTitle: {
    ...STUDIO_THEME.typography.scale.bodyMedium,
    color: STUDIO_THEME.colors.text.inverse,
    marginBottom: 2,
  },
  imageSubtitle: {
    ...STUDIO_THEME.typography.scale.small,
    color: STUDIO_THEME.colors.text.inverse,
    opacity: 0.9,
  },
});

export default BentoBoxGallery;