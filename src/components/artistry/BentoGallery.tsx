// Bento Gallery - Curated Gallery Space Layout
// Multi-sized panels arranged like a sophisticated art gallery

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
  withDelay,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ARTISTRY_THEME } from '../../constants/ArtistryTheme';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface BentoItem {
  id: string;
  type: 'image' | 'text' | 'metric' | 'interactive' | 'totem' | 'kinetic';
  span: 1 | 2; // Grid span
  height: 'small' | 'medium' | 'large';
  title?: string;
  subtitle?: string;
  content: any;
  onPress?: () => void;
}

interface BentoGalleryProps {
  items: BentoItem[];
  columns?: number;
  spacing?: number;
  style?: any;
}

const BentoGallery: React.FC<BentoGalleryProps> = ({
  items,
  columns = 2,
  spacing = ARTISTRY_THEME.spacing.flow,
  style,
}) => {
  // Single animation value for the entire gallery
  const galleryAnimation = useSharedValue(0);

  useEffect(() => {
    // Start gallery entrance animation
    galleryAnimation.value = withTiming(1, {
      duration: 1200,
    });
  }, []);

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
    const availableWidth = width - (ARTISTRY_THEME.spacing.dance * 2) - totalSpacing;
    return span === 2 ? availableWidth : availableWidth / columns;
  };

  const renderImageItem = (item: BentoItem, index: number) => (
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
      <Image
        source={{ uri: item.content.image }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.imageOverlay}
      >
        {item.title && (
          <Text style={styles.imageTitle}>{item.title}</Text>
        )}
        {item.subtitle && (
          <Text style={styles.imageSubtitle}>{item.subtitle}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderTextItem = (item: BentoItem, index: number) => (
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
              color={ARTISTRY_THEME.semantic.text.accent}
              style={styles.textIcon}
            />
          )}
          {item.title && (
            <Text style={styles.textTitle}>{item.title}</Text>
          )}
          {item.content.message && (
            <Text style={styles.textMessage}>{item.content.message}</Text>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderMetricItem = (item: BentoItem, index: number) => (
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
        {item.content.trend && (
          <View style={styles.metricTrend}>
            <Ionicons
              name={item.content.trend > 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={
                item.content.trend > 0
                  ? ARTISTRY_THEME.semantic.interactive.secondary
                  : ARTISTRY_THEME.semantic.interactive.tertiary
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

  const renderInteractiveItem = (item: BentoItem, index: number) => (
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
        colors={item.content.gradient || [
          ARTISTRY_THEME.colors.liquidGold.glow,
          'transparent',
        ]}
        style={styles.interactiveGradient}
      >
        <View style={styles.interactiveContent}>
          {item.content.icon && (
            <Ionicons
              name={item.content.icon}
              size={40}
              color={ARTISTRY_THEME.semantic.text.poetry}
              style={styles.interactiveIcon}
            />
          )}
          {item.title && (
            <Text style={styles.interactiveTitle}>{item.title}</Text>
          )}
          {item.subtitle && (
            <Text style={styles.interactiveSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderKineticItem = (item: BentoItem, index: number) => {
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
            <Text style={styles.kineticText}>{item.content.symbol}</Text>
          </View>
          {item.title && (
            <Text style={styles.kineticTitle}>{item.title}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = (item: BentoItem, index: number) => {
    const animatedStyle = useAnimatedStyle(() => {
      const delay = index * 0.1; // Stagger effect based on index
      const progress = Math.max(0, Math.min(1, galleryAnimation.value - delay));
      
      return {
        opacity: interpolate(progress, [0, 1], [0, 1]),
        transform: [
          { 
            translateY: interpolate(progress, [0, 1], [30, 0]) 
          },
          { 
            scale: interpolate(progress, [0, 1], [0.95, 1]) 
          },
        ],
      };
    });

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
  },
  contentContainer: {
    padding: ARTISTRY_THEME.spacing.dance,
  },
  row: {
    flexDirection: 'row',
    marginBottom: ARTISTRY_THEME.spacing.flow,
    gap: ARTISTRY_THEME.spacing.flow,
  },
  bentoItem: {
    borderRadius: ARTISTRY_THEME.radius.flow,
    overflow: 'hidden',
    ...ARTISTRY_THEME.components.panel.default,
  },
  
  // Image Item Styles
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: ARTISTRY_THEME.spacing.gentle,
  },
  imageTitle: {
    ...ARTISTRY_THEME.typography.scale.statement,
    color: ARTISTRY_THEME.semantic.text.poetry,
    fontSize: 18,
    marginBottom: ARTISTRY_THEME.spacing.whisper,
  },
  imageSubtitle: {
    ...ARTISTRY_THEME.typography.scale.elegant,
    color: ARTISTRY_THEME.semantic.text.whisper,
    fontSize: 14,
  },
  
  // Text Item Styles
  textItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    alignItems: 'center',
    padding: ARTISTRY_THEME.spacing.gentle,
  },
  textIcon: {
    marginBottom: ARTISTRY_THEME.spacing.gentle,
  },
  textTitle: {
    ...ARTISTRY_THEME.typography.scale.whisper,
    color: ARTISTRY_THEME.semantic.text.accent,
    textAlign: 'center',
    marginBottom: ARTISTRY_THEME.spacing.whisper,
  },
  textMessage: {
    ...ARTISTRY_THEME.typography.scale.elegant,
    color: ARTISTRY_THEME.semantic.text.primary,
    textAlign: 'center',
    fontSize: 14,
  },
  
  // Metric Item Styles
  metricItem: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ARTISTRY_THEME.semantic.canvas.primary,
  },
  metricContent: {
    alignItems: 'center',
  },
  metricValue: {
    ...ARTISTRY_THEME.typography.scale.statement,
    color: ARTISTRY_THEME.semantic.text.accent,
    fontSize: 32,
    fontWeight: '300',
    marginBottom: ARTISTRY_THEME.spacing.whisper,
  },
  metricLabel: {
    ...ARTISTRY_THEME.typography.scale.floating,
    color: ARTISTRY_THEME.semantic.text.secondary,
    textAlign: 'center',
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ARTISTRY_THEME.spacing.whisper,
  },
  metricTrendText: {
    ...ARTISTRY_THEME.typography.scale.floating,
    color: ARTISTRY_THEME.semantic.text.secondary,
    marginLeft: ARTISTRY_THEME.spacing.breath,
  },
  
  // Interactive Item Styles
  interactiveItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactiveGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ARTISTRY_THEME.radius.flow,
  },
  interactiveContent: {
    alignItems: 'center',
    padding: ARTISTRY_THEME.spacing.gentle,
  },
  interactiveIcon: {
    marginBottom: ARTISTRY_THEME.spacing.gentle,
  },
  interactiveTitle: {
    ...ARTISTRY_THEME.typography.scale.statement,
    color: ARTISTRY_THEME.semantic.text.poetry,
    textAlign: 'center',
    fontSize: 18,
    marginBottom: ARTISTRY_THEME.spacing.whisper,
  },
  interactiveSubtitle: {
    ...ARTISTRY_THEME.typography.scale.elegant,
    color: ARTISTRY_THEME.semantic.text.whisper,
    textAlign: 'center',
    fontSize: 14,
  },
  
  // Kinetic Item Styles
  kineticItem: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ARTISTRY_THEME.semantic.canvas.secondary,
  },
  kineticContent: {
    alignItems: 'center',
  },
  kineticElement: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ARTISTRY_THEME.semantic.atmosphere.goldShimmer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ARTISTRY_THEME.spacing.gentle,
  },
  kineticText: {
    fontSize: 24,
    color: ARTISTRY_THEME.semantic.text.accent,
  },
  kineticTitle: {
    ...ARTISTRY_THEME.typography.scale.floating,
    color: ARTISTRY_THEME.semantic.text.secondary,
    textAlign: 'center',
  },
});

export default BentoGallery;