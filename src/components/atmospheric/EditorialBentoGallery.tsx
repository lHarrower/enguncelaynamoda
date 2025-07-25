// Editorial Bento Gallery - High-Fashion Editorial Spread
// Dynamic, asymmetrical layouts with typography as art, inspired by Spotify Design

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ATMOSPHERIC_THEME } from '../../constants/AtmosphericTheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface BentoItem {
  id: string;
  type: 'hero' | 'image' | 'typography' | 'metric' | 'glass' | 'gradient';
  span: 1 | 2; // Grid span
  height: 'small' | 'medium' | 'large';
  title?: string;
  subtitle?: string;
  content: any;
  onPress?: () => void;
}

interface EditorialBentoGalleryProps {
  items: BentoItem[];
  columns?: number;
  spacing?: number;
  style?: any;
}

const EditorialBentoGallery: React.FC<EditorialBentoGalleryProps> = ({
  items,
  columns = 2,
  spacing = 16,
  style,
}) => {
  // Animation values for cinematic entrance
  const galleryAnimation = useSharedValue(0);

  useEffect(() => {
    // Cinematic entrance animation
    galleryAnimation.value = withTiming(1, {
      duration: 1200,
    });
  }, []);

  const getItemHeight = (height: string) => {
    switch (height) {
      case 'small':
        return 140;
      case 'medium':
        return 220;
      case 'large':
        return 320;
      default:
        return 220;
    }
  };

  const getItemWidth = (span: number) => {
    const totalSpacing = (columns - 1) * spacing;
    const availableWidth = width - 48 - totalSpacing; // 48 = padding
    return span === 2 ? availableWidth : availableWidth / columns;
  };

  // Render Hero Item - Large, impactful
  const renderHeroItem = (item: BentoItem, index: number) => (
    <TouchableOpacity
      style={[
        styles.bentoItem,
        styles.heroItem,
        {
          width: getItemWidth(item.span),
          height: getItemHeight(item.height),
        },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        item.onPress?.();
      }}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: item.content.image }}
        style={styles.heroBackground}
        imageStyle={styles.heroBackgroundImage}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(0, 0, 0, 0.4)',
            'rgba(0, 0, 0, 0.8)',
          ]}
          style={styles.heroGradient}
        >
          {/* Typography as Art - Overlapping with image */}
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{item.title}</Text>
            <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  // Render Image Item - Editorial style
  const renderImageItem = (item: BentoItem, index: number) => (
    <TouchableOpacity
      style={[
        styles.bentoItem,
        {
          width: getItemWidth(item.span),
          height: getItemHeight(item.height),
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
        style={styles.imageContent}
        resizeMode="cover"
      />
      
      {/* Floating Typography */}
      {item.title && (
        <View style={styles.floatingTypography}>
          <BlurView intensity={20} style={styles.typographyBlur}>
            <Text style={styles.floatingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.floatingSubtitle}>{item.subtitle}</Text>
            )}
          </BlurView>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render Typography Item - Large, confident headlines
  const renderTypographyItem = (item: BentoItem, index: number) => (
    <TouchableOpacity
      style={[
        styles.bentoItem,
        styles.typographyItem,
        {
          width: getItemWidth(item.span),
          height: getItemHeight(item.height),
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
          ATMOSPHERIC_THEME.colors.emerald.shimmer,
          ATMOSPHERIC_THEME.colors.sapphire.shimmer,
        ]}
        style={styles.typographyGradient}
      >
        <View style={styles.typographyContent}>
          <Text style={styles.editorialHeadline}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.editorialSubheadline}>{item.subtitle}</Text>
          )}
          {item.content.icon && (
            <Ionicons
              name={item.content.icon}
              size={32}
              color={ATMOSPHERIC_THEME.semantic.text.accent}
              style={styles.typographyIcon}
            />
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Render Metric Item - Data visualization
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
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        item.onPress?.();
      }}
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
                  ? ATMOSPHERIC_THEME.colors.emerald.medium
                  : ATMOSPHERIC_THEME.colors.ruby.medium
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

  // Render Glass Item - Frosted glass effect
  const renderGlassItem = (item: BentoItem, index: number) => (
    <TouchableOpacity
      style={[
        styles.bentoItem,
        {
          width: getItemWidth(item.span),
          height: getItemHeight(item.height),
        },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        item.onPress?.();
      }}
      activeOpacity={0.9}
    >
      <BlurView intensity={40} style={styles.glassContent}>
        <View style={styles.glassInner}>
          {item.content.icon && (
            <Ionicons
              name={item.content.icon}
              size={28}
              color={ATMOSPHERIC_THEME.semantic.text.accent}
              style={styles.glassIcon}
            />
          )}
          <Text style={styles.glassTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.glassSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  // Render Gradient Item - Atmospheric colors
  const renderGradientItem = (item: BentoItem, index: number) => (
    <TouchableOpacity
      style={[
        styles.bentoItem,
        {
          width: getItemWidth(item.span),
          height: getItemHeight(item.height),
        },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        item.onPress?.();
      }}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={item.content.gradient}
        style={styles.gradientContent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.gradientInner}>
          <Text style={styles.gradientTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.gradientSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderItem = (item: BentoItem, index: number) => {
    const animatedStyle = useAnimatedStyle(() => {
      const delay = index * 0.1;
      const progress = Math.max(0, Math.min(1, galleryAnimation.value - delay));
      
      return {
        opacity: interpolate(progress, [0, 1], [0, 1]),
        transform: [
          { 
            translateY: interpolate(progress, [0, 1], [40, 0]) 
          },
          { 
            scale: interpolate(progress, [0, 1], [0.95, 1]) 
          },
        ],
      };
    });

    let itemComponent;
    switch (item.type) {
      case 'hero':
        itemComponent = renderHeroItem(item, index);
        break;
      case 'image':
        itemComponent = renderImageItem(item, index);
        break;
      case 'typography':
        itemComponent = renderTypographyItem(item, index);
        break;
      case 'metric':
        itemComponent = renderMetricItem(item, index);
        break;
      case 'glass':
        itemComponent = renderGlassItem(item, index);
        break;
      case 'gradient':
        itemComponent = renderGradientItem(item, index);
        break;
      default:
        itemComponent = renderImageItem(item, index);
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
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  bentoItem: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  
  // Hero Item Styles
  heroItem: {
    ...ATMOSPHERIC_THEME.glass.totem,
  },
  heroBackground: {
    flex: 1,
  },
  heroBackgroundImage: {
    borderRadius: 24,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroTitle: {
    ...ATMOSPHERIC_THEME.typography.scale.editorial,
    color: ATMOSPHERIC_THEME.semantic.text.primary,
    fontSize: 42,
    marginBottom: 8,
  },
  heroSubtitle: {
    ...ATMOSPHERIC_THEME.typography.scale.whisper,
    color: ATMOSPHERIC_THEME.semantic.text.whisper,
    fontSize: 16,
  },
  
  // Image Item Styles
  imageContent: {
    flex: 1,
    borderRadius: 24,
  },
  floatingTypography: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  typographyBlur: {
    borderRadius: 12,
    padding: 12,
  },
  floatingTitle: {
    ...ATMOSPHERIC_THEME.typography.scale.body,
    color: ATMOSPHERIC_THEME.semantic.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  floatingSubtitle: {
    ...ATMOSPHERIC_THEME.typography.scale.caption,
    color: ATMOSPHERIC_THEME.semantic.text.caption,
  },
  
  // Typography Item Styles
  typographyItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  typographyGradient: {
    flex: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typographyContent: {
    alignItems: 'center',
    padding: 24,
  },
  editorialHeadline: {
    ...ATMOSPHERIC_THEME.typography.scale.statement,
    color: ATMOSPHERIC_THEME.semantic.text.primary,
    textAlign: 'center',
    fontSize: 28,
    marginBottom: 8,
  },
  editorialSubheadline: {
    ...ATMOSPHERIC_THEME.typography.scale.whisper,
    color: ATMOSPHERIC_THEME.semantic.text.whisper,
    textAlign: 'center',
    fontSize: 14,
  },
  typographyIcon: {
    marginTop: 12,
  },
  
  // Metric Item Styles
  metricItem: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  metricContent: {
    alignItems: 'center',
  },
  metricValue: {
    ...ATMOSPHERIC_THEME.typography.scale.statement,
    color: ATMOSPHERIC_THEME.semantic.text.accent,
    fontSize: 36,
    fontWeight: '300',
    marginBottom: 8,
  },
  metricLabel: {
    ...ATMOSPHERIC_THEME.typography.scale.caption,
    color: ATMOSPHERIC_THEME.semantic.text.secondary,
    textAlign: 'center',
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metricTrendText: {
    ...ATMOSPHERIC_THEME.typography.scale.caption,
    color: ATMOSPHERIC_THEME.semantic.text.caption,
    marginLeft: 4,
  },
  
  // Glass Item Styles
  glassContent: {
    flex: 1,
    borderRadius: 24,
  },
  glassInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glassIcon: {
    marginBottom: 12,
  },
  glassTitle: {
    ...ATMOSPHERIC_THEME.typography.scale.body,
    color: ATMOSPHERIC_THEME.semantic.text.primary,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 6,
  },
  glassSubtitle: {
    ...ATMOSPHERIC_THEME.typography.scale.caption,
    color: ATMOSPHERIC_THEME.semantic.text.caption,
    textAlign: 'center',
  },
  
  // Gradient Item Styles
  gradientContent: {
    flex: 1,
    borderRadius: 24,
  },
  gradientInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gradientTitle: {
    ...ATMOSPHERIC_THEME.typography.scale.body,
    color: ATMOSPHERIC_THEME.semantic.text.primary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 6,
  },
  gradientSubtitle: {
    ...ATMOSPHERIC_THEME.typography.scale.caption,
    color: ATMOSPHERIC_THEME.semantic.text.whisper,
    textAlign: 'center',
  },
});

export default EditorialBentoGallery;