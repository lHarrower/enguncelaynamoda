// Bento Gallery - Curated Gallery Space Layout
// Multi-sized panels arranged like a sophisticated art gallery

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const { width } = Dimensions.get('window');

interface BentoItemContent {
  image?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  message?: string;
  value?: string;
  label?: string;
  trend?: number;
  gradient?: readonly [string, string, ...string[]];
  symbol?: string;
}

export interface BentoItem {
  id: string;
  type: 'image' | 'text' | 'metric' | 'interactive' | 'totem' | 'kinetic';
  span: 1 | 2; // Grid span
  height: 'small' | 'medium' | 'large';
  title?: string;
  subtitle?: string;
  content: BentoItemContent;
  onPress?: () => void;
}

interface BentoGalleryProps {
  items: BentoItem[];
  columns?: number;
  spacing?: number;
  style?: object;
}

interface AnimatedBentoItemProps {
  item: BentoItem;
  index: number;
  galleryAnimation: SharedValue<number>;
  children: React.ReactNode;
}

const AnimatedBentoItem: React.FC<AnimatedBentoItemProps> = ({
  item,
  index,
  galleryAnimation,
  children,
}) => {
  const animatedStyle = useAnimatedStyle((): ViewStyle => {
    const delay = index * 0.1; // Stagger effect based on index
    const progress = Math.max(0, Math.min(1, galleryAnimation.value - delay));

    return {
      opacity: interpolate(progress, [0, 1], [0, 1]),
      transform: [
        {
          translateY: interpolate(progress, [0, 1], [30, 0]),
        },
        {
          scale: interpolate(progress, [0, 1], [0.95, 1]),
        },
      ],
    };
  });

  return (
    <Animated.View key={item.id} style={animatedStyle}>
      {children}
    </Animated.View>
  );
};

const BentoGallery: React.FC<BentoGalleryProps> = ({
  items,
  columns = 2,
  spacing = DesignSystem.spacing.md,
  style,
}) => {
  // Single animation value for the entire gallery
  const galleryAnimation = useSharedValue(0);

  useEffect(() => {
    // Start gallery entrance animation
    galleryAnimation.value = withTiming(1, {
      duration: 1200,
    });
  }, [galleryAnimation]);

  const getItemHeight = (height: string) => {
    switch (height) {
      case 'small':
        return 120;
      case 'medium':
        return 180;
      case 'large':
        return 280;
      default:
        return 180;
    }
  };

  const getItemWidth = (span: number) => {
    const totalSpacing = (columns - 1) * spacing;
    const availableWidth = width - DesignSystem.spacing.lg * 2 - totalSpacing;
    return span === 2 ? availableWidth : availableWidth / columns;
  };

  const renderImageItem = (item: BentoItem, _index: number) => {
    const imageUri = item.content.image;
    if (!imageUri) {
      return null;
    }

    return (
      <TouchableOpacity
        style={[
          styles.bentoItem,
          {
            width: getItemWidth(item.span),
            height: getItemHeight(item.height),
          },
        ]}
        onPress={item.onPress}
        activeOpacity={0.9}
      >
        <Image source={{ uri: imageUri }} style={styles.itemImage} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.imageOverlay}>
          {item.title && <Text style={styles.imageTitle}>{item.title}</Text>}
          {item.subtitle && <Text style={styles.imageSubtitle}>{item.subtitle}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderTextItem = (item: BentoItem, _index: number) => (
    <TouchableOpacity
      style={[
        styles.bentoItem,
        styles.textItem,
        {
          width: getItemWidth(item.span),
          height: getItemHeight(item.height),
        },
      ]}
      onPress={item.onPress}
      activeOpacity={0.9}
    >
      <BlurView intensity={20} style={styles.textBlur}>
        <View style={styles.textContent}>
          {item.content.icon && (
            <Ionicons
              name={item.content.icon}
              size={32}
              color={DesignSystem.colors.text.accent}
              style={styles.textIcon}
            />
          )}
          {item.title && <Text style={styles.textTitle}>{item.title}</Text>}
          {item.content.message && <Text style={styles.textMessage}>{item.content.message}</Text>}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderMetricItem = (item: BentoItem, _index: number) => (
    <TouchableOpacity
      style={[
        styles.bentoItem,
        styles.metricItem,
        {
          width: getItemWidth(item.span),
          height: getItemHeight(item.height),
        },
      ]}
      onPress={item.onPress}
      activeOpacity={0.9}
    >
      <View style={styles.metricContent}>
        <Text style={styles.metricValue}>{item.content.value}</Text>
        <Text style={styles.metricLabel}>{item.content.label}</Text>
        {typeof item.content.trend === 'number' && (
          <View style={styles.metricTrend}>
            <Ionicons
              name={item.content.trend > 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={
                item.content.trend > 0
                  ? DesignSystem.colors.sage[500]
                  : DesignSystem.colors.sage[300]
              }
            />
            <Text style={styles.metricTrendText}>{Math.abs(item.content.trend)}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderInteractiveItem = (item: BentoItem, _index: number) => (
    <TouchableOpacity
      style={[
        styles.bentoItem,
        styles.interactiveItem,
        {
          width: getItemWidth(item.span),
          height: getItemHeight(item.height),
        },
      ]}
      onPress={item.onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={
          Array.isArray(item.content.gradient)
            ? item.content.gradient
            : ([DesignSystem.colors.sage[400], 'transparent'] as const)
        }
        style={styles.interactiveGradient}
      >
        <View style={styles.interactiveContent}>
          {item.content.icon && (
            <Ionicons
              name={item.content.icon}
              size={40}
              color={DesignSystem.colors.text.primary}
              style={styles.interactiveIcon}
            />
          )}
          {item.title && <Text style={styles.interactiveTitle}>{item.title}</Text>}
          {item.subtitle && <Text style={styles.interactiveSubtitle}>{item.subtitle}</Text>}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderKineticItem = (item: BentoItem, _index: number) => {
    return (
      <TouchableOpacity
        style={[
          styles.bentoItem,
          styles.kineticItem,
          {
            width: getItemWidth(item.span),
            height: getItemHeight(item.height),
          },
        ]}
        onPress={item.onPress}
        activeOpacity={0.9}
      >
        <View style={styles.kineticContent}>
          <View style={styles.kineticElement}>
            <Text style={styles.kineticText}>{item.content.symbol || ''}</Text>
          </View>
          {item.title && <Text style={styles.kineticTitle}>{item.title}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = (item: BentoItem, index: number) => {
    let itemComponent;
    switch (item.type) {
      case 'image':
        itemComponent = renderImageItem(item, index);
        break;
      case 'text':
        itemComponent = renderTextItem(item, index);
        break;
      case 'metric':
        itemComponent = renderMetricItem(item, index);
        break;
      case 'interactive':
        itemComponent = renderInteractiveItem(item, index);
        break;
      case 'kinetic':
        itemComponent = renderKineticItem(item, index);
        break;
      default:
        itemComponent = renderTextItem(item, index);
    }

    return (
      <AnimatedBentoItem item={item} index={index} galleryAnimation={galleryAnimation}>
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
    flex: 1,
  },
  contentContainer: {
    padding: DesignSystem.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.md,
  },
  bentoItem: {
    borderRadius: DesignSystem.radius.md,
    overflow: 'hidden',
    ...DesignSystem.elevation.soft,
  },

  // Image Item Styles
  itemImage: {
    height: '100%',
    width: '100%',
  },
  imageOverlay: {
    bottom: 0,
    left: 0,
    padding: DesignSystem.spacing.md,
    position: 'absolute',
    right: 0,
  },
  imageTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
    fontSize: 18,
    marginBottom: DesignSystem.spacing.xs,
  },
  imageSubtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.tertiary,
    fontSize: 14,
  },

  // Text Item Styles
  textItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlur: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  textContent: {
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
  },
  textIcon: {
    marginBottom: DesignSystem.spacing.md,
  },
  textTitle: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.accent,
    marginBottom: DesignSystem.spacing.xs,
    textAlign: 'center',
  },
  textMessage: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontSize: 14,
    textAlign: 'center',
  },

  // Metric Item Styles
  metricItem: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    justifyContent: 'center',
  },
  metricContent: {
    alignItems: 'center',
  },
  metricValue: {
    ...DesignSystem.typography.scale.h1,
    color: DesignSystem.colors.text.accent,
    fontSize: 32,
    fontWeight: '300',
    marginBottom: DesignSystem.spacing.xs,
  },
  metricLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  metricTrend: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: DesignSystem.spacing.xs,
  },
  metricTrendText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginLeft: DesignSystem.spacing.xs,
  },

  // Interactive Item Styles
  interactiveItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  interactiveGradient: {
    alignItems: 'center',
    borderRadius: DesignSystem.radius.md,
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  interactiveContent: {
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
  },
  interactiveIcon: {
    marginBottom: DesignSystem.spacing.md,
  },
  interactiveTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
    fontSize: 18,
    marginBottom: DesignSystem.spacing.xs,
    textAlign: 'center',
  },
  interactiveSubtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.tertiary,
    fontSize: 14,
    textAlign: 'center',
  },

  // Kinetic Item Styles
  kineticItem: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.tertiary,
    justifyContent: 'center',
  },
  kineticContent: {
    alignItems: 'center',
  },
  kineticElement: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.md,
    width: 60,
  },
  kineticText: {
    color: DesignSystem.colors.text.accent,
    fontSize: 24,
  },
  kineticTitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
});

export default BentoGallery;
